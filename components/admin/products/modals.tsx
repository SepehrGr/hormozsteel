import { Plus, Trash2, CheckCircle2, X } from 'lucide-react'

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
      aria-labelledby='bulk-update-title'
      aria-modal='true'
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'
      dir='ltr'
      role='dialog'
      onClick={e => {
        if (e.target === e.currentTarget) close()
      }}
    >
      <div className='max-h-[90vh] w-full max-w-lg overflow-y-auto border border-border bg-card shadow-sm'>
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
                  price: e.target.value
                    ? parseFloat(e.target.value)
                    : undefined,
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
              onChange={e =>
                update({ categoryId: e.target.value || undefined })
              }
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
      aria-labelledby='bulk-delete-title'
      aria-modal='true'
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'
      dir='ltr'
      role='dialog'
      onClick={e => {
        if (e.target === e.currentTarget) close()
      }}
    >
      <div className='w-full max-w-md border border-border bg-card shadow-sm'>
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
      aria-labelledby='delete-product-title'
      aria-modal='true'
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'
      dir='ltr'
      role='dialog'
      onClick={e => {
        if (e.target === e.currentTarget) close()
      }}
    >
      <div className='w-full max-w-md border border-border bg-card shadow-sm'>
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
        <label className={productLabelClass} htmlFor={`${idPrefix}-mill`}>
          Mill *
        </label>
        <select
          className={productFieldClass}
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
        (isCustom &&
          brand &&
          !manufacturers.some(m => m.id === manufacturerId))) && (
        <div>
          <label className={productLabelClass} htmlFor={`${idPrefix}-brand`}>
            New mill name *
          </label>
          <input
            className={productFieldClass}
            id={`${idPrefix}-brand`}
            placeholder='e.g. Caspian Steel Mills'
            value={brand || ''}
            onChange={e =>
              onChange({ manufacturerId: '__custom__', brand: e.target.value })
            }
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
      aria-labelledby='edit-product-title'
      aria-modal='true'
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'
      dir='ltr'
      role='dialog'
      onClick={e => {
        if (e.target === e.currentTarget) close()
      }}
    >
      <div className='max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-border bg-card shadow-sm'>
        <div className='flex items-start justify-between border-b border-border px-5 py-3'>
          <div className='min-w-0'>
            <h2
              className='font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'
              id='edit-product-title'
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
            aria-label='Close'
            className='flex h-8 w-8 shrink-0 items-center justify-center border border-border bg-background text-foreground transition-colors duration-200 ease-out hover:bg-muted'
            type='button'
            onClick={close}
          >
            <X className='h-4 w-4' />
          </button>
        </div>

        <div className='space-y-5 px-5 py-5'>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div className='sm:col-span-2'>
              <label className={productLabelClass} htmlFor='edit-name'>
                Name *
              </label>
              <input
                className={productFieldClass}
                id='edit-name'
                placeholder='e.g. Ribbed rebar 16mm'
                value={editProductData.name}
                onChange={e => update({ name: e.target.value })}
              />
            </div>

            <MillField
              brand={editProductData.brand}
              idPrefix='edit'
              manufacturerId={editProductData.manufacturerId}
              manufacturers={manufacturers}
              onChange={patch => update(patch)}
            />

            <div>
              <label className={productLabelClass} htmlFor='edit-size'>
                Size *
              </label>
              <input
                className={productFieldClass}
                id='edit-size'
                placeholder='e.g. 16mm, IPE 200'
                value={editProductData.size}
                onChange={e => update({ size: e.target.value })}
              />
            </div>

            <div>
              <label className={productLabelClass} htmlFor='edit-price'>
                Unit price (USD) *
              </label>
              <input
                className={productFieldClass}
                id='edit-price'
                inputMode='decimal'
                min='0'
                placeholder='0.00'
                step='0.01'
                type='number'
                value={editProductData.price ?? ''}
                onChange={e =>
                  update({ price: parseFloat(e.target.value) || 0 })
                }
              />
            </div>

            <div>
              <label className={productLabelClass} htmlFor='edit-weight'>
                Weight (kg)
              </label>
              <input
                className={productFieldClass}
                id='edit-weight'
                inputMode='decimal'
                min='0'
                placeholder='Optional'
                step='0.01'
                type='number'
                value={editProductData.weight?.toString() || ''}
                onChange={e =>
                  update({
                    weight: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  })
                }
              />
            </div>

            <div>
              <label className={productLabelClass} htmlFor='edit-category'>
                Category *
              </label>
              <select
                className={productFieldClass}
                id='edit-category'
                value={editProductData.categoryId}
                onChange={e =>
                  update({ categoryId: e.target.value, subcategory: '' })
                }
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
              <label className={productLabelClass} htmlFor='edit-sub'>
                Sub-line *
              </label>
              <select
                className={productFieldClass}
                disabled={!editProductData.categoryId}
                id='edit-sub'
                value={editProductData.subcategory}
                onChange={e => update({ subcategory: e.target.value })}
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
                  className={`flex-1 border px-3 py-2.5 text-sm font-medium transition-colors duration-200 ease-out ${
                    editProductData.inStock === true
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border bg-background text-foreground hover:bg-muted'
                  }`}
                  type='button'
                  onClick={() => update({ inStock: true })}
                >
                  In stock
                </button>
                <button
                  className={`flex-1 border px-3 py-2.5 text-sm font-medium transition-colors duration-200 ease-out ${
                    editProductData.inStock === false
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border bg-background text-foreground hover:bg-muted'
                  }`}
                  type='button'
                  onClick={() => update({ inStock: false })}
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
            className='border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors duration-200 ease-out hover:bg-muted'
            type='button'
            onClick={close}
          >
            Cancel
          </button>
          <button
            className='inline-flex items-center gap-2 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity duration-200 ease-out hover:opacity-90'
            type='button'
            onClick={onSave}
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
      aria-labelledby='add-product-title'
      aria-modal='true'
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'
      dir='ltr'
      role='dialog'
      onClick={e => {
        if (e.target === e.currentTarget) close()
      }}
    >
      <div className='max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-border bg-card shadow-sm'>
        <div className='flex items-start justify-between border-b border-border px-5 py-3'>
          <div>
            <h2
              className='font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'
              id='add-product-title'
            >
              Add product
            </h2>
            <p className='mt-1 text-xs text-muted-foreground'>
              New catalog line · unit price in USD
            </p>
          </div>
          <button
            aria-label='Close'
            className='flex h-8 w-8 items-center justify-center border border-border bg-background text-foreground transition-colors duration-200 ease-out hover:bg-muted'
            type='button'
            onClick={close}
          >
            <X className='h-4 w-4' />
          </button>
        </div>

        <div className='space-y-5 px-5 py-5'>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div className='sm:col-span-2'>
              <label className={productLabelClass} htmlFor='add-name'>
                Name *
              </label>
              <input
                className={productFieldClass}
                id='add-name'
                placeholder='e.g. Ribbed rebar 16mm'
                value={newProductData.name}
                onChange={e => update({ name: e.target.value })}
              />
            </div>

            <MillField
              brand={newProductData.brand}
              idPrefix='add'
              manufacturerId={newProductData.manufacturerId}
              manufacturers={manufacturers}
              onChange={patch => update(patch)}
            />

            <div>
              <label className={productLabelClass} htmlFor='add-size'>
                Size *
              </label>
              <input
                className={productFieldClass}
                id='add-size'
                placeholder='e.g. 16mm, IPE 200'
                value={newProductData.size}
                onChange={e => update({ size: e.target.value })}
              />
            </div>

            <div>
              <label className={productLabelClass} htmlFor='add-price'>
                Unit price (USD) *
              </label>
              <input
                className={productFieldClass}
                id='add-price'
                inputMode='decimal'
                min='0'
                placeholder='0.00'
                step='0.01'
                type='number'
                value={newProductData.price || ''}
                onChange={e =>
                  update({ price: parseFloat(e.target.value) || 0 })
                }
              />
            </div>

            <div>
              <label className={productLabelClass} htmlFor='add-weight'>
                Weight (kg)
              </label>
              <input
                className={productFieldClass}
                id='add-weight'
                inputMode='decimal'
                min='0'
                placeholder='Optional'
                step='0.01'
                type='number'
                value={newProductData.weight?.toString() || ''}
                onChange={e =>
                  update({
                    weight: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  })
                }
              />
            </div>

            <div>
              <label className={productLabelClass} htmlFor='add-category'>
                Category *
              </label>
              <select
                className={productFieldClass}
                id='add-category'
                value={newProductData.categoryId}
                onChange={e =>
                  update({ categoryId: e.target.value, subcategory: '' })
                }
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
              <label className={productLabelClass} htmlFor='add-sub'>
                Sub-line *
              </label>
              <select
                className={productFieldClass}
                disabled={!newProductData.categoryId}
                id='add-sub'
                value={newProductData.subcategory}
                onChange={e => update({ subcategory: e.target.value })}
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
                  className={`flex-1 border px-3 py-2.5 text-sm font-medium transition-colors duration-200 ease-out ${
                    newProductData.inStock === true
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border bg-background text-foreground hover:bg-muted'
                  }`}
                  type='button'
                  onClick={() => update({ inStock: true })}
                >
                  In stock
                </button>
                <button
                  className={`flex-1 border px-3 py-2.5 text-sm font-medium transition-colors duration-200 ease-out ${
                    newProductData.inStock === false
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border bg-background text-foreground hover:bg-muted'
                  }`}
                  type='button'
                  onClick={() => update({ inStock: false })}
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
            className='border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors duration-200 ease-out hover:bg-muted'
            type='button'
            onClick={close}
          >
            Cancel
          </button>
          <button
            className='inline-flex items-center gap-2 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity duration-200 ease-out hover:opacity-90'
            type='button'
            onClick={onSave}
          >
            <Plus className='h-4 w-4' />
            Add product
          </button>
        </div>
      </div>
    </div>
  )
}
