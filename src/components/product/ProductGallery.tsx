"use client";

import Image from "next/image";
import { useState } from "react";

type Img = { url: string; id: string };

export function ProductGallery({ images, alt }: { images: Img[]; alt: string }) {
  const [active, setActive] = useState(0);
  if (!images.length) return null;
  const current = images[Math.min(active, images.length - 1)];

  return (
    <div className="lg:flex lg:gap-4">
      {images.length > 1 ? (
        <div className="order-first mt-3 flex gap-2 overflow-x-auto pb-1 lg:mt-0 lg:w-[4.5rem] lg:flex-col lg:overflow-visible lg:pb-0">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`${alt} ${i + 1}`}
              aria-current={i === active}
              className={`relative aspect-[3/4] w-16 shrink-0 overflow-hidden bg-stone transition lg:w-full ${
                i === active
                  ? "ring-1 ring-[var(--ink)] ring-offset-2"
                  : "opacity-65 hover:opacity-100"
              }`}
            >
              <Image
                src={img.url}
                alt=""
                fill
                className="object-cover"
                sizes="72px"
              />
            </button>
          ))}
        </div>
      ) : null}

      <div className="relative aspect-[3/4] flex-1 overflow-hidden bg-stone">
        <Image
          src={current.url}
          alt={alt}
          fill
          priority
          quality={95}
          className="object-cover"
          sizes="(max-width:1024px) 100vw, 46vw"
        />
      </div>
    </div>
  );
}
