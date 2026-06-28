import type { Order } from '../types';

const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const API_BASE = isLocalDev
  ? `${window.location.protocol}//${window.location.hostname}:5000/api/v1`
  : 'https://beauty-elegance-admin.onrender.com/api/v1';

// Build helper for authorization token header injection
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('admin_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Login admin employee via backend
export const loginToBackend = async (email: string, password: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    return await response.json();
  } catch (e) {
    console.error('Failed to connect to authentication server:', e);
    return { status: 'error', message: 'Authentication server is offline or unreachable.' };
  }
};

// Check if server is running
export const checkServerHealth = async (): Promise<boolean> => {
  try {
    const res = await fetch(`${API_BASE}/../health`);
    if (!res.ok) return false;
    const data = await res.json();
    return data.status === 'ok';
  } catch (e) {
    return false;
  }
};

// Send Order to backend database
export const sendOrderToBackend = async (orderData: any): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    if (!response.ok) return false;
    const result = await response.json();
    return result.status === 'success';
  } catch (e) {
    console.warn('Backend server is down or unreachable. Falling back to local storage helper.', e);
    return false;
  }
};

// Fetch all orders from backend database
export const fetchOrdersFromBackend = async (): Promise<Order[] | null> => {
  try {
    const response = await fetch(`${API_BASE}/orders`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    if (!response.ok) return null;
    const result = await response.json();
    if (result.status !== 'success' || !Array.isArray(result.data)) return null;

    return result.data.map((order: any) => ({
      id: order.id,
      customer: order.customer,
      email: order.email,
      amount: order.amount,
      status: order.status,
      items: order.items,
      date: order.created_at || order.date,
      paymentMethod: order.payment_method || order.paymentMethod,
      storeName: order.store_name || order.storeName,
      phone: order.phone,
      address: order.address,
      courier: order.courier,
      city: order.city,
      thana: order.thana,
      area: order.area,
      customerNote: order.customer_note || order.customerNote,
      shopNote: order.shop_note || order.shopNote,
      paymentType: order.payment_type || order.paymentType,
      memoNumber: order.memo_number || order.memoNumber,
      deliveryCharge: order.delivery_charge || order.deliveryCharge,
      discount: order.discount,
      paidAmount: order.paid_amount || order.paidAmount,
      subtotal: order.subtotal,
      productsList: order.productsList || []
    }));
  } catch (e) {
    console.warn('Backend server is down or unreachable. Using frontend localStorage mock data. Error:', e);
    return null;
  }
};

// Update order status in backend database
export const updateOrderStatusInBackend = async (orderId: string, status: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) return false;
    const result = await response.json();
    return result.status === 'success';
  } catch (e) {
    console.warn(`Failed to update status for order ${orderId} in backend:`, e);
    return false;
  }
};

// Helper to map backend ID (like "PRD-001") to frontend ID (like 1)
export const toFrontendId = (backendId: string): string | number => {
  if (typeof backendId === 'string' && backendId.startsWith('PRD-00')) {
    const num = parseInt(backendId.replace('PRD-00', ''));
    if (!isNaN(num) && num >= 1 && num <= 8) {
      return num;
    }
  }
  return backendId;
};

// Helper to map frontend ID (like 1) to backend ID (like "PRD-001")
export const toBackendId = (frontendId: string | number): string => {
  const num = Number(frontendId);
  if (!isNaN(num) && num >= 1 && num <= 8) {
    return `PRD-00${num}`;
  }
  return String(frontendId);
};

// Map backend product schema (snake_case) to frontend product schema (camelCase)
const mapProductToFrontend = (p: any): any => {
  if (!p) return null;
  return {
    id: toFrontendId(p.id),
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    brand: p.brand || '',
    category: p.category,
    price: Number(p.price),
    originalPrice: p.original_price ? Number(p.original_price) : null,
    rating: Number(p.rating || 0),
    reviews: Number(p.reviews || 0),
    image: p.image,
    gallery: p.gallery || [p.image],
    badge: p.badge || (p.original_price && p.price < p.original_price ? 'sale' : null),
    inStock: p.in_stock === 1 || p.in_stock === true || p.stock > 0,
    published: p.published === 1 || p.published === true,
    description: p.description || '',
    features: Array.isArray(p.features) ? p.features : (p.features ? JSON.parse(p.features) : []),
    specs: Array.isArray(p.specs) ? p.specs : (p.specs ? JSON.parse(p.specs) : []),
    stock: p.stock !== undefined ? Number(p.stock) : 0,
    sold: p.sold !== undefined ? Number(p.sold) : 0,
    revenue: p.revenue !== undefined ? Number(p.revenue) : 0,
    customerReviews: p.customerReviews || []
  };
};

