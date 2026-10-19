'use client'

import type { ProfileFormValues } from '@/lib/schemas/user'

import { KeyRound, Save, ShieldCheck, UserRound } from 'lucide-react'

import { updateProfile } from '@/app/admin/settings/actions'
import { DataCard } from '@/components/admin/data-card'
import { Button } from '@/components/ui/button'
import { buttonRowClass } from '@/components/ui/dialogs'
import { FormField, Input } from '@/components/ui/field'
import { useActionForm } from '@/hooks/use-action-form'
import { profileSchema } from '@/lib/schemas/user'

const noPasswords = { password: '', confirmPassword: '', currentPassword: '' }

export function ProfileForm({
  profile,
}: {
  profile: Pick<ProfileFormValues, 'name' | 'email'>
}) {
  const {
    field,
    watch,
    reset,
    onSubmit,
    formState: { errors, dirtyFields, isDirty, isSubmitting },
  } = useActionForm({
    schema: profileSchema,
    defaultValues: { ...profile, ...noPasswords },
    action: updateProfile,
    mode: 'edit',
    noun: 'profile',
    onSuccess: ({ name, email }) =>
      reset({ name: name.trim(), email: email.trim(), ...noPasswords }),
  })

  const needsCurrentPassword = Boolean(dirtyFields.email || watch('password'))

  return (
    <form noValidate className='max-w-2xl space-y-6' onSubmit={onSubmit}>
      <DataCard icon={UserRound} title='Profile'>
        <div className='space-y-4 p-4'>
          <FormField
            error={errors.name?.message}
            id='profile-name'
            label='Name'
          >
            <Input autoComplete='name' {...field('name')} />
          </FormField>
          <FormField
            error={errors.email?.message}
            hint='You sign in with this.'
            id='profile-email'
            label='Email'
          >
            <Input
              autoComplete='email'
              type='email'
              {...field('email', { hint: true })}
            />
          </FormField>
        </div>
      </DataCard>

      <DataCard icon={KeyRound} title='Password'>
        <div className='space-y-4 p-4'>
          <FormField
            error={errors.password?.message}
            hint='At least 6 characters. Leave blank to keep your current one.'
            id='profile-password'
            label='New password'
          >
            <Input
              autoComplete='new-password'
              type='password'
              {...field('password', { hint: true })}
            />
          </FormField>
          <FormField
            error={errors.confirmPassword?.message}
            id='profile-confirmPassword'
            label='Confirm new password'
          >
            <Input
              autoComplete='new-password'
              type='password'
              {...field('confirmPassword')}
            />
          </FormField>
        </div>
      </DataCard>

      {needsCurrentPassword ? (
        <DataCard icon={ShieldCheck} title="Confirm it's you">
          <div className='p-4'>
            <FormField
              error={errors.currentPassword?.message}
              hint='Needed to change your email or password.'
              id='profile-currentPassword'
              label='Current password'
            >
              <Input
                autoComplete='current-password'
                type='password'
                {...field('currentPassword', { hint: true })}
              />
            </FormField>
          </div>
        </DataCard>
      ) : null}

      <div className={buttonRowClass}>
        <Button
          disabled={!isDirty || isSubmitting}
          variant='outline'
          onClick={() => reset()}
        >
          Discard
        </Button>
        <Button disabled={!isDirty || isSubmitting} type='submit'>
          <Save aria-hidden className='h-4 w-4' />
          {isSubmitting ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </form>
  )
}
