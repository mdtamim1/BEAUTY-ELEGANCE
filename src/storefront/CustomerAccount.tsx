import { useState, useEffect, useRef } from 'react';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { useOutletContext, Link, useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, Calendar, ShoppingBag, MessageSquare, LogOut, 
  Lock, ArrowRight, ShieldCheck, MapPin, Truck, CheckCircle2, 
  Clock, AlertCircle, HelpCircle, Send, Plus, ArrowLeft, RefreshCw,
  Trash2, Edit, X, Heart, ShoppingCart, Ticket, Menu, RotateCcw, Trophy, MoreVertical
} from 'lucide-react';
import { fetchOrdersFromBackend, fetchCustomerOrdersFromBackend, fetchChatHistory } from '../services/api';
import { generateOrders as getOrders } from '../mock/data';
import { useStorefrontConfig } from '../store/storefrontConfig';
import { CustomerCouponsTab } from './CustomerCouponsTab';
import { CustomerEventsTab } from './CustomerEventsTab';
import { createProductSlug } from '../utils/urlSlug';
import './storefront-account.css';

interface OrderItem {
  id: number | string;
  customer: string;
  email: string;
  phone: string;
  amount: number;
  status: string;
  items: number;
  date: string;
  created_at?: string;
  paymentMethod: string;
  courier?: string;
  city?: string;
  address?: string;
}

interface ChatMessage {
  id: string;
  customerId: string;
  customerName: string;
  sender: 'customer' | 'admin';
  message: string;
  timestamp: string;
  read: boolean;
}

