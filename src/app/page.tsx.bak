'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Shield, Box, HomeIcon, ArrowLeft } from 'lucide-react';
import { useAppStore } from '@/store/use-app-store';
import { AppView } from '@/types/kdp';
import LandingPage from '@/components/landing/LandingPage';
import SetupFeature from '@/components/setup/SetupFeature';
import CheckerFeature from '@/components/checker/CheckerFeature';
import dynamic from 'next/dynamic';

// Dynamic import for 3D preview to avoid SSR issues
const PreviewFeature = dynamic(() => import('@/components/preview/PreviewFeature'), { ssr: false });

// --- Navigation ---
function NavBar() {
  const { view, setView } = useAppStore();

  const navItems: { key: AppView; label: string; icon: React.ElementType }[] = [
    { key: 'landing', label: 'Home', icon: HomeIcon },
    { key: 'setup', label: 'Setup', icon: BookOpen },
    { key: 'checker', label: 'Checker', icon: Shield },
    { key: 'preview', label: '3D Preview', icon: Box },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <button 
          onClick={() => setView('landing')} 
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
        >
          <div className="w-7 h-7 rounded-lg bg-white/[0.08] flex items-center justify-center">
            <BookOpen className="w-3.5 h-3.5 text-white/70" />
          </div>
          <span className="text-sm font-semibold text-white/80 tracking-tight hidden sm:block">
            KDPPreflight
          </span>
        </button>

        {/* Nav Items */}
        <div className="flex items-center gap-1">
          {navItems.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                view === key
                  ? 'bg-white/[0.08] text-white/80'
                  : 'text-white/30 hover:text-white/50 hover:bg-white/[0.04]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

// --- View Router ---
function ViewRouter() {
  const { view } = useAppStore();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={view}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25 }}
        className="flex-1"
      >
        {view === 'landing' && <LandingPage />}
        {view === 'setup' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
            <SetupFeature />
          </div>
        )}
        {view === 'checker' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
            <CheckerFeature />
          </div>
        )}
        {view === 'preview' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 h-[calc(100vh-56px)]">
            <PreviewFeature />
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// --- Main Page ---
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0f] text-white">
      <NavBar />
      <main className="flex-1">
        <ViewRouter />
      </main>
    </div>
  );
}
