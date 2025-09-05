import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'products');

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

// Multer memory storage for processing with Sharp
const storage = multer.memoryStorage();

// File filter
const fileFilter = (_, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG and WebP are allowed.'), false);
  }
};

// Multer instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Process and save image with Sharp
export async function processAndSaveImage(buffer) {
  await ensureUploadDir();
  
  const filename = `${uuidv4()}.webp`;
  const filepath = path.join(UPLOAD_DIR, filename);
  
  // Process image with Sharp
  await sharp(buffer)
    .resize(800, 800, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .webp({ quality: 85 })
    .toFile(filepath);
  
  // Also create thumbnail
  const thumbFilename = `thumb_${filename}`;
  const thumbFilepath = path.join(UPLOAD_DIR, thumbFilename);
  
  await sharp(buffer)
    .resize(200, 200, {
      fit: 'cover'
    })
    .webp({ quality: 80 })
    .toFile(thumbFilepath);
  
  return {
    url: `/uploads/products/${filename}`,
    thumbnail: `/uploads/products/${thumbFilename}`
  };
}

// Process base64 image
export async function processBase64Image(base64String) {
  await ensureUploadDir();
  
  // Remove data URL prefix if present
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');
  
  const filename = `${uuidv4()}.webp`;
  const filepath = path.join(UPLOAD_DIR, filename);
  
  // Process with Sharp
  await sharp(buffer)
    .resize(800, 800, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .webp({ quality: 85 })
    .toFile(filepath);
  
  // Create thumbnail
  const thumbFilename = `thumb_${filename}`;
  const thumbFilepath = path.join(UPLOAD_DIR, thumbFilename);
  
  await sharp(buffer)
    .resize(200, 200, {
      fit: 'cover'
    })
    .webp({ quality: 80 })
    .toFile(thumbFilepath);
  
  return {
    url: `/uploads/products/${filename}`,
    thumbnail: `/uploads/products/${thumbFilename}`
  };
}

// Delete image and thumbnail
export async function deleteImage(imageUrl) {
  if (!imageUrl || !imageUrl.startsWith('/uploads/products/')) {
    return;
  }
  
  try {
    const filename = path.basename(imageUrl);
    const filepath = path.join(UPLOAD_DIR, filename);
    
    // Delete main image
    await fs.unlink(filepath);
    
    // Try to delete thumbnail
    const thumbFilename = `thumb_${filename}`;
    const thumbFilepath = path.join(UPLOAD_DIR, thumbFilename);
    await fs.unlink(thumbFilepath).catch(() => {});
  } catch (error) {
    console.error('Error deleting image:', error);
  }
}

// Process multiple images from request
export async function processImages(images) {
  if (!images || !Array.isArray(images)) return [];
  
  const processedImages = [];
  
  for (const image of images) {
    try {
      let imageUrl = '';
      let imageData;
      
      // Extract the image URL/data from different formats
      if (typeof image === 'string') {
        imageUrl = image;
      } else if (image && typeof image === 'object') {
        imageUrl = image.url || image.base64 || image.preview || '';
      }
      
      if (!imageUrl) continue;
      
      // Process based on what type of data it is
      if (imageUrl.startsWith('data:image')) {
        // It's base64 - needs to be saved to disk
        imageData = await processBase64Image(imageUrl);
      } else if (imageUrl.startsWith('/uploads/') || imageUrl.startsWith('http')) {
        // Already a saved URL - preserve it with thumbnail if exists
        imageData = { 
          url: imageUrl,
          thumbnail: image.thumbnail || imageUrl // Use existing thumbnail or fallback to main image
        };
      }
      
      if (imageData) {
        processedImages.push({
          ...imageData,
          isPrimary: processedImages.length === 0
        });
      }
    } catch (error) {
      console.error('Error processing image:', error);
    }
  }
  
  return processedImages;
}

// Clean up old images when updating
export async function cleanupOldImages(oldImages, newImages) {
  if (!oldImages || !Array.isArray(oldImages)) return;
  
  const newUrls = newImages.map(img => img.url);
  
  for (const oldImage of oldImages) {
    if (oldImage.url && !newUrls.includes(oldImage.url)) {
      await deleteImage(oldImage.url);
    }
  }
}