import { requireAuth } from '@/lib/admin-auth';
import AdminSidebar from '@/components/admin/admin-sidebar';
import AdminHeader from '@/components/admin/admin-header';

interface OrdersLayoutProps {
  children: React.ReactNode;
}

export default async function OrdersLayout({ children }: OrdersLayoutProps) {
  await requireAuth();

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 flex flex-col pr-64">
        <AdminHeader />
        <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
}
