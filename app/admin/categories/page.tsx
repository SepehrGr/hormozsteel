'use client'

import { useState, useEffect, Fragment } from 'react'
import {
  Search,
  Plus,
  Edit,
  Trash2,
  FolderTree,
  Package,
  ChevronDown,
  ChevronRight,
  Layers,
  RefreshCw,
  X,
  Save,
} from 'lucide-react'
import { addToast } from '@heroui/toast'
import { CATEGORY_ICONS, resolveCategoryIcon } from '@/config/category-icons'

interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
  description: string | null
  subcategories: string[]
  _count: {
    products: number
  }
  createdAt: string
  updatedAt: string
}

const ICON_OPTIONS = Object.entries(CATEGORY_ICONS).map(([slug, cls]) => ({
  value: cls,
  label: slug,
}))

const fieldClass =
  'mt-1.5 w-full border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-200 ease-out focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground disabled:opacity-50'

const labelClass =
  'block text-xs font-medium uppercase tracking-wide text-muted-foreground'

const emptyForm = {
  name: '',
  slug: '',
  icon: '',
  description: '',
  subcategories: [] as string[],
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  )
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [addLoading, setAddLoading] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  )
  const [editForm, setEditForm] = useState(emptyForm)
  const [addForm, setAddForm] = useState(emptyForm)

  const fetchCategories = async (search = '') => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        ...(search && { search }),
      })
      const response = await fetch(`/api/categories?${params}`)
      const result = await response.json()
      if (result.success) {
        setCategories(result.data)
      } else {
        addToast({
          title: 'Error',
          description: 'Could not load categories',
          color: 'danger',
        })
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
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
    fetchCategories()
  }, [])

  const handleSearch = () => fetchCategories(searchQuery)

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(categoryId)) next.delete(categoryId)
      else next.add(categoryId)
      return next
    })
  }

  const handleEditClick = (category: Category) => {
    setSelectedCategory(category)
    setEditForm({
      name: category.name,
      slug: category.slug,
      icon: category.icon || '',
      description: category.description || '',
      subcategories: [...category.subcategories],
    })
    setEditModalOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedCategory) return
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
      const response = await fetch(`/api/categories/${selectedCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name.trim(),
          slug:
            editForm.slug.trim() ||
            editForm.name.trim().toLowerCase().replace(/\s+/g, '-'),
          icon: editForm.icon.trim() || null,
          description: editForm.description.trim() || null,
          subcategories: editForm.subcategories.filter(s => s.trim()),
        }),
      })
      const result = await response.json()
      if (result.success) {
        addToast({
          title: 'Saved',
          description: 'Category updated',
          color: 'success',
        })
        setEditModalOpen(false)
        fetchCategories(searchQuery)
      } else {
        addToast({
          title: 'Error',
          description: result.error || 'Update failed',
          color: 'danger',
        })
      }
    } catch (error) {
      console.error('Error updating category:', error)
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
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: addForm.name.trim(),
          slug:
            addForm.slug.trim() ||
            addForm.name.trim().toLowerCase().replace(/\s+/g, '-'),
          icon: addForm.icon.trim() || null,
          description: addForm.description.trim() || null,
          subcategories: addForm.subcategories.filter(s => s.trim()),
        }),
      })
      const result = await response.json()
      if (result.success) {
        addToast({
          title: 'Created',
          description: 'Category added',
          color: 'success',
        })
        setAddModalOpen(false)
        fetchCategories(searchQuery)
      } else {
        addToast({
          title: 'Error',
          description: result.error || 'Create failed',
          color: 'danger',
        })
      }
    } catch (error) {
      console.error('Error creating category:', error)
      addToast({
        title: 'Error',
        description: 'Server connection failed',
        color: 'danger',
      })
    } finally {
      setAddLoading(false)
    }
  }

  const handleDeleteClick = (category: Category) => {
    setSelectedCategory(category)
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedCategory) return
    try {
      setDeleteLoading(true)
      const response = await fetch(`/api/categories/${selectedCategory.id}`, {
        method: 'DELETE',
      })
      const result = await response.json()
      if (result.success) {
        addToast({
          title: 'Deleted',
          description: 'Category removed',
          color: 'success',
        })
        setDeleteModalOpen(false)
        fetchCategories(searchQuery)
      } else {
        addToast({
          title: 'Error',
          description: result.error || 'Delete failed',
          color: 'danger',
        })
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      addToast({
        title: 'Error',
        description: 'Delete failed',
        color: 'danger',
      })
    } finally {
      setDeleteLoading(false)
    }
  }

  const totalProducts = categories.reduce(
    (sum, cat) => sum + cat._count.products,
    0,
  )
  const totalSubcategories = categories.reduce(
    (sum, cat) => sum + cat.subcategories.length,
    0,
  )

  const updateSubs = (
    form: typeof emptyForm,
    setForm: typeof setEditForm,
    index: number,
    value: string,
  ) => {
    const next = [...form.subcategories]
    next[index] = value
    setForm({ ...form, subcategories: next })
  }

  const removeSub = (
    form: typeof emptyForm,
    setForm: typeof setEditForm,
    index: number,
  ) => {
    setForm({
      ...form,
      subcategories: form.subcategories.filter((_, i) => i !== index),
    })
  }

  const addSub = (form: typeof emptyForm, setForm: typeof setEditForm) => {
    setForm({ ...form, subcategories: [...form.subcategories, ''] })
  }

  return (
    <div className='space-y-6' dir='ltr'>
      {/* Header */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <p className='font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground'>
            Catalog
          </p>
          <h1 className='flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground'>
            <FolderTree className='h-6 w-6' />
            Categories
          </h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            Product families, slugs, icons, and sub-lines.
          </p>
        </div>
        <button
          type='button'
          onClick={handleAddClick}
          className='inline-flex items-center gap-2 bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity duration-200 ease-out hover:opacity-90'
        >
          <Plus className='h-4 w-4' />
          Add category
        </button>
      </div>

      {/* Stats board */}
      <div className='grid grid-cols-3 gap-px overflow-hidden border border-border bg-border'>
        {[
          {
            label: 'Categories',
            value: categories.length,
            icon: FolderTree,
          },
          {
            label: 'Sub-lines',
            value: totalSubcategories,
            icon: Layers,
          },
          {
            label: 'Products linked',
            value: totalProducts,
            icon: Package,
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
              <p className='mt-2 font-mono text-2xl font-semibold tabular-nums tracking-tight text-foreground'>
                {stat.value.toLocaleString('en-US')}
              </p>
            </div>
          )
        })}
      </div>

      {/* Toolbar */}
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
              placeholder='Search categories…'
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
                  fetchCategories('')
                }}
                className='inline-flex items-center gap-2 border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors duration-200 ease-out hover:bg-muted'
              >
                Clear
              </button>
            ) : null}
            <button
              type='button'
              onClick={() => fetchCategories(searchQuery)}
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
          <FolderTree className='h-4 w-4 text-muted-foreground' />
          <h3 className='font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
            Families ({categories.length})
          </h3>
        </div>

        {loading ? (
          <div className='flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground'>
            <RefreshCw className='h-4 w-4 animate-spin' />
            Loading categories…
          </div>
        ) : categories.length === 0 ? (
          <div className='px-4 py-16 text-center'>
            <FolderTree className='mx-auto mb-3 h-10 w-10 text-muted-foreground' />
            <p className='text-sm font-medium text-foreground'>
              No categories found
            </p>
            <p className='mt-1 text-sm text-muted-foreground'>
              {searchQuery
                ? 'Try a different search.'
                : 'Add the first product family to start the catalog.'}
            </p>
            {!searchQuery ? (
              <button
                type='button'
                onClick={handleAddClick}
                className='mt-4 inline-flex items-center gap-2 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity duration-200 ease-out hover:opacity-90'
              >
                <Plus className='h-4 w-4' />
                Add category
              </button>
            ) : null}
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full min-w-[720px] text-sm'>
              <thead>
                <tr className='border-b border-border bg-muted/50 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground'>
                  <th className='w-12 px-4 py-2.5' />
                  <th className='px-4 py-2.5'>Category</th>
                  <th className='px-4 py-2.5'>Slug</th>
                  <th className='px-4 py-2.5 text-center'>Sub-lines</th>
                  <th className='px-4 py-2.5 text-center'>Products</th>
                  <th className='px-4 py-2.5 text-right'>Actions</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-border'>
                {categories.map(category => {
                  const isExpanded = expandedCategories.has(category.id)
                  const iconClass = resolveCategoryIcon(
                    category.icon || category.slug,
                  )
                  return (
                    <Fragment key={category.id}>
                      <tr className='transition-colors duration-200 ease-out hover:bg-muted/40'>
                        <td className='px-2 py-3 text-center'>
                          <button
                            type='button'
                            onClick={() => toggleCategory(category.id)}
                            disabled={category.subcategories.length === 0}
                            className='inline-flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors duration-200 ease-out hover:bg-muted hover:text-foreground disabled:opacity-30'
                            aria-label={
                              isExpanded ? 'Collapse' : 'Expand sub-lines'
                            }
                          >
                            {isExpanded ? (
                              <ChevronDown className='h-4 w-4' />
                            ) : (
                              <ChevronRight className='h-4 w-4' />
                            )}
                          </button>
                        </td>
                        <td className='px-4 py-3'>
                          <div className='flex items-center gap-3'>
                            <span className='flex h-9 w-9 shrink-0 items-center justify-center border border-border bg-muted/50 text-foreground'>
                              <i className={`${iconClass} text-lg`} />
                            </span>
                            <div className='min-w-0'>
                              <p className='font-medium text-foreground'>
                                {category.name}
                              </p>
                              {category.description ? (
                                <p className='mt-0.5 line-clamp-1 text-xs text-muted-foreground'>
                                  {category.description}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </td>
                        <td className='px-4 py-3 font-mono text-xs text-muted-foreground'>
                          {category.slug}
                        </td>
                        <td className='px-4 py-3 text-center tabular-nums text-muted-foreground'>
                          {category.subcategories.length}
                        </td>
                        <td className='px-4 py-3 text-center tabular-nums text-foreground'>
                          {category._count.products}
                        </td>
                        <td className='px-4 py-3'>
                          <div className='flex items-center justify-end gap-1'>
                            <button
                              type='button'
                              onClick={() => handleEditClick(category)}
                              className='inline-flex h-8 w-8 items-center justify-center border border-border bg-background text-foreground transition-colors duration-200 ease-out hover:bg-muted'
                              aria-label='Edit'
                            >
                              <Edit className='h-3.5 w-3.5' />
                            </button>
                            <button
                              type='button'
                              onClick={() => handleDeleteClick(category)}
                              className='inline-flex h-8 w-8 items-center justify-center border border-border bg-background text-red-700 transition-colors duration-200 ease-out hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40'
                              aria-label='Delete'
                            >
                              <Trash2 className='h-3.5 w-3.5' />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && category.subcategories.length > 0 ? (
                        <tr className='bg-muted/30'>
                          <td colSpan={6} className='px-4 py-3 pl-16'>
                            <p className='mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground'>
                              Sub-lines
                            </p>
                            <div className='flex flex-wrap gap-2'>
                              {category.subcategories.map(sub => (
                                <span
                                  key={sub}
                                  className='border border-border bg-card px-2.5 py-1 text-xs text-foreground'
                                >
                                  {sub}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editModalOpen && (
        <ModalShell
          title='Edit category'
          onClose={() => setEditModalOpen(false)}
        >
          <CategoryForm
            form={editForm}
            setForm={setEditForm}
            onAddSub={() => addSub(editForm, setEditForm)}
            onRemoveSub={i => removeSub(editForm, setEditForm, i)}
            onChangeSub={(i, v) => updateSubs(editForm, setEditForm, i, v)}
          />
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

      {/* Add modal */}
      {addModalOpen && (
        <ModalShell title='Add category' onClose={() => setAddModalOpen(false)}>
          <CategoryForm
            form={addForm}
            setForm={setAddForm}
            onAddSub={() => addSub(addForm, setAddForm)}
            onRemoveSub={i => removeSub(addForm, setAddForm, i)}
            onChangeSub={(i, v) => updateSubs(addForm, setAddForm, i, v)}
          />
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

      {/* Delete modal */}
      {deleteModalOpen && selectedCategory && (
        <ModalShell
          title='Delete category'
          onClose={() => setDeleteModalOpen(false)}
        >
          <p className='text-sm text-muted-foreground'>
            Delete{' '}
            <span className='font-medium text-foreground'>
              {selectedCategory.name}
            </span>
            ? This cannot be undone.
          </p>
          {selectedCategory._count.products > 0 ? (
            <p className='mt-3 border border-amber-600/30 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-100'>
              {selectedCategory._count.products} product
              {selectedCategory._count.products === 1 ? '' : 's'} still linked.
              Reassign or remove them first if the API blocks the delete.
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

function CategoryForm({
  form,
  setForm,
  onAddSub,
  onRemoveSub,
  onChangeSub,
}: {
  form: typeof emptyForm
  setForm: React.Dispatch<React.SetStateAction<typeof emptyForm>>
  onAddSub: () => void
  onRemoveSub: (i: number) => void
  onChangeSub: (i: number, v: string) => void
}) {
  return (
    <div className='space-y-4'>
      <div>
        <label htmlFor='cat-name' className={labelClass}>
          Name *
        </label>
        <input
          id='cat-name'
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          className={fieldClass}
          placeholder='e.g. Rebar'
        />
      </div>
      <div>
        <label htmlFor='cat-slug' className={labelClass}>
          Slug
        </label>
        <input
          id='cat-slug'
          value={form.slug}
          onChange={e => setForm({ ...form, slug: e.target.value })}
          className={fieldClass}
          placeholder='auto from name if empty'
          dir='ltr'
        />
      </div>
      <div>
        <label htmlFor='cat-icon' className={labelClass}>
          Icon
        </label>
        <div className='mt-1.5 flex items-center gap-2'>
          <span className='flex h-10 w-10 shrink-0 items-center justify-center border border-border bg-muted/50'>
            <i
              className={`${resolveCategoryIcon(form.icon || form.slug)} text-lg`}
            />
          </span>
          <select
            id='cat-icon'
            value={form.icon}
            onChange={e => setForm({ ...form, icon: e.target.value })}
            className={`${fieldClass} !mt-0 flex-1`}
          >
            <option value=''>Default from slug</option>
            {ICON_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label} ({opt.value})
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor='cat-desc' className={labelClass}>
          Description
        </label>
        <textarea
          id='cat-desc'
          rows={3}
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          className={`${fieldClass} resize-y`}
          placeholder='Short catalog blurb'
        />
      </div>
      <div>
        <div className='mb-1.5 flex items-center justify-between'>
          <span className={labelClass}>Sub-lines</span>
          <button
            type='button'
            onClick={onAddSub}
            className='text-xs font-medium text-foreground underline-offset-4 hover:underline'
          >
            + Add
          </button>
        </div>
        {form.subcategories.length === 0 ? (
          <p className='text-xs text-muted-foreground'>No sub-lines yet.</p>
        ) : (
          <ul className='space-y-2'>
            {form.subcategories.map((sub, index) => (
              <li key={index} className='flex gap-2'>
                <input
                  value={sub}
                  onChange={e => onChangeSub(index, e.target.value)}
                  className={`${fieldClass} !mt-0 flex-1`}
                  placeholder='e.g. Ribbed'
                />
                <button
                  type='button'
                  onClick={() => onRemoveSub(index)}
                  className='flex h-10 w-10 shrink-0 items-center justify-center border border-border text-muted-foreground transition-colors duration-200 ease-out hover:bg-muted hover:text-foreground'
                  aria-label='Remove sub-line'
                >
                  <X className='h-4 w-4' />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
