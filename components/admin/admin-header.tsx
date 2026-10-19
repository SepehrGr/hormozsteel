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
  Menu,
  Package,
  X,
} from 'lucide-react'

import { ThemeSwitch } from '@/components/layout/theme-switch'
import ModalDialog from '@/components/ui/modal-dialog'
import { useNotifications } from '@/hooks/use-api'

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

const iconButtonClass =
  'relative flex h-8 w-8 cursor-pointer items-center justify-center border border-border bg-card text-muted-foreground transition-colors duration-200 ease-out hover:bg-muted hover:text-foreground pointer-coarse:h-11 pointer-coarse:w-11'

export default function AdminHeader({
  onOpenMenu,
}: {
  onOpenMenu: () => void
}) {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { notifications, isLoading } = useNotifications()
  const items = notifications?.items ?? []
  const notificationCount = notifications?.count ?? 0

  useEffect(() => {
    setShowNotifications(false)
    setShowUserMenu(false)
  }, [pathname])

  const handleSignOut = () => {
    signOut({ callbackUrl: '/admin/login' })
  }

  return (
    <>
      <header className='sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur md:px-6'>
        <button
          aria-label='Open menu'
          className={`${iconButtonClass} lg:invisible`}
          type='button'
          onClick={onOpenMenu}
        >
          <Menu className='h-4.5 w-4.5' />
        </button>

        <div className='flex items-center justify-end gap-2'>
          {/* Notifications */}
          <div className='relative'>
            <button
              aria-label={
                notificationCount
                  ? `Notifications, ${notificationCount} waiting`
                  : 'Notifications'
              }
              className={iconButtonClass}
              type='button'
              onClick={() => {
                setShowNotifications(v => !v)
                setShowUserMenu(false)
              }}
            >
              <Bell className='h-4.5 w-4.5' />
              {notificationCount > 0 && (
                <span className='absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center bg-red-600 px-1 font-mono text-[11px] font-semibold text-white'>
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className='fixed inset-x-4 top-14 mt-2 border border-border bg-card shadow-lg sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:w-80'>
                <div className='flex items-center justify-between border-b border-border px-3 py-2.5'>
                  <p className='font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
                    Inbox
                  </p>
                  <button
                    aria-label='Close'
                    className='flex cursor-pointer items-center justify-center text-muted-foreground hover:text-foreground pointer-coarse:-m-3 pointer-coarse:h-11 pointer-coarse:w-11'
                    type='button'
                    onClick={() => setShowNotifications(false)}
                  >
                    <X className='h-4 w-4' />
                  </button>
                </div>
                <div className='max-h-80 overflow-y-auto'>
                  {isLoading ? (
                    <p className='px-4 py-6 text-center text-sm text-muted-foreground'>
                      Loading…
                    </p>
                  ) : items.length === 0 ? (
                    <div className='px-4 py-8 text-center'>
                      <Bell className='mx-auto mb-2 h-8 w-8 text-muted-foreground/40' />
                      <p className='text-sm text-muted-foreground'>
                        No new notifications
                      </p>
                    </div>
                  ) : (
                    <ul className='divide-y divide-border'>
                      {items.map(item => (
                        <li key={`${item.type}-${item.id}`}>
                          <button
                            className='flex w-full items-start gap-3 px-3 py-3 text-left transition-colors duration-200 ease-out hover:bg-muted cursor-pointer'
                            type='button'
                            onClick={() => {
                              setShowNotifications(false)
                              router.push(
                                item.type === 'contact'
                                  ? '/admin/orders?tab=contact'
                                  : '/admin/orders',
                              )
                            }}
                          >
                            <span className='mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center border border-border bg-background'>
                              {item.type === 'contact' ? (
                                <Mail className='h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400' />
                              ) : (
                                <Package className='h-3.5 w-3.5 text-amber-800 dark:text-amber-500' />
                              )}
                            </span>
                            <span className='min-w-0'>
                              <span className='block text-sm font-medium text-foreground'>
                                {item.type === 'contact'
                                  ? `Message from ${item.name}`
                                  : `Quote from ${item.name}`}
                              </span>
                              <span className='mt-0.5 block text-xs text-muted-foreground'>
                                {getTimeAgo(new Date(item.createdAt))}
                              </span>
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {items.length > 0 && (
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

          <ThemeSwitch
            classNames={{ wrapper: 'pointer-coarse:h-11 pointer-coarse:w-11' }}
          />

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
                  <p className='font-mono text-[11px] uppercase tracking-wide text-muted-foreground'>
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
            <p className='font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
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
