import { NextResponse } from 'next/server';
import { connectToDatabase } from 'src/lib/mongodb';
import Product from 'src/models/Product';
import { generateProductImagesPDF } from 'src/lib/pdf-generator';

// POST /api/products/download-pdf - Generate PDF for selected products
export async function POST(request) {
  try {
    // Get user ID and role from middleware (already verified)
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { productIds } = await request.json();

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ error: 'Product IDs are required' }, { status: 400 });
    }

    // Validate product IDs
    const validProductIds = productIds.filter((id) => typeof id === 'string' && id.length > 0);

    if (validProductIds.length === 0) {
      return NextResponse.json({ error: 'No valid product IDs provided' }, { status: 400 });
    }

    // Build filter based on user role
    const filter = { _id: { $in: validProductIds } };
    if (userRole !== 'admin') {
      filter.createdBy = userId;
    }

    // Fetch products with all images
    const products = await Product.find(filter).populate('createdBy', 'name email').lean();

    if (products.length === 0) {
      return NextResponse.json({ error: 'No products found' }, { status: 404 });
    }

    // Check if user has access to all requested products
    if (userRole !== 'admin') {
      const unauthorizedProducts = products.filter(
        (product) => product.createdBy._id.toString() !== userId
      );
      if (unauthorizedProducts.length > 0) {
        return NextResponse.json({ error: 'Access denied to some products' }, { status: 403 });
      }
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
        'Content-Disposition': `attachment; filename="products-${Date.now()}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate PDF',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
