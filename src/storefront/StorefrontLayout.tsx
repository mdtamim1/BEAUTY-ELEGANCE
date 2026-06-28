import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, Heart, User, Zap, X, Minus, Plus, Phone, Mail, Menu, Home } from 'lucide-react';
import { useStorefrontConfig } from '../store/storefrontConfig';
import './storefront.css';
import { replaceContactInfo } from '../utils/storefrontUtils';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import AiChatWidget from './AiChatWidget';

interface CartItem {
  product: any;
  quantity: number;
}

export default function StorefrontLayout() {
  const [config] = useStorefrontConfig();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
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

    if (!isHome) {
      setScrolled(true);
      return;
    }

    const handleScroll = () => {
      setScrolled(container.scrollTop > 50);
    };

    handleScroll();
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [isHome]);

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
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(prev =>
      prev
        .map(item =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter(item => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
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
        {/* ---- Announcement Bar ---- */}
        {(announcements.length > 0 || activeCampaigns.length > 0) && (
          <div className="announcement-bar">
            <div className="announcement-marquee">
              <div className="announcement-marquee-content">
                {announcements.map((ann) => (
                  <div key={`ann-1-${ann.id}`} className="announcement-marquee-item">
                    <span className="announcement-news-tag">বিজ্ঞপ্তি</span>
                    <span className="announcement-text">{replaceContactInfo(ann.text, config.contactInfo)}</span>
                  </div>
                ))}
                {activeCampaigns.map((camp) => (
                  <div key={`camp-1-${camp.id}`} className="announcement-marquee-item">
                    <span className="announcement-news-tag" style={{ backgroundColor: 'var(--sf-accent)' }}>অফার</span>
                    <span className="announcement-text" style={{ fontWeight: 'bold' }}>{camp.name} — Limited Campaign Active!</span>
                  </div>
                ))}
                {announcements.map((ann) => (
                  <div key={`ann-2-${ann.id}`} className="announcement-marquee-item">
                    <span className="announcement-news-tag">বিজ্ঞপ্তি</span>
                    <span className="announcement-text">{replaceContactInfo(ann.text, config.contactInfo)}</span>
                  </div>
                ))}
                {activeCampaigns.map((camp) => (
                  <div key={`camp-2-${camp.id}`} className="announcement-marquee-item">
                    <span className="announcement-news-tag" style={{ backgroundColor: 'var(--sf-accent)' }}>অফার</span>
                    <span className="announcement-text" style={{ fontWeight: 'bold' }}>{camp.name} — Limited Campaign Active!</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ---- Header ---- */}
        <header className="store-header">
          <div className="store-header-inner">
            <div className="store-header-logo-row">
              <Link to="/" className="store-logo">
                <div className="store-logo-icon"><Zap size={22} /></div>
                <div className="store-logo-text">{branding.logoTextPrimary}<span>{branding.logoTextSecondary}</span></div>
              </Link>
            </div>

            <nav className="store-nav">
              {navLinks.map(link => (
                <Link key={link.id} to={link.url} className="store-nav-link">{link.label}</Link>
              ))}
            </nav>

            <form className={`store-search ${mobileSearchOpen ? 'open' : ''}`} onSubmit={handleSearch}>
              <Search size={18} className="store-search-icon" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search products, brands, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {mobileSearchOpen && (
                <button
                  type="button"
                  className="store-search-close-btn"
                  onClick={() => setMobileSearchOpen(false)}
                  title="Close Search"
                >
                  <X size={18} />
                </button>
              )}
            </form>

            <div className="store-header-actions">
              <button 
                className="store-header-btn store-mobile-search-toggle" 
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                title="Search"
              >
                <Search size={20} />
              </button>
              <button 
                className="store-header-btn store-desktop-only" 
                title="Wishlist"
                onClick={() => setWishlistOpen(true)}
              >
                <Heart size={20} />
                {wishlist.length > 0 && <span className="cart-count">{wishlist.length}</span>}
              </button>
              <button 
                className="store-header-btn store-desktop-only" 
                title="Account"
                onClick={() => navigate('/account')}
                style={{ position: 'relative' }}
              >
                <User size={20} />
                {customer && <span className="customer-active-dot" style={{ position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', background: '#16a34a', borderRadius: '50%', border: '2px solid white' }} />}
              </button>
              <button className="store-header-btn store-desktop-only" title="Cart" onClick={() => setCartOpen(true)}>
                <ShoppingCart size={20} />
                {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
              </button>
              <button 
                className="store-header-btn store-mobile-menu-btn" 
                onClick={() => setMobileMenuOpen(true)}
                title="Open Menu"
              >
                <Menu size={22} />
              </button>
            </div>
          </div>
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
            <div>
              <div className="store-logo" style={{ marginBottom: '16px' }}>
                <div className="store-logo-icon"><Zap size={22} /></div>
                <div className="store-logo-text" style={{ color: 'white' }}>{branding.logoTextPrimary}<span>{branding.logoTextSecondary}</span></div>
              </div>
              <p>{branding.footerDescription}</p>
              <div className="store-footer-socials">
                {config.contactInfo.phoneNumber && (
                  <a href={`tel:${config.contactInfo.phoneNumber}`} className="social-btn phone" title="Call Us">
                    <Phone size={18} />
                  </a>
                )}
                {config.contactInfo.email && (
                  <a href={`mailto:${config.contactInfo.email}`} className="social-btn email" title="Email Us">
                    <Mail size={18} />
                  </a>
                )}
                {config.contactInfo.facebookUrl && (
                  <a href={config.contactInfo.facebookUrl} className="social-btn facebook" title="Facebook" target="_blank" rel="noopener noreferrer">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
                    </svg>
                  </a>
                )}
                {config.contactInfo.whatsappNumber && (
                  <a href={`https://wa.me/${config.contactInfo.whatsappNumber}`} className="social-btn whatsapp" title="WhatsApp" target="_blank" rel="noopener noreferrer">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </a>
                )}
                {config.contactInfo.tiktokUrl && (
                  <a href={config.contactInfo.tiktokUrl} className="social-btn tiktok" title="TikTok" target="_blank" rel="noopener noreferrer">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.01.08 1.53.63 3.02 1.59 4.23.86.87 2 1.43 3.2 1.61.01 1.33.01 2.66 0 3.99-.99-.12-1.95-.53-2.74-1.15-.65-.54-1.12-1.25-1.38-2.04v7.91c.01 2.22-.84 4.39-2.38 5.96a7.712 7.712 0 01-7.85 1.89 7.64 7.64 0 01-4.7-5.06A7.818 7.818 0 017.065 7.6a7.716 7.716 0 018.3 3.2c-.01 1.43-.02 2.85-.02 4.28a3.528 3.528 0 00-4.04-1.22 3.6 3.6 0 00-2.28 3.32 3.524 3.524 0 003.54 3.52c1.94-.01 3.56-1.57 3.57-3.52q-.01-5.46-.01-10.92q-.3-.02-.6-.04z"/>
                    </svg>
                  </a>
                )}
                {config.contactInfo.instagramUrl && (
                  <a href={config.contactInfo.instagramUrl} className="social-btn instagram" title="Instagram" target="_blank" rel="noopener noreferrer">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </a>
                )}
              </div>
            </div>
            {footerColumns.map((col, colIdx) => (
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
                cart.map((item) => (
                  <div key={item.product.id} className="cart-item">
                    <img src={item.product.image} alt={item.product.name} className="cart-item-image" />
                    <div className="cart-item-info">
                      <div className="cart-item-name">{item.product.name}</div>
                      <div className="cart-item-price">৳{(item.product.price * item.quantity).toFixed(2)}</div>
                      <div className="cart-item-qty">
                        <button onClick={() => updateQuantity(item.product.id, -1)}><Minus size={14} /></button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id, 1)}><Plus size={14} /></button>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          style={{ marginLeft: 'auto', color: 'var(--sf-danger)', border: 'none' }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
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
                      <img src={product.image} alt={product.name} className="wishlist-item-image" />
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
                <div className="store-logo-icon"><Zap size={22} /></div>
                <div className="store-logo-text">{branding.logoTextPrimary}<span>{branding.logoTextSecondary}</span></div>
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

      {/* ---- Premium Bottom Navigation Bar (Mobile) ---- */}
      {!isProductPage && (
        <nav className="store-bottom-nav">
          <Link to="/" className={`bottom-nav-item ${location.pathname === '/' ? 'active' : ''}`}>
            <div className="bottom-nav-icon">
              <Home size={22} />
            </div>
            <span>হোম</span>
          </Link>
          <button 
            className={`bottom-nav-item ${wishlistOpen ? 'active' : ''} ${wishlist.length > 0 ? 'has-badge' : ''}`}
            onClick={() => setWishlistOpen(true)}
          >
            <div className="bottom-nav-icon">
              <Heart size={22} />
              {wishlist.length > 0 && <span className="bottom-nav-badge">{wishlist.length}</span>}
            </div>
            <span>উইশলিস্ট</span>
          </button>
          <button 
            className={`bottom-nav-item bottom-nav-cart-item ${cartOpen ? 'active' : ''} ${cartCount > 0 ? 'has-badge' : ''}`}
            onClick={() => setCartOpen(true)}
          >
            <div className="bottom-nav-cart-bubble">
              <ShoppingCart size={24} />
              {cartCount > 0 && <span className="bottom-nav-cart-count">{cartCount}</span>}
            </div>
            <span>কার্ট</span>
          </button>
          <button 
            className={`bottom-nav-item ${location.pathname === '/account' ? 'active' : ''}`}
            onClick={() => navigate('/account')}
          >
            <div className="bottom-nav-icon">
              <User size={22} />
              {customer && <span className="bottom-nav-active-dot" />}
            </div>
            <span>একাউন্ট</span>
          </button>
          <button 
            className={`bottom-nav-item ${mobileMenuOpen ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(true)}
          >
            <div className="bottom-nav-icon">
              <Menu size={22} />
            </div>
            <span>মেনু</span>
          </button>
        </nav>
      )}

      {/* ---- AI Chat Assistant Widget ---- */}
      <AiChatWidget />
    </div>
  );
}
