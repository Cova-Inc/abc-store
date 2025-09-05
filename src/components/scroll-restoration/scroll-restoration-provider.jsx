'use client';

import { useRef, useMemo, useEffect, useContext, useCallback, createContext } from 'react';

import { usePathname, useSearchParams } from 'src/routes/hooks';

// ----------------------------------------------------------------------

const ScrollRestorationContext = createContext();

export function useScrollRestoration() {
    const context = useContext(ScrollRestorationContext);
    if (!context) {
        throw new Error('useScrollRestoration must be used within a ScrollRestorationProvider');
    }
    return context;
}

// ----------------------------------------------------------------------

export function ScrollRestorationProvider({ children }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const scrollPositionsRef = useRef(new Map());
    const isNavigatingRef = useRef(false);

    // Save scroll position for current route
    const saveScrollPosition = useCallback(() => {
        if (typeof window !== 'undefined') {
            const key = `${pathname}?${searchParams?.toString() || ''}`;
            scrollPositionsRef.current.set(key, window.scrollY);
        }
    }, [pathname, searchParams]);

    // Restore scroll position for current route
    const restoreScrollPosition = useCallback(() => {
        if (typeof window !== 'undefined') {
            const key = `${pathname}?${searchParams?.toString() || ''}`;
            const savedPosition = scrollPositionsRef.current.get(key);

            if (savedPosition !== undefined && savedPosition > 0) {
                // Use requestAnimationFrame to ensure DOM is ready
                requestAnimationFrame(() => {
                    window.scrollTo(0, savedPosition);
                });
            }
        }
    }, [pathname, searchParams]);

    // Check if this is a pagination change
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
            restoreScrollPosition();
            isNavigatingRef.current = false;
        }
    }, [restoreScrollPosition]);

    // Effect to handle navigation changes
    useEffect(() => {
        // Save current scroll position before navigation
        saveScrollPosition();

        // Mark as navigating for pagination changes
        isNavigatingRef.current = true;

        // Restore scroll position after a short delay to ensure content is loaded
        const timer = setTimeout(() => {
            handlePaginationScroll();
        }, 100);

        return () => {
            clearTimeout(timer);
        };
    }, [pathname, searchParams, saveScrollPosition, handlePaginationScroll]);

    // Scroll to top function
    const scrollToTop = useCallback(() => {
        if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, []);

    // Clear scroll position for current route
    const clearScrollPosition = useCallback(() => {
        const key = `${pathname}?${searchParams?.toString() || ''}`;
        scrollPositionsRef.current.delete(key);
    }, [pathname, searchParams]);

    const value = useMemo(() => ({
        saveScrollPosition,
        restoreScrollPosition,
        scrollToTop,
        clearScrollPosition,
        isNavigating: isNavigatingRef.current,
    }), [saveScrollPosition, restoreScrollPosition, scrollToTop, clearScrollPosition]);

    return (
        <ScrollRestorationContext.Provider value={value}>
            {children}
        </ScrollRestorationContext.Provider>
    );
} 