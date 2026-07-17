export const traitItems: {
  id: number
  title: string
  /** @deprecated Icons no longer rendered in the board UI. */
  icon?: 'Coins' | 'Banknote' | 'ShieldCheck' | 'PhoneCall'
  description: string
}[] = [
  {
    id: 1,
    title: 'Transparent unit prices',
    description:
      'Catalog rates in USD by size and mill so you can compare lines before requesting a firm quote.',
  },
  {
    id: 2,
    title: 'Settlement that fits the job',
    description:
      'Cash or credit against proforma terms — conditions agreed up front, not after the truck is loaded.',
  },
  {
    id: 3,
    title: 'Quality before dispatch',
    description:
      'Material is checked against the order spec prior to loading so non-conforming lots do not leave the yard.',
  },
  {
    id: 4,
    title: 'Pre-purchase guidance',
    description:
      'Sales helps match grade, size, and tonnage to the takeoff so you order what the structure actually needs.',
  },
]
