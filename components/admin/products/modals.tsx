import {
  Plus,
  Trash2,
  CheckCircle2,
  X,
} from 'lucide-react'

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
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'
      role='dialog'
      aria-modal='true'
      aria-labelledby='bulk-update-title'
      dir='ltr'
      onClick={e => {
        if (e.target === e.currentTarget) close()
      }}
    >
      <div className='max-h-[90vh] w-full max-w-lg overflow-y-auto border border-border bg-card shadow-sm'>
        <div className='flex items-start justify-between border-b border-border px-5 py-3'>
          <div>
            <h2
              id='bulk-update-title'
              className='font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'
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
            type='button'
            onClick={close}
            className='flex h-8 w-8 cursor-pointer items-center justify-center border border-border bg-background text-foreground transition-colors duration-200 ease-out hover:bg-muted'
            aria-label='Close'
          >
            <X className='h-4 w-4' />
          </button>
        </div>

        <div className='space-y-5 px-5 py-5'>
          <div>
            <label htmlFor='bulk-price' className={productLabelClass}>
              New price (USD)
            </label>
            <input
              id='bulk-price'
              type='number'
              min={0}
              step='0.01'
              value={bulkUpdateData.price?.toString() ?? ''}
              onChange={e =>
                update({
                  price: e.target.value ? parseFloat(e.target.value) : undefined,
                })
              }
              className={productFieldClass}
              placeholder='Leave blank to keep current'
            />
          </div>

          <div>
            <p className={productLabelClass}>Stock</p>
            <div className='mt-1.5 flex gap-2'>
              <button
                type='button'
                onClick={() => update({ inStock: true })}
                className={stockBtn(bulkUpdateData.inStock === true)}
              >
                In stock
              </button>
              <button
                type='button'
                onClick={() => update({ inStock: false })}
                className={stockBtn(bulkUpdateData.inStock === false)}
              >
                On inquiry
              </button>
              <button
                type='button'
                onClick={() => update({ inStock: undefined })}
                className={stockBtn(bulkUpdateData.inStock === undefined)}
              >
                No change
              </button>
            </div>
          </div>

          <div>
            <label htmlFor='bulk-category' className={productLabelClass}>
              Category
            </label>
            <select
              id='bulk-category'
              value={bulkUpdateData.categoryId || ''}
              onChange={e =>
                update({ categoryId: e.target.value || undefined })
              }
              className={`${productFieldClass} cursor-pointer`}
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
            type='button'
            onClick={close}
            className='cursor-pointer border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors duration-200 ease-out hover:bg-muted'
          >
            Cancel
          </button>
          <button
            type='button'
            onClick={onUpdate}
            className='inline-flex cursor-pointer items-center gap-2 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity duration-200 ease-out hover:opacity-90'
          >
            <CheckCircle2 className='h-4 w-4' />
            Apply to {selectedCount} product{selectedCount === 1 ? '' : 's'}
          </button>
        </div>
      </div>
    </div>
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
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'
      role='dialog'
      aria-modal='true'
      aria-labelledby='bulk-delete-title'
      dir='ltr'
      onClick={e => {
        if (e.target === e.currentTarget) close()
      }}
    >
      <div className='w-full max-w-md border border-border bg-card shadow-sm'>
        <div className='flex items-center justify-between border-b border-border px-5 py-3'>
          <h2
            id='bulk-delete-title'
            className='font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'
          >
            Delete products
          </h2>
          <button
            type='button'
            onClick={close}
            className='flex h-8 w-8 items-center justify-center border border-border bg-background text-foreground transition-colors duration-200 ease-out hover:bg-muted'
            aria-label='Close'
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
            type='button'
            onClick={onDelete}
            className='inline-flex items-center gap-2 bg-red-700 px-4 py-2 text-sm font-medium text-white transition-opacity duration-200 ease-out hover:opacity-90 dark:bg-red-600'
          >
            <Trash2 className='h-4 w-4' />
            Delete {selectedCount} product{selectedCount > 1 && 's'}
          </button>
          <button
            type='button'
            onClick={close}
            className='border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors duration-200 ease-out hover:bg-muted'
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
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
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'
      role='dialog'
      aria-modal='true'
      aria-labelledby='delete-product-title'
      dir='ltr'
      onClick={e => {
        if (e.target === e.currentTarget) close()
      }}
    >
      <div className='w-full max-w-md border border-border bg-card shadow-sm'>
        <div className='flex items-center justify-between border-b border-border px-5 py-3'>
          <h2
            id='delete-product-title'
            className='font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'
          >
            Delete product
          </h2>
          <button
            type='button'
            onClick={close}
            className='flex h-8 w-8 items-center justify-center border border-border bg-background text-foreground transition-colors duration-200 ease-out hover:bg-muted'
            aria-label='Close'
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
            type='button'
            onClick={onConfirm}
            className='inline-flex items-center gap-2 bg-red-700 px-4 py-2 text-sm font-medium text-white transition-opacity duration-200 ease-out hover:opacity-90 dark:bg-red-600'
          >
            <Trash2 className='h-4 w-4' />
            Yes, delete the product
          </button>
          <button
            type='button'
            onClick={close}
            className='border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors duration-200 ease-out hover:bg-muted'
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Edit product — board-style modal (matches Add product).
 */
