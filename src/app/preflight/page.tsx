import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';
import PreflightPage from '@/components/preflight/PreflightPage';

export const metadata: Metadata = generatePageMetadata({
  title: 'KDP Preflight — Check Your KDP Print Files Before Upload',
  description:
    'Run a KDP preflight check for paperback and hardcover print files. Detect bleed, trim size, margin, spine, color, and PDF issues before uploading to Amazon KDP.',
  path: '/preflight',
  keywords: ['KDP preflight check', 'KDP print file checker', 'Amazon KDP PDF validator'],
});

export default function PreflightRoute() {
  return <PreflightPage />;
}
