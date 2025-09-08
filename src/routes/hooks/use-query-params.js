'use client';

import { useMemo } from 'react';

import { useSearchParams } from './use-search-params';
import { getFilterParam, getPaginationParams } from '../utils';

export function useQueryParams() {
  const searchParams = useSearchParams();

  return useMemo(() => {
    const { page, pageSize } = getPaginationParams(searchParams);
    const filter = getFilterParam(searchParams);

    return { page, pageSize, filter };
  }, [searchParams]);
}
