'use client'

import { BookOpen, Box, HomeIcon, Shield } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: HomeIcon },
  { href: '/setup', label: 'Smart Setup', icon: BookOpen },
  { href: '/checker', label: 'Checker', icon: Shield },
  { href: '/preview', label: '3D Preview', icon: Box },
] as const

export default function Navbar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#07090d]/78 backdrop-blur-2xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-200/15 bg-cyan-200/[0.08] shadow-[0_0_30px_rgba(103,232,249,0.08)]">
            <BookOpen className="h-4 w-4 text-cyan-100/85" />
          </div>
          <span className="hidden text-sm font-semibold tracking-tight text-white/88 sm:block">KDPPreflight</span>
        </Link>
        <div className="flex items-center gap-1 rounded-full border border-white/[0.06] bg-white/[0.035] p-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                isActive(href)
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-white/42 hover:bg-white/[0.06] hover:text-white/72'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
