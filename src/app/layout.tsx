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
    default: "KDPPreflight — KDP Cover Checker, Bleed Checker, Trim Size & 3D Preview",
    template: "%s — KDPPreflight",
  },
  description:
    "KDP rejected your upload? Fix it before it happens. Check KDP cover size, bleed, trim, spine width, and margins. Preview your KDP paperback or hardcover book in realistic 3D. Free, privacy-first, local processing.",
  keywords: [
    "KDP cover checker",
    "KDP bleed checker",
    "KDP trim size",
    "KDP manuscript checker",
    "KDP spine calculator",
    "KDP preview tool",
    "Amazon KDP cover size",
    "KDP paperback cover template",
    "KDP PDF checker",
    "KDP book preview",
    "Amazon KDP formatting tool",
    "KDP upload errors",
    "KDP 3D book preview",
    "KDP safe area",
    "KDP margin checker",
  ],
  authors: [{ name: "KDPPreflight" }],
  alternates: {
    canonical: "https://kdppreflight.app",
  },
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "KDPPreflight — Fix KDP Upload Errors Before They Happen",
    description:
      "Check KDP cover size, bleed, trim, spine width, margins, and preview your book in realistic 3D. Privacy-first, local processing. Free tool for Amazon KDP creators.",
    url: "https://kdppreflight.app",
    siteName: "KDPPreflight",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "KDPPreflight — KDP Cover Checker & 3D Book Preview",
    description:
      "Validate KDP files before upload. Check bleed, trim, spine, margins. Preview in 3D. Local processing — no file storage.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
