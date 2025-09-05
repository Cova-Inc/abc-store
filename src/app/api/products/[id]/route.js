import { NextResponse } from 'next/server';
import { connectToDatabase } from 'src/lib/mongodb';
import Product from 'src/models/Product';
import mongoose from 'mongoose';
import { processImages, cleanupOldImages } from 'src/lib/upload';

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
            return NextResponse.json(
                { error: 'Invalid product ID' },
                { status: 400 }
            );
        }

        const product = await Product.findById(id)
            .populate('createdBy', 'name email')
            .lean();

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        // Check permissions: users can only see their own products, admins can see all
        if (userRole !== 'admin' && product.createdBy._id.toString() !== userId) {
            return NextResponse.json(
                { error: 'Access denied' },
                { status: 403 }
            );
        }

        // Transform to frontend format - return all images for single product
        const transformedProduct = {
            id: product._id.toString(),
            name: product.name,
            description: product.description,
            price: product.price,
            originalPrice: product.originalPrice,
            rating: product.rating,
            reviewCount: product.reviews,
            images: product.images || [], // Return ALL images for single product views
            category: product.category,
            status: product.status,
            stock: product.stock,
            sku: product.sku,
            tags: product.tags || [],
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
            createdBy: product.createdBy ? {
                id: product.createdBy._id.toString(),
                name: product.createdBy.name,
                email: product.createdBy.email
            } : null
        };

        return NextResponse.json(transformedProduct);

    } catch (error) {
        console.error('Error fetching product:', error);
        return NextResponse.json(
            { error: 'Failed to fetch product' },
            { status: 500 }
        );
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
            return NextResponse.json(
                { error: 'Invalid product ID' },
                { status: 400 }
            );
        }

        const body = await request.json();
        const {
            name,
            description,
            price,
            originalPrice,
            category,
            stock,
            sku,
            tags,
            images,
            status
        } = body;

        // Check if product exists
        const existingProduct = await Product.findById(id);
        if (!existingProduct) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        // Check permissions: 
        // - Admins can edit all products
        // - Users can only edit their own products AND only if status is 'draft'
        if (userRole !== 'admin') {
            if (existingProduct.createdBy.toString() !== userId) {
                return NextResponse.json(
                    { error: 'Access denied - not your product' },
                    { status: 403 }
                );
            }
            if (existingProduct.status !== 'draft') {
                return NextResponse.json(
                    { error: 'Access denied - can only edit draft products' },
                    { status: 403 }
                );
            }
        }

        // Process images if provided
        let processedImages;
        if (images !== undefined) {
            processedImages = await processImages(images);
            // Clean up old images that are being replaced
            await cleanupOldImages(existingProduct.images, processedImages);
        }

        // Update product
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (price !== undefined) updateData.price = price;
        if (originalPrice !== undefined) updateData.originalPrice = originalPrice;
        if (category !== undefined) updateData.category = category;
        if (stock !== undefined) updateData.stock = stock;
        if (sku !== undefined) updateData.sku = sku;
        if (tags !== undefined) updateData.tags = tags;
        if (processedImages !== undefined) updateData.images = processedImages;
        // Only admins can change status
        if (status !== undefined && userRole === 'admin') updateData.status = status;

        const product = await Product.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('createdBy', 'name email');

        // Transform to frontend format - return all images for single product
        const transformedProduct = {
            id: product._id.toString(),
            name: product.name,
            description: product.description,
            price: product.price,
            originalPrice: product.originalPrice,
            rating: product.rating,
            reviewCount: product.reviews,
            images: product.images || [], // Return ALL images for single product views
            category: product.category,
            status: product.status,
            stock: product.stock,
            sku: product.sku,
            tags: product.tags || [],
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
            createdBy: product.createdBy ? {
                id: product.createdBy._id.toString(),
                name: product.createdBy.name,
                email: product.createdBy.email
            } : null
        };

        return NextResponse.json(transformedProduct);

    } catch (error) {
        console.error('Error updating product:', error);
        
        if (error.code === 11000) {
            return NextResponse.json(
                { error: 'SKU already exists' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to update product' },
            { status: 500 }
        );
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
            return NextResponse.json(
                { error: 'Invalid product ID' },
                { status: 400 }
            );
        }

        // Check if product exists
        const existingProduct = await Product.findById(id);
        if (!existingProduct) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        // Check permissions:
        // - Admins can delete all products
        // - Users can only delete their own products AND only if status is 'draft'
        if (userRole !== 'admin') {
            if (existingProduct.createdBy.toString() !== userId) {
                return NextResponse.json(
                    { error: 'Access denied - not your product' },
                    { status: 403 }
                );
            }
            if (existingProduct.status !== 'draft') {
                return NextResponse.json(
                    { error: 'Access denied - can only delete draft products' },
                    { status: 403 }
                );
            }
        }

        // Clean up images before deleting product
        if (existingProduct.images && existingProduct.images.length > 0) {
            await cleanupOldImages(existingProduct.images, []);
        }

        await Product.findByIdAndDelete(id);

        return NextResponse.json({ message: 'Product deleted successfully' });

    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json(
            { error: 'Failed to delete product' },
            { status: 500 }
        );
    }
}