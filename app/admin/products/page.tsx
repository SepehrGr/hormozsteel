'use client'

import type { SortDescriptor } from '@heroui/table'
import type {
  BulkUpdateData,
  ProductFormData,
} from '@/components/admin/products/types'
import type { ProductDTO } from '@/types/products'

import { useState, useMemo, useEffect } from 'react'
import { useDisclosure } from '@heroui/modal'
import { addToast } from '@heroui/toast'
import { Package } from 'lucide-react'

import { useProducts, useCategories, useManufacturers } from '@/hooks/use-api'
import { useProductExcel } from '@/hooks/use-product-excel'
import { useProductMutations } from '@/hooks/use-product-mutations'
import HeaderActions from '@/components/admin/products/header-actions'
import StatsCards from '@/components/admin/products/stats-cards'
import Filters from '@/components/admin/products/filters'
import ProductsTable from '@/components/admin/products/products-table'
import Pagination from '@/components/admin/products/pagination'
import { emptyProductForm } from '@/components/admin/products/types'
import {
  BulkUpdateModal,
  BulkDeleteModal,
  DeleteSingleModal,
  EditProductModal,
  AddProductModal,
} from '@/components/admin/products/modals'

/** Sort key for a product, comparable within its own column. */
function sortValue(product: ProductDTO, column: string): string | number {
  switch (column) {
    case 'name':
      return product.name.toLowerCase()
    case 'brand':
      return (product.brand || '').toLowerCase()
    case 'size':
      return product.size?.toLowerCase() || ''
    case 'price':
      return product.price
    case 'inStock':
      return product.inStock ? 1 : 0
    case 'category':
      return product.category?.name.toLowerCase() || ''
    case 'subcategory':
      return product.subcategory?.toLowerCase() || ''
    case 'createdAt':
      return new Date(product.createdAt ?? 0).getTime()
    default:
      return 0
  }
}

function compare(a: string | number, b: string | number) {
  return typeof a === 'number' && typeof b === 'number'
    ? a - b
    : String(a).localeCompare(String(b))
}

/** Strip UI-only sentinels before sending a form to the API. */
function toProductPayload(data: ProductFormData) {
  const manufacturerId =
    data.manufacturerId && data.manufacturerId !== '__custom__'
      ? data.manufacturerId
      : undefined

  return {
    ...data,
    manufacturerId,
    brand: data.brand?.trim() || undefined,
  }
}

/** Toasts and returns false when a required field is missing. */
function isFormValid(data: ProductFormData) {
  const hasMill =
    (data.manufacturerId && data.manufacturerId !== '__custom__') ||
    data.brand?.trim()

  if (data.name && hasMill && data.categoryId && data.subcategory) return true

  addToast({
    title: 'Validation',
    description: 'Name, mill, category, and sub-line are required',
    color: 'warning',
  })

  return false
}

