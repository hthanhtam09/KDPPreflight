import { ArticleCallout } from '@/components/blog/ArticleCallout'
import { ArticleChecklist } from '@/components/blog/ArticleChecklist'
import { ArticleDiagram } from '@/components/blog/ArticleDiagram'
import { ArticleFAQ } from '@/components/blog/ArticleFAQ'
import { BlogCTA } from '@/components/blog/BlogCTA'
import { BlogJumpLinks } from '@/components/blog/BlogJumpLinks'
import { BlogPostVisual } from '@/components/blog/BlogPostVisual'
import { BlogReadingProgress } from '@/components/blog/BlogReadingProgress'
import { BlogStickySidebar } from '@/components/blog/BlogStickySidebar'
import { MobileTocSheet } from '@/components/blog/MobileTocSheet'
import { RelatedArticles } from '@/components/blog/RelatedArticles'
import { TableOfContents } from '@/components/blog/TableOfContents'
import { HelpfulFeedback } from '@/components/feedback/HelpfulFeedback'
import { JsonLd } from '@/components/seo/JsonLd'
import {
  formatBlogDate,
  getAllBlogSlugs,
  getBlogCategory,
  getBlogPost,
  getRelatedPosts,
  getTableOfContents,
  slugifyHeading,
} from '@/lib/blog'
import { getBlogPostMetadata } from '@/lib/blog/metadata'
import { getArticleVisualLayout } from '@/lib/blog/visual-layout'
import { articleSchema, blogPostingSchema, breadcrumbSchema, faqSchema, howToSchema, SITE_URL } from '@/lib/schema'
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, Clock, ExternalLink } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Fragment } from 'react'
import type React from 'react'
import ReactMarkdown from 'react-markdown'

interface Props {
  params: Promise<{ slug: string }>
}

export const dynamicParams = false

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) return {}

  return getBlogPostMetadata(post)
}

