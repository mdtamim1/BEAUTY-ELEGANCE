import { useState, useEffect, useMemo, useRef } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star, ArrowRight, Clock, Tag, Package, Filter } from 'lucide-react';
import { useStorefrontConfig, type CampaignConfig, type CampaignProductOffer, type ProductConfig } from '../store/storefrontConfig';
import { SEOMeta } from '../components/layout/SEOMeta';
import './storefront-campaign.css';

interface StorefrontContext {
  addToCart: (product: any) => void;
  toggleWishlist: (productId: number) => void;
  wishlist: number[];
}

// ── Per-product countdown hook ───────────────────────────────
function useProductCountdown(endDateStr: string) {
  const getRemaining = () => {
    const diff = Math.max(0, new Date(endDateStr).getTime() - Date.now());
    return {
      days: Math.floor(diff / (1000 * 3600 * 24)),
      hours: Math.floor((diff / (1000 * 3600)) % 24),
      minutes: Math.floor((diff / 60000) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      expired: diff === 0,
    };
  };
  const [t, setT] = useState(getRemaining);
  useEffect(() => {
    const id = setInterval(() => setT(getRemaining()), 1000);
    return () => clearInterval(id);
  }, [endDateStr]);
  return t;
}

// ── Hero campaign countdown (campaign end date) ──────────────
function HeroCountdown({ endDate }: { endDate: string }) {
  const t = useProductCountdown(endDate);
  return (
    <div className="cmp-countdown">
      {[
        { num: t.days, lbl: 'Days' },
        { num: t.hours, lbl: 'Hours' },
        { num: t.minutes, lbl: 'Mins' },
        { num: t.seconds, lbl: 'Secs' },
      ].map(({ num, lbl }) => (
        <div className="cmp-count-item" key={lbl}>
          <div className="cmp-count-num">{String(num).padStart(2, '0')}</div>
          <div className="cmp-count-lbl">{lbl}</div>
        </div>
      ))}
    </div>
  );
}

// ── Per-product mini countdown ────────────────────────────────
function ProductTimer({ endDate }: { endDate: string }) {
  const t = useProductCountdown(endDate);
  if (t.expired) return null;
  return (
    <div className="cmp-prod-timer">
      <div className="cmp-prod-timer-row">
        <Clock size={10} color="rgba(255,255,255,0.65)" />
        <span className="cmp-prod-timer-label">Ends in</span>
        <div className="cmp-prod-timer-units">
          {t.days > 0 && (
            <>
              <span className="cmp-prod-timer-unit">{String(t.days).padStart(2, '0')}d</span>
              <span className="cmp-prod-timer-sep">:</span>
            </>
          )}
          <span className="cmp-prod-timer-unit">{String(t.hours).padStart(2, '0')}h</span>
          <span className="cmp-prod-timer-sep">:</span>
          <span className="cmp-prod-timer-unit">{String(t.minutes).padStart(2, '0')}m</span>
          <span className="cmp-prod-timer-sep">:</span>
          <span className="cmp-prod-timer-unit">{String(t.seconds).padStart(2, '0')}s</span>
        </div>
      </div>
    </div>
  );
}

// ── Campaign Product Card ─────────────────────────────────────
function CampaignProductCard({
  product,
  offer,
  addToCart,
  toggleWishlist,
  wishlist,
}: {
  product: ProductConfig;
  offer: CampaignProductOffer;
  addToCart: (p: any) => void;
  toggleWishlist: (id: number) => void;
  wishlist: number[];
}) {
  const isWished = wishlist.includes(product.id);

  const offerPrice = offer.discountType === 'percentage'
    ? Math.round(product.price * (1 - offer.discountValue / 100))
    : Math.max(0, product.price - offer.discountValue);

  const saving = product.price - offerPrice;
  const savingPct = Math.round((saving / product.price) * 100);

  const productWithOffer = { ...product, price: offerPrice, originalPrice: product.price };

  return (
    <div className="cmp-product-card">
      {/* Image + Badges */}
      <div className="cmp-card-img-wrap">
        <Link to={`/product/${product.id}`}>
          <img src={product.image} alt={product.name} className="cmp-card-img" loading="lazy" />
        </Link>

        {/* Offer badge */}
        <div className="cmp-offer-badge">
          {offer.discountType === 'percentage'
            ? `${offer.discountValue}% OFF`
            : `৳${offer.discountValue} OFF`}
        </div>

        {/* Wishlist */}
        <button
          className="cmp-wishlist-btn"
          onClick={() => toggleWishlist(product.id)}
          title={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={16} fill={isWished ? '#e92b2b' : 'none'} color={isWished ? '#e92b2b' : '#374151'} />
        </button>

        {/* Per-product countdown */}
        <ProductTimer endDate={offer.offerEndDate} />
      </div>

      {/* Card Body */}
      <div className="cmp-card-body">
        <div className="cmp-card-brand">{product.brand || 'Tamim Global'}</div>
        <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
          <h3 className="cmp-card-name">{product.name}</h3>
        </Link>

        {/* Stars */}
        <div className="cmp-card-stars">
          {[1, 2, 3, 4, 5].map(i => (
            <Star key={i} size={12} fill={i <= Math.round(product.rating || 5) ? '#fbbf24' : 'none'} color="#fbbf24" />
          ))}
          <span className="cmp-card-reviews">({product.reviews || 0})</span>
        </div>

        {/* Price + Cart */}
        <div className="cmp-card-price-row">
          <div className="cmp-card-price-block">
            <div className="cmp-price-new">৳{offerPrice.toLocaleString()}</div>
            {product.price !== offerPrice && (
              <div className="cmp-price-old">৳{product.price.toLocaleString()}</div>
            )}
            {saving > 0 && (
              <div className="cmp-price-saving">Save ৳{saving.toLocaleString()} ({savingPct}%)</div>
            )}
          </div>
          <button
            className="cmp-add-btn"
            onClick={() => addToCart && addToCart(productWithOffer)}
            disabled={!product.inStock}
          >
            <ShoppingCart size={14} />
            {product.inStock ? 'Add' : 'Sold'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Campaign Page ────────────────────────────────────────
export default function CampaignPage() {
  const { addToCart, toggleWishlist, wishlist = [] } = useOutletContext<StorefrontContext>() || {};
  const [config] = useStorefrontConfig();
  const [activeFilter, setActiveFilter] = useState('ALL');
  const productsSectionRef = useRef<HTMLDivElement>(null);

  // Find the first active campaign
  const activeCampaign: CampaignConfig | undefined = useMemo(
    () => (config.campaigns || []).find(c => c.status === 'active'),
    [config.campaigns]
  );

  // Build a map: productId -> offer from the active campaign
  const offerMap = useMemo(() => {
    const map: Record<number, CampaignProductOffer> = {};
    if (activeCampaign) {
      activeCampaign.productOffers.forEach(o => { map[o.productId] = o; });
    }
    return map;
  }, [activeCampaign]);

  // Get all campaign products (published, with offers)
  const campaignProducts = useMemo(() => {
    if (!activeCampaign) return [];
    return (config.products || []).filter(
      p => p.published && offerMap[p.id] !== undefined
    );
  }, [config.products, offerMap, activeCampaign]);

  // Build unique category list from campaign products
  const categories = useMemo(() => {
    const cats = new Set(campaignProducts.map(p => p.category || 'Other'));
    return ['ALL', ...Array.from(cats)];
  }, [campaignProducts]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    if (activeFilter === 'ALL') return campaignProducts;
    return campaignProducts.filter(p => (p.category || '') === activeFilter);
  }, [campaignProducts, activeFilter]);

  // Campaign stats
  const totalProducts = campaignProducts.length;
  const avgDiscount = useMemo(() => {
    if (totalProducts === 0) return 0;
    const pctOffers = activeCampaign?.productOffers.filter(o => o.discountType === 'percentage') || [];
    if (pctOffers.length === 0) return 0;
    return Math.round(pctOffers.reduce((s, o) => s + o.discountValue, 0) / pctOffers.length);
  }, [activeCampaign, totalProducts]);

  const scrollToProducts = () => {
    productsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // If no active campaign
  if (!activeCampaign) {
    return (
      <div className="cmp-page">
        <div className="cmp-no-campaign">
          <span className="cmp-no-campaign-icon">🏷️</span>
          <h1 className="cmp-no-campaign-title">No Active Campaign</h1>
          <p className="cmp-no-campaign-sub">
            Currently there are no active campaigns. Please check back later or visit our{' '}
            <Link to="/collection/fitness-item" style={{ color: '#d97706', fontWeight: 700 }}>main shop</Link>{' '}
            to explore all products.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="cmp-page">
      <SEOMeta
        title={activeCampaign.heroBannerTitle || activeCampaign.name || 'Special Campaign Offers'}
        description={activeCampaign.heroBannerSubtitle || `Exclusive mega sale campaign at Tamim Global. Up to ${avgDiscount}% OFF on sports gear.`}
        image={activeCampaign.heroBannerImage}
        slug="campaign"
        keywords={`Tamim Global Campaign, ${activeCampaign.name}, Mega Sale BD, Sports Discount, Fitness Gear Sale`}
      />

      {/* ── HERO BANNER ─────────────────────────────────────── */}
      <section className="cmp-hero">
        <div
          className="cmp-hero-bg"
          style={{ backgroundImage: `url('${activeCampaign.heroBannerImage}')` }}
        />
        <div className="cmp-hero-overlay" />

        <div className="cmp-hero-content">
          {/* Left: Text + Timer + Buttons */}
          <div>
            <div className="cmp-hero-badge">
              <span className="cmp-hero-badge-dot" />
              LIVE CAMPAIGN
            </div>

            <h1 className="cmp-hero-title">
              {activeCampaign.heroBannerTitle
                .split(' ')
                .slice(0, -1)
                .join(' ')}{' '}
              <span>{activeCampaign.heroBannerTitle.split(' ').slice(-1)[0]}</span>
            </h1>

            <p className="cmp-hero-subtitle">{activeCampaign.heroBannerSubtitle}</p>

            {/* Campaign Countdown */}
            <HeroCountdown endDate={activeCampaign.endDate + 'T23:59:59'} />

            <div className="cmp-hero-btns">
              <button className="cmp-btn-primary" onClick={scrollToProducts}>
                Shop Deals <ArrowRight size={16} />
              </button>
              <button className="cmp-btn-outline" onClick={() => { setActiveFilter('ALL'); scrollToProducts(); }}>
                View All ({totalProducts}) <ArrowRight size={15} />
              </button>
            </div>
          </div>

          {/* Right: Stats Card */}
          <div className="cmp-hero-stats">
            <div className="cmp-stat-item">
              <div className="cmp-stat-num">{totalProducts}+</div>
              <div className="cmp-stat-lbl">Products On Offer</div>
            </div>
            <div className="cmp-stat-divider" />
            <div className="cmp-stat-item">
              <div className="cmp-stat-num">{avgDiscount > 0 ? `${avgDiscount}%` : '৳Off'}</div>
              <div className="cmp-stat-lbl">Avg. Discount</div>
            </div>
            <div className="cmp-stat-divider" />
            <div className="cmp-stat-item">
              <div className="cmp-stat-num">{categories.length - 1}</div>
              <div className="cmp-stat-lbl">Categories</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRODUCTS BODY ───────────────────────────────────── */}
      <div className="cmp-body" ref={productsSectionRef}>

        {/* Section Header */}
        <div className="cmp-section-header">
          <div>
            <h2 className="cmp-section-title">
              CAMPAIGN <span>DEALS</span>
            </h2>
            <p className="cmp-section-subtitle">
              {activeCampaign.name} · {filteredProducts.length} products with exclusive offers
            </p>
          </div>

          {/* Filter tabs */}
          <div className="cmp-filter-bar" role="group" aria-label="Filter by category">
            {categories.map(cat => (
              <button
                key={cat}
                className={`cmp-filter-btn${activeFilter === cat ? ' active' : ''}`}
                onClick={() => setActiveFilter(cat)}
              >
                {cat === 'ALL' ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Filter size={11} /> ALL
                  </span>
                ) : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="cmp-products-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <CampaignProductCard
                key={product.id}
                product={product}
                offer={offerMap[product.id]}
                addToCart={addToCart}
                toggleWishlist={toggleWishlist || (() => {})}
                wishlist={wishlist}
              />
            ))
          ) : (
            <div className="cmp-empty">
              <div className="cmp-empty-icon">
                <Package size={36} />
              </div>
              <h3 className="cmp-empty-title">No products in this category</h3>
              <p className="cmp-empty-sub">
                Try selecting a different filter above.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
