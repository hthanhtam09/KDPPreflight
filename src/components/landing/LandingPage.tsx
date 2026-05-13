'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  Box,
  Check,
  FileCheck2,
  LockKeyhole,
  Ruler,
  SearchCheck,
} from 'lucide-react';

const HeroBookScene = dynamic(() => import('./HeroBookScene'), {
  ssr: false,
  loading: () => <div className="relative mx-auto min-h-[420px] h-[clamp(390px,54vw,650px)] w-[min(100%,700px)] overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(244,239,229,0.08),transparent_30%),linear-gradient(145deg,rgba(38,34,27,0.72),rgba(5,7,10,0.92))] shadow-[0_42px_120px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(244,239,229,0.1)]" />,
});

const reveal = {
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-90px' },
  transition: { duration: 0.58, ease: 'easeOut' as const },
};

const painPoints = [
  'Your cover looks perfect, but KDP says the size is wrong.',
  'Your manuscript passes upload, but the printed copy has white edges.',
  'Your spine shifts after export.',
  'You do not know if the issue is the PDF, bleed, trim size, or KDP tolerance.',
];

const helpItems = [
  'Actual detected size',
  'Expected KDP size',
  'Real-world risk level',
  'Exact fix recommendation',
  'Page-by-page preview',
];

const features = [
  {
    title: 'Smart Book Setup',
    kicker: 'Before exporting',
    icon: Ruler,
    href: '/setup',
    description: 'Choose paperback, hardcover, or Kindle specs and see the trim, bleed, spine, gutter, and safe-area rules before you build the file.',
    details: ['KDP trim size tool', 'Spine width calculation', 'Bleed and margin diagrams'],
  },
  {
    title: 'Format Checker',
    kicker: 'Before uploading',
    icon: SearchCheck,
    href: '/checker',
    description: 'Run a KDP cover checker and KDP manuscript checker that reports what was detected, what KDP expects, and how risky the mismatch is.',
    details: ['Cover size checks', 'Manuscript bleed checks', 'Plain-English fixes'],
  },
  {
    title: '3D Book Preview',
    kicker: 'Before ordering proof',
    icon: Box,
    href: '/preview',
    description: 'Inspect the physical feel of the book with a KDP 3D book preview: rotate it, check the spine, open pages, and export preview images.',
    details: ['Paperback preview', 'Hardcover preview', 'Page flipping'],
  },
];

const faqs = [
  ['Is this a KDP cover checker?', 'Yes. KDPPreflight checks cover dimensions, trim fit, bleed, spine width, and common cover export mistakes before you upload to Amazon KDP.'],
  ['Can it check manuscript bleed?', 'Yes. The KDP manuscript checker is designed to flag page size and bleed risks that often create white edges or unexpected print trimming.'],
  ['Does KDPPreflight store my book files?', 'No. Files are processed locally in your browser whenever possible. We do not store manuscripts, covers, or use them for AI training.'],
  ['What does the KDP trim size tool do?', 'It helps you choose supported KDP trim sizes and understand expected dimensions, bleed size, safe areas, and export measurements.'],
  ['Why do KDP upload errors happen?', 'Most errors come from small mismatches: wrong PDF size, missing bleed, unsafe margins, low-resolution artwork, or a cover that does not match page count and paper type.'],
  ['Can I preview my KDP book in 3D?', 'Yes. The preview lets you rotate the book, inspect the cover and spine, open pages, and see the project as a physical paperback or hardcover.'],
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'KDPPreflight',
  applicationCategory: 'DesignApplication',
  operatingSystem: 'Web browser',
  description: 'Amazon KDP formatting tool with a KDP cover checker, KDP manuscript checker, KDP bleed checker, trim size tool, and 3D book preview.',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  featureList: ['KDP cover checker', 'KDP manuscript checker', 'KDP bleed checker', 'KDP trim size tool', 'KDP 3D book preview', 'Amazon KDP formatting tool'],
  mainEntity: faqs.map(([question, answer]) => ({
    '@type': 'Question',
    name: question,
    acceptedAnswer: { '@type': 'Answer', text: answer },
  })),
};

function SectionHeading({ label, title, children }: { label: string; title: string; children: React.ReactNode }) {
  return (
    <motion.div {...reveal} className="mx-auto mb-12 max-w-3xl text-center">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#d7c6a1]/75">{label}</p>
      <h2 className="text-balance text-3xl font-semibold tracking-tight text-[#f4efe5] sm:text-5xl">{title}</h2>
      <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#c8c0b3]/78">{children}</p>
    </motion.div>
  );
}

