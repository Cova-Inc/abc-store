import { useCallback } from 'react';

import { LoadingButton } from '@mui/lab';

import { signOut } from 'src/auth/context/jwt/action';

export function SignOutButton({ onClose, ...other }) {
  const handleLogout = useCallback(async () => {
    try {
      await signOut?.();
      onClose?.();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [onClose]);

  return (
    <LoadingButton
      fullWidth
      variant="soft"
      size="large"
      color="error"
      onClick={handleLogout}
      {...other}
    >
      Logout
    </LoadingButton>
  );
}
