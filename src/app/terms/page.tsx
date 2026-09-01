import type { Metadata } from 'next'
import Link from 'next/link'
import { generatePageMetadata, SITE_NAME } from '@/lib/seo'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbSchema } from '@/lib/schema'

export const metadata: Metadata = generatePageMetadata({
  title: 'Terms of Service',
  description: 'Terms of Service for KDPPreflight, a free browser-based Amazon KDP preflight validation tool.',
  path: '/terms',
})

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-lg font-bold tracking-[-0.01em] text-foreground">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  )
}

export default function TermsPage() {
  return (
    <>
      <JsonLd
        id="terms-breadcrumb"
        data={breadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Terms of Service', url: '/terms' },
        ])}
      />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="text-[clamp(28px,5vw,40px)] font-bold leading-[1.12] tracking-[-0.03em] text-foreground">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: September 1, 2026</p>

        <Section title="Acceptance of Terms">
          <p>
            By accessing or using {SITE_NAME} ("the Site"), you agree to be bound by these Terms of Service. If you
            do not agree, please do not use the Site.
          </p>
        </Section>

        <Section title="Description of Service">
          <p>
            {SITE_NAME} provides free, browser-based tools that help self-publishers check cover and manuscript PDFs
            against Amazon KDP formatting requirements (bleed, trim size, spine width, safe area, and related
            dimensions) before uploading to Amazon Kindle Direct Publishing. All file analysis happens locally in
            your browser; no files are uploaded to our servers.
          </p>
        </Section>

        <Section title="No Affiliation With Amazon">
          <p>
            {SITE_NAME} is an independent tool and is not affiliated with, endorsed by, or sponsored by Amazon.com,
            Inc. or Kindle Direct Publishing. "Amazon KDP" and "Kindle Direct Publishing" are trademarks of
            Amazon.com, Inc. or its affiliates.
          </p>
        </Section>

        <Section title="No Warranty / Use at Your Own Risk">
          <p>
            The tools on this Site are provided "as is" and "as available," without warranties of any kind, express
            or implied. While we aim for accuracy, {SITE_NAME} does not guarantee that a file passing our checks will
            be accepted by Amazon KDP, nor that a file flagged by our checks will necessarily be rejected. Amazon KDP
            is the final authority on file acceptance. You are responsible for verifying your files against
            Amazon&rsquo;s official requirements before publishing.
          </p>
        </Section>

        <Section title="Limitation of Liability">
          <p>
            To the fullest extent permitted by law, {SITE_NAME} and its operators shall not be liable for any
            indirect, incidental, special, or consequential damages, including lost sales, lost profits, or printing
            costs, arising from your use of or reliance on the Site or its tools.
          </p>
        </Section>

        <Section title="Acceptable Use">
          <p>
            You agree not to misuse the Site, including attempting to disrupt its operation, reverse-engineer its
            client-side tools for malicious purposes, or use it to process files you do not have the right to use.
          </p>
        </Section>

        <Section title="Advertising">
          <p>
            The Site may display third-party advertisements, including those served through Google AdSense. We are
            not responsible for the content of third-party advertisements or the sites they link to.
          </p>
        </Section>

        <Section title="Intellectual Property">
          <p>
            All content on the Site — including text, design, and branding — is the property of {SITE_NAME} unless
            otherwise noted, and may not be reproduced without permission.
          </p>
        </Section>

        <Section title="Changes to These Terms">
          <p>
            We may update these Terms from time to time. Continued use of the Site after changes are posted
            constitutes acceptance of the updated Terms.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions about these Terms can be sent through our{' '}
            <Link href="/contact" className="text-primary hover:underline">
              Contact page
            </Link>
            .
          </p>
        </Section>
      </main>
    </>
  )
}
