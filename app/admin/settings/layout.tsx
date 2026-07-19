import { requireAuth } from '@/lib/admin-auth'
import AdminShell from '@/components/admin/admin-shell'

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAuth()
  return <AdminShell>{children}</AdminShell>
}
