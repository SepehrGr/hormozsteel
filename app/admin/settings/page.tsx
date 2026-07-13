'use client'

import { useState, useEffect } from 'react'
import { Button } from '@heroui/button'
import { Input } from '@heroui/input'
import { Card, CardBody, CardHeader } from '@heroui/card'
import { Divider } from '@heroui/divider'
import { Factory, Edit2, Check, X, Eye, EyeOff } from 'lucide-react'
import { addToast } from '@heroui/toast'

interface AdminProfile {
  id: string
  name: string
  email: string
  password?: string
  passwordConfirm?: string
}

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
          setAdmin({
            id: data.data.id,
            name: data.data.name,
            email: data.data.email,
          })
          setFormData({
            id: data.data.id,
            name: data.data.name,
            email: data.data.email,
          })
        } else {
          addToast({
            title: 'خطا',
            description: 'خطا در بارگذاری اطلاعات',
            color: 'danger',
          })
        }
      } catch (error) {
        console.error('Error fetching admin data:', error)
        addToast({
          title: 'خطا',
          description: 'خطا در اتصال به سرور',
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

    // Prevent direct editing of passwordConfirm
    if (field === 'passwordConfirm') return

    const newEditingFields = new Set(editingFields)

    if (field === 'password') {
      if (newEditingFields.has('password')) {
        // Closing password edit - close both password and passwordConfirm
        newEditingFields.delete('password')
        newEditingFields.delete('passwordConfirm')
        setFormData({
          ...formData,
          password: '',
          passwordConfirm: '',
        } as AdminProfile)
      } else {
        // Opening password edit - open both password and passwordConfirm
        newEditingFields.add('password')
        newEditingFields.add('passwordConfirm')
      }
    } else {
      // Regular field toggle
      if (newEditingFields.has(field)) {
        newEditingFields.delete(field)
        setFormData({
          ...formData,
          [field]: admin[field as keyof AdminProfile],
        } as AdminProfile)
      } else {
        newEditingFields.add(field)
      }
    }
    setEditingFields(newEditingFields)
  }

  const handleFieldChange = (field: string, value: string) => {
    if (!formData) return
    setFormData({
      ...formData,
      [field]: value,
    } as AdminProfile)
  }

  const handleSave = async (field: string) => {
    if (!admin || !formData) return

    if (!formData[field as keyof AdminProfile]) {
      addToast({
        title: 'خطا',
        description: `${field} نمی‌تواند خالی باشد`,
        color: 'warning',
      })
      return
    }

    // Check if this is a password field
    if (field === 'password') {
      if (!formData.password || !formData.passwordConfirm) {
        addToast({
          title: 'خطا',
          description: 'رمز عبور و تأیید آن باید هر دو پر شوند',
          color: 'warning',
        })
        return
      }

      if (formData.password !== formData.passwordConfirm) {
        addToast({
          title: 'خطا',
          description: 'رمز عبور و تأیید آن باید یکسان باشند',
          color: 'warning',
        })
        return
      }

      if (formData.password.length < 6) {
        addToast({
          title: 'خطا',
          description: 'رمز عبور باید حداقل 6 کاراکتر باشد',
          color: 'warning',
        })
        return
      }
    }

    setIsSaving(true)

    try {
      const response = await fetch('/api/admin/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [field]: formData[field as keyof AdminProfile],
        }),
      })

      if (response.ok) {
        const updatedData = await response.json()
        setAdmin({
          ...admin,
          [field]: formData[field as keyof AdminProfile],
        })

        const newEditingFields = new Set(editingFields)
        newEditingFields.delete(field)
        setEditingFields(newEditingFields)

        // Clear password fields after successful save
        if (field === 'password') {
          setFormData(prevFormData => ({
            ...prevFormData!,
            password: '',
            passwordConfirm: '',
          }))
          // Clear password visibility state
          const newShowPassword = new Set(showPassword)
          newShowPassword.delete('password')
          newShowPassword.delete('passwordConfirm')
          setShowPassword(newShowPassword)
        }

        addToast({
          title: 'موفقیت',
          description: `${field} با موفقیت بروزرسانی شد`,
          color: 'success',
        })
      } else {
        const error = await response.json()
        addToast({
          title: 'خطا',
          description: error.message || 'خطا در بروزرسانی اطلاعات',
          color: 'danger',
        })
      }
    } catch (error) {
      console.error('Error saving field:', error)
      addToast({
        title: 'خطا',
        description: 'خطا در ارتباط با سرور',
        color: 'danger',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const renderEditableField = (
    label: string,
    fieldName: string,
    type: string = 'text',
  ) => {
    if (!admin || !formData) return null

    const isEditing = editingFields.has(fieldName)
    const isPasswordField = type === 'password'
    const isPasswordVisible = showPassword.has(fieldName)
    const inputType = isPasswordField && isPasswordVisible ? 'text' : type
    const value = isEditing
      ? formData[fieldName as keyof AdminProfile]
      : admin[fieldName as keyof AdminProfile]

    // Special handling for password confirmation field
    const isPasswordConfirm = fieldName === 'passwordConfirm'
    const isPasswordEditing = editingFields.has('password')
    const passwordsMatch =
      formData.password === formData.passwordConfirm &&
      formData.password &&
      formData.password.length > 0
    const passwordLengthValid =
      formData.password && formData.password.length >= 6

    // Don't render passwordConfirm unless password is being edited
    if (isPasswordConfirm && !isPasswordEditing) {
      return null
    }

    const togglePasswordVisibility = () => {
      const newShowPassword = new Set(showPassword)
      if (newShowPassword.has(fieldName)) {
        newShowPassword.delete(fieldName)
      } else {
        newShowPassword.add(fieldName)
      }
      setShowPassword(newShowPassword)
    }

    return (
      <div key={fieldName} className='space-y-2'>
        <label className='flex items-center gap-2 text-sm font-semibold text-foreground'>
          {label}
          {fieldName === 'password' && formData.password && (
            <span
              className={`text-xs font-normal ${
                passwordLengthValid ? 'text-success' : 'text-danger'
              }`}
            >
              {passwordLengthValid
                ? '✓ حداقل 6 کاراکتر'
                : `✗ ${formData.password.length}/6`}
            </span>
          )}
          {isPasswordConfirm && formData.password && (
            <span
              className={`text-xs font-normal ${
                passwordsMatch ? 'text-success' : 'text-danger'
              }`}
            >
              {passwordsMatch ? '✓ تطابق' : '✗ عدم تطابق'}
            </span>
          )}
        </label>
        <div className='flex items-center gap-2'>
          <div className='relative flex-1'>
            <Input
              type={inputType}
              value={value || ''}
              onChange={e => handleFieldChange(fieldName, e.target.value)}
              disabled={!isEditing}
              placeholder={`${label} را وارد کنید`}
              variant='bordered'
              size='lg'
              classNames={{
                inputWrapper: isEditing
                  ? 'border-default-200 hover:border-primary'
                  : 'bg-default-100 border-default-200',
              }}
            />
            {isPasswordField && isEditing && (
              <Button
                isIconOnly
                size='sm'
                variant='light'
                className='absolute left-2 top-1/2 -translate-y-1/2'
                onClick={togglePasswordVisibility}
              >
                {isPasswordVisible ? (
                  <EyeOff className='w-4 h-4 text-default-500' />
                ) : (
                  <Eye className='w-4 h-4 text-default-500' />
                )}
              </Button>
            )}
          </div>
          {!isPasswordConfirm && isEditing ? (
            <div className='flex gap-2'>
              <Button
                isIconOnly
                size='lg'
                variant='flat'
                color='success'
                onClick={() => handleSave(fieldName)}
                isLoading={isSaving}
                isDisabled={
                  (isPasswordConfirm && !passwordsMatch) ||
                  (fieldName === 'password' && !passwordLengthValid)
                }
              >
                <Check className='w-5 h-5' />
              </Button>
              <Button
                isIconOnly
                size='lg'
                variant='flat'
                color='danger'
                onClick={() =>
                  toggleEdit(isPasswordConfirm ? 'password' : fieldName)
                }
              >
                <X className='w-5 h-5' />
              </Button>
            </div>
          ) : (
            !isPasswordConfirm &&
            !isEditing && (
              <Button
                isIconOnly
                size='lg'
                variant='flat'
                color='primary'
                onClick={() => toggleEdit(fieldName)}
              >
                <Edit2 className='w-5 h-5' />
              </Button>
            )
          )}
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className='container px-6 py-8 mx-auto' dir='rtl'>
        <div className='mb-8'>
          <div className='flex items-center gap-3'>
            <div className='p-3 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl'>
              <Factory className='w-8 h-8 text-white' />
            </div>
            <div>
              <h1 className='text-3xl font-bold text-gray-900 dark:text-gray-100'>
                تنظیمات پروفایل
              </h1>
              <p className='text-gray-600 dark:text-gray-400'>
                مدیریت اطلاعات ادمین
              </p>
            </div>
          </div>
        </div>
        <div className='flex justify-center'>
          <div className='animate-spin'>
            <div className='w-8 h-8 border-4 border-primary border-t-transparent rounded-full'></div>
          </div>
        </div>
      </div>
    )
  }

  if (!admin) {
    return (
      <div className='container px-6 py-8 mx-auto' dir='rtl'>
        <div className='mb-8'>
          <div className='flex items-center gap-3'>
            <div className='p-3 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl'>
              <Factory className='w-8 h-8 text-white' />
            </div>
            <div>
              <h1 className='text-3xl font-bold text-gray-900 dark:text-gray-100'>
                تنظیمات پروفایل
              </h1>
              <p className='text-gray-600 dark:text-gray-400'>
                مدیریت اطلاعات ادمین
              </p>
            </div>
          </div>
        </div>
        <Card className='border border-divider'>
          <CardBody className='py-8'>
            <p className='text-center text-default-500'>
              خطا در بارگذاری اطلاعات
            </p>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className='container px-6 py-8 mx-auto' dir='rtl'>
      <div className='mb-8'>
        <div className='flex items-center gap-3'>
          <div className='p-3 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl'>
            <Factory className='w-8 h-8 text-white' />
          </div>
          <div>
            <h1 className='text-3xl font-bold text-gray-900 dark:text-gray-100'>
              تنظیمات پروفایل
            </h1>
            <p className='text-gray-600 dark:text-gray-400'>
              مدیریت اطلاعات ادمین
            </p>
          </div>
        </div>
      </div>

      <div className='max-w-2xl mx-auto'>
        <Card className='border border-divider'>
          <CardBody className='gap-6 p-6'>
            {renderEditableField('نام', 'name')}
            {renderEditableField('ایمیل', 'email', 'email')}
            <Divider className='my-2' />

            {renderEditableField('رمز عبور جدید', 'password', 'password')}
            {renderEditableField(
              'تأیید رمز عبور',
              'passwordConfirm',
              'password',
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
