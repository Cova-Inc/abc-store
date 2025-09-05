'use client';

import React, { useState, useCallback } from 'react';
import { Controller, FormProvider } from 'react-hook-form';

import {
    Box,
    Grid,
    Chip,
    Stack,
    Button,
    Divider,
    MenuItem,
    TextField,
    Typography,
    Autocomplete,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { PRODUCT_CATEGORY_OPTIONS } from 'src/config-global';

import { Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

const PRODUCT_STATUS_OPTIONS = [
    { value: 'draft', label: 'Draft' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'archived', label: 'Archived' },
];

const PRODUCT_TAGS_OPTIONS = [
    'new',
    'sale',
    'featured',
    'trending',
    'limited',
    'organic',
    'premium',
    'eco-friendly',
    'handmade',
    'vintage',
];

export function ProductForm({
    methods,
    onSubmit,
    isSubmitting,
    onReset,
    defaultValues,
}) {
    const [selectedTags, setSelectedTags] = useState([]);

    const {
        control,
        handleSubmit,
        setValue,
        getValues,
        watch,
        formState: { errors, isDirty },
    } = methods;

    // Watch images to trigger re-renders
    const images = watch('images');

    // Handle image drop with duplicate prevention
    const handleImageDrop = useCallback((acceptedFiles) => {
        const existingFiles = getValues('images') || [];
        // Filter out duplicates based on file name and size
        const newFiles = acceptedFiles.filter(
            (newFile) => !existingFiles.some(
                (existing) => existing.name === newFile.name && existing.size === newFile.size
            )
        );
        const updatedFiles = [...existingFiles, ...newFiles];
        setValue('images', updatedFiles);
    }, [getValues, setValue]);

    // Handle single image removal
    const handleImageRemove = useCallback((inputFile) => {
        const filtered = getValues('images')?.filter(
            (file) => file !== inputFile
        );
        setValue('images', filtered);
    }, [getValues, setValue]);

    // Handle remove all images
    const handleImageRemoveAll = useCallback(() => {
        setValue('images', []);
    }, [setValue]);

    // Handle tags change
    const handleTagsChange = useCallback((_, newValue) => {
        setSelectedTags(newValue);
        setValue('tags', newValue);
    }, [setValue]);

    return (
        <FormProvider {...methods}>
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={3}>
                    {/* Product Images */}
                    <Grid item xs={12} md={4}>
                        <Box>
                            <Typography variant="subtitle2" gutterBottom>
                                Product Images (Max 10)
                            </Typography>
                            <Field.Upload
                                name="images"
                                accept={{
                                    'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp'],
                                }}
                                maxSize={3145728} // 3MB
                                multiple
                                onDrop={handleImageDrop}
                                helperText={
                                    <Typography variant="caption" color="text.secondary">
                                        Max 10 images, 3MB each, JPG, PNG, GIF, BMP, WEBP
                                    </Typography>
                                }
                                // files={images}
                                slotProps={{
                                    thumbnail: {
                                        imageView: true,  // Show actual image preview
                                        sx: { width: 52, height: 52 }
                                    }
                                }}
                                onRemove={handleImageRemove}
                                onRemoveAll={handleImageRemoveAll}
                                disabled={images?.length >= 10}
                            />
                        </Box>
                    </Grid>

                    {/* Product Details */}
                    <Grid item xs={12} md={8}>
                        <Stack spacing={3}>
                            {/* Basic Information */}
                            <Box>
                                <Typography variant="h6" gutterBottom>
                                    Basic Information
                                </Typography>
                                <Stack spacing={2}>
                                    <Field.Text
                                        name="name"
                                        label="Product Name"
                                        placeholder="Enter product name"
                                        error={!!errors.name}
                                        helperText={errors.name?.message}
                                    />

                                    <Field.Text
                                        name="description"
                                        label="Description"
                                        multiline
                                        rows={3}
                                        placeholder="Enter product description"
                                        error={!!errors.description}
                                        helperText={errors.description?.message}
                                    />

                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <Field.Text
                                                name="sku"
                                                label="SKU"
                                                placeholder="Enter SKU"
                                                error={!!errors.sku}
                                                helperText={errors.sku?.message}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Field.Select
                                                name="status"
                                                label="Status"
                                                error={!!errors.status}
                                                helperText={errors.status?.message}
                                            >
                                                {PRODUCT_STATUS_OPTIONS.map((option) => (
                                                    <MenuItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </MenuItem>
                                                ))}
                                            </Field.Select>
                                        </Grid>
                                    </Grid>
                                </Stack>
                            </Box>

                            <Divider />

                            {/* Pricing */}
                            <Box>
                                <Typography variant="h6" gutterBottom>
                                    Pricing
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <Field.Text
                                            name="price"
                                            label="Price"
                                            type="number"
                                            placeholder="0.00"
                                            InputProps={{
                                                startAdornment: '$',
                                            }}
                                            error={!!errors.price}
                                            helperText={errors.price?.message}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Field.Text
                                            name="originalPrice"
                                            label="Original Price"
                                            type="number"
                                            placeholder="0.00"
                                            InputProps={{
                                                startAdornment: '$',
                                            }}
                                            error={!!errors.originalPrice}
                                            helperText={errors.originalPrice?.message}
                                        />
                                    </Grid>
                                </Grid>
                            </Box>

                            <Divider />

                            {/* Inventory */}
                            <Box>
                                <Typography variant="h6" gutterBottom>
                                    Inventory
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <Field.Text
                                            name="stock"
                                            label="Stock Quantity"
                                            type="number"
                                            placeholder="0"
                                            error={!!errors.stock}
                                            helperText={errors.stock?.message}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Field.Select
                                            name="category"
                                            label="Category"
                                            error={!!errors.category}
                                            helperText={errors.category?.message}
                                        >
                                            {PRODUCT_CATEGORY_OPTIONS.map((option) => (
                                                <MenuItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </MenuItem>
                                            ))}
                                        </Field.Select>
                                    </Grid>
                                </Grid>
                            </Box>

                            <Divider />

                            {/* Tags */}
                            <Box>
                                <Typography variant="h6" gutterBottom>
                                    Tags
                                </Typography>
                                <Controller
                                    name="tags"
                                    control={control}
                                    render={() => (
                                        <Autocomplete
                                            multiple
                                            freeSolo
                                            options={PRODUCT_TAGS_OPTIONS}
                                            value={selectedTags}
                                            onChange={handleTagsChange}
                                            renderTags={(value, getTagProps) =>
                                                value.map((option, index) => (
                                                    <Chip
                                                        {...getTagProps({ index })}
                                                        key={option}
                                                        label={option}
                                                        size="small"
                                                    />
                                                ))
                                            }
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    placeholder="Add tags..."
                                                    error={!!errors.tags}
                                                    helperText={errors.tags?.message}
                                                />
                                            )}
                                        />
                                    )}
                                />
                            </Box>
                        </Stack>
                    </Grid>
                </Grid>

                {/* Form Actions */}
                <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                        <Button
                            variant="outlined"
                            onClick={onReset}
                            disabled={isSubmitting}
                        >
                            Reset
                        </Button>
                        <LoadingButton
                            type="submit"
                            variant="contained"
                            loading={isSubmitting}
                            disabled={!isDirty}
                        >
                            {defaultValues ? 'Update Product' : 'Create Product'}
                        </LoadingButton>
                    </Stack>
                </Box>
            </Box>
        </FormProvider>
    );
}