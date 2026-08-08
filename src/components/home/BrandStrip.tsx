import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { BrandMark } from "@/components/ui/BrandMark";
import { getBrands } from "@/lib/products";

/**
 * The house lines, each rendered from its own logo file. Every tile links into
 * the catalog pre-filtered to that line, so the wall is navigation rather than
 * decoration.
 */
export async function BrandStrip() {
  const t = await getTranslations("home");
  const locale = await getLocale();
  const brands = getBrands();

  return (
    <section className="border-t border-line bg-paper py-20 sm:py-24">
      <Reveal>
        <Container>
          <div className="mb-12 grid gap-6 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <p className="text-[10px] tracking-[0.2em] text-muted">
                {t("brandsEyebrow")}
              </p>
              <h2 className="mt-3 text-2xl font-light tracking-tight sm:text-3xl">
                {t("brandsTitle")}
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-muted md:col-span-5">
              {t("brandsLead")}
            </p>
          </div>

          <ul className="grid grid-cols-2 gap-px border border-line bg-line md:grid-cols-3">
            {brands.map((b) => (
              <li key={b.key} className="bg-paper">
                <Link
                  href={`/catalog?brand=${b.key}`}
                  className="group flex h-full flex-col justify-between gap-8 p-6 transition hover:bg-stone sm:p-8"
                >
                  <BrandMark
                    name={b.key}
                    height={19}
                    label={b.name}
                    className="text-ink transition group-hover:opacity-60"
                  />
                  <div>
                    <p className="text-[13px] leading-snug text-muted">
                      {locale === "kk" ? b.taglineKk : b.taglineRu}
                    </p>
                    <p className="mt-2 text-[11px] tracking-[0.14em] text-muted/70">
                      {t("modelsCount", { n: b.count })}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </Reveal>
    </section>
  );
}
