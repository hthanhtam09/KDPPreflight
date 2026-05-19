import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { BlogCTA } from '@/components/blog/BlogCTA';
import { BlogHero } from '@/components/blog/BlogHero';
import { BlogIndexExperience } from '@/components/blog/BlogIndexExperience';
import { BlogPagination } from '@/components/blog/BlogPagination';
import { FeaturedPostCard } from '@/components/blog/FeaturedPostCard';
import { JsonLd } from '@/components/seo/JsonLd';
import { blogCategories, blogPosts, getFeaturedPost, topicClusters } from '@/lib/blog';
import { paginateItems } from '@/lib/blog/pagination';
import { generatePageMetadata } from '@/lib/seo';
import { breadcrumbSchema, itemListSchema, SITE_URL } from '@/lib/schema';

export const metadata: Metadata = generatePageMetadata({
  title: 'KDP Preflight Blog | Amazon KDP Cover, Bleed, Trim & Spine Guides',
  description:
    'Fix KDP cover problems before Amazon rejects your upload with practical guides for bleed, printable area errors, spine width, safe area, Canva, Photoshop, and PDF export settings.',
  path: '/blog',
  keywords: [
    'KDP Preflight Blog',
    'Amazon KDP guides',
    'KDP cover issues',
    'KDP bleed errors',
    'KDP trim size problems',
    'KDP spine width mistakes',
  ],
});

export default function BlogIndexPage() {
  const featuredPost = getFeaturedPost();
  const { items: gridPosts, totalPages } = paginateItems(blogPosts, 1);

  return (
    <>
      <JsonLd
        id="blog-index-schema"
        data={[
          breadcrumbSchema([
            { name: 'Home', url: SITE_URL },
            { name: 'Blog', url: `${SITE_URL}/blog` },
          ]),
          itemListSchema(
            'KDP Preflight Blog Guides',
            blogPosts.map((post) => ({
              name: post.title,
              url: `${SITE_URL}/blog/${post.slug}`,
              description: post.description,
            })),
          ),
        ]}
      />

      <BlogHero />

      <main>
        {featuredPost && (
          <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6" aria-labelledby="featured-guide-heading">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="ds-eyebrow">Start here</p>
                <h2 id="featured-guide-heading" className="mt-3 text-3xl font-bold tracking-[-0.025em] text-foreground">
                  Featured KDP guide
                </h2>
              </div>
              <Link
                href={`/blog/${featuredPost.slug}`}
                className="hidden items-center gap-2 text-sm font-bold text-primary transition hover:translate-x-1 sm:inline-flex"
              >
                Read guide
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <FeaturedPostCard post={featuredPost} />
          </section>
        )}

        <BlogIndexExperience
          posts={gridPosts}
          footer={<BlogPagination currentPage={1} totalPages={totalPages} baseUrl="/blog" />}
        />

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6" aria-labelledby="category-clusters-heading">
          <div className="mb-8 max-w-3xl">
            <p className="ds-eyebrow">Problem filters</p>
            <h2 id="category-clusters-heading" className="mt-3 text-3xl font-bold tracking-[-0.025em] text-foreground">
              KDP problem categories
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Each category is organized around a real KDP author problem, not a generic publishing topic.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {blogCategories.map((category) => {
              const Icon = category.icon;
              const count = blogPosts.filter((post) => post.category === category.slug).length;

              return (
                <Link
                  key={category.slug}
                  href={`/blog/category/${category.slug}`}
                  className="group flex flex-col rounded-2xl border border-border bg-card p-5 shadow-card transition hover:-translate-y-0.5 hover:border-primary/30"
                >
                  <div className="flex flex-1 gap-3">
                    <span className="mt-0.5 grid size-11 shrink-0 self-start place-items-center rounded-xl border-2 border-primary/25 bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="flex flex-1 flex-col">
                      <h3 className="font-bold text-foreground group-hover:text-primary">{category.label}</h3>
                      <p className="mt-1 flex-1 text-sm leading-6 text-muted-foreground">{category.description}</p>
                      <span className="mt-3 inline-flex text-xs font-bold uppercase tracking-[0.14em] text-primary">
                        {count ? `${count} guide${count === 1 ? '' : 's'}` : 'Coming next'}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {topicClusters.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6" aria-labelledby="topic-clusters-heading">
            <div className="mb-8 max-w-3xl">
              <p className="ds-eyebrow">SEO topic clusters</p>
              <h2 id="topic-clusters-heading" className="mt-3 text-3xl font-bold tracking-[-0.025em] text-foreground">
                KDP knowledge paths
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Follow focused paths from guide to calculator to checker so every KDP publishing problem has a clear next step.
              </p>
            </div>
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
