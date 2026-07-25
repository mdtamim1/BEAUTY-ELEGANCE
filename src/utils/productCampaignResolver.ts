// Global Product Campaign & Discount Synchronizer
// Calculates effective selling prices, original prices, and sale badges
// across all website sections (Homepage, Collections, Product Details, Cart, Checkout).

export interface ResolvedProduct {
  id: number | string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  brand?: string;
  image: string;
  images?: string[];
  gallery?: string[];
  sizes?: any[];
  description?: string;
  inStock?: boolean;
  stock?: number;
  rating?: number;
  reviews?: number;
  badge?: string;
  published?: boolean;
  sku?: string;
  discountPercentage?: number;
  campaign?: {
    id: string;
    name: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    startDate?: string;
    endDate?: string;
    badgeText: string;
  } | null;
  [key: string]: any;
}

export function resolveProductWithCampaign(product: any, campaigns: any[] = []): ResolvedProduct {
  if (!product) return product;

  const now = Date.now();

  // Find active campaign containing this product ID
  const activeCampaign = (campaigns || []).find((c: any) => {
    if (!c || c.status !== 'active') return false;

    // Check product match by productIds array or single productId
    const prodIds = Array.isArray(c.productIds) 
      ? c.productIds.map(String) 
      : (c.productId ? [String(c.productId)] : []);
    
    if (prodIds.length > 0 && !prodIds.includes(String(product.id))) {
      return false;
    }

    // Date range validation
    if (c.startDate) {
      const startTime = new Date(c.startDate).getTime();
      if (!isNaN(startTime) && now < startTime) return false;
    }
    if (c.endDate) {
      const endTime = new Date(c.endDate).getTime();
      if (!isNaN(endTime) && now > endTime) return false;
    }

    return true;
  });

  if (!activeCampaign) {
    const origPrice = product.originalPrice && product.originalPrice > product.price 
      ? product.originalPrice 
      : product.price;

    return {
      ...product,
      price: Number(product.price),
      originalPrice: origPrice > product.price ? origPrice : undefined,
      campaign: null,
    };
  }

  // Calculate campaign discount
  const origPrice = product.originalPrice && product.originalPrice > product.price 
    ? Number(product.originalPrice) 
    : Number(product.price);

  let discountedPrice = Number(product.price);
  let badgeText = '';

  const discType = activeCampaign.discountType || activeCampaign.type || 'percentage';
  const discVal = Number(activeCampaign.discountValue || activeCampaign.discountPct || 20);

  if (discType === 'percentage' || discType === 'percent') {
    discountedPrice = Math.max(1, Math.round(origPrice * (1 - discVal / 100)));
    badgeText = `SALE -${discVal}%`;
  } else {
    discountedPrice = Math.max(1, Math.round(origPrice - discVal));
    badgeText = `৳${discVal} OFF`;
  }

  const discountPercentage = Math.round(((origPrice - discountedPrice) / origPrice) * 100);

  return {
    ...product,
    price: discountedPrice,
    originalPrice: origPrice,
    badge: badgeText || product.badge || 'CAMPAIGN',
    discountPercentage,
    campaign: {
      id: activeCampaign.id,
      name: activeCampaign.name,
      discountType: discType,
      discountValue: discVal,
      startDate: activeCampaign.startDate,
      endDate: activeCampaign.endDate,
      badgeText,
    },
  };
}

export function resolveAllProductsWithCampaigns(products: any[], campaigns: any[]): ResolvedProduct[] {
  if (!Array.isArray(products)) return [];
  return products.map(p => resolveProductWithCampaign(p, campaigns));
}
