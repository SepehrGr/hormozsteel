import { prisma } from '@/lib/prisma';

/**
 * Generate a unique slug for a product
 * If the slug already exists, appends a number suffix (-1, -2, etc.)
 * @param baseName - The product name to generate slug from
 * @param excludeId - If provided, ignores products with this ID (for updates)
 * @returns A unique slug
 */
export async function generateUniqueSlug(
  baseName: string,
  excludeId?: string,
): Promise<string> {
  const baseSlug = baseName
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '') // Allow Persian characters
    .replace(/\s+/g, '-')
    .trim();

  // Handle empty slug
  if (!baseSlug) {
    throw new Error('Cannot generate slug from empty name');
  }

  // Check if base slug is available
  const existing = await prisma.product.findUnique({
    where: { slug: baseSlug },
  });

  if (!existing || existing.id === excludeId) {
    return baseSlug;
  }

  // If slug exists, find a unique one by adding a number suffix
  let counter = 1;
  let newSlug = `${baseSlug}-${counter}`;

  while (true) {
    const conflict = await prisma.product.findUnique({
      where: { slug: newSlug },
    });

    if (!conflict || conflict.id === excludeId) {
      return newSlug;
    }

    counter++;
    newSlug = `${baseSlug}-${counter}`;

    // Safety check to prevent infinite loop
    if (counter > 1000) {
      throw new Error(`Could not generate unique slug for: ${baseName}`);
    }
  }
}
