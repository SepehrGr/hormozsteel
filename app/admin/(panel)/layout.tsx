import { requireAuth } from '@/lib/admin-auth'
import AdminShell from '@/components/admin/admin-shell'

/**
 * The admin shell around every section. The check here only covers the first
 * load: layouts don't re-run on navigation, so each page checks again.
 */
export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAuth()

  return <AdminShell>{children}</AdminShell>
}
