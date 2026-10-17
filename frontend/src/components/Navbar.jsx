import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Receipt, GraduationCap, Target, BarChart3, Settings, LogOut, PlusCircle } from 'lucide-react';

export default function Navbar({ onOpenAddExpense }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Overview', icon: LayoutDashboard },
    { path: '/transactions', label: 'Transactions', icon: Receipt },
    { path: '/academics', label: 'Academics', icon: GraduationCap },
    { path: '/goals', label: 'Monthly Goals', icon: Target },
    { path: '/reports', label: 'Reports', icon: BarChart3 },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Top Header */}
      <header style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-clean-white)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 700, color: 'var(--color-burgundy)', letterSpacing: '-0.02em' }}>
                pennywise
              </span>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-warm-orange)', letterSpacing: '0.05em' }}>
                INR
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      textDecoration: 'none',
                      fontSize: 13,
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? 'var(--color-burgundy)' : 'var(--color-chocolate-light)',
                      backgroundColor: isActive ? 'var(--color-baby-pink-soft)' : 'transparent',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Icon size={16} color={isActive ? 'var(--color-burgundy)' : 'var(--color-chocolate-light)'} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={onOpenAddExpense}
              className="btn btn-primary"
              style={{ padding: '7px 12px', fontSize: 13 }}
            >
              <PlusCircle size={15} />
              <span className="desktop-only">Add Expense</span>
            </button>

            <div style={{ height: 20, width: 1, backgroundColor: 'var(--color-border)' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="desktop-only" style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-chocolate)' }}>{user?.name || 'Student'}</div>
                <div style={{ fontSize: 11, color: 'var(--color-chocolate-light)' }}>{user?.college || 'Student'}</div>
              </div>
              <button
                onClick={logout}
                title="Logout"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: 'var(--color-chocolate-light)' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile App Bottom Navigation Bar */}
      <nav className="mobile-bottom-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`mobile-tab ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} color={isActive ? 'var(--color-burgundy)' : 'var(--color-chocolate-light)'} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}