export function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }))
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) notFound()

  const toc = getTableOfContents(post.content)
  const relatedPosts = getRelatedPosts(post)
  const relatedTools = post.relatedTools
  const category = getBlogCategory(post.category)
  const visualLayout = getArticleVisualLayout(post)
  const articleSections = splitArticleByH2(post.content)

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
          articleSchema({
            title: post.title,
            description: post.description,
            slug: post.slug,
            publishedAt: post.publishedAt,
            modifiedAt: post.updatedAt,
            keywords: post.keywords,
          }),
          breadcrumbSchema([
            { name: 'Home', url: SITE_URL },
            { name: 'Blog', url: `${SITE_URL}/blog` },
            { name: category.label, url: `${SITE_URL}/blog/category/${category.slug}` },
            { name: post.title, url: `${SITE_URL}/blog/${slug}` },
          ]),
          ...(post.howTo ? [howToSchema(post.howTo)] : []),
          ...(post.faqs.length ? [faqSchema(post.faqs)] : []),
        ]}
      />

      <main>
        <header className="border-b border-border bg-surface/30">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
            <nav aria-label="Breadcrumb" className="mb-8">
              <ol className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <li>
                  <Link href="/" className="hover:text-primary">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link href="/blog" className="hover:text-primary">
                    Blog
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link href={`/blog/category/${category.slug}`} className="hover:text-primary">
                    {category.label}
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="max-w-[18rem] truncate font-semibold text-foreground">
                  {post.title}
                </li>
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
              <h1 className="ds-heading text-balance text-[clamp(2.15rem,5vw,4.35rem)]">{post.title}</h1>
              <p className="mt-6 max-w-3xl text-pretty text-lg leading-8 text-muted-foreground">{post.excerpt}</p>
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
            <BlogStickySidebar side="left" width={240}>
              <RelatedArticles posts={relatedPosts} />
              {post.relatedGuides.length > 0 && (
                <section aria-labelledby="related-guides-heading">
                  <h2
                    id="related-guides-heading"
                    className="text-sm font-bold uppercase tracking-[0.14em] text-muted-foreground"
                  >
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
            </BlogStickySidebar>
          </aside>

          <article id="blog-article-content" className="order-2 min-w-0 self-start">
            <ArticleCallout variant="tip" title="Quick answer">
              {post.shortAnswer}
            </ArticleCallout>

            {visualLayout.diagramsBySlot.afterQuickAnswer.map((diagram) => (
              <ArticleDiagram key={`quick-answer-${diagram}`} type={diagram} />
            ))}

            <BlogJumpLinks items={toc} />

            {articleSections.intro ? (
              <div className="blog-article">
                {renderMarkdownWithTables(articleSections.intro)}
              </div>
            ) : null}

            {visualLayout.diagramsBySlot.afterIntro.map((diagram) => (
              <ArticleDiagram key={`intro-${diagram}`} type={diagram} />
            ))}

            {articleSections.sections.map((section, index) => {
              const sectionIndex = index + 1
              const diagrams = visualLayout.diagramsBySlot.afterSection[sectionIndex] ?? []

              return (
                <Fragment key={`${section.heading}-${sectionIndex}`}>
                  <div className="blog-article">
                    {renderMarkdownWithTables(section.content)}
                  </div>
                  {diagrams.map((diagram) => (
                    <ArticleDiagram key={`${sectionIndex}-${diagram}`} type={diagram} />
                  ))}
                </Fragment>
              )
            })}

            <ArticleChecklist items={post.checklist} />

            <section
              className="mt-12 rounded-2xl border border-border bg-card p-5 shadow-soft"
              aria-labelledby="summary-heading"
            >
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
            </footer>
          </article>

          <aside className="order-1 hidden self-start lg:order-3 lg:block">
            <BlogStickySidebar side="right" width={260} scrollable={false}>
              <TableOfContents items={toc} />
            </BlogStickySidebar>
          </aside>
        </div>

        <MobileTocSheet items={toc} />

        <BlogCTA title="Check your KDP cover before uploading" />
      </main>
    </>
  )
}

const markdownComponents = {
  h2: ({ children }: { children?: React.ReactNode }) => {
    const text = childrenToText(children)
    return (
      <h2 id={slugifyHeading(text)} className="scroll-mt-28">
        {children}
      </h2>
    )
  },
  h3: ({ children }: { children?: React.ReactNode }) => {
    const text = childrenToText(children)
    return (
      <h3 id={slugifyHeading(text)} className="scroll-mt-28">
        {children}
      </h3>
    )
  },
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => {
    const url = href ?? '#'
    if (url.startsWith('http')) {
      return (
        <a href={url} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      )
    }
    return <Link href={url}>{children}</Link>
  },
}

type ArticleContentSection = {
  heading: string
  content: string
}

