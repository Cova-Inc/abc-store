'use client';

import React, { useCallback } from 'react';

import { Box, Card, Stack, Button, Divider, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useTranslate } from 'src/locales/use-locales';
import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { useAuthContext } from 'src/auth/hooks';

import { useProductForm } from '../hooks';
import { ProductForm } from '../components/product-form';

// ----------------------------------------------------------------------

export default function ProductNewView() {
  const router = useRouter();
  const { user } = useAuthContext();
  const { t } = useTranslate('products');

  const { form, methods, onSubmit, isSubmitting, reset } = useProductForm();

  const handleBack = useCallback(() => {
    router.push(paths.main.products.root);
  }, [router]);

  const handleSubmit = useCallback(
    async (data) => {
      try {
        await onSubmit(data);
        toast.success(t('newProduct.success'));
        // Redirect after successful submission
        setTimeout(() => {
          router.push(paths.main.products.root);
        }, 500);
      } catch (err) {
        console.error('Product creation error:', err);
        toast.error(err.message || t('newProduct.error'));
      }
    },
    [onSubmit, router, t]
  );

  return (
    <DashboardContent>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2}>
        <Button
          onClick={handleBack}
          size="large"
          startIcon={<Iconify icon="eva:arrow-back-fill" />}
        >
          {t('back')}
        </Button>
      </Stack>

      {/* Product Form */}
      <Card sx={{ p: 3, mt: 3 }}>
        <Box>
          <Typography variant="h4">{t('newProduct.title')}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {t('newProduct.description')}
          </Typography>
        </Box>
        <Divider sx={{ my: 2, borderStyle: 'dashed' }} />
        <ProductForm
          form={form}
          methods={methods}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          onReset={reset}
          currentUser={user}
        />
      </Card>
    </DashboardContent>
  );
}
