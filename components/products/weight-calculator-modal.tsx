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

/** First match wins, so "Angles & channels" opens the angle calculator. */
const MATCHERS: [WeightCalculatorType, string[]][] = [
  ['rebar', ['rebar']],
  ['sheet', ['sheet']],
  ['beam', ['beam']],
  ['pipe', ['pipe']],
  ['angle', ['angle']],
  ['stud', ['channel', 'stud']],
  ['billet', ['billet']],
  ['square-tube', ['tube', 'hollow']],
]

export default function WeightCalculatorModal({
  onClose,
  productName,
  productCategory,
  productPrice,
  productUnit = 'kg',
}: WeightCalculatorModalProps) {
  const searchText =
    `${productCategory || ''} ${productName || ''}`.toLowerCase()
  const calculatorType =
    MATCHERS.find(([, words]) =>
      words.some(w => searchText.includes(w)),
    )?.[0] ?? 'rebar'

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
