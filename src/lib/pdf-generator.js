import path from 'path';
import jsPDF from 'jspdf';
import sharp from 'sharp';
import fs from 'fs/promises';

// Helper function to load and process image
async function loadImageAsBase64(imageUrl, maxWidthMm = 190) {
  try {
    // Convert relative URL to absolute path
    const imagePath = imageUrl.startsWith('/uploads/products/')
      ? path.join(process.cwd(), 'public', imageUrl)
      : imageUrl;

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
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;
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

  // Process each product
  for (const product of products) {
    // Add product name
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(product.name, margin, currentY);
    currentY += 15;

    // Add images
    if (product.images?.length > 0) {
      for (const image of product.images) {
        // Get image dimensions first without adding to PDF
        const imageData = await loadImageAsBase64(image.url, contentWidth);
        const actualHeight = imageData ? Math.min(100, imageData.height) : 0;

        // Check page break with actual image height
        if (currentY + actualHeight > pageHeight - margin) {
          doc.addPage();
          currentY = margin;
        }

        // Add image
        const imageResult = await addImage(image.url, margin, currentY, contentWidth, 100);
        currentY += Math.max(imageResult.height, 20) + 10;
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
  }

  // Add page numbers
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 30, pageHeight - 10);
  }

  return Buffer.from(doc.output('arraybuffer'));
}
