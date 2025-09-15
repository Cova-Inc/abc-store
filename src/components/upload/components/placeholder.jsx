import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import { useTranslate } from 'src/locales/use-locales';
import { UploadIllustration } from 'src/assets/illustrations';

// ----------------------------------------------------------------------

export function UploadPlaceholder({ ...other }) {
  const { t } = useTranslate('products');

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
      {...other}
    >
      <UploadIllustration hideBackground sx={{ width: 200 }} />

      <Stack spacing={1} sx={{ textAlign: 'center' }}>
        <Box sx={{ typography: 'h6' }}>{t('form.uploadTitle')}</Box>
        <Box sx={{ typography: 'body2', color: 'text.secondary' }}>
          {t('form.uploadDescription')}
          <br />
          <Box
            component="span"
            sx={{ mx: 0.5, color: 'primary.main', textDecoration: 'underline' }}
          >
            {t('form.uploadSelect')}
          </Box>{' '}
          {t('form.uploadSuffix')}
        </Box>
      </Stack>
    </Box>
  );
}
