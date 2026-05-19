import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { notFound } from 'next/navigation';
import { BlogCTA } from '@/components/blog/BlogCTA';
import { BlogIndexExperience } from '@/components/blog/BlogIndexExperience';
import { BlogPagination } from '@/components/blog/BlogPagination';
import { JsonLd } from '@/components/seo/JsonLd';
import { blogCategories, blogPosts, topicClusters } from '@/lib/blog';
import { getBlogPageCount, paginateItems } from '@/lib/blog/pagination';
import { generatePageMetadata } from '@/lib/seo';
import { breadcrumbSchema, itemListSchema, SITE_URL } from '@/lib/schema';

interface Props {
  params: Promise<{ page: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  const totalPages = getBlogPageCount(blogPosts.length);
  return Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => ({ page: String(i + 2) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { page } = await params;
  const pageNum = parseInt(page, 10);
  const totalPages = getBlogPageCount(blogPosts.length);

  return generatePageMetadata({
    title: `KDP Preflight Blog — Page ${pageNum} of ${totalPages} | KDP Cover & Formatting Guides`,
    description: `Browse page ${pageNum} of the KDP Preflight guide library. Practical Amazon KDP formatting guides covering bleed, safe area, spine width, export settings, and cover rejections.`,
    path: `/blog/page/${pageNum}`,
    keywords: ['KDP Preflight Blog', 'Amazon KDP guides', 'KDP cover issues', 'KDP formatting'],
  });
}

export default async function BlogPaginatedPage({ params }: Props) {
  const { page } = await params;
  const pageNum = parseInt(page, 10);

  const { items: gridPosts, totalPages, currentPage } = paginateItems(blogPosts, pageNum);

  if (isNaN(pageNum) || pageNum < 2 || pageNum > totalPages) notFound();

  return (
    <>
      <JsonLd
        id={`blog-page-${currentPage}-schema`}
        data={[
          breadcrumbSchema([
            { name: 'Home', url: SITE_URL },
            { name: 'Blog', url: `${SITE_URL}/blog` },
            { name: `Page ${currentPage}`, url: `${SITE_URL}/blog/page/${currentPage}` },
          ]),
          itemListSchema(
            `KDP Preflight Blog Guides — Page ${currentPage}`,
            gridPosts.map((post) => ({
              name: post.title,
              url: `${SITE_URL}/blog/${post.slug}`,
              description: post.description,
            })),
          ),
        ]}
      />

      <header className="border-b border-border bg-surface/30">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-12">
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <li><Link href="/" className="hover:text-primary">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href="/blog" className="hover:text-primary">Blog</Link></li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="font-semibold text-foreground">Page {currentPage}</li>
            </ol>
          </nav>
          <h1 className="ds-heading text-balance text-[clamp(1.75rem,4vw,3rem)]">
            KDP Publishing Guides
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Page {currentPage} of {totalPages} — practical guides for fixing Amazon KDP cover problems.
          </p>
        </div>
      </header>

      <main>
        <BlogIndexExperience
          posts={gridPosts}
          footer={<BlogPagination currentPage={currentPage} totalPages={totalPages} baseUrl="/blog" />}
        />

        {blogCategories.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6" aria-labelledby="blog-categories-heading">
            <h2 id="blog-categories-heading" className="mb-6 text-2xl font-bold tracking-tight text-foreground">
              Browse by category
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {blogCategories.map((category) => {
                const Icon = category.icon;
                const count = blogPosts.filter((post) => post.category === category.slug).length;
                return (
                  <Link
                    key={category.slug}
                    href={`/blog/category/${category.slug}`}
                    className="group inline-flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-card transition hover:-translate-y-0.5 hover:border-primary/30"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-foreground group-hover:text-primary">{category.label}</p>
                      {count > 0 && (
                        <p className="text-xs font-semibold text-muted-foreground">{count} guide{count === 1 ? '' : 's'}</p>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-primary transition group-hover:translate-x-1" />
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {topicClusters.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6" aria-labelledby="topic-clusters-heading">
            <h2 id="topic-clusters-heading" className="mb-6 text-2xl font-bold tracking-tight text-foreground">
              KDP knowledge paths
            </h2>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {topicClusters.map((cluster) => (
                <article key={cluster.title} className="rounded-2xl border border-border bg-card p-5 shadow-card">
                  <h3 className="text-base font-bold text-foreground">{cluster.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{cluster.description}</p>
                  <div className="mt-5 grid gap-2">
                    {cluster.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="group inline-flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/25 px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:border-primary/30 hover:bg-primary/10 hover:text-foreground"
                      >
                        {link.label}
                        <ArrowRight className="h-3.5 w-3.5 text-primary transition group-hover:translate-x-1" />
                      </Link>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <BlogCTA />
      </main>
    </>
  );
}
