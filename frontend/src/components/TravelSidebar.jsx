import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Compass, 
  MapPin, 
  Users, 
  CreditCard, 
  Receipt, 
  Percent, 
  TrendingUp, 
  History, 
  FileText, 
  Settings, 
  LogOut, 
  PlusCircle, 
  ChevronLeft, 
  ChevronRight,
  Menu,
  X,
  PlaneTakeoff,
  Briefcase
} from 'lucide-react';

export default function TravelSidebar({ onOpenAddModal }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { path: '/travel', label: 'Company Overview', icon: Compass },
    { path: '/travel/trips', label: 'Trips & Packages', icon: MapPin },
    { path: '/travel/passengers', label: 'Passengers', icon: Users },
    { path: '/travel/payments', label: 'Passenger Payments', icon: CreditCard },
    { path: '/travel/expenses', label: 'Trip & Co. Expenses', icon: Receipt },
    { path: '/travel/commissions', label: 'Commissions', icon: Percent },
    { path: '/travel/other-income', label: 'Other Income', icon: TrendingUp },
    { path: '/travel/transactions', label: 'Financial Ledger', icon: History },
    { path: '/travel/reports', label: 'Profit & Loss Reports', icon: FileText },
    { path: '/travel/settings', label: 'Business Settings', icon: Settings },
  ];

  const isEffectiveCollapsed = collapsed && !mobileOpen;

  return (
    <>
      {/* Mobile Top Header */}
      <header className="car-mobile-header" style={{ backgroundColor: '#0B132B', borderBottom: '1px solid #1C2541' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button 
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ background: 'none', border: 'none', color: '#F0F6FC', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <PlaneTakeoff size={18} color="#38BDF8" />
            <span style={{ fontSize: 16, fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
              PENNY<span style={{ color: '#38BDF8' }}>TRAVEL</span>
            </span>
          </div>
        </div>

        <div style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          backgroundColor: '#38BDF8',
          color: '#0B132B',
          fontWeight: 800,
          fontSize: 13,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {user?.name ? user.name[0].toUpperCase() : 'T'}
        </div>
      </header>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.65)',
            zIndex: 998,
            backdropFilter: 'blur(3px)'
          }}
        />
      )}

      {/* Main Travel Sidebar */}
      <aside 
        className={`car-sidebar ${mobileOpen ? 'open' : ''}`}
        style={{
          width: isEffectiveCollapsed ? 76 : 260,
          backgroundColor: '#0B132B',
          borderRight: '1px solid #1C2541',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {/* Brand Header */}
        <div style={{
          padding: isEffectiveCollapsed ? '20px 0' : '20px 20px',
          borderBottom: '1px solid #1C2541',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isEffectiveCollapsed ? 'center' : 'space-between'
        }}>
          {!isEffectiveCollapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                color: '#38BDF8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <PlaneTakeoff size={20} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  PENNY<span style={{ color: '#38BDF8' }}>TRAVEL</span>
                </div>
                <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Tour & Travels ERP
                </div>
              </div>
            </div>
          )}

          {isEffectiveCollapsed && (
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              color: '#38BDF8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <PlaneTakeoff size={20} />
            </div>
          )}

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="desktop-only"
            style={{
              background: 'none',
              border: 'none',
              color: '#64748B',
              cursor: 'pointer',
              padding: 4,
              display: 'flex',
              alignItems: 'center'
            }}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Quick Action Button */}
        {onOpenAddModal && (
          <div style={{ padding: isEffectiveCollapsed ? '16px 12px' : '16px 18px 8px 18px' }}>
            <button
              onClick={() => onOpenAddModal('expense')}
              style={{
                width: '100%',
                padding: isEffectiveCollapsed ? '10px 0' : '10px 14px',
                borderRadius: 10,
                backgroundColor: '#38BDF8',
                color: '#0B132B',
                border: 'none',
                fontWeight: 800,
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 14px rgba(56, 189, 248, 0.35)',
                transition: 'transform 0.15s ease'
              }}
            >
              <PlusCircle size={16} />
              {!isEffectiveCollapsed && <span>Record Expense / Pax</span>}
            </button>
          </div>
        )}

        {/* Company Badge */}
        {!isEffectiveCollapsed && (
          <div style={{
            margin: '8px 16px',
            padding: '10px 12px',
            borderRadius: 8,
            backgroundColor: '#1C2541',
            border: '1px solid #3A506B',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <Briefcase size={14} color="#38BDF8" />
            <div style={{ fontSize: 11, fontWeight: 700, color: '#E2E8F0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.companyName || 'PennyWise Tours & Travels'}
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav style={{ flex: 1, padding: '10px 12px', overflowY: 'auto' }}>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: isEffectiveCollapsed ? '10px 0' : '10px 12px',
                      justifyContent: isEffectiveCollapsed ? 'center' : 'flex-start',
                      borderRadius: 8,
                      textDecoration: 'none',
                      fontSize: 13,
                      fontWeight: isActive ? 800 : 600,
                      color: isActive ? '#FFFFFF' : '#94A3B8',
                      backgroundColor: isActive ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                      borderLeft: isActive && !isEffectiveCollapsed ? '3px solid #38BDF8' : '3px solid transparent',
                      transition: 'all 0.15s ease'
                    }}
                    title={isEffectiveCollapsed ? item.label : undefined}
                  >
                    <Icon size={18} color={isActive ? '#38BDF8' : '#94A3B8'} />
                    {!isEffectiveCollapsed && (
                      <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Footer */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid #1C2541',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isEffectiveCollapsed ? 'center' : 'space-between',
          backgroundColor: '#080E21'
        }}>
          {!isEffectiveCollapsed ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <div style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                backgroundColor: '#38BDF8',
                color: '#0B132B',
                fontWeight: 800,
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {user?.name ? user.name[0].toUpperCase() : 'T'}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.name || 'Travel Admin'}
                </div>
                <div style={{ fontSize: 10, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Travel Admin
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: '#38BDF8',
              color: '#0B132B',
              fontWeight: 800,
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {user?.name ? user.name[0].toUpperCase() : 'T'}
            </div>
          )}

          <button
            onClick={logout}
            style={{
              background: 'none',
              border: 'none',
              color: '#EF4444',
              cursor: 'pointer',
              padding: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 6
            }}
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>
    </>
  );
}
