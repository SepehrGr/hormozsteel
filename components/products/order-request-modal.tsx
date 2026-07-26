'use client'

import { useState, useEffect, useRef } from 'react'
import { X, CheckCircle, Send } from 'lucide-react'

interface OrderRequestModalProps {
  isOpen: boolean
  onClose: () => void
  productName?: string
  productSpecs?: string
}

interface OrderFormData {
  customerName: string
  companyName: string
  phoneNumber: string
  city: string
  productSpecs: string
  quantity: string
  deliveryDate: string
  deliveryMethod: 'pickup' | 'delivery'
  additionalNotes: string
}

const fieldClass =
  'w-full border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-200 ease-out focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground disabled:cursor-not-allowed disabled:opacity-50'

const labelClass =
  'mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground'

export default function OrderRequestModal({
  isOpen,
  onClose,
  productName = '',
  productSpecs = '',
}: OrderRequestModalProps) {
  const [formData, setFormData] = useState<OrderFormData>({
    customerName: '',
    companyName: '',
    phoneNumber: '',
    city: '',
    productSpecs: productSpecs,
    quantity: '',
    deliveryDate: '',
    deliveryMethod: 'pickup',
    additionalNotes: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [trackingCode, setTrackingCode] = useState('')
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        productSpecs: productSpecs || prev.productSpecs,
      }))
      setErrorMessage(null)
    }
  }, [isOpen, productSpecs])

  useEffect(() => {
    if (!isOpen) return

    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = prev
    }
  }, [isOpen])

  const handleInputChange = (field: keyof OrderFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (
      !formData.customerName.trim() ||
      !formData.phoneNumber.trim() ||
      !formData.city.trim() ||
      !formData.productSpecs.trim() ||
      !formData.quantity.trim()
    ) {
      setErrorMessage('Please fill in all required fields.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/quick-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.customerName,
          companyName: formData.companyName,
          phoneNumber: formData.phoneNumber,
          city: formData.city,
          productSpecs: formData.productSpecs,
          quantity: formData.quantity,
          deliveryDate: formData.deliveryDate || null,
          deliveryMethod: formData.deliveryMethod,
          additionalNotes: formData.additionalNotes,
          productName: productName,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setTrackingCode(data.data.id)
        setIsSubmitted(true)
        setIsSubmitting(false)
      } else {
        setErrorMessage(data.error || 'Could not submit request.')
        setIsSubmitting(false)
      }
    } catch {
      setErrorMessage('Network error. Check your connection and try again.')
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setIsSubmitted(false)
    setFormData({
      customerName: '',
      companyName: '',
      phoneNumber: '',
      city: '',
      productSpecs: productSpecs,
      quantity: '',
      deliveryDate: '',
      deliveryMethod: 'pickup',
      additionalNotes: '',
    })
    onClose()
  }

  // showModal() gives focus trapping, Escape, and focus restore for free
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen && !dialog.open) dialog.showModal()
    if (!isOpen && dialog.open) dialog.close()
  }, [isOpen])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    // A click landing on the dialog itself came from the ::backdrop.
    // close() fires the native close event, which onClose below turns into handleClose.
    const handleBackdropClick = (e: MouseEvent) => {
      if (e.target === dialog) dialog.close()
    }
    dialog.addEventListener('click', handleBackdropClick)

    return () => dialog.removeEventListener('click', handleBackdropClick)
  }, [])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby='order-request-title'
      className='m-auto max-h-[85vh] w-full max-w-xl flex-col overflow-hidden border border-border bg-card p-0 text-foreground shadow-lg backdrop:bg-black/50 backdrop:backdrop-blur-sm open:flex'
      onClose={handleClose}
    >
      {isOpen && (
        <>
          <div className='flex items-center justify-between border-b border-border px-5 py-3'>
          <div>
            <p className='font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
              Sales desk
            </p>
            <h2
              id='order-request-title'
              className='text-base font-semibold tracking-tight text-foreground'
            >
              Quote request
            </h2>
          </div>
          <button
            type='button'
            onClick={handleClose}
            className='inline-flex h-8 w-8 cursor-pointer items-center justify-center border border-border bg-background text-muted-foreground transition-colors duration-200 ease-out hover:bg-muted hover:text-foreground'
            aria-label='Close'
          >
            <X className='h-4 w-4' />
          </button>
        </div>

        <div className='overflow-y-auto px-5 py-5'>
          {isSubmitted ? (
            <div className='space-y-3 py-8 text-center'>
              <div className='mx-auto flex h-12 w-12 items-center justify-center border border-emerald-600/30 bg-emerald-50 dark:bg-emerald-950/40'>
                <CheckCircle className='h-6 w-6 text-emerald-600 dark:text-emerald-400' />
              </div>
              <h3 className='text-lg font-semibold text-foreground'>
                Request received
              </h3>
              <p className='text-sm text-muted-foreground'>
                Sales will follow up with firm pricing against the catalog
                board.
              </p>
              {trackingCode ? (
                <p className='inline-block border border-border bg-muted/40 px-3 py-2 font-mono text-sm text-foreground'>
                  Order ID: {trackingCode}
                </p>
              ) : null}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className='space-y-5'>
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
                <h3 className='font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
                  Contact
                </h3>
                <div className='grid gap-3 sm:grid-cols-2'>
                  <div className='sm:col-span-2'>
                    <label htmlFor='customerName' className={labelClass}>
                      Full name *
                    </label>
                    <input
                      id='customerName'
                      type='text'
                      value={formData.customerName}
                      onChange={e =>
                        handleInputChange('customerName', e.target.value)
                      }
                      className={fieldClass}
                      placeholder='Name for the quote file'
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label htmlFor='phoneNumber' className={labelClass}>
                      Phone *
                    </label>
                    <input
                      id='phoneNumber'
                      type='tel'
                      value={formData.phoneNumber}
                      onChange={e =>
                        handleInputChange('phoneNumber', e.target.value)
                      }
                      className={fieldClass}
                      dir='ltr'
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label htmlFor='city' className={labelClass}>
                      Delivery city *
                    </label>
                    <input
                      id='city'
                      type='text'
                      value={formData.city}
                      onChange={e => handleInputChange('city', e.target.value)}
                      className={fieldClass}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className='sm:col-span-2'>
                    <label htmlFor='companyName' className={labelClass}>
                      Company
                    </label>
                    <input
                      id='companyName'
                      type='text'
                      value={formData.companyName}
                      onChange={e =>
                        handleInputChange('companyName', e.target.value)
                      }
                      className={fieldClass}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </section>

              <section className='space-y-3'>
                <h3 className='font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
                  Order details
                </h3>
                <div>
                  <label htmlFor='productSpecs' className={labelClass}>
                    Specs *
                  </label>
                  <input
                    id='productSpecs'
                    type='text'
                    value={formData.productSpecs}
                    onChange={e =>
                      handleInputChange('productSpecs', e.target.value)
                    }
                    className={fieldClass}
                    placeholder='Size, grade, mill…'
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className='grid gap-3 sm:grid-cols-2'>
                  <div>
                    <label htmlFor='quantity' className={labelClass}>
                      Quantity *
                    </label>
                    <input
                      id='quantity'
                      type='text'
                      value={formData.quantity}
                      onChange={e =>
                        handleInputChange('quantity', e.target.value)
                      }
                      className={fieldClass}
                      placeholder='e.g. 5 tons'
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label htmlFor='deliveryDate' className={labelClass}>
                      Preferred date
                    </label>
                    <input
                      id='deliveryDate'
                      type='date'
                      value={
                        formData.deliveryDate
                          ? formData.deliveryDate.slice(0, 10)
                          : ''
                      }
                      onChange={e =>
                        handleInputChange(
                          'deliveryDate',
                          e.target.value
                            ? new Date(e.target.value).toISOString()
                            : '',
                        )
                      }
                      className={fieldClass}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </section>

              <section className='space-y-3'>
                <h3 className='font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
                  Delivery
                </h3>
                <div className='grid gap-2 sm:grid-cols-2'>
                  {(
                    [
                      { value: 'pickup', label: 'Ex-works pickup' },
                      { value: 'delivery', label: 'Freight to site' },
                    ] as const
                  ).map(option => (
                    <label
                      key={option.value}
                      className={`flex cursor-pointer items-center gap-2 border px-3 py-2.5 text-sm transition-colors duration-200 ease-out ${
                        formData.deliveryMethod === option.value
                          ? 'border-foreground bg-muted text-foreground'
                          : 'border-border bg-background text-muted-foreground hover:bg-muted/50'
                      }`}
                    >
                      <input
                        type='radio'
                        name='deliveryMethod'
                        value={option.value}
                        checked={formData.deliveryMethod === option.value}
                        onChange={e =>
                          handleInputChange('deliveryMethod', e.target.value)
                        }
                        className='sr-only'
                        disabled={isSubmitting}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </section>

              <div>
                <label htmlFor='additionalNotes' className={labelClass}>
                  Notes
                </label>
                <textarea
                  id='additionalNotes'
                  value={formData.additionalNotes}
                  onChange={e =>
                    handleInputChange('additionalNotes', e.target.value)
                  }
                  className={`${fieldClass} min-h-[5rem] resize-y`}
                  placeholder='Timing, inspection, mill preference…'
                  disabled={isSubmitting}
                />
              </div>

              {errorMessage ? (
                <div
                  role='alert'
                  className='border border-red-600/40 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-500/40 dark:bg-red-950/40 dark:text-red-100'
                >
                  {errorMessage}
                </div>
              ) : null}

              <div className='flex flex-col gap-2 border-t border-border pt-4 sm:flex-row'>
                <button
                  type='button'
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className='inline-flex flex-1 cursor-pointer items-center justify-center border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors duration-200 ease-out hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={isSubmitting}
                  className='inline-flex flex-1 cursor-pointer items-center justify-center gap-2 bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity duration-200 ease-out hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  {isSubmitting ? (
                    'Sending…'
                  ) : (
                    <>
                      <Send className='h-4 w-4' />
                      Send request
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
        </>
      )}
    </dialog>
  )
}
