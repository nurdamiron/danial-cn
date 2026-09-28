import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { SITE } from "@/lib/site";
import { faqJsonLd, pageAlternates } from "@/lib/seo";
import { routing } from "@/i18n/routing";
import { blogPosts, getPost, relatedPosts, DISCLAIMER } from "@/data/blog-posts";

export async function generateStaticParams() {
  return blogPosts.flatMap((post) =>
    routing.locales.map((locale) => ({ locale, slug: post.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Статья" };
  const desc =
    post.answer.length > 157
      ? post.answer.slice(0, 157).trim() + "…"
      : post.answer;
  return {
    title: post.title,
    description: desc,
    alternates: pageAlternates(locale, `/blog/${slug}`),
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const post = getPost(slug);
  if (!post) notFound();

  const related = relatedPosts(post, 4);
  const url = `${SITE.url}/${locale}/blog/${slug}`;

  const blogPostingJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: { "@type": "Organization", name: "Danial CN" },
    publisher: { "@type": "Organization", name: "Danial CN" },
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            faqJsonLd(post.faqs.map((f) => ({ question: f.q, answer: f.a }))),
          ),
        }}
      />

      <PageHeader eyebrow={post.category} title={post.title} />

      <Container className="max-w-3xl py-14 sm:py-20">
        <nav className="mb-8 flex flex-wrap gap-1 text-sm text-muted">
          <Link href="/" className="link-quiet">
            {t("brand.name")}
          </Link>
          <span>/</span>
          <Link href="/blog" className="link-quiet">
            Блог
          </Link>
        </nav>

        <p id="short-answer" className="card bg-paper p-6 text-base leading-relaxed sm:text-lg">
          <strong>Короткий ответ.</strong> {post.answer}
        </p>

        <div className="prose-site mt-8 space-y-8">
          <section>
            <h2 className="t-h3">Кому это обычно нужно</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              {post.need.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <p className="text-base leading-relaxed sm:text-lg">{post.detail}</p>

          <section>
            <h2 className="t-h3">Как выбрать, чтобы не пожалеть</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              {post.choose.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="t-h3">Частые ошибки</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              {post.wrong.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <p>
            Смотрите каталог RIMO:{" "}
            <Link href="/catalog" className="link-quiet">
              чемоданы, сумки и аксессуары
            </Link>
            .
          </p>

          <section>
            <h2 className="t-h3">Частые вопросы</h2>
            <div className="mt-3 space-y-5">
              {post.faqs.map((faq) => (
                <div key={faq.q}>
                  <h3 className="t-h4">{faq.q}</h3>
                  <p className="mt-1 text-muted">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

          {related.length > 0 ? (
            <section>
              <h2 className="t-h3">Читать дальше по теме</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link href={`/blog/${r.slug}`} className="link-quiet">
                      {r.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <p className="text-sm text-muted">{DISCLAIMER}</p>
        </div>
      </Container>
    </div>
  );
}
