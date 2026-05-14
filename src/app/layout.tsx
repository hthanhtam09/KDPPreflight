import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { FeatureFeedback } from '@/components/feedback/FeatureFeedback';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import { SITE_URL, SITE_NAME } from '@/lib/seo';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'KDPPreflight — Free KDP Cover Checker, Bleed Checker & Trim Size Calculator',
    template: `%s | ${SITE_NAME}`,
  },
  description:
    'Free browser-based KDP preflight tool. Check cover bleed, trim size, spine width, margins, and PDF export issues before uploading to Amazon KDP. No file storage. 100% private.',
  keywords: [
    'KDP cover checker',
    'KDP bleed checker',
    'Amazon KDP cover validator',
    'KDP trim size checker',
    'KDP print preview',
    'KDP paperback checker',
    'KDP margin checker',
    'KDP spine width calculator',
    'how to fix KDP bleed',
    'KDP cover upload errors',
    'Amazon KDP trim size guide',
    'KDP safe area checker',
    'KDP cover dimensions',
    'KDP full wrap calculator',
    'KDP cover template validator',
    'KDP manuscript checker',
    'KDP PDF checker',
    'Amazon KDP formatting tool',
    'KDP upload errors',
    'KDP 3D book preview',
    'paperback bleed issue',
    'Canva KDP export',
    'Affinity Publisher KDP export',
    'Adobe Illustrator KDP export',
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: 'Publishing Tools',
  classification: 'Book Publishing / Self-Publishing',
  alternates: {
    canonical: SITE_URL,
  },
  verification: {
    google: 'o9c9vJSryXVfuO9RmeUue6zrAdjLyK_cYF93Dmr3Gkc',
  },
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'KDPPreflight — Fix KDP Upload Errors Before They Happen',
    description:
      'Scan KDP cover and manuscript PDFs for bleed, trim, spine width, margins, low-resolution images, and export mistakes before upload. Free, private, browser-based.',
    url: SITE_URL,
    siteName: SITE_NAME,
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/android-chrome-512x512.png',
        width: 1200,
        height: 630,
        alt: 'KDPPreflight — KDP cover checker, bleed checker, and trim size calculator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KDPPreflight — KDP Cover Checker & Bleed Checker',
    description:
      'Validate KDP files before upload. Check bleed, trim, spine width, margins, and PDF export issues. Local processing — no file storage.',
    images: ['/android-chrome-512x512.png'],
    site: '@kdppreflight',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="notranslate" translate="no" suppressHydrationWarning>
      <head>
        <meta name="google" content="notranslate" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* llms.txt — AI agent discovery (llmstxt.org standard) */}
        <link rel="alternate" type="text/plain" href="/llms.txt" title="LLMs.txt" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} notranslate antialiased`}
        translate="no"
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="min-h-0 flex-1">{children}</main>
            <Footer />
          </div>
          <FeatureFeedback floating />
          <Toaster />
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
