'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@heroui/button'
import { Input } from '@heroui/input'
import { Card, CardBody, CardHeader } from '@heroui/card'
import { Spinner } from '@heroui/spinner'
import { Chip } from '@heroui/chip'
import { addToast } from '@heroui/toast'
import { FolderTree, ArrowLeft, Save, Plus, X, Smile } from 'lucide-react'

interface CategoryFormData {
  name: string
  description: string
  icon: string
  subcategories: string[]
}

export default function CategoryEditPage() {
  const router = useRouter()
  const params = useParams()
  const isNew = params.id === 'new'

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [newSubcategory, setNewSubcategory] = useState('')
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    icon: '',
    subcategories: [],
  })

  // Fetch category data if editing
  useEffect(() => {
    if (!isNew) {
      fetchCategory()
    }
  }, [params.id])

  const fetchCategory = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/categories/${params.id}`)
      const result = await response.json()

      if (result.success) {
        const category = result.data

        setFormData({
          name: category.name || '',
          description: category.description || '',
          icon: category.icon || '',
          subcategories: category.subcategories || [],
        })
      } else {
        addToast({
          title: 'خطا',
          description: 'خطا در دریافت اطلاعات دسته‌بندی',
          color: 'danger',
        })
        router.push('/admin/categories')
      }
    } catch (error) {
      console.error('Error fetching category:', error)
      addToast({
        title: 'خطا',
        description: 'خطا در برقراری ارتباط با سرور',
        color: 'danger',
      })
      router.push('/admin/categories')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.name.trim()) {
      addToast({
        title: 'خطا',
        description: 'نام دسته‌بندی الزامی است',
        color: 'warning',
      })

      return
    }

    try {
      setSaving(true)

      const url = isNew ? '/api/categories' : `/api/categories/${params.id}`
      const method = isNew ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        addToast({
          title: 'موفقیت',
          description: isNew
            ? 'دسته‌بندی با موفقیت ایجاد شد'
            : 'دسته‌بندی با موفقیت بروزرسانی شد',
          color: 'success',
        })
        router.push('/admin/categories')
      } else {
        addToast({
          title: 'خطا',
          description: result.error || 'خطا در ذخیره اطلاعات',
          color: 'danger',
        })
      }
    } catch (error) {
      console.error('Error saving category:', error)
      addToast({
        title: 'خطا',
        description: 'خطا در ذخیره اطلاعات',
        color: 'danger',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof CategoryFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleAddSubcategory = () => {
    if (!newSubcategory.trim()) return

    if (formData.subcategories.includes(newSubcategory.trim())) {
      addToast({
        title: 'خطا',
        description: 'این زیردسته قبلاً اضافه شده است',
        color: 'warning',
      })

      return
    }

    setFormData(prev => ({
      ...prev,
      subcategories: [...prev.subcategories, newSubcategory.trim()],
    }))
    setNewSubcategory('')
  }

  const handleRemoveSubcategory = (index: number) => {
    setFormData(prev => ({
      ...prev,
      subcategories: prev.subcategories.filter((_, i) => i !== index),
    }))
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center py-20'>
        <Spinner size='lg' />
      </div>
    )
  }

  return (
    <div className='space-y-6' dir='rtl'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Button
            isIconOnly
            variant='flat'
            onPress={() => router.push('/admin/categories')}
          >
            <ArrowLeft className='w-5 h-5' />
          </Button>
          <div>
            <h1 className='flex items-center gap-3 text-3xl font-bold text-gray-900 dark:text-white'>
              <FolderTree className='w-8 h-8 text-primary' />
              {isNew ? 'افزودن دسته‌بندی جدید' : 'ویرایش دسته‌بندی'}
            </h1>
            <p className='mt-2 text-sm text-gray-500 dark:text-gray-400'>
              {isNew
                ? 'اطلاعات دسته‌بندی جدید را وارد کنید'
                : 'اطلاعات دسته‌بندی را ویرایش کنید'}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <h3 className='text-lg font-semibold'>اطلاعات اصلی</h3>
            </CardHeader>
            <CardBody className='space-y-4'>
              <Input
                isRequired
                label='نام دسته‌بندی'
                placeholder='مثال: میلگرد'
                startContent={<FolderTree className='w-4 h-4 text-gray-400' />}
                value={formData.name}
                variant='bordered'
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange('name', e.target.value)
                }
              />

              <div className='space-y-2'>
                <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                  توضیحات
                </label>
                <textarea
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg resize-none min-h-32 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='توضیحات کامل درباره دسته‌بندی...'
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    handleInputChange('description', e.target.value)
                  }
                />
              </div>

              <Input
                description='یک ایموجی برای نمایش در کنار نام دسته‌بندی'
                label='آیکون (Emoji)'
                placeholder='مثال: 🏗️ یا 🔧'
                startContent={<Smile className='w-4 h-4 text-gray-400' />}
                value={formData.icon}
                variant='bordered'
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange('icon', e.target.value)
                }
              />

              {formData.icon && (
                <div className='flex items-center gap-3 p-4 border border-gray-200 rounded-lg dark:border-gray-700'>
                  <div className='text-4xl'>{formData.icon}</div>
                  <div className='text-sm text-gray-500'>پیش‌نمایش آیکون</div>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Subcategories */}
          <Card>
            <CardHeader>
              <h3 className='text-lg font-semibold'>زیردسته‌ها</h3>
            </CardHeader>
            <CardBody className='space-y-4'>
              <div className='space-y-2'>
                <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                  افزودن زیردسته
                </label>
                <div className='flex gap-2'>
                  <Input
                    placeholder='نام زیردسته...'
                    value={newSubcategory}
                    variant='bordered'
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setNewSubcategory(e.target.value)
                    }
                    onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddSubcategory()
                      }
                    }}
                  />
                  <Button
                    isIconOnly
                    color='primary'
                    variant='flat'
                    onPress={handleAddSubcategory}
                  >
                    <Plus className='w-4 h-4' />
                  </Button>
                </div>
              </div>

              {/* Subcategories List */}
              <div className='space-y-2'>
                <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                  لیست زیردسته‌ها ({formData.subcategories.length})
                </label>
                {formData.subcategories.length === 0 ? (
                  <div className='p-8 text-center border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700'>
                    <p className='text-sm text-gray-500'>
                      هیچ زیردسته‌ای اضافه نشده است
                    </p>
                  </div>
                ) : (
                  <div className='space-y-2 overflow-y-auto max-h-96'>
                    {formData.subcategories.map((sub, index) => (
                      <div
                        key={index}
                        className='flex items-center justify-between gap-2 p-3 border border-gray-200 rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                      >
                        <Chip color='primary' size='sm' variant='flat'>
                          {sub}
                        </Chip>
                        <Button
                          isIconOnly
                          color='danger'
                          size='sm'
                          variant='light'
                          onPress={() => handleRemoveSubcategory(index)}
                        >
                          <X className='w-4 h-4' />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Actions */}
        <div className='flex justify-end gap-3 mt-6'>
          <Button
            variant='flat'
            onPress={() => router.push('/admin/categories')}
          >
            انصراف
          </Button>
          <Button
            color='primary'
            isLoading={saving}
            startContent={!saving && <Save className='w-4 h-4' />}
            type='submit'
          >
            {isNew ? 'ایجاد دسته‌بندی' : 'ذخیره تغییرات'}
          </Button>
        </div>
      </form>
    </div>
  )
}