// Fetch all products from backend SQLite
export const fetchProductsFromBackend = async (): Promise<any[] | null> => {
  try {
    const response = await fetch(`${API_BASE}/products`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    if (!response.ok) return null;
    const result = await response.json();
    if (result.status !== 'success' || !Array.isArray(result.data)) return null;
    return result.data.map(mapProductToFrontend);
  } catch (e) {
    console.warn('Backend server offline. Using mock products from config.', e);
    return null;
  }
};

// Fetch a single product by ID from backend SQLite
export const fetchProductByIdFromBackend = async (id: string | number): Promise<any | null> => {
  try {
    const backendId = toBackendId(id);
    const response = await fetch(`${API_BASE}/products/${backendId}`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    if (!response.ok) return null;
    const result = await response.json();
    if (result.status !== 'success' || !result.data) return null;
    return mapProductToFrontend(result.data);
  } catch (e) {
    console.warn(`Failed to fetch product ${id} from backend:`, e);
    return null;
  }
};

// Create a new product in backend SQLite
export const createProductInBackend = async (productData: any): Promise<any> => {
  try {
    const backendProduct = {
      name: productData.name,
      slug: productData.slug || productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      sku: productData.sku,
      brand: productData.brand || '',
      category: productData.category,
      price: Number(productData.price),
      original_price: productData.originalPrice ? Number(productData.originalPrice) : null,
      image: productData.image,
      description: productData.description || '',
      stock: Number(productData.stock || 0),
      published: productData.published ? 1 : 0,
      features: productData.features || [],
      specs: productData.specs || [],
      gallery: productData.gallery || []
    };

    const response = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(backendProduct),
    });
    if (!response.ok) return { status: 'error', message: 'HTTP error' };
    return await response.json();
  } catch (e) {
    console.warn('Failed to save product to backend:', e);
    return { status: 'error', message: 'Network error' };
  }
};

// Update an existing product in backend SQLite
export const updateProductInBackend = async (id: string | number, productData: any): Promise<boolean> => {
  try {
    const backendId = toBackendId(id);
    const backendProduct = {
      name: productData.name,
      slug: productData.slug || productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      sku: productData.sku,
      brand: productData.brand || '',
      category: productData.category,
      price: Number(productData.price),
      original_price: productData.originalPrice ? Number(productData.originalPrice) : null,
      image: productData.image,
      description: productData.description || '',
      stock: Number(productData.stock || 0),
      published: productData.published ? 1 : 0,
      features: productData.features,
      specs: productData.specs,
      gallery: productData.gallery
    };

    const response = await fetch(`${API_BASE}/products/${backendId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(backendProduct),
    });
    if (!response.ok) return false;
    const result = await response.json();
    return result.status === 'success';
  } catch (e) {
    console.warn(`Failed to update product ${id} in backend:`, e);
    return false;
  }
};

// Delete a product from backend SQLite
export const deleteProductFromBackend = async (id: string | number): Promise<boolean> => {
  try {
    const backendId = toBackendId(id);
    const response = await fetch(`${API_BASE}/products/${backendId}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders(),
      },
    });
    if (!response.ok) return false;
    const result = await response.json();
    return result.status === 'success';
  } catch (e) {
    console.warn(`Failed to delete product ${id} from backend:`, e);
    return false;
  }
};

// Create a manual order from Admin panel
export const createOrderFromAdminInBackend = async (orderData: any): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(orderData),
    });
    if (!response.ok) return false;
    const result = await response.json();
    return result.status === 'success';
  } catch (e) {
    console.warn('Failed to save manual order to backend:', e);
    return false;
  }
};

// Update an existing order details from Admin panel
export const updateOrderInBackend = async (orderId: string, orderData: any): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/orders/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(orderData),
    });
    if (!response.ok) return false;
    const result = await response.json();
    return result.status === 'success';
  } catch (e) {
    console.warn(`Failed to update order ${orderId} in backend:`, e);
    return false;
  }
};

