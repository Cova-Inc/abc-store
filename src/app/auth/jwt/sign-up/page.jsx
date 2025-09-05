'use client';

import { AuthGuard } from 'src/components/auth-guard';

import { JwtSignUpView } from 'src/sections/auth';

export default function Page() {
  return (
    <AuthGuard requireAuth={false}>
      <JwtSignUpView />
    </AuthGuard>
  );
}
