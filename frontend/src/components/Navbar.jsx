import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Bell, 
  LogOut 
} from 'lucide-react';

export default function Navbar({ onOpenAddExpense }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/transactions', label: 'Ledger' },
    { path: '/goals', label: 'Goals' },
    { path: '/reports', label: 'Analytics' },
    { path: '/academics', label: 'Academics' },
    { path: '/settings', label: 'Settings' }
  ];

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

          <button 
            title="Notifications" 
            className="btn-milestone-more"
          >
            <Bell size={14} color="#64748B" />
          </button>

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
