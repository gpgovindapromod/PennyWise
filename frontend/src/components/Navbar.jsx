import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Bell, 
  LogOut,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  X
} from 'lucide-react';
import api from '../services/api';

export default function Navbar({ onOpenAddExpense }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/transactions', label: 'Ledger' },
    { path: '/goals', label: 'Goals' },
    { path: '/reports', label: 'Analytics' },
    { path: '/academics', label: 'Academics' },
    { path: '/settings', label: 'Settings' }
  ];

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data?.success && res.data?.data) {
        setNotifications(res.data.data.notifications || []);
        setUnreadCount(res.data.data.unreadCount || 0);
      }
    } catch (err) {
      // Fallback gracefully without breaking navbar
      console.warn('Notification fetch warning:', err.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000); // 1-minute refresh
      return () => clearInterval(interval);
    }
  }, [user]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const handleMarkAllRead = async () => {
    try {
      setLoading(true);
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkOneRead = async (id, e) => {
    e.stopPropagation();
    try {
      if (!id.startsWith('fee-alert') && !id.startsWith('budget-alert')) {
        await api.put(`/notifications/${id}/read`);
      }
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'fee':
        return <Calendar size={14} className="text-amber-500" />;
      case 'budget':
        return <AlertTriangle size={14} className="text-rose-500" />;
      case 'goal':
        return <TrendingUp size={14} className="text-emerald-500" />;
      case 'security':
        return <ShieldCheck size={14} className="text-indigo-500" />;
      default:
        return <CheckCircle2 size={14} className="text-emerald-500" />;
    }
  };

  return (
    <header className="stitch-navbar-header">
      <div className="stitch-navbar-inner">
        <div className="stitch-nav-left">
          <Link to="/" className="stitch-nav-logo">
            <div className="stitch-nav-logo-icon">P</div>
            <span className="stitch-nav-logo-text">PennyWise</span>
          </Link>

          {/* Desktop Navigation Tabs (Hidden on mobile via .desktop-only) */}
          <nav className="stitch-nav-links desktop-only">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={isActive ? 'stitch-nav-tab stitch-nav-tab-active' : 'stitch-nav-tab'}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="stitch-nav-right">
          {/* Live Sync Nov 2026 Pill */}
          <div className="stitch-nav-sync-pill desktop-only">
            <span className="proto-pulse-dot" />
            <span>LIVE SYNC · NOV 2026</span>
          </div>

          <span className="stitch-nav-inr-tag desktop-only">INR ₹</span>

          {/* Notifications Trigger */}
          <div className="relative" ref={dropdownRef}>
            <button 
              title="Notifications" 
              className="btn-milestone-more relative"
              onClick={() => setShowNotifications(prev => !prev)}
            >
              <Bell size={14} color="#64748B" />
              {unreadCount > 0 && (
                <span className="stitch-notification-badge">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Popover */}
            {showNotifications && (
              <div className="stitch-notification-popover">
                <div className="stitch-notification-header">
                  <div className="flex items-center gap-2">
                    <span className="stitch-notification-title">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="stitch-notification-pill-count">{unreadCount} new</span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllRead} 
                      disabled={loading}
                      className="stitch-notification-readall-btn"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="stitch-notification-list">
                  {notifications.length === 0 ? (
                    <div className="stitch-notification-empty">
                      <CheckCircle2 size={24} className="text-emerald-500 mb-2 opacity-80" />
                      <div className="stitch-notification-empty-title">All caught up!</div>
                      <div className="stitch-notification-empty-desc">No active financial alerts or pending obligations.</div>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <Link
                        key={n._id}
                        to={n.link || '#'}
                        onClick={() => setShowNotifications(false)}
                        className={`stitch-notification-item ${n.read ? 'stitch-notification-item-read' : 'stitch-notification-item-unread'}`}
                      >
                        <div className="stitch-notification-item-icon">
                          {getAlertIcon(n.type)}
                        </div>
                        <div className="stitch-notification-item-content">
                          <div className="stitch-notification-item-title">{n.title}</div>
                          <div className="stitch-notification-item-msg">{n.message}</div>
                          <div className="stitch-notification-item-time">
                            {new Date(n.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                        {!n.read && (
                          <button
                            title="Mark as read"
                            className="stitch-notification-item-dismiss"
                            onClick={(e) => handleMarkOneRead(n._id, e)}
                          >
                            <X size={12} />
                          </button>
                        )}
                      </Link>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          <Link to="/settings" title="Account Settings & Profile">
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt={user?.name || "Profile"} 
                className="stitch-nav-avatar"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className="stitch-nav-avatar-initials"
              style={{ display: user?.avatar ? 'none' : 'flex' }}
            >
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </div>
          </Link>

          <button
            onClick={logout}
            title="Logout"
            className="btn-milestone-more desktop-only"
          >
            <LogOut size={13} color="#64748B" />
          </button>
        </div>
      </div>
    </header>
  );
}
