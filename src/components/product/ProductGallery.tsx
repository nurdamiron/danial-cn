"use client";

import Image from "next/image";
import { useState } from "react";

type Img = { url: string; id: string };

export function ProductGallery({ images, alt }: { images: Img[]; alt: string }) {
  const [active, setActive] = useState(0);
  if (!images.length) return null;
  const index = Math.min(active, images.length - 1);
  const current = images[index];

  return (
    <div className="lg:sticky lg:top-32">
      <div className="media aspect-[4/5]">
        <Image
          key={current.url}
          src={current.url}
          alt={alt}
          fill
          priority
          quality={95}
          className="fade-in object-contain p-6 sm:p-10"
          sizes="(max-width:1024px) 100vw, 50vw"
        />
        {images.length > 1 ? (
          <span className="tag absolute right-3 bottom-3">
            {index + 1} / {images.length}
          </span>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              aria-label={`${alt} — ${i + 1}`}
              aria-current={i === index}
              onClick={() => setActive(i)}
              className={`media relative h-20 w-[4.25rem] shrink-0 transition ${
                i === index ? "border-ink" : "opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={img.url}
                alt=""
                fill
                className="object-contain p-2"
                sizes="68px"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
