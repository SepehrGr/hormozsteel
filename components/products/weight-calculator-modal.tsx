'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import RebarWeightCalculator from '@/components/calculators/rebar-weight-calculator'
import SheetWeightCalculator from '@/components/calculators/sheet-weight-calculator'
import BeamWeightCalculator from '@/components/calculators/beam-weight-calculator'
import PipeWeightCalculator from '@/components/calculators/pipe-weight-calculator'
import AngleWeightCalculator from '@/components/calculators/angle-weight-calculator'
import StudWeightCalculator from '@/components/calculators/stud-weight-calculator'
import BilletWeightCalculator from '@/components/calculators/billet-weight-calculator'
import SquareTubeWeightCalculator from '@/components/calculators/square-tube-weight-calculator'
import { formatUsd } from '@/components/calculators/calculator-ui'

interface WeightCalculatorModalProps {
  isOpen: boolean
  onClose: () => void
  productName?: string
  productCategory?: string
  productPrice?: number
  productUnit?: 'kg' | 'ton' | 'piece'
  includeVAT?: boolean
  formatPrice?: (price: number) => string
}

const TITLES: Record<string, string> = {
  sheet: 'Sheet weight',
  beam: 'Beam weight',
  pipe: 'Pipe weight',
  angle: 'Angle weight',
  stud: 'Channel weight',
  billet: 'Billet weight',
  'square-tube': 'Hollow section weight',
  rebar: 'Rebar weight',
}

export default function WeightCalculatorModal({
  isOpen,
  onClose,
  productName,
  productCategory,
  productPrice,
  productUnit = 'kg',
  includeVAT = false,
  formatPrice: customFormatPrice,
}: WeightCalculatorModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  const searchText =
    `${productCategory || ''} ${productName || ''}`.toLowerCase()

  const calculatorType = (() => {
    if (searchText.includes('rebar') || searchText.includes('میلگرد'))
      return 'rebar'
    if (searchText.includes('sheet') || searchText.includes('ورق'))
      return 'sheet'
    if (searchText.includes('beam') || searchText.includes('تیر')) return 'beam'
    if (searchText.includes('pipe') || searchText.includes('لوله'))
      return 'pipe'
    if (searchText.includes('angle') || searchText.includes('نبشی'))
      return 'angle'
    if (
      searchText.includes('channel') ||
      searchText.includes('stud') ||
      searchText.includes('ناودانی')
    )
      return 'stud'
    if (searchText.includes('billet') || searchText.includes('شمش'))
      return 'billet'
    if (
      searchText.includes('tube') ||
      searchText.includes('hollow') ||
      searchText.includes('قوطی')
    )
      return 'square-tube'
    return 'rebar'
  })()

  const formatPrice = customFormatPrice || formatUsd

  const renderCalculator = () => {
    const priceProps = {
      productPrice,
      productUnit,
      includeVAT,
      formatPrice,
    }
    switch (calculatorType) {
      case 'sheet':
        return <SheetWeightCalculator {...priceProps} />
      case 'beam':
        return <BeamWeightCalculator />
      case 'pipe':
        return <PipeWeightCalculator />
      case 'angle':
        return <AngleWeightCalculator />
      case 'stud':
        return <StudWeightCalculator />
      case 'billet':
        return <BilletWeightCalculator />
      case 'square-tube':
        return <SquareTubeWeightCalculator />
      default:
        return <RebarWeightCalculator {...priceProps} />
    }
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
    // close() fires the native close event, which onClose below turns into the prop call.
    const handleBackdropClick = (e: MouseEvent) => {
      if (e.target === dialog) dialog.close()
    }
    dialog.addEventListener('click', handleBackdropClick)

    return () => dialog.removeEventListener('click', handleBackdropClick)
  }, [])

  useEffect(() => {
    if (!isOpen) return

    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = prev
    }
  }, [isOpen])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby='weight-calc-title'
      className='m-auto max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-border bg-card p-0 text-foreground shadow-sm backdrop:bg-black/50 backdrop:backdrop-blur-sm'
      dir='ltr'
      onClose={onClose}
    >
      {isOpen && (
        <>
          <div className='flex items-start justify-between border-b border-border px-5 py-4'>
            <div>
              <h2
                id='weight-calc-title'
                className='text-base font-semibold tracking-tight text-foreground'
              >
                {TITLES[calculatorType] ?? 'Weight calculator'}
              </h2>
              <p className='mt-1 text-xs text-muted-foreground'>
                {productName
                  ? `For ${productName}`
                  : 'Enter dimensions for an indicative mass'}
                {productPrice != null ? ' · with line value' : ''}
              </p>
            </div>
            <button
              type='button'
              onClick={onClose}
              className='flex h-8 w-8 cursor-pointer items-center justify-center border border-border bg-background text-foreground transition-colors duration-200 ease-out hover:bg-muted'
              aria-label='Close'
            >
              <X className='h-4 w-4' />
            </button>
          </div>
          <div className='px-5 py-6'>{renderCalculator()}</div>
        </>
      )}
    </dialog>
  )
}
