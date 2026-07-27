'use client'

import { useState, useEffect } from 'react'
import { Settings, Edit2, Check, X, Eye, EyeOff } from 'lucide-react'
import { addToast } from '@heroui/toast'

interface AdminProfile {
  id: string
  name: string
  email: string
  password?: string
  passwordConfirm?: string
}

const fieldClass =
  'w-full border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-200 ease-out focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground disabled:cursor-not-allowed disabled:opacity-60'

const labelClass =
  'mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground'

export default function AdminSettings() {
  const [admin, setAdmin] = useState<AdminProfile | null>(null)
  const [editingFields, setEditingFields] = useState<Set<string>>(new Set())
  const [formData, setFormData] = useState<AdminProfile | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showPassword, setShowPassword] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await fetch('/api/admin/profile')

        if (response.ok) {
          const data = await response.json()
          const profile = {
            id: data.data.id,
            name: data.data.name,
            email: data.data.email,
          }

          setAdmin(profile)
          setFormData(profile)
        } else {
          addToast({
            title: 'Error',
            description: 'Could not load profile',
            color: 'danger',
          })
        }
      } catch (error) {
        console.error('Error fetching admin data:', error)
        addToast({
          title: 'Error',
          description: 'Network error while loading profile',
          color: 'danger',
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAdminData()
  }, [])

  const toggleEdit = (field: string) => {
    if (!admin || !formData) return
    if (field === 'passwordConfirm') return

    const next = new Set(editingFields)

    if (field === 'password') {
      if (next.has('password')) {
        next.delete('password')
        next.delete('passwordConfirm')
        setFormData({ ...formData, password: '', passwordConfirm: '' })
      } else {
        next.add('password')
        next.add('passwordConfirm')
      }
    } else if (next.has(field)) {
      next.delete(field)
      setFormData({
        ...formData,
        [field]: (admin as any)[field],
      })
    } else {
      next.add(field)
    }

    setEditingFields(next)
  }

  const toggleShowPassword = (field: string) => {
    const next = new Set(showPassword)

    if (next.has(field)) next.delete(field)
    else next.add(field)
    setShowPassword(next)
  }

  const handleSave = async () => {
    if (!formData || !admin) return

    if (editingFields.has('password')) {
      if (!formData.password || formData.password.length < 6) {
        addToast({
          title: 'Validation',
          description: 'Password must be at least 6 characters',
          color: 'warning',
        })

        return
      }
      if (formData.password !== formData.passwordConfirm) {
        addToast({
          title: 'Validation',
          description: 'Passwords do not match',
          color: 'warning',
        })

        return
      }
    }

    setIsSaving(true)
    try {
      const payload: Record<string, string> = {}

      if (editingFields.has('name') && formData.name !== admin.name) {
        payload.name = formData.name
      }
      if (editingFields.has('email') && formData.email !== admin.email) {
        payload.email = formData.email
      }
      if (editingFields.has('password') && formData.password) {
        payload.password = formData.password
      }

      if (Object.keys(payload).length === 0) {
        setEditingFields(new Set())
        setIsSaving(false)

        return
      }

      const response = await fetch('/api/admin/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok) {
        const updated = {
          id: data.data.id,
          name: data.data.name,
          email: data.data.email,
        }

        setAdmin(updated)
        setFormData(updated)
        setEditingFields(new Set())
        setShowPassword(new Set())
        addToast({
          title: 'Saved',
          description: 'Profile updated',
          color: 'success',
        })
      } else {
        addToast({
          title: 'Error',
          description: data.error || 'Could not save profile',
          color: 'danger',
        })
      }
    } catch (error) {
      console.error('Save failed:', error)
      addToast({
        title: 'Error',
        description: 'Network error while saving',
        color: 'danger',
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className='flex min-h-[40vh] items-center justify-center'>
        <div className='text-center'>
          <div className='mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground' />
          <p className='text-sm text-muted-foreground'>Loading profile…</p>
        </div>
      </div>
    )
  }

  if (!admin || !formData) {
    return (
      <div className='border border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground'>
        Could not load admin profile.
      </div>
    )
  }

  const FieldRow = ({
    label,
    field,
    type = 'text',
  }: {
    label: string
    field: 'name' | 'email' | 'password' | 'passwordConfirm'
    type?: string
  }) => {
    const editing = editingFields.has(field)
    const isPassword = field === 'password' || field === 'passwordConfirm'
    const value = (formData as any)[field] ?? ''

    return (
      <div className='border-b border-border px-4 py-4 last:border-b-0'>
        <div className='flex items-start justify-between gap-3'>
          <div className='min-w-0 flex-1'>
            <label className={labelClass} htmlFor={`settings-${field}`}>
              {label}
            </label>
            {editing ? (
              <div className='relative'>
                <input
                  className={`${fieldClass} ${isPassword ? 'pr-11' : ''}`}
                  disabled={isSaving}
                  id={`settings-${field}`}
                  placeholder={isPassword ? '••••••••' : undefined}
                  type={
                    isPassword
                      ? showPassword.has(field)
                        ? 'text'
                        : 'password'
                      : type
                  }
                  value={value}
                  onChange={e =>
                    setFormData({ ...formData, [field]: e.target.value })
                  }
                />
                {isPassword ? (
                  <button
                    aria-label='Toggle visibility'
                    className='absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                    type='button'
                    onClick={() => toggleShowPassword(field)}
                  >
                    {showPassword.has(field) ? (
                      <EyeOff className='h-4 w-4' />
                    ) : (
                      <Eye className='h-4 w-4' />
                    )}
                  </button>
                ) : null}
              </div>
            ) : (
              <p className='text-sm font-medium text-foreground'>
                {isPassword ? '••••••••' : value || '—'}
              </p>
            )}
          </div>
          {field !== 'passwordConfirm' ? (
            <button
              aria-label={editing ? 'Cancel edit' : 'Edit'}
              className='inline-flex h-8 w-8 shrink-0 items-center justify-center border border-border bg-card text-muted-foreground transition-colors duration-200 ease-out hover:bg-muted hover:text-foreground'
              type='button'
              onClick={() =>
                toggleEdit(field === 'password' ? 'password' : field)
              }
            >
              {editing ? (
                <X className='h-3.5 w-3.5' />
              ) : (
                <Edit2 className='h-3.5 w-3.5' />
              )}
            </button>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <div className='mx-auto max-w-2xl space-y-6' dir='ltr'>
      <div>
        <p className='font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground'>
          Account
        </p>
        <h1 className='mt-1 flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground'>
          <Settings className='h-6 w-6' />
          Settings
        </h1>
        <p className='mt-1 text-sm text-muted-foreground'>
          Update your admin name, email, and password.
        </p>
      </div>

      <div className='border border-border bg-card'>
        <div className='border-b border-border px-4 py-3'>
          <h2 className='font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
            Profile
          </h2>
        </div>
        <FieldRow field='name' label='Name' />
        <FieldRow field='email' label='Email' type='email' />
        <FieldRow field='password' label='New password' />
        {editingFields.has('password') ? (
          <FieldRow field='passwordConfirm' label='Confirm password' />
        ) : null}
      </div>

      {editingFields.size > 0 ? (
        <div className='flex gap-2'>
          <button
            className='inline-flex flex-1 items-center justify-center border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors duration-200 ease-out hover:bg-muted disabled:opacity-50'
            disabled={isSaving}
            type='button'
            onClick={() => {
              setFormData(admin)
              setEditingFields(new Set())
              setShowPassword(new Set())
            }}
          >
            Cancel
          </button>
          <button
            className='inline-flex flex-1 items-center justify-center gap-2 bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity duration-200 ease-out hover:opacity-90 disabled:opacity-50'
            disabled={isSaving}
            type='button'
            onClick={handleSave}
          >
            {isSaving ? (
              'Saving…'
            ) : (
              <>
                <Check className='h-4 w-4' />
                Save changes
              </>
            )}
          </button>
        </div>
      ) : null}
    </div>
  )
}
