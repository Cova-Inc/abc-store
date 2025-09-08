import { CONFIG } from 'src/config-global';

import ProductEditView from 'src/sections/products/view/product-edit-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Edit Product | Dashboard - ${CONFIG.site.name}` };

export default function Page({ params }) {
    return (
        <ProductEditView params={params} />
    );
}