'use client'

import type {
  CategoryOption,
  MillOption,
} from '@/components/admin/products/types'
import type { ActionResult } from '@/lib/actions'

import { useWatch } from 'react-hook-form'

import { type FormMode, FormDialog } from '@/components/ui/dialogs'
import { FormField, Input, Select } from '@/components/ui/field'
import { useActionForm } from '@/hooks/use-action-form'
import {
  type ProductFormValues,
  emptyProduct,
  productSchema,
} from '@/lib/schemas/product'

/** Add/edit dialog for one product. Mount only while open. */
export function ProductFormDialog({
  mode,
  defaultValues = emptyProduct,
  action,
  categories,
  manufacturers,
}: {
  mode: FormMode
  defaultValues?: ProductFormValues
  /** A Server Action (or a call to one); it validates again on the server. */
  action: (values: ProductFormValues) => Promise<ActionResult>
  categories: CategoryOption[]
  manufacturers: MillOption[]
}) {
  const {
    control,
    field,
    setValue,
    formState: { errors },
    dialog,
  } = useActionForm({
    schema: productSchema,
    defaultValues,
    action,
    mode,
    noun: 'product',
  })
  const [manufacturerId, categoryId] = useWatch({
    control,
    name: ['manufacturerId', 'categoryId'],
  })
  const subcategories =
    categories.find(c => c.id === categoryId)?.subcategories ?? []
  const category = field('categoryId')

  return (
    <FormDialog {...dialog}>
      <FormField error={errors.name?.message} id='product-name' label='Name *'>
        <Input placeholder='e.g. Ribbed rebar 16mm' {...field('name')} />
      </FormField>

      <div className='grid gap-4 sm:grid-cols-2'>
        <FormField
          error={errors.manufacturerId?.message}
          id='product-manufacturerId'
          label='Mill *'
        >
          <Select {...field('manufacturerId')}>
            <option value=''>New mill (type its name)</option>
            {manufacturers.map(m => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </Select>
        </FormField>
        {manufacturerId ? null : (
          <FormField
            error={errors.brand?.message}
            id='product-brand'
            label='New mill name *'
          >
            <Input placeholder='e.g. Caspian Steel Mills' {...field('brand')} />
          </FormField>
        )}

        <FormField
          error={errors.categoryId?.message}
          id='product-categoryId'
          label='Category *'
        >
          <Select
            {...category}
            onChange={e => {
              // A sub-line belongs to one category, so a new category starts blank
              setValue('subcategory', '')
              category.onChange(e)
            }}
          >
            <option value=''>Select category</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField
          error={errors.subcategory?.message}
          id='product-subcategory'
          label='Sub-line *'
        >
          <Select disabled={!categoryId} {...field('subcategory')}>
            <option value=''>
              {categoryId ? 'Select sub-line' : 'Select a category first'}
            </option>
            {subcategories.map(sub => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField error={errors.size?.message} id='product-size' label='Size'>
          <Input placeholder='e.g. 16mm, IPE 200' {...field('size')} />
        </FormField>
        <FormField
          error={errors.price?.message}
          id='product-price'
          label='Unit price (USD) *'
        >
          <Input
            inputMode='decimal'
            min='0'
            placeholder='0.00'
            step='0.01'
            type='number'
            {...field('price')}
          />
        </FormField>
        <FormField
          error={errors.weight?.message}
          id='product-weight'
          label='Weight (kg)'
        >
          <Input
            inputMode='decimal'
            min='0'
            placeholder='Optional'
            step='0.01'
            type='number'
            {...field('weight')}
          />
        </FormField>
      </div>

      <label className='flex cursor-pointer items-center gap-2 text-sm text-foreground'>
        <input
          className='h-4 w-4 cursor-pointer accent-foreground'
          type='checkbox'
          {...field('inStock')}
        />
        In stock (otherwise shown as on inquiry)
      </label>
    </FormDialog>
  )
}
