import { useState, useEffect } from 'react';
import { useOutletContext, Link, useLocation } from 'react-router-dom';
import { Truck, Shield, RotateCcw, Headphones, Star, Heart, ShoppingCart, Zap,
  Smartphone, Shirt, Home as HomeIcon, Dumbbell, Sparkles, BookOpen,
  Monitor, Camera, Watch, Car, Baby, Flower, Palette, Music, Gamepad, Gift,
  Grid3X3, ArrowRight
} from 'lucide-react';
import { useStorefrontConfig } from '../store/storefrontConfig';
import { CountdownTimer } from './CollectionPage';

interface StorefrontContext {
  addToCart: (product: any) => void;
  toggleWishlist: (productId: number) => void;
  wishlist: number[];
}

// Icon lookup map for dynamic icon resolution from config
const ICON_MAP: Record<string, any> = {
  Smartphone, Shirt, Home: HomeIcon, Dumbbell, Sparkles, BookOpen,
  Monitor, Camera, Headphones, Watch, Car, Baby,
  Pizza: Gift, Flower, Palette, Music, Gamepad, Gift,
  Grid3X3, Truck, Shield, RotateCcw, Zap, Star,
};

const StarRating = ({ rating }: { rating: number }) => (
  <div className="product-card-stars">
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} size={12} fill={i <= Math.round(rating) ? '#fbbf24' : 'none'} color="#fbbf24" />
    ))}
  </div>
);

