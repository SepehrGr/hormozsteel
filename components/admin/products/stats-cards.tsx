import { Card, CardBody } from '@heroui/card'
import { Package, Layers } from 'lucide-react'

interface Props {
  total: number
  selected: number
}

export default function StatsCards({ total, selected }: Props) {
  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
      <Card className='border-l-4 border-l-blue-500'>
        <CardBody className='flex flex-row items-center justify-between'>
          <div>
            <p className='text-sm text-gray-500 dark:text-gray-400'>
              مجموع محصولات
            </p>
            <p className='text-2xl font-bold text-gray-900 dark:text-white'>
              {total}
            </p>
          </div>
          <div className='p-3 bg-blue-100 rounded-full dark:bg-blue-900'>
            <Package className='w-6 h-6 text-blue-600 dark:text-blue-400' />
          </div>
        </CardBody>
      </Card>

      <Card className='border-l-4 border-l-purple-500'>
        <CardBody className='flex flex-row items-center justify-between'>
          <div>
            <p className='text-sm text-gray-500 dark:text-gray-400'>
              انتخاب شده
            </p>
            <p className='text-2xl font-bold text-purple-600 dark:text-purple-400'>
              {selected}
            </p>
          </div>
          <div className='p-3 bg-purple-100 rounded-full dark:bg-purple-900'>
            <Layers className='w-6 h-6 text-purple-600 dark:text-purple-400' />
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
