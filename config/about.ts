import type { SteelProfile } from '@/components/about/steel-profiles'

/** Content for /about; the page's sections live in components/about. */

export const ABOUT_FACTS = [
  { label: 'Founded', value: '1993' },
  { label: 'Steel trading', value: 'Since 2019' },
  { label: 'Base', value: 'Bandar Abbas' },
  { label: 'Currency', value: 'USD · catalog' },
]

export const ABOUT_CHAPTERS = [
  {
    year: '1993',
    current: false,
    title: 'Construction first',
    body: 'Hormoz Steel started on job sites, where a late delivery or a wrong grade costs a week. That is where the habit of checking spec before price came from.',
  },
  {
    year: '2019',
    current: false,
    title: 'Onto the board',
    body: 'We opened a trading desk for mill products. Rebar, sheet, sections, pipe, billets, and started publishing what we would actually charge for them.',
  },
  {
    year: 'Today',
    current: true,
    title: 'Priced in the open',
    body: 'Unit rates sit on the catalog board in USD so procurement can estimate before the call. Sales turns a shortlist into a proforma with firm terms.',
  },
]

export const ABOUT_COVERAGE: Array<{
  profile: SteelProfile
  name: string
  spec: string
  href: string
}> = [
  {
    profile: 'rebar',
    name: 'Rebar',
    spec: 'Ribbed & plain · A3 · 8–32 mm',
    href: '/products/rebar',
  },
  {
    profile: 'coil',
    name: 'Sheet',
    spec: 'Hot-rolled · cold-rolled · coated',
    href: '/products/sheet',
  },
  {
    profile: 'beam',
    name: 'Beams & profiles',
    spec: 'IPE · HEA · HEB · UPE',
    href: '/products/beam',
  },
  {
    profile: 'pipe',
    name: 'Pipe & tube',
    spec: 'Seamed · seamless · galvanized',
    href: '/products/pipe',
  },
  {
    profile: 'angle',
    name: 'Angles & channels',
    spec: 'Angle · channel · T-bar',
    href: '/products/angle',
  },
  {
    profile: 'mesh',
    name: 'Wire, mesh & billets',
    spec: 'Drawn wire · welded mesh · billet',
    href: '/products/wire',
  },
]

/** Stock plates: Unsplash. Encoded to WebP at render width — see public/images/about. */
export const ABOUT_YARD = [
  {
    src: '/images/about/coil.webp',
    alt: 'Rows of cold-rolled steel coils stacked along a warehouse aisle',
    title: 'Hot- & cold-rolled coil',
    spec: 'HRC · CRC',
    blur: 'data:image/webp;base64,UklGRmAAAABXRUJQVlA4IFQAAADwAQCdASoQAAwABMB4JaQAAxZfPLpkHaAA/vEgzevg1A3ZCWbjgyQNXJV59DRH/oMGku4yQ/dzE3KLovJcIRVSDJtPL48y/Uy06wppF3kvrsBIAAA=',
  },
  {
    src: '/images/about/rebar-bundle.webp',
    alt: 'Bundled reinforcing bar stacked and seen end-on',
    title: 'Ribbed reinforcing bar',
    spec: 'A3 · 8–32 mm',
    blur: 'data:image/webp;base64,UklGRjYAAABXRUJQVlA4ICoAAACQAQCdASoQAAwABMB4JZQAAjtZAAAA/s69QLx5RyhbtAizeA2kTKNkAAA=',
  },
  {
    src: '/images/about/pipe.webp',
    alt: 'Stacked steel pipe seen end-on in a storage yard',
    title: 'Pipe & hollow section',
    spec: 'ERW · seamless',
    blur: 'data:image/webp;base64,UklGRlIAAABXRUJQVlA4IEYAAADwAQCdASoQAAwABMB4JZwAAt1u08ZyobAA/vDmcQDS5aHv9aXAz6PDBTH1FiT3MiNxbEEGQRJODT+hLdn58S6D7+wCgAAA',
  },
]

export const ORDER_STEPS = [
  {
    code: '01',
    title: 'Review unit prices',
    body: 'Open the catalog board, filter by size and mill, and shortlist lines that match the takeoff.',
  },
  {
    code: '02',
    title: 'Confirm the spec',
    body: 'Note grade, section, length, tonnage, and delivery city so sales can price without rework.',
  },
  {
    code: '03',
    title: 'Request a proforma',
    body: 'Contact sales for a firm quote. Catalog rates are indicative; final terms follow agreed logistics.',
  },
  {
    code: '04',
    title: 'Settle and schedule load-out',
    body: 'Deposit against proforma, then coordinate loading and transport with the desk.',
  },
]

export const QUOTE_FIELDS = [
  {
    term: 'Product & standard',
    detail:
      'Family (rebar, beam, sheet…), dimensions, grade — for example A3 or ST37 — and the relevant standard.',
  },
  {
    term: 'Volume & timing',
    detail:
      'Tonnage or piece count, preferred ship window, and whether partial loads are acceptable.',
  },
  {
    term: 'Mill & quality',
    detail:
      'Preferred mills where applicable, plus any inspection or mill-certificate requirement before dispatch.',
  },
  {
    term: 'Logistics',
    detail:
      'Delivery city, site access, and who handles freight — so landed cost is clear from the start.',
  },
]

/** The masthead plate: port operations at Bandar Abbas. */
export const ABOUT_HERO = {
  src: '/images/about/port-bandar-abbas.webp',
  alt: 'Gantry cranes working a container vessel at a deepwater port at dusk',
  blur: 'data:image/webp;base64,UklGRj4AAABXRUJQVlA4IDIAAADQAQCdASoQAAgABMB4JZQAAtubDSs3AAD+M+CT90D2nmcdkukE4S1I+DsJKTXbtmgAAA==',
}
