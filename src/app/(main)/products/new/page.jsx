import { CONFIG } from 'src/config-global';

import ProductNewView from 'src/sections/products/view/product-new-view';

// ----------------------------------------------------------------------

export const metadata = { title: `New Product | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <ProductNewView />;
}
