import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { formatRupees, formatDate } from '../../services/currency';
import { 
  PlusCircle, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  Sparkles, 
  Target, 
  Receipt, 
  Download, 
  SlidersHorizontal, 
  CheckCircle2, 
  Clock, 
  Coffee, 
  Plane, 
  BookOpen, 
  ShoppingBag, 
  ArrowUpRight, 
  Search 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import InstallPwaBanner from '../../components/InstallPwaBanner';

export default function Dashboard({ onOpenAddExpense }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchFilter, setSearchFilter] = useState('');

  // Primary Savings Goal State from DB
  const [savingsTarget, setSavingsTarget] = useState(null);

  const [showGoalModal, setShowGoalModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('1000');

  const fetchSummary = async () => {
    try {
      const res = await API.get('/dashboard/summary');
      setData(res.data.data);

      if (res.data.data?.primaryGoal) {
        const g = res.data.data.primaryGoal;
        setSavingsTarget({
          _id: g._id,
          title: g.name,
          subtitle: g.priority || 'LIQUIDITY VAULT',
          targetRupees: Math.round(g.targetPaise / 100),
          currentRupees: Math.round(g.savedPaise / 100),
          targetDate: g.deadline ? new Date(g.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Flexible'
        });
      } else {
        setSavingsTarget(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleDepositToGoal = async (amount) => {
    const amt = Number(amount) || 1000;
    if (!savingsTarget?._id) return;
    try {
      await API.post(`/goals/${savingsTarget._id}/deposit`, {
        amountPaise: amt * 100
      });
      setShowGoalModal(false);
      await fetchSummary();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to deposit to goal');
    }
  };

  const {
    currentBalancePaise = 0,
    incomeThisMonthPaise = 0,
    expensesThisMonthPaise = 0,
    budget = {},
    recentTransactions = [],
    dailyExpenses = []
  } = data || {};

  const safeBudgetLimit = budget?.limitPaise || 800000;
  const budgetSpent = expensesThisMonthPaise;
  const budgetRemaining = Math.max(0, safeBudgetLimit - budgetSpent);
  const budgetPercent = safeBudgetLimit > 0 
    ? Math.min(Math.round((budgetSpent / safeBudgetLimit) * 100), 100) 
    : 0;

  // Real-time days left calculation
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft = Math.max(1, lastDay - now.getDate() + 1);
  const dailySafeAllowancePaise = Math.round(budgetRemaining / daysLeft);

  // Dynamically generate SVG path strictly reflecting current month's actual expenses
  const generateMonthlyExpenseCurve = () => {
    if (!dailyExpenses || dailyExpenses.length === 0 || expensesThisMonthPaise === 0) {
      // Zero expenses: Flat baseline at y = 34
      return { path: 'M 0 34 L 150 34', lastPoint: { x: 150, y: 34 }, hasExpenses: false };
    }

    const maxExp = Math.max(...dailyExpenses, 1);
    const stepX = 150 / Math.max(1, dailyExpenses.length - 1);
    
    // Map expenses to SVG coordinates (y: 6 to 34, where high expense is near y: 6)
    const points = dailyExpenses.map((val, idx) => {
      const x = Math.round(idx * stepX);
      const y = Math.round(34 - (val / maxExp) * 26);
      return { x, y };
    });

    const d = points.reduce((acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`), '');
    const lastPoint = points[points.length - 1] || { x: 150, y: 34 };
    return { path: d, lastPoint, hasExpenses: true };
  };

  const expenseCurve = generateMonthlyExpenseCurve();
  const currentDayOfMonth = Math.max(1, now.getDate());
  const actualDailyAvgPaise = Math.round(expensesThisMonthPaise / currentDayOfMonth);

  // Compute Today's actual spend from recent transactions
  const todayStr = now.toISOString().split('T')[0];
  const todaySpentPaise = recentTransactions
    .filter(t => t.date && t.date.startsWith(todayStr) && t.type === 'expense')
    .reduce((sum, t) => sum + t.amountPaise, 0);

  const goalPercent = (savingsTarget && savingsTarget.targetRupees > 0)
    ? Math.min(100, Math.round((savingsTarget.currentRupees / savingsTarget.targetRupees) * 100))
    : 0;

  const todayDateStr = now.toLocaleDateString('en-US', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  // Filter transactions
  const filteredTransactions = recentTransactions.filter((tx) => {
    const matchesSearch = !searchFilter || 
      (tx.subcategory && tx.subcategory.toLowerCase().includes(searchFilter.toLowerCase())) ||
      (tx.categoryLabel && tx.categoryLabel.toLowerCase().includes(searchFilter.toLowerCase())) ||
      (tx.note && tx.note.toLowerCase().includes(searchFilter.toLowerCase()));

    if (!matchesSearch) return false;
    if (activeTab === 'ALL') return true;
    if (activeTab === 'DINING') return tx.categoryId === 'food-drinks';
    if (activeTab === 'TRANSIT') return tx.categoryId === 'travel' || tx.categoryId === 'fuel';
    if (activeTab === 'BILLS') return tx.categoryId === 'bills-utilities';
    if (activeTab === 'SAVINGS') return tx.type === 'income' || tx.categoryId === 'academic';
    return true;
  });

  return (
    <div className="stitch-container">
      
      <InstallPwaBanner />

      {/* 1. Protocol Sub-Header Status Row */}
      <div className="proto-status-bar">
        <div className="proto-status-left">
          <span className="proto-pulse-dot" />
          <span>{todayDateStr}</span>
          <span className="proto-protocol-pill">
            PORTFOLIO PROTOCOL V4.8
          </span>
        </div>

        <div className="proto-status-right">
          <span className="proto-filter-pill-active">
            This Month
          </span>
          <span className="proto-filter-pill">
            Q4 2026
          </span>
          <span className="proto-filter-pill">
            Yearly
          </span>
          <span className="proto-badge-base">
            BASE INR (₹)
          </span>
        </div>
      </div>

      {/* 2. Stitch Horizon Net Liquidity Hero Card */}
      <div className="horizon-card">
        <div className="horizon-top-row">
          <div>
            <div className="horizon-meta-header">
              <span className="horizon-label-protocol">
                HORIZON NET LIQUIDITY
              </span>
              <span className="horizon-live-pill">
                LIVE POSITIONS
              </span>
            </div>

            <div className="horizon-balance-wrap">
              <span className="horizon-balance-num">
                {formatRupees(currentBalancePaise)}
              </span>
              <span className="horizon-growth-tag">
                ▲ Verified Balance <span className="text-secondary font-medium">in database</span>
              </span>
            </div>

            <p className="horizon-subtext-muted">
              Consolidated treasury across liquid balances, high-yield vaults, and automated savings buffers.
            </p>
          </div>

          <div className="horizon-velocity-wrap">
            <div className="horizon-velocity-title">
              MONTH EXPENSES TRAJECTORY
            </div>
            <svg width="150" height="38" viewBox="0 0 150 38" fill="none" className="overflow-visible">
              <path 
                d={expenseCurve.path}
                stroke={expenseCurve.hasExpenses ? '#F43F5E' : '#64748B'} 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              {expenseCurve.hasExpenses && (
                <circle cx={expenseCurve.lastPoint.x} cy={expenseCurve.lastPoint.y} r="3.5" fill="#FB7185" />
              )}
            </svg>
            <div className="text-right text-xs text-muted mt-0.5">
              {expensesThisMonthPaise === 0 ? '₹0 outlays this month' : `${formatRupees(expensesThisMonthPaise)} expended`}
            </div>
          </div>
        </div>

        {/* Inflow / Outflow / Retained Surplus Bottom Banner */}
        <div className="horizon-metrics-grid">
          <div className="horizon-metric-box">
            <div className="horizon-icon-inflow">
              <TrendingUp size={16} />
            </div>
            <div>
              <div className="horizon-metric-label">Gross Inflow (Month)</div>
              <div className="horizon-metric-val-white">
                +{formatRupees(incomeThisMonthPaise)}
              </div>
            </div>
          </div>

          <div className="horizon-metric-box">
            <div className="horizon-icon-outflow">
              <TrendingDown size={16} />
            </div>
            <div>
              <div className="horizon-metric-label">Total Outflow (Month)</div>
              <div className="horizon-metric-val-white">
                −{formatRupees(expensesThisMonthPaise)}
              </div>
            </div>
          </div>

          <div className="horizon-metric-box">
            <div className="horizon-icon-surplus">
              <CheckCircle2 size={16} />
            </div>
            <div>
              <div className="horizon-metric-label">Retained Liquidity Surplus</div>
              <div className="horizon-metric-val-emerald">
                {formatRupees(Math.max(0, incomeThisMonthPaise - expensesThisMonthPaise))} <span className="horizon-pill-surplus">Surplus</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Action Command Strip */}
      <div className="action-strip-row">
        <button
          onClick={onOpenAddExpense}
          className="btn-nordic-black"
        >
          <PlusCircle size={14} color="#34D399" /> Log Expense
        </button>

        <button
          onClick={() => setShowGoalModal(true)}
          className="btn-nordic-emerald"
        >
          <Target size={14} /> Deposit to Goal
        </button>

        <Link
          to="/transactions"
          className="btn-nordic-outline"
        >
          <Download size={13} color="#64748B" /> Export Ledger <span className="text-muted text-xs">CSV</span>
        </Link>

        <Link
          to="/reports"
          className="btn-nordic-outline"
        >
          <SlidersHorizontal size={13} color="#64748B" /> Analytics Insights
        </Link>
      </div>

      {/* 4. Dual Goal Horizon: Monthly Spending Cap & Dedicated Savings Target */}
      <div className="goal-dual-grid">
        
        {/* Card A: Monthly Spending Cap */}
        <div className="goal-card-surface">
          <div className="goal-header-row">
            <div className="goal-title-wrap">
              <span className="goal-indicator-dot" />
              <span className="goal-title-heading">Monthly Spending Cap</span>
            </div>
            <span className="goal-status-ontrack">
              {budgetPercent > 85 ? 'HIGH BURN' : 'ON TRACK'}
            </span>
          </div>

          <p className="goal-caption-muted">
            Disciplined discretionary ceiling for dining, digital subscriptions & transit.
          </p>

          <div className="goal-val-row">
            <div>
              <span className="goal-val-primary">
                {formatRupees(budgetSpent)}
              </span>
              <span className="goal-val-disbursed">disbursed</span>
            </div>
            <div className="text-right">
              <div className="text-dark font-extrabold text-xs">{formatRupees(safeBudgetLimit)}</div>
              <div className="text-muted text-xs">hard ceiling</div>
            </div>
          </div>

          <div className="goal-bar-track">
            <div 
              className={budgetPercent > 85 ? 'goal-bar-alert' : 'goal-bar-emerald'} 
              style={{ width: `${budgetPercent}%` }}
            />
          </div>

          <div className="goal-percent-meta">
            <span>{budgetPercent}% UTILIZED</span>
            <span className="text-emerald">{formatRupees(budgetRemaining)} REMAINING</span>
          </div>

          <div className="goal-safe-burn-strip">
            <span className="text-secondary flex items-center gap-2">
              <ShieldCheck size={14} color="#047857" /> Safe Daily Allowance:
            </span>
            <span className="goal-burn-allowance-num">
              {formatRupees(dailySafeAllowancePaise)} <span className="text-muted text-xs font-normal">/ day remaining</span>
            </span>
          </div>
        </div>

        {/* Card B: Dedicated Savings Target Goal (100% MongoDB) */}
        <div className="goal-card-surface">
          {savingsTarget ? (
            <>
              <div className="goal-header-row">
                <div>
                  <div className="goal-title-wrap">
                    <Target size={15} color="#047857" />
                    <span className="goal-title-heading">{savingsTarget.title}</span>
                  </div>
                  <div className="goal-subtitle-tag">
                    {savingsTarget.subtitle}
                  </div>
                </div>

                <div className="goal-ring-badge">
                  {goalPercent}%
                </div>
              </div>

              <div className="goal-val-row mt-4 mb-1">
                <span className="goal-val-primary">
                  ₹{savingsTarget.currentRupees.toLocaleString('en-IN')}.00
                </span>
                <span className="text-secondary text-xs">
                  Target: ₹{savingsTarget.targetRupees.toLocaleString('en-IN')}.00
                </span>
              </div>

              <div className="text-secondary text-xs mb-4">
                ₹{Math.max(0, savingsTarget.targetRupees - savingsTarget.currentRupees).toLocaleString('en-IN')} remaining · Est. completion {savingsTarget.targetDate}
              </div>

              <div className="flex gap-2">
                <Link
                  to="/goals"
                  className="btn btn-secondary goal-btn-adjust"
                >
                  Manage Vault
                </Link>
                <button
                  onClick={() => handleDepositToGoal(1000)}
                  className="goal-btn-deposit"
                >
                  + Deposit ₹1,000
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <Target size={30} className="mx-auto text-emerald-600 mb-2" />
              <div className="font-extrabold text-xs text-dark mb-1">No Active Savings Goal</div>
              <p className="text-muted text-xs mb-3">Arm a multi-horizon savings vault to track your reserve targets.</p>
              <Link to="/goals" className="btn-goals-primary mx-auto text-xs py-1.5 px-3">
                + Create Savings Goal
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* 5. Real-Time Telemetry Strip Calculated Directly From Live Data */}
      <div className="telemetry-strip-grid">
        <div className="telemetry-card-box">
          <div className="telemetry-title-row">
            <span className="telemetry-title-text">
              TODAY'S REAL-TIME SPEND
            </span>
            <Clock size={13} color="#94A3B8" />
          </div>
          <div className="telemetry-value-dark">
            {formatRupees(todaySpentPaise)}
          </div>
          <div className="telemetry-sub-row">
            <span className="telemetry-pill-drop">
              Live Verified
            </span>
            <span className="text-secondary">Today's transactions</span>
          </div>
        </div>

        <div className="telemetry-card-box">
          <div className="telemetry-title-row">
            <span className="telemetry-title-text">
              DAILY AVERAGE OUTLAY
            </span>
            <Sparkles size={13} color="#94A3B8" />
          </div>
          <div className="telemetry-value-dark">
            {formatRupees(actualDailyAvgPaise)} <span className="text-secondary text-xs font-normal">/ day</span>
          </div>
          <div className="telemetry-sub-row">
            <span className="text-emerald font-bold">CURRENT PACING</span>
            <span className="text-secondary">Across {currentDayOfMonth} days</span>
          </div>
        </div>

        <div className="telemetry-card-box">
          <div className="telemetry-title-row">
            <span className="telemetry-title-text">
              PROJECTED MONTH-END SURPLUS
            </span>
            <ArrowUpRight size={13} color="#047857" />
          </div>
          <div className="telemetry-value-emerald">
            {formatRupees(Math.max(0, incomeThisMonthPaise - expensesThisMonthPaise))}
          </div>
          <div className="text-secondary text-xs mt-1">
            Realized liquid cash surplus
          </div>
        </div>
      </div>

      {/* 6. Live Transaction Clearance Table & Protocol Feed */}
      <div className="clearance-table-card">
        <div className="clearance-header-bar">
          <div>
            <div className="flex items-center gap-2">
              <Receipt size={16} color="#111215" />
              <h3 className="clearance-title-heading">
                Live Transaction Feed
              </h3>
            </div>
            <div className="clearance-subtitle-note">
              Tabular multi-channel clearance protocol directly from MongoDB
            </div>
          </div>

          <div className="clearance-filter-wrap">
            <div className="relative">
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter records..."
                className="clearance-search-field"
              />
              <Search size={12} color="#94A3B8" className="clearance-search-icon" />
            </div>

            <div className="flex gap-1">
              {['ALL', 'DINING', 'TRANSIT', 'BILLS', 'SAVINGS'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={activeTab === tab ? 'clearance-tab-active' : 'clearance-tab-inactive'}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tabular Clearance List */}
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-secondary text-sm">
            No records matching current clearance filter.
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="clearance-table-head">
              <span>Entity & Purpose</span>
              <span>Classification</span>
              <span>Method & Route</span>
              <span>Timestamp</span>
              <span className="text-right">Clearance Value</span>
            </div>

            {filteredTransactions.slice(0, 6).map((tx) => {
              const isIncome = tx.type === 'income';
              return (
                <div
                  key={tx._id}
                  className="clearance-table-row"
                >
                  <div className="flex items-center gap-3">
                    <div className={isIncome ? 'clearance-icon-income' : 'clearance-icon-expense'}>
                      {tx.categoryId === 'food-drinks' ? <Coffee size={14} /> : 
                       tx.categoryId === 'travel' || tx.categoryId === 'fuel' ? <Plane size={14} /> :
                       tx.categoryId === 'academic' ? <BookOpen size={14} /> :
                       <ShoppingBag size={14} />}
                    </div>
                    <div>
                      <div className="font-bold text-dark">
                        {tx.subcategory || tx.categoryLabel}
                      </div>
                      <div className="text-muted text-xs">
                        {tx.note || 'Multi-channel settlement'}
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className={isIncome ? 'clearance-category-income' : 'clearance-category-expense'}>
                      {tx.categoryLabel}
                    </span>
                  </div>

                  <div className="text-secondary text-xs">
                    {(tx.paymentMethod || 'UPI / Instant').toUpperCase()}
                  </div>

                  <div className="text-muted text-xs">
                    {formatDate(tx.date)}
                  </div>

                  <div className={isIncome ? 'clearance-value-income' : 'clearance-value-expense'}>
                    {isIncome ? '+' : '−'}{formatRupees(tx.amountPaise)}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="clearance-footer-bar">
          <span>Displaying {Math.min(6, filteredTransactions.length)} of {recentTransactions.length} records</span>
          <Link to="/transactions" className="clearance-footer-link">
            View Full Ledger →
          </Link>
        </div>
      </div>

      {/* Modal: Deposit to Savings Goal */}
      {showGoalModal && (
        <div className="modal-overlay" onClick={() => setShowGoalModal(false)}>
          <div className="modal-content modal-stitch-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-stitch-header">
              <div className="flex items-center gap-2">
                <Target size={18} color="#047857" />
                <h3 className="text-dark font-extrabold text-sm m-0">
                  Deposit to {savingsTarget.title}
                </h3>
              </div>
              <button onClick={() => setShowGoalModal(false)} className="modal-close-btn">
                ✕
              </button>
            </div>

            <p className="text-secondary text-xs mb-3">
              Add liquid funds toward your target: ₹{savingsTarget.currentRupees.toLocaleString('en-IN')} / ₹{savingsTarget.targetRupees.toLocaleString('en-IN')}
            </p>

            <div className="mb-3">
              <label className="block text-secondary font-bold text-xs mb-1">
                Deposit Amount (INR)
              </label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="form-input font-extrabold text-base"
              />
            </div>

            <div className="flex gap-2 mb-4">
              {[500, 1000, 2500, 5000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setDepositAmount(amt.toString())}
                  className="modal-stitch-quick-btn"
                >
                  +₹{amt}
                </button>
              ))}
            </div>

            <button
              onClick={() => handleDepositToGoal(depositAmount)}
              className="modal-stitch-submit"
            >
              Confirm Deposit
            </button>
          </div>
        </div>
      )}

      {/* Footer Attestation */}
      <div className="stitch-attestation-bar">
        <span>© 2026 PENNYWISE WEALTH STUDIO. NORDIC PRECISION FINANCIAL SYSTEMS.</span>
        <div className="flex gap-3">
          <span>Treasury Protocol</span>
          <span>Security & Attestation</span>
          <span>API Architecture</span>
        </div>
      </div>
    </div>
  );
}
