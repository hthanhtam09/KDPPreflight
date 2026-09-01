import type { Metadata } from 'next'
import { Mail } from 'lucide-react'
import { generatePageMetadata, SITE_NAME } from '@/lib/seo'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbSchema } from '@/lib/schema'

const CONTACT_EMAIL = 'contact@kdppreflight.com'

export const metadata: Metadata = generatePageMetadata({
  title: 'Contact Us',
  description: `Get in touch with the ${SITE_NAME} team — questions, feedback, bug reports, or partnership inquiries.`,
  path: '/contact',
})

export default function ContactPage() {
  return (
    <>
      <JsonLd
        id="contact-breadcrumb"
        data={breadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Contact', url: '/contact' },
        ])}
      />
      <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <p className="mb-4 text-[11px] font-extrabold uppercase tracking-[0.18em] text-primary">Get in touch</p>
        <h1 className="text-[clamp(28px,5vw,40px)] font-bold leading-[1.12] tracking-[-0.03em] text-foreground">
          Contact {SITE_NAME}
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
          Have a question about a check result, found a bug, or want to suggest a new KDP formatting tool? We read
          every message.
        </p>

        <div className="mt-10 rounded-2xl border border-border bg-background/60 p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Mail className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">Email us</p>
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-sm text-primary hover:underline">
                {CONTACT_EMAIL}
              </a>
            </div>
          </div>
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
            We typically respond within 2–3 business days. For fastest help with a specific file issue, please
            describe which tool you used (Cover Checker, Bleed Checker, Spine Width Calculator, or Trim Size
            Calculator) and the exact error or dimensions shown.
          </p>
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          {SITE_NAME} is not affiliated with Amazon or Kindle Direct Publishing. For account, order, or royalty
          issues, please contact{' '}
          <a
            href="https://kdp.amazon.com/en_US/help/contact-us"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Amazon KDP Support
          </a>{' '}
          directly.
        </p>
      </main>
    </>
  )
}
