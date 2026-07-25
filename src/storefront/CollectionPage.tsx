import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';
import { Star, Heart, ShoppingCart, ChevronRight, Clock, ArrowLeft, Zap, SlidersHorizontal, Filter, ArrowRight, RotateCcw, X } from 'lucide-react';
import { useStorefrontConfig } from '../store/storefrontConfig';
import { fetchCampaignsFromBackend } from '../services/api';
import { resolveProductWithCampaign } from '../utils/productCampaignResolver';
import { SEOMeta } from '../components/layout/SEOMeta';

const StarRating = ({ rating }: { rating: number }) => (
  <div className="product-card-stars">
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} size={12} fill={i <= Math.round(rating) ? '#f59e0b' : 'none'} color="#f59e0b" />
    ))}
  </div>
);

function CountdownTimer({ startDate, endDate, startLabel, label, isLarge }: { startDate?: string; endDate?: string; startLabel?: string; label: string; isLarge?: boolean }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isUpcoming: false, expired: false });

  useEffect(() => {
    const calculate = () => {
      const now = new Date().getTime();
      const start = startDate ? new Date(startDate).getTime() : 0;
      
      if (!endDate) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isUpcoming: false, expired: true });
        return;
      }
      const end = new Date(endDate).getTime();
      if (isNaN(end)) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isUpcoming: false, expired: true });
        return;
      }

      if (startDate && now < start) {
        const diff = start - now;
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
          isUpcoming: true,
          expired: false,
        });
        return;
      }

      const diff = end - now;
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isUpcoming: false, expired: true });
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
        isUpcoming: false,
        expired: false,
      });
    };

    calculate();
    const timer = setInterval(calculate, 1000);
    return () => clearInterval(timer);
  }, [startDate, endDate]);

  if (timeLeft.expired) {
    return (
      <div className={`collection-timer expired ${isLarge ? 'large' : ''}`}>
        <Clock size={18} />
        <span className="collection-timer-label">This offer has ended</span>
      </div>
    );
  }

  const activeLabel = timeLeft.isUpcoming ? (startLabel || 'Offer starts in') : (label || 'Offer ends in');

  return (
    <div className={`collection-timer ${timeLeft.isUpcoming ? 'upcoming' : ''} ${isLarge ? 'large' : ''}`}>
      <Clock size={18} className="timer-icon" />
      <span className="collection-timer-label">{activeLabel}</span>
      <div className="collection-timer-digits">
        <div className="timer-unit">
          <span className="timer-value">{String(timeLeft.days).padStart(2, '0')}</span>
          <span className="timer-label-sm">Days</span>
        </div>
        <span className="timer-sep">:</span>
        <div className="timer-unit">
          <span className="timer-value">{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="timer-label-sm">Hrs</span>
        </div>
        <span className="timer-sep">:</span>
        <div className="timer-unit">
          <span className="timer-value">{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className="timer-label-sm">Min</span>
        </div>
        <span className="timer-sep">:</span>
        <div className="timer-unit">
          <span className="timer-value">{String(timeLeft.seconds).padStart(2, '0')}</span>
          <span className="timer-label-sm">Sec</span>
        </div>
      </div>
    </div>
  );
}

export { CountdownTimer };

// Helper function for robust category matching
function matchesCategory(productCategory: string, targetCategory: string): boolean {
  if (!productCategory || !targetCategory) return false;
  const p = productCategory.toLowerCase().trim();
  const t = targetCategory.toLowerCase().trim();
  
  if (p === t) return true;

  // Normalized (alphanumeric only)
  const pNorm = p.replace(/[^a-z0-9]/g, '');
  const tNorm = t.replace(/[^a-z0-9]/g, '');
  if (pNorm === tNorm) return true;

  // Singular / Plural handling
  const pSingular = pNorm.endsWith('s') ? pNorm.slice(0, -1) : pNorm;
  const tSingular = tNorm.endsWith('s') ? tNorm.slice(0, -1) : tNorm;
  if (pSingular === tSingular && pSingular.length > 2) return true;

  if (pNorm.includes(tNorm) || tNorm.includes(pNorm)) return true;
  if (pSingular.includes(tSingular) || tSingular.includes(pSingular)) return true;

  // Synonyms & Aliases
  if ((tNorm.includes('shoe') || tNorm.includes('sneaker') || tNorm.includes('footwear')) &&
      (pNorm.includes('shoe') || pNorm.includes('sneaker') || pNorm.includes('footwear'))) return true;
  
  if ((tNorm.includes('fitness') || tNorm.includes('dumb') || tNorm.includes('gym') || tNorm.includes('equip')) &&
      (pNorm.includes('fit') || pNorm.includes('gym') || pNorm.includes('dumb') || pNorm.includes('equip'))) return true;
  
  if ((tNorm.includes('wear') || tNorm.includes('cloth') || tNorm.includes('shirt') || tNorm.includes('pant') || tNorm.includes('dress') || tNorm.includes('panjabi')) &&
      (pNorm.includes('wear') || pNorm.includes('cloth') || pNorm.includes('shirt') || pNorm.includes('pant') || pNorm.includes('dress') || pNorm.includes('panjabi') || pNorm.includes('jersey'))) return true;
  
  if ((tNorm.includes('ball') || tNorm.includes('game') || tNorm.includes('footbal') || tNorm.includes('basket')) &&
      (pNorm.includes('ball') || pNorm.includes('game') || pNorm.includes('footbal') || pNorm.includes('basket'))) return true;

  return false;
}

const SPECIAL_COLLECTION_SLUGS: Record<string, string> = {
  'most-selling': 'Most Selling Products',
  'trending': 'Trending Collection',
  'offers': 'Special Offers & Discounts',
  'sale': 'Sale Items',
  'new-arrivals': 'New Arrivals',
  'popular-order': 'Popular Products',
  'all': 'All Products',
  'shop': 'Shop All',
  'categories': 'Shop By Category',
};

export default function CollectionPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, wishlist, searchQuery } = useOutletContext<any>();
  const [config] = useStorefrontConfig();

  // Filter & Sort State
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('default');
  const [showMobileFilter, setShowMobileFilter] = useState<boolean>(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState<boolean>(false);
  const [activeCampaigns, setActiveCampaigns] = useState<any[]>([]);

  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        const campaigns = await fetchCampaignsFromBackend();
        if (campaigns) {
          setActiveCampaigns(campaigns.filter((c: any) => c.status === 'active'));
        }
      } catch (e) {
        console.error('Failed to load campaigns in CollectionPage:', e);
      }
    };
    loadCampaigns();
  }, []);

  const products = useMemo(() => {
    const published = config.products.filter(p => p.published);
    return published.map(p => resolveProductWithCampaign(p, activeCampaigns));
  }, [config.products, activeCampaigns]);

  // Determine if viewing main All Categories overview vs a dedicated Category Page
  const isAllCategoriesPage = !slug || slug === 'all' || slug === 'categories';
  const isSpecialCollection = slug ? Boolean(SPECIAL_COLLECTION_SLUGS[slug.toLowerCase()]) : false;

  // Dynamic Category list
  const dynamicCategories = useMemo(() => {
    const publishedProducts = config.products.filter(p => p.published);
    const catMap = new Map<string, { id: number | string; name: string; count: number; image: string; slug: string }>();

    const categoryImages: Record<string, string> = {
      'watch': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
      'glasses': 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80',
      'sunglasses': 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80',
      'women dress': 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=600&q=80',
      'panjabi': 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=600&q=80',
      't-shirts': 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
      'polo': 'https://images.unsplash.com/photo-1625910513413-562624f38eec?auto=format&fit=crop&w=600&q=80',
      'shirts': 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=600&q=80',
      'pants': 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80',
      'sneakers': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
      'fitness item': 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=600&q=80',
      'sports shoes': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
      'sports wear': 'https://images.unsplash.com/photo-1518459031867-a89b944bffe4?auto=format&fit=crop&w=600&q=80',
      'sports game': 'https://images.unsplash.com/photo-1614632537190-23e4146777db?auto=format&fit=crop&w=600&q=80',
      'perfumes': 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=600&q=80',
    };

    (config.categories || []).forEach(cat => {
      if (!cat.published) return;
      const catNameLower = cat.name.toLowerCase().trim();
      const catSlug = catNameLower.replace(/[^a-z0-9]/g, '-');
      const matchedProducts = publishedProducts.filter(p => matchesCategory(p.category, cat.name));
      const lastProductImage = matchedProducts.length > 0 ? matchedProducts[matchedProducts.length - 1].image : '';
      const img = cat.image || lastProductImage || categoryImages[catNameLower] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80';

      catMap.set(catSlug, {
        id: cat.id,
        name: cat.name,
        count: matchedProducts.length || cat.count || 0,
        image: img,
        slug: catSlug,
      });
    });

    publishedProducts.forEach(p => {
      if (!p.category) return;
      const catName = p.category.trim();
      const catSlug = catName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      if (!catMap.has(catSlug)) {
        const matchedProducts = publishedProducts.filter(prod => matchesCategory(prod.category, catName));
        const img = p.image || categoryImages[catName.toLowerCase()] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80';
        catMap.set(catSlug, {
          id: catSlug,
          name: catName,
          count: matchedProducts.length,
          image: img,
          slug: catSlug,
        });
      }
    });

    return Array.from(catMap.values());
  }, [config.categories, config.products]);

  // Available sizes & brands
  const availableSizes = useMemo(() => {
    const sizeSet = new Set<string>(['39', '40', '41', '42', '43', '44', 'S', 'M', 'L', 'XL', 'XXL']);
    products.forEach(p => {
      if (Array.isArray(p.sizes)) {
        p.sizes.forEach((s: any) => {
          if (typeof s === 'string') sizeSet.add(s);
          else if (s && s.label) sizeSet.add(s.label);
        });
      }
    });
    return Array.from(sizeSet);
  }, [products]);

  const availableBrands = useMemo(() => {
    const brandSet = new Set<string>(['Nike', 'Adidas', 'Puma', 'Under Armour', 'Splayd', 'Reebok', 'Jordan']);
    products.forEach(p => {
      if (p.brand) brandSet.add(p.brand);
    });
    return Array.from(brandSet);
  }, [products]);

  // Match nav link or category slug
  const navLink = useMemo(() => {
    if (!slug) return null;
    let match = config.navLinks.find(n => {
      const labelSlug = n.label.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const urlSlug = n.url.split('/').pop()?.replace('#', '');
      return urlSlug === slug || labelSlug === slug;
    });

    if (!match) {
      const categoryConfig = config.categories.find(c => {
        return c.name.toLowerCase().replace(/[^a-z0-9]/g, '-') === slug;
      });
      if (categoryConfig) {
        match = {
          id: categoryConfig.id + 1000,
          label: categoryConfig.name,
          url: `/collection/${slug}`,
          enabled: categoryConfig.published,
          productIds: products.filter(p => p.category === categoryConfig.name).map(p => Number(p.id))
        };
      }
    }

    return match;
  }, [slug, config.navLinks, config.categories, products]);

  // Active Category Name / Collection Title
  const activeCategoryTitle = useMemo(() => {
    if (slug) {
      const slugLower = slug.toLowerCase().trim();
      const matchedBrand = availableBrands.find(b => b.toLowerCase().replace(/[^a-z0-9]/g, '-') === slugLower || b.toLowerCase() === slugLower);
      if (matchedBrand) return matchedBrand.toUpperCase();

      if (SPECIAL_COLLECTION_SLUGS[slugLower]) {
        return SPECIAL_COLLECTION_SLUGS[slugLower];
      }
    }
    if (isAllCategoriesPage) return selectedCategory === 'All' ? 'All Products' : selectedCategory;
    const matched = dynamicCategories.find(c => c.slug === slug);
    if (matched) return matched.name;
    if (navLink) return navLink.label;
    return slug ? slug.replace(/-/g, ' ').toUpperCase() : 'All Products';
  }, [slug, availableBrands, isAllCategoriesPage, selectedCategory, dynamicCategories, navLink]);

  useEffect(() => {
    if (slug && !isAllCategoriesPage && !isSpecialCollection) {
      const matchedCat = dynamicCategories.find(c => c.slug === slug);
      if (matchedCat) {
        setSelectedCategory(matchedCat.name);
      } else if (navLink) {
        setSelectedCategory(navLink.label);
      }
    } else {
      setSelectedCategory('All');
    }

    setMinPrice('');
    setMaxPrice('');
    setSelectedSizes([]);

    const brandParam = searchParams.get('brand');
    if (brandParam) {
      setSelectedBrands([brandParam]);
    } else {
      setSelectedBrands([]);
    }

    setInStockOnly(false);
    setSortBy('default');

    const container = document.querySelector('.storefront-scroll-container');
    if (container) {
      container.scrollTop = 0;
    }
    window.scrollTo(0, 0);
  }, [slug, navLink, isAllCategoriesPage, isSpecialCollection, dynamicCategories, searchParams]);

  // Filter Products
  const filteredProducts = useMemo(() => {
    let result = [...products];
    const slugLower = (slug || '').toLowerCase().trim();

    // 1. Check if slug matches a Brand directly
    const matchedBrand = availableBrands.find(b => b.toLowerCase().replace(/[^a-z0-9]/g, '-') === slugLower || b.toLowerCase() === slugLower);

    if (matchedBrand) {
      result = result.filter(p => p.brand && matchesCategory(p.brand, matchedBrand));
    } else if (slugLower === 'most-selling') {
      if (config.mostSellingProductIds && config.mostSellingProductIds.length > 0) {
        const setIds = new Set(config.mostSellingProductIds.map(id => Number(id)));
        result = result.filter(p => setIds.has(Number(p.id)));
      } else {
        result.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
      }
    } else if (slugLower === 'trending') {
      if (config.trendingProductIds && config.trendingProductIds.length > 0) {
        const setIds = new Set(config.trendingProductIds.map(id => Number(id)));
        result = result.filter(p => setIds.has(Number(p.id)));
      } else {
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      }
    } else if (slugLower === 'offers' || slugLower === 'sale') {
      result = result.filter(p => p.badge === 'sale' || (p.originalPrice && p.originalPrice > p.price));
    } else if (slugLower === 'new-arrivals') {
      result = result.filter(p => p.badge === 'new' || Number(p.id) > 5);
    } else if (slugLower === 'popular-order') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (!isAllCategoriesPage && !isSpecialCollection) {
      const currentCat = activeCategoryTitle;
      if (currentCat && currentCat !== 'All' && currentCat !== 'All Products') {
        result = result.filter(p => {
          const catName = p.category || (p as any).categoryName || '';
          return matchesCategory(catName, currentCat);
        });
      }
    } else if (isAllCategoriesPage && selectedCategory !== 'All') {
      result = result.filter(p => {
        const catName = p.category || (p as any).categoryName || '';
        return matchesCategory(catName, selectedCategory);
      });
    }

    if (minPrice && !isNaN(Number(minPrice))) result = result.filter(p => p.price >= Number(minPrice));
    if (maxPrice && !isNaN(Number(maxPrice))) result = result.filter(p => p.price <= Number(maxPrice));

    if (selectedSizes.length > 0) {
      result = result.filter(p => {
        if (!p.sizes || !Array.isArray(p.sizes)) return true;
        return p.sizes.some((s: any) => {
          const val = typeof s === 'string' ? s : s?.label;
          return val && selectedSizes.includes(val);
        });
      });
    }

    if (selectedBrands.length > 0) result = result.filter(p => p.brand && selectedBrands.includes(p.brand));
    if (inStockOnly) result = result.filter(p => p.inStock !== false && (p.stock === undefined || p.stock > 0));

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'price-low') result.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-high') result.sort((a, b) => b.price - a.price);
    else if (sortBy === 'rating') result.sort((a, b) => (b.rating || 5) - (a.rating || 5));

    return result;
  }, [products, isAllCategoriesPage, isSpecialCollection, selectedCategory, activeCategoryTitle, slug, config.mostSellingProductIds, config.trendingProductIds, minPrice, maxPrice, selectedSizes, selectedBrands, inStockOnly, searchQuery, sortBy]);

  const handleCategoryCardClick = (cat: { name: string; slug: string }) => {
    setSelectedCategory(cat.name);
    navigate(`/collection/${cat.slug}`);
  };

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);
  };

  const resetFilters = () => {
    setSelectedCategory('All');
    setMinPrice('');
    setMaxPrice('');
    setSelectedSizes([]);
    setSelectedBrands([]);
    setInStockOnly(false);
    setSortBy('default');
  };

  return (
    <div className="collection-page">
      <SEOMeta
        title={activeCategoryTitle || 'Collections & Categories'}
        description={`Explore premium ${activeCategoryTitle || 'sports and fitness'} products at Tamim Global. Best prices, authentic items, fast delivery across Bangladesh.`}
        slug={slug ? `collection/${slug}` : 'categories'}
        keywords={`${activeCategoryTitle}, Tamim Global ${activeCategoryTitle}, Buy ${activeCategoryTitle} Bangladesh, Sports Equipment, Fitness Gear BD`}
      />

      {/* ── Clean Centered Page Title Hero ── */}
      <div className="col-page-hero">
        <h1 className="col-page-title">{activeCategoryTitle}</h1>
        <p className="col-page-meta">
          {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} available
        </p>
      </div>

      {/* ── Category Pills Filter Row (New & Popular Replica) ── */}
      <div className="new-popular-tabs-row" style={{ margin: '0 0 24px 0' }}>
        {['ALL', 'SNEAKERS', 'PANJABI', 'SHIRTS', 'PERFUMES', 'PANTS', 'SPORTS SHOES', 'SPORTS WEAR', 'FITNESS ITEM'].map((tab) => {
          const isActive = (selectedCategory === 'All' && tab === 'ALL') || (selectedCategory.toUpperCase() === tab);
          return (
            <button
              key={tab}
              type="button"
              className={`new-popular-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => {
                if (tab === 'ALL') {
                  setSelectedCategory('All');
                } else {
                  setSelectedCategory(tab);
                }
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* ── Main Layout: Left Filter + Right Products ── */}
      <div className="collection-main-layout" id="collection-products-section">

        {/* ── LEFT FILTER SIDEBAR ── */}
        <aside className="filter-sidebar-card">
          <div className="filter-sidebar-header">
            <h3 className="filter-sidebar-title">
              <Filter size={16} /> Filters
            </h3>
            {(selectedCategory !== 'All' || minPrice || maxPrice || selectedSizes.length > 0 || selectedBrands.length > 0 || inStockOnly) && (
              <button className="filter-clear-btn" onClick={resetFilters}>Clear All</button>
            )}
          </div>

          {/* Price */}
          <div className="filter-group">
            <h4 className="filter-group-title">Price (৳)</h4>
            <div className="filter-price-inputs">
              <input type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="filter-price-input" />
              <span>—</span>
              <input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="filter-price-input" />
            </div>
            <div className="filter-price-presets">
              <button type="button" className={`filter-price-preset-btn ${maxPrice === '1000' && !minPrice ? 'active' : ''}`} onClick={() => { setMinPrice(''); setMaxPrice('1000'); }}>Under ৳1,000</button>
              <button type="button" className={`filter-price-preset-btn ${minPrice === '1000' && maxPrice === '3000' ? 'active' : ''}`} onClick={() => { setMinPrice('1000'); setMaxPrice('3000'); }}>৳1,000 – ৳3,000</button>
              <button type="button" className={`filter-price-preset-btn ${minPrice === '3000' && maxPrice === '5000' ? 'active' : ''}`} onClick={() => { setMinPrice('3000'); setMaxPrice('5000'); }}>৳3,000 – ৳5,000</button>
              <button type="button" className={`filter-price-preset-btn ${minPrice === '5000' && !maxPrice ? 'active' : ''}`} onClick={() => { setMinPrice('5000'); setMaxPrice(''); }}>Above ৳5,000</button>
            </div>
          </div>

          {/* Size */}
          <div className="filter-group">
            <h4 className="filter-group-title">Size</h4>
            <div className="filter-size-grid">
              {availableSizes.map(size => (
                <button type="button" key={size} className={`filter-size-pill ${selectedSizes.includes(size) ? 'active' : ''}`} onClick={() => toggleSize(size)}>
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Brand */}
          <div className="filter-group">
            <h4 className="filter-group-title">Brand</h4>
            <div className="filter-brand-list">
              {availableBrands.map(brand => (
                <label key={brand} className="filter-checkbox-label">
                  <input type="checkbox" checked={selectedBrands.includes(brand)} onChange={() => toggleBrand(brand)} />
                  <span>{brand}</span>
                </label>
              ))}
            </div>
          </div>

          {/* In Stock Only */}
          <div className="filter-group" style={{ borderBottom: 'none' }}>
            <label className="filter-checkbox-label" style={{ fontWeight: 700 }}>
              <input type="checkbox" checked={inStockOnly} onChange={e => setInStockOnly(e.target.checked)} />
              <span>In Stock Only</span>
            </label>
          </div>
        </aside>

        {/* ── RIGHT PRODUCTS COLUMN ── */}
        <div className="collection-products-column">

          {/* Toolbar */}
          <div className="collection-toolbar">
            {/* Left side: Filter button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                className="filter-drawer-trigger-btn"
                onClick={() => setIsFilterDrawerOpen(true)}
              >
                <Filter size={14} />
                <span>Filter</span>
                {(selectedCategory !== 'All' || minPrice || maxPrice || selectedSizes.length > 0 || selectedBrands.length > 0 || inStockOnly) && (
                  <span className="filter-active-dot" />
                )}
              </button>
              <span className="collection-product-count">
                <strong>{filteredProducts.length}</strong> products
              </span>
            </div>

            {/* Right side: Featured dropdown */}
            <div className="sort-control">
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="sort-select">
                <option value="default">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Rating: High to Low</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {filteredProducts.length > 0 ? (
            <div className="products-grid collection-products-grid">
              {filteredProducts.map((product: any) => (
                <Link to={`/product/${product.id}`} key={product.id} className="new-popular-card">
                  <div className="new-popular-img-box">
                    <img src={product.image || product.imageUrl} alt={product.name || product.title} className="new-popular-img" />
                    <button
                      className={`product-card-wishlist ${wishlist.includes(product.id) ? 'active' : ''}`}
                      onClick={(e) => { e.preventDefault(); toggleWishlist(product.id); }}
                      title="Wishlist"
                    >
                      <Heart size={16} fill={wishlist.includes(product.id) ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                  <div className="new-popular-card-body">
                    <h3 className="new-popular-card-title">{product.name || product.title}</h3>
                    <div className="new-popular-card-footer">
                      <span className="new-popular-card-price">
                        Tk {Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <button
                        className="new-popular-cart-icon-btn"
                        onClick={(e) => { e.preventDefault(); addToCart(product); }}
                        title="Add to Cart"
                      >
                        <ShoppingCart size={18} />
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="collection-empty">
              <ShoppingCart size={48} style={{ opacity: 0.18, marginBottom: 16 }} />
              <h3>No products found</h3>
              <p>No products currently available in this collection.</p>
              <button className="store-btn store-btn-primary" onClick={resetFilters} style={{ background: '#18181b', color: '#ffffff' }}>
                <RotateCcw size={14} /> Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile Off-Canvas Filter Drawer ── */}
      <div className={`filter-drawer-overlay ${isFilterDrawerOpen ? 'open' : ''}`} onClick={() => setIsFilterDrawerOpen(false)}>
        <div className="filter-drawer-sidebar" onClick={(e) => e.stopPropagation()}>
          <div className="filter-drawer-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={20} />
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Filters</h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {(selectedCategory !== 'All' || minPrice || maxPrice || selectedSizes.length > 0 || selectedBrands.length > 0 || inStockOnly) && (
                <button className="filter-clear-btn" onClick={resetFilters}>Clear All</button>
              )}
              <button className="filter-drawer-close-btn" onClick={() => setIsFilterDrawerOpen(false)}>
                <X size={18} />
              </button>
            </div>
          </div>
          <div className="filter-drawer-body">
            <div className="filter-group">
              <h4 className="filter-group-title">Price (৳)</h4>
              <div className="filter-price-inputs">
                <input type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="filter-price-input" />
                <span>—</span>
                <input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="filter-price-input" />
              </div>
              <div className="filter-price-presets">
                <button type="button" className={`filter-price-preset-btn ${maxPrice === '1000' && !minPrice ? 'active' : ''}`} onClick={() => { setMinPrice(''); setMaxPrice('1000'); }}>Under ৳1,000</button>
                <button type="button" className={`filter-price-preset-btn ${minPrice === '1000' && maxPrice === '3000' ? 'active' : ''}`} onClick={() => { setMinPrice('1000'); setMaxPrice('3000'); }}>৳1,000 – ৳3,000</button>
                <button type="button" className={`filter-price-preset-btn ${minPrice === '3000' && maxPrice === '5000' ? 'active' : ''}`} onClick={() => { setMinPrice('3000'); setMaxPrice('5000'); }}>৳3,000 – ৳5,000</button>
                <button type="button" className={`filter-price-preset-btn ${minPrice === '5000' && !maxPrice ? 'active' : ''}`} onClick={() => { setMinPrice('5000'); setMaxPrice(''); }}>Above ৳5,000</button>
              </div>
            </div>
            <div className="filter-group">
              <h4 className="filter-group-title">Size</h4>
              <div className="filter-size-grid">
                {availableSizes.map(size => (
                  <button type="button" key={size} className={`filter-size-pill ${selectedSizes.includes(size) ? 'active' : ''}`} onClick={() => toggleSize(size)}>{size}</button>
                ))}
              </div>
            </div>
            <div className="filter-group">
              <h4 className="filter-group-title">Brand</h4>
              <div className="filter-brand-list">
                {availableBrands.map(brand => (
                  <label key={brand} className="filter-checkbox-label">
                    <input type="checkbox" checked={selectedBrands.includes(brand)} onChange={() => toggleBrand(brand)} />
                    <span>{brand}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="filter-group">
              <label className="filter-checkbox-label" style={{ fontWeight: 700, color: '#18181b' }}>
                <input type="checkbox" checked={inStockOnly} onChange={e => setInStockOnly(e.target.checked)} />
                <span>In Stock Only</span>
              </label>
            </div>
          </div>
          <div className="filter-drawer-footer">
            <button type="button" className="filter-apply-btn" onClick={() => setIsFilterDrawerOpen(false)}>
              Show {filteredProducts.length} Results
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
