import { Trash2, CheckCircle2, X } from 'lucide-react'

import ModalDialog from '@/components/ui/modal-dialog'

const productFieldClass =
  'mt-1.5 w-full border border-border bg-background px-3 py-2.5 text-sm text-foreground tabular-nums placeholder:text-muted-foreground transition-colors duration-200 ease-out focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground disabled:cursor-not-allowed disabled:opacity-50'

const productLabelClass =
  'block text-xs font-medium uppercase tracking-wide text-muted-foreground'

/**
 * Bulk edit — board-style modal (matches Add/Edit product).
 * Empty fields are left unchanged.
 */
export function BulkUpdateModal({
  isOpen,
  onOpenChange,
  selectedCount,
  bulkUpdateData,
  setBulkUpdateData,
  categories,
  onUpdate,
}: any) {
  if (!isOpen) return null

  const close = () => onOpenChange(false)
  const update = (patch: Record<string, unknown>) =>
    setBulkUpdateData({ ...bulkUpdateData, ...patch })

  const stockBtn = (active: boolean) =>
    `flex-1 cursor-pointer border px-3 py-2.5 text-sm font-medium transition-colors duration-200 ease-out ${
      active
        ? 'border-foreground bg-foreground text-background'
        : 'border-border bg-background text-foreground hover:bg-muted'
    }`

  return (
    <ModalDialog
      className='max-h-[90vh] w-full max-w-lg overflow-y-auto'
      labelledBy='bulk-update-title'
      onClose={close}
    >
      <div className='flex items-start justify-between border-b border-border px-5 py-3'>
        <div>
          <h2
            className='font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'
            id='bulk-update-title'
          >
            Bulk edit
          </h2>
          <p className='mt-1 text-xs text-muted-foreground'>
            <span className='font-semibold tabular-nums text-foreground'>
              {selectedCount}
            </span>{' '}
            selected · empty fields stay unchanged
          </p>
        </div>
        <button
          aria-label='Close'
          className='flex h-8 w-8 cursor-pointer items-center justify-center border border-border bg-background text-foreground transition-colors duration-200 ease-out hover:bg-muted'
          type='button'
          onClick={close}
        >
          <X className='h-4 w-4' />
        </button>
      </div>

      <div className='space-y-5 px-5 py-5'>
        <div>
          <label className={productLabelClass} htmlFor='bulk-price'>
            New price (USD)
          </label>
          <input
            className={productFieldClass}
            id='bulk-price'
            min={0}
            placeholder='Leave blank to keep current'
            step='0.01'
            type='number'
            value={bulkUpdateData.price?.toString() ?? ''}
            onChange={e =>
              update({
                price: e.target.value ? parseFloat(e.target.value) : undefined,
              })
            }
          />
        </div>

        <div>
          <p className={productLabelClass}>Stock</p>
          <div className='mt-1.5 flex gap-2'>
            <button
              className={stockBtn(bulkUpdateData.inStock === true)}
              type='button'
              onClick={() => update({ inStock: true })}
            >
              In stock
            </button>
            <button
              className={stockBtn(bulkUpdateData.inStock === false)}
              type='button'
              onClick={() => update({ inStock: false })}
            >
              On inquiry
            </button>
            <button
              className={stockBtn(bulkUpdateData.inStock === undefined)}
              type='button'
              onClick={() => update({ inStock: undefined })}
            >
              No change
            </button>
          </div>
        </div>

        <div>
          <label className={productLabelClass} htmlFor='bulk-category'>
            Category
          </label>
          <select
            className={`${productFieldClass} cursor-pointer`}
            id='bulk-category'
            value={bulkUpdateData.categoryId || ''}
            onChange={e => update({ categoryId: e.target.value || undefined })}
          >
            <option value=''>No change</option>
            {categories?.map((cat: any) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <p className='border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground'>
          Only filled fields are applied to the selected products.
        </p>
      </div>

      <div className='flex justify-end gap-2 border-t border-border px-5 py-4'>
        <button
          className='cursor-pointer border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors duration-200 ease-out hover:bg-muted'
          type='button'
          onClick={close}
        >
          Cancel
        </button>
        <button
          className='inline-flex cursor-pointer items-center gap-2 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity duration-200 ease-out hover:opacity-90'
          type='button'
          onClick={onUpdate}
        >
          <CheckCircle2 className='h-4 w-4' />
          Apply to {selectedCount} product{selectedCount === 1 ? '' : 's'}
        </button>
      </div>
    </ModalDialog>
  )
}

/**
 * Bulk delete confirmation — board-style modal.
 */
export function BulkDeleteModal({
  isOpen,
  onOpenChange,
  selectedCount,
  onDelete,
}: any) {
  if (!isOpen) return null

  const close = () => onOpenChange(false)

  return (
    <ModalDialog
      className='w-full max-w-md'
      labelledBy='bulk-delete-title'
      onClose={close}
    >
      <div className='flex items-center justify-between border-b border-border px-5 py-3'>
        <h2
          className='font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'
          id='bulk-delete-title'
        >
          Delete products
        </h2>
        <button
          aria-label='Close'
          className='flex h-8 w-8 items-center justify-center border border-border bg-background text-foreground transition-colors duration-200 ease-out hover:bg-muted'
          type='button'
          onClick={close}
        >
          <X className='h-4 w-4' />
        </button>
      </div>

      <div className='space-y-3 px-5 py-5'>
        <p className='text-sm text-muted-foreground'>
          Delete{' '}
          <span className='font-semibold tabular-nums text-foreground'>
            {selectedCount}
          </span>{' '}
          selected product{selectedCount === 1 ? '' : 's'}?
        </p>
        <p className='border border-red-600/30 bg-red-50 px-3 py-2 text-sm text-red-900 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-100'>
          This cannot be undone. Catalog lines and related history for these
          items will be removed.
        </p>
      </div>

      <div className='flex justify-start gap-2 border-t border-border px-5 py-4'>
        <button
          className='inline-flex items-center gap-2 bg-red-700 px-4 py-2 text-sm font-medium text-white transition-opacity duration-200 ease-out hover:opacity-90 dark:bg-red-600'
          type='button'
          onClick={onDelete}
        >
          <Trash2 className='h-4 w-4' />
          Delete {selectedCount} product{selectedCount > 1 && 's'}
        </button>
        <button
          className='border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors duration-200 ease-out hover:bg-muted'
          type='button'
          onClick={close}
        >
          Cancel
        </button>
      </div>
    </ModalDialog>
  )
}

/**
 * Single product delete confirmation — board-style modal.
 */
export function DeleteSingleModal({
  isOpen,
  onOpenChange,
  product,
  onConfirm,
}: any) {
  if (!isOpen) return null

  const close = () => onOpenChange(false)

  return (
    <ModalDialog
      className='w-full max-w-md'
      labelledBy='delete-product-title'
      onClose={close}
    >
      <div className='flex items-center justify-between border-b border-border px-5 py-3'>
        <h2
          className='font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'
          id='delete-product-title'
        >
          Delete product
        </h2>
        <button
          aria-label='Close'
          className='flex h-8 w-8 items-center justify-center border border-border bg-background text-foreground transition-colors duration-200 ease-out hover:bg-muted'
          type='button'
          onClick={close}
        >
          <X className='h-4 w-4' />
        </button>
      </div>

      <div className='space-y-3 px-5 py-5'>
        <p className='text-sm text-muted-foreground'>
          Delete{' '}
          <span className='font-medium text-foreground'>
            {product?.name || 'this product'}
          </span>
          ?
        </p>
        {(product?.size || product?.brand) && (
          <p className='text-xs text-muted-foreground'>
            {[product.brand, product.size].filter(Boolean).join(' · ')}
          </p>
        )}
        <p className='border border-red-600/30 bg-red-50 px-3 py-2 text-sm text-red-900 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-100'>
          This cannot be undone. The line will be removed from the catalog.
        </p>
      </div>

      <div className='flex justify-start gap-2 border-t border-border px-5 py-4'>
        <button
          className='inline-flex items-center gap-2 bg-red-700 px-4 py-2 text-sm font-medium text-white transition-opacity duration-200 ease-out hover:opacity-90 dark:bg-red-600'
          type='button'
          onClick={onConfirm}
        >
          <Trash2 className='h-4 w-4' />
          Yes, delete the product
        </button>
        <button
          className='border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors duration-200 ease-out hover:bg-muted'
          type='button'
          onClick={close}
        >
          Cancel
        </button>
      </div>
    </ModalDialog>
  )
}
