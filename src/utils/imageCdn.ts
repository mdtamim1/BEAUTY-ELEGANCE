const IMAGE_CDN_ENDPOINT = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_IMAGE_CDN_URL) || '';

/**
 * Helper to generate optimized ImageKit CDN URLs for local/external images.
 * If the CDN URL is disabled or empty, returns the original source.
 */
export const getOptimizedImageUrl = (src: string, width?: number, height?: number): string => {
  if (!src) return '';

  // If the image is a base64 string or already optimized, return it
  if (src.startsWith('data:')) return src;

  // Case 1: Unsplash images (auto-convert to WebP & scale width/height)
  if (src.includes('images.unsplash.com')) {
    try {
      const urlObj = new URL(src);
      urlObj.searchParams.set('auto', 'format');
      urlObj.searchParams.set('fm', 'webp');
      urlObj.searchParams.set('q', '80');
      if (width) urlObj.searchParams.set('w', String(width));
      if (height) urlObj.searchParams.set('h', String(height));
      return urlObj.toString();
    } catch (e) {
      return src;
    }
  }

  // Case 2: Other external URLs (http/https)
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }

  // Case 3: Relative local image files (e.g. /uploads/product.png or assets/logo.png)
  const cleanPath = src.startsWith('/') ? src : `/${src}`;
  
  // Determine frontend deployment base for image origin proxying
  const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const backendBase = isLocalDev
    ? `${window.location.protocol}//${window.location.hostname}:5000`
    : 'https://api.tamimglobal.com';
  
  const cdnUrl = IMAGE_CDN_ENDPOINT;
  if (!cdnUrl) {
    return `${backendBase}${cleanPath}`;
  }

  // Build query/path options for sizing/formatting
  let transformation = '';
  if (width || height) {
    const params = [];
    if (width) params.push(`w-${width}`);
    if (height) params.push(`h-${height}`);
    params.push('f-auto'); // Auto-format format (WebP)
    params.push('q-80');   // Quality compression 80%
    transformation = `tr:${params.join(',')}`;
  } else {
    transformation = 'tr:f-auto,q-80';
  }

  return `${cdnUrl}/${transformation}/${backendBase}${cleanPath}`;
};
