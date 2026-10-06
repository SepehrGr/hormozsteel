'use client'

import { useEffect, useMemo, useState } from 'react'
import { addToast } from '@heroui/toast'
import useSWR from 'swr'
import {
  Edit,
  Plus,
  Shield,
  Trash2,
  Users,
  X,
  CheckCircle2,
} from 'lucide-react'
import { useSession } from 'next-auth/react'

import ModalDialog from '@/components/ui/modal-dialog'
import { formatDateTime } from '@/lib/format'

type Role = 'ADMIN' | 'SUPER_ADMIN'

interface AdminUser {
  id: string
  email: string
  name: string
  role: Role
  isActive: boolean
  lastLogin: string | null
  createdAt: string
  updatedAt: string
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

const fieldClass =
  'mt-1.5 w-full border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-200 ease-out focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground disabled:cursor-not-allowed disabled:opacity-50'

const labelClass =
  'block text-xs font-medium uppercase tracking-wide text-muted-foreground'

const btnSecondary =
  'cursor-pointer border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors duration-200 ease-out hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50'

const btnPrimary =
  'inline-flex cursor-pointer items-center gap-2 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity duration-200 ease-out hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50'

const btnDanger =
  'inline-flex cursor-pointer items-center gap-2 bg-red-700 px-4 py-2 text-sm font-medium text-white transition-opacity duration-200 ease-out hover:opacity-90 dark:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50'

function roleLabel(role: Role) {
  return role === 'SUPER_ADMIN' ? 'Super admin' : 'Admin'
}

function stockBtn(active: boolean) {
  return `flex-1 cursor-pointer border px-3 py-2.5 text-sm font-medium transition-colors duration-200 ease-out ${
    active
      ? 'border-foreground bg-foreground text-background'
      : 'border-border bg-background text-foreground hover:bg-muted'
  }`
}

export default function AdminUsersPage() {
  const { data: session } = useSession()
  const currentUserId = session?.user?.id

  const { data, error, mutate, isLoading } = useSWR('/api/admin/users', fetcher)

  const users: AdminUser[] = useMemo(() => {
    if (!data) return []
    if (data?.success && data?.data?.users) return data.data.users
    if (data?.users) return data.users

    return []
  }, [data])

  const [searchTerm, setSearchTerm] = useState('')
  const filteredUsers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()

    if (!q) return users

    return users.filter(u => {
      return (
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
      )
    })
  }, [users, searchTerm])

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [quickUpdatingId, setQuickUpdatingId] = useState<string | null>(null)

  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null)

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ADMIN' as Role,
  })

  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'ADMIN' as Role,
    isActive: true,
    password: '',
  })

  useEffect(() => {
    if (editingUser) {
      setEditForm({
        name: editingUser.name || '',
        email: editingUser.email || '',
        role: editingUser.role,
        isActive: editingUser.isActive,
        password: '',
      })
    }
  }, [editingUser])

  const openEdit = (u: AdminUser) => {
    setEditingUser(u)
    setIsEditOpen(true)
  }

  const openDelete = (u: AdminUser) => {
    setDeletingUser(u)
    setIsDeleteOpen(true)
  }

  const quickPatch = async (u: AdminUser, patch: Record<string, unknown>) => {
    setQuickUpdatingId(u.id)
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      const json = await res.json().catch(() => ({}))

      if (!res.ok || !json?.success) {
        addToast({
          title: 'Error',
          description: json?.error || 'Failed to update user',
          color: 'danger',
        })

        return
      }

      addToast({
        title: 'Updated',
        description: 'User updated',
        color: 'success',
      })
      mutate()
    } catch (e) {
      console.error(e)
      addToast({
        title: 'Error',
        description: 'Server connection failed',
        color: 'danger',
      })
    } finally {
      setQuickUpdatingId(null)
    }
  }

  const handleCreate = async () => {
    if (!newUser.name.trim() || !newUser.email.trim() || !newUser.password) {
      addToast({
        title: 'Missing fields',
        description: 'Name, email, and password are required',
        color: 'warning',
      })

      return
    }

    setCreating(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newUser.name.trim(),
          email: newUser.email.trim(),
          password: newUser.password,
          role: newUser.role,
        }),
      })
      const json = await res.json().catch(() => ({}))

      if (!res.ok || !json?.success) {
        addToast({
          title: 'Error',
          description: json?.error || 'Failed to create user',
          color: 'danger',
        })

        return
      }

      addToast({
        title: 'Created',
        description: 'Admin user created',
        color: 'success',
      })
      setNewUser({ name: '', email: '', password: '', role: 'ADMIN' })
      setIsAddOpen(false)
      mutate()
    } catch (e) {
      console.error(e)
      addToast({
        title: 'Error',
        description: 'Server connection failed',
        color: 'danger',
      })
    } finally {
      setCreating(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!editingUser) return

    if (!editForm.name.trim() || !editForm.email.trim()) {
      addToast({
        title: 'Missing fields',
        description: 'Name and email are required',
        color: 'warning',
      })

      return
    }

    const payload: Record<string, unknown> = {}

    if (editForm.name.trim() !== editingUser.name)
      payload.name = editForm.name.trim()
    if (editForm.email.trim() !== editingUser.email)
      payload.email = editForm.email.trim()
    if (editForm.role !== editingUser.role) payload.role = editForm.role
    if (editForm.isActive !== editingUser.isActive)
      payload.isActive = editForm.isActive
    if (editForm.password) payload.password = editForm.password

    if (Object.keys(payload).length === 0) {
      addToast({
        title: 'No changes',
        description: 'Nothing to save',
        color: 'default',
      })

      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json().catch(() => ({}))

      if (!res.ok || !json?.success) {
        addToast({
          title: 'Error',
          description: json?.error || 'Failed to update user',
          color: 'danger',
        })

        return
      }

      addToast({
        title: 'Saved',
        description: 'User updated',
        color: 'success',
      })
      setEditingUser(null)
      setIsEditOpen(false)
      mutate()
    } catch (e) {
      console.error(e)
      addToast({
        title: 'Error',
        description: 'Server connection failed',
        color: 'danger',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingUser) return

    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/users/${deletingUser.id}`, {
        method: 'DELETE',
      })
      const json = await res.json().catch(() => ({}))

      if (!res.ok || !json?.success) {
        addToast({
          title: 'Error',
          description: json?.error || 'Failed to delete user',
          color: 'danger',
        })

        return
      }

      addToast({
        title: 'Deleted',
        description: 'User removed',
        color: 'success',
      })
      setDeletingUser(null)
      setIsDeleteOpen(false)
      mutate()
    } catch (e) {
      console.error(e)
      addToast({
        title: 'Error',
        description: 'Server connection failed',
        color: 'danger',
      })
    } finally {
      setDeleting(false)
    }
  }

  const topError = error ? 'Failed to load users' : null
  const forbidden =
    (data?.error || data?.message) === 'Insufficient permissions'

  return (
    <div className='space-y-6' dir='ltr'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <p className='font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground'>
            Access
          </p>
          <h1 className='flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground'>
            <Shield className='h-6 w-6' />
            Admin users
          </h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            Create, edit, activate, and remove admin accounts (super admin
            only).
          </p>
        </div>
        <button
          className='inline-flex items-center gap-2 bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity duration-200 ease-out hover:opacity-90 cursor-pointer'
          type='button'
          onClick={() => {
            setNewUser({ name: '', email: '', password: '', role: 'ADMIN' })
            setIsAddOpen(true)
          }}
        >
          <Plus className='h-4 w-4' />
          Add user
        </button>
      </div>

      <div className='border border-border bg-card'>
        <div className='border-b border-border px-4 py-3'>
          <h2 className='font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
            Filters
          </h2>
        </div>
        <div className='flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between'>
          <input
            className='w-full border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-200 ease-out focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground sm:max-w-md'
            placeholder='Search name, email, or role…'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <p className='text-sm text-muted-foreground'>
            <span className='font-semibold tabular-nums text-foreground'>
              {filteredUsers.length}
            </span>{' '}
            user{filteredUsers.length === 1 ? '' : 's'}
          </p>
        </div>
        {topError && (
          <p className='border-t border-border px-4 py-3 text-sm text-red-700 dark:text-red-300'>
            {topError}
          </p>
        )}
        {forbidden && (
          <p className='border-t border-border px-4 py-3 text-sm text-red-700 dark:text-red-300'>
            Super admin access required.
          </p>
        )}
      </div>

      <div className='border border-border bg-card'>
        <div className='flex items-center gap-2 border-b border-border px-4 py-3'>
          <Users className='h-4 w-4 text-muted-foreground' />
          <h3 className='font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
            Accounts ({filteredUsers.length})
          </h3>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full min-w-[720px] text-left text-sm'>
            <thead>
              <tr className='border-b border-border bg-muted/50 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground'>
                <th className='px-4 py-3 font-semibold'>Name</th>
                <th className='px-4 py-3 font-semibold'>Email</th>
                <th className='px-4 py-3 font-semibold'>Role</th>
                <th className='px-4 py-3 font-semibold'>Status</th>
                <th className='px-4 py-3 font-semibold'>Last login</th>
                <th className='px-4 py-3 font-semibold'>Created</th>
                <th className='px-4 py-3 font-semibold'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td
                    className='px-4 py-10 text-center text-muted-foreground'
                    colSpan={7}
                  >
                    Loading…
                  </td>
                </tr>
              )}
              {!isLoading && filteredUsers.length === 0 && (
                <tr>
                  <td
                    className='px-4 py-10 text-center text-muted-foreground'
                    colSpan={7}
                  >
                    No users found
                  </td>
                </tr>
              )}
              {!isLoading &&
                filteredUsers.map(u => {
                  const isSelf = Boolean(
                    currentUserId && u.id === currentUserId,
                  )
                  const busy = quickUpdatingId === u.id

                  return (
                    <tr
                      key={u.id}
                      className='border-b border-border last:border-b-0 transition-colors duration-200 ease-out hover:bg-muted/40'
                    >
                      <td className='px-4 py-3'>
                        <div className='min-w-0'>
                          <p className='truncate font-medium text-foreground'>
                            {u.name}
                          </p>
                          <p className='font-mono text-[11px] text-muted-foreground'>
                            {u.id.slice(0, 8)}…
                          </p>
                        </div>
                      </td>
                      <td className='px-4 py-3 text-foreground'>{u.email}</td>
                      <td className='px-4 py-3'>
                        <select
                          aria-label={`Role for ${u.name}`}
                          className='cursor-pointer border border-border bg-background px-2 py-1.5 text-sm text-foreground disabled:cursor-not-allowed disabled:opacity-50'
                          disabled={busy || isSelf}
                          value={u.role}
                          onChange={e => {
                            const selected = e.target.value as Role

                            if (selected !== u.role) {
                              quickPatch(u, { role: selected })
                            }
                          }}
                        >
                          <option value='ADMIN'>Admin</option>
                          <option value='SUPER_ADMIN'>Super admin</option>
                        </select>
                      </td>
                      <td className='px-4 py-3'>
                        <button
                          className={`cursor-pointer border px-2 py-1 text-xs font-medium uppercase tracking-wide transition-colors duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-50 ${
                            u.isActive
                              ? 'border-foreground bg-foreground text-background'
                              : 'border-border bg-background text-muted-foreground hover:bg-muted'
                          }`}
                          disabled={busy || isSelf}
                          type='button'
                          onClick={() => {
                            if (!isSelf)
                              quickPatch(u, { isActive: !u.isActive })
                          }}
                        >
                          {u.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className='px-4 py-3 text-muted-foreground'>
                        {formatDateTime(u.lastLogin)}
                      </td>
                      <td className='px-4 py-3 text-muted-foreground'>
                        {formatDateTime(u.createdAt)}
                      </td>
                      <td className='px-4 py-3'>
                        <div className='flex gap-1'>
                          <button
                            aria-label={`Edit ${u.name}`}
                            className='inline-flex h-8 w-8 cursor-pointer items-center justify-center border border-border bg-card text-foreground transition-colors duration-200 ease-out hover:bg-muted'
                            type='button'
                            onClick={() => openEdit(u)}
                          >
                            <Edit className='h-3.5 w-3.5' />
                          </button>
                          <button
                            aria-label={`Delete ${u.name}`}
                            className='inline-flex h-8 w-8 cursor-pointer items-center justify-center border border-border bg-card text-red-600 transition-colors duration-200 ease-out hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400'
                            disabled={isSelf}
                            type='button'
                            onClick={() => openDelete(u)}
                          >
                            <Trash2 className='h-3.5 w-3.5' />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add user */}
      {isAddOpen && (
        <ModalDialog
          className='w-full max-w-md'
          dismissable={!creating}
          labelledBy='add-user-title'
          onClose={() => setIsAddOpen(false)}
        >
          <div className='flex items-start justify-between border-b border-border px-5 py-3'>
            <div>
              <h2
                className='font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'
                id='add-user-title'
              >
                Add user
              </h2>
              <p className='mt-1 text-xs text-muted-foreground'>
                New admin account
              </p>
            </div>
            <button
              aria-label='Close'
              className='flex h-8 w-8 cursor-pointer items-center justify-center border border-border bg-background text-foreground transition-colors duration-200 ease-out hover:bg-muted'
              type='button'
              onClick={() => !creating && setIsAddOpen(false)}
            >
              <X className='h-4 w-4' />
            </button>
          </div>

          <div className='space-y-4 px-5 py-5'>
            <div>
              <label className={labelClass} htmlFor='add-user-name'>
                Name *
              </label>
              <input
                className={fieldClass}
                disabled={creating}
                id='add-user-name'
                placeholder='Full name'
                value={newUser.name}
                onChange={e =>
                  setNewUser(p => ({ ...p, name: e.target.value }))
                }
              />
            </div>
            <div>
              <label className={labelClass} htmlFor='add-user-email'>
                Email *
              </label>
              <input
                className={fieldClass}
                disabled={creating}
                id='add-user-email'
                placeholder='admin@example.com'
                type='email'
                value={newUser.email}
                onChange={e =>
                  setNewUser(p => ({ ...p, email: e.target.value }))
                }
              />
            </div>
            <div>
              <label className={labelClass} htmlFor='add-user-password'>
                Password *
              </label>
              <input
                className={fieldClass}
                disabled={creating}
                id='add-user-password'
                placeholder='Min. 8 characters'
                type='password'
                value={newUser.password}
                onChange={e =>
                  setNewUser(p => ({ ...p, password: e.target.value }))
                }
              />
            </div>
            <div>
              <label className={labelClass} htmlFor='add-user-role'>
                Role
              </label>
              <select
                className={`${fieldClass} cursor-pointer`}
                disabled={creating}
                id='add-user-role'
                value={newUser.role}
                onChange={e =>
                  setNewUser(p => ({
                    ...p,
                    role: e.target.value as Role,
                  }))
                }
              >
                <option value='ADMIN'>Admin</option>
                <option value='SUPER_ADMIN'>Super admin</option>
              </select>
            </div>
          </div>

          <div className='flex justify-end gap-2 border-t border-border px-5 py-4'>
            <button
              className={btnSecondary}
              disabled={creating}
              type='button'
              onClick={() => setIsAddOpen(false)}
            >
              Cancel
            </button>
            <button
              className={btnPrimary}
              disabled={creating}
              type='button'
              onClick={handleCreate}
            >
              <Plus className='h-4 w-4' />
              {creating ? 'Creating…' : 'Create user'}
            </button>
          </div>
        </ModalDialog>
      )}

      {/* Edit user */}
      {isEditOpen && editingUser && (
        <ModalDialog
          className='w-full max-w-md'
          dismissable={!saving}
          labelledBy='edit-user-title'
          onClose={() => {
            setEditingUser(null)
            setIsEditOpen(false)
          }}
        >
          <div className='flex items-start justify-between border-b border-border px-5 py-3'>
            <div>
              <h2
                className='font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'
                id='edit-user-title'
              >
                Edit user
              </h2>
              <p className='mt-1 text-xs text-muted-foreground'>
                {editingUser.email}
              </p>
            </div>
            <button
              aria-label='Close'
              className='flex h-8 w-8 cursor-pointer items-center justify-center border border-border bg-background text-foreground transition-colors duration-200 ease-out hover:bg-muted'
              type='button'
              onClick={() => {
                if (!saving) {
                  setEditingUser(null)
                  setIsEditOpen(false)
                }
              }}
            >
              <X className='h-4 w-4' />
            </button>
          </div>

          <div className='space-y-4 px-5 py-5'>
            <div>
              <label className={labelClass} htmlFor='edit-user-name'>
                Name *
              </label>
              <input
                className={fieldClass}
                disabled={saving}
                id='edit-user-name'
                value={editForm.name}
                onChange={e =>
                  setEditForm(p => ({ ...p, name: e.target.value }))
                }
              />
            </div>
            <div>
              <label className={labelClass} htmlFor='edit-user-email'>
                Email *
              </label>
              <input
                className={fieldClass}
                disabled={saving}
                id='edit-user-email'
                type='email'
                value={editForm.email}
                onChange={e =>
                  setEditForm(p => ({ ...p, email: e.target.value }))
                }
              />
            </div>
            <div>
              <label className={labelClass} htmlFor='edit-user-role'>
                Role
              </label>
              <select
                className={`${fieldClass} cursor-pointer`}
                disabled={saving}
                id='edit-user-role'
                value={editForm.role}
                onChange={e =>
                  setEditForm(p => ({
                    ...p,
                    role: e.target.value as Role,
                  }))
                }
              >
                <option value='ADMIN'>Admin</option>
                <option value='SUPER_ADMIN'>Super admin</option>
              </select>
            </div>
            <div>
              <p className={labelClass}>Status</p>
              <div className='mt-1.5 flex gap-2'>
                <button
                  className={stockBtn(editForm.isActive === true)}
                  disabled={saving}
                  type='button'
                  onClick={() => setEditForm(p => ({ ...p, isActive: true }))}
                >
                  Active
                </button>
                <button
                  className={stockBtn(editForm.isActive === false)}
                  disabled={saving}
                  type='button'
                  onClick={() => setEditForm(p => ({ ...p, isActive: false }))}
                >
                  Inactive
                </button>
              </div>
            </div>
            <div>
              <label className={labelClass} htmlFor='edit-user-password'>
                New password
              </label>
              <input
                className={fieldClass}
                disabled={saving}
                id='edit-user-password'
                placeholder='Leave blank to keep current'
                type='password'
                value={editForm.password}
                onChange={e =>
                  setEditForm(p => ({ ...p, password: e.target.value }))
                }
              />
            </div>
          </div>

          <div className='flex justify-end gap-2 border-t border-border px-5 py-4'>
            <button
              className={btnSecondary}
              disabled={saving}
              type='button'
              onClick={() => {
                setEditingUser(null)
                setIsEditOpen(false)
              }}
            >
              Cancel
            </button>
            <button
              className={btnPrimary}
              disabled={saving}
              type='button'
              onClick={handleSaveEdit}
            >
              <CheckCircle2 className='h-4 w-4' />
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </ModalDialog>
      )}

      {/* Delete user */}
      {isDeleteOpen && deletingUser && (
        <ModalDialog
          className='w-full max-w-md'
          dismissable={!deleting}
          labelledBy='delete-user-title'
          onClose={() => {
            setDeletingUser(null)
            setIsDeleteOpen(false)
          }}
        >
          <div className='flex items-center justify-between border-b border-border px-5 py-3'>
            <h2
              className='font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'
              id='delete-user-title'
            >
              Delete user
            </h2>
            <button
              aria-label='Close'
              className='flex h-8 w-8 cursor-pointer items-center justify-center border border-border bg-background text-foreground transition-colors duration-200 ease-out hover:bg-muted'
              type='button'
              onClick={() => {
                if (!deleting) {
                  setDeletingUser(null)
                  setIsDeleteOpen(false)
                }
              }}
            >
              <X className='h-4 w-4' />
            </button>
          </div>

          <div className='space-y-3 px-5 py-5'>
            <p className='text-sm text-muted-foreground'>
              Delete{' '}
              <span className='font-medium text-foreground'>
                {deletingUser.name}
              </span>
              ?
            </p>
            <p className='text-xs text-muted-foreground'>
              {deletingUser.email} · {roleLabel(deletingUser.role)}
            </p>
            <p className='border border-red-600/30 bg-red-50 px-3 py-2 text-sm text-red-900 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-100'>
              This cannot be undone. The account will lose admin access.
            </p>
          </div>

          <div className='flex justify-start gap-2 border-t border-border px-5 py-4'>
            <button
              className={btnDanger}
              disabled={deleting}
              type='button'
              onClick={handleDelete}
            >
              <Trash2 className='h-4 w-4' />
              {deleting ? 'Deleting…' : 'Yes, delete user'}
            </button>
            <button
              className={btnSecondary}
              disabled={deleting}
              type='button'
              onClick={() => {
                setDeletingUser(null)
                setIsDeleteOpen(false)
              }}
            >
              Cancel
            </button>
          </div>
        </ModalDialog>
      )}
    </div>
  )
}
