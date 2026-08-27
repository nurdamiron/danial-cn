"use client";

import { useRef, useState } from "react";
import { colorLabel } from "@/lib/catalog-presets";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  StarIcon,
  TrashIcon,
} from "@/components/ui/icons";

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
    const next = idx + dir;
    if (next < 0 || next >= images.length) return;
    const ordered = [...images];
    const [item] = ordered.splice(idx, 1);
    ordered.splice(next, 0, item);
    setImages(ordered);
    const res = await fetch(`/api/admin/products/${productId}/images`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: ordered.map((i) => i.id) }),
    });
    const data = await res.json();
    if (res.ok) setImages(data.images);
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
          void onUpload(e.dataTransfer.files);
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

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((img, i) => (
          <div key={img.id} className="border border-line p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt="" className="h-32 w-full object-contain" />
            <label className="t-data mt-2 block text-muted">
              Цвет
              <select
                className="field mt-0.5 px-2 py-1 text-[0.8125rem]"
                value={img.colorKey ?? ""}
                onChange={(e) => setColorKey(img.id, e.target.value)}
              >
                <option value="">—</option>
                {colorKeys.map((k) => (
                  <option key={k} value={k}>
                    {colorLabel(k)}
                  </option>
                ))}
                {img.colorKey && !colorKeys.includes(img.colorKey) ? (
                  <option value={img.colorKey}>{colorLabel(img.colorKey)}</option>
                ) : null}
              </select>
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {img.isCover ? (
                <span className="inline-flex items-center gap-1 text-[0.8125rem] font-medium">
                  <StarIcon className="h-3.5 w-3.5" filled />
                  Обложка
                </span>
              ) : (
                <button
                  type="button"
                  className="underline"
                  onClick={() => setCover(img.id)}
                >
                  Обложка
                </button>
              )}
              <button
                type="button"
                className="disabled:opacity-30"
                disabled={i === 0}
                onClick={() => move(img.id, -1)}
                aria-label="Раньше в галерее"
                title="Раньше в галерее"
              >
                <ArrowLeftIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="disabled:opacity-30"
                disabled={i === images.length - 1}
                onClick={() => move(img.id, 1)}
                aria-label="Позже в галерее"
                title="Позже в галерее"
              >
                <ArrowRightIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1 text-danger underline-offset-4 hover:underline"
                onClick={() => remove(img.id)}
              >
                <TrashIcon className="h-4 w-4" />
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
      {images.length === 0 ? (
        <p className="text-sm text-muted">
          Фото пока нет — товар остаётся черновиком.
        </p>
      ) : null}
    </div>
  );
}
