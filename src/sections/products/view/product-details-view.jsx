'use client';

import React, { useState, useEffect, useCallback } from 'react';

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

import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { CONFIG } from 'src/config-global';
import { getProduct } from '../actions';
import { ProductDetailsCarousel } from '../components/product-details-carousel';
// ----------------------------------------------------------------------

export default function ProductDetailsView({ params }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [product, setProduct] = useState(null);
    // Fetch product data from API
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);

                // Fetch real product data from API
                const productData = await getProduct(params.id);
                setProduct(productData);

            } catch (err) {
                console.error('Error fetching product:', err);
                toast.error(err.message || 'Failed to fetch product');
                setProduct(null);
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchProduct();
        }
    }, [params.id]);

    const handleBack = useCallback(() => {
        router.push(paths.main.products.root);
    }, [router]);

    const handleEdit = useCallback(() => {
        router.push(paths.main.products.edit(params.id));
    }, [router, params.id]);

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
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                            Loading product...
                        </Typography>
                    </Stack>
                </Box>
            </DashboardContent>
        );
    }

    if (!product) {
        return (
            <DashboardContent>
                <Stack direction="row" alignItems="center" spacing={2} >
                    <Button onClick={handleBack} startIcon={<Iconify icon="eva:arrow-back-fill" />}>
                        Back
                    </Button>

                </Stack>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Box
                        component="img"
                        alt="empty content"
                        src={`${CONFIG.site.basePath}/assets/icons/empty/ic-cart.svg`}
                        sx={{ width: 1, maxWidth: 160, mt: 4 }}
                    />

                    <Typography variant="h4" gutterBottom>
                        Product Not Found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        The product you&apos;re looking for doesn&apos;t exist or has been removed.
                    </Typography>
                </Box>
            </DashboardContent>
        );
    }

    return (
        <DashboardContent>
            {/* Header */}
            <Box sx={{ mb: 3 }}>
                <Stack direction="row" alignItems="center" spacing={2} justifyContent="space-between">
                    <Button onClick={handleBack} startIcon={<Iconify icon="eva:arrow-back-fill" />}>
                        Back
                    </Button>

                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Tooltip title="Edit">
                            <IconButton onClick={handleEdit}>
                                <Iconify icon="solar:pen-bold" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                            <IconButton>
                                <Iconify icon="solar:trash-bin-trash-bold" />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Stack>
            </Box>

            <Grid container spacing={3}>
                {/* Product Images Carousel */}
                <Grid item xs={12} md={4}>
                    {product.images && product.images.length > 0 ? (
                        <ProductDetailsCarousel images={product.images.map(img => img.url)} />
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
                <Grid item xs={12} md={8}>
                    <Stack spacing={3}>
                        <Box sx={{ p: 3, borderRadius: 1, border: '1px solid', borderColor: 'divider', borderStyle: 'dashed' }}>
                            <Stack direction="column" alignItems="flex-start" spacing={2}>
                                <Typography variant="h5">
                                    {product.name}
                                </Typography>

                                <Stack direction="row" alignItems="center" sx={{ color: 'text.disabled', typography: 'body2' }}>
                                    <Rating size="small" value={4} precision={0.1} readOnly sx={{ mr: 1 }} />
                                    {`(${fShortenNumber(5234525)} reviews)`}
                                </Stack>

                                <Stack direction="row" alignItems="center" spacing={2}>

                                    {product.originalPrice && product.originalPrice > product.price && (
                                        <>
                                            <Typography variant="h4" color="primary.main">
                                                {fCurrency(product.price)}
                                            </Typography>

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
                                    {product.description}
                                </Typography>

                                <Divider sx={{ borderStyle: 'dashed', width: '100%' }} />

                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="text.secondary">
                                            Stock Quantity
                                        </Typography>
                                        <Typography variant="h6">
                                            {product.stock} units
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="text.secondary">
                                            Category
                                        </Typography>
                                        <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                                            {product.category}
                                        </Typography>
                                    </Grid>
                                </Grid>

                                {/* Tags */}
                                {product.tags && product.tags.length > 0 && (

                                    <Stack direction="column" spacing={1} flexWrap="wrap">
                                        <Typography variant="body2" color="text.secondary">
                                            Tags
                                        </Typography>
                                        <Stack direction="row" spacing={1} flexWrap="wrap">
                                            {product.tags.map((tag) => (
                                                <Chip
                                                    key={tag}
                                                    label={tag}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            ))}
                                        </Stack>
                                    </Stack>

                                )}

                                <Divider sx={{ borderStyle: 'dashed', width: '100%' }} />

                                <Stack spacing={1} direction="row" alignItems="center" justifyContent="space-between" sx={{ width: '100%' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Added:
                                    </Typography>
                                    <Typography variant="body2">
                                        {fDate(product.createdAt)}
                                    </Typography>
                                </Stack>


                                <Stack spacing={1} direction="row" alignItems="center" justifyContent="space-between" sx={{ width: '100%' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        By:
                                    </Typography>
                                    <Typography variant="body2">
                                        {product.createdBy.name}
                                    </Typography>
                                </Stack>
                            </Stack>
                        </Box>
                    </Stack>
                </Grid>
            </Grid>

        </DashboardContent>
    );
}