import Box from '@mui/material/Box';

import { Logo } from 'src/components/logo';

import { useAuthContext } from 'src/auth/hooks';

import { HeaderSection } from './header-section';
import { AccountDrawer } from '../components/account-drawer';
import { SettingsButton } from '../components/settings-button';
// ----------------------------------------------------------------------

export function HeaderBase({ sx, data, slots, slotProps, onOpenNav, layoutQuery, ...other }) {
  const { authenticated } = useAuthContext();

  return (
    <HeaderSection
      sx={sx}
      layoutQuery={layoutQuery}
      slots={{
        ...slots,
        leftArea: <Logo data-slot="logo" />,
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
            {authenticated && <AccountDrawer data-slot="account" data={data?.account} />}
          </Box>
        ),
      }}
      slotProps={slotProps}
      {...other}
    />
  );
}
