import { useMemo, useState, useEffect, useCallback } from 'react';

// Default filter values
const DEFAULT_FILTERS = {
  page: 0,
  pageSize: 10,
  searchInput: '',
  categoryFilter: 'all',
  search: '',
  filterFields: ['name'],
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

  // Build filters object for API calls
  const buildFilters = useCallback(() => {
    const filters = {
      page,
      pageSize,
      search: search.trim(),
      category: categoryFilter !== 'all' ? categoryFilter : undefined,
      filterFields: filterFields.length > 0 ? filterFields : undefined,
    };

    // Remove undefined values
    return Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== undefined));
  }, [page, pageSize, search, categoryFilter, filterFields]);

  // Apply search filter
  const applyFilter = useCallback(() => {
    setSearch(searchInput);
    setPage(0); // Reset to first page when applying new filter
  }, [searchInput]);

  // Handle search input enter key
  const handleSearchEnter = useCallback(
    (event) => {
      if (event.key === 'Enter') {
        applyFilter();
      }
    },
    [applyFilter]
  );

  // Clear all filters
  const clearFilter = useCallback(() => {
    setSearchInput('');
    setSearch('');
    setCategoryFilter('all');
    setFilterFields([]);
    setPage(0);
  }, []);

  // Reset page when other filters change
  const resetPage = useCallback(() => {
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
    setCategoryFilter,
    setFilterFields,
    buildFilters,
    applyFilter,
    handleSearchEnter,
    clearFilter,
    resetPage,
  };
}
