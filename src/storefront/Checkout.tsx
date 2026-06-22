import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate, Link, useLocation } from 'react-router-dom';
import { Shield, Truck, RotateCcw, Headphones, User, MapPin, Package, CreditCard, CheckCircle, Zap, ArrowRight, Minus, Plus } from 'lucide-react';
import { storeProducts } from './data';
import { addOrder } from '../mock/data';
import { sendOrderToBackend } from '../services/api';
import { useStorefrontConfig } from '../store/storefrontConfig';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import './storefront-checkout.css';
import './storefront-account.css';

interface StorefrontContext {
  cart: { product: typeof storeProducts[0], quantity: number }[];
  cartTotal: number;
  clearCart?: () => void;
  updateQuantity: (productId: number, delta: number) => void;
}

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [config] = useStorefrontConfig();
  const { customer, updateCustomerPhone, updateCustomerProfile } = useCustomerAuth();
  
  const buyNowProduct = location.state?.product as typeof storeProducts[0] | undefined;
  const [buyNowQty, setBuyNowQty] = useState<number>(location.state?.quantity as number || 1);
  
  const { cart: contextCart, cartTotal: contextCartTotal, updateQuantity, clearCart } = useOutletContext<StorefrontContext>() || { cart: [], cartTotal: 0, updateQuantity: () => {} };
  
  const items = buyNowProduct ? [{ product: buyNowProduct, quantity: buyNowQty }] : (contextCart || []);
  const subtotal = buyNowProduct ? (buyNowProduct.price * buyNowQty) : (contextCartTotal || 0);
  
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [shippingLocation, setShippingLocation] = useState<'dhaka' | 'outside'>('dhaka');
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  
  const deliveryCharge = shippingLocation === 'dhaka' 
    ? config.delivery.insideDhakaPrice 
    : config.delivery.outsideDhakaPrice;
  const discount = 0;
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
          setSelectedAddressId(defaultAddr.id);
          setCustomerName(defaultAddr.name);
          setCustomerPhone(defaultAddr.phone);
          setCustomerAddress(defaultAddr.address);
          return;
        }
      }
      
      // Fallback if no saved address array is found
      if (!customerName) setCustomerName(customer.name || '');
      if (!customerPhone && customer.phone) setCustomerPhone(customer.phone);
      if (!customerAddress && customer.address) setCustomerAddress(customer.address);
    }
  }, [customer]);

  const handleSelectAddress = (addr: any) => {
    setSelectedAddressId(addr.id);
    setCustomerName(addr.name);
    setCustomerPhone(addr.phone);
    setCustomerAddress(addr.address);
  };

  const handleQuantityChange = (productId: number, delta: number) => {
    if (buyNowProduct && buyNowProduct.id === productId) {
      setBuyNowQty(prev => Math.max(1, prev + delta));
    } else {
      updateQuantity(productId, delta);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If customer is logged in, sync any modified fields back to their profile
    if (customer) {
      const needsUpdate = !customer.phone || !customer.address || customer.phone !== customerPhone || customer.address !== customerAddress || customer.name !== customerName;
      if (needsUpdate) {
        updateCustomerProfile({ name: customerName, phone: customerPhone, address: customerAddress });
      }
    }

    const orderData = {
      customer: customerName,
      email: customer?.email || customerPhone, // Use logged in email or fallback to phone
      amount: total,
      items: items.reduce((acc, item) => acc + item.quantity, 0),
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
      productsList: items.map(item => ({
        name: item.product.name,
        color: 'Default',
        size: 'Free Size',
        code: item.product.sku,
        quantity: item.quantity,
        price: item.product.price,
      })),
    };

    // Safely attempt backend sync
    await sendOrderToBackend(orderData);

    // Save locally for redundancy & to ensure local Admin panel functions properly
    addOrder(orderData);
    
    // Clear storefront cart if checkout succeeded
    if (clearCart && !buyNowProduct) {
      clearCart();
    }
    
    setIsSuccess(true);
  };

  if (items.length === 0 && !isSuccess) {
    return (
      <div className="checkout-container" style={{ textAlign: 'center', minHeight: '50vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2>আপনার কার্ট খালি! (Your Cart is Empty!)</h2>
        <p style={{ color: 'var(--sf-text-secondary)', marginBottom: '24px' }}>দয়া করে কিছু পণ্য যোগ করে আবার চেষ্টা করুন।</p>
        <Link to="/" className="btn-confirm" style={{ width: 'auto', padding: '0 32px' }}>শপিং চালিয়ে যান (Continue Shopping)</Link>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <h1>নিরাপদ অর্ডার ফরম (Secure Order Form)</h1>
        <p>অর্ডারটি সম্পন্ন করতে আপনার সঠিক তথ্য দিয়ে ফরমটি পূরণ করুন</p>
      </div>

      <form className="checkout-layout" onSubmit={handleSubmit}>
        
        {/* Step 1: Order Summary at the Top */}
        <div className="checkout-panel checkout-summary-panel">
          <h2 className="checkout-panel-title">
            <Package size={24} /> অর্ডারের সারসংক্ষেপ (Summary)
          </h2>
          
          <div className="summary-items">
            {items.map((item, idx) => (
              <div key={idx} className="summary-item">
                <img src={item.product.image} alt={item.product.name} className="summary-item-image" />
                <div className="summary-item-info">
                  <div className="summary-item-name">{item.product.name}</div>
                  <div className="summary-item-variant">রঙ: ডিফল্ট | সাইজ: ফ্রি সাইজ</div>
                  <div className="summary-item-price-row">
                    <div className="summary-item-price">৳{item.product.price}</div>
                    <div className="qty-control">
                      <button type="button" className="qty-btn" onClick={() => handleQuantityChange(item.product.id, -1)}>
                        <Minus size={12} />
                      </button>
                      <div className="qty-val">{item.quantity}</div>
                      <button type="button" className="qty-btn" onClick={() => handleQuantityChange(item.product.id, 1)}>
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="summary-totals">
            <div className="summary-row">
              <span>পণ্যের মূল্য (Subtotal)</span>
              <span>৳{subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>ডেলিভারি চার্জ (Shipping)</span>
              <span>৳{deliveryCharge.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="summary-row discount">
                <span>ডিসকাউন্ট (Discount)</span>
                <span>-৳{discount.toFixed(2)}</span>
              </div>
            )}
            <div className="summary-row total">
              <span>সর্বমোট (Total)</span>
              <span>৳{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Step 2: Customer Details */}
        <div className="checkout-panel">
          <h2 className="checkout-panel-title">
            <User size={20} /> কাস্টমার ও ডেলিভারি তথ্য (Delivery Details)
          </h2>

          {/* Quick-fill from saved addresses */}
          {customer && customer.addresses && customer.addresses.length > 0 && (
            <div className="checkout-saved-addresses-container">
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

          <div className="form-grid">
            <div className="form-group full-width">
              <label className="form-label">আপনার নাম (Full Name) <span>*</span></label>
              <input type="text" className="form-input" placeholder="আপনার নাম লিখুন" required value={customerName} onChange={(e) => { setCustomerName(e.target.value); setSelectedAddressId(''); }} />
            </div>
            
            <div className="form-group full-width">
              <label className="form-label">মোবাইল নম্বর (Phone Number) <span>*</span></label>
              <input type="tel" className="form-input" placeholder="যেমন: ০১৭XXXXXXXX" required value={customerPhone} onChange={(e) => { setCustomerPhone(e.target.value); setSelectedAddressId(''); }} />
            </div>

            <div className="form-group full-width">
              <label className="form-label">সম্পূর্ণ ডেলিভারি ঠিকানা (Detailed Address) <span>*</span></label>
              <input type="text" className="form-input" placeholder="বাসা/হোল্ডিং নং, রোড নং, এলাকা, থানা ও জেলা লিখুন" required value={customerAddress} onChange={(e) => { setCustomerAddress(e.target.value); setSelectedAddressId(''); }} />
            </div>

            <div className="form-group full-width">
              <label className="form-label">অর্ডার সংক্রান্ত নোট (Optional Note)</label>
              <input type="text" className="form-input" placeholder="অর্ডার সংক্রান্ত অতিরিক্ত তথ্য বা নির্দেশনা" value={customerNote} onChange={(e) => setCustomerNote(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Step 3: Shipping Charge & Payment Method */}
        <div className="checkout-panel">
          <div className="method-grid">
            <div>
              <h3 className="method-title">
                <Truck size={18} /> ডেলিভারি চার্জ (Shipping Rate)
              </h3>
              <div className="selection-row">
                <div className={`selection-card ${shippingLocation === 'dhaka' ? 'active' : ''}`} onClick={() => setShippingLocation('dhaka')}>
                  <div className="selection-card-content">
                    <div className="selection-card-title">ঢাকার ভেতরে</div>
                    <div className="selection-card-desc">৳{config.delivery.insideDhakaPrice} ({config.delivery.insideDhakaTimeline})</div>
                  </div>
                  {shippingLocation === 'dhaka' && <CheckCircle size={18} color="var(--sf-accent)" />}
                </div>
                <div className={`selection-card ${shippingLocation === 'outside' ? 'active' : ''}`} onClick={() => setShippingLocation('outside')}>
                  <div className="selection-card-content">
                    <div className="selection-card-title">ঢাকার বাইরে</div>
                    <div className="selection-card-desc">৳{config.delivery.outsideDhakaPrice} ({config.delivery.outsideDhakaTimeline})</div>
                  </div>
                  {shippingLocation === 'outside' && <CheckCircle size={18} color="var(--sf-accent)" />}
                </div>
              </div>
            </div>

            <div>
              <h3 className="method-title">
                <CreditCard size={18} /> পেমেন্ট পদ্ধতি (Payment)
              </h3>
              <div className="payment-card active">
                <Package size={22} />
                <span>ক্যাশ অন ডেলিভারি (Cash on Delivery)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 4: Submit Actions & Trust Badges */}
        <div className="checkout-actions-bottom" style={{ marginTop: '8px' }}>
          <button type="submit" className="btn-confirm" style={{ height: '52px', fontSize: '1.1rem' }}>
            অর্ডার নিশ্চিত করুন (Confirm Order) <ArrowRight size={20} />
          </button>
          
          <div className="trust-badges-grid" style={{ marginTop: '24px' }}>
            <div className="trust-badge-item"><Shield size={16} /> ১০০% নিরাপদ অর্ডার</div>
            <div className="trust-badge-item"><Truck size={16} /> দ্রুত ডেলিভারি</div>
            <div className="trust-badge-item"><RotateCcw size={16} /> সহজ রিটার্ন</div>
            <div className="trust-badge-item"><Headphones size={16} /> কাস্টমার সাপোর্ট</div>
          </div>
        </div>

      </form>

      {/* Success Modal */}
      {isSuccess && (
        <div className="success-modal-overlay">
          <div className="success-modal">
            <div className="success-icon">
              <CheckCircle size={48} />
            </div>
            <h2>অর্ডার সফল হয়েছে!</h2>
            <p>ধন্যবাদ! আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে। খুব শীঘ্রই আমাদের প্রতিনিধি আপনার সাথে যোগাযোগ করে অর্ডারটি কনফার্ম করবে।</p>
            <Link to="/" className="btn-confirm" style={{ textDecoration: 'none' }}>
              শপিং এ ফিরে যান (Go to Store)
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
