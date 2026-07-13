'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Factory,
  RefreshCw,
  X,
  Save,
  Globe,
  Mail,
  Phone,
  MapPin,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@heroui/input'
import { addToast } from '@heroui/toast'

interface Manufacturer {
  id: string
  name: string
  slug: string
  description: string | null
  logo: string | null
  website: string | null
  email: string | null
  phone: string | null
  address: string | null
  products: string[]
  createdAt: string
  updatedAt: string
}

export default function ManufacturersPage() {
  const router = useRouter()

  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedManufacturer, setSelectedManufacturer] =
    useState<Manufacturer | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    slug: '',
    description: '',
    website: '',
    email: '',
    phone: '',
    address: '',
  })

  // Fetch manufacturers
  const fetchManufacturers = async (search = '') => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        ...(search && { search }),
      })

      const response = await fetch(`/api/manufacturers?${params}`)
      const result = await response.json()

      if (result.success) {
        setManufacturers(result.data.manufacturers || result.data)
      } else {
        addToast({
          title: 'خطا',
          description: 'خطا در دریافت اطلاعات کارخانه‌ها',
          color: 'danger',
        })
      }
    } catch (error) {
      console.error('Error fetching manufacturers:', error)
      addToast({
        title: 'خطا',
        description: 'خطا در برقراری ارتباط با سرور',
        color: 'danger',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchManufacturers()
  }, [])

  // Handle search
  const handleSearch = () => {
    fetchManufacturers(searchQuery)
  }

  // Handle edit
  const handleEditClick = (manufacturer: Manufacturer) => {
    setSelectedManufacturer(manufacturer)
    setEditForm({
      name: manufacturer.name,
      slug: manufacturer.slug,
      description: manufacturer.description || '',
      website: manufacturer.website || '',
      email: manufacturer.email || '',
      phone: manufacturer.phone || '',
      address: manufacturer.address || '',
    })
    setEditModalOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedManufacturer) return

    // Validation
    if (!editForm.name.trim()) {
      addToast({
        title: 'خطا',
        description: 'نام کارخانه الزامی است',
        color: 'danger',
      })
      return
    }

    try {
      setSaveLoading(true)
      const response = await fetch(
        `/api/manufacturers/${selectedManufacturer.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: editForm.name.trim(),
            slug:
              editForm.slug.trim() || editForm.name.trim().replace(/\s+/g, '-'),
            description: editForm.description.trim() || null,
            website: editForm.website.trim() || null,
            email: editForm.email.trim() || null,
            phone: editForm.phone.trim() || null,
            address: editForm.address.trim() || null,
          }),
        },
      )

      const result = await response.json()

      if (result.success) {
        addToast({
          title: 'موفقیت',
          description: 'کارخانه با موفقیت بروزرسانی شد',
          color: 'success',
        })
        setEditModalOpen(false)
        fetchManufacturers(searchQuery)
      } else {
        addToast({
          title: 'خطا',
          description: result.error || 'خطا در بروزرسانی کارخانه',
          color: 'danger',
        })
      }
    } catch (error) {
      console.error('Error updating manufacturer:', error)
      addToast({
        title: 'خطا',
        description: 'خطا در ارتباط با سرور',
        color: 'danger',
      })
    } finally {
      setSaveLoading(false)
    }
  }

  // Handle delete
  const handleDeleteClick = (manufacturer: Manufacturer) => {
    setSelectedManufacturer(manufacturer)
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedManufacturer) return

    try {
      setDeleteLoading(true)
      const response = await fetch(
        `/api/manufacturers/${selectedManufacturer.id}`,
        {
          method: 'DELETE',
        },
      )

      const result = await response.json()

      if (result.success) {
        addToast({
          title: 'موفقیت',
          description: 'کارخانه با موفقیت حذف شد',
          color: 'success',
        })
        setDeleteModalOpen(false)
        fetchManufacturers(searchQuery)
      } else {
        addToast({
          title: 'خطا',
          description: result.error || 'خطا در حذف کارخانه',
          color: 'danger',
        })
      }
    } catch (error) {
      console.error('Error deleting manufacturer:', error)
      addToast({
        title: 'خطا',
        description: 'خطا در حذف کارخانه',
        color: 'danger',
      })
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className='container px-6 py-8 mx-auto' dir='rtl'>
      {/* Header */}
      <div className='mb-8'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='p-3 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl'>
              <Factory className='w-8 h-8 text-white' />
            </div>
            <div>
              <h1 className='text-3xl font-bold text-gray-900 dark:text-gray-100'>
                مدیریت تولیدکنندگان
              </h1>
              <p className='text-gray-600 dark:text-gray-400'>
                مدیریت اطلاعات تولیدکنندگان و کارخانه‌های فولاد
              </p>
            </div>
          </div>
          <Button
            onClick={() => router.push('/admin/manufacturers/new')}
            className='bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
          >
            <Plus className='w-4 h-4 ml-2' />
            افزودن کارخانه
          </Button>
        </div>
      </div>

      {/* Search & Actions */}
      <Card className='mb-6'>
        <CardContent className='p-6'>
          <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
            <div className='flex-1 max-w-md'>
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder='جستجو در کارخانه‌ها...'
                startContent={<Search className='w-4 h-4 text-gray-400' />}
                variant='bordered'
                classNames={{
                  input: 'text-right',
                  inputWrapper: 'border-gray-300 hover:border-blue-500 h-10',
                }}
              />
            </div>
            <div className='flex gap-2'>
              <Button onClick={handleSearch} variant='outline'>
                <Search className='w-4 h-4 ml-2' />
                جستجو
              </Button>
              {searchQuery && (
                <Button
                  variant='outline'
                  onClick={() => {
                    setSearchQuery('')
                    fetchManufacturers('')
                  }}
                >
                  <X className='w-4 h-4 ml-2' />
                  پاک کردن
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manufacturers List */}
      {loading ? (
        <div className='flex items-center justify-center py-20'>
          <RefreshCw className='w-8 h-8 text-blue-500 animate-spin' />
        </div>
      ) : manufacturers.length === 0 ? (
        <Card>
          <CardContent className='py-20 text-center'>
            <div className='inline-flex items-center justify-center w-20 h-20 mb-4 bg-blue-100 rounded-full dark:bg-blue-900/20'>
              <Factory className='w-10 h-10 text-blue-500' />
            </div>
            <h3 className='mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100'>
              هیچ کارخانه‌ای یافت نشد
            </h3>
            <p className='mb-6 text-gray-500 dark:text-gray-400'>
              {searchQuery
                ? 'نتیجه‌ای برای جستجوی شما یافت نشد'
                : 'برای شروع، اولین کارخانه را اضافه کنید'}
            </p>
            <Button
              onClick={() => router.push('/admin/manufacturers/new')}
              className='bg-gradient-to-r from-blue-500 to-purple-600'
            >
              <Plus className='w-4 h-4 ml-2' />
              افزودن کارخانه جدید
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className='grid grid-cols-2 gap-4'>
          {manufacturers.map(manufacturer => (
            <Card
              key={manufacturer.id}
              className='transition-all hover:shadow-md'
            >
              <CardContent className='p-6'>
                <div className='flex items-start justify-between gap-4'>
                  {/* Logo & Info */}
                  <div className='flex items-start flex-1 gap-4'>
                    {manufacturer.logo ? (
                      <img
                        src={manufacturer.logo}
                        alt={manufacturer.name}
                        className='object-cover w-16 h-16 border-2 border-gray-100 rounded-lg dark:border-gray-700'
                      />
                    ) : (
                      <div className='flex items-center justify-center w-16 h-16 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20'>
                        <Factory className='w-8 h-8 text-blue-600 dark:text-blue-400' />
                      </div>
                    )}

                    <div className='flex-1 min-w-0'>
                      <div className='flex items-start justify-between gap-4 mb-3'>
                        <div className='flex-1'>
                          <h3 className='mb-1 text-xl font-bold text-gray-900 dark:text-gray-100'>
                            {manufacturer.name}
                          </h3>
                          <Badge variant='outline' className='text-xs'>
                            {manufacturer.slug}
                          </Badge>
                        </div>
                      </div>

                      {/* Contact Info Grid */}
                      <div className='grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4'>
                        {manufacturer.website && (
                          <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
                            <Globe className='flex-shrink-0 w-4 h-4' />
                            <span className='truncate'>
                              {manufacturer.website}
                            </span>
                          </div>
                        )}
                        {manufacturer.email && (
                          <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
                            <Mail className='flex-shrink-0 w-4 h-4' />
                            <span className='truncate'>
                              {manufacturer.email}
                            </span>
                          </div>
                        )}
                        {manufacturer.phone && (
                          <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
                            <Phone className='flex-shrink-0 w-4 h-4' />
                            <span className='truncate'>
                              {manufacturer.phone}
                            </span>
                          </div>
                        )}
                        {manufacturer.address && (
                          <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
                            <MapPin className='flex-shrink-0 w-4 h-4' />
                            <span className='truncate'>
                              {manufacturer.address}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className='flex gap-2'>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => handleEditClick(manufacturer)}
                    >
                      <Edit className='w-4 h-4 ml-2' />
                      ویرایش
                    </Button>
                    <Button
                      size='sm'
                      variant='outline'
                      className='text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                      onClick={() => handleDeleteClick(manufacturer)}
                    >
                      <Trash2 className='w-4 h-4' />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Modal */}
      {deleteModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm'>
          <Card className='w-full max-w-md'>
            <CardHeader className='border-b'>
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-red-100 rounded-lg dark:bg-red-900/20'>
                  <AlertCircle className='w-5 h-5 text-red-600 dark:text-red-400' />
                </div>
                <h2 className='text-xl font-bold'>حذف کارخانه</h2>
              </div>
            </CardHeader>
            <CardContent className='p-6'>
              <p className='mb-2'>
                آیا از حذف کارخانه{' '}
                <strong className='text-red-600'>
                  {selectedManufacturer?.name}
                </strong>{' '}
                اطمینان دارید؟
              </p>

              {selectedManufacturer?.products &&
                selectedManufacturer.products.length > 0 && (
                  <p className='mb-4 text-sm text-amber-600 dark:text-amber-400'>
                    ⚠️ این کارخانه دارای {selectedManufacturer.products.length}{' '}
                    محصول است
                  </p>
                )}

              <p className='mb-6 text-sm text-gray-500'>
                این عملیات قابل بازگشت نیست.
              </p>

              <div className='flex justify-end gap-3'>
                <Button
                  variant='outline'
                  onClick={() => setDeleteModalOpen(false)}
                >
                  انصراف
                </Button>
                <Button
                  className='bg-red-600 hover:bg-red-700'
                  onClick={confirmDelete}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? (
                    <RefreshCw className='w-4 h-4 ml-2 animate-spin' />
                  ) : (
                    <Trash2 className='w-4 h-4 ml-2' />
                  )}
                  حذف
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm'>
          <Card className='w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
            <CardHeader className='sticky top-0 z-10 bg-white border-b dark:bg-gray-800'>
              <div className='flex items-center justify-between'>
                <h2 className='flex items-center gap-2 text-xl font-bold'>
                  <Edit className='w-5 h-5' />
                  ویرایش کارخانه
                </h2>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setEditModalOpen(false)}
                >
                  <X className='w-4 h-4' />
                </Button>
              </div>
            </CardHeader>
            <CardContent className='p-6'>
              <div className='space-y-4'>
                {/* Name Field */}
                <div>
                  <label className='block mb-2 text-sm font-medium'>
                    نام کارخانه <span className='text-red-500'>*</span>
                  </label>
                  <Input
                    value={editForm.name}
                    onChange={e =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    placeholder='نام کارخانه را وارد کنید'
                  />
                </div>

                {/* Slug Field */}
                <div>
                  <label className='block mb-2 text-sm font-medium'>
                    شناسه (Slug)
                  </label>
                  <Input
                    value={editForm.slug}
                    onChange={e =>
                      setEditForm({ ...editForm, slug: e.target.value })
                    }
                    placeholder='slug-example'
                    dir='ltr'
                  />
                </div>

                {/* Description Field */}
                <div>
                  <label className='block mb-2 text-sm font-medium'>
                    توضیحات
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={e =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                    placeholder='توضیحات کارخانه را وارد کنید'
                    className='w-full min-h-[100px] px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700'
                  />
                </div>

                {/* Website Field */}
                <div>
                  <label className='block mb-2 text-sm font-medium'>
                    <Globe className='inline w-4 h-4 ml-1' />
                    وب‌سایت
                  </label>
                  <Input
                    value={editForm.website}
                    onChange={e =>
                      setEditForm({ ...editForm, website: e.target.value })
                    }
                    placeholder='https://example.com'
                    dir='ltr'
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label className='block mb-2 text-sm font-medium'>
                    <Mail className='inline w-4 h-4 ml-1' />
                    ایمیل
                  </label>
                  <Input
                    value={editForm.email}
                    onChange={e =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                    placeholder='info@example.com'
                    type='email'
                    dir='ltr'
                  />
                </div>

                {/* Phone Field */}
                <div>
                  <label className='block mb-2 text-sm font-medium'>
                    <Phone className='inline w-4 h-4 ml-1' />
                    تلفن
                  </label>
                  <Input
                    value={editForm.phone}
                    onChange={e =>
                      setEditForm({ ...editForm, phone: e.target.value })
                    }
                    placeholder='021-12345678'
                    dir='ltr'
                  />
                </div>

                {/* Address Field */}
                <div>
                  <label className='block mb-2 text-sm font-medium'>
                    <MapPin className='inline w-4 h-4 ml-1' />
                    آدرس
                  </label>
                  <textarea
                    value={editForm.address}
                    onChange={e =>
                      setEditForm({ ...editForm, address: e.target.value })
                    }
                    placeholder='آدرس کامل کارخانه را وارد کنید'
                    className='w-full min-h-[80px] px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700'
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className='flex justify-end gap-3 pt-6 mt-6 border-t'>
                <Button
                  variant='outline'
                  onClick={() => setEditModalOpen(false)}
                  disabled={saveLoading}
                >
                  انصراف
                </Button>
                <Button
                  className='bg-blue-600 hover:bg-blue-700'
                  onClick={handleSaveEdit}
                  disabled={saveLoading}
                >
                  {saveLoading ? (
                    <RefreshCw className='w-4 h-4 ml-2 animate-spin' />
                  ) : (
                    <Save className='w-4 h-4 ml-2' />
                  )}
                  ذخیره تغییرات
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
