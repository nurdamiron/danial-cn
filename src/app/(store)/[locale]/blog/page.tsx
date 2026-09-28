import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { pageAlternates } from "@/lib/seo";
import { blogPosts } from "@/data/blog-posts";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Блог — размер, уход и выбор реплик RIMO",
    description:
      "Разборы по выбору размера чемодана, уходу за материалами и честному сравнению реплик RIMO с оригиналом.",
    alternates: pageAlternates(locale, "/blog"),
  };
}

export default async function BlogIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <div>
      <PageHeader
        eyebrow={t("brand.name")}
        title="Блог"
        subtitle="Разборы по выбору размера, уходу за материалом и честные сравнения реплик RIMO — без воды."
      />
      <Container className="py-14 sm:py-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="card flex flex-col gap-3 p-6 transition hover:shadow-md"
            >
              <p className="t-label text-muted">{post.category}</p>
              <h2 className="t-h4 text-balance">{post.title}</h2>
              <p className="text-sm text-muted line-clamp-3">{post.answer}</p>
            </Link>
          ))}
        </div>
      </Container>
    </div>
  );
}
