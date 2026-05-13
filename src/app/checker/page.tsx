'use client';

import CheckerFeature from '@/components/checker/CheckerFeature';
import PreviewStep from '@/components/checker/PreviewStep';
import { AppShell, FeatureFAQ, RestoreSessionNotice, WorkspacePanel } from '@/components/workspace/ProductWorkspace';
import { useAppStore } from '@/store/use-app-store';

export default function CheckerPage() {
  const { checkerStep } = useAppStore();

  // PreviewStep uses `fixed inset-0` to take over the viewport.
  // AppShell wraps in a framer-motion div (has CSS transform) and WorkspacePanel
  // applies backdrop-filter — both create stacking contexts that trap fixed children.
  // Render PreviewStep at the page root to avoid those ancestors entirely.
  if (checkerStep === 'preview') {
    return <PreviewStep />;
  }

  return (
    <AppShell
      eyebrow="Format Checker"
      title="KDP Format Checker"
      description="Inspect manuscripts and covers for KDP upload risks: page size, bleed, trim, spine, margins, and cover fit."
    >
      <RestoreSessionNotice />
      <WorkspacePanel>
        <CheckerFeature />
      </WorkspacePanel>
      <FeatureFAQ
        title="KDP checker FAQ"
        items={[
          {
            question: 'What does the KDP manuscript checker inspect?',
            answer: 'It checks page size, trim match, bleed, margins, page count, and print-risk issues so you can see which pages need attention before upload.',
          },
          {
            question: 'What does the KDP cover checker inspect?',
            answer: 'It compares your cover against the selected book specs, including full cover size, trim, bleed, spine width, and practical KDP upload risk.',
          },
          {
            question: 'What happens when I click an issue?',
            answer: 'The workspace navigates to the affected page and can show the related overlay so you can see the problem in context.',
          },
        ]}
      />
    </AppShell>
  );
}
