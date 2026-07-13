import { Metadata } from 'next';
import { requireAuth } from '@/lib/admin-auth';
import AdminSidebar from '@/components/admin/admin-sidebar';
import AdminHeader from '@/components/admin/admin-header';

export const metadata: Metadata = {
  title: 'مدیریت کارخانه‌ها - پنل مدیریت',
  description: 'مدیریت اطلاعات تولیدکنندگان و کارخانه‌ها',
};

export default async function ManufacturersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex flex-col flex-1 pr-64">
        <AdminHeader />
        <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
}
