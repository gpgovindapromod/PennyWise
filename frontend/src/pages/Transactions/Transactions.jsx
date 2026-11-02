import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { formatRupees, formatDate } from '../../services/currency';
import { 
  Search, 
  Plus, 
  SlidersHorizontal, 
  Download, 
  Coffee, 
  Compass, 
  Target, 
  ShoppingBag, 
  Laptop, 
  BookOpen, 
  Calendar, 
  Layers,
  FileSpreadsheet,
  FileText
} from 'lucide-react';

export default function Transactions({ onOpenAddExpense }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [page, setPage] = useState(1);
  const [summary, setSummary] = useState({
    settledCount: 0,
    pendingCount: 0,
    totalOutflowPaise: 0,
    totalInflowPaise: 0
  });

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await API.get('/transactions', {
        params: { limit: 100, page }
      });
      if (res.data?.data) {
        const txs = res.data.data.transactions || [];
        setTransactions(txs);

        if (res.data.data.summary) {
          // Use server-provided aggregate summary across the entire filtered dataset
          setSummary({
            settledCount: res.data.data.summary.settledCount ?? res.data.data.pagination?.total ?? txs.length,
            pendingCount: res.data.data.summary.pendingCount ?? 0,
            totalOutflowPaise: res.data.data.summary.totalOutflowPaise ?? 0,
            totalInflowPaise: res.data.data.summary.totalInflowPaise ?? 0
          });
        } else {
          // Graceful fallback if summary is not present
          let inflow = 0;
          let outflow = 0;
          txs.forEach(t => {
            if (t.type === 'income' || t.type === 'transfer_in') inflow += t.amountPaise;
            else if (t.type === 'expense' || t.type === 'transfer_out' || t.type === 'vault') outflow += t.amountPaise;
            else if (t.type === 'refund') outflow -= t.amountPaise;
          });

          setSummary({
            settledCount: res.data.data.pagination?.total ?? txs.length,
            pendingCount: 0,
            totalOutflowPaise: Math.max(0, outflow),
            totalInflowPaise: inflow
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page]);

  // Filter real-time records by search and active category tab
  const filtered = transactions.filter((tx) => {
    const matchesSearch = !search || 
      (tx.subcategory && tx.subcategory.toLowerCase().includes(search.toLowerCase())) ||
      (tx.note && tx.note.toLowerCase().includes(search.toLowerCase())) ||
      (tx.categoryLabel && tx.categoryLabel.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;
    if (activeTab === 'ALL') return true;
    if (activeTab === 'DINING') return tx.categoryId === 'food-drinks';
    if (activeTab === 'TRANSIT') return tx.categoryId === 'travel' || tx.categoryId === 'fuel';
    if (activeTab === 'GOAL') return tx.categoryId === 'vault' || tx.type === 'vault';
    if (activeTab === 'SUBSCRIPTIONS') return tx.categoryId === 'bills-utilities';
    if (activeTab === 'HOUSEHOLD') return tx.categoryId === 'household';
    if (activeTab === 'REVENUE') return tx.type === 'income';
    return true;
  });

  // Group real-time transactions by formatted date string
  const groupedByDay = filtered.reduce((groups, tx) => {
    const day = formatDate(tx.date);
    if (!groups[day]) {
      groups[day] = [];
    }
    groups[day].push(tx);
    return groups;
  }, {});

  return (
    <div className="stitch-container">
      {/* 1. Protocol Sub-Header Top Status */}
      <div className="ledger-proto-status">
        <div className="flex items-center gap-2">
          <span className="proto-pulse-dot" />
          <span>LEDGER CLEARANCE PROTOCOL · REAL-TIME AUDIT · LIVE MONGODB SYNC</span>
        </div>

        <div className="ledger-records-badge">
          <span className="ledger-records-pill">{summary.settledCount} RECORDS · SYNCED</span>
          <span className="ledger-live-badge">Live INR Ledger</span>
        </div>
      </div>

      {/* 2. Page Main Heading & Actions */}
      <div className="ledger-header-row">
        <div>
          <h1 className="ledger-main-heading">Transaction History & Financial Ledger</h1>
          <p className="ledger-sub-caption">
            Comprehensive multi-asset clearance ledger with zero-latency reconciliation and telemetry audit tracking.
          </p>
        </div>

        <div className="ledger-header-actions">
          <button className="btn-goals-outline">
            <Download size={13} /> Export CSV
          </button>
          <button className="btn-goals-outline">
            <SlidersHorizontal size={13} /> Filter & Sort
          </button>
          <button onClick={onOpenAddExpense} className="btn-goals-primary">
            <Plus size={14} /> Log New Entry
          </button>
        </div>
      </div>

      {/* 3. Trio Summary Cards */}
      <div className="ledger-summary-grid">
        <div className="ledger-stat-card">
          <div className="ledger-stat-top">
            <span>FILTERED RECORDS IN VIEW</span>
            <Layers size={13} color="#94A3B8" />
          </div>
          <div className="ledger-stat-count-wrap">
            <span className="ledger-stat-big-num">{filtered.length}</span>
            <span className="ledger-stat-tag-settled">settled</span>
          </div>
          <div className="ledger-stat-sub">
            <span className="proto-pulse-dot" /> Live database connection active
          </div>
        </div>

        <div className="ledger-stat-card">
          <div className="ledger-stat-top">
            <span>TOTAL OUTFLOW (EXPENSES)</span>
            <span className="ledger-pill-mtd">MTD</span>
          </div>
          <div className="ledger-stat-outflow-num">
            {formatRupees(summary.totalOutflowPaise)}
          </div>
          <div className="ledger-stat-sub text-secondary">
            Aggregated verified outlays
          </div>
        </div>

        <div className="ledger-stat-card">
          <div className="ledger-stat-top">
            <span>TOTAL INFLOW (CAPITAL & DEPOSITS)</span>
            <span className="ledger-pill-growth">Surplus</span>
          </div>
          <div className="ledger-stat-inflow-num">
            {formatRupees(summary.totalInflowPaise)}
          </div>
          <div className="ledger-stat-sub text-emerald">
            ▲ Realized liquid capital inflow
          </div>
        </div>
      </div>

      {/* 4. Controls Card (Search + Date Range + Category Tabs) */}
      <div className="ledger-controls-card">
        <div className="ledger-controls-top">
          <div className="ledger-search-box">
            <Search size={14} className="ledger-search-icon" />
            <input 
              type="text" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search merchant, memo, reference ID, or clearance protocol..." 
              className="ledger-search-input"
            />
          </div>

          <div className="ledger-date-cycle-btn">
            <Calendar size={13} color="#64748B" />
            <span>Current Ledger Cycle ▾</span>
          </div>
        </div>

        {/* Category Filter Pills Strip */}
        <div className="ledger-pills-strip">
          {[
            { id: 'ALL', label: 'All', count: transactions.length },
            { id: 'DINING', label: 'Dining & Food', count: transactions.filter(t => t.categoryId === 'food-drinks').length },
            { id: 'TRANSIT', label: 'Transit & Fuel', count: transactions.filter(t => t.categoryId === 'travel' || t.categoryId === 'fuel').length },
            { id: 'GOAL', label: 'Goals Deposit', count: transactions.filter(t => t.categoryId === 'vault' || t.type === 'vault').length },
            { id: 'SUBSCRIPTIONS', label: 'Subscriptions & Tech', count: transactions.filter(t => t.categoryId === 'bills-utilities').length },
            { id: 'HOUSEHOLD', label: 'Household & Bills', count: transactions.filter(t => t.categoryId === 'household').length },
            { id: 'REVENUE', label: 'Revenue & Freelance', count: transactions.filter(t => t.type === 'income').length }
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setActiveTab(pill.id)}
              className={activeTab === pill.id ? 'ledger-pill-btn ledger-pill-btn-active' : 'ledger-pill-btn'}
            >
              <span>{pill.label}</span>
              <span className={activeTab === pill.id ? 'ledger-count-bubble' : 'ledger-count-bubble-dark'}>
                {pill.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 5. Day-grouped Feed Card */}
      <div className="ledger-feed-surface">
        {loading ? (
          <div className="text-center py-12 text-secondary text-sm">
            Reconciling live database ledger records...
          </div>
        ) : Object.keys(groupedByDay).length === 0 ? (
          <div className="text-center py-12 text-secondary text-sm">
            No transaction records found matching your filters.
          </div>
        ) : (
          Object.keys(groupedByDay).map((dayKey) => {
            const dayItems = groupedByDay[dayKey];
            const netDayPaise = dayItems.reduce((acc, it) => it.type === 'income' ? acc + it.amountPaise : acc - it.amountPaise, 0);

            return (
              <div key={dayKey} className="ledger-day-group">
                <div className="ledger-day-header">
                  <div className="ledger-day-left">
                    <span className="ledger-day-title">{dayKey}</span>
                    <span className="ledger-day-badge">CLEARED</span>
                  </div>
                  <div className={netDayPaise >= 0 ? 'ledger-day-net text-emerald' : 'ledger-day-net text-rose'}>
                    {netDayPaise >= 0 ? `Daily Net Inflow: +${formatRupees(netDayPaise)}` : `Daily Net Outflow: −${formatRupees(Math.abs(netDayPaise))}`}
                  </div>
                </div>

                <div>
                  {dayItems.map((item) => {
                    const isIncome = item.type === 'income';
                    const isVault = item.type === 'vault';

                    return (
                      <div key={item._id} className="ledger-row-item">
                        <div className="ledger-row-left">
                          <div className={isIncome ? 'ledger-icon-box ledger-icon-income' : isVault ? 'ledger-icon-box ledger-icon-vault' : 'ledger-icon-box ledger-icon-expense'}>
                            {item.categoryId === 'food-drinks' ? <Coffee size={15} /> :
                             item.categoryId === 'travel' || item.categoryId === 'fuel' ? <Compass size={15} /> :
                             item.type === 'vault' ? <Target size={15} /> :
                             item.type === 'income' ? <Laptop size={15} /> :
                             item.categoryId === 'academic' ? <BookOpen size={15} /> :
                             <ShoppingBag size={15} />}
                          </div>

                          <div>
                            <div className="ledger-entity-name">
                              <span>{item.subcategory || item.categoryLabel}</span>
                              {item.categoryLabel && (
                                <span className={isIncome ? 'ledger-tag-pill tag-treasury' : isVault ? 'ledger-tag-pill tag-vault' : 'ledger-tag-pill'}>
                                  {item.categoryLabel}
                                </span>
                              )}
                            </div>

                            <div className="ledger-meta-chain">
                              <span>{item.note || 'Multi-channel settlement'}</span>
                              <span className="ledger-meta-dot" />
                              <span>{item.paymentMethod?.toUpperCase() || 'UPI / INSTANT'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="ledger-row-right">
                          <span className="ledger-row-time">
                            {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          
                          <div className="ledger-row-amount-wrap">
                            <div className={isIncome ? 'ledger-row-val-income' : isVault ? 'ledger-row-val-vault' : 'ledger-row-val-expense'}>
                              {isIncome ? '+' : '−'}{formatRupees(item.amountPaise)}
                            </div>
                            <div className="ledger-row-status-tag status-settled">
                              SETTLED
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}

        {/* 6. Pagination & Audit Footer */}
        <div className="ledger-pagination-bar">
          <div className="flex items-center gap-2">
            <span className="proto-pulse-dot" />
            <span>Displaying {filtered.length} of {transactions.length} database entries</span>
          </div>

          <div className="ledger-page-exports">
            <button className="ledger-export-btn">
              <FileSpreadsheet size={12} /> Detailed CSV
            </button>
            <button className="ledger-export-btn">
              <FileText size={12} /> Tax PDF
            </button>
          </div>
        </div>
      </div>

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
