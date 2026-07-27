import React from 'react'
import { TableRow, TableCell } from '@heroui/table'
import { Checkbox } from '@heroui/checkbox'
import { Input } from '@heroui/input'
import { Chip } from '@heroui/chip'
import { Button } from '@heroui/button'
import { Package, Edit, Trash2 } from 'lucide-react'

interface Product {
  id: string
  name: string
  brand: string
  size: string
  price: number
  inStock: boolean
  category: {
    name: string
  }
  subcategory: string
  createdAt: string
}

interface Props {
  product: Product
  isSelected: boolean
  onSelect: (checked: boolean) => void
  editingPriceId: string | null
  tempPrice: string
  setTempPrice: (v: string) => void
  onPriceClick: (p: Product) => void
  onPriceBlur: (p: Product) => Promise<void>
  onPriceKeyDown: (e: React.KeyboardEvent, p: Product) => void
  onStockToggle: (p: Product) => Promise<void>
  onEdit: (p: Product) => void
  onDelete: (p: Product) => void
}

export default function ProductRow({
  product,
  isSelected,
  onSelect,
  editingPriceId,
  tempPrice,
  setTempPrice,
  onPriceClick,
  onPriceBlur,
  onPriceKeyDown,
  onStockToggle,
  onEdit,
  onDelete,
}: Props) {
  return (
    <TableRow
      key={product.id}
      className='transition-colors hover:bg-gray-50 dark:hover:bg-gray-800'
    >
      <TableCell>
        <Checkbox isSelected={isSelected} onValueChange={onSelect} />
      </TableCell>
      <TableCell>
        <div className='flex items-center gap-3'>
          <div className='p-2 bg-blue-100 rounded-lg dark:bg-blue-900'>
            <Package className='w-4 h-4 text-blue-600 dark:text-blue-400' />
          </div>
          <span className='font-medium text-gray-900 dark:text-white'>
            {product.name}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <span className='text-gray-600 dark:text-gray-400'>
          {product.brand}
        </span>
      </TableCell>
      <TableCell>
        <span className='font-medium text-gray-900 dark:text-white'>
          {product.size || 'نامشخص'}
        </span>
      </TableCell>
      <TableCell>
        {editingPriceId === product.id ? (
          <Input
            autoFocus
            classNames={{
              input: 'text-green-600 dark:text-green-400 font-bold text-right',
              inputWrapper: 'h-8 min-h-8 border-green-500',
            }}
            size='sm'
            type='number'
            value={tempPrice}
            variant='bordered'
            onBlur={() => onPriceBlur(product)}
            onChange={e => setTempPrice(e.target.value)}
            onKeyDown={e => onPriceKeyDown(e, product)}
          />
        ) : (
          <span
            className='font-bold text-green-600 cursor-pointer dark:text-green-400 hover:underline'
            title='کلیک کنید برای ویرایش'
            onClick={() => onPriceClick(product)}
          >
            {product.price.toLocaleString('fa-IR')}
          </span>
        )}
      </TableCell>
      <TableCell>
        <Chip
          className='transition-opacity cursor-pointer hover:opacity-80'
          color={product.inStock ? 'success' : 'danger'}
          size='sm'
          title='کلیک کنید برای تغییر وضعیت'
          variant='flat'
          onClick={() => onStockToggle(product)}
        >
          {product.inStock ? 'موجود' : 'ناموجود'}
        </Chip>
      </TableCell>
      <TableCell>
        <Chip size='sm' variant='bordered'>
          {product.category.name}
        </Chip>
      </TableCell>
      <TableCell>
        <span className='text-sm text-gray-500 dark:text-gray-400'>
          {product.subcategory}
        </span>
      </TableCell>
      <TableCell>
        <div className='flex gap-1'>
          <Button
            isIconOnly
            color='primary'
            size='sm'
            variant='light'
            onPress={() => onEdit(product)}
          >
            <Edit className='w-4 h-4' />
          </Button>
          <Button
            isIconOnly
            color='danger'
            size='sm'
            variant='light'
            onPress={() => onDelete(product)}
          >
            <Trash2 className='w-4 h-4' />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}
