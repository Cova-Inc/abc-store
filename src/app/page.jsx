import { redirect } from 'next/navigation';

import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------

export default function Page() {
  redirect(CONFIG.auth.redirectPath);
}
