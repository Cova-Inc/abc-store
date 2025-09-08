import { jwtVerify } from 'jose';
import { NextResponse } from 'next/server';

// Get JWT secret from environment
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    '/auth/jwt/sign-in',
    '/auth/jwt/sign-up',
    '/api/auth/sign-in',
    '/api/auth/sign-up',
  ];

  // Check if it's a public route
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // For API routes, verify JWT token
  if (pathname.startsWith('/api/')) {
    // Get JWT token from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];

    try {
      // Verify JWT token using jose (Edge Runtime compatible)
      const { payload } = await jwtVerify(token, JWT_SECRET);

      // Add user info to request headers for API routes to use
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.id);
      requestHeaders.set('x-user-email', payload.email);
      requestHeaders.set('x-user-role', payload.role);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      console.error('JWT verification failed:', error);
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
  }

  // For page routes, let the page components handle authentication
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
