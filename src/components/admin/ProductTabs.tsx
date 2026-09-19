"use client";

import { useEffect, useState } from "react";

/**
 * The three halves of a product, one at a time.
 *
 * They used to be three stacked sections, all open. On the largest product in
 * this shop that is 26 photo cards and 9 variant rows below the fields — 126
 * buttons on one page — so coming here to change a price meant scrolling past
 * everything, and the Save button for those fields sat in the middle of the
 * page rather than under them.
 *
 * State lives in the URL hash rather than in React, so a reload, a photo
 * upload that redirects, or a link sent to someone else all land on the tab
 * they were meant to.
 */

export type ProductTabId = "product" | "variants" | "photos";

const TABS: { id: ProductTabId; label: string }[] = [
  { id: "product", label: "Товар" },
  { id: "variants", label: "Варианты" },
  { id: "photos", label: "Фото" },
];

function fromHash(hash: string): ProductTabId | null {
  const id = hash.replace(/^#/, "");
  return TABS.some((t) => t.id === id) ? (id as ProductTabId) : null;
}

export function ProductTabs({
  counts,
  product,
  variants,
  photos,
  /** Set when photos failed to upload on create: that tab opens first. */
  openPhotos,
}: {
  counts: { variants: number; photos: number };
  product: React.ReactNode;
  variants: React.ReactNode;
  photos: React.ReactNode;
  openPhotos?: boolean;
}) {
  const [active, setActive] = useState<ProductTabId>(
    openPhotos ? "photos" : "product",
  );

  // Read once on mount and follow the back button afterwards. Written in an
  // effect because the server render cannot see a hash — it never leaves the
  // browser — and rendering a different tab than the server did would blow up
  // hydration.
  useEffect(() => {
    const sync = () => {
      const fromUrl = fromHash(window.location.hash);
      if (fromUrl) setActive(fromUrl);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  function select(id: ProductTabId) {
    setActive(id);
    // replaceState, not a new entry: flicking between tabs should not fill the
    // back button with places nobody wants to return to.
    window.history.replaceState(null, "", `#${id}`);
  }

  const count: Record<ProductTabId, number | null> = {
    product: null,
    variants: counts.variants,
    photos: counts.photos,
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label="Разделы товара"
        className="flex gap-1 border-b border-line"
      >
        {TABS.map((tab) => {
          const on = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={on}
              aria-controls={`panel-${tab.id}`}
              onClick={() => select(tab.id)}
              className={`-mb-px inline-flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm transition-colors duration-200 ${
                on
                  ? "border-ink font-medium text-ink"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {tab.label}
              {count[tab.id] !== null ? (
                <span
                  className={`t-data rounded-full px-1.5 py-0.5 text-[0.6875rem] ${
                    on ? "bg-ink text-paper" : "bg-stone text-muted"
                  }`}
                >
                  {count[tab.id]}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/*
        All three stay mounted and the inactive ones are hidden. Unmounting
        would throw away a half-filled variant form every time somebody looked
        at the photos, and these panels hold unsaved work.
      */}
      <div className="pt-6">
        {TABS.map((tab) => (
          <div
            key={tab.id}
            role="tabpanel"
            id={`panel-${tab.id}`}
            aria-labelledby={`tab-${tab.id}`}
            hidden={active !== tab.id}
          >
            {tab.id === "product"
              ? product
              : tab.id === "variants"
                ? variants
                : photos}
          </div>
        ))}
      </div>
    </div>
  );
}
