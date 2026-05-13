import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
    default: "KDPPreflight — KDP Formatter, Checker, Bleed Tool and 3D Preview",
    template: "%s — KDPPreflight",
  },
  description: "Catch KDP mistakes before Amazon does. Validate covers, manuscripts, bleed, trim size, spine width, DPI, and preview paperback or hardcover books in realistic 3D.",
  keywords: ["KDP formatter", "KDP preview tool", "KDP bleed checker", "KDP cover checker", "KDP manuscript checker", "KDP trim size tool", "KDP book preview", "KDP paperback preview", "KDP hardcover preview", "KDP upload errors", "Amazon KDP formatting tool"],
  authors: [{ name: "KDPPreflight" }],
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "KDPPreflight — Catch KDP Mistakes Before Amazon Does",
    description: "A privacy-first KDP formatter, cover checker, manuscript checker, bleed checker, trim size tool, and realistic 3D book preview.",
    url: "/",
    siteName: "KDPPreflight",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KDPPreflight — KDP Formatter and 3D Preview Tool",
    description: "Validate KDP files before upload with local-first checks and realistic 3D previews.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a0f] text-white`}
      >
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
