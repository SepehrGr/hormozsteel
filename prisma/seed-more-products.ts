import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addMoreProducts() {
  console.log('🌱 Adding more products...')

  // Get categories
  const categories = await prisma.productCategory.findMany()
  const rebarCategory = categories.find(c => c.slug === 'rebar')
  const profileCategory = categories.find(c => c.slug === 'profile')
  const sheetCategory = categories.find(c => c.slug === 'sheet')

  // Add 20 more products
  const additionalProducts = [
    // Rebar products
    {
      name: 'میلگرد آجدار 10',
      slug: 'milgerd-ajdar-10',
      brand: 'فولاد مبارکه',
      size: '10',
      price: 43000,
      inStock: true,
      categoryId: rebarCategory?.id!,
      subcategory: 'آجدار',
    },
    {
      name: 'میلگرد آجدار 14',
      slug: 'milgerd-ajdar-14',
      brand: 'ذوب آهن',
      size: '14',
      price: 45500,
      inStock: true,
      categoryId: rebarCategory?.id!,
      subcategory: 'آجدار',
    },
    {
      name: 'میلگرد آجدار 18',
      slug: 'milgerd-ajdar-18',
      brand: 'فولاد خوزستان',
      size: '18',
      price: 48000,
      inStock: true,
      categoryId: rebarCategory?.id!,
      subcategory: 'آجدار',
    },
    {
      name: 'میلگرد آجدار 20',
      slug: 'milgerd-ajdar-20',
      brand: 'فولاد مبارکه',
      size: '20',
      price: 49500,
      inStock: false,
      categoryId: rebarCategory?.id!,
      subcategory: 'آجدار',
    },
    {
      name: 'میلگرد آجدار 22',
      slug: 'milgerd-ajdar-22',
      brand: 'ذوب آهن',
      size: '22',
      price: 51000,
      inStock: true,
      categoryId: rebarCategory?.id!,
      subcategory: 'آجدار',
    },
    // Profile products
    {
      name: 'پروفیل IPE 80',
      slug: 'profile-ipe-80',
      brand: 'فولاد مبارکه',
      size: 'IPE 80',
      price: 48000,
      inStock: true,
      categoryId: profileCategory?.id!,
      subcategory: 'IPE',
    },
    {
      name: 'پروفیل IPE 100',
      slug: 'profile-ipe-100',
      brand: 'ذوب آهن',
      size: 'IPE 100',
      price: 50000,
      inStock: true,
      categoryId: profileCategory?.id!,
      subcategory: 'IPE',
    },
    {
      name: 'پروفیل IPE 140',
      slug: 'profile-ipe-140',
      brand: 'فولاد خوزستان',
      size: 'IPE 140',
      price: 54000,
      inStock: true,
      categoryId: profileCategory?.id!,
      subcategory: 'IPE',
    },
    {
      name: 'پروفیل UNP 80',
      slug: 'profile-unp-80',
      brand: 'فولاد مبارکه',
      size: 'UNP 80',
      price: 52000,
      inStock: true,
      categoryId: profileCategory?.id!,
      subcategory: 'UPE',
    },
    {
      name: 'پروفیل UNP 100',
      slug: 'profile-unp-100',
      brand: 'ذوب آهن',
      size: 'UNP 100',
      price: 53500,
      inStock: false,
      categoryId: profileCategory?.id!,
      subcategory: 'UPE',
    },
    // Sheet products
    {
      name: 'ورق سیاه 2 میلیمتر',
      slug: 'varaq-siah-2mm',
      brand: 'فولاد مبارکه',
      size: '2mm',
      price: 55000,
      inStock: true,
      categoryId: sheetCategory?.id!,
      subcategory: 'سیاه',
    },
    {
      name: 'ورق سیاه 3 میلیمتر',
      slug: 'varaq-siah-3mm',
      brand: 'ذوب آهن',
      size: '3mm',
      price: 56000,
      inStock: true,
      categoryId: sheetCategory?.id!,
      subcategory: 'سیاه',
    },
    {
      name: 'ورق سیاه 4 میلیمتر',
      slug: 'varaq-siah-4mm',
      brand: 'فولاد خوزستان',
      size: '4mm',
      price: 57500,
      inStock: true,
      categoryId: sheetCategory?.id!,
      subcategory: 'سیاه',
    },
    {
      name: 'ورق گالوانیزه 0.5',
      slug: 'varaq-galvanize-05mm',
      brand: 'فولاد مبارکه',
      size: '0.5mm',
      price: 62000,
      inStock: true,
      categoryId: sheetCategory?.id!,
      subcategory: 'گالوانیزه',
    },
    {
      name: 'ورق گالوانیزه 0.7',
      slug: 'varaq-galvanize-07mm',
      brand: 'ذوب آهن',
      size: '0.7mm',
      price: 63500,
      inStock: true,
      categoryId: sheetCategory?.id!,
      subcategory: 'گالوانیزه',
    },
  ]

  for (const product of additionalProducts) {
    await prisma.product.create({
      data: product,
    })
  }

  console.log(`✅ Added ${additionalProducts.length} more products`)
}

addMoreProducts()
  .catch(e => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
