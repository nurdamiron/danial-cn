import { StarIcon } from "@/components/ui/icons";
import type { Review } from "@/data/reviews";

export function ReviewCard({ review, locale }: { review: Review; locale: string }) {
  const initial = review.name.trim().charAt(0).toUpperCase();

  return (
    <article className="card flex h-full flex-col p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="t-display flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-sm text-paper">
            {initial}
          </span>
          <div>
            <p className="text-sm font-medium">{review.name}</p>
            <p className="t-micro text-muted">{review.city}</p>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <StarIcon
              key={i}
              filled={i < review.rating}
              className={`h-3.5 w-3.5 ${
                i < review.rating ? "text-ink" : "text-line-strong"
              }`}
            />
          ))}
        </div>
      </div>

      <p className="mt-4 flex-1 text-[0.9375rem] leading-relaxed text-ink/85">
        «{locale === "kk" ? review.textKk : review.textRu}»
      </p>

      <p className="t-data mt-5 border-t border-line pt-4 text-muted">
        {review.product}
      </p>
    </article>
  );
}
