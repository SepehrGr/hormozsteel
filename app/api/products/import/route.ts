import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession, logAdminAction } from '@/lib/admin-auth';
import { updateProductPrice } from '@/lib/price-updater';
import { generateUniqueSlug } from '@/lib/slug-generator';

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const { products } = body;
    console.log(
      `Import API received ${Array.isArray(products) ? products.length : 0} rows`,
    );

    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: 'No products provided' },
        { status: 400 },
      );
    }

    const results = {
      updated: 0,
      created: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (let index = 0; index < products.length; index++) {
      const row = products[index];
      try {
        // If id provided, update existing product
        if (row.id) {
          // Check if product exists
          const existingProduct = await prisma.product.findUnique({
            where: { id: row.id },
          });

          if (!existingProduct) {
            results.failed++;
            results.errors.push(
              `Row ${index + 1}: product with id ${row.id} not found`,
            );
            continue;
          }

          // Build update data object (only include provided fields)
          const updateData: any = {};

          if (row.name !== undefined && row.name !== '')
            updateData.name = row.name;
          if (row.brand !== undefined && row.brand !== '')
            updateData.brand = row.brand;
          if (row.size !== undefined) updateData.size = row.size;
          if (
            row.weight !== undefined &&
            row.weight !== null &&
            row.weight !== ''
          ) {
            updateData.weight = Number(row.weight);
          }
          if (row.price !== undefined && row.price !== null) {
            updateData.price = Number(row.price);
          }
          if (row.inStock !== undefined) {
            updateData.inStock =
              row.inStock === true ||
              row.inStock === 'موجود' ||
              row.inStock === 'true';
          }
          if (row.categoryId !== undefined && row.categoryId !== '') {
            // Validate category exists
            const category = await prisma.productCategory.findUnique({
              where: { id: row.categoryId },
            });
            if (!category) {
              results.failed++;
              results.errors.push(
                `Row ${index + 1}: category ${row.categoryId} not found`,
              );
              continue;
            }
            updateData.categoryId = row.categoryId;
          }
          if (row.subcategory !== undefined && row.subcategory !== '') {
            updateData.subcategory = row.subcategory;
          }

          // Update slug if name changed
          if (updateData.name) {
            updateData.slug = await generateUniqueSlug(updateData.name, row.id);
          }

          // If price is being updated, use updateProductPrice to record history
          if (updateData.price !== undefined) {
            const priceUpdateRes = await updateProductPrice(
              row.id,
              updateData.price,
              `Imported via Excel by ${session.user.id}`,
            );

            if (!priceUpdateRes.success) {
              results.failed++;
              results.errors.push(`Row ${index + 1}: ${priceUpdateRes.error}`);
              continue;
            }

            // Remove price from updateData since it's already updated
            delete updateData.price;
          }

          // Update other fields if any remain
          if (Object.keys(updateData).length > 0) {
            await prisma.product.update({
              where: { id: row.id },
              data: updateData,
            });
          }

          results.updated++;
        } else {
          // Create new product
          // Validate required fields
          const required = [
            'name',
            'brand',
            'price',
            'categoryId',
            'subcategory',
          ];
          // Note: Price can be 0, so check for undefined/null instead of falsy
          const missing = required.filter((r) => {
            const value = row[r];
            if (r === 'price') {
              return value === undefined || value === null;
            }
            return !value;
          });
          if (missing.length > 0) {
            results.failed++;
            results.errors.push(
              `Row ${index + 1}: missing fields ${missing.join(', ')}`,
            );
            continue;
          }

          // Ensure category exists
          const category = await prisma.productCategory.findUnique({
            where: { id: row.categoryId },
          });
          if (!category) {
            results.failed++;
            results.errors.push(
              `Row ${index + 1}: category ${row.categoryId} not found`,
            );
            continue;
          }

          // Create product
          const uniqueSlug = await generateUniqueSlug(row.name);
          await prisma.product.create({
            data: {
              name: row.name,
              brand: row.brand,
              size: row.size || '',
              price: Number(row.price),
              categoryId: row.categoryId,
              subcategory: row.subcategory,
              weight:
                row.weight !== undefined &&
                row.weight !== null &&
                row.weight !== ''
                  ? Number(row.weight)
                  : undefined,
              inStock:
                row.inStock === true ||
                row.inStock === 'موجود' ||
                row.inStock === 'true',
              slug: uniqueSlug,
            },
          });

          results.created++;
        }
      } catch (err) {
        console.error('Import row error:', err);
        results.failed++;
        results.errors.push(
          `Row ${index + 1}: ${err instanceof Error ? err.message : 'Unknown error'}`,
        );
      }
    }

    // Log admin action (don't let this fail the whole import)
    try {
      await logAdminAction(
        session.user.id,
        'IMPORT_PRODUCTS',
        'PRODUCT',
        undefined,
        results,
        request,
      );
    } catch (logError) {
      console.error('Failed to log admin action:', logError);
      // Continue anyway - logging failure shouldn't fail the import
    }

    console.log('✅ Import completed successfully:', results);
    return NextResponse.json({ success: true, results }, { status: 200 });
  } catch (error) {
    console.error('❌ Import API error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to import products', details: message },
      { status: 500 },
    );
  }
}
