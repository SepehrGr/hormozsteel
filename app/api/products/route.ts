import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkApiRateLimitAndRespond } from '@/lib/rate-limit';

// GET /api/products - Get all products with optional filtering
export async function GET(request: NextRequest) {
  // Check rate limit
  const rateLimitResponse = checkApiRateLimitAndRespond(request)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const brand = searchParams.get('brand');
    const inStock = searchParams.get('inStock');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Validate sortBy field
    const validSortFields = [
      'createdAt',
      'updatedAt',
      'price',
      'name',
      'brand',
      'inStock',
    ];
    const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

    // Build where clause
    const where: any = {};

    if (category) {
      // Check if category is an ID (cuid format) or slug
      const isCuid = category.startsWith('c') && category.length > 20;

      if (isCuid) {
        where.categoryId = category;
      } else {
        // First find the category by slug to get its ID
        try {
          const categoryRecord = await prisma.productCategory.findUnique({
            where: { slug: category },
            select: { id: true },
          });

          if (!categoryRecord) {
            return NextResponse.json(
              {
                success: false,
                error: `Category with slug "${category}" not found`,
              },
              { status: 404 }
            );
          }

          // Use categoryId instead of relation filtering
          where.categoryId = categoryRecord.id;
        } catch (categoryError) {
          console.error('Error finding category:', categoryError);
          return NextResponse.json(
            {
              success: false,
              error: 'Failed to find category',
              details:
                categoryError instanceof Error
                  ? categoryError.message
                  : 'Unknown error',
            },
            { status: 500 }
          );
        }
      }
    }

    if (subcategory) {
      where.subcategory = subcategory;
    }

    if (brand) {
      where.brand = {
        contains: brand,
        mode: 'insensitive',
      };
    }

    if (inStock === 'true') {
      where.inStock = true;
    } else if (inStock === 'false') {
      where.inStock = false;
    }

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          brand: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Get products with relations
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          brand: true,
          size: true,
          price: true,
          previousPrice: true,
          changeType: true,
          changeAmount: true,
          lastPriceChange: true,
          unit: true,
          weight: true,
          inStock: true,
          images: true,
          categoryId: true,
          subcategory: true,
          thickness: true,
          diameter: true,
          grade: true,
          coating: true,
          standard: true,
          length: true,
          subtype: true,
          weightType: true,
          sheetType: true,
          pipeType: true,
          wireType: true,
          height: true,
          meshSize: true,
          packageType: true,
          specifications: true,
          features: true,
          applications: true,
          createdAt: true,
          updatedAt: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: {
          [finalSortBy]: sortOrder as 'asc' | 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage,
          hasPrevPage,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch products',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack:
          process.env.NODE_ENV === 'development' && error instanceof Error
            ? error.stack
            : undefined,
      },
      { status: 500 }
    );
  }
}

// POST /api/products - Create a new product
export async function POST(request: NextRequest) {
  // Check rate limit (stricter for write operations)
  const rateLimitResponse = checkApiRateLimitAndRespond(request, 50, 15 * 60 * 1000)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'name',
      'categoryId',
      'brand',
      'price',
      'subcategory',
    ];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          {
            success: false,
            error: `Missing required field: ${field}`,
          },
          { status: 400 }
        );
      }
    }

    // Generate slug from name
    const slug = body.name
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '') // Allow Persian characters
      .replace(/\s+/g, '-')
      .trim();

    // Check if category exists
    const categoryExists = await prisma.productCategory.findUnique({
      where: { id: body.categoryId },
    });

    if (!categoryExists) {
      return NextResponse.json(
        {
          success: false,
          error: 'دسته‌بندی انتخاب شده وجود ندارد',
          details: `Category with ID ${body.categoryId} not found`,
        },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug },
    });

    if (existingProduct) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product with this name already exists',
        },
        { status: 400 }
      );
    }

    // Prepare product data with default values for arrays
    const productData = {
      name: body.name,
      brand: body.brand,
      size: body.size || '',
      price: body.price,
      categoryId: body.categoryId,
      subcategory: body.subcategory,
      slug,
      inStock: body.inStock ?? true,
      description: body.description || null,
      unit: body.unit || 'kg',
      weight: body.weight || null,
      images: body.images || [],
      features: body.features || [],
      applications: body.applications || [],
      thickness: body.thickness || null,
      diameter: body.diameter || null,
      grade: body.grade || null,
      coating: body.coating || null,
      standard: body.standard || null,
      length: body.length || null,
      subtype: body.subtype || null,
      weightType: body.weightType || null,
      sheetType: body.sheetType || null,
      pipeType: body.pipeType || null,
      wireType: body.wireType || null,
      height: body.height || null,
      meshSize: body.meshSize || null,
      packageType: body.packageType || null,
      specifications: body.specifications || null,
    };

    // Create the product
    const product = await prisma.product.create({
      data: productData,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create product',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
