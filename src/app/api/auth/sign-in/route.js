import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

import User from 'src/models/User';
import { generateToken } from 'src/lib/jwt';
import { connectToDatabase } from 'src/lib/mongodb';

export async function POST(req) {
  try {
    // Connect to database
    await connectToDatabase();

    // Parse request body
    const body = await req.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ 
      email: email.toLowerCase().trim(),
      isActive: true 
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const tokenPayload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };
    const accessToken = generateToken(tokenPayload);

    // Update last login
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    // Return success response (exclude password hash)
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
    };

    return NextResponse.json({
      message: 'Login successful',
      user: userResponse,
      accessToken,
    });
  } catch (error) {
    console.error('Signin error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}