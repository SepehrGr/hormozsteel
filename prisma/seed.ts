/**
 * English portfolio seed for ahanhormoz_demo.
 * Run: yarn db:seed  (requires DATABASE_URL → ahanhormoz_demo)
 */
import { PrismaClient, PriceDirection, ProductUnit, Role } from '@prisma/client'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'

dotenv.config({ path: '.env.local' })

const prisma = new PrismaClient()

type Specs = Record<string, string | number>

function slugify(parts: string[]) {
  return parts
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/** Round to 2 decimal places (USD). */
function usd(n: number) {
  return Math.round(n * 100) / 100
}

function pickDirection(i: number): PriceDirection {
  const mod = i % 5
  if (mod === 0) return PriceDirection.UP
  if (mod === 1) return PriceDirection.DOWN
  return PriceDirection.STABLE
}

/**
 * Apply a small demo price movement around a USD base price.
 * Prices are unit prices in USD (per KG / TON / METER / PIECE as set on the product).
 */
function withPriceMotion(base: number, i: number) {
  const price = usd(base)
  const direction = pickDirection(i)
  if (direction === PriceDirection.UP) {
    const prev = usd(price * 0.97)
    return {
      price,
      previousPrice: prev,
      priceDirection: PriceDirection.UP,
      priceDelta: usd(price - prev),
      priceUpdatedAt: new Date(),
    }
  }
  if (direction === PriceDirection.DOWN) {
    const prev = usd(price * 1.03)
    return {
      price,
      previousPrice: prev,
      priceDirection: PriceDirection.DOWN,
      priceDelta: usd(prev - price),
      priceUpdatedAt: new Date(),
    }
  }
  return {
    price,
    previousPrice: price,
    priceDirection: PriceDirection.STABLE,
    priceDelta: 0,
    priceUpdatedAt: new Date(),
  }
}

async function main() {
  const dbUrl = process.env.DATABASE_URL ?? ''
  if (!dbUrl.includes('ahanhormoz_demo')) {
    throw new Error(
      `Refusing to seed: DATABASE_URL must target ahanhormoz_demo (got: ${dbUrl.replace(/:[^:@/]+@/, ':***@')})`,
    )
  }

  console.log('🌱 Seeding English demo database…')

  // Wipe catalog tables for a clean re-seed (demo DB only)
  await prisma.priceHistory.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.quickOrder.deleteMany()
  await prisma.contactForm.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.manufacturer.deleteMany()
  await prisma.customer.deleteMany()
  // Keep users if re-running? wipe demo users too for idempotency
  await prisma.adminLog.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  const passwordHash = await bcrypt.hash('admin123', 12)

  await prisma.user.create({
    data: {
      email: 'admin@hormozsteel.demo',
      password: passwordHash,
      name: 'Demo Admin',
      role: Role.ADMIN,
    },
  })
  await prisma.user.create({
    data: {
      email: 'superadmin@hormozsteel.demo',
      password: await bcrypt.hash('superadmin123', 12),
      name: 'Demo Super Admin',
      role: Role.SUPER_ADMIN,
    },
  })
  console.log('✅ Users (admin@hormozsteel.demo / admin123)')

  const manufacturers = await Promise.all(
    [
      {
        name: 'Caspian Steel Mills',
        slug: 'caspian-steel',
        description: 'Structural steel and rebar producer',
        website: 'https://example.com/caspian',
      },
      {
        name: 'Hormoz Rolling Co.',
        slug: 'hormoz-rolling',
        description: 'Hot-rolled sheets and sections',
        website: 'https://example.com/hormoz',
      },
      {
        name: 'Alborz Metal Works',
        slug: 'alborz-metal',
        description: 'Pipes, tubes, and wire products',
        website: 'https://example.com/alborz',
      },
      {
        name: 'Persian Gulf Steel',
        slug: 'persian-gulf-steel',
        description: 'Heavy beams and industrial profiles',
        website: 'https://example.com/pgs',
      },
      {
        name: 'Zagros Alloy',
        slug: 'zagros-alloy',
        description: 'Stainless and coated products',
        website: 'https://example.com/zagros',
      },
    ].map(m => prisma.manufacturer.create({ data: m })),
  )
  console.log(`✅ ${manufacturers.length} manufacturers`)

  // Icons = icomoon class names from styles/icomoon.css (never emoji)
  const categoryDefs = [
    {
      name: 'Rebar',
      slug: 'rebar',
      description: 'Ribbed and plain reinforcing bar',
      icon: 'icon-rebar',
      sortOrder: 1,
      subcategories: ['Ribbed', 'Plain', 'Coil', 'Stainless'],
    },
    {
      name: 'Beams',
      slug: 'beam',
      description: 'I-beams, H-beams, and specialty sections',
      icon: 'icon-girder',
      sortOrder: 2,
      subcategories: ['I-beam', 'H-beam', 'Castellated', 'Rail'],
    },
    {
      name: 'Sheets',
      slug: 'sheet',
      description: 'Hot-rolled, cold-rolled, and coated sheet',
      icon: 'icon-sheet',
      sortOrder: 3,
      subcategories: [
        'Hot-rolled',
        'Cold-rolled',
        'Galvanized',
        'Color-coated',
        'Stainless',
      ],
    },
    {
      name: 'Profiles',
      slug: 'profile',
      description: 'Structural and industrial profiles',
      icon: 'icon-profile',
      sortOrder: 4,
      subcategories: ['Structural', 'Industrial', 'IPE', 'HEA', 'HEB', 'UPE'],
    },
    {
      name: 'Angles & channels',
      slug: 'angle',
      description: 'Angle bars, channels, and T-sections',
      icon: 'icon-Corners',
      sortOrder: 5,
      subcategories: ['Angle', 'Channel', 'T-bar', 'Galvanized'],
    },
    {
      name: 'Pipes',
      slug: 'pipe',
      description: 'Seamed, seamless, and specialty pipe',
      icon: 'icon-pipe',
      sortOrder: 6,
      subcategories: ['Seamed', 'Seamless', 'Galvanized', 'Stainless'],
    },
    {
      name: 'Wire',
      slug: 'wire',
      description: 'Black, galvanized, and barbed wire',
      icon: 'icon-wire',

      sortOrder: 7,
      subcategories: ['Black', 'Galvanized', 'Barbed', 'Cable'],
    },
    {
      name: 'Mesh',
      slug: 'mesh',
      description: 'Fence and welded mesh',
      icon: 'icon-grating',
      sortOrder: 8,
      subcategories: ['Fence', 'Welded', 'Galvanized'],
    },
    {
      name: 'Billets',
      slug: 'shamsh',
      description: 'Steel and alloy billets',
      icon: 'icon-bullion',
      sortOrder: 9,
      subcategories: ['Carbon', 'Alloy'],
    },
    {
      name: 'Tubes',
      slug: 'qooti',
      description: 'Square and rectangular hollow sections',
      icon: 'icon-profil',
      sortOrder: 10,
      subcategories: ['Industrial', 'Column'],
    },
  ]

  const categories = []
  for (const def of categoryDefs) {
    categories.push(await prisma.category.create({ data: def }))
  }
  console.log(`✅ ${categories.length} categories`)

  const bySlug = Object.fromEntries(categories.map(c => [c.slug, c]))
  const m = (i: number) => manufacturers[i % manufacturers.length]

  type ProductInput = {
    name: string
    slug: string
    description: string
    size: string
    unit: ProductUnit
    basePrice: number
    weightKg?: number
    inStock: boolean
    subcategory: string
    categorySlug: string
    manufacturerIndex: number
    specs: Specs
    features: string[]
    applications: string[]
  }

  const catalog: ProductInput[] = []

  // Prices are USD unit prices (per KG / METER / PIECE / TON as set on each product).
  // Rough industrial ballparks for a portfolio demo — not live market data.

  // Rebar ladder (~$0.55–0.78 / kg)
  for (const [idx, dia] of [
    8, 10, 12, 14, 16, 18, 20, 22, 25, 28, 32,
  ].entries()) {
    catalog.push({
      name: `Ribbed rebar ${dia}mm`,
      slug: slugify(['rebar', 'ribbed', `${dia}mm`]),
      description: `Grade A3 ribbed rebar, ${dia}mm diameter, 12m stock length.`,
      size: `${dia}mm`,
      unit: ProductUnit.KG,
      basePrice: usd(0.52 + dia * 0.008),
      weightKg: dia * dia * 0.00617,
      inStock: dia !== 28,
      subcategory: 'Ribbed',
      categorySlug: 'rebar',
      manufacturerIndex: idx % 5,
      specs: {
        diameter: `${dia}mm`,
        grade: 'A3',
        length: '12m',
        standard: 'ISIRI 3132',
      },
      features: ['High bond', 'Consistent rib pattern'],
      applications: ['Reinforced concrete', 'Foundations', 'Slabs'],
    })
  }

  // Plain rebar sample (~$0.50–0.60 / kg)
  for (const dia of [10, 12, 16]) {
    catalog.push({
      name: `Plain rebar ${dia}mm`,
      slug: slugify(['rebar', 'plain', `${dia}mm`]),
      description: `Plain round bar ${dia}mm for light fabrication.`,
      size: `${dia}mm`,
      unit: ProductUnit.KG,
      basePrice: usd(0.48 + dia * 0.007),
      weightKg: dia * dia * 0.00617,
      inStock: true,
      subcategory: 'Plain',
      categorySlug: 'rebar',
      manufacturerIndex: 1,
      specs: { diameter: `${dia}mm`, grade: 'A1', length: '12m' },
      features: ['Smooth surface'],
      applications: ['Ties', 'Light frames'],
    })
  }

  // Beams (~$0.72–0.90 / kg)
  for (const [idx, size] of [
    'IPE 80',
    'IPE 100',
    'IPE 120',
    'IPE 140',
    'IPE 160',
    'IPE 180',
    'IPE 200',
    'HEA 100',
    'HEA 140',
    'HEB 120',
  ].entries()) {
    catalog.push({
      name: `Beam ${size}`,
      slug: slugify(['beam', size]),
      description: `Structural beam ${size}, standard mill lengths.`,
      size,
      unit: ProductUnit.KG,
      basePrice: usd(0.72 + idx * 0.018),
      weightKg: 6 + idx * 2.2,
      inStock: true,
      subcategory: size.startsWith('HE') ? 'H-beam' : 'I-beam',
      categorySlug: 'beam',
      manufacturerIndex: idx % 5,
      specs: { section: size, standard: 'EN 10025', length: '12m' },
      features: ['Predictable section modulus'],
      applications: ['Steel frames', 'Mezzanines', 'Industrial halls'],
    })
  }

  // Sheets — base by finish (~$0.62–2.50 / kg)
  const sheets: { sub: string; thick: string[]; base: number; step: number }[] =
    [
      {
        sub: 'Hot-rolled',
        thick: ['2mm', '3mm', '4mm', '6mm', '8mm', '10mm'],
        base: 0.62,
        step: 0.02,
      },
      {
        sub: 'Cold-rolled',
        thick: ['0.5mm', '0.8mm', '1mm', '1.5mm'],
        base: 0.78,
        step: 0.03,
      },
      {
        sub: 'Galvanized',
        thick: ['0.5mm', '0.7mm', '1mm'],
        base: 0.88,
        step: 0.04,
      },
      { sub: 'Stainless', thick: ['1mm', '2mm'], base: 2.35, step: 0.12 },
    ]
  let sheetI = 0
  for (const group of sheets) {
    for (const [tIdx, t] of group.thick.entries()) {
      catalog.push({
        name: `${group.sub} sheet ${t}`,
        slug: slugify(['sheet', group.sub, t]),
        description: `${group.sub} steel sheet, thickness ${t}.`,
        size: t,
        unit: ProductUnit.KG,
        basePrice: usd(group.base + tIdx * group.step),
        inStock: sheetI % 7 !== 0,
        subcategory: group.sub,
        categorySlug: 'sheet',
        manufacturerIndex: sheetI % 5,
        specs: {
          thickness: t,
          coating: group.sub === 'Galvanized' ? 'Z275' : 'None',
          standard: 'EN 10025',
        },
        features: ['Mill edge available'],
        applications: ['Fabrication', 'Cladding', 'Ducting'],
      })
      sheetI++
    }
  }

  // Profiles (~$0.70–0.85 / kg)
  for (const [idx, p] of [
    'IPE 80',
    'IPE 100',
    'HEA 120',
    'UPE 120',
    'Structural 40x40',
    'Industrial 60x40',
  ].entries()) {
    catalog.push({
      name: `Profile ${p}`,
      slug: slugify(['profile', p]),
      description: `Steel profile ${p}.`,
      size: p,
      unit: ProductUnit.KG,
      basePrice: usd(0.7 + idx * 0.025),
      inStock: true,
      subcategory:
        p.includes('IPE') || p.includes('HE') || p.includes('UPE')
          ? p.split(' ')[0]
          : 'Structural',
      categorySlug: 'profile',
      manufacturerIndex: idx % 5,
      specs: { section: p, length: '6m' },
      features: ['Straightness controlled'],
      applications: ['Frames', 'Supports'],
    })
  }

  // Angles (~$0.66–0.82 / kg)
  for (const [idx, a] of [
    '30x30x3',
    '40x40x4',
    '50x50x5',
    '60x60x6',
    '80x80x8',
    'Channel 80',
    'Channel 100',
  ].entries()) {
    catalog.push({
      name: a.startsWith('Channel') ? a : `Angle ${a}`,
      slug: slugify(['angle', a]),
      description: `Angle / channel section ${a}.`,
      size: a,
      unit: ProductUnit.KG,
      basePrice: usd(0.66 + idx * 0.022),
      inStock: true,
      subcategory: a.startsWith('Channel') ? 'Channel' : 'Angle',
      categorySlug: 'angle',
      manufacturerIndex: idx % 5,
      specs: { section: a, length: '6m' },
      features: ['Equal leg available'],
      applications: ['Bracing', 'Frames', 'Racking'],
    })
  }

  // Pipes (~$3.50–14 / m seamed; seamless higher)
  for (const [idx, d] of [
    '1/2"',
    '3/4"',
    '1"',
    '1.5"',
    '2"',
    '3"',
    '4"',
  ].entries()) {
    catalog.push({
      name: `Seamed pipe ${d}`,
      slug: slugify(['pipe', 'seamed', d]),
      description: `ERW seamed pipe ${d}.`,
      size: d,
      unit: ProductUnit.METER,
      basePrice: usd(3.5 + idx * 1.6),
      inStock: true,
      subcategory: 'Seamed',
      categorySlug: 'pipe',
      manufacturerIndex: idx % 5,
      specs: { nominal: d, type: 'ERW', standard: 'ASTM A53' },
      features: ['Pressure rated variants'],
      applications: ['Scaffold', 'Water lines', 'Structures'],
    })
  }
  for (const [idx, d] of ['1"', '2"', '3"'].entries()) {
    catalog.push({
      name: `Seamless pipe ${d}`,
      slug: slugify(['pipe', 'seamless', d]),
      description: `Seamless pipe ${d} for higher duty.`,
      size: d,
      unit: ProductUnit.METER,
      basePrice: usd(8.5 + idx * 4.5),
      inStock: true,
      subcategory: 'Seamless',
      categorySlug: 'pipe',
      manufacturerIndex: 2,
      specs: { nominal: d, type: 'Seamless' },
      features: ['No weld seam'],
      applications: ['Process piping'],
    })
  }

  // Wire (~$0.85–1.05 / kg)
  for (const [idx, g] of ['1.5mm', '2mm', '2.5mm', '3mm', '4mm'].entries()) {
    catalog.push({
      name: `Black wire ${g}`,
      slug: slugify(['wire', 'black', g]),
      description: `Annealed black wire ${g}.`,
      size: g,
      unit: ProductUnit.KG,
      basePrice: usd(0.85 + idx * 0.04),
      inStock: true,
      subcategory: 'Black',
      categorySlug: 'wire',
      manufacturerIndex: 2,
      specs: { diameter: g, finish: 'Black annealed' },
      features: ['Soft drawn'],
      applications: ['Binding', 'Fencing'],
    })
  }

  // Mesh panels (~$22–42 / piece)
  for (const [idx, mesh] of ['50x50', '100x100', '25x25'].entries()) {
    catalog.push({
      name: `Welded mesh ${mesh}`,
      slug: slugify(['mesh', 'welded', mesh]),
      description: `Welded wire mesh ${mesh} aperture.`,
      size: mesh,
      unit: ProductUnit.PIECE,
      basePrice: usd(28 + idx * 7),
      inStock: true,
      subcategory: 'Welded',
      categorySlug: 'mesh',
      manufacturerIndex: 3,
      specs: { aperture: mesh, panel: '2x3m' },
      features: ['Factory welded'],
      applications: ['Slabs', 'Security panels'],
    })
  }

  // Billets (~$510–560 / ton)
  for (const [idx, s] of ['120x120', '130x130', '150x150'].entries()) {
    catalog.push({
      name: `Carbon billet ${s}`,
      slug: slugify(['billet', 'carbon', s]),
      description: `Carbon steel billet ${s}.`,
      size: s,
      unit: ProductUnit.TON,
      basePrice: usd(510 + idx * 18),
      inStock: true,
      subcategory: 'Carbon',
      categorySlug: 'shamsh',
      manufacturerIndex: 0,
      specs: { section: s, grade: '3SP' },
      features: ['Mill certified'],
      applications: ['Rerolling'],
    })
  }

  // Tubes (~$0.74–0.90 / kg)
  for (const [idx, t] of [
    '40x40x2',
    '50x50x2',
    '60x60x3',
    '80x40x2',
    '100x50x3',
  ].entries()) {
    catalog.push({
      name: `SHS/RHS ${t}`,
      slug: slugify(['tube', t]),
      description: `Hollow section ${t}.`,
      size: t,
      unit: ProductUnit.KG,
      basePrice: usd(0.74 + idx * 0.03),
      inStock: true,
      subcategory: idx < 3 ? 'Industrial' : 'Column',
      categorySlug: 'qooti',
      manufacturerIndex: idx % 5,
      specs: { section: t, length: '6m' },
      features: ['Closed section'],
      applications: ['Frames', 'Furniture', 'Structures'],
    })
  }

  let created = 0
  for (const [i, item] of catalog.entries()) {
    const category = bySlug[item.categorySlug]
    if (!category) continue
    const priceFields = withPriceMotion(item.basePrice, i)
    const manufacturer = m(item.manufacturerIndex)

    const product = await prisma.product.create({
      data: {
        name: item.name,
        slug: item.slug,
        description: item.description,
        size: item.size,
        unit: item.unit,
        ...priceFields,
        weightKg: item.weightKg,
        inStock: item.inStock,
        images: [],
        subcategory: item.subcategory,
        specs: item.specs,
        features: item.features,
        applications: item.applications,
        categoryId: category.id,
        manufacturerId: manufacturer.id,
      },
    })

    if (
      priceFields.priceDirection !== PriceDirection.STABLE &&
      priceFields.previousPrice
    ) {
      await prisma.priceHistory.create({
        data: {
          productId: product.id,
          oldPrice: priceFields.previousPrice,
          newPrice: priceFields.price,
          direction: priceFields.priceDirection,
          delta: priceFields.priceDelta,
          note: 'Seed demo movement',
        },
      })
    }
    created++
  }

  console.log(`✅ ${created} products`)

  await prisma.customer.create({
    data: {
      name: 'Alex Mercer',
      email: 'alex@example-build.com',
      phone: '+15550100',
      company: 'Example Build Co.',
      address: '100 Market Street',
      city: 'Berlin',
    },
  })

  await prisma.quickOrder.create({
    data: {
      customerName: 'Alex Mercer',
      companyName: 'Example Build Co.',
      phoneNumber: '+15550100',
      city: 'Berlin',
      productSpecs: 'Ribbed rebar 16mm, 12m, ~20 tons',
      quantity: '20 tons',
      productName: 'Ribbed rebar 16mm',
    },
  })

  console.log('🎉 Seed complete.')
  console.log('   Admin: admin@hormozsteel.demo / admin123')
  console.log(`   Products: ${created}`)
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
