import axios from 'src/utils/axios';

// =============================================================================
// PRODUCT API FUNCTIONS
// =============================================================================

// Get all products with filtering and pagination
export async function getProducts(params = {}) {
    try {
        const response = await axios.get('/api/products', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching products:', error);
        throw new Error(error.response?.data?.error || 'Failed to fetch products');
    }
}

// Get a single product by ID
export async function getProduct(id) {
    try {
        const response = await axios.get(`/api/products/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching product:', error);
        throw new Error(error.response?.data?.error || 'Failed to fetch product');
    }
}

// Create a new product
export async function createProduct(productData) {
    try {
        const response = await axios.post('/api/products', productData);
        return response.data;
    } catch (error) {
        console.error('Error creating product:', error);
        throw new Error(error.response?.data?.error || 'Failed to create product');
    }
}

// Update a product
export async function updateProduct(id, productData) {
    try {
        const response = await axios.put(`/api/products/${id}`, productData);
        return response.data;
    } catch (error) {
        console.error('Error updating product:', error);
        throw new Error(error.response?.data?.error || 'Failed to update product');
    }
}

// Delete a product
export async function deleteProduct(id) {
    try {
        const response = await axios.delete(`/api/products/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting product:', error);
        throw new Error(error.response?.data?.error || 'Failed to delete product');
    }
}

// Delete multiple products
export async function deleteProducts(ids) {
    try {
        const response = await axios.post('/api/products/bulk-delete', { ids });
        return response.data;
    } catch (error) {
        console.error('Error deleting products:', error);
        throw new Error(error.response?.data?.error || 'Failed to delete products');
    }
}

// =============================================================================
// EXPORT FUNCTIONS
// =============================================================================

// Download product data as a file
export async function downloadProduct(productId) {
    try {
        const productData = await getProduct(productId);
        const jsonString = JSON.stringify(productData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        return blob;
    } catch (error) {
        console.error('Error downloading product:', error);
        throw new Error('Failed to download product data');
    }
}

// Export products to CSV
export async function exportProductsToCSV(products) {
    try {
        if (!products || products.length === 0) {
            throw new Error('No products to export');
        }

        const headers = [
            'ID', 'Name', 'Description', 'Price', 'Original Price', 'Category', 
            'Status', 'Stock', 'SKU', 'Tags', 'Created At', 'Updated At'
        ];

        const rows = products.map(product => [
            product.id,
            `"${product.name}"`,
            `"${product.description || ''}"`,
            product.price,
            product.originalPrice || '',
            product.category,
            product.status,
            product.stock || '',
            product.sku || '',
            `"${(product.tags || []).join(', ')}"`,
            product.createdAt,
            product.updatedAt || ''
        ]);

        const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        
        return blob;
    } catch (error) {
        console.error('Error exporting products to CSV:', error);
        throw new Error('Failed to export products to CSV');
    }
}

// Export products to Excel
export async function exportProductsToExcel(products) {
    try {
        if (!products || products.length === 0) {
            throw new Error('No products to export');
        }
        return await exportProductsToCSV(products);
    } catch (error) {
        console.error('Error exporting products to Excel:', error);
        throw new Error('Failed to export products to Excel');
    }
}