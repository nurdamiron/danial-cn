"use client";

import { useRef, useState } from "react";
import { colorLabel } from "@/lib/catalog-presets";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  GripIcon,
  StarIcon,
  TrashIcon,
} from "@/components/ui/icons";
import { moveItem } from "@/lib/reorder";

type Img = {
  id: string;
  url: string;
  isCover: boolean;
  colorKey?: string | null;
};

export function ProductImagesAdmin({
  productId,
  initialImages,
  colorKeys = [],
}: {
  productId: string;
  initialImages: Img[];
  colorKeys?: string[];
}) {
  const [images, setImages] = useState<Img[]>(initialImages);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [uploadColor, setUploadColor] = useState(colorKeys[0] ?? "");
  const [dragOver, setDragOver] = useState(false);
  /** What the last upload did, so the page confirms it rather than just growing. */
  const [added, setAdded] = useState(0);
  const fileInput = useRef<HTMLInputElement | null>(null);
  /** The photo being dragged, and the one it is currently over. */
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  async function onUpload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError("");
    try {
      const form = new FormData();
      Array.from(files).forEach((f) => form.append("files", f));
      if (uploadColor) form.append("colorKey", uploadColor);
      const res = await fetch(`/api/admin/products/${productId}/images`, {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Ошибка загрузки");
        return;
      }
      setImages(data.images);
      setAdded(data.created?.length ?? files.length);
    } finally {
      setBusy(false);
      // Without this, choosing the same file again fires no change event.
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  async function setCover(coverId: string) {
    const res = await fetch(`/api/admin/products/${productId}/images`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coverId }),
    });
    const data = await res.json();
    if (res.ok) setImages(data.images);
  }

  async function setColorKey(imageId: string, colorKey: string) {
    const res = await fetch(`/api/admin/products/${productId}/images`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageId,
        colorKey: colorKey || null,
      }),
    });
    const data = await res.json();
    if (res.ok) setImages(data.images);
  }

  async function remove(imageId: string) {
    if (!confirm("Удалить фото?")) return;
    const res = await fetch(
      `/api/admin/products/${productId}/images/${imageId}`,
      { method: "DELETE" },
    );
    const data = await res.json();
    if (res.ok) setImages(data.images);
  }

  async function move(imageId: string, dir: -1 | 1) {
    const idx = images.findIndex((i) => i.id === imageId);
    if (idx < 0) return;
    await applyOrder(moveItem(images, idx, idx + dir));
  }

  /** Drop one photo onto another's place. */
  async function dropOn(targetId: string) {
    const from = images.findIndex((i) => i.id === dragId);
    const to = images.findIndex((i) => i.id === targetId);
    setDragId(null);
    setOverId(null);
    if (from < 0 || to < 0 || from === to) return;
    await applyOrder(moveItem(images, from, to));
  }

  async function applyOrder(ordered: Img[]) {
    // Shown first, saved after: the gallery is the person's own doing, and
    // waiting on a round trip to see it makes dragging feel broken.
    const before = images;
    // Every query that reads photos sorts the cover to the front, so a cover
    // dragged elsewhere would spring back and the drag would look broken.
    // One rule instead of two competing ones: whatever is first is the cover,
    // which is what the badge on the first card has been claiming all along.
    const coverId = ordered[0]?.id;
    setImages(
      ordered.map((img) => ({ ...img, isCover: img.id === coverId })),
    );
    const res = await fetch(`/api/admin/products/${productId}/images`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderedIds: ordered.map((i) => i.id),
        ...(coverId ? { coverId } : {}),
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setImages(data.images);
    } else {
      // Put it back rather than leaving the screen claiming an order the
      // storefront will not show.
      setImages(before);
      setError(data.error ?? "Не удалось сохранить порядок фото");
    }
  }

  return (
    <div className="card space-y-5 p-5 sm:p-7">
      {/*
        The whole panel used to be explained as "C: загрузка · R: галерея ·
        U: обложка / цвет / порядок · D: удалить" — the four database verbs,
        to the person selling bags — and the upload itself was a bare file
        input, the smallest control a browser draws.
      */}
      {colorKeys.length ? (
        <label className="block text-[0.8125rem]">
          Для какого цвета эти фото
          <select
            className="field"
            value={uploadColor}
            onChange={(e) => setUploadColor(e.target.value)}
          >
            <option value="">Для всех цветов</option>
            {colorKeys.map((k) => (
              <option key={k} value={k}>
                {colorLabel(k)}
              </option>
            ))}
          </select>
          <span className="t-micro mt-1 block text-muted">
            Покупатель выбирает цвет на витрине и видит именно эти снимки.
          </span>
        </label>
      ) : null}

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
          if (e.dataTransfer.files?.length) void onUpload(e.dataTransfer.files);
        }}
        onClick={() => fileInput.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-[var(--r-lg)] border border-dashed px-6 py-8 text-center transition-colors duration-200 ${
          dragOver
            ? "border-ink bg-stone"
            : "border-line-strong bg-stone/30 hover:border-ink hover:bg-stone"
        } ${busy ? "pointer-events-none opacity-60" : ""}`}
      >
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          disabled={busy}
          className="sr-only"
          onChange={(e) => onUpload(e.target.files)}
        />
        {busy ? (
          <p className="text-sm">Загружаем…</p>
        ) : (
          <>
            <p className="text-sm font-medium">
              Перетащите фото сюда или нажмите, чтобы выбрать
            </p>
            <p className="t-micro mt-1 text-muted">
              Можно несколько сразу · JPEG, PNG, WebP, AVIF · до 12 МБ каждое
            </p>
          </>
        )}
      </div>

      <p className="t-micro text-muted">
        Фото сохраняются сразу — отдельной кнопки нет. Мы уменьшаем их до 2400
        пикселей, кладём в хранилище магазина и сами обновляем витрину.
      </p>

      {added > 0 && !busy ? (
        <p className="inline-flex items-center gap-1.5 text-[0.8125rem]">
          <CheckIcon className="h-3.5 w-3.5" />
          Загружено фото: {added}
        </p>
      ) : null}
      {error ? <p className="alert-error">{error}</p> : null}

      {images.length > 1 ? (
        <p className="t-micro text-muted">
          Перетащите фото, чтобы поменять порядок. Первое — обложка.
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((img, i) => {
          const dragging = dragId === img.id;
          const target = overId === img.id && dragId !== img.id;
          return (
            <div
              key={img.id}
              draggable
              onDragStart={(e) => {
                setDragId(img.id);
                e.dataTransfer.effectAllowed = "move";
                // Firefox starts no drag at all without payload of some kind.
                e.dataTransfer.setData("text/plain", img.id);
              }}
              onDragEnd={() => {
                setDragId(null);
                setOverId(null);
              }}
              onDragOver={(e) => {
                if (!dragId) return;
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                setOverId(img.id);
              }}
              onDragLeave={() => setOverId((cur) => (cur === img.id ? null : cur))}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void dropOn(img.id);
              }}
              className={`group relative flex flex-col overflow-hidden rounded-[var(--r-lg)] border bg-paper transition-all duration-200 ${
                dragging
                  ? "border-ink opacity-40"
                  : target
                    ? "border-ink ring-2 ring-ink/20"
                    : "border-line hover:border-line-strong"
              }`}
            >
              <div className="media relative flex aspect-square items-center justify-center rounded-none border-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt=""
                  draggable={false}
                  className="h-full w-full object-contain p-2"
                />

                {/* Position doubles as the answer to "which one is the cover" */}
                <span
                  className={`absolute top-1.5 left-1.5 inline-flex items-center gap-1 rounded-[var(--r-xs)] px-1.5 py-0.5 text-[0.625rem] font-medium tracking-[0.08em] uppercase ${
                    img.isCover
                      ? "bg-ink text-paper"
                      : "bg-paper/85 text-muted"
                  }`}
                >
                  {img.isCover ? (
                    <>
                      <StarIcon className="h-2.5 w-2.5" filled />
                      обложка
                    </>
                  ) : (
                    i + 1
                  )}
                </span>

                <span
                  className="absolute top-1.5 right-1.5 cursor-grab text-muted opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
                  title="Перетащите, чтобы поменять порядок"
                  aria-hidden="true"
                >
                  <GripIcon className="h-4 w-4" />
                </span>

                {/*
                  The two actions that change the photo itself sit on it, and
                  appear on hover so a gallery of eight is a gallery of eight
                  photographs rather than of eight control panels. The arrows
                  below stay put: they are what a keyboard can reach.
                */}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-ink/70 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                  {img.isCover ? (
                    <span />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setCover(img.id)}
                      title="Сделать обложкой"
                      aria-label="Сделать обложкой"
                      className="inline-flex h-7 items-center gap-1 rounded-[var(--r-xs)] bg-paper/90 px-2 text-[0.6875rem] text-ink transition-colors hover:bg-paper"
                    >
                      <StarIcon className="h-3 w-3" />
                      Обложка
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => remove(img.id)}
                    title="Удалить фото"
                    aria-label="Удалить фото"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-[var(--r-xs)] bg-paper/90 text-danger transition-colors hover:bg-danger-tint"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1 border-t border-line p-1.5">
                <select
                  className="field h-8 min-w-0 flex-1 px-2 py-0 text-[0.75rem]"
                  value={img.colorKey ?? ""}
                  onChange={(e) => setColorKey(img.id, e.target.value)}
                  title="Для какого цвета это фото"
                >
                  <option value="">Все цвета</option>
                  {colorKeys.map((k) => (
                    <option key={k} value={k}>
                      {colorLabel(k)}
                    </option>
                  ))}
                  {img.colorKey && !colorKeys.includes(img.colorKey) ? (
                    <option value={img.colorKey}>
                      {colorLabel(img.colorKey)}
                    </option>
                  ) : null}
                </select>
                <button
                  type="button"
                  className="flex h-8 w-7 shrink-0 items-center justify-center rounded-[var(--r-xs)] text-muted transition-colors hover:bg-stone hover:text-ink disabled:opacity-25"
                  disabled={i === 0}
                  onClick={() => move(img.id, -1)}
                  aria-label="Раньше в галерее"
                  title="Раньше в галерее"
                >
                  <ArrowLeftIcon className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  className="flex h-8 w-7 shrink-0 items-center justify-center rounded-[var(--r-xs)] text-muted transition-colors hover:bg-stone hover:text-ink disabled:opacity-25"
                  disabled={i === images.length - 1}
                  onClick={() => move(img.id, 1)}
                  aria-label="Позже в галерее"
                  title="Позже в галерее"
                >
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {images.length === 0 ? (
        <p className="text-sm text-muted">
          Фото пока нет — товар остаётся черновиком.
        </p>
      ) : null}
    </div>
  );
}
