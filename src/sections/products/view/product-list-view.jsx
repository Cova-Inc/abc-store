'use client';

import React, { useState, useEffect, useCallback } from 'react';

import LoadingButton from '@mui/lab/LoadingButton';
import {
  Fab,
  Box,
  Card,
  List,
  Grid,
  Stack,
  Checkbox,
  useTheme,
  Typography,
  IconButton,
  useMediaQuery,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks';
import { DashboardContent } from 'src/layouts/dashboard';
import { PRODUCT_CATEGORY_OPTIONS, PRODUCT_FILTER_FIELD_OPTIONS } from 'src/config-global';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { ErrorSection } from 'src/components/result-section';
import {
  CommonToolbar,
  CommonListSkeleton,
  CommonListPagination,
} from 'src/components/common-list';

import { useAuthContext } from 'src/auth/hooks';

import { ProductListItem } from '../components';
import { useProducts, useSelectionManager, useProductListFilters } from '../hooks';

// =============================================================================
// MAIN COMPONENT - SIMPLE AND CLEAN
// =============================================================================

export default function ProductListView() {
  const router = useRouter();
  const confirmRows = useBoolean();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuthContext();
  const [productToDelete, setProductToDelete] = useState(null);

  // ONE HOOK FOR EVERYTHING
  const {
    products,
    loading,
    error,
    pagination,
    deleteProduct,
    deleteProducts,
    deleteAllProducts,
    fetchProducts,
  } = useProducts();

  // Filter hooks
  const {
    page,
    pageSize,
    searchInput,
    categoryFilter,
    search,
    filterFields,
    initialized,
    setPage,
    setPageSize,
    setSearchInput,
    setCategoryFilter,
    setFilterFields,
    buildFilters,
    applyFilter,
    handleSearchEnter,
    clearFilter,
  } = useProductListFilters();

  // Selection management
  const selectionManager = useSelectionManager(products);

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const handleViewProduct = useCallback(
    (productId) => {
      router.push(paths.main.products.details(productId));
    },
    [router]
  );

  const handleEditProduct = useCallback(
    (productId) => {
      router.push(paths.main.products.edit(productId));
    },
    [router]
  );

  const handleNewProduct = useCallback(() => {
    router.push(paths.main.products.new);
  }, [router]);

  const handlePageChange = useCallback(
    (newPage) => {
      setPage(newPage);
    },
    [setPage]
  );

  const handlePageSizeChange = useCallback(
    (newPageSize) => {
      setPageSize(newPageSize);
      setPage(0);
    },
    [setPageSize, setPage]
  );

  const handleDeleteConfirm = useCallback(async () => {
    try {
      let result;
      let pageToFetch = page;

      if (productToDelete) {
        // Delete single product
        await deleteProduct(productToDelete.id);
        toast.success('Product deleted successfully');
        setProductToDelete(null);

        // If this was the last item on the page and not on first page, go to previous page
        if (products.length === 1 && page > 0) {
          pageToFetch = page - 1;
          setPage(pageToFetch);
        }
      } else if (
        selectionManager.selectAllActive &&
        selectionManager.selectedRowIds.length === products.length
      ) {
        // Delete all products with current filters - go to first page
        const deleteFilters = buildFilters();
        result = await deleteAllProducts(deleteFilters);
        toast.success(`${result.count} products deleted successfully`);

        // Go to first page after deleting all
        pageToFetch = 0;
        setPage(0);
      } else if (selectionManager.selectedRowIds.length > 0) {
        // Delete selected products
        result = await deleteProducts(selectionManager.selectedRowIds);
        toast.success(`${result.count} products deleted successfully`);

        // If we deleted all items on current page and not on first page, go to previous page
        if (selectionManager.selectedRowIds.length === products.length && page > 0) {
          pageToFetch = page - 1;
          setPage(pageToFetch);
        }
      }

      selectionManager.clearSelection();
      confirmRows.onFalse();

      // Refresh the list after delete with appropriate page
      const filters = buildFilters();
      await fetchProducts({
        ...filters,
        page: pageToFetch + 1, // API uses 1-based pagination
        limit: pageSize,
      });
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error(err.message || 'Failed to delete products');
    }
  }, [
    productToDelete,
    selectionManager,
    products,
    deleteProduct,
    deleteProducts,
    deleteAllProducts,
    buildFilters,
    confirmRows,
    fetchProducts,
    page,
    pageSize,
    setPage,
  ]);

  const handleDelete = useCallback(() => {
    confirmRows.onTrue();
  }, [confirmRows]);

  const handleSingleDelete = useCallback(
    (product) => {
      setProductToDelete(product);
      confirmRows.onTrue();
    },
    [confirmRows]
  );

  // =============================================================================
  // EFFECTS
  // =============================================================================

  // Fetch data when filters change
  useEffect(() => {
    if (initialized) {
      const filters = buildFilters();
      fetchProducts({
        ...filters,
        page: page + 1, // API uses 1-based pagination
        limit: pageSize,
      });
    }
  }, [
    initialized,
    page,
    pageSize,
    categoryFilter,
    search,
    filterFields,
    buildFilters,
    fetchProducts,
  ]);

  // =============================================================================
  // RENDER
  // =============================================================================

  const hasSelection = selectionManager.selectedCount > 0;
  const totalCount = pagination?.total || 0;

  if (error) {
    return (
      <ErrorSection
        error={error.code === 403 ? '403' : error.code === 404 ? '404' : '500'}
        title={error.code === 403 ? 'Access Denied' : 'Failed to Load Products'}
        description={error.message}
        actionText="Retry"
        onAction={() => {
          const filters = buildFilters();
          fetchProducts({
            ...filters,
            page: page + 1, // API uses 1-based pagination
            limit: pageSize,
          });
        }}
        icon={<Iconify icon="eva:refresh-fill" />}
      />
    );
  }

  return (
    <DashboardContent>
      {/* Filter Toolbar */}
      <Card sx={{ mb: 3 }}>
        <CommonToolbar
          filterValue={categoryFilter}
          setFilterValue={setCategoryFilter}
          filterOptions={PRODUCT_CATEGORY_OPTIONS}
          filterLabel="カテゴリー"
          placeholder="商品を検索..."
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          onFilter={applyFilter}
          onClear={clearFilter}
          onSearchEnter={handleSearchEnter}
          filterFields={filterFields}
          setFilterFields={setFilterFields}
          filterFieldOptions={PRODUCT_FILTER_FIELD_OPTIONS}
          minFilterWidth={isMobile ? 100 : 200}
          minSearchWidth={isMobile ? 150 : 250}
        />
      </Card>

      {/* Product List */}
      <Card>
        {/* Selection Header */}
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={2}>
              <Checkbox
                checked={selectionManager.isChecked}
                indeterminate={selectionManager.isIndeterminate}
                onChange={selectionManager.handleSelectAll}
                aria-label="Select all products"
              />
              <Typography variant="body2" color="text.secondary">
                {selectionManager.selectedCount} of {totalCount} selected
              </Typography>
            </Stack>
            {hasSelection && (
              <IconButton
                onClick={handleDelete}
                size="medium"
                sx={{ ml: 'auto' }}
                aria-label="Delete selected products"
              >
                <Iconify icon="solar:trash-bin-trash-bold" />
              </IconButton>
            )}
          </Stack>
        </Box>

        {/* Product List Content */}
        <Box sx={{ minHeight: 400 }}>
          {loading ? (
            <CommonListSkeleton
              itemCount={5}
              showSelectionHeader={false}
              showActionButtons
              actionButtonCount={3}
            />
          ) : products.length === 0 ? (
            <EmptyContent
              sx={{ height: '500px' }}
              title="No Products Found"
              description="No products have been added yet. Add your first product to get started."
            />
          ) : isMobile ? (
            // Mobile Grid Layout
            <Grid container spacing={2} sx={{ p: 2 }}>
              {products.map((product) => (
                <Grid item xs={6} sm={4} key={product.id}>
                  <ProductListItem
                    product={product}
                    currentUser={user}
                    isSelected={selectionManager.isProductSelected(product.id)}
                    onSelect={selectionManager.handleSelectProduct}
                    onView={handleViewProduct}
                    onEdit={handleEditProduct}
                    onDelete={handleSingleDelete}
                    onProductUpdate={fetchProducts}
                    isMobile={isMobile}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            // Desktop List Layout
            <List sx={{ p: 2 }}>
              {products.map((product) => (
                <ProductListItem
                  key={product.id}
                  product={product}
                  currentUser={user}
                  isSelected={selectionManager.isProductSelected(product.id)}
                  onSelect={selectionManager.handleSelectProduct}
                  onView={handleViewProduct}
                  onEdit={handleEditProduct}
                  onDelete={handleSingleDelete}
                  onProductUpdate={fetchProducts}
                  isMobile={isMobile}
                />
              ))}
            </List>
          )}
        </Box>

        {/* Pagination */}
        <Box sx={{ p: 2 }}>
          <CommonListPagination
            pageSize={pageSize}
            setPageSize={handlePageSizeChange}
            page={page}
            totalCount={totalCount}
            onPageChange={handlePageChange}
          />
        </Box>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={confirmRows.value}
        onClose={() => {
          confirmRows.onFalse();
          setProductToDelete(null);
        }}
        title={productToDelete ? 'Delete Product' : 'Delete Products'}
        content={
          productToDelete
            ? `Are you sure you want to delete "${productToDelete.name}"? This action cannot be undone.`
            : selectionManager.selectAllActive &&
                selectionManager.selectedRowIds.length === products.length
              ? `Are you sure you want to delete ALL ${products.length} product(s) matching the current filters? This action cannot be undone.`
              : `Are you sure you want to delete ${selectionManager.selectedCount} selected product(s)? This action cannot be undone.`
        }
        action={
          <LoadingButton
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
            loading={loading}
          >
            Delete
          </LoadingButton>
        }
      />

      {/* Floating Action Button */}
      <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
        <Fab
          color="primary"
          aria-label="Add new product"
          onClick={handleNewProduct}
          sx={{
            boxShadow: (t) => t.customShadows.primary,
            '&:hover': {
              boxShadow: (t) => t.customShadows.primaryHover,
            },
          }}
        >
          <Iconify icon="eva:plus-fill" />
        </Fab>
      </Box>
    </DashboardContent>
  );
}
