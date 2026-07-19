interface AdminLayoutProps {
  children: React.ReactNode
}

/**
 * Shell for all /admin routes.
 * Login renders its own full-viewport board; other admin pages sit on the same
 * theme tokens as the public site (English LTR portfolio demo).
 */
export default async function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className='min-h-screen bg-background text-foreground' dir='ltr'>
      {children}
    </div>
  )
}
