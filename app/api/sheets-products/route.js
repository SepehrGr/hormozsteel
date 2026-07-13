import { getProducts } from '@/lib/sheets';

export async function GET() {
  try {
    const products = await getProducts();

    return Response.json({
      success: true,
      data: products,
      count: products.length,
    });
  } catch (error) {
    console.error('Error in products API:', error);

    return Response.json(
      {
        success: false,
        error: 'Failed to fetch products from Google Sheets',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
