import { Search, Bell, Mail, Moon, Sun, Menu, X, Send, MessageSquare, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface TopBarProps {
  onMenuClick: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [notifTab, setNotifTab] = useState<'all' | 'orders' | 'alerts'>('all');
  const [msgSearch, setMsgSearch] = useState('');
  
  // Quick reply states
  const [activeReplyMsg, setActiveReplyMsg] = useState<any>(null);
  const [replyText, setReplyText] = useState('');

  // Initial Seed Data for Notifications
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'order', text: 'New order #ORD-10006 from Rahim Ahmed', time: '10m ago', unread: true },
    { id: 2, type: 'alert', text: 'Low stock warning for iPhone 15 Pro Max', time: '30m ago', unread: true },
    { id: 3, type: 'alert', text: 'Bose QuietComfort is out of stock', time: '2h ago', unread: false },
    { id: 4, type: 'order', text: 'Order #ORD-10001 delivered to John Doe', time: '4h ago', unread: false },
  ]);

  // Initial Seed Data for Messages
  const [messages, setMessages] = useState([
    { id: 1, user: 'John Doe', text: 'Is there a discount code for bulk purchase?', time: '5m ago', unread: true, avatar: 'JD' },
    { id: 2, user: 'Sarah Khan', text: 'Can I change my delivery address to Gulshan?', time: '1h ago', unread: true, avatar: 'SK' },
    { id: 3, user: 'Karim Rahman', text: 'The item arrived in perfect condition. Thanks!', time: '1d ago', unread: false, avatar: 'KR' },
  ]);

  // Theme Sync on Mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('admin-theme') || 'dark';
    setDarkMode(savedTheme === 'dark');
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
  }, []);

  const toggleTheme = () => {
    const nextVal = !darkMode;
    setDarkMode(nextVal);
    if (nextVal) {
      document.documentElement.classList.remove('light-theme');
      localStorage.setItem('admin-theme', 'dark');
    } else {
      document.documentElement.classList.add('light-theme');
      localStorage.setItem('admin-theme', 'light');
    }
  };

  // Notification Operations
  const unreadNotifCount = notifications.filter(n => n.unread).length;
  const filteredNotifs = notifications.filter(n => {
    if (notifTab === 'all') return true;
    return n.type === notifTab.slice(0, -1) || n.type === notifTab; // Match order or alert
  });

  const markAllNotifsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const handleNotifClick = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  // Message Operations
  const unreadMsgCount = messages.filter(m => m.unread).length;
  const filteredMessages = messages.filter(m => 
    m.user.toLowerCase().includes(msgSearch.toLowerCase()) || 
    m.text.toLowerCase().includes(msgSearch.toLowerCase())
  );

  const markAllMsgsRead = () => {
    setMessages(prev => prev.map(m => ({ ...m, unread: false })));
  };

  const handleMsgClick = (msg: any) => {
    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, unread: false } : m));
    setActiveReplyMsg(msg);
    setShowMessages(false);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeReplyMsg) return;

    // Simulate sending reply by logging and showing toast, and clearing reply box
    alert(`Reply sent to ${activeReplyMsg.user}: "${replyText}"`);
    
    setReplyText('');
    setActiveReplyMsg(null);
  };

  return (
    <header className="topbar">
      <button className="topbar-toggle" onClick={onMenuClick}>
        <Menu size={18} />
      </button>

      <div className="topbar-search">
        <Search className="topbar-search-icon" size={16} />
        <input
          className="topbar-search-input"
          type="text"
          placeholder="Search orders, customers, products..."
        />
        <span className="topbar-search-shortcut">⌘K</span>
      </div>

      <div className="topbar-actions" style={{ position: 'relative' }}>
        <div className="live-indicator">
          <div className="live-dot" />
          <span>Live</span>
        </div>

        <div className="topbar-divider" />

        {/* THEME TOGGLE BUTTON */}
        <button
          className="topbar-action-btn"
          title="Toggle theme"
          onClick={toggleTheme}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* LOGOUT BUTTON */}
        <button
          className="topbar-action-btn"
          title="Logout"
          onClick={logout}
          style={{ color: 'var(--color-danger, #ef4444)' }}
        >
          <LogOut size={18} />
        </button>

        <div className="topbar-divider" />

        <Link to="/admin/employees" style={{ textDecoration: 'none', color: 'inherit' }} className="topbar-profile">
          <div className="topbar-profile-avatar">
            {user?.avatar || (user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'SA')}
          </div>
          <div className="topbar-profile-info">
            <span className="topbar-profile-name">{user?.name || 'Super Admin'}</span>
            <span className="topbar-profile-role">{user?.role || 'Full Access'}</span>
          </div>
        </Link>
      </div>

      {/* QUICK REPLY POPUP MODAL */}
      {activeReplyMsg && (
        <div className="modal-overlay" style={{ display: 'flex' }}>
          <div className="modal" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <span className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={18} className="text-primary" /> Reply to {activeReplyMsg.user}
              </span>
              <button onClick={() => setActiveReplyMsg(null)} style={{ color: 'var(--text-secondary)' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSendReply}>
              <div className="modal-body">
                <div style={{ background: 'var(--bg-input)', padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: 'var(--text-sm)', borderLeft: '3px solid var(--accent-primary)' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{activeReplyMsg.user} wrote:</div>
                  <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>"{activeReplyMsg.text}"</div>
                </div>
                <div className="form-group">
                  <label className="form-label">Write your message</label>
                  <textarea 
                    className="form-textarea" 
                    placeholder="Type your response here..."
                    required
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setActiveReplyMsg(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <Send size={14} /> Send Reply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}

