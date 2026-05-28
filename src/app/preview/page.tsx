import PreviewFeature from '@/components/preview/PreviewFeature'
import { AppWorkspaceShell } from '@/components/shared/PageShell'

export default function PreviewPage() {
  return (
    <AppWorkspaceShell
      activeNav="preview"
      activeStep="preview"
      title="Preview Your Files"
      subtitle="Inspect pages, guides, and layout before running Preflight."
    >
      <PreviewFeature />
    </AppWorkspaceShell>
  )
}
