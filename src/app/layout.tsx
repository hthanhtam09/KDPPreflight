import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KDPPreflight — Check Your KDP Book Before Upload",
  description: "Validate dimensions, check bleed & margins, preview your book in realistic 3D. The complete preflight tool for Amazon KDP creators. Free, fast, client-side.",
  keywords: ["KDP cover checker", "KDP bleed checker", "KDP trim size checker", "KDP manuscript checker", "KDP preview tool", "KDP cover template", "Amazon KDP validation", "book formatting"],
  authors: [{ name: "KDPPreflight" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "KDPPreflight — Check Your KDP Book Before Upload",
    description: "Validate dimensions, check bleed & margins, preview your book in realistic 3D.",
    type: "website",
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
        {children}
        <Toaster />
      </body>
    </html>
  );
}
