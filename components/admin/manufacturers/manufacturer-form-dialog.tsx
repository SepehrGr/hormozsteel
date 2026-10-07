'use client'

import type { ActionResult } from '@/lib/actions'

import { useWatch } from 'react-hook-form'

import { type FormMode, FormDialog } from '@/components/ui/dialogs'
import { FormField, Input, Textarea } from '@/components/ui/field'
import { useActionForm } from '@/hooks/use-action-form'
import {
  type ManufacturerFormValues,
  manufacturerSchema,
} from '@/lib/schemas/manufacturer'
import { slugify } from '@/lib/slug'

export const emptyManufacturer: ManufacturerFormValues = {
  name: '',
  slug: '',
  description: '',
  website: '',
  email: '',
  phone: '',
  address: '',
}

/** Add/edit dialog for one manufacturer. Mount only while open. */
export function ManufacturerFormDialog({
  mode,
  defaultValues = emptyManufacturer,
  action,
}: {
  mode: FormMode
  defaultValues?: ManufacturerFormValues
  /** A Server Action (or a call to one); it validates again on the server. */
  action: (values: ManufacturerFormValues) => Promise<ActionResult>
}) {
  const {
    control,
    field,
    formState: { errors },
    dialog,
  } = useActionForm({
    schema: manufacturerSchema,
    defaultValues,
    action,
    mode,
    noun: 'manufacturer',
  })
  const name = useWatch({ control, name: 'name' })

  return (
    <FormDialog {...dialog}>
      <FormField
        error={errors.name?.message}
        id='manufacturer-name'
        label='Name *'
      >
        <Input placeholder='e.g. Caspian Steel Mills' {...field('name')} />
      </FormField>

      <FormField
        error={errors.slug?.message}
        id='manufacturer-slug'
        label='Slug'
      >
        <Input
          className='font-mono'
          placeholder={slugify(name) || 'auto from name'}
          {...field('slug')}
        />
      </FormField>

      <FormField
        error={errors.description?.message}
        id='manufacturer-description'
        label='Description'
      >
        <Textarea
          placeholder='Short note about the mill'
          rows={3}
          {...field('description')}
        />
      </FormField>

      <div className='grid gap-4 sm:grid-cols-2'>
        <FormField
          error={errors.website?.message}
          id='manufacturer-website'
          label='Website'
        >
          <Input
            inputMode='url'
            placeholder='https://…'
            {...field('website')}
          />
        </FormField>
        <FormField
          error={errors.email?.message}
          id='manufacturer-email'
          label='Email'
        >
          <Input
            autoComplete='off'
            inputMode='email'
            placeholder='sales@…'
            {...field('email')}
          />
        </FormField>
        <FormField
          error={errors.phone?.message}
          id='manufacturer-phone'
          label='Phone'
        >
          <Input
            autoComplete='off'
            inputMode='tel'
            placeholder='+98 …'
            {...field('phone')}
          />
        </FormField>
        <FormField
          error={errors.address?.message}
          id='manufacturer-address'
          label='Address'
        >
          <Input placeholder='City, region' {...field('address')} />
        </FormField>
      </div>
    </FormDialog>
  )
}
