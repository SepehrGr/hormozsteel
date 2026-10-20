'use client'

import { usePathname } from 'next/navigation'

import { Navbar } from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')

  if (isAdminRoute) {
    // Admin pages: no navbar or footer
    return <>{children}</>
  }

  // Regular pages: navbar and footer
  return (
    <div className='relative flex flex-col'>
      <Navbar />
      <main className='container flex-grow mx-auto max-w-8xl md:px-6'>
        {children}
      </main>
      <Footer />
    </div>
  )
}
