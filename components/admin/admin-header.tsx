'use client'

import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@heroui/button'
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
} from '@heroui/dropdown'
import {
  LogOut,
  Settings,
  User as UserIcon,
  Bell,
  Mail,
  Shield,
  ChevronDown,
  Package,
} from 'lucide-react'
import { ThemeSwitch } from '@/components/theme-switch'

interface Notification {
  id: string
  type: 'contact' | 'order'
  title: string
  description: string
  time: string
  icon: 'mail' | 'package'
  link: string
}

export default function AdminHeader() {
  const { data: session } = useSession()
  const router = useRouter()
  const [searchOpen, setSearchOpen] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch new notifications
  const fetchNotifications = async () => {
    try {
      // Fetch new contact forms and quick orders in parallel
      const [contactRes, ordersRes] = await Promise.all([
        fetch('/api/contact?status=new&limit=5'),
        fetch('/api/quick-orders?status=pending&limit=5'),
      ])

      const [contactData, ordersData] = await Promise.all([
        contactRes.json(),
        ordersRes.json(),
      ])

      const newNotifications: Notification[] = []

      // Add new contact forms
      if (contactData.success && contactData.data?.contactForms) {
        contactData.data.contactForms.forEach((form: any) => {
          const timeAgo = getTimeAgo(new Date(form.createdAt))
          newNotifications.push({
            id: `contact-${form.id}`,
            type: 'contact',
            title: `پیام جدید از ${form.name}`,
            description: timeAgo,
            time: form.createdAt,
            icon: 'mail',
            link: '/admin/orders',
          })
        })
      }

      // Add new quick orders
      if (ordersData.success && ordersData.data?.quickOrders) {
        ordersData.data.quickOrders.forEach((order: any) => {
          const timeAgo = getTimeAgo(new Date(order.createdAt))
          newNotifications.push({
            id: `order-${order.id}`,
            type: 'order',
            title: `سفارش جدید از ${order.customerName}`,
            description: timeAgo,
            time: order.createdAt,
            icon: 'package',
            link: '/admin/orders',
          })
        })
      }

      // Sort by time (newest first)
      newNotifications.sort(
        (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime(),
      )

      setNotifications(newNotifications.slice(0, 10)) // Max 10 notifications
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get time ago string
  const getTimeAgo = (date: Date): string => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'الان'
    if (diffMins < 60) return `${diffMins} دقیقه پیش`
    if (diffHours < 24) return `${diffHours} ساعت پیش`
    return `${diffDays} روز پیش`
  }

  // Fetch notifications on mount and every 30 seconds
  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000) // 30 seconds
    return () => clearInterval(interval)
  }, [])

  const handleSignOut = () => {
    signOut({ callbackUrl: '/admin/login' })
  }

  const confirmSignOut = () => {
    setShowLogoutModal(true)
  }

  const handleNotificationClick = (link: string) => {
    router.push(link)
  }

  const notificationCount = notifications.length

  return (
    <>
      <header className='sticky top-0 z-40 flex items-center justify-between h-16 px-6 border-b border-gray-100 shadow-sm bg-white/80 backdrop-blur-md dark:bg-gray-900/80 dark:border-gray-800'>
        {/* Left Section - Title & Search */}
        <div className='flex items-center gap-6'>
          <h1 className='text-xl font-bold text-gray-900 dark:text-white'>
            پنل مدیریت
          </h1>
        </div>

        {/* Right Section - Actions & User */}
        <div className='flex items-center gap-3'>
          {/* Notifications */}
          <Dropdown placement='bottom-end'>
            <DropdownTrigger>
              <Button
                isIconOnly
                variant='light'
                className='relative text-gray-600 dark:text-gray-400'
                size='sm'
              >
                <Bell className='w-5 h-5' />
                {notificationCount > 0 && (
                  <span className='absolute top-0 right-0 flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full'>
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label='Notifications' className='w-80'>
              {loading ? (
                <DropdownSection>
                  <DropdownItem key='loading' isReadOnly>
                    <div className='py-4 text-center text-gray-500'>
                      در حال بارگذاری...
                    </div>
                  </DropdownItem>
                </DropdownSection>
              ) : notifications.length === 0 ? (
                <DropdownSection>
                  <DropdownItem key='empty' isReadOnly>
                    <div className='py-8 text-center'>
                      <Bell className='w-12 h-12 mx-auto mb-3 text-gray-300' />
                      <p className='text-sm text-gray-500'>
                        اعلان جدیدی وجود ندارد
                      </p>
                    </div>
                  </DropdownItem>
                </DropdownSection>
              ) : (
                <>
                  <DropdownSection title='اعلان‌های جدید' showDivider>
                    {notifications.map(notif => (
                      <DropdownItem
                        key={notif.id}
                        description={notif.description}
                        onClick={() => handleNotificationClick(notif.link)}
                        startContent={
                          <div
                            className={`flex items-center justify-center w-8 h-8 rounded-full ${
                              notif.icon === 'mail'
                                ? 'bg-green-100 dark:bg-green-900/30'
                                : 'bg-blue-100 dark:bg-blue-900/30'
                            }`}
                          >
                            {notif.icon === 'mail' ? (
                              <Mail
                                className={`w-4 h-4 ${
                                  notif.icon === 'mail'
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-blue-600 dark:text-blue-400'
                                }`}
                              />
                            ) : (
                              <Package
                                className={`w-4 h-4 ${
                                  notif.icon === 'package'
                                    ? 'text-blue-600 dark:text-blue-400'
                                    : 'text-green-600 dark:text-green-400'
                                }`}
                              />
                            )}
                          </div>
                        }
                      >
                        {notif.title}
                      </DropdownItem>
                    ))}
                  </DropdownSection>
                  <DropdownSection>
                    <DropdownItem
                      key='view-all'
                      className='text-center'
                      onClick={() => router.push('/admin/orders')}
                    >
                      مشاهده همه
                    </DropdownItem>
                  </DropdownSection>
                </>
              )}
            </DropdownMenu>
          </Dropdown>

          {/* Theme Toggle */}
          <ThemeSwitch />

          {/* Divider */}
          <div className='w-px h-8 bg-gray-200 dark:bg-gray-700' />

          {/* User Menu */}
          {session?.user && (
            <Dropdown placement='bottom-end'>
              <DropdownTrigger>
                <button className='flex items-center gap-3 px-3 py-2 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800'>
                  <div className='flex items-center gap-3'>
                    <div className='text-right'>
                      <div className='text-sm font-semibold text-gray-900 dark:text-white'>
                        {session.user.name || 'کاربر'}
                      </div>
                      <div className='text-xs text-gray-500 dark:text-gray-400'>
                        {session.user.role === 'SUPER_ADMIN'
                          ? 'مدیر کل'
                          : 'مدیر'}
                      </div>
                    </div>
                    <div className='relative'>
                      <div className='flex items-center justify-center w-10 h-10 text-sm font-bold text-white rounded-full bg-gradient-to-br from-gray-700 to-gray-900 dark:from-gray-600 dark:to-gray-800'>
                        {session.user.name?.charAt(0) || 'A'}
                      </div>
                      {session.user.role === 'SUPER_ADMIN' && (
                        <div className='absolute bottom-0 right-0 flex items-center justify-center w-4 h-4 border-2 border-white rounded-full bg-gradient-to-br from-blue-500 to-blue-600 dark:border-gray-900'>
                          <Shield className='w-2.5 h-2.5 text-white' />
                        </div>
                      )}
                    </div>
                    <ChevronDown className='w-4 h-4 text-gray-400' />
                  </div>
                </button>
              </DropdownTrigger>
              <DropdownMenu aria-label='User menu' className='w-64'>
                <DropdownSection showDivider>
                  <DropdownItem
                    key='info'
                    isReadOnly
                    className='h-auto opacity-100 cursor-default'
                  >
                    <div className='py-2'>
                      <p className='text-sm font-semibold text-gray-900 dark:text-white'>
                        {session.user.name}
                      </p>
                      {session.user.email && (
                        <p className='text-xs text-gray-500 dark:text-gray-400'>
                          {session.user.email}
                        </p>
                      )}
                      <div className='flex items-center gap-1 mt-2'>
                        <Shield className='w-3 h-3 text-gray-400' />
                        <span className='text-xs text-gray-600 dark:text-gray-400'>
                          {session.user.role === 'SUPER_ADMIN'
                            ? 'مدیر کل'
                            : 'مدیر'}
                        </span>
                      </div>
                    </div>
                  </DropdownItem>
                </DropdownSection>
                <DropdownSection showDivider>
                  <DropdownItem
                    key='settings'
                    startContent={<Settings className='w-4 h-4' />}
                    onClick={() => router.push('/admin/settings')}
                  >
                    تنظیمات
                  </DropdownItem>
                </DropdownSection>
                <DropdownSection>
                  <DropdownItem
                    key='logout'
                    className='text-red-600 dark:text-red-400 '
                    startContent={<LogOut className='w-4 h-4' />}
                    onClick={confirmSignOut}
                  >
                    خروج از حساب
                  </DropdownItem>
                </DropdownSection>
              </DropdownMenu>
            </Dropdown>
          )}
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm'>
          <div className='w-full max-w-md p-6 mx-4 bg-white shadow-2xl rounded-2xl dark:bg-gray-800'>
            <div className='flex items-center gap-4 mb-4'>
              <div className='flex items-center justify-center w-12 h-12 bg-red-100 rounded-full dark:bg-red-900/30'>
                <LogOut className='w-6 h-6 text-red-600 dark:text-red-400' />
              </div>
              <div>
                <h3 className='text-lg font-bold text-gray-900 dark:text-white'>
                  خروج از حساب کاربری
                </h3>
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  آیا مطمئن هستید؟
                </p>
              </div>
            </div>
            <p className='mb-6 text-sm text-gray-600 dark:text-gray-400'>
              با خروج از حساب، تمام تغییرات ذخیره نشده از دست می‌رود.
            </p>
            <div className='flex gap-3'>
              <Button
                variant='flat'
                onPress={() => setShowLogoutModal(false)}
                className='flex-1'
              >
                انصراف
              </Button>
              <Button color='danger' onPress={handleSignOut} className='flex-1'>
                خروج
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
