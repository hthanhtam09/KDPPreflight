import SetupFeature from '@/components/setup/SetupFeature';
import { AppWorkspaceShell } from '@/components/shared/PageShell';

export default function SetupPage() {
  return (
    <AppWorkspaceShell
      activeNav="setup"
      activeStep="setup"
      title="KDP Book Setup Tool"
      subtitle="Choose your print specs and calculate the required KDP export size."
      lockScroll
      primaryAction={{
        label: 'Continue to Preview',
        href: '/preview',
      }}
    >
      <SetupFeature />
    </AppWorkspaceShell>
  );
}
