import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * Verify JWT token and return decoded payload
 * @param {string} token - JWT token to verify
 * @returns {object|null} - Decoded token payload or null if invalid
 */
export function verifyToken(token) {
  try {
    if (!token) return null;
    
    // Remove 'Bearer ' prefix if present
    const cleanToken = token.replace(/^Bearer\s+/, '');
    
    const decoded = jwt.verify(cleanToken, JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error.message);
    return null;
  }
}

/**
 * Generate JWT token
 * @param {object} payload - Token payload
 * @param {string} expiresIn - Token expiration time
 * @returns {string} - JWT token
 */
export function generateToken(payload, expiresIn = '24h') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Extract token from request headers
 * @param {Request} req - Next.js request object
 * @returns {string|null} - Extracted token or null
 */
export function extractTokenFromRequest(req) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return null;
  
  return authHeader.replace(/^Bearer\s+/, '');
}

/**
 * Extract token from cookies
 * @param {Request} req - Next.js request object
 * @returns {string|null} - Extracted token or null
 */
export function extractTokenFromCookies(req) {
  const token = req.cookies.get('accessToken')?.value;
  return token || null;
}