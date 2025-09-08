import { useForm } from 'react-hook-form';
import { useState, useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import { ProductFormSchema, defaultProductValues } from 'src/lib/validations/product';
import { createProduct, updateProduct } from '../actions';

export function useProductForm(productId = null, initialValues = {}) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const methods = useForm({
        resolver: zodResolver(ProductFormSchema),
        defaultValues: { ...defaultProductValues, ...initialValues },
        mode: 'onChange',
    });

    const { handleSubmit, reset, setValue, watch } = methods;

    // Watch form values for real-time validation
    const watchedValues = watch();

    // Generate SKU automatically if not provided
    const generateSKU = useCallback((productName) => {
        if (!productName) return '';
        
        const cleanName = productName
            .toUpperCase()
            .replace(/[^A-Z0-9\s]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 20);
        
        const timestamp = Date.now().toString().slice(-4);
        return `${cleanName}-${timestamp}`;
    }, []);

    // Auto-generate SKU when name changes
    const handleNameChange = useCallback((event) => {
        const name = event.target.value;
        const currentSKU = watchedValues.sku;
        
        // Only auto-generate if SKU is empty or was auto-generated
        if (!currentSKU || currentSKU.includes('-')) {
            const generatedSKU = generateSKU(name);
            setValue('sku', generatedSKU);
        }
    }, [watchedValues.sku, generateSKU, setValue]);

    // Handle form submission
    const onSubmit = useCallback(async (data) => {
        try {
            setIsSubmitting(true);
            
            // Build FormData for multipart upload
            const formData = new FormData();
            
            // Add all non-file fields
            formData.append('name', data.name);
            formData.append('description', data.description);
            formData.append('price', data.price);
            formData.append('category', data.category);
            formData.append('stock', data.stock || 0);
            formData.append('sku', data.sku);
            formData.append('status', data.status || 'draft');
            
            // Add optional fields
            // Ensure originalPrice is at least equal to price
            if (data.originalPrice !== null && data.originalPrice !== undefined) {
                const originalPrice = Math.max(data.originalPrice, data.price);
                formData.append('originalPrice', originalPrice);
            } else {
                // If no originalPrice, set it to price (no discount)
                formData.append('originalPrice', data.price);
            }
            if (data.rating !== undefined) {
                formData.append('rating', data.rating);
            }
            if (data.reviewCount !== undefined) {
                formData.append('reviewCount', data.reviewCount);
            }
            
            // Add tags as JSON string
            if (data.tags && data.tags.length > 0) {
                formData.append('tags', JSON.stringify(data.tags));
            }
            
            // Process images
            let existingImageUrls = [];
            let newImageCount = 0;
            
            if (data.images && data.images.length > 0) {
                data.images.forEach((file) => {
                    if (typeof file === 'string' && file.startsWith('/uploads/')) {
                        // Existing image URL - send as separate field
                        existingImageUrls.push(file);
                    } else if (file instanceof File || file instanceof Blob) {
                        // New file upload - append to FormData
                        formData.append('images', file);
                        newImageCount++;
                    }
                });
            }
            
            // Add existing image URLs as JSON string
            if (existingImageUrls.length > 0) {
                formData.append('existingImages', JSON.stringify(existingImageUrls));
            }
            
            console.log(`Submitting product with ${newImageCount} new images and ${existingImageUrls.length} existing images`);
            
            // Call the appropriate API based on whether we're creating or updating
            let response;
            if (productId) {
                response = await updateProduct(productId, formData);
            } else {
                response = await createProduct(formData);
            }
            
            return { success: true, data: response };
            
        } catch (error) {
            console.error('Product submission error:', error);
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    }, [productId]);

    // Reset form
    const resetForm = useCallback(() => {
        reset(defaultProductValues);
    }, [reset]);

    // Update form values
    const updateForm = useCallback((newValues) => {
        Object.keys(newValues).forEach(key => {
            setValue(key, newValues[key]);
        });
    }, [setValue]);

    return {
        methods,
        form: {
            ...methods,
            handleNameChange,
        },
        onSubmit,
        isSubmitting,
        reset: resetForm,
        updateForm,
        watchedValues,
    };
}