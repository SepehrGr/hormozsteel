import type { QuickOrderFormValues } from '@/lib/schemas/quick-order'

import { useState } from 'react'
import { CheckCircle, Send } from 'lucide-react'

import { requestQuote } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { DialogFooter, DialogFrame } from '@/components/ui/dialogs'
import { choiceClass, FormField, Input, Textarea } from '@/components/ui/field'
import { useActionForm } from '@/hooks/use-action-form'
import { quickOrderSchema } from '@/lib/schemas/quick-order'

interface OrderRequestModalProps {
  onClose: () => void
  productName?: string
  productSpecs?: string
}

const DELIVERY_OPTIONS = [
  { value: 'PICKUP', label: 'Ex-works pickup' },
  { value: 'DELIVERY', label: 'Freight to site' },
] as const

const sectionTitleClass =
  'font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'

export default function OrderRequestModal({
  onClose,
  productName = '',
  productSpecs = '',
}: OrderRequestModalProps) {
  const [orderId, setOrderId] = useState<string>()
  const { field, register, formState, onSubmit, dialog } =
    useActionForm<QuickOrderFormValues>({
      schema: quickOrderSchema,
      defaultValues: {
        customerName: '',
        companyName: '',
        phoneNumber: '',
        city: '',
        productSpecs,
        quantity: '',
        deliveryDate: '',
        deliveryMethod: 'PICKUP',
        additionalNotes: '',
        productName,
      },
      action: async values => {
        const result = await requestQuote(values)

        if (result.success) setOrderId(result.data.id)

        return result
      },
      mode: 'create',
      noun: 'quote',
      successMessage: 'Request sent',
    })
  const { errors } = formState

  return (
    <DialogFrame
      className='max-w-xl'
      closeOnBackdrop={!dialog.dirty || !!orderId}
      pending={dialog.pending}
      sheet='full'
      title='Quote request'
      onClose={onClose}
    >
      {orderId ? (
        <div className='space-y-3 px-5 py-12 text-center' role='status'>
          <div className='mx-auto flex h-12 w-12 items-center justify-center border border-emerald-600/30 bg-emerald-50 dark:bg-emerald-950/40'>
            <CheckCircle className='h-6 w-6 text-emerald-600 dark:text-emerald-400' />
          </div>
          <h3
            ref={el => el?.focus()}
            className='text-lg font-semibold text-foreground outline-none'
            tabIndex={-1}
          >
            Request received
          </h3>
          <p className='text-sm text-muted-foreground'>
            Sales will follow up with firm pricing against the catalog board.
          </p>
          <p className='inline-block border border-border bg-muted/40 px-3 py-2 font-mono text-sm text-foreground'>
            Order ID: {orderId}
          </p>
        </div>
      ) : (
        // noValidate: zod owns validation and renders its own messages
        <form
          noValidate
          className='max-sm:flex max-sm:flex-1 max-sm:flex-col'
          onSubmit={onSubmit}
        >
          <div className='space-y-5 px-5 py-5 max-sm:flex-1'>
            {productName ? (
              <div className='border border-border bg-muted/40 px-3 py-2.5 text-sm'>
                <p className='text-[10px] uppercase tracking-wide text-muted-foreground'>
                  Line item
                </p>
                <p className='mt-0.5 font-medium text-foreground'>
                  {productName}
                </p>
              </div>
            ) : null}

            <section className='space-y-3'>
              <h3 className={sectionTitleClass}>Contact</h3>
              <div className='grid gap-3 sm:grid-cols-2'>
                <FormField
                  className='sm:col-span-2'
                  error={errors.customerName?.message}
                  id='quote-customerName'
                  label='Full name *'
                >
                  <Input
                    placeholder='Name for the quote file'
                    {...field('customerName')}
                  />
                </FormField>
                <FormField
                  error={errors.phoneNumber?.message}
                  id='quote-phoneNumber'
                  label='Phone *'
                >
                  <Input type='tel' {...field('phoneNumber')} />
                </FormField>
                <FormField
                  error={errors.city?.message}
                  id='quote-city'
                  label='Delivery city *'
                >
                  <Input {...field('city')} />
                </FormField>
                <FormField
                  className='sm:col-span-2'
                  error={errors.companyName?.message}
                  id='quote-companyName'
                  label='Company'
                >
                  <Input {...field('companyName')} />
                </FormField>
              </div>
            </section>

            <section className='space-y-3'>
              <h3 className={sectionTitleClass}>Order details</h3>
              <FormField
                error={errors.productSpecs?.message}
                id='quote-productSpecs'
                label='Specs *'
              >
                <Input
                  placeholder='Size, grade, mill…'
                  {...field('productSpecs')}
                />
              </FormField>
              <div className='grid gap-3 sm:grid-cols-2'>
                <FormField
                  error={errors.quantity?.message}
                  id='quote-quantity'
                  label='Quantity *'
                >
                  <Input placeholder='e.g. 5 tons' {...field('quantity')} />
                </FormField>
                <FormField
                  error={errors.deliveryDate?.message}
                  id='quote-deliveryDate'
                  label='Preferred date'
                >
                  <Input type='date' {...field('deliveryDate')} />
                </FormField>
              </div>
            </section>

            <fieldset>
              <legend className={`${sectionTitleClass} mb-3`}>Delivery</legend>
              <div className='grid gap-2 sm:grid-cols-2'>
                {DELIVERY_OPTIONS.map(option => (
                  <label key={option.value} className={choiceClass}>
                    <input
                      className='sr-only'
                      type='radio'
                      value={option.value}
                      {...register('deliveryMethod')}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <FormField
              error={errors.additionalNotes?.message}
              id='quote-additionalNotes'
              label='Notes'
            >
              <Textarea
                className='min-h-20'
                placeholder='Timing, inspection, mill preference…'
                {...field('additionalNotes')}
              />
            </FormField>
          </div>

          <DialogFooter pending={dialog.pending} onCancel={onClose}>
            <Button
              className='sm:min-w-28'
              disabled={dialog.pending}
              type='submit'
            >
              <Send aria-hidden className='h-4 w-4' />
              {dialog.pending ? 'Sending…' : 'Send request'}
            </Button>
          </DialogFooter>
        </form>
      )}
    </DialogFrame>
  )
}
