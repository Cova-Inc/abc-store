import { NextResponse } from 'next/server';

import Product from 'src/models/Product';
import { connectToDatabase } from 'src/lib/mongodb';
import { generateProductImagesPDF } from 'src/lib/pdf-generator';

// POST /api/products/download-all-pdf - Generate PDF for all products with filters
export async function POST(request) {
  try {
    // Get user ID and role from middleware (already verified)
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { filters = {} } = await request.json();

    // Build filter based on user role and provided filters
    const filter = {};
    if (userRole !== 'admin') {
      filter.createdBy = userId;
    }

    // Apply additional filters if provided
    if (filters.category) {
      filter.category = filters.category;
    }
    if (filters.search) {
      filter.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
        { sku: { $regex: filters.search, $options: 'i' } },
      ];
    }
    if (filters.status) {
      filter.status = filters.status;
    }

    // Fetch all products with the applied filters
    const products = await Product.find(filter).populate('createdBy', 'name email').lean();

    if (products.length === 0) {
      return NextResponse.json({ error: 'No products found' }, { status: 404 });
    }

    // Transform products for PDF generation
    const productsForPDF = products.map((product) => ({
      id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      images: product.images || [],
      createdBy: product.createdBy
        ? {
            name: product.createdBy.name,
            email: product.createdBy.email,
          }
        : null,
    }));

    // Generate PDF
    const pdfBuffer = await generateProductImagesPDF(productsForPDF);

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="all-products-${Date.now()}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error generating PDF for all products:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate PDF',
        details: error.message,
      },
      { status: 500 }
    );
  }
}