'use client';

import React from 'react';

import { Stack, Select, MenuItem, InputLabel, FormControl } from '@mui/material';

import { useTranslate } from 'src/locales/use-locales';

import { SearchWithFields } from './search-with-fields';

export function CommonToolbar({
  // Filter props
  filterValue,
  setFilterValue,
  filterOptions,
  filterLabel = 'Filter',

  // User filter props
  userFilterValue,
  setUserFilterValue,
  userFilterOptions,
  userFilterLabel = 'Uploaded By',
  showUserFilter = false,

  // Search props
  searchInput,
  setSearchInput,
  filterFields,
  setFilterFields,
  filterFieldOptions,
  onSearchEnter,

  // Action props
  onClear,

  // Custom props
  placeholder = 'Search...',
  minFilterWidth = 200,
  minSearchWidth = 250,
}) {
  const { t } = useTranslate('products');
  return (
    <Stack direction="row" spacing={2} alignItems="center" sx={{ p: 2 }}>
      {filterOptions && (
        <FormControl sx={{ minWidth: minFilterWidth }}>
          <InputLabel id="filter-label">{filterLabel}</InputLabel>
          <Select
            labelId="filter-label"
            value={filterValue}
            label={filterLabel}
            onChange={(e) => setFilterValue(e.target.value)}
          >
            <MenuItem value="all">{t('all')}</MenuItem>
            {filterOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label.startsWith('categories.') ? t(option.label) : option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      <SearchWithFields
        search={searchInput}
        setSearch={setSearchInput}
        filterFields={filterFields}
        setFilterFields={setFilterFields}
        onFilter={onSearchEnter}
        onClear={onClear}
        filterFieldOptions={filterFieldOptions}
        placeholder={placeholder}
        minWidth={minSearchWidth}
      />

      {showUserFilter && userFilterOptions && (
        <FormControl sx={{ minWidth: minFilterWidth }}>
          <InputLabel id="user-filter-label">{userFilterLabel}</InputLabel>
          <Select
            labelId="user-filter-label"
            value={userFilterValue}
            label={userFilterLabel}
            onChange={(e) => setUserFilterValue(e.target.value)}
          >
            <MenuItem value="all">{t('all')}</MenuItem>
            {userFilterOptions.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </Stack>
  );
}
