import Image from "next/image";
import { Container } from "@/components/ui/Container";

type Feature = {
  title: string;
  text: string;
  image: string;
};

export function FeatureStrip({
  eyebrow,
  title,
  features,
}: {
  eyebrow: string;
  title: string;
  features: Feature[];
}) {
  return (
    <section className="border-t border-line bg-paper py-20 sm:py-24">
      <Container>
        <p className="text-[10px] tracking-[0.28em] text-muted uppercase">
          {eyebrow}
        </p>
        <h2 className="mt-3 max-w-xl text-2xl font-light tracking-tight sm:text-3xl">
          {title}
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
