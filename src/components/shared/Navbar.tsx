'use client'

import { FeatureFeedback } from '@/components/feedback/FeatureFeedback'
import { Logo } from '@/components/shared/Logo'
import { AnimatePresence, LazyMotion, domAnimation, m } from 'framer-motion'
import { Menu, Moon, Sun, X } from 'lucide-react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/setup', label: 'Setup', tooltip: 'Calculate KDP cover dimensions, bleed, spine width, margins.' },
  { href: '/preflight', label: 'Preflight', tooltip: 'Preflight your KDP print files before upload.' },
  { href: '/preview', label: 'Preview', tooltip: 'Inspect paperback or hardcover as a 3D physical object.' },
  { href: '/blog', label: 'Blog' },
] as const

export default function Navbar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [themeReady, setThemeReady] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const timer = globalThis.setTimeout(() => setThemeReady(true), 0)
    return () => globalThis.clearTimeout(timer)
  }, [])

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')
  const themeLabel = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'

  return (
    <header className="fixed top-0 left-0 right-0 z-(--z-nav) h-(--nav-height) border-b border-border/60 bg-surface/95 backdrop-blur-xl">
      <div className="mx-auto h-full w-full max-w-(--page-max) flex items-center justify-between gap-4 px-(--page-x) sm:gap-5">
        <Logo />

        <div className="hidden items-center gap-3 md:flex lg:gap-4">
          <nav className="flex items-center gap-1 rounded-full p-1" aria-label="Main navigation">
            <NavLinks isActive={isActive} />
          </nav>

          <ThemeToggle theme={theme} ready={themeReady} onToggle={toggleTheme} ariaLabel={themeLabel} />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle theme={theme} ready={themeReady} onToggle={toggleTheme} ariaLabel={themeLabel} />

          <button
            onClick={() => setMobileOpen((open) => !open)}
            className="ds-focus flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface/80 text-foreground shadow-soft backdrop-blur-md transition hover:bg-muted/40"
            aria-label="Toggle main navigation"
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
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
              className="absolute left-0 right-0 top-(--nav-height) rounded-b-2xl border-b border-l border-r border-border bg-surface/95 p-2 shadow-elevated backdrop-blur-3xl md:hidden overflow-y-auto max-h-[calc(100vh-var(--nav-height))]"
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
      className="ds-focus flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface-glass text-muted-foreground shadow-soft backdrop-blur-xl transition hover:border-primary/30 hover:bg-muted/40 hover:text-foreground"
      aria-label={ready ? ariaLabel : 'Toggle color theme'}
    >
      {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
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
    const tooltip = 'tooltip' in item ? item.tooltip : undefined

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onNavigate}
        title={tooltip}
        className={`ds-focus relative flex items-center gap-2 font-medium transition-all duration-150 ${
          mobile ? 'h-12 rounded-xl px-4 text-base' : 'h-10 rounded-full px-4 text-sm'
        } ${
          active
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
