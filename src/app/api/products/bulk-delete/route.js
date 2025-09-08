import mongoose from 'mongoose';
import { NextResponse } from 'next/server';

import Product from 'src/models/Product';
import { cleanupOldImages } from 'src/lib/upload';
import { connectToDatabase } from 'src/lib/mongodb';

// POST /api/products/bulk-delete - Delete multiple products
export async function POST(request) {
  try {
    // Get user ID and role from middleware (already verified)
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const body = await request.json();
    const { ids, filters } = body;

    // Build base delete filter
    const deleteFilter = {};

    // Handle deletion by IDs
    if (ids && Array.isArray(ids) && ids.length > 0) {
      // Validate all IDs are valid MongoDB ObjectIds
      const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));

      if (validIds.length !== ids.length) {
        return NextResponse.json({ error: 'Some product IDs are invalid' }, { status: 400 });
      }

      deleteFilter._id = { $in: validIds };
    }
    // Handle deletion by filters (for delete all)
    else if (filters) {
      // Apply filters
      if (filters.search) {
        deleteFilter.$or = [
          { name: { $regex: filters.search, $options: 'i' } },
          { description: { $regex: filters.search, $options: 'i' } },
          { sku: { $regex: filters.search, $options: 'i' } },
        ];
      }
      if (filters.category) {
        deleteFilter.category = filters.category;
      }
      if (filters.status) {
        deleteFilter.status = filters.status;
      }
    } else {
      return NextResponse.json(
        { error: 'Either ids array or filters object is required' },
        { status: 400 }
      );
    }

    // Users can only delete their own draft products
    if (userRole !== 'admin') {
      deleteFilter.createdBy = userId;
      deleteFilter.status = 'draft'; // Users can only delete draft products
    }

    // First get all products to clean up their images
    const productsToDelete = await Product.find(deleteFilter);

    // Clean up images for all products in parallel
    await Promise.all(
      productsToDelete
        .filter((product) => product.images && product.images.length > 0)
        .map((product) => cleanupOldImages(product.images, []))
    );

    // Delete products using the same filter
    const result = await Product.deleteMany(deleteFilter);

    return NextResponse.json({
      message: `${result.deletedCount} products deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Error deleting products:', error);
    return NextResponse.json({ error: 'Failed to delete products' }, { status: 500 });
  }
}
