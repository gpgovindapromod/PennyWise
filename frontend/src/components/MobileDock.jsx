import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Receipt, 
  Plus, 
  Target, 
  ShieldCheck,
  GraduationCap
} from 'lucide-react';

export default function MobileDock({ onOpenAddExpense }) {
  const location = useLocation();

  return (
    <div className="stitch-dock-fixed-wrap">
      <div className="stitch-dock-capsule">
        {/* Dashboard Overview */}
        <Link 
          to="/" 
          title="Dashboard"
          className={location.pathname === '/' ? 'stitch-dock-btn stitch-dock-btn-active' : 'stitch-dock-btn'}
        >
          <LayoutDashboard size={18} />
        </Link>

        {/* Ledger & Transactions */}
        <Link 
          to="/transactions" 
          title="Ledger"
          className={location.pathname === '/transactions' ? 'stitch-dock-btn stitch-dock-btn-active' : 'stitch-dock-btn'}
        >
          <Receipt size={18} />
        </Link>

        {/* Center Emerald Action: Log Expense */}
        <button 
          onClick={onOpenAddExpense}
          title="Log Rapid Clearance"
          className="stitch-dock-btn-center"
        >
          <Plus size={20} />
        </button>

        {/* Goals & Budget Ceiling */}
        <Link 
          to="/goals" 
          title="Goals & Sinking Funds"
          className={location.pathname === '/goals' ? 'stitch-dock-btn stitch-dock-btn-active' : 'stitch-dock-btn'}
        >
          <Target size={18} />
        </Link>

        {/* Academics & Sinking Fund */}
        <Link 
          to="/academics" 
          title="Academic Obligations"
          className={location.pathname === '/academics' ? 'stitch-dock-btn stitch-dock-btn-active' : 'stitch-dock-btn'}
        >
          <GraduationCap size={18} />
        </Link>
      </div>
    </div>
  );
}
