import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

import User from 'src/models/User';
import { connectToDatabase } from 'src/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export async function POST(req) {
  try {
    // Connect to database
    await connectToDatabase();

    // Parse request body
    const body = await req.json();
    const { name, email, password, confirmPassword } = body;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return NextResponse.json({ message: 'Passwords do not match' }, { status: 400 });
    }

    // Password strength validation
    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ message: 'User with this email already exists' }, { status: 409 });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: name === 'admin' ? 'admin' : 'user', // Default role is user and this is just for testing
      isActive: true,
    });

    // Save user to database
    const savedUser = await newUser.save();

    // Generate JWT token
    const tokenPayload = {
      id: savedUser._id.toString(),
      email: savedUser.email,
      role: savedUser.role,
    };
    const accessToken = generateToken(tokenPayload);

    // Update last login
    await User.findByIdAndUpdate(savedUser._id, { lastLogin: new Date() });

    // Return success response (exclude password hash)
    const userResponse = {
      id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      role: savedUser.role,
      isActive: savedUser.isActive,
      createdAt: savedUser.createdAt,
    };

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: userResponse,
        accessToken,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);

    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return NextResponse.json({ message: 'Validation failed', errors }, { status: 400 });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json({ message: 'User with this email already exists' }, { status: 409 });
    }

    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
