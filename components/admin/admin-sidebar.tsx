'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Building2,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  Shield,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const sidebarItems = [
  {
    title: 'داشبورد',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'محصولات',
    href: '/admin/products',
    icon: Package,
  },
  {
    title: 'دسته‌بندی‌ها',
    href: '/admin/categories',
    icon: FolderTree,
  },
  {
    title: 'سفارشات',
    href: '/admin/orders',
    icon: ClipboardList,
  },
  {
    title: 'تنظیمات پروفایل',
    href: '/admin/settings',
    icon: Settings,
  },
]

const superAdminItems = [
  {
    title: 'کاربران ادمین',
    href: '/admin/users',
    icon: Shield,
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [collapsed, setCollapsed] = useState(false)

  const allItems =
    session?.user?.role === 'SUPER_ADMIN'
      ? [...sidebarItems, ...superAdminItems]
      : sidebarItems

  return (
    <aside
      className={cn(
        'fixed inset-y-0 right-0 z-50 flex flex-col bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 transition-width',
        collapsed ? 'w-20' : 'w-64',
      )}
      aria-label='Admin sidebar'
    >
      {/* Header / Brand / Profile */}
      <div className='flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700'>
        <Link
          href='/admin/dashboard'
          className={cn('flex items-center gap-3', collapsed && 'justify-center')}
        >
          <Package className='w-8 h-8 text-primary' />
          {!collapsed && <span className='text-xl font-bold'>آهن هرمز</span>}
        </Link>

        <button
          aria-label={collapsed ? 'باز کردن منو' : 'بستن منو'}
          onClick={() => setCollapsed(!collapsed)}
          className='p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700'
        >
          {collapsed ? (
            <ChevronRight className='w-5 h-5 text-gray-600 dark:text-gray-300' />
          ) : (
            <ChevronLeft className='w-5 h-5 text-gray-600 dark:text-gray-300' />
          )}
        </button>
      </div>

      <div className='flex-1 px-2 py-6 overflow-y-auto'>
        {/* Profile */}
        <div
          className={cn(
            'flex items-center gap-3 px-3 mb-6',
            collapsed && 'justify-center',
          )}
        >
          <div className='flex items-center gap-3'>
            <div className='flex items-center justify-center w-10 h-10 font-bold text-white rounded-full bg-gradient-to-br from-blue-700 to-blue-500'>
              {session?.user?.name ? session.user.name.charAt(0) : 'A'}
            </div>
            {!collapsed && (
              <div>
                <div className='text-sm font-semibold text-slate-800 dark:text-slate-100'>
                  {session?.user?.name || 'ادمین'}
                </div>
                <div className='text-xs text-slate-500 dark:text-slate-400'>
                  مدیریت سایت
                </div>
              </div>
            )}
          </div>
        </div>

        <nav>
          <ul className='space-y-2'>
            {allItems.map(item => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <li key={item.href} className='relative'>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
                    )}
                    title={collapsed ? item.title : undefined}
                  >
                    <Icon
                      className={cn(
                        'h-5 w-5 flex-shrink-0',
                        isActive
                          ? 'text-primary-foreground'
                          : 'text-gray-600 dark:text-gray-300',
                      )}
                    />
                    {!collapsed && <span>{item.title}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </aside>
  )
}
