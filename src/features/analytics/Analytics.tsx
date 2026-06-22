import { useState } from 'react';
import {
  BarChart3, TrendingUp, ShoppingBag, Users, Globe, Monitor,
  MapPin, MousePointer, GitBranch, Navigation, Brain, Sparkles, ShieldAlert
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart,
  PolarGrid, PolarAngleAxis, Radar, FunnelChart, Funnel
} from 'recharts';
import {
  monthlyRevenueData, categoryRevenueData, trafficSourceData, deviceData,
  countryData, funnelData, salesByHour, salesByWeekday, brandPerformance,
  aiSalesPrediction, aiCustomerSegments, aiFraudAlerts, generateCustomers,
  formatCurrency, formatNumber
} from '../../mock/data';

const COLORS = ['#6366f1', '#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(15, 19, 41, 0.95)', border: '1px solid rgba(99, 102, 241, 0.2)',
      borderRadius: '8px', padding: '10px 14px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    }}>
      <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color, fontSize: '13px', fontWeight: 600 }}>
          {entry.name}: {typeof entry.value === 'number' && entry.value > 1000 ? formatCurrency(entry.value) : entry.value}
        </p>
      ))}
    </div>
  );
};

const analyticsViews = [
  { id: 'sales', label: 'Sales', icon: BarChart3 },
  { id: 'products', label: 'Products', icon: ShoppingBag },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'traffic', label: 'Traffic', icon: Globe },
  { id: 'conversion', label: 'Conversion', icon: GitBranch },
  { id: 'geo', label: 'Geography', icon: MapPin },
  { id: 'devices', label: 'Devices', icon: Monitor },
  { id: 'funnel', label: 'Funnel', icon: Navigation },
  { id: 'ai', label: 'AI Predictions', icon: Brain },
];

