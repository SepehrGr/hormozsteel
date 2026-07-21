'use client'

import { useState, useEffect } from 'react'
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Factory,
  RefreshCw,
  X,
  Save,
  Globe,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react'
import { addToast } from '@heroui/toast'

interface Manufacturer {
  id: string
  name: string
  slug: string
  description: string | null
  logo: string | null
  website: string | null
  email: string | null
  phone: string | null
  address: string | null
  products?: string[] | { id: string }[]
  _count?: { products: number }
  createdAt: string
  updatedAt: string
}

const emptyForm = {
  name: '',
  slug: '',
  description: '',
  website: '',
  email: '',
  phone: '',
  address: '',
}

const fieldClass =
  'mt-1.5 w-full border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-200 ease-out focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground disabled:opacity-50'

const labelClass =
  'block text-xs font-medium uppercase tracking-wide text-muted-foreground'

function productCount(m: Manufacturer) {
  if (typeof m._count?.products === 'number') return m._count.products
  if (Array.isArray(m.products)) return m.products.length
  return 0
}

export default function ManufacturersPage() {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selected, setSelected] = useState<Manufacturer | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [addLoading, setAddLoading] = useState(false)
  const [editForm, setEditForm] = useState(emptyForm)
  const [addForm, setAddForm] = useState(emptyForm)

  const fetchManufacturers = async (search = '') => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        ...(search && { search }),
      })
      const response = await fetch(`/api/manufacturers?${params}`)
      const result = await response.json()

      if (result.success) {
        setManufacturers(result.data.manufacturers || result.data)
      } else {
        addToast({
          title: 'Error',
          description: 'Could not load manufacturers',
          color: 'danger',
        })
      }
    } catch (error) {
      console.error('Error fetching manufacturers:', error)
      addToast({
        title: 'Error',
        description: 'Server connection failed',
        color: 'danger',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchManufacturers()
  }, [])

  const handleSearch = () => fetchManufacturers(searchQuery)

  const handleEditClick = (m: Manufacturer) => {
    setSelected(m)
    setEditForm({
      name: m.name,
      slug: m.slug,
      description: m.description || '',
      website: m.website || '',
      email: m.email || '',
      phone: m.phone || '',
      address: m.address || '',
    })
    setEditModalOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!selected) return
    if (!editForm.name.trim()) {
      addToast({
        title: 'Validation',
        description: 'Name is required',
        color: 'warning',
      })
      return
    }
    try {
      setSaveLoading(true)
      const response = await fetch(`/api/manufacturers/${selected.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name.trim(),
          slug:
            editForm.slug.trim() ||
            editForm.name.trim().toLowerCase().replace(/\s+/g, '-'),
          description: editForm.description.trim() || null,
          website: editForm.website.trim() || null,
          email: editForm.email.trim() || null,
          phone: editForm.phone.trim() || null,
          address: editForm.address.trim() || null,
        }),
      })
      const result = await response.json()
      if (result.success) {
        addToast({
          title: 'Saved',
          description: 'Manufacturer updated',
          color: 'success',
        })
        setEditModalOpen(false)
        fetchManufacturers(searchQuery)
      } else {
        addToast({
          title: 'Error',
          description: result.error || 'Update failed',
          color: 'danger',
        })
      }
    } catch (error) {
      console.error('Error updating manufacturer:', error)
      addToast({
        title: 'Error',
        description: 'Server connection failed',
        color: 'danger',
      })
    } finally {
      setSaveLoading(false)
    }
  }

  const handleAddClick = () => {
    setAddForm(emptyForm)
    setAddModalOpen(true)
  }

  const handleSaveAdd = async () => {
    if (!addForm.name.trim()) {
      addToast({
        title: 'Validation',
        description: 'Name is required',
        color: 'warning',
      })
      return
    }
    try {
      setAddLoading(true)
      const response = await fetch('/api/manufacturers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: addForm.name.trim(),
          slug:
            addForm.slug.trim() ||
            addForm.name.trim().toLowerCase().replace(/\s+/g, '-'),
          description: addForm.description.trim() || null,
          website: addForm.website.trim() || null,
          email: addForm.email.trim() || null,
          phone: addForm.phone.trim() || null,
          address: addForm.address.trim() || null,
        }),
      })
      const result = await response.json()
      if (result.success) {
        addToast({
          title: 'Created',
          description: 'Manufacturer added',
          color: 'success',
        })
        setAddModalOpen(false)
        fetchManufacturers(searchQuery)
      } else {
        addToast({
          title: 'Error',
          description: result.error || 'Create failed',
          color: 'danger',
        })
      }
    } catch (error) {
      console.error('Error creating manufacturer:', error)
      addToast({
        title: 'Error',
        description: 'Server connection failed',
        color: 'danger',
      })
    } finally {
      setAddLoading(false)
    }
  }

  const handleDeleteClick = (m: Manufacturer) => {
    setSelected(m)
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!selected) return
    try {
      setDeleteLoading(true)
      const response = await fetch(`/api/manufacturers/${selected.id}`, {
        method: 'DELETE',
      })
      const result = await response.json()
      if (result.success) {
        addToast({
          title: 'Deleted',
          description: 'Manufacturer removed',
          color: 'success',
        })
        setDeleteModalOpen(false)
        fetchManufacturers(searchQuery)
      } else {
        addToast({
          title: 'Error',
          description: result.error || 'Delete failed',
          color: 'danger',
        })
      }
    } catch (error) {
      console.error('Error deleting manufacturer:', error)
      addToast({
        title: 'Error',
        description: 'Delete failed',
        color: 'danger',
      })
    } finally {
      setDeleteLoading(false)
    }
  }

  const withContact = manufacturers.filter(
    m => m.website || m.email || m.phone,
  ).length

  return (
    <div className='space-y-6' dir='ltr'>
      {/* Header */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <p className='font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground'>
            Catalog
          </p>
          <h1 className='flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground'>
            <Factory className='h-6 w-6' />
            Manufacturers
          </h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            Mills and suppliers linked to catalog products.
          </p>
        </div>
        <button
          type='button'
          onClick={handleAddClick}
          className='inline-flex items-center gap-2 bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity duration-200 ease-out hover:opacity-90'
        >
          <Plus className='h-4 w-4' />
          Add manufacturer
        </button>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-2 gap-px overflow-hidden border border-border bg-border sm:grid-cols-3'>
        <div className='bg-card px-4 py-4'>
          <p className='text-[10px] font-medium uppercase tracking-wide text-muted-foreground'>
            Total
          </p>
          <p className='mt-2 font-mono text-2xl font-semibold tabular-nums text-foreground'>
            {manufacturers.length.toLocaleString('en-US')}
          </p>
        </div>
        <div className='bg-card px-4 py-4'>
          <p className='text-[10px] font-medium uppercase tracking-wide text-muted-foreground'>
            With contact
          </p>
          <p className='mt-2 font-mono text-2xl font-semibold tabular-nums text-foreground'>
            {withContact.toLocaleString('en-US')}
          </p>
        </div>
        <div className='col-span-2 bg-card px-4 py-4 sm:col-span-1'>
          <p className='text-[10px] font-medium uppercase tracking-wide text-muted-foreground'>
            Listed
          </p>
          <p className='mt-2 font-mono text-2xl font-semibold tabular-nums text-foreground'>
            {loading ? '—' : manufacturers.length.toLocaleString('en-US')}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className='border border-border bg-card'>
        <div className='border-b border-border px-4 py-3'>
          <h2 className='font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
            Filters
          </h2>
        </div>
        <div className='flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center'>
          <div className='relative min-w-0 flex-1 sm:max-w-md'>
            <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <input
              type='search'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder='Search manufacturers…'
              className={`${fieldClass} !mt-0 pl-9`}
            />
          </div>
          <div className='flex flex-wrap gap-2'>
            <button
              type='button'
              onClick={handleSearch}
              className='inline-flex items-center gap-2 border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors duration-200 ease-out hover:bg-muted'
            >
              <Search className='h-4 w-4' />
              Search
            </button>
            {searchQuery ? (
              <button
                type='button'
                onClick={() => {
                  setSearchQuery('')
                  fetchManufacturers('')
                }}
                className='inline-flex items-center gap-2 border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors duration-200 ease-out hover:bg-muted'
              >
                Clear
              </button>
            ) : null}
            <button
              type='button'
              onClick={() => fetchManufacturers(searchQuery)}
              className='inline-flex items-center gap-2 border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors duration-200 ease-out hover:bg-muted'
            >
              <RefreshCw className='h-4 w-4' />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className='border border-border bg-card'>
        <div className='flex items-center gap-2 border-b border-border px-4 py-3'>
          <Factory className='h-4 w-4 text-muted-foreground' />
          <h3 className='font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
            Mills ({manufacturers.length})
          </h3>
        </div>

        {loading ? (
          <div className='flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground'>
            <RefreshCw className='h-4 w-4 animate-spin' />
            Loading manufacturers…
          </div>
        ) : manufacturers.length === 0 ? (
          <div className='px-4 py-16 text-center'>
            <Factory className='mx-auto mb-3 h-10 w-10 text-muted-foreground' />
            <p className='text-sm font-medium text-foreground'>
              No manufacturers found
            </p>
            <p className='mt-1 text-sm text-muted-foreground'>
              {searchQuery
                ? 'Try a different search.'
                : 'Add a mill to link products.'}
            </p>
            {!searchQuery ? (
              <button
                type='button'
                onClick={handleAddClick}
                className='mt-4 inline-flex items-center gap-2 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity duration-200 ease-out hover:opacity-90'
              >
                <Plus className='h-4 w-4' />
                Add manufacturer
              </button>
            ) : null}
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full min-w-[800px] text-sm'>
              <thead>
                <tr className='border-b border-border bg-muted/50 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground'>
                  <th className='px-4 py-2.5'>Manufacturer</th>
                  <th className='px-4 py-2.5'>Slug</th>
                  <th className='px-4 py-2.5'>Contact</th>
                  <th className='px-4 py-2.5 text-center'>Products</th>
                  <th className='px-4 py-2.5 text-right'>Actions</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-border'>
                {manufacturers.map(m => (
                  <tr
                    key={m.id}
                    className='transition-colors duration-200 ease-out hover:bg-muted/40'
                  >
                    <td className='px-4 py-3'>
                      <div className='flex items-center gap-3'>
                        {m.logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={m.logo}
                            alt=''
                            className='h-9 w-9 border border-border object-cover'
                          />
                        ) : (
                          <span className='flex h-9 w-9 shrink-0 items-center justify-center border border-border bg-muted/50 text-muted-foreground'>
                            <Factory className='h-4 w-4' />
                          </span>
                        )}
                        <div className='min-w-0'>
                          <p className='font-medium text-foreground'>
                            {m.name}
                          </p>
                          {m.description ? (
                            <p className='mt-0.5 line-clamp-1 text-xs text-muted-foreground'>
                              {m.description}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className='px-4 py-3 font-mono text-xs text-muted-foreground'>
                      {m.slug}
                    </td>
                    <td className='px-4 py-3'>
                      <div className='flex flex-col gap-0.5 text-xs text-muted-foreground'>
                        {m.website ? (
                          <span className='inline-flex items-center gap-1.5 truncate'>
                            <Globe className='h-3 w-3 shrink-0' />
                            <span className='truncate max-w-[12rem]'>
                              {m.website.replace(/^https?:\/\//, '')}
                            </span>
                          </span>
                        ) : null}
                        {m.email ? (
                          <span className='inline-flex items-center gap-1.5 truncate'>
                            <Mail className='h-3 w-3 shrink-0' />
                            <span className='truncate max-w-[12rem]'>
                              {m.email}
                            </span>
                          </span>
                        ) : null}
                        {m.phone ? (
                          <span className='inline-flex items-center gap-1.5'>
                            <Phone className='h-3 w-3 shrink-0' />
                            {m.phone}
                          </span>
                        ) : null}
                        {!m.website && !m.email && !m.phone ? (
                          <span>—</span>
                        ) : null}
                      </div>
                    </td>
                    <td className='px-4 py-3 text-center tabular-nums text-foreground'>
                      {productCount(m)}
                    </td>
                    <td className='px-4 py-3'>
                      <div className='flex items-center justify-end gap-1'>
                        <button
                          type='button'
                          onClick={() => handleEditClick(m)}
                          className='inline-flex h-8 w-8 items-center justify-center border border-border bg-background text-foreground transition-colors duration-200 ease-out hover:bg-muted'
                          aria-label='Edit'
                        >
                          <Edit className='h-3.5 w-3.5' />
                        </button>
                        <button
                          type='button'
                          onClick={() => handleDeleteClick(m)}
                          className='inline-flex h-8 w-8 items-center justify-center border border-border bg-background text-red-700 transition-colors duration-200 ease-out hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40'
                          aria-label='Delete'
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

      {editModalOpen && (
        <ModalShell
          title='Edit manufacturer'
          onClose={() => setEditModalOpen(false)}
        >
          <ManufacturerForm form={editForm} setForm={setEditForm} />
          <div className='mt-6 flex justify-end gap-2 border-t border-border pt-4'>
            <button
              type='button'
              onClick={() => setEditModalOpen(false)}
              className='border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors duration-200 ease-out hover:bg-muted'
            >
              Cancel
            </button>
            <button
              type='button'
              onClick={handleSaveEdit}
              disabled={saveLoading}
              className='inline-flex items-center gap-2 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity duration-200 ease-out hover:opacity-90 disabled:opacity-50'
            >
              <Save className='h-4 w-4' />
              {saveLoading ? 'Saving…' : 'Save'}
            </button>
          </div>
        </ModalShell>
      )}

      {addModalOpen && (
        <ModalShell
          title='Add manufacturer'
          onClose={() => setAddModalOpen(false)}
        >
          <ManufacturerForm form={addForm} setForm={setAddForm} />
          <div className='mt-6 flex justify-end gap-2 border-t border-border pt-4'>
            <button
              type='button'
              onClick={() => setAddModalOpen(false)}
              className='border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors duration-200 ease-out hover:bg-muted'
            >
              Cancel
            </button>
            <button
              type='button'
              onClick={handleSaveAdd}
              disabled={addLoading}
              className='inline-flex items-center gap-2 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity duration-200 ease-out hover:opacity-90 disabled:opacity-50'
            >
              <Plus className='h-4 w-4' />
              {addLoading ? 'Creating…' : 'Create'}
            </button>
          </div>
        </ModalShell>
      )}

      {deleteModalOpen && selected && (
        <ModalShell
          title='Delete manufacturer'
          onClose={() => setDeleteModalOpen(false)}
        >
          <p className='text-sm text-muted-foreground'>
            Delete{' '}
            <span className='font-medium text-foreground'>{selected.name}</span>
            ? This cannot be undone.
          </p>
          {productCount(selected) > 0 ? (
            <p className='mt-3 border border-amber-600/30 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-100'>
              {productCount(selected)} product
              {productCount(selected) === 1 ? '' : 's'} may still reference this
              mill.
            </p>
          ) : null}
          {selected.address ? (
            <p className='mt-3 flex items-start gap-2 text-xs text-muted-foreground'>
              <MapPin className='mt-0.5 h-3.5 w-3.5 shrink-0' />
              {selected.address}
            </p>
          ) : null}
          <div className='mt-6 flex justify-end gap-2 border-t border-border pt-4'>
            <button
              type='button'
              onClick={() => setDeleteModalOpen(false)}
              className='border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors duration-200 ease-out hover:bg-muted'
            >
              Cancel
            </button>
            <button
              type='button'
              onClick={confirmDelete}
              disabled={deleteLoading}
              className='inline-flex items-center gap-2 bg-red-700 px-4 py-2 text-sm font-medium text-white transition-opacity duration-200 ease-out hover:opacity-90 disabled:opacity-50 dark:bg-red-600'
            >
              <Trash2 className='h-4 w-4' />
              {deleteLoading ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </ModalShell>
      )}
    </div>
  )
}

function ModalShell({
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
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'
      role='dialog'
      aria-modal='true'
    >
      <div className='max-h-[90vh] w-full max-w-lg overflow-y-auto border border-border bg-card shadow-sm'>
        <div className='flex items-center justify-between border-b border-border px-5 py-3'>
          <h2 className='font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
            {title}
          </h2>
          <button
            type='button'
            onClick={onClose}
            className='flex h-8 w-8 items-center justify-center border border-border bg-background text-foreground transition-colors duration-200 ease-out hover:bg-muted'
            aria-label='Close'
          >
            <X className='h-4 w-4' />
          </button>
        </div>
        <div className='px-5 py-5'>{children}</div>
      </div>
    </div>
  )
}

function ManufacturerForm({
  form,
  setForm,
}: {
  form: typeof emptyForm
  setForm: React.Dispatch<React.SetStateAction<typeof emptyForm>>
}) {
  return (
    <div className='space-y-4'>
      <div>
        <label htmlFor='mfr-name' className={labelClass}>
          Name *
        </label>
        <input
          id='mfr-name'
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          className={fieldClass}
          placeholder='e.g. Caspian Steel Mills'
        />
      </div>
      <div>
        <label htmlFor='mfr-slug' className={labelClass}>
          Slug
        </label>
        <input
          id='mfr-slug'
          value={form.slug}
          onChange={e => setForm({ ...form, slug: e.target.value })}
          className={fieldClass}
          placeholder='auto from name if empty'
          dir='ltr'
        />
      </div>
      <div>
        <label htmlFor='mfr-desc' className={labelClass}>
          Description
        </label>
        <textarea
          id='mfr-desc'
          rows={3}
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          className={`${fieldClass} resize-y`}
          placeholder='Short note about the mill'
        />
      </div>
      <div className='grid gap-4 sm:grid-cols-2'>
        <div>
          <label htmlFor='mfr-web' className={labelClass}>
            Website
          </label>
          <input
            id='mfr-web'
            value={form.website}
            onChange={e => setForm({ ...form, website: e.target.value })}
            className={fieldClass}
            placeholder='https://…'
            dir='ltr'
          />
        </div>
        <div>
          <label htmlFor='mfr-email' className={labelClass}>
            Email
          </label>
          <input
            id='mfr-email'
            type='email'
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className={fieldClass}
            placeholder='sales@…'
            dir='ltr'
          />
        </div>
        <div>
          <label htmlFor='mfr-phone' className={labelClass}>
            Phone
          </label>
          <input
            id='mfr-phone'
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
            className={fieldClass}
            placeholder='+98 …'
            dir='ltr'
          />
        </div>
        <div>
          <label htmlFor='mfr-address' className={labelClass}>
            Address
          </label>
          <input
            id='mfr-address'
            value={form.address}
            onChange={e => setForm({ ...form, address: e.target.value })}
            className={fieldClass}
            placeholder='City, region'
          />
        </div>
      </div>
    </div>
  )
}
