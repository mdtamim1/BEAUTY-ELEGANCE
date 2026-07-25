import { useState, useMemo } from 'react';
import {
  Image, Megaphone, Grid3X3, ShoppingBag, Link2, Columns3,
  Palette, Award, Truck, RotateCcw, Save, Plus, Trash2,
  ChevronUp, ChevronDown, Edit3, Eye, EyeOff, X, Check, Upload, Sparkles
} from 'lucide-react';
import {
  useStorefrontConfig,
  type StorefrontConfig,
  type BannerSlide,
  type AnnouncementItem,
  type CategoryConfig,
  type ProductConfig,
  type NavLinkItem,
  type FooterColumn,
  type FeatureBadge,
  resetStorefrontConfig,
} from '../../store/storefrontConfig';
import './storefront-manager.css';

// ============================================================
// TAB DEFINITIONS
// ============================================================
const TABS = [
  { id: 'live_view', label: 'Live Viewers Counter', icon: Eye },
  { id: 'new_popular', label: 'New & Popular Section', icon: Sparkles },
  { id: 'banners', label: 'Hero Banners', icon: Image },
  { id: 'announcements', label: 'Announcements', icon: Megaphone },
  { id: 'categories', label: 'Categories', icon: Grid3X3 },
  { id: 'navigation', label: 'Navigation', icon: Link2 },
  { id: 'featured', label: 'Most Selling & Trending', icon: ShoppingBag },
  { id: 'footer', label: 'Footer', icon: Columns3 },
  { id: 'branding', label: 'Branding & Contact', icon: Palette },
  { id: 'badges', label: 'Feature Badges', icon: Award },
  { id: 'delivery', label: 'Delivery & Newsletter', icon: Truck },
] as const;

