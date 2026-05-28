'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { PageViewTracker } from '@/components/analytics/PageViewTracker';
import Footer from '@/components/shared/Footer';
import Navbar from '@/components/shared/Navbar';
import DeferredRootWidgets from '@/components/system/DeferredRootWidgets';

const FEATURE_ROUTES = ['/setup', '/preview', '/tools', '/preflight'];

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/');
  const isFeature = FEATURE_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'));

  if (isAdmin) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <>
      <div className="flex min-h-screen flex-col overflow-x-hidden">
        <Navbar />
        <main className="min-h-0 flex-1 pt-(--nav-height)">{children}</main>
        {!isFeature && <Footer />}
      </div>
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
      <DeferredRootWidgets />
    </>
  );
}

