'use client'

import type { ManufacturerFormValues } from '@/lib/schemas/manufacturer'

import { useState } from 'react'
import { Factory, Globe, Mail, Pencil, Phone } from 'lucide-react'

import { updateManufacturer } from '@/app/admin/manufacturers/actions'
import { ManufacturerFormDialog } from '@/components/admin/manufacturers/manufacturer-form-dialog'
import { Button } from '@/components/ui/button'
import { DialogScope } from '@/components/ui/dialog-scope'

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

/** Manufacturers table; the browser owns which row is being edited. */
export function ManufacturersTable({
  manufacturers,
}: {
  manufacturers: ManufacturerRow[]
}) {
  const [editing, setEditing] = useState<ManufacturerRow | null>(null)

  return (
    <div className='overflow-x-auto'>
      <table className='w-full min-w-[720px] text-sm'>
        <thead>
          <tr className='border-b border-border bg-muted/50 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground'>
            <th className='px-4 py-2.5'>Manufacturer</th>
            <th className='px-4 py-2.5'>Slug</th>
            <th className='px-4 py-2.5'>Contact</th>
            <th className='px-4 py-2.5 text-center'>Products</th>
            <th className='px-4 py-2.5 text-right'>Actions</th>
          </tr>
        </thead>
        <tbody className='divide-y divide-border'>
          {manufacturers.map(manufacturer => (
            <ManufacturerTableRow
              key={manufacturer.id}
              manufacturer={manufacturer}
              onEdit={() => setEditing(manufacturer)}
            />
          ))}
        </tbody>
      </table>

      {editing ? (
        <DialogScope onClose={() => setEditing(null)}>
          <ManufacturerFormDialog
            action={values => updateManufacturer({ id: editing.id, values })}
            defaultValues={toFormValues(editing)}
            mode='edit'
          />
        </DialogScope>
      ) : null}
    </div>
  )
}

function ManufacturerTableRow({
  manufacturer,
  onEdit,
}: {
  manufacturer: ManufacturerRow
  onEdit: () => void
}) {
  const { name, slug, description, logo, website, email, phone } = manufacturer
  const contacts = [
    website && {
      Icon: Globe,
      label: 'Website',
      text: website.replace(/^https?:\/\//, ''),
    },
    email && { Icon: Mail, label: 'Email', text: email },
    phone && { Icon: Phone, label: 'Phone', text: phone },
  ].filter(contact => !!contact)

  return (
    <tr className='transition-colors duration-200 ease-out hover:bg-muted/40'>
      <td className='px-4 py-3'>
        <div className='flex items-center gap-3'>
          {logo ? (
            // Logos are arbitrary external URLs, which next/image would need allow-listed
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt=''
              className='h-9 w-9 border border-border object-cover'
              src={logo}
            />
          ) : (
            <span className='flex h-9 w-9 shrink-0 items-center justify-center border border-border bg-muted/50 text-muted-foreground'>
              <Factory aria-hidden className='h-4 w-4' />
            </span>
          )}
          <div className='min-w-0'>
            <p className='font-medium text-foreground'>{name}</p>
            {description ? (
              <p className='mt-0.5 line-clamp-1 text-xs text-muted-foreground'>
                {description}
              </p>
            ) : null}
          </div>
        </div>
      </td>
      <td className='px-4 py-3 font-mono text-xs text-muted-foreground'>
        {slug}
      </td>
      <td className='px-4 py-3'>
        {contacts.length > 0 ? (
          <ul className='flex flex-col gap-0.5 text-xs text-muted-foreground'>
            {contacts.map(({ Icon, label, text }) => (
              <li key={label} className='flex items-center gap-1.5'>
                <Icon aria-hidden className='h-3 w-3 shrink-0' />
                <span className='sr-only'>{label}: </span>
                <span className='max-w-[12rem] truncate'>{text}</span>
              </li>
            ))}
          </ul>
        ) : (
          <span className='text-xs text-muted-foreground'>—</span>
        )}
      </td>
      <td className='px-4 py-3 text-center tabular-nums text-foreground'>
        {manufacturer._count.products}
      </td>
      <td className='px-4 py-3'>
        <div className='flex justify-end gap-1'>
          <Button
            aria-label={`Edit ${name}`}
            size='icon'
            variant='outline'
            onClick={onEdit}
          >
            <Pencil aria-hidden className='h-3.5 w-3.5' />
          </Button>
        </div>
      </td>
    </tr>
  )
}
