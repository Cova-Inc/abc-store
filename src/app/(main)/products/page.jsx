import { Suspense } from 'react';

import { LoadingScreen } from 'src/components/loading-screen';

import ProductListView from 'src/sections/products/view/product-list-view';

// ----------------------------------------------------------------------

export default function Page() {
    return (
        <Suspense fallback={<LoadingScreen />}>
            <ProductListView />
        </Suspense>
    );
}