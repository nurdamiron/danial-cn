"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

const SLIDES = [
  "/products/hero/hero-main.jpg",
  "/products/alu-cabin-55/silver-front.jpg",
  "/products/pc-checkin-75/01-front.jpg",
  "/products/soft-cabin-55/01-front.jpg",
  "/products/alu-cabin-55/gold-front.jpg",
];

type Props = {
  brand: string;
  hero: string;
  catalogLabel: string;
  aboutLabel: string;
  videoSrc?: string;
};

export function HeroCinematic({
  brand,
  hero,
  catalogLabel,
  aboutLabel,
  videoSrc = "/products/hero/hero.mp4",
}: Props) {
  const [index, setIndex] = useState(0);
  const [hasVideo, setHasVideo] = useState(false);

  useEffect(() => {
    // Detect optional hosted video without hard failing
    fetch(videoSrc, { method: "HEAD" })
      .then((r) => setHasVideo(r.ok))
      .catch(() => setHasVideo(false));
  }, [videoSrc]);

  useEffect(() => {
    if (hasVideo) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, 5200);
    return () => window.clearInterval(id);
  }, [hasVideo]);

  return (
    <section className="relative min-h-[92vh] overflow-hidden bg-ink">
      {hasVideo ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster={SLIDES[0]}
          preload="auto"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      ) : (
        <div className="absolute inset-0">
          {SLIDES.map((src, i) => (
            <div
              key={src}
              className={`absolute inset-0 transition-opacity duration-[1600ms] ease-out ${
                i === index ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={src}
                alt=""
                fill
                priority={i === 0}
                quality={95}
                sizes="100vw"
                className={`object-cover object-center ${
                  i === index ? "hero-kenburns" : ""
                }`}
              />
            </div>
          ))}
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-ink/25" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/50 via-transparent to-transparent" />

      <Container className="relative flex min-h-[92vh] flex-col justify-end pb-16 pt-32 sm:pb-24">
        <div className="max-w-2xl space-y-7 fade-in text-paper">
          <p className="text-[11px] tracking-[0.42em] text-paper/65 uppercase">
            {brand}
          </p>
          <h1 className="text-4xl leading-[1.05] font-light tracking-tight sm:text-5xl md:text-6xl lg:text-[4.25rem]">
            {hero}
          </h1>
          <div className="flex flex-wrap gap-3 pt-1">
            <Link href="/catalog">
              <Button className="bg-paper text-ink hover:bg-paper/90">
                {catalogLabel}
              </Button>
            </Link>
            <Link href="/about">
              <Button
                variant="outline"
                className="border-paper/70 text-paper hover:bg-paper hover:text-ink"
              >
                {aboutLabel}
              </Button>
            </Link>
          </div>
        </div>

        {!hasVideo ? (
          <div className="absolute right-4 bottom-8 flex gap-1.5 sm:right-8">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-1 rounded-full transition-all ${
                  i === index ? "w-8 bg-paper" : "w-3 bg-paper/35"
                }`}
              />
            ))}
          </div>
        ) : null}
      </Container>
    </section>
  );
}
