import mongoose from 'mongoose';
import { NextResponse } from 'next/server';

import Product from 'src/models/Product';
import { connectToDatabase } from 'src/lib/mongodb';
import { processImages, cleanupOldImages, processMultipartImages } from 'src/lib/upload';
import {
  parseFormData,
  UpdateProductSchema,
  sanitizeProductData,
  validateProductPermissions,
} from 'src/lib/validations/product';

// GET /api/products/[id] - Get a single product
export async function GET(request, { params }) {
  try {
    // Get user ID and role from middleware (already verified)
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const product = await Product.findById(id).populate('createdBy', 'name email').lean();

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check permissions: users can only see their own products, admins can see all
    if (userRole !== 'admin' && product.createdBy._id.toString() !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Transform to frontend format - return all images for single product
    const transformedProduct = {
      id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice,
      rating: product.rating,
      reviewCount: product.reviewCount,
      images: product.images || [], // Return ALL images for single product views
      category: product.category,
      status: product.status,
      stock: product.stock,
      sku: product.sku,
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

    return NextResponse.json(transformedProduct);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

// PUT /api/products/[id] - Update a product
export async function PUT(request, { params }) {
  try {
    // Get user ID and role from middleware (already verified)
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    // Handle FormData submission
    const formData = await request.formData();

    // Check if product exists
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check permissions
    try {
      validateProductPermissions(existingProduct, userId, userRole, 'update');
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    // Parse and validate form data
    let validatedData;
    try {
      validatedData = parseFormData(formData, UpdateProductSchema);
    } catch (validationError) {
      if (validationError.errors) {
        const errors = validationError.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
        return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
      }
      return NextResponse.json(
        { error: validationError.message || 'Invalid input' },
        { status: 400 }
      );
    }

    // Sanitize data based on user role
    const sanitizedData = sanitizeProductData(validatedData, userRole);

    // Handle images: combine new files and existing URLs
    const imageFiles = formData.getAll('images');
    const existingImagesString = formData.get('existingImages');
    const existingImageUrls = existingImagesString ? JSON.parse(existingImagesString) : [];

    // Process images if any changes
    let processedImages;
    if (imageFiles.length > 0 || existingImageUrls.length >= 0) {
      console.log(
        `Processing images - New files: ${imageFiles.length}, Existing URLs: ${existingImageUrls.length}`
      );

      // Process new image files
      const newProcessedImages =
        imageFiles.length > 0 ? await processMultipartImages(imageFiles) : [];
      console.log('New processed images:', newProcessedImages.length);

      // Process existing image URLs to get proper format
      const existingProcessedImages =
        existingImageUrls.length > 0 ? await processImages(existingImageUrls) : [];
      console.log('Existing processed images:', existingProcessedImages.length);

      // Combine existing and new images
      processedImages = [...existingProcessedImages, ...newProcessedImages];
      console.log('Total processed images:', processedImages.length);

      // Clean up old images that are being replaced
      await cleanupOldImages(existingProduct.images, processedImages);
    }

    // Build update data from sanitized input
    const updateData = { ...sanitizedData };
    if (processedImages !== undefined) {
      updateData.images = processedImages;
    }

    // If updating price or originalPrice, ensure originalPrice >= price
    if (updateData.price !== undefined || updateData.originalPrice !== undefined) {
      const currentPrice = updateData.price ?? existingProduct.price;
      const currentOriginalPrice = updateData.originalPrice ?? existingProduct.originalPrice;

      // Ensure originalPrice is at least equal to price
      if (currentOriginalPrice < currentPrice) {
        updateData.originalPrice = currentPrice;
      }
    }

    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate('createdBy', 'name email');

    // Transform to frontend format - return all images for single product
    const transformedProduct = {
      id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice,
      rating: product.rating,
      reviewCount: product.reviewCount,
      images: product.images || [], // Return ALL images for single product views
      category: product.category,
      status: product.status,
      stock: product.stock,
      sku: product.sku,
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

    return NextResponse.json(transformedProduct);
  } catch (error) {
    console.error('Error updating product:', error);

    if (error.code === 11000) {
      return NextResponse.json({ error: 'SKU already exists' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE /api/products/[id] - Delete a product
export async function DELETE(request, { params }) {
  try {
    // Get user ID and role from middleware (already verified)
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    // Check if product exists
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check permissions
    try {
      validateProductPermissions(existingProduct, userId, userRole, 'delete');
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    // Store image URLs before deletion
    const imagesToDelete = existingProduct.images ? [...existingProduct.images] : [];

    // Delete from database first
    await Product.findByIdAndDelete(id);

    // Then try to clean up images (if DB deletion succeeded)
    // This way, if file deletion fails, at least the DB is clean
    if (imagesToDelete.length > 0) {
      // Don't await - do it async to not block response
      cleanupOldImages(imagesToDelete, []).catch((err) => {
        console.error('Failed to delete product images, but product was removed from DB:', err);
      });
    }

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