// Fetch dynamic aggregated statistics from backend database for administration dashboard
export const fetchDashboardStats = async (): Promise<any | null> => {
  try {
    const response = await fetch(`${API_BASE}/dashboard/stats`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    if (!response.ok) return null;
    const result = await response.json();
    if (result.status !== 'success') return null;
    return result.data;
  } catch (e) {
    console.warn('Backend server offline or statistics unavailable. Falling back to mock dataset.', e);
    return null;
  }
};

// Fetch system settings from backend database
export const fetchSystemSettings = async (): Promise<any | null> => {
  try {
    const response = await fetch(`${API_BASE}/settings`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    if (!response.ok) return null;
    const result = await response.json();
    if (result.status !== 'success') return null;
    return result.data;
  } catch (e) {
    console.warn('Backend server offline or settings unavailable. Using mock settings.', e);
    return null;
  }
};

// Save updated system settings to backend database
export const saveSystemSettings = async (settingsData: any): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(settingsData),
    });
    if (!response.ok) return false;
    const result = await response.json();
    return result.status === 'success';
  } catch (e) {
    console.warn('Failed to save system settings to backend:', e);
    return false;
  }
};

// Fetch support chat history logs from backend database
export const fetchChatHistory = async (): Promise<any[] | null> => {
  try {
    const response = await fetch(`${API_BASE}/chats`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    if (!response.ok) return null;
    const result = await response.json();
    if (result.status !== 'success' || !Array.isArray(result.data)) return null;
    return result.data;
  } catch (e) {
    console.warn('Failed to load chat history from backend:', e);
    return null;
  }
};

// Synchronize customer messages read flag status in database
export const markCustomerChatAsRead = async (customerId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/chats/read/${customerId}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(),
      },
    });
    if (!response.ok) return false;
    const result = await response.json();
    return result.status === 'success';
  } catch (e) {
    console.warn(`Failed to mark customer ${customerId} chats as read:`, e);
    return false;
  }
};

