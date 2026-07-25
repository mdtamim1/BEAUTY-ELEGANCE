import { useState, useEffect } from 'react';
import { Megaphone, Mail, MessageSquare, Bell, Share2, Ticket, Play, Pause, BarChart2, X, Trash2, DollarSign, Gamepad2, Trophy, Percent, Sparkles, Plus, Edit, Image, Tag, Clock, Package, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { generateCampaigns, formatCurrency, formatDate } from '../../mock/data';
import { 
  fetchCoupons, 
  createCoupon, 
  deleteCoupon, 
  fetchProductsFromBackend,
  fetchCampaignsFromBackend,
  createCampaignInBackend,
  updateCampaignInBackend,
  deleteCampaignFromBackend
} from '../../services/api';
import { getEventsFromStore, saveEventsToStore, type EventItem, type JackpotSlot } from '../../store/eventStore';
import { useStorefrontConfig, type CampaignConfig, type CampaignProductOffer } from '../../store/storefrontConfig';

const typeConfig: Record<string, { icon: any; color: string }> = {
  email: { icon: Mail, color: 'primary' },
  sms: { icon: MessageSquare, color: 'success' },
  push: { icon: Bell, color: 'warning' },
  social: { icon: Share2, color: 'info' },
};

const statusConfig: Record<string, string> = {
  active: 'badge-success',
  draft: 'badge-warning',
  completed: 'badge-primary',
  paused: 'badge-danger',
};

export default function Marketing() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [eventsList, setEventsList] = useState<EventItem[]>([]);
  const [activeTab, setActiveTab] = useState<'campaigns' | 'coupons' | 'events'>('campaigns');
  const [storefrontConfig, setStorefrontConfig] = useStorefrontConfig();
  
  // Modals state
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);

  // Form states (Event Creation/Editing)
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [evtTitle, setEvtTitle] = useState('');
  const [evtDesc, setEvtDesc] = useState('');
  const [evtImage, setEvtImage] = useState('');
  const [evtStatus, setEvtStatus] = useState<'running' | 'upcoming'>('running');
  const [evtType, setEvtType] = useState<'quiz' | 'spin' | 'discount_match' | 'mission' | 'jackpot'>('quiz');
  const [evtWinProb, setEvtWinProb] = useState(80);
  const [evtGamesEnabled, setEvtGamesEnabled] = useState(true);
  const [evtCouponCode, setEvtCouponCode] = useState('');
  const [evtCouponType, setEvtCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [evtCouponVal, setEvtCouponVal] = useState(20);
  const [evtJackpotSlots, setEvtJackpotSlots] = useState<JackpotSlot[]>([]);

  // Marketing database states
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // ---- Campaign Form State (Enhanced) ----
  const [campName, setCampName] = useState('');
  const [campType, setCampType] = useState<'email' | 'sms' | 'push' | 'social'>('email');
  const [campMessage, setCampMessage] = useState('');
  const [campTarget, setCampTarget] = useState('All Customers');
  const [campStartDate, setCampStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [campEndDate, setCampEndDate] = useState<string>(new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0]);
  // Hero banner fields
  const [campHeroBannerImage, setCampHeroBannerImage] = useState('');
  const [campHeroBannerTitle, setCampHeroBannerTitle] = useState('');
  const [campHeroBannerSubtitle, setCampHeroBannerSubtitle] = useState('');
  // Per-product offer states
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  // Map of productId -> { discountType, discountValue, offerEndDate }
  const [productOfferMap, setProductOfferMap] = useState<Record<string, { discountType: 'percentage' | 'fixed'; discountValue: number; offerEndDate: string }>>({});
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);

  // Form states (Coupon Creation)
  const [coupCode, setCoupCode] = useState('');
  const [coupType, setCoupType] = useState('percentage');
  const [coupVal, setCoupVal] = useState(15);
  const [coupExpiry, setCoupExpiry] = useState('2026-07-31');

  const tabs = [
    { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
    { id: 'coupons', label: 'Coupons Matrix', icon: Ticket },
    { id: 'events', label: 'Event Manager & Games', icon: Gamepad2 },
  ];

  const loadMarketingData = async () => {
    setLoading(true);
    try {
      const [couponData, productData, campaignData] = await Promise.all([
        fetchCoupons(),
        fetchProductsFromBackend(),
        fetchCampaignsFromBackend()
      ]);
      if (couponData) setCoupons(couponData);
      if (campaignData) {
        setCampaigns(campaignData);
      } else {
        setCampaigns(generateCampaigns(15));
      }

      let finalProducts = productData;
      if (!finalProducts || finalProducts.length === 0) {
        const localConfig = localStorage.getItem('storefront_config');
        if (localConfig) {
          try {
            const parsed = JSON.parse(localConfig);
            if (parsed && Array.isArray(parsed.products)) {
              finalProducts = parsed.products;
            }
          } catch (err) {
            console.error('Error parsing storefront_config for marketing:', err);
          }
        }
      }
      if (!finalProducts || finalProducts.length === 0) {
        const localList = localStorage.getItem('productList');
        if (localList) {
          try {
            const parsed = JSON.parse(localList);
            if (Array.isArray(parsed)) {
              finalProducts = parsed;
            }
          } catch (err) {
            console.error('Error parsing productList for marketing:', err);
          }
        }
      }
      
      if (finalProducts) {
        setProducts(finalProducts);
      }
      setEventsList(getEventsFromStore());
    } catch (e) {
      setErrorMsg('ডাটাবেজ থেকে কুপন ও ক্যাম্পেইন ডাটা লোড করা যাচ্ছে না।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMarketingData();
  }, []);

  // Event Manager Handlers
  const handleOpenNewEventModal = () => {
    setEditingEventId(null);
    setEvtTitle('');
    setEvtDesc('');
    setEvtImage('https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80');
    setEvtStatus('running');
    setEvtType('quiz');
    setEvtWinProb(80);
    setEvtGamesEnabled(true);
    setEvtCouponCode('');
    setEvtCouponType('percentage');
    setEvtCouponVal(20);
    setEvtJackpotSlots([]);
    setShowEventModal(true);
  };

  const handleOpenEditEventModal = (item: EventItem) => {
    setEditingEventId(item.id);
    setEvtTitle(item.title);
    setEvtDesc(item.description);
    setEvtImage(item.bannerImage);
    setEvtStatus(item.status);
    setEvtType(item.type);
    setEvtWinProb(item.winProbability || 80);
    setEvtGamesEnabled(item.gamesEnabled !== false);
    setEvtCouponCode(item.rewardCoupon?.code || '');
    setEvtCouponType(item.rewardCoupon?.type || 'percentage');
    setEvtCouponVal(item.rewardCoupon?.value || 20);
    setEvtJackpotSlots(item.jackpotSlots || []);
    setShowEventModal(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evtTitle || !evtCouponCode) {
      alert('ইভেন্টের নাম এবং রিওয়ার্ড কুপন কোড প্রদান করুন।');
      return;
    }

    let updatedList: EventItem[] = [];
    if (editingEventId) {
      updatedList = eventsList.map(item => {
        if (item.id === editingEventId) {
          return {
            ...item,
            title: evtTitle,
            description: evtDesc,
            bannerImage: evtImage,
            status: evtStatus,
            type: evtType,
            winProbability: evtWinProb,
            gamesEnabled: evtGamesEnabled,
            rewardCoupon: {
              code: evtCouponCode.toUpperCase().trim(),
              type: evtCouponType,
              value: evtCouponVal
            },
            ...(evtType === 'jackpot' ? { jackpotSlots: evtJackpotSlots } : {}),
          };
        }
        return item;
      });
    } else {
      const newEvt: EventItem = {
        id: `EVT-${Date.now().toString().slice(-4)}`,
        title: evtTitle,
        description: evtDesc,
        bannerImage: evtImage || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80',
        status: evtStatus,
        type: evtType,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        winProbability: evtWinProb,
        gamesEnabled: evtGamesEnabled,
        rewardCoupon: {
          code: evtCouponCode.toUpperCase().trim(),
          type: evtCouponType,
          value: evtCouponVal
        },
        ...(evtType === 'jackpot' ? { jackpotSlots: evtJackpotSlots } : {})
      };
      updatedList = [newEvt, ...eventsList];
    }

    setEventsList(updatedList);
    saveEventsToStore(updatedList);
    setShowEventModal(false);
  };

  const handleDeleteEvent = (id: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      const filtered = eventsList.filter(e => e.id !== id);
      setEventsList(filtered);
      saveEventsToStore(filtered);
    }
  };

  // Campaign Actions
  const handleToggleCampaign = async (id: string) => {
    const found = campaigns.find(c => c.id === id);
    if (!found) return;
    const nextStatus = found.status === 'active' ? 'paused' : 'active';
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: nextStatus } : c));
    // Also update storefront campaigns
    const sfCampaigns = storefrontConfig.campaigns || [];
    const updatedSfCampaigns = sfCampaigns.map((c: CampaignConfig) => c.id === id ? { ...c, status: nextStatus as 'active' | 'draft' | 'paused' } : c);
    setStorefrontConfig({ ...storefrontConfig, campaigns: updatedSfCampaigns });
    await updateCampaignInBackend(id, nextStatus);
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campName) return;

    const campaignId = `CMP-${String((storefrontConfig.campaigns?.length || 0) + 1).padStart(3, '0')}`;

    // Build per-product offers from productOfferMap
    const productOffers: CampaignProductOffer[] = selectedProductIds.map(pid => {
      const offer = productOfferMap[pid];
      return {
        productId: Number(pid),
        discountType: offer?.discountType || 'percentage',
        discountValue: offer?.discountValue || 10,
        offerEndDate: offer?.offerEndDate || campEndDate,
      };
    });

    // Build new storefront campaign config
    const newSfCampaign: CampaignConfig = {
      id: campaignId,
      name: campName,
      status: 'active',
      heroBannerImage: campHeroBannerImage || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1400&q=80',
      heroBannerTitle: campHeroBannerTitle || campName,
      heroBannerSubtitle: campHeroBannerSubtitle || 'Exclusive deals — limited time only!',
      startDate: campStartDate,
      endDate: campEndDate,
      productOffers,
    };

    // Save to storefront config (visible on campaign page)
    const updatedSfCampaigns = [newSfCampaign, ...(storefrontConfig.campaigns || [])];
    setStorefrontConfig({ ...storefrontConfig, campaigns: updatedSfCampaigns });

    // Also persist to backend marketing campaigns table
    const newCamp = {
      id: campaignId,
      name: campName,
      type: campType,
      status: 'active' as const,
      sent: campTarget === 'All Customers' ? 10000 : 2500,
      opened: 0, clicked: 0, converted: 0, revenue: 0,
      startDate: campStartDate,
      endDate: campEndDate,
      productIds: selectedProductIds,
    };
    setCampaigns(prev => [newCamp, ...prev]);
    await createCampaignInBackend(newCamp);

    // Reset form
    setCampName('');
    setCampMessage('');
    setCampHeroBannerImage('');
    setCampHeroBannerTitle('');
    setCampHeroBannerSubtitle('');
    setSelectedProductIds([]);
    setProductOfferMap({});
    setProductSearchQuery('');
    setExpandedProductId(null);
    setShowCampaignModal(false);
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) return;
    setCampaigns(prev => prev.filter(c => c.id !== id));
    // Also remove from storefront config
    const updatedSfCampaigns = (storefrontConfig.campaigns || []).filter((c: CampaignConfig) => c.id !== id);
    setStorefrontConfig({ ...storefrontConfig, campaigns: updatedSfCampaigns });
    await deleteCampaignFromBackend(id);
  };

  // Coupon Actions
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coupCode) return;

    const res = await createCoupon({
      code: coupCode.toUpperCase().trim(),
      type: coupType,
      value: coupVal,
      expiry: coupExpiry
    });

    if (res.status === 'success') {
      setCoupons(prev => [res.data, ...prev]);
      setCoupCode('');
      setShowCouponModal(false);
    } else {
      alert(res.message || 'Failed to create coupon code');
    }
  };

  const handleDeleteCoupon = async (code: string) => {
    if (confirm(`Delete coupon code ${code}?`)) {
      const res = await deleteCoupon(code);
      if (res.status === 'success') {
        setCoupons(prev => prev.filter(c => c.code !== code));
      } else {
        alert(res.message || 'Failed to delete coupon');
      }
    }
  };

  if (loading && coupons.length === 0) {
    return (
      <div style={{ display: 'flex', minHeight: '60vh', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-breadcrumb"><span>Home</span><span className="page-breadcrumb-sep">/</span><span>Marketing</span></div>
          <h1 className="page-title">Marketing Control Center</h1>
          <p className="page-subtitle">Manage marketing campaigns and promo coupons</p>
        </div>
        <div className="page-header-actions">
          {activeTab === 'coupons' ? (
            <button className="btn btn-primary" onClick={() => setShowCouponModal(true)}><Ticket size={16} /> Create Coupon</button>
          ) : activeTab === 'events' ? (
            <button className="btn btn-primary" onClick={handleOpenNewEventModal}><Gamepad2 size={16} /> Create Event & Game</button>
          ) : (
            <button className="btn btn-primary" onClick={() => setShowCampaignModal(true)}><Megaphone size={16} /> Create Campaign</button>
          )}
        </div>
      </div>

      {errorMsg && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '12px', borderRadius: '8px', fontSize: 'var(--text-xs)', marginBottom: '16px' }}>
          {errorMsg}
        </div>
      )}

      {/* Stats Grid */}
      <div className="stats-grid" style={{ marginBottom: 'var(--space-6)' }}>
        {[
          { label: 'Active Campaigns', value: campaigns.filter(c => c.status === 'active').length.toString(), icon: Play, color: 'success' },
          { label: 'Total Campaigns', value: campaigns.length.toString(), icon: Megaphone, color: 'primary' },
          { label: 'Total Promo Codes', value: coupons.length.toString(), icon: Ticket, color: 'info' },
          { label: 'Campaign Revenue', value: formatCurrency(campaigns.reduce((acc, c) => acc + c.revenue, 0)), icon: DollarSign, color: 'warning' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="stat-card" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="stat-card-header">
                <div className={`stat-card-icon ${s.color}`}><Icon size={20} /></div>
              </div>
              <div className="stat-card-label">{s.label}</div>
              <div className="stat-card-value">{s.value}</div>
            </div>
          );
        })}
      </div>

      {/* Navigation Tabs */}
      <div className="tabs" style={{ marginBottom: 'var(--space-6)' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id as any)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* CAMPAIGNS PANEL */}
      {activeTab === 'campaigns' && (
        <div className="data-table-container">
          <div className="data-table-header">
            <div className="data-table-title">All Campaigns</div>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Campaign Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Sent</th>
                <th>Open Rate</th>
                <th>Click Rate</th>
                <th>Conversion</th>
                <th>Revenue</th>
                <th>Duration</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => {
                const TypeIcon = typeConfig[campaign.type]?.icon || Megaphone;
                const typeColor = typeConfig[campaign.type]?.color || 'primary';
                const openRate = campaign.sent > 0 ? ((campaign.opened / campaign.sent) * 100).toFixed(1) : '0.0';
                const clickRate = campaign.opened > 0 ? ((campaign.clicked / campaign.opened) * 100).toFixed(1) : '0.0';
                const convRate = campaign.clicked > 0 ? ((campaign.converted / campaign.clicked) * 100).toFixed(1) : '0.0';
                
                return (
                  <tr key={campaign.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{campaign.name}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{campaign.id}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-xs)', textTransform: 'capitalize' }}>
                        <TypeIcon size={14} className={`text-${typeColor}`} /> {campaign.type}
                      </div>
                    </td>
                    <td><span className={`badge ${statusConfig[campaign.status] || 'badge-primary'}`}>{campaign.status}</span></td>
                    <td>{campaign.sent.toLocaleString()}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 600 }}>{openRate}%</span>
                        <div className="progress-bar" style={{ width: '40px', height: '4px' }}>
                          <div className="progress-fill success" style={{ width: `${openRate}%` }} />
                        </div>
                      </div>
                    </td>
                    <td>{clickRate}%</td>
                    <td>{convRate}%</td>
                    <td style={{ fontWeight: 600, color: 'var(--color-success)' }}>{formatCurrency(campaign.revenue)}</td>
                    <td style={{ fontSize: 'var(--text-xs)' }}>
                      {formatDate(campaign.startDate)} - <br/>{formatDate(campaign.endDate)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button className="btn btn-ghost btn-sm" title="Campaign Analytics" onClick={() => alert(`Analytics for ${campaign.name}`)}><BarChart2 size={14} /></button>
                        {campaign.status === 'active' ? (
                          <button className="btn btn-ghost btn-sm" title="Pause Campaign" onClick={() => handleToggleCampaign(campaign.id)}><Pause size={14} /></button>
                        ) : campaign.status === 'paused' ? (
                          <button className="btn btn-ghost btn-sm" title="Resume Campaign" onClick={() => handleToggleCampaign(campaign.id)}><Play size={14} /></button>
                        ) : null}
                        <button 
                          className="btn btn-ghost btn-sm text-danger" 
                          title="Delete Campaign" 
                          onClick={() => handleDeleteCampaign(campaign.id)}
                          style={{ color: '#ef4444' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* COUPONS MATRIX PANEL */}
      {activeTab === 'coupons' && (
        <div className="data-table-container">
          <div className="data-table-header">
            <div className="data-table-title">Promo Coupons Matrix</div>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Coupon Code</th>
                <th>Discount Type</th>
                <th>Value</th>
                <th>Expiry Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.code}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)' }}>{c.code}</td>
                  <td style={{ textTransform: 'capitalize' }}>{c.type}</td>
                  <td style={{ fontWeight: 600 }}>
                    {c.type === 'percentage' ? `${c.value}%` : `৳${c.value.toFixed(2)}`}
                  </td>
                  <td>{formatDate(c.expiry)}</td>
                  <td>
                    <span className={`badge ${c.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger)' }} onClick={() => handleDeleteCoupon(c.code)}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* EVENT MANAGER & GAMES PANEL */}
      {activeTab === 'events' && (
        <div className="data-table-container">
          <div className="data-table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="data-table-title">Interactive Event & Quiz Games Manager</div>
            <button className="btn btn-primary btn-sm" onClick={handleOpenNewEventModal}>
              <Plus size={14} /> Add Event
            </button>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Banner</th>
                <th>Event Title</th>
                <th>Game Type</th>
                <th>Status</th>
                <th>Win Probability (%)</th>
                <th>Reward Coupon</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {eventsList.map((evt) => (
                <tr key={evt.id}>
                  <td>
                    <img 
                      src={evt.bannerImage} 
                      alt={evt.title} 
                      style={{ width: '60px', height: '36px', objectFit: 'cover', borderRadius: '6px' }} 
                    />
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{evt.title}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{evt.description}</div>
                  </td>
                  <td>
                    <span className="badge badge-info" style={{ textTransform: 'uppercase', fontSize: '10px' }}>
                      {evt.type === 'quiz' ? '🧠 Brand Trivia' : evt.type === 'spin' ? '🎡 Mystery Wheel' : evt.type === 'jackpot' ? '🎰 Jackpot' : '🎯 Discount Match'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${evt.status === 'running' ? 'badge-success' : 'badge-warning'}`}>
                      {evt.status === 'running' ? '● Running' : '⏳ Upcoming'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 800, color: '#38bdf8' }}>{evt.winProbability}% Chance</span>
                  </td>
                  <td>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#4ade80' }}>{evt.rewardCoupon?.code}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {evt.rewardCoupon?.type === 'percentage' ? `${evt.rewardCoupon?.value}% OFF` : `৳${evt.rewardCoupon?.value} OFF`}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleOpenEditEventModal(evt)} title="Edit Event">
                        <Edit size={14} />
                      </button>
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger)' }} onClick={() => handleDeleteEvent(evt.id)} title="Delete Event">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE / EDIT EVENT MODAL */}
      {showEventModal && (
        <div className="modal-overlay" style={{ display: 'flex' }}>
          <div className="modal" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <span className="modal-title">{editingEventId ? 'Edit Event & Game' : 'Create Event & Game'}</span>
              <button onClick={() => setShowEventModal(false)} style={{ color: 'var(--text-secondary)' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveEvent}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Event Title</label>
                  <input type="text" className="form-input" required value={evtTitle} onChange={e => setEvtTitle(e.target.value)} placeholder="e.g. Summer Quiz Challenge" />
                </div>

                <div className="form-group">
                  <label className="form-label">Description / Subtitle</label>
                  <textarea className="form-textarea" rows={2} required value={evtDesc} onChange={e => setEvtDesc(e.target.value)} placeholder="Short game instructions for customer..." />
                </div>

                <div className="form-group">
                  <label className="form-label">Banner Image URL</label>
                  <input type="text" className="form-input" required value={evtImage} onChange={e => setEvtImage(e.target.value)} placeholder="https://..." />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Event Status</label>
                    <select className="form-select" value={evtStatus} onChange={e => setEvtStatus(e.target.value as any)}>
                      <option value="running">Running Event (Live)</option>
                      <option value="upcoming">Upcoming Event</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Interactive Game Type</label>
                    <select className="form-select" value={evtType} onChange={e => setEvtType(e.target.value as any)}>
                      <option value="quiz">🧠 Brand Trivia Quiz</option>
                      <option value="spin">🎡 3D Casino Wheel / Spin</option>
                      <option value="discount_match">💎 Golden Scratch Card Match</option>
                      <option value="mission">🎯 Shopping Quest (Mission Complete)</option>
                      <option value="jackpot">🎰 Jackpot Slot Machine</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ background: evtGamesEnabled ? 'rgba(56, 189, 248, 0.08)' : 'rgba(239, 68, 68, 0.08)', padding: '12px', borderRadius: '10px', border: evtGamesEnabled ? '1px solid rgba(56, 189, 248, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)', marginBottom: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                    <input 
                      type="checkbox" 
                      checked={evtGamesEnabled} 
                      onChange={e => setEvtGamesEnabled(e.target.checked)} 
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <span>🎮 Enable Interactive Quiz & Games for this Event (গেম চালু রাখুন)</span>
                  </label>

                  {evtGamesEnabled ? (
                    <div>
                      <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                        <span>Game Win Probability Rate (সম্ভাবনা কন্ট্রোল)</span>
                        <strong style={{ color: '#38bdf8' }}>{evtWinProb}%</strong>
                      </label>
                      <input 
                        type="range" 
                        min="10" 
                        max="100" 
                        step="5" 
                        value={evtWinProb} 
                        onChange={e => setEvtWinProb(Number(e.target.value))}
                        style={{ width: '100%', cursor: 'pointer' }}
                      />
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        * Higher win rate increases customer coupon win chance!
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '12px', color: '#ef4444', fontWeight: 600 }}>
                      ⚠️ গেম মোডটি বন্ধ (Off) রাখা হয়েছে। কাস্টমার সরাসরি ইভেন্টের ডিসকাউন্ট দেখতে পাবে কিন্তু গেম খেলতে পারবে না।
                    </div>
                  )}
                </div>

                <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label">Reward Coupon Code</label>
                    <input type="text" className="form-input" required value={evtCouponCode} onChange={e => setEvtCouponCode(e.target.value)} placeholder="TRIVIA20" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Discount Type</label>
                    <select className="form-select" value={evtCouponType} onChange={e => setEvtCouponType(e.target.value as any)}>
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed (৳)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Value ({evtCouponType === 'percentage' ? '%' : '৳'})</label>
                    <input type="number" className="form-input" required min="1" value={evtCouponVal} onChange={e => setEvtCouponVal(Number(e.target.value))} />
                  </div>
                </div>
              </div>

                {/* JACKPOT SLOT CONFIG — Only shown when type is jackpot */}
                {evtType === 'jackpot' && (
                  <div style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: '12px', padding: '16px', marginTop: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <div>
                        <div style={{ fontWeight: 800, color: '#fbbf24', fontSize: '0.95rem' }}>🎰 Jackpot Slot Configuration</div>
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '3px' }}>Configure discount tiers and win probabilities for each reel slot.</div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-primary"
                        onClick={() => setEvtJackpotSlots(prev => [
                          ...prev,
                          { id: `s${Date.now()}`, label: '10% OFF', discountType: 'percentage', discountValue: 10, weight: 10, emoji: '⭐', color: '#f59e0b' }
                        ])}
                      >
                        <Plus size={14} /> Add Slot Tier
                      </button>
                    </div>

                    {evtJackpotSlots.length === 0 && (
                      <div style={{ color: '#64748b', fontSize: '0.82rem', textAlign: 'center', padding: '12px 0' }}>No slot tiers yet. Add at least 2.</div>
                    )}

                    {evtJackpotSlots.map((sl, idx) => {
                      const totalW = evtJackpotSlots.reduce((s, x) => s + (x.weight || 0), 0);
                      const prob = totalW > 0 ? ((sl.weight / totalW) * 100).toFixed(1) : '0';
                      return (
                        <div key={sl.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 60px 60px auto', gap: '8px', alignItems: 'center', marginBottom: '10px', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
                          <div>
                            <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>Label</label>
                            <input
                              type="text"
                              className="form-input"
                              style={{ padding: '5px 8px', fontSize: '0.82rem' }}
                              value={sl.label}
                              onChange={e => setEvtJackpotSlots(prev => prev.map((s, i) => i === idx ? { ...s, label: e.target.value } : s))}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>Emoji</label>
                            <input
                              type="text"
                              className="form-input"
                              style={{ padding: '5px 8px', fontSize: '1.2rem', textAlign: 'center' }}
                              value={sl.emoji}
                              onChange={e => setEvtJackpotSlots(prev => prev.map((s, i) => i === idx ? { ...s, emoji: e.target.value } : s))}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>Type</label>
                            <select
                              className="form-select"
                              style={{ padding: '5px 8px', fontSize: '0.82rem' }}
                              value={sl.discountType}
                              onChange={e => setEvtJackpotSlots(prev => prev.map((s, i) => i === idx ? { ...s, discountType: e.target.value as any } : s))}
                            >
                              <option value="percentage">% OFF</option>
                              <option value="fixed">৳ OFF</option>
                            </select>
                          </div>
                          <div>
                            <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>Value</label>
                            <input
                              type="number"
                              className="form-input"
                              style={{ padding: '5px 8px', fontSize: '0.82rem' }}
                              value={sl.discountValue}
                              min={1}
                              onChange={e => setEvtJackpotSlots(prev => prev.map((s, i) => i === idx ? { ...s, discountValue: Number(e.target.value) } : s))}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>Wt ({prob}%)</label>
                            <input
                              type="number"
                              className="form-input"
                              style={{ padding: '5px 8px', fontSize: '0.82rem' }}
                              value={sl.weight}
                              min={1}
                              onChange={e => setEvtJackpotSlots(prev => prev.map((s, i) => i === idx ? { ...s, weight: Number(e.target.value) } : s))}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => setEvtJackpotSlots(prev => prev.filter((_, i) => i !== idx))}
                            style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: 'none', borderRadius: '6px', padding: '6px 8px', cursor: 'pointer', marginTop: '18px' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEventModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Event</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE CAMPAIGN MODAL */}
      {showCampaignModal && (
        <div className="modal-overlay" style={{ display: 'flex' }}>
          <div className="modal" style={{ maxWidth: '700px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header" style={{ flexShrink: 0 }}>
              <span className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Megaphone size={18} style={{ color: 'var(--color-primary)' }} />
                Create Campaign — Storefront + Marketing
              </span>
              <button onClick={() => setShowCampaignModal(false)} style={{ color: 'var(--text-secondary)' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateCampaign} style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div className="modal-body" style={{ overflowY: 'auto', flex: 1 }}>

                {/* Section 1: Campaign Info */}
                <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                  <div style={{ fontWeight: 800, color: '#818cf8', fontSize: '0.8rem', letterSpacing: '0.07em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Megaphone size={13} /> CAMPAIGN INFO
                  </div>
                  <div className="form-group">
                    <label className="form-label">Campaign Name *</label>
                    <input type="text" className="form-input" required value={campName} onChange={e => setCampName(e.target.value)} placeholder="e.g. Grand Sports Festival 2026" />
                  </div>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Campaign Type</label>
                      <select className="form-select" value={campType} onChange={e => setCampType(e.target.value as any)}>
                        <option value="email">Email Broadcast</option>
                        <option value="sms">SMS Text Message</option>
                        <option value="push">Push Notification</option>
                        <option value="social">Social Media Post</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Target Audience</label>
                      <select className="form-select" value={campTarget} onChange={e => setCampTarget(e.target.value)}>
                        <option value="All Customers">All Customers (10K+)</option>
                        <option value="VIP Buyers">VIP Buyers (185)</option>
                        <option value="Inactive Customers">Inactive Customers (1.2K)</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Campaign Start Date *</label>
                      <input type="date" className="form-input" required value={campStartDate} onChange={e => setCampStartDate(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Campaign End Date *</label>
                      <input type="date" className="form-input" required value={campEndDate} onChange={e => setCampEndDate(e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* Section 2: Hero Banner */}
                <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                  <div style={{ fontWeight: 800, color: '#34d399', fontSize: '0.8rem', letterSpacing: '0.07em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Tag size={13} /> HERO BANNER (Campaign Page উপরের সেকশন)
                  </div>
                  <div className="form-group">
                    <label className="form-label">Banner Image URL</label>
                    <input
                      type="url"
                      className="form-input"
                      value={campHeroBannerImage}
                      onChange={e => setCampHeroBannerImage(e.target.value)}
                      placeholder="https://... (ফাঁকা রাখলে default image ব্যবহার হবে)"
                    />
                    {campHeroBannerImage && (
                      <img src={campHeroBannerImage} alt="Banner preview" style={{ width: '100%', height: '90px', objectFit: 'cover', borderRadius: '8px', marginTop: '8px' }} onError={e => (e.currentTarget.style.display = 'none')} />
                    )}
                  </div>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Banner Title</label>
                      <input type="text" className="form-input" value={campHeroBannerTitle} onChange={e => setCampHeroBannerTitle(e.target.value)} placeholder={campName || 'Campaign Title'} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Banner Subtitle</label>
                      <input type="text" className="form-input" value={campHeroBannerSubtitle} onChange={e => setCampHeroBannerSubtitle(e.target.value)} placeholder="Exclusive deals — limited time!" />
                    </div>
                  </div>
                </div>

                {/* Section 3: Products & Per-Product Offers */}
                <div style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                  <div style={{ fontWeight: 800, color: '#fbbf24', fontSize: '0.8rem', letterSpacing: '0.07em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Package size={13} /> CAMPAIGN PRODUCTS & OFFERS (Storefront এ দেখাবে)
                  </div>
                  <div style={{ position: 'relative', marginBottom: '10px' }}>
                    <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
                    <input
                      type="text"
                      placeholder="Search by name, SKU or category..."
                      value={productSearchQuery}
                      onChange={e => setProductSearchQuery(e.target.value)}
                      className="form-input"
                      style={{ paddingLeft: '34px', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div style={{ maxHeight: '260px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', paddingRight: '2px' }}>
                    {products
                      .filter(p =>
                        p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
                        (p.sku && p.sku.toLowerCase().includes(productSearchQuery.toLowerCase())) ||
                        (p.category && p.category.toLowerCase().includes(productSearchQuery.toLowerCase()))
                      )
                      .map(p => {
                        const pid = String(p.id);
                        const isSelected = selectedProductIds.includes(pid);
                        const isExpanded = expandedProductId === pid;
                        const offer = productOfferMap[pid] || { discountType: 'percentage' as const, discountValue: 10, offerEndDate: campEndDate };
                        return (
                          <div key={p.id} style={{ background: isSelected ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${isSelected ? 'rgba(245,158,11,0.35)' : 'rgba(255,255,255,0.07)'}`, borderRadius: '10px', overflow: 'hidden', transition: 'all 0.2s' }}>
                            <div
                              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', cursor: 'pointer' }}
                              onClick={() => {
                                if (!isSelected) {
                                  setSelectedProductIds(prev => [...prev, pid]);
                                  setProductOfferMap(prev => ({ ...prev, [pid]: { discountType: 'percentage', discountValue: 10, offerEndDate: campEndDate } }));
                                  setExpandedProductId(pid);
                                } else {
                                  setExpandedProductId(isExpanded ? null : pid);
                                }
                              }}
                            >
                              <input type="checkbox" checked={isSelected} readOnly style={{ cursor: 'pointer', accentColor: '#f59e0b', width: '15px', height: '15px', flexShrink: 0 }} />
                              {p.image && <img src={p.image} alt={p.name} style={{ width: '34px', height: '34px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{p.category} · ৳{p.price}</div>
                              </div>
                              {isSelected && (
                                <span style={{ fontSize: '0.73rem', fontWeight: 800, color: '#f59e0b', background: 'rgba(245,158,11,0.15)', padding: '2px 7px', borderRadius: '5px', flexShrink: 0 }}>
                                  {offer.discountType === 'percentage' ? `${offer.discountValue}% OFF` : `৳${offer.discountValue} OFF`}
                                </span>
                              )}
                              {isSelected && (
                                isExpanded ? <ChevronUp size={14} color="#64748b" style={{ flexShrink: 0 }} /> : <ChevronDown size={14} color="#64748b" style={{ flexShrink: 0 }} />
                              )}
                              {isSelected && (
                                <button
                                  type="button"
                                  onClick={e => { e.stopPropagation(); setSelectedProductIds(prev => prev.filter(x => x !== pid)); if (expandedProductId === pid) setExpandedProductId(null); }}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '2px 4px', flexShrink: 0, lineHeight: 1 }}
                                >
                                  <X size={13} />
                                </button>
                              )}
                            </div>
                            {isSelected && isExpanded && (
                              <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(245,158,11,0.15)', background: 'rgba(245,158,11,0.04)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                                <div>
                                  <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Discount Type</label>
                                  <select className="form-select" style={{ fontSize: '0.8rem', padding: '5px 8px' }} value={offer.discountType}
                                    onChange={e => setProductOfferMap(prev => ({ ...prev, [pid]: { ...offer, discountType: e.target.value as any } }))}>
                                    <option value="percentage">% Percentage</option>
                                    <option value="fixed">৳ Fixed</option>
                                  </select>
                                </div>
                                <div>
                                  <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Value ({offer.discountType === 'percentage' ? '%' : '৳'})</label>
                                  <input type="number" className="form-input" style={{ fontSize: '0.8rem', padding: '5px 8px' }} min={1} value={offer.discountValue}
                                    onChange={e => setProductOfferMap(prev => ({ ...prev, [pid]: { ...offer, discountValue: Number(e.target.value) } }))} />
                                </div>
                                <div>
                                  <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                                    <Clock size={9} style={{ display: 'inline', marginRight: '2px' }} /> Offer Ends
                                  </label>
                                  <input type="datetime-local" className="form-input" style={{ fontSize: '0.75rem', padding: '5px 6px' }}
                                    value={offer.offerEndDate ? offer.offerEndDate.slice(0, 16) : ''}
                                    onChange={e => setProductOfferMap(prev => ({ ...prev, [pid]: { ...offer, offerEndDate: new Date(e.target.value).toISOString() } }))} />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    {products.filter(p => p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) || (p.category && p.category.toLowerCase().includes(productSearchQuery.toLowerCase()))).length === 0 && (
                      <div style={{ color: '#64748b', fontSize: '0.82rem', textAlign: 'center', padding: '16px' }}>No products found matching your search</div>
                    )}
                  </div>
                  {selectedProductIds.length > 0 && (
                    <div style={{ marginTop: '10px', padding: '7px 12px', background: 'rgba(245,158,11,0.1)', borderRadius: '8px', fontSize: '0.78rem', color: '#fbbf24', fontWeight: 700 }}>
                      ✓ {selectedProductIds.length} product{selectedProductIds.length > 1 ? 's' : ''} selected for campaign offers
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Internal Notes / Message</label>
                  <textarea className="form-textarea" value={campMessage} onChange={e => setCampMessage(e.target.value)} placeholder="Write campaign notes or content..." style={{ minHeight: '70px' }} />
                </div>
              </div>
              <div className="modal-footer" style={{ flexShrink: 0 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCampaignModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Megaphone size={15} /> Launch Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE COUPON MODAL */}
      {showCouponModal && (
        <div className="modal-overlay" style={{ display: 'flex' }}>
          <div className="modal" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <span className="modal-title">Create Promo Code</span>
              <button onClick={() => setShowCouponModal(false)} style={{ color: 'var(--text-secondary)' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateCoupon}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Promo Code</label>
                  <input type="text" className="form-input" required value={coupCode} onChange={e => setCoupCode(e.target.value)} placeholder="e.g. EXTRA15" />
                </div>

                <div className="form-group">
                  <label className="form-label">Discount Type</label>
                  <select className="form-select" value={coupType} onChange={e => setCoupType(e.target.value)}>
                    <option value="percentage">Percentage Discount (%)</option>
                    <option value="fixed">Fixed Cash Discount (৳)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Discount Value</label>
                  <input type="number" className="form-input" required value={coupVal || ''} onChange={e => setCoupVal(Number(e.target.value))} />
                </div>

                <div className="form-group">
                  <label className="form-label">Expiry Date</label>
                  <input type="date" className="form-input" required value={coupExpiry} onChange={e => setCoupExpiry(e.target.value)} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCouponModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Code</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
