"use client";

import Link from "next/link";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  EyeIcon,
  EyeOffIcon,
  PencilIcon,
  StarIcon,
  TrashIcon,
} from "@/components/ui/icons";
import { formatKzt } from "@/lib/money";
import type { ProductRow } from "@/components/admin/ProductsList";

/**
 * One product, as the person running the shop looks for it.
 *
 * The list used to be a dense table on a desktop and a different set of
 * actions on a phone, both of which gave the name, the brand, the slug, the
 * status, the price and two counts the same weight — so nothing was findable
 * at a glance except by reading. What the owner actually scans for is the
 * photo and whether the bag is on the site; those lead now, and the internal
 * strings sit at the bottom in the mono face where they read as data rather
 * than as a heading.
 */

const CATEGORY_LABEL: Record<string, string> = {
  cabin: "Ручная кладь",
  checkin: "Багаж",
  set: "Комплект",
  bag: "Сумка",
};

function StatusBadge({ live }: { live: boolean }) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5",
        "text-[0.6875rem] font-medium tracking-[0.08em] uppercase",
        live
          ? "border-ink/15 bg-ink text-paper"
          : "border-line bg-paper text-muted",
      ].join(" ")}
    >
      <span
        className={[
          "h-1.5 w-1.5 rounded-full",
          live ? "bg-paper" : "bg-line-strong",
        ].join(" ")}
      />
      {live ? "на сайте" : "черновик"}
    </span>
  );
}

function Action({
  onClick,
  disabled,
  danger,
  label,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={[
        "inline-flex h-8 items-center gap-1.5 rounded-[var(--r-xs)] px-2",
        "text-[0.8125rem] transition-colors duration-200",
        "disabled:opacity-35",
        danger
          ? "text-danger hover:bg-danger-tint"
          : "text-muted hover:bg-stone hover:text-ink",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function ProductCard({
  product: p,
  busy,
  onToggleStatus,
  onToggleFeatured,
  onMove,
  onRemove,
}: {
  product: ProductRow;
  busy: boolean;
  onToggleStatus: () => void;
  onToggleFeatured: () => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
}) {
  const live = p.status === "active";
  // A bag with no photograph cannot go on the site — the publish endpoint
  // refuses it — so the card says why before the button is pressed.
  const blocked = !live && p.imageCount === 0;

  return (
    <article className="card lift group flex flex-col overflow-hidden">
      <div className="flex gap-4 p-4">
        <Link
          href={`/admin/products/${p.id}`}
          className="media relative flex h-28 w-24 shrink-0 items-center justify-center"
        >
          {p.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.imageUrl}
              alt=""
              className="h-full w-full object-contain p-1.5"
            />
          ) : (
            <span className="t-data text-muted">нет фото</span>
          )}
          {p.featured ? (
            <span
              className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-paper"
              title="На главной"
            >
              <StarIcon className="h-3 w-3" filled />
            </span>
          ) : null}
        </Link>

        <div className="flex min-w-0 flex-1 flex-col">
          <p className="t-label truncate text-muted">{p.brand}</p>
          <Link
            href={`/admin/products/${p.id}`}
            className="t-display mt-0.5 block truncate text-[0.9375rem] leading-snug hover:opacity-60"
          >
            {p.nameRu}
          </Link>

          <p className="t-price tabular mt-1.5 text-lg">
            {formatKzt(p.basePriceKzt)}
          </p>

          <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-2">
            <StatusBadge live={live} />
            <span className="t-data text-muted">
              {CATEGORY_LABEL[p.category] ?? p.category}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-line px-4 py-2">
        <span className="t-data truncate text-muted" title={p.slug}>
          {p.slug}
        </span>
        <span
          className={[
            "t-data ml-auto shrink-0 whitespace-nowrap",
            blocked ? "text-danger" : "text-muted",
          ].join(" ")}
        >
          {blocked ? "нужно фото" : `${p.imageCount} фото · ${p.variantCount} вар.`}
        </span>
      </div>

      <div className="flex items-center gap-0.5 border-t border-line px-2 py-1.5">
        <Link
          href={`/admin/products/${p.id}`}
          className="inline-flex h-8 items-center gap-1.5 rounded-[var(--r-xs)] px-2 text-[0.8125rem] text-ink transition-colors duration-200 hover:bg-stone"
        >
          <PencilIcon className="h-3.5 w-3.5" />
          Открыть
        </Link>

        <Action
          onClick={onToggleStatus}
          disabled={busy}
          label={live ? "Снять с сайта" : "Опубликовать"}
        >
          {live ? (
            <EyeOffIcon className="h-3.5 w-3.5" />
          ) : (
            <EyeIcon className="h-3.5 w-3.5" />
          )}
        </Action>

        <Action
          onClick={onToggleFeatured}
          disabled={busy}
          label={p.featured ? "Убрать с главной" : "На главную"}
        >
          <StarIcon className="h-3.5 w-3.5" filled={p.featured} />
        </Action>

        <Action onClick={() => onMove(-1)} disabled={busy} label="Выше в каталоге">
          <ArrowUpIcon className="h-3.5 w-3.5" />
        </Action>

        <Action onClick={() => onMove(1)} disabled={busy} label="Ниже в каталоге">
          <ArrowDownIcon className="h-3.5 w-3.5" />
        </Action>

        {/* Kept away from the rest: it is the one action that cannot be undone. */}
        <span className="ml-auto">
          <Action onClick={onRemove} disabled={busy} danger label="Удалить">
            <TrashIcon className="h-3.5 w-3.5" />
          </Action>
        </span>
      </div>
    </article>
  );
}
