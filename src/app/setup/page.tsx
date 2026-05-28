import SetupFeature from '@/components/setup/SetupFeature';
import { AppWorkspaceShell } from '@/components/shared/PageShell';

export default function SetupPage() {
  return (
    <AppWorkspaceShell
      activeNav="setup"
      activeStep="setup"
      title="Setup"
      subtitle="Choose KDP print specs and calculate the required export size."
      primaryAction={{
        label: 'Continue to Preview',
        href: '/preview',
      }}
    >
      <SetupFeature />
    </AppWorkspaceShell>
  );
}
