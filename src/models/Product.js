import mongoose from 'mongoose';

import { toJSON } from './plugins';
import { PRODUCT_STATUS_OPTIONS, PRODUCT_CATEGORY_OPTIONS } from '../config-global';

const enumCategories = PRODUCT_CATEGORY_OPTIONS.map((option) => option.value);
const enumStatuses = PRODUCT_STATUS_OPTIONS.map((option) => option.value);
// Product schema for ABC Store
// Core fields: name, description, images, price, category
const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Name cannot be more than 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot be more than 2000 characters'],
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        thumbnail: {
          type: String,
          required: false,
        },
        alt: {
          type: String,
          default: '',
        },
        size: {
          type: Number,
          default: 0,
        },
        isPrimary: {
          type: Boolean,
          default: false,
        },
      },
    ],
    price: {
      type: Number,
      default: 0,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },
    originalPrice: {
      type: Number,
      min: [0, 'Original price cannot be negative'],
      default: 0,
      validate: {
        validator(value) {
          // Only validate if originalPrice is greater than 0 (0 means no discount)
          if (value > 0) {
            // originalPrice should be >= price if both exist
            if (this.price !== undefined) {
              return value >= this.price;
            }
          }
          return true;
        },
        message: 'Original price should be greater than or equal to current price',
      },
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      enum: { values: enumCategories, message: 'Category is not valid' },
    },
    sku: {
      type: String,
      unique: true,
      sparse: true, // Allows null values but ensures uniqueness when present
      trim: true,
      maxlength: [50, 'SKU cannot be more than 50 characters'],
    },
    supplier: {
      type: String,
      trim: true,
      maxlength: [200, 'Supplier name cannot be more than 200 characters'],
    },
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      default: 1,
      min: [1, 'Stock must be at least 1'],
    },
    status: {
      type: String,
      enum: { values: enumStatuses, message: 'Status is not valid' },
      default: 'draft',
    },
    tags: [String],
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot be more than 5'],
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: [0, 'Review count cannot be negative'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

// Indexes for better query performance
ProductSchema.index({ name: 'text', description: 'text' }); // Text search
ProductSchema.index({ category: 1 }); // Category filtering
ProductSchema.index({ status: 1 }); // Status filtering
ProductSchema.index({ price: 1 }); // Price sorting
ProductSchema.index({ createdAt: -1 }); // Recent products

// Virtual for primary image
ProductSchema.virtual('primaryImage').get(function () {
  const primaryImg = this.images.find((img) => img.isPrimary);
  return primaryImg || this.images[0] || null;
});

// Ensure only one primary image
ProductSchema.pre('save', function (next) {
  if (this.images && this.images.length > 0) {
    // If no primary image is set, make the first one primary
    const hasPrimary = this.images.some((img) => img.isPrimary);
    if (!hasPrimary) {
      this.images[0].isPrimary = true;
    }

    // Ensure only one primary image
    let primaryCount = 0;
    this.images.forEach((img) => {
      if (img.isPrimary) {
        primaryCount++;
        if (primaryCount > 1) {
          img.isPrimary = false;
        }
      }
    });
  }
  next();
});

// Apply toJSON plugin
ProductSchema.plugin(toJSON);

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
