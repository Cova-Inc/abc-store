'use client';

import { useRef, useEffect, useCallback } from 'react';

// ----------------------------------------------------------------------

export function usePreventScrollToTop() {
  const scrollPositionRef = useRef(0);
  const isPreventingRef = useRef(false);

  // Save current scroll position
  const saveScrollPosition = useCallback(() => {
    if (typeof window !== 'undefined') {
      scrollPositionRef.current = window.scrollY;
    }
  }, []);

  // Prevent scroll to top
  const preventScrollToTop = useCallback(() => {
    if (typeof window !== 'undefined' && scrollPositionRef.current > 0) {
      isPreventingRef.current = true;

      // Immediate prevention
      window.scrollTo(0, scrollPositionRef.current);

      // Multiple attempts to ensure it sticks
      const attempts = [1, 10, 25, 50, 100];
      attempts.forEach((delay) => {
        setTimeout(() => {
          if (isPreventingRef.current && window.scrollY === 0) {
            window.scrollTo(0, scrollPositionRef.current);
          }
        }, delay);
      });

      // Clear prevention flag
      setTimeout(() => {
        isPreventingRef.current = false;
      }, 200);
    }
  }, []);

  useEffect(() => {
    // Save initial scroll position
    saveScrollPosition();

    // Monitor for scroll position changes
    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        const currentScroll = window.scrollY;
        if (currentScroll > 0) {
          scrollPositionRef.current = currentScroll;
        }
      }
    };

    // Monitor for sudden scroll to top
    const handleScrollToTop = () => {
      if (window.scrollY === 0 && scrollPositionRef.current > 0) {
        preventScrollToTop();
      }
    };

    // Monitor for MUI component changes that might cause scroll issues
    const handleMutations = (mutations) => {
      mutations.forEach((mutation) => {
        // Check if the mutation involves components that might cause scroll issues
        const hasDataGrid = mutation.target.closest('[data-testid="data-grid"], .MuiDataGrid-root');
        const hasAutocomplete = mutation.target.closest('[role="combobox"], .MuiAutocomplete-root');
        const hasDialog = mutation.target.closest('[role="dialog"], .MuiDialog-root');
        const hasForm = mutation.target.closest('form');
        const hasPagination = mutation.target.closest('.MuiTablePagination-root');

        if (hasDataGrid || hasAutocomplete || hasDialog || hasForm || hasPagination) {
          // Small delay to let the component finish its changes
          setTimeout(() => {
            if (window.scrollY === 0 && scrollPositionRef.current > 0) {
              preventScrollToTop();
            }
          }, 10);
        }
      });
    };

    // Set up observers and event listeners
    const observer = new MutationObserver(handleMutations);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class', 'data-testid'],
    });

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Use a more frequent check for scroll to top
    const scrollCheckInterval = setInterval(handleScrollToTop, 50);

    // Cleanup
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
      clearInterval(scrollCheckInterval);
    };
  }, [saveScrollPosition, preventScrollToTop]);

  return {
    saveScrollPosition,
    preventScrollToTop,
    isPreventing: isPreventingRef.current,
  };
}
