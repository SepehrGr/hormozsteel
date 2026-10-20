import type { ComponentType } from 'react'
import type { PriceProps } from './calculator-ui'
import type { WeightCalculatorType } from '@/config/weight-calculators'

import AngleWeightCalculator from './angle-weight-calculator'
import BeamWeightCalculator from './beam-weight-calculator'
import BilletWeightCalculator from './billet-weight-calculator'
import PipeWeightCalculator from './pipe-weight-calculator'
import RebarWeightCalculator from './rebar-weight-calculator'
import SheetWeightCalculator from './sheet-weight-calculator'
import SquareTubeWeightCalculator from './square-tube-weight-calculator'
import StudWeightCalculator from './stud-weight-calculator'

const CALCULATORS: Record<WeightCalculatorType, ComponentType<PriceProps>> = {
  rebar: RebarWeightCalculator,
  beam: BeamWeightCalculator,
  sheet: SheetWeightCalculator,
  pipe: PipeWeightCalculator,
  angle: AngleWeightCalculator,
  stud: StudWeightCalculator,
  'square-tube': SquareTubeWeightCalculator,
  billet: BilletWeightCalculator,
}

/** The calculator for `type`; rebar and sheet also price the line when given a product price. */
export default function WeightCalculator({
  type,
  ...price
}: { type: WeightCalculatorType } & PriceProps) {
  const Calculator = CALCULATORS[type]

  return <Calculator {...price} />
}
