'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

import AdminSidebar from '@/components/admin/admin-sidebar'
import AdminHeader from '@/components/admin/admin-header'
import ModalDialog from '@/components/ui/modal-dialog'
import { cn } from '@/lib/utils'

interface AdminShellProps {
  children: React.ReactNode
}

export default function AdminShell({ children }: AdminShellProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => setMenuOpen(false), [pathname])

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1024px)')
    const onChange = () => desktop.matches && setMenuOpen(false)

    desktop.addEventListener('change', onChange)

    return () => desktop.removeEventListener('change', onChange)
  }, [])

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
      {menuOpen ? (
        <ModalDialog
          className='m-0 h-dvh max-h-dvh border-y-0 border-l-0 transition-transform duration-200 ease-out starting:-translate-x-full motion-reduce:transition-none'
          labelledBy='admin-menu-title'
          onClose={() => setMenuOpen(false)}
        >
          <AdminSidebar onClose={() => setMenuOpen(false)} />
        </ModalDialog>
      ) : null}
      <div
        className={cn(
          'flex min-h-screen min-w-0 flex-1 flex-col transition-[padding] duration-200 ease-out',
          collapsed ? 'lg:pl-[4.25rem]' : 'lg:pl-60',
        )}
      >
        <AdminHeader onOpenMenu={() => setMenuOpen(true)} />
        <main className='mx-auto w-full min-w-0 max-w-[1400px] flex-1 p-4 md:p-6'>
          {children}
        </main>
      </div>
    </div>
  )
}
