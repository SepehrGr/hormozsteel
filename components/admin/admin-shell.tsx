'use client'

import { useEffect, useState } from 'react'

import AdminSidebar from '@/components/admin/admin-sidebar'
import AdminHeader from '@/components/admin/admin-header'

interface AdminShellProps {
  children: React.ReactNode
}

export default function AdminShell({ children }: AdminShellProps) {
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('admin-sidebar-collapsed')

    if (stored === '1') setCollapsed(true)

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'admin-sidebar-collapsed') {
        setCollapsed(e.newValue === '1')
      }
    }

    window.addEventListener('storage', onStorage)

    const onCustom = (e: Event) => {
      const detail = (e as CustomEvent).detail

      setCollapsed(Boolean(detail))
    }

    window.addEventListener('admin-sidebar-toggle', onCustom)

    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('admin-sidebar-toggle', onCustom)
    }
  }, [])

  return (
    <div className='flex min-h-screen bg-background'>
      <AdminSidebar
        collapsed={collapsed}
        onCollapsedChange={next => {
          setCollapsed(next)
          localStorage.setItem('admin-sidebar-collapsed', next ? '1' : '0')
          window.dispatchEvent(
            new CustomEvent('admin-sidebar-toggle', { detail: next }),
          )
        }}
      />
      <div
        className={`flex min-h-screen flex-1 flex-col transition-[padding] duration-200 ease-out ${
          collapsed ? 'pl-[4.25rem]' : 'pl-60'
        }`}
      >
        <AdminHeader />
        <main className='flex-1 p-4 md:p-6 md:w-[900px] xl:w-[1100px] 2xl:w-[1400px] max-w-[1600px] mx-auto'>
          {children}
        </main>
      </div>
    </div>
  )
}
