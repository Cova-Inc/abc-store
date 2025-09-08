'use client';

import { useMemo, useState, useCallback } from 'react';

// ----------------------------------------------------------------------

export function usePaginationState(initialPage = 0, initialPageSize = 10) {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Enhanced page change handler with scroll preservation
  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  // Enhanced page size change handler with scroll preservation
  const handlePageSizeChange = useCallback((newPageSize) => {
    setPageSize(newPageSize);
    setPage(0); // Reset to first page when changing page size
  }, []);

  // Reset pagination to initial state
  const resetPagination = useCallback(() => {
    setPage(initialPage);
    setPageSize(initialPageSize);
  }, [initialPage, initialPageSize]);

  // Go to specific page
  const goToPage = useCallback((targetPage) => {
    setPage(targetPage);
  }, []);

  // Go to first page
  const goToFirstPage = useCallback(() => {
    setPage(0);
  }, []);

  // Go to last page (requires total count)
  const goToLastPage = useCallback(
    (totalCount) => {
      const lastPage = Math.ceil(totalCount / pageSize) - 1;
      setPage(Math.max(0, lastPage));
    },
    [pageSize]
  );

  // Calculate pagination info
  const getPaginationInfo = useCallback(
    (totalCount) => {
      const pageCount = Math.ceil(totalCount / pageSize);
      const startItem = page * pageSize + 1;
      const endItem = Math.min((page + 1) * pageSize, totalCount);
      const hasNextPage = page < pageCount - 1;
      const hasPrevPage = page > 0;

      return {
        pageCount,
        startItem,
        endItem,
        hasNextPage,
        hasPrevPage,
        currentPage: page,
        pageSize,
      };
    },
    [page, pageSize]
  );

  // Memoized pagination state
  const paginationState = useMemo(
    () => ({
      page,
      pageSize,
      setPage: handlePageChange,
      setPageSize: handlePageSizeChange,
      resetPagination,
      goToPage,
      goToFirstPage,
      goToLastPage,
      getPaginationInfo,
    }),
    [
      page,
      pageSize,
      handlePageChange,
      handlePageSizeChange,
      resetPagination,
      goToPage,
      goToFirstPage,
      goToLastPage,
      getPaginationInfo,
    ]
  );

  return paginationState;
}
