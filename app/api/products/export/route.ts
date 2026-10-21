import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

import { requireApiAuth } from '@/lib/admin-auth'
import { productFilters } from '@/lib/product-filters'
import { SHEET, STOCK_LABEL } from '@/lib/product-sheet'
import { prisma } from '@/lib/prisma'
import { checkApiRateLimitAndRespond } from '@/lib/rate-limit'

/**
 * The admin product list as an .xlsx file, with the same filters and order
 * as the page (`?q`, `?category`, `?stock`, `?sort`, `?dir`), all pages.
 */
export async function GET(request: NextRequest) {
  const limited = checkApiRateLimitAndRespond(request)

  if (limited) return limited

  const { error } = await requireApiAuth()

  if (error) return error

  const { where, orderBy } = productFilters(
    Object.fromEntries(request.nextUrl.searchParams),
  )
  const products = await prisma.product.findMany({
    where,
    orderBy,
    select: {
      id: true,
      name: true,
      size: true,
      weightKg: true,
      price: true,
      inStock: true,
      subcategory: true,
      category: { select: { name: true } },
      manufacturer: { select: { name: true } },
    },
  })

  const sheet = XLSX.utils.json_to_sheet(
    products.map(p => ({
      [SHEET.id]: p.id,
      [SHEET.name]: p.name,
      [SHEET.mill]: p.manufacturer?.name ?? '',
      [SHEET.size]: p.size,
      [SHEET.weight]: p.weightKg ?? '',
      [SHEET.price]: p.price.toNumber(),
      [SHEET.stock]: p.inStock ? STOCK_LABEL.in : STOCK_LABEL.out,
      [SHEET.category]: p.category.name,
      [SHEET.subcategory]: p.subcategory ?? '',
    })),
    // Keeps the column order, and the headers in an empty export
    { header: Object.values(SHEET) },
  )

  sheet['!cols'] = [28, 32, 22, 14, 12, 12, 12, 20, 16].map(wch => ({ wch }))

  const book = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(book, sheet, 'Products')

  const date = new Date().toISOString().slice(0, 10)

  return new NextResponse(
    XLSX.write(book, { type: 'buffer', bookType: 'xlsx' }),
    {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="products-${date}.xlsx"`,
      },
    },
  )
}
