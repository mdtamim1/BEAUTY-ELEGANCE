import { useState, useEffect, useRef, useMemo } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, Heart, User, Zap, X, Minus, Plus, Phone, Mail, Menu, Home, MoreVertical, ArrowRight, Shield, Truck, RotateCcw, MapPin, Sparkles } from 'lucide-react';
import { useStorefrontConfig } from '../store/storefrontConfig';
import './storefront.css';
import { replaceContactInfo } from '../utils/storefrontUtils';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { OptimizedImage } from '../components/layout/OptimizedImage';

interface CartItem {
  product: any;
  quantity: number;
}

export function BrandTextLogo({ className = '' }: { className?: string }) {
  return (
    <div className={`store-text-logo-brand ${className}`}>
      <span className="store-text-logo-main">TAMIM GLOBAL</span>
      <span className="store-text-logo-sub">PREMIUM STORE</span>
    </div>
  );
}

export default function StorefrontLayout() {
  const [config] = useStorefrontConfig();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const { customer } = useCustomerAuth();

  // Filter enabled announcements
  const announcements = useMemo(() => config.announcements.filter(a => a.enabled), [config.announcements]);
  
  // Filter enabled nav links and dynamically normalize collection links
  const navLinks = useMemo(() => {
    return config.navLinks
      .filter(n => n.enabled)
      .map(link => {
        if (link.customPageContent) {
          return { ...link, url: `/page/${link.id}` };
        }
        let url = link.url;
        if (url.startsWith('/store/')) {
          url = url.replace('/store/', '/');
        } else if (url === '/store' || url === '') {
          url = '/';
        }
        const labelLower = (link.label || '').toLowerCase();
        if (labelLower === 'home') {
          url = '/';
        } else if (labelLower === 'offers' || labelLower === 'offer') {
          url = '/collection/offers';
        } else if (labelLower === 'new arrivals' || labelLower === 'new arrival') {
          url = '/collection/new-arrivals';
        } else if (labelLower === 'popular order' || labelLower === 'popular') {
          url = '/collection/popular-order';
        }
        return { ...link, url };
      });
  }, [config.navLinks]);

  // Branding
  const branding = config.branding;

  // Footer columns (with normalized links, excluding Quick Links)
  const footerColumns = useMemo(() => {
    return config.footerColumns
      .filter(col => col.title !== 'Quick Links')
      .map(col => ({
        ...col,
        links: col.links.filter(l => l.enabled).map(link => {
          if (link.customPageContent) {
            const labelLower = (link.label || '').toLowerCase();
            if (labelLower === 'privacy policy') {
              return { ...link, url: '/privacy-policy' };
            } else if (labelLower === 'terms of service' || labelLower === 'terms and service') {
              return { ...link, url: '/terms-of-service' };
            } else if (labelLower === 'about us' || labelLower === 'about') {
              return { ...link, url: '/about-us' };
            }
            return { ...link, url: `/page/${link.id}` };
          }
          let url = link.url;
          if (url.startsWith('/store/')) {
            url = url.replace('/store/', '/');
          } else if (url === '/store' || url === '') {
            url = '/';
          }
          const labelLower = (link.label || '').toLowerCase();
          if (labelLower === 'home' || labelLower === 'shop all') {
            url = '/';
          } else if (labelLower === 'new arrivals' || labelLower === 'new arrival') {
            url = '/collection/new-arrivals';
          } else if (labelLower === 'offers' || labelLower === 'offer' || labelLower === 'sale') {
            url = '/collection/offers';
          } else if (labelLower === 'popular order' || labelLower === 'popular') {
            url = '/collection/popular-order';
          }
          return { ...link, url };
        }),
      }));
  }, [config.footerColumns]);

  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlist, setWishlist] = useState<number[]>([]);
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastScrollTopRef = useRef(0);
  const [bottomNavVisible, setBottomNavVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isProductPage = location.pathname.startsWith('/product/');

  // Load active campaigns from localStorage
  const [activeCampaigns, setActiveCampaigns] = useState<any[]>([]);
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

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const st = container.scrollTop;
          
          // Update scrolled state for header
          const nextScrolled = !isHome || st > 50;
          setScrolled(prev => (prev !== nextScrolled ? nextScrolled : prev));

          // Hide/Show bottom navigation based on scroll direction
          const diff = st - lastScrollTopRef.current;
          if (diff > 15 && st > 100) {
            setBottomNavVisible(prev => (prev ? false : prev));
          } else if (diff < -15 || st <= 20) {
            setBottomNavVisible(prev => (!prev ? true : prev));
          }
          lastScrollTopRef.current = st;
          ticking = false;
        });
        ticking = true;
      }
    };

    setScrolled(!isHome || container.scrollTop > 50);

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [isHome]);

  // Scroll restoration and reset bottom nav on route changes
  useEffect(() => {
    // Track PageView in Facebook Meta Pixel on SPA route navigation
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'PageView');
    }

    const container = containerRef.current;
    if (container) {
      container.scrollTop = 0;
    }
    window.scrollTo(0, 0);

    // Timed fallbacks to handle lazy layout rendering and image size shifts
    const t1 = setTimeout(() => {
      if (container) container.scrollTop = 0;
      window.scrollTo(0, 0);
    }, 50);

    const t2 = setTimeout(() => {
      if (container) container.scrollTop = 0;
      window.scrollTo(0, 0);
    }, 150);

    setBottomNavVisible(true);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (mobileSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [mobileSearchOpen]);

  // Background Auto-Sync for Offline Orders
  useEffect(() => {
    const syncOfflineOrders = async () => {
      const pending = localStorage.getItem('pending_sync_orders');
      if (!pending) return;

      try {
        const orders = JSON.parse(pending);
        if (Array.isArray(orders) && orders.length > 0) {
          console.log(`Found ${orders.length} offline orders pending sync...`);
          const remaining: any[] = [];
          
          // Dynamically import the api helper to prevent static dependency cycle
          const { sendOrderToBackend } = await import('../services/api');

          for (const order of orders) {
            const success = await sendOrderToBackend(order);
            if (!success) {
              remaining.push(order);
            }
          }

          if (remaining.length > 0) {
            localStorage.setItem('pending_sync_orders', JSON.stringify(remaining));
          } else {
            localStorage.removeItem('pending_sync_orders');
            console.log('All offline orders successfully synced to backend!');
          }
        }
      } catch (e) {
        console.error('Failed to sync offline orders:', e);
      }
    };

    // Run sync on mount, and then periodically check every 30 seconds
    const timeout = setTimeout(syncOfflineOrders, 5000);
    const interval = setInterval(syncOfflineOrders, 30000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  const clearCart = () => setCart([]);

  const addToCart = (product: any) => {
    // Track AddToCart in Facebook Meta Pixel
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'AddToCart', {
        content_name: product.name,
        content_category: product.category || 'Sports',
        content_ids: [String(product.id)],
        content_type: 'product',
        value: product.price,
        currency: 'BDT'
      });
    }

    const size = product.selectedSize || 'Free Size';
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id && (item.product.selectedSize || 'Free Size') === size);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id && (item.product.selectedSize || 'Free Size') === size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const updateQuantity = (productId: number, sizeOrDelta: string | number, possibleDelta?: number) => {
    let size = 'Free Size';
    let delta = 0;
    if (typeof sizeOrDelta === 'string') {
      size = sizeOrDelta;
      delta = possibleDelta ?? 0;
    } else {
      delta = sizeOrDelta;
    }

    setCart(prev =>
      prev
        .map(item => {
          const itemSize = item.product.selectedSize || 'Free Size';
          const matchesProduct = item.product.id === productId;
          const matchesSize = typeof sizeOrDelta !== 'string' || itemSize === size;
          if (matchesProduct && matchesSize) {
            return { ...item, quantity: Math.max(0, item.quantity + delta) };
          }
          return item;
        })
        .filter(item => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: number, size?: string) => {
    setCart(prev =>
      prev.filter(item =>
        item.product.id !== productId ||
        (size !== undefined && (item.product.selectedSize || 'Free Size') !== size)
      )
    );
  };

  const toggleWishlist = (productId: number) => {
    setWishlist(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const currentPath = window.location.pathname;
    if (currentPath !== '/' && !currentPath.startsWith('/collection')) {
      navigate('/');
    }
  };

  return (
    <div className="storefront">
      <div className={`store-sticky-header-container ${isHome && !scrolled ? 'header-transparent' : ''}`}>
        {/* ---- Header ---- */}
        <header className="store-header">
          {!mobileSearchOpen ? (
            <div className="store-header-inner-grid">
              {/* Left Action: Mobile Menu Toggle & Desktop Nav Links */}
              <div className="store-header-left">
                <button 
                  className="store-header-btn store-mobile-menu-btn" 
                  onClick={() => setMobileMenuOpen(true)}
                  title="Open Menu"
                >
                  <Menu size={22} />
                </button>

                <nav className="store-desktop-nav">
                  {navLinks.map((link) => (
                    <Link key={link.id} to={link.url} className="store-desktop-nav-link">
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Center: Logo */}
              <div className="store-header-center">
                <Link to="/" className="store-logo" style={{ textDecoration: 'none' }}>
                  <BrandTextLogo />
                </Link>
              </div>

              {/* Right Action: Search & Cart */}
              <div className="store-header-right">
                <button 
                  className="store-header-btn" 
                  onClick={() => setMobileSearchOpen(true)}
                  title="Search"
                >
                  <Search size={20} />
                </button>

                <button 
                  className="store-header-btn" 
                  title="Wishlist" 
                  onClick={() => setWishlistOpen(true)}
                  style={{ position: 'relative' }}
                >
                  <Heart size={20} />
                  {wishlist.length > 0 && (
                    <span className="cart-count" style={{ background: '#ef4444' }}>
                      {wishlist.length}
                    </span>
                  )}
                </button>

                <button 
                  className="store-header-btn" 
                  title="Cart" 
                  onClick={() => setCartOpen(true)}
                  style={{ position: 'relative' }}
                >
                  <ShoppingCart size={20} />
                  {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
                </button>

                <button 
                  className="store-header-btn" 
                  title="My Account" 
                  onClick={() => navigate('/account')}
                >
                  <User size={20} />
                </button>
              </div>
            </div>
          ) : (
            /* Full Width Search Bar Row (covers header logo & menu items completely) */
            <div className="store-header-search-bar-row">
              <form className="store-search-full" onSubmit={handleSearch}>
                <Search size={18} className="store-search-full-icon" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search products, brands, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ fontSize: '16px' }}
                />
                <button
                  type="button"
                  className="store-search-close-btn"
                  onClick={() => { setMobileSearchOpen(false); setSearchQuery(''); }}
                  title="Close Search"
                >
                  <X size={20} />
                </button>

                {/* Search Suggestions Dropdown */}
                {searchQuery.trim().length >= 2 && (() => {
                  const q = searchQuery.toLowerCase().trim();
                  const suggestions = config.products
                    .filter(p => p.published && (
                      p.name.toLowerCase().includes(q) ||
                      p.category.toLowerCase().includes(q) ||
                      (p.brand && p.brand.toLowerCase().includes(q)) ||
                      (p.sku && p.sku.toLowerCase().includes(q))
                    ))
                    .slice(0, 6);

                  return (
                    <div className="store-search-suggestions">
                      {suggestions.length > 0 ? (
                        <>
                          <div className="store-search-suggestions-title">
                            {suggestions.length} products found
                          </div>
                          {suggestions.map((product) => (
                            <div
                              key={product.id}
                              className="store-search-suggestion-item"
                              onClick={() => {
                                navigate(`/product/${product.id}`);
                                setSearchQuery('');
                                setMobileSearchOpen(false);
                              }}
                            >
                              <img
                                src={product.image}
                                alt={product.name}
                                className="store-search-suggestion-img"
                              />
                              <div className="store-search-suggestion-info">
                                <div className="store-search-suggestion-name">{product.name}</div>
                                <div className="store-search-suggestion-meta">
                                  {product.category} {product.brand ? `• ${product.brand}` : ''}
                                </div>
                              </div>
                              <div className="store-search-suggestion-price">
                                ৳{product.price}
                              </div>
                            </div>
                          ))}
                        </>
                      ) : (
                        <div className="store-search-no-results">
                          No products found for "{searchQuery}"
                        </div>
                      )}
                    </div>
                  );
                })()}
              </form>
            </div>
          )}
        </header>
      </div>

      {/* ---- Scrollable Container ---- */}
      <div className="storefront-scroll-container" ref={containerRef}>
        {/* ---- Main Content Area ---- */}
        <main>
          <Outlet context={{ addToCart, toggleWishlist, wishlist, cart, cartTotal, clearCart, updateQuantity, searchQuery, setSearchQuery }} />
        </main>

        {/* ---- SPLAYD Replica 4-Column Footer ---- */}
        <footer className="splayd-footer-section">
          <div className="splayd-footer-container">
            <div className="splayd-footer-grid">
              
              {/* Column 1: Information */}
              <div>
                <h4 className="splayd-footer-col-title">Information</h4>
                <ul className="splayd-footer-link-list">
                  <li><Link to="/page/about-us" onClick={() => window.scrollTo(0,0)}>About Us</Link></li>
                  <li><Link to="/page/contact-us" onClick={() => window.scrollTo(0,0)}>Contact Us</Link></li>
                  <li><Link to="/page/payment-policy" onClick={() => window.scrollTo(0,0)}>Payment Policy</Link></li>
                  <li><Link to="/page/shipping-policy" onClick={() => window.scrollTo(0,0)}>Shipping Policy</Link></li>
                  <li><Link to="/page/returns-exchanges" onClick={() => window.scrollTo(0,0)}>Returns & Exchanges</Link></li>
                  <li><Link to="/page/privacy-policy" onClick={() => window.scrollTo(0,0)}>Privacy Policy</Link></li>
                  <li><Link to="/page/terms-conditions" onClick={() => window.scrollTo(0,0)}>Terms and Conditions</Link></li>
                </ul>
              </div>

              {/* Column 3: Useful links */}
              <div>
                <h4 className="splayd-footer-col-title">Useful links</h4>
                <ul className="splayd-footer-link-list">
                  <li><Link to="/page/our-story" onClick={() => window.scrollTo(0,0)}>Our Story</Link></li>
                  <li><Link to="/page/outlets" onClick={() => window.scrollTo(0,0)}>Our All Outlets</Link></li>
                  <li><Link to="/page/faq" onClick={() => window.scrollTo(0,0)}>FAQ</Link></li>
                  <li><Link to="/page/news" onClick={() => window.scrollTo(0,0)}>Latest News</Link></li>
                  <li><Link to="/page/size-guide" onClick={() => window.scrollTo(0,0)}>Size Guide</Link></li>
                  <li><Link to="/account" onClick={() => window.scrollTo(0,0)}>My Account</Link></li>
                </ul>
              </div>

              {/* Column 4: Newsletter Signup */}
              <div>
                <h4 className="splayd-footer-col-title">Newsletter Signup</h4>
                <p className="splayd-footer-newsletter-text">Subscribe to our newsletter and get exciting offers</p>
                <form 
                  className="splayd-footer-newsletter-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    alert('Thank you! You have successfully subscribed to our newsletter.');
                  }}
                >
                  <input 
                    type="email" 
                    placeholder="Your email address" 
                    required 
                    className="splayd-footer-newsletter-input" 
                  />
                  <button type="submit" className="splayd-footer-newsletter-btn">SUBSCRIBE</button>
                </form>
              </div>

              {/* Column 5: SPLAYD Store Logo, Address & Social Media */}
              <div>
                <div className="splayd-footer-brand-header">
                  <div style={{ width: '20px', height: '20px', borderLeft: '3.5px solid #18181b', borderBottom: '3.5px solid #18181b', transform: 'rotate(-45deg)', margin: '0 2px' }} />
                  <span className="splayd-footer-brand-title">{branding.storeName || 'TAMIM GLOBAL'}</span>
                </div>
                <div className="splayd-footer-contact-info">
                  <div className="splayd-footer-contact-item">
                    <MapPin size={16} />
                    <span>{branding.addressText || '5th Floor, Block-B, Shop no: 46, 47, 56, 57, 58, Basundhara City Complex'}</span>
                  </div>
                  {config.contactInfo.email && (
                    <div className="splayd-footer-contact-item">
                      <Mail size={16} />
                      <a href={`mailto:${config.contactInfo.email}`} style={{ color: '#71717a', textDecoration: 'none' }}>{config.contactInfo.email}</a>
                    </div>
                  )}
                  {config.contactInfo.phoneNumber && (
                    <div className="splayd-footer-contact-item">
                      <Phone size={16} />
                      <a href={`tel:${config.contactInfo.phoneNumber}`} style={{ color: '#71717a', textDecoration: 'none' }}>+{config.contactInfo.phoneNumber.replace(/[^0-9]/g, '')}</a>
                    </div>
                  )}
                </div>

                {/* Social Media Real Logos Strip */}
                <div className="splayd-footer-socials">
                  {/* Facebook */}
                  <a href={config.contactInfo.facebookUrl || "https://facebook.com"} target="_blank" rel="noopener noreferrer" className="splayd-social-btn facebook" title="Facebook">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                  {/* Instagram */}
                  <a href={config.contactInfo.instagramUrl || "https://instagram.com"} target="_blank" rel="noopener noreferrer" className="splayd-social-btn instagram" title="Instagram">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </a>
                  {/* TikTok */}
                  <a href={config.contactInfo.tiktokUrl || "https://tiktok.com"} target="_blank" rel="noopener noreferrer" className="splayd-social-btn tiktok" title="TikTok">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.01.08 1.53.63 3.02 1.59 4.23.86.87 2 1.43 3.2 1.61.01 1.33.01 2.66 0 3.99-.99-.12-1.95-.53-2.74-1.15-.65-.54-1.12-1.25-1.38-2.04v7.91c.01 2.22-.84 4.39-2.38 5.96a7.712 7.712 0 01-7.85 1.89 7.64 7.64 0 01-4.7-5.06A7.818 7.818 0 017.065 7.6a7.716 7.716 0 018.3 3.2c-.01 1.43-.02 2.85-.02 4.28a3.528 3.528 0 00-4.04-1.22 3.6 3.6 0 00-2.28 3.32 3.524 3.524 0 003.54 3.52c1.94-.01 3.56-1.57 3.57-3.52q-.01-5.46-.01-10.92q-.3-.02-.6-.04z"/>
                    </svg>
                  </a>
                  {/* YouTube */}
                  <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="splayd-social-btn youtube" title="YouTube">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                  {/* WhatsApp */}
                  {config.contactInfo.whatsappNumber && (
                    <a href={`https://wa.me/${config.contactInfo.whatsappNumber.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="splayd-social-btn whatsapp" title="WhatsApp">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* SPLAYD Bottom Copyright & Developer Credit Bar */}
            <div className="splayd-footer-bottom-bar" style={{ flexWrap: 'wrap', gap: '12px' }}>
              <span>{branding.copyrightText || `© ${new Date().getFullYear()} ${branding.storeName || 'TAMIM GLOBAL'}. All Rights Reserved.`}</span>
              
              {(branding.developerEnabled ?? true) && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#71717a' }}>
                  <span>Developed by</span>
                  <a 
                    href={branding.developerUrl || '#'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                      color: '#18181b',
                      fontWeight: 800,
                      textDecoration: 'none',
                      background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      border: '1px solid rgba(245, 158, 11, 0.4)',
                      backgroundColor: 'rgba(245, 158, 11, 0.08)',
                      boxShadow: '0 0 10px rgba(245, 158, 11, 0.15)',
                      letterSpacing: '0.03em',
                      transition: 'all 0.3s ease',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Sparkles size={12} color="#f59e0b" style={{ WebkitTextFillColor: 'initial' }} />
                    {branding.developerName || 'Tamim Labs'}
                  </a>
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span className="splayd-payment-badge">VISA</span>
                <span className="splayd-payment-badge">MasterCard</span>
                <span className="splayd-payment-badge">SSLCommerz</span>
                <span className="splayd-payment-badge">bKash</span>
                <span className="splayd-payment-badge">Nagad</span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* ---- Cart Sidebar ---- */}
      {cartOpen && (
        <>
          <div className="cart-overlay" onClick={() => setCartOpen(false)} />
          <div className="cart-sidebar">
            <div className="cart-header">
              <h3>Shopping Cart ({cartCount})</h3>
              <button className="store-header-btn" onClick={() => setCartOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="cart-items">
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--sf-text-tertiary)' }}>
                  <ShoppingCart size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                  <p style={{ fontWeight: 600, color: 'var(--sf-text-secondary)' }}>Your cart is empty</p>
                  <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>Add items to start shopping</p>
                </div>
              ) : (
                cart.map((item) => {
                  const size = item.product.selectedSize || 'Free Size';
                  return (
                    <div key={`${item.product.id}-${size}`} className="cart-item">
                      <OptimizedImage src={item.product.image} alt={item.product.name} className="cart-item-image" width={100} height={100} />
                      <div className="cart-item-info">
                        <div className="cart-item-name">{item.product.name}</div>
                        {size !== 'Free Size' && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--sf-text-secondary)', marginTop: '2px' }}>
                            Size: <strong>{size}</strong>
                          </div>
                        )}
                        <div className="cart-item-price">৳{(item.product.price * item.quantity).toFixed(2)}</div>
                        <div className="cart-item-qty">
                          <button onClick={() => updateQuantity(item.product.id, size, -1)}><Minus size={14} /></button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, size, 1)}><Plus size={14} /></button>
                          <button
                            onClick={() => removeFromCart(item.product.id, size)}
                            style={{ marginLeft: 'auto', color: 'var(--sf-danger)', border: 'none' }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-footer">

                <div className="cart-total">
                  <span>Subtotal</span>
                  <span>৳{cartTotal.toFixed(2)}</span>
                </div>
                <Link 
                  to="/checkout" 
                  className="cart-checkout-btn" 
                  onClick={() => setCartOpen(false)} 
                  style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  Proceed to Checkout <ArrowRight size={18} />
                </Link>
                <div className="cart-trust-badges">
                  <span><Shield size={13} /> Secure</span>
                  <span><Truck size={13} /> Fast Delivery</span>
                  <span><RotateCcw size={13} /> Easy Return</span>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ---- Wishlist Sidebar ---- */}
      {wishlistOpen && (
        <>
          <div className="wishlist-overlay" onClick={() => setWishlistOpen(false)} />
          <div className="wishlist-sidebar">
            <div className="wishlist-header">
              <h3>My Wishlist ({wishlist.length})</h3>
              <button className="store-header-btn" onClick={() => setWishlistOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="wishlist-items">
              {wishlist.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--sf-text-tertiary)' }}>
                  <Heart size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                  <p style={{ fontWeight: 600, color: 'var(--sf-text-secondary)' }}>Your wishlist is empty</p>
                  <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>Add items you love to your wishlist</p>
                </div>
              ) : (
                config.products
                  .filter(product => wishlist.some(id => String(id) === String(product.id)))
                  .map((product) => (
                    <div key={product.id} className="wishlist-item">
                      <OptimizedImage src={product.image} alt={product.name} className="wishlist-item-image" width={100} height={100} />
                      <div className="wishlist-item-info">
                        <Link 
                          to={`/product/${product.id}`} 
                          className="wishlist-item-name"
                          onClick={() => setWishlistOpen(false)}
                        >
                          {product.name}
                        </Link>
                        <div className="wishlist-item-price">৳{product.price.toFixed(2)}</div>
                        <div className="wishlist-item-actions">
                          <button 
                            className="wishlist-add-cart-btn"
                            onClick={() => {
                              addToCart(product);
                            }}
                          >
                            Add to Cart
                          </button>
                          <button 
                            className="wishlist-remove-btn"
                            onClick={() => toggleWishlist(product.id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </>
      )}
      {/* ---- Mobile Navigation Menu Drawer ---- */}
      {mobileMenuOpen && (
        <>
          <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)} />
          <div className="mobile-menu-drawer">
            <div className="mobile-menu-header">
              <div className="store-logo">
                <BrandTextLogo />
              </div>
              <button className="store-header-btn" onClick={() => setMobileMenuOpen(false)} title="Close Menu">
                <X size={24} />
              </button>
            </div>
            
            <nav className="mobile-menu-nav">
              {navLinks.map(link => (
                <Link 
                  key={link.id} 
                  to={link.url} 
                  className="mobile-menu-nav-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              <div style={{ borderTop: '1px solid rgba(226, 232, 240, 0.6)', marginTop: '16px', paddingTop: '16px' }}>
                <Link 
                  to="/account" 
                  className="mobile-menu-nav-link"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                >
                  <User size={18} />
                  <span>{customer ? 'My Account / Profile' : 'Login / Register'}</span>
                </Link>
              </div>
            </nav>

            <div className="mobile-menu-footer">
              <div className="mobile-menu-contact-title">Contact Us</div>
              {config.contactInfo.phoneNumber && (
                <a href={`tel:${config.contactInfo.phoneNumber}`} className="mobile-menu-contact-item">
                  📞 {config.contactInfo.phoneNumber}
                </a>
              )}
              {config.contactInfo.email && (
                <a href={`mailto:${config.contactInfo.email}`} className="mobile-menu-contact-item">
                  ✉️ {config.contactInfo.email}
                </a>
              )}
            </div>
          </div>
        </>
      )}

      {/* Bottom Nav Removed */}
    </div>
  );
}
