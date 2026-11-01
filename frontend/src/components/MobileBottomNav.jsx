import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Receipt, Plus, Target, User } from 'lucide-react';

export default function MobileBottomNav({ onOpenAddExpense }) {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Horizon', icon: Compass },
    { path: '/transactions', label: 'Ledger', icon: Receipt },
    { isFab: true },
    { path: '/goals', label: 'Goals', icon: Target },
    { path: '/settings', label: 'Vault', icon: User },
  ];

  return (
    <nav className="mobile-floating-dock">
      <div className="mobile-dock-inner">
        {navItems.map((item) => {
          if (item.isFab) {
            return (
              <div key="fab-btn" className="dock-fab-wrapper">
                <button
                  onClick={onOpenAddExpense}
                  className="dock-fab-btn"
                  title="Log Quick Expense"
                  aria-label="Add Expense"
                >
                  <Plus size={20} strokeWidth={2.5} color="#FFFFFF" />
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
                <Icon size={17} strokeWidth={isActive ? 2.4 : 1.8} />
              </div>
              <span className="dock-label">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
