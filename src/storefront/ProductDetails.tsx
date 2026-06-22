import { useState, useEffect } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';
import { ShoppingCart, Heart, Share2, Star, CheckCircle, Shield, Truck, RotateCcw, ChevronRight, Smartphone, Phone, MessageCircle, X, User, MapPin, Package, CreditCard, ArrowRight, Minus, Plus, Headphones } from 'lucide-react';
import { useStorefrontConfig } from '../store/storefrontConfig';
import { addOrder } from '../mock/data';
import { sendOrderToBackend, fetchProductByIdFromBackend } from '../services/api';
import './storefront-pdp.css';
import './storefront-checkout.css';

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
  
  // Checkout Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [shippingLocation, setShippingLocation] = useState<'dhaka' | 'outside'>('dhaka');
  const [buyNowQty, setBuyNowQty] = useState<number>(1);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const deliveryCharge = shippingLocation === 'dhaka' 
      ? config.delivery.insideDhakaPrice 
      : config.delivery.outsideDhakaPrice;
    const subtotal = product.price * buyNowQty;
    const discount = 0;
    const total = subtotal + deliveryCharge - discount;

    const orderData = {
      customer: customerName,
      email: customerPhone,
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
                  <div className="pdp-checkout-group">
                    <label className="pdp-checkout-label">আপনার নাম (Full Name) <span>*</span></label>
                    <input 
                      type="text" 
                      className="pdp-checkout-input" 
                      placeholder="আপনার নাম লিখুন" 
                      required 
                      value={customerName} 
                      onChange={e => setCustomerName(e.target.value)} 
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
                      onChange={e => setCustomerPhone(e.target.value)} 
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
                      onChange={e => setCustomerAddress(e.target.value)} 
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
    </div>
  );
}
