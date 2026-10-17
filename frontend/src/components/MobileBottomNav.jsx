import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Gauge, Receipt, Plus, GraduationCap, Settings, Target, User } from 'lucide-react';

export default function MobileBottomNav({ onOpenAddExpense }) {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Gauge },
    { path: '/transactions', label: 'History', icon: Receipt },
    { isFab: true },
    { path: '/academics', label: 'Academics', icon: GraduationCap },
    { path: '/settings', label: 'Profile', icon: User },
  ];

  return (
    <nav className="mobile-floating-dock">
      <div className="mobile-dock-inner">
        {navItems.map((item, index) => {
          if (item.isFab) {
            return (
              <div key="fab-btn" className="dock-fab-wrapper">
                <button
                  onClick={onOpenAddExpense}
                  className="dock-fab-btn"
                  title="Add Expense or Fuel"
                  aria-label="Add Expense"
                >
                  <Plus size={24} strokeWidth={2.5} color="#FFFFFF" />
                </button>
              </div>
            );
          }

          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`dock-item ${isActive ? 'active' : ''}`}
            >
              <div className="dock-icon-box">
                <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
              </div>
              <span className="dock-label">{item.label}</span>
              {isActive && <div className="dock-active-dot" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
