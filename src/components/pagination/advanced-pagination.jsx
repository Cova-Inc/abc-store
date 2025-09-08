'use client';

import React, { useRef, useEffect, useCallback } from 'react';

import {
  Chip,
  Stack,
  Select,
  MenuItem,
  InputLabel,
  Pagination,
  Typography,
  FormControl,
} from '@mui/material';

import { usePaginationScroll } from 'src/hooks/use-pagination-scroll';

// ----------------------------------------------------------------------

const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 25, 50, 100];

export function AdvancedPagination({
  pageSize,
  setPageSize,
  page,
  totalCount,
  onPageChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  showPageSizeSelector = true,
  showPagination = true,
  showInfo = true,
  showTotalCount = true,
  showPageInfo = true,
  variant = 'outlined',
  size = 'small',
  color = 'primary',
  sx,
  infoProps = {},
  ...other
}) {
  // Calculate page count and info
  const pageCount = Math.ceil(totalCount / pageSize);
  const startItem = page * pageSize + 1;
  const endItem = Math.min((page + 1) * pageSize, totalCount);

  // Use pagination scroll hook for scroll preservation
  const { handlePageChange, handlePageSizeChange, saveScrollPosition } = usePaginationScroll();

  // Ref to track if we're in a pagination change
  const isChangingRef = useRef(false);

  // Save scroll position before any pagination interaction
  const handleInteractionStart = useCallback(() => {
    isChangingRef.current = true;
    saveScrollPosition();
  }, [saveScrollPosition]);

  // Enhanced page change handler
  const handlePageChangeWithScroll = useCallback(
    (_, value) => {
      handleInteractionStart();
      handlePageChange(onPageChange, value - 1);
    },
    [handlePageChange, onPageChange, handleInteractionStart]
  );

  // Enhanced page size change handler
  const handlePageSizeChangeWithScroll = useCallback(
    (e) => {
      handleInteractionStart();
      const newPageSize = Number(e.target.value);
      handlePageSizeChange(setPageSize, onPageChange, newPageSize);
    },
    [handlePageSizeChange, setPageSize, onPageChange, handleInteractionStart]
  );

  // Prevent scroll to top during pagination changes
  useEffect(() => {
    if (isChangingRef.current) {
      const preventScroll = (e) => {
        if (window.scrollY === 0) {
          // If we're at the top, try to restore the saved position
          setTimeout(() => {
            if (isChangingRef.current) {
              saveScrollPosition();
            }
          }, 10);
        }
      };

      window.addEventListener('scroll', preventScroll);

      // Clear the flag after a delay
      const timer = setTimeout(() => {
        isChangingRef.current = false;
      }, 500);

      return () => {
        window.removeEventListener('scroll', preventScroll);
        clearTimeout(timer);
      };
    }
    return undefined;
  }, [page, pageSize, saveScrollPosition]);

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{ width: '100%', ...sx }}
      {...other}
    >
      {/* Left side - Info */}
      {showInfo && (
        <Stack direction="row" spacing={2} alignItems="center">
          {showTotalCount && (
            <Typography variant="body2" color="text.secondary" {...infoProps}>
              Total: {totalCount.toLocaleString()}
            </Typography>
          )}

          {showPageInfo && totalCount > 0 && (
            <Typography variant="body2" color="text.secondary" {...infoProps}>
              Showing {startItem.toLocaleString()} - {endItem.toLocaleString()} of{' '}
              {totalCount.toLocaleString()}
            </Typography>
          )}

          {pageCount > 1 && (
            <Chip
              label={`Page ${page + 1} of ${pageCount}`}
              size="small"
              variant="outlined"
              color={color}
            />
          )}
        </Stack>
      )}

      {/* Right side - Controls */}
      <Stack direction="row" spacing={2} alignItems="center">
        {showPageSizeSelector && (
          <FormControl size={size} sx={{ minWidth: 100 }}>
            <InputLabel id="rows-per-page-label">Rows</InputLabel>
            <Select
              labelId="rows-per-page-label"
              value={pageSize}
              label="Rows"
              onChange={handlePageSizeChangeWithScroll}
              variant={variant}
            >
              {pageSizeOptions.map((optionSize) => (
                <MenuItem key={optionSize} value={optionSize}>
                  {optionSize}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {showPagination && pageCount > 1 && (
          <Pagination
            color={color}
            count={pageCount}
            page={page + 1}
            onChange={handlePageChangeWithScroll}
            size={size}
            variant={variant}
          />
        )}
      </Stack>
    </Stack>
  );
}
