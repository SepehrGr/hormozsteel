import { Card, CardBody, CardHeader } from '@heroui/card'
import { prisma } from '@/lib/prisma'
import {
  Package,
  FolderTree,
  Building2,
  ShoppingCart,
  Users,
  TrendingUp,
  DollarSign,
  Clock,
} from 'lucide-react'

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
    prisma.productCategory.count(),
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
      title: 'کل محصولات',
      value: stats.totalProducts.toLocaleString(),
      icon: Package,
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'دسته‌بندی‌ها',
      value: stats.totalCategories.toLocaleString(),
      icon: FolderTree,
      color: 'text-green-600 dark:text-green-400',
    },
    {
      title: 'تولیدکنندگان',
      value: stats.totalManufacturers.toLocaleString(),
      icon: Building2,
      color: 'text-purple-600 dark:text-purple-400',
    },
    {
      title: 'کل سفارشات',
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      color: 'text-orange-600 dark:text-orange-400',
    },
    {
      title: 'مشتریان',
      value: stats.totalCustomers.toLocaleString(),
      icon: Users,
      color: 'text-indigo-600 dark:text-indigo-400',
    },
    {
      title: 'سفارشات در انتظار',
      value: stats.pendingOrders.toLocaleString(),
      icon: Clock,
      color: 'text-yellow-600 dark:text-yellow-400',
    },
    {
      title: 'کل درآمد',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600 dark:text-green-400',
    },
    {
      title: 'رشد',
      value: '+12.5%',
      icon: TrendingUp,
      color: 'text-emerald-600 dark:text-emerald-400',
    },
  ]

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
          داشبورد
        </h1>
        <p className='text-gray-500 dark:text-gray-400'>
          خوش آمدید! در اینجا آخرین وضعیت فروشگاه شما را مشاهده می‌کنید.
        </p>
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className='hover:shadow-lg transition-shadow'>
              <CardBody className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                      {stat.title}
                    </p>
                    <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                      {stat.value}
                    </p>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardBody>
            </Card>
          )
        })}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <h2 className='text-xl font-semibold'>آخرین سفارشات</h2>
        </CardHeader>
        <CardBody>
          <div className='space-y-4'>
            {stats.recentOrders.map(order => (
              <div
                key={order.id}
                className='flex items-center justify-between p-4 border rounded-lg'
              >
                <div>
                  <p className='font-medium'>سفارش #{order.orderNumber}</p>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    {order.customer.name} • {order.items.length} آیتم
                  </p>
                </div>
                <div className='text-left'>
                  <p className='font-medium'>
                    ${order.totalAmount.toLocaleString()}
                  </p>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    {new Date(order.createdAt).toLocaleDateString('fa-IR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
