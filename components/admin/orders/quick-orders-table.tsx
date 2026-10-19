import type { QuickOrder } from '@prisma/client'

import { deleteQuickOrder } from '@/app/admin/orders/actions'
import {
  type Column,
  AdminTable,
  expandColumn,
} from '@/components/admin/admin-table'
import { DeleteRowButton } from '@/components/admin/delete-row-button'
import { ExpandableRow } from '@/components/admin/expandable-row'
import { QuickOrderStatusSelect } from '@/components/admin/orders/quick-order-status'
import { capitalize, formatDateTime } from '@/lib/format'

const columns: Column[] = [
  expandColumn,
  { label: 'Customer' },
  { label: 'Specs / qty' },
  { label: 'Delivery' },
  { label: 'Status' },
  { label: 'Received' },
  { label: 'Actions', className: 'text-right' },
]

/** Quote requests from the public order form. */
export function QuickOrdersTable({ orders }: { orders: QuickOrder[] }) {
  return (
    <AdminTable columns={columns}>
      {orders.map(order => (
        <ExpandableRow
          key={order.id}
          colSpan={columns.length}
          detail={<OrderDetails order={order} />}
          label={`Details of ${order.customerName}'s request`}
        >
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
            <QuickOrderStatusSelect
              id={order.id}
              name={order.customerName}
              status={order.status}
            />
          </td>
          <td className='px-4 py-3 font-mono text-xs tabular-nums text-muted-foreground'>
            {formatDateTime(order.createdAt)}
          </td>
          <td className='px-4 py-3'>
            <DeleteRowButton
              action={deleteQuickOrder.bind(null, { id: order.id })}
              name={`${order.customerName}'s quote request`}
              noun='quote request'
            />
          </td>
        </ExpandableRow>
      ))}
    </AdminTable>
  )
}

function OrderDetails({ order }: { order: QuickOrder }) {
  const details = [
    ['Specs', order.productSpecs],
    ['Product', order.productName],
    ['Notes', order.additionalNotes],
  ].filter(([, value]) => value)

  return (
    <dl className='grid max-w-3xl gap-3 sm:grid-cols-[6rem_1fr]'>
      {details.map(([label, value]) => (
        <div key={label} className='contents'>
          <dt className='text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground sm:pt-0.5'>
            {label}
          </dt>
          <dd className='whitespace-pre-line text-foreground'>{value}</dd>
        </div>
      ))}
    </dl>
  )
}
