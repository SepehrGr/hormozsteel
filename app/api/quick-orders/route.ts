import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/quick-orders - Get all quick orders (Admin only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build where clause
    const where: any = {};

    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Get quick orders
    const [quickOrders, total] = await Promise.all([
      prisma.quickOrder.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.quickOrder.count({ where }),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      data: {
        quickOrders,
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
    console.error('Error fetching quick orders:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch quick orders',
      },
      { status: 500 }
    );
  }
}

// POST /api/quick-orders - Create a new quick order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerName,
      companyName,
      phoneNumber,
      city,
      productSpecs,
      quantity,
      deliveryDate,
      deliveryMethod,
      additionalNotes,
      productName,
    } = body;

    // Validation
    if (!customerName || !phoneNumber || !city || !productSpecs || !quantity) {
      return NextResponse.json(
        {
          success: false,
          error: 'لطفاً تمام فیلدهای ضروری را پر کنید',
        },
        { status: 400 }
      );
    }

    // Validate phone number format (Iranian phone numbers)
    const phoneRegex = /^(\+98|0)?9\d{9}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
      return NextResponse.json(
        {
          success: false,
          error: 'فرمت شماره تلفن صحیح نیست',
        },
        { status: 400 }
      );
    }

    // Create quick order
    const quickOrder = await prisma.quickOrder.create({
      data: {
        customerName: customerName.trim(),
        companyName: companyName?.trim() || null,
        phoneNumber: phoneNumber.trim(),
        city: city.trim(),
        productSpecs: productSpecs.trim(),
        quantity: quantity.trim(),
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        deliveryMethod: deliveryMethod?.toUpperCase() || 'PICKUP',
        additionalNotes: additionalNotes?.trim() || null,
        productName: productName?.trim() || null,
        status: 'PENDING',
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'سفارش شما با موفقیت ثبت شد. به زودی با شما تماس خواهیم گرفت.',
        data: quickOrder,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating quick order:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در ثبت سفارش. لطفاً دوباره تلاش کنید.',
      },
      { status: 500 }
    );
  }
}

// PATCH /api/quick-orders - Update quick order status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'شناسه سفارش الزامی است',
        },
        { status: 400 }
      );
    }

    const updateData: any = {};

    if (status) {
      updateData.status = status.toUpperCase();
    }

    const quickOrder = await prisma.quickOrder.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'وضعیت با موفقیت بروزرسانی شد',
      data: quickOrder,
    });
  } catch (error) {
    console.error('Error updating quick order:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در بروزرسانی وضعیت',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/quick-orders - Delete a quick order
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'شناسه سفارش الزامی است',
        },
        { status: 400 }
      );
    }

    await prisma.quickOrder.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'سفارش با موفقیت حذف شد',
    });
  } catch (error) {
    console.error('Error deleting quick order:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در حذف سفارش',
      },
      { status: 500 }
    );
  }
}
