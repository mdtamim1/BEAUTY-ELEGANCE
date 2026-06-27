import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BarChart3, Users, ShoppingCart, Package, Store,
  Megaphone, UserCog, DollarSign, Shield, Settings, Brain,
  ChevronLeft, ChevronRight, Zap, MessageSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

import { generateOrders } from '../../mock/data';

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user } = useAuth();
  const location = useLocation();
  const ordersCount = generateOrders().length;

  // Calculate unread customer messages
  const storedChats = localStorage.getItem('storefront_chats');
  let unreadChatsCount = 0;
  if (storedChats) {
    try {
      const chats = JSON.parse(storedChats);
      const unread = chats.filter((c: any) => c.sender === 'customer' && !c.read);
      unreadChatsCount = unread.length;
    } catch (e) {}
  }

  const navSections = [
    {
      title: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin', badge: '', badgeType: '' },
        { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/admin/analytics', badge: 'Live', badgeType: 'success' },
      ],
    },
    {
      title: 'Management',
      items: [
        { id: 'orders', label: 'Orders', icon: ShoppingCart, path: '/admin/orders', badge: ordersCount > 0 ? String(ordersCount) : '', badgeType: 'warning' },
        { id: 'products', label: 'Products', icon: Package, path: '/admin/products', badge: '', badgeType: '' },
        { id: 'storefront', label: 'Storefront', icon: Store, path: '/admin/storefront-manager', badge: 'New', badgeType: 'success' },
        { id: 'chats', label: 'Inbox', icon: MessageSquare, path: '/admin/chats', badge: unreadChatsCount > 0 ? String(unreadChatsCount) : '', badgeType: 'danger' },
      ],
    },
    {
      title: 'Operations',
      items: [
        { id: 'marketing', label: 'Marketing', icon: Megaphone, path: '/admin/marketing', badge: '', badgeType: '' },
        { id: 'employees', label: 'Employees', icon: UserCog, path: '/admin/employees', badge: '', badgeType: '' },
        { id: 'finance', label: 'Finance', icon: DollarSign, path: '/admin/finance', badge: '', badgeType: '' },
      ],
    },
    {
      title: 'System',
      items: [
        { id: 'security', label: 'Security', icon: Shield, path: '/admin/security', badge: '', badgeType: '' },
        { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings', badge: '', badgeType: '' },
        { id: 'ai', label: 'AI Center', icon: Brain, path: '/admin/ai', badge: 'New', badgeType: 'success' },
      ],
    },
  ];

  // Filter sections and items based on permissions
  const filteredNavSections = navSections.map(section => {
    const items = section.items.filter(item => {
      // Super Admin and Admin role gets all access by default
      if (user?.role === 'Super Admin' || user?.role === 'Admin') return true;
      // Check if item.id is inside user permissions array
      return user?.permissions?.includes(item.id);
    });
    return { ...section, items };
  }).filter(section => section.items.length > 0);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Zap size={20} />
        </div>
        {!collapsed && (
          <div className="sidebar-brand">
            <span className="sidebar-brand-name">VIP Commerce</span>
            <span className="sidebar-brand-tag">{user?.role || 'Super Admin'}</span>
          </div>
        )}
        <button
          className="topbar-toggle"
          onClick={onToggle}
          style={{ marginLeft: collapsed ? 0 : 'auto' }}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {filteredNavSections.map((section) => (
          <div key={section.title} className="sidebar-section">
            {!collapsed && (
              <div className="sidebar-section-title">{section.title}</div>
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = item.path === '/admin'
                ? location.pathname === '/admin' || location.pathname === '/admin/'
                : location.pathname.startsWith(item.path);
              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  className={`sidebar-item ${isActive ? 'active' : ''}`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="sidebar-item-icon" size={20} />
                  {!collapsed && (
                    <>
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className={`sidebar-item-badge ${item.badgeType}`}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {user?.avatar || (user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'SA')}
          </div>
          {!collapsed && (
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name || 'Super Admin'}</div>
              <div className="sidebar-user-role">{user?.role || 'Full Access'}</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
