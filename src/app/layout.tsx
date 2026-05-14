import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/shared/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kdppreflight.app"),
  title: {
    default: "KDPPreflight - KDP Cover Checker, Bleed Checker, Trim Size & Spine Calculator",
    template: "%s - KDPPreflight",
  },
  description:
    "Check KDP files before upload. Scan cover and manuscript PDFs for bleed issues, trim mismatch, spine width errors, margins, low resolution images, and Amazon KDP upload errors. Free, privacy-first, browser-based tool.",
  keywords: [
    "KDP cover checker",
    "KDP bleed checker",
    "KDP trim size calculator",
    "KDP manuscript checker",
    "KDP spine width calculator",
    "KDP preview tool",
    "Amazon KDP cover size",
    "KDP cover dimensions",
    "KDP paperback cover template",
    "KDP PDF checker",
    "KDP book preview",
    "Amazon KDP formatting tool",
    "KDP upload errors",
    "Amazon KDP upload errors",
    "KDP 3D book preview",
    "KDP safe area",
    "KDP margin checker",
    "paperback bleed issue",
    "bleed margin guide",
    "Canva KDP export",
    "Affinity Publisher KDP export",
    "Adobe Illustrator KDP export",
  ],
  authors: [{ name: "KDPPreflight" }],
  alternates: {
    canonical: "https://kdppreflight.app",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "KDPPreflight - Fix KDP Upload Errors Before They Happen",
    description:
      "Scan KDP cover and manuscript PDFs for bleed, trim, spine width, margins, low resolution images, and export mistakes before upload.",
    url: "https://kdppreflight.app",
    siteName: "KDPPreflight",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "KDPPreflight KDP cover checker and bleed checker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KDPPreflight - KDP Cover Checker & Bleed Checker",
    description:
      "Validate KDP files before upload. Check bleed, trim, spine width, margins, and PDF export issues. Local processing, no file storage.",
    images: ["/android-chrome-512x512.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="notranslate" translate="no" suppressHydrationWarning>
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} notranslate antialiased`} translate="no">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="min-h-0 flex-1">{children}</main>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
