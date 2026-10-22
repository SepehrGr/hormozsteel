'use client'

import type { ActionResult } from '@/lib/actions'

import { type FormMode, FormDialog } from '@/components/ui/dialogs'
import {
  choiceClass,
  fieldHintId,
  FormField,
  Input,
  labelClass,
  Select,
} from '@/components/ui/field'
import { useActionForm } from '@/hooks/use-action-form'
import {
  type UserFormValues,
  createUserSchema,
  ROLE_LABELS,
  ROLES,
  updateUserSchema,
} from '@/lib/schemas/user'

export const emptyUser: UserFormValues = {
  name: '',
  email: '',
  role: 'ADMIN',
  isActive: true,
  password: '',
}

/**
 * Add/edit dialog for one admin account. Mount only while open.
 * Adding requires a password; editing treats a blank one as "keep current".
 */
export function UserFormDialog({
  mode,
  defaultValues = emptyUser,
  isSelf = false,
  action,
}: {
  mode: FormMode
  defaultValues?: UserFormValues
  /**
   * Editing your own account: role and status are shown, not offered, since
   * the server refuses both changes. Their values still submit from
   * `defaultValues`, because react-hook-form keeps unrendered fields.
   */
  isSelf?: boolean
  /** A Server Action (or a call to one); it validates again on the server. */
  action: (values: UserFormValues) => Promise<ActionResult>
}) {
  const isCreate = mode === 'create'
  const {
    field,
    watch,
    setValue,
    formState: { errors },
    dialog,
  } = useActionForm({
    schema: isCreate ? createUserSchema : updateUserSchema,
    defaultValues,
    action,
    mode,
    noun: 'user',
  })

  return (
    <FormDialog {...dialog}>
      <FormField error={errors.name?.message} id='user-name' label='Name *'>
        <Input autoComplete='off' {...field('name')} />
      </FormField>

      <FormField error={errors.email?.message} id='user-email' label='Email *'>
        <Input
          autoComplete='off'
          inputMode='email'
          placeholder='name@…'
          {...field('email')}
        />
      </FormField>

      <FormField
        error={errors.role?.message}
        hint={
          isSelf
            ? "You can't change your own role or deactivate yourself."
            : undefined
        }
        id='user-role'
        label='Role'
      >
        {isSelf ? (
          <Input
            readOnly
            aria-describedby={fieldHintId('user-role')}
            id='user-role'
            value={ROLE_LABELS[defaultValues.role]}
          />
        ) : (
          <Select {...field('role')}>
            {ROLES.map(role => (
              <option key={role} value={role}>
                {ROLE_LABELS[role]}
              </option>
            ))}
          </Select>
        )}
      </FormField>

      <FormField
        error={errors.password?.message}
        id='user-password'
        label={isCreate ? 'Password *' : 'New password'}
      >
        <Input
          // new-password: stops the browser filling in *your* saved password
          autoComplete='new-password'
          placeholder={
            isCreate ? 'At least 6 characters' : 'Leave blank to keep current'
          }
          type='password'
          {...field('password')}
        />
      </FormField>

      {isCreate || isSelf ? null : (
        <fieldset>
          <legend className={labelClass}>Status</legend>
          <div className='grid grid-cols-2 gap-2'>
            {/* Controlled: a registered radio would submit "true"/"false" strings */}
            {[true, false].map(active => (
              <label key={String(active)} className={choiceClass}>
                <input
                  checked={watch('isActive') === active}
                  className='sr-only'
                  name='user-isActive'
                  type='radio'
                  onChange={() =>
                    setValue('isActive', active, { shouldDirty: true })
                  }
                />
                {active ? 'Active' : 'Inactive'}
              </label>
            ))}
          </div>
          <p className='mt-1 text-xs text-muted-foreground'>
            Inactive users can&apos;t sign in.
          </p>
        </fieldset>
      )}
    </FormDialog>
  )
}
