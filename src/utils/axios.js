import axios from 'axios';

import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------
const axiosInstance = axios.create({ baseURL: CONFIG.site.serverUrl });

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong!')
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args) => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args];

    const res = await axiosInstance.get(url, { ...config });

    return res.data;
  } catch (error) {
    console.error('Failed to fetch:', error);
    throw error;
  }
};

// ----------------------------------------------------------------------

export const endpoints = {
  // Authentication endpoints
  auth: {
    me: '/api/auth/me',
    signIn: '/api/auth/sign-in',
    signUp: '/api/auth/sign-up',
  },
  // Product management endpoints
  products: {
    list: '/api/products',
    create: '/api/products',
    details: (id) => `/api/products/${id}`,
    update: (id) => `/api/products/${id}`,
    delete: (id) => `/api/products/${id}`,
    upload: '/api/products/upload',
  },
  // User management endpoints
  users: {
    list: '/api/users',
    create: '/api/users',
    details: (id) => `/api/users/${id}`,
    update: (id) => `/api/users/${id}`,
    delete: (id) => `/api/users/${id}`,
  },
};

// Encode a JS object to a base64 string for sending via URL
export function encodeParam(param) {
  if (!param || Object.keys(param).length === 0) return '';
  return encodeURIComponent(btoa(JSON.stringify(param))); // ✅ encodeURIComponent added
}

// Decode a base64 string from URL back to JS object
export function decodeParam(base64String) {
  if (!base64String) return {};
  try {
    const jsonString = atob(decodeURIComponent(base64String));
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Failed to decode param:', error);
    return {};
  }
}
