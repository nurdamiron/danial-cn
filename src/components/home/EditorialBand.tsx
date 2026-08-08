import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Close-range photography of the hardware. Sits between the product grid and
 * the ordering steps so the page alternates between browsing and looking.
 */
export async function EditorialBand() {
  const t = await getTranslations("home");

  return (
    <section className="border-t border-line bg-stone py-20 sm:py-24">
      <Reveal>
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-5 lg:pt-6">
              <p className="text-[10px] tracking-[0.2em] text-muted">
                {t("editorialEyebrow")}
              </p>
              <h2 className="mt-3 text-2xl font-light tracking-tight sm:text-3xl">
                {t("editorialTitle")}
              </h2>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-muted">
                {t("editorialText")}
              </p>
              <div className="mt-8 grid grid-cols-2 gap-3">
                <div className="relative aspect-[4/3] overflow-hidden bg-paper">
                  <Image
                    src="/editorial/detail-lock.jpg"
                    alt=""
                    fill
                    quality={95}
                    sizes="(max-width:1024px) 50vw, 22vw"
                    className="object-cover"
                  />
                </div>
                <div className="relative aspect-[4/3] overflow-hidden bg-paper">
                  <Image
                    src="/editorial/detail-interior.jpg"
                    alt=""
                    fill
                    quality={95}
                    sizes="(max-width:1024px) 50vw, 22vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="relative aspect-[4/5] overflow-hidden bg-paper lg:col-span-7 lg:aspect-[16/13]">
              <Image
                src="/editorial/detail-hand.jpg"
                alt=""
                fill
                quality={95}
                sizes="(max-width:1024px) 100vw, 58vw"
                className="object-cover"
              />
            </div>
          </div>
        </Container>
      </Reveal>
    </section>
  );
}
