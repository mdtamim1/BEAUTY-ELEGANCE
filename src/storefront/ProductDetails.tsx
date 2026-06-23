import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';
import { ShoppingCart, Heart, Share2, Star, CheckCircle, Shield, Truck, RotateCcw, ChevronRight, Smartphone, Phone, MessageCircle, X, User, MapPin, Package, CreditCard, ArrowRight, Minus, Plus, Headphones, Store, Send } from 'lucide-react';
import { useStorefrontConfig } from '../store/storefrontConfig';
import { addOrder } from '../mock/data';
import { sendOrderToBackend, fetchProductByIdFromBackend, fetchChatHistory } from '../services/api';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import './storefront-pdp.css';
import './storefront-checkout.css';
import './storefront-account.css';

interface StorefrontContext {
  addToCart: (product: any) => void;
  toggleWishlist: (productId: number) => void;
  wishlist: number[];
}

const StarRating = ({ rating }: { rating: number }) => (
  <div className="product-stars">
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} size={16} fill={i <= Math.round(rating) ? '#fbbf24' : 'none'} color="#fbbf24" />
    ))}
  </div>
);

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const { addToCart, toggleWishlist, wishlist } = useOutletContext<StorefrontContext>();
  const [config] = useStorefrontConfig();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');
  
  const { customer, login, register, updateCustomerProfile } = useCustomerAuth();
  
  // Checkout Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [shippingLocation, setShippingLocation] = useState<'dhaka' | 'outside'>('dhaka');
  const [buyNowQty, setBuyNowQty] = useState<number>(1);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');

  const [nameEdited, setNameEdited] = useState(false);
  const [phoneEdited, setPhoneEdited] = useState(false);
  const [addressEdited, setAddressEdited] = useState(false);

  // Chat Drawer State
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [productShared, setProductShared] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<WebSocket | null>(null);

  // Chat Quick Auth UI states
  const [chatIsRegister, setChatIsRegister] = useState(false);
  const [chatAuthEmail, setChatAuthEmail] = useState('');
  const [chatAuthPassword, setChatAuthPassword] = useState('');
  const [chatAuthName, setChatAuthName] = useState('');
  const [chatAuthPhone, setChatAuthPhone] = useState('');
  const [chatAuthError, setChatAuthError] = useState('');
  const [chatAuthSuccess, setChatAuthSuccess] = useState('');

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatDrawerOpen]);

  // Sync local storage & local state
  const syncChatData = (updated: any[]) => {
    localStorage.setItem('storefront_chats', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    if (customer) {
      const filtered = updated.filter(m => m.customerId === customer.id);
      setChatMessages(filtered);
    }
  };

  const loadChatsLocal = () => {
    if (!customer) return;
    const stored = localStorage.getItem('storefront_chats');
    if (stored) {
      try {
        const allChats = JSON.parse(stored);
        const filtered = allChats.filter((m: any) => m.customerId === customer.id);
        setChatMessages(filtered);
      } catch (e) {}
    }
  };

  // Connect WebSocket & load history when chat drawer opens
  useEffect(() => {
    if (isChatDrawerOpen && customer) {
      loadChatsLocal();

      const initializeChat = async () => {
        const history = await fetchChatHistory();
        if (history && history.length > 0) {
          syncChatData(history);
        } else {
          loadChatsLocal();
        }

        const wsProto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const wsHost = isLocalDev ? 'localhost:5000' : 'beauty-elegance-admin.onrender.com';
        const wsUrl = `${wsProto}//${wsHost}/ws/chat`;

        try {
          const ws = new WebSocket(wsUrl);
          socketRef.current = ws;

          ws.onopen = () => {
            console.log('⚡ Storefront PDP support chat WebSocket open.');
          };

          ws.onmessage = (event) => {
            try {
               const payload = JSON.parse(event.data);
               if (payload.type === 'message') {
                 const newMsg = payload.data;
                 const stored = localStorage.getItem('storefront_chats');
                 let chatsList = [];
                 if (stored) {
                   try {
                     chatsList = JSON.parse(stored);
                   } catch (e) {}
                 }
                 if (!chatsList.some((m: any) => m.id === newMsg.id)) {
                   const updated = [...chatsList, newMsg];
                   syncChatData(updated);
                 }
               }
            } catch (e) {
               console.error('Error parsing WebSocket message content:', e);
            }
          };
        } catch (err) {
          console.warn('Storefront WebSocket setup failed.', err);
        }
      };

      initializeChat();

      const timer = setInterval(() => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          return;
        }
        loadChatsLocal();
      }, 3000);

      return () => {
        clearInterval(timer);
        if (socketRef.current) {
          socketRef.current.close();
        }
      };
    }
  }, [isChatDrawerOpen, customer]);

  const handleSendChatProductShare = () => {
    if (!customer || !product || productShared) return;

    const productSharePayload = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image
    };

    const shareMessage = `PRODUCT_SHARE:${JSON.stringify(productSharePayload)}`;

    const newMsg = {
      id: `msg-${Date.now()}`,
      customerId: customer.id,
      customerName: customer.name,
      sender: 'customer',
      message: shareMessage,
      timestamp: new Date().toISOString(),
      read: false
    };

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'message',
        customerId: customer.id,
        customerName: customer.name,
        sender: 'customer',
        message: shareMessage
      }));
    } else {
      const storedChats = localStorage.getItem('storefront_chats');
      let allChats = [];
      if (storedChats) {
        try { allChats = JSON.parse(storedChats); } catch (e) {}
      }
      syncChatData([...allChats, newMsg]);
    }
    setProductShared(true);
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer || !inputMessage.trim()) return;

    // Automatically share the product first if not shared yet in this chat window
    if (!productShared) {
      handleSendChatProductShare();
    }

    const textMessage = inputMessage.trim();
    const newMsg = {
      id: `msg-${Date.now()}`,
      customerId: customer.id,
      customerName: customer.name,
      sender: 'customer',
      message: textMessage,
      timestamp: new Date().toISOString(),
      read: false
    };

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'message',
        customerId: customer.id,
        customerName: customer.name,
        sender: 'customer',
        message: textMessage
      }));
    } else {
      const storedChats = localStorage.getItem('storefront_chats');
      let allChats = [];
      if (storedChats) {
        try { allChats = JSON.parse(storedChats); } catch (e) {}
      }
      syncChatData([...allChats, newMsg]);

      // Dummy auto-reply after 4 seconds (offline fallback support)
      setTimeout(() => {
        const stored = localStorage.getItem('storefront_chats');
        if (stored) {
          const chats = JSON.parse(stored);
          const lastMsg = chats.filter((m: any) => m.customerId === customer.id).pop();
          if (lastMsg && lastMsg.sender === 'customer') {
            const autoReply = {
              id: `msg-reply-${Date.now()}`,
              customerId: customer.id,
              customerName: customer.name,
              sender: 'admin',
              message: `ধন্যবাদ ${customer.name}! আমরা আপনার মেসেজটি পেয়েছি। আমাদের প্রতিনিধি প্রোডাক্টটি সম্পর্কে শীঘ্রই সাহায্য করবেন।`,
              timestamp: new Date().toISOString(),
              read: false
            };
            syncChatData([...chats, autoReply]);
          }
        }
      }, 4000);
    }

    setInputMessage('');
  };

  const handleChatAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChatAuthError('');
    setChatAuthSuccess('');

    if (chatIsRegister) {
      if (!chatAuthName || !chatAuthEmail || !chatAuthPassword || !chatAuthPhone) {
        setChatAuthError('সবগুলো ঘর পূরণ করুন।');
        return;
      }
      const res = await register(chatAuthName, chatAuthEmail, chatAuthPassword, chatAuthPhone);
      if (!res.success) {
        setChatAuthError(res.error || 'নিবন্ধন ব্যর্থ হয়েছে।');
      } else {
        setChatAuthSuccess('অ্যাকাউন্ট তৈরি সফল হয়েছে!');
      }
    } else {
      if (!chatAuthEmail || !chatAuthPassword) {
        setChatAuthError('ইমেইল ও পাসওয়ার্ড প্রদান করুন।');
        return;
      }
      const res = await login(chatAuthEmail, chatAuthPassword);
      if (!res.success) {
        setChatAuthError(res.error || 'লগইন ব্যর্থ হয়েছে।');
      }
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If customer is logged in, sync any modified fields back to their profile
    if (customer) {
      const needsUpdate = !customer.phone || !customer.address || customer.phone !== customerPhone || customer.address !== customerAddress || customer.name !== customerName;
      if (needsUpdate) {
        updateCustomerProfile({ name: customerName, phone: customerPhone, address: customerAddress });
      }
    }

    const deliveryCharge = shippingLocation === 'dhaka' 
      ? config.delivery.insideDhakaPrice 
      : config.delivery.outsideDhakaPrice;
    const subtotal = product.price * buyNowQty;
    const discount = 0;
    const total = subtotal + deliveryCharge - discount;

    const orderData = {
      customer: customerName,
      email: customer?.email || customerPhone,
      amount: total,
      items: buyNowQty,
      paymentMethod: 'Cash on Delivery',
      storeName: config.branding.storeName || 'VIPCommerce',
      phone: customerPhone,
      address: customerAddress,
      courier: shippingLocation === 'dhaka' ? 'Pathao (Dhaka)' : 'Pathao (Outside Dhaka)',
      city: shippingLocation === 'dhaka' ? 'Dhaka' : 'Outside Dhaka',
      thana: '',
      area: '',
      customerNote: customerNote,
      shopNote: '',
      paymentType: 'cod',
      memoNumber: '',
      deliveryCharge: deliveryCharge,
      discount: discount,
      paidAmount: 0,
      subtotal: subtotal,
      productsList: [{
        name: product.name,
        color: 'Default',
        size: 'Free Size',
        code: product.sku,
        quantity: buyNowQty,
        price: product.price,
      }],
    };

    // Safely sync to backend SQLite database
    await sendOrderToBackend(orderData);

    // Save locally for redundancy & to ensure local Admin panel functions properly
    addOrder(orderData);

    setCheckoutSuccess(true);
  };

  const closeCheckoutModal = () => {
    setIsCheckoutOpen(false);
    setCheckoutSuccess(false);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setCustomerNote('');
    setBuyNowQty(1);
    setSelectedAddressId('');
    setNameEdited(false);
    setPhoneEdited(false);
    setAddressEdited(false);
  };

  // Auto-populate checkout details when modal opens or customer loads
  useEffect(() => {
    if (isCheckoutOpen && customer) {
      if (customer.addresses && customer.addresses.length > 0) {
        const defaultAddr = customer.addresses.find(a => a.isDefault) || customer.addresses[0];
        if (defaultAddr) {
          if (!selectedAddressId) {
            setSelectedAddressId(defaultAddr.id);
          }
          if (!nameEdited) setCustomerName(defaultAddr.name);
          if (!phoneEdited) setCustomerPhone(defaultAddr.phone);
          if (!addressEdited) setCustomerAddress(defaultAddr.address);
          return;
        }
      }
      
      // Fallback to customer profile primary details
      if (!nameEdited) setCustomerName(customer.name || '');
      if (!phoneEdited) setCustomerPhone(customer.phone || '');
      if (!addressEdited) setCustomerAddress(customer.address || '');
    }
  }, [isCheckoutOpen, customer, nameEdited, phoneEdited, addressEdited]);

  const handleSelectAddress = (addr: any) => {
    setSelectedAddressId(addr.id);
    setCustomerName(addr.name);
    setCustomerPhone(addr.phone);
    setCustomerAddress(addr.address);
    setNameEdited(true);
    setPhoneEdited(true);
    setAddressEdited(true);
  };
  
  useEffect(() => {
    let active = true;
    const loadProduct = async () => {
      if (!id) return;
      setLoading(true);
      window.scrollTo(0, 0);
      
      const dbProduct = await fetchProductByIdFromBackend(id);
      if (!active) return;

      if (dbProduct) {
        setProduct(dbProduct);
        setActiveImage(dbProduct.gallery?.[0] || dbProduct.image);
        setLoading(false);
      } else {
        // Fallback to storefront config products using safe ID mapping comparison
        const foundProduct = config.products.find(p => String(p.id) === String(id));
        if (foundProduct) {
          setProduct(foundProduct);
          setActiveImage(foundProduct.gallery?.[0] || foundProduct.image);
        } else {
          setProduct(null);
        }
        setLoading(false);
      }
    };
    
    loadProduct();
    return () => {
      active = false;
    };
  }, [id, config.products]);

  if (loading) {
    return (
      <div className="pdp-container skeleton-container">
        <div className="pdp-grid">
          <div className="skeleton-image"></div>
          <div className="skeleton-info">
            <div className="skeleton-line w-20"></div>
            <div className="skeleton-line h-10 w-80"></div>
            <div className="skeleton-line w-40"></div>
            <div className="skeleton-line h-12 w-30"></div>
            <div className="skeleton-line h-32 w-100"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pdp-not-found">
        <h2>Product Not Found</h2>
        <p>Sorry, the product you're looking for doesn't exist or has been removed.</p>
        <Link to="/" className="store-btn store-btn-primary">Return to Shop</Link>
      </div>
    );
  }

  return (
    <div className="pdp-container">
      {/* Breadcrumbs */}
      <nav className="pdp-breadcrumbs">
        <Link to="/">Home</Link>
        <ChevronRight size={14} />
        <Link to="/">{product.category}</Link>
        <ChevronRight size={14} />
        <span>{product.name}</span>
      </nav>

      {/* Main Product Section */}
      <div className="pdp-grid">
        {/* Gallery */}
        <div className="pdp-gallery">
          <div className="pdp-main-image-container">
            <img src={activeImage} alt={product.name} className="pdp-main-image" />
            {product.badge && (
              <span className={`pdp-badge ${product.badge}`}>
                {product.badge === 'sale' ? `${Math.round((1 - product.price / (product.originalPrice || product.price)) * 100)}% OFF` : 'NEW'}
              </span>
            )}
          </div>
          <div className="pdp-thumbnails">
            {product.gallery.map((img: string, i: number) => (
              <button 
                key={i} 
                className={`pdp-thumbnail ${activeImage === img ? 'active' : ''}`}
                onClick={() => setActiveImage(img)}
              >
                <img src={img} alt={`Thumbnail ${i+1}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="pdp-info">
          <div className="pdp-brand">{product.brand}</div>
          <h1 className="pdp-title">{product.name}</h1>
          
          <div className="pdp-rating-row">
            <StarRating rating={product.rating} />
            <span className="pdp-reviews-count">{product.reviews.toLocaleString()} Reviews</span>
            <span className="pdp-sku">SKU: {product.sku}</span>
          </div>

          <div className="pdp-price-row">
            <span className="pdp-price">৳{product.price}</span>
            {product.originalPrice && <span className="pdp-original-price">৳{product.originalPrice}</span>}
          </div>


          <div className="pdp-stock-status">
            <CheckCircle size={20} color="var(--sf-success)" />
            <span>In Stock and ready to ship</span>
          </div>

          <div className="pdp-actions">
            <button className="store-btn store-btn-primary pdp-add-to-cart" onClick={() => addToCart(product)}>
              <ShoppingCart size={20} /> Add to Cart
            </button>
            <button 
              onClick={() => {
                setBuyNowQty(1);
                setIsCheckoutOpen(true);
              }}
              className="store-btn pdp-buy-now" 
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none' }}
            >
              Buy Now
            </button>
            <div className="pdp-action-icons">
              <button 
                className={`pdp-icon-btn ${wishlist.includes(product.id) ? 'active' : ''}`}
                onClick={() => toggleWishlist(product.id)}
                title="Add to Wishlist"
              >
                <Heart size={24} fill={wishlist.includes(product.id) ? '#ef4444' : 'none'} />
              </button>
              <button className="pdp-icon-btn" title="Share">
                <Share2 size={22} />
              </button>
            </div>
          </div>

          <div className="pdp-contact-actions">
            {config.contactInfo.whatsappNumber && (
              <a 
                href={`https://wa.me/${config.contactInfo.whatsappNumber}?text=I%20want%20to%20buy%20${encodeURIComponent(product.name)}`}
                target="_blank" 
                rel="noopener noreferrer" 
                className="pdp-contact-btn pdp-whatsapp"
              >
                <Smartphone size={18} /> WhatsApp এ কথা বলুন
              </a>
            )}
            {config.contactInfo.phoneNumber && (
              <a href={`tel:${config.contactInfo.phoneNumber}`} className="pdp-contact-btn pdp-call">
                <Phone size={18} /> সরাসরি কল: {config.contactInfo.phoneNumber}
              </a>
            )}
            {config.contactInfo.messengerUrl && (
              <a 
                href={config.contactInfo.messengerUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="pdp-contact-btn pdp-messenger"
              >
                <MessageCircle size={18} /> মেসেঞ্জার
              </a>
            )}
          </div>

          <div className="pdp-trust-badges">
            <div className="trust-badge"><Truck size={20} /> Free Shipping</div>
            <div className="trust-badge"><Shield size={20} /> 1 Year Warranty</div>
            <div className="trust-badge"><RotateCcw size={20} /> 30-Day Returns</div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="pdp-tabs-container">
        <div className="pdp-tabs-header">
          <button className={`pdp-tab ${activeTab === 'description' ? 'active' : ''}`} onClick={() => setActiveTab('description')}>Description</button>
          <button className={`pdp-tab ${activeTab === 'specs' ? 'active' : ''}`} onClick={() => setActiveTab('specs')}>Specifications</button>
          <button className={`pdp-tab ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>Reviews ({product.customerReviews?.length || 0})</button>
        </div>
        
        <div className="pdp-tab-content">
          {activeTab === 'description' && (
            <div className="pdp-description-tab">
              <h3>Product Overview</h3>
              <p>{product.description}</p>
              <h4>Key Features</h4>
              <ul>
                {product.features.map((feat: string, i: number) => <li key={i}>{feat}</li>)}
              </ul>
            </div>
          )}
          
          {activeTab === 'specs' && (
            <div className="pdp-specs-tab">
              <table className="pdp-specs-table">
                <tbody>
                  {product.specs.map((spec: { name: string; value: string }, i: number) => (
                    <tr key={i}>
                      <th>{spec.name}</th>
                      <td>{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="pdp-reviews-tab">
              {product.customerReviews && product.customerReviews.length > 0 ? (
                product.customerReviews.map((review: any) => (
                  <div key={review.id} className="pdp-review-card">
                    <div className="review-header">
                      <span className="review-user">{review.user}</span>
                      <span className="review-date">{new Date(review.date).toLocaleDateString()}</span>
                    </div>
                    <StarRating rating={review.rating} />
                    <p className="review-comment">{review.comment}</p>
                    <div className="review-helpful">
                      {review.helpful} people found this helpful
                    </div>
                  </div>
                ))
              ) : (
                <p>No reviews yet. Be the first to review this product!</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <div className="pdp-related">
          <h2>You May Also Like</h2>
          <div className="products-grid">
            {product.relatedProducts.map((relatedId: number) => {
              const relatedProduct = config.products.find(p => p.id === relatedId);
              if (!relatedProduct) return null;
              
              return (
                <Link to={`/product/${relatedProduct.id}`} key={relatedProduct.id} className="product-card" style={{ textDecoration: 'none' }}>
                  <div style={{ position: 'relative' }}>
                    <img src={relatedProduct.image} alt={relatedProduct.name} className="product-card-image" />
                    {relatedProduct.badge && (
                      <span className={`product-card-badge ${relatedProduct.badge}`}>
                        {relatedProduct.badge === 'sale' ? `${Math.round((1 - relatedProduct.price / (relatedProduct.originalPrice || relatedProduct.price)) * 100)}% OFF` : 'New'}
                      </span>
                    )}
                  </div>
                  <div className="product-card-body">
                    <div className="product-card-category">{relatedProduct.category}</div>
                    <div className="product-card-name">{relatedProduct.name}</div>
                    <div className="product-card-rating">
                      <StarRating rating={relatedProduct.rating} />
                      <span className="product-card-reviews">({relatedProduct.reviews.toLocaleString()})</span>
                    </div>
                    <div className="product-card-footer">
                      <div>
                        <span className="product-card-price">৳{relatedProduct.price}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
      {/* Premium Checkout Modal Overlay */}
      {isCheckoutOpen && (
        <div className="pdp-checkout-overlay" onClick={closeCheckoutModal}>
          <div className="pdp-checkout-modal" onClick={e => e.stopPropagation()}>
            <button className="pdp-checkout-close" onClick={closeCheckoutModal} aria-label="Close modal">
              <X size={20} />
            </button>

            {!checkoutSuccess ? (
              <>
                <div className="pdp-checkout-header">
                  <h3>নিরাপদ অর্ডার ফরম (Secure Order Form)</h3>
                  <p>অর্ডারটি সম্পন্ন করতে আপনার সঠিক তথ্য দিয়ে ফরমটি পূরণ করুন</p>
                </div>

                <form className="pdp-checkout-form" onSubmit={handleCheckoutSubmit}>
                  
                  {/* Step 1: Order Summary */}
                  <div className="pdp-checkout-summary">
                    <div className="pdp-checkout-item">
                      <img src={product.image} alt={product.name} className="pdp-checkout-item-img" />
                      <div className="pdp-checkout-item-details">
                        <div className="pdp-checkout-item-name">{product.name}</div>
                        <div className="pdp-checkout-item-variant">রঙ: ডিফল্ট | সাইজ: ফ্রি সাইজ</div>
                        <div className="pdp-checkout-item-row">
                          <div className="pdp-checkout-item-price">৳{product.price}</div>
                          <div className="qty-control">
                            <button type="button" className="qty-btn" onClick={() => setBuyNowQty(prev => Math.max(1, prev - 1))}>
                              <Minus size={12} />
                            </button>
                            <div className="qty-val">{buyNowQty}</div>
                            <button type="button" className="qty-btn" onClick={() => setBuyNowQty(prev => prev + 1)}>
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pdp-checkout-totals">
                      <div className="pdp-checkout-row">
                        <span>পণ্যের মূল্য (Subtotal)</span>
                        <span>৳{(product.price * buyNowQty).toFixed(2)}</span>
                      </div>
                      <div className="pdp-checkout-row">
                        <span>ডেলিভারি চার্জ (Shipping)</span>
                        <span>
                          ৳{(shippingLocation === 'dhaka' 
                            ? config.delivery.insideDhakaPrice 
                            : config.delivery.outsideDhakaPrice).toFixed(2)}
                        </span>
                      </div>
                      <div className="pdp-checkout-row total">
                        <span>সর্বমোট (Total)</span>
                        <span>
                          ৳{(
                            product.price * buyNowQty + 
                            (shippingLocation === 'dhaka' 
                              ? config.delivery.insideDhakaPrice 
                              : config.delivery.outsideDhakaPrice)
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Customer details */}
                  {customer && customer.addresses && customer.addresses.length > 0 && (
                    <div className="checkout-saved-addresses-container" style={{ gridColumn: '1 / -1', marginBottom: '16px' }}>
                      <div className="checkout-saved-addresses-title">
                        <MapPin size={16} /> সংরক্ষিত ঠিকানা থেকে সিলেক্ট করুন (Quick Fill)
                      </div>
                      <div className="checkout-address-list">
                        {customer.addresses.map((addr) => {
                          const isSelected = selectedAddressId === addr.id;
                          return (
                            <div 
                              key={addr.id} 
                              className={`checkout-address-card ${isSelected ? 'selected' : ''}`}
                              onClick={() => handleSelectAddress(addr)}
                            >
                              <div className="checkout-address-card-header">
                                <span className="checkout-address-label">{addr.label}</span>
                                {isSelected && (
                                  <span className="checkout-address-check">
                                    <CheckCircle size={14} />
                                  </span>
                                )}
                              </div>
                              <div className="checkout-address-name">{addr.name}</div>
                              <div className="checkout-address-phone">{addr.phone}</div>
                              <div className="checkout-address-details">{addr.address}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="pdp-checkout-group">
                    <label className="pdp-checkout-label">আপনার নাম (Full Name) <span>*</span></label>
                    <input 
                      type="text" 
                      className="pdp-checkout-input" 
                      placeholder="আপনার নাম লিখুন" 
                      required 
                      value={customerName} 
                      onChange={e => { setCustomerName(e.target.value); setNameEdited(true); setSelectedAddressId(''); }} 
                    />
                  </div>

                  <div className="pdp-checkout-group">
                    <label className="pdp-checkout-label">মোবাইল নম্বর (Phone Number) <span>*</span></label>
                    <input 
                      type="tel" 
                      className="pdp-checkout-input" 
                      placeholder="যেমন: ০১৭XXXXXXXX" 
                      required 
                      value={customerPhone} 
                      onChange={e => { setCustomerPhone(e.target.value); setPhoneEdited(true); setSelectedAddressId(''); }} 
                    />
                  </div>

                  <div className="pdp-checkout-group">
                    <label className="pdp-checkout-label">সম্পূর্ণ ডেলিভারি ঠিকানা (Detailed Address) <span>*</span></label>
                    <input 
                      type="text" 
                      className="pdp-checkout-input" 
                      placeholder="বাসা/হোল্ডিং নং, রোড নং, এলাকা, থানা ও জেলা লিখুন" 
                      required 
                      value={customerAddress} 
                      onChange={e => { setCustomerAddress(e.target.value); setAddressEdited(true); setSelectedAddressId(''); }} 
                    />
                  </div>

                  <div className="pdp-checkout-group">
                    <label className="pdp-checkout-label">অর্ডার সংক্রান্ত নোট (Optional Note)</label>
                    <input 
                      type="text" 
                      className="pdp-checkout-input" 
                      placeholder="অর্ডার সংক্রান্ত অতিরিক্ত তথ্য বা নির্দেশনা" 
                      value={customerNote} 
                      onChange={e => setCustomerNote(e.target.value)} 
                    />
                  </div>

                  {/* Step 3: Shipping & Payment */}
                  <div className="pdp-checkout-group">
                    <label className="pdp-checkout-label">ডেলিভারি চার্জ (Shipping Rate)</label>
                    <div className="pdp-checkout-shipping">
                      <div 
                        className={`pdp-checkout-card ${shippingLocation === 'dhaka' ? 'active' : ''}`}
                        onClick={() => setShippingLocation('dhaka')}
                      >
                        <div>
                          <div className="pdp-checkout-card-title">ঢাকার ভেতরে</div>
                          <div className="pdp-checkout-card-desc">৳{config.delivery.insideDhakaPrice} ({config.delivery.insideDhakaTimeline})</div>
                        </div>
                        {shippingLocation === 'dhaka' && <CheckCircle size={18} color="var(--sf-accent)" />}
                      </div>

                      <div 
                        className={`pdp-checkout-card ${shippingLocation === 'outside' ? 'active' : ''}`}
                        onClick={() => setShippingLocation('outside')}
                      >
                        <div>
                          <div className="pdp-checkout-card-title">ঢাকার বাইরে</div>
                          <div className="pdp-checkout-card-desc">৳{config.delivery.outsideDhakaPrice} ({config.delivery.outsideDhakaTimeline})</div>
                        </div>
                        {shippingLocation === 'outside' && <CheckCircle size={18} color="var(--sf-accent)" />}
                      </div>
                    </div>
                  </div>

                  <div className="pdp-checkout-group">
                    <label className="pdp-checkout-label">পেমেন্ট পদ্ধতি (Payment)</label>
                    <div className="pdp-checkout-card active" style={{ cursor: 'default' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                        <Package size={20} /> ক্যাশ অন ডেলিভারি (Cash on Delivery)
                      </span>
                    </div>
                  </div>

                  <button type="submit" className="pdp-checkout-btn-confirm">
                    অর্ডার নিশ্চিত করুন (Confirm Order) <ArrowRight size={18} />
                  </button>
                </form>
              </>
            ) : (
              <div className="pdp-checkout-success">
                <div className="pdp-checkout-success-icon">
                  <CheckCircle size={40} />
                </div>
                <h2>অর্ডার সফল হয়েছে!</h2>
                <p>ধন্যবাদ! আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে। খুব শীঘ্রই আমাদের প্রতিনিধি আপনার সাথে যোগাযোগ করে অর্ডারটি কনফার্ম করবে।</p>
                <button className="pdp-checkout-btn-confirm" onClick={closeCheckoutModal}>
                  ঠিক আছে (OK)
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Sticky Bottom Action Bar */}
      <div className="pdp-mobile-sticky-bar">
        <Link to="/" className="sticky-bar-icon-btn">
          <Store size={20} />
          <span>স্টোর</span>
        </Link>
        <button 
          type="button" 
          className="sticky-bar-icon-btn" 
          onClick={() => {
            setProductShared(false); // Reset session share status so they can share it
            setIsChatDrawerOpen(true);
          }}
        >
          <MessageCircle size={20} />
          <span>চ্যাট</span>
        </button>
        <div className="sticky-bar-actions">
          <button 
            type="button" 
            className="sticky-bar-btn buy-now" 
            onClick={() => {
              setBuyNowQty(1);
              setIsCheckoutOpen(true);
            }}
          >
            Buy Now
          </button>
          <button 
            type="button" 
            className="sticky-bar-btn add-to-cart" 
            onClick={() => addToCart(product)}
          >
            Add to Cart
          </button>
        </div>
      </div>

      {/* Live Support Chat Drawer */}
      {isChatDrawerOpen && (
        <div className="pdp-chat-drawer-overlay" onClick={() => setIsChatDrawerOpen(false)}>
          <div className="pdp-chat-drawer" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="pdp-chat-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>
                  {customer ? customer.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'G'}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>কাস্টমার চ্যাট সাপোর্ট</div>
                  <div style={{ fontSize: '0.72rem', opacity: 0.85 }}>Support Agent Online</div>
                </div>
              </div>
              <button onClick={() => setIsChatDrawerOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '4px' }}>
                <X size={18} />
              </button>
            </div>

            {customer ? (
              <>
                {/* Messages List */}
                <div className="pdp-chat-messages">
                  {chatMessages.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--sf-text-tertiary)', margin: 'auto' }}>
                      <MessageCircle size={40} style={{ opacity: 0.15, marginBottom: '12px', display: 'inline-block' }} />
                      <p style={{ fontWeight: 600, color: 'var(--sf-text-secondary)', fontSize: '0.85rem' }}>আপনার কোনো মেসেজ নেই</p>
                      <p style={{ fontSize: '0.75rem', marginTop: '4px' }}>এই পণ্যটি নিয়ে সরাসরি এডমিনের সাথে কথা বলতে নিচে মেসেজ করুন।</p>
                    </div>
                  ) : (
                    chatMessages.map((msg, idx) => {
                      const isAdmin = msg.sender === 'admin';
                      return (
                        <div 
                          key={idx} 
                          style={{ 
                            display: 'flex', 
                            justifyContent: isAdmin ? 'flex-start' : 'flex-end', 
                            width: '100%' 
                          }}
                        >
                          <div 
                            style={{ 
                              maxWidth: '75%', 
                              padding: '10px 14px', 
                              borderRadius: '14px', 
                              borderTopLeftRadius: isAdmin ? '2px' : '14px',
                              borderBottomRightRadius: isAdmin ? '14px' : '2px',
                              background: isAdmin ? '#e2e8f0' : 'linear-gradient(135deg, var(--sf-accent) 0%, var(--sf-accent-hover) 100%)', 
                              color: isAdmin ? '#1e293b' : 'white',
                              boxShadow: 'var(--sf-shadow-sm)',
                              position: 'relative'
                            }}
                          >
                            {msg.message.startsWith('PRODUCT_SHARE:') ? (
                              (() => {
                                try {
                                  const productInfo = JSON.parse(msg.message.substring(14));
                                  return (
                                    <Link 
                                      to={`/product/${productInfo.id}`} 
                                      onClick={() => setIsChatDrawerOpen(false)}
                                      style={{ 
                                        display: 'flex', 
                                        flexDirection: 'column', 
                                        gap: '6px', 
                                        textDecoration: 'none', 
                                        color: 'inherit',
                                        background: isAdmin ? 'rgba(0, 0, 0, 0.03)' : 'rgba(255, 255, 255, 0.15)',
                                        borderRadius: '8px',
                                        padding: '8px',
                                        width: '180px'
                                      }}
                                    >
                                      <img 
                                        src={productInfo.image} 
                                        alt={productInfo.name} 
                                        style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px' }} 
                                      />
                                      <div style={{ fontWeight: 700, fontSize: '0.7rem', color: isAdmin ? '#1e293b' : 'white', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                        {productInfo.name}
                                      </div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                                        <span style={{ fontWeight: 800, fontSize: '0.8rem', color: isAdmin ? '#1e293b' : 'white' }}>৳{productInfo.price}</span>
                                        <span style={{ fontSize: '8px', background: 'rgba(255,255,255,0.2)', padding: '1px 4px', borderRadius: '2px' }}>লিংক</span>
                                      </div>
                                    </Link>
                                  );
                                } catch (e) {
                                  return <div style={{ fontSize: '0.82rem', lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>{msg.message}</div>;
                                }
                              })()
                            ) : (
                              <div style={{ fontSize: '0.82rem', lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>{msg.message}</div>
                            )}
                            <div 
                              style={{ 
                                fontSize: '0.6rem', 
                                textAlign: 'right', 
                                marginTop: '4px', 
                                opacity: 0.6,
                                color: isAdmin ? '#64748b' : 'white'
                              }}
                            >
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Footer Input */}
                <div className="pdp-chat-footer">
                  {/* Share Product Hint */}
                  {!productShared && (
                    <div className="pdp-chat-product-preview-bar">
                      <img src={product.image} alt={product.name} />
                      <div className="pdp-chat-product-preview-bar-info">
                        {product.name}
                      </div>
                      <button 
                        type="button" 
                        className="pdp-chat-product-preview-bar-btn"
                        onClick={handleSendChatProductShare}
                      >
                        প্রোডাক্ট লিংক পাঠান
                      </button>
                    </div>
                  )}

                  <form onSubmit={handleSendChatMessage} className="pdp-chat-input-row">
                    <input 
                      type="text" 
                      className="pdp-chat-input" 
                      placeholder="মেসেজ লিখুন..." 
                      value={inputMessage}
                      onChange={e => setInputMessage(e.target.value)}
                    />
                    <button type="submit" className="pdp-chat-send-btn">
                      <Send size={16} />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              /* Quick Auth inside Chat Drawer */
              <div className="pdp-chat-auth-container">
                <div className="pdp-chat-auth-title">
                  {chatIsRegister ? 'নতুন অ্যাকাউন্ট খুলুন' : 'চ্যাট করতে লগইন করুন'}
                </div>
                <div className="pdp-chat-auth-desc">
                  এডমিনের সাথে সরাসরি কথা বলতে এবং আপনার মেসেজ ট্র্যাক করতে সাইন ইন করুন
                </div>

                {chatAuthError && (
                  <div style={{ background: '#fee2e2', color: '#ef4444', padding: '8px 12px', borderRadius: '6px', fontSize: '0.78rem' }}>
                    {chatAuthError}
                  </div>
                )}
                {chatAuthSuccess && (
                  <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '8px 12px', borderRadius: '6px', fontSize: '0.78rem' }}>
                    {chatAuthSuccess}
                  </div>
                )}

                <form onSubmit={handleChatAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {chatIsRegister && (
                    <>
                      <input 
                        type="text" 
                        required 
                        className="pdp-chat-auth-input" 
                        placeholder="আপনার নাম" 
                        value={chatAuthName}
                        onChange={e => setChatAuthName(e.target.value)}
                      />
                      <input 
                        type="tel" 
                        required 
                        className="pdp-chat-auth-input" 
                        placeholder="যেমন: ০১৭XXXXXXXX" 
                        value={chatAuthPhone}
                        onChange={e => setChatAuthPhone(e.target.value)}
                      />
                    </>
                  )}
                  <input 
                    type="email" 
                    required 
                    className="pdp-chat-auth-input" 
                    placeholder="ইমেইল ঠিকানা" 
                    value={chatAuthEmail}
                    onChange={e => setChatAuthEmail(e.target.value)}
                  />
                  <input 
                    type="password" 
                    required 
                    className="pdp-chat-auth-input" 
                    placeholder="পাসওয়ার্ড" 
                    value={chatAuthPassword}
                    onChange={e => setChatAuthPassword(e.target.value)}
                  />
                  <button type="submit" className="pdp-chat-auth-btn">
                    {chatIsRegister ? 'রেজিস্ট্রেশন করুন' : 'লগইন করুন'}
                  </button>
                </form>

                <div className="pdp-chat-auth-toggle">
                  {chatIsRegister ? (
                    <>
                      অলরেডি অ্যাকাউন্ট আছে?
                      <button onClick={() => { setChatIsRegister(false); setChatAuthError(''); }}>লগইন করুন</button>
                    </>
                  ) : (
                    <>
                      অ্যাকাউন্ট নেই?
                      <button onClick={() => { setChatIsRegister(true); setChatAuthError(''); }}>রেজিস্ট্রেশন করুন</button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
