'use client'

import { Logo } from '@/components/shared/Logo'
import { FeatureFeedback } from '@/components/feedback/FeatureFeedback'
import { AnimatePresence, LazyMotion, domAnimation, m } from 'framer-motion'
import { Menu, Moon, Sun, X } from 'lucide-react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/setup', label: 'Setup', tooltip: 'Calculate KDP cover dimensions, bleed, spine width, margins.' },
  { href: '/preview', label: 'Preview', tooltip: 'Inspect paperback or hardcover as a 3D physical object.' },
  { href: '/preflight', label: 'Preflight', tooltip: 'Preflight your KDP print files before upload.' },
  { href: '/blog', label: 'Blog' },
] as const

export default function Navbar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [themeReady, setThemeReady] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setThemeReady(true), 0)
    return () => window.clearTimeout(timer)
  }, [])

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')
  const themeLabel = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'

  return (
    <header className="fixed top-0 left-0 right-0 z-[var(--z-nav)] h-14 border-b border-border/60 bg-surface/95 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl h-full w-full flex items-center justify-between gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8">
        <Logo />

        <div className="hidden items-center gap-2 md:flex lg:gap-3">
          <nav
            className="flex items-center gap-0.5 lg:gap-1 rounded-full border border-border/60 bg-surface/50 p-0.5 shadow-soft backdrop-blur-md"
            aria-label="Main navigation"
          >
            <NavLinks isActive={isActive} />
          </nav>

          <ThemeToggle theme={theme} ready={themeReady} onToggle={toggleTheme} ariaLabel={themeLabel} />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle theme={theme} ready={themeReady} onToggle={toggleTheme} ariaLabel={themeLabel} />

          <button
            onClick={() => setMobileOpen((open) => !open)}
            className="ds-focus flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface/80 text-foreground shadow-soft backdrop-blur-md transition hover:bg-muted/40"
            aria-label="Toggle main navigation"
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
          >
            {mobileOpen ? <X className="h-3.5 w-3.5" /> : <Menu className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      <LazyMotion features={domAnimation}>
        <AnimatePresence>
          {mobileOpen && (
            <m.nav
              id="mobile-navigation"
              aria-label="Main navigation"
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-0 right-0 top-14 rounded-b-2xl border-b border-l border-r border-border bg-surface/95 p-2 shadow-elevated backdrop-blur-3xl md:hidden overflow-y-auto max-h-[calc(100vh-3.5rem)]"
            >
              <div className="grid gap-1">
                <NavLinks isActive={isActive} mobile onNavigate={() => setMobileOpen(false)} />
                <div className="my-1 border-t border-border/50" />
                <div className="px-2 py-1">
                  <FeatureFeedback compact />
                </div>
              </div>
            </m.nav>
          )}
        </AnimatePresence>
      </LazyMotion>
    </header>
  )
}


function ThemeToggle({
  theme,
  ready,
  onToggle,
  ariaLabel,
}: Readonly<{
  theme?: string
  ready: boolean
  onToggle: () => void
  ariaLabel: string
}>) {
  const isLight = ready && theme === 'light'

  return (
    <button
      onClick={onToggle}
      className="ds-focus flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface-glass text-muted-foreground shadow-soft backdrop-blur-xl transition hover:border-primary/30 hover:bg-muted/40 hover:text-foreground"
      aria-label={ready ? ariaLabel : 'Toggle color theme'}
    >
      {isLight ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
    </button>
  )
}

function NavLinks({
  isActive,
  mobile = false,
  onNavigate,
}: {
  isActive: (href: string) => boolean
  mobile?: boolean
  onNavigate?: () => void
}) {
  return NAV_ITEMS.map((item) => {
    const active = isActive(item.href)
    const badge = 'badge' in item ? item.badge : undefined
    const tooltip = 'tooltip' in item ? item.tooltip : undefined

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onNavigate}
        title={tooltip}
        className={`ds-focus relative flex items-center gap-2 font-medium transition-all duration-150 ${mobile
          ? 'h-10 rounded-xl px-4 text-sm'
          : 'h-7 rounded-full px-2.5 text-[11px]'
          } ${active
            ? 'bg-primary text-primary-foreground shadow-soft'
            : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
          }`}
        aria-current={active ? 'page' : undefined}
      >
        <span>{item.label}</span>
      </Link>
    )
  })
}
