import { db, auth } from './firebase-admin';

export async function verifyFirebaseIdToken(request) {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.split('Bearer ')[1];

  if (!token) {
    throw new Error('No token provided');
  }

  try {
    // ✅ Verify token
    const decoded = await auth.verifyIdToken(token);
    const { uid } = decoded;
    console.log(await auth.getUser(uid));

    // ✅ Fetch user info from Firestore
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      throw new Error('User does not exist in Firestore');
    }

    const user = userDoc.data();

    if (user.status !== 'active') {
      throw new Error(`Permission denied. Your account is ${user.status}`);
    }

    return {
      uid,
      email: decoded.email,
      ...user, // role, status, etc.
    };
  } catch (error) {
    throw new Error(error?.message || 'Invalid token');
  }
}
