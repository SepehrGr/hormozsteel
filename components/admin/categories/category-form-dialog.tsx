'use client'

import type { ActionResult } from '@/lib/actions'

import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import {
  type FormMode,
  FormDialog,
  formModeCopy,
} from '@/components/ui/dialogs'
import { useCloseDialog } from '@/components/ui/dialog-scope'
import {
  FormField,
  Input,
  Select,
  Textarea,
  fieldErrorId,
  invalidProps,
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
  mode,
  defaultValues = emptyCategory,
  action,
}: {
  mode: FormMode
  defaultValues?: CategoryFormValues
  /** A Server Action (or a call to one); it validates again on the server. */
  action: (values: CategoryFormValues) => Promise<ActionResult>
}) {
  const { title, submitLabel, pendingLabel, successMessage, Icon } =
    formModeCopy(mode, 'category')
  const close = useCloseDialog()
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
    const result = await action(values)

    if (toastResult(result, successMessage, setError)) close()
  })

  return (
    <FormDialog
      pending={isSubmitting}
      pendingLabel={pendingLabel}
      submitIcon={<Icon aria-hidden className='h-4 w-4' />}
      submitLabel={submitLabel}
      title={title}
      onClose={close}
      onSubmit={submit}
    >
      <FormField error={errors.name?.message} id='category-name' label='Name *'>
        <Input
          id='category-name'
          placeholder='e.g. Rebar'
          {...invalidProps('category-name', errors.name?.message)}
          {...register('name')}
        />
      </FormField>

      <FormField error={errors.slug?.message} id='category-slug' label='Slug'>
        <Input
          className='font-mono'
          id='category-slug'
          placeholder={slugify(name) || 'auto from name'}
          {...invalidProps('category-slug', errors.slug?.message)}
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
            {...invalidProps('category-icon', errors.icon?.message)}
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
          {...invalidProps('category-description', errors.description?.message)}
          {...register('description')}
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
                      {...invalidProps(id, message)}
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
      </fieldset>
    </FormDialog>
  )
}
