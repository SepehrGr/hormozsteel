import type { QuickOrder } from '@prisma/client'

import { deleteQuickOrder } from '@/app/admin/(panel)/orders/actions'
import {
  type Column,
  actionsColumn,
  AdminTable,
} from '@/components/admin/admin-table'
import { DeleteRowButton } from '@/components/admin/delete-row-button'
import { QuickOrderStatusSelect } from '@/components/admin/orders/quick-order-status'
import { capitalize, formatDateTime } from '@/lib/format'

const columns: Column<QuickOrder>[] = [
  {
    label: 'Customer',
    narrow: 'title',
    cell: order => (
      <>
        <p className='font-medium text-foreground'>{order.customerName}</p>
        <p className='mt-0.5 text-xs text-muted-foreground'>
          {[order.companyName, order.phoneNumber, order.city]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </>
    ),
  },
  {
    label: 'Specs / qty',
    cell: order => (
      <div>
        <p className='line-clamp-2 max-w-xs text-foreground'>
          {order.productSpecs}
        </p>
        <p className='mt-0.5 text-xs text-muted-foreground'>
          Qty: {order.quantity}
        </p>
      </div>
    ),
  },
  {
    label: 'Delivery',
    cellClassName: 'text-xs text-muted-foreground',
    cell: order => (
      <div>
        <p>{capitalize(order.deliveryMethod.toLowerCase())}</p>
        {order.deliveryDate ? (
          <p className='mt-0.5 font-mono tabular-nums'>
            {formatDateTime(order.deliveryDate)}
          </p>
        ) : null}
      </div>
    ),
  },
  {
    label: 'Status',
    narrow: 'summary',
    cell: order => (
      <QuickOrderStatusSelect
        id={order.id}
        name={order.customerName}
        status={order.status}
      />
    ),
  },
  {
    label: 'Received',
    cellClassName: 'font-mono text-xs tabular-nums text-muted-foreground',
    cell: order => formatDateTime(order.createdAt),
  },
  actionsColumn(order => (
    <DeleteRowButton
      action={deleteQuickOrder.bind(null, { id: order.id })}
      name={`${order.customerName}'s quote request`}
      noun='quote request'
    />
  )),
]

/** Quote requests from the public order form. */
export function QuickOrdersTable({ orders }: { orders: QuickOrder[] }) {
  return (
    <AdminTable
      columns={columns}
      detail={order => <OrderDetails order={order} />}
      rowLabel={order => `Details of ${order.customerName}'s request`}
      rows={orders}
    />
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
          <dt className='text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground sm:pt-0.5'>
            {label}
          </dt>
          <dd className='whitespace-pre-line text-foreground'>{value}</dd>
        </div>
      ))}
    </dl>
  )
}
