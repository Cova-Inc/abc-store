'use client';

import { useEffect } from 'react';

import { useRouter } from 'src/routes/hooks';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export function AuthGuard({ children, requireAuth = true, allowedRoles = [] }) {
  const { user, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Wait for auth check to complete

    if (requireAuth && !user) {
      // User not authenticated, redirect to sign in
      router.push('/auth/jwt/sign-in');
      return;
    }

    if (user && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      // User doesn't have required role, redirect to dashboard
      router.push('/');
      return;
    }

    if (!requireAuth && user) {
      // User is authenticated but shouldn't be on this page (e.g., auth pages)
      router.push('/');
      
    }
  }, [user, loading, requireAuth, allowedRoles, router]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Loading...
      </div>
    );
  }

  // Don't render children if user doesn't meet requirements
  if (requireAuth && !user) {
    return null;
  }

  if (user && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return null;
  }

  if (!requireAuth && user) {
    return null;
  }

  return children;
}