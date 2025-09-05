import { NextResponse } from 'next/server';
import { connectToDatabase } from 'src/lib/mongodb';
import Product from 'src/models/Product';
import { processImages } from 'src/lib/upload';

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
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const search = searchParams.get('search') || '';
        const category = searchParams.get('category') || '';
        const status = searchParams.get('status') || '';
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') || 'desc';

        // Build filter object
        const filter = {};
        
        // Role-based filtering: users can only see their own products, admins can see all
        if (userRole !== 'admin') {
            filter.createdBy = userId;
        }
        
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
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
        const transformedProducts = products.map(product => {
            // Get primary image or fallback to first image
            const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
            
            return {
                id: product._id.toString(),
                name: product.name,
                description: product.description,
                price: product.price,
                originalPrice: product.originalPrice,
                rating: product.rating,
                reviewCount: product.reviews,
                image: primaryImage?.thumbnail || primaryImage?.url || null, // Primary image thumbnail for list
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
        });

        return NextResponse.json({
            products: transformedProducts,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        );
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
            status = userRole === 'admin' ? status || 'draft' : 'draft' // Non-admins cannot set status
        } = body;

        // Validate required fields
        if (!name || !description || !price || !category) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Process images - convert base64 to files, save to disk
        const processedImages = await processImages(images);

        // Create product
        const product = new Product({
            name,
            description,
            price,
            originalPrice,
            category,
            stock: stock || 0,
            sku,
            tags: tags || [],
            images: processedImages,
            status,
            createdBy: userId
        });

        await product.save();
        await product.populate('createdBy', 'name email');

        // Transform to frontend format - return all images for created product
        const transformedProduct = {
            id: product._id.toString(),
            name: product.name,
            description: product.description,
            price: product.price,
            originalPrice: product.originalPrice,
            rating: product.rating,
            reviewCount: product.reviews,
            images: product.images || [], // Return ALL images for single product
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

        return NextResponse.json(transformedProduct, { status: 201 });

    } catch (error) {
        console.error('Error creating product:', error);
        
        if (error.code === 11000) {
            return NextResponse.json(
                { error: 'SKU already exists' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to create product' },
            { status: 500 }
        );
    }
}