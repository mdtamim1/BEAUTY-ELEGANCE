/**
 * Helper to generate title-wise SEO-optimized image filenames and link metadata with Tamim Global branding.
 */

export function slugifyTitle(title: string): string {
  if (!title) return 'item';
  return title
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\u0980-\u09FF\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generates a title-wise image filename featuring 'tamim-global' and content title.
 * Example: tamim-global-adjustable-dumbbell-set-20kg-1721839213.webp
 */
export function generateTitleWiseImageName(title: string, extension: string = 'webp'): string {
  const cleanTitle = slugifyTitle(title) || 'image';
  const timestamp = Date.now();
  const ext = extension.replace(/^\./, '');
  return `tamim-global-${cleanTitle}-${timestamp}.${ext}`;
}

/**
 * Ensures image URLs or metadata include title-wise keywords and tamim-global tags.
 */
export function formatImageAltTitle(title: string, brand: string = 'Tamim Global'): { alt: string; title: string } {
  const clean = title ? title.trim() : 'Sports & Fitness Product';
  return {
    alt: `${clean} - ${brand}`,
    title: `${clean} | Premium Quality ${brand}`,
  };
}
