'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Shield, Box, HomeIcon, Menu, X } from 'lucide-react';
import { useAppStore } from '@/store/use-app-store';
import { AppView } from '@/types/kdp';
import LandingPage from '@/components/landing/LandingPage';
import SetupFeature from '@/components/setup/SetupFeature';
import CheckerFeature from '@/components/checker/CheckerFeature';
import dynamic from 'next/dynamic';

const PreviewFeature = dynamic(() => import('@/components/preview/PreviewFeature'), { ssr: false });

// ─── Navigation ───────────────────────────────

function NavBar() {
  const { view, setView } = useAppStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navItems: { key: AppView; label: string; icon: React.ElementType }[] = [
    { key: 'landing', label: 'Home', icon: HomeIcon },
    { key: 'setup', label: 'Setup', icon: BookOpen },
    { key: 'checker', label: 'Checker', icon: Shield },
    { key: 'preview', label: '3D Preview', icon: Box },
  ];

  const handleNav = (key: AppView) => {
    setView(key);
    setMobileOpen(false);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled 
            ? 'bg-[#050508]/70 backdrop-blur-2xl border-b border-white/[0.04]' 
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <button 
            onClick={() => handleNav('landing')} 
            className="flex items-center gap-2.5 group"
          >
            <div className="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center group-hover:bg-white/[0.1] transition-colors duration-300">
              <BookOpen className="w-3.5 h-3.5 text-white/60 group-hover:text-white/80 transition-colors duration-300" />
            </div>
            <span className="text-sm font-semibold text-white/60 tracking-tight hidden sm:block group-hover:text-white/80 transition-colors duration-300">
              KDPPreflight
            </span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden sm:flex items-center gap-0.5 p-1 rounded-xl glass">
            {navItems.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => handleNav(key)}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
                  view === key
                    ? 'text-white/80'
                    : 'text-white/30 hover:text-white/50'
                }`}
              >
                {view === key && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 bg-white/[0.08] rounded-lg"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className="w-3.5 h-3.5 relative z-10" />
                <span className="relative z-10">{label}</span>
              </button>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="sm:hidden p-2 text-white/50 hover:text-white/70 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-14 left-0 right-0 z-40 bg-[#050508]/95 backdrop-blur-2xl border-b border-white/[0.04] sm:hidden"
          >
            <div className="p-4 space-y-1">
              {navItems.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => handleNav(key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    view === key
                      ? 'bg-white/[0.06] text-white/80'
                      : 'text-white/40 hover:text-white/60 hover:bg-white/[0.03]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── View Router ──────────────────────────────

function ViewRouter() {
  const { view } = useAppStore();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={view}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
        className="flex-1"
      >
        {view === 'landing' && <LandingPage />}
        {view === 'setup' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pt-20">
            <SetupFeature />
          </div>
        )}
        {view === 'checker' && (
          <div className="h-[calc(100vh-56px)] pt-14">
            <CheckerFeature />
          </div>
        )}
        {view === 'preview' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pt-20 h-[calc(100vh-56px)]">
            <PreviewFeature />
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Main Page ────────────────────────────────

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col bg-[#050508] text-white">
      <NavBar />
      <main className="flex-1">
        <ViewRouter />
      </main>
    </div>
  );
}
