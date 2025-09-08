'use client';

import { useRef, useCallback } from 'react';

// ----------------------------------------------------------------------

export function usePaginationScroll() {
  const scrollPositionRef = useRef(0);
  const isRestoringRef = useRef(false);
  const lastScrollTimeRef = useRef(0);

  // Save current scroll position
  const saveScrollPosition = useCallback(() => {
    if (typeof window !== 'undefined') {
      scrollPositionRef.current = window.scrollY;
      lastScrollTimeRef.current = Date.now();
    }
  }, []);

  // Restore scroll position with multiple attempts and prevent conflicts
  const restoreScrollPosition = useCallback(() => {
    if (typeof window !== 'undefined' && scrollPositionRef.current > 0) {
      isRestoringRef.current = true;

      const restoreScroll = () => {
        if (isRestoringRef.current && scrollPositionRef.current > 0) {
          // Prevent any automatic scroll-to-top by immediately setting position
          window.scrollTo(0, scrollPositionRef.current);
        }
      };

      // Immediate restoration
      restoreScroll();

      // Use multiple attempts with shorter intervals for better reliability
      setTimeout(restoreScroll, 1);
      setTimeout(restoreScroll, 10);
      setTimeout(restoreScroll, 25);
      setTimeout(restoreScroll, 50);
      setTimeout(restoreScroll, 100);
      setTimeout(restoreScroll, 200);
      setTimeout(restoreScroll, 300);

      // Clear the flag after all attempts
      setTimeout(() => {
        isRestoringRef.current = false;
      }, 400);
    }
  }, []);

  // Enhanced page change handler with immediate scroll prevention
  const handlePageChange = useCallback(
    (onPageChange, newPage) => {
      // Save position before any state changes
      saveScrollPosition();

      // Prevent immediate scroll to top by temporarily setting scroll position
      if (typeof window !== 'undefined' && scrollPositionRef.current > 0) {
        const currentScroll = window.scrollY;
        // Immediately prevent scroll to top
        window.scrollTo(0, currentScroll);
      }

      // Change page
      onPageChange(newPage);

      // Restore scroll position
      restoreScrollPosition();
    },
    [saveScrollPosition, restoreScrollPosition]
  );

  // Enhanced page size change handler with immediate scroll prevention
  const handlePageSizeChange = useCallback(
    (setPageSize, onPageChange, newPageSize) => {
      // Save position before any state changes
      saveScrollPosition();

      // Prevent immediate scroll to top by temporarily setting scroll position
      if (typeof window !== 'undefined' && scrollPositionRef.current > 0) {
        const currentScroll = window.scrollY;
        // Immediately prevent scroll to top
        window.scrollTo(0, currentScroll);
      }

      // Change page size and reset to first page
      setPageSize(newPageSize);
      onPageChange(0);

      // Restore scroll position
      restoreScrollPosition();
    },
    [saveScrollPosition, restoreScrollPosition]
  );

  // Force scroll restoration (for emergency use)
  const forceRestoreScroll = useCallback(() => {
    if (typeof window !== 'undefined' && scrollPositionRef.current > 0) {
      window.scrollTo(0, scrollPositionRef.current);
    }
  }, []);

  return {
    handlePageChange,
    handlePageSizeChange,
    saveScrollPosition,
    restoreScrollPosition,
    forceRestoreScroll,
    isRestoring: isRestoringRef.current,
  };
}
