import { paths } from 'src/routes/paths';

import packageJson from '../package.json';

// ----------------------------------------------------------------------

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
  { value: 'electronics', label: 'Electronics' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'books', label: 'Books' },
  { value: 'home', label: 'Home & Garden' },
  { value: 'sports', label: 'Sports' },
  { value: 'beauty', label: 'Beauty' },
  { value: 'toys', label: 'Toys' },
  { value: 'automotive', label: 'Automotive' },
];

export const PRODUCT_STATUS_OPTIONS = [
  { value: 'active', label: 'Active', color: 'success' },
  { value: 'inactive', label: 'Inactive', color: 'warning' },
  { value: 'draft', label: 'Draft', color: 'info' },
];

export const PRODUCT_FILTER_FIELD_OPTIONS = [
  { value: 'name', label: 'Product Name' },
  { value: 'description', label: 'Description' },
  { value: 'sku', label: 'SKU' },
  { value: 'category', label: 'Category' },
  { value: 'tags', label: 'Tags' },
];