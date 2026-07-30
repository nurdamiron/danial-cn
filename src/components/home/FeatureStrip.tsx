import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";

export async function FeatureStrip() {
  const t = await getTranslations("home");
  const features = [
    {
      title: t("featAluTitle"),
      text: t("featAluText"),
      image: "/products/alu-cabin-55/silver-front.jpg",
    },
    {
      title: t("featHardTitle"),
      text: t("featHardText"),
      image: "/products/pc-checkin-75/01-front.jpg",
    },
    {
      title: t("featSoftTitle"),
      text: t("featSoftText"),
      image: "/products/soft-cabin-55/01-front.jpg",
    },
  ];

  return (
    <section className="border-t border-line bg-paper py-20 sm:py-24">
      <Container>
        <p className="text-[10px] tracking-[0.2em] text-muted">{t("materials")}</p>
        <h2 className="mt-3 max-w-xl text-2xl font-light tracking-tight sm:text-3xl">
          {t("materialsTitle")}
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {features.map((f) => (
            <article key={f.title} className="group">
              <div className="relative aspect-[4/5] overflow-hidden bg-white">
                <Image
                  src={f.image}
                  alt=""
                  fill
                  quality={95}
                  sizes="(max-width:768px) 100vw, 33vw"
                  className="object-contain p-8 transition duration-700 group-hover:scale-[1.03]"
                />
              </div>
              <h3 className="mt-5 text-sm tracking-tight">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.text}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
