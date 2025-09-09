import path from 'path';
import sharp from 'sharp';
import multer from 'multer';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

import { MAX_UPLOAD_SIZE } from 'src/config-global';

// Use environment-specific upload directory
const UPLOAD_DIR = process.env.NODE_ENV === 'production' && process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR) // Production: /var/www/html/uploads/products
  : path.join(process.cwd(), 'public', 'uploads', 'products'); // Development: ./public/uploads/products

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
    fileSize: MAX_UPLOAD_SIZE, // 50MB limit
  },
});

// Process and save image with Sharp
export async function processAndSaveImage(buffer) {
  await ensureUploadDir();

  const filename = `${uuidv4()}.webp`;
  const filepath = path.join(UPLOAD_DIR, filename);

  // Process image with Sharp and get file info
  const mainImageInfo = await sharp(buffer)
    .resize(800, 800, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: 85 })
    .toFile(filepath);

  // Also create thumbnail
  const thumbFilename = `thumb_${filename}`;
  const thumbFilepath = path.join(UPLOAD_DIR, thumbFilename);

  await sharp(buffer)
    .resize(200, 200, {
      fit: 'cover',
    })
    .webp({ quality: 80 })
    .toFile(thumbFilepath);

  return {
    url: `/uploads/products/${filename}`,
    thumbnail: `/uploads/products/${thumbFilename}`,
    size: mainImageInfo.size, // Add the file size in bytes
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

    // Check if file exists before trying to delete
    try {
      await fs.access(filepath);
      await fs.unlink(filepath);
      console.log(`Deleted file: ${filename}`);
    } catch (err) {
      if (err.code !== 'ENOENT') {
        // Only log error if it's not a "file not found" error
        console.error(`Error deleting main image ${filename}:`, err.message);
      }
    }

    // Try to delete thumbnail if it's not already a thumbnail
    if (!filename.startsWith('thumb_')) {
      const thumbFilename = `thumb_${filename}`;
      const thumbFilepath = path.join(UPLOAD_DIR, thumbFilename);
      try {
        await fs.access(thumbFilepath);
        await fs.unlink(thumbFilepath);
        console.log(`Deleted thumbnail: ${thumbFilename}`);
      } catch (err) {
        // Thumbnail might not exist, that's ok
        if (err.code !== 'ENOENT') {
          console.error(`Error deleting thumbnail ${thumbFilename}:`, err.message);
        }
      }
    }
  } catch (error) {
    console.error('Unexpected error in deleteImage:', error);
  }
}

// Process multipart form files directly
export async function processMultipartImages(files) {
  if (!files || files.length === 0) return [];

  await ensureUploadDir();

  // Process all files in parallel
  const processedImages = await Promise.all(
    files.map(async (file, index) => {
      try {
        // Get buffer from File object
        const buffer = Buffer.from(await file.arrayBuffer());

        const filename = `${uuidv4()}.webp`;
        const filepath = path.join(UPLOAD_DIR, filename);

        // Process image with Sharp and get file info
        const mainImageInfo = await sharp(buffer)
          .resize(800, 800, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .webp({ quality: 85 })
          .toFile(filepath);

        // Create thumbnail
        const thumbFilename = `thumb_${filename}`;
        const thumbFilepath = path.join(UPLOAD_DIR, thumbFilename);

        await sharp(buffer)
          .resize(200, 200, {
            fit: 'cover',
          })
          .webp({ quality: 80 })
          .toFile(thumbFilepath);

        return {
          url: `/uploads/products/${filename}`,
          thumbnail: `/uploads/products/${thumbFilename}`,
          size: mainImageInfo.size,
          alt: file.name || '',
          isPrimary: index === 0,
        };
      } catch (error) {
        console.error('Error processing multipart image:', error);
        return null;
      }
    })
  );

  // Filter out any failed uploads
  return processedImages.filter((img) => img !== null);
}

// Process existing image URLs (for updates)
// Only handles string URLs from existing images
export async function processImages(images) {
  if (!images || !Array.isArray(images)) return [];

  // Process all images using map and filter
  return images
    .map((image, index) => {
      try {
        // Only process string URLs for existing images
        if (typeof image === 'string' && image.startsWith('/uploads/')) {
          const filename = image.split('/').pop();
          const thumbUrl = image.replace(filename, `thumb_${filename}`);

          return {
            url: image,
            thumbnail: thumbUrl,
            size: 0, // We don't have size for existing string URLs
            alt: '',
            isPrimary: index === 0,
          };
        }
        return null;
      } catch (error) {
        console.error('Error processing image URL:', error);
        return null;
      }
    })
    .filter((img) => img !== null);
}

// Clean up old images when updating
export async function cleanupOldImages(oldImages, newImages) {
  if (!oldImages || !Array.isArray(oldImages)) return;

  const newUrls = newImages.map((img) => img.url);
  console.log('Cleanup - Old images:', oldImages.length, 'New images:', newImages.length);
  console.log('New URLs:', newUrls);

  // Delete all removed images in parallel
  const deletePromises = oldImages
    .filter((oldImage) => oldImage.url && !newUrls.includes(oldImage.url))
    .map((oldImage) => {
      console.log('Deleting removed image:', oldImage.url);
      return deleteImage(oldImage.url);
    });

  await Promise.all(deletePromises);
}