type TabId = (typeof TABS)[number]['id'];

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function StorefrontManager() {
  const [config, setConfig] = useStorefrontConfig();
  const [activeTab, setActiveTab] = useState<TabId>('new_popular');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const updateConfig = <K extends keyof StorefrontConfig>(key: K, value: StorefrontConfig[K]) => {
    setConfig({ ...config, [key]: value });
    showToast('Changes saved!');
  };

  const handleReset = () => {
    if (window.confirm('Reset ALL storefront settings to defaults? This cannot be undone.')) {
      resetStorefrontConfig();
      showToast('Reset to defaults!');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-breadcrumb">
            <span>Home</span>
            <span className="page-breadcrumb-sep">/</span>
            <span>Storefront Manager</span>
          </div>
          <h1 className="page-title">Storefront Customization</h1>
          <p className="page-subtitle">Manage every aspect of your customer-facing store from here</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary" onClick={handleReset}>
            <RotateCcw size={16} /> Reset Defaults
          </button>
          <a href="/store" target="_blank" rel="noreferrer" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            <Eye size={16} /> Preview Store
          </a>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="sfm-tabs">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`sfm-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'live_view' && <LiveViewSection config={config} updateConfig={updateConfig} />}
      {activeTab === 'new_popular' && <NewPopularSection config={config} updateConfig={updateConfig} />}
      {activeTab === 'banners' && <BannersSection config={config} updateConfig={updateConfig} />}
      {activeTab === 'announcements' && <AnnouncementsSection config={config} updateConfig={updateConfig} />}
      {activeTab === 'categories' && <CategoriesSection config={config} updateConfig={updateConfig} />}
      {activeTab === 'navigation' && <NavigationSection config={config} updateConfig={updateConfig} />}
      {activeTab === 'featured' && <FeaturedCollectionsSection config={config} updateConfig={updateConfig} />}
      {activeTab === 'footer' && <FooterSection config={config} updateConfig={updateConfig} />}
      {activeTab === 'branding' && <BrandingSection config={config} updateConfig={updateConfig} />}
      {activeTab === 'badges' && <BadgesSection config={config} updateConfig={updateConfig} />}
      {activeTab === 'delivery' && <DeliverySection config={config} updateConfig={updateConfig} />}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          padding: '12px 24px', borderRadius: '10px',
          background: 'rgba(16, 185, 129, 0.95)', color: '#fff',
          fontWeight: 600, fontSize: '14px',
          display: 'flex', alignItems: 'center', gap: '8px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          animation: 'sfm-fadeIn 0.3s ease',
        }}>
          <Check size={16} /> {toast}
        </div>
      )}
    </div>
  );
}

// ============================================================
// SHARED HELPERS
// ============================================================
interface SectionProps {
  config: StorefrontConfig;
  updateConfig: <K extends keyof StorefrontConfig>(key: K, value: StorefrontConfig[K]) => void;
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (val: boolean) => void }) {
  return (
    <label className="sfm-toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="sfm-toggle-slider" />
    </label>
  );
}

// ============================================================
// 0. NEW & POPULAR SECTION MANAGER
// ============================================================
function NewPopularSection({ config, updateConfig }: SectionProps) {
  const [selectedTab, setSelectedTab] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Sneakers');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdImage, setNewProdImage] = useState('');

  const products = config.products || [];
  const selectedProductIds = config.newPopularProductIds || [];

  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    cats.add('ALL');
    (config.categories || []).forEach(c => cats.add(c.name));
    products.forEach(p => { if (p.category) cats.add(p.category); });
    return Array.from(cats);
  }, [config.categories, products]);

  const filteredProducts = products.filter(p => {
    if (!p.published) return false;
    if (selectedTab === 'ALL') return true;
    const cat = (p.category || '').toLowerCase();
    const q = selectedTab.toLowerCase();
    return cat.includes(q) || (p.name || '').toLowerCase().includes(q);
  });

  const handleToggleNewPopular = (prodId: number) => {
    let updated: number[];
    if (selectedProductIds.includes(prodId)) {
      updated = selectedProductIds.filter(id => id !== prodId);
    } else {
      updated = [...selectedProductIds, prodId];
    }
    updateConfig('newPopularProductIds', updated);
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || !newProdPrice) return;

    const newId = Math.max(100, ...products.map(p => p.id)) + 1;
    const newProduct: ProductConfig = {
      id: newId,
      name: newProdName.trim(),
      sku: `NP-${newId}`,
      category: newProdCategory,
      brand: 'CustomBrand',
      price: parseFloat(newProdPrice) || 0,
      originalPrice: (parseFloat(newProdPrice) || 0) * 1.2,
      rating: 4.8,
      reviews: 24,
      image: newProdImage.trim() || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
      gallery: [newProdImage.trim() || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80'],
      badge: 'new',
      inStock: true,
      published: true,
      description: `New & Popular ${newProdCategory} item added from control panel.`,
      features: ['Premium Quality', 'Authentic Product'],
      specs: [{ name: 'Category', value: newProdCategory }],
      customerReviews: [],
      relatedProducts: [],
      stock: 50,
      sold: 0,
      revenue: 0,
    };

    updateConfig('products', [newProduct, ...products]);
    updateConfig('newPopularProductIds', [newId, ...selectedProductIds]);
    setNewProdName('');
    setNewProdPrice('');
    setNewProdImage('');
    setShowAddModal(false);
  };

  const handleCategoryChange = (prodId: number, newCat: string) => {
    const updated = products.map(p => p.id === prodId ? { ...p, category: newCat } : p);
    updateConfig('products', updated);
  };

  return (
    <div className="sfm-section">
      <div className="sfm-section-header">
        <div>
          <div className="sfm-section-title">New & Popular Section Manager</div>
          <div className="sfm-section-subtitle">
            Select products by category. Only products you check will appear in the "NEW AND POPULAR" section on the frontend.
          </div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
          <Plus size={14} /> Add Product to New & Popular
        </button>
      </div>

      {/* Dynamic Tabs Row */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '16px 0 24px 0', borderBottom: '1px solid var(--border-secondary)', paddingBottom: '16px' }}>
        {availableCategories.map((tab: string) => (
          <button
            key={tab}
            className={`btn btn-sm ${selectedTab === tab ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontWeight: 700 }}
            onClick={() => setSelectedTab(tab)}
          >
            {tab} {tab !== 'ALL' && `(${products.filter(p => p.published && (p.category || '').toLowerCase().includes(tab.toLowerCase())).length})`}
          </button>
        ))}
      </div>

      {/* Product List for Selected Tab with Selection Toggle */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {filteredProducts.map(prod => {
          const isSelected = selectedProductIds.includes(prod.id);
          return (
            <div key={prod.id} className="card" style={{ padding: '16px', display: 'flex', gap: '14px', alignItems: 'center', border: isSelected ? '1.5px solid var(--color-success)' : '1px solid var(--border-primary)', background: isSelected ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-secondary)' }}>
              <img src={prod.image} alt={prod.name} style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-primary)' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prod.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 800, margin: '2px 0 6px 0' }}>৳{prod.price}</div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${isSelected ? 'btn-success' : 'btn-secondary'}`}
                    style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px' }}
                    onClick={() => handleToggleNewPopular(prod.id)}
                  >
                    {isSelected ? '✓ Selected for Frontend' : '+ Add to New & Popular'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="modal-overlay" style={{ display: 'flex' }}>
          <div className="modal" style={{ maxWidth: '500px', width: '90%' }}>
            <div className="modal-header">
              <span className="modal-title">Add Product to New & Popular</span>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleAddProduct}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input type="text" className="form-input" required value={newProdName} onChange={e => setNewProdName(e.target.value)} placeholder="e.g. AF-1 White Black Pebbled" />
                </div>
                <div className="form-group">
                  <label className="form-label">Section Category / Tab *</label>
                  <select className="form-select" value={newProdCategory} onChange={e => setNewProdCategory(e.target.value)}>
                    <option value="Sneakers">Sneakers</option>
                    <option value="Panjabi">Panjabi</option>
                    <option value="Shirts">Shirts</option>
                    <option value="Perfumes">Perfumes</option>
                    <option value="Pants">Pants</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Price (৳) *</label>
                  <input type="number" className="form-input" required value={newProdPrice} onChange={e => setNewProdPrice(e.target.value)} placeholder="5800" />
                </div>
                <div className="form-group">
                  <label className="form-label">Product Image URL</label>
                  <input type="text" className="form-input" value={newProdImage} onChange={e => setNewProdImage(e.target.value)} placeholder="https://..." />
                </div>
              </div>
              <div className="modal-footer" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add to Storefront</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// 1. BANNERS SECTION
// ============================================================
function BannersSection({ config, updateConfig }: SectionProps) {
  const [editId, setEditId] = useState<number | null>(null);
  const banners = config.banners;

  const update = (id: number, field: keyof BannerSlide, value: any) => {
    updateConfig('banners', banners.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const addBanner = () => {
    const newId = Math.max(0, ...banners.map(b => b.id)) + 1;
    updateConfig('banners', [...banners, {
      id: newId,
      title: 'New Banner',
      subtitle: 'Banner subtitle text',
      gradient: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #1e40af 100%)',
      image: '',
      tag: 'New',
      offer: 'Special Offer',
      buttonText: 'Shop Now',
      buttonLink: '#categories',
      enabled: true,
    }]);
    setEditId(newId);
  };

  const removeBanner = (id: number) => {
    updateConfig('banners', banners.filter(b => b.id !== id));
    if (editId === id) setEditId(null);
  };

  const move = (id: number, dir: -1 | 1) => {
    const idx = banners.findIndex(b => b.id === id);
    if ((dir === -1 && idx === 0) || (dir === 1 && idx === banners.length - 1)) return;
    const newArr = [...banners];
    [newArr[idx], newArr[idx + dir]] = [newArr[idx + dir], newArr[idx]];
    updateConfig('banners', newArr);
  };

  return (
    <div className="sfm-section">
      <div className="sfm-section-header">
        <div>
          <div className="sfm-section-title">Hero Banner Carousel</div>
          <div className="sfm-section-subtitle">Manage the main hero banners on your storefront homepage</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={addBanner}><Plus size={14} /> Add Banner</button>
      </div>

      <div className="sfm-item-list">
        {banners.map((banner, idx) => (
          <div key={banner.id}>
            <div className="sfm-item">
              <div className="sfm-item-number">{idx + 1}</div>
              <div className="sfm-gradient-preview" style={{ background: banner.gradient, width: 60, height: 36, borderRadius: 6, flexShrink: 0 }} />
              <div className="sfm-item-content">
                <div className="sfm-item-title">{banner.title}</div>
                <div className="sfm-item-meta">{banner.tag} • {banner.offer}</div>
              </div>
              <Toggle checked={banner.enabled} onChange={(v) => update(banner.id, 'enabled', v)} />
              <div className="sfm-actions">
                <button className="sfm-btn-icon" onClick={() => move(banner.id, -1)} title="Move up"><ChevronUp size={14} /></button>
                <button className="sfm-btn-icon" onClick={() => move(banner.id, 1)} title="Move down"><ChevronDown size={14} /></button>
                <button className="sfm-btn-icon" onClick={() => setEditId(editId === banner.id ? null : banner.id)} title="Edit"><Edit3 size={14} /></button>
                <button className="sfm-btn-icon danger" onClick={() => removeBanner(banner.id)} title="Delete"><Trash2 size={14} /></button>
              </div>
            </div>

            {editId === banner.id && (
              <div className="sfm-expand">
                <div className="sfm-expand-body">
                  <div className="sfm-form-grid">
                    <div className="sfm-form-group">
                      <label className="sfm-label">Title</label>
                      <input className="sfm-input" value={banner.title} onChange={e => update(banner.id, 'title', e.target.value)} />
                    </div>
                    <div className="sfm-form-group">
                      <label className="sfm-label">Tag</label>
                      <input className="sfm-input" value={banner.tag} onChange={e => update(banner.id, 'tag', e.target.value)} />
                    </div>
                    <div className="sfm-form-group full-width">
                      <label className="sfm-label">Subtitle</label>
                      <input className="sfm-input" value={banner.subtitle} onChange={e => update(banner.id, 'subtitle', e.target.value)} />
                    </div>
                    <div className="sfm-form-group">
                      <label className="sfm-label">Offer Text</label>
                      <input className="sfm-input" value={banner.offer} onChange={e => update(banner.id, 'offer', e.target.value)} />
                    </div>
                    <div className="sfm-form-group">
                      <label className="sfm-label">Button Text</label>
                      <input className="sfm-input" value={banner.buttonText} onChange={e => update(banner.id, 'buttonText', e.target.value)} />
                    </div>
                    <div className="sfm-form-group">
                      <label className="sfm-label">Button Link</label>
                      <input className="sfm-input" value={banner.buttonLink} onChange={e => update(banner.id, 'buttonLink', e.target.value)} />
                    </div>
                    <div className="sfm-form-group full-width">
                       <label className="sfm-label">Custom Image URL (Optional)</label>
                       <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                         <input className="sfm-input" style={{ flex: 1 }} value={banner.image || ''} onChange={e => update(banner.id, 'image', e.target.value)} placeholder="https://example.com/banner-pic.png" />
                         <label className="btn btn-secondary" style={{ margin: 0, display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '8px 16px', height: '38px', boxSizing: 'border-box' }}>
                           <Upload size={14} /> Upload File
                           <input 
                             type="file" 
                             accept="image/*" 
                             style={{ display: 'none' }} 
                             onChange={(e) => {
                               const file = e.target.files?.[0];
                               if (file) {
                                 const reader = new FileReader();
                                 reader.onloadend = () => {
                                   update(banner.id, 'image', reader.result as string);
                                 };
                                 reader.readAsDataURL(file);
                               }
                             }} 
                           />
                         </label>
                         {banner.image && <img src={banner.image} alt="" className="sfm-image-preview" />}
                       </div>
                     </div>
                    <div className="sfm-form-group full-width">
                      <label className="sfm-label">Gradient Background CSS</label>
                      <input className="sfm-input" value={banner.gradient} onChange={e => update(banner.id, 'gradient', e.target.value)} />
                      <div className="sfm-gradient-preview" style={{ background: banner.gradient }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// 2. ANNOUNCEMENTS SECTION
// ============================================================
function AnnouncementsSection({ config, updateConfig }: SectionProps) {
  const items = config.announcements;

  const update = (id: number, field: keyof AnnouncementItem, value: any) => {
    updateConfig('announcements', items.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const add = () => {
    const newId = Math.max(0, ...items.map(a => a.id)) + 1;
    updateConfig('announcements', [...items, { id: newId, text: '📢 New announcement text here', enabled: true }]);
  };

  const remove = (id: number) => {
    updateConfig('announcements', items.filter(a => a.id !== id));
  };

  return (
    <div className="sfm-section">
      <div className="sfm-section-header">
        <div>
          <div className="sfm-section-title">Announcement Bar</div>
          <div className="sfm-section-subtitle">Scrolling messages at the top of your store</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={add}><Plus size={14} /> Add</button>
      </div>

      <div className="sfm-item-list">
        {items.map((item, idx) => (
          <div key={item.id} className="sfm-item">
            <div className="sfm-item-number">{idx + 1}</div>
            <input
              className="sfm-input"
              style={{ flex: 1 }}
              value={item.text}
              onChange={e => update(item.id, 'text', e.target.value)}
            />
            <Toggle checked={item.enabled} onChange={(v) => update(item.id, 'enabled', v)} />
            <button className="sfm-btn-icon danger" onClick={() => remove(item.id)}><Trash2 size={14} /></button>
          </div>
        ))}
        {items.length === 0 && (
          <div className="sfm-empty">
            <Megaphone size={32} className="sfm-empty-icon" />
            <div className="sfm-empty-title">No announcements</div>
            <div>Click "Add" to create one</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// 3. CATEGORIES SECTION
// ============================================================
const ICON_OPTIONS = [
  'Smartphone', 'Shirt', 'Home', 'Dumbbell', 'Sparkles', 'BookOpen',
  'Monitor', 'Camera', 'Headphones', 'Watch', 'Car', 'Baby',
  'Pizza', 'Flower', 'Palette', 'Music', 'Gamepad', 'Gift',
];

function CategoriesSection({ config, updateConfig }: SectionProps) {
  const [editId, setEditId] = useState<number | null>(null);
  const items = config.categories;

  const update = (id: number, field: keyof CategoryConfig, value: any) => {
    updateConfig('categories', items.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const add = () => {
    const newId = Math.max(0, ...items.map(c => c.id)) + 1;
    updateConfig('categories', [...items, {
      id: newId, name: 'New Category', icon: 'Grid3X3',
      count: 0, published: true, sortOrder: items.length + 1,
      image: '',
    }]);
    setEditId(newId);
  };

  const remove = (id: number) => {
    updateConfig('categories', items.filter(c => c.id !== id));
    if (editId === id) setEditId(null);
  };

  const move = (id: number, dir: -1 | 1) => {
    const idx = items.findIndex(c => c.id === id);
    if ((dir === -1 && idx === 0) || (dir === 1 && idx === items.length - 1)) return;
    const newArr = [...items];
    [newArr[idx], newArr[idx + dir]] = [newArr[idx + dir], newArr[idx]];
    updateConfig('categories', newArr);
  };

  return (
    <div className="sfm-section">
      <div className="sfm-section-header">
        <div>
          <div className="sfm-section-title">Product Categories</div>
          <div className="sfm-section-subtitle">Organize your store products into categories and customize category images</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={add}><Plus size={14} /> Add Category</button>
      </div>

      <div className="sfm-item-list">
        {items.map((cat, idx) => {
          const liveProductCount = (config.products || []).filter(
            p => p.published && (p.category || '').toLowerCase().trim() === cat.name.toLowerCase().trim()
          ).length;

          return (
            <div key={cat.id}>
              <div className="sfm-item">
                <div className="sfm-item-number">{idx + 1}</div>
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 8 }} />
                ) : (
                  <div style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.05)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '11px' }}>No Img</div>
                )}
                <div className="sfm-item-content">
                  <div className="sfm-item-title">{cat.name}</div>
                  <div className="sfm-item-meta">Icon: {cat.icon} • {liveProductCount} Active Products (Display: {cat.count || liveProductCount}) • Sort #{cat.sortOrder}</div>
                </div>
                <span className={`sfm-card-badge ${cat.published ? 'enabled' : 'disabled'}`}>
                  {cat.published ? 'Published' : 'Draft'}
                </span>
                <div className="sfm-actions">
                  <button className="sfm-btn-icon" onClick={() => move(cat.id, -1)}><ChevronUp size={14} /></button>
                  <button className="sfm-btn-icon" onClick={() => move(cat.id, 1)}><ChevronDown size={14} /></button>
                  <button className="sfm-btn-icon" onClick={() => setEditId(editId === cat.id ? null : cat.id)}><Edit3 size={14} /></button>
                  <button className="sfm-btn-icon danger" onClick={() => remove(cat.id)}><Trash2 size={14} /></button>
                </div>
              </div>

              {editId === cat.id && (
                <div className="sfm-expand">
                  <div className="sfm-expand-body">
                    <div className="sfm-form-grid">
                      <div className="sfm-form-group">
                        <label className="sfm-label">Name</label>
                        <input className="sfm-input" value={cat.name} onChange={e => update(cat.id, 'name', e.target.value)} />
                      </div>
                      <div className="sfm-form-group">
                        <label className="sfm-label">Icon</label>
                        <select className="sfm-select" value={cat.icon} onChange={e => update(cat.id, 'icon', e.target.value)}>
                          {ICON_OPTIONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                        </select>
                      </div>
                      <div className="sfm-form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="sfm-label">Category Banner / Card Image URL</label>
                        <input className="sfm-input" placeholder="https://..." value={cat.image || ''} onChange={e => update(cat.id, 'image', e.target.value)} />
                      </div>
                      <div className="sfm-form-group">
                        <label className="sfm-label">Product Count (Override)</label>
                        <input className="sfm-input" type="number" value={cat.count ?? liveProductCount} onChange={e => update(cat.id, 'count', parseInt(e.target.value) || 0)} />
                      </div>
                      <div className="sfm-form-group">
                        <label className="sfm-label">Sort Order</label>
                        <input className="sfm-input" type="number" value={cat.sortOrder} onChange={e => update(cat.id, 'sortOrder', parseInt(e.target.value) || 0)} />
                      </div>
                      <div className="sfm-form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <label className="sfm-label" style={{ marginBottom: 0 }}>Published</label>
                        <Toggle checked={cat.published} onChange={(v) => update(cat.id, 'published', v)} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


// ============================================================
// 5. NAVIGATION SECTION
// ============================================================
function NavigationSection({ config, updateConfig }: SectionProps) {
  const items = config.navLinks;
  const [manageProductsId, setManageProductsId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const update = (id: number, field: keyof NavLinkItem, value: any) => {
    updateConfig('navLinks', items.map(n => n.id === id ? { ...n, [field]: value } : n));
  };

  const add = () => {
    const newId = Math.max(0, ...items.map(n => n.id)) + 1;
    updateConfig('navLinks', [...items, { id: newId, label: 'New Link', url: '/store', enabled: true, productIds: [] }]);
  };

  const remove = (id: number) => {
    updateConfig('navLinks', items.filter(n => n.id !== id));
    if (manageProductsId === id) setManageProductsId(null);
  };

  const move = (id: number, dir: -1 | 1) => {
    const idx = items.findIndex(n => n.id === id);
    if ((dir === -1 && idx === 0) || (dir === 1 && idx === items.length - 1)) return;
    const newArr = [...items];
    [newArr[idx], newArr[idx + dir]] = [newArr[idx + dir], newArr[idx]];
    updateConfig('navLinks', newArr);
  };

  return (
    <div className="sfm-section">
      <div className="sfm-section-header">
        <div>
          <div className="sfm-section-title">Top Navigation Bar</div>
          <div className="sfm-section-subtitle">Links displayed in the store header. Manage custom collections by clicking the bag icon.</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={add}><Plus size={14} /> Add Link</button>
      </div>

      <div className="sfm-item-list">
        {items.map((item, idx) => (
          <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div className="sfm-item">
              <div className="sfm-item-number">{idx + 1}</div>
              <div className="sfm-form-group" style={{ flex: 1, marginBottom: 0 }}>
                <input className="sfm-input" value={item.label} onChange={e => update(item.id, 'label', e.target.value)} placeholder="Label" />
              </div>
              <div className="sfm-form-group" style={{ flex: 1, marginBottom: 0 }}>
                <input className="sfm-input" value={item.url} onChange={e => update(item.id, 'url', e.target.value)} placeholder="URL" />
              </div>
              <Toggle checked={item.enabled} onChange={(v) => update(item.id, 'enabled', v)} />
              <div className="sfm-actions">
                {item.label.toLowerCase() !== 'home' && (
                  <button 
                    type="button"
                    className={`sfm-btn-icon ${manageProductsId === item.id ? 'active' : ''}`} 
                    onClick={() => {
                      setManageProductsId(manageProductsId === item.id ? null : item.id);
                      setSearchQuery('');
                    }}
                    title="Manage Products"
                    style={{ color: manageProductsId === item.id ? 'var(--accent-primary)' : undefined }}
                  >
                    <ShoppingBag size={14} />
                  </button>
                )}
                <button className="sfm-btn-icon" onClick={() => move(item.id, -1)}><ChevronUp size={14} /></button>
                <button className="sfm-btn-icon" onClick={() => move(item.id, 1)}><ChevronDown size={14} /></button>
                <button className="sfm-btn-icon danger" onClick={() => remove(item.id)}><Trash2 size={14} /></button>
              </div>
            </div>

            {/* Manage Products Panel */}
            {manageProductsId === item.id && item.label.toLowerCase() !== 'home' && (
              <div className="sfm-expand" style={{ marginTop: 4, marginBottom: 12, padding: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-secondary)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                    Manage Products for "{item.label}" Collection
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                    Selected: {(item.productIds || []).length} products
                  </div>
                </div>

                {/* Product Search Box */}
                <div style={{ marginBottom: 16 }}>
                  <input
                    type="text"
                    className="sfm-input"
                    style={{ width: '100%', padding: '8px 12px', fontSize: '13px' }}
                    placeholder="🔍 Search catalog products by name or category..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Web-style Card Grid */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', 
                  gap: 12, 
                  maxHeight: '340px', 
                  overflowY: 'auto', 
                  paddingRight: '4px',
                  paddingBottom: '8px'
                }}>
                  {config.products
                    .filter(prod => 
                      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      prod.category.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map(prod => {
                      const selectedIds = item.productIds || [];
                      const isAdded = selectedIds.includes(prod.id);
                      return (
                        <div 
                          key={prod.id}
                          className="sfm-nav-prod-card"
                          onClick={() => {
                            const currentList = item.productIds || [];
                            const newList = currentList.includes(prod.id)
                              ? currentList.filter(id => id !== prod.id)
                              : [...currentList, prod.id];
                            update(item.id, 'productIds', newList);
                          }}
                          style={{ 
                            position: 'relative',
                            display: 'flex', 
                            flexDirection: 'column',
                            padding: '8px', 
                            background: isAdded ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255,255,255,0.01)', 
                            border: '1px solid ' + (isAdded ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)'), 
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: isAdded ? '0 0 10px rgba(99, 102, 241, 0.15)' : 'none',
                            userSelect: 'none'
                          }}
                        >
                          {/* Selected checkmark overlay */}
                          {isAdded && (
                            <div style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              background: '#10b981',
                              color: '#fff',
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                              zIndex: 2
                            }}>
                              <Check size={10} strokeWidth={3} />
                            </div>
                          )}
                          
                          {/* Product Image */}
                          <div style={{ position: 'relative', width: '100%', height: '80px', borderRadius: '4px', overflow: 'hidden', background: 'rgba(0,0,0,0.2)', marginBottom: '6px' }}>
                            {prod.image ? (
                              <img src={prod.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.1)' }}>
                                <ShoppingBag size={20} />
                              </div>
                            )}
                          </div>
                          
                          {/* Details */}
                          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                            <div>
                              <div style={{ fontSize: '9px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                {prod.category}
                              </div>
                              <div 
                                style={{ 
                                  fontSize: '11px', 
                                  fontWeight: 600, 
                                  color: 'var(--text-primary)',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  lineHeight: '14px',
                                  height: '28px',
                                  margin: '2px 0'
                                }} 
                                title={prod.name}
                              >
                                {prod.name}
                              </div>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-primary)' }}>
                                ৳{prod.price}
                              </span>
                              <span style={{ fontSize: '9px', fontWeight: 600, color: isAdded ? '#10b981' : 'var(--text-tertiary)' }}>
                                {isAdded ? 'Added' : 'Click to Add'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Timer Configuration Section */}
                <div style={{ 
                  marginTop: '20px', 
                  paddingTop: '16px', 
                  borderTop: '1px dashed rgba(255,255,255,0.08)' 
                }}>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    🕒 Timer Configuration (Countdown Clock)
                  </div>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                    gap: '16px',
                    alignItems: 'start'
                  }}>
                    {/* Toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <Toggle 
                        checked={!!item.timerEnabled} 
                        onChange={(v) => update(item.id, 'timerEnabled', v)} 
                      />
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>Enable Countdown Timer</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>Show a clock for this collection</div>
                      </div>
                    </div>

                    {/* Start Date/Time */}
                    <div className="sfm-form-group">
                      <label className="sfm-label" style={{ fontSize: '10px' }}>Target Start Date & Time (Optional for Upcoming)</label>
                      <input 
                        type="datetime-local" 
                        className="sfm-input" 
                        style={{ padding: '8px 12px', fontSize: '12px' }}
                        value={item.timerStartDate || ''} 
                        onChange={e => update(item.id, 'timerStartDate', e.target.value)}
                        disabled={!item.timerEnabled}
                      />
                    </div>

                    {/* Start Timer Label */}
                    <div className="sfm-form-group">
                      <label className="sfm-label" style={{ fontSize: '10px' }}>Start Timer Label / Title</label>
                      <input 
                        type="text" 
                        className="sfm-input" 
                        style={{ padding: '8px 12px', fontSize: '12px' }}
                        placeholder="e.g. Campaign starts in" 
                        value={item.timerStartLabel || ''} 
                        onChange={e => update(item.id, 'timerStartLabel', e.target.value)}
                        disabled={!item.timerEnabled}
                      />
                    </div>

                    {/* End Date/Time */}
                    <div className="sfm-form-group">
                      <label className="sfm-label" style={{ fontSize: '10px' }}>Target End Date & Time</label>
                      <input 
                        type="datetime-local" 
                        className="sfm-input" 
                        style={{ padding: '8px 12px', fontSize: '12px' }}
                        value={item.timerEndDate || ''} 
                        onChange={e => update(item.id, 'timerEndDate', e.target.value)}
                        disabled={!item.timerEnabled}
                      />
                    </div>

                    {/* Timer Label */}
                    <div className="sfm-form-group">
                      <label className="sfm-label" style={{ fontSize: '10px' }}>End Timer Label / Title</label>
                      <input 
                        type="text" 
                        className="sfm-input" 
                        style={{ padding: '8px 12px', fontSize: '12px' }}
                        placeholder="e.g. Offer ends in" 
                        value={item.timerLabel || ''} 
                        onChange={e => update(item.id, 'timerLabel', e.target.value)}
                        disabled={!item.timerEnabled}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// 6. FOOTER SECTION
// ============================================================
function FooterSection({ config, updateConfig }: SectionProps) {
  const columns = config.footerColumns;
  const [activeEditLink, setActiveEditLink] = useState<{ colIdx: number; linkId: number } | null>(null);

  const updateColumnTitle = (colIdx: number, title: string) => {
    const newCols = columns.map((c, i) => i === colIdx ? { ...c, title } : c);
    updateConfig('footerColumns', newCols);
  };

  const updateLink = (colIdx: number, linkId: number, field: keyof NavLinkItem, value: any) => {
    const newCols = columns.map((c, i) =>
      i === colIdx
        ? { ...c, links: c.links.map(l => l.id === linkId ? { ...l, [field]: value } : l) }
        : c
    );
    updateConfig('footerColumns', newCols);
  };

  const addLink = (colIdx: number) => {
    const col = columns[colIdx];
    const newId = Math.max(0, ...col.links.map(l => l.id)) + 1;
    const newCols = columns.map((c, i) =>
      i === colIdx
        ? { ...c, links: [...c.links, { id: newId, label: 'New Link', url: '/store', enabled: true }] }
        : c
    );
    updateConfig('footerColumns', newCols);
  };

  const removeLink = (colIdx: number, linkId: number) => {
    const newCols = columns.map((c, i) =>
      i === colIdx
        ? { ...c, links: c.links.filter(l => l.id !== linkId) }
        : c
    );
    updateConfig('footerColumns', newCols);
    if (activeEditLink?.colIdx === colIdx && activeEditLink?.linkId === linkId) {
      setActiveEditLink(null);
    }
  };

  const addColumn = () => {
    updateConfig('footerColumns', [...columns, { title: 'New Column', links: [] }]);
  };

  const removeColumn = (colIdx: number) => {
    updateConfig('footerColumns', columns.filter((_, i) => i !== colIdx));
  };

  const b = config.branding;

  const updateBrandingField = (field: keyof typeof b, val: any) => {
    updateConfig('branding', { ...b, [field]: val });
  };

  return (
    <div className="sfm-section">
      
      {/* ── 1. Web Developer Portfolio Link & Credit Control Card ── */}
      <div className="sfm-card" style={{ marginBottom: 24, border: '1px solid rgba(245, 158, 11, 0.3)', background: 'rgba(245, 158, 11, 0.03)' }}>
        <div className="sfm-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="sfm-card-title" style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} /> Web Developer Portfolio Credit (Footer Bottom)
            </div>
            <div className="sfm-card-subtitle" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Highlight your agency / portfolio link at the bottom of the storefront footer (Name: Tamim Labs).
            </div>
          </div>
          <Toggle
            checked={b.developerEnabled ?? true}
            onChange={(v) => updateBrandingField('developerEnabled', v)}
          />
        </div>

        <div className="sfm-grid-2" style={{ marginTop: 16 }}>
          <div className="sfm-field">
            <label className="sfm-label">Developer / Agency Name</label>
            <input
              type="text"
              className="sfm-input"
              value={b.developerName ?? 'Tamim Labs'}
              onChange={(e) => updateBrandingField('developerName', e.target.value)}
              placeholder="e.g. Tamim Labs"
            />
          </div>

          <div className="sfm-field">
            <label className="sfm-label">Developer Portfolio Link URL</label>
            <input
              type="url"
              className="sfm-input"
              value={b.developerUrl ?? 'https://tamimlabs.com'}
              onChange={(e) => updateBrandingField('developerUrl', e.target.value)}
              placeholder="https://yourportfolio.com"
            />
          </div>
        </div>
      </div>

      {/* ── 2. Store Address & Copyright Settings ── */}
      <div className="sfm-card" style={{ marginBottom: 24 }}>
        <div className="sfm-card-title" style={{ marginBottom: 16 }}>Footer Contact Address & Copyright Notice</div>
        <div className="sfm-grid-2">
          <div className="sfm-field">
            <label className="sfm-label">Store Physical Address (Footer)</label>
            <input
              type="text"
              className="sfm-input"
              value={b.addressText ?? '5th Floor, Block-B, Shop no: 46, 47, 56, 57, 58, Basundhara City Complex'}
              onChange={(e) => updateBrandingField('addressText', e.target.value)}
              placeholder="Store address..."
            />
          </div>

          <div className="sfm-field">
            <label className="sfm-label">Copyright Notice Text</label>
            <input
              type="text"
              className="sfm-input"
              value={b.copyrightText ?? '© 2026 Tamim Global. All rights reserved.'}
              onChange={(e) => updateBrandingField('copyrightText', e.target.value)}
              placeholder="© 2026 Store Name. All rights reserved."
            />
          </div>
        </div>
      </div>

      {/* ── 3. Footer Columns & Link Manager ── */}
      <div className="sfm-section-header">
        <div>
          <div className="sfm-section-title">Footer Link Columns</div>
          <div className="sfm-section-subtitle">Manage footer link columns. Click the edit button on a link to customize its rich HTML page content.</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={addColumn}><Plus size={14} /> Add Column</button>
      </div>

      <div className="sfm-footer-columns">
        {columns.map((col, colIdx) => (
          <div key={colIdx} className="sfm-footer-column">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <input
                className="sfm-input"
                value={col.title}
                onChange={e => updateColumnTitle(colIdx, e.target.value)}
                style={{ fontWeight: 600, fontSize: '15px', border: 'none', padding: '4px 0', background: 'transparent' }}
              />
              <div style={{ display: 'flex', gap: 4 }}>
                <button className="sfm-btn-icon" onClick={() => addLink(colIdx)} title="Add link" style={{ width: 28, height: 28 }}><Plus size={12} /></button>
                <button className="sfm-btn-icon danger" onClick={() => removeColumn(colIdx)} title="Remove column" style={{ width: 28, height: 28 }}><Trash2 size={12} /></button>
              </div>
            </div>

            {col.links.map(link => (
              <div key={link.id} style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10, border: '1px solid rgba(255,255,255,0.04)', padding: '6px', borderRadius: '6px', background: 'rgba(255,255,255,0.01)' }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input className="sfm-input" style={{ flex: 1, height: 32, fontSize: '12px' }} value={link.label} onChange={e => updateLink(colIdx, link.id, 'label', e.target.value)} placeholder="Link Label" />
                  <input className="sfm-input" style={{ flex: 1, height: 32, fontSize: '12px' }} value={link.customPageContent ? `/store/page/${link.id}` : link.url} onChange={e => updateLink(colIdx, link.id, 'url', e.target.value)} placeholder="URL" disabled={!!link.customPageContent} />
                  <button 
                    type="button"
                    className={`sfm-btn-icon ${activeEditLink?.colIdx === colIdx && activeEditLink?.linkId === link.id ? 'active' : ''}`}
                    onClick={() => {
                      if (activeEditLink?.colIdx === colIdx && activeEditLink?.linkId === link.id) {
                        setActiveEditLink(null);
                      } else {
                        setActiveEditLink({ colIdx, linkId: link.id });
                      }
                    }}
                    title="Edit Custom Page Content"
                    style={{ width: 28, height: 28, color: link.customPageContent ? 'var(--color-primary)' : undefined }}
                  >
                    <Edit3 size={12} />
                  </button>
                  <Toggle checked={link.enabled} onChange={v => updateLink(colIdx, link.id, 'enabled', v)} />
                  <button className="sfm-btn-icon danger" onClick={() => removeLink(colIdx, link.id)} style={{ width: 28, height: 28 }}><X size={12} /></button>
                </div>

                {activeEditLink?.colIdx === colIdx && activeEditLink?.linkId === link.id && (
                  <div style={{ marginTop: 6, borderTop: '1px dashed rgba(255,255,255,0.06)', paddingTop: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>
                        📝 Page Content (HTML allowed, e.g. &lt;h3&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;ul&gt;, &lt;li&gt;)
                      </span>
                      {link.customPageContent !== undefined ? (
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ fontSize: '10px', padding: '2px 8px', height: 'auto', minHeight: 'unset' }}
                          onClick={() => {
                            if (window.confirm('Delete custom page content? The link will revert to a standard URL.')) {
                              updateLink(colIdx, link.id, 'customPageContent', undefined);
                            }
                          }}
                        >
                          Disable Page Content
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-primary"
                          style={{ fontSize: '10px', padding: '2px 8px', height: 'auto', minHeight: 'unset' }}
                          onClick={() => {
                            updateLink(colIdx, link.id, 'customPageContent', '<h3>New Page</h3><p>Write your page content here.</p>');
                          }}
                        >
                          Enable Page Content
                        </button>
                      )}
                    </div>
                    {link.customPageContent !== undefined ? (
                      <textarea
                        className="sfm-textarea"
                        rows={6}
                        style={{ width: '100%', fontSize: '12px', fontFamily: 'monospace' }}
                        value={link.customPageContent}
                        onChange={e => updateLink(colIdx, link.id, 'customPageContent', e.target.value)}
                        placeholder="<h3>Heading</h3><p>Page body content...</p>"
                      />
                    ) : (
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontStyle: 'italic', padding: '2px 0' }}>
                        This is currently set as a standard redirect link to: {link.url}. Click "Enable Page Content" to change it to an admin-editable custom page.
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// 9. MOST SELLING & TRENDING SECTION
// ============================================================
function FeaturedCollectionsSection({ config, updateConfig }: SectionProps) {
  const [mostSellingQuery, setMostSellingQuery] = useState('');
  const [trendingQuery, setTrendingQuery] = useState('');

  const mostSellingIds = config.mostSellingProductIds || [];
  const trendingIds = config.trendingProductIds || [];

  const toggleProductInList = (listKey: 'mostSellingProductIds' | 'trendingProductIds', prodId: number) => {
    const currentList = config[listKey] || [];
    const newList = currentList.includes(prodId)
      ? currentList.filter(id => id !== prodId)
      : [...currentList, prodId];
    updateConfig(listKey, newList);
  };

  return (
    <div className="sfm-section">
      <div className="sfm-section-header">
        <div>
          <div className="sfm-section-title">Most Selling & Trending Products</div>
          <div className="sfm-section-subtitle">Manage homepage most selling and trending products collections. Use search to add/remove products.</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
        
        {/* Most Selling Section */}
        <div className="sfm-card" style={{ margin: 0 }}>
          <div className="sfm-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="sfm-card-title">🔥 Most Selling Collection</div>
            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Selected: {mostSellingIds.length}</span>
          </div>

          <div style={{ padding: '16px' }}>
            {/* Search Box */}
            <div style={{ marginBottom: '16px' }}>
              <input
                type="text"
                className="sfm-input"
                style={{ width: '100%' }}
                placeholder="Search products to add to Most Selling..."
                value={mostSellingQuery}
                onChange={e => setMostSellingQuery(e.target.value)}
              />
            </div>

            {/* Catalog Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', 
              gap: '12px', 
              maxHeight: '260px', 
              overflowY: 'auto',
              marginBottom: '20px',
              paddingRight: '4px'
            }}>
              {config.products
                .filter(prod => 
                  prod.name.toLowerCase().includes(mostSellingQuery.toLowerCase()) || 
                  prod.category.toLowerCase().includes(mostSellingQuery.toLowerCase())
                )
                .map(prod => {
                  const isAdded = mostSellingIds.includes(prod.id);
                  return (
                    <div 
                      key={prod.id}
                      onClick={() => toggleProductInList('mostSellingProductIds', prod.id)}
                      style={{ 
                        position: 'relative', display: 'flex', flexDirection: 'column', padding: '8px', 
                        background: isAdded ? 'rgba(233, 43, 43, 0.08)' : 'rgba(255,255,255,0.01)', 
                        border: '1px solid ' + (isAdded ? 'var(--sf-accent, #e92b2b)' : 'rgba(255,255,255,0.05)'), 
                        borderRadius: '8px', cursor: 'pointer', userSelect: 'none'
                      }}
                    >
                      {isAdded && (
                        <div style={{
                          position: 'absolute', top: '4px', right: '4px', background: '#10b981', color: '#fff',
                          width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2
                        }}>
                          <Check size={10} strokeWidth={3} />
                        </div>
                      )}
                      <div style={{ width: '100%', height: '60px', borderRadius: '4px', overflow: 'hidden', background: 'rgba(0,0,0,0.2)', marginBottom: '6px' }}>
                        {prod.image && <img src={prod.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                      </div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '14px', height: '28px' }}>
                        {prod.name}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Trending Section */}
        <div className="sfm-card" style={{ margin: 0 }}>
          <div className="sfm-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="sfm-card-title">📈 Trending Collection</div>
            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Selected: {trendingIds.length}</span>
          </div>

          <div style={{ padding: '16px' }}>
            {/* Search Box */}
            <div style={{ marginBottom: '16px' }}>
              <input
                type="text"
                className="sfm-input"
                style={{ width: '100%' }}
                placeholder="Search products to add to Trending..."
                value={trendingQuery}
                onChange={e => setTrendingQuery(e.target.value)}
              />
            </div>

            {/* Catalog Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', 
              gap: '12px', 
              maxHeight: '260px', 
              overflowY: 'auto',
              marginBottom: '20px',
              paddingRight: '4px'
            }}>
              {config.products
                .filter(prod => 
                  prod.name.toLowerCase().includes(trendingQuery.toLowerCase()) || 
                  prod.category.toLowerCase().includes(trendingQuery.toLowerCase())
                )
                .map(prod => {
                  const isAdded = trendingIds.includes(prod.id);
                  return (
                    <div 
                      key={prod.id}
                      onClick={() => toggleProductInList('trendingProductIds', prod.id)}
                      style={{ 
                        position: 'relative', display: 'flex', flexDirection: 'column', padding: '8px', 
                        background: isAdded ? 'rgba(37, 99, 235, 0.08)' : 'rgba(255,255,255,0.01)', 
                        border: '1px solid ' + (isAdded ? 'var(--sf-info, #2563eb)' : 'rgba(255,255,255,0.05)'), 
                        borderRadius: '8px', cursor: 'pointer', userSelect: 'none'
                      }}
                    >
                      {isAdded && (
                        <div style={{
                          position: 'absolute', top: '4px', right: '4px', background: '#10b981', color: '#fff',
                          width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2
                        }}>
                          <Check size={10} strokeWidth={3} />
                        </div>
                      )}
                      <div style={{ width: '100%', height: '60px', borderRadius: '4px', overflow: 'hidden', background: 'rgba(0,0,0,0.2)', marginBottom: '6px' }}>
                        {prod.image && <img src={prod.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                      </div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '14px', height: '28px' }}>
                        {prod.name}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ============================================================
// 7. BRANDING & CONTACT SECTION
// ============================================================
function BrandingSection({ config, updateConfig }: SectionProps) {
  const b = config.branding;
  const c = config.contactInfo;

  const updateB = (field: keyof typeof b, value: string) => {
    updateConfig('branding', { ...b, [field]: value });
  };

  const updateC = (field: keyof typeof c, value: string) => {
    updateConfig('contactInfo', { ...c, [field]: value });
  };

  return (
    <div className="sfm-section">
      <div className="sfm-section-header">
        <div>
          <div className="sfm-section-title">Branding & Contact</div>
          <div className="sfm-section-subtitle">Store identity and contact information</div>
        </div>
      </div>

      <div className="sfm-card">
        <div className="sfm-card-header">
          <div className="sfm-card-title"><Palette size={16} /> Store Branding</div>
        </div>
        <div className="sfm-form-grid">
          <div className="sfm-form-group">
            <label className="sfm-label">Store Name</label>
            <input className="sfm-input" value={b.storeName} onChange={e => updateB('storeName', e.target.value)} />
          </div>
          <div className="sfm-form-group">
            <label className="sfm-label">Logo Text (Primary)</label>
            <input className="sfm-input" value={b.logoTextPrimary} onChange={e => updateB('logoTextPrimary', e.target.value)} />
          </div>
          <div className="sfm-form-group">
            <label className="sfm-label">Logo Text (Secondary)</label>
            <input className="sfm-input" value={b.logoTextSecondary} onChange={e => updateB('logoTextSecondary', e.target.value)} />
          </div>
          <div className="sfm-form-group full-width">
            <label className="sfm-label">Footer Description</label>
            <textarea className="sfm-textarea" value={b.footerDescription} onChange={e => updateB('footerDescription', e.target.value)} />
          </div>
          <div className="sfm-form-group">
            <label className="sfm-label">Copyright Text</label>
            <input className="sfm-input" value={b.copyrightText} onChange={e => updateB('copyrightText', e.target.value)} />
          </div>
          <div className="sfm-form-group">
            <label className="sfm-label">Payment Methods Text</label>
            <input className="sfm-input" value={b.paymentMethodsText} onChange={e => updateB('paymentMethodsText', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="sfm-card">
        <div className="sfm-card-header">
          <div className="sfm-card-title"><Link2 size={16} /> Contact Information</div>
        </div>
        <div className="sfm-form-grid">
          <div className="sfm-form-group">
            <label className="sfm-label">WhatsApp Number</label>
            <input className="sfm-input" value={c.whatsappNumber} onChange={e => updateC('whatsappNumber', e.target.value)} />
          </div>
          <div className="sfm-form-group">
            <label className="sfm-label">Phone Number</label>
            <input className="sfm-input" value={c.phoneNumber} onChange={e => updateC('phoneNumber', e.target.value)} />
          </div>
          <div className="sfm-form-group">
            <label className="sfm-label">Email</label>
            <input className="sfm-input" value={c.email} onChange={e => updateC('email', e.target.value)} />
          </div>
          <div className="sfm-form-group">
            <label className="sfm-label">Messenger URL</label>
            <input className="sfm-input" value={c.messengerUrl} onChange={e => updateC('messengerUrl', e.target.value)} />
          </div>
          <div className="sfm-form-group">
            <label className="sfm-label">Facebook Page URL</label>
            <input className="sfm-input" value={c.facebookUrl || ''} onChange={e => updateC('facebookUrl', e.target.value)} />
          </div>
          <div className="sfm-form-group">
            <label className="sfm-label">TikTok Profile URL</label>
            <input className="sfm-input" value={c.tiktokUrl || ''} onChange={e => updateC('tiktokUrl', e.target.value)} />
          </div>
          <div className="sfm-form-group">
            <label className="sfm-label">Instagram Profile URL</label>
            <input className="sfm-input" value={c.instagramUrl || ''} onChange={e => updateC('instagramUrl', e.target.value)} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 8. FEATURE BADGES SECTION
// ============================================================
function BadgesSection({ config, updateConfig }: SectionProps) {
  const [editId, setEditId] = useState<number | null>(null);
  const items = config.featureBadges;

  const BADGE_ICONS = ['Truck', 'Shield', 'RotateCcw', 'Headphones', 'Star', 'Zap', 'Gift', 'Award', 'ThumbsUp', 'Clock'];

  const update = (id: number, field: keyof FeatureBadge, value: any) => {
    updateConfig('featureBadges', items.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const add = () => {
    const newId = Math.max(0, ...items.map(b => b.id)) + 1;
    updateConfig('featureBadges', [...items, { id: newId, icon: 'Star', title: 'New Badge', description: 'Description', enabled: true }]);
    setEditId(newId);
  };

  const remove = (id: number) => {
    updateConfig('featureBadges', items.filter(b => b.id !== id));
    if (editId === id) setEditId(null);
  };

  return (
    <div className="sfm-section">
      <div className="sfm-section-header">
        <div>
          <div className="sfm-section-title">Trust / Feature Badges</div>
          <div className="sfm-section-subtitle">Badges displayed below the hero section (Free Shipping, Secure Payment, etc.)</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={add}><Plus size={14} /> Add Badge</button>
      </div>

      <div className="sfm-item-list">
        {items.map((badge, idx) => (
          <div key={badge.id}>
            <div className="sfm-item">
              <div className="sfm-item-number">{idx + 1}</div>
              <div className="sfm-item-content">
                <div className="sfm-item-title">{badge.title}</div>
                <div className="sfm-item-meta">Icon: {badge.icon} • {badge.description}</div>
              </div>
              <Toggle checked={badge.enabled} onChange={(v) => update(badge.id, 'enabled', v)} />
              <div className="sfm-actions">
                <button className="sfm-btn-icon" onClick={() => setEditId(editId === badge.id ? null : badge.id)}><Edit3 size={14} /></button>
                <button className="sfm-btn-icon danger" onClick={() => remove(badge.id)}><Trash2 size={14} /></button>
              </div>
            </div>

            {editId === badge.id && (
              <div className="sfm-expand">
                <div className="sfm-expand-body">
                  <div className="sfm-form-grid">
                    <div className="sfm-form-group">
                      <label className="sfm-label">Title</label>
                      <input className="sfm-input" value={badge.title} onChange={e => update(badge.id, 'title', e.target.value)} />
                    </div>
                    <div className="sfm-form-group">
                      <label className="sfm-label">Icon</label>
                      <select className="sfm-select" value={badge.icon} onChange={e => update(badge.id, 'icon', e.target.value)}>
                        {BADGE_ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                      </select>
                    </div>
                    <div className="sfm-form-group full-width">
                      <label className="sfm-label">Description</label>
                      <input className="sfm-input" value={badge.description} onChange={e => update(badge.id, 'description', e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// 9. DELIVERY & NEWSLETTER SECTION
// ============================================================
function DeliverySection({ config, updateConfig }: SectionProps) {
  const d = config.delivery;
  const n = config.newsletter;

  const updateD = (field: keyof typeof d, value: any) => {
    updateConfig('delivery', { ...d, [field]: value });
  };

  const updateN = (field: keyof typeof n, value: string) => {
    updateConfig('newsletter', { ...n, [field]: value });
  };

  return (
    <div className="sfm-section">
      <div className="sfm-section-header">
        <div>
          <div className="sfm-section-title">Delivery & Newsletter</div>
          <div className="sfm-section-subtitle">Shipping prices and newsletter configuration</div>
        </div>
      </div>

      <div className="sfm-card">
        <div className="sfm-card-header">
          <div className="sfm-card-title"><Truck size={16} /> Delivery Configuration</div>
        </div>
        <div className="sfm-form-grid">
          <div className="sfm-form-group">
            <label className="sfm-label">Inside Dhaka Price (৳)</label>
            <input className="sfm-input" type="number" value={d.insideDhakaPrice} onChange={e => updateD('insideDhakaPrice', parseFloat(e.target.value) || 0)} />
          </div>
          <div className="sfm-form-group">
            <label className="sfm-label">Inside Dhaka Timeline</label>
            <input className="sfm-input" value={d.insideDhakaTimeline} onChange={e => updateD('insideDhakaTimeline', e.target.value)} />
          </div>
          <div className="sfm-form-group">
            <label className="sfm-label">Outside Dhaka Price (৳)</label>
            <input className="sfm-input" type="number" value={d.outsideDhakaPrice} onChange={e => updateD('outsideDhakaPrice', parseFloat(e.target.value) || 0)} />
          </div>
          <div className="sfm-form-group">
            <label className="sfm-label">Outside Dhaka Timeline</label>
            <input className="sfm-input" value={d.outsideDhakaTimeline} onChange={e => updateD('outsideDhakaTimeline', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="sfm-card">
        <div className="sfm-card-header">
          <div className="sfm-card-title"><Megaphone size={16} /> Newsletter Section</div>
        </div>
        <div className="sfm-form-grid">
          <div className="sfm-form-group">
            <label className="sfm-label">Heading</label>
            <input className="sfm-input" value={n.heading} onChange={e => updateN('heading', e.target.value)} />
          </div>
          <div className="sfm-form-group">
            <label className="sfm-label">Button Text</label>
            <input className="sfm-input" value={n.buttonText} onChange={e => updateN('buttonText', e.target.value)} />
          </div>
          <div className="sfm-form-group full-width">
            <label className="sfm-label">Subtitle</label>
            <input className="sfm-input" value={n.subtitle} onChange={e => updateN('subtitle', e.target.value)} />
          </div>
          <div className="sfm-form-group">
            <label className="sfm-label">Placeholder Text</label>
            <input className="sfm-input" value={n.placeholderText} onChange={e => updateN('placeholderText', e.target.value)} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// LIVE VIEW COUNTER SECTION
// ============================================================
function LiveViewSection({ config, updateConfig }: SectionProps) {
  const liveConfig = config.liveViewConfig || {
    enabled: true,
    presetRange: '30-50',
    customMin: 30,
    customMax: 85,
    updateIntervalSeconds: 4,
  };

  const handleUpdate = (updated: Partial<typeof liveConfig>) => {
    updateConfig('liveViewConfig', { ...liveConfig, ...updated });
  };

  return (
    <div className="sfm-card">
      <div className="sfm-card-header">
        <div>
          <div className="sfm-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Eye size={20} color="#38bdf8" />
            <span>Product Live Viewer Counter & AI Badge</span>
          </div>
          <p className="sfm-card-subtitle" style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
            Configure the dynamic live viewing count range displayed on Product Detail Pages (PDP).
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{liveConfig.enabled ? 'Enabled' : 'Disabled'}</span>
          <Toggle checked={liveConfig.enabled} onChange={(enabled) => handleUpdate({ enabled })} />
        </div>
      </div>

      <div style={{ padding: '20px 0' }}>
        <h4 style={{ margin: '0 0 14px 0', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>Select Viewing Count Fluctuation Range:</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          {[
            { id: '0-20', label: '0 - 20 Viewers', desc: 'Low activity count range' },
            { id: '0-30', label: '0 - 30 Viewers', desc: 'Moderate activity count range' },
            { id: '30-50', label: '30 - 50 Viewers', desc: 'High activity count range' },
            { id: '50-70', label: '50 - 70 Viewers', desc: 'Popular / Trending count range' },
            { id: 'custom', label: 'Custom Range', desc: 'Manually specify min & max' },
          ].map(opt => (
            <div
              key={opt.id}
              onClick={() => handleUpdate({ presetRange: opt.id as any })}
              style={{
                border: liveConfig.presetRange === opt.id ? '2px solid #38bdf8' : '1px solid var(--border)',
                background: liveConfig.presetRange === opt.id ? 'rgba(56, 189, 248, 0.1)' : 'rgba(255,255,255,0.02)',
                borderRadius: '12px',
                padding: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: liveConfig.presetRange === opt.id ? '#38bdf8' : '#ffffff', marginBottom: '4px' }}>
                {opt.label}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{opt.desc}</div>
            </div>
          ))}
        </div>

        {liveConfig.presetRange === 'custom' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>Minimum Live Viewers Count</label>
              <input
                type="number"
                className="sfm-input"
                value={liveConfig.customMin}
                onChange={(e) => handleUpdate({ customMin: Math.max(0, parseInt(e.target.value) || 0) })}
                min={0}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>Maximum Live Viewers Count</label>
              <input
                type="number"
                className="sfm-input"
                value={liveConfig.customMax}
                onChange={(e) => handleUpdate({ customMax: Math.max(1, parseInt(e.target.value) || 1) })}
                min={1}
              />
            </div>
          </div>
        )}

        {/* Live Preview Card */}
        <div style={{ padding: '16px', background: '#090d16', border: '1.5px dashed rgba(56, 189, 248, 0.4)', borderRadius: '12px' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '10px', fontWeight: 800, letterSpacing: '0.05em' }}>STOREFRONT LIVE PREVIEW BADGE</span>
          {liveConfig.enabled ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 14px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', borderRadius: '20px', fontWeight: 700, fontSize: '0.88rem', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
              <Eye size={18} />
              <span>
                {liveConfig.presetRange === '0-20' ? '12' : liveConfig.presetRange === '0-30' ? '24' : liveConfig.presetRange === '30-50' ? '42' : liveConfig.presetRange === '50-70' ? '65' : `${liveConfig.customMin} - ${liveConfig.customMax}`} People viewing this right now
              </span>
            </div>
          ) : (
            <div style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 600 }}>
              🚫 Live Viewing Counter is currently Disabled.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

