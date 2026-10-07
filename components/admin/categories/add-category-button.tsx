'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'

import { createCategory } from '@/app/admin/categories/actions'
import { CategoryFormDialog } from '@/components/admin/categories/category-form-dialog'
import { Button } from '@/components/ui/button'

export function AddCategoryButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus aria-hidden className='h-4 w-4' />
        Add category
      </Button>
      {open ? (
        <CategoryFormDialog
          mode='create'
          onClose={() => setOpen(false)}
          onSubmit={createCategory}
        />
      ) : null}
    </>
  )
}
