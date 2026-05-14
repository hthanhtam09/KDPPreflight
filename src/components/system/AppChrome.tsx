'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { PageViewTracker } from '@/components/analytics/PageViewTracker';
import Footer from '@/components/shared/Footer';
import Navbar from '@/components/shared/Navbar';
import DeferredRootWidgets from '@/components/system/DeferredRootWidgets';

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/');

  if (isAdmin) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="min-h-0 flex-1">{children}</main>
        <Footer />
      </div>
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
      <DeferredRootWidgets />
    </>
  );
}

