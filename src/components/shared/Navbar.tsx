"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, Moon, Sun, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState, useSyncExternalStore } from "react";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/setup", label: "Setup" },
  { href: "/checker", label: "Checker" },
  { href: "/preview", label: "3D Preview" },
] as const;

export default function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [themeReady, setThemeReady] = useState(false);
  const scrolled = useSyncExternalStore(
    subscribeToScroll,
    getScrolledSnapshot,
    () => false,
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setThemeReady(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");
  const themeLabel =
    theme === "dark" ? "Switch to light mode" : "Switch to dark mode";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[var(--z-nav)] border-b backdrop-blur-2xl transition-[background-color,border-color,box-shadow] duration-300 ${
        scrolled
          ? "border-border bg-background/90 shadow-elevated"
          : "border-border/70 bg-background/72 shadow-none"
      }`}
    >
      <div className="mx-auto flex h-[var(--nav-height)] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="group flex min-w-0 items-center gap-1 rounded-full outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring/40"
          aria-label="KDPPreflight home"
        >
          <div className="relative flex h-[74px] w-[74px] shrink-0 items-center justify-center">
            <Image
              src="/logo.png"
              alt=""
              width={70}
              height={70}
              className="h-[70px] w-[70px] object-contain brightness-105 transition group-hover:brightness-125"
              priority
            />
          </div>
          <div className="min-w-0">
            <span className="block truncate text-lg font-semibold leading-tight tracking-tight text-foreground sm:text-xl">
              KDPPreflight
            </span>
          </div>
        </Link>

        <div className="hidden items-center gap-3 md:flex">
          <nav
            className="flex items-center gap-1 rounded-full border border-border bg-surface-glass p-1 shadow-soft backdrop-blur-xl"
            aria-label="Main navigation"
          >
            <NavLinks isActive={isActive} />
          </nav>

          <ThemeToggle
            theme={theme}
            ready={themeReady}
            onToggle={toggleTheme}
            ariaLabel={themeLabel}
          />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle
            theme={theme}
            ready={themeReady}
            onToggle={toggleTheme}
            ariaLabel={themeLabel}
          />

          <button
            onClick={() => setMobileOpen((open) => !open)}
            className="ds-focus flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface-glass text-foreground shadow-soft backdrop-blur-xl transition hover:bg-muted/40"
            aria-label="Toggle main navigation"
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
          >
            {mobileOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            id="mobile-navigation"
            aria-label="Main navigation"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-4 top-[calc(100%+0.5rem)] rounded-2xl border border-border bg-surface-glass p-2 shadow-elevated backdrop-blur-2xl md:hidden"
          >
            <div className="grid gap-1">
              <NavLinks
                isActive={isActive}
                mobile
                onNavigate={() => setMobileOpen(false)}
              />
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

function subscribeToScroll(onStoreChange: () => void) {
  window.addEventListener("scroll", onStoreChange, { passive: true });
  return () => window.removeEventListener("scroll", onStoreChange);
}

function getScrolledSnapshot() {
  return window.scrollY > 8;
}

function ThemeToggle({
  theme,
  ready,
  onToggle,
  ariaLabel,
}: Readonly<{
  theme?: string;
  ready: boolean;
  onToggle: () => void;
  ariaLabel: string;
}>) {
  const isLight = ready && theme === "light";

  return (
    <button
      onClick={onToggle}
      className="ds-focus flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface-glass text-muted-foreground shadow-soft backdrop-blur-xl transition hover:border-primary/30 hover:bg-muted/40 hover:text-foreground"
      aria-label={ready ? ariaLabel : "Toggle color theme"}
    >
      {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </button>
  );
}

function NavLinks({
  isActive,
  mobile = false,
  onNavigate,
}: {
  isActive: (href: string) => boolean;
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  return NAV_ITEMS.map(({ href, label }) => {
    const active = isActive(href);

    return (
      <Link
        key={href}
        href={href}
        onClick={onNavigate}
        className={`ds-focus flex items-center gap-2 font-medium transition-all duration-150 ${
          mobile
            ? "h-11 rounded-xl px-3 text-sm"
            : "h-9 rounded-full px-3 text-xs lg:px-3.5"
        } ${
          active
            ? "bg-primary text-primary-foreground shadow-soft"
            : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
        }`}
        aria-current={active ? "page" : undefined}
      >
        <span>{label}</span>
      </Link>
    );
  });
}
