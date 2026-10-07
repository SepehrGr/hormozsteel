import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Total of one number per item: `sum(rows, row => row._count.products)`. */
export function sum<T>(items: T[], pick: (item: T) => number) {
  return items.reduce((total, item) => total + pick(item), 0)
}

/** Case-insensitive: does any value contain `query`? An empty query matches all. */
export function matchesSearch(
  query: string,
  values: (string | null | undefined)[],
) {
  const needle = query.trim().toLowerCase()

  return !needle || values.some(value => value?.toLowerCase().includes(needle))
}
