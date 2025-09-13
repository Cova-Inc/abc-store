import { useState, useCallback } from 'react';

import axios from 'src/utils/axios';

import { toast } from 'src/components/snackbar';

/**
 * Hook for handling PDF download functionality
 */
export function usePdfDownload() {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadProductsPDF = useCallback(async (selectedProductIds) => {
    if (!selectedProductIds || selectedProductIds.length === 0) {
      toast.error('Please select products to download');
      return;
    }

    setIsDownloading(true);

    try {
      const response = await axios.post(
        '/api/products/download-pdf',
        {
          productIds: selectedProductIds,
        },
        {
          responseType: 'blob', // Important for binary data
        }
      );

      // Get the PDF blob
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });

      // Create download link
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;

      // Get filename from response headers or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'products.pdf';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`PDF downloaded successfully with ${selectedProductIds.length} products`);
    } catch (error) {
      console.error('PDF download error:', error);
      toast.error(error.message || 'Failed to download PDF');
    } finally {
      setIsDownloading(false);
    }
  }, []);

  const downloadAllProductsPDF = useCallback(async (filters = {}) => {
    setIsDownloading(true);

    try {
      const response = await axios.post(
        '/api/products/download-all-pdf',
        {
          filters,
        },
        {
          responseType: 'blob', // Important for binary data
        }
      );

      // Get the PDF blob
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });

      // Create download link
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;

      // Get filename from response headers or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'all-products.pdf';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('All products PDF downloaded successfully');
    } catch (error) {
      console.error('PDF download error:', error);
      toast.error(error.message || 'Failed to download PDF');
    } finally {
      setIsDownloading(false);
    }
  }, []);

  return {
    isDownloading,
    downloadProductsPDF,
    downloadAllProductsPDF,
  };
}
