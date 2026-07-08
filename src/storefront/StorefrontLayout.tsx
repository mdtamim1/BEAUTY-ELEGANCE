import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, Heart, User, Zap, X, Minus, Plus, Phone, Mail, Menu, Home, MoreVertical } from 'lucide-react';
import { useStorefrontConfig } from '../store/storefrontConfig';
import './storefront.css';
import { replaceContactInfo } from '../utils/storefrontUtils';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import AiChatWidget from './AiChatWidget';
import { SpinWheelModal } from './SpinWheelModal';
import { OptimizedImage } from '../components/layout/OptimizedImage';

interface CartItem {
  product: any;
  quantity: number;
}

export default function StorefrontLayout() {
  const [config] = useStorefrontConfig();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const { customer } = useCustomerAuth();

  // Filter enabled announcements
  const announcements = config.announcements.filter(a => a.enabled);
  // Filter enabled nav links and dynamically normalize collection links
  const navLinks = config.navLinks
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

  // Branding
  const branding = config.branding;

  // Footer columns (with normalized links)
  const footerColumns = config.footerColumns.map(col => ({
    ...col,
    links: col.links.filter(l => l.enabled).map(link => {
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

    const handleScroll = () => {
      const st = container.scrollTop;
      
      // Update scrolled state for transparent header
      if (isHome) {
        setScrolled(st > 50);
      } else {
        setScrolled(true);
      }

      // Hide/Show bottom navigation based on scroll direction
      const diff = st - lastScrollTopRef.current;
      if (diff > 15 && st > 100) {
        // Scrolling down -> hide bottom nav
        setBottomNavVisible(false);
      } else if (diff < -15 || st <= 20) {
        // Scrolling up or near top -> show bottom nav
        setBottomNavVisible(true);
      }
      lastScrollTopRef.current = st;
    };

    if (!isHome) {
      setScrolled(true);
    } else {
      setScrolled(container.scrollTop > 50);
    }

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [isHome]);

  // Scroll restoration and reset bottom nav on route changes
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.scrollTop = 0;
    }
    setBottomNavVisible(true);
  }, [location.pathname]);

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
              {/* Left Action: Menu Toggle */}
              <div className="store-header-left">
                <button 
                  className="store-header-btn" 
                  onClick={() => setMobileMenuOpen(true)}
                  title="Open Menu"
                >
                  <Menu size={22} />
                </button>
              </div>

              {/* Center: Logo */}
              <div className="store-header-center">
                <Link to="/" className="store-logo">
                  <img src="/logo.png" alt="Tamim Global" className="store-header-logo-img" />
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
                            {suggestions.length} টি পণ্য পাওয়া গেছে
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
                          "{searchQuery}" এর কোনো পণ্য পাওয়া যায়নি
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

        {/* ---- Footer ---- */}
        <footer className="store-footer">
          <div className="store-footer-inner">
            {footerColumns
              .filter(col => col.title !== 'Quick Links')
              .map((col, colIdx) => (
                <div key={colIdx}>
                  <h4>{col.title}</h4>
                  <ul className="store-footer-links">
                    {col.links.map(link => (
                      <li key={link.id}><Link to={link.url}>{link.label}</Link></li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
          <div className="store-footer-bottom">
            <span>{branding.copyrightText}</span>
            <span>{branding.paymentMethodsText}</span>
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
                            সাইজ (Size): <strong>{size}</strong>
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
                <Link to="/checkout" className="cart-checkout-btn" onClick={() => setCartOpen(false)} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  Proceed to Checkout — ৳{cartTotal.toFixed(2)}
                </Link>
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
                <img src="/logo.png" alt="Tamim Global" style={{ height: '70px', objectFit: 'contain' }} />
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
                  <span>{customer ? 'আমার প্রোফাইল' : 'লগইন / রেজিস্টার'}</span>
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

      {/* ---- AI Chat Assistant Widget & Lucky Spin Wheel ---- */}
      {!isProductPage && <AiChatWidget />}
      <SpinWheelModal />
    </div>
  );
}
