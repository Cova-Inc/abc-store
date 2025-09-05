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
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { ProductForm } from '../components/product-form';
import { useProductForm } from '../hooks/use-product-form';

// ----------------------------------------------------------------------

export default function ProductEditView({ params }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [product, setProduct] = useState(null);

    const {
        form,
        methods,
        onSubmit,
        isSubmitting,
        reset,
        updateForm,
    } = useProductForm();

    // Fetch product data
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Mock product data - replace with actual API call
                const mockProduct = {
                    id: params.id,
                    name: 'Wireless Bluetooth Headphones',
                    description: 'High-quality wireless headphones with noise cancellation and premium sound quality.',
                    sku: 'WBH-001',
                    price: 199.99,
                    originalPrice: 249.99,
                    stock: 50,
                    category: 'electronics',
                    status: 'active',
                    image: null, // In real app, this would be the image URL
                    tags: ['wireless', 'bluetooth', 'noise-cancellation'],
                    createdAt: '2024-01-15T10:30:00Z',
                    updatedAt: '2024-01-20T14:45:00Z',
                };
                
                setProduct(mockProduct);
                updateForm(mockProduct);
                
            } catch (err) {
                console.error('Error fetching product:', err);
                toast.error(err.message || 'Failed to fetch product');
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchProduct();
        }
    }, [params.id, updateForm]);

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
                        <Typography variant="body2" color="text.secondary">
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
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" gutterBottom>
                        Product Not Found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        The product you&apos;re looking for doesn&apos;t exist or has been removed.
                    </Typography>
                    <Button variant="contained" onClick={handleBack}>
                        Back to Products
                    </Button>
                </Box>
            </DashboardContent>
        );
    }

    return (
        <DashboardContent>
            {/* Header */}
            <Box sx={{ mb: 3 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <IconButton onClick={handleBack} sx={{ p: 1 }}>
                        <Iconify icon="eva:arrow-back-fill" />
                    </IconButton>
                    <Box>
                        <Typography variant="h4" gutterBottom>
                            Edit Product
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Update product information
                        </Typography>
                    </Box>
                </Stack>
            </Box>

            {/* Product Form */}
            <Card sx={{ p: 3 }}>
                <ProductForm
                    form={form}
                    methods={methods}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    onReset={reset}
                    defaultValues={product}
                />
            </Card>
        </DashboardContent>
    );
}