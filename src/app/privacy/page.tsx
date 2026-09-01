import type { Metadata } from 'next'
import Link from 'next/link'
import { generatePageMetadata, SITE_NAME } from '@/lib/seo'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbSchema } from '@/lib/schema'

export const metadata: Metadata = generatePageMetadata({
  title: 'Privacy Policy',
  description:
    'How KDPPreflight handles your data. Files you upload are processed locally in your browser and are never stored on a server. Read our full privacy policy.',
  path: '/privacy',
})

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-lg font-bold tracking-[-0.01em] text-foreground">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  )
}

export default function PrivacyPage() {
  return (
    <>
      <JsonLd
        id="privacy-breadcrumb"
        data={breadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Privacy Policy', url: '/privacy' },
        ])}
      />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="text-[clamp(28px,5vw,40px)] font-bold leading-[1.12] tracking-[-0.03em] text-foreground">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: September 1, 2026</p>

        <Section title="Overview">
          <p>
            {SITE_NAME} ("we", "us", or "our") operates kdppreflight.com (the "Site"). This Privacy Policy explains
            what information is collected when you use the Site and how it is used.
          </p>
        </Section>

        <Section title="File Processing — Local Only">
          <p>
            The core tools on this Site (KDP Cover Checker, Bleed Checker, Spine Width Calculator, Trim Size
            Calculator, and related utilities) process any PDF or image file you upload entirely within your own
            browser, using client-side JavaScript. Files are never uploaded, transmitted, or stored on our servers or
            any third-party server. When you close or refresh the page, the file and any analysis results are
            discarded.
          </p>
        </Section>

        <Section title="Information We Collect Automatically">
          <p>Like most websites, we automatically collect limited technical information when you visit the Site, including:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>IP address and approximate geographic location</li>
            <li>Browser type, device type, and operating system</li>
            <li>Pages visited, time spent on pages, and referring URL</li>
            <li>General usage and performance data (page load times, error events)</li>
          </ul>
          <p>
            We use this information in aggregate to understand how the Site is used and to improve performance and
            content. We do not attempt to identify individual visitors from this data.
          </p>
        </Section>

        <Section title="Cookies and Similar Technologies">
          <p>
            We and our third-party partners (see below) use cookies, local storage, and similar technologies to
            operate the Site, remember preferences (such as light/dark theme), measure traffic, and — where
            applicable — serve advertising.
          </p>
        </Section>

        <Section title="Advertising — Google AdSense">
          <p>
            This Site may display advertisements served by Google AdSense. Google, as a third-party vendor, uses
            cookies to serve ads based on your prior visits to this and other websites. Google&rsquo;s use of
            advertising cookies enables it and its partners to serve ads based on your visit to this Site and/or
            other sites on the Internet.
          </p>
          <p>
            You may opt out of personalized advertising by visiting{' '}
            <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Google Ads Settings
            </a>
            . You can also opt out of a third-party vendor&rsquo;s use of cookies for personalized advertising by
            visiting{' '}
            <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              www.aboutads.info
            </a>
            .
          </p>
        </Section>

        <Section title="Analytics">
          <p>
            We use privacy-conscious analytics services (Vercel Analytics and Vercel Speed Insights) to measure
            aggregate traffic and page performance. These services do not use cookies to track individuals across
            unrelated websites.
          </p>
        </Section>

        <Section title="Data Sharing">
          <p>
            We do not sell your personal information. We may share aggregated, non-identifying technical data with
            service providers (such as our hosting and advertising partners) solely to operate and improve the Site.
          </p>
        </Section>

        <Section title="Children's Privacy">
          <p>
            The Site is not directed at children under 13, and we do not knowingly collect personal information from
            children under 13.
          </p>
        </Section>

        <Section title="Your Rights">
          <p>
            Depending on your location, you may have the right to access, correct, or delete personal information we
            hold about you, or to object to certain processing. Because we do not require accounts and do not store
            uploaded files, most requests will relate only to automatically collected technical data described above.
            To make a request, contact us using the details on our{' '}
            <Link href="/contact" className="text-primary hover:underline">
              Contact page
            </Link>
            .
          </p>
        </Section>

        <Section title="Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated
            &ldquo;Last updated&rdquo; date.
          </p>
        </Section>

        <Section title="Contact Us">
          <p>
            Questions about this Privacy Policy can be sent through our{' '}
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
