import { useState } from 'react';
import { Brain, TrendingUp, Users, AlertTriangle, Crosshair, Zap, ShieldAlert, ShoppingCart, UserCheck } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { aiSalesPrediction, aiCustomerSegments, aiFraudAlerts, formatCurrency, timeAgo } from '../../mock/data';

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
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-breadcrumb"><span>Home</span><span className="page-breadcrumb-sep">/</span><span>AI</span></div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Brain color="var(--accent-primary)" /> AI Control Center
          </h1>
          <p className="page-subtitle">Machine learning insights, predictive models, and automated actions</p>
        </div>
        <div className="page-header-actions">
          <div className="live-indicator"><div className="live-dot" /><span>Models Active</span></div>
        </div>
      </div>

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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
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
    </div>
  );
}
