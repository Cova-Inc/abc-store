import { useMemo, useState, useEffect, useCallback } from 'react';

// Default filter values
const DEFAULT_FILTERS = {
  page: 0,
  pageSize: 10,
  searchInput: '',
  categoryFilter: 'all',
  userFilter: 'all',
  search: '',
  filterFields: ['name', 'description'],
};

// localStorage keys for persistence
const PAGE_SIZE_STORAGE_KEY = 'product-list-page-size';
const CURRENT_PAGE_STORAGE_KEY = 'product-list-current-page';

// Helper function to get pageSize from localStorage
const getStoredPageSize = () => {
  if (typeof window === 'undefined') return DEFAULT_FILTERS.pageSize;

  try {
    const stored = localStorage.getItem(PAGE_SIZE_STORAGE_KEY);
    return stored ? parseInt(stored, 10) : DEFAULT_FILTERS.pageSize;
  } catch {
    return DEFAULT_FILTERS.pageSize;
  }
};

// Helper function to get current page from localStorage
const getStoredCurrentPage = () => {
  if (typeof window === 'undefined') return DEFAULT_FILTERS.page;

  try {
    const stored = localStorage.getItem(CURRENT_PAGE_STORAGE_KEY);
    return stored ? parseInt(stored, 10) : DEFAULT_FILTERS.page;
  } catch {
    return DEFAULT_FILTERS.page;
  }
};

export function useProductListFilters() {
  const [page, setPage] = useState(getStoredCurrentPage);
  const [pageSize, setPageSize] = useState(getStoredPageSize);
  const [searchInput, setSearchInput] = useState(DEFAULT_FILTERS.searchInput);
  const [categoryFilter, setCategoryFilter] = useState(DEFAULT_FILTERS.categoryFilter);
  const [userFilter, setUserFilter] = useState(DEFAULT_FILTERS.userFilter);
  const [search, setSearch] = useState(DEFAULT_FILTERS.search);
  const [filterFields, setFilterFields] = useState(DEFAULT_FILTERS.filterFields);

  // Track if filters have been initialized
  const [initialized, setInitialized] = useState(false);

  // Initialize filters on mount
  useEffect(() => {
    setInitialized(true);
  }, []);

  // Build filters object for API calls (excluding pagination)
  const buildFilters = useCallback(() => {
    const filters = {};

    // Only add search if it's not empty
    if (search.trim()) {
      filters.search = search.trim();
    }

    // Only add category if it's not 'all'
    if (categoryFilter && categoryFilter !== 'all') {
      filters.category = categoryFilter;
    }

    // Only add user filter if it's not 'all'
    if (userFilter && userFilter !== 'all') {
      filters.createdBy = userFilter;
    }

    // Only add filterFields if specified
    if (filterFields && filterFields.length > 0) {
      filters.filterFields = filterFields;
    }

    return filters;
  }, [search, categoryFilter, userFilter, filterFields]);

  // Custom setPage that also saves to localStorage
  const setPageWithStorage = useCallback((newPage) => {
    setPage(newPage);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(CURRENT_PAGE_STORAGE_KEY, newPage.toString());
      } catch (error) {
        console.warn('Failed to save current page to localStorage:', error);
      }
    }
  }, []);

  // Apply search filter
  const applyFilter = useCallback(() => {
    setSearch(searchInput);
    setPageWithStorage(0); // Reset to first page when applying new filter
  }, [searchInput, setPageWithStorage]);

  // Handle search input enter key
  const handleSearchEnter = useCallback(() => {
    setSearch(searchInput);
    setPageWithStorage(0); // Reset to first page when applying new filter
  }, [searchInput, setPageWithStorage]);

  // Clear all filters
  const clearFilter = useCallback(() => {
    setSearchInput('');
    setSearch('');
    setCategoryFilter('all');
    setUserFilter('all');
    setPageWithStorage(0);
  }, [setPageWithStorage]);

  // Reset page when other filters change
  const resetPage = useCallback(() => {
    setPageWithStorage(0);
  }, [setPageWithStorage]);

  const setCategoryFilterWithReset = useCallback(
    (value) => {
      setCategoryFilter(value);
      setPageWithStorage(0);
    },
    [setPageWithStorage]
  );

  const setUserFilterWithReset = useCallback(
    (value) => {
      setUserFilter(value);
      setPageWithStorage(0);
    },
    [setPageWithStorage]
  );

  // Custom setPageSize that also saves to localStorage
  const setPageSizeWithStorage = useCallback((newPageSize) => {
    setPageSize(newPageSize);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(PAGE_SIZE_STORAGE_KEY, newPageSize.toString());
      } catch (error) {
        console.warn('Failed to save pageSize to localStorage:', error);
      }
    }
  }, []);

  // Memoized filter state
  const filterState = useMemo(
    () => ({
      page,
      pageSize,
      searchInput,
      categoryFilter,
      userFilter,
      search,
      filterFields,
      initialized,
    }),
    [page, pageSize, searchInput, categoryFilter, userFilter, search, filterFields, initialized]
  );

  return {
    ...filterState,
    setPage: setPageWithStorage,
    setPageSize: setPageSizeWithStorage,
    setSearchInput,
    setCategoryFilter: setCategoryFilterWithReset,
    setUserFilter: setUserFilterWithReset,
    setFilterFields,
    buildFilters,
    applyFilter,
    handleSearchEnter,
    clearFilter,
    resetPage,
  };
}
