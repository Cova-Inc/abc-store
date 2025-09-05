'use client';

import React, { useState } from 'react';

import {
    Box,
    Card,
    Stack,
    Checkbox,
    Typography,
    IconButton,
    Tooltip,
    Rating,
    alpha,
    useTheme,
} from '@mui/material';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';
import { fNumber } from 'src/utils/format-number';

import { Label } from 'src/components/label';
import { Image } from 'src/components/image';
import { Iconify } from 'src/components/iconify';
import Link from 'next/link';

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
    ...other
}) {
    const theme = useTheme();
    const [imageError, setImageError] = useState(false);
    const handleSelect = () => onSelect(product.id);
    const handleEdit = () => onEdit(product.id);
    const handleDelete = () => onDelete(product);
    const handleImageError = () => setImageError(true);
    
    // Determine if user can edit/delete this product
    const isAdmin = currentUser?.role === 'admin';
    const isOwner = product.createdBy?.id === currentUser?.id;
    const isDraft = product.status === 'draft';
    
    // Show edit/delete buttons based on permissions
    const canEdit = isAdmin || (isOwner && isDraft);
    const canDelete = isAdmin || (isOwner && isDraft);

    const getStatusColor = (status) => {
        const statusMap = {
            active: 'success',
            inactive: 'warning',
            draft: 'info'
        };
        return statusMap[status] || 'default';
    };

    const getStatusLabel = (status) => {
        const statusMap = {
            active: 'Active',
            inactive: 'Inactive',
            draft: 'Draft',
            archived: 'Archived'
        };
        return statusMap[status] || status;
    };

    return (
        <Card
            sx={{
                p: 2,
                mb: 2,
                border: '1px solid',
                borderColor: isSelected ? alpha(theme.palette.primary.main, 0.4) : 'divider',
                backgroundColor: isSelected ? alpha(theme.palette.primary.main, 0.04) : 'background.paper',
                '&:hover': {
                    borderColor: alpha(theme.palette.primary.main, 0.4),
                    boxShadow: (t) => t.customShadows.z8,
                },
                transition: 'all 0.2s ease-in-out',
            }}
            {...other}
        >
            <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={2}
                alignItems="center"
            >
                {/* Checkbox */}
                <Checkbox
                    checked={isSelected}
                    onChange={handleSelect}
                    size="small"
                    sx={{ alignSelf: { xs: 'flex-start', md: 'center' } }}
                />

                {/* Product Image - Show primary image only */}
                <Box
                    sx={{
                        width: { xs: 120, md: 80 },
                        height: { xs: 120, md: 80 },
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
                            src={product.image.url || product.image}
                            alt={product.image.alt || product.name}
                            onError={handleImageError}
                            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    ) : (
                        <Iconify
                            icon="solar:box-bold"
                            width={32}
                            sx={{ color: 'text.disabled' }}
                        />
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
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, "&:hover": { color: 'primary.main' } }}>
                                    {product.name}
                                </Typography>
                            </Link>

                            {/* Rating */}
                            <Stack alignItems={{ xs: 'center', md: 'flex-start' }} direction={{ xs: "column", md: "row" }} spacing={0.5}>
                                <Rating
                                    value={product.rating || 0}
                                    precision={0.1}
                                    size="small"
                                    readOnly
                                />
                                <Typography variant="caption" color="text.secondary">
                                    ({fNumber(product.reviewCount || 0)} reviews)
                                </Typography>
                            </Stack>
                        </Box>

                        <Stack alignItems={{ xs: 'center', md: 'flex-end' }} spacing={0.5}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                {product.originalPrice && product.originalPrice > product.price && (
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
                            <Label
                                color={getStatusColor(product.status)}
                                variant="soft"
                                size="small"
                            >
                                {getStatusLabel(product.status)}
                            </Label>

                            {product.category && (
                                <Label color="info" variant="soft" size="small">
                                    {product.category}
                                </Label>
                            )}

                            {product.stock !== undefined && (
                                <Typography variant="body2" color="text.secondary" sx={{ textDecorationLine: product.stock === 0 ? 'line-through' : 'none' }}>
                                    Stock: {product.stock}
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
                    {canEdit && (
                        <Tooltip title="Edit">
                            <IconButton size="large" onClick={handleEdit}>
                                <Iconify icon="solar:pen-bold" width={18} />
                            </IconButton>
                        </Tooltip>
                    )}

                    {canDelete && (
                        <Tooltip title="Delete">
                            <IconButton size="large" onClick={handleDelete}>
                                <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                            </IconButton>
                        </Tooltip>
                    )}
                </Stack>
            </Stack>
        </Card>
    );
}