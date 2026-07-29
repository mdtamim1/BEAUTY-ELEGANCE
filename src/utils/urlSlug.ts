/**
 * Helper utilities for SEO-friendly title-based product URLs with Tamim Global branding.
 */

export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\u0980-\u09FF\s-]/g, '') // Keep alphanumeric, Bengali characters, spaces, and hyphens
    .replace(/[\s_-]+/g, '-')              // Replace spaces & underscores with single hyphen
    .replace(/^-+|-+$/g, '');              // Trim leading & trailing hyphens
}

export interface ProductSlugInput {
  id: number | string;
  name?: string;
  title?: string;
  slug?: string;
}

/**
 * Generates an SEO-optimized product URL featuring product title & 'tamim-global' branding.
 * Example: /product/tamim-global-adjustable-dumbbell-set-20kg-15
 */
export function createProductSlug(product: ProductSlugInput): string {
  if (!product || !product.id) return '/';
  const name = product.name || product.title || product.slug || 'product';
  const cleanSlug = slugify(name);
  return `/product/tamim-global-${cleanSlug ? `${cleanSlug}-` : ''}${product.id}`;
}

/**
 * Extract numeric product ID or slug identifier from incoming route parameter.
 * Handles both '/product/15' and '/product/tamim-global-dumbbell-set-15'
 */
export function parseProductIdFromSlug(slugOrId: string | undefined): string {
  if (!slugOrId) return '';
  const trimmed = slugOrId.trim();

  // If purely numeric
  if (/^\d+$/.test(trimmed)) {
    return trimmed;
  }

  // If ends with numeric ID (e.g. tamim-global-adjustable-dumbbell-15 -> 15)
  const match = trimmed.match(/-(\d+)$/);
  if (match && match[1]) {
    return match[1];
  }

  return trimmed;
}
