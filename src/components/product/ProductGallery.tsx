"use client";

import Image from "next/image";
import { useRef, useState } from "react";

type Img = { url: string; id: string };

/**
 * The photos sit side by side in one scroll-snapping strip.
 *
 * On a phone the only way to the second photo used to be the row of 68px
 * thumbnails under the big one; a sideways swipe on the photo itself — the
 * gesture every shop app has taught — did nothing. The strip gives the swipe
 * for free from the browser's own scrolling, and the thumbnails steer the
 * same strip, so the two never disagree about which photo is showing.
 */
export function ProductGallery({ images, alt }: { images: Img[]; alt: string }) {
  const [active, setActive] = useState(0);
  const stripRef = useRef<HTMLDivElement>(null);
  if (!images.length) return null;
  const index = Math.min(active, images.length - 1);

  function onScroll() {
    const strip = stripRef.current;
    if (!strip || !strip.clientWidth) return;
    const next = Math.round(strip.scrollLeft / strip.clientWidth);
    if (next !== active) setActive(next);
  }

  function show(i: number) {
    setActive(i);
    const strip = stripRef.current;
    strip?.scrollTo({ left: i * strip.clientWidth, behavior: "smooth" });
  }

  return (
    <div className="lg:sticky lg:top-32">
      <div className="media aspect-[4/5]">
        <div
          ref={stripRef}
          onScroll={onScroll}
          className="no-scrollbar flex h-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
        >
          {images.map((img, i) => (
            <div
              key={img.id}
              className="relative h-full w-full shrink-0 snap-center snap-always"
            >
              <Image
                src={img.url}
                alt={i === 0 ? alt : `${alt} — ${i + 1}`}
                fill
                // Only the first is above the fold; the rest load as the
                // strip nears them.
                priority={i === 0}
                quality={95}
                className="fade-in object-contain p-4"
                sizes="(max-width:1024px) 100vw, 50vw"
              />
            </div>
          ))}
        </div>

        {images.length > 1 ? (
          <>
            <span className="tag pointer-events-none absolute right-3 bottom-3 max-lg:hidden">
              {index + 1} / {images.length}
            </span>
            {/* Where the swipe is: the thumbnails can be below the fold */}
            <div
              className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center gap-1.5 lg:hidden"
              aria-hidden="true"
            >
              {images.map((img, i) => (
                <span
                  key={img.id}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === index ? "w-4 bg-ink" : "w-1.5 bg-ink/20"
                  }`}
                />
              ))}
            </div>
          </>
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
              onClick={() => show(i)}
              className={`media relative h-20 w-[4.25rem] shrink-0 transition ${
                i === index ? "border-ink" : "opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={img.url}
                alt=""
                fill
                className="object-contain p-1"
                sizes="68px"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
