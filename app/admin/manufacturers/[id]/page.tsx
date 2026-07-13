'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@heroui/button'
import { Input } from '@heroui/input'
import { Card, CardBody, CardHeader } from '@heroui/card'
import { Spinner } from '@heroui/spinner'
import { addToast } from '@heroui/toast'
import {
  Factory,
  ArrowLeft,
  Save,
  Globe,
  Mail,
  Phone,
  MapPin,
  Image as ImageIcon,
} from 'lucide-react'

interface ManufacturerFormData {
  name: string
  description: string
  logo: string
  website: string
  email: string
  phone: string
  address: string
}

export default function ManufacturerEditPage() {
  const router = useRouter()
  const params = useParams()
  const isNew = params.id === 'new'

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<ManufacturerFormData>({
    name: '',
    description: '',
    logo: '',
    website: '',
    email: '',
    phone: '',
    address: '',
  })

  // Fetch manufacturer data if editing
  useEffect(() => {
    if (!isNew) {
      fetchManufacturer()
    }
  }, [params.id])

  const fetchManufacturer = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/manufacturers/${params.id}`)
      const result = await response.json()

      if (result.success) {
        const manufacturer = result.data
        setFormData({
          name: manufacturer.name || '',
          description: manufacturer.description || '',
          logo: manufacturer.logo || '',
          website: manufacturer.website || '',
          email: manufacturer.email || '',
          phone: manufacturer.phone || '',
          address: manufacturer.address || '',
        })
      } else {
        addToast({
          title: 'خطا',
          description: 'خطا در دریافت اطلاعات کارخانه',
          color: 'danger',
        })
        router.push('/admin/manufacturers')
      }
    } catch (error) {
      console.error('Error fetching manufacturer:', error)
      addToast({
        title: 'خطا',
        description: 'خطا در برقراری ارتباط با سرور',
        color: 'danger',
      })
      router.push('/admin/manufacturers')
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
        description: 'نام کارخانه الزامی است',
        color: 'warning',
      })
      return
    }

    try {
      setSaving(true)

      const url = isNew
        ? '/api/manufacturers'
        : `/api/manufacturers/${params.id}`

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
            ? 'کارخانه با موفقیت ایجاد شد'
            : 'کارخانه با موفقیت بروزرسانی شد',
          color: 'success',
        })
        router.push('/admin/manufacturers')
      } else {
        addToast({
          title: 'خطا',
          description: result.error || 'خطا در ذخیره اطلاعات',
          color: 'danger',
        })
      }
    } catch (error) {
      console.error('Error saving manufacturer:', error)
      addToast({
        title: 'خطا',
        description: 'خطا در ذخیره اطلاعات',
        color: 'danger',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (
    field: keyof ManufacturerFormData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            isIconOnly
            variant="flat"
            onPress={() => router.push('/admin/manufacturers')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900 dark:text-white">
              <Factory className="w-8 h-8 text-primary" />
              {isNew ? 'افزودن کارخانه جدید' : 'ویرایش کارخانه'}
            </h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {isNew
                ? 'اطلاعات کارخانه جدید را وارد کنید'
                : 'اطلاعات کارخانه را ویرایش کنید'}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">اطلاعات اصلی</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <Input
                label="نام کارخانه"
                placeholder="مثال: فولاد مبارکه"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange('name', e.target.value)
                }
                isRequired
                variant="bordered"
                startContent={<Factory className="w-4 h-4 text-gray-400" />}
              />

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  توضیحات
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none min-h-32 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="توضیحات کامل درباره کارخانه..."
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    handleInputChange('description', e.target.value)
                  }
                />
              </div>

              <Input
                label="لوگو (URL)"
                placeholder="https://example.com/logo.png"
                value={formData.logo}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange('logo', e.target.value)
                }
                variant="bordered"
                startContent={<ImageIcon className="w-4 h-4 text-gray-400" />}
              />

              {formData.logo && (
                <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg dark:border-gray-700">
                  <img
                    src={formData.logo}
                    alt="Logo preview"
                    className="object-cover w-16 h-16 rounded-lg"
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      e.currentTarget.src = '/images/placeholder.png'
                    }}
                  />
                  <div className="text-sm text-gray-500">پیش‌نمایش لوگو</div>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">اطلاعات تماس</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <Input
                label="وبسایت"
                placeholder="https://www.example.com"
                value={formData.website}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange('website', e.target.value)
                }
                variant="bordered"
                startContent={<Globe className="w-4 h-4 text-gray-400" />}
              />

              <Input
                label="ایمیل"
                type="email"
                placeholder="info@example.com"
                value={formData.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange('email', e.target.value)
                }
                variant="bordered"
                startContent={<Mail className="w-4 h-4 text-gray-400" />}
              />

              <Input
                label="شماره تماس"
                placeholder="021-12345678"
                value={formData.phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange('phone', e.target.value)
                }
                variant="bordered"
                startContent={<Phone className="w-4 h-4 text-gray-400" />}
              />

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  آدرس
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none min-h-24 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="آدرس کامل کارخانه..."
                  value={formData.address}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    handleInputChange('address', e.target.value)
                  }
                />
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="flat"
            onPress={() => router.push('/admin/manufacturers')}
          >
            انصراف
          </Button>
          <Button
            type="submit"
            color="primary"
            isLoading={saving}
            startContent={!saving && <Save className="w-4 h-4" />}
          >
            {isNew ? 'ایجاد کارخانه' : 'ذخیره تغییرات'}
          </Button>
        </div>
      </form>
    </div>
  )
}
