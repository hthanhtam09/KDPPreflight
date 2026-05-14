'use client';

import dynamic from 'next/dynamic';

const OfflineBanner = dynamic(
  () => import('@/components/system/OfflineBanner').then((mod) => mod.OfflineBanner),
  { ssr: false },
);

const FeatureFeedback = dynamic(
  () => import('@/components/feedback/FeatureFeedback').then((mod) => mod.FeatureFeedback),
  { ssr: false },
);

export default function DeferredRootWidgets() {
  return (
    <>
      <OfflineBanner />
      <FeatureFeedback floating />
    </>
  );
}
