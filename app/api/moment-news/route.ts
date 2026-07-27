import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { mapDirectionToLegacy } from '@/lib/product-dto'

export async function GET() {
  try {
    const today = new Date()

    today.setHours(0, 0, 0, 0)

    const priceChanges = await prisma.priceHistory.findMany({
      where: { changedAt: { gte: today } },
      orderBy: { changedAt: 'desc' },
      include: {
        product: {
          include: {
            category: { select: { name: true } },
            manufacturer: { select: { name: true } },
          },
        },
      },
    })

    // If no changes today, show recent history for the demo
    const source =
      priceChanges.length > 0
        ? priceChanges
        : await prisma.priceHistory.findMany({
            take: 30,
            orderBy: { changedAt: 'desc' },
            include: {
              product: {
                include: {
                  category: { select: { name: true } },
                  manufacturer: { select: { name: true } },
                },
              },
            },
          })

    const formattedChanges = source
      .map(change => {
        const product = change.product

        if (!product) return null

        return {
          id: change.id,
          productId: change.productId,
          time: change.changedAt.toISOString().slice(11, 19),
          date: change.changedAt.toISOString().slice(0, 10),
          productName: product.name,
          brand: product.manufacturer?.name || '-',
          size: product.size || '-',
          category: product.category?.name || '-',
          subcategory: product.subcategory || '-',
          oldPrice: change.oldPrice,
          newPrice: change.newPrice,
          changeType: mapDirectionToLegacy(change.direction),
          changeAmount: change.delta,
          notes: change.note,
        }
      })
      .filter(Boolean) as Array<Record<string, unknown>>

    const latestChangesMap = new Map<string, (typeof formattedChanges)[0]>()

    for (const change of formattedChanges) {
      const pid = change.productId as string

      if (!latestChangesMap.has(pid)) latestChangesMap.set(pid, change)
    }
    const uniqueChanges = Array.from(latestChangesMap.values())

    const summary = {
      totalChanges: uniqueChanges.length,
      increases: uniqueChanges.filter(c => c.changeType === 'increase').length,
      decreases: uniqueChanges.filter(c => c.changeType === 'decrease').length,
      stable: uniqueChanges.filter(c => c.changeType === 'stable').length,
    }

    return NextResponse.json({
      success: true,
      date: new Date().toISOString().slice(0, 10),
      summary,
      changes: uniqueChanges,
    })
  } catch (error) {
    console.error('Error fetching moment news:', error)

    return NextResponse.json(
      { success: false, error: 'Failed to fetch price news' },
      { status: 500 },
    )
  }
}
