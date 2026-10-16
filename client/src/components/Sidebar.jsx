import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Gauge, 
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
  Flame
} from 'lucide-react';

export default function Sidebar({ onOpenAddExpense }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Cockpit Overview', icon: Gauge },
    { path: '/transactions', label: 'Pit Stop Logs', icon: Receipt },
    { path: '/academics', label: 'Academy Track', icon: GraduationCap },
    { path: '/goals', label: 'RPM Fuel Budget', icon: Target },
    { path: '/reports', label: 'Telemetry', icon: BarChart2 },
    { path: '/settings', label: 'Tuning / Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Top Header */}
      <header className="car-mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button 
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ background: 'none', border: 'none', color: '#F0F6FC', cursor: 'pointer', padding: 4 }}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Flame size={20} color="#E11D48" />
            <span style={{ fontSize: 18, fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
              PENNY<span style={{ color: '#E11D48' }}>WISE</span>
            </span>
          </div>
        </div>

        <button 
          onClick={onOpenAddExpense}
          className="btn"
          style={{
            backgroundColor: '#E11D48',
            color: '#FFFFFF',
            padding: '6px 12px',
            fontSize: 12,
            fontWeight: 700,
            borderRadius: 6
          }}
        >
          <PlusCircle size={15} /> Add
        </button>
      </header>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="mobile-backdrop"
        />
      )}

      {/* Main Sidebar */}
      <aside className={`car-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Brand / Logo */}
        <div>
          <div className="sidebar-brand-row">
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                backgroundColor: '#E11D48',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 12px rgba(225, 29, 72, 0.5)'
              }}>
                <Flame size={20} color="#FFFFFF" />
              </div>
              {!collapsed && (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 17, fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
                    PENNY<span style={{ color: '#E11D48' }}>WISE</span>
                  </span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: '#8B949E', letterSpacing: '0.1em' }}>
                    GT PERFORMANCE
                  </span>
                </div>
              )}
            </Link>

            {!collapsed && (
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
          <div style={{ padding: collapsed ? '14px 10px' : '16px 14px' }}>
            <button
              onClick={onOpenAddExpense}
              className="btn log-pit-stop-btn"
              style={{
                width: '100%',
                backgroundColor: '#E11D48',
                color: '#FFFFFF',
                padding: collapsed ? '10px 0' : '10px 14px',
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
              {!collapsed && <span>Log Pit Stop</span>}
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
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer & User Profile */}
        <div style={{ padding: '14px', borderTop: '1px solid #21262D' }}>
          {collapsed ? (
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
                  border: '1px solid #30363D'
                }}>
                  {user?.name ? user.name[0].toUpperCase() : 'P'}
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
