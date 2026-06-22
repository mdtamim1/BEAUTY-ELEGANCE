import { useState, useEffect } from 'react';
import { Globe, CreditCard, Truck, Mail, Database, Save, HardDrive } from 'lucide-react';
import { systemSettings as mockSystemSettings } from '../../mock/data';
import { fetchSystemSettings, saveSystemSettings } from '../../services/api';

export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [dbSettings, setDbSettings] = useState<any | null>(null);

  // Form states
  const [siteName, setSiteName] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [currency, setCurrency] = useState('BDT (৳)');
  const [timezone, setTimezone] = useState('Asia/Dhaka (GMT+6)');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
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
      } else {
        // Fallback to mock settings
        setSiteName(mockSystemSettings.siteName);
        setSiteUrl(mockSystemSettings.siteUrl);
        setCurrency(mockSystemSettings.currency);
        setTimezone(mockSystemSettings.timezone);
        setMaintenanceMode(mockSystemSettings.maintenanceMode);
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
      maintenanceMode
    };

    const success = await saveSystemSettings(updatedData);
    setIsLoading(false);
    if (success) {
      alert('System settings saved successfully!');
    } else {
      alert('Failed to save settings. Operating in mock offline mode.');
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
          <div className="card-header">
            <div><div className="card-title">{tabs.find(t => t.id === activeTab)?.label}</div></div>
          </div>
          <div className="card-body">
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
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>When active, the store frontend will display a "Coming Soon" page.</p>
                </div>
              </div>
            )}
 
            {activeTab === 'cache' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="grid-3">
                  <div style={{ padding: '16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Cache Driver</div>
                    <div style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--text-primary)' }}>{currentSettings.cacheDriver}</div>
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
                <div className="form-group">
                  <label className="form-label">Flush Cache</label>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: '12px' }}>Clear the Redis cache to force the system to rebuild data from the database. This may temporarily increase load times.</p>
                  <button className="btn btn-secondary" type="button">Clear Redis Cache</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
