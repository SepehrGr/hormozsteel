/**
 * The weight calculators, in menu order. `label` is for lists under a
 * "Calculators" heading, where "weight" would repeat; `title` heads the page.
 */
export const WEIGHT_CALCULATORS = {
  rebar: {
    label: 'Rebar',
    title: 'Rebar weight',
    description: 'Ribbed and plain bar by diameter and bar length.',
  },
  beam: {
    label: 'Beam',
    title: 'Beam weight',
    description: 'IPE / INP / HE-style sections from flange and web dims.',
  },
  sheet: {
    label: 'Sheet',
    title: 'Sheet weight',
    description: 'Plate and coil sheet by length, width, and thickness.',
  },
  pipe: {
    label: 'Pipe',
    title: 'Pipe weight',
    description: 'Round pipe from OD, wall thickness, and length.',
  },
  angle: {
    label: 'Angle',
    title: 'Angle weight',
    description: 'Equal and unequal leg angles.',
  },
  stud: {
    label: 'Channel',
    title: 'Channel weight',
    description: 'U-channel / stud sections from flange and web dims.',
  },
  'square-tube': {
    label: 'Hollow section',
    title: 'Hollow section weight',
    description: 'SHS / RHS tubes by section size and wall thickness.',
  },
  billet: {
    label: 'Billet',
    title: 'Billet weight',
    description: 'Square billet section × length.',
  },
} as const

export type WeightCalculatorType = keyof typeof WEIGHT_CALCULATORS

/** `{ href, label }` for the navbar menus. */
export const WEIGHT_CALCULATOR_LINKS = Object.entries(WEIGHT_CALCULATORS).map(
  ([type, { label }]) => ({ href: `/weight/${type}`, label }),
)
