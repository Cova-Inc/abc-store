import { AuthGuard } from 'src/components/auth-guard';

import { JwtSignInView } from 'src/sections/auth';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <AuthGuard requireAuth={false}>
      <JwtSignInView />
    </AuthGuard>
  );
}
