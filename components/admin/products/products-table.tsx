import type { SortDescriptor } from '@heroui/table'
import type { KeyboardEvent } from 'react'
import type { ProductDTO } from '@/types/products'

import { useRef, useState } from 'react'
import { Checkbox } from '@heroui/checkbox'
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from '@heroui/table'
import { Edit, Trash2 } from 'lucide-react'

interface Props {
  isLoading: boolean
  products: ProductDTO[]
  selectedIds: string[]
  sortDescriptor: SortDescriptor
  onDelete: (product: ProductDTO) => void
  onEdit: (product: ProductDTO) => void
  onPriceSave: (product: ProductDTO, price: number) => Promise<unknown>
  onSelect: (id: string, checked: boolean) => void
  onSelectAll: (checked: boolean) => void
  onSortChange: (descriptor: SortDescriptor) => void
  onStockToggle: (product: ProductDTO) => void
}

const iconBtn =
  'inline-flex h-8 w-8 cursor-pointer items-center justify-center border border-border bg-card transition-colors duration-200 ease-out hover:bg-muted'

export default function ProductsTable({
  isLoading,
  products,
  selectedIds,
  sortDescriptor,
  onDelete,
  onEdit,
  onPriceSave,
  onSelect,
  onSelectAll,
  onSortChange,
  onStockToggle,
}: Props) {
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null)
  const [tempPrice, setTempPrice] = useState('')
  // Enter blurs the input, so the save would otherwise fire twice
  const saveLock = useRef(false)

  const startPriceEdit = (product: ProductDTO) => {
    saveLock.current = false
    setEditingPriceId(product.id)
    setTempPrice(product.price.toString())
  }

  const cancelPriceEdit = () => {
    saveLock.current = false
    setEditingPriceId(null)
    setTempPrice('')
  }

  const savePrice = async (product: ProductDTO) => {
    if (saveLock.current || editingPriceId !== product.id) return

    const newPrice = parseFloat(tempPrice)

    // Unchanged / invalid — leave quietly (no error toast)
    if (Number.isNaN(newPrice) || newPrice <= 0 || newPrice === product.price) {
      cancelPriceEdit()

      return
    }

    saveLock.current = true
    // Exit edit mode immediately so the input (and its validation chrome) unmounts
    setEditingPriceId(null)
    setTempPrice('')

    try {
      await onPriceSave(product, newPrice)
    } finally {
      saveLock.current = false
    }
  }

  const handlePriceKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      // Blur once — onBlur saves (avoids a double PATCH from Enter + blur)
      e.currentTarget.blur()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      cancelPriceEdit()
    }
  }

  return (
    <div className='overflow-x-auto'>
      <Table
        aria-label='Products table'
        classNames={{
          wrapper: 'shadow-none rounded-none',
          th: 'bg-muted/50 text-muted-foreground text-[10px] font-semibold uppercase tracking-[0.12em]',
          td: 'py-3',
        }}
        sortDescriptor={sortDescriptor}
        onSortChange={onSortChange}
      >
        <TableHeader>
          <TableColumn width={50}>
            <Checkbox
              aria-label='Select all products'
              isSelected={
                products.length > 0 && selectedIds.length === products.length
              }
              onValueChange={onSelectAll}
            />
          </TableColumn>
          <TableColumn key='name' allowsSorting>
            Product
          </TableColumn>
          <TableColumn key='brand' allowsSorting>
            Mill
          </TableColumn>
          <TableColumn key='size' allowsSorting>
            Size
          </TableColumn>
          <TableColumn key='price' allowsSorting>
            Price (USD)
          </TableColumn>
          <TableColumn key='inStock' allowsSorting>
            Stock
          </TableColumn>
          <TableColumn key='category' allowsSorting>
            Category
          </TableColumn>
          <TableColumn key='subcategory'>Sub-line</TableColumn>
          <TableColumn width={150}>Actions</TableColumn>
        </TableHeader>
        <TableBody emptyContent='No products found' isLoading={isLoading}>
          {products.map(product => (
            <TableRow
              key={product.id}
              className='transition-colors duration-200 ease-out hover:bg-muted/50'
            >
              <TableCell>
                <Checkbox
                  aria-label={`Select ${product.name}`}
                  isSelected={selectedIds.includes(product.id)}
                  onValueChange={checked => onSelect(product.id, checked)}
                />
              </TableCell>
              <TableCell>
                <span className='font-medium text-foreground'>
                  {product.name}
                </span>
              </TableCell>
              <TableCell>
                <span className='text-muted-foreground'>
                  {product.brand || '—'}
                </span>
              </TableCell>
              <TableCell>
                <span className='font-mono text-xs tabular-nums text-foreground'>
                  {product.size || '—'}
                </span>
              </TableCell>
              <TableCell>
                {editingPriceId === product.id ? (
                  <input
                    // eslint-disable-next-line jsx-a11y/no-autofocus -- focus follows the click that opened this inline editor
                    autoFocus
                    aria-label='Edit unit price'
                    className='h-8 w-28 border border-border bg-background px-2 font-mono text-sm font-semibold tabular-nums text-foreground outline-none focus:border-foreground focus:ring-1 focus:ring-foreground'
                    inputMode='decimal'
                    min='0'
                    step='0.01'
                    type='number'
                    value={tempPrice}
                    onBlur={() => savePrice(product)}
                    onChange={e => setTempPrice(e.target.value)}
                    onKeyDown={handlePriceKeyDown}
                  />
                ) : (
                  <button
                    className='cursor-pointer font-mono text-sm font-semibold tabular-nums text-foreground hover:underline'
                    title='Click to edit'
                    type='button'
                    onClick={() => startPriceEdit(product)}
                  >
                    $
                    {Number(product.price).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </button>
                )}
              </TableCell>
              <TableCell>
                <button
                  className={`cursor-pointer border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide transition-colors duration-200 ease-out ${
                    product.inStock
                      ? 'border-emerald-600/30 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-200'
                      : 'border-red-600/30 bg-red-50 text-red-800 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-200'
                  }`}
                  title='Click to toggle stock'
                  type='button'
                  onClick={() => onStockToggle(product)}
                >
                  {product.inStock ? 'In stock' : 'Out'}
                </button>
              </TableCell>
              <TableCell>
                <span className='border border-border bg-muted/40 px-2 py-0.5 text-xs text-foreground'>
                  {product.category?.name}
                </span>
              </TableCell>
              <TableCell>
                <span className='text-sm text-muted-foreground'>
                  {product.subcategory}
                </span>
              </TableCell>
              <TableCell>
                <div className='flex gap-1'>
                  <button
                    aria-label={`Edit ${product.name}`}
                    className={`${iconBtn} text-foreground`}
                    title='Edit'
                    type='button'
                    onClick={() => onEdit(product)}
                  >
                    <Edit className='h-3.5 w-3.5' />
                  </button>
                  <button
                    aria-label={`Delete ${product.name}`}
                    className={`${iconBtn} text-red-600 dark:text-red-400`}
                    title='Delete'
                    type='button'
                    onClick={() => onDelete(product)}
                  >
                    <Trash2 className='h-3.5 w-3.5' />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
