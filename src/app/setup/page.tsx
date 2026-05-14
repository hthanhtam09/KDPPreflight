import SetupFeature from '@/components/setup/SetupFeature';
import { AppShell, FeatureFAQ, RestoreSessionNotice, WorkspacePanel } from '@/components/workspace/ProductWorkspace';

export default function SetupPage() {
  return (
    <AppShell
      eyebrow="Smart Book Setup"
      title="KDP Book Setup Tool"
      description="Prepare the correct KDP trim size, bleed, spine, margins, and export dimensions before you design."
    >
      <RestoreSessionNotice />
      <WorkspacePanel>
        <SetupFeature />
      </WorkspacePanel>
      <FeatureFAQ
        title="KDP setup FAQ"
        items={[
          {
            question: 'What KDP trim size should I design for?',
            answer: 'Choose the trim size before designing. Smart Book Setup shows the manuscript size, bleed size, cover size, and safe area so your export matches Amazon KDP formatting requirements.',
          },
          {
            question: 'When do I need KDP bleed?',
            answer: 'Use bleed when artwork, backgrounds, or coloring book pages touch the edge. No-bleed is safer for journals, text interiors, and books with white margins.',
          },
          {
            question: 'Why does spine width change?',
            answer: 'KDP spine width depends on page count, paper type, and interior type. A thin spine may not support readable spine text.',
          },
        ]}
      />
    </AppShell>
  );
}