function splitArticleByH2(content: string): { intro: string; sections: ArticleContentSection[] } {
  const matches = [...content.matchAll(/^##\s+(.+)$/gm)]
  if (!matches.length) return { intro: content, sections: [] }

  const intro = content.slice(0, matches[0].index).trim()
  const sections = matches.map((match, index) => {
    const start = match.index ?? 0
    const end = matches[index + 1]?.index ?? content.length

    return {
      heading: match[1].replace(/\*\*/g, '').trim(),
      content: content.slice(start, end).trim(),
    }
  })

  return { intro, sections }
}

function renderMarkdownWithTables(content: string): React.ReactNode[] {
  return splitMarkdownTables(content).map((segment, index) => {
    if (segment.type === 'table') return <MarkdownTable key={`table-${index}`} value={segment.value} />
    return (
      <ReactMarkdown key={`markdown-${index}`} components={markdownComponents}>
        {segment.value}
      </ReactMarkdown>
    )
  })
}

type MarkdownSegment = {
  type: 'markdown' | 'table'
  value: string
}

function splitMarkdownTables(content: string): MarkdownSegment[] {
  const lines = content.split('\n')
  const segments: MarkdownSegment[] = []
  let markdownBuffer: string[] = []
  let index = 0

  while (index < lines.length) {
    const tableMatch = getMarkdownTableAt(lines, index)
    if (tableMatch) {
      if (markdownBuffer.length) {
        segments.push({ type: 'markdown', value: markdownBuffer.join('\n') })
        markdownBuffer = []
      }

      segments.push({ type: 'table', value: tableMatch.lines.join('\n') })
      index = tableMatch.nextIndex
      continue
    }

    markdownBuffer.push(lines[index])
    index += 1
  }

  if (markdownBuffer.length) segments.push({ type: 'markdown', value: markdownBuffer.join('\n') })
  return segments
}

function getMarkdownTableAt(lines: string[], index: number): { lines: string[]; nextIndex: number } | null {
  const header = lines[index]
  if (!header || !isMarkdownTableRow(header)) return null

  const separatorIndex = nextNonBlankLineIndex(lines, index + 1)
  const separator = lines[separatorIndex]
  if (separatorIndex === -1 || !separator || !isMarkdownTableSeparator(separator)) return null

  const tableLines = [header, separator]
  let cursor = separatorIndex + 1

  while (cursor < lines.length) {
    const nextIndex = nextNonBlankLineIndex(lines, cursor)
    const row = lines[nextIndex]

    if (nextIndex === -1 || !row || !isMarkdownTableRow(row)) break
    tableLines.push(row)
    cursor = nextIndex + 1
  }

  return { lines: tableLines, nextIndex: cursor }
}

function nextNonBlankLineIndex(lines: string[], startIndex: number): number {
  for (let index = startIndex; index < lines.length; index += 1) {
    if (lines[index].trim()) return index
  }
  return -1
}

function isMarkdownTableRow(line: string): boolean {
  const trimmed = line.trim()
  return trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.split('|').length >= 4
}

function isMarkdownTableSeparator(line: string): boolean {
  const cells = parseMarkdownTableRow(line)
  return cells.length >= 2 && cells.every((cell) => /^:?-{3,}:?$/.test(cell))
}

function MarkdownTable({ value }: { value: string }) {
  const rows = value
    .trim()
    .split('\n')
    .filter((line) => !isMarkdownTableSeparator(line))
    .map(parseMarkdownTableRow)

  const [headers, ...bodyRows] = rows
  if (!headers?.length) return null

  return (
    <div className="my-8 overflow-hidden rounded-xl border border-border bg-card shadow-soft">
      <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] border-collapse text-left text-sm leading-6">
        <thead className="border-b border-border bg-surface/70 text-foreground">
          <tr>
            {headers.map((header, index) => (
              <th
                key={header}
                scope="col"
                className={`px-4 py-3 text-[0.78rem] font-extrabold uppercase tracking-[0.08em] text-foreground sm:px-5 ${
                  index === 1 ? 'w-[32%]' : ''
                }`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/80">
          {bodyRows.map((row, rowIndex) => (
            <tr
              key={`${row.join('-')}-${rowIndex}`}
              className="text-muted-foreground transition-colors odd:bg-background/35 hover:bg-primary/5"
            >
              {headers.map((_, cellIndex) => (
                <td
                  key={`${rowIndex}-${cellIndex}`}
                  className={`px-4 py-4 align-middle text-[0.95rem] sm:px-5 ${
                    cellIndex === 0 ? 'font-semibold text-foreground/85' : ''
                  } ${cellIndex === 1 ? 'font-mono text-[0.9rem] text-foreground/75' : ''}`}
                >
                  {row[cellIndex] ?? ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  )
}

function parseMarkdownTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim())
}

function childrenToText(children: React.ReactNode): string {
  if (typeof children === 'string') return children
  if (typeof children === 'number') return String(children)
  if (Array.isArray(children)) return children.map(childrenToText).join('')
  return ''
}
