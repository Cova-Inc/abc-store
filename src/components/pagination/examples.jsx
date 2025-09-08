'use client';

import React from 'react';

import { Box, Card, Stack, Typography } from '@mui/material';

import { usePaginationState } from 'src/hooks/use-pagination-state';

import { CommonPagination, AdvancedPagination } from './index';

// ----------------------------------------------------------------------

// Example 1: Basic pagination with custom hook
export function BasicPaginationExample() {
  const { page, pageSize, setPage, setPageSize, getPaginationInfo } = usePaginationState(0, 10);

  // Mock data
  const totalCount = 150;
  const paginationInfo = getPaginationInfo(totalCount);

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Basic Pagination Example
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {paginationInfo.startItem} - {paginationInfo.endItem} of {totalCount} items
        </Typography>
      </Box>

      <CommonPagination
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={setPage}
        setPageSize={setPageSize}
      />
    </Card>
  );
}

// Example 2: Advanced pagination with info display
export function AdvancedPaginationExample() {
  const { page, pageSize, setPage, setPageSize } = usePaginationState(0, 25);

  // Mock data
  const totalCount = 500;

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Advanced Pagination Example
      </Typography>

      <AdvancedPagination
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={setPage}
        setPageSize={setPageSize}
        showInfo
        showTotalCount
        showPageInfo
        variant="outlined"
        color="primary"
      />
    </Card>
  );
}

// Example 3: Minimal pagination (pagination only, no page size selector)
export function MinimalPaginationExample() {
  const { page, setPage } = usePaginationState(0, 20);

  // Mock data
  const totalCount = 200;

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Minimal Pagination Example
      </Typography>

      <CommonPagination
        page={page}
        pageSize={20}
        totalCount={totalCount}
        onPageChange={setPage}
        setPageSize={() => {}} // No-op since we don't want page size changes
        showPageSizeSelector={false}
      />
    </Card>
  );
}

// Example 4: Custom page size options
export function CustomPageSizeExample() {
  const { page, pageSize, setPage, setPageSize } = usePaginationState(0, 15);

  // Mock data
  const totalCount = 300;
  const customPageSizeOptions = [15, 30, 60, 120];

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Custom Page Size Options Example
      </Typography>

      <AdvancedPagination
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={setPage}
        setPageSize={setPageSize}
        pageSizeOptions={customPageSizeOptions}
        color="secondary"
        size="medium"
      />
    </Card>
  );
}

// Example 5: Info-only display (no controls)
export function InfoOnlyExample() {
  const { page, pageSize, getPaginationInfo } = usePaginationState(0, 10);

  // Mock data
  const totalCount = 75;
  const paginationInfo = getPaginationInfo(totalCount);

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Info Only Example
      </Typography>

      <AdvancedPagination
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={() => {}} // No-op
        setPageSize={() => {}} // No-op
        showPagination={false}
        showPageSizeSelector={false}
        showInfo
      />
    </Card>
  );
}

// Example 6: All examples together
export function AllPaginationExamples() {
  return (
    <Stack spacing={3}>
      <BasicPaginationExample />
      <AdvancedPaginationExample />
      <MinimalPaginationExample />
      <CustomPageSizeExample />
      <InfoOnlyExample />
    </Stack>
  );
}