function MillField({
  manufacturers = [],
  manufacturerId,
  brand,
  onChange,
  idPrefix,
}: {
  manufacturers?: { id: string; name: string }[]
  manufacturerId?: string
  brand?: string
  onChange: (patch: { manufacturerId?: string; brand?: string }) => void
  idPrefix: string
}) {
  const isCustom =
    !manufacturerId ||
    manufacturerId === '__custom__' ||
    !manufacturers.some(m => m.id === manufacturerId)

  return (
    <div className='space-y-2'>
      <div>
        <label htmlFor={`${idPrefix}-mill`} className={productLabelClass}>
          Mill *
        </label>
        <select
          id={`${idPrefix}-mill`}
          value={
            manufacturerId && manufacturers.some(m => m.id === manufacturerId)
              ? manufacturerId
              : manufacturerId === '__custom__' || (brand && isCustom)
                ? '__custom__'
                : ''
          }
          onChange={e => {
            const v = e.target.value
            if (!v) {
              onChange({ manufacturerId: '', brand: '' })
              return
            }
            if (v === '__custom__') {
              onChange({ manufacturerId: '__custom__', brand: brand || '' })
              return
            }
            const mill = manufacturers.find(m => m.id === v)
            onChange({ manufacturerId: v, brand: mill?.name || '' })
          }}
          className={productFieldClass}
        >
          <option value=''>Select mill…</option>
          {manufacturers.map(m => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
          <option value='__custom__'>Other (type name)</option>
        </select>
      </div>
      {(manufacturerId === '__custom__' ||
        (isCustom && brand && !manufacturers.some(m => m.id === manufacturerId))) && (
        <div>
          <label htmlFor={`${idPrefix}-brand`} className={productLabelClass}>
            New mill name *
          </label>
          <input
            id={`${idPrefix}-brand`}
            value={brand || ''}
            onChange={e =>
              onChange({ manufacturerId: '__custom__', brand: e.target.value })
            }
            className={productFieldClass}
            placeholder='e.g. Caspian Steel Mills'
          />
        </div>
      )}
    </div>
  )
}

export function EditProductModal({
  isOpen,
  onOpenChange,
  editingProduct,
  editProductData,
  setEditProductData,
  categories,
  manufacturers = [],
  onSave,
}: any) {
  if (!isOpen) return null

  const selectedCategory = categories?.find(
    (cat: any) => cat.id === editProductData.categoryId,
  )
  const subcategories: string[] = selectedCategory?.subcategories || []

  const close = () => onOpenChange(false)

  const update = (patch: Record<string, unknown>) =>
    setEditProductData({ ...editProductData, ...patch })

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'
      role='dialog'
      aria-modal='true'
      aria-labelledby='edit-product-title'
      dir='ltr'
      onClick={e => {
        if (e.target === e.currentTarget) close()
      }}
    >
      <div className='max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-border bg-card shadow-sm'>
        <div className='flex items-start justify-between border-b border-border px-5 py-3'>
          <div className='min-w-0'>
            <h2
              id='edit-product-title'
              className='font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'
            >
              Edit product
            </h2>
            <p className='mt-1 truncate text-xs text-muted-foreground'>
              {editingProduct?.name
                ? `Editing “${editingProduct.name}”`
                : 'Update catalog line'}
            </p>
          </div>
          <button
            type='button'
            onClick={close}
            className='flex h-8 w-8 shrink-0 items-center justify-center border border-border bg-background text-foreground transition-colors duration-200 ease-out hover:bg-muted'
            aria-label='Close'
          >
            <X className='h-4 w-4' />
          </button>
        </div>

        <div className='space-y-5 px-5 py-5'>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div className='sm:col-span-2'>
              <label htmlFor='edit-name' className={productLabelClass}>
                Name *
              </label>
              <input
                id='edit-name'
                value={editProductData.name}
                onChange={e => update({ name: e.target.value })}
                className={productFieldClass}
                placeholder='e.g. Ribbed rebar 16mm'
              />
            </div>

            <MillField
              manufacturers={manufacturers}
              manufacturerId={editProductData.manufacturerId}
              brand={editProductData.brand}
              onChange={patch => update(patch)}
              idPrefix='edit'
            />

            <div>
              <label htmlFor='edit-size' className={productLabelClass}>
                Size *
              </label>
              <input
                id='edit-size'
                value={editProductData.size}
                onChange={e => update({ size: e.target.value })}
                className={productFieldClass}
                placeholder='e.g. 16mm, IPE 200'
              />
            </div>

            <div>
              <label htmlFor='edit-price' className={productLabelClass}>
                Unit price (USD) *
              </label>
              <input
                id='edit-price'
                type='number'
                inputMode='decimal'
                step='0.01'
                min='0'
                value={editProductData.price ?? ''}
                onChange={e =>
                  update({ price: parseFloat(e.target.value) || 0 })
                }
                className={productFieldClass}
                placeholder='0.00'
              />
            </div>

            <div>
              <label htmlFor='edit-weight' className={productLabelClass}>
                Weight (kg)
              </label>
              <input
                id='edit-weight'
                type='number'
                inputMode='decimal'
                step='0.01'
                min='0'
                value={editProductData.weight?.toString() || ''}
                onChange={e =>
                  update({
                    weight: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  })
                }
                className={productFieldClass}
                placeholder='Optional'
              />
            </div>

            <div>
              <label htmlFor='edit-category' className={productLabelClass}>
                Category *
              </label>
              <select
                id='edit-category'
                value={editProductData.categoryId}
                onChange={e =>
                  update({ categoryId: e.target.value, subcategory: '' })
                }
                className={productFieldClass}
              >
                <option value=''>Select category</option>
                {categories?.map((category: any) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor='edit-sub' className={productLabelClass}>
                Sub-line *
              </label>
              <select
                id='edit-sub'
                value={editProductData.subcategory}
                onChange={e => update({ subcategory: e.target.value })}
                disabled={!editProductData.categoryId}
                className={productFieldClass}
              >
                <option value=''>
                  {editProductData.categoryId
                    ? 'Select sub-line'
                    : 'Select category first'}
                </option>
                {subcategories.map((sub: string) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            <div className='sm:col-span-2'>
              <p className={productLabelClass}>Stock</p>
              <div className='mt-1.5 flex gap-2'>
                <button
                  type='button'
                  onClick={() => update({ inStock: true })}
                  className={`flex-1 border px-3 py-2.5 text-sm font-medium transition-colors duration-200 ease-out ${
                    editProductData.inStock === true
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border bg-background text-foreground hover:bg-muted'
                  }`}
                >
                  In stock
                </button>
                <button
                  type='button'
                  onClick={() => update({ inStock: false })}
                  className={`flex-1 border px-3 py-2.5 text-sm font-medium transition-colors duration-200 ease-out ${
                    editProductData.inStock === false
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border bg-background text-foreground hover:bg-muted'
                  }`}
                >
                  On inquiry
                </button>
              </div>
            </div>
          </div>

          <p className='border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground'>
            Required fields marked *. Price is a unit rate in USD.
          </p>
        </div>

        <div className='flex justify-end gap-2 border-t border-border px-5 py-4'>
          <button
            type='button'
            onClick={close}
            className='border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors duration-200 ease-out hover:bg-muted'
          >
            Cancel
          </button>
          <button
            type='button'
            onClick={onSave}
            className='inline-flex items-center gap-2 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity duration-200 ease-out hover:opacity-90'
          >
            <CheckCircle2 className='h-4 w-4' />
            Save changes
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Add product — board-style modal (matches Edit product).
 * Props kept compatible with products page usage.
 */
export function AddProductModal({
  isOpen,
  onOpenChange,
  newProductData,
  setNewProductData,
  categories,
  manufacturers = [],
  onSave,
}: any) {
  if (!isOpen) return null

  const selectedCategory = categories?.find(
    (cat: any) => cat.id === newProductData.categoryId,
  )
  const subcategories: string[] = selectedCategory?.subcategories || []

  const close = () => onOpenChange(false)

  const update = (patch: Record<string, unknown>) =>
    setNewProductData({ ...newProductData, ...patch })

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'
      role='dialog'
      aria-modal='true'
      aria-labelledby='add-product-title'
      dir='ltr'
      onClick={e => {
        if (e.target === e.currentTarget) close()
      }}
    >
      <div className='max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-border bg-card shadow-sm'>
        <div className='flex items-start justify-between border-b border-border px-5 py-3'>
          <div>
            <h2
              id='add-product-title'
              className='font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'
            >
              Add product
            </h2>
            <p className='mt-1 text-xs text-muted-foreground'>
              New catalog line · unit price in USD
            </p>
          </div>
          <button
            type='button'
            onClick={close}
            className='flex h-8 w-8 items-center justify-center border border-border bg-background text-foreground transition-colors duration-200 ease-out hover:bg-muted'
            aria-label='Close'
          >
            <X className='h-4 w-4' />
          </button>
        </div>

        <div className='space-y-5 px-5 py-5'>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div className='sm:col-span-2'>
              <label htmlFor='add-name' className={productLabelClass}>
                Name *
              </label>
              <input
                id='add-name'
                value={newProductData.name}
                onChange={e => update({ name: e.target.value })}
                className={productFieldClass}
                placeholder='e.g. Ribbed rebar 16mm'
              />
            </div>

            <MillField
              manufacturers={manufacturers}
              manufacturerId={newProductData.manufacturerId}
              brand={newProductData.brand}
              onChange={patch => update(patch)}
              idPrefix='add'
            />

            <div>
              <label htmlFor='add-size' className={productLabelClass}>
                Size *
              </label>
              <input
                id='add-size'
                value={newProductData.size}
                onChange={e => update({ size: e.target.value })}
                className={productFieldClass}
                placeholder='e.g. 16mm, IPE 200'
              />
            </div>

            <div>
              <label htmlFor='add-price' className={productLabelClass}>
                Unit price (USD) *
              </label>
              <input
                id='add-price'
                type='number'
                inputMode='decimal'
                step='0.01'
                min='0'
                value={newProductData.price || ''}
                onChange={e =>
                  update({ price: parseFloat(e.target.value) || 0 })
                }
                className={productFieldClass}
                placeholder='0.00'
              />
            </div>

            <div>
              <label htmlFor='add-weight' className={productLabelClass}>
                Weight (kg)
              </label>
              <input
                id='add-weight'
                type='number'
                inputMode='decimal'
                step='0.01'
                min='0'
                value={newProductData.weight?.toString() || ''}
                onChange={e =>
                  update({
                    weight: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  })
                }
                className={productFieldClass}
                placeholder='Optional'
              />
            </div>

            <div>
              <label htmlFor='add-category' className={productLabelClass}>
                Category *
              </label>
              <select
                id='add-category'
                value={newProductData.categoryId}
                onChange={e =>
                  update({ categoryId: e.target.value, subcategory: '' })
                }
                className={productFieldClass}
              >
                <option value=''>Select category</option>
                {categories?.map((category: any) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor='add-sub' className={productLabelClass}>
                Sub-line *
              </label>
              <select
                id='add-sub'
                value={newProductData.subcategory}
                onChange={e => update({ subcategory: e.target.value })}
                disabled={!newProductData.categoryId}
                className={productFieldClass}
              >
                <option value=''>
                  {newProductData.categoryId
                    ? 'Select sub-line'
                    : 'Select category first'}
                </option>
                {subcategories.map((sub: string) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            <div className='sm:col-span-2'>
              <p className={productLabelClass}>Stock</p>
              <div className='mt-1.5 flex gap-2'>
                <button
                  type='button'
                  onClick={() => update({ inStock: true })}
                  className={`flex-1 border px-3 py-2.5 text-sm font-medium transition-colors duration-200 ease-out ${
                    newProductData.inStock === true
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border bg-background text-foreground hover:bg-muted'
                  }`}
                >
                  In stock
                </button>
                <button
                  type='button'
                  onClick={() => update({ inStock: false })}
                  className={`flex-1 border px-3 py-2.5 text-sm font-medium transition-colors duration-200 ease-out ${
                    newProductData.inStock === false
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border bg-background text-foreground hover:bg-muted'
                  }`}
                >
                  On inquiry
                </button>
              </div>
            </div>
          </div>

          <p className='border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground'>
            Required fields marked *. Price is a unit rate in USD (per kg / ton
            / piece as set on the product).
          </p>
        </div>

        <div className='flex justify-end gap-2 border-t border-border px-5 py-4'>
          <button
            type='button'
            onClick={close}
            className='border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors duration-200 ease-out hover:bg-muted'
          >
            Cancel
          </button>
          <button
            type='button'
            onClick={onSave}
            className='inline-flex items-center gap-2 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity duration-200 ease-out hover:opacity-90'
          >
            <Plus className='h-4 w-4' />
            Add product
          </button>
        </div>
      </div>
    </div>
  )
}
