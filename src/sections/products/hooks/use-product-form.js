import { useForm } from 'react-hook-form';
import { useState, useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import { ProductFormSchema, defaultProductValues } from '../types/product.types';
import { createProduct } from '../actions';

export function useProductForm(initialValues = {}) {
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
            
            // Process images - convert File objects to base64 strings
            let processedImages = [];
            if (data.images && data.images.length > 0) {
                processedImages = await Promise.all(
                    data.images.map((file) => {
                        return new Promise((resolve) => {
                            const reader = new FileReader();
                            reader.onload = () => {
                                resolve({
                                    url: reader.result,
                                    alt: file.name
                                });
                            };
                            reader.readAsDataURL(file);
                        });
                    })
                );
            }
            
            // Prepare product data for API
            const productData = {
                ...data,
                images: processedImages,
                originalPrice: data.originalPrice || null
            };
            
            console.log('Product data to submit:', productData);
            
            // Call the actual API
            const response = await createProduct(productData);
            
            return { success: true, data: response };
            
        } catch (error) {
            console.error('Product submission error:', error);
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    }, []);

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