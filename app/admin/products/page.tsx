'use client'

import { useState, useMemo, useEffect } from 'react'
import { Button } from '@heroui/button'
import { Input } from '@heroui/input'
import { Card, CardBody, CardHeader } from '@heroui/card'
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from '@heroui/table'
import { Checkbox } from '@heroui/checkbox'
import { Chip } from '@heroui/chip'
import { Select, SelectItem } from '@heroui/select'
import { useDisclosure } from '@heroui/modal'
import { addToast } from '@heroui/toast'
import { Package, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useProducts, useCategories } from '@/hooks/useApi'
import { PRODUCT_CATEGORIES } from '@/types/products'
import { useProductExcel } from '@/hooks/useProductExcel'
import HeaderActions from '@/components/admin/products/HeaderActions'
import StatsCards from '@/components/admin/products/StatsCards'
import Filters from '@/components/admin/products/Filters'
import {
  BulkUpdateModal,
  BulkDeleteModal,
  DeleteSingleModal,
  EditProductModal,
  AddProductModal,
} from '@/components/admin/products/Modals'

interface Product {
  id: string
  name: string
  brand: string
  size: string
  price: number
  inStock: boolean
  category: {
    name: string
    id?: string
  }
  subcategory: string
  createdAt: string
  weight?: number
  unit?: string
}

interface BulkUpdateData {
  price?: number
  inStock?: boolean
  categoryId?: string
}

interface EditProductData {
  name: string
  brand: string
  size: string
  price: number
  inStock: boolean
  categoryId: string
  subcategory: string
  weight?: number
}

