import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Compass, 
  Receipt, 
  GraduationCap, 
  Target, 
  BarChart2, 
  Settings, 
  LogOut, 
  PlusCircle, 
  ChevronLeft, 
  ChevronRight,
  Menu,
  X,
  Sparkles,
  Flame
} from 'lucide-react';

export default function Sidebar({ onOpenAddExpense }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Horizon Dashboard', icon: Compass },
    { path: '/transactions', label: 'Clearance Ledger', icon: Receipt },
    { path: '/goals', label: 'Goals & Ceilings', icon: Target },
    { path: '/academics', label: 'Academic Obligations', icon: GraduationCap },
    { path: '/reports', label: 'Treasury Analytics', icon: BarChart2 },
    { path: '/settings', label: 'Vault & Profile', icon: Settings },
  ];

  // On mobile drawer, sidebar should never be collapsed
  const isEffectiveCollapsed = collapsed && !mobileOpen;

  return (
    <>
      {/* Mobile Top Header */}
      <header className="car-mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button 
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ background: 'none', border: 'none', color: '#FAF7F2', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 22, height: 22, borderRadius: 5, background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 900, color: '#111215' }}>P</span>
            </div>
            <span style={{ fontSize: 15, fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
              PENNY<span style={{ color: '#10B981' }}>WISE</span>
            </span>
          </div>
        </div>

        {/* User initials or avatar pill badge */}
        <div style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          backgroundColor: 'rgba(225, 29, 72, 0.18)',
          border: '1px solid rgba(225, 29, 72, 0.4)',
          color: '#FB7185',
          fontSize: 12,
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textTransform: 'uppercase',
          overflow: 'hidden'
        }}>
          {user?.avatar ? (
            <img src={user.avatar} alt={user?.name || 'Pilot'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            user?.name ? user.name.charAt(0) : 'U'
          )}
        </div>
      </header>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="mobile-backdrop"
        />
      )}

      {/* Main Sidebar */}
      <aside className={`car-sidebar ${isEffectiveCollapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Brand / Logo */}
        <div>
          <div className="sidebar-brand-row">
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 12px rgba(16, 185, 129, 0.4)'
              }}>
                <span style={{ fontSize: 16, fontWeight: 900, color: '#111215' }}>P</span>
              </div>
              {!isEffectiveCollapsed && (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 16, fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
                    PENNY<span style={{ color: '#10B981' }}>WISE</span>
                  </span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: '#8E92A0', letterSpacing: '0.08em' }}>
                    WEALTH STUDIO
                  </span>
                </div>
              )}
            </Link>

            {!isEffectiveCollapsed && (
              <button
                onClick={() => setCollapsed(true)}
                title="Collapse sidebar"
                className="desktop-only collapse-toggle-btn"
              >
                <ChevronLeft size={18} />
              </button>
            )}
          </div>

          {/* Quick Action Button */}
          <div style={{ padding: isEffectiveCollapsed ? '14px 10px' : '16px 14px' }}>
            <button
              onClick={onOpenAddExpense}
              className="btn log-pit-stop-btn"
              style={{
                width: '100%',
                backgroundColor: '#E11D48',
                color: '#FFFFFF',
                padding: isEffectiveCollapsed ? '10px 0' : '10px 14px',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 13,
                boxShadow: '0 4px 14px rgba(225, 29, 72, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                border: 'none',
                cursor: 'pointer'
              }}
              title="Add Expense / Fuel"
            >
              <PlusCircle size={18} />
              {!isEffectiveCollapsed && <span>Add Expense / Fuel</span>}
            </button>
          </div>

          {/* Nav Items */}
          <nav style={{ padding: '0 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  title={item.label}
                  className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                >
                  <Icon size={18} color={isActive ? '#E11D48' : '#8B949E'} />
                  {!isEffectiveCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer & User Profile */}
        <div style={{ padding: '14px', borderTop: '1px solid #21262D' }}>
          {isEffectiveCollapsed ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <button
                onClick={() => setCollapsed(false)}
                title="Expand sidebar"
                className="desktop-only collapse-toggle-btn"
              >
                <ChevronRight size={18} />
              </button>
              <button
                onClick={logout}
                title="Sign Out"
                style={{ background: 'none', border: 'none', color: '#E11D48', cursor: 'pointer', padding: 6 }}
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                <div style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: '#21262D',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 13,
                  border: '1px solid #30363D',
                  overflow: 'hidden'
                }}>
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user?.name || 'Pilot'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    user?.name ? user.name[0].toUpperCase() : 'P'
                  )}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {user?.name || 'Driver'}
                  </div>
                  <div style={{ fontSize: 11, color: '#8B949E' }}>
                    Active Pilot
                  </div>
                </div>
              </div>
              <button
                onClick={logout}
                title="Sign Out"
                style={{ background: 'none', border: 'none', color: '#8B949E', cursor: 'pointer', padding: 6 }}
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
