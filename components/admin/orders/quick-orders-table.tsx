import type { QuickOrder } from '@prisma/client'

import {
  type Column,
  AdminTable,
  rowClass,
} from '@/components/admin/admin-table'
import { StatusPill } from '@/components/admin/pill'
import { capitalize, formatDateTime } from '@/lib/format'

const columns: Column[] = [
  { label: 'Customer' },
  { label: 'Specs / qty' },
  { label: 'Delivery' },
  { label: 'Status' },
  { label: 'Received' },
]

/** Quote requests from the public order form. */
export function QuickOrdersTable({ orders }: { orders: QuickOrder[] }) {
  return (
    <AdminTable columns={columns}>
      {orders.map(order => (
        <tr key={order.id} className={rowClass}>
          <td className='px-4 py-3'>
            <p className='font-medium text-foreground'>{order.customerName}</p>
            <p className='mt-0.5 text-xs text-muted-foreground'>
              {[order.companyName, order.phoneNumber, order.city]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </td>
          <td className='px-4 py-3'>
            <p className='line-clamp-2 max-w-xs text-foreground'>
              {order.productSpecs}
            </p>
            <p className='mt-0.5 text-xs text-muted-foreground'>
              Qty: {order.quantity}
            </p>
          </td>
          <td className='px-4 py-3 text-xs text-muted-foreground'>
            <p>{capitalize(order.deliveryMethod.toLowerCase())}</p>
            {order.deliveryDate ? (
              <p className='mt-0.5 font-mono tabular-nums'>
                {formatDateTime(order.deliveryDate)}
              </p>
            ) : null}
          </td>
          <td className='px-4 py-3'>
            <StatusPill status={order.status} />
          </td>
          <td className='px-4 py-3 font-mono text-xs tabular-nums text-muted-foreground'>
            {formatDateTime(order.createdAt)}
          </td>
        </tr>
      ))}
    </AdminTable>
  )
}
