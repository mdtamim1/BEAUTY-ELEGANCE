import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';
import { ShoppingCart, Heart, Share2, Star, CheckCircle, Shield, Truck, RotateCcw, ChevronLeft, ChevronRight, Smartphone, Phone, MessageCircle, X, User, MapPin, Package, CreditCard, ArrowRight, Minus, Plus, Headphones, Store, Send, Eye, Maximize2, ZoomIn } from 'lucide-react';
import { useStorefrontConfig } from '../store/storefrontConfig';
import { addOrder } from '../mock/data';
import { sendOrderToBackend, fetchProductByIdFromBackend, fetchChatHistory, validateCouponCode, fetchCampaignsFromBackend } from '../services/api';
import { resolveProductWithCampaign } from '../utils/productCampaignResolver';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { OptimizedImage } from '../components/layout/OptimizedImage';
import { SEOMeta } from '../components/layout/SEOMeta';
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
  const [config, setConfig] = useStorefrontConfig();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  
  const { customer, login, register, loginWithGmail, updateCustomerProfile } = useCustomerAuth();
  
  // Checkout Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad'>('cod');
  const [senderNumber, setSenderNumber] = useState('');
  const [trxId, setTrxId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [shippingLocation, setShippingLocation] = useState<'dhaka' | 'outside'>('dhaka');
  const [buyNowQty, setBuyNowQty] = useState<number>(1);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');

  const [nameEdited, setNameEdited] = useState(false);
  const [phoneEdited, setPhoneEdited] = useState(false);
  const [addressEdited, setAddressEdited] = useState(false);
  const [emailEdited, setEmailEdited] = useState(false);

  // Coupon states
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isValidating, setIsValidating] = useState(false);

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

  // Review Form states
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerRating, setReviewerRating] = useState(5);
  const [reviewerComment, setReviewerComment] = useState('');
  const [reviewerImage, setReviewerImage] = useState<string>(''); // Base64 string
  const [reviewMsg, setReviewMsg] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Live Viewing Counter Fluctuation Effect based on Admin liveViewConfig
  const liveViewConfig = config.liveViewConfig || {
    enabled: true,
    presetRange: '30-50',
    customMin: 30,
    customMax: 85,
    updateIntervalSeconds: 4,
  };

  const getRangeBounds = () => {
    const range = liveViewConfig.presetRange || '30-50';
    if (range === '0-20') return { min: 5, max: 20 };
    if (range === '0-30') return { min: 8, max: 30 };
    if (range === '30-50') return { min: 30, max: 50 };
    if (range === '50-70') return { min: 50, max: 70 };
    if (range === 'custom') {
      const min = Math.max(0, liveViewConfig.customMin ?? 30);
      const max = Math.max(min + 1, liveViewConfig.customMax ?? 85);
      return { min, max };
    }
    return { min: 30, max: 50 };
  };

  const [liveViewersCount, setLiveViewersCount] = useState<number>(() => {
    const { min, max } = getRangeBounds();
    return Math.floor(Math.random() * (max - min + 1)) + min;
  });

  useEffect(() => {
    if (liveViewConfig.enabled === false) return;
    const interval = setInterval(() => {
      const { min, max } = getRangeBounds();
      setLiveViewersCount(prev => {
        const delta = Math.floor(Math.random() * 7) - 3;
        const nextVal = prev + delta;
        if (nextVal < min) return min + Math.floor(Math.random() * 3);
        if (nextVal > max) return max - Math.floor(Math.random() * 3);
        return nextVal;
      });
    }, (liveViewConfig.updateIntervalSeconds || 4) * 1000);

    return () => clearInterval(interval);
  }, [liveViewConfig.presetRange, liveViewConfig.customMin, liveViewConfig.customMax, liveViewConfig.enabled]);

  // Accordion open states for SPLAYD PDP layout
  const [accordionOpen, setAccordionOpen] = useState<{ description: boolean; additional: boolean; reviews: boolean }>({
    description: true,
    additional: false,
    reviews: false,
  });

  const toggleAccordion = (key: 'description' | 'additional' | 'reviews') => {
    setAccordionOpen(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewerComment.trim()) {
      setReviewError('দয়া করে আপনার নাম এবং মতামত সঠিকভাবে লিখুন।');
      return;
    }

    const newReview = {
      id: Date.now(),
      user: reviewerName.trim(),
      rating: reviewerRating,
      date: new Date().toISOString(),
      comment: reviewerComment.trim(),
      helpful: 0,
      image: reviewerImage || undefined
    };

    // Calculate new stats
    const updatedReviews = [...(product.customerReviews || []), newReview];
    const newAverageRating = Number((updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length).toFixed(1));

    // Update in config.products
    const updatedProducts = config.products.map((p: any) => {
      if (String(p.id) === String(product.id)) {
        return {
          ...p,
          customerReviews: updatedReviews,
          reviews: updatedReviews.length,
          rating: newAverageRating
        };
      }
      return p;
    });

    // Save configuration reactively and sync with SQLite
    setConfig({
      ...config,
      products: updatedProducts
    });

    // Update local state product immediately
    setProduct((prev: any) => ({
      ...prev,
      customerReviews: updatedReviews,
      reviews: updatedReviews.length,
      rating: newAverageRating
    }));

    // Reset Form & Show Success Message
    setReviewerName('');
    setReviewerRating(5);
    setReviewerComment('');
    setReviewerImage('');
    setReviewError('');
    setReviewMsg('আপনার রিভিউটি সফলভাবে সাবমিট করা হয়েছে! ধন্যবাদ।');

    // Dismiss message after 5 seconds
    setTimeout(() => {
      setReviewMsg('');
    }, 5000);
  };

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatDrawerOpen]);

  // Initialize and render Google Identity Services Button in Chat Drawer
  useEffect(() => {
    if (isChatDrawerOpen && !customer) {
      const initGsi = () => {
        // @ts-ignore
        if (window.google?.accounts?.id) {
          // @ts-ignore
          window.google.accounts.id.initialize({
            client_id: "284151905011-fs0mh1j6rdug41p2hk882bjl1vq9nmb2.apps.googleusercontent.com",
            callback: (response: any) => {
              loginWithGmail(response.credential);
            }
          });
          const btnElem = document.getElementById("google-chat-signin-btn");
          if (btnElem) {
            // @ts-ignore
            window.google.accounts.id.renderButton(
              btnElem,
              { theme: "outline", size: "large", width: btnElem.clientWidth || 300 }
            );
          }
        }
      };

      initGsi();
      const timer = setTimeout(initGsi, 1000);
      return () => clearTimeout(timer);
    }
  }, [isChatDrawerOpen, customer]);

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
        const wsHost = isLocalDev ? 'localhost:5000' : 'api.tamimglobal.com';
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
    const subtotal = effectivePrice * buyNowQty;
    
    let discount = 0;
    if (appliedCoupon) {
      if (appliedCoupon.type === 'percentage') {
        discount = (subtotal * appliedCoupon.value) / 100;
      } else {
        discount = appliedCoupon.value;
      }
    }
    
    const total = subtotal + deliveryCharge - discount;

    if ((paymentMethod === 'bkash' || paymentMethod === 'nagad') && (!senderNumber.trim() || !trxId.trim())) {
      alert('দয়া করে আপনার প্রেরকের বিকাশ/নগদ নম্বর এবং Transaction ID (TrxID) ইনপুট দিন।');
      return;
    }

    const formattedMemo = trxId ? `TrxID: ${trxId.toUpperCase()} | Sender: ${senderNumber}` : '';

    const orderData = {
      customer: customerName,
      email: customerEmail || customer?.email || '',
      amount: total,
      items: buyNowQty,
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
      productsList: [{
        name: product.name,
        color: 'Default',
        size: selectedSize || 'Free Size',
        code: product.sku,
        quantity: buyNowQty,
        price: effectivePrice,
      }],
    };

    // Safely sync to backend SQLite database
    await sendOrderToBackend(orderData);

    // Save locally for redundancy & to ensure local Admin panel functions properly
    addOrder(orderData);

    // Track Purchase in Facebook Meta Pixel
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'Purchase', {
        value: total,
        currency: 'BDT',
        content_ids: [String(product.id)],
        content_type: 'product',
        num_items: buyNowQty
      });
    }

    setCheckoutSuccess(true);
  };

  const closeCheckoutModal = () => {
    setIsCheckoutOpen(false);
    setCheckoutSuccess(false);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setCustomerEmail('');
    setCustomerNote('');
    setPaymentMethod('cod');
    setSenderNumber('');
    setTrxId('');
    setBuyNowQty(1);
    setSelectedSize('');
    setSelectedAddressId('');
    setNameEdited(false);
    setPhoneEdited(false);
    setAddressEdited(false);
    setEmailEdited(false);
    setPromoCodeInput('');
    setAppliedCoupon(null);
    setCouponSuccess('');
    setCouponError('');
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
          if (!emailEdited) setCustomerEmail(customer.email || '');
          return;
        }
      }
      
      // Fallback to customer profile primary details
      if (!nameEdited) setCustomerName(customer.name || '');
      if (!phoneEdited) setCustomerPhone(customer.phone || '');
      if (!addressEdited) setCustomerAddress(customer.address || '');
      if (!emailEdited) setCustomerEmail(customer.email || '');
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
      
      // Try to find the product in local config first for instant loading
      const localProduct = config.products.find(p => String(p.id) === String(id));
      if (localProduct) {
        let reviewsList = localProduct.customerReviews || [];
        
        // Local storage reviews
        try {
          const storedReviews = localStorage.getItem(`product_reviews_${id}`);
          if (storedReviews) {
            const parsed = JSON.parse(storedReviews);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const merged = [...parsed];
              reviewsList.forEach((r: any) => {
                if (!merged.some(m => m.id === r.id)) merged.push(r);
              });
              reviewsList = merged;
            }
          }
        } catch (e) {}

        // Fallback sample reviews if empty so customer reviews section is never blank
        if (reviewsList.length === 0) {
          reviewsList = [
            {
              id: 101,
              user: 'ফারহানা শারমিন',
              rating: 5,
              date: new Date(Date.now() - 3 * 86400000).toISOString(),
              comment: 'প্রোডাক্টটি অসাধারণ! ছবি ও ডেসক্রিপশনের সাথে ১০০% হুবহু মিল পেয়েছি। প্যাকেজিংও খুব সুন্দর ছিল।',
              helpful: 0
            },
            {
              id: 102,
              user: 'তানজিনা আক্তার',
              rating: 5,
              date: new Date(Date.now() - 7 * 86400000).toISOString(),
              comment: 'খুবই প্রিমিয়াম কোয়ালিটি। ১ দিনের মধ্যেই ডেলিভারি পেয়েছি। ধন্যবাদ বিউটি অ্যান্ড এলিগেন্স!',
              helpful: 0
            }
          ];
        }

        let activeCamps: any[] = [];
        try {
          const campaignsData = await fetchCampaignsFromBackend();
          if (campaignsData) {
            activeCamps = campaignsData.filter((c: any) => c.status === 'active');
          }
        } catch (err) {}

        const finalProduct = {
          ...localProduct,
          customerReviews: reviewsList,
          reviews: reviewsList.length
        };

        const resolvedProduct = resolveProductWithCampaign(finalProduct, activeCamps);

        setProduct(resolvedProduct);
        setActiveImage(resolvedProduct.gallery?.[0] || resolvedProduct.image);
        setLoading(false);
      } else {
        // If not found in local cache, show skeleton loader
        setLoading(true);
      }

      window.scrollTo(0, 0);
      
      let activeCamps: any[] = [];
      try {
        const campaignsData = await fetchCampaignsFromBackend();
        if (campaignsData) {
          activeCamps = campaignsData.filter((c: any) => c.status === 'active');
        }
      } catch (err) {}

      const dbProduct = await fetchProductByIdFromBackend(id);
      if (!active) return;

      if (dbProduct) {
        let reviewsList = dbProduct.customerReviews || [];
        if (reviewsList.length === 0) {
          const configFound = config.products.find(p => String(p.id) === String(id));
          if (configFound && configFound.customerReviews && configFound.customerReviews.length > 0) {
            reviewsList = configFound.customerReviews;
          }
        }

        // Local storage reviews
        try {
          const storedReviews = localStorage.getItem(`product_reviews_${id}`);
          if (storedReviews) {
            const parsed = JSON.parse(storedReviews);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const merged = [...parsed];
              reviewsList.forEach((r: any) => {
                if (!merged.some(m => m.id === r.id)) merged.push(r);
              });
              reviewsList = merged;
            }
          }
        } catch (e) {}

        // Fallback sample reviews if empty so customer reviews section is never blank
        if (reviewsList.length === 0) {
          reviewsList = [
            {
              id: 101,
              user: 'ফারহানা শারমিন',
              rating: 5,
              date: new Date(Date.now() - 3 * 86400000).toISOString(),
              comment: 'প্রোডাক্টটি অসাধারণ! ছবি ও ডেসক্রিপশনের সাথে ১০০% হুবহু মিল পেয়েছি। প্যাকেজিংও খুব সুন্দর ছিল।',
              helpful: 0
            },
            {
              id: 102,
              user: 'তানজিনা আক্তার',
              rating: 5,
              date: new Date(Date.now() - 7 * 86400000).toISOString(),
              comment: 'খুবই প্রিমিয়াম কোয়ালিটি। ১ দিনের মধ্যেই ডেলিভারি পেয়েছি। ধন্যবাদ বিউটি অ্যান্ড এলিগেন্স!',
              helpful: 0
            }
          ];
        }

        const finalProduct = resolveProductWithCampaign({
          ...dbProduct,
          customerReviews: reviewsList,
          reviews: reviewsList.length
        }, activeCamps);

        setProduct(finalProduct);
        setActiveImage(prev => {
          if (!prev || !finalProduct.gallery?.includes(prev)) {
            return finalProduct.gallery?.[0] || finalProduct.image;
          }
          return prev;
        });
        setLoading(false);
      } else if (!localProduct) {
        setProduct(null);
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

  const effectivePrice = product.campaignOfferPrice || product.price;

  return (
    <div className="splayd-pdp-container">
      <SEOMeta 
        title={`${product.name} - ৳${effectivePrice}`}
        description={product.description ? product.description.replace(/<[^>]*>/g, '').slice(0, 160) : `Buy ${product.name} online at best price ৳${effectivePrice} in Bangladesh. Genuine quality, fast delivery.`}
        image={activeImage || product.image}
        slug={`product/${product.id}`}
        type="product"
        keywords={`${product.name}, Buy ${product.name} Bangladesh, ${product.brand || 'Tamim Global'}, ${product.category || 'Sports Item'}, Price in BD`}
        product={{
          id: product.id,
          name: product.name,
          description: product.description ? product.description.replace(/<[^>]*>/g, '').slice(0, 200) : undefined,
          price: effectivePrice,
          originalPrice: product.originalPrice || product.price,
          currency: 'BDT',
          inStock: product.inStock !== false,
          brand: product.brand,
          rating: product.rating,
          reviewsCount: product.reviews,
          sku: product.sku,
          image: activeImage || product.image,
          category: product.category,
        }}
      />

      {/* Top Breadcrumb & Quick Nav */}
      <div className="splayd-pdp-breadcrumbs-row">
        <div className="splayd-pdp-breadcrumbs">
          <Link to="/">Home</Link>
          <ChevronRight size={12} />
          <Link to={`/collection/${(product.category || '').toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>{(product.category || 'SHOP ALL PRODUCTS').toUpperCase()}</Link>
          <ChevronRight size={12} />
          <span>{product.name}</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="splayd-pdp-grid">
        {/* Modern Clean Product Gallery */}
        {(() => {
          const galleryList = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];
          const activeIdx = galleryList.findIndex((img: string) => img === activeImage);
          const currentIdx = activeIdx >= 0 ? activeIdx : 0;
          const displayImg = activeImage || product.image;

          const handlePrevImg = (e?: React.MouseEvent) => {
            e?.stopPropagation();
            const prevIndex = (currentIdx - 1 + galleryList.length) % galleryList.length;
            setActiveImage(galleryList[prevIndex]);
          };

          const handleNextImg = (e?: React.MouseEvent) => {
            e?.stopPropagation();
            const nextIndex = (currentIdx + 1) % galleryList.length;
            setActiveImage(galleryList[nextIndex]);
          };

          const discountPct = product.originalPrice && Number(product.originalPrice) > Number(product.price)
            ? Math.round(((Number(product.originalPrice) - Number(product.price)) / Number(product.originalPrice)) * 100)
            : 0;

          return (
            <>
              <div className="splayd-pdp-gallery-wrap clean-pdp-gallery">
                {/* Featured Main Image Box (Top) */}
                <div className="splayd-pdp-main-img-box clean-main-box" onClick={() => setLightboxOpen(true)}>
                  {/* Image Container with Fade Animation */}
                  <div key={displayImg} className="pdp-clean-img-container">
                    <img src={displayImg} alt={product.name} className="pdp-clean-main-image" />
                  </div>

                  {/* Top Floating Badges */}
                  <div className="pdp-gallery-top-badges">
                    {discountPct > 0 && (
                      <span className="pdp-badge-discount">-{discountPct}% OFF</span>
                    )}
                    {product.isNew && (
                      <span className="pdp-badge-new">NEW</span>
                    )}
                  </div>

                  {/* Fullscreen Zoom Trigger Button */}
                  <button 
                    type="button" 
                    className="pdp-zoom-trigger-btn"
                    onClick={(e) => { e.stopPropagation(); setLightboxOpen(true); }}
                    title="Fullscreen Lightbox View"
                  >
                    <Maximize2 size={16} />
                  </button>

                  {/* Image Counter Pill */}
                  {galleryList.length > 1 && (
                    <div className="pdp-img-counter-pill">
                      {currentIdx + 1} / {galleryList.length}
                    </div>
                  )}

                  {/* Left & Right Image Navigation Arrows */}
                  {galleryList.length > 1 && (
                    <>
                      <button 
                        type="button" 
                        className="pdp-img-nav-btn prev" 
                        onClick={handlePrevImg}
                        title="Previous Image"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button 
                        type="button" 
                        className="pdp-img-nav-btn next" 
                        onClick={handleNextImg}
                        title="Next Image"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}
                </div>

                {/* Horizontal Thumbnails Strip (Neatly Underneath Main Image) */}
                {galleryList.length > 1 && (
                  <div className="splayd-pdp-thumbnails-strip clean-thumbs-strip">
                    {galleryList.map((img: string, i: number) => (
                      <button 
                        key={i} 
                        type="button"
                        className={`splayd-pdp-thumb-btn ${displayImg === img ? 'active' : ''}`}
                        onClick={() => setActiveImage(img)}
                        title={`View photo ${i + 1}`}
                      >
                        <img src={img} alt={`Thumbnail ${i+1}`} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Fullscreen Lightbox Modal */}
              {lightboxOpen && (
                <div className="pdp-lightbox-overlay" onClick={() => setLightboxOpen(false)}>
                  <div className="pdp-lightbox-content" onClick={(e) => e.stopPropagation()}>
                    <button 
                      type="button" 
                      className="pdp-lightbox-close" 
                      onClick={() => setLightboxOpen(false)}
                      title="Close Lightbox"
                    >
                      <X size={26} />
                    </button>

                    <div className="pdp-lightbox-main">
                      {galleryList.length > 1 && (
                        <button type="button" className="pdp-lightbox-nav prev" onClick={handlePrevImg}>
                          <ChevronLeft size={28} />
                        </button>
                      )}
                      
                      <img src={displayImg} alt={product.name} className="pdp-lightbox-img" />

                      {galleryList.length > 1 && (
                        <button type="button" className="pdp-lightbox-nav next" onClick={handleNextImg}>
                          <ChevronRight size={28} />
                        </button>
                      )}
                    </div>

                    {galleryList.length > 1 && (
                      <div className="pdp-lightbox-thumbs">
                        {galleryList.map((img: string, i: number) => (
                          <button 
                            key={i} 
                            type="button"
                            className={`pdp-lightbox-thumb ${displayImg === img ? 'active' : ''}`}
                            onClick={() => setActiveImage(img)}
                          >
                            <img src={img} alt={`Light ${i+1}`} />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          );
        })()}

        {/* Right Product Details Info */}
        <div className="splayd-pdp-info-col">
          <div className="splayd-pdp-top-meta">
            <span 
              className="splayd-pdp-ask-link" 
              onClick={() => {
                if (config.contactInfo.whatsappNumber) {
                  window.open(`https://wa.me/${config.contactInfo.whatsappNumber.replace(/[^0-9]/g, '')}?text=Question%20about%20${encodeURIComponent(product.name)}`, '_blank');
                } else if (config.contactInfo.phoneNumber) {
                  window.location.href = `tel:${config.contactInfo.phoneNumber}`;
                }
              }}
            >
              💬 Ask a Question
            </span>
          </div>

          {/* Product Title */}
          <h1 className="splayd-pdp-title">{product.name}</h1>

          {/* Rating Row */}
          {(product.rating || product.reviews) && (
            <div className="splayd-pdp-rating-row">
              <StarRating rating={product.rating || 5} />
              <span className="splayd-pdp-rating-count">
                {product.rating ? `${product.rating} / 5` : '5.0 / 5'}
                {product.reviews ? ` · ${product.reviews.toLocaleString()} রিভিউ` : ''}
              </span>
              {product.sku && (
                <>
                  <span style={{ color: '#d4d4d8', fontSize: '0.8rem' }}>|</span>
                  <span style={{ fontSize: '0.75rem', color: '#a1a1aa', fontFamily: 'monospace' }}>SKU: {product.sku}</span>
                </>
              )}
            </div>
          )}

          {/* Pricing Block */}
          <div className="splayd-pdp-pricing-block">
            <div>
              {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                <div className="splayd-pdp-original-price">৳{Number(product.originalPrice).toLocaleString('en-US')}</div>
              )}
              {product.campaignOfferPrice && product.campaignOfferPrice < product.price && (
                <div className="splayd-pdp-campaign-badge">🎉 Campaign Price</div>
              )}
            </div>
            <div className="splayd-pdp-price">
              ৳{Number(effectivePrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
              <div style={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 700 }}>
                Save ৳{(Number(product.originalPrice) - Number(product.price)).toLocaleString('en-US')}
              </div>
            )}
          </div>

          {/* Size Selector */}
          {product.sizes && product.sizes.filter((s: any) => s.enabled).length > 0 && (
            <div>
              <div className="splayd-pdp-size-title">
                SIZE: <strong>{selectedSize || 'SELECT SIZE'}</strong>
              </div>
              <div className="splayd-pdp-size-pills">
                {product.sizes.filter((s: any) => s.enabled).map((size: any, idx: number) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedSize(size.label)}
                    className={`splayd-pdp-size-circle ${selectedSize === size.label ? 'active' : ''}`}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Stepper & Add to Cart */}
          {(() => {
            const isOutOfStock = product.stock !== undefined
              ? Number(product.stock) <= 0
              : (product.in_stock === 0 || product.in_stock === false || product.inStock === false);
            const realStockCount = product.stock !== undefined ? Number(product.stock) : (isOutOfStock ? 0 : 15);
            const isLowStock = realStockCount > 0 && realStockCount <= 15;

            return (
              <>
                <div className="splayd-pdp-cart-row">
                  <div className="splayd-pdp-qty-stepper">
                    <button type="button" onClick={() => setBuyNowQty(Math.max(1, buyNowQty - 1))} disabled={isOutOfStock}>−</button>
                    <span>{buyNowQty}</span>
                    <button type="button" onClick={() => setBuyNowQty(buyNowQty + 1)} disabled={isOutOfStock}>+</button>
                  </div>
                  <button 
                    className="splayd-pdp-add-btn" 
                    disabled={isOutOfStock}
                    style={isOutOfStock ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                    onClick={() => {
                      if (isOutOfStock) return;
                      const hasSizes = product.sizes && product.sizes.filter((s: any) => s.enabled).length > 0;
                      if (hasSizes && !selectedSize) {
                        alert('দয়া করে প্রথমে সাইজ সিলেক্ট করুন!');
                        return;
                      }
                      addToCart({ ...product, selectedSize: selectedSize || 'Free Size' });
                    }}
                  >
                    <ShoppingCart size={16} />
                    {isOutOfStock ? 'OUT OF STOCK' : 'ADD TO CART'}
                  </button>
                </div>

                {/* Buy It Now */}
                <button 
                  className="splayd-pdp-buy-btn"
                  disabled={isOutOfStock}
                  style={isOutOfStock ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                  onClick={() => {
                    if (isOutOfStock) return;
                    const hasSizes = product.sizes && product.sizes.filter((s: any) => s.enabled).length > 0;
                    if (hasSizes && !selectedSize) {
                      alert('দয়া করে প্রথমে সাইজ সিলেক্ট করুন!');
                      return;
                    }
                    setIsCheckoutOpen(true);
                  }}
                >
                  ⚡ {isOutOfStock ? 'PRODUCT UNAVAILABLE' : 'BUY IT NOW'}
                </button>

                {/* Scarcity / Stock Bar */}
                <div 
                  className="splayd-pdp-scarcity" 
                  style={
                    isOutOfStock 
                      ? { background: '#fef2f2', borderColor: '#fecaca' } 
                      : !isLowStock 
                        ? { background: '#f0fdf4', borderColor: '#bbf7d0' }
                        : {}
                  }
                >
                  <div 
                    className="splayd-pdp-scarcity-lbl" 
                    style={
                      isOutOfStock 
                        ? { color: '#ef4444' } 
                        : !isLowStock 
                          ? { color: '#16a34a' } 
                          : { color: '#92400e' }
                    }
                  >
                    {isOutOfStock 
                      ? '⚠️ Stock শেষ — পণ্যটি বর্তমানে অনুপলব্ধ' 
                      : isLowStock
                        ? `🔥 দ্রুত! মাত্র ${realStockCount}টি বাকি আছে`
                        : `✅ স্টকে আছে (${realStockCount} পিস উপলব্ধ)`
                    }
                  </div>
                  {!isOutOfStock && (
                    <div className="splayd-pdp-scarcity-bar">
                      <div className="splayd-pdp-scarcity-fill" style={{ width: `${Math.min(100, Math.max(8, (realStockCount / 50) * 100))}%` }} />
                    </div>
                  )}
                </div>

                {/* Live Viewers */}
                {liveViewConfig.enabled !== false && (
                  <div className="splayd-pdp-viewers">
                    <Eye size={16} />
                    <span>{liveViewersCount} জন এখন এই পণ্যটি দেখছেন</span>
                  </div>
                )}
              </>
            );
          })()}

          {/* Contact Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            {config.contactInfo?.whatsappNumber && (
              <a
                href={`https://wa.me/${config.contactInfo.whatsappNumber.replace(/[^0-9]/g, '')}?text=Hi, I want to order: ${encodeURIComponent(product.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1,
                  height: '44px',
                  borderRadius: '10px',
                  border: '1.5px solid #16a34a',
                  background: 'transparent',
                  color: '#16a34a',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '7px',
                  textDecoration: 'none',
                  transition: 'background 0.2s',
                }}
                onMouseOver={e => (e.currentTarget.style.background = '#f0fdf4')}
                onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
              >
                <Phone size={15} /> WhatsApp
              </a>
            )}
            {config.contactInfo?.phoneNumber && (
              <a
                href={`tel:${config.contactInfo.phoneNumber}`}
                style={{
                  flex: 1,
                  height: '44px',
                  borderRadius: '10px',
                  border: '1.5px solid #0066cc',
                  background: 'transparent',
                  color: '#0066cc',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '7px',
                  textDecoration: 'none',
                  transition: 'background 0.2s',
                }}
                onMouseOver={e => (e.currentTarget.style.background = '#eff6ff')}
                onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
              >
                <Phone size={15} /> Call Us
              </a>
            )}
          </div>

          {/* Payment Methods Strip */}
          <div className="splayd-pdp-payments-strip">
            <span style={{ fontSize: '0.72rem', color: '#71717a', fontWeight: 600, marginRight: '4px' }}>পেমেন্ট:</span>
            {['Cash on Delivery', 'bKash', 'Nagad', 'Card'].map(m => (
              <span key={m} className="splayd-payment-badge">{m}</span>
            ))}
          </div>

          {/* Trust Badges Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
            {[
              { icon: <Truck size={18} />, label: 'দ্রুত ডেলিভারি', sub: 'ঢাকা: ২৪-৪৮ ঘণ্টা' },
              { icon: <Shield size={18} />, label: '১০০% আসল পণ্য', sub: 'গুণমান নিশ্চিত' },
              { icon: <RotateCcw size={18} />, label: '৭-দিন রিটার্ন', sub: 'সহজ রিটার্ন নীতি' },
              { icon: <CheckCircle size={18} />, label: 'নিরাপদ পেমেন্ট', sub: 'SSL সুরক্ষিত' },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 14px',
                background: '#f9fafb',
                border: '1px solid #ececec',
                borderRadius: '12px',
              }}>
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  background: '#111',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#111', lineHeight: 1.2 }}>{item.label}</div>
                  <div style={{ fontSize: '0.7rem', color: '#71717a', marginTop: '2px' }}>{item.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Expandable Accordion Cards (Description & Additional Information) */}
          <div className="splayd-pdp-accordions">
            {/* 1. Description Accordion */}
            <div className="splayd-accordion-card">
              <div 
                className="splayd-accordion-header" 
                onClick={() => toggleAccordion('description')}
              >
                <span>Description</span>
                <span>{accordionOpen.description ? <Minus size={18} /> : <Plus size={18} />}</span>
              </div>
              {accordionOpen.description && (
                <div className="splayd-accordion-body">
                  <p style={{ margin: '0 0 12px 0' }}>{product.description}</p>
                  {product.features && product.features.length > 0 && (
                    <>
                      <h4 style={{ fontWeight: 800, margin: '12px 0 6px 0', fontSize: '0.9rem' }}>Key Highlights & Features:</h4>
                      <ul style={{ paddingLeft: '20px', margin: 0 }}>
                        {product.features.map((feat: string, i: number) => (
                          <li key={i} style={{ marginBottom: '4px' }}>{feat}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* 2. Additional Information Accordion */}
            <div className="splayd-accordion-card">
              <div 
                className="splayd-accordion-header" 
                onClick={() => toggleAccordion('additional')}
              >
                <span>Additional Information</span>
                <span>{accordionOpen.additional ? <Minus size={18} /> : <Plus size={18} />}</span>
              </div>
              {accordionOpen.additional && (
                <div className="splayd-accordion-body">
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '8px 0', fontWeight: 700, width: '40%', borderBottom: '1px solid #f3f4f6' }}>SKU Code</td>
                        <td style={{ padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>{product.sku || 'TG-PRD-101'}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '8px 0', fontWeight: 700, borderBottom: '1px solid #f3f4f6' }}>Brand</td>
                        <td style={{ padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>{product.brand || 'Tamim Global'}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '8px 0', fontWeight: 700, borderBottom: '1px solid #f3f4f6' }}>Category</td>
                        <td style={{ padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>{product.category || 'Standard'}</td>
                      </tr>
                      {product.specs && product.specs.map((spec: any, idx: number) => (
                        <tr key={idx}>
                          <td style={{ padding: '8px 0', fontWeight: 700, borderBottom: '1px solid #f3f4f6' }}>{spec.name}</td>
                          <td style={{ padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>{spec.value}</td>
                        </tr>
                      ))}
                      <tr>
                        <td style={{ padding: '8px 0', fontWeight: 700, borderBottom: '1px solid #f3f4f6' }}>Delivery Time</td>
                        <td style={{ padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>Dhaka: 24-48 Hours | Outside: 2-3 Days</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '8px 0', fontWeight: 700 }}>Return Policy</td>
                        <td style={{ padding: '8px 0' }}>7-Day Instant Easy Return & Exchange Guarantee</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* 3. Customer Reviews Accordion */}
            <div className="splayd-accordion-card">
              <div 
                className="splayd-accordion-header" 
                onClick={() => toggleAccordion('reviews')}
              >
                <span>Customer Reviews ({product.customerReviews?.length || 0})</span>
                <span>{accordionOpen.reviews ? <Minus size={18} /> : <Plus size={18} />}</span>
              </div>
              {accordionOpen.reviews && (
                <div className="splayd-accordion-body">
                  {/* Reviews List & Write Review Form */}
                  <div className="pdp-reviews-list" style={{ marginBottom: '24px' }}>
                    {product.customerReviews && product.customerReviews.length > 0 ? (
                      product.customerReviews.map((review: any) => (
                        <div key={review.id} style={{ padding: '14px', borderRadius: '8px', background: '#f8f9fa', border: '1px solid #e4e4e7', marginBottom: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>{review.user}</span>
                            <span style={{ fontSize: '0.78rem', color: '#71717a' }}>{new Date(review.date).toLocaleDateString('bn-BD')}</span>
                          </div>
                          <StarRating rating={review.rating} />
                          <p style={{ margin: '6px 0 0 0', fontSize: '0.88rem', color: '#3f3f46' }}>{review.comment}</p>
                        </div>
                      ))
                    ) : (
                      <p style={{ color: '#71717a' }}>এই প্রোডাক্টে এখনও কোনো রিভিউ দেওয়া হয়নি।</p>
                    )}
                  </div>

                  {/* Review Form */}
                  <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '8px', border: '1px solid #e4e4e7' }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: 800 }}>একটি রিভিউ লিখুন</h4>
                    {reviewMsg && <div style={{ background: '#dcfce7', color: '#16a34a', padding: '8px 12px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '12px' }}>{reviewMsg}</div>}
                    {reviewError && <div style={{ background: '#fee2e2', color: '#ef4444', padding: '8px 12px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '12px' }}>{reviewError}</div>}
                    <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <input 
                        type="text" 
                        placeholder="আপনার নাম" 
                        required 
                        value={reviewerName} 
                        onChange={e => setReviewerName(e.target.value)} 
                        style={{ padding: '8px 12px', border: '1px solid #d4d4d8', borderRadius: '4px', fontSize: '0.88rem' }}
                      />
                      <textarea 
                        placeholder="আপনার প্রোডাক্ট রিভ্যু মতামত লিখুন..." 
                        required 
                        rows={3} 
                        value={reviewerComment} 
                        onChange={e => setReviewerComment(e.target.value)} 
                        style={{ padding: '8px 12px', border: '1px solid #d4d4d8', borderRadius: '4px', fontSize: '0.88rem' }}
                      />
                      <button type="submit" className="splayd-pdp-add-btn" style={{ height: '40px', fontSize: '0.8rem' }}>SUBMIT REVIEW</button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Video & Photo Reviews Section */}
      {Boolean((product.videoUrl && String(product.videoUrl).trim()) || (product.video_url && String(product.video_url).trim()) || (product.photoContent && String(product.photoContent).trim()) || (product.photo_content && String(product.photo_content).trim())) && (
        <div className="pdp-tabs-container pdp-media-section" style={{ padding: '30px', background: 'white', marginTop: '40px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--sf-text-primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageCircle size={22} color="var(--sf-accent)" />
            ভিডিও ও ছবি রিভিউ (Video & Photo Reviews)
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="pdp-media-grid">
              {(product.videoUrl || product.video_url) && (
                <div style={{ background: 'var(--sf-bg-light)', padding: '20px', borderRadius: '12px', border: '1px solid var(--sf-border)' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--sf-text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--sf-accent)' }} />
                    ভিডিও রিভিউ (Product Video Content)
                  </h4>
                  {((product.videoUrl || product.video_url).includes('youtube.com') || (product.videoUrl || product.video_url).includes('youtu.be') || (product.videoUrl || product.video_url).includes('shorts')) ? (
                    <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
                      <iframe
                        src={getEmbedUrl(product.videoUrl || product.video_url)}
                        title="Product Video"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '12px' }}
                      />
                    </div>
                  ) : (
                    <video controls src={product.videoUrl || product.video_url} style={{ width: '100%', borderRadius: '12px', maxHeight: '400px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }} />
                  )}
                </div>
              )}
              {(product.photoContent || product.photo_content) && (
                <div style={{ background: 'var(--sf-bg-light)', padding: '20px', borderRadius: '12px', border: '1px solid var(--sf-border)', display: 'flex', flexDirection: 'column' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--sf-text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--sf-accent)' }} />
                    ছবি রিভিউ কনটেন্ট (Additional Photo Review)
                  </h4>
                  <div style={{ display: 'flex', justifyContent: 'center', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', flexGrow: 1, alignItems: 'center', background: 'var(--sf-bg-main)' }}>
                    <img 
                      src={product.photoContent || product.photo_content} 
                      alt="Product Photo Content" 
                      onClick={() => setLightboxImage(product.photoContent || product.photo_content)}
                      style={{ maxWidth: '100%', height: 'auto', borderRadius: '12px', maxHeight: '350px', objectFit: 'contain', cursor: 'pointer' }} 
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Related / Suggested Products */}
      {product && (() => {
        const related = config.products.filter(p => String(p.id) !== String(product.id) && p.category === product.category && p.published).slice(0, 4);
        if (related.length === 0) return null;
        
        return (
          <div className="pdp-related">
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--sf-text-primary)', marginBottom: '20px' }}>আপনাদের পছন্দের অন্যান্য পণ্য (Suggested Products)</h3>
            <div className="products-grid">
              {related.map((relatedProduct: any) => {
                const origPrice = relatedProduct.originalPrice || (relatedProduct.price ? Math.round(relatedProduct.price * 1.25) : null);
                const hasDiscount = origPrice && origPrice > relatedProduct.price;
                const savings = hasDiscount ? origPrice - relatedProduct.price : 0;

                return (
                  <Link to={`/product/${relatedProduct.id}`} key={relatedProduct.id} className="product-card" style={{ textDecoration: 'none' }}>
                    <div className="product-card-image-container">
                      <OptimizedImage src={relatedProduct.image} alt={relatedProduct.name} className="product-card-image" width={400} height={400} />
                      {hasDiscount && (
                        <span className="product-card-badge sale" style={{ background: '#ef4444', color: '#fff', fontWeight: 800 }}>
                          -{Math.round((savings / origPrice) * 100)}% ছাড়
                        </span>
                      )}
                    </div>
                    <div className="product-card-body">
                      <div className="product-card-category">{relatedProduct.category}</div>
                      <div className="product-card-name">{relatedProduct.name}</div>
                      <div className="product-card-rating">
                        <StarRating rating={relatedProduct.rating || 5} />
                        <span className="product-card-reviews">({relatedProduct.reviews ? relatedProduct.reviews.toLocaleString() : 12})</span>
                      </div>
                      <div className="product-card-footer">
                        <div className="product-card-price-group" style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                          <span className="product-card-price" style={{ color: 'var(--sf-accent, #e11d48)', fontWeight: 900, fontSize: '1.15rem' }}>৳{relatedProduct.price}</span>
                          {hasDiscount && (
                            <span className="product-card-old-price" style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500 }}>
                              ৳{origPrice}
                            </span>
                          )}
                        </div>
                        <button 
                          className="product-card-add"
                          onClick={(e) => {
                            e.preventDefault();
                            addToCart({
                              id: relatedProduct.id,
                              name: relatedProduct.name,
                              price: relatedProduct.price,
                              image: relatedProduct.image,
                              quantity: 1
                            });
                          }}
                        >
                          <ShoppingCart size={14} />
                        </button>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Premium Checkout Modal Overlay */}
      {isCheckoutOpen && (
        <div className="pdp-checkout-overlay" onClick={closeCheckoutModal}>
          <div className="pdp-checkout-modal" onClick={e => e.stopPropagation()}>
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
              <button className="pco-close-btn" onClick={closeCheckoutModal} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            {!checkoutSuccess ? (
              <form className="pco-form" onSubmit={handleCheckoutSubmit}>

                {/* ── PRODUCT SUMMARY CARD ── */}
                <div className="pco-section">
                  <div className="pco-section-label">
                    <span className="pco-step-badge">১</span>
                    অর্ডার সামারি
                  </div>
                  <div className="pco-product-card">
                    <img src={product.image} alt={product.name} className="pco-product-img" />
                    <div className="pco-product-info">
                      <div className="pco-product-name">{product.name}</div>
                      <div className="pco-product-variant">সাইজ: {selectedSize || 'ফ্রি সাইজ'}</div>
                      <div className="pco-product-price-row">
                        <span className="pco-product-price">৳{Number(effectivePrice).toLocaleString('en-US')}</span>
                        {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                          <span className="pco-product-old-price">৳{Number(product.originalPrice).toLocaleString('en-US')}</span>
                        )}
                      </div>
                    </div>
                    <div className="pco-qty-block">
                      <button type="button" className="pco-qty-btn" onClick={() => setBuyNowQty(p => Math.max(1, p - 1))}>−</button>
                      <span className="pco-qty-val">{buyNowQty}</span>
                      <button type="button" className="pco-qty-btn" onClick={() => setBuyNowQty(p => p + 1)}>+</button>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  {(() => {
                    const subtotal = effectivePrice * buyNowQty;
                    const deliveryCharge = shippingLocation === 'dhaka'
                      ? config.delivery.insideDhakaPrice
                      : config.delivery.outsideDhakaPrice;
                    let discount = 0;
                    if (appliedCoupon) {
                      discount = appliedCoupon.type === 'percentage'
                        ? (subtotal * appliedCoupon.value) / 100
                        : appliedCoupon.value;
                    }
                    const total = subtotal + deliveryCharge - discount;
                    return (
                      <div className="pco-price-breakdown">
                        <div className="pco-price-row">
                          <span>পণ্যের মূল্য ({buyNowQty}টি)</span>
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
                    );
                  })()}

                  {/* Coupon Block */}
                  <div className="pco-coupon-block">
                    <div className="pco-coupon-label">🎟 প্রোমো কোড</div>
                    {appliedCoupon ? (
                      <div className="pco-coupon-applied">
                        <span>✅ '{appliedCoupon.code}' ({appliedCoupon.type === 'percentage' ? `${appliedCoupon.value}%` : `৳${appliedCoupon.value}`} ছাড়)</span>
                        <button type="button" onClick={() => { setAppliedCoupon(null); setPromoCodeInput(''); setCouponSuccess(''); setCouponError(''); }}>✕ সরান</button>
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
                          onClick={async () => {
                            setCouponError(''); setCouponSuccess('');
                            if (!promoCodeInput.trim()) return;
                            setIsValidating(true);
                            const res = await validateCouponCode(promoCodeInput.trim());
                            setIsValidating(false);
                            if (res.status === 'success') { setAppliedCoupon(res.data); setCouponSuccess(`✅ কোড '${res.data.code}' প্রয়োগ হয়েছে!`); }
                            else { setCouponError(res.message || 'কোডটি বৈধ নয়।'); setAppliedCoupon(null); }
                          }}
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
                          const isSelected = selectedAddressId === addr.id;
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
                          <span>পরিমাণ: <strong>৳{(effectivePrice * buyNowQty + (shippingLocation === 'dhaka' ? config.delivery.insideDhakaPrice : config.delivery.outsideDhakaPrice) - (appliedCoupon ? (appliedCoupon.type === 'percentage' ? (effectivePrice * buyNowQty * appliedCoupon.value / 100) : appliedCoupon.value) : 0)).toFixed(2)}</strong></span>
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
                <button className="pco-submit-btn" onClick={closeCheckoutModal}>
                  ✓ ঠিক আছে
                </button>
              </div>
            )}
          </div>
        </div>
      )}







      {/* Lightbox Modal for Review Images */}
      {lightboxImage && (
        <div 
          onClick={() => setLightboxImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            cursor: 'pointer'
          }}
        >
          <img 
            src={lightboxImage} 
            alt="Enlarged review attachment" 
            style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)' }} 
          />
        </div>
      )}
    </div>
  );
}

const getEmbedUrl = (url: string) => {
  if (!url) return '';
  if (url.includes('embed/')) return url;
  let videoId = '';
  if (url.includes('shorts/')) {
    videoId = url.split('shorts/')[1]?.split('?')[0] || '';
  } else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
  } else if (url.includes('v=')) {
    videoId = url.split('v=')[1]?.split('&')[0] || '';
  }
  return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
};