export default function Analytics() {
  const [activeView, setActiveView] = useState('sales');
  const [dateRange, setDateRange] = useState('30days');

  // Interactive filters data scaling
  const getStats = () => {
    switch (dateRange) {
      case 'today':
        return { sales: 22900, aov: 9800, orders: 2, refund: '0%', salesChg: '+4.2%', aovChg: '+1.5%', ordChg: '+10%', positive: true };
      case '7days':
        return { sales: 115000, aov: 11500, orders: 10, refund: '0.8%', salesChg: '+8.7%', aovChg: '+2.4%', ordChg: '+12%', positive: true };
      case '90days':
        return { sales: 1250000, aov: 13500, orders: 92, refund: '1.5%', salesChg: '+22.4%', aovChg: '+5.8%', ordChg: '+30%', positive: true };
      case '30days':
      default:
        return { sales: 495000, aov: 12375, orders: 40, refund: '1.2%', salesChg: '+12.4%', aovChg: '+3.1%', ordChg: '+15%', positive: true };
    }
  };

  const currentStats = getStats();

  const customerRetention = [
    { name: 'Month 1', value: 100 },
    { name: 'Month 2', value: 85 },
    { name: 'Month 3', value: 72 },
    { name: 'Month 4', value: 65 },
    { name: 'Month 5', value: 58 },
    { name: 'Month 6', value: 54 }
  ];

  const conversionData = [
    { name: 'Sat', value: 2.1, value2: 3.4 },
    { name: 'Sun', value: 2.4, value2: 3.8 },
    { name: 'Mon', value: 2.0, value2: 3.1 },
    { name: 'Tue', value: 2.5, value2: 3.6 },
    { name: 'Wed', value: 2.8, value2: 4.2 },
    { name: 'Thu', value: 2.3, value2: 3.5 },
    { name: 'Fri', value: 3.2, value2: 4.8 }
  ];

  const radarData = [
    { metric: 'Marketing', value: 85 },
    { metric: 'Sales', value: 90 },
    { metric: 'Support', value: 75 },
    { metric: 'Productivity', value: 80 },
    { metric: 'Logistics', value: 95 }
  ];

  const customerList = generateCustomers();

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-breadcrumb">
            <span>Home</span><span className="page-breadcrumb-sep">/</span><span>Analytics</span>
          </div>
          <h1 className="page-title">Advanced Analytics</h1>
          <p className="page-subtitle">Deep insights across all dimensions of your business</p>
        </div>
        <div className="page-header-actions" style={{ display: 'flex', gap: '8px' }}>
          <select 
            className="form-select" 
            style={{ width: '150px', height: '38px', fontSize: 'var(--text-xs)' }}
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
          </select>
          <button className="btn btn-primary" onClick={() => alert('Exporting Analytics Data...')}>
            <BarChart3 size={16} /> Export
          </button>
        </div>
      </div>

      {/* Analytics Navigation */}
      <div className="tabs" style={{ marginBottom: 'var(--space-6)' }}>
        {analyticsViews.map((view) => {
          const Icon = view.icon;
          return (
            <button
              key={view.id}
              className={`tab ${activeView === view.id ? 'active' : ''}`}
              onClick={() => setActiveView(view.id)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Icon size={14} /> {view.label}
            </button>
          );
        })}
      </div>

      {/* Sales Analytics */}
      {activeView === 'sales' && (
        <>
          <div className="stats-grid" style={{ marginBottom: 'var(--space-6)' }}>
            {[
              { label: 'Total Sales', value: formatCurrency(currentStats.sales), change: currentStats.salesChg, positive: currentStats.positive },
              { label: 'Avg Order Value', value: formatCurrency(currentStats.aov), change: currentStats.aovChg, positive: currentStats.positive },
              { label: 'Orders', value: currentStats.orders.toString(), change: currentStats.ordChg, positive: currentStats.positive },
              { label: 'Refund Rate', value: currentStats.refund, change: '0.0%', positive: true },
            ].map((s, i) => (
              <div key={i} className="stat-card" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="stat-card-label">{s.label}</div>
                <div className="stat-card-value">{s.value}</div>
                <div className="stat-card-footer">
                  <span className={`stat-card-change ${s.positive ? 'positive' : 'negative'}`}>
                    {s.positive ? <TrendingUp size={12} /> : null} {s.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="content-grid-equal" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="chart-card">
              <div className="chart-header">
                <div><div className="chart-title">Revenue Trend</div></div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyRevenueData}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                  <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `৳${(v/1000)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="value" name="Revenue" stroke="#6366f1" strokeWidth={2} fill="url(#salesGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-card">
              <div className="chart-header"><div><div className="chart-title">Sales by Hour</div></div></div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesByHour}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                  <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Orders" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="chart-card" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="chart-header"><div><div className="chart-title">Sales by Day of Week</div></div></div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={salesByWeekday}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `৳${(v/1000)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Revenue" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={40} />
                <Bar dataKey="value2" name="Orders" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* Product Analytics */}
      {activeView === 'products' && (
        <>
          <div className="content-grid-equal" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="chart-card">
              <div className="chart-header"><div><div className="chart-title">Revenue by Category</div></div></div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={categoryRevenueData} cx="50%" cy="50%" innerRadius={70} outerRadius={115} paddingAngle={3} dataKey="value">
                    {categoryRevenueData.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '8px' }}>
                {categoryRevenueData.map((item, i) => (
                  <div key={i} className="chart-legend-item"><div className="chart-legend-dot" style={{ background: COLORS[i % COLORS.length] }} />{item.name}</div>
                ))}
              </div>
            </div>
            <div className="chart-card">
              <div className="chart-header"><div><div className="chart-title">Brand Performance</div></div></div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={brandPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" horizontal={false} />
                  <XAxis type="number" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => formatCurrency(v)} />
                  <YAxis type="category" dataKey="name" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} width={70} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Revenue" radius={[0, 6, 6, 0]} maxBarSize={20}>
                    {brandPerformance.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="chart-card">
            <div className="chart-header"><div><div className="chart-title">Performance Radar</div></div></div>
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(148,163,184,0.15)" />
                <PolarAngleAxis dataKey="metric" stroke="#94a3b8" fontSize={12} />
                <Radar name="Score" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* Customer Analytics */}
      {activeView === 'customers' && (
        <>
          <div className="stats-grid" style={{ marginBottom: 'var(--space-6)' }}>
            {[
              { label: 'Total Customers', value: customerList.length.toString() },
              { label: 'New This Month', value: '2' },
              { label: 'Avg LTV', value: '৳25,133.00' },
              { label: 'Churn Rate', value: '1.4%' },
            ].map((s, i) => (
              <div key={i} className="stat-card"><div className="stat-card-label">{s.label}</div><div className="stat-card-value">{s.value}</div></div>
            ))}
          </div>
          <div className="content-grid-equal" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="chart-card">
              <div className="chart-header"><div><div className="chart-title">Customer Retention Curve</div></div></div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={customerRetention}>
                  <defs>
                    <linearGradient id="retGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} /><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                  <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="value" name="Retention %" stroke="#8b5cf6" strokeWidth={2} fill="url(#retGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-card">
              <div className="chart-header"><div><div className="chart-title">Customer Segmentation</div></div></div>
              <div style={{ padding: 'var(--space-4)' }}>
                {[
                  { segment: 'VIP Customers', pct: 60, count: '2', color: '#6366f1' },
                  { segment: 'Regular Buyers', pct: 0, count: '0', color: '#3b82f6' },
                  { segment: 'New Customers', pct: 30, count: '1', color: '#10b981' },
                  { segment: 'At-Risk', pct: 0, count: '0', color: '#f59e0b' },
                  { segment: 'Churned', pct: 10, count: '0', color: '#ef4444' },
                ].map((seg, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: i < 4 ? '1px solid var(--border-secondary)' : 'none' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: seg.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', flex: 1 }}>{seg.segment}</span>
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontWeight: 600 }}>{seg.count}</span>
                    <div style={{ width: '100px' }}><div className="progress-bar"><div className="progress-fill" style={{ width: `${seg.pct}%`, background: seg.color }} /></div></div>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', width: '36px', textAlign: 'right' }}>{seg.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}


      {/* Traffic Analytics */}
      {activeView === 'traffic' && (
        <div className="content-grid-equal" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="chart-card">
            <div className="chart-header"><div><div className="chart-title">Traffic Sources</div></div></div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={trafficSourceData} cx="50%" cy="50%" innerRadius={70} outerRadius={115} paddingAngle={3} dataKey="value">
                  {trafficSourceData.map((_, i) => (<Cell key={i} fill={COLORS[i]} />))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
              {trafficSourceData.map((item, i) => (
                <div key={i} className="chart-legend-item"><div className="chart-legend-dot" style={{ background: COLORS[i] }} />{item.name} ({item.value}%)</div>
              ))}
            </div>
          </div>
          <div className="chart-card">
            <div className="chart-header"><div><div className="chart-title">Traffic by Country</div></div></div>
            <div style={{ padding: 'var(--space-2)' }}>
              {countryData.map((country, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: i < countryData.length - 1 ? '1px solid var(--border-secondary)' : 'none' }}>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', flex: 1 }}>{country.name}</span>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontWeight: 600 }}>{formatCurrency(country.value)}</span>
                  <div style={{ width: '80px' }}><div className="progress-bar"><div className="progress-fill" style={{ width: `${country.value2}%` }} /></div></div>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', width: '30px', textAlign: 'right' }}>{country.value2}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Conversion Analytics */}
      {activeView === 'conversion' && (
        <div className="content-grid-equal" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="chart-card">
            <div className="chart-header"><div><div className="chart-title">Conversion Rate Trend</div></div></div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={conversionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="value" name="Desktop" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="value2" name="Mobile" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-card">
            <div className="chart-header"><div><div className="chart-title">Key Metrics</div></div></div>
            <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { label: 'Overall Conversion', value: '4.5%', trend: '+0.2%', color: 'var(--color-success)' },
                { label: 'Cart Abandonment', value: '68.2%', trend: '-1.5%', color: 'var(--color-success)' },
                { label: 'Checkout Completion', value: '25.0%', trend: '+0.8%', color: 'var(--color-success)' },
                { label: 'Add to Cart Rate', value: '32.0%', trend: '+1.2%', color: 'var(--color-success)' },
                { label: 'Wishlist to Purchase', value: '15.2%', trend: '+0.5%', color: 'var(--color-success)' },
                { label: 'Return Customer Rate', value: '12.8%', trend: '+0.4%', color: 'var(--color-success)' },
              ].map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{m.label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)' }}>{m.value}</span>
                    <span style={{ fontSize: 'var(--text-xs)', color: m.color, fontWeight: 600 }}>{m.trend}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Geography Analytics */}
      {activeView === 'geo' && (
        <>
          <div className="stats-grid" style={{ marginBottom: 'var(--space-6)' }}>
            {[
              { label: 'Countries Reached', value: '4' },
              { label: 'Top Country', value: 'Bangladesh' },
              { label: 'Cities Reached', value: '18' },
              { label: 'Top City', value: 'Dhaka' },
            ].map((s, i) => (
              <div key={i} className="stat-card"><div className="stat-card-label">{s.label}</div><div className="stat-card-value">{s.value}</div></div>
            ))}
          </div>
          <div className="chart-card" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="chart-header"><div><div className="chart-title">Revenue by Country</div></div></div>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={countryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                <XAxis dataKey="name" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} angle={-30} textAnchor="end" height={60} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => formatCurrency(v)} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Revenue" radius={[6, 6, 0, 0]} maxBarSize={40}>
                  {countryData.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* Device Analytics */}
      {activeView === 'devices' && (
        <div className="content-grid-equal" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="chart-card">
            <div className="chart-header"><div><div className="chart-title">Device Distribution</div></div></div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={deviceData} cx="50%" cy="50%" innerRadius={70} outerRadius={115} paddingAngle={5} dataKey="value">
                  {deviceData.map((_, i) => (<Cell key={i} fill={COLORS[i]} />))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              {deviceData.map((item, i) => (
                <div key={i} className="chart-legend-item"><div className="chart-legend-dot" style={{ background: COLORS[i] }} />{item.name} ({item.value}%)</div>
              ))}
            </div>
          </div>
          <div className="chart-card">
            <div className="chart-header"><div><div className="chart-title">Browser Stats</div></div></div>
            <div style={{ padding: 'var(--space-4)' }}>
              {[
                { name: 'Chrome', pct: 68, color: '#6366f1' },
                { name: 'Safari', pct: 18, color: '#3b82f6' },
                { name: 'Firefox', pct: 6, color: '#f59e0b' },
                { name: 'Edge', pct: 5, color: '#10b981' },
                { name: 'Others', pct: 3, color: '#64748b' },
              ].map((b, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: i < 4 ? '1px solid var(--border-secondary)' : 'none' }}>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', flex: 1 }}>{b.name}</span>
                  <div style={{ width: '120px' }}><div className="progress-bar"><div className="progress-fill" style={{ width: `${b.pct}%`, background: b.color }} /></div></div>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontWeight: 600, width: '36px', textAlign: 'right' }}>{b.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Funnel Analytics */}
      {activeView === 'funnel' && (
        <div className="chart-card" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="chart-header"><div><div className="chart-title">Conversion Funnel</div></div></div>
          <div style={{ padding: 'var(--space-4)' }}>
            {funnelData.map((step, i) => {
              const pct = Math.round((step.value / funnelData[0].value) * 100);
              const dropOff = i > 0 ? Math.round(((funnelData[i-1].value - step.value) / funnelData[i-1].value) * 100) : 0;
              return (
                <div key={i} style={{ marginBottom: '16px', animation: 'fadeInUp 0.5s ease backwards', animationDelay: `${i * 0.1}s` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>{step.name}</span>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>{formatNumber(step.value)}</span>
                      {i > 0 && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-danger)' }}>-{dropOff}% drop</span>}
                    </div>
                  </div>
                  <div className="progress-bar" style={{ height: '28px', borderRadius: '8px' }}>
                    <div className="progress-fill" style={{
                       width: `${pct}%`,
                       borderRadius: '8px',
                       background: COLORS[i % COLORS.length],
                       display: 'flex', alignItems: 'center', justifyContent: 'center',
                       fontSize: '11px', fontWeight: 700, color: 'white',
                    }}>
                      {pct}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI Predictions View */}
      {activeView === 'ai' && (
        <>
          <div className="stats-grid" style={{ marginBottom: 'var(--space-6)' }}>
            {[
              { label: 'Forecasted Growth', value: '+14.8%', icon: Sparkles, color: 'success' },
              { label: 'Confidence Score', value: '94%', icon: Brain, color: 'primary' },
              { label: 'Top Segment', value: 'VIP Customers', icon: Users, color: 'info' },
              { label: 'Active Fraud Risks', value: aiFraudAlerts.length.toString(), icon: ShieldAlert, color: 'danger' }
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="stat-card">
                  <div className="stat-card-header">
                    <div className={`stat-card-icon ${s.color}`}><Icon size={20} /></div>
                  </div>
                  <div className="stat-card-label">{s.label}</div>
                  <div className="stat-card-value">{s.value}</div>
                </div>
              );
            })}
          </div>

          <div className="content-grid" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="chart-card">
              <div className="chart-header">
                <div>
                  <div className="chart-title">AI Sales Forecasting</div>
                  <div className="chart-subtitle">Predicted monthly revenue based on machine learning trends</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyRevenueData.concat(aiSalesPrediction)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                  <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `৳${v/1000}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="value" name="Observed Revenue" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" name="AI Prediction" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <div>
                  <div className="chart-title">Segment AI Analysis</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {aiCustomerSegments.map((seg, i) => (
                  <div key={i} style={{ padding: '12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-secondary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>{seg.segment}</span>
                      <span className="badge badge-primary">{seg.growth} Growth</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                      <span>Audience: {seg.count} buyers</span>
                      <span>Avg LTV: ৳{seg.ltv.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="data-table-container">
            <div className="data-table-header">
              <div className="data-table-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={18} className="text-danger" /> Automated Risk & Fraud Detection
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order Ref</th>
                  <th>Customer</th>
                  <th>Risk Level</th>
                  <th>AI Risk Score</th>
                  <th>Flag Reasons</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {aiFraudAlerts.map((item, i) => (
                  <tr key={i}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{item.orderId}</td>
                    <td>{item.customer}</td>
                    <td>
                      <span className={`badge ${item.status === 'high_risk' ? 'badge-danger' : 'badge-warning'}`}>
                        {item.status === 'high_risk' ? 'High Risk' : 'Medium Risk'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>{item.score}%</td>
                    <td style={{ fontStyle: 'italic', fontSize: 'var(--text-xs)' }}>{item.details}</td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => alert(`Reviewing transaction ${item.orderId}...`)}>Review</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

