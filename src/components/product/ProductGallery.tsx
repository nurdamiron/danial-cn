"use client";

import Image from "next/image";
import { useState } from "react";

type Img = { url: string; id: string };

export function ProductGallery({ images, alt }: { images: Img[]; alt: string }) {
  const [active, setActive] = useState(0);
  if (!images.length) return null;
  const current = images[Math.min(active, images.length - 1)];

  return (
    <div className="space-y-3">
      <div className="relative aspect-[3/4] bg-white">
        <Image
          src={current.url}
          alt={alt}
          fill
          priority
          className="object-contain p-6 sm:p-8"
          sizes="(max-width:768px) 100vw, 50vw"
        />
      </div>
      {images.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(i)}
              className={`relative h-20 w-16 shrink-0 overflow-hidden bg-white transition ${
                i === active
                  ? "ring-1 ring-[#0a0a0a] ring-offset-2"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={img.url}
                alt=""
                fill
                className="object-contain p-1.5"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
