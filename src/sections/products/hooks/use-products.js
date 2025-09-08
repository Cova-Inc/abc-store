import { useState, useCallback } from 'react';

import * as productActions from '../actions';

// =============================================================================
// ONE SIMPLE HOOK FOR EVERYTHING
// =============================================================================

export function useProducts() {
  // State
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // =============================================================================
  // DATA FETCHING
  // =============================================================================

  const fetchProducts = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await productActions.getProducts(params);

      setProducts(response.products);
      setPagination(response.pagination);

      return response;
    } catch (err) {
      const errorCode = err.response?.status || 500;
      setError({
        code: errorCode,
        message: err.message || 'Failed to fetch products',
      });
      console.error('Error fetching products:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch single product
  const fetchProduct = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);

      const response = await productActions.getProduct(id);
      setProduct(response);

      return response;
    } catch (err) {
      const errorCode = err.status || err.response?.status || 500;
      setError({
        code: errorCode,
        message: err.message || 'Failed to fetch product',
      });
      setProduct(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // =============================================================================
  // CRUD OPERATIONS
  // =============================================================================

  const createProduct = useCallback(async (productData) => {
    try {
      setLoading(true);
      const newProduct = await productActions.createProduct(productData);
      setProducts((prev) => [newProduct, ...prev]);
      setPagination((prev) => ({ ...prev, total: prev.total + 1 }));
      return newProduct;
    } catch (err) {
      const errorCode = err.status || err.response?.status || 500;
      setError({
        code: errorCode,
        message: err.message || 'Failed to fetch product',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProduct = useCallback(async (id, productData) => {
    try {
      setLoading(true);
      const updatedProduct = await productActions.updateProduct(id, productData);
      setProducts((prev) => prev.map((p) => (p.id === id ? updatedProduct : p)));
      return updatedProduct;
    } catch (err) {
      const errorCode = err.status || err.response?.status || 500;
      setError({
        code: errorCode,
        message: err.message || 'Failed to fetch product',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProduct = useCallback(async (id) => {
    try {
      setLoading(true);
      await productActions.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
      return true;
    } catch (err) {
      const errorCode = err.status || err.response?.status || 500;
      setError({
        code: errorCode,
        message: err.message || 'Failed to fetch product',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProducts = useCallback(async (ids) => {
    try {
      setLoading(true);
      await productActions.deleteProducts(ids);
      setProducts((prev) => prev.filter((p) => !ids.includes(p.id)));
      setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - ids.length) }));
      return { count: ids.length };
    } catch (err) {
      const errorCode = err.status || err.response?.status || 500;
      setError({
        code: errorCode,
        message: err.message || 'Failed to delete products',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAllProducts = useCallback(async (deleteFilters) => {
    try {
      setLoading(true);
      const result = await productActions.deleteAllProducts(deleteFilters);
      return { count: result.deletedCount };
    } catch (err) {
      const errorCode = err.status || err.response?.status || 500;
      setError({
        code: errorCode,
        message: err.message || 'Failed to delete products',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // =============================================================================
  // ACTIONS
  // =============================================================================

  const downloadProduct = useCallback(async (productId) => {
    try {
      const blob = await productActions.downloadProduct(productId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `product-${productId}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      return true;
    } catch (err) {
      const errorCode = err.status || err.response?.status || 500;
      setError({
        code: errorCode,
        message: err.message || 'Failed to fetch product',
      });
      throw err;
    }
  }, []);

  const exportCSV = useCallback(async () => {
    try {
      const blob = await productActions.exportProductsToCSV(products);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `products-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      return true;
    } catch (err) {
      const errorCode = err.status || err.response?.status || 500;
      setError({
        code: errorCode,
        message: err.message || 'Failed to fetch product',
      });
      throw err;
    }
  }, [products]);

  const exportExcel = useCallback(async () => {
    try {
      const blob = await productActions.exportProductsToExcel(products);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `products-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      return true;
    } catch (err) {
      const errorCode = err.status || err.response?.status || 500;
      setError({
        code: errorCode,
        message: err.message || 'Failed to fetch product',
      });
      throw err;
    }
  }, [products]);

  // =============================================================================
  // RETURN EVERYTHING
  // =============================================================================

  return {
    // Data
    products,
    product,
    loading,
    error,
    pagination,

    // CRUD
    createProduct,
    updateProduct,
    deleteProduct,
    deleteProducts,
    deleteAllProducts,

    // Actions
    downloadProduct,
    exportCSV,
    exportExcel,
    fetchProducts,
    fetchProduct,
  };
}

export default useProducts;
