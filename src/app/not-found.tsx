import Link from "next/link";

export default function RootNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-sand px-4 text-center text-ink">
      <p className="text-[10px] tracking-[0.28em] text-muted uppercase">
        Danial CN
      </p>
      <h1 className="mt-4 text-4xl font-light tracking-tight sm:text-5xl">
        404
      </h1>
      <p className="mt-4 max-w-sm text-sm text-muted">
        Страница не найдена.
      </p>
      <Link
        href="/ru"
        className="mt-8 inline-block border border-ink px-6 py-3 text-sm transition hover:bg-ink hover:text-paper"
      >
        На главную
      </Link>
    </div>
  );
}
