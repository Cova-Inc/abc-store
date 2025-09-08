import { useMemo, useState, useEffect, useCallback } from 'react';

// Default filter values
const DEFAULT_FILTERS = {
  page: 0,
  pageSize: 10,
  searchInput: '',
  categoryFilter: 'all',
  search: '',
  filterFields: ['name', 'description'],
};

export function useProductListFilters() {
  const [page, setPage] = useState(DEFAULT_FILTERS.page);
  const [pageSize, setPageSize] = useState(DEFAULT_FILTERS.pageSize);
  const [searchInput, setSearchInput] = useState(DEFAULT_FILTERS.searchInput);
  const [categoryFilter, setCategoryFilter] = useState(DEFAULT_FILTERS.categoryFilter);
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

    // Only add filterFields if specified
    if (filterFields && filterFields.length > 0) {
      filters.filterFields = filterFields;
    }

    return filters;
  }, [search, categoryFilter, filterFields]);

  // Apply search filter
  const applyFilter = useCallback(() => {
    setSearch(searchInput);
    setPage(0); // Reset to first page when applying new filter
  }, [searchInput]);

  // Handle search input enter key
  const handleSearchEnter = useCallback(() => {
    setSearch(searchInput);
    setPage(0); // Reset to first page when applying new filter
  }, [searchInput]);

  // Clear all filters
  const clearFilter = useCallback(() => {
    setSearchInput('');
    setSearch('');
    setCategoryFilter('all');
    setPage(0);
  }, []);

  // Reset page when other filters change
  const resetPage = useCallback(() => {
    setPage(0);
  }, []);

  const setCategoryFilterWithReset = useCallback((value) => {
    setCategoryFilter(value);
    setPage(0);
  }, []);

  // Memoized filter state
  const filterState = useMemo(
    () => ({
      page,
      pageSize,
      searchInput,
      categoryFilter,
      search,
      filterFields,
      initialized,
    }),
    [page, pageSize, searchInput, categoryFilter, search, filterFields, initialized]
  );

  return {
    ...filterState,
    setPage,
    setPageSize,
    setSearchInput,
    setCategoryFilter: setCategoryFilterWithReset,
    setFilterFields,
    buildFilters,
    applyFilter,
    handleSearchEnter,
    clearFilter,
    resetPage,
  };
}
