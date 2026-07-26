'use client'

import { useEffect } from 'react'
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

  useEffect(() => {
    if (!isOpen) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = prev
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm'
      role='dialog'
      aria-modal='true'
      aria-labelledby='weight-calc-title'
      dir='ltr'
      onClick={onClose}
    >
      <div
        className='max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-border bg-card shadow-sm'
        onClick={e => e.stopPropagation()}
      >
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
      </div>
    </div>
  )
}
