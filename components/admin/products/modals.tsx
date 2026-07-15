import React, { Fragment } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@heroui/modal'
import { Button } from '@heroui/button'
import { Input } from '@heroui/input'
import { Switch } from '@heroui/switch'
import { Divider } from '@heroui/divider'
import { Chip } from '@heroui/chip'
import { Listbox, Transition } from '@headlessui/react'
import {
  DollarSign,
  Edit,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  AlertCircle,
  Package,
  Tag,
  Ruler,
  Layers,
  CheckCircle2,
  X,
  ChevronDown,
  Check,
} from 'lucide-react'

export function BulkUpdateModal({
  isOpen,
  onOpenChange,
  selectedCount,
  bulkUpdateData,
  setBulkUpdateData,
  categories,
  onUpdate,
}: any) {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size='2xl'
      backdrop='blur'
      classNames={{
        backdrop:
          'bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20',
      }}
    >
      <ModalContent>
        {(onClose: any) => (
          <>
            <ModalHeader className='flex flex-col gap-1 pb-4 border-b border-divider'>
              <div className='flex items-center gap-3'>
                <div className='p-2 rounded-lg bg-primary/10'>
                  <Edit className='w-5 h-5 text-primary' />
                </div>
                <div>
                  <h3 className='text-xl font-bold'>ویرایش گروهی محصولات</h3>
                  <p className='text-sm font-normal text-default-500'>
                    {selectedCount} محصول انتخاب شده
                  </p>
                </div>
              </div>
            </ModalHeader>
            <ModalBody className='py-6'>
              <div className='space-y-5'>
                {/* Price Section */}
                <div className='space-y-2'>
                  <label className='flex items-center gap-2 text-sm font-semibold text-foreground'>
                    <DollarSign className='w-4 h-4 text-success' />
                    قیمت جدید (تومان)
                  </label>
                  <Input
                    type='number'
                    placeholder='قیمت جدید را وارد کنید'
                    value={bulkUpdateData.price?.toString() || ''}
                    onChange={(e: any) =>
                      setBulkUpdateData({
                        ...bulkUpdateData,
                        price: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      })
                    }
                    variant='bordered'
                    size='lg'
                    startContent={
                      <DollarSign className='w-4 h-4 text-default-400' />
                    }
                    classNames={{
                      input: 'text-lg',
                      inputWrapper: 'border-default-200 hover:border-primary',
                    }}
                  />
                </div>

                <Divider />

                {/* Stock Status Section */}
                <div className='space-y-3'>
                  <label className='flex items-center gap-2 text-sm font-semibold text-foreground'>
                    <Package className='w-4 h-4 text-warning' />
                    وضعیت موجودی
                  </label>
                  <div className='flex gap-3'>
                    <Button
                      variant={
                        bulkUpdateData.inStock === true ? 'solid' : 'bordered'
                      }
                      color={
                        bulkUpdateData.inStock === true ? 'success' : 'default'
                      }
                      className='flex-1'
                      startContent={<Eye className='w-4 h-4' />}
                      onPress={() =>
                        setBulkUpdateData({ ...bulkUpdateData, inStock: true })
                      }
                    >
                      موجود
                    </Button>
                    <Button
                      variant={
                        bulkUpdateData.inStock === false ? 'solid' : 'bordered'
                      }
                      color={
                        bulkUpdateData.inStock === false ? 'danger' : 'default'
                      }
                      className='flex-1'
                      onPress={() =>
                        setBulkUpdateData({ ...bulkUpdateData, inStock: false })
                      }
                    >
                      ناموجود
                    </Button>
                    <Button
                      variant={
                        bulkUpdateData.inStock === undefined
                          ? 'solid'
                          : 'bordered'
                      }
                      color={
                        bulkUpdateData.inStock === undefined
                          ? 'primary'
                          : 'default'
                      }
                      className='flex-1'
                      startContent={<X className='w-4 h-4' />}
                      onPress={() =>
                        setBulkUpdateData({
                          ...bulkUpdateData,
                          inStock: undefined,
                        })
                      }
                    >
                      بدون تغییر
                    </Button>
                  </div>
                </div>

                <Divider />

                {/* Category Section */}
                <div className='space-y-2'>
                  <label className='flex items-center gap-2 text-sm font-semibold text-foreground'>
                    <Layers className='w-4 h-4 text-secondary' />
                    دسته‌بندی
                  </label>
                  <Listbox
                    value={bulkUpdateData.categoryId || ''}
                    onChange={(value: string) => {
                      setBulkUpdateData({
                        ...bulkUpdateData,
                        categoryId: value || undefined,
                      })
                    }}
                  >
                    <div className='relative'>
                      <Listbox.Button className='relative w-full py-3 pl-10 pr-3 text-right transition-colors bg-transparent border-2 rounded-lg cursor-pointer border-default-200 hover:border-primary'>
                        <span className='block truncate text-foreground'>
                          {bulkUpdateData.categoryId
                            ? categories?.find(
                                (cat: any) =>
                                  cat.id === bulkUpdateData.categoryId,
                              )?.name || 'انتخاب دسته‌بندی'
                            : 'انتخاب دسته‌بندی'}
                        </span>
                        <span className='absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none'>
                          <ChevronDown
                            className='w-5 h-5 text-default-400'
                            aria-hidden='true'
                          />
                        </span>
                      </Listbox.Button>
                      <Transition
                        as={Fragment}
                        leave='transition ease-in duration-100'
                        leaveFrom='opacity-100'
                        leaveTo='opacity-0'
                      >
                        <Listbox.Options className='absolute z-50 w-full py-1 mt-1 overflow-auto border rounded-lg shadow-lg max-h-44 bg-content1 border-divider'>
                          {categories?.map((category: any) => (
                            <Listbox.Option
                              key={category.id}
                              value={category.id}
                              className={({ active }) =>
                                `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                  active
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-foreground'
                                }`
                              }
                            >
                              {({ selected, active }) => (
                                <>
                                  <span
                                    className={`absolute inset-y-0 left-0 flex items-center pl-3 text-primary ${selected ? '' : 'opacity-0'}`}
                                  >
                                    <Check
                                      className='w-5 h-5'
                                      aria-hidden='true'
                                    />
                                  </span>
                                  <span
                                    className={`block truncate pl-10 ${selected ? 'font-medium' : 'font-normal'}`}
                                  >
                                    {category.name}
                                  </span>
                                </>
                              )}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </Transition>
                    </div>
                  </Listbox>
                </div>

                {/* Info Banner */}
                <div className='flex items-start gap-3 p-4 border rounded-lg bg-primary/5 border-primary/20'>
                  <AlertCircle className='w-5 h-5 text-primary mt-0.5 flex-shrink-0' />
                  <div className='text-sm text-default-700'>
                    <p className='mb-1 font-semibold'>توجه:</p>
                    <p>
                      فقط فیلدهایی که مقدار دارند، برای محصولات انتخاب شده
                      به‌روزرسانی خواهند شد.
                    </p>
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter className='pt-4 border-t border-divider'>
              <Button variant='light' onPress={onClose} size='lg'>
                انصراف
              </Button>
              <Button
                color='primary'
                onPress={onUpdate}
                size='lg'
                startContent={<CheckCircle2 className='w-4 h-4' />}
              >
                اعمال تغییرات
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

export function BulkDeleteModal({
  isOpen,
  onOpenChange,
  selectedCount,
  onDelete,
}: any) {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      backdrop='blur'
      classNames={{
        backdrop:
          'bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20',
      }}
    >
      <ModalContent>
        {(onClose: any) => (
          <>
            <ModalHeader className='flex flex-col gap-1 pb-4 border-b border-divider'>
              <div className='flex items-center gap-3'>
                <div className='p-2 rounded-lg bg-danger/10'>
                  <Trash2 className='w-5 h-5 text-danger' />
                </div>
                <div>
                  <h3 className='text-xl font-bold'>حذف گروهی محصولات</h3>
                  <p className='text-sm font-normal text-default-500'>
                    تأیید حذف دسته‌جمعی
                  </p>
                </div>
              </div>
            </ModalHeader>
            <ModalBody className='py-6'>
              <div className='space-y-4'>
                <div className='flex items-center justify-center p-6 rounded-lg bg-danger/5'>
                  <div className='space-y-3 text-center'>
                    <div className='flex justify-center'>
                      <div className='p-3 rounded-full bg-danger/10'>
                        <AlertCircle className='w-8 h-8 text-danger' />
                      </div>
                    </div>
                    <p className='text-lg'>
                      آیا از حذف{' '}
                      <span className='font-extrabold'>
                        {selectedCount} محصول
                      </span>{' '}
                      مطمئن هستید؟
                    </p>
                    <p className='text-sm text-default-500'>
                      این عمل قابل بازگشت نیست و تمام اطلاعات محصولات حذف خواهند
                      شد.
                    </p>
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter className='pt-4 border-t border-divider'>
              <Button variant='light' onPress={onClose} size='lg'>
                انصراف
              </Button>
              <Button
                color='danger'
                onPress={onDelete}
                size='lg'
                startContent={<Trash2 className='w-4 h-4' />}
              >
                حذف محصولات
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

export function DeleteSingleModal({
  isOpen,
  onOpenChange,
  product,
  onConfirm,
}: any) {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      backdrop='blur'
      classNames={{
        backdrop:
          'bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20',
      }}
    >
      <ModalContent>
        {(onClose: any) => (
          <>
            <ModalHeader className='flex flex-col gap-1 pb-4 border-b border-divider'>
              <div className='flex items-center gap-3'>
                <div className='p-2 rounded-lg bg-danger/10'>
                  <Trash2 className='w-5 h-5 text-danger' />
                </div>
                <div>
                  <h3 className='text-xl font-bold'>حذف محصول</h3>
                  <p className='text-sm font-normal text-default-500'>
                    تأیید حذف محصول
                  </p>
                </div>
              </div>
            </ModalHeader>
            <ModalBody className='py-6'>
              <div className='space-y-4'>
                <div className='p-5 border rounded-lg bg-danger/5 border-danger/20'>
                  <div className='flex items-start gap-3'>
                    <AlertCircle className='w-5 h-5 text-danger mt-0.5 flex-shrink-0' />
                    <div className='space-y-2'>
                      <p className='font-semibold text-foreground'>
                        در حال حذف محصول:
                      </p>
                      <Chip
                        color='primary'
                        variant='flat'
                        size='lg'
                        startContent={<Package className='w-4 h-4' />}
                      >
                        {product?.name}
                      </Chip>
                      <p className='mt-3 text-sm text-default-500'>
                        این عمل قابل بازگشت نیست. تمام اطلاعات مربوط به این
                        محصول به طور کامل حذف خواهد شد.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter className='pt-4 border-t border-divider'>
              <Button variant='light' onPress={onClose} size='lg'>
                انصراف
              </Button>
              <Button
                color='danger'
                onPress={onConfirm}
                size='lg'
                startContent={<Trash2 className='w-4 h-4' />}
              >
                حذف قطعی
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

export function EditProductModal({
  isOpen,
  onOpenChange,
  editingProduct,
  editProductData,
  setEditProductData,
  categories,
  onSave,
}: any) {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size='3xl'
      scrollBehavior='inside'
      backdrop='blur'
      classNames={{
        backdrop:
          'bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20',
      }}
    >
      <ModalContent>
        {(onClose: any) => (
          <>
            <ModalHeader className='flex flex-col gap-1 pb-4 border-b border-divider'>
              <div className='flex items-center gap-3'>
                <div className='p-2 rounded-lg bg-primary/10'>
                  <Edit className='w-5 h-5 text-primary' />
                </div>
                <div>
                  <h3 className='text-xl font-bold'>ویرایش محصول</h3>
                  <p className='text-sm font-normal text-default-500'>
                    ویرایش اطلاعات "{editingProduct?.name}"
                  </p>
                </div>
              </div>
            </ModalHeader>
            <ModalBody className='py-6'>
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                {/* Product Name */}
                <div className='space-y-2'>
                  <label className='flex items-center gap-2 text-sm font-semibold text-foreground'>
                    <Package className='w-4 h-4 text-primary' />
                    نام محصول <span className='text-danger'>*</span>
                  </label>
                  <Input
                    value={editProductData.name}
                    onChange={(e: any) =>
                      setEditProductData({
                        ...editProductData,
                        name: e.target.value,
                      })
                    }
                    placeholder='نام محصول را وارد کنید'
                    variant='bordered'
                    size='lg'
                    isRequired
                    classNames={{
                      inputWrapper: 'border-default-200 hover:border-primary',
                    }}
                  />
                </div>

                {/* Brand */}
                <div className='space-y-2'>
                  <label className='flex items-center gap-2 text-sm font-semibold text-foreground'>
                    <Tag className='w-4 h-4 text-secondary' />
                    برند <span className='text-danger'>*</span>
                  </label>
                  <Input
                    value={editProductData.brand}
                    onChange={(e: any) =>
                      setEditProductData({
                        ...editProductData,
                        brand: e.target.value,
                      })
                    }
                    placeholder='نام برند را وارد کنید'
                    variant='bordered'
                    size='lg'
                    isRequired
                    classNames={{
                      inputWrapper: 'border-default-200 hover:border-primary',
                    }}
                  />
                </div>

                {/* Size */}
                <div className='space-y-2'>
                  <label className='flex items-center gap-2 text-sm font-semibold text-foreground'>
                    <Ruler className='w-4 h-4 text-warning' />
                    سایز <span className='text-danger'>*</span>
                  </label>
                  <Input
                    value={editProductData.size}
                    onChange={(e: any) =>
                      setEditProductData({
                        ...editProductData,
                        size: e.target.value,
                      })
                    }
                    placeholder='مثال: 12، 16، 20'
                    variant='bordered'
                    size='lg'
                    isRequired
                    classNames={{
                      inputWrapper: 'border-default-200 hover:border-primary',
                    }}
                  />
                </div>

                {/* Weight */}
                <div className='space-y-2'>
                  <label className='flex items-center gap-2 text-sm font-semibold text-foreground'>
                    <Ruler className='w-4 h-4 text-info' />
                    وزن
                  </label>
                  <Input
                    type='number'
                    value={editProductData.weight?.toString() || ''}
                    onChange={(e: any) =>
                      setEditProductData({
                        ...editProductData,
                        weight: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      })
                    }
                    placeholder='وزن را وارد کنید (بر حسب kg یا ton)'
                    variant='bordered'
                    size='lg'
                    step='0.1'
                    classNames={{
                      inputWrapper: 'border-default-200 hover:border-primary',
                    }}
                  />
                </div>
                <div className='space-y-2'>
                  <label className='flex items-center gap-2 text-sm font-semibold text-foreground'>
                    <DollarSign className='w-4 h-4 text-success' />
                    قیمت (تومان) <span className='text-danger'>*</span>
                  </label>
                  <Input
                    type='number'
                    value={editProductData.price.toString()}
                    onChange={(e: any) =>
                      setEditProductData({
                        ...editProductData,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder='قیمت را وارد کنید'
                    variant='bordered'
                    size='lg'
                    isRequired
                    startContent={
                      <DollarSign className='w-4 h-4 text-default-400' />
                    }
                    classNames={{
                      inputWrapper: 'border-default-200 hover:border-primary',
                    }}
                  />
                </div>

                {/* Category */}
                <div className='space-y-2'>
                  <label className='flex items-center gap-2 text-sm font-semibold text-foreground'>
                    <Layers className='w-4 h-4 text-secondary' />
                    دسته‌بندی <span className='text-danger'>*</span>
                  </label>
                  <Listbox
                    value={editProductData.categoryId}
                    onChange={(value: string) => {
                      setEditProductData({
                        ...editProductData,
                        categoryId: value,
                        subcategory: '',
                      })
                    }}
                  >
                    <div className='relative'>
                      <Listbox.Button className='relative w-full py-3 pl-10 pr-3 text-right transition-colors bg-transparent border-2 rounded-lg cursor-pointer border-default-200 hover:border-primary'>
                        <span className='block truncate text-foreground'>
                          {editProductData.categoryId
                            ? categories?.find(
                                (cat: any) =>
                                  cat.id === editProductData.categoryId,
                              )?.name || 'دسته‌بندی را انتخاب کنید'
                            : 'دسته‌بندی را انتخاب کنید'}
                        </span>
                        <span className='absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none'>
                          <ChevronDown
                            className='w-5 h-5 text-default-400'
                            aria-hidden='true'
                          />
                        </span>
                      </Listbox.Button>
                      <Transition
                        as={Fragment}
                        leave='transition ease-in duration-100'
                        leaveFrom='opacity-100'
                        leaveTo='opacity-0'
                      >
                        <Listbox.Options className='absolute z-50 w-full py-1 mt-1 overflow-auto border rounded-lg shadow-lg max-h-44 bg-content1 border-divider'>
                          {categories?.map((category: any) => (
                            <Listbox.Option
                              key={category.id}
                              value={category.id}
                              className={({ active }) =>
                                `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                  active
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-foreground'
                                }`
                              }
                            >
                              {({ selected }) => (
                                <>
                                  <span
                                    className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}
                                  >
                                    {category.name}
                                  </span>
                                  {selected && (
                                    <span className='absolute inset-y-0 right-0 flex items-center pr-3 text-primary'>
                                      <Check
                                        className='w-5 h-5'
                                        aria-hidden='true'
                                      />
                                    </span>
                                  )}
                                </>
                              )}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </Transition>
                    </div>
                  </Listbox>
                </div>

                {/* Subcategory */}
                <div className='space-y-2'>
                  <label className='flex items-center gap-2 text-sm font-semibold text-foreground'>
                    <Layers className='w-4 h-4 text-secondary' />
                    زیر دسته‌بندی <span className='text-danger'>*</span>
                  </label>
                  <Listbox
                    value={editProductData.subcategory}
                    onChange={(value: string) => {
                      setEditProductData({
                        ...editProductData,
                        subcategory: value,
                      })
                    }}
                    disabled={!editProductData.categoryId}
                  >
                    <div className='relative'>
                      <Listbox.Button
                        className={`relative w-full cursor-pointer rounded-lg border-2 border-default-200 bg-transparent py-3 pl-10 pr-3 text-right transition-colors ${
                          !editProductData.categoryId
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:border-primary'
                        }`}
                      >
                        <span className='block truncate text-foreground'>
                          {editProductData.subcategory ||
                            (editProductData.categoryId
                              ? 'انتخاب کنید'
                              : 'ابتدا دسته‌بندی را انتخاب کنید')}
                        </span>
                        <span className='absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none'>
                          <ChevronDown
                            className='w-5 h-5 text-default-400'
                            aria-hidden='true'
                          />
                        </span>
                      </Listbox.Button>
                      {editProductData.categoryId && (
                        <Transition
                          as={Fragment}
                          leave='transition ease-in duration-100'
                          leaveFrom='opacity-100'
                          leaveTo='opacity-0'
                        >
                          <Listbox.Options className='absolute z-50 w-full py-1 mt-1 overflow-auto border rounded-lg shadow-lg max-h-44 bg-content1 border-divider'>
                            {categories
                              ?.find(
                                (cat: any) =>
                                  cat.id === editProductData.categoryId,
                              )
                              ?.subcategories?.map((subcategory: string) => (
                                <Listbox.Option
                                  key={subcategory}
                                  value={subcategory}
                                  className={({ active }) =>
                                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                      active
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-foreground'
                                    }`
                                  }
                                >
                                  {({ selected }) => (
                                    <>
                                      <span
                                        className={`absolute inset-y-0 left-0 flex items-center pl-3 text-primary ${selected ? '' : 'opacity-0'}`}
                                      >
                                        <Check
                                          className='w-5 h-5'
                                          aria-hidden='true'
                                        />
                                      </span>
                                      <span
                                        className={`block truncate pl-10 ${selected ? 'font-medium' : 'font-normal'}`}
                                      >
                                        {subcategory}
                                      </span>
                                    </>
                                  )}
                                </Listbox.Option>
                              )) || []}
                          </Listbox.Options>
                        </Transition>
                      )}
                    </div>
                  </Listbox>
                </div>

                {/* Stock Status */}
                <div className='space-y-3 md:col-span-2'>
                  <label className='flex items-center gap-2 text-sm font-semibold text-foreground'>
                    <Package className='w-4 h-4 text-warning' />
                    وضعیت موجودی
                  </label>
                  <div className='flex gap-3'>
                    <Button
                      variant={
                        editProductData.inStock === true ? 'solid' : 'bordered'
                      }
                      color={
                        editProductData.inStock === true ? 'success' : 'default'
                      }
                      className='flex-1'
                      size='lg'
                      onPress={() =>
                        setEditProductData({
                          ...editProductData,
                          inStock: true,
                        })
                      }
                    >
                      موجود
                    </Button>
                    <Button
                      variant={
                        editProductData.inStock === false ? 'solid' : 'bordered'
                      }
                      color={
                        editProductData.inStock === false ? 'danger' : 'default'
                      }
                      className='flex-1'
                      size='lg'
                      onPress={() =>
                        setEditProductData({
                          ...editProductData,
                          inStock: false,
                        })
                      }
                    >
                      ناموجود
                    </Button>
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter className='pt-4 border-t border-divider'>
              <Button variant='light' onPress={onClose} size='lg'>
                انصراف
              </Button>
              <Button
                color='primary'
                onPress={onSave}
                size='lg'
                startContent={<CheckCircle2 className='w-4 h-4' />}
              >
                ذخیره تغییرات
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

export function AddProductModal({
  isOpen,
  onOpenChange,
  newProductData,
  setNewProductData,
  categories,
  onSave,
}: any) {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size='3xl'
      scrollBehavior='inside'
      backdrop='blur'
      classNames={{
        backdrop:
          'bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20',
      }}
    >
      <ModalContent>
        {(onClose: any) => (
          <>
            <ModalHeader className='flex flex-col gap-1 pb-4 border-b border-divider'>
              <div className='flex items-center gap-3'>
                <div className='p-2 rounded-lg bg-success/10'>
                  <Plus className='w-5 h-5 text-success' />
                </div>
                <div>
                  <h3 className='text-xl font-bold'>افزودن محصول جدید</h3>
                  <p className='text-sm font-normal text-default-500'>
                    اطلاعات محصول را با دقت وارد کنید
                  </p>
                </div>
              </div>
            </ModalHeader>
            <ModalBody className='py-6'>
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                {/* Product Name */}
                <div className='space-y-2'>
                  <label className='flex items-center gap-2 text-sm font-semibold text-foreground'>
                    نام محصول <span className='text-danger'>*</span>
                  </label>
                  <Input
                    placeholder='نام محصول را وارد کنید'
                    value={newProductData.name}
                    onChange={(e: any) =>
                      setNewProductData({
                        ...newProductData,
                        name: e.target.value,
                      })
                    }
                    variant='bordered'
                    size='lg'
                    isRequired
                    classNames={{
                      inputWrapper: 'border-default-200 hover:border-primary',
                    }}
                  />
                </div>

                {/* Brand */}
                <div className='space-y-2'>
                  <label className='flex items-center gap-2 text-sm font-semibold text-foreground'>
                    برند <span className='text-danger'>*</span>
                  </label>
                  <Input
                    placeholder='نام برند را وارد کنید'
                    value={newProductData.brand}
                    onChange={(e: any) =>
                      setNewProductData({
                        ...newProductData,
                        brand: e.target.value,
                      })
                    }
                    variant='bordered'
                    size='lg'
                    isRequired
                    classNames={{
                      inputWrapper: 'border-default-200 hover:border-primary',
                    }}
                  />
                </div>

                {/* Size */}
                <div className='space-y-2'>
                  <label className='flex items-center gap-2 text-sm font-semibold text-foreground'>
                    سایز <span className='text-danger'>*</span>
                  </label>
                  <Input
                    placeholder='مثال: 12، 16، 20'
                    value={newProductData.size}
                    onChange={(e: any) =>
                      setNewProductData({
                        ...newProductData,
                        size: e.target.value,
                      })
                    }
                    variant='bordered'
                    size='lg'
                    isRequired
                    classNames={{
                      inputWrapper: 'border-default-200 hover:border-primary',
                    }}
                  />
                </div>

                {/* Weight */}
                <div className='space-y-2'>
                  <label className='flex items-center gap-2 text-sm font-semibold text-foreground'>
                    وزن
                  </label>
                  <Input
                    type='number'
                    placeholder='وزن را وارد کنید'
                    value={newProductData.weight?.toString() || ''}
                    onChange={(e: any) =>
                      setNewProductData({
                        ...newProductData,
                        weight: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      })
                    }
                    variant='bordered'
                    size='lg'
                    step='0.1'
                    classNames={{
                      inputWrapper: 'border-default-200 hover:border-primary',
                    }}
                  />
                </div>
                <div className='space-y-2'>
                  <label className='flex items-center gap-2 text-sm font-semibold text-foreground'>
                    قیمت (تومان) <span className='text-danger'>*</span>
                  </label>
                  <Input
                    type='number'
                    placeholder='قیمت را وارد کنید'
                    value={newProductData.price.toString()}
                    onChange={(e: any) =>
                      setNewProductData({
                        ...newProductData,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    variant='bordered'
                    size='lg'
                    isRequired
                    classNames={{
                      inputWrapper: 'border-default-200 hover:border-primary',
                    }}
                  />
                </div>

                {/* Category */}
                <div className='space-y-2'>
                  <label className='flex items-center gap-2 text-sm font-semibold text-foreground'>
                    دسته‌بندی <span className='text-danger'>*</span>
                  </label>
                  <Listbox
                    value={newProductData.categoryId}
                    onChange={(value: string) => {
                      setNewProductData({
                        ...newProductData,
                        categoryId: value,
                        subcategory: '',
                      })
                    }}
                  >
                    <div className='relative'>
                      <Listbox.Button className='relative w-full py-3 pl-10 pr-3 text-right transition-colors bg-transparent border-2 rounded-lg cursor-pointer border-default-200 hover:border-primary'>
                        <span className='block truncate text-foreground'>
                          {newProductData.categoryId
                            ? categories?.find(
                                (cat: any) =>
                                  cat.id === newProductData.categoryId,
                              )?.name || 'دسته‌بندی را انتخاب کنید'
                            : 'دسته‌بندی را انتخاب کنید'}
                        </span>
                        <span className='absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none'>
                          <ChevronDown
                            className='w-5 h-5 text-default-400'
                            aria-hidden='true'
                          />
                        </span>
                      </Listbox.Button>
                      <Transition
                        as={Fragment}
                        leave='transition ease-in duration-100'
                        leaveFrom='opacity-100'
                        leaveTo='opacity-0'
                      >
                        <Listbox.Options className='absolute z-50 w-full py-1 mt-1 overflow-auto border rounded-lg shadow-lg max-h-55 bg-content1 border-divider'>
                          {categories?.map((category: any) => (
                            <Listbox.Option
                              key={category.id}
                              value={category.id}
                              className={({ active }) =>
                                `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                  active
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-foreground'
                                }`
                              }
                            >
                              {({ selected }) => (
                                <>
                                  <span
                                    className={`absolute inset-y-0 left-0 flex items-center pl-3 text-primary ${selected ? '' : 'opacity-0'}`}
                                  >
                                    <Check
                                      className='w-5 h-5'
                                      aria-hidden='true'
                                    />
                                  </span>
                                  <span
                                    className={`block truncate pl-10 ${selected ? 'font-medium' : 'font-normal'}`}
                                  >
                                    {category.name}
                                  </span>
                                </>
                              )}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </Transition>
                    </div>
                  </Listbox>
                </div>

                {/* Subcategory */}
                <div className='space-y-2'>
                  <label className='flex items-center gap-2 text-sm font-semibold text-foreground'>
                    زیر دسته‌بندی <span className='text-danger'>*</span>
                  </label>
                  <Listbox
                    value={newProductData.subcategory}
                    onChange={(value: string) => {
                      setNewProductData({
                        ...newProductData,
                        subcategory: value,
                      })
                    }}
                    disabled={!newProductData.categoryId}
                  >
                    <div className='relative'>
                      <Listbox.Button
                        className={`relative w-full cursor-pointer rounded-lg border-2 border-default-200 bg-transparent py-3 pl-10 pr-3 text-right transition-colors ${
                          !newProductData.categoryId
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:border-primary'
                        }`}
                      >
                        <span className='block truncate text-foreground'>
                          {newProductData.subcategory ||
                            (newProductData.categoryId
                              ? 'انتخاب کنید'
                              : 'ابتدا دسته‌بندی را انتخاب کنید')}
                        </span>
                        <span className='absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none'>
                          <ChevronDown
                            className='w-5 h-5 text-default-400'
                            aria-hidden='true'
                          />
                        </span>
                      </Listbox.Button>
                      {newProductData.categoryId && (
                        <Transition
                          as={Fragment}
                          leave='transition ease-in duration-100'
                          leaveFrom='opacity-100'
                          leaveTo='opacity-0'
                        >
                          <Listbox.Options className='absolute z-50 w-full py-1 mt-1 overflow-auto border rounded-lg shadow-lg max-h-55 bg-content1 border-divider'>
                            {categories
                              ?.find(
                                (cat: any) =>
                                  cat.id === newProductData.categoryId,
                              )
                              ?.subcategories?.map((subcategory: string) => (
                                <Listbox.Option
                                  key={subcategory}
                                  value={subcategory}
                                  className={({ active }) =>
                                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                      active
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-foreground'
                                    }`
                                  }
                                >
                                  {({ selected }) => (
                                    <>
                                      <span
                                        className={`absolute inset-y-0 left-0 flex items-center pl-3 text-primary ${selected ? '' : 'opacity-0'}`}
                                      >
                                        <Check
                                          className='w-5 h-5'
                                          aria-hidden='true'
                                        />
                                      </span>
                                      <span
                                        className={`block truncate pl-10 ${selected ? 'font-medium' : 'font-normal'}`}
                                      >
                                        {subcategory}
                                      </span>
                                    </>
                                  )}
                                </Listbox.Option>
                              )) || []}
                          </Listbox.Options>
                        </Transition>
                      )}
                    </div>
                  </Listbox>
                </div>

                {/* Stock Status */}
                <div className='space-y-3 md:col-span-2'>
                  <label className='flex items-center gap-2 text-sm font-semibold text-foreground'>
                    وضعیت موجودی
                  </label>
                  <div className='flex gap-3'>
                    <Button
                      variant={
                        newProductData.inStock === true ? 'solid' : 'bordered'
                      }
                      color={
                        newProductData.inStock === true ? 'success' : 'default'
                      }
                      className='flex-1'
                      size='lg'
                      onPress={() =>
                        setNewProductData({ ...newProductData, inStock: true })
                      }
                    >
                      موجود
                    </Button>
                    <Button
                      variant={
                        newProductData.inStock === false ? 'solid' : 'bordered'
                      }
                      color={
                        newProductData.inStock === false ? 'danger' : 'default'
                      }
                      className='flex-1'
                      size='lg'
                      onPress={() =>
                        setNewProductData({ ...newProductData, inStock: false })
                      }
                    >
                      ناموجود
                    </Button>
                  </div>
                </div>

                {/* Info Banner */}
                <div className='flex items-start gap-3 p-4 border rounded-lg md:col-span-2 bg-primary/5 border-primary/20'>
                  <AlertCircle className='w-5 h-5 text-primary mt-0.5 flex-shrink-0' />
                  <div className='text-sm text-default-700'>
                    <p className='mb-1 font-semibold'>نکته مهم:</p>
                    <p>
                      لطفاً تمام فیلدهای ستاره‌دار را با دقت تکمیل کنید. این
                      اطلاعات برای مدیریت صحیح محصولات ضروری است.
                    </p>
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter className='pt-4 border-t border-divider'>
              <Button variant='light' onPress={onClose} size='lg'>
                انصراف
              </Button>
              <Button
                color='success'
                onPress={onSave}
                size='lg'
                startContent={<Plus className='w-4 h-4' />}
              >
                افزودن محصول
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
