import { type ReactNode } from "react";
import { Container } from "@/components/ui/Container";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: ReactNode;
}) {
  return (
    <div className="border-b border-line bg-white">
      <Container className="py-10 sm:py-14">
        <p className="text-[10px] tracking-[0.2em] text-muted">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-light tracking-tight sm:text-4xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
            {subtitle}
          </p>
        ) : null}
      </Container>
    </div>
  );
}