function IssueExample() {
  return (
    <motion.div
      {...reveal}
      className="relative mx-auto min-h-[460px] max-w-5xl overflow-hidden rounded-[30px] border border-[#d7c6a1]/15 bg-[linear-gradient(180deg,rgba(244,239,229,0.075),rgba(244,239,229,0.025)),#0b0d10] p-[clamp(24px,4vw,40px)] shadow-[0_34px_110px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(244,239,229,0.1)]"
    >
      <div className="relative z-10 flex items-start justify-between gap-5">
        <div>
          <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#d7c6a1]/70">Inspection result</p>
          <h3 className="text-[clamp(28px,4vw,44px)] font-semibold tracking-[-0.03em] text-[#f7f1e7]">Page 2 bleed is incomplete</h3>
        </div>
        <span className="rounded-full border border-amber-300/25 bg-amber-400/10 px-3 py-1.5 text-xs font-bold text-amber-100/90">Warning</span>
      </div>
      <div className="relative z-10 mt-8 grid max-w-[690px] grid-cols-2 gap-3 max-sm:grid-cols-1">
        {[
          ['Actual', '8.625" x 11.25"'],
          ['Expected', '8.75" x 11.25"'],
          ['KDP Risk', 'May upload, print edge risk exists.'],
          ['Fix', 'Export with full bleed enabled on all sides.'],
        ].map(([label, value]) => (
          <div key={label} className="min-h-[116px] rounded-[18px] border border-[#f4efe5]/10 bg-white/[0.035] p-[18px]">
            <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#d7c6a1]/70">{label}</p>
            <strong className="block text-[17px] leading-snug text-[#f4efe5]/90">{value}</strong>
          </div>
        ))}
      </div>
      <div className="absolute bottom-[-30px] right-[clamp(20px,5vw,56px)] h-[330px] w-[min(32vw,300px)] min-w-[220px] -rotate-[5deg] max-sm:relative max-sm:right-auto max-sm:bottom-auto max-sm:mx-auto max-sm:mb-[-70px] max-sm:mt-8 max-sm:w-[220px]" aria-hidden="true">
        <div className="absolute inset-0 rounded-[7px] border border-[#f4efe5]/20 bg-[#f4efe5] shadow-[0_28px_80px_rgba(0,0,0,0.28)]">
          <span className="absolute inset-[18px] border border-dashed border-[#0a0d10]/25" />
          <span className="absolute inset-x-0 top-0 h-6 bg-[#d25642]/25" />
          <span className="absolute inset-x-0 bottom-0 h-6 bg-[#d25642]/25" />
        </div>
        <div className="absolute inset-x-[42px] top-[82px] grid gap-3">
          <i className="block h-[9px] rounded-full bg-[#0a0d10]/15" />
          <i className="block h-[9px] w-[78%] rounded-full bg-[#0a0d10]/15" />
          <i className="block h-[9px] w-[62%] rounded-full bg-[#0a0d10]/15" />
        </div>
      </div>
    </motion.div>
  );
}