export default function CustomerAccount() {
  const { 
    customer, 
    login, 
    register, 
    loginWithGmail, 
    logout, 
    updateCustomerProfile,
    addCustomerAddress,
    updateCustomerAddress,
    deleteCustomerAddress,
    setDefaultCustomerAddress
  } = useCustomerAuth();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, wishlist, cart, cartTotal, updateQuantity } = useOutletContext<any>() || { wishlist: [], cart: [], cartTotal: 0, addToCart: () => {}, toggleWishlist: () => {}, updateQuantity: () => {} };
  const [config] = useStorefrontConfig();

  // Auth UI Form states
  const [isRegister, setIsRegister] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [showGoogleAccounts, setShowGoogleAccounts] = useState(false);

  // Floating 3D Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Dashboard state
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'coupons' | 'events' | 'addresses' | 'wishlist' | 'cart' | 'chat'>('profile');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);

  // Chat/Messaging State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<WebSocket | null>(null);

  // Profile edit states
  const [profileName, setProfileName] = useState(customer?.name || '');
  const [profilePhone, setProfilePhone] = useState(customer?.phone || '');
  const [profileAddress, setProfileAddress] = useState(customer?.address || '');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Saved Address Form/Modal states
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any | null>(null);
  const [addressLabel, setAddressLabel] = useState('Home');
  const [addressName, setAddressName] = useState('');
  const [addressPhone, setAddressPhone] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [addressIsDefault, setAddressIsDefault] = useState(false);
  const [addressError, setAddressError] = useState('');

  const resetAddressForm = () => {
    setEditingAddress(null);
    setAddressLabel('Home');
    setAddressName('');
    setAddressPhone('');
    setAddressDetail('');
    setAddressIsDefault(false);
    setAddressError('');
    setIsAddressModalOpen(false);
  };

  const openAddAddressModal = () => {
    resetAddressForm();
    setAddressName(customer?.name || '');
    setAddressPhone(customer?.phone || '');
    setIsAddressModalOpen(true);
  };

  const openEditAddressModal = (addr: any) => {
    setEditingAddress(addr);
    setAddressLabel(addr.label);
    setAddressName(addr.name);
    setAddressPhone(addr.phone);
    setAddressDetail(addr.address);
    setAddressIsDefault(!!addr.isDefault);
    setAddressError('');
    setIsAddressModalOpen(true);
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddressError('');

    if (!addressLabel.trim()) {
      setAddressError('Address label (e.g. Home, Office) cannot be empty.');
      return;
    }
    if (!addressName.trim()) {
      setAddressError('Name cannot be empty.');
      return;
    }
    if (!addressPhone.trim()) {
      setAddressError('Mobile number cannot be empty.');
      return;
    }
    if (!addressDetail.trim()) {
      setAddressError('Detailed address cannot be empty.');
      return;
    }

    const addrData = {
      label: addressLabel.trim(),
      name: addressName.trim(),
      phone: addressPhone.trim(),
      address: addressDetail.trim(),
      isDefault: addressIsDefault
    };

    try {
      if (editingAddress) {
        updateCustomerAddress(editingAddress.id, addrData);
      } else {
        addCustomerAddress(addrData);
      }
      resetAddressForm();
    } catch (err) {
      setAddressError('Failed to save address.');
    }
  };

  useEffect(() => {
    if (customer) {
      setProfileName(customer.name || '');
      setProfilePhone(customer.phone || '');
      setProfileAddress(customer.address || '');
      setProfileSuccess('');
      setProfileError('');
    }
  }, [customer]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!customer) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      
      const newMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        customerId: customer.id,
        customerName: customer.name,
        sender: 'customer',
        message: base64String,
        timestamp: new Date().toISOString(),
        read: false
      };

      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({
          type: 'message',
          customerId: customer.id,
          customerName: customer.name,
          sender: 'customer',
          message: base64String
        }));
      } else {
        const storedChats = localStorage.getItem('storefront_chats');
        let allChats: ChatMessage[] = [];
        if (storedChats) {
          try {
            allChats = JSON.parse(storedChats);
          } catch (e) {}
        }
        syncChatData([...allChats, newMessage]);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (!profileName.trim()) {
      setProfileError('Name cannot be empty.');
      return;
    }
    if (!profilePhone.trim()) {
      setProfileError('Mobile number cannot be empty.');
      return;
    }

    try {
      updateCustomerProfile({
        name: profileName.trim(),
        phone: profilePhone.trim(),
        address: profileAddress.trim()
      });
      setProfileSuccess('Your profile information has been updated successfully!');
    } catch (err) {
      setProfileError('Failed to update profile.');
    }
  };

  // Load orders with persistent caching and dedicated backend customer lookup
  const loadCustomerOrders = async () => {
    if (!customer) return;
    setLoadingOrders(true);
    try {
      const custEmail = (customer.email || '').toLowerCase().trim();
      const custPhone = (customer.phone || '').replace(/[^0-9]/g, '');
      const cacheKey = `customer_orders_${custEmail || custPhone}`;

      // 1. Fetch directly from customer backend route & general orders
      const backendCustomerOrders = await fetchCustomerOrdersFromBackend(customer.email, customer.phone);
      const generalOrders = await fetchOrdersFromBackend();
      
      // 2. Fetch local storage orders (Admin local edits & offline fallback)
      let localOrderList: any[] = [];
      try {
        const storedOrderList = localStorage.getItem('orderList');
        if (storedOrderList) localOrderList = JSON.parse(storedOrderList);
      } catch (e) {}

      let cachedOrders: any[] = [];
      try {
        const storedCache = localStorage.getItem(cacheKey);
        if (storedCache) cachedOrders = JSON.parse(storedCache);
      } catch (e) {}

      const mockFallback = getOrders() || [];

      // Helper matcher function
      const isOrderForCustomer = (o: any) => {
        if (!o) return false;
        const oEmail = (o.email || '').toLowerCase().trim();
        const oPhone = (o.phone || '').replace(/[^0-9]/g, '');

        const emailMatch = Boolean(custEmail && (oEmail === custEmail || oPhone === custEmail));
        const phoneMatch = Boolean(custPhone && custPhone.length >= 6 && (
          oPhone === custPhone || 
          oEmail === custPhone || 
          (oPhone.length >= 10 && custPhone.endsWith(oPhone.slice(-10))) ||
          (custPhone.length >= 10 && oPhone.endsWith(custPhone.slice(-10)))
        ));

        return emailMatch || phoneMatch;
      };

      const matchedMap = new Map<string, any>();

      // Base layer: mock & old local cache
      [...mockFallback, ...cachedOrders].forEach((o: any) => {
        if (o && o.id && isOrderForCustomer(o)) {
          matchedMap.set(String(o.id), o);
        }
      });

      // Layer 2: Admin local edits from orderList
      localOrderList.forEach((o: any) => {
        if (o && o.id && isOrderForCustomer(o)) {
          const existing = matchedMap.get(String(o.id)) || {};
          matchedMap.set(String(o.id), {
            ...existing,
            ...o
          });
        }
      });

      // Layer 3: Direct Backend DB Orders (HIGHEST PRIORITY - Overwrites status & courier with live database values)
      [...(generalOrders || []), ...(backendCustomerOrders || [])].forEach((o: any) => {
        if (o && o.id && isOrderForCustomer(o)) {
          const existing = matchedMap.get(String(o.id)) || {};
          matchedMap.set(String(o.id), {
            ...existing,
            ...o,
            status: o.status || existing.status || 'processing',
            courier: o.courier || existing.courier || 'Pathao Courier'
          });
        }
      });

      const finalOrders = Array.from(matchedMap.values()).sort((a: any, b: any) => {
        const dateA = new Date(a.date || a.created_at || 0).getTime();
        const dateB = new Date(b.date || b.created_at || 0).getTime();
        return dateB - dateA;
      });

      // Save updated persistent cache
      localStorage.setItem(cacheKey, JSON.stringify(finalOrders));
      setOrders(finalOrders as any[]);
    } catch (e) {
      console.error('Error loading customer orders:', e);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Sync state & localStorage
  const syncChatData = (updated: ChatMessage[]) => {
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
        const allChats: ChatMessage[] = JSON.parse(stored);
        const filtered = allChats.filter(m => m.customerId === customer.id);
        setChatMessages(filtered);
      } catch (e) {}
    }
  };

  useEffect(() => {
    if (customer) {
      loadCustomerOrders();

      const initializeChat = async () => {
        // 1. Fetch history from SQLite Database
        const history = await fetchChatHistory();
        if (history && history.length > 0) {
          syncChatData(history);
        } else {
          loadChatsLocal();
        }

        // 2. Open WebSocket
        const wsProto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const wsHost = isLocalDev ? 'localhost:5000' : 'api.tamimglobal.com';
        const wsUrl = `${wsProto}//${wsHost}/ws/chat`;

        try {
          const ws = new WebSocket(wsUrl);
          socketRef.current = ws;

          ws.onopen = () => {
            console.log('⚡ Storefront support chat WebSocket connection open.');
          };

          ws.onmessage = (event) => {
            try {
              const payload = JSON.parse(event.data);
              if (payload.type === 'message') {
                const newMsg: ChatMessage = payload.data;
                
                const stored = localStorage.getItem('storefront_chats');
                let chatsList: ChatMessage[] = [];
                if (stored) {
                  try {
                    chatsList = JSON.parse(stored);
                  } catch (e) {}
                }
                
                if (!chatsList.some(m => m.id === newMsg.id)) {
                  const updated = [...chatsList, newMsg];
                  syncChatData(updated);
                }
              }
            } catch (e) {
              console.error('Error parsing WebSocket message content:', e);
            }
          };

          ws.onerror = (err) => {
            console.warn('Storefront WebSocket connection error. Using local storage fallback polling.', err);
          };

          ws.onclose = () => {
            console.warn('Storefront WebSocket connection closed. Using local storage fallback polling.');
          };
        } catch (err) {
          console.warn('Storefront WebSocket setup failed. Using local storage fallback polling.', err);
        }
      };

      initializeChat();

      // Fallback polling just in case WebSocket is down
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
  }, [customer]);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, activeTab]);

  // Initialize and render Google Identity Services Button
  useEffect(() => {
    if (!customer) {
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
          const btnElem = document.getElementById("google-signin-btn");
          if (btnElem) {
            // @ts-ignore
            window.google.accounts.id.renderButton(
              btnElem,
              { theme: "outline", size: "large", width: btnElem.clientWidth || 396 }
            );
          }
        }
      };

      initGsi();
      const timer = setTimeout(initGsi, 1000);
      return () => clearTimeout(timer);
    }
  }, [customer]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (isRegister) {
      if (!authName || !authEmail || !authPassword || !authPhone) {
        setAuthError('Please fill in all required fields.');
        return;
      }
      const res = await register(authName, authEmail, authPassword, authPhone);
      if (!res.success) {
        setAuthError(res.error || 'Registration failed.');
      } else {
        setAuthSuccess('Account created successfully!');
      }
    } else {
      if (!authEmail || !authPassword) {
        setAuthError('Please enter your email and password.');
        return;
      }
      const res = await login(authEmail, authPassword);
      if (!res.success) {
        setAuthError(res.error || 'Login failed.');
      }
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer || !inputMessage.trim()) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      customerId: customer.id,
      customerName: customer.name,
      sender: 'customer',
      message: inputMessage.trim(),
      timestamp: new Date().toISOString(),
      read: false
    };

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'message',
        customerId: customer.id,
        customerName: customer.name,
        sender: 'customer',
        message: inputMessage.trim()
      }));
    } else {
      const storedChats = localStorage.getItem('storefront_chats');
      let allChats: ChatMessage[] = [];
      if (storedChats) {
        try {
          allChats = JSON.parse(storedChats);
        } catch (e) {}
      }

      const updatedChats = [...allChats, newMessage];
      syncChatData(updatedChats);
    }
    
    setInputMessage('');
  };

  // Order tracking status helper
  const getTrackingSteps = (status: string) => {
    const steps = [
      { key: 'placed', label: 'Order Placed', desc: 'Order received successfully', icon: Clock },
      { key: 'processing', label: 'Processing', desc: 'Packaging and verification in progress', icon: RefreshCw },
      { key: 'shipped', label: 'Handed to Courier', desc: 'Parcel handed over to courier service', icon: Truck },
      { key: 'delivered', label: 'Delivered', desc: 'Order delivered to your address', icon: CheckCircle2 }
    ];

    const lowerStatus = (status || '').toLowerCase().trim();
    let activeIndex = 0;
    if (lowerStatus === 'processing') activeIndex = 1;
    else if (lowerStatus === 'shipped' || lowerStatus === 'shipping') activeIndex = 2;
    else if (lowerStatus === 'delivered' || lowerStatus === 'completed') activeIndex = 3;
    else if (lowerStatus === 'cancelled' || lowerStatus === 'returned') activeIndex = -1;

    return { steps, activeIndex, isCancelled: lowerStatus === 'cancelled', isReturned: lowerStatus === 'returned' };
  };

  if (!customer) {
    return (
      <div className="account-auth-container" style={{ maxWidth: '460px', margin: '60px auto', padding: '0 16px' }}>
        <div style={{ background: 'white', padding: '32px', borderRadius: 'var(--sf-radius-lg)', border: '1px solid var(--sf-border)', boxShadow: 'var(--sf-shadow-md)' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ width: '48px', height: '48px', background: 'var(--sf-bg-light)', color: 'var(--sf-accent)', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <User size={24} />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--sf-text-primary)' }}>
              {isRegister ? 'Create a New Account' : 'Login to Customer Account'}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--sf-text-tertiary)', marginTop: '4px' }}>
              {isRegister ? 'Create an account for fast checkout and order tracking' : 'Login to track your orders and manage your account'}
            </p>
          </div>

          {authError && (
            <div style={{ background: '#fee2e2', color: '#ef4444', padding: '10px 12px', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} /> {authError}
            </div>
          )}

          {authSuccess && (
            <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '10px 12px', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} /> {authSuccess}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {isRegister && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--sf-text-secondary)', marginBottom: '6px' }}>Full Name *</label>
                  <input type="text" required value={authName} onChange={e => setAuthName(e.target.value)} style={{ width: '100%', height: '42px', border: '1px solid var(--sf-border)', borderRadius: '8px', padding: '0 12px', outline: 'none', backgroundColor: '#ffffff', color: '#0f172a' }} placeholder="e.g. John Doe" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--sf-text-secondary)', marginBottom: '6px' }}>Mobile Number *</label>
                  <input type="tel" required value={authPhone} onChange={e => setAuthPhone(e.target.value)} style={{ width: '100%', height: '42px', border: '1px solid var(--sf-border)', borderRadius: '8px', padding: '0 12px', outline: 'none', backgroundColor: '#ffffff', color: '#0f172a' }} placeholder="e.g. 017XXXXXXXX" />
                </div>
              </>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--sf-text-secondary)', marginBottom: '6px' }}>Email Address *</label>
              <input type="email" required value={authEmail} onChange={e => setAuthEmail(e.target.value)} style={{ width: '100%', height: '42px', border: '1px solid var(--sf-border)', borderRadius: '8px', padding: '0 12px', outline: 'none', backgroundColor: '#ffffff', color: '#0f172a' }} placeholder="e.g. example@gmail.com" />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--sf-text-secondary)', marginBottom: '6px' }}>Password *</label>
              <input type="password" required value={authPassword} onChange={e => setAuthPassword(e.target.value)} style={{ width: '100%', height: '42px', border: '1px solid var(--sf-border)', borderRadius: '8px', padding: '0 12px', outline: 'none', backgroundColor: '#ffffff', color: '#0f172a' }} placeholder="Enter password" />
            </div>

            <button type="submit" style={{ width: '100%', height: '44px', background: 'var(--sf-text-primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px' }}>
              {isRegister ? 'Create Account' : 'Login'} <ArrowRight size={16} />
            </button>
          </form>

          {/* Gmail Login Option */}
          <div style={{ position: 'relative', marginTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '16px 0', position: 'relative' }}>
              <div style={{ position: 'absolute', width: '100%', height: '1px', background: 'var(--sf-border)', zIndex: 1 }} />
              <span style={{ position: 'relative', zIndex: 2, background: 'white', padding: '0 12px', fontSize: '0.75rem', color: 'var(--sf-text-tertiary)', fontWeight: 600 }}>OR</span>
            </div>

            <div 
              id="google-signin-btn" 
              style={{ 
                width: '100%', 
                display: 'flex', 
                justifyContent: 'center', 
                marginTop: '8px', 
                minHeight: '44px' 
              }} 
            />
          </div>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem', color: 'var(--sf-text-secondary)' }}>
            {isRegister ? (
              <>
                Already have an account?{' '}
                <button onClick={() => { setIsRegister(false); setAuthError(''); }} style={{ background: 'none', border: 'none', color: 'var(--sf-accent)', fontWeight: 700, cursor: 'pointer', padding: 0 }}>
                  Login
                </button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <button onClick={() => { setIsRegister(true); setAuthError(''); }} style={{ background: 'none', border: 'none', color: 'var(--sf-accent)', fontWeight: 700, cursor: 'pointer', padding: 0 }}>
                  Create Account
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="account-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Professional 3-Dot Menu Button for Mobile */}
          <button 
            onClick={() => setIsMobileDrawerOpen(true)}
            className="account-mobile-dots-menu-btn"
            title="Account Menu"
            aria-label="Account Menu"
          >
            <MoreVertical size={20} />
          </button>

          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--sf-text-primary)' }}>Customer Portal</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--sf-text-tertiary)' }}>Welcome, {customer.name}!</p>
          </div>
        </div>

        <button onClick={logout} className="store-btn" style={{ height: '38px', background: 'white', border: '1.5px solid var(--sf-border)', color: '#ef4444', borderRadius: '8px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', padding: '0 16px' }}>
          <LogOut size={16} /> Logout
        </button>
      </div>

      {/* Backdrop Overlay for Mobile Side Drawer */}
      {isMobileDrawerOpen && (
        <div 
          className="account-drawer-overlay"
          onClick={() => setIsMobileDrawerOpen(false)}
        />
      )}

      <div className="store-products-layout">
        
        {/* Navigation Sidebar / Mobile Slide Drawer */}
        <div className={`account-sidebar ${isMobileDrawerOpen ? 'drawer-open' : ''}`}>
          {/* Drawer Header (Mobile Only) */}
          <div className="mobile-drawer-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--sf-accent) 0%, var(--sf-accent-hover) 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '14px' }}>
                {customer.avatar || 'C'}
              </div>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--sf-text-primary)', fontSize: '0.9rem' }}>{customer.name}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--sf-text-tertiary)', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{customer.email}</div>
              </div>
            </div>
            <button onClick={() => setIsMobileDrawerOpen(false)} className="drawer-close-btn" aria-label="Close menu">
              <X size={18} />
            </button>
          </div>

          <button 
            onClick={() => { setActiveTab('profile'); setSelectedOrder(null); setIsMobileDrawerOpen(false); }}
            style={{ width: '100%', padding: '12px 16px', background: activeTab === 'profile' ? 'var(--sf-bg-light)' : 'none', color: activeTab === 'profile' ? 'var(--sf-accent)' : 'var(--sf-text-secondary)', border: 'none', borderRadius: '8px', textAlign: 'left', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <User size={18} /> Profile Details
          </button>
          
          <button 
            onClick={() => { setActiveTab('orders'); setSelectedOrder(null); setIsMobileDrawerOpen(false); }}
            style={{ width: '100%', padding: '12px 16px', background: activeTab === 'orders' ? 'var(--sf-bg-light)' : 'none', color: activeTab === 'orders' ? 'var(--sf-accent)' : 'var(--sf-text-secondary)', border: 'none', borderRadius: '8px', textAlign: 'left', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <ShoppingBag size={18} /> My Orders ({orders.length})
          </button>
          
          <button 
            onClick={() => { setActiveTab('events'); setSelectedOrder(null); setIsMobileDrawerOpen(false); }}
            style={{ width: '100%', padding: '12px 16px', background: activeTab === 'events' ? 'var(--sf-bg-light)' : 'none', color: activeTab === 'events' ? 'var(--sf-accent)' : 'var(--sf-text-secondary)', border: 'none', borderRadius: '8px', textAlign: 'left', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <Trophy size={18} style={{ color: '#fbbf24' }} /> Events & Rewards
          </button>

          <button 
            onClick={() => { setActiveTab('coupons'); setSelectedOrder(null); setIsMobileDrawerOpen(false); }}
            style={{ width: '100%', padding: '12px 16px', background: activeTab === 'coupons' ? 'var(--sf-bg-light)' : 'none', color: activeTab === 'coupons' ? 'var(--sf-accent)' : 'var(--sf-text-secondary)', border: 'none', borderRadius: '8px', textAlign: 'left', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <Ticket size={18} /> My Coupons & Offers
          </button>

          <button 
            onClick={() => { setActiveTab('addresses'); setSelectedOrder(null); setIsMobileDrawerOpen(false); }}
            style={{ width: '100%', padding: '12px 16px', background: activeTab === 'addresses' ? 'var(--sf-bg-light)' : 'none', color: activeTab === 'addresses' ? 'var(--sf-accent)' : 'var(--sf-text-secondary)', border: 'none', borderRadius: '8px', textAlign: 'left', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <MapPin size={18} /> Saved Addresses ({customer.addresses?.length || 0})
          </button>
          
          <button 
            onClick={() => { setActiveTab('wishlist'); setSelectedOrder(null); setIsMobileDrawerOpen(false); }}
            style={{ width: '100%', padding: '12px 16px', background: activeTab === 'wishlist' ? 'var(--sf-bg-light)' : 'none', color: activeTab === 'wishlist' ? 'var(--sf-accent)' : 'var(--sf-text-secondary)', border: 'none', borderRadius: '8px', textAlign: 'left', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <Heart size={18} /> My Wishlist ({wishlist.length})
          </button>
          
          <button 
            onClick={() => { setActiveTab('cart'); setSelectedOrder(null); setIsMobileDrawerOpen(false); }}
            style={{ width: '100%', padding: '12px 16px', background: activeTab === 'cart' ? 'var(--sf-bg-light)' : 'none', color: activeTab === 'cart' ? 'var(--sf-accent)' : 'var(--sf-text-secondary)', border: 'none', borderRadius: '8px', textAlign: 'left', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <ShoppingCart size={18} /> Shopping Cart ({cart.reduce((s: number, i: any) => s + i.quantity, 0)})
          </button>

          {/* Divider */}
          <div style={{ margin: '12px 0', borderTop: '1px solid var(--sf-border)' }} />

          {/* Logout Action */}
          <button 
            onClick={() => { logout(); navigate('/'); setIsMobileDrawerOpen(false); }}
            style={{ width: '100%', padding: '10px 16px', background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', textAlign: 'left', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>

        {/* Tab Contents */}
        <div className="account-content-card">
          
          {/* EVENTS TAB */}
          {activeTab === 'events' && <CustomerEventsTab />}

          {/* MY COUPONS TAB */}
          {activeTab === 'coupons' && <CustomerCouponsTab email={customer.email} />}

          {/* SAVED ADDRESSES TAB */}
          {activeTab === 'addresses' && (
            <div>
              <div className="addresses-section-header" style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--sf-text-primary)' }}>
                  <MapPin size={20} style={{ color: 'var(--sf-accent)' }} /> Saved Delivery Address Book
                </h3>
                <button 
                  onClick={openAddAddressModal} 
                  className="address-action-btn set-default"
                  style={{ width: 'auto', padding: '0 16px', height: '38px', borderRadius: '8px', fontWeight: 500 }}
                >
                  <Plus size={16} /> Add New Address
                </button>
              </div>

              {!customer.addresses || customer.addresses.length === 0 ? (
                <div className="address-empty-state">
                  <MapPin size={48} style={{ opacity: 0.3, color: 'var(--sf-accent)' }} />
                  <p style={{ fontWeight: 600, fontSize: '1.05rem', margin: '12px 0 4px 0' }}>No saved addresses found</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--sf-text-secondary)', margin: 0 }}>Save your home or office address here for 1-click quick checkout in the future.</p>
                  <button 
                    onClick={openAddAddressModal}
                    style={{ marginTop: '16px', padding: '10px 20px', background: 'var(--sf-accent)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 500, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Plus size={16} /> Add Address
                  </button>
                </div>
              ) : (
                <div className="address-grid">
                  {customer.addresses.map((addr) => (
                    <div key={addr.id} className={`address-card ${addr.isDefault ? 'default-address' : ''}`}>
                      <div>
                        <div className="address-card-header">
                          <span className="address-label">{addr.label}</span>
                          {addr.isDefault && (
                            <span className="address-default-badge">
                              <CheckCircle2 size={12} /> Default
                            </span>
                          )}
                        </div>
                        
                        <div className="address-card-body" style={{ marginTop: '12px' }}>
                          <div className="address-user-name">{addr.name}</div>
                          <div className="address-user-phone">📞 {addr.phone}</div>
                          <div className="address-details">{addr.address}</div>
                        </div>
                      </div>

                      <div className="address-card-actions">
                        {!addr.isDefault && (
                          <button 
                            onClick={() => setDefaultCustomerAddress(addr.id)} 
                            className="address-action-btn set-default"
                          >
                            Set as Default
                          </button>
                        )}
                        <button 
                          onClick={() => openEditAddressModal(addr)} 
                          className="address-action-btn"
                        >
                          <Edit size={12} /> Edit
                        </button>
                        <button 
                          onClick={() => deleteCustomerAddress(addr.id)} 
                          className="address-action-btn" 
                          style={{ color: '#ef4444' }}
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '20px', borderBottom: '1px solid var(--sf-border)', paddingBottom: '10px' }}>Profile Details</h3>
              
              <div className="profile-badge-row">
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--sf-accent) 0%, var(--sf-accent-hover) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 600, color: 'white' }}>
                  {customer.avatar || 'C'}
                </div>
                <div>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--sf-text-primary)' }}>{customer.name}</h4>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                    <span style={{ background: 'var(--sf-bg-light)', color: 'var(--sf-accent)', fontSize: '0.75rem', fontWeight: 600, padding: '4px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                      {customer.isGmail ? 'Gmail Account' : 'Verified Customer'}
                    </span>
                    <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--sf-success)', fontSize: '0.75rem', fontWeight: 500, padding: '4px 8px', borderRadius: '4px' }}>
                      Member since: {new Date(customer.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                    </span>
                  </div>
                </div>
              </div>

              {profileSuccess && (
                <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '12px', borderRadius: '8px', fontSize: '0.88rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
                  <CheckCircle2 size={16} /> {profileSuccess}
                </div>
              )}

              {profileError && (
                <div style={{ background: '#fee2e2', color: '#ef4444', padding: '12px', borderRadius: '8px', fontSize: '0.88rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
                  <AlertCircle size={16} /> {profileError}
                </div>
              )}

              <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--sf-text-secondary)', marginBottom: '6px' }}>Full Name *</label>
                    <input 
                      type="text" 
                      required 
                      value={profileName} 
                      onChange={e => setProfileName(e.target.value)} 
                      style={{ width: '100%', height: '42px', border: '1px solid var(--sf-border)', borderRadius: '8px', padding: '0 12px', outline: 'none', background: 'var(--sf-bg-light)', color: 'var(--sf-text-primary)' }} 
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--sf-text-secondary)', marginBottom: '6px' }}>Email (Non-editable)</label>
                    <input 
                      type="email" 
                      disabled 
                      value={customer.email} 
                      style={{ width: '100%', height: '42px', border: '1px solid var(--sf-border)', borderRadius: '8px', padding: '0 12px', outline: 'none', background: '#e2e8f0', color: 'var(--sf-text-secondary)', cursor: 'not-allowed' }} 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--sf-text-secondary)', marginBottom: '6px' }}>Mobile Number *</label>
                    <input 
                      type="tel" 
                      required 
                      value={profilePhone} 
                      onChange={e => setProfilePhone(e.target.value)} 
                      style={{ width: '100%', height: '42px', border: '1px solid var(--sf-border)', borderRadius: '8px', padding: '0 12px', outline: 'none', background: 'var(--sf-bg-light)', color: 'var(--sf-text-primary)' }} 
                      placeholder="e.g. 017XXXXXXXX"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--sf-text-secondary)', marginBottom: '6px' }}>Registration Date</label>
                    <input 
                      type="text" 
                      disabled 
                      value={new Date(customer.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} 
                      style={{ width: '100%', height: '42px', border: '1px solid var(--sf-border)', borderRadius: '8px', padding: '0 12px', outline: 'none', background: '#e2e8f0', color: 'var(--sf-text-secondary)', cursor: 'not-allowed' }} 
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--sf-text-secondary)', marginBottom: '6px' }}>Delivery Address</label>
                  <textarea 
                    value={profileAddress} 
                    onChange={e => setProfileAddress(e.target.value)} 
                    style={{ width: '100%', minHeight: '80px', border: '1px solid var(--sf-border)', borderRadius: '8px', padding: '10px 12px', outline: 'none', background: 'var(--sf-bg-light)', color: 'var(--sf-text-primary)', resize: 'vertical', fontFamily: 'inherit' }} 
                    placeholder="Enter house/holding no, road no, area, city details"
                  />
                </div>

                <button 
                  type="submit" 
                  style={{ height: '44px', background: 'var(--sf-text-primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 500, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '0 24px', alignSelf: 'flex-start', transition: 'background 0.2s' }}
                >
                  Save Profile
                </button>
              </form>

              {/* SAVED ADDRESSES SECTION */}
              <div className="addresses-section">
                <div className="addresses-section-header">
                  <h4 className="addresses-section-title">
                    <MapPin size={18} /> Saved Delivery Addresses
                  </h4>
                  <button 
                    onClick={openAddAddressModal} 
                    className="address-action-btn set-default"
                    style={{ width: 'auto', padding: '0 16px', height: '36px' }}
                  >
                    <Plus size={14} /> Add New
                  </button>
                </div>

                {!customer.addresses || customer.addresses.length === 0 ? (
                  <div className="address-empty-state">
                    <MapPin size={40} style={{ opacity: 0.3 }} />
                    <p style={{ fontWeight: 500, margin: 0 }}>No saved addresses found.</p>
                    <p style={{ fontSize: '0.8rem', margin: 0 }}>Save your delivery addresses here for quicker checkout.</p>
                  </div>
                ) : (
                  <div className="address-grid">
                    {customer.addresses.map((addr) => (
                      <div key={addr.id} className={`address-card ${addr.isDefault ? 'default-address' : ''}`}>
                        <div>
                          <div className="address-card-header">
                            <span className="address-label">{addr.label}</span>
                            {addr.isDefault && (
                              <span className="address-default-badge">
                                <CheckCircle2 size={12} /> Default
                              </span>
                            )}
                          </div>
                          
                          <div className="address-card-body" style={{ marginTop: '12px' }}>
                            <div className="address-user-name">{addr.name}</div>
                            <div className="address-user-phone">📞 {addr.phone}</div>
                            <div className="address-details">{addr.address}</div>
                          </div>
                        </div>

                        <div className="address-card-actions">
                          {!addr.isDefault && (
                            <button 
                              onClick={() => setDefaultCustomerAddress(addr.id)} 
                              className="address-action-btn set-default"
                              title="Set as Default"
                            >
                              Set as Default
                            </button>
                          )}
                          <button 
                            onClick={() => openEditAddressModal(addr)} 
                            className="address-action-btn"
                          >
                            <Edit size={12} /> Edit
                          </button>
                          <button 
                            onClick={() => deleteCustomerAddress(addr.id)} 
                            className="address-action-btn delete"
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* WISHLIST TAB */}
          {activeTab === 'wishlist' && (
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '20px', borderBottom: '1px solid var(--sf-border)', paddingBottom: '10px' }}>My Wishlist</h3>
              {wishlist.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--sf-text-tertiary)' }}>
                  <Heart size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                  <p style={{ fontWeight: 500, color: 'var(--sf-text-secondary)' }}>Your wishlist is empty.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {config.products
                    .filter((product: any) => wishlist.some((id: any) => String(id) === String(product.id)))
                    .map((product: any) => (
                      <div key={product.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', border: '1px solid var(--sf-border)', borderRadius: '8px', background: 'var(--sf-bg-card)' }}>
                        <img src={product.image} alt={product.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                        <div style={{ flexGrow: 1 }}>
                          <Link to={createProductSlug(product)} style={{ textDecoration: 'none', color: 'var(--sf-text-primary)', fontWeight: 600 }}>{product.name}</Link>
                          <div style={{ color: 'var(--sf-accent)', fontWeight: 600, marginTop: '4px' }}>৳{product.price}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={() => { addToCart(product); toggleWishlist(product.id); }} 
                            style={{ padding: '8px 12px', background: 'var(--sf-accent)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 500, fontSize: '0.85rem' }}
                          >
                            Add to Cart
                          </button>
                          <button 
                            onClick={() => toggleWishlist(product.id)} 
                            style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 500, fontSize: '0.85rem' }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* CART TAB */}
          {activeTab === 'cart' && (
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '20px', borderBottom: '1px solid var(--sf-border)', paddingBottom: '10px' }}>Shopping Cart</h3>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--sf-text-tertiary)' }}>
                  <ShoppingCart size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                  <p style={{ fontWeight: 500, color: 'var(--sf-text-secondary)' }}>Your cart is empty.</p>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                    {cart.map((item: any) => (
                      <div key={item.product.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', border: '1px solid var(--sf-border)', borderRadius: '8px', background: 'var(--sf-bg-card)' }}>
                        <img src={item.product.image} alt={item.product.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                        <div style={{ flexGrow: 1 }}>
                          <Link to={createProductSlug(item.product)} style={{ textDecoration: 'none', color: 'var(--sf-text-primary)', fontWeight: 600 }}>{item.product.name}</Link>
                          <div style={{ color: 'var(--sf-accent)', fontWeight: 600, marginTop: '4px' }}>৳{(item.product.price * item.quantity).toFixed(2)}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--sf-border)', borderRadius: '4px', overflow: 'hidden' }}>
                            <button onClick={() => updateQuantity(item.product.id, -1)} style={{ padding: '4px 8px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sf-text-primary)' }}>-</button>
                            <span style={{ padding: '0 8px', fontWeight: 500 }}>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.product.id, 1)} style={{ padding: '4px 8px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sf-text-primary)' }}>+</button>
                          </div>
                          <button 
                            onClick={() => updateQuantity(item.product.id, -item.quantity)} 
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderTop: '1px solid var(--sf-border)', marginTop: '20px' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>Total Amount: ৳{cartTotal.toFixed(2)}</div>
                    <Link to="/checkout" style={{ padding: '10px 24px', background: 'var(--sf-accent)', color: 'white', borderRadius: '6px', fontWeight: 500, textDecoration: 'none', fontSize: '0.95rem' }}>
                      Proceed to Checkout
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div>
              {!selectedOrder ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--sf-border)', paddingBottom: '10px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0 }}>My Order History</h3>
                    <button onClick={loadCustomerOrders} disabled={loadingOrders} style={{ background: 'none', border: 'none', color: 'var(--sf-accent)', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                      <RefreshCw size={14} className={loadingOrders ? 'animate-spin' : ''} /> Refresh
                    </button>
                  </div>

                  {loadingOrders ? (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>Loading orders...</div>
                  ) : orders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--sf-text-tertiary)' }}>
                      <ShoppingBag size={48} style={{ opacity: 0.2, marginBottom: '12px' }} />
                      <p style={{ fontWeight: 500 }}>No orders found.</p>
                      <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>Ensure the email or phone number used during checkout matches your profile.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {orders.map((order, idx) => {
                        const lowerSt = (order.status || '').toLowerCase().trim();
                        let badgeBg = '#fef3c7';
                        let badgeColor = '#92400e';
                        let badgeText = 'Pending';

                        if (lowerSt === 'delivered' || lowerSt === 'completed') {
                          badgeBg = '#d1fae5';
                          badgeColor = '#065f46';
                          badgeText = 'Delivered';
                        } else if (lowerSt === 'shipped' || lowerSt === 'shipping') {
                          badgeBg = '#dbeafe';
                          badgeColor = '#1e40af';
                          badgeText = 'Handed to Courier';
                        } else if (lowerSt === 'processing') {
                          badgeBg = '#e0f2fe';
                          badgeColor = '#0369a1';
                          badgeText = 'Processing';
                        } else if (lowerSt === 'cancelled') {
                          badgeBg = '#fee2e2';
                          badgeColor = '#991b1b';
                          badgeText = 'Cancelled';
                        } else if (lowerSt === 'returned') {
                          badgeBg = '#f3e8ff';
                          badgeColor = '#6b21a8';
                          badgeText = 'Returned';
                        }

                        return (
                          <div key={idx} style={{ border: '1px solid var(--sf-border)', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', transition: 'box-shadow 0.2s' }} onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--sf-shadow-sm)'} onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--sf-text-primary)', fontSize: '0.95rem' }}>Order ID: #{order.id}</div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--sf-text-tertiary)', marginTop: '2px' }}>Date: {new Date(order.date || order.created_at || Date.now()).toLocaleDateString('en-US')}</div>
                              <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--sf-text-secondary)', marginTop: '6px' }}>Total Amount: ৳{order.amount} ({order.items} {order.items === 1 ? 'item' : 'items'})</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span style={{ 
                                padding: '6px 12px', 
                                borderRadius: '20px', 
                                fontSize: '0.78rem', 
                                fontWeight: 600,
                                background: badgeBg,
                                color: badgeColor
                              }}>
                                {badgeText}
                              </span>
                              <button onClick={() => setSelectedOrder(order)} className="store-btn" style={{ height: '36px', background: 'var(--sf-text-primary)', color: 'white', border: 'none', borderRadius: '8px', padding: '0 12px', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer' }}>
                                Track Order
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                /* ORDER TIMELINE DETAILS */
                (() => {
                  const currentActiveOrder = orders.find(o => String(o.id) === String(selectedOrder.id)) || selectedOrder;
                  const trackingData = getTrackingSteps(currentActiveOrder.status);
                  
                  return (
                    <div>
                      <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', color: 'var(--sf-text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', fontWeight: 500, cursor: 'pointer', marginBottom: '20px', padding: 0 }}>
                        <ArrowLeft size={16} /> Back to Order List
                      </button>

                      <div style={{ border: '1px solid var(--sf-border)', borderRadius: '16px', padding: '24px', background: 'var(--sf-bg-light)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--sf-border)', paddingBottom: '16px', marginBottom: '24px' }}>
                          <div>
                            <h4 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0 }}>Order Tracking Details</h4>
                            <div style={{ fontSize: '0.85rem', color: 'var(--sf-text-tertiary)', marginTop: '4px' }}>Order ID: <strong>#{currentActiveOrder.id}</strong> | Date: {new Date(currentActiveOrder.date || currentActiveOrder.created_at || Date.now()).toLocaleString('en-US')}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--sf-text-tertiary)' }}>Total Amount</div>
                            <div style={{ fontSize: '1.3rem', fontWeight: 600, color: 'var(--sf-text-primary)', marginTop: '2px' }}>৳{currentActiveOrder.amount}</div>
                          </div>
                        </div>

                        {/* Special alert banner for Cancelled / Returned orders */}
                        {trackingData.isCancelled && (
                          <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px 16px', borderRadius: '8px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <AlertCircle size={20} /> This order has been Cancelled.
                          </div>
                        )}
                        {trackingData.isReturned && (
                          <div style={{ background: '#f3e8ff', color: '#6b21a8', padding: '12px 16px', borderRadius: '8px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <RotateCcw size={20} /> This order has been Returned.
                          </div>
                        )}

                        {/* Timeline Graph */}
                        <div style={{ position: 'relative', padding: '10px 0 20px 20px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                          
                          {/* Timeline Vertical Progress bar background line */}
                          <div style={{ position: 'absolute', left: '30px', top: '15px', bottom: '45px', width: '3px', background: 'var(--sf-border)', zIndex: 1 }} />
                          
                          {/* Timeline Vertical Active bar line */}
                          <div style={{ 
                            position: 'absolute', 
                            left: '30px', 
                            top: '15px', 
                            height: `${(Math.max(0, trackingData.activeIndex) / 3) * 100}%`,
                            maxHeight: 'calc(100% - 60px)',
                            width: '3px', 
                            background: 'linear-gradient(to bottom, var(--sf-accent), var(--sf-success))', 
                            zIndex: 2,
                            transition: 'height 0.5s ease'
                          }} />

                          {trackingData.steps.map((step, idx) => {
                            const isDone = trackingData.activeIndex >= 0 && idx <= trackingData.activeIndex;
                            return (
                              <div key={idx} style={{ display: 'flex', gap: '20px', position: 'relative', zIndex: 5 }}>
                                <div style={{ 
                                  width: '24px', 
                                  height: '24px', 
                                  borderRadius: '50%', 
                                  background: isDone ? 'var(--sf-success)' : 'white', 
                                  border: `2px solid ${isDone ? 'var(--sf-success)' : 'var(--sf-border)'}`,
                                  color: isDone ? 'white' : 'var(--sf-text-tertiary)',
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center',
                                  boxShadow: '0 0 0 4px white',
                                  transition: 'all 0.3s'
                                }}>
                                  {isDone ? <CheckCircle2 size={14} /> : <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--sf-text-tertiary)' }} />}
                                </div>
                                <div>
                                  <div style={{ fontWeight: 600, fontSize: '0.95rem', color: isDone ? 'var(--sf-text-primary)' : 'var(--sf-text-tertiary)' }}>{step.label}</div>
                                  <div style={{ fontSize: '0.8rem', color: 'var(--sf-text-tertiary)', marginTop: '2px' }}>{step.desc}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div style={{ borderTop: '1px solid var(--sf-border)', paddingTop: '20px', marginTop: '10px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                          <div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--sf-text-tertiary)' }}>Courier Service</div>
                            <div style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '2px', color: 'var(--sf-text-primary)' }}>
                              {currentActiveOrder.courier || (currentActiveOrder as any).courier_name || 'Steadfast Courier'}
                            </div>
                          </div>

                          {((currentActiveOrder as any).tracking_code || (currentActiveOrder as any).trackingCode || (currentActiveOrder as any).consignment_id) && (
                            <div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--sf-text-tertiary)' }}>Tracking Code</div>
                              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: '2px', color: '#10b981' }}>
                                {(currentActiveOrder as any).tracking_code || (currentActiveOrder as any).trackingCode || (currentActiveOrder as any).consignment_id}
                              </div>
                              <a 
                                href={`https://steadfast.com.bd/tracking/${(currentActiveOrder as any).tracking_code || (currentActiveOrder as any).trackingCode}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'var(--sf-accent)', fontWeight: 600, marginTop: '4px', textDecoration: 'none' }}
                              >
                                Track Parcel on Steadfast ↗
                              </a>
                            </div>
                          )}

                          <div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--sf-text-tertiary)' }}>Delivery Address</div>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: '2px', color: 'var(--sf-text-primary)' }}>
                              {currentActiveOrder.address || 'Dhaka, Bangladesh'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
          )}

        </div>
      </div>

      {/* ADDRESS MODAL */}
      {isAddressModalOpen && (
        <div className="address-modal-overlay" onClick={resetAddressForm}>
          <div className="address-modal" onClick={e => e.stopPropagation()}>
            <div className="address-modal-header">
              <h3 className="address-modal-title">
                {editingAddress ? 'Edit Saved Address' : 'Add New Delivery Address'}
              </h3>
              <button className="address-modal-close-btn" onClick={resetAddressForm}>
                <X size={18} />
              </button>
            </div>

            {addressError && (
              <div style={{ background: '#fee2e2', color: '#ef4444', padding: '10px 12px', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} /> {addressError}
              </div>
            )}

            <form onSubmit={handleAddressSubmit} className="address-form">
              <div>
                <label className="address-form-label">Address Label <span>*</span></label>
                <input 
                  type="text" 
                  required 
                  value={addressLabel} 
                  onChange={e => setAddressLabel(e.target.value)} 
                  className="address-form-input" 
                  placeholder="e.g. Home, Office, Shop" 
                />
              </div>

              <div>
                <label className="address-form-label">Customer Name (Full Name) <span>*</span></label>
                <input 
                  type="text" 
                  required 
                  value={addressName} 
                  onChange={e => setAddressName(e.target.value)} 
                  className="address-form-input" 
                  placeholder="Recipient Name" 
                />
              </div>

              <div>
                <label className="address-form-label">Mobile Number (Phone Number) <span>*</span></label>
                <input 
                  type="tel" 
                  required 
                  value={addressPhone} 
                  onChange={e => setAddressPhone(e.target.value)} 
                  className="address-form-input" 
                  placeholder="e.g. 017XXXXXXXX" 
                />
              </div>

              <div>
                <label className="address-form-label">Detailed Address <span>*</span></label>
                <textarea 
                  required 
                  value={addressDetail} 
                  onChange={e => setAddressDetail(e.target.value)} 
                  className="address-form-textarea" 
                  placeholder="Enter house/holding no, road no, area, city details"
                />
              </div>

              <div className="address-form-checkbox-row" onClick={() => setAddressIsDefault(!addressIsDefault)}>
                <input 
                  type="checkbox" 
                  checked={addressIsDefault} 
                  onChange={() => {}} 
                  className="address-form-checkbox" 
                />
                <span className="address-form-checkbox-label">Set as my default delivery address</span>
              </div>

              <div className="address-form-actions">
                <button type="button" onClick={resetAddressForm} className="address-btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="address-btn-save">
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