export default function AdminProducts() {
  // Excel import/export hook
  const {
    fileInputRef,
    exportProducts,
    downloadTemplate,
    handleFileImport,
    handleImportClick,
  } = useProductExcel()

  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [searchQuery, setSearchQuery] = useState('') // برای API
  const [categoryFilter, setCategoryFilter] = useState('')
  const [stockFilter, setStockFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [bulkUpdateData, setBulkUpdateData] = useState<BulkUpdateData>({})
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editProductData, setEditProductData] = useState<EditProductData>({
    name: '',
    brand: '',
    size: '',
    price: 0,
    inStock: true,
    categoryId: '',
    subcategory: '',
    weight: undefined,
  })
  const [newProductData, setNewProductData] = useState<EditProductData>({
    name: '',
    brand: '',
    size: '',
    price: 0,
    inStock: true,
    categoryId: '',
    subcategory: '',
    weight: undefined,
  })
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [sortDescriptor, setSortDescriptor] = useState({
    column: 'createdAt' as any,
    direction: 'descending' as 'ascending' | 'descending',
  })

  // Inline price editing
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null)
  const [tempPrice, setTempPrice] = useState<string>('')

  // Inline weight editing
  const [editingWeightId, setEditingWeightId] = useState<string | null>(null)
  const [tempWeight, setTempWeight] = useState<string>('')

  // Debounce searchTerm -> searchQuery to auto-run search while typing
  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchTerm), 800)
    return () => clearTimeout(t)
  }, [searchTerm])

  const formatPersianDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const {
    isOpen: isBulkModalOpen,
    onOpen: onBulkModalOpen,
    onOpenChange: onBulkModalOpenChange,
  } = useDisclosure()
  const {
    isOpen: isDeleteModalOpen,
    onOpen: onDeleteModalOpen,
    onOpenChange: onDeleteModalOpenChange,
  } = useDisclosure()
  const {
    isOpen: isEditModalOpen,
    onOpen: onEditModalOpen,
    onOpenChange: onEditModalOpenChange,
  } = useDisclosure()
  const {
    isOpen: isDeleteSingleModalOpen,
    onOpen: onDeleteSingleModalOpen,
    onOpenChange: onDeleteSingleModalOpenChange,
  } = useDisclosure()
  const {
    isOpen: isAddModalOpen,
    onOpen: onAddModalOpen,
    onOpenChange: onAddModalOpenChange,
  } = useDisclosure()

  const {
    products,
    pagination,
    isLoading,
    mutate: mutateProducts,
  } = useProducts({
    search: searchQuery,
    category: categoryFilter,
    inStock:
      stockFilter === 'true'
        ? true
        : stockFilter === 'false'
          ? false
          : undefined,
    page: currentPage,
    limit: itemsPerPage,
  })

  console.log(products)

  const { categories } = useCategories()

  const sortedProducts = useMemo(() => {
    if (!products) return []

    return [...products].sort((a, b) => {
      let aValue: any
      let bValue: any
      const column = String(sortDescriptor.column)

      switch (column) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'brand':
          aValue = a.brand.toLowerCase()
          bValue = b.brand.toLowerCase()
          break
        case 'size':
          aValue = a.size?.toLowerCase() || ''
          bValue = b.size?.toLowerCase() || ''
          break
        case 'price':
          aValue = a.price
          bValue = b.price
          break
        case 'inStock':
          aValue = a.inStock
          bValue = b.inStock
          break
        case 'category':
          aValue = a.category.name.toLowerCase()
          bValue = b.category.name.toLowerCase()
          break
        case 'subcategory':
          aValue = a.subcategory?.toLowerCase() || ''
          bValue = b.subcategory?.toLowerCase() || ''
          break
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
        default:
          return 0
      }

      if (aValue < bValue) {
        return sortDescriptor.direction === 'ascending' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortDescriptor.direction === 'ascending' ? 1 : -1
      }
      return 0
    })
  }, [products, sortDescriptor])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(sortedProducts.map((p: Product) => p.id))
    } else {
      setSelectedProducts([])
    }
  }

  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts([...selectedProducts, productId])
    } else {
      setSelectedProducts(selectedProducts.filter(id => id !== productId))
    }
  }

  const handleBulkUpdate = async () => {
    if (selectedProducts.length === 0) return

    try {
      const response = await fetch('/api/products/bulk', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productIds: selectedProducts,
          updateData: bulkUpdateData,
        }),
      })

      if (response.ok) {
        mutateProducts()
        const count = selectedProducts.length
        setSelectedProducts([])
        setBulkUpdateData({})
        onBulkModalOpenChange()
        addToast({
          title: 'موفقیت',
          description: `${count} محصول با موفقیت بروزرسانی شدند`,
          color: 'success',
        })
      } else {
        const error = await response.json()
        addToast({
          title: 'خطا',
          description: error.error || 'خطا در بروزرسانی محصولات',
          color: 'danger',
        })
      }
    } catch (error) {
      console.error('Bulk update failed:', error)
      addToast({
        title: 'خطا',
        description: 'خطا در ارتباط با سرور',
        color: 'danger',
      })
    }
  }

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return

    try {
      const response = await fetch('/api/products/bulk', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productIds: selectedProducts,
        }),
      })

      if (response.ok) {
        mutateProducts()
        const count = selectedProducts.length
        setSelectedProducts([])
        onDeleteModalOpenChange()
        addToast({
          title: 'موفقیت',
          description: `${count} محصول با موفقیت حذف شدند`,
          color: 'success',
        })
      } else {
        const error = await response.json()
        addToast({
          title: 'خطا',
          description: error.error || 'خطا در حذف محصولات',
          color: 'danger',
        })
      }
    } catch (error) {
      console.error('Bulk delete failed:', error)
      addToast({
        title: 'خطا',
        description: 'خطا در ارتباط با سرور',
        color: 'danger',
      })
    }
  }

  // Individual product handlers
  const handleEditProduct = (product: any) => {
    setEditingProduct(product)
    setEditProductData({
      name: product.name,
      brand: product.brand,
      size: product.size || '',
      price: product.price,
      inStock: product.inStock,
      categoryId: product.category?.id || '',
      subcategory: product.subcategory || '',
      weight: product.weight || undefined,
    })
    onEditModalOpen()
  }

  const handleSaveEdit = async () => {
    if (!editingProduct) return

    // Validate required fields
    if (
      !editProductData.name ||
      !editProductData.brand ||
      !editProductData.categoryId ||
      !editProductData.subcategory
    ) {
      addToast({
        title: 'خطا',
        description: 'لطفاً تمام فیلدهای اجباری را پر کنید',
        color: 'warning',
      })
      return
    }

    try {
      const response = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editProductData),
      })

      if (response.ok) {
        mutateProducts()
        setEditingProduct(null)
        onEditModalOpenChange()
        addToast({
          title: 'موفقیت',
          description: 'محصول با موفقیت بروزرسانی شد',
          color: 'success',
        })
      } else {
        const error = await response.json()
        addToast({
          title: 'خطا',
          description: error.error || 'خطا در بروزرسانی محصول',
          color: 'danger',
        })
      }
    } catch (error) {
      console.error('Edit product failed:', error)
      addToast({
        title: 'خطا',
        description: 'خطا در ارتباط با سرور',
        color: 'danger',
      })
    }
  }

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product)
    onDeleteSingleModalOpen()
  }

  const handleConfirmDelete = async () => {
    if (!productToDelete) return

    try {
      const response = await fetch(`/api/products/${productToDelete.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        mutateProducts()
        setProductToDelete(null)
        onDeleteSingleModalOpenChange()
        addToast({
          title: 'موفقیت',
          description: 'محصول با موفقیت حذف شد',
          color: 'success',
        })
      } else {
        const error = await response.json()
        addToast({
          title: 'خطا',
          description: error.error || 'خطا در حذف محصول',
          color: 'danger',
        })
      }
    } catch (error) {
      console.error('Delete product failed:', error)
      addToast({
        title: 'خطا',
        description: 'خطا در ارتباط با سرور',
        color: 'danger',
      })
    }
  }

  // Add product handlers
  const handleAddProduct = () => {
    setNewProductData({
      name: '',
      brand: '',
      size: '',
      price: 0,
      inStock: true,
      categoryId: '',
      subcategory: '',
    })
    onAddModalOpen()
  }

  const handleSaveNewProduct = async () => {
    // Validate required fields
    if (
      !newProductData.name ||
      !newProductData.brand ||
      !newProductData.categoryId ||
      !newProductData.subcategory
    ) {
      addToast({
        title: 'خطا',
        description: 'لطفاً تمام فیلدهای اجباری را پر کنید',
        color: 'warning',
      })
      return
    }

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProductData),
      })

      const data = await response.json()

      if (response.ok) {
        mutateProducts()
        setNewProductData({
          name: '',
          brand: '',
          size: '',
          price: 0,
          inStock: true,
          categoryId: '',
          subcategory: '',
        })
        onAddModalOpenChange()
        addToast({
          title: 'موفقیت',
          description: 'محصول با موفقیت اضافه شد',
          color: 'success',
        })
      } else {
        console.error('Error response:', data)
        addToast({
          title: 'خطا',
          description: data.error || 'خطا در افزودن محصول',
          color: 'danger',
        })
        if (data.details) {
          console.error('Error details:', data.details)
        }
      }
    } catch (error) {
      console.error('Add product failed:', error)
      addToast({
        title: 'خطا',
        description: 'خطا در ارتباط با سرور',
        color: 'danger',
      })
    }
  }

  // Inline price editing handlers
  const handlePriceClick = (product: Product) => {
    setEditingPriceId(product.id)
    setTempPrice(product.price.toString())
  }

  const handlePriceBlur = async (product: Product) => {
    const newPrice = parseFloat(tempPrice)

    // If price hasn't changed or is invalid, just cancel editing
    if (isNaN(newPrice) || newPrice === product.price || newPrice <= 0) {
      setEditingPriceId(null)
      setTempPrice('')
      return
    }

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price: newPrice,
        }),
      })

      if (response.ok) {
        mutateProducts()
        setEditingPriceId(null)
        setTempPrice('')
        addToast({
          title: 'موفقیت',
          description: 'قیمت با موفقیت بروزرسانی شد',
          color: 'success',
        })
      } else {
        const error = await response.json()
        addToast({
          title: 'خطا',
          description: error.error || 'خطا در بروزرسانی قیمت',
          color: 'danger',
        })
        setEditingPriceId(null)
        setTempPrice('')
      }
    } catch (error) {
      console.error('Failed to update price:', error)
      addToast({
        title: 'خطا',
        description: 'خطا در ارتباط با سرور',
        color: 'danger',
      })
      setEditingPriceId(null)
      setTempPrice('')
    }
  }

  const handlePriceKeyDown = (e: React.KeyboardEvent, product: Product) => {
    if (e.key === 'Enter') {
      handlePriceBlur(product)
    } else if (e.key === 'Escape') {
      setEditingPriceId(null)
      setTempPrice('')
    }
  }

  // Inline stock status toggle
  const handleStockToggle = async (product: Product) => {
    const newStockStatus = !product.inStock

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inStock: newStockStatus,
        }),
      })

      if (response.ok) {
        mutateProducts()
        addToast({
          title: 'موفقیت',
          description: 'وضعیت موجودی با موفقیت بروزرسانی شد',
          color: 'success',
        })
      } else {
        const error = await response.json()
        addToast({
          title: 'خطا',
          description: error.error || 'خطا در بروزرسانی وضعیت موجودی',
          color: 'danger',
        })
      }
    } catch (error) {
      console.error('Failed to update stock status:', error)
      addToast({
        title: 'خطا',
        description: 'خطا در ارتباط با سرور',
        color: 'danger',
      })
    }
  }

  // helper that builds query string with current filters and optional pagination override
  const buildQuery = (override: Record<string, string> = {}) => {
    const params: Record<string, string> = {
      page: '1',
      limit: '1000000', // large number to fetch all
    }
    if (searchQuery) params.search = searchQuery
    if (categoryFilter) params.category = categoryFilter
    if (stockFilter) params.inStock = stockFilter
    if (sortDescriptor.column) {
      params.sortBy = String(sortDescriptor.column)
      params.sortOrder =
        sortDescriptor.direction === 'ascending' ? 'asc' : 'desc'
    }
    return new URLSearchParams({ ...params, ...override }).toString()
  }

  // fetch full product list using current filters and export them
  const handleExportAll = async () => {
    try {
      const query = buildQuery()
      const res = await fetch(`/api/products?${query}`)
      const data = await res.json()
      if (data.success && data.data.products) {
        exportProducts(data.data.products)
      } else {
        console.error('Export failed:', data.error)
      }
    } catch (err) {
      console.error('Error fetching products for export:', err)
    }
  }

  // Inline weight editing handlers
  const handleWeightClick = (product: Product) => {
    setEditingWeightId(product.id)
    setTempWeight(product.weight?.toString() || '')
  }

  const handleWeightBlur = async (product: Product) => {
    const newWeight = tempWeight ? parseFloat(tempWeight) : undefined

    // If weight hasn't changed or is invalid, just cancel editing
    if (tempWeight === '' || (newWeight !== undefined && newWeight < 0)) {
      setEditingWeightId(null)
      setTempWeight('')
      return
    }

    // If weight is the same, just cancel
    if (newWeight === product.weight) {
      setEditingWeightId(null)
      setTempWeight('')
      return
    }

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weight: newWeight,
        }),
      })

      if (response.ok) {
        mutateProducts()
        setEditingWeightId(null)
        setTempWeight('')
        addToast({
          title: 'موفقیت',
          description: 'وزن با موفقیت بروزرسانی شد',
          color: 'success',
        })
      } else {
        const error = await response.json()
        addToast({
          title: 'خطا',
          description: error.error || 'خطا در بروزرسانی وزن',
          color: 'danger',
        })
        setEditingWeightId(null)
        setTempWeight('')
      }
    } catch (error) {
      console.error('Failed to update weight:', error)
      addToast({
        title: 'خطا',
        description: 'خطا در ارتباط با سرور',
        color: 'danger',
      })
      setEditingWeightId(null)
      setTempWeight('')
    }
  }

  const handleWeightKeyDown = (e: React.KeyboardEvent, product: Product) => {
    if (e.key === 'Enter') {
      handleWeightBlur(product)
    } else if (e.key === 'Escape') {
      setEditingWeightId(null)
      setTempWeight('')
    }
  }

  return (
    <div className='space-y-6' dir='rtl'>
      {/* Header Section */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='flex items-center gap-3 text-3xl font-bold text-gray-900 dark:text-white'>
            <Package className='w-8 h-8 text-primary' />
            مدیریت محصولات
          </h1>
          <p className='mt-2 text-sm text-gray-500 dark:text-gray-400'>
            مشاهده، ویرایش و مدیریت تمام محصولات فروشگاه
          </p>
        </div>
        <HeaderActions
          fileInputRef={fileInputRef}
          onImportClick={handleImportClick}
          onFileChange={e =>
            handleFileImport(e, categories, mutateProducts, addToast)
          }
          onExport={handleExportAll}
          onAdd={handleAddProduct}
        />
      </div>

      <StatsCards
        total={pagination?.total || 0}
        selected={selectedProducts.length}
      />

      {/* Filters */}
      <Card>
        <CardBody className='py-3'>
          <Filters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            stockFilter={stockFilter}
            setStockFilter={setStockFilter}
            categories={categories}
            selectedProductsCount={selectedProducts.length}
            onBulkOpen={onBulkModalOpen}
            onDeleteOpen={onDeleteModalOpen}
            onClearFilters={() => {
              setSearchTerm('')
              setSearchQuery('')
              setCategoryFilter('')
              setStockFilter('')
              setCurrentPage(1)
            }}
          />
        </CardBody>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader className='flex items-center gap-2 pb-3'>
          <Package className='w-5 h-5 text-primary' />
          <h3 className='text-lg font-semibold'>
            لیست محصولات ({sortedProducts.length})
          </h3>
        </CardHeader>
        <CardBody className='overflow-x-auto'>
          <Table
            aria-label='Products table'
            sortDescriptor={sortDescriptor}
            onSortChange={setSortDescriptor}
            classNames={{
              wrapper: 'shadow-none',
              th: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold',
              td: 'py-4',
            }}
          >
            <TableHeader>
              <TableColumn width={50}>
                <Checkbox
                  isSelected={
                    sortedProducts.length > 0 &&
                    selectedProducts.length === sortedProducts.length
                  }
                  onValueChange={handleSelectAll}
                />
              </TableColumn>
              <TableColumn key='name' allowsSorting>
                نام محصول
              </TableColumn>
              <TableColumn key='brand' allowsSorting>
                برند
              </TableColumn>
              <TableColumn key='size' allowsSorting>
                سایز
              </TableColumn>
              <TableColumn key='weight' allowsSorting>
                وزن
              </TableColumn>
              <TableColumn key='price' allowsSorting>
                قیمت (تومان)
              </TableColumn>
              <TableColumn key='inStock' allowsSorting>
                موجودی
              </TableColumn>
              <TableColumn key='category' allowsSorting>
                دسته‌بندی
              </TableColumn>
              <TableColumn key='subcategory'>زیردسته</TableColumn>
              <TableColumn width={150}>عملیات</TableColumn>
            </TableHeader>
            <TableBody isLoading={isLoading} emptyContent='هیچ محصولی یافت نشد'>
              {sortedProducts.map((product: Product) => (
                <TableRow
                  key={product.id}
                  className='transition-colors hover:bg-gray-50 dark:hover:bg-gray-800'
                >
                  <TableCell>
                    <Checkbox
                      isSelected={selectedProducts.includes(product.id)}
                      onValueChange={checked =>
                        handleSelectProduct(product.id, checked)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-3'>
                      <div className='p-2 bg-blue-100 rounded-lg dark:bg-blue-900'>
                        <Package className='w-4 h-4 text-blue-600 dark:text-blue-400' />
                      </div>
                      <span className='font-medium text-gray-900 dark:text-white'>
                        {product.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className='text-gray-600 dark:text-gray-400'>
                      {product.brand}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className='font-medium text-gray-900 dark:text-white'>
                      {product.size || 'نامشخص'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {editingWeightId === product.id ? (
                      <Input
                        type='number'
                        value={tempWeight}
                        onChange={e => setTempWeight(e.target.value)}
                        onBlur={() => handleWeightBlur(product)}
                        onKeyDown={e => handleWeightKeyDown(e, product)}
                        autoFocus
                        size='sm'
                        variant='bordered'
                        step='0.1'
                        classNames={{
                          input:
                            'text-blue-600 dark:text-blue-400 font-bold text-right',
                          inputWrapper: 'h-8 min-h-8 border-blue-500',
                        }}
                      />
                    ) : (
                      <span
                        className='font-medium text-gray-600 cursor-pointer dark:text-gray-400 hover:underline'
                        onClick={() => handleWeightClick(product)}
                        title='کلیک کنید برای ویرایش'
                      >
                        {product.weight ? product.weight : '-'}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingPriceId === product.id ? (
                      <Input
                        type='number'
                        value={tempPrice}
                        onChange={e => setTempPrice(e.target.value)}
                        onBlur={() => handlePriceBlur(product)}
                        onKeyDown={e => handlePriceKeyDown(e, product)}
                        autoFocus
                        size='sm'
                        variant='bordered'
                        classNames={{
                          input:
                            'text-green-600 dark:text-green-400 font-bold text-right',
                          inputWrapper: 'h-8 min-h-8 border-green-500',
                        }}
                      />
                    ) : (
                      <span
                        className='font-bold text-green-600 cursor-pointer dark:text-green-400 hover:underline'
                        onClick={() => handlePriceClick(product)}
                        title='کلیک کنید برای ویرایش'
                      >
                        {product.price.toLocaleString('fa-IR')}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size='sm'
                      variant='flat'
                      color={product.inStock ? 'success' : 'danger'}
                      onClick={() => handleStockToggle(product)}
                      className='transition-opacity cursor-pointer hover:opacity-80'
                      title='کلیک کنید برای تغییر وضعیت'
                    >
                      {product.inStock ? 'موجود' : 'ناموجود'}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <Chip size='sm' variant='bordered'>
                      {product.category.name}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <span className='text-sm text-gray-500 dark:text-gray-400'>
                      {product.subcategory}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className='flex gap-1'>
                      <Button
                        size='sm'
                        variant='light'
                        color='primary'
                        isIconOnly
                        onPress={() => handleEditProduct(product)}
                      >
                        <Edit className='w-4 h-4' />
                      </Button>
                      <Button
                        size='sm'
                        color='danger'
                        variant='light'
                        isIconOnly
                        onPress={() => handleDeleteProduct(product)}
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
        <CardBody className='px-6 py-4 border-t border-gray-200 dark:border-gray-700'>
          <div className='flex items-center justify-between gap-4'>
            {/* Items per page selector */}
            <div className='flex items-center gap-2'>
              <span className='text-sm text-gray-600 dark:text-gray-400'>
                نمایش:
              </span>
              <Select
                selectedKeys={new Set([itemsPerPage.toString()])}
                onSelectionChange={keys => {
                  const selected = Array.from(keys)[0] as string
                  setItemsPerPage(parseInt(selected))
                  setCurrentPage(1)
                }}
                variant='bordered'
                size='sm'
                className='w-20'
                classNames={{
                  trigger: 'h-9 min-h-9',
                }}
                aria-label='limit'
              >
                <SelectItem key='10'>10</SelectItem>
                <SelectItem key='20'>20</SelectItem>
                <SelectItem key='50'>50</SelectItem>
                <SelectItem key='100'>100</SelectItem>
              </Select>
              <span className='text-sm text-gray-600 dark:text-gray-400'>
                مورد در هر صفحه
              </span>
            </div>

            {/* Pagination info */}
            <div className='text-sm text-gray-600 dark:text-gray-400'>
              نمایش{' '}
              <span className='font-semibold text-gray-900 dark:text-white'>
                {pagination ? (currentPage - 1) * itemsPerPage + 1 : 0}
              </span>{' '}
              تا{' '}
              <span className='font-semibold text-gray-900 dark:text-white'>
                {pagination
                  ? Math.min(currentPage * itemsPerPage, pagination.total)
                  : 0}
              </span>{' '}
              از{' '}
              <span className='font-semibold text-gray-900 dark:text-white'>
                {pagination?.total || 0}
              </span>{' '}
              مورد
            </div>

            {/* Pagination buttons */}
            <div className='flex items-center gap-2'>
              <Button
                isIconOnly
                variant='bordered'
                size='sm'
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                isDisabled={currentPage === 1 || isLoading}
                className='h-9 w-9'
              >
                <ChevronRight className='w-4 h-4' />
              </Button>

              {/* Page numbers */}
              <div className='flex items-center gap-1'>
                {pagination &&
                  Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      let pageNum: number
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }
                      return pageNum
                    },
                  ).map((pageNum, idx, arr) => {
                    // Add ellipsis if needed
                    if (
                      idx > 0 &&
                      pageNum !== arr[idx - 1] + 1 &&
                      pagination.totalPages > 5
                    ) {
                      return (
                        <span
                          key={`ellipsis-${pageNum}`}
                          className='px-2 text-gray-600 dark:text-gray-400'
                        >
                          ...
                        </span>
                      )
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'solid' : 'bordered'}
                        size='sm'
                        onClick={() => setCurrentPage(pageNum)}
                        isDisabled={isLoading}
                        className='px-2 h-9 min-w-9'
                        color={currentPage === pageNum ? 'primary' : 'default'}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
              </div>

              <Button
                isIconOnly
                variant='bordered'
                size='sm'
                onClick={() =>
                  setCurrentPage(p =>
                    pagination ? Math.min(pagination.totalPages, p + 1) : p,
                  )
                }
                isDisabled={
                  !pagination ||
                  currentPage === pagination.totalPages ||
                  isLoading
                }
                className='h-9 w-9'
              >
                <ChevronLeft className='w-4 h-4' />
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      <BulkUpdateModal
        isOpen={isBulkModalOpen}
        onOpenChange={onBulkModalOpenChange}
        selectedCount={selectedProducts.length}
        bulkUpdateData={bulkUpdateData}
        setBulkUpdateData={setBulkUpdateData}
        categories={categories}
        onUpdate={handleBulkUpdate}
      />

      <BulkDeleteModal
        isOpen={isDeleteModalOpen}
        onOpenChange={onDeleteModalOpenChange}
        selectedCount={selectedProducts.length}
        onDelete={handleBulkDelete}
      />

      <EditProductModal
        isOpen={isEditModalOpen}
        onOpenChange={onEditModalOpenChange}
        editingProduct={editingProduct}
        editProductData={editProductData}
        setEditProductData={setEditProductData}
        categories={categories}
        onSave={handleSaveEdit}
      />

      <DeleteSingleModal
        isOpen={isDeleteSingleModalOpen}
        onOpenChange={onDeleteSingleModalOpenChange}
        product={productToDelete}
        onConfirm={handleConfirmDelete}
      />

      <AddProductModal
        isOpen={isAddModalOpen}
        onOpenChange={onAddModalOpenChange}
        newProductData={newProductData}
        setNewProductData={setNewProductData}
        categories={categories}
        onSave={handleSaveNewProduct}
      />
    </div>
  )
}
