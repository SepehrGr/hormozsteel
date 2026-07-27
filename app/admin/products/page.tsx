'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { Input } from '@heroui/input'
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from '@heroui/table'
import { Checkbox } from '@heroui/checkbox'
import { useDisclosure } from '@heroui/modal'
import { addToast } from '@heroui/toast'
import { Package, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'

import { useProducts, useCategories, useManufacturers } from '@/hooks/use-api'
import { useProductExcel } from '@/hooks/use-product-excel'
import HeaderActions from '@/components/admin/products/header-actions'
import StatsCards from '@/components/admin/products/stats-cards'
import Filters from '@/components/admin/products/filters'
import {
  BulkUpdateModal,
  BulkDeleteModal,
  DeleteSingleModal,
  EditProductModal,
  AddProductModal,
} from '@/components/admin/products/modals'

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
  manufacturerId?: string
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
    manufacturerId: '',
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
    manufacturerId: '',
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

  // Filters shrink the result set — don't keep requesting a page that no longer exists
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, categoryFilter, stockFilter])

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

  const { categories } = useCategories()
  const { manufacturers } = useManufacturers({ limit: 200 })

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
          aValue = (a.brand || '').toLowerCase()
          bValue = (b.brand || '').toLowerCase()
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

      const data = await response.json().catch(() => ({}))

      if (response.ok && data.success !== false) {
        const count = data.affectedCount ?? selectedProducts.length

        setSelectedProducts([])
        mutateProducts()
        onDeleteModalOpenChange()
        addToast({
          title: 'Deleted',
          description: `${count} product${count === 1 ? '' : 's'} removed`,
          color: 'success',
        })
      } else {
        addToast({
          title: 'Error',
          description: data.error || 'Could not delete products',
          color: 'danger',
        })
      }
    } catch (error) {
      console.error('Bulk delete failed:', error)
      addToast({
        title: 'Error',
        description: 'Server connection failed',
        color: 'danger',
      })
    }
  }

  const millPayload = (data: EditProductData) => {
    const manufacturerId =
      data.manufacturerId && data.manufacturerId !== '__custom__'
        ? data.manufacturerId
        : undefined

    return {
      ...data,
      manufacturerId: manufacturerId || undefined,
      brand: data.brand?.trim() || undefined,
      weight: data.weight,
    }
  }

  // Individual product handlers
  const handleEditProduct = (product: any) => {
    setEditingProduct(product)
    setEditProductData({
      name: product.name,
      brand: product.brand || product.manufacturer?.name || '',
      manufacturerId: product.manufacturerId || product.manufacturer?.id || '',
      size: product.size || '',
      price: product.price,
      inStock: product.inStock,
      categoryId: product.category?.id || product.categoryId || '',
      subcategory: product.subcategory || '',
      weight: product.weightKg ?? product.weight ?? undefined,
    })
    onEditModalOpen()
  }

  const handleSaveEdit = async () => {
    if (!editingProduct) return

    const hasMill =
      (editProductData.manufacturerId &&
        editProductData.manufacturerId !== '__custom__') ||
      editProductData.brand?.trim()

    if (
      !editProductData.name ||
      !hasMill ||
      !editProductData.categoryId ||
      !editProductData.subcategory
    ) {
      addToast({
        title: 'Validation',
        description: 'Name, mill, category, and sub-line are required',
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
        body: JSON.stringify(millPayload(editProductData)),
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
        const deletedId = productToDelete.id

        setSelectedProducts(prev => prev.filter(id => id !== deletedId))
        setProductToDelete(null)
        mutateProducts()
        onDeleteSingleModalOpenChange()
        addToast({
          title: 'Deleted',
          description: 'Product removed from catalog',
          color: 'success',
        })
      } else {
        const error = await response.json()

        addToast({
          title: 'Error',
          description: error.error || 'Could not delete product',
          color: 'danger',
        })
      }
    } catch (error) {
      console.error('Delete product failed:', error)
      addToast({
        title: 'Error',
        description: 'Server connection failed',
        color: 'danger',
      })
    }
  }

  // Add product handlers
  const handleAddProduct = () => {
    setNewProductData({
      name: '',
      brand: '',
      manufacturerId: '',
      size: '',
      price: 0,
      inStock: true,
      categoryId: '',
      subcategory: '',
    })
    onAddModalOpen()
  }

  const handleSaveNewProduct = async () => {
    const hasMill =
      (newProductData.manufacturerId &&
        newProductData.manufacturerId !== '__custom__') ||
      newProductData.brand?.trim()

    if (
      !newProductData.name ||
      !hasMill ||
      !newProductData.categoryId ||
      !newProductData.subcategory
    ) {
      addToast({
        title: 'Validation',
        description: 'Name, mill, category, and sub-line are required',
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
        body: JSON.stringify(millPayload(newProductData)),
      })

      const data = await response.json()

      if (response.ok) {
        mutateProducts()
        setNewProductData({
          name: '',
          brand: '',
          manufacturerId: '',
          size: '',
          price: 0,
          inStock: true,
          categoryId: '',
          subcategory: '',
        })
        onAddModalOpenChange()
        addToast({
          title: 'Created',
          description: 'Product added to catalog',
          color: 'success',
        })
      } else {
        console.error('Error response:', data)
        addToast({
          title: 'Error',
          description: data.error || 'Could not add product',
          color: 'danger',
        })
        if (data.details) {
          console.error('Error details:', data.details)
        }
      }
    } catch (error) {
      console.error('Add product failed:', error)
      addToast({
        title: 'Error',
        description: 'Server connection failed',
        color: 'danger',
      })
    }
  }

  // Inline price editing — avoid Enter+blur double-submit (was flashing error UI)
  const priceSaveLock = useRef(false)

  const handlePriceClick = (product: Product) => {
    priceSaveLock.current = false
    setEditingPriceId(product.id)
    setTempPrice(product.price.toString())
  }

  const cancelPriceEdit = () => {
    priceSaveLock.current = false
    setEditingPriceId(null)
    setTempPrice('')
  }

  const handlePriceSave = async (product: Product) => {
    if (priceSaveLock.current) return
    if (editingPriceId !== product.id) return

    const newPrice = parseFloat(tempPrice)

    // Unchanged / invalid — leave quietly (no error toast)
    if (Number.isNaN(newPrice) || newPrice <= 0 || newPrice === product.price) {
      cancelPriceEdit()

      return
    }

    priceSaveLock.current = true
    // Exit edit mode immediately so the input (and any validation chrome) unmounts
    setEditingPriceId(null)
    const savedPrice = newPrice

    setTempPrice('')

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price: savedPrice,
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (response.ok && data.success !== false) {
        await mutateProducts()
        addToast({
          title: 'Updated',
          description: 'Unit price saved',
          color: 'success',
        })
      } else {
        await mutateProducts()
        addToast({
          title: 'Error',
          description: data.error || 'Could not update price',
          color: 'danger',
        })
      }
    } catch (error) {
      console.error('Failed to update price:', error)
      await mutateProducts()
      addToast({
        title: 'Error',
        description: 'Server connection failed',
        color: 'danger',
      })
    } finally {
      priceSaveLock.current = false
    }
  }

  const handlePriceKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    product: Product,
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      // Blur once — onBlur will save (avoids double PATCH from Enter + blur)
      e.currentTarget.blur()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      cancelPriceEdit()
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
    <div className='space-y-6' dir='ltr'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <p className='font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground'>
            Catalog
          </p>
          <h1 className='flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground'>
            <Package className='h-6 w-6' />
            Products
          </h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            View, edit, and manage catalog line items.
          </p>
        </div>
        <HeaderActions
          fileInputRef={fileInputRef}
          onAdd={handleAddProduct}
          onExport={handleExportAll}
          onFileChange={e =>
            handleFileImport(e, categories, mutateProducts, addToast)
          }
          onImportClick={handleImportClick}
        />
      </div>

      <StatsCards
        selected={selectedProducts.length}
        total={pagination?.total || 0}
      />

      <div className='border border-border bg-card'>
        <div className='border-b border-border px-4 py-3'>
          <h2 className='font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
            Filters
          </h2>
        </div>
        <div className='px-4 py-4'>
          <Filters
            categories={categories}
            categoryFilter={categoryFilter}
            searchTerm={searchTerm}
            selectedProductsCount={selectedProducts.length}
            setCategoryFilter={setCategoryFilter}
            setSearchTerm={setSearchTerm}
            setStockFilter={setStockFilter}
            stockFilter={stockFilter}
            onBulkOpen={onBulkModalOpen}
            onClearFilters={() => {
              setSearchTerm('')
              setSearchQuery('')
              setCategoryFilter('')
              setStockFilter('')
              setCurrentPage(1)
            }}
            onDeleteOpen={onDeleteModalOpen}
          />
        </div>
      </div>

      <div className='border border-border bg-card'>
        <div className='flex items-center gap-2 border-b border-border px-4 py-3'>
          <Package className='h-4 w-4 text-muted-foreground' />
          <h3 className='font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
            Line items ({sortedProducts.length})
          </h3>
        </div>
        <div className='overflow-x-auto'>
          <Table
            aria-label='Products table'
            classNames={{
              wrapper: 'shadow-none rounded-none',
              th: 'bg-muted/50 text-muted-foreground text-[10px] font-semibold uppercase tracking-[0.12em]',
              td: 'py-3',
            }}
            sortDescriptor={sortDescriptor}
            onSortChange={setSortDescriptor}
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
                Product
              </TableColumn>
              <TableColumn key='brand' allowsSorting>
                Mill
              </TableColumn>
              <TableColumn key='size' allowsSorting>
                Size
              </TableColumn>
              <TableColumn key='weight' allowsSorting>
                Weight
              </TableColumn>
              <TableColumn key='price' allowsSorting>
                Price (USD)
              </TableColumn>
              <TableColumn key='inStock' allowsSorting>
                Stock
              </TableColumn>
              <TableColumn key='category' allowsSorting>
                Category
              </TableColumn>
              <TableColumn key='subcategory'>Sub-line</TableColumn>
              <TableColumn width={150}>Actions</TableColumn>
            </TableHeader>
            <TableBody emptyContent='No products found' isLoading={isLoading}>
              {sortedProducts.map((product: Product) => (
                <TableRow
                  key={product.id}
                  className='transition-colors duration-200 ease-out hover:bg-muted/50'
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
                    <span className='font-medium text-foreground'>
                      {product.name}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className='text-muted-foreground'>
                      {product.brand}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className='font-mono text-xs tabular-nums text-foreground'>
                      {product.size || '—'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {editingWeightId === product.id ? (
                      <Input
                        autoFocus
                        classNames={{
                          input: 'font-mono tabular-nums',
                          inputWrapper: 'h-8 min-h-8',
                        }}
                        size='sm'
                        step='0.1'
                        type='number'
                        value={tempWeight}
                        variant='bordered'
                        onBlur={() => handleWeightBlur(product)}
                        onChange={e => setTempWeight(e.target.value)}
                        onKeyDown={e => handleWeightKeyDown(e, product)}
                      />
                    ) : (
                      <span
                        className='cursor-pointer font-mono text-xs tabular-nums text-muted-foreground hover:underline'
                        title='Click to edit'
                        onClick={() => handleWeightClick(product)}
                      >
                        {product.weight ? product.weight : '—'}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingPriceId === product.id ? (
                      <input
                        autoFocus
                        aria-label='Edit unit price'
                        className='h-8 w-28 border border-border bg-background px-2 font-mono text-sm font-semibold tabular-nums text-foreground outline-none focus:border-foreground focus:ring-1 focus:ring-foreground'
                        inputMode='decimal'
                        min='0'
                        step='0.01'
                        type='number'
                        value={tempPrice}
                        onBlur={() => handlePriceSave(product)}
                        onChange={e => setTempPrice(e.target.value)}
                        onKeyDown={e => handlePriceKeyDown(e, product)}
                      />
                    ) : (
                      <span
                        className='cursor-pointer font-mono text-sm font-semibold tabular-nums text-foreground hover:underline'
                        title='Click to edit'
                        onClick={() => handlePriceClick(product)}
                      >
                        $
                        {Number(product.price).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <button
                      className={`border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide transition-colors duration-200 ease-out cursor-pointer ${
                        product.inStock
                          ? 'border-emerald-600/30 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-200'
                          : 'border-red-600/30 bg-red-50 text-red-800 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-200'
                      }`}
                      title='Click to toggle stock'
                      type='button'
                      onClick={() => handleStockToggle(product)}
                    >
                      {product.inStock ? 'In stock' : 'Out'}
                    </button>
                  </TableCell>
                  <TableCell>
                    <span className='border border-border bg-muted/40 px-2 py-0.5 text-xs text-foreground'>
                      {product.category.name}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className='text-sm text-muted-foreground'>
                      {product.subcategory}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className='flex gap-1'>
                      <button
                        className='inline-flex h-8 w-8 items-center justify-center border border-border bg-card text-foreground transition-colors duration-200 ease-out hover:bg-muted cursor-pointer'
                        title='Edit'
                        type='button'
                        onClick={() => handleEditProduct(product)}
                      >
                        <Edit className='h-3.5 w-3.5' />
                      </button>
                      <button
                        className='inline-flex h-8 w-8 items-center justify-center border border-border bg-card text-red-600 transition-colors duration-200 ease-out hover:bg-muted dark:text-red-400 cursor-pointer'
                        title='Delete'
                        type='button'
                        onClick={() => handleDeleteProduct(product)}
                      >
                        <Trash2 className='h-3.5 w-3.5' />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className='flex flex-col gap-3 border-t border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
            <span>Show</span>
            <select
              aria-label='Rows per page'
              className='border border-border bg-background px-2 py-1.5 text-sm text-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground'
              value={itemsPerPage}
              onChange={e => {
                setItemsPerPage(parseInt(e.target.value, 10))
                setCurrentPage(1)
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>per page</span>
          </div>

          <div className='text-sm text-muted-foreground'>
            Showing{' '}
            <span className='font-medium tabular-nums text-foreground'>
              {pagination ? (currentPage - 1) * itemsPerPage + 1 : 0}
            </span>{' '}
            –{' '}
            <span className='font-medium tabular-nums text-foreground'>
              {pagination
                ? Math.min(currentPage * itemsPerPage, pagination.total)
                : 0}
            </span>{' '}
            of{' '}
            <span className='font-medium tabular-nums text-foreground'>
              {pagination?.total || 0}
            </span>
          </div>

          <div className='flex items-center gap-1'>
            <button
              aria-label='Previous page'
              className='inline-flex h-9 w-9 items-center justify-center border border-border bg-card text-foreground transition-colors duration-200 ease-out hover:bg-muted disabled:opacity-50'
              disabled={currentPage === 1 || isLoading}
              type='button'
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            >
              <ChevronLeft className='h-4 w-4' />
            </button>
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
              ).map(pageNum => (
                <button
                  key={pageNum}
                  className={`inline-flex h-9 min-w-9 items-center justify-center border px-2 text-sm font-medium transition-colors duration-200 ease-out disabled:opacity-50 ${
                    currentPage === pageNum
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-foreground hover:bg-muted'
                  }`}
                  disabled={isLoading}
                  type='button'
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              ))}
            <button
              aria-label='Next page'
              className='inline-flex h-9 w-9 items-center justify-center border border-border bg-card text-foreground transition-colors duration-200 ease-out hover:bg-muted disabled:opacity-50'
              disabled={
                !pagination ||
                currentPage === pagination.totalPages ||
                isLoading
              }
              type='button'
              onClick={() =>
                setCurrentPage(p =>
                  pagination ? Math.min(pagination.totalPages, p + 1) : p,
                )
              }
            >
              <ChevronRight className='h-4 w-4' />
            </button>
          </div>
        </div>
      </div>

      <BulkUpdateModal
        bulkUpdateData={bulkUpdateData}
        categories={categories}
        isOpen={isBulkModalOpen}
        selectedCount={selectedProducts.length}
        setBulkUpdateData={setBulkUpdateData}
        onOpenChange={onBulkModalOpenChange}
        onUpdate={handleBulkUpdate}
      />

      <BulkDeleteModal
        isOpen={isDeleteModalOpen}
        selectedCount={selectedProducts.length}
        onDelete={handleBulkDelete}
        onOpenChange={onDeleteModalOpenChange}
      />

      <EditProductModal
        categories={categories}
        editProductData={editProductData}
        editingProduct={editingProduct}
        isOpen={isEditModalOpen}
        manufacturers={manufacturers}
        setEditProductData={setEditProductData}
        onOpenChange={onEditModalOpenChange}
        onSave={handleSaveEdit}
      />

      <DeleteSingleModal
        isOpen={isDeleteSingleModalOpen}
        product={productToDelete}
        onConfirm={handleConfirmDelete}
        onOpenChange={onDeleteSingleModalOpenChange}
      />

      <AddProductModal
        categories={categories}
        isOpen={isAddModalOpen}
        manufacturers={manufacturers}
        newProductData={newProductData}
        setNewProductData={setNewProductData}
        onOpenChange={onAddModalOpenChange}
        onSave={handleSaveNewProduct}
      />
    </div>
  )
}
