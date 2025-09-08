import { CONFIG } from 'src/config-global';

// Format image URL with proper asset URL for production
export function formatImageUrl(url) {
  if (!url) return '';
  
  // If it's already a full URL, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If ASSET_URL is configured, use it for production
  if (CONFIG.site.assetURL) {
    // Remove leading slash if present to avoid double slashes
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `${CONFIG.site.assetURL}${cleanUrl}`;
  }
  
  // For development or when no ASSET_URL is set, return relative URL
  return url;
}

// Format API URL with proper server URL for production
export function formatApiUrl(endpoint) {
  if (!endpoint) return '';
  
  // If it's already a full URL, return as is
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  
  // If SERVER_URL is configured, use it
  if (CONFIG.site.serverUrl) {
    // Remove leading slash if present to avoid double slashes
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${CONFIG.site.serverUrl}${cleanEndpoint}`;
  }
  
  // For development or when no SERVER_URL is set, return relative URL
  return endpoint;
}