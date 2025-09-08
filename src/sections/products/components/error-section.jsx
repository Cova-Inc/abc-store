import React from 'react';

import { Box, Stack, Button, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';

export function ErrorSection({
  error = '500',
  title = 'Something went wrong',
  description = 'An unexpected error occurred. Please try again.',
  onAction,
  actionText = 'Go Back',
}) {
  const getErrorIcon = () => {
    switch (error) {
      case '403':
        return 'mdi:shield-lock-outline';
      case '404':
        return 'mdi:file-find-outline';
      case '500':
      default:
        return 'mdi:alert-circle-outline';
    }
  };

  const getErrorColor = () => {
    switch (error) {
      case '403':
        return 'warning.main';
      case '404':
        return 'info.main';
      case '500':
      default:
        return 'error.main';
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 400,
        p: 3,
      }}
    >
      <Stack spacing={3} alignItems="center" maxWidth={480}>
        <Iconify icon={getErrorIcon()} width={80} sx={{ color: getErrorColor() }} />

        <Stack spacing={1} alignItems="center" textAlign="center">
          <Typography variant="h4">{title}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {description}
          </Typography>
        </Stack>

        {onAction && (
          <Button
            variant="contained"
            onClick={onAction}
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
          >
            {actionText}
          </Button>
        )}
      </Stack>
    </Box>
  );
}
