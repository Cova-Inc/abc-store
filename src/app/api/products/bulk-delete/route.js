import { NextResponse } from 'next/server';
import { connectToDatabase } from 'src/lib/mongodb';
import Product from 'src/models/Product';
import mongoose from 'mongoose';
import { cleanupOldImages } from 'src/lib/upload';

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
        const { ids } = body;

        // Validate input
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json(
                { error: 'Invalid input: ids array is required' },
                { status: 400 }
            );
        }

        // Validate all IDs are valid MongoDB ObjectIds
        const validIds = ids.filter(id => mongoose.Types.ObjectId.isValid(id));
        
        if (validIds.length !== ids.length) {
            return NextResponse.json(
                { error: 'Some product IDs are invalid' },
                { status: 400 }
            );
        }

        // Build filter based on role
        const deleteFilter = { _id: { $in: validIds } };
        
        // Users can only delete their own draft products
        if (userRole !== 'admin') {
            deleteFilter.createdBy = userId;
            deleteFilter.status = 'draft'; // Users can only delete draft products
        }

        // First get all products to clean up their images
        const productsToDelete = await Product.find(deleteFilter);

        // Clean up images for each product
        for (const product of productsToDelete) {
            if (product.images && product.images.length > 0) {
                await cleanupOldImages(product.images, []);
            }
        }

        // Delete products using the same filter
        const result = await Product.deleteMany(deleteFilter);

        return NextResponse.json({
            message: `${result.deletedCount} products deleted successfully`,
            deletedCount: result.deletedCount
        });

    } catch (error) {
        console.error('Error deleting products:', error);
        return NextResponse.json(
            { error: 'Failed to delete products' },
            { status: 500 }
        );
    }
}