// ----------------------------------------------------------------------

const ROOTS = {
  AUTH: '/auth',
  MAIN: '',
};

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

export const paths = {
  faqs: '/faqs',
  minimalStore: 'https://mui.com/store/items/minimal-dashboard/',
  // AUTH
  auth: {
    amplify: {
      signIn: `${ROOTS.AUTH}/amplify/sign-in`,
      verify: `${ROOTS.AUTH}/amplify/verify`,
      signUp: `${ROOTS.AUTH}/amplify/sign-up`,
      updatePassword: `${ROOTS.AUTH}/amplify/update-password`,
      resetPassword: `${ROOTS.AUTH}/amplify/reset-password`,
    },
    jwt: {
      signIn: `${ROOTS.AUTH}/jwt/sign-in`,
      signUp: `${ROOTS.AUTH}/jwt/sign-up`,
    },
    firebase: {
      signIn: `${ROOTS.AUTH}/firebase/sign-in`,
      verify: `${ROOTS.AUTH}/firebase/verify`,
      signUp: `${ROOTS.AUTH}/firebase/sign-up`,
      resetPassword: `${ROOTS.AUTH}/firebase/reset-password`,
    },
    auth0: {
      signIn: `${ROOTS.AUTH}/auth0/sign-in`,
    },
    supabase: {
      signIn: `${ROOTS.AUTH}/supabase/sign-in`,
      verify: `${ROOTS.AUTH}/supabase/verify`,
      signUp: `${ROOTS.AUTH}/supabase/sign-up`,
      updatePassword: `${ROOTS.AUTH}/supabase/update-password`,
      resetPassword: `${ROOTS.AUTH}/supabase/reset-password`,
    },
  },
  // DASHBOARD
  main: {
    root: `${ROOTS.MAIN}/products`,
    // Product management routes
    products: {
      root: `${ROOTS.MAIN}/products`,
      new: `${ROOTS.MAIN}/products/new`,
      edit: (id) => `${ROOTS.MAIN}/products/${id}/edit`,
      details: (id) => `${ROOTS.MAIN}/products/${id}`,
    },
    // User management routes
    users: {
      root: `${ROOTS.MAIN}/users`,
      new: `${ROOTS.MAIN}/users/new`,
      edit: (id) => `${ROOTS.MAIN}/users/${id}/edit`,
      details: (id) => `${ROOTS.MAIN}/users/${id}`,
    },
  },
};
