'use client';

import React, { useState, useEffect, useCallback } from 'react';

import {
    Box,
    Card,
    Stack,
    Button,
    Typography,
    IconButton,
    CircularProgress,
    Divider,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useAuthContext } from 'src/auth/hooks';
import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { ProductForm } from '../components/product-form';
import { useProducts, useProductForm} from '../hooks';
import { ErrorSection } from 'src/components/result-section';

// ----------------------------------------------------------------------

export default function ProductEditView({ params }) {
    const router = useRouter();
    const { user } = useAuthContext();
    
    // Use the products hook for data fetching
    const { product, loading, error, fetchProduct } = useProducts();

    // Use the product form hook with productId for update
    const {
        form,
        methods,
        onSubmit,
        isSubmitting,
        reset,
        updateForm,
    } = useProductForm(params.id);

    // Fetch product data
    useEffect(() => {
        const loadProduct = async () => {
            if (params.id) {
                try {
                    const productData = await fetchProduct(params.id);
                    
                    // Simple: Extract just the URL strings from image objects
                    // These will be displayed and sent back as strings when updating
                    console.log('Raw product images from API:', productData.images);
                    const transformedImages = productData.images?.map(img => {
                        if (typeof img === 'string') {
                            return img;
                        }
                        // Extract the main URL (not thumbnail) from image object
                        const url = img.url || '';
                        if (url && url.includes('thumb_')) {
                            console.error('WARNING: Product has corrupted image data - thumbnail as main URL:', url);
                        }
                        return url;
                    }).filter(url => url) || [];
                    console.log('Transformed images for form:', transformedImages);
                    
                    // Update form with transformed data
                    const formData = {
                        ...productData,
                        images: transformedImages
                    };
                    
                    updateForm(formData);
                } catch (err) {
                    console.error('Error fetching product:', err);
                    toast.error(err.message || 'Failed to fetch product');
                }
            }
        };

        loadProduct();
    }, [params.id, fetchProduct, updateForm]);

    const handleBack = useCallback(() => {
        router.push(paths.main.products.root);
    }, [router]);

    const handleSubmit = useCallback(async (data) => {
        try {
            await onSubmit(data);
            toast.success('Product updated successfully!');
            // Redirect after successful submission
            setTimeout(() => {
                router.push(paths.main.products.root);
            }, 1500);
        } catch (err) {
            console.error('Product update error:', err);
            toast.error(err.message || 'Failed to update product');
        }
    }, [onSubmit, router]);


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
                    error={error.code || "500"}
                    title={error.code === 403 ? "Access Denied" : error.code === 404 ? "Product Not Found" : "Something went wrong"}
                    description={error.message || "An unexpected error occurred"}
                    onAction={handleBack}
                    actionText="Back to Products"
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
                    actionText="Back to Products"
                />
        );
    }

    return (
        <DashboardContent>
            {/* Header */}
            <Stack direction="row" alignItems="center" spacing={2}>
                <Button onClick={handleBack} size="large" startIcon={<Iconify icon="eva:arrow-back-fill" />}>
                    Back
                </Button>
            </Stack>

            {/* Product Form */}
            <Card sx={{ p: 3, mt: 3 }}>
                <Box>
                    <Typography variant="h4">Edit Product</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Fill in the details below to update the product.
                    </Typography>
                </Box>
                <Divider sx={{ my: 2, borderStyle: "dashed"}} />

                <ProductForm
                    form={form}
                    methods={methods}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    onReset={reset}
                    defaultValues={product}
                    currentUser={user}
                />
            </Card>
        </DashboardContent>
    );
}