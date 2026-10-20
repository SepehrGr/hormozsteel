import type { WeightCalculatorType } from '@/config/weight-calculators'

import WeightCalculator from '@/components/calculators/weight-calculator'
import { DialogFrame } from '@/components/ui/dialogs'
import { WEIGHT_CALCULATORS } from '@/config/weight-calculators'

interface WeightCalculatorModalProps {
  onClose: () => void
  productName?: string
  productCategory?: string
  productPrice?: number
  productUnit?: 'kg' | 'ton' | 'piece'
}

export default function WeightCalculatorModal({
  onClose,
  productName,
  productCategory,
  productPrice,
  productUnit = 'kg',
}: WeightCalculatorModalProps) {
  const searchText =
    `${productCategory || ''} ${productName || ''}`.toLowerCase()

  const calculatorType = ((): WeightCalculatorType => {
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

  return (
    <DialogFrame
      className='max-w-2xl'
      sheet='full'
      title={WEIGHT_CALCULATORS[calculatorType].title}
      onClose={onClose}
    >
      <div className='space-y-6 px-5 py-6'>
        <p className='text-xs text-muted-foreground'>
          {productName
            ? `For ${productName}`
            : 'Enter dimensions for an indicative mass'}
          {productPrice != null ? ' · with line value' : ''}
        </p>
        <WeightCalculator
          productPrice={productPrice}
          productUnit={productUnit}
          type={calculatorType}
        />
      </div>
    </DialogFrame>
  )
}
