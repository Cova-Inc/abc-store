import { z } from 'zod';

// Product status enum
export const ProductStatus = z.enum(['draft', 'active', 'inactive', 'archived']);

// Product category enum
export const ProductCategory = z.enum([
    'electronics',
    'clothing', 
    'books',
    'home',
    'sports',
    'beauty',
    'toys',
    'automotive'
]);

// Base product object schema (without refine)
const BaseProductSchema = z.object({
    id: z.string().optional(),
    name: z.string()
        .min(2, 'Product name must be at least 2 characters')
        .max(100, 'Product name must be less than 100 characters'),
    
    description: z.string()
        .min(10, 'Product description must be at least 10 characters')
        .max(500, 'Product description must be less than 500 characters'),
    
    sku: z.string()
        .min(3, 'SKU must be at least 3 characters')
        .max(50, 'SKU must be less than 50 characters')
        .regex(/^[A-Z0-9-_]+$/, 'SKU must contain only uppercase letters, numbers, hyphens, and underscores'),
    
    price: z.number()
        .min(0.01, 'Price must be greater than 0')
        .max(999999.99, 'Price must be less than $999,999.99'),
    
    originalPrice: z.number()
        .min(0.01, 'Original price must be greater than 0')
        .max(999999.99, 'Original price must be less than $999,999.99')
        .nullable()
        .optional(),
    
    stock: z.number()
        .int('Stock quantity must be a whole number')
        .min(0, 'Stock quantity cannot be negative')
        .max(999999, 'Stock quantity must be less than 999,999'),
    
    category: ProductCategory,
    
    status: ProductStatus,
    
    images: z.array(z.any())
        .max(10, 'Maximum 10 images allowed')
        .optional()
        .refine((images) => {
            if (!images || images.length === 0) return true;
            return images.every((image) => {
                if (image instanceof File) {
                    return image.size <= 3145728; // 3MB
                }
                return true;
            });
        }, {
            message: 'Each image size must be less than 3MB',
        })
        .refine((images) => {
            if (!images || images.length === 0) return true;
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
            return images.every((image) => {
                if (image instanceof File) {
                    return allowedTypes.includes(image.type);
                }
                return true;
            });
        }, {
            message: 'Only image files are allowed',
        }),
    
    tags: z.array(z.string())
        .max(10, 'Maximum 10 tags allowed')
        .optional(),
    
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
});

// Full product schema with validation
export const ProductSchema = BaseProductSchema.refine((data) => {
    // Validate that originalPrice is greater than price if both exist
    if (data.originalPrice && data.price && data.originalPrice <= data.price) {
        return false;
    }
    return true;
}, {
    message: 'Original price must be greater than current price',
    path: ['originalPrice'],
});

// Form schema (for product creation/editing)
export const ProductFormSchema = BaseProductSchema.omit({ 
    id: true, 
    createdAt: true, 
    updatedAt: true 
});

// Product list item schema (for display)
export const ProductListItemSchema = BaseProductSchema.extend({
    images: z.array(z.string()).optional(), // Array of URLs instead of Files
});

// Type inference (for TypeScript projects)
// Uncomment these if you migrate to TypeScript:
// export type Product = z.infer<typeof ProductSchema>;
// export type ProductForm = z.infer<typeof ProductFormSchema>;
// export type ProductListItem = z.infer<typeof ProductListItemSchema>;
// export type ProductStatusType = z.infer<typeof ProductStatus>;
// export type ProductCategoryType = z.infer<typeof ProductCategory>;

// Default values
export const defaultProductValues = {
    name: '',
    description: '',
    sku: '',
    price: 0,
    originalPrice: 0,  // Changed from null to 0 to avoid React warning
    stock: 0,
    category: 'electronics',
    status: 'draft',
    images: [],
    tags: [],
};

// Validation helpers
export const validateProduct = (data) => ProductSchema.safeParse(data);

export const validateProductForm = (data) => ProductFormSchema.safeParse(data);

// Transform helpers
export const transformProductForForm = (product) => ProductFormSchema.parse(product);

export const transformProductForDisplay = (product) => ProductListItemSchema.parse(product);