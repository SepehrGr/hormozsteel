'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Building2,
  ClipboardList,
  History,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  X,
} from 'lucide-react'

import { cn } from '@/lib/utils'

const sidebarItems = [
  { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { title: 'Products', href: '/admin/products', icon: Package },
  { title: 'Categories', href: '/admin/categories', icon: FolderTree },
  { title: 'Manufacturers', href: '/admin/manufacturers', icon: Building2 },
  { title: 'Orders', href: '/admin/orders', icon: ClipboardList },
  { title: 'Activity log', href: '/admin/logs', icon: History },
  { title: 'Settings', href: '/admin/settings', icon: Settings },
]

const superAdminItems = [
  { title: 'Admin users', href: '/admin/users', icon: Shield },
]

/**
 * The rail from `lg` up, or the phone drawer's contents when `onClose` is set
 * (the shell renders it inside a `ModalDialog`).
 */
type AdminSidebarProps =
  | { collapsed: boolean; onCollapsedChange: (collapsed: boolean) => void }
  | { onClose: () => void }

const iconButtonClass =
  'flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center border border-border bg-background text-muted-foreground transition-colors duration-200 ease-out hover:bg-muted hover:text-foreground pointer-coarse:h-11 pointer-coarse:w-11'

export default function AdminSidebar(props: AdminSidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const drawer = 'onClose' in props
  const collapsed = !drawer && props.collapsed

  const allItems =
    session?.user?.role === 'SUPER_ADMIN'
      ? [...sidebarItems, ...superAdminItems]
      : sidebarItems

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`)

  return (
    <aside
      aria-label='Admin sidebar'
      className={cn(
        'flex flex-col bg-card',
        drawer
          ? 'h-full w-72'
          : 'fixed inset-y-0 left-0 z-50 hidden border-r border-border transition-[width] duration-200 ease-out lg:flex',
        !drawer && (collapsed ? 'w-[4.25rem]' : 'w-60'),
      )}
    >
      <div
        className={cn(
          'flex h-14 items-center border-b border-border px-3',
          collapsed ? 'justify-center' : 'justify-between',
        )}
      >
        <Link
          className={cn(
            'flex min-w-0 items-center gap-2.5',
            collapsed && 'justify-center',
          )}
          href='/admin/dashboard'
        >
          {!collapsed && (
            <div className='min-w-0'>
              <p
                className='truncate text-sm font-semibold tracking-tight text-foreground'
                id={drawer ? 'admin-menu-title' : undefined}
              >
                Hormoz Steel
              </p>
              <p className='font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground'>
                Admin Panel
              </p>
            </div>
          )}
        </Link>

        {drawer ? (
          <button
            aria-label='Close menu'
            className={iconButtonClass}
            type='button'
            onClick={props.onClose}
          >
            <X className='h-4 w-4' />
          </button>
        ) : (
          <button
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={iconButtonClass}
            type='button'
            onClick={() => props.onCollapsedChange(!collapsed)}
          >
            {collapsed ? (
              <ChevronRight className='h-4 w-4' />
            ) : (
              <ChevronLeft className='h-4 w-4' />
            )}
          </button>
        )}
      </div>

      <div className='flex-1 overflow-y-auto px-2 py-4'>
        <div
          className={cn(
            'mb-4 flex items-center gap-2.5 border border-border bg-background px-2.5 py-2',
            collapsed && 'justify-center px-0',
          )}
        >
          <div className='flex h-8 w-8 shrink-0 items-center justify-center border border-border bg-card font-mono text-xs font-semibold text-foreground'>
            {session?.user?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          {!collapsed && (
            <div className='min-w-0'>
              <p className='truncate text-sm font-medium text-foreground'>
                {session?.user?.name || 'Admin'}
              </p>
              <p className='truncate font-mono text-[11px] uppercase tracking-wide text-muted-foreground'>
                {session?.user?.role === 'SUPER_ADMIN'
                  ? 'Super admin'
                  : 'Admin'}
              </p>
            </div>
          )}
        </div>

        <nav>
          <ul className='space-y-0.5'>
            {allItems.map(item => {
              const Icon = item.icon
              const active = isActive(item.href)

              return (
                <li key={item.href}>
                  <Link
                    className={cn(
                      'flex items-center gap-2.5 px-2.5 py-2 text-sm font-medium transition-colors duration-200 ease-out pointer-coarse:py-3',
                      collapsed && 'justify-center px-0',
                      active
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                    href={item.href}
                    title={collapsed ? item.title : undefined}
                    onClick={drawer ? props.onClose : undefined}
                  >
                    <Icon className='h-5 w-5 shrink-0' />
                    {!collapsed && <span>{item.title}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>

      {!collapsed && (
        <div className='border-t border-border px-3 py-3'>
          <Link
            className='flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors duration-200 ease-out hover:text-foreground pointer-coarse:min-h-11'
            href='/'
          >
            <ArrowLeft className='h-5 w-5' />
            Public site
          </Link>
        </div>
      )}
    </aside>
  )
}
