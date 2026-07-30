"use client";

import { useState } from "react";

type Img = { id: string; url: string; isCover: boolean };

export function ProductImagesAdmin({
  productId,
  initialImages,
}: {
  productId: string;
  initialImages: Img[];
}) {
  const [images, setImages] = useState<Img[]>(initialImages);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onUpload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError("");
    try {
      const form = new FormData();
      Array.from(files).forEach((f) => form.append("files", f));
      const res = await fetch(`/api/admin/products/${productId}/images`, {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload failed");
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

  async function remove(imageId: string) {
    if (!confirm("Delete photo?")) return;
    const res = await fetch(
      `/api/admin/products/${productId}/images/${imageId}`,
      { method: "DELETE" },
    );
    const data = await res.json();
    if (res.ok) setImages(data.images);
  }

  return (
    <div className="space-y-4 border border-[#e5e5e5] bg-white p-6">
      <p className="text-xs text-[#666]">
        Upload multiple photos (JPEG/PNG/WebP, max 8MB). Cover is required
        before publishing.
      </p>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        disabled={busy}
        onChange={(e) => onUpload(e.target.files)}
      />
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {images.map((img) => (
          <div key={img.id} className="border border-[#e5e5e5] p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt="" className="h-32 w-full object-contain" />
            <div className="mt-2 flex flex-wrap gap-2 text-[10px]">
              {img.isCover ? (
                <span className="font-medium">COVER</span>
              ) : (
                <button
                  type="button"
                  className="underline"
                  onClick={() => setCover(img.id)}
                >
                  Set cover
                </button>
              )}
              <button
                type="button"
                className="underline text-red-600"
                onClick={() => remove(img.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      {images.length === 0 ? (
        <p className="text-sm text-[#666]">No photos yet — product stays draft.</p>
      ) : null}
    </div>
  );
}
