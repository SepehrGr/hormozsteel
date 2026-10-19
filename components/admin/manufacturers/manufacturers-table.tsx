'use client'

import type { ManufacturerFormValues } from '@/lib/schemas/manufacturer'

import { useState } from 'react'
import { Factory, Globe, Mail, Phone } from 'lucide-react'

import {
  deleteManufacturer,
  updateManufacturer,
} from '@/app/admin/manufacturers/actions'
import {
  type Column,
  actionsColumn,
  AdminTable,
  NameCell,
  RowActions,
} from '@/components/admin/admin-table'
import { ManufacturerFormDialog } from '@/components/admin/manufacturers/manufacturer-form-dialog'
import { DeleteDialog } from '@/components/ui/delete-dialog'
import { DialogScope } from '@/components/ui/dialog-scope'
import { pluralize } from '@/lib/format'

export interface ManufacturerRow {
  id: string
  name: string
  slug: string
  description: string | null
  logo: string | null
  website: string | null
  email: string | null
  phone: string | null
  address: string | null
  _count: { products: number }
}

/** A database row in the shape the manufacturer form holds (null → ''). */
function toFormValues(manufacturer: ManufacturerRow): ManufacturerFormValues {
  return {
    name: manufacturer.name,
    slug: manufacturer.slug,
    description: manufacturer.description ?? '',
    website: manufacturer.website ?? '',
    email: manufacturer.email ?? '',
    phone: manufacturer.phone ?? '',
    address: manufacturer.address ?? '',
  }
}

/** Manufacturers table; the browser owns which row is being edited or deleted. */
export function ManufacturersTable({
  manufacturers,
}: {
  manufacturers: ManufacturerRow[]
}) {
  const [editing, setEditing] = useState<ManufacturerRow | null>(null)
  const [deleting, setDeleting] = useState<ManufacturerRow | null>(null)

  const columns: Column<ManufacturerRow>[] = [
    {
      label: 'Manufacturer',
      narrow: 'title',
      cell: ({ name, description, logo }) => (
        <NameCell
          description={description}
          media={
            logo ? (
              // Logos are arbitrary external URLs, which next/image would need allow-listed
              // eslint-disable-next-line @next/next/no-img-element
              <img alt='' className='h-full w-full object-cover' src={logo} />
            ) : (
              <Factory aria-hidden className='h-4 w-4' />
            )
          }
          name={name}
        />
      ),
    },
    {
      label: 'Slug',
      cellClassName: 'font-mono text-xs text-muted-foreground',
      cell: manufacturer => manufacturer.slug,
    },
    {
      label: 'Contact',
      cell: manufacturer => <Contacts manufacturer={manufacturer} />,
    },
    {
      label: 'Products',
      className: 'text-center',
      cellClassName: 'tabular-nums text-foreground',
      cell: manufacturer => manufacturer._count.products,
    },
    actionsColumn(manufacturer => (
      <RowActions
        name={manufacturer.name}
        onDelete={() => setDeleting(manufacturer)}
        onEdit={() => setEditing(manufacturer)}
      />
    )),
  ]

  return (
    <>
      <AdminTable
        columns={columns}
        rowLabel={manufacturer => `Details of ${manufacturer.name}`}
        rows={manufacturers}
      />

      {editing ? (
        <DialogScope onClose={() => setEditing(null)}>
          <ManufacturerFormDialog
            action={values => updateManufacturer({ id: editing.id, values })}
            defaultValues={toFormValues(editing)}
            mode='edit'
          />
        </DialogScope>
      ) : null}
      {deleting ? (
        <DialogScope onClose={() => setDeleting(null)}>
          {/* Never blocked: Product.manufacturer is `onDelete: SetNull`. */}
          <DeleteDialog
            action={() => deleteManufacturer({ id: deleting.id })}
            name={deleting.name}
            noun='manufacturer'
          >
            {deleting._count.products > 0
              ? `${pluralize(deleting._count.products, 'product')} will lose their mill. They stay in the catalog with no manufacturer.`
              : null}
          </DeleteDialog>
        </DialogScope>
      ) : null}
    </>
  )
}

function Contacts({ manufacturer }: { manufacturer: ManufacturerRow }) {
  const { website, email, phone } = manufacturer
  const contacts = [
    website && {
      Icon: Globe,
      label: 'Website',
      text: website.replace(/^https?:\/\//, ''),
    },
    email && { Icon: Mail, label: 'Email', text: email },
    phone && { Icon: Phone, label: 'Phone', text: phone },
  ].filter(contact => !!contact)

  if (contacts.length === 0) {
    return <span className='text-xs text-muted-foreground'>—</span>
  }

  return (
    <ul className='flex flex-col gap-0.5 text-xs text-muted-foreground'>
      {contacts.map(({ Icon, label, text }) => (
        <li key={label} className='flex items-center gap-1.5'>
          <Icon aria-hidden className='h-3 w-3 shrink-0' />
          <span className='sr-only'>{label}: </span>
          <span className='max-w-[12rem] truncate'>{text}</span>
        </li>
      ))}
    </ul>
  )
}
