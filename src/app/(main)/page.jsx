import { redirect } from 'next/navigation';

import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------
// ABC Store Dashboard
// Core features: Products (with image upload), Users, Authentication
// ----------------------------------------------------------------------

// Server Component - redirect happens on the server
export default function Page() {
  redirect(CONFIG.auth.redirectPath);
}
