import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Sparkles, Flame, Gift, ArrowRight, Zap, CheckCircle2, Copy, Check, Gamepad2 } from 'lucide-react';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { getCustomerAchievements, type CustomerAchievement } from '../store/eventStore';

export const CustomerEventsTab: React.FC = () => {
  const { customer } = useCustomerAuth();
  const [achievements, setAchievements] = useState<CustomerAchievement[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    const loadList = () => {
      const list = getCustomerAchievements(customer?.phone || customer?.email);
      setAchievements(list);
    };
    loadList();

    const interval = setInterval(loadList, 2000);
    window.addEventListener('focus', loadList);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', loadList);
    };
  }, [customer]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  return (
    <div style={{ padding: '8px 0' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Trophy size={24} style={{ color: '#fbbf24' }} />
          <span>Events & Achievements</span>
        </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
          Your participated events, game achievements, and earned discount reward coupon codes.
        </p>
      </div>

      {/* Earned Achievements List */}
      {achievements.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="#38bdf8" />
            <span>Earned Reward Coupons ({achievements.length})</span>
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {achievements.map((ach, idx) => (
              <div 
                key={idx}
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1.5px solid rgba(56, 189, 248, 0.3)',
                  borderRadius: '16px',
                  padding: '16px',
                  boxShadow: '0 10px 20px -5px rgba(0,0,0,0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px', borderRadius: '10px', textTransform: 'uppercase' }}>
                      {ach.gameType === 'quiz' ? '🧠 Quiz Reward' : '🎡 Spin Reward'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                      {new Date(ach.earnedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h5 style={{ margin: '0 0 6px 0', fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>
                    {ach.eventTitle}
                  </h5>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '12px 0' }}>
                    <span style={{ fontSize: '1.2rem', fontFamily: 'monospace', fontWeight: 900, color: '#4ade80', letterSpacing: '0.05em' }}>
                      {ach.couponCode}
                    </span>
                    <span style={{ background: 'rgba(74, 222, 128, 0.15)', color: '#4ade80', fontWeight: 800, fontSize: '0.8rem', padding: '2px 8px', borderRadius: '6px' }}>
                      {ach.discountText}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyCode(ach.couponCode)}
                  style={{
                    width: '100%',
                    background: copiedCode === ach.couponCode ? '#22c55e' : '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '8px 14px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {copiedCode === ach.couponCode ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedCode === ach.couponCode ? 'Coupon Copied!' : 'Copy Coupon Code'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Events Info Box */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(23, 20, 52, 0.95), rgba(15, 12, 35, 0.98))',
            border: '1.5px solid rgba(251, 191, 36, 0.5)',
            borderRadius: '20px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.4)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={14} />
              <span>Live Interactive Games</span>
            </span>
          </div>

          <div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: 600, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Gamepad2 size={20} style={{ color: '#f59e0b' }} />
              <span>Homepage Event Arena</span>
            </h4>
            <p style={{ margin: '0 0 20px 0', fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.5 }}>
              Participate in interactive games on the homepage <strong>"Interactive Events & Games"</strong> section and win instant discount coupons up to 20% OFF!
            </p>
          </div>

          <Link
            to="/events"
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 18px',
              fontSize: '0.92rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              textDecoration: 'none',
              boxShadow: '0 4px 15px rgba(217, 119, 6, 0.4)'
            }}
          >
            <Trophy size={18} />
            <span>Go to Events Arena</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};
