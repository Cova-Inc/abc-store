
import { CONFIG } from 'src/config-global';

import ProductDetailsView from 'src/sections/products/view/product-details-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Product Details | Dashboard - ${CONFIG.site.name}` };

export default function Page({ params }) {
    return (
        <ProductDetailsView params={params} />
    );
}