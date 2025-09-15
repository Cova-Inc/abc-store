'use client';

import Link from 'next/link';
import React, { useState } from 'react';

import {
  Box,
  Card,
  Stack,
  alpha,
  Rating,
  Tooltip,
  Checkbox,
  useTheme,
  Typography,
  IconButton,
} from '@mui/material';

import { fDate } from 'src/utils/format-time';
import { fNumber, fCurrency, fShortenNumber } from 'src/utils/format-number';

import { useTranslate } from 'src/locales/use-locales';
import { PRODUCT_STATUS_OPTIONS, PRODUCT_CATEGORY_OPTIONS } from 'src/config-global';

import { Label } from 'src/components/label';
import { Image } from 'src/components/image';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function ProductListItem({
  product,
  currentUser,
  isSelected,
  onSelect,
  onView,
  onEdit,
  onDelete,
  onProductUpdate,
  isMobile,
  ...other
}) {
  const theme = useTheme();
  const { t } = useTranslate('products');
  const [imageError, setImageError] = useState(false);
  const handleSelect = (e) => {
    e.stopPropagation();
    onSelect(product.id);
  };
  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(product.id);
  };
  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(product);
  };
  const handleImageError = () => setImageError(true);

  // Determine if user can edit/delete this product
  const isAdmin = currentUser?.role === 'admin';
  const isOwner = product.createdBy?.id === currentUser?.id;
  const isDraft = product.status === 'draft';

  // Show edit/delete buttons based on permissions
  const canEdit = isAdmin || (isOwner && isDraft);
  const canDelete = isAdmin || (isOwner && isDraft);

  // Get status config from global options
  const statusConfig = PRODUCT_STATUS_OPTIONS.find((option) => option.value === product.status) || {
    value: product.status,
    label: product.status,
    color: 'default',
  };

  // Get category config for translation
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

  // Get translated status label
  const getStatusLabel = () => {
    if (statusConfig.label && statusConfig.label.startsWith('status.')) {
      return t(statusConfig.label);
    }
    return statusConfig.label;
  };

  // Mobile card layout (compact)
  if (isMobile) {
    return (
      <Card
        sx={{
          p: 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid',
          borderColor: isSelected ? alpha(theme.palette.primary.main, 0.4) : 'divider',
          backgroundColor: isSelected
            ? alpha(theme.palette.primary.main, 0.04)
            : 'background.paper',
          cursor: 'pointer',
          '&:hover': {
            borderColor: alpha(theme.palette.primary.main, 0.4),
            boxShadow: (theme) => theme.customShadows.z4,
          },
          transition: 'all 0.2s ease-in-out',
        }}
        onClick={() => onView(product.id)}
        {...other}
      >
        {/* Mobile Layout */}
        <Box sx={{ position: 'relative' }}>
          {/* Checkbox in corner */}
          <Box
            sx={{
              position: 'absolute',
              top: -8,
              left: -8,
              zIndex: 9,
              width: 32,
              height: 32,
              borderRadius: 1,
              bgcolor: 'background.paper',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Checkbox
              checked={isSelected}
              onChange={handleSelect}
              onClick={(e) => e.stopPropagation()}
              size="small"
              sx={{ p: 0 }}
            />
          </Box>

          {/* Product Image */}
          <Box
            sx={{
              width: '100%',
              paddingTop: '100%', // 1:1 aspect ratio
              position: 'relative',
              borderRadius: 1,
              overflow: 'hidden',
              backgroundColor: 'grey.100',
            }}
          >
            {product.image && !imageError ? (
              <Image
                src={product.image}
                alt={product.id}
                onError={handleImageError}
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <Iconify icon="solar:box-bold" width={48} sx={{ color: 'text.disabled' }} />
              </Box>
            )}
          </Box>

          {/* Status Badge */}
          <Label
            color={statusConfig.color}
            variant="filled"
            size="small"
            sx={{
              position: 'absolute',
              top: -7,
              right: -5,
              borderRadius: 2,
              textTransform: 'capitalize',
            }}
          >
            {getStatusLabel()}
          </Label>
        </Box>

        {/* Product Details */}
        <Stack spacing={0.5} sx={{ mt: 1, flex: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            {/* Name */}
            <Typography variant="subtitle2">{product.name}</Typography>

            {/* Price */}
            <Stack direction="row" alignItems="center" spacing={0.5}>
              {product.originalPrice > product.price && (
                <Typography
                  variant="caption"
                  color="text.disabled"
                  sx={{ textDecoration: 'line-through' }}
                >
                  {fCurrency(product.originalPrice)}
                </Typography>
              )}
              <Typography variant="subtitle1" color="primary.main" sx={{ fontWeight: 600 }}>
                {fCurrency(product.price)}
              </Typography>
            </Stack>
          </Stack>
          {/* Rating */}
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Rating value={product.rating} precision={0.1} size="small" readOnly />
            <Typography variant="caption" color="text.secondary">
              ({fShortenNumber(product.reviewCount)})
            </Typography>
          </Stack>

          {/* Stock & Category */}
          <Stack direction="row" spacing={0.5} alignItems="center">
            {product.category && (
              <Label color="default" variant="soft" size="small">
                {getCategoryLabel()}
              </Label>
            )}
            {product.stock !== undefined && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ textDecorationLine: product.stock === 0 ? 'line-through' : 'none' }}
              >
                Stock: {product.stock}
              </Typography>
            )}
          </Stack>
        </Stack>

        {/* Action Buttons */}
        <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
          {canEdit && (
            <IconButton size="small" onClick={handleEdit}>
              <Iconify icon="solar:pen-bold" width={16} />
            </IconButton>
          )}
          {canDelete && (
            <IconButton size="small" onClick={handleDelete}>
              <Iconify icon="solar:trash-bin-trash-bold" width={16} />
            </IconButton>
          )}
        </Stack>
      </Card>
    );
  }

  // Desktop layout (existing)
  return (
    <Card
      sx={{
        p: 1.5,
        mb: 1.5,
        border: '1px solid',
        borderColor: isSelected ? alpha(theme.palette.primary.main, 0.4) : 'divider',
        backgroundColor: isSelected ? alpha(theme.palette.primary.main, 0.04) : 'background.paper',
        cursor: 'pointer',
        '&:hover': {
          borderColor: alpha(theme.palette.primary.main, 0.4),
          boxShadow: (theme) => theme.customShadows.z8,
        },
        transition: 'all 0.2s ease-in-out',
      }}
      {...other}
      onClick={() => onView(product.id)}
    >
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
        {/* Checkbox */}
        <Checkbox
          checked={isSelected}
          onChange={handleSelect}
          onClick={(e) => e.stopPropagation()}
          size="small"
          sx={{ alignSelf: { xs: 'flex-start', md: 'center' } }}
        />

        {/* Product Image - Show primary image only */}
        <Box
          sx={{
            width: 100,
            height: 100,
            flexShrink: 0,
            borderRadius: 1,
            overflow: 'hidden',
            backgroundColor: 'grey.100',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {product.image && !imageError ? (
            <Image
              src={product.image}
              alt={product.id}
              onError={handleImageError}
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <Iconify icon="solar:box-bold" width={32} sx={{ color: 'text.disabled' }} />
          )}
        </Box>

        {/* Product Details */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Product Name and Price */}
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            alignItems={{ xs: 'center', md: 'flex-start' }}
            justifyContent="space-between"
            spacing={1}
            sx={{ mb: 1 }}
          >
            <Box sx={{ flex: 1, minWidth: 0, textAlign: { xs: 'center', md: 'left' } }}>
              <Link
                href={`/products/${product.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 600, '&:hover': { color: 'primary.main' } }}
                >
                  {product.name}
                </Typography>
              </Link>

              {/* Rating */}
              <Stack
                alignItems={{ xs: 'center', md: 'flex-start' }}
                direction={{ xs: 'column', md: 'row' }}
                spacing={0.5}
              >
                <Rating value={product.rating} precision={0.1} size="small" readOnly />
                <Typography variant="caption" color="text.secondary">
                  ({(product.reviewCount || 0) > 0
                    ? `${fNumber(product.reviewCount)} ${t('reviews')}`
                    : t('noReviews')})
                </Typography>
              </Stack>
            </Box>

            <Stack alignItems={{ xs: 'center', md: 'flex-end' }} spacing={0.5}>
              <Stack direction="row" alignItems="center" spacing={1}>
                {product.originalPrice > product.price && (
                  <Typography
                    variant="body2"
                    color="text.disabled"
                    sx={{ textDecoration: 'line-through' }}
                  >
                    {fCurrency(product.originalPrice)}
                  </Typography>
                )}
                <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
                  {fCurrency(product.price)}
                </Typography>
              </Stack>
            </Stack>
          </Stack>

          {/* Description */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 1,
              textAlign: { xs: 'center', md: 'left' },
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {product.description}
          </Typography>

          {/* Labels and Additional Info */}
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            alignItems={{ xs: 'center', md: 'flex-start' }}
            justifyContent="space-between"
            spacing={1}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              flexWrap="wrap"
              justifyContent={{ xs: 'center', md: 'flex-start' }}
            >
              <Label color={statusConfig.color} variant="soft" size="small">
                {getStatusLabel()}
              </Label>

              {product.category && (
                <Label color="info" variant="soft" size="small">
                  {getCategoryLabel()}
                </Label>
              )}

              {product.stock !== undefined && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textDecorationLine: product.stock === 0 ? 'line-through' : 'none' }}
                >
                  {t('stockLabel')}: {product.stock}
                </Typography>
              )}
            </Stack>

            <Stack
              direction={{ xs: 'column', md: 'row' }}
              alignItems={{ xs: 'center', md: 'flex-end' }}
              spacing={0.5}
            >
              <Typography variant="caption" color="text.disabled">
                {fDate(product.createdAt)}
              </Typography>

              {product.createdBy && isAdmin && (
                <Typography variant="caption" color="text.disabled">
                  By {product.createdBy.name || product.createdBy.email || 'Unknown User'}
                </Typography>
              )}
            </Stack>
          </Stack>
        </Box>

        {/* Action Buttons */}
        <Stack direction="row" spacing={0.5}>
          {canEdit ? (
            <Tooltip title="Edit">
              <IconButton size="large" onClick={handleEdit}>
                <Iconify icon="solar:pen-bold" width={18} />
              </IconButton>
            </Tooltip>
          ) : (
            <Box sx={{ width: 42 }} />
          )}

          {canDelete ? (
            <Tooltip title="Delete">
              <IconButton size="large" onClick={handleDelete}>
                <Iconify icon="solar:trash-bin-trash-bold" width={18} />
              </IconButton>
            </Tooltip>
          ) : (
            <Box sx={{ width: 42 }} />
          )}
        </Stack>
      </Stack>
    </Card>
  );
}