// Fetch registered employees
export const fetchEmployees = async (): Promise<any[] | null> => {
  try {
    const res = await fetch(`${API_BASE}/employees`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.status === 'success' ? json.data : null;
  } catch (e) {
    return null;
  }
};

// Update employee status, role, department
export const updateEmployee = async (id: string, data: any): Promise<any> => {
  try {
    const res = await fetch(`${API_BASE}/employees/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(data)
    });
    return await res.json();
  } catch (e) {
    return { status: 'error', message: 'Failed to update employee' };
  }
};

// Delete employee
export const deleteEmployee = async (id: string): Promise<any> => {
  try {
    const res = await fetch(`${API_BASE}/employees/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return await res.json();
  } catch (e) {
    return { status: 'error', message: 'Failed to delete employee' };
  }
};

// Fetch invitations
export const fetchInvitations = async (): Promise<any[] | null> => {
  try {
    const res = await fetch(`${API_BASE}/employees/invitations`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.status === 'success' ? json.data : null;
  } catch (e) {
    return null;
  }
};

// Create invitation
export const inviteEmployee = async (data: { email: string; role_id: number }): Promise<any> => {
  try {
    const res = await fetch(`${API_BASE}/employees/invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(data)
    });
    return await res.json();
  } catch (e) {
    return { status: 'error', message: 'Failed to invite employee' };
  }
};

// Revoke/Delete invitation
export const deleteInvitation = async (id: string): Promise<any> => {
  try {
    const res = await fetch(`${API_BASE}/employees/invitations/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return await res.json();
  } catch (e) {
    return { status: 'error', message: 'Failed to delete invitation' };
  }
};

// Fetch roles
export const fetchRoles = async (): Promise<any[] | null> => {
  try {
    const res = await fetch(`${API_BASE}/employees/roles`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.status === 'success' ? json.data : null;
  } catch (e) {
    return null;
  }
};

// Create custom role
export const createRole = async (data: { name: string; description: string; permissions: string[] }): Promise<any> => {
  try {
    const res = await fetch(`${API_BASE}/employees/roles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(data)
    });
    return await res.json();
  } catch (e) {
    return { status: 'error', message: 'Failed to create role' };
  }
};

// Update custom role
export const updateRole = async (id: number, data: { name: string; description: string; permissions: string[] }): Promise<any> => {
  try {
    const res = await fetch(`${API_BASE}/employees/roles/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(data)
    });
    return await res.json();
  } catch (e) {
    return { status: 'error', message: 'Failed to update role' };
  }
};

// Delete custom role
export const deleteRole = async (id: number): Promise<any> => {
  try {
    const res = await fetch(`${API_BASE}/employees/roles/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return await res.json();
  } catch (e) {
    return { status: 'error', message: 'Failed to delete role' };
  }
};

// Verify invitation token (Public)
export const verifyInvitationToken = async (token: string): Promise<any> => {
  try {
    const res = await fetch(`${API_BASE}/employees/invite/verify?token=${encodeURIComponent(token)}`);
    return await res.json();
  } catch (e) {
    return { status: 'error', message: 'সার্ভারে সংযোগ করা যাচ্ছে না।' };
  }
};

// Register invited employee (Public)
export const registerEmployee = async (data: any): Promise<any> => {
  try {
    const res = await fetch(`${API_BASE}/employees/invite/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return await res.json();
  } catch (e) {
    return { status: 'error', message: 'সার্ভারে সংযোগ করা যাচ্ছে না।' };
  }
};

// Fetch promo coupons
export const fetchCoupons = async (): Promise<any[] | null> => {
  try {
    const res = await fetch(`${API_BASE}/marketing/coupons`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.status === 'success' ? json.data : null;
  } catch (e) {
    return null;
  }
};

// Create a coupon
export const createCoupon = async (data: { code: string; type: string; value: number; expiry: string }): Promise<any> => {
  try {
    const res = await fetch(`${API_BASE}/marketing/coupons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(data)
    });
    return await res.json();
  } catch (e) {
    return { status: 'error', message: 'Failed to create coupon' };
  }
};

// Delete a coupon
export const deleteCoupon = async (code: string): Promise<any> => {
  try {
    const res = await fetch(`${API_BASE}/marketing/coupons/${encodeURIComponent(code)}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return await res.json();
  } catch (e) {
    return { status: 'error', message: 'Failed to delete coupon' };
  }
};

// Validate coupon for checkout (Public)
export const validateCouponCode = async (code: string): Promise<any> => {
  try {
    const res = await fetch(`${API_BASE}/marketing/coupons/validate/${encodeURIComponent(code)}`);
    return await res.json();
  } catch (e) {
    return { status: 'error', message: 'সার্ভারে সংযোগ করা যাচ্ছে না।' };
  }
};

// Fetch newsletter subscribers
export const fetchSubscribers = async (): Promise<any[] | null> => {
  try {
    const res = await fetch(`${API_BASE}/marketing/subscribers`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.status === 'success' ? json.data : null;
  } catch (e) {
    return null;
  }
};

// Subscribe to newsletter (Public)
export const subscribeToNewsletter = async (email: string): Promise<any> => {
  try {
    const res = await fetch(`${API_BASE}/marketing/subscribers/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });
    return await res.json();
  } catch (e) {
    return { status: 'error', message: 'সার্ভারে সংযোগ করা যাচ্ছে না।' };
  }
};

// Delete subscriber from log
export const deleteSubscriber = async (id: number): Promise<any> => {
  try {
    const res = await fetch(`${API_BASE}/marketing/subscribers/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return await res.json();
  } catch (e) {
    return { status: 'error', message: 'Failed to delete subscriber' };
  }
};

// Fetch live advanced analytics
export const fetchAnalyticsData = async (range: string): Promise<any | null> => {
  try {
    const res = await fetch(`${API_BASE}/analytics?range=${encodeURIComponent(range)}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.status === 'success' ? json.data : null;
  } catch (e) {
    return null;
  }
};

// Fetch campaigns from backend (Public)
export const fetchCampaignsFromBackend = async (): Promise<any[] | null> => {
  try {
    const res = await fetch(`${API_BASE}/marketing/campaigns`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.status === 'success' ? json.data : null;
  } catch (e) {
    return null;
  }
};

// Create campaign in backend
export const createCampaignInBackend = async (campaignData: any): Promise<any> => {
  try {
    const res = await fetch(`${API_BASE}/marketing/campaigns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(campaignData)
    });
    return await res.json();
  } catch (e) {
    return { status: 'error', message: 'Failed to create campaign' };
  }
};

// Update campaign status in backend
export const updateCampaignInBackend = async (id: string, status: string): Promise<any> => {
  try {
    const res = await fetch(`${API_BASE}/marketing/campaigns/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ status })
    });
    return await res.json();
  } catch (e) {
    return { status: 'error', message: 'Failed to update campaign' };
  }
};

// Delete campaign from backend
export const deleteCampaignFromBackend = async (id: string): Promise<any> => {
  try {
    const res = await fetch(`${API_BASE}/marketing/campaigns/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return await res.json();
  } catch (e) {
    return { status: 'error', message: 'Failed to delete campaign' };
  }
};




