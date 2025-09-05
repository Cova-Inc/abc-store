import { useState, useCallback } from 'react';
import { toast } from 'src/components/snackbar';
import * as productActions from '../actions';

// =============================================================================
// ONE SIMPLE HOOK FOR EVERYTHING
// =============================================================================

export function useProducts() {
    // State
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
    });
    const [filters, setFilters] = useState({
        search: '',
        category: '',
        status: '',
        sortBy: 'createdAt',
        sortOrder: 'desc'
    });

    // =============================================================================
    // DATA FETCHING
    // =============================================================================

    const fetchProducts = useCallback(async (newFilters = {}) => {
        try {
            setLoading(true);
            const params = {
                ...filters,
                ...newFilters,
                page: newFilters.page || pagination.page,
                limit: newFilters.limit || pagination.limit
            };

            const response = await productActions.getProducts(params);
            
            setProducts(response.products);
            setPagination(response.pagination);
            
            if (Object.keys(newFilters).length > 0) {
                setFilters(prev => ({ ...prev, ...newFilters }));
            }
        } catch (error) {
            toast.error(error.message || 'Failed to fetch products');
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    }, [filters, pagination.page, pagination.limit]);

    // =============================================================================
    // CRUD OPERATIONS
    // =============================================================================

    const createProduct = useCallback(async (productData) => {
        try {
            setLoading(true);
            const product = await productActions.createProduct(productData);
            setProducts(prev => [product, ...prev]);
            setPagination(prev => ({ ...prev, total: prev.total + 1 }));
            toast.success('Product created successfully');
            return product;
        } catch (error) {
            toast.error(error.message || 'Failed to create product');
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateProduct = useCallback(async (id, productData) => {
        try {
            setLoading(true);
            const product = await productActions.updateProduct(id, productData);
            setProducts(prev => prev.map(p => p.id === id ? product : p));
            toast.success('Product updated successfully');
            return product;
        } catch (error) {
            toast.error(error.message || 'Failed to update product');
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteProduct = useCallback(async (id) => {
        try {
            setLoading(true);
            await productActions.deleteProduct(id);
            setProducts(prev => prev.filter(p => p.id !== id));
            setPagination(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
            toast.success('Product deleted successfully');
            return true;
        } catch (error) {
            toast.error(error.message || 'Failed to delete product');
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteProducts = useCallback(async (ids) => {
        try {
            setLoading(true);
            await productActions.deleteProducts(ids);
            setProducts(prev => prev.filter(p => !ids.includes(p.id)));
            setPagination(prev => ({ ...prev, total: Math.max(0, prev.total - ids.length) }));
            toast.success(`${ids.length} products deleted successfully`);
            return true;
        } catch (error) {
            toast.error(error.message || 'Failed to delete products');
            throw error;
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
            toast.success('Product downloaded successfully');
        } catch (error) {
            toast.error(error.message || 'Failed to download product');
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
            toast.success('Products exported to CSV successfully');
        } catch (error) {
            toast.error(error.message || 'Failed to export products');
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
            toast.success('Products exported to Excel successfully');
        } catch (error) {
            toast.error(error.message || 'Failed to export products');
        }
    }, [products]);

    // =============================================================================
    // RETURN EVERYTHING
    // =============================================================================

    return {
        // Data
        products,
        loading,
        pagination,
        filters,
        
        // CRUD
        createProduct,
        updateProduct,
        deleteProduct,
        deleteProducts,
        
        // Actions
        downloadProduct,
        exportCSV,
        exportExcel,
        fetchProducts
    };
}

export default useProducts;