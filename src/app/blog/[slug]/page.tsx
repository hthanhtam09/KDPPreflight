import type { Metadata } from 'next';
import type React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, Clock, ExternalLink } from 'lucide-react';
import { ArticleChecklist } from '@/components/blog/ArticleChecklist';
import { ArticleCallout } from '@/components/blog/ArticleCallout';
import { ArticleDiagram } from '@/components/blog/ArticleDiagram';
import { ArticleFAQ } from '@/components/blog/ArticleFAQ';
import { BlogCTA } from '@/components/blog/BlogCTA';
import { BlogJumpLinks } from '@/components/blog/BlogJumpLinks';
import { BlogPostVisual } from '@/components/blog/BlogPostVisual';
import { BlogReadingProgress } from '@/components/blog/BlogReadingProgress';
import { FloatingRelatedSidebar } from '@/components/blog/FloatingRelatedSidebar';
import { MobileTocSheet } from '@/components/blog/MobileTocSheet';
import { RelatedArticles } from '@/components/blog/RelatedArticles';
import { TableOfContents } from '@/components/blog/TableOfContents';
import { FeatureFeedback } from '@/components/feedback/FeatureFeedback';
import { HelpfulFeedback } from '@/components/feedback/HelpfulFeedback';
import { JsonLd } from '@/components/seo/JsonLd';
import {
  formatBlogDate,
  getAllBlogSlugs,
  getBlogPost,
  getBlogCategory,
  getRelatedPosts,
  getTableOfContents,
  slugifyHeading,
} from '@/lib/blog';
import { getBlogPostMetadata } from '@/lib/blog/metadata';
import { blogPostingSchema, breadcrumbSchema, faqSchema, SITE_URL } from '@/lib/schema';

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};

  return getBlogPostMetadata(post);
}

