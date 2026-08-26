"use client";

import { useState } from "react";
import { colorLabel } from "@/lib/catalog-presets";
import { ArrowLeftIcon, ArrowRightIcon, TrashIcon } from "@/components/ui/icons";

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
    } finally {
      setBusy(false);
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
      <p className="text-[0.8125rem] text-muted">
        C: загрузка · R: галерея · U: обложка / цвет / порядок · D: удалить.
        Привязка к colorKey меняет фото при выборе цвета на витрине.
      </p>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <label className="block flex-1 text-[0.8125rem]">
          Цвет при загрузке
          <select
            className="field"
            value={uploadColor}
            onChange={(e) => setUploadColor(e.target.value)}
          >
            <option value="">Без привязки</option>
            {colorKeys.map((k) => (
              <option key={k} value={k}>
                {colorLabel(k)}
              </option>
            ))}
          </select>
        </label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          disabled={busy}
          className="block w-full text-[0.8125rem] sm:w-auto"
          onChange={(e) => onUpload(e.target.files)}
        />
      </div>

      {busy ? <p className="text-[0.8125rem] text-muted">Загрузка…</p> : null}
      {error ? <p className="text-danger text-[0.8125rem]">{error}</p> : null}

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
                <span className="font-medium">ОБЛОЖКА</span>
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
