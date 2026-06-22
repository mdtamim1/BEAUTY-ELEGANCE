import { useState, useEffect } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';
import { Star, Heart, ShoppingCart, ChevronRight, Clock, ArrowLeft, Zap, SlidersHorizontal } from 'lucide-react';
import { useStorefrontConfig } from '../store/storefrontConfig';

interface StorefrontContext {
  addToCart: (product: any) => void;
  toggleWishlist: (productId: number) => void;
  wishlist: number[];
}

const StarRating = ({ rating }: { rating: number }) => (
  <div className="product-card-stars">
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} size={12} fill={i <= Math.round(rating) ? '#fbbf24' : 'none'} color="#fbbf24" />
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

      // Check if the timer is in the upcoming phase
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

      // Check if the timer is in the active running phase
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

export default function CollectionPage() {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart, toggleWishlist, wishlist, searchQuery } = useOutletContext<any>();
  const [config] = useStorefrontConfig();

  // Filter & Sort State
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('default');

  const products = config.products.filter(p => p.published);

  // Find the matching nav link by slug (robust lookup by label-slug or url-slug)
  let navLink = config.navLinks.find(n => {
    const labelSlug = n.label.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const urlSlug = n.url.split('/').pop()?.replace('#', '');
    return urlSlug === slug || labelSlug === slug;
  });

  // Fallback to Category config if navLink is not found
  const categoryConfig = config.categories.find(c => {
    return c.name.toLowerCase().replace(/[^a-z0-9]/g, '-') === slug;
  });

  if (!navLink && categoryConfig) {
    navLink = {
      id: categoryConfig.id + 1000,
      label: categoryConfig.name,
      url: `/collection/${slug}`,
      enabled: categoryConfig.published,
      productIds: products.filter(p => p.category === categoryConfig.name).map(p => p.id)
    };
  }

  useEffect(() => {
    // Reset filters when collection changes
    setSelectedCategory('All');
    setSortBy('default');
  }, [slug]);

  if (!navLink) {
    return (
      <div className="collection-page">
        <div className="collection-empty">
          <h2>Collection not found</h2>
          <p>The collection you're looking for doesn't exist.</p>
          <Link to="/" className="store-btn store-btn-primary">
            <ArrowLeft size={16} /> Back to Store
          </Link>
        </div>
      </div>
    );
  }

  const collectionProducts = (navLink.productIds || [])
    .map(id => products.find(p => p.id === id))
    .filter(Boolean) as any[];

  // Get categories from collection products dynamically
  const uniqueCategories = ['All', ...Array.from(new Set(collectionProducts.map(p => p.category)))];

  // Filter products
  let filteredProducts = collectionProducts;
  if (selectedCategory !== 'All') {
    filteredProducts = filteredProducts.filter(p => p.category === selectedCategory);
  }
  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    filteredProducts = filteredProducts.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.brand && p.brand.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q))
    );
  }

  // Sort products
  if (sortBy === 'price-low') {
    filteredProducts = [...filteredProducts].sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    filteredProducts = [...filteredProducts].sort((a, b) => b.price - a.price);
  } else if (sortBy === 'rating') {
    filteredProducts = [...filteredProducts].sort((a, b) => b.rating - a.rating);
  }

  const isPromoCollection = !!(navLink.timerEnabled && navLink.timerEndDate);

  return (
    <div className={`collection-page ${isPromoCollection ? 'promo-collection-page' : ''}`}>
      {/* Breadcrumb */}
      <nav className="collection-breadcrumb">
        <Link to="/">Home</Link>
        <ChevronRight size={14} />
        <span>{navLink.label}</span>
      </nav>

      {isPromoCollection ? (
        /* PREMIUM IMMERSIVE HERO BANNER FOR TIMED OFFERS */
        <div className="collection-hero-banner">
          <div className="collection-hero-mesh" />
          <div className="collection-hero-content">
            <div className="collection-hero-tag">
              <Zap size={14} /> Exclusive Offers
            </div>
            <h1 className="collection-hero-title">{navLink.label}</h1>
            <p className="collection-hero-subtitle">
              Enjoy limited-time discounts on selected items. Handpicked deals for a premium shopping experience.
            </p>
            
            <div className="collection-hero-timer">
              <CountdownTimer
                startDate={navLink.timerStartDate}
                endDate={navLink.timerEndDate}
                startLabel={navLink.timerStartLabel}
                label={navLink.timerLabel || 'Offer ends in'}
                isLarge={true}
              />
            </div>
          </div>
        </div>
      ) : (
        /* STANDARD HEADER */
        <div className="collection-header">
          <div className="collection-header-text">
            <h1 className="collection-title">{navLink.label}</h1>
            <p className="collection-subtitle">
              Explore our premium {navLink.label.toLowerCase()} collection — {collectionProducts.length} products
            </p>
          </div>
        </div>
      )}

      {/* Trust Badges Banner */}
      {isPromoCollection && (
        <div className="promo-trust-banner">
          <div className="trust-item">
            <span className="trust-icon">🚚</span>
            <div className="trust-text">
              <strong>Free Fast Delivery</strong>
              <p>On orders above ৳৫০০০</p>
            </div>
          </div>
          <div className="trust-item">
            <span className="trust-icon">🛡️</span>
            <div className="trust-text">
              <strong>100% Genuine</strong>
              <p>Verified seller items</p>
            </div>
          </div>
          <div className="trust-item">
            <span className="trust-icon">🔄</span>
            <div className="trust-text">
              <strong>Easy Returns</strong>
              <p>7-day hassle-free refund</p>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Sorting Control Bar */}
      {collectionProducts.length > 0 && (
        <div className="collection-toolbar">
          {/* Categories Filter list - Only show if there is more than 1 category */}
          <div className="category-filters">
            {uniqueCategories.length > 2 ? (
              uniqueCategories.map(cat => (
                <button
                  key={cat}
                  className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))
            ) : (
              <div style={{ fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--sf-text-tertiary)' }}>
                Showing products in {navLink.label}
              </div>
            )}
          </div>

          {/* Sorting Dropdown */}
          <div className="sort-control">
            <SlidersHorizontal size={14} />
            <span>Sort by:</span>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="sort-select">
              <option value="default">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Rating: High to Low</option>
            </select>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="products-grid collection-products-grid">
          {filteredProducts.map((product: any) => (
            <Link to={`/product/${product.id}`} key={product.id} className="product-card" style={{ textDecoration: 'none' }}>
              <div style={{ position: 'relative' }}>
                <img src={product.image} alt={product.name} className="product-card-image" />
                {product.badge && (
                  <span className={`product-card-badge ${product.badge}`}>
                    {product.badge === 'sale' ? `${Math.round((1 - product.price / (product.originalPrice || product.price)) * 100)}% OFF` : 'New'}
                  </span>
                )}
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="product-card-save-badge">
                    Save ৳{Math.round(product.originalPrice - product.price)}
                  </span>
                )}
                <button
                  className="product-card-wishlist"
                  onClick={(e) => { e.preventDefault(); toggleWishlist(product.id); }}
                  style={{ color: wishlist.includes(product.id) ? '#ef4444' : undefined }}
                >
                  <Heart size={18} fill={wishlist.includes(product.id) ? '#ef4444' : 'none'} />
                </button>
              </div>
              <div className="product-card-body">
                <div className="product-card-category">{product.category}</div>
                <div className="product-card-name">{product.name}</div>
                <div className="product-card-rating">
                  <StarRating rating={product.rating} />
                  <span className="product-card-reviews">({product.reviews.toLocaleString()})</span>
                </div>
                <div className="product-card-footer">
                  <div>
                    <span className="product-card-price">৳{product.price}</span>
                    {product.originalPrice && (
                      <span className="product-card-original-price">৳{product.originalPrice}</span>
                    )}
                  </div>
                  <button
                    className="product-card-cart-btn"
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
        <div className="collection-empty" style={{ padding: '80px 24px' }}>
          <ShoppingCart size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
          <h3>No products found</h3>
          <p>No products match the selected category in this collection.</p>
        </div>
      )}
    </div>
  );
}
