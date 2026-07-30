import { Container } from "@/components/ui/Container";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";

type Step = { n: string; title: string; text: string };

export function OrderPath({
  title,
  steps,
  cta,
  locale,
}: {
  title: string;
  steps: Step[];
  cta: string;
  locale: string;
}) {
  return (
    <section className="border-t border-line bg-sand py-20 sm:py-24">
      <Container>
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] tracking-[0.28em] text-muted uppercase">
              {locale === "kk" ? "Тапсырыс жолы" : "Путь заказа"}
            </p>
            <h2 className="mt-3 text-2xl font-light tracking-tight sm:text-3xl">
              {title}
            </h2>
          </div>
          <Link href="/catalog">
            <Button variant="outline">{cta}</Button>
          </Link>
        </div>

        <ol className="grid gap-4 md:grid-cols-4">
          {steps.map((s, i) => (
            <li
              key={s.n}
              className="relative border border-line bg-paper p-6 sm:p-7"
            >
              <span className="text-[11px] tracking-[0.28em] text-muted">
                {s.n}
              </span>
              <h3 className="mt-4 text-base font-light tracking-tight">
                {s.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{s.text}</p>
              {i < steps.length - 1 ? (
                <span className="absolute top-1/2 -right-3 hidden h-px w-3 bg-line md:block" />
              ) : null}
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
