'use client';

import React, { useRef, useEffect, useCallback } from 'react';

import { Stack, Select, MenuItem, InputLabel, Pagination, FormControl } from '@mui/material';

import { usePaginationScroll } from 'src/hooks/use-pagination-scroll';

// ----------------------------------------------------------------------

const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 25, 50, 100];

export function CommonPagination({
    pageSize,
    setPageSize,
    page,
    totalCount,
    onPageChange,
    pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
    showPageSizeSelector = true,
    showPagination = true,
    sx,
    ...other
}) {
    // Calculate page count based on total count and page size
    const pageCount = Math.ceil(totalCount / pageSize);

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
    const handlePageChangeWithScroll = useCallback((_, value) => {
        handleInteractionStart();
        handlePageChange(onPageChange, value - 1);
    }, [handlePageChange, onPageChange, handleInteractionStart]);

    // Enhanced page size change handler
    const handlePageSizeChangeWithScroll = useCallback((e) => {
        handleInteractionStart();
        const newPageSize = Number(e.target.value);
        handlePageSizeChange(setPageSize, onPageChange, newPageSize);
    }, [handlePageSizeChange, setPageSize, onPageChange, handleInteractionStart]);

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
            justifyContent="right"
            alignItems="center"
            sx={{ width: '100%', ...sx }}
            {...other}
        >
            <Stack direction="row" spacing={2} alignItems="center">
                {showPageSizeSelector && (
                    <FormControl sx={{ minWidth: 100 }}>
                        <InputLabel id="rows-per-page-label">Rows</InputLabel>
                        <Select
                            size="small"
                            labelId="rows-per-page-label"
                            value={pageSize}
                            label="Rows"
                            onChange={handlePageSizeChangeWithScroll}
                        >
                            {pageSizeOptions.map((size) => (
                                <MenuItem key={size} value={size}>
                                    {size}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}

                {showPagination && (
                    <Pagination
                        color="primary"
                        count={pageCount}
                        page={page + 1}
                        onChange={handlePageChangeWithScroll}
                    />
                )}
            </Stack>
        </Stack>
    );
} 