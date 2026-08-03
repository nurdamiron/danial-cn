import { type ReactNode } from "react";
import { Container } from "@/components/ui/Container";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  aside,
}: {
  eyebrow: string;
  title: string;
  subtitle?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div className="border-b border-line bg-paper">
      <Container className="flex flex-col gap-6 pt-10 pb-9 sm:pt-14 sm:pb-12 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="t-label text-muted">{eyebrow}</p>
          <h1 className="t-display t-h1 mt-3">{title}</h1>
          {subtitle ? (
            <p className="t-lead mt-4 max-w-xl text-muted">{subtitle}</p>
          ) : null}
        </div>
        {aside ? <div className="shrink-0">{aside}</div> : null}
      </Container>
      <div className="flute-edge" aria-hidden="true" />
    </div>
  );
}
