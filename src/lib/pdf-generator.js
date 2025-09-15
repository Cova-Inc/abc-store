import path from 'path';
import sharp from 'sharp';
import fs from 'fs/promises';
import { jsPDF as JsPDF } from 'jspdf';

// Helper function to load and process image
async function loadImageAsBase64(imageUrl, maxWidthMm = 190) {
  try {
    // Convert relative URL to absolute path
    let imagePath;
    if (imageUrl.startsWith('/uploads/products/')) {
      // Use UPLOAD_DIR from environment variables for proper path resolution
      const uploadDir = process.env.UPLOAD_DIR || './public/uploads/products';
      const fileName = path.basename(imageUrl);
      imagePath = path.join(uploadDir, fileName);
    } else {
      imagePath = imageUrl;
    }

    // Read and process image
    const imageBuffer = await fs.readFile(imagePath);
    const imageInfo = await sharp(imageBuffer).metadata();

    // Convert mm to pixels for processing (assuming 96 DPI)
    const maxWidthPixels = Math.round(maxWidthMm / 0.264583);

    // Calculate dimensions to fit within max width while preserving aspect ratio
    let { width, height } = imageInfo;

    if (width > maxWidthPixels) {
      const ratio = maxWidthPixels / width;
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    // Process image
    const processedBuffer = await sharp(imageBuffer)
      .resize(width, height, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 95 })
      .toBuffer();

    return {
      data: `data:image/jpeg;base64,${processedBuffer.toString('base64')}`,
      width: width * 0.264583, // Convert pixels to mm
      height: height * 0.264583,
    };
  } catch (error) {
    console.error('Error loading image:', imageUrl, error.message);
    return null;
  }
}

export async function generateProductImagesPDF(products) {
  const doc = new JsPDF('p', 'mm', 'a2');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 30;
  const contentWidth = pageWidth - margin * 2;
  let currentY = margin;

  const addImage = async (imageUrl, x, y, maxWidth, maxHeight) => {
    const imageData = await loadImageAsBase64(imageUrl, maxWidth);

    if (imageData && imageData.data) {
      // Scale image to fit within bounds while preserving aspect ratio
      let { width, height } = imageData;
      if (width > maxWidth) {
        const ratio = maxWidth / width;
        width = maxWidth;
        height *= ratio;
      }
      if (height > maxHeight) {
        const ratio = maxHeight / height;
        height = maxHeight;
        width *= ratio;
      }

      // Center image
      const centerX = x + (maxWidth - width) / 2;
      doc.addImage(imageData.data, 'JPEG', centerX, y, width, height);
      return { width, height };
    }
    console.warn(`⚠️ Skipping invalid image: ${imageUrl}`);
    return { width: 0, height: 0 };
  };

  // Add title
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('Product Images', margin, currentY);
  currentY += 20;

  // Process all products and their images
  await products.reduce(async (previousPromise, product) => {
    await previousPromise;

    // Add product name
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(product.name, margin, currentY);
    currentY += 15;

    // Add images
    if (product.images?.length > 0) {
      // Pre-load all images for this product in parallel
      const imageWidth = (contentWidth - 10) / 2; // Two images per row with 10mm gap
      const imageDataPromises = product.images.map((image) =>
        loadImageAsBase64(image.url, imageWidth)
      );
      const imageDataArray = await Promise.all(imageDataPromises);

      // Pre-load full width image data for odd numbered images
      const fullWidthPromises = product.images.map((image) =>
        loadImageAsBase64(image.url, contentWidth)
      );
      const fullWidthDataArray = await Promise.all(fullWidthPromises);

      // Process images in pairs for two-column layout
      for (let i = 0; i < imageDataArray.length; i += 2) {
        const leftImageData = imageDataArray[i];
        const rightImageData = imageDataArray[i + 1];

        const leftImage = product.images[i];
        const rightImage = product.images[i + 1];

        // If this is the last image and it's odd numbered, show it full width
        if (i === imageDataArray.length - 1 && !rightImage) {
          const fullImageData = fullWidthDataArray[i];
          const fullHeight = fullImageData ? fullImageData.height : 20;

          // Check page break
          if (currentY + fullHeight > pageHeight - margin) {
            doc.addPage();
            currentY = margin;
          }

          // Add full width image with proper aspect ratio
          if (fullImageData && fullImageData.data) {
            // Scale image to fit within bounds while preserving aspect ratio
            let { width, height } = fullImageData;
            if (width > contentWidth) {
              const ratio = contentWidth / width;
              width = contentWidth;
              height *= ratio;
            }
            if (height > fullHeight) {
              const ratio = fullHeight / height;
              height = fullHeight;
              width *= ratio;
            }

            // Center image
            const centerX = margin + (contentWidth - width) / 2;
            doc.addImage(fullImageData.data, 'JPEG', centerX, currentY, width, height);
          }
          currentY += fullHeight + 10;
        } else {
          // Regular two-column layout
          const leftHeight = leftImageData ? leftImageData.height : 0;
          const rightHeight = rightImageData ? rightImageData.height : 0;
          const rowHeight = Math.max(leftHeight, rightHeight, 20);

          // Check page break with row height
          if (currentY + rowHeight > pageHeight - margin) {
            doc.addPage();
            currentY = margin;
          }

          // Add left image
          if (leftImageData && leftImageData.data) {
            // Scale left image to fit within bounds while preserving aspect ratio
            let { width: leftWidth, height: leftActualHeight } = leftImageData;
            if (leftWidth > imageWidth) {
              const ratio = imageWidth / leftWidth;
              leftWidth = imageWidth;
              leftActualHeight *= ratio;
            }
            if (leftActualHeight > leftHeight) {
              const ratio = leftHeight / leftActualHeight;
              leftActualHeight = leftHeight;
              leftWidth *= ratio;
            }

            // Center left image
            const leftCenterX = margin + (imageWidth - leftWidth) / 2;
            doc.addImage(
              leftImageData.data,
              'JPEG',
              leftCenterX,
              currentY,
              leftWidth,
              leftActualHeight
            );
          }

          // Add right image (if exists)
          if (rightImageData && rightImageData.data) {
            // Scale right image to fit within bounds while preserving aspect ratio
            let { width: rightWidth, height: rightActualHeight } = rightImageData;
            if (rightWidth > imageWidth) {
              const ratio = imageWidth / rightWidth;
              rightWidth = imageWidth;
              rightActualHeight *= ratio;
            }
            if (rightActualHeight > rightHeight) {
              const ratio = rightHeight / rightActualHeight;
              rightActualHeight = rightHeight;
              rightWidth *= ratio;
            }

            // Center right image
            const rightCenterX = margin + imageWidth + 10 + (imageWidth - rightWidth) / 2;
            doc.addImage(
              rightImageData.data,
              'JPEG',
              rightCenterX,
              currentY,
              rightWidth,
              rightActualHeight
            );
          }

          currentY += rowHeight + 10;
        }
      }

      currentY += 15; // Space after images
    } else {
      // No images message
      doc.setFontSize(12);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(150, 150, 150);
      doc.text('No images available', margin, currentY);
      currentY += 20;
      doc.setTextColor(0, 0, 0);
    }
  }, Promise.resolve());

  // Add page numbers
  const totalPages = doc.internal.getNumberOfPages();
  Array.from({ length: totalPages }, (_, i) => i + 1).forEach((pageNum) => {
    doc.setPage(pageNum);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - 30, pageHeight - 10);
  });

  return Buffer.from(doc.output('arraybuffer'));
}
