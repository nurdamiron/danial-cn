import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { buttonClass } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/icons";

type Props = {
  title: string;
  lead: string;
  catalogLabel: string;
  chatLabel: string;
  whatsappUrl: string;
};

/**
 * The thesis: a shell standing in airport light, everything else set on top of
 * it. The photo is the product's own world — it carries the page, not a
 * gradient.
 */
export function HomeHero({
  title,
  lead,
  catalogLabel,
  chatLabel,
  whatsappUrl,
}: Props) {
  return (
    <section className="on-dark relative isolate overflow-hidden bg-ink text-paper">
      <div className="absolute inset-0 -z-10">
        <Image
          src="/editorial/hero-terminal.jpg"
          alt=""
          fill
          priority
          quality={95}
          className="hero-pan object-cover object-[62%_50%]"
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,11,11,0.86)_0%,rgba(11,11,11,0.62)_45%,rgba(11,11,11,0.9)_100%)] sm:bg-[linear-gradient(100deg,rgba(11,11,11,0.94)_0%,rgba(11,11,11,0.78)_40%,rgba(11,11,11,0.22)_100%)]"
          aria-hidden="true"
        />
      </div>

      <Container className="flex min-h-[32rem] flex-col justify-end pt-16 pb-14 sm:min-h-[36rem] sm:pt-24 sm:pb-16 lg:min-h-[41rem]">
        <h1 className="rise rise-2 t-display t-hero max-w-[16ch] text-balance">
          {title}
        </h1>

        <p className="rise rise-3 t-lead mt-6 max-w-lg text-paper/70">{lead}</p>

        <div className="rise rise-4 mt-9 flex flex-wrap items-center gap-3">
          <Link href="/catalog" className={buttonClass("secondary", "lg")}>
            {catalogLabel}
          </Link>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className={buttonClass("outlineInverse", "lg")}
          >
            <WhatsAppIcon className="h-[18px] w-[18px]" />
            {chatLabel}
          </a>
        </div>
      </Container>

      <div className="flute-edge-dark absolute inset-x-0 bottom-0" aria-hidden="true" />
    </section>
  );
}
