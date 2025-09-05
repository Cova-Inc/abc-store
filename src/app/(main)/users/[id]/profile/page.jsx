import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------

export const metadata = { title: `Account settings | Dashboard - ${CONFIG.site.name}` };

export default async function Page({ params }) {
  const { id } = params;
  // const currentUser = await getUser(id);
  return <div>Profile View for user {id} - Coming Soon</div>;
}
