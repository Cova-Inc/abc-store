import { paths } from 'src/routes/paths';

import packageJson from '../package.json';

// ----------------------------------------------------------------------
export const MAX_UPLOAD_SIZE = 50 * 1024 * 1024; // 50MB
export const CONFIG = {
  site: {
    name: 'ABC Store',
    serverUrl: process.env.NEXT_PUBLIC_SERVER_URL ?? '',
    assetURL: process.env.NEXT_PUBLIC_ASSET_URL ?? '',
    basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? '',
    version: packageJson.version,
  },
  isStaticExport: JSON.parse(`${process.env.BUILD_STATIC_EXPORT}`),
  /**
   * Auth
   * @method jwt | amplify | firebase | supabase | auth0
   */
  auth: {
    method: process.env.NEXT_PUBLIC_AUTH_METHOD,
    skip: false,
    redirectPath: paths.main.root,
  },
};

// Product configuration
export const PRODUCT_CATEGORY_OPTIONS = [
  { value: 'shoes', label: 'categories.shoes' },
  { value: 'beauty', label: 'categories.beauty' },
  { value: 'underwear', label: 'categories.underwear' },
  { value: 'books', label: 'categories.books' },
  { value: 'electronics', label: 'categories.electronics' },
  { value: 'others', label: 'categories.others' },
];

export const PRODUCT_STATUS_OPTIONS = [
  { value: 'approved', label: 'status.approved', color: 'success' },
  { value: 'declined', label: 'status.declined', color: 'error' },
  { value: 'draft', label: 'status.draft', color: 'info' },
];

export const PRODUCT_FILTER_FIELD_OPTIONS = [
  { value: 'name', label: 'name' },
  { value: 'description', label: 'description' },
  { value: 'sku', label: 'sku' },
  { value: 'category', label: 'category' },
  { value: 'tags', label: 'tags' },
];
