import { AuthGuard } from 'src/components/auth-guard';

import { UserListView } from 'src/sections/admin/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <AuthGuard allowedRoles={['admin']}>
      <UserListView />
    </AuthGuard>
  );
}
