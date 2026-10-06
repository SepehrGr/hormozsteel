import Link from 'next/link'
import {
  Package,
  FolderTree,
  Building2,
  ShoppingCart,
  Users,
  Clock,
  DollarSign,
  ArrowRight,
} from 'lucide-react'

import { prisma } from '@/lib/prisma'
import { formatUsd, formatDate, formatNumber } from '@/lib/format'

async function getDashboardStats() {
  const [
    totalProducts,
    totalCategories,
    totalManufacturers,
    totalOrders,
    totalCustomers,
    pendingOrders,
    totalRevenue,
    recentOrders,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.manufacturer.count(),
    prisma.order.count(),
    prisma.customer.count(),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.aggregate({ _sum: { totalAmount: true } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    }),
  ])

  return {
    totalProducts,
    totalCategories,
    totalManufacturers,
    totalOrders,
    totalCustomers,
    pendingOrders,
    totalRevenue: totalRevenue._sum.totalAmount || 0,
    recentOrders,
  }
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

  const statCards = [
    {
      title: 'Products',
      value: formatNumber(stats.totalProducts),
      icon: Package,
      href: '/admin/products',
    },
    {
      title: 'Categories',
      value: formatNumber(stats.totalCategories),
      icon: FolderTree,
      href: '/admin/categories',
    },
    {
      title: 'Manufacturers',
      value: formatNumber(stats.totalManufacturers),
      icon: Building2,
      href: '/admin/manufacturers',
    },
    {
      title: 'Orders',
      value: formatNumber(stats.totalOrders),
      icon: ShoppingCart,
      href: '/admin/orders',
    },
    {
      title: 'Customers',
      value: formatNumber(stats.totalCustomers),
      icon: Users,
      href: '/admin/orders',
    },
    {
      title: 'Pending',
      value: formatNumber(stats.pendingOrders),
      icon: Clock,
      href: '/admin/orders',
    },
    {
      title: 'Revenue',
      value: formatUsd(Number(stats.totalRevenue), { whole: true }),
      icon: DollarSign,
      href: '/admin/orders',
    },
  ]

  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <p className='font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground'>
            Overview
          </p>
          <h1 className='text-2xl font-semibold tracking-tight text-foreground'>
            Dashboard
          </h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            Catalog and desk snapshot for the Hormoz Steel demo.
          </p>
        </div>
        <Link
          className='inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline-offset-4 transition-colors duration-200 ease-out hover:underline'
          href='/admin/products'
        >
          Manage products
          <ArrowRight className='h-3.5 w-3.5' />
        </Link>
      </div>

      <div className='grid grid-cols-2 gap-px overflow-hidden border border-border bg-border sm:grid-cols-3 lg:grid-cols-4'>
        {statCards.map(stat => {
          const Icon = stat.icon

          return (
            <Link
              key={stat.title}
              className='group bg-card px-4 py-4 transition-colors duration-200 ease-out hover:bg-muted'
              href={stat.href}
            >
              <div className='flex items-start justify-between gap-2'>
                <p className='text-[10px] font-medium uppercase tracking-wide text-muted-foreground'>
                  {stat.title}
                </p>
                <Icon className='h-4 w-4 text-muted-foreground transition-colors duration-200 ease-out group-hover:text-amber-800 dark:group-hover:text-amber-500' />
              </div>
              <p className='mt-2 font-mono text-2xl font-semibold tabular-nums tracking-tight text-foreground'>
                {stat.value}
              </p>
            </Link>
          )
        })}
      </div>

      <section className='border border-border bg-card'>
        <div className='flex items-center justify-between border-b border-border px-4 py-3'>
          <h2 className='font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
            Recent orders
          </h2>
          <Link
            className='text-xs font-medium text-muted-foreground underline-offset-4 transition-colors duration-200 ease-out hover:text-foreground hover:underline'
            href='/admin/orders'
          >
            View all
          </Link>
        </div>

        {stats.recentOrders.length === 0 ? (
          <div className='px-4 py-12 text-center text-sm text-muted-foreground'>
            No orders yet. Quote requests from the public site will appear here.
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full min-w-[560px] text-sm'>
              <thead>
                <tr className='border-b border-border bg-muted/50 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground'>
                  <th className='px-4 py-2.5'>Order</th>
                  <th className='px-4 py-2.5'>Customer</th>
                  <th className='px-4 py-2.5 text-center'>Lines</th>
                  <th className='px-4 py-2.5 text-right'>Total</th>
                  <th className='px-4 py-2.5 text-right'>Date</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-border'>
                {stats.recentOrders.map(order => (
                  <tr
                    key={order.id}
                    className='transition-colors duration-200 ease-out hover:bg-muted/40'
                  >
                    <td className='px-4 py-3 font-mono text-xs font-medium text-foreground'>
                      #{order.orderNumber}
                    </td>
                    <td className='px-4 py-3 text-foreground'>
                      {order.customer.name}
                    </td>
                    <td className='px-4 py-3 text-center tabular-nums text-muted-foreground'>
                      {order.items.length}
                    </td>
                    <td className='px-4 py-3 text-right font-medium tabular-nums text-foreground'>
                      {formatUsd(Number(order.totalAmount), { whole: true })}
                    </td>
                    <td className='px-4 py-3 text-right text-muted-foreground'>
                      {formatDate(order.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