export default function AdminProducts() {
  const { fileInputRef, exportProducts, handleFileImport, handleImportClick } =
    useProductExcel()

  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [searchQuery, setSearchQuery] = useState('') // debounced, sent to the API
  const [categoryFilter, setCategoryFilter] = useState('')
  const [stockFilter, setStockFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [bulkUpdateData, setBulkUpdateData] = useState<BulkUpdateData>({})
  const [editingProduct, setEditingProduct] = useState<ProductDTO | null>(null)
  const [editProductData, setEditProductData] =
    useState<ProductFormData>(emptyProductForm)
  const [newProductData, setNewProductData] =
    useState<ProductFormData>(emptyProductForm)
  const [productToDelete, setProductToDelete] = useState<ProductDTO | null>(
    null,
  )
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: 'createdAt',
    direction: 'descending',
  })

  // Debounce searchTerm -> searchQuery to auto-run search while typing
  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchTerm), 800)

    return () => clearTimeout(t)
  }, [searchTerm])

  // Filters shrink the result set — don't keep requesting a page that no longer exists
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, categoryFilter, stockFilter])

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

  const {
    bulkUpdate,
    bulkDelete,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useProductMutations(mutateProducts)

  const sortedProducts = useMemo(() => {
    const column = String(sortDescriptor.column)
    const direction = sortDescriptor.direction === 'ascending' ? 1 : -1

    return [...products].sort(
      (a: ProductDTO, b: ProductDTO) =>
        compare(sortValue(a, column), sortValue(b, column)) * direction,
    )
  }, [products, sortDescriptor])

  const handleSelectAll = (checked: boolean) => {
    setSelectedProducts(
      checked ? sortedProducts.map((p: ProductDTO) => p.id) : [],
    )
  }

  const handleSelectProduct = (productId: string, checked: boolean) => {
    setSelectedProducts(prev =>
      checked ? [...prev, productId] : prev.filter(id => id !== productId),
    )
  }

  const handleBulkUpdate = async () => {
    if (selectedProducts.length === 0) return

    if (await bulkUpdate(selectedProducts, bulkUpdateData)) {
      setSelectedProducts([])
      setBulkUpdateData({})
      onBulkModalOpenChange()
    }
  }

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return

    if (await bulkDelete(selectedProducts)) {
      setSelectedProducts([])
      onDeleteModalOpenChange()
    }
  }

  const handleEditProduct = (product: ProductDTO) => {
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
      weight: product.weightKg ?? undefined,
    })
    onEditModalOpen()
  }

  const handleSaveEdit = async () => {
    if (!editingProduct || !isFormValid(editProductData)) return

    if (
      await updateProduct(editingProduct.id, toProductPayload(editProductData))
    ) {
      setEditingProduct(null)
      onEditModalOpenChange()
    }
  }

  const handleDeleteProduct = (product: ProductDTO) => {
    setProductToDelete(product)
    onDeleteSingleModalOpen()
  }

  const handleConfirmDelete = async () => {
    if (!productToDelete) return

    const deletedId = productToDelete.id

    if (await deleteProduct(deletedId)) {
      setSelectedProducts(prev => prev.filter(id => id !== deletedId))
      setProductToDelete(null)
      onDeleteSingleModalOpenChange()
    }
  }

  const handleAddProduct = () => {
    setNewProductData(emptyProductForm)
    onAddModalOpen()
  }

  const handleSaveNewProduct = async () => {
    if (!isFormValid(newProductData)) return

    if (await createProduct(toProductPayload(newProductData))) {
      setNewProductData(emptyProductForm)
      onAddModalOpenChange()
    }
  }

  const handlePriceSave = (product: ProductDTO, price: number) =>
    updateProduct(product.id, { price }, 'Unit price saved')

  const handleStockToggle = (product: ProductDTO) =>
    updateProduct(
      product.id,
      { inStock: !product.inStock },
      product.inStock ? 'Marked out of stock' : 'Marked in stock',
    )

  // Export ignores pagination — same filters, one page big enough to hold everything
  const handleExportAll = async () => {
    const params = new URLSearchParams({ page: '1', limit: '1000000' })

    if (searchQuery) params.set('search', searchQuery)
    if (categoryFilter) params.set('category', categoryFilter)
    if (stockFilter) params.set('inStock', stockFilter)
    if (sortDescriptor.column) {
      params.set('sortBy', String(sortDescriptor.column))
      params.set(
        'sortOrder',
        sortDescriptor.direction === 'ascending' ? 'asc' : 'desc',
      )
    }

    try {
      const res = await fetch(`/api/products?${params}`)
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

        <ProductsTable
          isLoading={isLoading}
          products={sortedProducts}
          selectedIds={selectedProducts}
          sortDescriptor={sortDescriptor}
          onDelete={handleDeleteProduct}
          onEdit={handleEditProduct}
          onPriceSave={handlePriceSave}
          onSelect={handleSelectProduct}
          onSelectAll={handleSelectAll}
          onSortChange={setSortDescriptor}
          onStockToggle={handleStockToggle}
        />

        <Pagination
          isLoading={isLoading}
          itemsPerPage={itemsPerPage}
          page={currentPage}
          pagination={pagination}
          onItemsPerPageChange={value => {
            setItemsPerPage(value)
            setCurrentPage(1)
          }}
          onPageChange={setCurrentPage}
        />
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
