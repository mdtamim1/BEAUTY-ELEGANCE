import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate, Link, useLocation } from 'react-router-dom';
import { Shield, Truck, RotateCcw, Headphones, User, MapPin, Package, CreditCard, CheckCircle, Zap, ArrowRight, Minus, Plus } from 'lucide-react';
import { storeProducts } from './data';
import { addOrder } from '../mock/data';
import { sendOrderToBackend, validateCouponCode, updateProductInBackend } from '../services/api';
import { useStorefrontConfig } from '../store/storefrontConfig';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { SEOMeta } from '../components/layout/SEOMeta';
import './storefront-checkout.css';
import './storefront-account.css';

interface StorefrontContext {
  cart: { product: any, quantity: number }[];
  cartTotal: number;
  clearCart?: () => void;
  updateQuantity: (productId: number, sizeOrDelta: string | number, possibleDelta?: number) => void;
}

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [config, setConfig] = useStorefrontConfig();
  const { customer, updateCustomerPhone, updateCustomerProfile, addCustomerAddress } = useCustomerAuth();
  
  const buyNowProduct = location.state?.product as any;
  const [buyNowQty, setBuyNowQty] = useState<number>(location.state?.quantity as number || 1);
  
  const { cart: contextCart, cartTotal: contextCartTotal, updateQuantity, clearCart } = useOutletContext<StorefrontContext>() || { cart: [], cartTotal: 0, updateQuantity: () => {} };
  
  const items = buyNowProduct ? [{ product: buyNowProduct, quantity: buyNowQty }] : (contextCart || []);
  const subtotal = buyNowProduct ? (buyNowProduct.price * buyNowQty) : (contextCartTotal || 0);
  
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [shippingLocation, setShippingLocation] = useState<'dhaka' | 'outside'>('dhaka');
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | number>('');
  const [saveAddress, setSaveAddress] = useState(true);
  
  // Payment gateway states
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad'>('cod');
  const [senderNumber, setSenderNumber] = useState('');
  const [trxId, setTrxId] = useState('');

  // Coupon states
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  
  const [nameEdited, setNameEdited] = useState(false);
  const [phoneEdited, setPhoneEdited] = useState(false);
  const [addressEdited, setAddressEdited] = useState(false);
  const [emailEdited, setEmailEdited] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    
    if (!promoCodeInput.trim()) return;
    
    setIsValidating(true);
    const res = await validateCouponCode(promoCodeInput.trim());
    setIsValidating(false);
    
    if (res.status === 'success') {
      setAppliedCoupon(res.data);
      setCouponSuccess(`কুপন কোড '${res.data.code}' সফলভাবে যুক্ত হয়েছে!`);
    } else {
      setCouponError(res.message || 'কুপনটি প্রযোজ্য নয়।');
      setAppliedCoupon(null);
    }
  };
  
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setPromoCodeInput('');
    setCouponSuccess('');
    setCouponError('');
  };
  
  const deliveryCharge = shippingLocation === 'dhaka' 
    ? config.delivery.insideDhakaPrice 
    : config.delivery.outsideDhakaPrice;

  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percentage') {
      discount = (subtotal * appliedCoupon.value) / 100;
    } else {
      discount = appliedCoupon.value;
    }
  }
  
  const total = subtotal + deliveryCharge - discount;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Update form fields dynamically if customer logs in or state changes
  useEffect(() => {
    if (customer) {
      if (customer.addresses && customer.addresses.length > 0) {
        const defaultAddr = customer.addresses.find(a => a.isDefault) || customer.addresses[0];
        if (defaultAddr) {
          if (!selectedAddressId) {
            setSelectedAddressId(defaultAddr.id);
          }
          if (!nameEdited) setCustomerName(defaultAddr.name);
          if (!phoneEdited) setCustomerPhone(defaultAddr.phone);
          if (!addressEdited) setCustomerAddress(defaultAddr.address);
          if (!emailEdited) setCustomerEmail(customer.email || '');
          return;
        }
      }
      
      // Fallback if no saved address array is found
      if (!nameEdited) setCustomerName(customer.name || '');
      if (!phoneEdited) setCustomerPhone(customer.phone || '');
      if (!addressEdited) setCustomerAddress(customer.address || '');
      if (!emailEdited) setCustomerEmail(customer.email || '');
    }
  }, [customer, nameEdited, phoneEdited, addressEdited, emailEdited]);

  const handleSelectAddress = (addr: any) => {
    setSelectedAddressId(addr.id);
    setCustomerName(addr.name);
    setCustomerPhone(addr.phone);
    setCustomerAddress(addr.address);
    setNameEdited(true);
    setPhoneEdited(true);
    setAddressEdited(true);
  };

  const handleQuantityChange = (productId: number, size: string, delta: number) => {
    if (buyNowProduct && buyNowProduct.id === productId) {
      setBuyNowQty(prev => Math.max(1, prev + delta));
    } else {
      updateQuantity(productId, size, delta);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if ((paymentMethod === 'bkash' || paymentMethod === 'nagad') && (!senderNumber.trim() || !trxId.trim())) {
      alert('দয়া করে আপনার প্রেরকের বিকাশ/নগদ নম্বর এবং Transaction ID (TrxID) ইনপুট দিন।');
      return;
    }

    // If customer is logged in, sync any modified fields back to their profile
    if (customer) {
      const needsUpdate = !customer.phone || !customer.address || customer.phone !== customerPhone || customer.address !== customerAddress || customer.name !== customerName;
      if (needsUpdate) {
        updateCustomerProfile({ name: customerName, phone: customerPhone, address: customerAddress });
      }

      // Save address to profile if checked and not a duplicate
      if (saveAddress) {
        const isDuplicate = customer.addresses?.some(addr => 
          addr.name === customerName && 
          addr.phone === customerPhone && 
          addr.address === customerAddress
        );
        if (!isDuplicate) {
          addCustomerAddress({
            label: 'Shipping Address',
            name: customerName,
            phone: customerPhone,
            address: customerAddress,
            isDefault: !customer.addresses || customer.addresses.length === 0
          });
        }
      }
    }

    const formattedMemo = trxId ? `TrxID: ${trxId.toUpperCase()} | Sender: ${senderNumber}` : '';

    const orderData = {
      customer: customerName,
      email: customerEmail || customer?.email || customerPhone,
      amount: total,
      items: items.reduce((acc, item) => acc + item.quantity, 0),
      paymentMethod: paymentMethod === 'bkash' ? 'bKash (Send Money)' : paymentMethod === 'nagad' ? 'Nagad (Send Money)' : 'Cash on Delivery',
      storeName: config.branding.storeName || 'Tamim Global',
      phone: customerPhone,
      address: customerAddress,
      courier: shippingLocation === 'dhaka' ? 'Pathao (Dhaka)' : 'Pathao (Outside Dhaka)',
      city: shippingLocation === 'dhaka' ? 'Dhaka' : 'Outside Dhaka',
      thana: '',
      area: '',
      customerNote: customerNote,
      shopNote: '',
      paymentType: paymentMethod,
      memoNumber: formattedMemo,
      trxId: trxId.toUpperCase(),
      senderNumber: senderNumber,
      deliveryCharge: deliveryCharge,
      discount: discount,
      couponCode: appliedCoupon?.code || '',
      paidAmount: 0,
      subtotal: subtotal,
      productsList: items.map(item => ({
        name: item.product.name,
        color: 'Default',
        size: item.product.selectedSize || 'Free Size',
        code: item.product.sku,
        quantity: item.quantity,
        price: item.product.price,
      })),
    };

    // Safely attempt backend sync
    const success = await sendOrderToBackend(orderData);
    if (!success) {
      try {
        const pending = JSON.parse(localStorage.getItem('pending_sync_orders') || '[]');
        pending.push(orderData);
        localStorage.setItem('pending_sync_orders', JSON.stringify(pending));
      } catch (err) {
        console.error('Failed to queue offline order:', err);
      }
    }

    // Save locally for redundancy & to ensure local Admin panel functions properly
    addOrder(orderData);

    // Remove used coupon from customer account local cache & spin wheel storage
    if (appliedCoupon) {
      const cleanCode = appliedCoupon.code.trim().toUpperCase();
      try {
        const spinReward = localStorage.getItem('spin_win_reward');
        if (spinReward) {
          const parsed = JSON.parse(spinReward);
          if (parsed.code && parsed.code.trim().toUpperCase() === cleanCode) {
            localStorage.removeItem('spin_win_reward');
          }
        }
      } catch (e) {}

      if (customer && customer.email) {
        const cacheKey = `customer_coupons_${customer.email.trim().toLowerCase()}`;
        try {
          const stored = localStorage.getItem(cacheKey);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
              const updated = parsed.filter((c: any) => c.code.trim().toUpperCase() !== cleanCode);
              localStorage.setItem(cacheKey, JSON.stringify(updated));
            }
          }
        } catch (e) {}
      }
    }
    
    // Clear storefront cart if checkout succeeded
    if (clearCart && !buyNowProduct) {
      clearCart();
    }
    
    // Track Purchase in Facebook Meta Pixel
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'Purchase', {
        value: total,
        currency: 'BDT',
        content_ids: items.map(item => String(item.product.id)),
        content_type: 'product',
        num_items: items.reduce((sum, item) => sum + item.quantity, 0)
      });
    }
    
    setIsSuccess(true);
  };

  if (items.length === 0 && !isSuccess) {
    return (
      <div className="checkout-container" style={{ textAlign: 'center', minHeight: '50vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2>আপনার কার্ট খালি! (Your Cart is Empty!)</h2>
        <p style={{ color: 'var(--sf-text-secondary)', marginBottom: '24px' }}>দয়া করে কিছু পণ্য যোগ করে আবার চেষ্টা করুন।</p>
        <Link to="/" className="btn-confirm" style={{ width: 'auto', padding: '0 32px', textDecoration: 'none' }}>শপিং চালিয়ে যান (Continue Shopping)</Link>
      </div>
    );
  }

  return (
    <div className="checkout-container" style={{ display: 'flex', justifyContent: 'center', padding: '40px 16px' }}>
      <SEOMeta
        title="Secure Checkout - Tamim Global"
        description="Complete your order securely at Tamim Global. Cash on delivery available nationwide."
        slug="checkout"
        noindex={true}
      />
      
      <div className="pdp-checkout-modal" style={{ maxWidth: '640px', background: '#f8fafc', width: '100%', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
        {/* Modal Header */}
        <div className="pco-header">
          <div className="pco-header-left">
            <div className="pco-header-icon">
              <Shield size={18} />
            </div>
            <div>
              <div className="pco-header-title">Secure Order Form</div>
              <div className="pco-header-sub">SSL সুরক্ষিত · নিরাপদ পেমেন্ট</div>
            </div>
          </div>
        </div>

        {!isSuccess ? (
          <form className="pco-form" onSubmit={handleSubmit} style={{ overflowY: 'visible', paddingBottom: '32px' }}>
            
            {/* ── PRODUCT SUMMARY CARD ── */}
            <div className="pco-section">
              <div className="pco-section-label">
                <span className="pco-step-badge">১</span>
                অর্ডার সামারি
              </div>
              
              {items.map((item, idx) => (
                <div key={idx} className="pco-product-card">
                  <img src={item.product.image} alt={item.product.name} className="pco-product-img" />
                  <div className="pco-product-info">
                    <div className="pco-product-name">{item.product.name}</div>
                    <div className="pco-product-variant">সাইজ: {item.product.selectedSize || 'ফ্রি সাইজ'}</div>
                    <div className="pco-product-price-row">
                      <span className="pco-product-price">৳{item.product.price}</span>
                    </div>
                  </div>
                  <div className="pco-qty-block">
                    <button type="button" className="pco-qty-btn" onClick={() => handleQuantityChange(item.product.id, item.product.selectedSize || 'Free Size', -1)}>−</button>
                    <span className="pco-qty-val">{item.quantity}</span>
                    <button type="button" className="pco-qty-btn" onClick={() => handleQuantityChange(item.product.id, item.product.selectedSize || 'Free Size', 1)}>+</button>
                  </div>
                </div>
              ))}

              {/* Price Breakdown */}
              <div className="pco-price-breakdown">
                <div className="pco-price-row">
                  <span>পণ্যের মূল্য (Subtotal)</span>
                  <span>৳{subtotal.toFixed(2)}</span>
                </div>
                <div className="pco-price-row">
                  <span>ডেলিভারি চার্জ</span>
                  <span>৳{deliveryCharge.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="pco-price-row discount">
                    <span>🎟 কুপন ছাড়</span>
                    <span>-৳{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="pco-price-row total">
                  <span>সর্বমোট</span>
                  <span className="pco-total-amount">৳{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Coupon Block */}
              <div className="pco-coupon-block">
                <div className="pco-coupon-label">🎟 প্রোমো কোড</div>
                {appliedCoupon ? (
                  <div className="pco-coupon-applied">
                    <span>✅ '{appliedCoupon.code}' ({appliedCoupon.type === 'percentage' ? `${appliedCoupon.value}%` : `৳${appliedCoupon.value}`} ছাড়)</span>
                    <button type="button" onClick={handleRemoveCoupon}>✕ সরান</button>
                  </div>
                ) : (
                  <div className="pco-coupon-input-row">
                    <input
                      type="text"
                      placeholder="কোড লিখুন (যেমন: SAVE20)"
                      value={promoCodeInput}
                      onChange={e => setPromoCodeInput(e.target.value)}
                      className="pco-input"
                      style={{ textTransform: 'uppercase' }}
                    />
                    <button
                      type="button"
                      className="pco-coupon-apply-btn"
                      disabled={isValidating}
                      onClick={handleApplyCoupon}
                    >
                      {isValidating ? '...' : 'প্রয়োগ'}
                    </button>
                  </div>
                )}
                {couponError && <div className="pco-coupon-error">{couponError}</div>}
                {couponSuccess && <div className="pco-coupon-success">{couponSuccess}</div>}
              </div>
            </div>

            {/* ── CUSTOMER INFO ── */}
            <div className="pco-section">
              <div className="pco-section-label">
                <span className="pco-step-badge">২</span>
                আপনার তথ্য
              </div>

              {/* Saved Address Quick Fill */}
              {customer && customer.addresses && customer.addresses.length > 0 && (
                <div className="pco-saved-addresses">
                  <div className="pco-saved-addr-title">
                    <MapPin size={14} /> সংরক্ষিত ঠিকানা
                  </div>
                  <div className="pco-addr-list">
                    {customer.addresses.map((addr) => {
                      const isSelected = String(selectedAddressId) === String(addr.id);
                      return (
                        <div
                          key={addr.id}
                          className={`pco-addr-card ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleSelectAddress(addr)}
                        >
                          <div className="pco-addr-label">{addr.label}</div>
                          <div className="pco-addr-name">{addr.name}</div>
                          <div className="pco-addr-phone">{addr.phone}</div>
                          <div className="pco-addr-detail">{addr.address}</div>
                          {isSelected && <div className="pco-addr-check"><CheckCircle size={14} /></div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="pco-fields-grid">
                <div className="pco-field">
                  <label className="pco-label">পূর্ণ নাম <span>*</span></label>
                  <input
                    type="text"
                    className="pco-input"
                    placeholder="আপনার পূর্ণ নাম লিখুন"
                    required
                    value={customerName}
                    onChange={e => { setCustomerName(e.target.value); setNameEdited(true); setSelectedAddressId(''); }}
                  />
                </div>
                <div className="pco-field">
                  <label className="pco-label">মোবাইল নম্বর <span>*</span></label>
                  <input
                    type="tel"
                    className="pco-input"
                    placeholder="০১৭XXXXXXXX"
                    required
                    value={customerPhone}
                    onChange={e => { setCustomerPhone(e.target.value); setPhoneEdited(true); setSelectedAddressId(''); }}
                  />
                </div>
                <div className="pco-field pco-field-full">
                  <label className="pco-label">সম্পূর্ণ ঠিকানা <span>*</span></label>
                  <input
                    type="text"
                    className="pco-input"
                    placeholder="বাসা, রোড, এলাকা, থানা, জেলা"
                    required
                    value={customerAddress}
                    onChange={e => { setCustomerAddress(e.target.value); setAddressEdited(true); setSelectedAddressId(''); }}
                  />
                </div>
                <div className="pco-field pco-field-full">
                  <label className="pco-label">ইমেইল ঠিকানা <span style={{ color: '#a1a1aa', fontWeight: 500 }}>(ঐচ্ছিক - Gmail/Email)</span></label>
                  <input
                    type="email"
                    className="pco-input"
                    placeholder="আপনার ইমেইল অ্যাড্রেস লিখুন"
                    value={customerEmail}
                    onChange={e => { setCustomerEmail(e.target.value); setEmailEdited(true); }}
                  />
                </div>
                <div className="pco-field pco-field-full">
                  <label className="pco-label">অর্ডার নোট <span style={{ color: '#a1a1aa', fontWeight: 500 }}>(ঐচ্ছিক)</span></label>
                  <input
                    type="text"
                    className="pco-input"
                    placeholder="বিশেষ নির্দেশনা বা মন্তব্য..."
                    value={customerNote}
                    onChange={e => setCustomerNote(e.target.value)}
                  />
                </div>
                
                {customer && (
                  <div className="pco-field pco-field-full" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                    <input 
                      type="checkbox" 
                      id="saveAddressCheckbox" 
                      checked={saveAddress} 
                      onChange={(e) => setSaveAddress(e.target.checked)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#111' }}
                    />
                    <label htmlFor="saveAddressCheckbox" style={{ cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700, color: '#3f3f46', userSelect: 'none' }}>
                      ভবিষ্যতে ব্যবহারের জন্য এই ঠিকানাটি সেভ করে রাখুন (Save address to profile)
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* ── DELIVERY ZONE ── */}
            <div className="pco-section">
              <div className="pco-section-label">
                <span className="pco-step-badge">৩</span>
                ডেলিভারি এলাকা
              </div>
              <div className="pco-delivery-grid">
                <div
                  className={`pco-delivery-card ${shippingLocation === 'dhaka' ? 'active' : ''}`}
                  onClick={() => setShippingLocation('dhaka')}
                >
                  <div className="pco-delivery-icon">🏙️</div>
                  <div className="pco-delivery-info">
                    <div className="pco-delivery-title">ঢাকার ভেতরে</div>
                    <div className="pco-delivery-detail">৳{config.delivery.insideDhakaPrice} · {config.delivery.insideDhakaTimeline}</div>
                  </div>
                  {shippingLocation === 'dhaka' && <CheckCircle size={18} className="pco-delivery-check" />}
                </div>
                <div
                  className={`pco-delivery-card ${shippingLocation === 'outside' ? 'active' : ''}`}
                  onClick={() => setShippingLocation('outside')}
                >
                  <div className="pco-delivery-icon">🚚</div>
                  <div className="pco-delivery-info">
                    <div className="pco-delivery-title">ঢাকার বাইরে</div>
                    <div className="pco-delivery-detail">৳{config.delivery.outsideDhakaPrice} · {config.delivery.outsideDhakaTimeline}</div>
                  </div>
                  {shippingLocation === 'outside' && <CheckCircle size={18} className="pco-delivery-check" />}
                </div>
              </div>
            </div>

            {/* ── PAYMENT METHOD ── */}
            <div className="pco-section">
              <div className="pco-section-label">
                <span className="pco-step-badge">৪</span>
                পেমেন্ট পদ্ধতি
              </div>
              <div className="pco-payment-grid">
                {/* COD */}
                <div
                  className={`pco-payment-card ${paymentMethod === 'cod' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('cod')}
                >
                  <div className="pco-payment-icon cod">📦</div>
                  <div className="pco-payment-info">
                    <div className="pco-payment-title">ক্যাশ অন ডেলিভারি</div>
                    <div className="pco-payment-sub">পণ্য পেয়ে টাকা দিন</div>
                  </div>
                  {paymentMethod === 'cod' && <div className="pco-payment-radio active" />}
                </div>

                {/* bKash */}
                <div
                  className={`pco-payment-card ${paymentMethod === 'bkash' ? 'active bkash-active' : ''}`}
                  onClick={() => setPaymentMethod('bkash')}
                >
                  <div className="pco-payment-icon bkash">
                    <span style={{ background: '#e11d48', color: 'white', fontWeight: 900, fontSize: '11px', padding: '3px 6px', borderRadius: '4px', letterSpacing: '0.5px' }}>bKash</span>
                  </div>
                  <div className="pco-payment-info">
                    <div className="pco-payment-title" style={{ color: '#e11d48' }}>বিকাশ</div>
                    <div className="pco-payment-sub">Send Money করুন</div>
                  </div>
                  {paymentMethod === 'bkash' && <div className="pco-payment-radio active bkash-radio" />}
                </div>

                {/* Nagad */}
                <div
                  className={`pco-payment-card ${paymentMethod === 'nagad' ? 'active nagad-active' : ''}`}
                  onClick={() => setPaymentMethod('nagad')}
                >
                  <div className="pco-payment-icon nagad">
                    <span style={{ background: '#ea580c', color: 'white', fontWeight: 900, fontSize: '11px', padding: '3px 6px', borderRadius: '4px', letterSpacing: '0.5px' }}>NAGAD</span>
                  </div>
                  <div className="pco-payment-info">
                    <div className="pco-payment-title" style={{ color: '#ea580c' }}>নগদ</div>
                    <div className="pco-payment-sub">Send Money করুন</div>
                  </div>
                  {paymentMethod === 'nagad' && <div className="pco-payment-radio active nagad-radio" />}
                </div>
              </div>

              {/* bKash / Nagad Instructions */}
              {(paymentMethod === 'bkash' || paymentMethod === 'nagad') && (
                <div className={`pco-mobile-banking-panel ${paymentMethod}`}>
                  <div className="pco-mb-header">
                    <span className="pco-mb-brand-tag" style={{ background: paymentMethod === 'bkash' ? '#e11d48' : '#ea580c' }}>
                      {paymentMethod === 'bkash' ? 'bKash' : 'NAGAD'}
                    </span>
                    <span className="pco-mb-title">পেমেন্ট নির্দেশিকা</span>
                  </div>
                  <div className="pco-mb-steps">
                    <div className="pco-mb-step">
                      <span className="pco-mb-step-num" style={{ background: paymentMethod === 'bkash' ? '#e11d48' : '#ea580c' }}>১</span>
                      <span>নম্বরে Send Money করুন: <strong style={{ color: paymentMethod === 'bkash' ? '#e11d48' : '#ea580c' }}>{paymentMethod === 'bkash' ? '01700000000' : '01800000000'}</strong></span>
                    </div>
                    <div className="pco-mb-step">
                      <span className="pco-mb-step-num" style={{ background: paymentMethod === 'bkash' ? '#e11d48' : '#ea580c' }}>২</span>
                      <span>পরিমাণ: <strong>৳{total.toFixed(2)}</strong></span>
                    </div>
                    <div className="pco-mb-step">
                      <span className="pco-mb-step-num" style={{ background: paymentMethod === 'bkash' ? '#e11d48' : '#ea580c' }}>৩</span>
                      <span>পেমেন্টের পরে নিচে TrxID ও নম্বর দিন</span>
                    </div>
                  </div>
                  <div className="pco-fields-grid" style={{ marginTop: '12px' }}>
                    <div className="pco-field">
                      <label className="pco-label">প্রেরকের নম্বর <span>*</span></label>
                      <input
                        type="tel"
                        className="pco-input"
                        placeholder="০১৭XXXXXXXX"
                        required
                        value={senderNumber}
                        onChange={e => setSenderNumber(e.target.value)}
                      />
                    </div>
                    <div className="pco-field">
                      <label className="pco-label">TrxID কোড <span>*</span></label>
                      <input
                        type="text"
                        className="pco-input"
                        placeholder="8N7X9K2L1"
                        required
                        value={trxId}
                        onChange={e => setTrxId(e.target.value.toUpperCase())}
                        style={{ textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── SUBMIT BUTTON ── */}
            <div className="pco-submit-section">
              <div className="pco-trust-strip">
                <span>🔒 SSL সুরক্ষিত</span>
                <span>✅ ১০০% নিরাপদ</span>
                <span>📦 দ্রুত ডেলিভারি</span>
              </div>
              <button type="submit" className="pco-submit-btn">
                <span>⚡ অর্ডার নিশ্চিত করুন</span>
                <ArrowRight size={18} />
              </button>
            </div>

          </form>
        ) : (
          /* ── SUCCESS STATE ── */
          <div className="pco-success">
            <div className="pco-success-animation">
              <div className="pco-success-ring"></div>
              <CheckCircle size={48} className="pco-success-icon" />
            </div>
            <h2 className="pco-success-title">অর্ডার সফল হয়েছে! 🎉</h2>
            <p className="pco-success-msg">ধন্যবাদ! আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে। শীঘ্রই আমাদের প্রতিনিধি আপনার সাথে যোগাযোগ করবে।</p>
            <div className="pco-success-detail">অর্ডার নম্বর: <strong>#{Date.now().toString().slice(-8)}</strong></div>
            <button className="pco-submit-btn" onClick={() => navigate('/')}>
              ✓ ঠিক আছে
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
