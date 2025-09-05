import { useMemo, useState, useCallback } from 'react';

export function useDeleteManager(buildFilters, fetchProducts, page, pageSize, clearError, setError, currentFilters, setPage) {
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [selectedRowIds, setSelectedRowIds] = useState([]);

    // Handle single product delete
    const handleSingleDelete = useCallback((product) => {
        setSelectedRowIds([product.id]);
    }, []);

    // Handle delete action (show confirmation)
    const handleDelete = useCallback((selectedIds, selectAllActive, totalCount) => {
        setSelectedRowIds(selectedIds);
    }, []);

    // Handle delete confirmation
    const handleDeleteConfirm = useCallback(async (selectedIds, selectAllActive, clearSelection, totalCount) => {
        try {
            setDeleteLoading(true);
            clearError();

            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Simulate successful deletion
            console.log('Deleting products:', selectedIds);

            // Clear selection
            clearSelection();

            // Refresh the list
            const filters = buildFilters();
            await fetchProducts(filters, page, pageSize);

            // Reset to first page if we're on a page that no longer exists
            if (page > 0) {
                setPage(0);
            }

        } catch (err) {
            console.error('Delete error:', err);
            setError(err.message || 'Failed to delete products');
        } finally {
            setDeleteLoading(false);
        }
    }, [buildFilters, fetchProducts, page, pageSize, clearError, setError, setPage]);

    // Get delete confirmation text
    const deleteConfirmText = useMemo(() => {
        const selectedCount = selectedRowIds?.length || 0;
        
        if (selectedCount === 0) {
            return {
                title: 'Delete Products',
                content: 'Are you sure you want to delete the selected products? This action cannot be undone.',
            };
        } if (selectedCount === 1) {
            return {
                title: 'Delete Product',
                content: 'Are you sure you want to delete this product? This action cannot be undone.',
            };
        } 
            return {
                title: 'Delete Products',
                content: `Are you sure you want to delete ${selectedCount} products? This action cannot be undone.`,
            };
        
    }, [selectedRowIds]);

    return {
        deleteLoading,
        handleSingleDelete,
        handleDelete,
        handleDeleteConfirm,
        deleteConfirmText,
    };
}