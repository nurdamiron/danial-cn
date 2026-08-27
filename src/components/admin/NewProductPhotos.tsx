"use client";

import { useEffect, useRef, useState } from "react";
import {
  ACCEPT_ATTRIBUTE,
  imageFileProblem,
} from "@/lib/image-rules";
import { GripIcon, StarIcon, TrashIcon } from "@/components/ui/icons";
import { moveItem } from "@/lib/reorder";

/**
 * Photos chosen before the product exists.
 *
 * Uploading needs a product id — the endpoint is per product — so creating a
 * bag used to end on a draft with no photographs and no hint that it needed
 * any, even though a product cannot go on the site without one. The files are
 * held here until the product is saved, then sent in the same action.
 */

export type PendingPhoto = {
  /** Stable across re-renders so a preview is not rebuilt on every keystroke. */
  id: string;
  file: File;
  previewUrl: string;
};

let seq = 0;

export function NewProductPhotos({
  photos,
  onChange,
  disabled,
}: {
  photos: PendingPhoto[];
  onChange: (next: PendingPhoto[]) => void;
  disabled?: boolean;
}) {
  const [dragOver, setDragOver] = useState(false);
  const [rejected, setRejected] = useState<string[]>([]);
  /** The photo being dragged, and the one it is currently over. */
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement | null>(null);

  // Object URLs stay alive until they are revoked. The ref tracks whatever is
  // on screen right now so leaving the page can release them; writing it in an
  // effect rather than during render keeps it out of the render pass.
  const urls = useRef<string[]>([]);
  useEffect(() => {
    urls.current = photos.map((p) => p.previewUrl);
  }, [photos]);
  useEffect(
    () => () => urls.current.forEach((u) => URL.revokeObjectURL(u)),
    [],
  );

  function add(files: FileList | null) {
    if (!files?.length) return;
    const problems: string[] = [];
    const accepted: PendingPhoto[] = [];

    for (const file of Array.from(files)) {
      const problem = imageFileProblem(file);
      // One bad file among five should not cost the other four.
      if (problem) {
        problems.push(problem);
        continue;
      }
      accepted.push({
        id: `p${seq++}`,
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }

    setRejected(problems);
    if (accepted.length) onChange([...photos, ...accepted]);
    if (fileInput.current) fileInput.current.value = "";
  }

  function remove(id: string) {
    const going = photos.find((p) => p.id === id);
    if (going) URL.revokeObjectURL(going.previewUrl);
    onChange(photos.filter((p) => p.id !== id));
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          // Reordering drags carry no files; only a drop from the desktop does.
          if (e.dataTransfer.files?.length) add(e.dataTransfer.files);
        }}
        onClick={() => fileInput.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-[var(--r-lg)] border border-dashed px-6 py-7 text-center transition-colors duration-200 ${
          dragOver
            ? "border-ink bg-stone"
            : "border-line-strong bg-stone/30 hover:border-ink hover:bg-stone"
        } ${disabled ? "pointer-events-none opacity-60" : ""}`}
      >
        <input
          ref={fileInput}
          type="file"
          accept={ACCEPT_ATTRIBUTE}
          multiple
          disabled={disabled}
          className="sr-only"
          onChange={(e) => add(e.target.files)}
        />
        <p className="text-sm font-medium">
          Перетащите фото сюда или нажмите, чтобы выбрать
        </p>
        <p className="t-micro mt-1 text-muted">
          Можно несколько сразу · JPEG, PNG, WebP, AVIF · до 12 МБ каждое
        </p>
      </div>

      {rejected.length ? (
        <ul className="alert-error mt-3 space-y-0.5">
          {rejected.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      ) : null}

      {photos.length ? (
        <>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {photos.map((p, i) => {
              const dragging = dragId === p.id;
              const target = overId === p.id && dragId !== p.id;
              return (
                <div
                  key={p.id}
                  draggable={!disabled}
                  onDragStart={(e) => {
                    setDragId(p.id);
                    e.dataTransfer.effectAllowed = "move";
                    // Firefox starts no drag at all without a payload.
                    e.dataTransfer.setData("text/plain", p.id);
                  }}
                  onDragEnd={() => {
                    setDragId(null);
                    setOverId(null);
                  }}
                  onDragOver={(e) => {
                    if (!dragId) return;
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                    setOverId(p.id);
                  }}
                  onDragLeave={() =>
                    setOverId((cur) => (cur === p.id ? null : cur))
                  }
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const from = photos.findIndex((x) => x.id === dragId);
                    const to = photos.findIndex((x) => x.id === p.id);
                    setDragId(null);
                    setOverId(null);
                    if (from >= 0 && to >= 0 && from !== to) {
                      onChange(moveItem(photos, from, to));
                    }
                  }}
                  className={`media group relative flex aspect-square cursor-grab items-center justify-center transition-all duration-200 active:cursor-grabbing ${
                    dragging
                      ? "border-ink opacity-40"
                      : target
                        ? "border-ink ring-2 ring-ink/20"
                        : ""
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.previewUrl}
                    alt=""
                    draggable={false}
                    className="h-full w-full object-contain p-1.5"
                  />

                  <span
                    className={`absolute top-1 left-1 inline-flex items-center gap-1 rounded-[var(--r-xs)] px-1.5 py-0.5 text-[0.625rem] font-medium tracking-[0.08em] uppercase ${
                      i === 0 ? "bg-ink text-paper" : "bg-paper/85 text-muted"
                    }`}
                  >
                    {i === 0 ? (
                      <>
                        <StarIcon className="h-2.5 w-2.5" filled />
                        обложка
                      </>
                    ) : (
                      i + 1
                    )}
                  </span>

                  <span
                    className="absolute bottom-1 left-1 text-muted opacity-0 transition-opacity group-hover:opacity-100"
                    aria-hidden="true"
                  >
                    <GripIcon className="h-4 w-4" />
                  </span>

                  <button
                    type="button"
                    onClick={() => remove(p.id)}
                    disabled={disabled}
                    aria-label={`Убрать ${p.file.name}`}
                    title="Убрать"
                    className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-paper/90 text-danger opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
          <p className="t-micro mt-2 text-muted">
            {photos.length > 1
              ? "Перетащите, чтобы поменять порядок. Первое фото станет обложкой."
              : "Первое фото станет обложкой."}{" "}
            Загрузим их сразу после сохранения.
          </p>
        </>
      ) : (
        <p className="t-micro mt-2 text-muted">
          Без фото товар сохранится черновиком — на сайт его пустить нельзя.
        </p>
      )}
    </div>
  );
}
