import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { formatRupees, formatDate } from '../../services/currency';
import { 
  PlusCircle, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  ChevronRight,
  GraduationCap,
  Utensils,
  Sparkles,
  ArrowRight,
  Target,
  Receipt,
  Download,
  SlidersHorizontal,
  Compass,
  CheckCircle2,
  Clock,
  Coffee,
  Plane,
  BookOpen,
  ShoppingBag,
  Zap,
  ArrowUpRight,
  Check,
  Search
} from 'lucide-react';
import { Link } from 'react-router-dom';
import InstallPwaBanner from '../../components/InstallPwaBanner';

export default function Dashboard({ onOpenAddExpense }) {
  const [data, setData] = useState(() => {
    try {
      const cached = localStorage.getItem('pennywise_dashboard_cache');
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(() => {
    return !localStorage.getItem('pennywise_dashboard_cache');
  });

  const [activeTab, setActiveTab] = useState('ALL');
  const [searchFilter, setSearchFilter] = useState('');

  // Primary Savings Goal State (synced with user's target)
  const [savingsTarget, setSavingsTarget] = useState(() => {
    try {
      const saved = localStorage.getItem('pennywise_primary_goal');
      return saved ? JSON.parse(saved) : {
        title: 'Next Trip to Goa',
        subtitle: 'Q1 LEISURE & RETREAT VAULT',
        targetRupees: 25000,
        currentRupees: 18500,
        targetDate: '28 Dec 2026'
      };
    } catch (e) {
      return {
        title: 'Next Trip to Goa',
        subtitle: 'Q1 LEISURE & RETREAT VAULT',
        targetRupees: 25000,
        currentRupees: 18500,
        targetDate: '28 Dec 2026'
      };
    }
  });

  const [showGoalModal, setShowGoalModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('1000');

  const fetchSummary = async () => {
    try {
      const res = await API.get('/dashboard/summary');
      setData(res.data.data);
      localStorage.setItem('pennywise_dashboard_cache', JSON.stringify(res.data.data));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleDepositToGoal = (amount) => {
    const amt = Number(amount) || 1000;
    const updated = {
      ...savingsTarget,
      currentRupees: Math.min(savingsTarget.targetRupees, savingsTarget.currentRupees + amt)
    };
    setSavingsTarget(updated);
    localStorage.setItem('pennywise_primary_goal', JSON.stringify(updated));
    setShowGoalModal(false);
  };

  const {
    currentBalancePaise = 0,
    incomeThisMonthPaise = 0,
    expensesThisMonthPaise = 0,
    budget = {},
    recentTransactions = []
  } = data || {};

  const safeBudgetLimit = budget?.limitPaise || 800000; // default ₹8,000 ceiling
  const budgetSpent = expensesThisMonthPaise;
  const budgetRemaining = Math.max(0, safeBudgetLimit - budgetSpent);
  const budgetPercent = safeBudgetLimit > 0 
    ? Math.min(Math.round((budgetSpent / safeBudgetLimit) * 100), 100) 
    : 0;

  // Days left in current month calculation for daily burn allowance
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft = Math.max(1, lastDay - now.getDate() + 1);
  const dailySafeAllowancePaise = Math.round(budgetRemaining / daysLeft);

  const goalPercent = Math.min(
    100, 
    Math.round((savingsTarget.currentRupees / savingsTarget.targetRupees) * 100)
  );

  const todayDateStr = now.toLocaleDateString('en-US', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  // Filter recent transactions
  const filteredTransactions = recentTransactions.filter((tx) => {
    const matchesSearch = !searchFilter || 
      tx.subcategory?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      tx.categoryLabel?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      tx.note?.toLowerCase().includes(searchFilter.toLowerCase());

    if (!matchesSearch) return false;
    if (activeTab === 'ALL') return true;
    if (activeTab === 'DINING') return tx.categoryId === 'food-drinks';
    if (activeTab === 'TRANSIT') return tx.categoryId === 'travel' || tx.categoryId === 'fuel';
    if (activeTab === 'BILLS') return tx.categoryId === 'bills-utilities';
    if (activeTab === 'SAVINGS') return tx.type === 'income' || tx.categoryId === 'academic';
    return true;
  });

  return (
    <div style={{ maxWidth: 1140, margin: '0 auto', padding: '16px 14px 80px 14px' }}>
      
      <InstallPwaBanner />

      {/* 1. Protocol Sub-Header Status Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 14,
        fontSize: 11.5,
        color: '#64748B',
        fontWeight: 600
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
          <span>{todayDateStr}</span>
          <span style={{ fontSize: 9.5, padding: '2px 6px', background: '#EEF0F4', borderRadius: 4, letterSpacing: '0.05em', color: '#475569', textTransform: 'uppercase', fontWeight: 800 }}>
            PORTFOLIO PROTOCOL V4.8
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ padding: '3px 8px', borderRadius: 5, background: '#FFFFFF', border: '1px solid #E5E7EB', color: '#111215', fontWeight: 700 }}>
            This Month
          </span>
          <span style={{ padding: '3px 8px', borderRadius: 5, background: '#F3F4F8', color: '#64748B' }}>
            Q4 2026
          </span>
          <span style={{ padding: '3px 8px', borderRadius: 5, background: '#F3F4F8', color: '#64748B' }}>
            Yearly
          </span>
          <span style={{ padding: '3px 8px', borderRadius: 5, background: '#ECFDF5', color: '#047857', fontWeight: 700, border: '1px solid #A7F3D0' }}>
            BASE INR (₹)
          </span>
        </div>
      </div>

      {/* 2. Stitch Horizon Net Liquidity Hero Card */}
      <div style={{
        background: 'linear-gradient(135deg, #111215 0%, #18191D 100%)',
        borderRadius: 18,
        padding: '24px 22px',
        color: '#FFFFFF',
        marginBottom: 14,
        border: '1px solid #2C2F38',
        boxShadow: '0 8px 24px rgba(17, 18, 21, 0.15)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: '#A1A7B4', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                HORIZON NET LIQUIDITY
              </span>
              <span style={{ fontSize: 9, fontWeight: 800, padding: '1px 6px', borderRadius: 4, background: 'rgba(16, 185, 129, 0.2)', color: '#34D399', textTransform: 'uppercase' }}>
                LIVE POSITIONS
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 38, fontWeight: 900, fontFamily: 'var(--font-heading)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                {formatRupees(currentBalancePaise)}
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#34D399', display: 'flex', alignItems: 'center', gap: 2 }}>
                ▲ +12.4% <span style={{ color: '#8E92A0', fontWeight: 500 }}>vs last month</span>
              </span>
            </div>

            <p style={{ fontSize: 11.5, color: '#8E92A0', margin: '8px 0 0 0', maxWidth: 460 }}>
              Consolidated treasury across liquid balances, high-yield vaults, and automated savings buffers.
            </p>
          </div>

          {/* Mini 30-Day Velocity Curve */}
          <div style={{ minWidth: 160, textAlign: 'right' }}>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: '#8E92A0', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
              30-DAY VELOCITY CURVE
            </div>
            <svg width="150" height="38" viewBox="0 0 150 38" fill="none" style={{ overflow: 'visible' }}>
              <path 
                d="M 0 32 C 30 30, 45 35, 75 22 C 105 10, 120 18, 150 4" 
                stroke="#10B981" 
                strokeWidth="2.5" 
                strokeLinecap="round"
              />
              <circle cx="150" cy="4" r="3.5" fill="#34D399" />
            </svg>
          </div>
        </div>

        {/* Inflow / Outflow / Retained Surplus Bottom Banner */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 10,
          marginTop: 20,
          paddingTop: 16,
          borderTop: '1px solid #282B33'
        }}>
          {/* Gross Inflow */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(16, 185, 129, 0.15)', color: '#34D399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={16} />
            </div>
            <div>
              <div style={{ fontSize: 9.5, color: '#8E92A0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gross Inflow</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#FFFFFF' }}>
                +{formatRupees(incomeThisMonthPaise)} <span style={{ fontSize: 10, color: '#34D399' }}>+18%</span>
              </div>
            </div>
          </div>

          {/* Total Burn / Outflow */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(244, 63, 94, 0.15)', color: '#FB7185', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingDown size={16} />
            </div>
            <div>
              <div style={{ fontSize: 9.5, color: '#8E92A0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Burn / Outflow</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#FFFFFF' }}>
                −{formatRupees(expensesThisMonthPaise)} <span style={{ fontSize: 10, color: '#FB7185' }}>-4.2%</span>
              </div>
            </div>
          </div>

          {/* Retained Surplus */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(16, 185, 129, 0.25)', color: '#34D399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={16} />
            </div>
            <div>
              <div style={{ fontSize: 9.5, color: '#8E92A0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Retained Liquidity Surplus</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#34D399' }}>
                {formatRupees(Math.max(0, incomeThisMonthPaise - expensesThisMonthPaise))} <span style={{ fontSize: 9.5, padding: '1px 5px', background: 'rgba(16, 185, 129, 0.2)', borderRadius: 3 }}>Surplus</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Action Command Strip */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
        marginBottom: 16
      }}>
        <button
          onClick={onOpenAddExpense}
          className="btn"
          style={{
            background: '#111215',
            color: '#FFFFFF',
            borderRadius: 8,
            padding: '8px 14px',
            fontSize: 12,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <PlusCircle size={14} color="#34D399" /> Log Expense
        </button>

        <button
          onClick={() => setShowGoalModal(true)}
          className="btn"
          style={{
            background: '#047857',
            color: '#FFFFFF',
            borderRadius: 8,
            padding: '8px 14px',
            fontSize: 12,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <Target size={14} /> Deposit to Goal
        </button>

        <Link
          to="/transactions"
          className="btn"
          style={{
            background: '#FFFFFF',
            color: '#111215',
            border: '1px solid #E5E7EB',
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: 12,
            fontWeight: 600,
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <Download size={13} color="#64748B" /> Export Ledger <span style={{ fontSize: 9.5, color: '#94A3B8' }}>CSV</span>
        </Link>

        <Link
          to="/reports"
          className="btn"
          style={{
            background: '#FFFFFF',
            color: '#111215',
            border: '1px solid #E5E7EB',
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: 12,
            fontWeight: 600,
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <SlidersHorizontal size={13} color="#64748B" /> Analytics Insights
        </Link>
      </div>

      {/* 4. Dual Goal Horizon: Monthly Spending Cap & Dedicated Savings Target */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 14,
        marginBottom: 16
      }}>
        
        {/* Card A: Monthly Spending Cap */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: 14,
          padding: '18px 20px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 2px 8px rgba(17, 18, 21, 0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#047857' }} />
              <span style={{ fontSize: 13.5, fontWeight: 800, color: '#111215' }}>Monthly Spending Cap</span>
            </div>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#047857', background: '#ECFDF5', padding: '2px 7px', borderRadius: 4, letterSpacing: '0.04em' }}>
              ON TRACK
            </span>
          </div>

          <p style={{ fontSize: 11, color: '#64748B', margin: '0 0 12px 0' }}>
            Disciplined discretionary ceiling for dining, digital subscriptions & transit.
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
            <div>
              <span style={{ fontSize: 24, fontWeight: 900, fontFamily: 'var(--font-heading)', color: '#111215' }}>
                {formatRupees(budgetSpent)}
              </span>
              <span style={{ fontSize: 11, color: '#64748B', marginLeft: 6 }}>disbursed</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#111215' }}>{formatRupees(safeBudgetLimit)}</div>
              <div style={{ fontSize: 9.5, color: '#94A3B8' }}>hard ceiling</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ width: '100%', height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
            <div style={{
              width: `${budgetPercent}%`,
              height: '100%',
              backgroundColor: budgetPercent > 85 ? '#E11D48' : '#047857',
              borderRadius: 3,
              transition: 'width 0.4s ease'
            }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 12 }}>
            <span>{budgetPercent}% UTILIZED</span>
            <span style={{ color: '#047857' }}>{formatRupees(budgetRemaining)} REMAINING</span>
          </div>

          {/* Safe Daily Burn Strip */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            background: '#F9F9FB',
            borderRadius: 8,
            fontSize: 11.5,
            border: '1px solid #EEF0F4'
          }}>
            <span style={{ color: '#475569', display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldCheck size={14} color="#047857" /> Safe Burn Allowance:
            </span>
            <span style={{ fontWeight: 800, color: '#111215' }}>
              {formatRupees(dailySafeAllowancePaise)} <span style={{ fontSize: 10, color: '#64748B', fontWeight: 500 }}>/ day remaining</span>
            </span>
          </div>
        </div>

        {/* Card B: Dedicated Savings Target Goal */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: 14,
          padding: '18px 20px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 2px 8px rgba(17, 18, 21, 0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Plane size={15} color="#047857" />
                <span style={{ fontSize: 13.5, fontWeight: 800, color: '#111215' }}>{savingsTarget.title}</span>
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.06em', marginTop: 2 }}>
                {savingsTarget.subtitle}
              </div>
            </div>

            {/* Circular Percent Badge */}
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: '3px solid #ECFDF5',
              borderTopColor: '#047857',
              borderRightColor: '#047857',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              fontWeight: 800,
              color: '#047857'
            }}>
              {goalPercent}%
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 14, marginBottom: 4 }}>
            <span style={{ fontSize: 24, fontWeight: 900, fontFamily: 'var(--font-heading)', color: '#111215' }}>
              ₹{savingsTarget.currentRupees.toLocaleString('en-IN')}.00
            </span>
            <span style={{ fontSize: 11, color: '#64748B' }}>
              Target: ₹{savingsTarget.targetRupees.toLocaleString('en-IN')}.00
            </span>
          </div>

          <div style={{ fontSize: 11, color: '#64748B', marginBottom: 14 }}>
            ₹{(savingsTarget.targetRupees - savingsTarget.currentRupees).toLocaleString('en-IN')} remaining · Est. completion {savingsTarget.targetDate}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => {
                const newTitle = prompt('Goal Title:', savingsTarget.title) || savingsTarget.title;
                const newTarget = Number(prompt('Target Amount (INR):', savingsTarget.targetRupees)) || savingsTarget.targetRupees;
                const updated = { ...savingsTarget, title: newTitle, targetRupees: newTarget };
                setSavingsTarget(updated);
                localStorage.setItem('pennywise_primary_goal', JSON.stringify(updated));
              }}
              className="btn btn-secondary"
              style={{ flex: 1, padding: '7px 10px', fontSize: 11.5, fontWeight: 700, borderRadius: 8 }}
            >
              Adjust Target
            </button>
            <button
              onClick={() => handleDepositToGoal(1000)}
              className="btn btn-primary"
              style={{ flex: 1.2, padding: '7px 12px', fontSize: 11.5, fontWeight: 700, borderRadius: 8, background: '#047857' }}
            >
              + Deposit ₹1,000
            </button>
          </div>
        </div>
      </div>

      {/* 5. Tri-Metric Operational Telemetry Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 12,
        marginBottom: 16
      }}>
        {/* Metric 1 */}
        <div style={{ background: '#FFFFFF', padding: '14px 16px', borderRadius: 12, border: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              TODAY'S REAL-TIME SPEND
            </span>
            <Clock size={13} color="#94A3B8" />
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#111215', marginTop: 4 }}>
            ₹420.00
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10.5, marginTop: 4 }}>
            <span style={{ color: '#047857', background: '#ECFDF5', padding: '1px 5px', borderRadius: 3, fontWeight: 700 }}>
              ▼ -28% drop
            </span>
            <span style={{ color: '#64748B' }}>Yesterday: ₹580.00</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div style={{ background: '#FFFFFF', padding: '14px 16px', borderRadius: 12, border: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              DAILY AVERAGE OUTLAY
            </span>
            <Sparkles size={13} color="#94A3B8" />
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#111215', marginTop: 4 }}>
            ₹1,288.00 <span style={{ fontSize: 11, color: '#64748B', fontWeight: 500 }}>/ day</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10.5, marginTop: 4 }}>
            <span style={{ color: '#047857', fontWeight: 700 }}>OPTIMAL</span>
            <span style={{ color: '#64748B' }}>Target threshold: ₹1,500</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div style={{ background: '#FFFFFF', padding: '14px 16px', borderRadius: 12, border: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              PROJECTED MONTH-END SURPLUS
            </span>
            <ArrowUpRight size={13} color="#047857" />
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#047857', marginTop: 4 }}>
            {formatRupees(Math.max(0, incomeThisMonthPaise - expensesThisMonthPaise))}
          </div>
          <div style={{ fontSize: 10.5, color: '#64748B', marginTop: 4 }}>
            Automated recurring models · 96% CONF.
          </div>
        </div>
      </div>

      {/* 6. Live Transaction Clearance Table & Protocol Feed */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: 14,
        padding: '18px 20px',
        border: '1px solid #E5E7EB',
        boxShadow: '0 2px 8px rgba(17, 18, 21, 0.03)'
      }}>
        {/* Feed Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 16
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Receipt size={16} color="#111215" />
              <h3 style={{ fontSize: 14.5, fontWeight: 800, color: '#111215', margin: 0 }}>
                Live Transaction Feed
              </h3>
            </div>
            <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
              Tabular multi-channel clearance protocol
            </div>
          </div>

          {/* Quick Search & Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter records..."
                style={{
                  padding: '5px 10px 5px 28px',
                  borderRadius: 6,
                  border: '1px solid #E5E7EB',
                  fontSize: 11.5,
                  width: 140
                }}
              />
              <Search size={12} color="#94A3B8" style={{ position: 'absolute', left: 9, top: 8 }} />
            </div>

            <div style={{ display: 'flex', gap: 4 }}>
              {['ALL', 'DINING', 'TRANSIT', 'BILLS', 'SAVINGS'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 5,
                    fontSize: 10,
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    background: activeTab === tab ? '#111215' : '#F1F5F9',
                    color: activeTab === tab ? '#FFFFFF' : '#64748B'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tabular Clearance List */}
        {filteredTransactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 16px', color: '#64748B', fontSize: 13 }}>
            No records matching current clearance filter.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Table Header Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1.2fr 1fr 1fr',
              padding: '8px 10px',
              borderBottom: '1px solid #EEF0F4',
              fontSize: 9.5,
              fontWeight: 800,
              color: '#8E92A0',
              textTransform: 'uppercase',
              letterSpacing: '0.06em'
            }}>
              <span>Entity & Purpose</span>
              <span>Classification</span>
              <span>Method & Route</span>
              <span>Timestamp</span>
              <span style={{ textAlign: 'right' }}>Clearance Value</span>
            </div>

            {filteredTransactions.slice(0, 6).map((tx) => {
              const isIncome = tx.type === 'income';
              return (
                <div
                  key={tx._id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1.2fr 1fr 1fr',
                    padding: '12px 10px',
                    borderBottom: '1px solid #F1F5F9',
                    alignItems: 'center',
                    fontSize: 12
                  }}
                >
                  {/* Entity & Purpose */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 30,
                      height: 30,
                      borderRadius: 6,
                      background: isIncome ? '#ECFDF5' : '#F9F9FB',
                      color: isIncome ? '#047857' : '#111215',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #E5E7EB'
                    }}>
                      {tx.categoryId === 'food-drinks' ? <Coffee size={14} /> : 
                       tx.categoryId === 'travel' || tx.categoryId === 'fuel' ? <Plane size={14} /> :
                       tx.categoryId === 'academic' ? <BookOpen size={14} /> :
                       <ShoppingBag size={14} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#111215' }}>
                        {tx.subcategory || tx.categoryLabel}
                      </div>
                      <div style={{ fontSize: 10.5, color: '#94A3B8' }}>
                        {tx.note || 'Multi-channel settlement'}
                      </div>
                    </div>
                  </div>

                  {/* Classification */}
                  <div>
                    <span style={{
                      fontSize: 9.5,
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: 4,
                      background: isIncome ? '#ECFDF5' : '#F3F4F8',
                      color: isIncome ? '#047857' : '#475569',
                      textTransform: 'uppercase'
                    }}>
                      {tx.categoryLabel}
                    </span>
                  </div>

                  {/* Method & Route */}
                  <div style={{ fontSize: 11, color: '#64748B' }}>
                    {(tx.paymentMethod || 'UPI / Instant').toUpperCase()}
                  </div>

                  {/* Timestamp */}
                  <div style={{ fontSize: 11, color: '#8E92A0' }}>
                    {formatDate(tx.date)}
                  </div>

                  {/* Clearance Value */}
                  <div style={{
                    textAlign: 'right',
                    fontSize: 13.5,
                    fontWeight: 800,
                    fontFamily: 'var(--font-heading)',
                    color: isIncome ? '#047857' : '#111215'
                  }}>
                    {isIncome ? '+' : '−'}{formatRupees(tx.amountPaise)}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 14,
          paddingTop: 10,
          borderTop: '1px solid #EEF0F4',
          fontSize: 11,
          color: '#8E92A0'
        }}>
          <span>Displaying 5 of {recentTransactions.length} records</span>
          <Link to="/transactions" style={{ color: '#047857', fontWeight: 700, textDecoration: 'none' }}>
            View Full Ledger →
          </Link>
        </div>
      </div>

      {/* Modal: Deposit to Savings Goal */}
      {showGoalModal && (
        <div className="modal-overlay" onClick={() => setShowGoalModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400, padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Target size={18} color="#047857" />
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#111215', margin: 0 }}>
                  Deposit to {savingsTarget.title}
                </h3>
              </div>
              <button onClick={() => setShowGoalModal(false)} className="modal-close-btn">
                ✕
              </button>
            </div>

            <p style={{ fontSize: 12, color: '#64748B', margin: '0 0 14px 0' }}>
              Add liquid funds toward your target: ₹{savingsTarget.currentRupees.toLocaleString('en-IN')} / ₹{savingsTarget.targetRupees.toLocaleString('en-IN')}
            </p>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                Deposit Amount (INR)
              </label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="form-input"
                style={{ fontSize: 16, fontWeight: 800 }}
              />
            </div>

            <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
              {[500, 1000, 2500, 5000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setDepositAmount(amt.toString())}
                  style={{
                    flex: 1,
                    padding: '6px',
                    borderRadius: 6,
                    border: '1px solid #E5E7EB',
                    background: '#F9F9FB',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  +₹{amt}
                </button>
              ))}
            </div>

            <button
              onClick={() => handleDepositToGoal(depositAmount)}
              className="btn btn-primary"
              style={{ width: '100%', padding: 10, background: '#047857', fontWeight: 800 }}
            >
              Confirm Deposit
            </button>
          </div>
        </div>
      )}

      {/* Footer Attestation */}
      <div style={{
        marginTop: 24,
        textAlign: 'center',
        fontSize: 10.5,
        color: '#94A3B8',
        fontWeight: 500,
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8
      }}>
        <span>© 2026 PENNYWISE WEALTH STUDIO. NORDIC PRECISION FINANCIAL SYSTEMS.</span>
        <div style={{ display: 'flex', gap: 12 }}>
          <span>Treasury Protocol</span>
          <span>Security & Attestation</span>
          <span>API Architecture</span>
        </div>
      </div>
    </div>
  );
}
