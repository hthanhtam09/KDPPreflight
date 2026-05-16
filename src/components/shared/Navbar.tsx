'use client'

import { AnimatePresence, LazyMotion, domAnimation, m } from 'framer-motion'
import { Menu, Moon, Sun, X } from 'lucide-react'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState, useSyncExternalStore } from 'react'
import { FeatureFeedback } from '@/components/feedback/FeatureFeedback'

const NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/setup', label: 'Setup' },
  { href: '/checker', label: 'Checker' },
  { href: '/preview', label: 'Preview' },
  { href: '/blog', label: 'Blog' },
] as const

export default function Navbar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [themeReady, setThemeReady] = useState(false)
  const scrolled = useSyncExternalStore(subscribeToScroll, getScrolledSnapshot, () => false)
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
    <header
      className={`fixed inset-x-0 top-0 z-[var(--z-nav)] h-[var(--app-header-height)] border-b backdrop-blur-2xl transition-[background-color,border-color,box-shadow] duration-300 w-full ${scrolled ? 'border-border bg-background/95 shadow-elevated' : 'border-border/70 bg-background/85 shadow-none'
        }`}
    >
      <div className="mx-auto flex h-[var(--nav-height)] w-full max-w-7xl items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6">
        <Link
          href="/"
          className="group flex min-w-0 shrink items-center gap-1 rounded-full outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring/40"
          aria-label="KDPPreflight home"
        >
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center sm:h-16 sm:w-16">
            <Image
              src="/logo-nav.png"
              alt=""
              width={60}
              height={60}
              className="h-[50px] w-[50px] sm:h-[60px] sm:w-[60px] object-contain brightness-105 transition group-hover:brightness-125"
              priority
            />
          </div>
          <div className="min-w-0 hidden xs:block">
            <span className="block truncate text-base font-semibold leading-tight tracking-tight text-foreground sm:text-xl lg:text-xl md:text-lg">
              KDPPreflight
            </span>
          </div>
        </Link>

        <div className="hidden items-center gap-2 md:flex lg:gap-3">
          <nav
            className="flex items-center gap-0.5 lg:gap-1 rounded-full border border-border bg-surface-glass p-1 shadow-soft backdrop-blur-xl"
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
            className="ds-focus flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface-glass text-foreground shadow-soft backdrop-blur-xl transition hover:bg-muted/40"
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
              className="absolute inset-x-4 top-[calc(100%+0.5rem)] rounded-2xl border border-border bg-background/95 p-2 shadow-elevated backdrop-blur-3xl md:hidden overflow-y-auto max-h-[80vh]"
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

function subscribeToScroll(onStoreChange: () => void) {
  window.addEventListener('scroll', onStoreChange, { passive: true })
  return () => window.removeEventListener('scroll', onStoreChange)
}

function getScrolledSnapshot() {
  return window.scrollY > 8
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
  return NAV_ITEMS.map(({ href, label }) => {
    const active = isActive(href)

    return (
      <Link
        key={href}
        href={href}
        onClick={onNavigate}
        className={`ds-focus flex items-center gap-2 font-medium transition-all duration-150 ${mobile ? 'h-11 rounded-xl px-4 text-base' : 'h-8 md:h-9 rounded-full px-2.5 md:px-3 text-[11px] md:text-xs lg:px-3.5'
          } ${active
            ? 'bg-primary text-primary-foreground shadow-soft'
            : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
          }`}
        aria-current={active ? 'page' : undefined}
      >
        <span>{label}</span>
      </Link>
    )
  })
}
