import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

export async function FeatureStrip() {
  const t = await getTranslations("home");
  const features = [
    {
      title: t("featAluTitle"),
      text: t("featAluText"),
      image: "/products/aluma-cabin-55/silver-1.jpg",
    },
    {
      title: t("featHardTitle"),
      text: t("featHardText"),
      image: "/products/orbit-cabin-55/azure-1.jpg",
    },
    {
      title: t("featSoftTitle"),
      text: t("featSoftText"),
      image: "/products/atlas-weekender/cognac-1.jpg",
    },
  ];

  return (
    <section className="border-t border-line bg-paper py-20 sm:py-24">
      <Reveal>
        <Container>
          <p className="text-[10px] tracking-[0.2em] text-muted">
            {t("materials")}
          </p>
          <h2 className="mt-3 max-w-xl text-2xl font-light tracking-tight sm:text-3xl">
            {t("materialsTitle")}
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {features.map((f) => (
              <article key={f.title} className="group">
                <div className="relative aspect-[4/5] overflow-hidden bg-stone">
                  <Image
                    src={f.image}
                    alt=""
                    fill
                    quality={95}
                    sizes="(max-width:768px) 100vw, 33vw"
                    className="object-cover transition duration-700 group-hover:scale-[1.04]"
                  />
                </div>
                <h3 className="mt-5 text-sm tracking-tight">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {f.text}
                </p>
              </article>
            ))}
          </div>
        </Container>
      </Reveal>
    </section>
  );
}
