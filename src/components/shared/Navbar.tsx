'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Shield, Box, HomeIcon } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: HomeIcon },
  { href: '/setup', label: 'Smart Setup', icon: BookOpen },
  { href: '/checker', label: 'Checker', icon: Shield },
  { href: '/preview', label: '3D Preview', icon: Box },
] as const;

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <div className="w-7 h-7 rounded-lg bg-white/[0.08] flex items-center justify-center">
            <BookOpen className="w-3.5 h-3.5 text-white/70" />
          </div>
          <span className="text-sm font-semibold text-white/80 tracking-tight hidden sm:block">KDPPreflight</span>
        </Link>
        <div className="flex items-center gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive(href)
                  ? 'bg-white/[0.08] text-white/80'
                  : 'text-white/30 hover:text-white/50 hover:bg-white/[0.04]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
