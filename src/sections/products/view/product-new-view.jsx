'use client';

import React, { useCallback } from 'react';

import {
    Box,
    Card,
    Stack,
    Typography,
    IconButton,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { ProductForm } from '../components/product-form';
import { useProductForm } from '../hooks/use-product-form';

// ----------------------------------------------------------------------

export default function ProductNewView() {
    const router = useRouter();

    const {
        form,
        methods,
        onSubmit,
        isSubmitting,
        reset,
    } = useProductForm();

    const handleBack = useCallback(() => {
        router.push(paths.main.products.root);
    }, [router]);

    const handleSubmit = useCallback(async (data) => {
        try {
            await onSubmit(data);
            toast.success('Product created successfully!');
            // Redirect after successful submission
            setTimeout(() => {
                router.push(paths.main.products.root);
            }, 1500);
        } catch (err) {
            console.error('Product creation error:', err);
            toast.error(err.message || 'Failed to create product');
        }
    }, [onSubmit, router]);


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
                            Add New Product
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Create a new product for your store
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
                />
            </Card>
        </DashboardContent>
    );
}