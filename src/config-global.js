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
  { value: 'beauty', label: 'コスメ' },
  { value: 'shoes', label: '靴' },
  { value: 'underwear', label: '下着' },
  { value: 'books', label: '本' },
  { value: 'electronics', label: '家電' },
  { value: 'others', label: 'その他' },
];

export const PRODUCT_STATUS_OPTIONS = [
  { value: 'approved', label: '承認済み', color: 'success' },
  { value: 'declined', label: '拒否', color: 'error' },
  { value: 'draft', label: '承認待ち', color: 'info' },
];

export const PRODUCT_FILTER_FIELD_OPTIONS = [
  { value: 'name', label: '商品名' },
  { value: 'description', label: '説明' },
  { value: 'sku', label: 'SKU' },
  { value: 'category', label: 'カテゴリー' },
  { value: 'tags', label: 'タグ' },
];
