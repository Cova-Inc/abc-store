import { NextResponse } from 'next/server';

import Product from 'src/models/Product';
import { connectToDatabase } from 'src/lib/mongodb';

// GET /api/products/uploaders - Get all users who have uploaded products
export async function GET(request) {
  try {
    // Get user ID and role from middleware (already verified)
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can see all uploaders
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectToDatabase();

    // Get distinct users who have created products
    const uploaderIds = await Product.distinct('createdBy');

    // Get user details for each uploader
    const User = (await import('src/models/User')).default;
    const uploaderDetails = await User.find({ _id: { $in: uploaderIds } }, 'name email')
      .sort({ name: 1 })
      .lean();

    // Transform to return format
    const transformedUploaders = uploaderDetails.map((user) => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    }));

    return NextResponse.json({
      uploaders: transformedUploaders,
      total: transformedUploaders.length,
    });
  } catch (error) {
    console.error('Error fetching product uploaders:', error);
    return NextResponse.json({ error: 'Failed to fetch product uploaders' }, { status: 500 });
  }
}