export default function StorefrontHome() {
  const { addToCart, toggleWishlist, wishlist, searchQuery } = useOutletContext<any>();
  const [config] = useStorefrontConfig();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [shuffledProducts, setShuffledProducts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const location = useLocation();

  const filteredProducts = shuffledProducts.filter(p => {
    if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Shuffle products randomly on component mount or products update
  useEffect(() => {
    const publishedProducts = config.products.filter(p => p.published);
    const shuffled = [...publishedProducts].sort(() => Math.random() - 0.5);
    setShuffledProducts(shuffled);
  }, [config.products]);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1);
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 150);
      }
    }
  }, [location.hash]);

  // Filter enabled banners
  const banners = config.banners.filter(b => b.enabled);
  // Filter published categories
  let categories = config.categories.filter(c => c.published).sort((a, b) => a.sortOrder - b.sortOrder);
  if (categories.length === 0) {
    const uniqueCategoryNames = Array.from(new Set(config.products.filter(p => p.published).map(p => p.category)));
    const iconMap: Record<string, string> = {
      'Electronics': 'Smartphone',
      'Fashion': 'Shirt',
      'Home & Garden': 'Home',
      'Sports': 'Dumbbell',
      'Beauty': 'Sparkles',
      'Books': 'BookOpen',
    };
    categories = uniqueCategoryNames.map((name, index) => ({
      id: index + 1,
      name,
      icon: iconMap[name] || 'Grid3X3',
      count: config.products.filter(p => p.published && p.category === name).length,
      published: true,
      sortOrder: index + 1
    }));
  }


  // Find if there is an active timed campaign
  const activePromoSection = config.navLinks.find(n => n.enabled && n.timerEnabled && n.timerEndDate);

  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <>
      {/* ---- Hero Full-Width Carousel ---- */}
      {banners.length > 0 && (
        <section className="hero-carousel-fullscreen">
          <div className="fullscreen-slides" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
            {banners.map((banner) => (
              <div 
                key={banner.id} 
                className={`fullscreen-slide ${banner.image ? 'has-image' : ''}`} 
                style={{ background: banner.gradient }}
              >
                <div className="fullscreen-slide-inner">
                  <div className="slide-content-left">
                    <span className="slide-badge">
                      <Zap size={14} /> {banner.tag}
                    </span>
                    <h1>{banner.title}</h1>
                    <p>{banner.subtitle}</p>
                    <div className="slide-action-row">
                      <span className="slide-offer-highlight">{banner.offer}</span>
                      <button 
                        className="store-btn store-btn-white"
                        onClick={() => {
                          if (banner.buttonLink.startsWith('#')) {
                            document.getElementById(banner.buttonLink.slice(1))?.scrollIntoView({ behavior: 'smooth' });
                          } else {
                            window.location.href = banner.buttonLink;
                          }
                        }}
                      >
                        {banner.buttonText}
                      </button>
                    </div>
                  </div>
                  <div className="slide-visual-right">
                    {banner.image ? (
                      <>
                        <img 
                          src={banner.image} 
                          alt={banner.title} 
                          className="slide-custom-image" 
                        />
                        {banner.offer && (
                          <div className="slide-visual-badge absolute-badge">{banner.offer}</div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="slide-glowing-circle" />
                        <div className="slide-visual-badge">{banner.offer}</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="fullscreen-dots">
            {banners.map((_, idx) => (
              <span 
                key={idx} 
                className={`fullscreen-dot ${currentSlide === idx ? 'active' : ''}`}
                onClick={() => setCurrentSlide(idx)}
              />
            ))}
          </div>
        </section>
      )}

      {/* ---- Premium Campaign Teaser Banner ---- */}
      {(() => {
        if (!activePromoSection || !activePromoSection.timerEndDate) return null;
        
        let promoSlug = 'offers';
        const labelLower = (activePromoSection.label || '').toLowerCase();
        if (labelLower === 'offers' || labelLower === 'offer') {
          promoSlug = 'offers';
        } else if (labelLower === 'new arrivals' || labelLower === 'new arrival') {
          promoSlug = 'new-arrivals';
        } else if (labelLower === 'popular order' || labelLower === 'popular') {
          promoSlug = 'popular-order';
        } else {
          promoSlug = activePromoSection.url.split('/').pop()?.replace('#', '') || 'offers';
        }

        return (
          <section className="store-section teaser-campaign-section">
            <Link to={`/collection/${promoSlug}`} className="teaser-campaign-link" style={{ textDecoration: 'none' }}>
              <div className="teaser-campaign-banner">
                <div className="teaser-campaign-glow" />
                <div className="teaser-campaign-content">
                  <div className="teaser-left">
                    <span className="teaser-badge">⚡ Limited Campaign</span>
                    <h2 className="teaser-title">{activePromoSection.label} Campaign</h2>
                    <p className="teaser-subtitle">Explore exclusive products at unmatched prices. Click to shop deals!</p>
                  </div>
                  <div className="teaser-right">
                    <CountdownTimer
                      startDate={activePromoSection.timerStartDate}
                      endDate={activePromoSection.timerEndDate}
                      startLabel={activePromoSection.timerStartLabel}
                      label={activePromoSection.timerLabel || 'Offer ends in'}
                      isLarge={true}
                    />
                  </div>
                </div>
              </div>
            </Link>
          </section>
        );
      })()}

      {/* ---- Categories ---- */}
      <section className="store-section" id="categories" style={{ paddingTop: 0, paddingBottom: '24px' }}>
        <div className="store-section-header">
          <div>
            <h2 className="store-section-title">Shop by Category</h2>
            <p className="store-section-subtitle">Browse our curated collections</p>
          </div>
        </div>
        <div className="categories-grid">
          {categories.map((cat, i) => {
            const Icon = ICON_MAP[cat.icon] || Grid3X3;
            const categorySlug = cat.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
            const categoryUrl = `/collection/${categorySlug}`;
            return (
              <Link 
                to={categoryUrl}
                key={i} 
                className="category-card"
                style={{ textDecoration: 'none' }}
              >
                <div className="category-icon"><Icon size={22} /></div>
                <div className="category-name">{cat.name}</div>
                <div className="category-count">{cat.count.toLocaleString()} products</div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ---- All Products Grid (Shuffled) ---- */}
      <section className="store-section" id="all-products" style={{ paddingTop: 0 }}>
        <div className="store-section-header">
          <div>
            <h2 className="store-section-title">Discover Products</h2>
            <p className="store-section-subtitle">Browse our complete collection of curated items randomly selected for you</p>
          </div>
        </div>
        
        <div className="store-products-layout">
          {/* Categories Sidebar */}
          <aside className="store-categories-sidebar">
            <h3 className="sidebar-title">Categories</h3>
            <div className="sidebar-categories-list">
              <button 
                className={`sidebar-category-item ${selectedCategory === 'All' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('All')}
              >
                All Products
              </button>
              {categories.map((cat) => (
                <button 
                  key={cat.id} 
                  className={`sidebar-category-item ${selectedCategory === cat.name ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.name)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </aside>

          {/* Products Main Container */}
          <div className="store-products-main">
            {filteredProducts.length > 0 ? (
              <div className="products-grid">
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
                <p>No products match the selected category.</p>
              </div>
            )}
          </div>
        </div>
      </section>

    </>
  );
}
