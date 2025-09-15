'use client';

import React, { useEffect, useCallback } from 'react';

import {
  Box,
  Chip,
  Grid,
  Stack,
  Button,
  Rating,
  Tooltip,
  Divider,
  Typography,
  IconButton,
  CircularProgress,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { fDate } from 'src/utils/format-time';
import { fCurrency, fShortenNumber } from 'src/utils/format-number';

import { useBoolean } from 'src/hooks';
import { DashboardContent } from 'src/layouts/dashboard';
import { PRODUCT_STATUS_OPTIONS, PRODUCT_CATEGORY_OPTIONS } from 'src/config-global';
import { useTranslate } from 'src/locales/use-locales';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { ErrorSection } from 'src/components/result-section';

import { useAuthContext } from 'src/auth/hooks';

import { useProducts } from '../hooks';
import { ProductDetailsCarousel } from '../components/product-details-carousel';
// ----------------------------------------------------------------------

export default function ProductDetailsView({ params }) {
  const router = useRouter();
  const { user } = useAuthContext();
  const confirmDelete = useBoolean();
  const { t } = useTranslate('products');

  // Use the products hook for all operations
  const { product, loading, error, fetchProduct, deleteProduct } = useProducts();

  // Fetch product data from API using the hook
  useEffect(() => {
    const loadProduct = async () => {
      if (params.id) {
        try {
          await fetchProduct(params.id);
        } catch (err) {
          console.error('Error fetching product:', err);
          toast.error(err.message || 'Failed to fetch product');
        }
      }
    };

    loadProduct();
  }, [params.id, fetchProduct]);

  const handleBack = useCallback(() => {
    router.push(paths.main.products.root);
  }, [router]);

  const handleEdit = useCallback(() => {
    router.push(paths.main.products.edit(params.id));
  }, [router, params.id]);

  const handleDeleteConfirm = useCallback(async () => {
    try {
      // Use deleteProduct from the hook
      await deleteProduct(params.id);
      toast.success('Product deleted successfully');
      confirmDelete.onFalse();
      router.push(paths.main.products.root);
    } catch (err) {
      toast.error(err.message || 'Failed to delete product');
      confirmDelete.onFalse();
    }
  }, [params.id, router, confirmDelete, deleteProduct]);

  const handleDelete = useCallback(() => {
    confirmDelete.onTrue();
  }, [confirmDelete]);

  // Determine permissions
  const isAdmin = user?.role === 'admin';
  const isOwner = product?.createdBy?.id === user?.id;
  const isDraft = product?.status === 'draft';

  const canEdit = isAdmin || (isOwner && isDraft);
  const canDelete = isAdmin || (isOwner && isDraft);
  const canView = isAdmin || isOwner;

  if (loading) {
    return (
      <DashboardContent>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 400,
          }}
        >
          <Stack alignItems="center" spacing={2}>
            <CircularProgress />
          </Stack>
        </Box>
      </DashboardContent>
    );
  }

  if (error) {
    return (
      <ErrorSection
        error={error.code || '500'}
        title={
          error.code === 403
            ? 'Access Denied'
            : error.code === 404
              ? 'Product Not Found'
              : 'Something went wrong'
        }
        description={error.message || 'An unexpected error occurred'}
        onAction={handleBack}
        actionText="Back"
      />
    );
  }

  if (!product && !loading) {
    return (
      <ErrorSection
        error="404"
        title="Product Not Found"
        description="The product you're looking for doesn't exist or has been removed."
        onAction={handleBack}
        actionText="Back"
      />
    );
  }

  // Check if user has permission to view this product
  if (!canView) {
    return (
      <ErrorSection
        error="403"
        title="Access Denied"
        description="You don't have permission to view this product."
        onAction={handleBack}
        actionText="Back"
      />
    );
  }

  const statusConfig = PRODUCT_STATUS_OPTIONS.find((option) => option.value === product.status) || {
    value: product?.status,
    label: product?.status,
    color: 'default',
  };

  // Get translated status label
  const getStatusLabel = () => {
    if (statusConfig.label && statusConfig.label.startsWith('status.')) {
      return t(statusConfig.label);
    }
    return statusConfig.label;
  };

  const categoryConfig = PRODUCT_CATEGORY_OPTIONS.find(
    (option) => option.value === product.category
  ) || {
    value: product?.category,
    label: product?.category,
  };

  // Get translated category label
  const getCategoryLabel = () => {
    if (categoryConfig.label && categoryConfig.label.startsWith('categories.')) {
      return t(categoryConfig.label);
    }
    return categoryConfig.label;
  };

  return (
    <DashboardContent>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2} justifyContent="space-between">
          <Button onClick={handleBack} startIcon={<Iconify icon="eva:arrow-back-fill" />}>
            {t('back')}
          </Button>

          <Stack direction="row" alignItems="center" spacing={2}>
            {canEdit && (
              <Tooltip title="Edit">
                <IconButton onClick={handleEdit}>
                  <Iconify icon="solar:pen-bold" />
                </IconButton>
              </Tooltip>
            )}
            {canDelete && (
              <Tooltip title="Delete">
                <IconButton onClick={handleDelete}>
                  <Iconify icon="solar:trash-bin-trash-bold" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Stack>
      </Box>

      <Grid container spacing={5}>
        {/* Product Images Carousel */}
        <Grid item xs={12} md={6}>
          {product.images && product.images.length > 0 ? (
            <ProductDetailsCarousel images={product.images.map((img) => img.url)} />
          ) : (
            <Box
              sx={{
                aspectRatio: '1/1',
                borderRadius: 1,
                overflow: 'hidden',
                backgroundColor: 'grey.100',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Iconify icon="solar:box-bold" width={64} sx={{ color: 'text.disabled' }} />
            </Box>
          )}
        </Grid>

        {/* Product Details */}
        <Grid item xs={12} md={6}>
          <Stack spacing={3}>
            <Stack direction="column" alignItems="flex-start" spacing={1}>
              <Label
                color={statusConfig.color}
                variant="soft"
                sx={{
                  textTransform: 'capitalize',
                }}
              >
                {getStatusLabel()}
              </Label>

              <Typography variant="h5">{product.name}</Typography>

              <Stack
                direction="row"
                alignItems="center"
                sx={{ color: 'text.disabled', typography: 'body2' }}
              >
                <Rating
                  size="small"
                  value={product.rating}
                  precision={0.1}
                  readOnly
                  sx={{ mr: 1 }}
                />
                {product.reviewCount > 0
                  ? `(${fShortenNumber(product.reviewCount)} ${t('reviews')})`
                  : `(${t('noReviews')})`}
              </Stack>

              <Stack direction="row" alignItems="center" spacing={2}>
                <Typography variant="h4" color="primary.main">
                  {fCurrency(product.price)}
                </Typography>
                {product.originalPrice > 0 && product.originalPrice > product.price && (
                  <>
                    <Typography
                      variant="h6"
                      color="text.disabled"
                      sx={{ textDecoration: 'line-through' }}
                    >
                      {fCurrency(product.originalPrice)}
                    </Typography>
                    <Chip
                      label={`${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF`}
                      color="error"
                      size="small"
                    />
                  </>
                )}
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {product.sku ? `SKU: ${product.sku}` : t('noSku')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {product.description}
              </Typography>

              <Divider sx={{ borderStyle: 'dashed', width: '100%' }} />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    {t('stock')}
                  </Typography>
                  <Typography variant="h6">{product.stock}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    {t('category')}
                  </Typography>
                  <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                    {getCategoryLabel()}
                  </Typography>
                </Grid>
              </Grid>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <Stack direction="column" spacing={1} flexWrap="wrap">
                  <Typography variant="body2" color="text.secondary">
                    {t('tags')}
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {product.tags.map((tag) => (
                      <Chip key={tag} label={tag} size="small" variant="outlined" />
                    ))}
                  </Stack>
                </Stack>
              )}

              <Divider sx={{ borderStyle: 'dashed', width: '100%' }} />

              <Stack
                spacing={1}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ width: '100%' }}
              >
                <Typography variant="body2" color="text.secondary">
                  Added:
                </Typography>
                <Typography variant="body2">{fDate(product.createdAt)}</Typography>
              </Stack>

              <Stack
                spacing={1}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ width: '100%' }}
              >
                <Typography variant="body2" color="text.secondary">
                  By:
                </Typography>
                <Typography variant="body2">{product.createdBy.name}</Typography>
              </Stack>
            </Stack>
          </Stack>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDelete.value}
        onClose={confirmDelete.onFalse}
        title="商品を削除する"
        content={
          <>
            <strong>{product?.name}</strong>を本当に削除しますか?
            <br />
            この操作は元に戻せません。
          </>
        }
        action={
          <Button variant="contained" color="error" onClick={handleDeleteConfirm}>
            削除
          </Button>
        }
      />
    </DashboardContent>
  );
}
