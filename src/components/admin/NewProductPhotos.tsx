"use client";

import { useEffect, useRef, useState } from "react";
import {
  ACCEPT_ATTRIBUTE,
  imageFileProblem,
} from "@/lib/image-rules";
import { TrashIcon } from "@/components/ui/icons";

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
          add(e.dataTransfer.files);
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
            {photos.map((p, i) => (
              <div
                key={p.id}
                className="media relative flex aspect-square items-center justify-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.previewUrl}
                  alt=""
                  className="h-full w-full object-contain p-1"
                />
                {i === 0 ? (
                  <span className="absolute top-1 left-1 rounded-[var(--r-xs)] bg-ink px-1.5 py-0.5 text-[0.625rem] tracking-[0.08em] text-paper uppercase">
                    обложка
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={() => remove(p.id)}
                  disabled={disabled}
                  aria-label={`Убрать ${p.file.name}`}
                  title="Убрать"
                  className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-paper/90 text-danger transition-colors hover:bg-danger-tint"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
          <p className="t-micro mt-2 text-muted">
            Первое фото станет обложкой. Загрузим их сразу после сохранения.
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
