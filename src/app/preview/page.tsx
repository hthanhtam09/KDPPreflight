import PreviewFeature from '@/components/preview/PreviewFeature';
import { AppWorkspaceShell } from '@/components/shared/PageShell';

export default function PreviewPage() {
  return (
    <AppWorkspaceShell
      activeNav="preview"
      activeStep="preview"
      title="Preview"
      subtitle="Inspect pages and layout before running Preflight."
      primaryAction={{
        label: 'Run Preflight',
        href: '/preflight',
      }}
    >
      <PreviewFeature />
    </AppWorkspaceShell>
  );
}
