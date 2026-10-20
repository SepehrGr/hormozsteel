import { NextResponse } from 'next/server'

import { getLatestPrices } from '@/lib/data/prices'

export async function GET() {
  try {
    const products = await getLatestPrices()

    return NextResponse.json({
      success: true,
      count: products.length,
      products,
    })
  } catch (error) {
    console.error('Error fetching latest prices:', error)

    return NextResponse.json(
      { success: false, error: 'Failed to fetch latest prices' },
      { status: 500 },
    )
  }
}
