import { NextResponse } from 'next/server';

import Product from 'src/models/Product';
import { connectToDatabase } from 'src/lib/mongodb';
import { processMultipartImages } from 'src/lib/upload';
import {
  parseFormData,
  CreateProductSchema,
  sanitizeProductData,
} from 'src/lib/validations/product';

// GET /api/products - Get all products with filtering and pagination
export async function GET(request) {
  try {
    // Get user ID and role from middleware (already verified)
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page'), 10) || 1;
    const limit = parseInt(searchParams.get('limit'), 10) || 10;
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || '';
    const createdBy = searchParams.get('createdBy') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build filter object
    const filter = {};

    // Role-based filtering: users can only see their own products, admins can see all
    if (userRole !== 'admin') {
      filter.createdBy = userId;
    } else if (createdBy) {
      // Admin can filter by specific user
      filter.createdBy = createdBy;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (status) {
      filter.status = status;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Get products with pagination
    const products = await Product.find(filter)
      .populate('createdBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Product.countDocuments(filter);

    // Transform products for list view - only return thumbnail for performance
    const transformedProducts = products.map((product) => {
      // Get primary image or fallback to first image
      const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];

      return {
        id: product._id.toString(),
        name: product.name,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice,
        rating: product.rating,
        reviewCount: product.reviewCount,
        image: primaryImage?.thumbnail || primaryImage?.url || null, // Primary image thumbnail for list
        category: product.category,
        status: product.status,
        stock: product.stock,
        sku: product.sku,
        supplier: product.supplier,
        tags: product.tags || [],
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        createdBy: product.createdBy
          ? {
              id: product.createdBy._id.toString(),
              name: product.createdBy.name,
              email: product.createdBy.email,
            }
          : null,
      };
    });

    return NextResponse.json({
      products: transformedProducts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST /api/products - Create a new product
export async function POST(request) {
  try {
    // Get user ID and role from middleware (already verified)
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Handle FormData submission
    const formData = await request.formData();

    try {
      // Parse and validate form data
      const validatedData = parseFormData(formData, CreateProductSchema);

      // Sanitize data based on user role
      const productData = sanitizeProductData(validatedData, userRole);

      // Process image files
      const imageFiles = formData.getAll('images');
      const processedImages = await processMultipartImages(imageFiles);

      // Create product with validated data
      const product = new Product({
        ...productData,
        images: processedImages,
        createdBy: userId,
      });

      await product.save();
      await product.populate('createdBy', 'name email');

      // Transform to frontend format
      const transformedProduct = {
        id: product._id.toString(),
        name: product.name,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice,
        rating: product.rating || 0,
        reviewCount: product.reviewCount || 0,
        images: product.images || [],
        category: product.category,
        status: product.status,
        stock: product.stock,
        sku: product.sku,
        supplier: product.supplier,
        tags: product.tags || [],
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        createdBy: product.createdBy
          ? {
              id: product.createdBy._id.toString(),
              name: product.createdBy.name,
              email: product.createdBy.email,
            }
          : null,
      };

      return NextResponse.json(transformedProduct, { status: 201 });
    } catch (validationError) {
      if (validationError.errors) {
        // Zod validation error
        const errors = validationError.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
        return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
      }
      return NextResponse.json(
        { error: validationError.message || 'Invalid input' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error creating product:', error);

    if (error.code === 11000) {
      return NextResponse.json({ error: 'SKU already exists' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
