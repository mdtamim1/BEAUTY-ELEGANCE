import { useState, useEffect, useMemo } from 'react';
import { useOutletContext, Link, useLocation } from 'react-router-dom';
import { Truck, Shield, RotateCcw, Headphones, Star, Heart, ShoppingCart, Zap,
  Smartphone, Shirt, Home as HomeIcon, Dumbbell, Sparkles, BookOpen,
  Monitor, Camera, Watch, Car, Baby, Flower, Palette, Music, Gamepad, Gift,
  Grid3X3, ArrowRight, CheckCircle, AlertCircle, X
} from 'lucide-react';
import { useStorefrontConfig } from '../store/storefrontConfig';
import { CountdownTimer } from './CollectionPage';
import { subscribeToNewsletter } from '../services/api';

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
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCampaignsModal, setShowCampaignsModal] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const location = useLocation();

  // Newsletter states
  const [emailInput, setEmailInput] = useState('');
  const [subMsg, setSubMsg] = useState('');
  const [subError, setSubError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load active campaigns from localStorage
  const [activeCampaigns, setActiveCampaigns] = useState<any[]>([]);
  const announcements = config.announcements ? config.announcements.filter((a: any) => a.enabled) : [];
  useEffect(() => {
    try {
      const stored = localStorage.getItem('campaignList');
      if (stored) {
        const list = JSON.parse(stored);
        if (Array.isArray(list)) {
          const active = list.filter((c: any) => c.status === 'active');
          setActiveCampaigns(active);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubMsg('');
    setSubError('');
    if (!emailInput.trim()) return;

    setIsSubmitting(true);
    const res = await subscribeToNewsletter(emailInput.trim());
    setIsSubmitting(false);

    if (res.status === 'success') {
      setSubMsg(res.message || 'নিউজলেটার সাবস্ক্রিপশন সফল হয়েছে!');
      setEmailInput('');
    } else {
      setSubError(res.message || 'সাবস্ক্রাইব করা যায়নি। আবার চেষ্টা করুন।');
    }
  };

  // Shuffle products randomly on component mount or products update
  const shuffledProducts = useMemo(() => {
    const publishedProducts = config.products.filter(p => p.published);
    return [...publishedProducts].sort(() => Math.random() - 0.5);
  }, [config.products]);

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

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 50;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setCurrentSlide(prev => (prev + 1) % banners.length);
    } else if (isRightSwipe) {
      setCurrentSlide(prev => (prev - 1 + banners.length) % banners.length);
    }
  };

  return (
    <>
      {/* ---- Hero Full-Width Carousel ---- */}
      {banners.length > 0 && (
        <section 
          className="hero-carousel-fullscreen"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="fullscreen-slides" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
            {banners.map((banner) => (
              <div 
                key={banner.id} 
                className={`fullscreen-slide ${banner.image ? 'has-image' : ''}`} 
                style={{ 
                  background: banner.image 
                    ? `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.75)), url(${banner.image}) center/cover no-repeat`
                    : banner.gradient 
                }}
              >
                <div className="fullscreen-slide-inner">
                  <div className="slide-content-left" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
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
                    {!banner.image && (
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

      {/* ---- Announcement Bar (Below Hero Carousel) ---- */}
      {(announcements.length > 0 || activeCampaigns.length > 0) && (
        <div className="announcement-bar theme-colored">
          <div className="announcement-marquee" style={{ background: 'var(--sf-accent)' }}>
            <div className="announcement-marquee-content" style={{ color: 'white' }}>
              {announcements.map((ann: any, idx: number) => (
                <span key={idx} className="announcement-marquee-item" style={{ color: 'white', fontWeight: 'bold' }}>
                  📢 {ann.text}
                </span>
              ))}
              {activeCampaigns.map((camp: any, idx: number) => (
                <span key={`camp-${idx}`} className="announcement-marquee-item campaign-promo" style={{ color: 'white', fontWeight: 'bold' }}>
                  🔥 {camp.name} ক্যাম্পেইন চলছে! এখনই দেখুন!
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

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
            
            // Find all published products for this category
            const categoryProducts = config.products.filter(p => p.published && p.category === cat.name);
            // Get last product image
            const lastProductImage = categoryProducts.length > 0 ? categoryProducts[categoryProducts.length - 1].image : '';

            return (
              <Link 
                to={categoryUrl}
                key={i} 
                className="category-card"
                style={{ textDecoration: 'none' }}
              >
                <div className="category-image-container">
                  {lastProductImage ? (
                    <img src={lastProductImage} alt={cat.name} className="category-card-image" />
                  ) : (
                    <div className="category-icon-fallback"><Icon size={22} /></div>
                  )}
                </div>
                <div className="category-card-info">
                  <div className="category-name">{cat.name}</div>
                  <div className="category-count">{cat.count.toLocaleString()} products</div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ---- All Campaigns Trigger Button ---- */}
      {activeCampaigns.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', margin: '30px 16px' }}>
          <button 
            onClick={() => setShowCampaignsModal(true)} 
            className="store-btn"
            style={{ 
              padding: '14px 28px', 
              fontSize: '1rem', 
              fontWeight: 800, 
              borderRadius: '30px', 
              background: 'var(--sf-accent)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 8px 24px var(--sf-accent-glow)',
              transition: 'all 0.25s ease'
            }}
          >
            Show Our All Campaigns
          </button>
        </div>
      )}

      {/* ---- Active Campaigns Modal ---- */}
      {showCampaignsModal && (
        <div className="modal-overlay" style={{ display: 'flex', zIndex: 1000, background: 'rgba(15, 23, 42, 0.65)' }}>
          <div className="modal" style={{ maxWidth: '800px', width: '90%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', background: 'white', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
            <div className="modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="modal-title" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>আমাদের ক্যাম্পেইনসমূহ (Active Campaigns)</span>
              <button onClick={() => setShowCampaignsModal(false)} style={{ color: '#64748b', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '6px' }} title="Close Modal">
                <X size={24} />
              </button>
            </div>
            <div className="modal-body" style={{ overflowY: 'auto', flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {activeCampaigns.map((camp) => {
                // Resolve products associated with this campaign
                const campProducts = config.products.filter(p => {
                  if (camp.productIds && Array.isArray(camp.productIds)) {
                    return camp.productIds.includes(String(p.id));
                  }
                  if (camp.productId) {
                    return String(p.id) === String(camp.productId);
                  }
                  return false;
                });

                return (
                  <div key={camp.id} className="campaign-modal-card">
                    <div className="campaign-modal-header-row">
                      <div>
                        <span style={{ display: 'inline-block', background: 'var(--sf-accent)', color: 'white', fontSize: '0.65rem', fontWeight: 800, padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
                          Campaign Active
                        </span>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'white' }}>{camp.name}</h3>
                        <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
                          মেয়ad: {new Date(camp.startDate).toLocaleDateString()} থেকে {new Date(camp.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <CountdownTimer
                          startDate={camp.startDate}
                          endDate={camp.endDate}
                          label="ক্যাম্পেইন শেষ হতে বাকি"
                        />
                      </div>
                    </div>

                    {/* Associated products list */}
                    {campProducts.length > 0 ? (
                      <div style={{ marginTop: '20px' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '12px' }}>ক্যাম্পেইনের পণ্যসমূহ:</h4>
                        <div className="campaign-products-grid">
                          {campProducts.map((product) => (
                            <div 
                              key={product.id} 
                              style={{
                                background: 'rgba(255, 255, 255, 0.04)',
                                borderRadius: '14px',
                                padding: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                                transition: 'all 0.2s'
                              }}
                            >
                              <img src={product.image} alt={product.name} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '10px' }} />
                              <Link 
                                to={`/product/${product.id}`} 
                                onClick={() => setShowCampaignsModal(false)}
                                style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc', textDecoration: 'none', lineHeight: 1.3, height: '2.6em', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
                              >
                                {product.name}
                              </Link>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--sf-accent)' }}>৳{product.price}</span>
                                <button 
                                  onClick={() => {
                                    addToCart(product);
                                    setShowCampaignsModal(false);
                                  }}
                                  style={{ background: 'var(--sf-accent)', color: 'white', border: 'none', borderRadius: '6px', padding: '4px 8px', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer' }}
                                >
                                  Buy Now
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '16px 0 0 0', fontStyle: 'italic' }}>এই ক্যাম্পেইনের সাথে কোনো পণ্য সংযুক্ত করা নেই।</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

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
                          {product.badge === 'sale' ? `Sale! -${Math.round((1 - product.price / (product.originalPrice || product.price)) * 100)}%` : 'New'}
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

      {/* ---- Newsletter Section ---- */}
      <section className="store-section newsletter-section" style={{ background: '#000000', color: '#ffffff', padding: '24px 16px', borderRadius: '12px', marginTop: '24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-50%', left: '-20%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '4px', color: '#ffffff' }}>অফার ও কুপন আপডেট পেতে সাবস্ক্রাইব করুন</h2>
        <p style={{ color: '#9ca3af', marginBottom: '16px', fontSize: '0.85rem' }}>আমাদের নিউজলেটারে জয়েন করুন এবং নতুন স্পোর্টস কালেকশন ও ডিসকাউন্ট ড্রপ সবার আগে পান।</p>
        
        {subMsg && (
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '8px 12px', borderRadius: '6px', fontSize: '0.8rem', maxWidth: '440px', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <CheckCircle size={14} /> {subMsg}
          </div>
        )}

        {subError && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '8px 12px', borderRadius: '6px', fontSize: '0.8rem', maxWidth: '440px', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <AlertCircle size={14} /> {subError}
          </div>
        )}

        <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '8px', maxWidth: '440px', margin: '0 auto', flexWrap: 'wrap' }}>
          <input 
            type="email" 
            placeholder="আপনার ইমেইল এড্রেস লিখুন" 
            required 
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            style={{ flex: 1, padding: '0 12px', height: '38px', fontSize: '0.85rem', border: '1px solid #374151', borderRadius: '6px', background: '#111827', color: '#ffffff', outline: 'none', minWidth: '200px', boxSizing: 'border-box' }}
          />
          <button 
            type="submit" 
            disabled={isSubmitting}
            style={{ height: '38px', padding: '0 16px', fontSize: '0.85rem', background: '#ffffff', color: '#000000', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: isSubmitting ? 'not-allowed' : 'pointer', minWidth: '100px' }}
          >
            {isSubmitting ? 'প্রসেস হচ্ছে...' : 'সাবস্ক্রাইব'}
          </button>
        </form>
      </section>

    </>
  );
}
