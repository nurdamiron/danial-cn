import { getTranslations } from "next-intl/server";

export async function MarqueeBar() {
  const t = await getTranslations();
  const items = [
    t("brand.name"),
    t("footer.rights").replace(`${t("brand.name")}. `, ""),
    t("category.cabin"),
    t("category.checkin"),
    t("home.trustKaspi"),
    t("home.trustChat"),
    t("home.featAluTitle"),
    t("home.featHardTitle"),
    t("home.featSoftTitle"),
  ];
  const loop = [...items, ...items];

  return (
    <div className="overflow-hidden border-y border-line bg-ink text-paper">
      <div className="marquee flex whitespace-nowrap py-3">
        {loop.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="mx-8 text-[10px] tracking-[0.2em] opacity-80"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
