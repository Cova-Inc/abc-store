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
import { useTranslate } from 'src/locales/use-locales';
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

import axios from 'src/utils/axios';
import { useAuthContext } from 'src/auth/hooks';

import { ProductListItem } from '../components';
import { useProducts, usePdfDownload, useSelectionManager, useProductListFilters } from '../hooks';

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
  const [uploaders, setUploaders] = useState([]);
  const { t } = useTranslate('products');

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
    userFilter,
    search,
    filterFields,
    initialized,
    setPage,
    setPageSize,
    setSearchInput,
    setCategoryFilter,
    setUserFilter,
    setFilterFields,
    buildFilters,
    applyFilter,
    handleSearchEnter,
    clearFilter,
  } = useProductListFilters();

  // Selection management
  const selectionManager = useSelectionManager(products);

  // PDF download functionality
  const { isDownloading, downloadProductsPDF, downloadAllProductsPDF } = usePdfDownload();

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
        toast.success(t('deleteSuccess'));
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
        toast.success(t('deleteMultipleSuccess', { count: result.count }));

        // Go to first page after deleting all
        pageToFetch = 0;
        setPage(0);
      } else if (selectionManager.selectedRowIds.length > 0) {
        // Delete selected products
        result = await deleteProducts(selectionManager.selectedRowIds);
        toast.success(t('deleteMultipleSuccess', { count: result.count }));

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
      toast.error(err.message || t('deleteFailed'));
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
    t,
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

  const handleDownloadPDF = useCallback(() => {
    if (selectionManager.selectedRowIds.length === 0) {
      toast.error('Please select products to download');
      return;
    }
    downloadProductsPDF(selectionManager.selectedRowIds);
  }, [selectionManager.selectedRowIds, downloadProductsPDF]);

  const handleDownloadAllPDF = useCallback(() => {
    const filters = buildFilters();
    downloadAllProductsPDF(filters);
  }, [downloadAllProductsPDF, buildFilters]);

  // =============================================================================
  // EFFECTS
  // =============================================================================

  // Fetch uploaders when component mounts (admin only)
  useEffect(() => {
    const fetchUploaders = async () => {
      if (user?.role === 'admin') {
        try {
          const response = await axios.get('/api/products/uploaders');
          setUploaders(response.data.uploaders || []);
        } catch (err) {
          console.error('Failed to fetch uploaders:', err);
        }
      }
    };
    fetchUploaders();
  }, [user]);

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
    userFilter,
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
        title={error.code === 403 ? t('error.403') : t('error.404')}
        description={error.message}
        actionText={t('retry')}
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
          filterLabel={t('category')}
          placeholder={t('searchPlaceholder')}
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          onFilter={applyFilter}
          onClear={clearFilter}
          onSearchEnter={handleSearchEnter}
          filterFields={filterFields}
          setFilterFields={setFilterFields}
          filterFieldOptions={PRODUCT_FILTER_FIELD_OPTIONS}
          showUserFilter={user?.role === 'admin'}
          userFilterValue={userFilter}
          setUserFilterValue={setUserFilter}
          userFilterOptions={uploaders}
          userFilterLabel="Uploaded By"
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
                {t('selectedCount', {
                  selected: selectionManager.selectedCount,
                  count: totalCount,
                })}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1}>
              <LoadingButton
                variant="outlined"
                startIcon={<Iconify icon="eva:download-outline" />}
                onClick={handleDownloadAllPDF}
                loading={isDownloading}
                size="small"
                sx={{ whiteSpace: 'nowrap' }}
              >
                Download All
              </LoadingButton>
              {hasSelection && (
                <>
                  <IconButton
                    onClick={handleDownloadPDF}
                    disabled={isDownloading}
                    size="medium"
                    aria-label="Download selected products as PDF"
                    title="Download PDF"
                  >
                    <Iconify
                      icon={isDownloading ? 'eos-icons:loading' : 'eva:download-outline'}
                      sx={{
                        animation: isDownloading ? 'spin 1s linear infinite' : 'none',
                        '@keyframes spin': {
                          '0%': { transform: 'rotate(0deg)' },
                          '100%': { transform: 'rotate(360deg)' },
                        },
                      }}
                    />
                  </IconButton>
                  <IconButton
                    onClick={handleDelete}
                    size="medium"
                    aria-label="Delete selected products"
                    title="Delete selected products"
                  >
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </>
              )}
            </Stack>
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
              title={t('noProductsTitle')}
              description={t('noProductsDescription')}
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
        title={t('deleteConfirmTitle')}
        content={
          productToDelete
            ? t('deleteConfirmSingle', { name: productToDelete.name })
            : selectionManager.selectAllActive &&
                selectionManager.selectedRowIds.length === products.length
              ? t('deleteConfirmAll')
              : t('deleteConfirmMultiple', { count: selectionManager.selectedCount })
        }
        action={
          <LoadingButton
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
            loading={loading}
          >
            {t('deleteButton')}
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
            boxShadow: (muiTheme) => muiTheme.customShadows.primary,
            '&:hover': {
              boxShadow: (muiTheme) => muiTheme.customShadows.primaryHover,
            },
          }}
        >
          <Iconify icon="eva:plus-fill" />
        </Fab>
      </Box>
    </DashboardContent>
  );
}
