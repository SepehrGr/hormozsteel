'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@heroui/button'
import { Input } from '@heroui/input'
import { Card, CardBody, CardHeader } from '@heroui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/table'
import { Chip } from '@heroui/chip'
import { Select, SelectItem } from '@heroui/select'
import { Switch } from '@heroui/switch'
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from '@heroui/modal'
import { addToast } from '@heroui/toast'
import useSWR from 'swr'
import { Edit, Plus, Shield, Trash2, Users } from 'lucide-react'
import { useSession } from 'next-auth/react'

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

const fetcher = (url: string) => fetch(url).then((res) => res.json())

function formatFaDateTime(dateString: string | null) {
  if (!dateString) return '—'
  const d = new Date(dateString)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('fa-IR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function roleLabel(role: Role) {
  return role === 'SUPER_ADMIN' ? 'مدیر کل' : 'مدیر'
}

export default function AdminUsersPage() {
  const { data: session } = useSession()
  const currentUserId = session?.user?.id

  const { data, error, mutate, isLoading } = useSWR('/api/admin/users', fetcher)

  const users: AdminUser[] = useMemo(() => {
    if (!data) return []
    if (data?.success && data?.data?.users) return data.data.users
    // Backwards compatibility (in case old response shape exists somewhere)
    if (data?.users) return data.users
    return []
  }, [data])

  const [searchTerm, setSearchTerm] = useState('')
  const filteredUsers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return users
    return users.filter((u) => {
      return (
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
      )
    })
  }, [users, searchTerm])

  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onOpenChange: onAddOpenChange,
  } = useDisclosure()
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onOpenChange: onEditOpenChange,
  } = useDisclosure()
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onOpenChange: onDeleteOpenChange,
  } = useDisclosure()

  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [quickUpdatingId, setQuickUpdatingId] = useState<string | null>(null)

  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null)

  const [newUser, setNewUser] = useState<{
    name: string
    email: string
    password: string
    role: Role
  }>({
    name: '',
    email: '',
    password: '',
    role: 'ADMIN',
  })

  const [editForm, setEditForm] = useState<{
    name: string
    email: string
    role: Role
    isActive: boolean
    password: string
  }>({
    name: '',
    email: '',
    role: 'ADMIN',
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
    onEditOpen()
  }

  const openDelete = (u: AdminUser) => {
    setDeletingUser(u)
    onDeleteOpen()
  }

  const quickPatch = async (u: AdminUser, patch: Record<string, any>) => {
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
          title: 'خطا',
          description: json?.error || 'خطا در بروزرسانی کاربر',
          color: 'danger',
        })
        return
      }

      addToast({
        title: 'موفقیت',
        description: 'کاربر بروزرسانی شد',
        color: 'success',
      })
      mutate()
    } catch (e) {
      console.error(e)
      addToast({
        title: 'خطا',
        description: 'خطا در ارتباط با سرور',
        color: 'danger',
      })
    } finally {
      setQuickUpdatingId(null)
    }
  }

  const handleCreate = async () => {
    if (!newUser.name.trim() || !newUser.email.trim() || !newUser.password) {
      addToast({
        title: 'خطا',
        description: 'نام، ایمیل و رمز عبور الزامی هستند',
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
          title: 'خطا',
          description: json?.error || 'خطا در ایجاد کاربر',
          color: 'danger',
        })
        return
      }

      addToast({
        title: 'موفقیت',
        description: 'کاربر جدید با موفقیت ایجاد شد',
        color: 'success',
      })
      setNewUser({ name: '', email: '', password: '', role: 'ADMIN' })
      onAddOpenChange()
      mutate()
    } catch (e) {
      console.error(e)
      addToast({
        title: 'خطا',
        description: 'خطا در ارتباط با سرور',
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
        title: 'خطا',
        description: 'نام و ایمیل الزامی هستند',
        color: 'warning',
      })
      return
    }

    const payload: any = {}
    if (editForm.name.trim() !== editingUser.name) payload.name = editForm.name.trim()
    if (editForm.email.trim() !== editingUser.email) payload.email = editForm.email.trim()
    if (editForm.role !== editingUser.role) payload.role = editForm.role
    if (editForm.isActive !== editingUser.isActive) payload.isActive = editForm.isActive
    if (editForm.password) payload.password = editForm.password

    if (Object.keys(payload).length === 0) {
      addToast({
        title: 'بدون تغییر',
        description: 'چیزی برای ذخیره وجود ندارد',
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
          title: 'خطا',
          description: json?.error || 'خطا در بروزرسانی کاربر',
          color: 'danger',
        })
        return
      }

      addToast({
        title: 'موفقیت',
        description: 'اطلاعات کاربر بروزرسانی شد',
        color: 'success',
      })
      setEditingUser(null)
      onEditOpenChange()
      mutate()
    } catch (e) {
      console.error(e)
      addToast({
        title: 'خطا',
        description: 'خطا در ارتباط با سرور',
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
          title: 'خطا',
          description: json?.error || 'خطا در حذف کاربر',
          color: 'danger',
        })
        return
      }

      addToast({
        title: 'موفقیت',
        description: 'کاربر حذف شد',
        color: 'success',
      })
      setDeletingUser(null)
      onDeleteOpenChange()
      mutate()
    } catch (e) {
      console.error(e)
      addToast({
        title: 'خطا',
        description: 'خطا در ارتباط با سرور',
        color: 'danger',
      })
    } finally {
      setDeleting(false)
    }
  }

  const topError = useMemo(() => {
    if (!error) return null
    return 'خطا در دریافت لیست کاربران'
  }, [error])

  const forbidden = useMemo(() => {
    const errText = data?.error || data?.message
    return errText === 'Insufficient permissions'
  }, [data])

  return (
    <div className='space-y-6' dir='rtl'>
      <div className='flex items-center justify-between gap-4'>
        <div>
          <h1 className='flex items-center gap-3 text-3xl font-bold text-gray-900 dark:text-white'>
            <Shield className='w-8 h-8 text-primary' />
            مدیریت کاربران ادمین
          </h1>
          <p className='mt-2 text-sm text-gray-500 dark:text-gray-400'>
            ایجاد، ویرایش، فعال/غیرفعال و حذف کاربران ادمین (فقط مدیر کل)
          </p>
        </div>

        <Button color='primary' startContent={<Plus className='w-4 h-4' />} onPress={() => {
          setNewUser({ name: '', email: '', password: '', role: 'ADMIN' })
          onAddOpen()
        }}>
          افزودن کاربر
        </Button>
      </div>

      <Card>
        <CardBody className='py-4'>
          <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder='جستجو بر اساس نام، ایمیل یا نقش...'
              variant='bordered'
              className='md:max-w-md'
            />
            <div className='text-sm text-gray-600 dark:text-gray-400'>
              <span className='font-semibold text-gray-900 dark:text-white'>
                {filteredUsers.length.toLocaleString('fa-IR')}
              </span>{' '}
              کاربر
            </div>
          </div>

          {topError && (
            <div className='mt-4 text-sm text-red-600 dark:text-red-400'>
              {topError}
            </div>
          )}
          {forbidden && (
            <div className='mt-4 text-sm text-red-600 dark:text-red-400'>
              دسترسی کافی ندارید (Super Admin لازم است).
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader className='flex items-center gap-2 pb-3'>
          <Users className='w-5 h-5 text-primary' />
          <h3 className='text-lg font-semibold'>لیست کاربران</h3>
        </CardHeader>
        <CardBody className='overflow-x-auto'>
          <Table
            aria-label='Admin users table'
            classNames={{
              wrapper: 'shadow-none',
              th: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold',
              td: 'py-4',
            }}
          >
            <TableHeader>
              <TableColumn>نام</TableColumn>
              <TableColumn>ایمیل</TableColumn>
              <TableColumn>نقش</TableColumn>
              <TableColumn>وضعیت</TableColumn>
              <TableColumn>آخرین ورود</TableColumn>
              <TableColumn>تاریخ ایجاد</TableColumn>
              <TableColumn width={140}>عملیات</TableColumn>
            </TableHeader>
            <TableBody
              isLoading={isLoading}
              emptyContent='کاربری یافت نشد'
            >
              {filteredUsers.map((u) => (
                <TableRow
                  key={u.id}
                  className='transition-colors hover:bg-gray-50 dark:hover:bg-gray-800'
                >
                  <TableCell>
                    <div className='flex items-center gap-3'>
                      <div className='flex items-center justify-center w-9 h-9 font-bold text-white rounded-full bg-gradient-to-br from-blue-700 to-blue-500'>
                        {u.name?.charAt(0) || 'A'}
                      </div>
                      <div className='min-w-0'>
                        <div className='font-semibold text-gray-900 dark:text-white truncate'>
                          {u.name}
                        </div>
                        <div className='text-xs text-gray-500 dark:text-gray-400'>
                          {u.id.slice(0, 8)}…
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className='text-gray-700 dark:text-gray-300'>
                      {u.email}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Select
                      aria-label='role'
                      size='sm'
                      variant='bordered'
                      selectedKeys={new Set([u.role])}
                      isDisabled={
                        quickUpdatingId === u.id ||
                        Boolean(currentUserId && u.id === currentUserId)
                      }
                      onSelectionChange={(keys) => {
                        const selected = Array.from(keys)[0] as Role
                        if (selected && selected !== u.role) {
                          quickPatch(u, { role: selected })
                        }
                      }}
                      className='w-32'
                      classNames={{
                        trigger: 'h-9 min-h-9',
                      }}
                    >
                      <SelectItem key='ADMIN'>مدیر</SelectItem>
                      <SelectItem key='SUPER_ADMIN'>مدیر کل</SelectItem>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <Switch
                        isSelected={u.isActive}
                        isDisabled={
                          quickUpdatingId === u.id ||
                          Boolean(currentUserId && u.id === currentUserId)
                        }
                        onValueChange={(v) => {
                          if (v !== u.isActive) quickPatch(u, { isActive: v })
                        }}
                      />
                      <Chip size='sm' variant='flat' color={u.isActive ? 'success' : 'danger'}>
                        {u.isActive ? 'فعال' : 'غیرفعال'}
                      </Chip>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className='text-sm text-gray-600 dark:text-gray-400'>
                      {formatFaDateTime(u.lastLogin)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className='text-sm text-gray-600 dark:text-gray-400'>
                      {formatFaDateTime(u.createdAt)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className='flex gap-1'>
                      <Button
                        size='sm'
                        variant='light'
                        color='primary'
                        isIconOnly
                        onPress={() => openEdit(u)}
                        aria-label='ویرایش'
                      >
                        <Edit className='w-4 h-4' />
                      </Button>
                      <Button
                        size='sm'
                        variant='light'
                        color='danger'
                        isIconOnly
                        onPress={() => openDelete(u)}
                        aria-label='حذف'
                        isDisabled={Boolean(currentUserId && u.id === currentUserId)}
                      >
                        <Trash2 className='w-4 h-4' />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Add user modal */}
      <Modal isOpen={isAddOpen} onOpenChange={onAddOpenChange} placement='center'>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex flex-col gap-1'>افزودن کاربر ادمین</ModalHeader>
              <ModalBody className='space-y-3'>
                <Input
                  label='نام'
                  value={newUser.name}
                  onChange={(e) => setNewUser((p) => ({ ...p, name: e.target.value }))}
                  variant='bordered'
                />
                <Input
                  label='ایمیل'
                  type='email'
                  value={newUser.email}
                  onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))}
                  variant='bordered'
                />
                <Input
                  label='رمز عبور'
                  type='password'
                  value={newUser.password}
                  onChange={(e) => setNewUser((p) => ({ ...p, password: e.target.value }))}
                  variant='bordered'
                />
                <Select
                  label='نقش'
                  selectedKeys={new Set([newUser.role])}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as Role
                    setNewUser((p) => ({ ...p, role: selected }))
                  }}
                  variant='bordered'
                >
                  <SelectItem key='ADMIN'>مدیر</SelectItem>
                  <SelectItem key='SUPER_ADMIN'>مدیر کل</SelectItem>
                </Select>
              </ModalBody>
              <ModalFooter>
                <Button variant='flat' onPress={onClose} isDisabled={creating}>
                  انصراف
                </Button>
                <Button color='primary' onPress={handleCreate} isLoading={creating}>
                  ایجاد
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Edit user modal */}
      <Modal isOpen={isEditOpen} onOpenChange={onEditOpenChange} placement='center'>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex flex-col gap-1'>ویرایش کاربر</ModalHeader>
              <ModalBody className='space-y-3'>
                <Input
                  label='نام'
                  value={editForm.name}
                  onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                  variant='bordered'
                />
                <Input
                  label='ایمیل'
                  type='email'
                  value={editForm.email}
                  onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
                  variant='bordered'
                />
                <Select
                  label='نقش'
                  selectedKeys={new Set([editForm.role])}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as Role
                    setEditForm((p) => ({ ...p, role: selected }))
                  }}
                  variant='bordered'
                >
                  <SelectItem key='ADMIN'>مدیر</SelectItem>
                  <SelectItem key='SUPER_ADMIN'>مدیر کل</SelectItem>
                </Select>

                <div className='flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2'>
                  <div className='text-sm text-gray-700 dark:text-gray-300'>
                    وضعیت فعال
                  </div>
                  <Switch
                    isSelected={editForm.isActive}
                    onValueChange={(v) => setEditForm((p) => ({ ...p, isActive: v }))}
                  />
                </div>

                <Input
                  label='رمز عبور جدید (اختیاری)'
                  type='password'
                  value={editForm.password}
                  onChange={(e) => setEditForm((p) => ({ ...p, password: e.target.value }))}
                  variant='bordered'
                  description='اگر این فیلد خالی باشد، رمز عبور تغییر نمی‌کند.'
                />
              </ModalBody>
              <ModalFooter>
                <Button
                  variant='flat'
                  onPress={() => {
                    setEditingUser(null)
                    onClose()
                  }}
                  isDisabled={saving}
                >
                  انصراف
                </Button>
                <Button color='primary' onPress={handleSaveEdit} isLoading={saving}>
                  ذخیره
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Delete user modal */}
      <Modal isOpen={isDeleteOpen} onOpenChange={onDeleteOpenChange} placement='center'>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex flex-col gap-1'>حذف کاربر</ModalHeader>
              <ModalBody>
                <p className='text-sm text-gray-700 dark:text-gray-300'>
                  آیا از حذف کاربر{' '}
                  <span className='font-bold text-gray-900 dark:text-white'>
                    {deletingUser?.name}
                  </span>{' '}
                  مطمئن هستید؟ این عملیات قابل بازگشت نیست.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button
                  variant='flat'
                  onPress={() => {
                    setDeletingUser(null)
                    onClose()
                  }}
                  isDisabled={deleting}
                >
                  انصراف
                </Button>
                <Button color='danger' onPress={handleDelete} isLoading={deleting}>
                  حذف
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}

