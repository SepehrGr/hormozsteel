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
          className='inline-flex items-center gap-2 bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity duration-200 ease-out hover:opacity-90'
          type='button'
          onClick={handleAddClick}
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
              className={`${fieldClass} !mt-0 pl-9`}
              placeholder='Search categories…'
              type='search'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div className='flex flex-wrap gap-2'>
            <button
              className='inline-flex items-center gap-2 border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors duration-200 ease-out hover:bg-muted'
              type='button'
              onClick={handleSearch}
            >
              <Search className='h-4 w-4' />
              Search
            </button>
            {searchQuery ? (
              <button
                className='inline-flex items-center gap-2 border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors duration-200 ease-out hover:bg-muted'
                type='button'
                onClick={() => {
                  setSearchQuery('')
                  fetchCategories('')
                }}
              >
                Clear
              </button>
            ) : null}
            <button
              className='inline-flex items-center gap-2 border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors duration-200 ease-out hover:bg-muted'
              type='button'
              onClick={() => fetchCategories(searchQuery)}
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
                className='mt-4 inline-flex items-center gap-2 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity duration-200 ease-out hover:opacity-90'
                type='button'
                onClick={handleAddClick}
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
                            aria-label={
                              isExpanded ? 'Collapse' : 'Expand sub-lines'
                            }
                            className='inline-flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors duration-200 ease-out hover:bg-muted hover:text-foreground disabled:opacity-30'
                            disabled={category.subcategories.length === 0}
                            type='button'
                            onClick={() => toggleCategory(category.id)}
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
                              aria-label='Edit'
                              className='inline-flex h-8 w-8 items-center justify-center border border-border bg-background text-foreground transition-colors duration-200 ease-out hover:bg-muted'
                              type='button'
                              onClick={() => handleEditClick(category)}
                            >
                              <Edit className='h-3.5 w-3.5' />
                            </button>
                            <button
                              aria-label='Delete'
                              className='inline-flex h-8 w-8 items-center justify-center border border-border bg-background text-red-700 transition-colors duration-200 ease-out hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40'
                              type='button'
                              onClick={() => handleDeleteClick(category)}
                            >
                              <Trash2 className='h-3.5 w-3.5' />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && category.subcategories.length > 0 ? (
                        <tr className='bg-muted/30'>
                          <td className='px-4 py-3 pl-16' colSpan={6}>
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
            onChangeSub={(i, v) => updateSubs(editForm, setEditForm, i, v)}
            onRemoveSub={i => removeSub(editForm, setEditForm, i)}
          />
          <div className='mt-6 flex justify-end gap-2 border-t border-border pt-4'>
            <button
              className='border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors duration-200 ease-out hover:bg-muted'
              type='button'
              onClick={() => setEditModalOpen(false)}
            >
              Cancel
            </button>
            <button
              className='inline-flex items-center gap-2 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity duration-200 ease-out hover:opacity-90 disabled:opacity-50'
              disabled={saveLoading}
              type='button'
              onClick={handleSaveEdit}
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
            onChangeSub={(i, v) => updateSubs(addForm, setAddForm, i, v)}
            onRemoveSub={i => removeSub(addForm, setAddForm, i)}
          />
          <div className='mt-6 flex justify-end gap-2 border-t border-border pt-4'>
            <button
              className='border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors duration-200 ease-out hover:bg-muted'
              type='button'
              onClick={() => setAddModalOpen(false)}
            >
              Cancel
            </button>
            <button
              className='inline-flex items-center gap-2 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity duration-200 ease-out hover:opacity-90 disabled:opacity-50'
              disabled={addLoading}
              type='button'
              onClick={handleSaveAdd}
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
              className='border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors duration-200 ease-out hover:bg-muted'
              type='button'
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancel
            </button>
            <button
              className='inline-flex items-center gap-2 bg-red-700 px-4 py-2 text-sm font-medium text-white transition-opacity duration-200 ease-out hover:opacity-90 disabled:opacity-50 dark:bg-red-600'
              disabled={deleteLoading}
              type='button'
              onClick={confirmDelete}
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
            aria-label='Close'
            className='flex h-8 w-8 items-center justify-center border border-border bg-background text-foreground transition-colors duration-200 ease-out hover:bg-muted'
            type='button'
            onClick={onClose}
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
        <label className={labelClass} htmlFor='cat-name'>
          Name *
        </label>
        <input
          className={fieldClass}
          id='cat-name'
          placeholder='e.g. Rebar'
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />
      </div>
      <div>
        <label className={labelClass} htmlFor='cat-slug'>
          Slug
        </label>
        <input
          className={fieldClass}
          dir='ltr'
          id='cat-slug'
          placeholder='auto from name if empty'
          value={form.slug}
          onChange={e => setForm({ ...form, slug: e.target.value })}
        />
      </div>
      <div>
        <label className={labelClass} htmlFor='cat-icon'>
          Icon
        </label>
        <div className='mt-1.5 flex items-center gap-2'>
          <span className='flex h-10 w-10 shrink-0 items-center justify-center border border-border bg-muted/50'>
            <i
              className={`${resolveCategoryIcon(form.icon || form.slug)} text-lg`}
            />
          </span>
          <select
            className={`${fieldClass} !mt-0 flex-1`}
            id='cat-icon'
            value={form.icon}
            onChange={e => setForm({ ...form, icon: e.target.value })}
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
        <label className={labelClass} htmlFor='cat-desc'>
          Description
        </label>
        <textarea
          className={`${fieldClass} resize-y`}
          id='cat-desc'
          placeholder='Short catalog blurb'
          rows={3}
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
        />
      </div>
      <div>
        <div className='mb-1.5 flex items-center justify-between'>
          <span className={labelClass}>Sub-lines</span>
          <button
            className='text-xs font-medium text-foreground underline-offset-4 hover:underline'
            type='button'
            onClick={onAddSub}
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
                  className={`${fieldClass} !mt-0 flex-1`}
                  placeholder='e.g. Ribbed'
                  value={sub}
                  onChange={e => onChangeSub(index, e.target.value)}
                />
                <button
                  aria-label='Remove sub-line'
                  className='flex h-10 w-10 shrink-0 items-center justify-center border border-border text-muted-foreground transition-colors duration-200 ease-out hover:bg-muted hover:text-foreground'
                  type='button'
                  onClick={() => onRemoveSub(index)}
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
