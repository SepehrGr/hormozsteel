'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Package,
  Mail,
  Search,
  Trash2,
  RefreshCw,
  Eye,
  CheckCircle,
  Clock,
  ShoppingCart,
} from 'lucide-react'
import { addToast } from '@heroui/toast'

interface ContactFormSubmission {
  id: string
  name: string
  email?: string
  phone: string
  message: string
  createdAt: string
  status: 'new' | 'read' | 'replied'
}

interface QuickOrderSubmission {
  id: string
  customerName: string
  companyName?: string
  phoneNumber: string
  city: string
  productSpecs: string
  quantity: string
  deliveryDate?: string
  deliveryMethod: 'pickup' | 'delivery'
  additionalNotes?: string
  createdAt: string
  status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled'
}

const fieldClass =
  'w-full border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-200 ease-out focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground'

function formatDate(dateString: string) {
  const date = new Date(dateString)

  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function StatusPill({ status }: { status: string }) {
  const labels: Record<string, string> = {
    new: 'New',
    read: 'Read',
    replied: 'Replied',
    pending: 'Pending',
    confirmed: 'Confirmed',
    processing: 'Processing',
    completed: 'Completed',
    cancelled: 'Cancelled',
  }
  const styles: Record<string, string> = {
    new: 'border-sky-600/30 bg-sky-50 text-sky-900 dark:border-sky-500/30 dark:bg-sky-950/40 dark:text-sky-100',
    read: 'border-border bg-muted text-muted-foreground',
    replied:
      'border-emerald-600/30 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-100',
    pending:
      'border-amber-600/30 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-100',
    confirmed:
      'border-sky-600/30 bg-sky-50 text-sky-900 dark:border-sky-500/30 dark:bg-sky-950/40 dark:text-sky-100',
    processing: 'border-border bg-muted text-foreground',
    completed:
      'border-emerald-600/30 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-100',
    cancelled:
      'border-red-600/30 bg-red-50 text-red-900 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-100',
  }

  return (
    <span
      className={`inline-flex border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
        styles[status] || styles.read
      }`}
    >
      {labels[status] || status}
    </span>
  )
}

export default function OrdersManagementPage() {
  const [activeTab, setActiveTab] = useState<'contact' | 'quick'>('quick')
  const [contactForms, setContactForms] = useState<ContactFormSubmission[]>([])
  const [quickOrders, setQuickOrders] = useState<QuickOrderSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [detailOrder, setDetailOrder] = useState<QuickOrderSubmission | null>(
    null,
  )
  const [detailContact, setDetailContact] =
    useState<ContactFormSubmission | null>(null)

  const fetchContactForms = async () => {
    try {
      const response = await fetch(
        `/api/contact?status=${statusFilter === 'all' ? 'all' : statusFilter}`,
      )
      const data = await response.json()

      if (data.success) {
        setContactForms(
          data.data.contactForms.map((form: Record<string, string>) => ({
            id: form.id,
            name: form.name,
            email: form.email,
            phone: form.phone,
            message: form.message,
            createdAt: form.createdAt,
            status: String(form.status).toLowerCase(),
          })),
        )
      }
    } catch (error) {
      console.error('Error fetching contact forms:', error)
    }
  }

  const fetchQuickOrders = async () => {
    try {
      const response = await fetch(
        `/api/quick-orders?status=${statusFilter === 'all' ? 'all' : statusFilter}`,
      )
      const data = await response.json()

      if (data.success) {
        setQuickOrders(
          data.data.quickOrders.map((order: Record<string, string>) => ({
            id: order.id,
            customerName: order.customerName,
            companyName: order.companyName,
            phoneNumber: order.phoneNumber,
            city: order.city,
            productSpecs: order.productSpecs,
            quantity: order.quantity,
            deliveryDate: order.deliveryDate,
            deliveryMethod: String(order.deliveryMethod).toLowerCase(),
            additionalNotes: order.additionalNotes,
            createdAt: order.createdAt,
            status: String(order.status).toLowerCase(),
          })),
        )
      }
    } catch (error) {
      console.error('Error fetching quick orders:', error)
    }
  }

  const loadData = async () => {
    setLoading(true)
    await Promise.all([fetchContactForms(), fetchQuickOrders()])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [statusFilter])

  const handleDeleteContactForm = async (id: string) => {
    if (!confirm('Delete this contact message?')) return
    try {
      const response = await fetch(`/api/contact?id=${id}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (data.success) {
        addToast({
          title: 'Deleted',
          description: 'Message removed',
          color: 'success',
        })
        await fetchContactForms()
        setDetailContact(null)
      } else {
        addToast({
          title: 'Error',
          description: 'Could not delete',
          color: 'danger',
        })
      }
    } catch {
      addToast({
        title: 'Error',
        description: 'Could not delete',
        color: 'danger',
      })
    }
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await fetch('/api/contact', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'READ' }),
      })
      const data = await response.json()

      if (data.success) await fetchContactForms()
    } catch (error) {
      console.error('Error updating contact form:', error)
    }
  }

  const handleMarkReplied = async (id: string) => {
    try {
      const response = await fetch('/api/contact', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'REPLIED' }),
      })
      const data = await response.json()

      if (data.success) {
        await fetchContactForms()
        setDetailContact(prev =>
          prev && prev.id === id ? { ...prev, status: 'replied' } : prev,
        )
      }
    } catch (error) {
      console.error('Error updating contact form:', error)
    }
  }

  const handleDeleteQuickOrder = async (id: string) => {
    if (!confirm('Delete this quote request?')) return
    try {
      const response = await fetch(`/api/quick-orders?id=${id}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (data.success) {
        addToast({
          title: 'Deleted',
          description: 'Request removed',
          color: 'success',
        })
        await fetchQuickOrders()
        setDetailOrder(null)
      } else {
        addToast({
          title: 'Error',
          description: 'Could not delete',
          color: 'danger',
        })
      }
    } catch {
      addToast({
        title: 'Error',
        description: 'Could not delete',
        color: 'danger',
      })
    }
  }

  const handleUpdateOrderStatus = async (id: string, status: string) => {
    try {
      const response = await fetch('/api/quick-orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      const data = await response.json()

      if (data.success) {
        await fetchQuickOrders()
        setDetailOrder(prev =>
          prev && prev.id === id
            ? {
                ...prev,
                status: status.toLowerCase() as QuickOrderSubmission['status'],
              }
            : prev,
        )
      } else {
        addToast({
          title: 'Error',
          description: 'Could not update status',
          color: 'danger',
        })
      }
    } catch {
      addToast({
        title: 'Error',
        description: 'Could not update status',
        color: 'danger',
      })
    }
  }

  const filteredContactForms = useMemo(
    () =>
      contactForms.filter(form => {
        const q = searchQuery.toLowerCase()
        const matchesSearch =
          !q ||
          form.name.toLowerCase().includes(q) ||
          (form.email && form.email.toLowerCase().includes(q)) ||
          form.phone.includes(searchQuery) ||
          form.message.toLowerCase().includes(q)
        const matchesStatus =
          statusFilter === 'all' || form.status === statusFilter

        return matchesSearch && matchesStatus
      }),
    [contactForms, searchQuery, statusFilter],
  )

  const filteredQuickOrders = useMemo(
    () =>
      quickOrders.filter(order => {
        const q = searchQuery.toLowerCase()
        const matchesSearch =
          !q ||
          order.customerName.toLowerCase().includes(q) ||
          order.phoneNumber.includes(searchQuery) ||
          order.productSpecs.toLowerCase().includes(q) ||
          (order.companyName && order.companyName.toLowerCase().includes(q))
        const matchesStatus =
          statusFilter === 'all' || order.status === statusFilter

        return matchesSearch && matchesStatus
      }),
    [quickOrders, searchQuery, statusFilter],
  )

  const pendingCount = quickOrders.filter(o => o.status === 'pending').length
  const newMessages = contactForms.filter(f => f.status === 'new').length

  const applySearch = () => setSearchQuery(searchTerm)

  return (
    <div className='space-y-6' dir='ltr'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <p className='font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground'>
            Desk
          </p>
          <h1 className='flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground'>
            <ShoppingCart className='h-6 w-6' />
            Orders &amp; inquiries
          </h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            Quote requests and contact form submissions from the public site.
          </p>
        </div>
        <button
          className='inline-flex items-center gap-2 border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors duration-200 ease-out hover:bg-muted'
          type='button'
          onClick={loadData}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-2 gap-px overflow-hidden border border-border bg-border sm:grid-cols-4'>
        {[
          {
            label: 'Quote requests',
            value: quickOrders.length,
            icon: Package,
          },
          {
            label: 'Contact forms',
            value: contactForms.length,
            icon: Mail,
          },
          {
            label: 'Pending quotes',
            value: pendingCount,
            icon: Clock,
          },
          {
            label: 'New messages',
            value: newMessages,
            icon: Mail,
          },
        ].map(stat => {
          const Icon = stat.icon

          return (
            <div key={stat.label} className='bg-card px-4 py-4'>
              <div className='flex items-start justify-between gap-2'>
                <p className='text-[10px] font-medium uppercase tracking-wide text-muted-foreground'>
                  {stat.label}
                </p>
                <Icon className='h-4 w-4 text-muted-foreground' />
              </div>
              <p className='mt-2 font-mono text-2xl font-semibold tabular-nums text-foreground'>
                {loading ? '—' : stat.value.toLocaleString('en-US')}
              </p>
            </div>
          )
        })}
      </div>

      {/* Tabs + filters */}
      <div className='border border-border bg-card'>
        <div className='flex flex-wrap items-center gap-0 border-b border-border'>
          <button
            className={`px-4 py-3 text-sm font-medium transition-colors duration-200 ease-out ${
              activeTab === 'quick'
                ? 'border-b-2 border-foreground text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            type='button'
            onClick={() => {
              setActiveTab('quick')
              setStatusFilter('all')
            }}
          >
            Quote requests
            <span className='ml-2 font-mono text-xs tabular-nums text-muted-foreground'>
              {quickOrders.length}
            </span>
          </button>
          <button
            className={`px-4 py-3 text-sm font-medium transition-colors duration-200 ease-out ${
              activeTab === 'contact'
                ? 'border-b-2 border-foreground text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            type='button'
            onClick={() => {
              setActiveTab('contact')
              setStatusFilter('all')
            }}
          >
            Contact forms
            <span className='ml-2 font-mono text-xs tabular-nums text-muted-foreground'>
              {contactForms.length}
            </span>
          </button>
        </div>

        <div className='flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center'>
          <div className='relative min-w-0 flex-1 sm:max-w-md'>
            <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <input
              className={`${fieldClass} pl-9`}
              placeholder={
                activeTab === 'quick'
                  ? 'Search name, phone, specs…'
                  : 'Search name, phone, message…'
              }
              type='search'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applySearch()}
            />
          </div>
          <select
            className={`${fieldClass} sm:w-44`}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value='all'>All statuses</option>
            {activeTab === 'quick' ? (
              <>
                <option value='pending'>Pending</option>
                <option value='confirmed'>Confirmed</option>
                <option value='processing'>Processing</option>
                <option value='completed'>Completed</option>
                <option value='cancelled'>Cancelled</option>
              </>
            ) : (
              <>
                <option value='new'>New</option>
                <option value='read'>Read</option>
                <option value='replied'>Replied</option>
              </>
            )}
          </select>
          <div className='flex gap-2'>
            <button
              className='inline-flex items-center gap-2 border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors duration-200 ease-out hover:bg-muted'
              type='button'
              onClick={applySearch}
            >
              <Search className='h-4 w-4' />
              Search
            </button>
            {(searchTerm || searchQuery) && (
              <button
                className='border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors duration-200 ease-out hover:bg-muted'
                type='button'
                onClick={() => {
                  setSearchTerm('')
                  setSearchQuery('')
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content board */}
      <div className='border border-border bg-card'>
        <div className='flex items-center gap-2 border-b border-border px-4 py-3'>
          {activeTab === 'quick' ? (
            <Package className='h-4 w-4 text-muted-foreground' />
          ) : (
            <Mail className='h-4 w-4 text-muted-foreground' />
          )}
          <h3 className='font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
            {activeTab === 'quick' ? 'Quote requests' : 'Contact forms'} (
            {activeTab === 'quick'
              ? filteredQuickOrders.length
              : filteredContactForms.length}
            )
          </h3>
        </div>

        {loading ? (
          <div className='flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground'>
            <RefreshCw className='h-4 w-4 animate-spin' />
            Loading…
          </div>
        ) : activeTab === 'quick' ? (
          filteredQuickOrders.length === 0 ? (
            <div className='px-4 py-16 text-center text-sm text-muted-foreground'>
              No quote requests match your filters.
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full min-w-[880px] text-sm'>
                <thead>
                  <tr className='border-b border-border bg-muted/50 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground'>
                    <th className='px-4 py-2.5'>Customer</th>
                    <th className='px-4 py-2.5'>Specs / qty</th>
                    <th className='px-4 py-2.5'>Delivery</th>
                    <th className='px-4 py-2.5'>Status</th>
                    <th className='px-4 py-2.5'>Received</th>
                    <th className='px-4 py-2.5 text-right'>Actions</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-border'>
                  {filteredQuickOrders.map(order => (
                    <tr
                      key={order.id}
                      className='transition-colors duration-200 ease-out hover:bg-muted/40'
                    >
                      <td className='px-4 py-3'>
                        <p className='font-medium text-foreground'>
                          {order.customerName}
                        </p>
                        <p className='mt-0.5 text-xs text-muted-foreground'>
                          {order.companyName ? `${order.companyName} · ` : ''}
                          {order.phoneNumber}
                          {order.city ? ` · ${order.city}` : ''}
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
                        <p>
                          {order.deliveryMethod === 'delivery'
                            ? 'Delivery'
                            : 'Pickup'}
                        </p>
                        {order.deliveryDate ? (
                          <p className='mt-0.5 font-mono tabular-nums'>
                            {formatDate(order.deliveryDate)}
                          </p>
                        ) : null}
                      </td>
                      <td className='px-4 py-3'>
                        <StatusPill status={order.status} />
                      </td>
                      <td className='px-4 py-3 font-mono text-xs tabular-nums text-muted-foreground'>
                        {formatDate(order.createdAt)}
                      </td>
                      <td className='px-4 py-3'>
                        <div className='flex items-center justify-end gap-1'>
                          <button
                            aria-label='View'
                            className='inline-flex h-8 w-8 items-center justify-center border border-border bg-background text-foreground transition-colors duration-200 ease-out hover:bg-muted'
                            type='button'
                            onClick={() => setDetailOrder(order)}
                          >
                            <Eye className='h-3.5 w-3.5' />
                          </button>
                          {order.status === 'pending' && (
                            <button
                              className='inline-flex h-8 items-center gap-1 border border-border bg-background px-2 text-xs font-medium text-foreground transition-colors duration-200 ease-out hover:bg-muted'
                              type='button'
                              onClick={() =>
                                handleUpdateOrderStatus(order.id, 'CONFIRMED')
                              }
                            >
                              <CheckCircle className='h-3.5 w-3.5' />
                              Confirm
                            </button>
                          )}
                          {order.status === 'confirmed' && (
                            <button
                              className='inline-flex h-8 items-center border border-border bg-background px-2 text-xs font-medium text-foreground transition-colors duration-200 ease-out hover:bg-muted'
                              type='button'
                              onClick={() =>
                                handleUpdateOrderStatus(order.id, 'PROCESSING')
                              }
                            >
                              Process
                            </button>
                          )}
                          {order.status === 'processing' && (
                            <button
                              className='inline-flex h-8 items-center border border-border bg-background px-2 text-xs font-medium text-foreground transition-colors duration-200 ease-out hover:bg-muted'
                              type='button'
                              onClick={() =>
                                handleUpdateOrderStatus(order.id, 'COMPLETED')
                              }
                            >
                              Complete
                            </button>
                          )}
                          <button
                            aria-label='Delete'
                            className='inline-flex h-8 w-8 items-center justify-center border border-border bg-background text-red-700 transition-colors duration-200 ease-out hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40'
                            type='button'
                            onClick={() => handleDeleteQuickOrder(order.id)}
                          >
                            <Trash2 className='h-3.5 w-3.5' />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : filteredContactForms.length === 0 ? (
          <div className='px-4 py-16 text-center text-sm text-muted-foreground'>
            No contact messages match your filters.
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full min-w-[720px] text-sm'>
              <thead>
                <tr className='border-b border-border bg-muted/50 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground'>
                  <th className='px-4 py-2.5'>From</th>
                  <th className='px-4 py-2.5'>Message</th>
                  <th className='px-4 py-2.5'>Status</th>
                  <th className='px-4 py-2.5'>Received</th>
                  <th className='px-4 py-2.5 text-right'>Actions</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-border'>
                {filteredContactForms.map(form => (
                  <tr
                    key={form.id}
                    className='transition-colors duration-200 ease-out hover:bg-muted/40'
                  >
                    <td className='px-4 py-3'>
                      <p className='font-medium text-foreground'>{form.name}</p>
                      <p className='mt-0.5 text-xs text-muted-foreground'>
                        {form.phone}
                        {form.email ? ` · ${form.email}` : ''}
                      </p>
                    </td>
                    <td className='px-4 py-3'>
                      <p className='line-clamp-2 max-w-md text-muted-foreground'>
                        {form.message}
                      </p>
                    </td>
                    <td className='px-4 py-3'>
                      <StatusPill status={form.status} />
                    </td>
                    <td className='px-4 py-3 font-mono text-xs tabular-nums text-muted-foreground'>
                      {formatDate(form.createdAt)}
                    </td>
                    <td className='px-4 py-3'>
                      <div className='flex items-center justify-end gap-1'>
                        <button
                          aria-label='View'
                          className='inline-flex h-8 w-8 items-center justify-center border border-border bg-background text-foreground transition-colors duration-200 ease-out hover:bg-muted'
                          type='button'
                          onClick={() => {
                            setDetailContact(form)
                            if (form.status === 'new') handleMarkAsRead(form.id)
                          }}
                        >
                          <Eye className='h-3.5 w-3.5' />
                        </button>
                        <button
                          aria-label='Delete'
                          className='inline-flex h-8 w-8 items-center justify-center border border-border bg-background text-red-700 transition-colors duration-200 ease-out hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40'
                          type='button'
                          onClick={() => handleDeleteContactForm(form.id)}
                        >
                          <Trash2 className='h-3.5 w-3.5' />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quote detail modal */}
      {detailOrder && (
        <DetailModal title='Quote request' onClose={() => setDetailOrder(null)}>
          <dl className='grid gap-3 text-sm sm:grid-cols-2'>
            <DetailRow label='Customer' value={detailOrder.customerName} />
            <DetailRow label='Company' value={detailOrder.companyName || '—'} />
            <DetailRow label='Phone' value={detailOrder.phoneNumber} />
            <DetailRow label='City' value={detailOrder.city} />
            <DetailRow
              label='Delivery'
              value={
                detailOrder.deliveryMethod === 'delivery'
                  ? 'Delivery'
                  : 'Pickup'
              }
            />
            <DetailRow
              label='Status'
              value={<StatusPill status={detailOrder.status} />}
            />
            <div className='sm:col-span-2'>
              <DetailRow
                label='Product specs'
                value={detailOrder.productSpecs}
              />
            </div>
            <DetailRow label='Quantity' value={detailOrder.quantity} />
            <DetailRow
              label='Received'
              value={formatDate(detailOrder.createdAt)}
            />
            {detailOrder.additionalNotes ? (
              <div className='sm:col-span-2'>
                <DetailRow label='Notes' value={detailOrder.additionalNotes} />
              </div>
            ) : null}
          </dl>
          <div className='mt-6 flex flex-wrap justify-end gap-2 border-t border-border pt-4'>
            {detailOrder.status === 'pending' && (
              <button
                className='border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-muted'
                type='button'
                onClick={() =>
                  handleUpdateOrderStatus(detailOrder.id, 'CONFIRMED')
                }
              >
                Confirm
              </button>
            )}
            {detailOrder.status === 'confirmed' && (
              <button
                className='border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-muted'
                type='button'
                onClick={() =>
                  handleUpdateOrderStatus(detailOrder.id, 'PROCESSING')
                }
              >
                Start processing
              </button>
            )}
            {detailOrder.status === 'processing' && (
              <button
                className='border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-muted'
                type='button'
                onClick={() =>
                  handleUpdateOrderStatus(detailOrder.id, 'COMPLETED')
                }
              >
                Mark completed
              </button>
            )}
            <button
              className='bg-red-700 px-3 py-2 text-sm font-medium text-white hover:opacity-90 dark:bg-red-600'
              type='button'
              onClick={() => handleDeleteQuickOrder(detailOrder.id)}
            >
              Delete
            </button>
          </div>
        </DetailModal>
      )}

      {/* Contact detail modal */}
      {detailContact && (
        <DetailModal
          title='Contact message'
          onClose={() => setDetailContact(null)}
        >
          <dl className='grid gap-3 text-sm sm:grid-cols-2'>
            <DetailRow label='Name' value={detailContact.name} />
            <DetailRow label='Phone' value={detailContact.phone} />
            <DetailRow label='Email' value={detailContact.email || '—'} />
            <DetailRow
              label='Status'
              value={<StatusPill status={detailContact.status} />}
            />
            <DetailRow
              label='Received'
              value={formatDate(detailContact.createdAt)}
            />
            <div className='sm:col-span-2'>
              <p className='text-[10px] font-medium uppercase tracking-wide text-muted-foreground'>
                Message
              </p>
              <p className='mt-1.5 whitespace-pre-wrap border border-border bg-muted/30 px-3 py-3 text-sm leading-relaxed text-foreground'>
                {detailContact.message}
              </p>
            </div>
          </dl>
          <div className='mt-6 flex flex-wrap justify-end gap-2 border-t border-border pt-4'>
            {detailContact.status !== 'replied' && (
              <button
                className='border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-muted'
                type='button'
                onClick={() => handleMarkReplied(detailContact.id)}
              >
                Mark replied
              </button>
            )}
            <button
              className='bg-red-700 px-3 py-2 text-sm font-medium text-white hover:opacity-90 dark:bg-red-600'
              type='button'
              onClick={() => handleDeleteContactForm(detailContact.id)}
            >
              Delete
            </button>
          </div>
        </DetailModal>
      )}
    </div>
  )
}

function DetailRow({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div>
      <dt className='text-[10px] font-medium uppercase tracking-wide text-muted-foreground'>
        {label}
      </dt>
      <dd className='mt-1 text-foreground'>{value}</dd>
    </div>
  )
}

function DetailModal({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div
      aria-modal='true'
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'
      role='dialog'
    >
      <div className='max-h-[90vh] w-full max-w-lg overflow-y-auto border border-border bg-card shadow-sm'>
        <div className='flex items-center justify-between border-b border-border px-5 py-3'>
          <h2 className='font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
            {title}
          </h2>
          <button
            className='border border-border bg-background px-2 py-1 text-xs font-medium text-foreground hover:bg-muted'
            type='button'
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className='px-5 py-5'>{children}</div>
      </div>
    </div>
  )
}
