'use client'

import type { ActionResult } from '@/lib/actions'

import { X } from 'lucide-react'
import { useFieldArray, useWatch } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { type FormMode, FormDialog } from '@/components/ui/dialogs'
import {
  FormField,
  Input,
  Select,
  Textarea,
  fieldErrorId,
  labelClass,
} from '@/components/ui/field'
import { CATEGORY_ICONS, resolveCategoryIcon } from '@/config/category-icons'
import { useActionForm } from '@/hooks/use-action-form'
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
  mode,
  defaultValues = emptyCategory,
  action,
}: {
  mode: FormMode
  defaultValues?: CategoryFormValues
  /** A Server Action (or a call to one); it validates again on the server. */
  action: (values: CategoryFormValues) => Promise<ActionResult>
}) {
  const {
    control,
    field,
    formState: { errors },
    dialog,
  } = useActionForm({
    schema: categorySchema,
    defaultValues,
    action,
    mode,
    noun: 'category',
  })
  const subs = useFieldArray({ control, name: 'subcategories' })
  const [name, slug, icon] = useWatch({
    control,
    name: ['name', 'slug', 'icon'],
  })

  return (
    <FormDialog {...dialog}>
      <FormField error={errors.name?.message} id='category-name' label='Name *'>
        <Input placeholder='e.g. Rebar' {...field('name')} />
      </FormField>

      <FormField error={errors.slug?.message} id='category-slug' label='Slug'>
        <Input
          className='font-mono'
          placeholder={slugify(name) || 'auto from name'}
          {...field('slug')}
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
          <Select {...field('icon')}>
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
          placeholder='Short catalog blurb'
          rows={3}
          {...field('description')}
        />
      </FormField>

      <fieldset>
        {/* <legend> must stay the first child; floating it lays it out like
            normal content, so the button can sit beside it */}
        <legend className={`${labelClass} float-left`}>Sub-lines</legend>
        <Button
          aria-label='Add sub-line'
          className='float-right -mt-2'
          size='sm'
          variant='link'
          onClick={() => subs.append({ value: '' })}
        >
          + Add
        </Button>
        {subs.fields.length === 0 ? (
          <p className='clear-both text-xs text-muted-foreground'>
            No sub-lines yet.
          </p>
        ) : (
          <ul className='clear-both space-y-2'>
            {subs.fields.map((row, index) => {
              const control = field(`subcategories.${index}.value`)
              const message = errors.subcategories?.[index]?.value?.message

              return (
                // row.id, not index: keeps each input attached to its own row on remove
                <li key={row.id}>
                  <div className='flex gap-2'>
                    <Input
                      aria-label={`Sub-line ${index + 1}`}
                      placeholder='e.g. Ribbed'
                      {...control}
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
                      id={fieldErrorId(control.id)}
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
      </fieldset>
    </FormDialog>
  )
}
