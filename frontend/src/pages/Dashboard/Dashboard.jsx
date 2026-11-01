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
                ▲ +12.4% <span className="text-secondary font-medium">vs last month</span>
              </span>
            </div>

            <p className="horizon-subtext-muted">
              Consolidated treasury across liquid balances, high-yield vaults, and automated savings buffers.
            </p>
          </div>

          {/* Mini 30-Day Velocity Curve */}
          <div className="horizon-velocity-wrap">
            <div className="horizon-velocity-title">
              30-DAY VELOCITY CURVE
            </div>
            <svg width="150" height="38" viewBox="0 0 150 38" fill="none" className="overflow-visible">
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
        <div className="horizon-metrics-grid">
          {/* Gross Inflow */}
          <div className="horizon-metric-box">
            <div className="horizon-icon-inflow">
              <TrendingUp size={16} />
            </div>
            <div>
              <div className="horizon-metric-label">Gross Inflow</div>
              <div className="horizon-metric-val-white">
                +{formatRupees(incomeThisMonthPaise)} <span className="text-emerald text-xs">+18%</span>
              </div>
            </div>
          </div>

          {/* Total Burn / Outflow */}
          <div className="horizon-metric-box">
            <div className="horizon-icon-outflow">
              <TrendingDown size={16} />
            </div>
            <div>
              <div className="horizon-metric-label">Total Burn / Outflow</div>
              <div className="horizon-metric-val-white">
                −{formatRupees(expensesThisMonthPaise)} <span className="text-rose text-xs">-4.2%</span>
              </div>
            </div>
          </div>

          {/* Retained Surplus */}
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
              ON TRACK
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

          {/* Progress Bar */}
          <div className="goal-bar-track">
            <div 
              className={budgetPercent > 85 ? 'goal-bar-alert' : 'goal-bar-emerald'} 
              style={{ '--fill-width': `${budgetPercent}%`, width: 'var(--fill-width)' }}
            />
          </div>

          <div className="goal-percent-meta">
            <span>{budgetPercent}% UTILIZED</span>
            <span className="text-emerald">{formatRupees(budgetRemaining)} REMAINING</span>
          </div>

          {/* Safe Daily Burn Strip */}
          <div className="goal-safe-burn-strip">
            <span className="text-secondary flex items-center gap-2">
              <ShieldCheck size={14} color="#047857" /> Safe Burn Allowance:
            </span>
            <span className="goal-burn-allowance-num">
              {formatRupees(dailySafeAllowancePaise)} <span className="text-muted text-xs font-normal">/ day remaining</span>
            </span>
          </div>
        </div>

        {/* Card B: Dedicated Savings Target Goal */}
        <div className="goal-card-surface">
          <div className="goal-header-row">
            <div>
              <div className="goal-title-wrap">
                <Plane size={15} color="#047857" />
                <span className="goal-title-heading">{savingsTarget.title}</span>
              </div>
              <div className="goal-subtitle-tag">
                {savingsTarget.subtitle}
              </div>
            </div>

            {/* Circular Percent Badge */}
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
            ₹{(savingsTarget.targetRupees - savingsTarget.currentRupees).toLocaleString('en-IN')} remaining · Est. completion {savingsTarget.targetDate}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                const newTitle = prompt('Goal Title:', savingsTarget.title) || savingsTarget.title;
                const newTarget = Number(prompt('Target Amount (INR):', savingsTarget.targetRupees)) || savingsTarget.targetRupees;
                const updated = { ...savingsTarget, title: newTitle, targetRupees: newTarget };
                setSavingsTarget(updated);
                localStorage.setItem('pennywise_primary_goal', JSON.stringify(updated));
              }}
              className="btn btn-secondary goal-btn-adjust"
            >
              Adjust Target
            </button>
            <button
              onClick={() => handleDepositToGoal(1000)}
              className="goal-btn-deposit"
            >
              + Deposit ₹1,000
            </button>
          </div>
        </div>
      </div>

      {/* 5. Tri-Metric Operational Telemetry Strip */}
      <div className="telemetry-strip-grid">
        {/* Metric 1 */}
        <div className="telemetry-card-box">
          <div className="telemetry-title-row">
            <span className="telemetry-title-text">
              TODAY'S REAL-TIME SPEND
            </span>
            <Clock size={13} color="#94A3B8" />
          </div>
          <div className="telemetry-value-dark">
            ₹420.00
          </div>
          <div className="telemetry-sub-row">
            <span className="telemetry-pill-drop">
              ▼ -28% drop
            </span>
            <span className="text-secondary">Yesterday: ₹580.00</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="telemetry-card-box">
          <div className="telemetry-title-row">
            <span className="telemetry-title-text">
              DAILY AVERAGE OUTLAY
            </span>
            <Sparkles size={13} color="#94A3B8" />
          </div>
          <div className="telemetry-value-dark">
            ₹1,288.00 <span className="text-secondary text-xs font-normal">/ day</span>
          </div>
          <div className="telemetry-sub-row">
            <span className="text-emerald font-bold">OPTIMAL</span>
            <span className="text-secondary">Target threshold: ₹1,500</span>
          </div>
        </div>

        {/* Metric 3 */}
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
            Automated recurring models · 96% CONF.
          </div>
        </div>
      </div>

      {/* 6. Live Transaction Clearance Table & Protocol Feed */}
      <div className="clearance-table-card">
        {/* Feed Header */}
        <div className="clearance-header-bar">
          <div>
            <div className="flex items-center gap-2">
              <Receipt size={16} color="#111215" />
              <h3 className="clearance-title-heading">
                Live Transaction Feed
              </h3>
            </div>
            <div className="clearance-subtitle-note">
              Tabular multi-channel clearance protocol
            </div>
          </div>

          {/* Quick Search & Filter Pills */}
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
            {/* Table Header Row */}
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
                  {/* Entity & Purpose */}
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

                  {/* Classification */}
                  <div>
                    <span className={isIncome ? 'clearance-category-income' : 'clearance-category-expense'}>
                      {tx.categoryLabel}
                    </span>
                  </div>

                  {/* Method & Route */}
                  <div className="text-secondary text-xs">
                    {(tx.paymentMethod || 'UPI / Instant').toUpperCase()}
                  </div>

                  {/* Timestamp */}
                  <div className="text-muted text-xs">
                    {formatDate(tx.date)}
                  </div>

                  {/* Clearance Value */}
                  <div className={isIncome ? 'clearance-value-income' : 'clearance-value-expense'}>
                    {isIncome ? '+' : '−'}{formatRupees(tx.amountPaise)}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="clearance-footer-bar">
          <span>Displaying 5 of {recentTransactions.length} records</span>
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