export default function LandingPage() {
  return (
    <div className="overflow-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="relative bg-[linear-gradient(115deg,rgba(244,239,229,0.08),transparent_42%),linear-gradient(90deg,rgba(215,198,161,0.065)_1px,transparent_1px),linear-gradient(0deg,rgba(215,198,161,0.045)_1px,transparent_1px),#080a0d] bg-[length:auto,76px_76px,76px_76px,auto] px-4 pb-20 pt-10 sm:px-6 lg:pt-16">
        <div className="mx-auto grid min-h-[calc(100vh-96px)] max-w-7xl items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: 'easeOut' }} className="relative z-10">
            <p className="mb-6 max-w-max border-b border-[#d7c6a1]/25 pb-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#d7c6a1]/80">
              KDPPreflight for paperback, hardcover, and Canva exports
            </p>
            <h1 className="text-balance max-w-4xl text-5xl font-semibold leading-[0.95] tracking-[-0.055em] text-[#f7f1e7] sm:text-7xl">
              Know if your KDP book is ready before you upload.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#d8d0c3]/78">
              Check cover size, manuscript bleed, trim, spine, margins, and preview your book in 3D without guessing what KDP will reject.
            </p>
            <p className="mt-5 max-w-2xl text-sm leading-6 text-[#b6aa9a]/78">
              Files are processed locally in your browser. We do not store your manuscripts or covers.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/checker" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[linear-gradient(180deg,#f8efe0,#d9c8a5)] px-[18px] text-sm font-bold text-[#10100e] shadow-[0_18px_48px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.72)] transition hover:-translate-y-px active:translate-y-px">
                <FileCheck2 className="h-4 w-4" />
                Check My Book
              </Link>
              <Link href="/setup" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#f4efe5]/15 bg-[#f4efe5]/[0.055] px-[18px] text-sm font-bold text-[#f4efe5]/90 shadow-[inset_0_1px_0_rgba(244,239,229,0.08)] transition hover:-translate-y-px active:translate-y-px">
                <BookOpen className="h-4 w-4" />
                Setup Book Specs
              </Link>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.82, delay: 0.12, ease: 'easeOut' }} className="relative">
            <HeroBookScene />
            <div className="absolute bottom-[clamp(14px,4vw,36px)] right-[clamp(12px,4vw,34px)] flex max-w-[min(330px,calc(100%-28px))] items-center justify-between gap-[18px] rounded-[18px] border border-white/15 bg-[#0a0a09]/80 px-4 py-3.5 shadow-[0_20px_70px_rgba(0,0,0,0.3)] backdrop-blur-xl max-sm:left-3.5 max-sm:right-3.5" aria-hidden="true">
              <div>
                <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.16em] text-[#d7c6a1]/85">Live preflight</span>
                <strong className="block text-[13px] leading-snug text-[#f4efe5]/85">Cover, pages, bleed and spine inspected together</strong>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <main>
        <section className="px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <SectionHeading label="What creators run into" title="KDP problems rarely announce themselves clearly.">
              The file can look right in Canva, Preview, or Acrobat and still miss the exact dimensions KDP expects at upload or in print.
            </SectionHeading>
            <div className="grid gap-3 md:grid-cols-2">
              {painPoints.map((point, index) => (
                <motion.article key={point} {...reveal} transition={{ ...reveal.transition, delay: index * 0.05 }} className="min-h-[178px] rounded-3xl border border-[#d7c6a1]/15 bg-[linear-gradient(180deg,rgba(244,239,229,0.055),rgba(244,239,229,0.025)),rgba(255,255,255,0.02)] p-6">
                  <span className="mb-10 block text-xs font-bold tracking-[0.14em] text-[#d7c6a1]/60">0{index + 1}</span>
                  <p className="text-[19px] leading-snug text-[#f4efe5]/90">{point}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-24 sm:px-6">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <motion.div {...reveal} className="sticky top-24">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#d7c6a1]/75">How KDPPreflight helps</p>
              <h2 className="text-balance text-4xl font-semibold tracking-tight text-[#f4efe5] sm:text-5xl">It turns vague upload anxiety into inspected facts.</h2>
              <p className="mt-5 text-base leading-7 text-[#c8c0b3]/78">
                Instead of telling you a file is simply “wrong,” KDPPreflight shows the measurement, expected KDP target, severity, and a fix you can act on.
              </p>
            </motion.div>
            <div className="grid gap-3">
              {helpItems.map((item, index) => (
                <motion.div key={item} {...reveal} transition={{ ...reveal.transition, delay: index * 0.06 }} className="grid min-h-[86px] grid-cols-[64px_1fr] items-center rounded-[20px] border border-[#d7c6a1]/15 bg-[#f4efe5]/[0.04] px-5 py-4">
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <p className="text-xl font-semibold text-[#f4efe5]/90">{item}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <SectionHeading label="The workflow" title="Three focused tools, not a settings maze.">
              Start with book specs, scan your exported files, then inspect the physical book before KDP or a proof copy exposes the mistake.
            </SectionHeading>
            <div className="grid gap-5 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <motion.article key={feature.title} {...reveal} className="group relative min-h-[420px] overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(244,239,229,0.055),rgba(244,239,229,0.02)),rgba(255,255,255,0.035)] p-7 transition duration-200 hover:-translate-y-1 hover:border-[#d7c6a1]/25 hover:shadow-[0_24px_70px_rgba(0,0,0,0.2)] max-sm:min-h-0 max-sm:p-5">
                    <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-[#d7c6a1]/70">{feature.kicker}</p>
                    <Icon className="mb-10 h-5 w-5 text-[#efe2ca]/80" />
                    <h3 className="text-2xl font-semibold text-[#f4efe5]">{feature.title}</h3>
                    <p className="mt-4 text-sm leading-6 text-[#c8c0b3]/76">{feature.description}</p>
                    <div className="mt-8 space-y-3">
                      {feature.details.map((detail) => (
                        <p key={detail} className="flex items-center gap-2 text-sm text-[#efe2ca]/82">
                          <Check className="h-3.5 w-3.5 text-[#d7c6a1]" />
                          {detail}
                        </p>
                      ))}
                    </div>
                    <Link href={feature.href} className="mt-9 inline-flex items-center gap-2 text-sm font-semibold text-[#f4efe5]">
                      Open tool <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </Link>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <SectionHeading label="A real check" title="The result should look like something you can fix.">
              Concrete measurements matter. A useful KDP bleed checker should tell you what happened, not just decorate a warning.
            </SectionHeading>
            <IssueExample />
          </div>
        </section>

        <section className="px-4 py-24 sm:px-6">
          <motion.div {...reveal} className="mx-auto max-w-6xl overflow-hidden rounded-[30px] border border-[#d7c6a1]/15 bg-[linear-gradient(100deg,rgba(215,198,161,0.11),rgba(139,167,159,0.055)_48%),rgba(255,255,255,0.035)] p-[clamp(28px,5vw,48px)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <div className="max-w-3xl">
              <LockKeyhole className="mb-7 h-8 w-8 text-[#efe2ca]" />
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#d7c6a1]/75">Privacy-first by design</p>
              <h2 className="text-balance text-4xl font-semibold tracking-tight text-[#f7f1e7] sm:text-5xl">Your unpublished book stays private.</h2>
              <p className="mt-5 text-base leading-7 text-[#d8d0c3]/78">
                KDP creators upload manuscripts they have not published yet, covers they paid for, and interiors they plan to sell. The product treats those files like private work, not sample data.
              </p>
            </div>
            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {[
                'No manuscript storage',
                'No cover storage',
                'No AI training on your files',
                'Local browser processing whenever possible',
                'Refresh or close the tab and files are removed unless you explicitly save locally',
              ].map((item) => (
                <div key={item} className="flex min-h-[116px] items-end rounded-[18px] border border-[#f4efe5]/10 bg-[#06080b]/35 p-4 text-sm font-semibold leading-snug text-[#f4efe5]/85">{item}</div>
              ))}
            </div>
          </motion.div>
        </section>

        <section className="px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <SectionHeading label="FAQ" title="Questions self-publishers ask after KDP rejects a file.">
              Straight answers for KDP cover checker, KDP manuscript checker, KDP bleed checker, trim size, and preview questions.
            </SectionHeading>
            <div className="grid gap-3 md:grid-cols-2">
              {faqs.map(([question, answer]) => (
                <motion.article key={question} {...reveal} className="min-h-[190px] rounded-[20px] border border-[#f4efe5]/10 bg-[#f4efe5]/[0.035] p-5">
                  <h3 className="text-[17px] font-bold leading-snug text-[#f4efe5]">{question}</h3>
                  <p className="mt-3.5 text-sm leading-relaxed text-[#c8c0b3]/75">{answer}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-28 pt-8 sm:px-6">
          <motion.div {...reveal} className="mx-auto max-w-4xl text-center">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-[#d7c6a1]/75">Before the next upload</p>
            <h2 className="text-balance text-4xl font-semibold tracking-tight text-[#f7f1e7] sm:text-6xl">Check the book while you can still fix it.</h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#c8c0b3]/78">
              Use KDPPreflight as your Amazon KDP formatting tool before the file reaches KDP’s upload screen.
            </p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/checker" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[linear-gradient(180deg,#f8efe0,#d9c8a5)] px-[18px] text-sm font-bold text-[#10100e] shadow-[0_18px_48px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.72)] transition hover:-translate-y-px active:translate-y-px">
                <FileCheck2 className="h-4 w-4" />
                Check My Book
              </Link>
              <Link href="/setup" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#f4efe5]/15 bg-[#f4efe5]/[0.055] px-[18px] text-sm font-bold text-[#f4efe5]/90 shadow-[inset_0_1px_0_rgba(244,239,229,0.08)] transition hover:-translate-y-px active:translate-y-px">
                <BookOpen className="h-4 w-4" />
                Setup Book Specs
              </Link>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
