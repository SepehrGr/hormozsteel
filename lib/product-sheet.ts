/**
 * The products spreadsheet's column headers. The export writes them and the
 * import reads them back, so an exported file can be edited and re-imported.
 */
export const SHEET = {
  id: 'ID',
  name: 'Name',
  mill: 'Mill',
  size: 'Size',
  weight: 'Weight (kg)',
  price: 'Price (USD)',
  stock: 'Stock',
  category: 'Category',
  subcategory: 'Sub-line',
} as const

/** What the Stock column says, matching the admin form. */
export const STOCK_LABEL = { in: 'In stock', out: 'On inquiry' } as const
