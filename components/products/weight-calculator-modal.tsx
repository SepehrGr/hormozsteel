import RebarWeightCalculator from '@/components/calculators/rebar-weight-calculator'
import SheetWeightCalculator from '@/components/calculators/sheet-weight-calculator'
import BeamWeightCalculator from '@/components/calculators/beam-weight-calculator'
import PipeWeightCalculator from '@/components/calculators/pipe-weight-calculator'
import AngleWeightCalculator from '@/components/calculators/angle-weight-calculator'
import StudWeightCalculator from '@/components/calculators/stud-weight-calculator'
import BilletWeightCalculator from '@/components/calculators/billet-weight-calculator'
import SquareTubeWeightCalculator from '@/components/calculators/square-tube-weight-calculator'
import { DialogFrame } from '@/components/ui/dialogs'
import { formatUsd } from '@/lib/format'

interface WeightCalculatorModalProps {
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

  return (
    <DialogFrame
      className='max-w-2xl'
      sheet='full'
      title={TITLES[calculatorType] ?? 'Weight calculator'}
      onClose={onClose}
    >
      <div className='space-y-6 px-5 py-6'>
        <p className='text-xs text-muted-foreground'>
          {productName
            ? `For ${productName}`
            : 'Enter dimensions for an indicative mass'}
          {productPrice != null ? ' · with line value' : ''}
        </p>
        {renderCalculator()}
      </div>
    </DialogFrame>
  )
}
