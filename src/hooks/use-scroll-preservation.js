'use client';

import { useRef, useEffect, useCallback } from 'react';

import { usePathname, useSearchParams } from 'src/routes/hooks';

// ----------------------------------------------------------------------

export function useScrollPreservation() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const scrollPositionRef = useRef(0);
    const isNavigatingRef = useRef(false);
    const prevPathnameRef = useRef(pathname);
    const prevSearchParamsRef = useRef(searchParams);

    // Save scroll position before navigation
    const saveScrollPosition = useCallback(() => {
        if (typeof window !== 'undefined') {
            scrollPositionRef.current = window.scrollY;
        }
    }, []);

    // Restore scroll position after navigation
    const restoreScrollPosition = useCallback(() => {
        if (typeof window !== 'undefined' && scrollPositionRef.current > 0) {
            // Use requestAnimationFrame to ensure DOM is ready
            requestAnimationFrame(() => {
                window.scrollTo(0, scrollPositionRef.current);
            });
        }
    }, []);

    // Check if this is a pagination change (same pathname, different search params)
    const isPaginationChange = useCallback((prevPathname, prevSearchParams, currentPathname, currentSearchParams) => {
        if (prevPathname !== currentPathname) return false;

        const prevPage = prevSearchParams?.get('page');
        const currentPage = currentSearchParams?.get('page');
        const prevPageSize = prevSearchParams?.get('pageSize');
        const currentPageSize = currentSearchParams?.get('pageSize');

        return prevPage !== currentPage || prevPageSize !== currentPageSize;
    }, []);

    // Handle scroll preservation for pagination
    const handlePaginationScroll = useCallback(() => {
        if (isNavigatingRef.current) {
            // Add a longer delay for global scroll restoration to avoid conflicts
            setTimeout(() => {
                restoreScrollPosition();
                isNavigatingRef.current = false;
            }, 400); // Longer delay to let pagination scroll handle it first
        }
    }, [restoreScrollPosition]);

    // Effect to handle navigation changes
    useEffect(() => {
        const currentSearchParamsString = searchParams?.toString() || '';
        const prevSearchParamsString = prevSearchParamsRef.current?.toString() || '';

        // Check if this is a pagination change
        const isPagination = isPaginationChange(
            prevPathnameRef.current,
            prevSearchParamsRef.current,
            pathname,
            searchParams
        );

        // Save current scroll position
        saveScrollPosition();

        // Only mark as navigating if it's NOT a pagination change
        // Pagination changes should be handled by the pagination components
        if (!isPagination) {
            isNavigatingRef.current = true;

            // Restore scroll position after a short delay to ensure content is loaded
            const timer = setTimeout(() => {
                handlePaginationScroll();
            }, 100);

            return () => {
                clearTimeout(timer);
            };
        }

        // Update refs for next comparison
        prevPathnameRef.current = pathname;
        prevSearchParamsRef.current = searchParams;
        return undefined;
    }, [pathname, searchParams, saveScrollPosition, handlePaginationScroll, isPaginationChange]);

    return {
        saveScrollPosition,
        restoreScrollPosition,
        isNavigating: isNavigatingRef.current,
    };
}

// ----------------------------------------------------------------------

export function useScrollToTop() {
    const scrollToTop = useCallback(() => {
        if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, []);

    return scrollToTop;
} 