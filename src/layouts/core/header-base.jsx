import Box from '@mui/material/Box';

import { useAuthContext } from 'src/auth/hooks';

import { HeaderSection } from './header-section';
import { AccountDrawer } from '../components/account-drawer';
import { SettingsButton } from '../components/settings-button';
// ----------------------------------------------------------------------

export function HeaderBase({
  sx,
  data,
  slots,
  slotProps,
  onOpenNav,
  layoutQuery,
  ...other
}) {
  const { authenticated } = useAuthContext();

  if (!authenticated) {
    return null;
  }

  return (
    <HeaderSection
      sx={sx}
      layoutQuery={layoutQuery}
      slots={{
        ...slots,
        rightArea: (
          <Box
              data-area="right"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 1, sm: 1.5 },
              }}
            >
              <SettingsButton data-slot="settings" />
              <AccountDrawer data-slot="account" data={data?.account} />
            </Box>
        ),
      }}
      slotProps={slotProps}
      {...other}
    />
  );
}
