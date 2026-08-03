import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

/**
 * The one thing a luggage buyer decides first: how tall the shell is.
 * Each card draws the case to real scale against 75 cm — handle, fluted body,
 * wheels — so the row reads as a ruler and doubles as the way into the
 * catalogue.
 */
const MAX_CM = 75;
const BODY_MAX_PX = 132;

function Shell({ cm, width }: { cm: number; width: number }) {
  const height = Math.round((cm / MAX_CM) * BODY_MAX_PX);
  return (
    <span className="flex flex-col items-center" aria-hidden="true">
      {/* telescopic handle */}
      <span className="h-3 w-1/2 rounded-t-sm border border-b-0 border-line-strong bg-sand" />
      {/* fluted body */}
      <span
        className="shell-body relative rounded-[6px] border border-line-strong transition-[filter] duration-500 group-hover:brightness-[0.98]"
        style={{ height, width }}
      />
      {/* wheels */}
      <span className="flex w-full justify-between px-1">
        <span className="h-1.5 w-1.5 rounded-b-full bg-line-strong" />
        <span className="h-1.5 w-1.5 rounded-b-full bg-line-strong" />
      </span>
    </span>
  );
}

export async function SizeGuide() {
  const t = await getTranslations("home");

  const sizes = [
    {
      href: "/catalog?size=55",
      code: "CABIN",
      title: t("size55Title"),
      text: t("size55Text"),
      shells: [{ cm: 55, width: 52 }],
    },
    {
      href: "/catalog?size=65",
      code: "MID",
      title: t("size65Title"),
      text: t("size65Text"),
      shells: [{ cm: 65, width: 58 }],
    },
    {
      href: "/catalog?size=75",
      code: "CHECK-IN",
      title: t("size75Title"),
      text: t("size75Text"),
      shells: [{ cm: 75, width: 64 }],
    },
    {
      href: "/catalog?category=set",
      code: "SET",
      title: t("sizeSetTitle"),
      text: t("sizeSetText"),
      shells: [
        { cm: 75, width: 60 },
        { cm: 55, width: 46 },
      ],
    },
  ] as const;

  return (
    <section className="border-t border-line bg-stone py-14 sm:py-20">
      <Container>
        <Reveal>
          <div className="max-w-2xl">
            <p className="t-label text-muted">{t("sizeTitle")}</p>
            <h2 className="t-display t-h2 mt-3 text-balance">{t("sizeLead")}</h2>
          </div>

          <ul className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {sizes.map((s) => (
              <li key={s.code}>
                <Link
                  href={s.href}
                  className="card lift group flex h-full flex-col p-5"
                >
                  <div className="flex h-[10.5rem] items-end justify-center gap-2">
                    {s.shells.map((sh, i) => (
                      <Shell key={i} cm={sh.cm} width={sh.width} />
                    ))}
                  </div>

                  <div className="mt-5 border-t border-line pt-4">
                    <p className="t-data text-muted">{s.code}</p>
                    <p className="t-display mt-1 text-xl">{s.title}</p>
                    <p className="t-micro mt-1.5 text-muted">{s.text}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}
