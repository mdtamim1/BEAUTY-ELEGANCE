import { useState, useEffect } from 'react';
import { Globe, CreditCard, Truck, Mail, Database, Save, HardDrive, Play, Trash2, Download, RefreshCw, Key, ShieldCheck, Users } from 'lucide-react';
import { systemSettings as mockSystemSettings } from '../../mock/data';
import { fetchSystemSettings, saveSystemSettings, fetchSteadfastBalanceApi } from '../../services/api';

export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [dbSettings, setDbSettings] = useState<any | null>(null);

  // General Settings Form states
  const [siteName, setSiteName] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [currency, setCurrency] = useState('BDT (৳)');
  const [timezone, setTimezone] = useState('Asia/Dhaka (GMT+6)');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Payment Methods Form states
  const [paymentBkash, setPaymentBkash] = useState(true);
  const [paymentNagad, setPaymentNagad] = useState(true);
  const [paymentSslCommerz, setPaymentSslCommerz] = useState(false);
  const [paymentCod, setPaymentCod] = useState(true);

  // Shipping Zones & Courier Form states
  const [shippingPathao, setShippingPathao] = useState(true);
  const [shippingSteadfast, setShippingSteadfast] = useState(true);
  const [shippingRedx, setShippingRedx] = useState(true);
  const [shippingCarrybee, setShippingCarrybee] = useState(true);
  const [shippingPaperfly, setShippingPaperfly] = useState(true);

  const [steadfastApiKey, setSteadfastApiKey] = useState('79pqokvknppabsrcstiz6kyzlsc9p3zm');
  const [steadfastSecretKey, setSteadfastSecretKey] = useState('7lyfy5nakfdkq8x2m2rvkbzr');
  const [steadfastEnabled, setSteadfastEnabled] = useState(true);
  const [steadfastBalanceInfo, setSteadfastBalanceInfo] = useState<any | null>(null);
  const [isCheckingBalance, setIsCheckingBalance] = useState(false);

  const [redxToken, setRedxToken] = useState('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzM1NTMxNjU2LCJpc3MiOiJ0OTlnbEVnZTBUTm5MYTNvalh6MG9VaGxtNEVoamNFMyIsInNob3BfaWQiOjEsInVzZXJfaWQiOjZ9.zpKfyHK6zPBVaTrYevnCqnUA-e2jFKQJ7lK-z4aOx2g');
  const [carrybeeClientId, setCarrybeeClientId] = useState('5ee3037e-712f-4f5e-a3cc-17ebefa42134');
  const [carrybeeClientSecret, setCarrybeeClientSecret] = useState('8d03381f-b0b4-4a9b-9a0b-70b73cbbe835');
  const [pathaoClientId, setPathaoClientId] = useState('w9aA85PevM');
  const [pathaoClientSecret, setPathaoClientSecret] = useState('LBiXnHQFvxh8ODWA7aDmRkC6v');
  const [pathaoUsername, setPathaoUsername] = useState('rjtamim154@gmail.com');
  const [pathaoPassword, setPathaoPassword] = useState('');
  const [paperflyKey, setPaperflyKey] = useState('Paperfly_~La?Rj73FcLm');
  const [couriercheckApiKey, setCouriercheckApiKey] = useState('');

  // Email Provider Form states
  const [emailProvider, setEmailProvider] = useState('SendGrid');
  const [smtpHost, setSmtpHost] = useState('smtp.sendgrid.net');
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');

  // Cache & Performance Form states
  const [cacheDriver, setCacheDriver] = useState('Redis');
  const [cacheTTL, setCacheTTL] = useState(3600);

  // Backups Local states
  const [backups, setBackups] = useState([
    { id: '1', name: 'backup_db_prod_2026_06_25.sql', date: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(), size: '1.74 GB', status: 'completed' },
    { id: '2', name: 'backup_db_prod_2026_06_28.sql', date: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(), size: '1.81 GB', status: 'completed' },
  ]);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isFlushingCache, setIsFlushingCache] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load configuration from database on mount
  useEffect(() => {
    const loadConfig = async () => {
      setIsLoading(true);
      const data = await fetchSystemSettings();
      if (data) {
        setDbSettings(data);
        setSiteName(data.siteName || '');
        setSiteUrl(data.siteUrl || '');
        setCurrency(data.currency || 'BDT (৳)');
        setTimezone(data.timezone || 'Asia/Dhaka (GMT+6)');
        setMaintenanceMode(!!data.maintenanceMode);
        
        setPaymentBkash(data.paymentBkash !== undefined ? !!data.paymentBkash : true);
        setPaymentNagad(data.paymentNagad !== undefined ? !!data.paymentNagad : true);
        setPaymentSslCommerz(!!data.paymentSslCommerz);
        setPaymentCod(data.paymentCod !== undefined ? !!data.paymentCod : true);
        
        setShippingPathao(data.shippingPathao !== undefined ? !!data.shippingPathao : true);
        setShippingSteadfast(data.shippingSteadfast !== undefined ? !!data.shippingSteadfast : true);
        setShippingRedx(!!data.shippingRedx);
        
        setSteadfastApiKey(data.steadfastApiKey || '79pqokvknppabsrcstiz6kyzlsc9p3zm');
        setSteadfastSecretKey(data.steadfastSecretKey || '7lyfy5nakfdkq8x2m2rvkbzr');
        setSteadfastEnabled(data.steadfastEnabled !== undefined ? !!data.steadfastEnabled : true);

        setRedxToken(data.redxToken || '');
        setCarrybeeClientId(data.carrybeeClientId || '');
        setCarrybeeClientSecret(data.carrybeeClientSecret || '');
        setPathaoClientId(data.pathaoClientId || 'w9aA85PevM');
        setPathaoClientSecret(data.pathaoClientSecret || 'LBiXnHQFvxh8ODWA7aDmRkC6v');
        setPathaoUsername(data.pathaoUsername || 'rjtamim154@gmail.com');
        setPathaoPassword(data.pathaoPassword || '');
        setPaperflyKey(data.paperflyKey || '');
        setCouriercheckApiKey(data.couriercheckApiKey || '');

        setEmailProvider(data.emailProvider || 'SendGrid');
        setSmtpHost(data.smtpHost || 'smtp.sendgrid.net');
        setSmtpPort(data.smtpPort || 587);
        setSmtpUser(data.smtpUser || '');
        setSmtpPass(data.smtpPass || '');
        
        setCacheDriver(data.cacheDriver || 'Redis');
        setCacheTTL(data.cacheTTL !== undefined ? Number(data.cacheTTL) : 3600);
      } else {
        // Fallback to mock settings
        setSiteName(mockSystemSettings.siteName);
        setSiteUrl(mockSystemSettings.siteUrl);
        setCurrency(mockSystemSettings.currency);
        setTimezone(mockSystemSettings.timezone);
        setMaintenanceMode(mockSystemSettings.maintenanceMode);
        
        setPaymentBkash(true);
        setPaymentNagad(true);
        setPaymentSslCommerz(false);
        setPaymentCod(true);
        
        setShippingPathao(true);
        setShippingSteadfast(true);
        setShippingRedx(false);
        
        setEmailProvider(mockSystemSettings.emailProvider || 'SendGrid');
        setSmtpHost(mockSystemSettings.smtpHost || 'smtp.sendgrid.net');
        setSmtpPort(mockSystemSettings.smtpPort || 587);
        setSmtpUser('apikey');
        setSmtpPass('••••••••••••••••••••');
        
        setCacheDriver(mockSystemSettings.cacheDriver || 'Redis');
        setCacheTTL(3600);
      }
      setIsLoading(false);
    };
    loadConfig();
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    const updatedData = {
      siteName,
      siteUrl,
      currency,
      timezone,
      maintenanceMode,
      paymentBkash,
      paymentNagad,
      paymentSslCommerz,
      paymentCod,
      shippingPathao,
      shippingSteadfast,
      shippingRedx,
      steadfastApiKey,
      steadfastSecretKey,
      steadfastEnabled,
      redxToken,
      carrybeeClientId,
      carrybeeClientSecret,
      pathaoClientId,
      pathaoClientSecret,
      pathaoUsername,
      pathaoPassword,
      paperflyKey,
      couriercheckApiKey,
      emailProvider,
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPass,
      cacheDriver,
      cacheTTL
    };

    const success = await saveSystemSettings(updatedData);
    setIsLoading(false);
    if (success) {
      alert('System settings saved successfully!');
    } else {
      alert('Failed to save settings. Operating in mock offline mode.');
    }
  };

  const handleCreateBackup = () => {
    setIsBackingUp(true);
    setTimeout(() => {
      const newBackup = {
        id: String(backups.length + 1),
        name: `backup_db_prod_${new Date().toISOString().slice(0, 10).replace(/-/g, '_')}_${Math.random().toString(36).substring(2, 6)}.sql`,
        date: new Date().toISOString(),
        size: '1.85 GB',
        status: 'completed'
      };
      setBackups([newBackup, ...backups]);
      setIsBackingUp(false);
      alert('New database backup created successfully!');
    }, 2000);
  };

  const handleRestoreBackup = (name: string) => {
    if (window.confirm(`Are you sure you want to restore the system database to backup file: "${name}"? Existing database data will be overwritten.`)) {
      alert('Database restored successfully! The system is restarting background services.');
    }
  };

  const handleDeleteBackup = (id: string) => {
    if (window.confirm('Are you sure you want to delete this backup file? This action is permanent.')) {
      setBackups(backups.filter(b => b.id !== id));
      alert('Backup file deleted successfully.');
    }
  };

  const handleFlushCache = () => {
    setIsFlushingCache(true);
    setTimeout(() => {
      setIsFlushingCache(false);
      alert('Redis cache flushed successfully! Cache metrics recalculated.');
    }, 1500);
  };

  const handleCheckSteadfastBalance = async () => {
    setIsCheckingBalance(true);
    const res = await fetchSteadfastBalanceApi();
    setIsCheckingBalance(false);
    if (res && res.status === 'success') {
      setSteadfastBalanceInfo(res.data);
      const balance = res.data?.current_balance !== undefined ? res.data.current_balance : JSON.stringify(res.data);
      alert(`Steadfast Connection Successful!\nCurrent Merchant Balance: ৳${balance}`);
    } else {
      setSteadfastBalanceInfo(null);
      alert(`Steadfast Connection Failed: ${res?.message || 'Check API credentials'}`);
    }
  };

  const tabs = [
    { id: 'general', label: 'General Settings', icon: Globe },
    { id: 'payment', label: 'Payment Methods', icon: CreditCard },
    { id: 'shipping', label: 'Shipping Zones', icon: Truck },
    { id: 'email', label: 'Email Provider', icon: Mail },
    { id: 'cache', label: 'Cache & Performance', icon: Database },
    { id: 'backup', label: 'Backups', icon: HardDrive },
  ];

  const currentSettings = dbSettings || mockSystemSettings;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-breadcrumb"><span>Home</span><span className="page-breadcrumb-sep">/</span><span>System</span></div>
          <h1 className="page-title">System Control Center</h1>
          <p className="page-subtitle">Configure global platform settings, integrations, and performance</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={handleSave} disabled={isLoading}>
            <Save size={16} /> {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
 
      <div className="content-grid">
        <div className="card" style={{ height: 'fit-content' }}>
          <div className="card-header">
            <div><div className="card-title">Settings Navigation</div></div>
          </div>
          <div className="card-body" style={{ padding: 'var(--space-2)' }}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <div
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                    cursor: 'pointer', borderRadius: 'var(--radius-md)',
                    background: activeTab === tab.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                    color: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    fontWeight: activeTab === tab.id ? 600 : 500,
                    transition: 'all 0.2s',
                  }}
                >
                  <Icon size={18} />
                  {tab.label}
                </div>
              );
            })}
          </div>
        </div>
 
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div><div className="card-title">{tabs.find(t => t.id === activeTab)?.label}</div></div>
            {activeTab === 'backup' && (
              <button 
                className="btn btn-primary" 
                onClick={handleCreateBackup}
                disabled={isBackingUp}
              >
                <HardDrive size={16} style={{ marginRight: '8px' }} />
                {isBackingUp ? 'Backing Up...' : 'Create Backup'}
              </button>
            )}
          </div>
          <div className="card-body">
            
            {/* General Settings Tab */}
            {activeTab === 'general' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Store Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={siteName} 
                      onChange={(e) => setSiteName(e.target.value)} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Store URL</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={siteUrl} 
                      onChange={(e) => setSiteUrl(e.target.value)} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Primary Currency</label>
                    <select 
                      className="form-select" 
                      value={currency} 
                      onChange={(e) => setCurrency(e.target.value)}
                    >
                      <option value="BDT (৳)">BDT (৳)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Timezone</label>
                    <select 
                      className="form-select" 
                      value={timezone} 
                      onChange={(e) => setTimezone(e.target.value)}
                    >
                      <option value="Asia/Dhaka (GMT+6)">Asia/Dhaka (GMT+6)</option>
                      <option value="UTC">UTC (Universal Coordinated Time)</option>
                      <option value="EST">EST (Eastern Standard Time)</option>
                      <option value="PST">PST (Pacific Standard Time)</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Maintenance Mode</span>
                    <div 
                      className={`form-switch ${maintenanceMode ? 'active' : ''}`} 
                      onClick={() => setMaintenanceMode(!maintenanceMode)}
                      style={{ cursor: 'pointer' }}
                    />
                  </label>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>When active, the store storefront will display a "Coming Soon" page.</p>
                </div>
              </div>
            )}

            {/* Payment Methods Tab */}
            {activeTab === 'payment' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                  Enable or disable different checkout payment gateways on the customer storefront.
                </p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>bKash Checkout API</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Allows direct payments through secure bKash personal/merchant billing.</div>
                    </div>
                    <div 
                      className={`form-switch ${paymentBkash ? 'active' : ''}`} 
                      onClick={() => setPaymentBkash(!paymentBkash)}
                      style={{ cursor: 'pointer' }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Nagad API Payment</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Process instant orders via the official Nagad payment gateway redirect.</div>
                    </div>
                    <div 
                      className={`form-switch ${paymentNagad ? 'active' : ''}`} 
                      onClick={() => setPaymentNagad(!paymentNagad)}
                      style={{ cursor: 'pointer' }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>SSLCommerz Hosted Gateway</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Accept Visa, Mastercard, Amex, Internet Banking, and mobile banking wallets.</div>
                    </div>
                    <div 
                      className={`form-switch ${paymentSslCommerz ? 'active' : ''}`} 
                      onClick={() => setPaymentSslCommerz(!paymentSslCommerz)}
                      style={{ cursor: 'pointer' }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Cash on Delivery (COD)</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Allow customers to place orders without paying online; pay upon delivery.</div>
                    </div>
                    <div 
                      className={`form-switch ${paymentCod ? 'active' : ''}`} 
                      onClick={() => setPaymentCod(!paymentCod)}
                      style={{ cursor: 'pointer' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Shipping Zones Tab */}
            {activeTab === 'shipping' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                  Manage third-party logistics integrations for auto-consignment and parcel tracking.
                </p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Pathao Delivery API</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Automate merchant orders booking and sync tracking URLs.</div>
                    </div>
                    <div 
                      className={`form-switch ${shippingPathao ? 'active' : ''}`} 
                      onClick={() => setShippingPathao(!shippingPathao)}
                      style={{ cursor: 'pointer' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '20px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Truck size={20} style={{ color: 'var(--accent-primary)' }} />
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 'var(--text-base)' }}>Steadfast Courier API (স্টেডফাস্ট কুরিয়ার)</div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Automate parcel creation, COD collection, and shipment tracking.</div>
                        </div>
                      </div>
                      <div 
                        className={`form-switch ${shippingSteadfast ? 'active' : ''}`} 
                        onClick={() => {
                          setShippingSteadfast(!shippingSteadfast);
                          setSteadfastEnabled(!shippingSteadfast);
                        }}
                        style={{ cursor: 'pointer' }}
                      />
                    </div>

                    {shippingSteadfast && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px', paddingTop: '14px', borderTop: '1px solid var(--border-color)' }}>
                        <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          <div className="form-group">
                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Key size={14} /> Steadfast API Key
                            </label>
                            <input 
                              type="text" 
                              className="form-input" 
                              placeholder="e.g. 5x89a...your_api_key" 
                              value={steadfastApiKey} 
                              onChange={(e) => setSteadfastApiKey(e.target.value)}
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <ShieldCheck size={14} /> Steadfast Secret Key
                            </label>
                            <input 
                              type="password" 
                              className="form-input" 
                              placeholder="e.g. sec_77b...your_secret_key" 
                              value={steadfastSecretKey} 
                              onChange={(e) => setSteadfastSecretKey(e.target.value)}
                            />
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                          <button 
                            type="button"
                            className="btn btn-secondary" 
                            onClick={handleCheckSteadfastBalance}
                            disabled={isCheckingBalance}
                            style={{ fontSize: 'var(--text-xs)' }}
                          >
                            <RefreshCw size={14} className={isCheckingBalance ? 'animate-spin' : ''} style={{ marginRight: '6px' }} />
                            {isCheckingBalance ? 'Testing Connection...' : 'Test Connection & Check Balance'}
                          </button>
                          
                          {steadfastBalanceInfo && (
                            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--success-color)' }}>
                              Current Balance: ৳{steadfastBalanceInfo.current_balance ?? 0} BDT
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Pathao Courier API */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '20px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Truck size={20} style={{ color: '#ef4444' }} />
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 'var(--text-base)' }}>Pathao Courier API (পাঠাও কুরিয়ার)</div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Automate merchant orders booking and sync tracking URLs.</div>
                        </div>
                      </div>
                      <div 
                        className={`form-switch ${shippingPathao ? 'active' : ''}`} 
                        onClick={() => setShippingPathao(!shippingPathao)}
                        style={{ cursor: 'pointer' }}
                      />
                    </div>
                    {shippingPathao && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px', paddingTop: '14px', borderTop: '1px solid var(--border-color)' }}>
                        <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          <div className="form-group">
                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Key size={14} /> Pathao Client ID
                            </label>
                            <input type="text" className="form-input" value={pathaoClientId} onChange={(e) => setPathaoClientId(e.target.value)} />
                          </div>
                          <div className="form-group">
                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <ShieldCheck size={14} /> Pathao Client Secret
                            </label>
                            <input type="password" className="form-input" value={pathaoClientSecret} onChange={(e) => setPathaoClientSecret(e.target.value)} />
                          </div>
                        </div>

                        <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          <div className="form-group">
                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Users size={14} /> Pathao Login Email (Username)
                            </label>
                            <input 
                              type="email" 
                              className="form-input" 
                              placeholder="e.g. merchant@gmail.com"
                              value={pathaoUsername} 
                              onChange={(e) => setPathaoUsername(e.target.value)} 
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Key size={14} /> Pathao Account Password
                            </label>
                            <input 
                              type="password" 
                              className="form-input" 
                              placeholder="Your Pathao Merchant Login Password"
                              value={pathaoPassword} 
                              onChange={(e) => setPathaoPassword(e.target.value)} 
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CarryBee Courier API */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '20px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Truck size={20} style={{ color: '#f59e0b' }} />
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 'var(--text-base)' }}>CarryBee Courier API (ক্যারিবী কুরিয়ার)</div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Production & Sandbox API integration for automated merchant delivery.</div>
                        </div>
                      </div>
                      <div 
                        className={`form-switch ${shippingCarrybee ? 'active' : ''}`} 
                        onClick={() => setShippingCarrybee(!shippingCarrybee)}
                        style={{ cursor: 'pointer' }}
                      />
                    </div>
                    {shippingCarrybee && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '10px', paddingTop: '14px', borderTop: '1px solid var(--border-color)' }}>
                        <div className="form-group">
                          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Key size={14} /> CarryBee Client ID
                          </label>
                          <input type="text" className="form-input" value={carrybeeClientId} onChange={(e) => setCarrybeeClientId(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <ShieldCheck size={14} /> CarryBee Client Secret
                          </label>
                          <input type="password" className="form-input" value={carrybeeClientSecret} onChange={(e) => setCarrybeeClientSecret(e.target.value)} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* RedX Logistics API */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '20px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Truck size={20} style={{ color: '#ef4444' }} />
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 'var(--text-base)' }}>RedX Logistics API (রেডএক্স লজিস্টিকস)</div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Enterprise shipping tracking and automated delivery booking.</div>
                        </div>
                      </div>
                      <div 
                        className={`form-switch ${shippingRedx ? 'active' : ''}`} 
                        onClick={() => setShippingRedx(!shippingRedx)}
                        style={{ cursor: 'pointer' }}
                      />
                    </div>
                    {shippingRedx && (
                      <div style={{ marginTop: '10px', paddingTop: '14px', borderTop: '1px solid var(--border-color)' }}>
                        <div className="form-group">
                          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Key size={14} /> RedX JWT Access Token
                          </label>
                          <input type="password" className="form-input" value={redxToken} onChange={(e) => setRedxToken(e.target.value)} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Paperfly Courier API */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '20px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Truck size={20} style={{ color: '#3b82f6' }} />
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 'var(--text-base)' }}>Paperfly Courier API (পেপারফ্লাই)</div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Nationwide doorstep delivery and smart return API.</div>
                        </div>
                      </div>
                      <div 
                        className={`form-switch ${shippingPaperfly ? 'active' : ''}`} 
                        onClick={() => setShippingPaperfly(!shippingPaperfly)}
                        style={{ cursor: 'pointer' }}
                      />
                    </div>
                    {shippingPaperfly && (
                      <div style={{ marginTop: '10px', paddingTop: '14px', borderTop: '1px solid var(--border-color)' }}>
                        <div className="form-group">
                          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Key size={14} /> Paperfly Key
                          </label>
                          <input type="text" className="form-input" value={paperflyKey} onChange={(e) => setPaperflyKey(e.target.value)} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CourierCheck BD Universal Aggregator API */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '20px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid #10b981' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <ShieldCheck size={22} style={{ color: '#10b981' }} />
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 'var(--text-base)' }}>
                            CourierCheck BD Universal API (সারাদেশের পাঠাও + রেডএক্স ফ্রড চেক) 🏆
                          </div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                            Connect CourierCheck / BD Courier API Key for 1-click nationwide Pathao, RedX, CarryBee & Steadfast fraud reports.
                          </div>
                        </div>
                      </div>
                      <span style={{ fontSize: '11px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '3px 10px', borderRadius: '12px', fontWeight: 700 }}>
                        RECOMMENDED FOR PATHAO
                      </span>
                    </div>

                    <div style={{ marginTop: '10px', paddingTop: '14px', borderTop: '1px solid var(--border-color)' }}>
                      <div className="form-group">
                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Key size={14} /> CourierCheck API Key (Bearer Token)
                        </label>
                        <input 
                          type="password" 
                          className="form-input" 
                          placeholder="Paste CourierCheck.com.bd API Key here for nationwide Pathao reports"
                          value={couriercheckApiKey} 
                          onChange={(e) => setCouriercheckApiKey(e.target.value)} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Email Provider Tab */}
            {activeTab === 'email' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Email Service Provider</label>
                    <select 
                      className="form-select" 
                      value={emailProvider} 
                      onChange={(e) => setEmailProvider(e.target.value)}
                    >
                      <option value="SendGrid">SendGrid</option>
                      <option value="Mailgun">Mailgun</option>
                      <option value="SMTP">Custom SMTP Server</option>
                      <option value="SES">Amazon SES</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">SMTP Host</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={smtpHost} 
                      onChange={(e) => setSmtpHost(e.target.value)} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">SMTP Port</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={smtpPort} 
                      onChange={(e) => setSmtpPort(Number(e.target.value))} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">SMTP Username</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={smtpUser} 
                      placeholder="Enter username or api_key"
                      onChange={(e) => setSmtpUser(e.target.value)} 
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">SMTP Password</label>
                    <input 
                      type="password" 
                      className="form-input" 
                      value={smtpPass} 
                      placeholder="••••••••••••••••••••"
                      onChange={(e) => setSmtpPass(e.target.value)} 
                    />
                  </div>
                </div>
              </div>
            )}
 
            {/* Cache & Performance Tab */}
            {activeTab === 'cache' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="grid-3">
                  <div style={{ padding: '16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Cache Driver</div>
                    <div style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--text-primary)' }}>{cacheDriver}</div>
                  </div>
                  <div style={{ padding: '16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Hit Rate</div>
                    <div style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--color-success)' }}>{currentSettings.cacheHitRate}%</div>
                  </div>
                  <div style={{ padding: '16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Memory Used</div>
                    <div style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--text-primary)' }}>{currentSettings.cacheSize}</div>
                  </div>
                </div>
                
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Select Cache Driver</label>
                    <select 
                      className="form-select" 
                      value={cacheDriver} 
                      onChange={(e) => setCacheDriver(e.target.value)}
                    >
                      <option value="Redis">Redis (Recommended)</option>
                      <option value="Memcached">Memcached</option>
                      <option value="File">Local File Cache</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Cache Time-To-Live (TTL) (Seconds)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={cacheTTL} 
                      onChange={(e) => setCacheTTL(Number(e.target.value))} 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Flush Cache</label>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: '12px' }}>
                    Clear the Redis cache to force the system to rebuild data from the database. This may temporarily increase load times.
                  </p>
                  <button 
                    className="btn btn-secondary" 
                    type="button"
                    onClick={handleFlushCache}
                    disabled={isFlushingCache}
                  >
                    {isFlushingCache ? 'Flushing Redis...' : 'Clear Redis Cache'}
                  </button>
                </div>
              </div>
            )}

            {/* Backups Tab */}
            {activeTab === 'backup' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="grid-3" style={{ marginBottom: '10px' }}>
                  <div style={{ padding: '16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Total Backups</div>
                    <div style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--text-primary)' }}>{backups.length} Files</div>
                  </div>
                  <div style={{ padding: '16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Backup Storage Used</div>
                    <div style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--accent-primary)' }}>
                      {(backups.length * 1.8).toFixed(2)} GB
                    </div>
                  </div>
                  <div style={{ padding: '16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Last Backup Taken</div>
                    <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>
                      {backups.length > 0 ? new Date(backups[0].date).toLocaleString() : 'N/A'}
                    </div>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Backup Name</th>
                        <th>Created Date</th>
                        <th>File Size</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {backups.map(backup => (
                        <tr key={backup.id}>
                          <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{backup.name}</td>
                          <td>{new Date(backup.date).toLocaleString()}</td>
                          <td>{backup.size}</td>
                          <td>
                            <span 
                              style={{ 
                                display: 'inline-block',
                                padding: '4px 8px',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: 'var(--text-xs)',
                                fontWeight: 600,
                                background: 'rgba(16, 185, 129, 0.1)',
                                color: 'var(--color-success)'
                              }}
                            >
                              {backup.status.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                              <button 
                                className="btn btn-outline" 
                                style={{ padding: '6px 12px', fontSize: 'var(--text-xs)', display: 'flex', alignItems: 'center', gap: '4px' }}
                                onClick={() => handleRestoreBackup(backup.name)}
                                title="Restore database"
                              >
                                <Play size={12} /> Restore
                              </button>
                              <button 
                                className="btn btn-outline" 
                                style={{ padding: '6px 12px', fontSize: 'var(--text-xs)', display: 'flex', alignItems: 'center', gap: '4px' }}
                                onClick={() => alert(`Starting download for: ${backup.name}`)}
                                title="Download backup file"
                              >
                                <Download size={12} /> Download
                              </button>
                              <button 
                                className="btn btn-outline" 
                                style={{ padding: '6px 12px', fontSize: 'var(--text-xs)', color: 'var(--color-danger)', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', gap: '4px' }}
                                onClick={() => handleDeleteBackup(backup.id)}
                                title="Delete backup file"
                              >
                                <Trash2 size={12} /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
