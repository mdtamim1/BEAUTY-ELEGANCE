import { useState, useEffect } from 'react';
import { Brain, TrendingUp, Users, ShieldAlert, ShoppingCart, Zap, MessageSquare, Clock, BarChart3, Database, HelpCircle } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';
import { aiSalesPrediction, aiCustomerSegments, aiFraudAlerts, formatCurrency } from '../../mock/data';
import { fetchAIAnalytics } from '../../services/api';

const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#fbbf24', '#f43f5e'];

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

export default function AICenter() {
  const [activeTab, setActiveTab] = useState('analytics'); // Default to our new live analytics tab
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAIAnalytics().then(data => {
      if (data) {
        setAnalytics(data);
      }
      setLoading(false);
    });
  }, []);

  // Helper to determine peak traffic day
  const getPeakDay = () => {
    if (!analytics?.dailyVolume?.length) return 'N/A';
    const sorted = [...analytics.dailyVolume].sort((a, b) => b.count - a.count);
    return sorted[0]?.date || 'N/A';
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-breadcrumb"><span>Home</span><span className="page-breadcrumb-sep">/</span><span>AI</span></div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Brain color="var(--accent-primary)" /> AI Control Center
          </h1>
          <p className="page-subtitle">Customer assistant telemetry, popular queries tracking, and predictive models</p>
        </div>
        <div className="page-header-actions">
          <div className="live-indicator"><div className="live-dot" /><span>Telemetry Active</span></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="tabs-list" style={{ borderBottom: '1px solid var(--border-secondary)', display: 'flex', gap: '20px' }}>
          <button 
            className={`tab-trigger ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
            style={{ padding: '12px 16px', background: 'none', border: 'none', borderBottom: activeTab === 'analytics' ? '2px solid var(--accent-primary)' : 'none', color: activeTab === 'analytics' ? '#fff' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer' }}
          >
            Assistant Usage & Analytics
          </button>
          <button 
            className={`tab-trigger ${activeTab === 'predictive' ? 'active' : ''}`}
            onClick={() => setActiveTab('predictive')}
            style={{ padding: '12px 16px', background: 'none', border: 'none', borderBottom: activeTab === 'predictive' ? '2px solid var(--accent-primary)' : 'none', color: activeTab === 'predictive' ? '#fff' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer' }}
          >
            Predictive Business Models
          </button>
        </div>
      </div>

      {activeTab === 'analytics' ? (
        <>
          {/* Telemetry Stats */}
          <div className="stats-grid" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="stat-card">
              <div className="stat-card-header"><div className="stat-card-icon success"><MessageSquare size={20} /></div></div>
              <div className="stat-card-label">Total AI Queries Answered</div>
              <div className="stat-card-value">{loading ? '...' : analytics?.totalQueries || 0}</div>
              <div className="stat-card-footer"><span style={{ color: 'var(--color-success)' }}>Live</span> query tracking active</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-header"><div className="stat-card-icon warning"><Clock size={20} /></div></div>
              <div className="stat-card-label">Peak Traffic Day</div>
              <div className="stat-card-value" style={{ fontSize: '1.2rem', margin: '8px 0' }}>{loading ? '...' : getPeakDay()}</div>
              <div className="stat-card-footer">Day with highest user questions</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-header"><div className="stat-card-icon info"><Database size={20} /></div></div>
              <div className="stat-card-label">AI Engine Status</div>
              <div className="stat-card-value" style={{ fontSize: '1.2rem', margin: '8px 0' }}>Hybrid-Flash</div>
              <div className="stat-card-footer">Gemini API + Local fallback</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-header"><div className="stat-card-icon purple"><BarChart3 size={20} /></div></div>
              <div className="stat-card-label">Popular Topics Tracked</div>
              <div className="stat-card-value">{loading ? '...' : analytics?.popularQuestions?.length || 0}</div>
              <div className="stat-card-footer">Unique trending questions</div>
            </div>
          </div>

          {/* AI Pressure & Topics Charts */}
          <div className="content-grid" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="chart-card">
              <div className="chart-header">
                <div>
                  <div className="chart-title">AI Assistant Pressure & Traffic</div>
                  <div className="chart-subtitle">Daily count of customer inquiries processed by AI</div>
                </div>
              </div>
              {loading ? (
                <div style={{ height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>Loading live data...</div>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={analytics?.dailyVolume || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                    <XAxis dataKey="date" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="count" name="Questions Asked" stroke="#6366f1" strokeWidth={3} fill="url(#colorQueries)" />
                    <defs>
                      <linearGradient id="colorQueries" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <div>
                  <div className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <HelpCircle size={16} color="var(--accent-primary)" /> Popular Customer Inquiries
                  </div>
                  <div className="chart-subtitle">Most frequently asked questions by shoppers</div>
                </div>
              </div>
              <div style={{ maxHeight: '320px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {loading ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading popular topics...</div>
                ) : analytics?.popularQuestions?.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>No queries recorded yet.</div>
                ) : (
                  analytics.popularQuestions.map((q: any, i: number) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', background: 'var(--bg-input)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-secondary)' }}>
                      <div style={{ background: 'var(--accent-primary)', color: '#fff', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold', marginRight: '12px', flexShrink: 0 }}>
                        {i + 1}
                      </div>
                      <div style={{ flex: 1, fontSize: '13px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        "{q.query}"
                      </div>
                      <span className="badge badge-success" style={{ marginLeft: '12px' }}>{q.count} times</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Model distribution chart & telemetry info */}
          <div className="content-grid-equal">
            <div className="chart-card">
              <div className="chart-header">
                <div>
                  <div className="chart-title">AI Engine Model Distribution</div>
                  <div className="chart-subtitle">Breakdown of underlying models used to generate answers</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '280px' }}>
                {loading ? (
                  <div style={{ color: 'var(--text-secondary)' }}>Loading distribution...</div>
                ) : (
                  <>
                    <ResponsiveContainer width="50%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics?.modelDistribution || []}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="count"
                          nameKey="model"
                        >
                          {(analytics?.modelDistribution || []).map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ width: '50%', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {(analytics?.modelDistribution || []).map((entry: any, index: number) => (
                        <div key={index} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS[index % COLORS.length] }} />
                            <span style={{ color: 'var(--text-secondary)' }}>{entry.model}</span>
                          </div>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{entry.count}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="chart-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="chart-title">Telemetry System Notice</div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                All user interactions with the store's AI Shopping Assistant on the storefront are tracked securely in real-time.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'start' }}>
                  <Zap size={16} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                  <span><strong>Real-time Monitoring</strong>: Tracks query pressure dynamically to detect surges or high demand periods.</span>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'start' }}>
                  <Zap size={16} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                  <span><strong>Product Context Enrichment</strong>: The chatbot leverages live product details, description fields, and specifications to offer customers tailored explanations and usage advice.</span>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'start' }}>
                  <Zap size={16} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                  <span><strong>Auto-Fallback Resilience</strong>: If the external Gemini API is unreachable or has quota limits, the hybrid engine instantly falls back to smart local heuristics so that shoppers are never left without assistance.</span>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Old Predictive Models Tab content */}
          <div className="stats-grid" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="stat-card">
              <div className="stat-card-header"><div className="stat-card-icon purple"><TrendingUp size={20} /></div></div>
              <div className="stat-card-label">Predicted Month Revenue</div>
              <div className="stat-card-value">{formatCurrency(1450000)}</div>
              <div className="stat-card-footer"><span style={{ color: 'var(--color-success)' }}>+12%</span> vs last month</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-header"><div className="stat-card-icon danger"><ShieldAlert size={20} /></div></div>
              <div className="stat-card-label">Fraud Prevented (30d)</div>
              <div className="stat-card-value">{formatCurrency(48250)}</div>
              <div className="stat-card-footer">142 fraudulent orders blocked</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-header"><div className="stat-card-icon info"><Users size={20} /></div></div>
              <div className="stat-card-label">Churn Risk Identified</div>
              <div className="stat-card-value">1,248</div>
              <div className="stat-card-footer">Customers flagged for retention</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-header"><div className="stat-card-icon success"><ShoppingCart size={20} /></div></div>
              <div className="stat-card-label">Recommendation Uplift</div>
              <div className="stat-card-value">+18.4%</div>
              <div className="stat-card-footer">AOV increase from AI cross-sells</div>
            </div>
          </div>

          <div className="content-grid" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="chart-card">
              <div className="chart-header">
                <div>
                  <div className="chart-title">AI Revenue Forecasting</div>
                  <div className="chart-subtitle">Predicted 12-month trajectory with 95% confidence interval</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={aiSalesPrediction}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                  <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `৳${(v/1000)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="value2" name="Optimistic" stroke="none" fill="#8b5cf6" fillOpacity={0.1} />
                  <Area type="monotone" dataKey="value3" name="Pessimistic" stroke="none" fill="#8b5cf6" fillOpacity={0.1} />
                  <Area type="monotone" dataKey="value" name="Predicted Revenue" stroke="#8b5cf6" strokeWidth={3} fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <div>
                  <div className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldAlert size={16} color="var(--color-danger)" /> Fraud Detection Alerts
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {aiFraudAlerts.slice(0, 4).map((alert) => (
                  <div key={alert.id} style={{ padding: '12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', borderLeft: `3px solid var(--color-danger)` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>{alert.type}</span>
                      <span className="badge badge-danger">Risk: {alert.risk}%</span>
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: '8px' }}>{alert.details}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--text-xs)' }}>
                      <span style={{ color: 'var(--text-tertiary)' }}>Order: {alert.order} • ৳{alert.amount}</span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-danger btn-sm">Block</button>
                        <button className="btn btn-ghost btn-sm">Review</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="content-grid-equal">
            <div className="chart-card">
              <div className="chart-header">
                <div>
                  <div className="chart-title">AI Customer Segmentation</div>
                  <div className="chart-subtitle">Machine learning clustering based on behavior & LTV</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', height: '300px' }}>
                <ResponsiveContainer width="50%" height="100%">
                  <BarChart data={aiCustomerSegments} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} width={100} />
                    <Tooltip cursor={{ fill: 'transparent' }} content={<CustomTooltip />} />
                    <Bar dataKey="value" name="Segment %" radius={[0, 4, 4, 0]} maxBarSize={20}>
                      {aiCustomerSegments.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div style={{ width: '50%', paddingLeft: 'var(--space-4)' }}>
                  {aiCustomerSegments.map((seg, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: seg.color }} />
                        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{seg.name}</span>
                      </div>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{seg.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <div>
                  <div className="chart-title">Product Recommendations Engine</div>
                  <div className="chart-subtitle">Cross-sell affinity mapping</div>
                </div>
              </div>
              <div style={{ padding: 'var(--space-4)' }}>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  The recommendation engine automatically groups products frequently bought together and displays them at checkout.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { primary: 'Smartphone Pro Max', target: 'Wireless Earbuds Pro', affinity: 84 },
                    { primary: 'Leather Handbag', target: 'Silk Scarf', affinity: 76 },
                    { primary: 'Running Shoes X', target: 'Performance Socks (3-Pack)', affinity: 92 },
                    { primary: '4K Monitor', target: 'Ergonomic Desk Mount', affinity: 68 },
                  ].map((rec, i) => (
                    <div key={i} style={{ background: 'var(--bg-input)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: 'var(--text-sm)' }}>
                          <span style={{ fontWeight: 600 }}>{rec.primary}</span>
                          <Zap size={14} color="var(--color-warning)" />
                          <span>{rec.target}</span>
                        </div>
                        <span className="badge badge-success">{rec.affinity}% match</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill success" style={{ width: `${rec.affinity}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
