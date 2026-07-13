interface AdminLayoutProps {
  children: React.ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900' dir='rtl'>
      {children}
    </div>
  )
}
