'use client'

import type { ActionResult } from '@/lib/actions'

import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, X } from 'lucide-react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { FormDialog } from '@/components/ui/dialogs'
import {
  FormField,
  Input,
  Select,
  Textarea,
  fieldErrorId,
  labelClass,
} from '@/components/ui/field'
import { CATEGORY_ICONS, resolveCategoryIcon } from '@/config/category-icons'
import { toastResult } from '@/lib/action-toast'
import { type CategoryFormValues, categorySchema } from '@/lib/schemas/category'
import { slugify } from '@/lib/slug'

export const emptyCategory: CategoryFormValues = {
  name: '',
  slug: '',
  icon: '',
  description: '',
  subcategories: [],
}

/** Add/edit dialog for one category. Mount only while open. */
export function CategoryFormDialog({
  title,
  submitLabel,
  pendingLabel,
  successMessage,
  defaultValues = emptyCategory,
  onSubmit,
  onClose,
}: {
  title: string
  submitLabel: string
  pendingLabel: string
  successMessage: string
  defaultValues?: CategoryFormValues
  /** A Server Action; it validates again on the server. */
  onSubmit: (values: CategoryFormValues) => Promise<ActionResult>
  onClose: () => void
}) {
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    // raw: submit the form's own values; the action does the transforming
    resolver: zodResolver(categorySchema, undefined, { raw: true }),
    defaultValues,
  })
  const subs = useFieldArray({ control, name: 'subcategories' })
  const [name, slug, icon] = useWatch({
    control,
    name: ['name', 'slug', 'icon'],
  })

  const submit = handleSubmit(async values => {
    const result = await onSubmit(values)

    if (toastResult(result, successMessage, setError)) onClose()
  })

  // Spread onto a control so it's marked invalid and announces its message.
  const invalid = (id: string, message?: string) => ({
    'aria-invalid': !!message,
    'aria-describedby': message ? fieldErrorId(id) : undefined,
  })

  return (
    <FormDialog
      pending={isSubmitting}
      pendingLabel={pendingLabel}
      submitIcon={<Plus aria-hidden className='h-4 w-4' />}
      submitLabel={submitLabel}
      title={title}
      onClose={onClose}
      onSubmit={submit}
    >
      <FormField error={errors.name?.message} id='category-name' label='Name *'>
        <Input
          id='category-name'
          placeholder='e.g. Rebar'
          {...invalid('category-name', errors.name?.message)}
          {...register('name')}
        />
      </FormField>

      <FormField error={errors.slug?.message} id='category-slug' label='Slug'>
        <Input
          className='font-mono'
          id='category-slug'
          placeholder={slugify(name) || 'auto from name'}
          {...invalid('category-slug', errors.slug?.message)}
          {...register('slug')}
        />
      </FormField>

      <FormField error={errors.icon?.message} id='category-icon' label='Icon'>
        <div className='flex items-center gap-2'>
          <span className='flex h-10 w-10 shrink-0 items-center justify-center border border-border bg-muted/50'>
            <i
              aria-hidden
              className={`${resolveCategoryIcon(icon || slug || slugify(name))} text-lg`}
            />
          </span>
          <Select
            id='category-icon'
            {...invalid('category-icon', errors.icon?.message)}
            {...register('icon')}
          >
            <option value=''>Default from slug</option>
            {Object.entries(CATEGORY_ICONS).map(([key, cls]) => (
              <option key={cls} value={cls}>
                {key} ({cls})
              </option>
            ))}
          </Select>
        </div>
      </FormField>

      <FormField
        error={errors.description?.message}
        id='category-description'
        label='Description'
      >
        <Textarea
          id='category-description'
          placeholder='Short catalog blurb'
          rows={3}
          {...invalid('category-description', errors.description?.message)}
          {...register('description')}
        />
      </FormField>

      <fieldset>
        <legend className={labelClass}>Sub-lines</legend>
        {subs.fields.length === 0 ? (
          <p className='text-xs text-muted-foreground'>No sub-lines yet.</p>
        ) : (
          <ul className='space-y-2'>
            {subs.fields.map((field, index) => {
              const id = `category-sub-${index}`
              const message = errors.subcategories?.[index]?.value?.message

              return (
                // field.id, not index: keeps each input attached to its own row on remove
                <li key={field.id}>
                  <div className='flex gap-2'>
                    <Input
                      aria-label={`Sub-line ${index + 1}`}
                      id={id}
                      placeholder='e.g. Ribbed'
                      {...invalid(id, message)}
                      {...register(`subcategories.${index}.value`)}
                    />
                    <Button
                      aria-label={`Remove sub-line ${index + 1}`}
                      className='h-10 w-10 shrink-0'
                      size='icon'
                      variant='outline'
                      onClick={() => subs.remove(index)}
                    >
                      <X aria-hidden className='h-4 w-4' />
                    </Button>
                  </div>
                  {message ? (
                    <p
                      className='mt-1 text-xs text-red-700 dark:text-red-400'
                      id={fieldErrorId(id)}
                      role='alert'
                    >
                      {message}
                    </p>
                  ) : null}
                </li>
              )
            })}
          </ul>
        )}
        <Button
          className='mt-2'
          size='sm'
          variant='outline'
          onClick={() => subs.append({ value: '' })}
        >
          <Plus aria-hidden className='h-4 w-4' />
          Add sub-line
        </Button>
      </fieldset>
    </FormDialog>
  )
}
