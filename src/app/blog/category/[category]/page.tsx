import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { BlogCard } from '@/components/blog/BlogCard';
import { BlogCTA } from '@/components/blog/BlogCTA';
import { BlogPagination } from '@/components/blog/BlogPagination';
import { JsonLd } from '@/components/seo/JsonLd';
import { blogCategories, getBlogCategory, getPostsByCategory, type BlogCategorySlug } from '@/lib/blog';
import { paginateItems } from '@/lib/blog/pagination';
import { generatePageMetadata } from '@/lib/seo';
import { breadcrumbSchema, itemListSchema, SITE_URL } from '@/lib/schema';

interface Props {
  params: Promise<{ category: string }>;
}

export function generateStaticParams() {
  return blogCategories.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: slug } = await params;
  const category = blogCategories.find((item) => item.slug === slug);
  if (!category) return {};

  const postCount = getPostsByCategory(category.slug).length;

  return generatePageMetadata({
    title: `${category.label} | KDP Preflight Blog`,
    description: category.seoIntro,
    path: `/blog/category/${category.slug}`,
    keywords: ['KDP cover problems', category.label, 'Amazon KDP troubleshooting', 'KDP cover formatting'],
    noIndex: postCount === 0,
  });
}

export default async function BlogCategoryPage({ params }: Readonly<Props>) {
  const { category: slug } = await params;
  if (!blogCategories.some((item) => item.slug === slug)) notFound();

  const category = getBlogCategory(slug as BlogCategorySlug);
  const allPosts = getPostsByCategory(category.slug);
  const { items: posts, totalPages } = paginateItems(allPosts, 1);
  const Icon = category.icon;

  return (
    <>
      <JsonLd
        id={`blog-category-${category.slug}-schema`}
        data={[
          breadcrumbSchema([
            { name: 'Home', url: SITE_URL },
            { name: 'Blog', url: `${SITE_URL}/blog` },
            { name: category.label, url: `${SITE_URL}/blog/category/${category.slug}` },
          ]),
          itemListSchema(
            `${category.label} KDP guides`,
            allPosts.map((post) => ({
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
            <Link href="/blog" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-primary">
              <ArrowLeft className="h-4 w-4" />
              Back to all KDP guides
            </Link>
            <div className="flex max-w-4xl items-start gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                <Icon className="h-6 w-6" />
              </span>
              <div>
                <p className="ds-eyebrow">KDP problem category</p>
                <h1 className="ds-heading mt-3 text-balance text-[clamp(2.15rem,5vw,4rem)]">{category.label}</h1>
                <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">{category.seoIntro}</p>
              </div>
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6" aria-labelledby="category-posts-heading">
          <div className="mb-8">
            <h2 id="category-posts-heading" className="text-3xl font-bold tracking-tight text-foreground">
              {allPosts.length ? `${category.label} guides` : `${category.label} guides are coming soon`}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{category.description}</p>
          </div>
          {posts.length ? (
            <>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {posts.map((post) => (
                  <BlogCard key={post.slug} post={post} />
                ))}
              </div>
              <BlogPagination currentPage={1} totalPages={totalPages} baseUrl={`/blog/category/${category.slug}`} />
            </>
          ) : (
            <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
              <p className="text-sm font-bold leading-6 text-foreground">New KDP formatting guides are coming soon.</p>
            </div>
          )}
        </section>

        <BlogCTA />
      </main>
    </>
  );
}
