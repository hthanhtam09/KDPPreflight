'use client';

import { useState, useEffect, useCallback } from 'react';
import { BookOpen, Shield, Box, HomeIcon, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store/use-app-store';

type ViewType = 'landing' | 'setup' | 'checker' | 'preview';

// Shared view state without zustand import (lighter initial bundle)
const viewState = {
  current: 'landing' as ViewType,
  listeners: new Set<() => void>(),
};

function useView() {
  const [view, setViewLocal] = useState<ViewType>(viewState.current);
  
  useEffect(() => {
    const update = () => setViewLocal(viewState.current);
    viewState.listeners.add(update);
    return () => { viewState.listeners.delete(update); };
  }, []);

  const setView = useCallback((v: ViewType) => {
    viewState.current = v;
    viewState.listeners.forEach(l => l());
  }, []);

  return [view, setView] as const;
}

// Dynamic component loader
function DynComp({ importFn, fallback }: { importFn: () => Promise<{ default: React.ComponentType<Record<string, unknown>> }>; fallback: React.ReactNode }) {
  const [Comp, setComp] = useState<React.ComponentType<Record<string, unknown>> | null>(null);
  const [err, setErr] = useState(false);
  useEffect(() => {
    importFn().then(m => setComp(() => m.default)).catch(() => setErr(true));
  }, [importFn]);
  if (err) return <div className="p-8 text-center text-white/40">Failed to load component</div>;
  if (!Comp) return <>{fallback}</>;
  return <Comp />;
}

// Pre-defined import functions (not created conditionally)
const importLanding = () => import('@/components/landing/LandingPage');
const importSetup = () => import('@/components/setup/SetupFeature');
const importChecker = () => import('@/components/checker/CheckerFeature');
const importPreview = () => import('@/components/preview/PreviewFeature');

export default function Home() {
  const [view, setView] = useView();
  const { checkerStep, setCheckerStep } = useAppStore();

  const loading = (
    <div className="flex items-center justify-center h-64 text-white/30">
      <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading...
    </div>
  );

  // When user clicks "Checker" in the nav, go to checker view AND reset to import step
  const handleCheckerNav = useCallback(() => {
    setView('checker');
    // Only reset step if not already in checker (preserves progress within checker)
  }, [setView]);

  // Sync: when checkerStep changes, ensure we're on checker view
  useEffect(() => {
    if (checkerStep === 'import' || checkerStep === 'config') {
      if (viewState.current !== 'checker') {
        viewState.current = 'checker';
        viewState.listeners.forEach(l => l());
      }
    }
  }, [checkerStep]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0f] text-white">
      <nav className="sticky top-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <button onClick={() => setView('landing')} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 rounded-lg bg-white/[0.08] flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-white/70" />
            </div>
            <span className="text-sm font-semibold text-white/80 tracking-tight hidden sm:block">KDPPreflight</span>
          </button>
          <div className="flex items-center gap-1">
            {([
              ['landing', 'Home', HomeIcon],
              ['setup', 'Setup', BookOpen],
              ['checker', 'Checker', Shield],
              ['preview', '3D Preview', Box],
            ] as const).map(([key, label, Icon]) => (
              <button
                key={key}
                onClick={() => {
                  if (key === 'checker') {
                    handleCheckerNav();
                  } else {
                    setView(key as ViewType);
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  view === key ? 'bg-white/[0.08] text-white/80' : 'text-white/30 hover:text-white/50 hover:bg-white/[0.04]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>
      <main className="flex-1">
        {view === 'landing' && <DynComp importFn={importLanding} fallback={loading} />}
        {view === 'setup' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
            <DynComp importFn={importSetup} fallback={loading} />
          </div>
        )}
        {view === 'checker' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
            <DynComp importFn={importChecker} fallback={loading} />
          </div>
        )}
        {view === 'preview' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 h-[calc(100vh-56px)]">
            <DynComp importFn={importPreview} fallback={loading} />
          </div>
        )}
      </main>
    </div>
  );
}
