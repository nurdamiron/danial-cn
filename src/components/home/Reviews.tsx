import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowRightIcon, StarIcon } from "@/components/ui/icons";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { REVIEWS, type Review } from "@/data/reviews";

const avgRating =
  Math.round((REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEWS.length) * 10) /
  10;

const ROW_A = REVIEWS.filter((_, i) => i % 2 === 0);
const ROW_B = REVIEWS.filter((_, i) => i % 2 === 1);

function MarqueeRow({
  reviews,
  locale,
  reverse,
}: {
  reviews: Review[];
  locale: string;
  reverse?: boolean;
}) {
  const items = [...reviews, ...reviews];
  return (
    <div
      className="marquee flex gap-4 hover:[animation-play-state:paused]"
      style={reverse ? { animationDirection: "reverse" } : undefined}
    >
      {items.map((r, i) => (
        <div key={`${r.name}-${i}`} className="w-[19rem] shrink-0 sm:w-[22rem]">
          <ReviewCard review={r} locale={locale} />
        </div>
      ))}
    </div>
  );
}

export async function Reviews({ locale }: { locale: string }) {
  const t = await getTranslations("home");

  return (
    <section className="border-t border-line bg-stone py-14 sm:py-20">
      <Reveal>
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
            <div>
              <p className="t-label text-muted">{t("reviewsLabel")}</p>
              <h2 className="t-display t-h2 mt-2">{t("reviewsTitle")}</h2>
              <p className="t-lead mt-3 max-w-lg text-muted">
                {t("reviewsSubtitle")}
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 rounded-full border border-line bg-paper py-2 pr-4 pl-2">
                <span className="t-display flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-sm text-paper">
                  {avgRating}
                </span>
                <div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon
                        key={i}
                        filled={i < Math.round(avgRating)}
                        className="h-3 w-3 text-ink"
                      />
                    ))}
                  </div>
                  <p className="t-micro text-muted">
                    {REVIEWS.length} {t("reviewsCountLabel")}
                  </p>
                </div>
              </div>

              <Link
                href="/reviews"
                className="link-quiet t-micro inline-flex shrink-0 items-center gap-1"
              >
                {t("reviewsAll")}
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </Container>

        <div className="mt-10 space-y-4 [mask-image:linear-gradient(90deg,transparent,black_5%,black_95%,transparent)]">
          <MarqueeRow reviews={ROW_A} locale={locale} />
          <MarqueeRow reviews={ROW_B} locale={locale} reverse />
        </div>
      </Reveal>
    </section>
  );
}
