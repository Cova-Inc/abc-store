import { NextResponse } from 'next/server';

import User from 'src/models/User';
import { connectToDatabase } from 'src/lib/mongodb';

export async function GET(req) {
    try {
        // Connect to database
        await connectToDatabase();

        // Get user ID from middleware (already verified)
        const userId = req.headers.get('x-user-id');
        
        if (!userId) {
            return NextResponse.json(
                { message: 'User not authenticated' },
                { status: 401 }
            );
        }

        // Find user in database
        const user = await User.findById(userId).select('-passwordHash');
        
        if (!user) {
            return NextResponse.json(
                { message: 'User not found' },
                { status: 404 }
            );
        }

        // Response
        return NextResponse.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                avatar: user.avatar,
                lastLogin: user.lastLogin,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        return NextResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}