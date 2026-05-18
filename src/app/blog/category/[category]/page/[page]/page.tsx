import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { BlogCard } from '@/components/blog/BlogCard';
import { BlogCTA } from '@/components/blog/BlogCTA';
import { BlogPagination } from '@/components/blog/BlogPagination';
import { JsonLd } from '@/components/seo/JsonLd';
import { blogCategories, getBlogCategory, getPostsByCategory, type BlogCategorySlug } from '@/lib/blog';
import { getBlogPageCount, paginateItems } from '@/lib/blog/pagination';
import { generatePageMetadata } from '@/lib/seo';
import { breadcrumbSchema, itemListSchema, SITE_URL } from '@/lib/schema';

interface Props {
  params: Promise<{ category: string; page: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return blogCategories.flatMap((category) => {
    const posts = getPostsByCategory(category.slug);
    const totalPages = getBlogPageCount(posts.length);
    return Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => ({
      category: category.slug,
      page: String(i + 2),
    }));
  });
}

export async function generateMetadata({ params }: Readonly<Props>): Promise<Metadata> {
  const { category: slug, page } = await params;
  const category = blogCategories.find((item) => item.slug === slug);
  if (!category) return {};

  const pageNum = parseInt(page, 10);
  const allPosts = getPostsByCategory(category.slug);
  const totalPages = getBlogPageCount(allPosts.length);

  return generatePageMetadata({
    title: `${category.label} — Page ${pageNum} of ${totalPages} | KDP Preflight Blog`,
    description: `Page ${pageNum} of ${category.label} guides on KDP Preflight. ${category.seoIntro}`,
    path: `/blog/category/${slug}/page/${pageNum}`,
    keywords: ['KDP cover problems', category.label, 'Amazon KDP troubleshooting'],
  });
}

export default async function BlogCategoryPaginatedPage({ params }: Readonly<Props>) {
  const { category: slug, page } = await params;
  if (!blogCategories.some((item) => item.slug === slug)) notFound();

  const pageNum = parseInt(page, 10);
  const category = getBlogCategory(slug as BlogCategorySlug);
  const allPosts = getPostsByCategory(category.slug);
  const { items: posts, totalPages, currentPage } = paginateItems(allPosts, pageNum);

  if (isNaN(pageNum) || pageNum < 2 || pageNum > totalPages) notFound();

  const Icon = category.icon;

  return (
    <>
      <JsonLd
        id={`blog-category-${category.slug}-page-${currentPage}-schema`}
        data={[
          breadcrumbSchema([
            { name: 'Home', url: SITE_URL },
            { name: 'Blog', url: `${SITE_URL}/blog` },
            { name: category.label, url: `${SITE_URL}/blog/category/${category.slug}` },
            { name: `Page ${currentPage}`, url: `${SITE_URL}/blog/category/${category.slug}/page/${currentPage}` },
          ]),
          itemListSchema(
            `${category.label} KDP guides — Page ${currentPage}`,
            posts.map((post) => ({
              name: post.title,
              url: `${SITE_URL}/blog/${post.slug}`,
              description: post.description,
            })),
          ),
        ]}
      />

      <main>
        <header className="border-b border-border bg-surface/30">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <li><Link href="/" className="hover:text-primary">Home</Link></li>
                <li aria-hidden="true">/</li>
                <li><Link href="/blog" className="hover:text-primary">Blog</Link></li>
                <li aria-hidden="true">/</li>
                <li><Link href={`/blog/category/${category.slug}`} className="hover:text-primary">{category.label}</Link></li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="font-semibold text-foreground">Page {currentPage}</li>
              </ol>
            </nav>
            <Link
              href={`/blog/category/${category.slug}`}
              className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to {category.label}
            </Link>
            <div className="flex max-w-4xl items-start gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                <Icon className="h-6 w-6" />
              </span>
              <div>
                <p className="ds-eyebrow">KDP problem category</p>
                <h1 className="ds-heading mt-3 text-balance text-[clamp(1.75rem,4vw,3rem)]">
                  {category.label} — Page {currentPage} of {totalPages}
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">{category.seoIntro}</p>
              </div>
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6" aria-labelledby="category-posts-heading">
          <h2 id="category-posts-heading" className="mb-8 text-2xl font-bold tracking-tight text-foreground">
            {category.label} guides
          </h2>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
          <BlogPagination currentPage={currentPage} totalPages={totalPages} baseUrl={`/blog/category/${category.slug}`} />
        </section>

        <BlogCTA />
      </main>
    </>
  );
}
