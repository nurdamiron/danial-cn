import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { KaspiBadge } from "@/components/ui/KaspiBadge";

type Props = {
  brand: string;
  title: string;
  subtitle: string;
  catalogLabel: string;
  kaspiNote: string;
};

/** Compact shop-first hero — app-style, not full-screen landing */
export function HomeShopHero({
  brand,
  title,
  subtitle,
  catalogLabel,
  kaspiNote,
}: Props) {
  return (
    <section className="border-b border-line bg-ink text-paper">
      <Container className="grid gap-6 py-8 sm:grid-cols-[1.1fr_0.9fr] sm:items-center sm:gap-10 sm:py-10">
        <div className="space-y-4">
          <p className="text-[10px] tracking-[0.28em] text-paper/50 uppercase">
            {brand}
          </p>
          <h1 className="text-2xl font-light tracking-tight sm:text-3xl md:text-[2rem] md:leading-snug">
            {title}
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-paper/55">
            {subtitle}
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link href="/catalog">
              <Button variant="secondary" size="sm">
                {catalogLabel}
              </Button>
            </Link>
            <span className="inline-flex items-center gap-2 text-xs text-paper/45">
              <KaspiBadge height={22} />
              <span className="hidden sm:inline">{kaspiNote}</span>
            </span>
          </div>
        </div>

        <div className="relative mx-auto aspect-[4/5] w-full max-w-[280px] overflow-hidden rounded-2xl bg-paper sm:max-w-none sm:rounded-xl">
          <Image
            src="/products/hero/hero-main.jpg"
            alt=""
            fill
            priority
            quality={95}
            className="object-contain p-4"
            sizes="(max-width:640px) 70vw, 40vw"
          />
        </div>
      </Container>
    </section>
  );
}
