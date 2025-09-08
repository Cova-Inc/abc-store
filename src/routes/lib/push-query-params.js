import { buildQueryParams } from '../utils';

export function pushQueryParams({ router, page, pageSize, filterObj }) {
  const queryString = buildQueryParams({ page, pageSize, filterObj });
  router.push(`?${queryString}`, undefined, { shallow: true });
}
