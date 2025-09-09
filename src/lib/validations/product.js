import { z } from 'zod';

import { PRODUCT_STATUS_OPTIONS, PRODUCT_CATEGORY_OPTIONS, MAX_UPLOAD_SIZE } from '../../config-global';

// Dynamically get allowed values from config
const enumCategories = PRODUCT_CATEGORY_OPTIONS.map((option) => option.value);
const enumStatuses = PRODUCT_STATUS_OPTIONS.map((option) => option.value);

// Base product schema for validation
const BaseProductSchema = z.object({
  name: z
    .string()
    .min(1, 'Product name must be at least 1 characters')
    .max(200, 'Product name must be less than 200 characters'),

  description: z
    .string()
    .min(1, 'Product description must be at least 1 characters')
    .max(2000, 'Product description must be less than 2000 characters'),

  sku: z.string().max(50, 'SKU must be less than 50 characters').optional().or(z.literal('')),

  price: z
    .number()
    .min(0.01, 'Price must be greater than 0')
    .max(999999.99, 'Price must be less than $999,999.99'),

  originalPrice: z
    .number()
    .min(0, 'Original price must be positive')
    .max(999999.99, 'Original price must be less than $999,999.99')
    .nullable()
    .optional(),

  stock: z
    .number()
    .int('Stock quantity must be a whole number')
    .min(0, 'Stock quantity cannot be negative')
    .max(999999, 'Stock quantity must be less than 999,999')
    .default(0),

  rating: z
    .number()
    .min(0, 'Rating cannot be negative')
    .max(5, 'Rating cannot exceed 5')
    .default(0),

  reviewCount: z
    .number()
    .int('Review count must be a whole number')
    .min(0, 'Review count cannot be negative')
    .default(0),

  category: z.enum(enumCategories),

  status: z.enum(enumStatuses).default('draft'),

  // Images can be File objects (frontend) or URL strings/objects (backend/display)
  // Backend skips this validation in parseFormData, frontend validates File objects
  images: z
    .array(z.any())
    .max(10, 'Maximum 10 images allowed')
    .optional()
    .default([])
    .refine(
      (images) => {
        if (!images || images.length === 0) return true;
        return images.every((image) => {
          // Only validate File objects in browser environment
          if (typeof File !== 'undefined' && image instanceof File) {
            return image.size <= MAX_UPLOAD_SIZE; // 50MB
          }
          // Strings (URLs) or objects are considered valid
          return true;
        });
      },
      {
        message: 'Each image size must be less than 3MB',
      }
    )
    .refine(
      (images) => {
        if (!images || images.length === 0) return true;
        const allowedTypes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/gif',
          'image/bmp',
          'image/webp',
        ];
        return images.every((image) => {
          // Only validate File objects in browser environment
          if (typeof File !== 'undefined' && image instanceof File) {
            return allowedTypes.includes(image.type);
          }
          // Strings (URLs) or objects are considered valid
          return true;
        });
      },
      {
        message: 'Only image files are allowed',
      }
    ),

  tags: z.array(z.string()).max(10, 'Maximum 10 tags allowed').default([]),
});

// Schema for creating a product (all required fields)
export const CreateProductSchema = BaseProductSchema.refine(
  (data) => {
    // Only validate if originalPrice is greater than 0 (0 means no discount)
    if (data.originalPrice > 0) {
      return data.originalPrice >= data.price;
    }
    return true;
  },
  {
    message: 'Original price must be greater than or equal to current price',
    path: ['originalPrice'],
  }
);

// Schema for updating a product (all fields optional)
export const UpdateProductSchema = BaseProductSchema.partial().refine(
  (data) => {
    // Only validate if originalPrice is greater than 0 and price is defined
    if (data.originalPrice !== undefined && data.originalPrice > 0 && data.price !== undefined) {
      return data.originalPrice >= data.price;
    }
    return true;
  },
  {
    message: 'Original price must be greater than or equal to current price',
    path: ['originalPrice'],
  }
);

// Frontend form schema (without id, createdAt, updatedAt)
export const ProductFormSchema = BaseProductSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).refine(
  (data) => {
    // Only validate if originalPrice is greater than 0 (0 means no discount)
    if (data.originalPrice > 0) {
      return data.originalPrice >= data.price;
    }
    return true;
  },
  {
    message: 'Original price must be greater than or equal to current price',
    path: ['originalPrice'],
  }
);

// Helper function to parse and validate FormData
export function parseFormData(formData, schema) {
  const data = {};

  // Extract all form fields
  const entries = Array.from(formData.entries());
  entries.forEach(([key, value]) => {
    // Skip file fields
    if (key === 'images' || key === 'existingImages') {
      return;
    }

    // Parse special fields
    if (key === 'tags') {
      data.tags = value ? JSON.parse(value) : [];
    } else if (key === 'originalPrice') {
      // Handle originalPrice - 0 means no discount
      const num = parseFloat(value);
      data[key] = !Number.isNaN(num) ? num : 0;
    } else if (key === 'price' || key === 'rating') {
      const num = parseFloat(value);
      if (!Number.isNaN(num)) data[key] = num;
    } else if (key === 'stock' || key === 'reviewCount') {
      const num = parseInt(value, 10);
      if (!Number.isNaN(num)) data[key] = num;
    } else if (key === 'sku') {
      // Allow empty string for SKU to clear it
      data[key] = value || '';
    } else if (value !== '' && value !== null && value !== undefined) {
      data[key] = value;
    }
  });

  // Validate with schema
  return schema.parse(data);
}

// Helper to validate product permissions
export function validateProductPermissions(product, userId, userRole, action) {
  // Admins can do everything
  if (userRole === 'admin') return true;

  // Check ownership
  const isOwner = product.createdBy.toString() === userId;
  if (!isOwner) {
    throw new Error('Access denied - not your product');
  }

  // For non-admins, check status restrictions
  if (action === 'update' || action === 'delete') {
    if (product.status !== 'draft') {
      throw new Error(`Access denied - can only ${action} draft products`);
    }
  }

  return true;
}

// Helper to sanitize data based on user role
export function sanitizeProductData(data, userRole) {
  const sanitized = { ...data };

  // Non-admins cannot set certain fields
  if (userRole !== 'admin') {
    delete sanitized.status;
    delete sanitized.rating;
    delete sanitized.reviewCount;
    sanitized.status = 'draft';
  }

  // Only validate originalPrice if it's greater than 0 (0 means no discount)
  if (sanitized.originalPrice > 0) {
    if (sanitized.price !== undefined && sanitized.originalPrice < sanitized.price) {
      throw new Error('Original price must be greater than or equal to current price');
    }
  }

  return sanitized;
}

// Export additional schemas for compatibility
export const ProductSchema = CreateProductSchema;

// Default values for forms
export const defaultProductValues = {
  name: '',
  description: '',
  sku: '',
  price: 0,
  originalPrice: 0, // Default to 0 for input fields
  stock: 0,
  rating: 0,
  reviewCount: 0,
  category: enumCategories[0] || 'electronics',
  status: 'draft',
  images: [],
  tags: [],
};

// Validation helpers
export const validateProduct = (data) => ProductSchema.safeParse(data);
export const validateProductForm = (data) => ProductFormSchema.safeParse(data);
