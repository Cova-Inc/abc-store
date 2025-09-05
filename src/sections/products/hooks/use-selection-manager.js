import { useMemo, useState, useCallback } from 'react';

export function useSelectionManager(products = []) {
    const [selectedRowIds, setSelectedRowIds] = useState([]);
    const [selectAllActive, setSelectAllActive] = useState(false);

    // Check if a product is selected
    const isProductSelected = useCallback((productId) => selectedRowIds.includes(productId), [selectedRowIds]);

    // Handle individual product selection
    const handleSelectProduct = useCallback((productId) => {
        setSelectedRowIds(prev => {
            if (prev.includes(productId)) {
                return prev.filter(id => id !== productId);
            } 
                return [...prev, productId];
            
        });
    }, []);

    // Handle select all
    const handleSelectAll = useCallback(() => {
        if (selectAllActive) {
            // Deselect all
            setSelectedRowIds([]);
            setSelectAllActive(false);
        } else {
            // Select all visible products
            const allProductIds = products.map(product => product.id);
            setSelectedRowIds(allProductIds);
            setSelectAllActive(true);
        }
    }, [selectAllActive, products]);

    // Clear selection
    const clearSelection = useCallback(() => {
        setSelectedRowIds([]);
        setSelectAllActive(false);
    }, []);

    // Check if all visible products are selected
    const isChecked = useMemo(() => {
        if (!products || products.length === 0) return false;
        return products.every(product => selectedRowIds.includes(product.id));
    }, [products, selectedRowIds]);

    // Check if some (but not all) products are selected
    const isIndeterminate = useMemo(() => {
        const selectedCount = selectedRowIds.length;
        const productCount = products?.length || 0;
        return selectedCount > 0 && selectedCount < productCount;
    }, [selectedRowIds.length, products?.length]);

    // Get selected count
    const selectedCount = useMemo(() => selectedRowIds.length, [selectedRowIds.length]);

    return {
        selectedRowIds,
        selectAllActive,
        isProductSelected,
        handleSelectProduct,
        handleSelectAll,
        clearSelection,
        isChecked,
        isIndeterminate,
        selectedCount,
    };
}