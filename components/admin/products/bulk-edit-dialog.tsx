import type { CategoryOption } from '@/components/admin/products/types'

import { updateProducts } from '@/app/admin/products/actions'
import { FormDialog } from '@/components/ui/dialogs'
import { FormField, Input, Select } from '@/components/ui/field'
import { useActionForm } from '@/hooks/use-action-form'
import { pluralize } from '@/lib/format'
import {
  type ProductChangesValues,
  productChangesSchema,
} from '@/lib/schemas/product'

const keep: ProductChangesValues = { price: '', stock: '', categoryId: '' }

/** Set price, stock or category on the selected products. Mount only while open. */
export function BulkEditDialog({
  ids,
  categories,
}: {
  ids: string[]
  categories: CategoryOption[]
}) {
  const {
    field,
    formState: { errors },
    dialog,
  } = useActionForm({
    schema: productChangesSchema,
    defaultValues: keep,
    action: changes => updateProducts({ ids, changes }),
    mode: 'edit',
    noun: 'products',
  })
  const count = pluralize(ids.length, 'product')

  return (
    <FormDialog
      {...dialog}
      pendingLabel='Applying…'
      submitLabel={`Apply to ${count}`}
    >
      <p className='text-sm text-muted-foreground'>
        Changes apply to{' '}
        <span className='font-medium tabular-nums text-foreground'>
          {count}
        </span>
        . Fields left on “Keep” stay as they are.
      </p>

      <FormField
        error={errors.price?.message}
        id='products-price'
        label='New unit price (USD)'
      >
        <Input
          inputMode='decimal'
          min='0'
          placeholder='Keep current prices'
          step='0.01'
          type='number'
          {...field('price')}
        />
      </FormField>

      <div className='grid gap-4 sm:grid-cols-2'>
        <FormField
          error={errors.stock?.message}
          id='products-stock'
          label='Stock'
        >
          <Select {...field('stock')}>
            <option value=''>Keep</option>
            <option value='in'>In stock</option>
            <option value='out'>On inquiry</option>
          </Select>
        </FormField>
        <FormField
          error={errors.categoryId?.message}
          id='products-categoryId'
          label='Category'
        >
          <Select {...field('categoryId')}>
            <option value=''>Keep</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <p className='text-xs text-muted-foreground'>
        A new category clears any sub-line it doesn’t have.
      </p>
    </FormDialog>
  )
}
