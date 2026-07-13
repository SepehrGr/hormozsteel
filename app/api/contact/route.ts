import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/contact - Get all contact forms (Admin only)
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

    // Get contact forms
    const [contactForms, total] = await Promise.all([
      prisma.contactForm.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.contactForm.count({ where }),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      data: {
        contactForms,
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
    console.error('Error fetching contact forms:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch contact forms',
      },
      { status: 500 }
    );
  }
}

// POST /api/contact - Create a new contact form submission
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, email, message } = body;

    // Validation
    if (!name || !phone || !message) {
      return NextResponse.json(
        {
          success: false,
          error: 'لطفاً تمام فیلدهای الزامی را پر کنید',
        },
        { status: 400 }
      );
    }

    // Validate email format if provided
    if (email && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          {
            success: false,
            error: 'فرمت ایمیل صحیح نیست',
          },
          { status: 400 }
        );
      }
    }

    // Create contact form
    const contactForm = await prisma.contactForm.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        email: email ? email.trim().toLowerCase() : null,
        message: message.trim(),
        status: 'NEW',
      },
    });

    return NextResponse.json(
      {
        success: true,
        message:
          'پیام شما با موفقیت ارسال شد. به زودی با شما تماس خواهیم گرفت.',
        data: contactForm,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating contact form:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در ارسال پیام. لطفاً دوباره تلاش کنید.',
      },
      { status: 500 }
    );
  }
}

// PATCH /api/contact - Update contact form status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, reply } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'شناسه فرم الزامی است',
        },
        { status: 400 }
      );
    }

    const updateData: any = {};

    if (status) {
      updateData.status = status.toUpperCase();
    }

    if (reply) {
      updateData.reply = reply;
      updateData.repliedAt = new Date();
      updateData.status = 'REPLIED';
    }

    const contactForm = await prisma.contactForm.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'وضعیت با موفقیت بروزرسانی شد',
      data: contactForm,
    });
  } catch (error) {
    console.error('Error updating contact form:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در بروزرسانی وضعیت',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/contact - Delete a contact form
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'شناسه فرم الزامی است',
        },
        { status: 400 }
      );
    }

    await prisma.contactForm.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'فرم تماس با موفقیت حذف شد',
    });
  } catch (error) {
    console.error('Error deleting contact form:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در حذف فرم تماس',
      },
      { status: 500 }
    );
  }
}
