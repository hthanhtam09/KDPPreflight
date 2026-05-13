'use client'

import { BookOpen, Box, HomeIcon, Moon, Ruler, Shield, Sun } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: HomeIcon },
  { href: '/setup', label: 'Setup', icon: Ruler },
  { href: '/checker', label: 'Checker', icon: Shield },
  { href: '/preview', label: '3D Preview', icon: Box },
] as const

export default function Navbar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav
      className="sticky top-0 z-50 border-b border-border bg-surface-glass backdrop-blur-2xl"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
          aria-label="KDPPreflight home"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 shadow-soft">
            <BookOpen className="h-4 w-4 text-primary" />
          </div>
          <span className="hidden text-sm font-semibold tracking-tight text-foreground/90 sm:block">
            KDPPreflight
          </span>
        </Link>

        {/* Nav + theme toggle */}
        <div className="flex items-center gap-2">
          {/* Nav pill */}
          <div className="flex items-center gap-0.5 rounded-full border border-border bg-secondary/70 p-1 backdrop-blur-sm">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
                  isActive(href)
                    ? 'bg-primary text-primary-foreground shadow-soft'
                    : 'text-muted-foreground hover:bg-surface-elevated hover:text-foreground'
                }`}
                aria-current={isActive(href) ? 'page' : undefined}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}
          </div>

          {/* Theme toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="ds-focus flex h-9 w-9 items-center justify-center rounded-full border border-border bg-secondary/70 text-muted-foreground backdrop-blur-sm transition hover:bg-surface-elevated hover:text-foreground"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
