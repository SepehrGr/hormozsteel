'use client'

import { useState, useEffect, Fragment } from 'react'
import { useRouter } from 'next/navigation'
import { Listbox, Transition } from '@headlessui/react'
import {
  Search,
  Plus,
  Edit,
  Trash2,
  FolderTree,
  Package,
  ChevronDown,
  ChevronRight,
  Layers,
  AlertCircle,
  RefreshCw,
  X,
  Save,
  CheckCircle2,
  Check,
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@heroui/input'
import { addToast } from '@heroui/toast'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@heroui/modal'
import { Chip } from '@heroui/chip'
import { Divider } from '@heroui/divider'
import { Button as HeroButton } from '@heroui/button'

interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
  description: string | null
  subcategories: string[]
  _count: {
    products: number
  }
  createdAt: string
  updatedAt: string
}

// لیست آیکون‌های icomoon
const ICOMOON_ICONS = [
  { value: 'icon-milgerd', label: 'میلگرد' },
  { value: 'icon-profil', label: 'پروفیل' },
  { value: 'icon-varagh', label: 'ورق' },
  { value: 'icon-nabshi', label: 'نبشی' },
  { value: 'icon-tirahan', label: 'تیرآهن' },
  { value: 'icon-lole', label: 'لوله' },
  { value: 'icon-wire', label: 'سیم' },
  { value: 'icon-compare', label: 'مقایسه' },
  { value: 'icon-bullion', label: 'شمش' },
  { value: 'icon-category', label: 'دسته‌بندی' },
  { value: 'icon-stainless-steel', label: 'استیل' },
  { value: 'icon-pipe', label: 'لوله' },
  { value: 'icon-sheet', label: 'ورق' },
  { value: 'icon-rebar', label: 'میلگرد' },
  { value: 'icon-girder', label: 'تیر' },
  { value: 'icon-Corners', label: 'گوشه' },
  { value: 'icon-grating', label: 'گریتینگ' },
  { value: 'icon-Equipment', label: 'تجهیزات' },
  { value: 'icon-Machine', label: 'ماشین‌آلات' },
  { value: 'icon-tajhizat', label: 'تجهیزات' },
  { value: 'icon-Wire-products', label: 'محصولات سیمی' },
  { value: 'icon-Non-ferrous-metals', label: 'فلزات غیرآهنی' },
]

