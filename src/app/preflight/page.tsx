import type { Metadata } from 'next';
import PreflightPage from '@/components/preflight/PreflightPage';

export const metadata: Metadata = {
  title: 'KDP Preflight — Check Your KDP Print Files Before Upload',
  description:
    'Run a KDP preflight check for paperback and hardcover print files. Detect bleed, trim size, margin, spine, color, and PDF issues before uploading to Amazon KDP.',
  alternates: {
    canonical: 'https://kdppreflight.com/preflight',
  },
};

export default function PreflightRoute() {
  return <PreflightPage />;
}
