import { requireSuperAdmin } from '@/lib/admin-auth'
import AdminSidebar from '@/components/admin/admin-sidebar'
import AdminHeader from '@/components/admin/admin-header'

export default async function UsersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireSuperAdmin()

  return (
    <div className='flex min-h-screen'>
      <AdminSidebar />
      <div className='flex flex-col flex-1 pr-64'>
        <AdminHeader />
        <main className='flex-1 p-6 bg-gray-50 dark:bg-gray-900'>{children}</main>
      </div>
    </div>
  )
}