export default function CategoriesPage() {
  const router = useRouter()

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  )
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [addLoading, setAddLoading] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  )

  // Form data for edit modal
  const [editForm, setEditForm] = useState({
    name: '',
    slug: '',
    icon: '',
    description: '',
    subcategories: [] as string[],
  })

  // Form data for add modal
  const [addForm, setAddForm] = useState({
    name: '',
    slug: '',
    icon: '',
    description: '',
    subcategories: [] as string[],
  })

  // Fetch categories
  const fetchCategories = async (search = '') => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        ...(search && { search }),
      })

      const response = await fetch(`/api/categories?${params}`)
      const result = await response.json()

      if (result.success) {
        setCategories(result.data)
      } else {
        alert('خطا در دریافت اطلاعات دسته‌بندی‌ها')
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      alert('خطا در برقراری ارتباط با سرور')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  // Handle search
  const handleSearch = () => {
    fetchCategories(searchQuery)
  }

  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  // Handle edit
  const handleEditClick = (category: Category) => {
    setSelectedCategory(category)
    setEditForm({
      name: category.name,
      slug: category.slug,
      icon: category.icon || '',
      description: category.description || '',
      subcategories: [...category.subcategories],
    })
    setEditModalOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedCategory) return

    // Validation
    if (!editForm.name.trim()) {
      alert('نام دسته‌بندی الزامی است')
      return
    }

    try {
      setSaveLoading(true)
      const response = await fetch(`/api/categories/${selectedCategory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editForm.name.trim(),
          slug:
            editForm.slug.trim() || editForm.name.trim().replace(/\s+/g, '-'),
          icon: editForm.icon.trim() || null,
          description: editForm.description.trim() || null,
          subcategories: editForm.subcategories.filter((s) => s.trim()),
        }),
      })

      const result = await response.json()

      if (result.success) {
        addToast({
          title: 'موفقیت',
          description: 'دسته‌بندی با موفقیت بروزرسانی شد',
          color: 'success',
        })
        setEditModalOpen(false)
        fetchCategories(searchQuery)
      } else {
        addToast({
          title: 'خطا',
          description: result.error || 'خطا در بروزرسانی دسته‌بندی',
          color: 'danger',
        })
      }
    } catch (error) {
      console.error('Error updating category:', error)
      addToast({
        title: 'خطا',
        description: 'خطا در ارتباط با سرور',
        color: 'danger',
      })
    } finally {
      setSaveLoading(false)
    }
  }

  const handleAddSubcategory = () => {
    setEditForm({
      ...editForm,
      subcategories: [...editForm.subcategories, ''],
    })
  }

  const handleRemoveSubcategory = (index: number) => {
    const newSubs = editForm.subcategories.filter((_, i) => i !== index)
    setEditForm({
      ...editForm,
      subcategories: newSubs,
    })
  }

  const handleSubcategoryChange = (index: number, value: string) => {
    const newSubs = [...editForm.subcategories]
    newSubs[index] = value
    setEditForm({
      ...editForm,
      subcategories: newSubs,
    })
  }

  // Handle add category
  const handleAddClick = () => {
    setAddForm({
      name: '',
      slug: '',
      icon: '',
      description: '',
      subcategories: [],
    })
    setAddModalOpen(true)
  }

  const handleSaveAdd = async () => {
    // Validation
    if (!addForm.name.trim()) {
      addToast({
        title: 'خطا',
        description: 'نام دسته‌بندی الزامی است',
        color: 'warning',
      })
      return
    }

    try {
      setAddLoading(true)
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: addForm.name.trim(),
          slug: addForm.slug.trim() || addForm.name.trim().replace(/\s+/g, '-'),
          icon: addForm.icon.trim() || null,
          description: addForm.description.trim() || null,
          subcategories: addForm.subcategories.filter((s) => s.trim()),
        }),
      })

      const result = await response.json()

      if (result.success) {
        addToast({
          title: 'موفقیت',
          description: 'دسته‌بندی با موفقیت ایجاد شد',
          color: 'success',
        })
        setAddModalOpen(false)
        fetchCategories(searchQuery)
      } else {
        addToast({
          title: 'خطا',
          description: result.error || 'خطا در ایجاد دسته‌بندی',
          color: 'danger',
        })
      }
    } catch (error) {
      console.error('Error creating category:', error)
      addToast({
        title: 'خطا',
        description: 'خطا در ارتباط با سرور',
        color: 'danger',
      })
    } finally {
      setAddLoading(false)
    }
  }

  const handleAddSubcategoryInAddForm = () => {
    setAddForm({
      ...addForm,
      subcategories: [...addForm.subcategories, ''],
    })
  }

  const handleRemoveSubcategoryInAddForm = (index: number) => {
    const newSubs = addForm.subcategories.filter((_, i) => i !== index)
    setAddForm({
      ...addForm,
      subcategories: newSubs,
    })
  }

  const handleSubcategoryChangeInAddForm = (index: number, value: string) => {
    const newSubs = [...addForm.subcategories]
    newSubs[index] = value
    setAddForm({
      ...addForm,
      subcategories: newSubs,
    })
  }

  // Handle delete
  const handleDeleteClick = (category: Category) => {
    setSelectedCategory(category)
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedCategory) return

    try {
      setDeleteLoading(true)
      const response = await fetch(`/api/categories/${selectedCategory.id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        addToast({
          title: 'موفقیت',
          description: 'دسته‌بندی با موفقیت حذف شد',
          color: 'success',
        })
        setDeleteModalOpen(false)
        fetchCategories(searchQuery)
      } else {
        addToast({
          title: 'خطا',
          description: result.error || 'خطا در حذف دسته‌بندی',
          color: 'danger',
        })
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      addToast({
        title: 'خطا',
        description: 'خطا در حذف دسته‌بندی',
        color: 'danger',
      })
    } finally {
      setDeleteLoading(false)
    }
  }

  // Calculate statistics
  const totalProducts = categories.reduce(
    (sum, cat) => sum + cat._count.products,
    0
  )
  const totalSubcategories = categories.reduce(
    (sum, cat) => sum + cat.subcategories.length,
    0
  )

  return (
    <div className="container px-6 py-8 mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 rounded-xl">
            <FolderTree className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              مدیریت دسته‌بندی‌ها
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              مدیریت دسته‌بندی‌ها و زیردسته‌های محصولات
            </p>
          </div>
        </div>
        <Button
          className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400"
          onClick={handleAddClick}
        >
          <Plus className="w-4 h-4 ml-2" />
          افزودن دسته‌بندی
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  کل دسته‌بندی‌ها
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {categories.length}
                </p>
              </div>
              <FolderTree className="w-12 h-12 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  کل زیردسته‌ها
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {totalSubcategories}
                </p>
              </div>
              <Layers className="w-12 h-12 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  کل محصولات
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {totalProducts}
                </p>
              </div>
              <Package className="w-12 h-12 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <Input
                placeholder="جستجو در دسته‌بندی‌ها..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                startContent={<Search className="w-4 h-4 text-gray-400" />}
                variant="bordered"
                classNames={{
                  input: 'text-right',
                  inputWrapper: 'border-gray-300 hover:border-blue-500 h-10',
                }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleSearch}>
                <Search className="w-4 h-4 ml-2" />
                جستجو
              </Button>
              {searchQuery && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('')
                    fetchCategories('')
                  }}
                >
                  پاک کردن
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => fetchCategories(searchQuery)}
              >
                <RefreshCw className="w-4 h-4 ml-2" />
                بروزرسانی
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin" />
        </div>
      ) : categories.length === 0 ? (
        <Card>
          <CardContent className="py-20 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-4 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30">
              <FolderTree className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              هیچ دسته‌بندی‌ای یافت نشد
            </h3>
            <p className="mb-6 text-gray-500">
              {searchQuery
                ? 'نتیجه‌ای برای جستجوی شما یافت نشد'
                : 'برای شروع، اولین دسته‌بندی را اضافه کنید'}
            </p>
            <Button
              className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400"
              onClick={() => router.push('/admin/categories/new')}
            >
              <Plus className="w-4 h-4 ml-2" />
              افزودن دسته‌بندی جدید
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden shadow-lg">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table
                dir="rtl"
                className="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
              >
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                  <tr>
                    <th
                      scope="col"
                      className="w-20 px-6 py-5 text-xs font-bold tracking-wider text-center text-gray-700 uppercase dark:text-gray-300"
                    >
                      آیکون
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-5 text-xs font-bold tracking-wider text-right text-gray-700 uppercase dark:text-gray-300"
                    >
                      اطلاعات دسته‌بندی
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-5 text-xs font-bold tracking-wider text-right text-gray-700 uppercase dark:text-gray-300"
                    >
                      شناسه
                    </th>
                    <th
                      scope="col"
                      className="w-40 px-6 py-5 text-xs font-bold tracking-wider text-center text-gray-700 uppercase dark:text-gray-300"
                    >
                      جزئیات
                    </th>
                    <th
                      scope="col"
                      className="w-32 px-6 py-5 text-xs font-bold tracking-wider text-center text-gray-700 uppercase dark:text-gray-300"
                    >
                      عملیات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100 dark:bg-gray-900 dark:divide-gray-800">
                  {categories.map((category) => {
                    const isExpanded = expandedCategories.has(category.id)
                    return (
                      <Fragment key={category.id}>
                        <tr
                          className="transition-all duration-200 border-b border-gray-100 cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent dark:hover:from-blue-900/20 dark:hover:to-transparent dark:border-gray-800"
                          onClick={() =>
                            category.subcategories.length > 0 &&
                            toggleCategory(category.id)
                          }
                        >
                          <td className="w-20 px-6 py-5 text-center align-middle">
                            <div className="flex items-center justify-center">
                              {category.icon &&
                              category.icon.startsWith?.('icon-') ? (
                                <div className="p-3 transition-all duration-200 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30">
                                  <i
                                    className={`${category.icon} text-2xl text-blue-600 dark:text-blue-400`}
                                    aria-hidden
                                  />
                                </div>
                              ) : (
                                <span className="text-3xl">
                                  {category.icon || '📁'}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-5 align-middle">
                            <div className="flex items-center gap-3">
                              <div className="flex flex-col flex-1 gap-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-base font-bold text-gray-900 dark:text-white">
                                    {category.name}
                                  </span>
                                  {category._count.products > 0 && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold text-white rounded-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-sm">
                                      <Package className="w-3 h-3" />
                                      {category._count.products}
                                    </span>
                                  )}
                                  {category.subcategories.length > 0 && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold text-cyan-700 bg-cyan-100 rounded-full dark:bg-cyan-900/30 dark:text-cyan-300">
                                      <Layers className="w-3 h-3" />
                                      {category.subcategories.length}
                                    </span>
                                  )}
                                </div>
                                {category.description && (
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {category.description}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 align-middle">
                            <code className="inline-block px-3 py-1.5 font-mono text-xs font-medium text-blue-700 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              {category.slug}
                            </code>
                          </td>
                          <td className="w-40 px-6 py-5 text-center align-middle">
                            <div className="flex items-center justify-center gap-1">
                              {category.subcategories.length > 0 && (
                                <div className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-700 transition-all bg-blue-100 rounded-lg dark:bg-blue-900/30 dark:text-blue-300">
                                  {isExpanded ? (
                                    <>
                                      <ChevronDown className="w-4 h-4" />
                                      <span>بستن</span>
                                    </>
                                  ) : (
                                    <>
                                      <ChevronRight className="w-4 h-4" />
                                      <span>نمایش</span>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                          <td
                            className="w-32 px-6 py-5 text-center align-middle"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleEditClick(category)}
                                className="p-2 text-blue-600 transition-colors rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                                title="ویرایش"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(category)}
                                className="p-2 text-red-600 transition-colors rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                                title="حذف"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="border-b border-blue-100 bg-gradient-to-r from-blue-50/50 via-transparent to-blue-50/50 dark:from-blue-900/10 dark:via-transparent dark:to-blue-900/10 dark:border-blue-900">
                            <td colSpan={5} className="px-6 py-4">
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500">
                                    <Layers className="w-3 h-3 text-white" />
                                  </div>
                                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                                    زیردسته‌های {category.name}
                                  </span>
                                  <span className="text-[10px] text-gray-400 dark:text-gray-500">
                                    ({category.subcategories.length})
                                  </span>
                                </div>
                                <div
                                  className="flex flex-wrap gap-2 pr-6"
                                  dir="rtl"
                                >
                                  {category.subcategories.map((sub, idx) => (
                                    <div
                                      key={idx}
                                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 transition-all duration-200 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-blue-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:border-blue-600"
                                    >
                                      <span>{sub}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        backdrop="blur"
        classNames={{
          backdrop:
            'bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20',
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 pb-4 border-b border-divider">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-danger/10">
                    <Trash2 className="w-5 h-5 text-danger" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">حذف دسته‌بندی</h3>
                    <p className="text-sm font-normal text-default-500">
                      تأیید حذف دسته‌بندی
                    </p>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody className="py-6">
                <div className="space-y-4">
                  <div className="p-5 border rounded-lg bg-danger/5 border-danger/20">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-danger mt-0.5 flex-shrink-0" />
                      <div className="space-y-2">
                        <p className="font-semibold text-foreground">
                          در حال حذف دسته‌بندی:
                        </p>
                        <Chip
                          color="primary"
                          variant="flat"
                          size="lg"
                          startContent={<FolderTree className="w-4 h-4" />}
                        >
                          {selectedCategory?.name}
                        </Chip>
                        {selectedCategory &&
                          selectedCategory._count.products > 0 && (
                            <div className="p-3 mt-3 border rounded-lg bg-warning/5 border-warning/20">
                              <p className="text-sm text-warning-700 dark:text-warning-400">
                                ⚠️ این دسته‌بندی دارای{' '}
                                {selectedCategory._count.products} محصول است. با
                                حذف این دسته‌بندی، محصولات مرتبط نیز حذف
                                می‌شوند.
                              </p>
                            </div>
                          )}
                        <p className="mt-3 text-sm text-default-500">
                          این عملیات قابل بازگشت نیست و تمام اطلاعات حذف خواهند
                          شد.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter className="pt-4 border-t border-divider">
                <HeroButton variant="light" onPress={onClose} size="lg">
                  انصراف
                </HeroButton>
                <HeroButton
                  color="danger"
                  onPress={confirmDelete}
                  size="lg"
                  isLoading={deleteLoading}
                  startContent={
                    !deleteLoading && <Trash2 className="w-4 h-4" />
                  }
                >
                  حذف دسته‌بندی
                </HeroButton>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={editModalOpen}
        onOpenChange={setEditModalOpen}
        size="3xl"
        backdrop="blur"
        scrollBehavior="inside"
        classNames={{
          backdrop:
            'bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20',
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 pb-4 border-b border-divider">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Edit className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">ویرایش دسته‌بندی</h3>
                    <p className="text-sm font-normal text-default-500">
                      ویرایش اطلاعات و زیردسته‌ها
                    </p>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody className="py-6">
                <div className="space-y-5">
                  {/* Name and Slug Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <FolderTree className="w-4 h-4 text-primary" />
                        نام دسته‌بندی
                      </label>
                      <Input
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                        placeholder="نام دسته‌بندی را وارد کنید"
                        variant="bordered"
                        size="lg"
                        classNames={{
                          inputWrapper:
                            'border-default-200 hover:border-primary',
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Package className="w-4 h-4 text-secondary" />
                        شناسه (Slug)
                      </label>
                      <Input
                        value={editForm.slug}
                        onChange={(e) =>
                          setEditForm({ ...editForm, slug: e.target.value })
                        }
                        placeholder="slug-example"
                        dir="ltr"
                        variant="bordered"
                        size="lg"
                        classNames={{
                          inputWrapper:
                            'border-default-200 hover:border-primary',
                          input: 'font-mono',
                        }}
                      />
                    </div>
                  </div>

                  <Divider />

                  {/* Icon Field */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <FolderTree className="w-4 h-4 text-warning" />
                      آیکون
                    </label>
                    <Listbox
                      value={editForm.icon}
                      onChange={(value) =>
                        setEditForm({ ...editForm, icon: value })
                      }
                    >
                      <div className="relative">
                        <Listbox.Button className="relative w-full py-2.5 pl-3 pr-10 text-right transition-colors border-2 rounded-lg cursor-pointer border-default-200 hover:border-primary focus:border-primary focus:outline-none bg-default-100 dark:bg-default-50">
                          <span className="flex items-center gap-2">
                            {editForm.icon && (
                              <i className={`${editForm.icon} text-lg`} />
                            )}
                            <span className="block truncate">
                              {editForm.icon
                                ? ICOMOON_ICONS.find(
                                    (i) => i.value === editForm.icon
                                  )?.label || editForm.icon
                                : 'انتخاب آیکون'}
                            </span>
                          </span>
                          <span className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                            <ChevronDown
                              className="w-5 h-5 text-gray-400"
                              aria-hidden="true"
                            />
                          </span>
                        </Listbox.Button>
                        <Transition
                          as={Fragment}
                          leave="transition ease-in duration-100"
                          leaveFrom="opacity-100"
                          leaveTo="opacity-0"
                        >
                          <Listbox.Options className="absolute z-50 w-full py-2 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm dark:bg-zinc-800">
                            <Listbox.Option
                              className={({ active }) =>
                                `relative cursor-pointer select-none py-3 pl-10 pr-4 ${
                                  active
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-gray-900 dark:text-gray-100'
                                }`
                              }
                              value=""
                            >
                              {({ selected }) => (
                                <>
                                  <span
                                    className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}
                                  >
                                    بدون آیکون
                                  </span>
                                  {selected ? (
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                                      <Check
                                        className="w-5 h-5"
                                        aria-hidden="true"
                                      />
                                    </span>
                                  ) : null}
                                </>
                              )}
                            </Listbox.Option>
                            {ICOMOON_ICONS.map((icon) => (
                              <Listbox.Option
                                key={icon.value}
                                className={({ active }) =>
                                  `relative cursor-pointer select-none py-3 pl-10 pr-4 flex items-center justify-center ${
                                    active
                                      ? 'bg-primary/10 text-primary'
                                      : 'text-gray-900 dark:text-gray-100'
                                  }`
                                }
                                value={icon.value}
                              >
                                {({ selected }) => (
                                  <>
                                    <i className={`${icon.value} text-3xl`} />
                                    {selected ? (
                                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                                        <Check
                                          className="w-5 h-5"
                                          aria-hidden="true"
                                        />
                                      </span>
                                    ) : null}
                                  </>
                                )}
                              </Listbox.Option>
                            ))}
                          </Listbox.Options>
                        </Transition>
                      </div>
                    </Listbox>
                  </div>

                  <Divider />

                  {/* Description Field */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Edit className="w-4 h-4 text-success" />
                      توضیحات
                    </label>
                    <textarea
                      value={editForm.description || ''}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          description: e.target.value,
                        })
                      }
                      placeholder="توضیحات دسته‌بندی را وارد کنید"
                      rows={4}
                      className="w-full px-3 py-2 transition-colors border-2 rounded-lg resize-none border-default-200 hover:border-primary focus:border-primary focus:outline-none bg-default-100 dark:bg-default-50"
                    />
                  </div>

                  <Divider />

                  {/* Subcategories */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Layers className="w-4 h-4 text-warning" />
                        زیردسته‌ها
                      </label>
                      <HeroButton
                        size="sm"
                        color="primary"
                        variant="flat"
                        onPress={handleAddSubcategory}
                        startContent={<Plus className="w-4 h-4" />}
                      >
                        افزودن زیردسته
                      </HeroButton>
                    </div>
                    {editForm.subcategories.length > 0 ? (
                      <div className="space-y-2">
                        {editForm.subcategories.map((sub, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={sub}
                              onChange={(e) =>
                                handleSubcategoryChange(index, e.target.value)
                              }
                              placeholder={`زیردسته ${index + 1}`}
                              variant="bordered"
                              classNames={{
                                inputWrapper:
                                  'border-default-200 hover:border-primary',
                              }}
                            />
                            <HeroButton
                              isIconOnly
                              color="danger"
                              variant="flat"
                              onPress={() => handleRemoveSubcategory(index)}
                            >
                              <X className="w-4 h-4" />
                            </HeroButton>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center border-2 border-dashed rounded-lg border-default-200">
                        <p className="text-sm text-default-400">
                          زیردسته‌ای وجود ندارد
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </ModalBody>
              <ModalFooter className="pt-4 border-t border-divider">
                <HeroButton variant="light" onPress={onClose} size="lg">
                  انصراف
                </HeroButton>
                <HeroButton
                  color="primary"
                  onPress={handleSaveEdit}
                  size="lg"
                  isLoading={saveLoading}
                  startContent={
                    !saveLoading && <CheckCircle2 className="w-4 h-4" />
                  }
                >
                  ذخیره تغییرات
                </HeroButton>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Add Category Modal */}
      <Modal
        isOpen={addModalOpen}
        onOpenChange={setAddModalOpen}
        size="3xl"
        backdrop="blur"
        scrollBehavior="inside"
        classNames={{
          backdrop:
            'bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20',
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex gap-3 pb-4 border-b border-divider">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success/10">
                    <Plus className="w-5 h-5 text-success" />
                  </div>
                  <h3 className="text-xl font-semibold">
                    افزودن دسته‌بندی جدید
                  </h3>
                </div>
              </ModalHeader>

              <ModalBody className="gap-4 py-6">
                {/* Name and Slug Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground-600">
                      <FolderTree className="w-4 h-4" />
                      <span>نام دسته‌بندی</span>
                    </div>
                    <Input
                      value={addForm.name}
                      onChange={(e) =>
                        setAddForm({ ...addForm, name: e.target.value })
                      }
                      placeholder="نام دسته‌بندی را وارد کنید"
                      variant="bordered"
                      size="lg"
                      dir="rtl"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground-600">
                      <Package className="w-4 h-4" />
                      <span>شناسه (Slug)</span>
                    </div>
                    <Input
                      value={addForm.slug}
                      onChange={(e) =>
                        setAddForm({ ...addForm, slug: e.target.value })
                      }
                      placeholder="شناسه یکتا (مثال: pipes)"
                      variant="bordered"
                      size="lg"
                    />
                  </div>
                </div>

                <Divider />

                {/* Icon Field */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground-600">
                    <FolderTree className="w-4 h-4" />
                    <span>آیکون</span>
                  </div>
                  <Listbox
                    value={addForm.icon}
                    onChange={(value) =>
                      setAddForm({ ...addForm, icon: value })
                    }
                  >
                    <div className="relative">
                      <Listbox.Button className="relative w-full py-2.5 pl-3 pr-10 text-right transition-colors border-2 rounded-lg cursor-pointer border-default-200 hover:border-primary focus:border-primary focus:outline-none bg-default-100 dark:bg-default-50">
                        <span className="flex items-center gap-2">
                          {addForm.icon && (
                            <i className={`${addForm.icon} text-lg`} />
                          )}
                          <span className="block truncate">
                            {addForm.icon
                              ? ICOMOON_ICONS.find(
                                  (i) => i.value === addForm.icon
                                )?.label || addForm.icon
                              : 'انتخاب آیکون'}
                          </span>
                        </span>
                        <span className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                          <ChevronDown
                            className="w-5 h-5 text-gray-400"
                            aria-hidden="true"
                          />
                        </span>
                      </Listbox.Button>
                      <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                      >
                        <Listbox.Options className="absolute z-50 w-full py-2 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm dark:bg-zinc-800">
                          <Listbox.Option
                            className={({ active }) =>
                              `relative cursor-pointer select-none py-3 pl-10 pr-4 ${
                                active
                                  ? 'bg-primary/10 text-primary'
                                  : 'text-gray-900 dark:text-gray-100'
                              }`
                            }
                            value=""
                          >
                            {({ selected }) => (
                              <>
                                <span
                                  className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}
                                >
                                  بدون آیکون
                                </span>
                                {selected ? (
                                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                                    <Check
                                      className="w-5 h-5"
                                      aria-hidden="true"
                                    />
                                  </span>
                                ) : null}
                              </>
                            )}
                          </Listbox.Option>
                          {ICOMOON_ICONS.map((icon) => (
                            <Listbox.Option
                              key={icon.value}
                              className={({ active }) =>
                                `relative cursor-pointer select-none py-3 pl-10 pr-4 flex items-center justify-center ${
                                  active
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-gray-900 dark:text-gray-100'
                                }`
                              }
                              value={icon.value}
                            >
                              {({ selected }) => (
                                <>
                                  <i className={`${icon.value} text-3xl`} />
                                  {selected ? (
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                                      <Check
                                        className="w-5 h-5"
                                        aria-hidden="true"
                                      />
                                    </span>
                                  ) : null}
                                </>
                              )}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </Transition>
                    </div>
                  </Listbox>
                </div>

                <Divider />

                {/* Description Field */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground-600">
                    <Edit className="w-4 h-4" />
                    <span>توضیحات</span>
                  </div>
                  <Input
                    value={addForm.description}
                    onChange={(e) =>
                      setAddForm({ ...addForm, description: e.target.value })
                    }
                    placeholder="توضیحات دسته‌بندی"
                    variant="bordered"
                    size="lg"
                    dir="rtl"
                  />
                </div>

                <Divider />

                {/* Subcategories Field */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground-600">
                    <Layers className="w-4 h-4" />
                    <span>زیرشاخه‌ها</span>
                  </div>

                  <div className="space-y-2">
                    {addForm.subcategories.map((sub, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={sub}
                          onChange={(e) =>
                            handleSubcategoryChangeInAddForm(
                              index,
                              e.target.value
                            )
                          }
                          placeholder={`زیرشاخه ${index + 1}`}
                          variant="bordered"
                          size="md"
                          dir="rtl"
                        />
                        <HeroButton
                          isIconOnly
                          variant="light"
                          color="danger"
                          size="lg"
                          onPress={() =>
                            handleRemoveSubcategoryInAddForm(index)
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </HeroButton>
                      </div>
                    ))}

                    <HeroButton
                      variant="bordered"
                      color="primary"
                      size="sm"
                      onPress={handleAddSubcategoryInAddForm}
                      startContent={<Plus className="w-4 h-4" />}
                      className="w-full"
                    >
                      افزودن زیرشاخه
                    </HeroButton>
                  </div>
                </div>
              </ModalBody>

              <ModalFooter className="pt-4 border-t border-divider">
                <HeroButton variant="light" onPress={onClose} size="lg">
                  انصراف
                </HeroButton>
                <HeroButton
                  color="success"
                  onPress={handleSaveAdd}
                  size="lg"
                  isLoading={addLoading}
                  startContent={
                    !addLoading && <CheckCircle2 className="w-4 h-4" />
                  }
                >
                  ایجاد دسته‌بندی
                </HeroButton>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}
