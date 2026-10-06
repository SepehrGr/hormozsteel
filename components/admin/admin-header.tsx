'use client'

import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  LogOut,
  Settings,
  Bell,
  Mail,
  Shield,
  ChevronDown,
  Package,
  X,
} from 'lucide-react'

import { ThemeSwitch } from '@/components/layout/theme-switch'
import ModalDialog from '@/components/ui/modal-dialog'

interface Notification {
  id: string
  type: 'contact' | 'order'
  title: string
  description: string
  time: string
  icon: 'mail' | 'package'
  link: string
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`

  return `${diffDays}d ago`
}

export default function AdminHeader() {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = async () => {
    try {
      const [contactRes, ordersRes] = await Promise.all([
        fetch('/api/contact?status=new&limit=5'),
        fetch('/api/quick-orders?status=pending&limit=5'),
      ])

      const [contactData, ordersData] = await Promise.all([
        contactRes.json(),
        ordersRes.json(),
      ])

      const next: Notification[] = []

      if (contactData.success && contactData.data?.contactForms) {
        for (const form of contactData.data.contactForms) {
          next.push({
            id: `contact-${form.id}`,
            type: 'contact',
            title: `Message from ${form.name}`,
            description: getTimeAgo(new Date(form.createdAt)),
            time: form.createdAt,
            icon: 'mail',
            link: '/admin/orders',
          })
        }
      }

      if (ordersData.success && ordersData.data?.quickOrders) {
        for (const order of ordersData.data.quickOrders) {
          next.push({
            id: `order-${order.id}`,
            type: 'order',
            title: `Quote from ${order.customerName}`,
            description: getTimeAgo(new Date(order.createdAt)),
            time: order.createdAt,
            icon: 'package',
            link: '/admin/orders',
          })
        }
      }

      next.sort(
        (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime(),
      )
      setNotifications(next.slice(0, 10))
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    setShowNotifications(false)
    setShowUserMenu(false)
  }, [pathname])

  const handleSignOut = () => {
    signOut({ callbackUrl: '/admin/login' })
  }

  const notificationCount = notifications.length

  return (
    <>
      <header className='sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur md:px-6'>
        <div />

        <div className='flex items-center justify-end gap-2'>
          {/* Notifications */}
          <div className='relative'>
            <button
              aria-label='Notifications'
              className='relative flex h-8 w-8 items-center justify-center border border-border bg-card text-muted-foreground transition-colors duration-200 ease-out hover:bg-muted hover:text-foreground cursor-pointer'
              type='button'
              onClick={() => {
                setShowNotifications(v => !v)
                setShowUserMenu(false)
              }}
            >
              <Bell className='h-4.5 w-4.5' />
              {notificationCount > 0 && (
                <span className='absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center bg-red-600 px-1 font-mono text-[10px] font-semibold text-white'>
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className='absolute right-0 mt-2 w-80 border border-border bg-card shadow-lg'>
                <div className='flex items-center justify-between border-b border-border px-3 py-2.5'>
                  <p className='font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
                    Inbox
                  </p>
                  <button
                    aria-label='Close'
                    className='cursor-pointer text-muted-foreground hover:text-foreground'
                    type='button'
                    onClick={() => setShowNotifications(false)}
                  >
                    <X className='h-4 w-4' />
                  </button>
                </div>
                <div className='max-h-80 overflow-y-auto'>
                  {loading ? (
                    <p className='px-4 py-6 text-center text-sm text-muted-foreground'>
                      Loading…
                    </p>
                  ) : notifications.length === 0 ? (
                    <div className='px-4 py-8 text-center'>
                      <Bell className='mx-auto mb-2 h-8 w-8 text-muted-foreground/40' />
                      <p className='text-sm text-muted-foreground'>
                        No new notifications
                      </p>
                    </div>
                  ) : (
                    <ul className='divide-y divide-border'>
                      {notifications.map(notif => (
                        <li key={notif.id}>
                          <button
                            className='flex w-full items-start gap-3 px-3 py-3 text-left transition-colors duration-200 ease-out hover:bg-muted cursor-pointer'
                            type='button'
                            onClick={() => {
                              setShowNotifications(false)
                              router.push(notif.link)
                            }}
                          >
                            <span className='mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center border border-border bg-background'>
                              {notif.icon === 'mail' ? (
                                <Mail className='h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400' />
                              ) : (
                                <Package className='h-3.5 w-3.5 text-amber-800 dark:text-amber-500' />
                              )}
                            </span>
                            <span className='min-w-0'>
                              <span className='block text-sm font-medium text-foreground'>
                                {notif.title}
                              </span>
                              <span className='mt-0.5 block text-xs text-muted-foreground'>
                                {notif.description}
                              </span>
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {notifications.length > 0 && (
                  <button
                    className='w-full border-t border-border px-3 py-2.5 text-center text-xs font-medium text-foreground transition-colors duration-200 ease-out hover:bg-muted cursor-pointer'
                    type='button'
                    onClick={() => {
                      setShowNotifications(false)
                      router.push('/admin/orders')
                    }}
                  >
                    View orders desk
                  </button>
                )}
              </div>
            )}
          </div>

          <ThemeSwitch />

          <div className='hidden h-6 w-px bg-border sm:block' />

          {/* User menu */}
          {session?.user && (
            <div className='relative'>
              <button
                className='flex items-center gap-2 border border-border bg-card px-2 py-1.5 transition-colors duration-200 ease-out hover:bg-muted cursor-pointer'
                type='button'
                onClick={() => {
                  setShowUserMenu(v => !v)
                  setShowNotifications(false)
                }}
              >
                <div className='hidden text-right sm:block'>
                  <p className='text-xs font-semibold text-foreground'>
                    {session.user.name || 'User'}
                  </p>
                  <p className='font-mono text-[10px] uppercase tracking-wide text-muted-foreground'>
                    {session.user.role === 'SUPER_ADMIN'
                      ? 'Super admin'
                      : 'Admin'}
                  </p>
                </div>
                <div className='relative flex h-8 w-8 items-center justify-center border border-border bg-background font-mono text-xs font-semibold text-foreground'>
                  {session.user.name?.charAt(0)?.toUpperCase() || 'A'}
                  {session.user.role === 'SUPER_ADMIN' && (
                    <span className='absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center border border-border bg-amber-500'>
                      <Shield className='h-2 w-2 text-white' />
                    </span>
                  )}
                </div>
                <ChevronDown className='hidden h-3.5 w-3.5 text-muted-foreground sm:block' />
              </button>

              {showUserMenu && (
                <div className='absolute right-0 mt-2 w-56 border border-border bg-card shadow-lg'>
                  <div className='border-b border-border px-3 py-3'>
                    <p className='text-sm font-semibold text-foreground'>
                      {session.user.name}
                    </p>
                    {session.user.email && (
                      <p className='mt-0.5 truncate text-xs text-muted-foreground'>
                        {session.user.email}
                      </p>
                    )}
                  </div>
                  <button
                    className='flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-foreground transition-colors duration-200 ease-out hover:bg-muted cursor-pointer'
                    type='button'
                    onClick={() => {
                      setShowUserMenu(false)
                      router.push('/admin/settings')
                    }}
                  >
                    <Settings className='h-4 w-4 text-muted-foreground' />
                    Settings
                  </button>
                  <button
                    className='flex w-full items-center gap-2 border-t border-border px-3 py-2.5 text-left text-sm text-red-600 transition-colors duration-200 ease-out hover:bg-muted dark:text-red-400 cursor-pointer'
                    type='button'
                    onClick={() => {
                      setShowUserMenu(false)
                      setShowLogoutModal(true)
                    }}
                  >
                    <LogOut className='h-4 w-4' />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {showLogoutModal && (
        <ModalDialog
          className='w-full max-w-md shadow-lg backdrop:backdrop-blur-sm'
          labelledBy='logout-title'
          onClose={() => setShowLogoutModal(false)}
        >
          <div className='border-b border-border px-5 py-3'>
            <p className='font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
              Session
            </p>
            <h3
              className='text-base font-semibold text-foreground'
              id='logout-title'
            >
              Sign out?
            </h3>
          </div>
          <div className='px-5 py-5'>
            <p className='text-sm text-muted-foreground'>
              You will need to sign in again to access the control panel.
            </p>
            <div className='mt-5 flex gap-2'>
              <button
                className='inline-flex flex-1 items-center justify-center border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors duration-200 ease-out hover:bg-muted'
                type='button'
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
              <button
                className='inline-flex flex-1 items-center justify-center bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity duration-200 ease-out hover:opacity-90'
                type='button'
                onClick={handleSignOut}
              >
                Sign out
              </button>
            </div>
          </div>
        </ModalDialog>
      )}
    </>
  )
}