export function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const toc = getTableOfContents(post.content);
  const relatedPosts = getRelatedPosts(post);
  const relatedTools = post.relatedTools;
  const category = getBlogCategory(post.category);

  return (
    <>
      <BlogReadingProgress articleId="blog-article-content" />
      <JsonLd
        id={`blog-${slug}-schema`}
        data={[
          blogPostingSchema({
            title: post.title,
            description: post.description,
            slug: post.slug,
            publishedAt: post.publishedAt,
            modifiedAt: post.updatedAt,
            keywords: post.keywords,
            authorName: post.author,
          }),
          breadcrumbSchema([
            { name: 'Home', url: SITE_URL },
            { name: 'Blog', url: `${SITE_URL}/blog` },
            { name: category.label, url: `${SITE_URL}/blog/category/${category.slug}` },
            { name: post.title, url: `${SITE_URL}/blog/${slug}` },
          ]),
          ...(post.faqs.length ? [faqSchema(post.faqs)] : []),
        ]}
      />

      <main>
        <header className="border-b border-border bg-surface/30">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
            <nav aria-label="Breadcrumb" className="mb-8">
              <ol className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <li><Link href="/" className="hover:text-primary">Home</Link></li>
                <li aria-hidden="true">/</li>
                <li><Link href="/blog" className="hover:text-primary">Blog</Link></li>
                <li aria-hidden="true">/</li>
                <li><Link href={`/blog/category/${category.slug}`} className="hover:text-primary">{category.label}</Link></li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="max-w-[18rem] truncate font-semibold text-foreground">{post.title}</li>
              </ol>
            </nav>

            <Link
              href="/blog"
              className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              All KDP guides
            </Link>

            <div className="max-w-4xl">
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-primary">
                  {category.label}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {post.readingTime}
                </span>
              </div>
              <h1 className="ds-heading text-balance text-[clamp(2.15rem,5vw,4.35rem)]">
                {post.title}
              </h1>
              <p className="mt-6 max-w-3xl text-pretty text-lg leading-8 text-muted-foreground">
                {post.excerpt}
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{post.author}</span>
                <span aria-hidden="true">/</span>
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-4 w-4" />
                  Updated {formatBlogDate(post.updatedAt ?? post.publishedAt)}
                </span>
              </div>
            </div>

            <div className="mt-10 max-w-5xl">
              <BlogPostVisual postSlug={post.slug} category={category} variant="article" />
            </div>
          </div>
        </header>

        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[240px_minmax(0,760px)_260px] lg:py-14">
          <aside className="order-3 self-start lg:order-1">
            <FloatingRelatedSidebar>
              <RelatedArticles posts={relatedPosts} />
              {post.relatedGuides.length > 0 && (
                <section aria-labelledby="related-guides-heading">
                  <h2 id="related-guides-heading" className="text-sm font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    Related KDP pages
                  </h2>
                  <div className="mt-4 grid gap-2">
                    {post.relatedGuides.map((guide) => (
                      <Link
                        key={guide.href}
                        href={guide.href}
                        className="inline-flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
                      >
                        {guide.label}
                        <ArrowRight className="h-3.5 w-3.5 text-primary" />
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </FloatingRelatedSidebar>
          </aside>

          <article id="blog-article-content" className="order-2 min-w-0 self-start">
            <ArticleCallout variant="tip" title="Quick answer">
              {post.shortAnswer}
            </ArticleCallout>

            <BlogJumpLinks items={toc} />

            {post.diagrams.slice(0, 2).map((diagram) => (
              <ArticleDiagram key={diagram} type={diagram} />
            ))}

            <div className="blog-article">
              <ReactMarkdown components={markdownComponents}>{post.content}</ReactMarkdown>
            </div>

            {post.diagrams.slice(2).map((diagram) => (
              <ArticleDiagram key={diagram} type={diagram} />
            ))}

            <ArticleChecklist items={post.checklist} />

            <section className="mt-12 rounded-2xl border border-border bg-card p-5 shadow-soft" aria-labelledby="summary-heading">
              <h2 id="summary-heading" className="text-2xl font-bold tracking-[-0.02em] text-foreground">
                Summary
              </h2>
              <ul className="mt-4 grid gap-3">
                {post.summary.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-muted-foreground">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-success" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <ArticleFAQ items={post.faqs} />

            <footer className="mt-12 space-y-8 border-t border-border pt-8">
              <section aria-labelledby="tools-heading">
                <h2 id="tools-heading" className="text-2xl font-bold tracking-[-0.02em] text-foreground">
                  Related KDP tools
                </h2>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {relatedTools.map((tool) => (
                    <Link
                      key={tool.href}
                      href={tool.href}
                      className="group rounded-2xl border border-border bg-card p-4 shadow-soft transition hover:-translate-y-0.5 hover:border-primary/30"
                    >
                      <span className="flex items-center justify-between gap-3 font-bold text-foreground group-hover:text-primary">
                        {tool.label}
                        <ExternalLink className="h-4 w-4" />
                      </span>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{tool.description}</p>
                    </Link>
                  ))}
                </div>
              </section>

              <HelpfulFeedback pageSlug={post.slug} pageTitle={post.title} />
              <FeatureFeedback context={post.title} compact />
            </footer>
          </article>

          <aside className="order-1 hidden self-start lg:order-3 lg:block">
            <TableOfContents items={toc} />
          </aside>
        </div>

        <MobileTocSheet items={toc} />

        <BlogCTA title="Check your KDP cover before uploading" />
      </main>
    </>
  );
}

const markdownComponents = {
  h2: ({ children }: { children?: React.ReactNode }) => {
    const text = childrenToText(children);
    return (
      <h2 id={slugifyHeading(text)} className="scroll-mt-28">
        {children}
      </h2>
    );
  },
  h3: ({ children }: { children?: React.ReactNode }) => {
    const text = childrenToText(children);
    return (
      <h3 id={slugifyHeading(text)} className="scroll-mt-28">
        {children}
      </h3>
    );
  },
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
    <Link href={href ?? '#'}>{children}</Link>
  ),
};

function childrenToText(children: React.ReactNode): string {
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(childrenToText).join('');
  return '';
}
