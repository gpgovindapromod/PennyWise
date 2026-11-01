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

  // Summary Metrics State (Synced with Stitch design)
  const [summary, setSummary] = useState({
    settledCount: 142,
    pendingCount: 12,
    totalOutflowPaise: 3865000, // ₹38,650.00
    totalInflowPaise: 8420000   // ₹84,200.00
  });

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await API.get('/transactions', {
        params: { limit: 50, page }
      });
      if (res.data?.data?.transactions) {
        setTransactions(res.data.data.transactions);
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

  // Default Mock/Enriched list mirroring Stitch screenshot if database is empty or sparse
  const displayList = transactions.length > 0 ? transactions : [
    {
      _id: 'tx-1',
      date: '2026-11-18T08:42:00Z',
      subcategory: 'Blue Tokai Coffee Roasters',
      note: 'Cold Brew & Artisan Granola',
      categoryLabel: 'Dining',
      paymentMethod: 'UPI • HDFC Instant',
      amountPaise: 28000,
      type: 'expense',
      time: '08:42 AM',
      dayGroup: 'Today • Wednesday, 18 Nov 2026',
      status: 'SETTLED'
    },
    {
      _id: 'tx-2',
      date: '2026-11-18T08:10:00Z',
      subcategory: 'Mumbai Metro Rail',
      note: 'Line 3 Automated Fare Clearance',
      categoryLabel: 'Transit',
      paymentMethod: 'FastTag NFC',
      amountPaise: 4500,
      type: 'expense',
      time: '08:10 AM',
      dayGroup: 'Today • Wednesday, 18 Nov 2026',
      status: 'SETTLED'
    },
    {
      _id: 'tx-3',
      date: '2026-11-18T07:30:00Z',
      subcategory: 'Goal SIP Allocation',
      note: 'Goa Retreat & Travel Vault Deposit',
      categoryLabel: 'Goal Deposit',
      tag: 'TARGET VAULT',
      paymentMethod: 'Auto-Sweep NEFT',
      amountPaise: 75000,
      type: 'vault',
      time: '07:30 AM',
      dayGroup: 'Today • Wednesday, 18 Nov 2026',
      status: 'VAULTED'
    },
    {
      _id: 'tx-4',
      date: '2026-11-18T07:15:00Z',
      subcategory: 'Blinkit Quick Commerce',
      note: 'Almond Milk, Avocados, Mint',
      categoryLabel: 'Household',
      paymentMethod: 'UPI • ICICI',
      amountPaise: 14000,
      type: 'expense',
      time: '07:15 AM',
      dayGroup: 'Today • Wednesday, 18 Nov 2026',
      status: 'SETTLED'
    },
    {
      _id: 'tx-5',
      date: '2026-11-17T15:18:00Z',
      subcategory: 'Freelance UI Consultation',
      note: 'Design System Audit & Micro-benchmarks milestone',
      categoryLabel: 'Revenue',
      tag: 'Treasury Credit',
      paymentMethod: 'Direct Treasury NEFT',
      amountPaise: 2450000,
      type: 'income',
      time: '03:18 PM',
      dayGroup: 'Yesterday • Tuesday, 17 Nov 2026',
      status: 'CREDITED'
    },
    {
      _id: 'tx-6',
      date: '2026-11-17T19:20:00Z',
      subcategory: 'Crossword Book Depot',
      note: 'Nordic Architecture & System Design Monograph',
      categoryLabel: 'Academics',
      paymentMethod: 'Visa Platinum',
      amountPaise: 64000,
      type: 'expense',
      time: '07:20 PM',
      dayGroup: 'Yesterday • Tuesday, 17 Nov 2026',
      status: 'SETTLED'
    },
    {
      _id: 'tx-7',
      date: '2026-11-17T20:42:00Z',
      subcategory: 'Swiggy Gourmet',
      note: 'Sourdough Pizza & Kombucha',
      categoryLabel: 'Dining',
      paymentMethod: 'UPI • HDFC Instant',
      amountPaise: 30000,
      type: 'expense',
      time: '08:42 PM',
      dayGroup: 'Yesterday • Tuesday, 17 Nov 2026',
      status: 'SETTLED'
    },
    {
      _id: 'tx-8',
      date: '2026-11-16T06:00:00Z',
      subcategory: 'Apple Services',
      note: 'iCloud+ 2TB & Apple Music Family Tier',
      categoryLabel: 'Subscriptions',
      paymentMethod: 'Auto-Debit Card',
      amountPaise: 99000,
      type: 'expense',
      time: '06:00 AM',
      dayGroup: 'Monday, 16 Nov 2026',
      status: 'RECURRING'
    },
    {
      _id: 'tx-9',
      date: '2026-11-16T11:28:00Z',
      subcategory: 'Shell Fuel Station',
      note: 'XP95 Unleaded Fuel fill up',
      categoryLabel: 'Transit & Fuel',
      paymentMethod: 'UPI • ICICI',
      amountPaise: 80000,
      type: 'expense',
      time: '11:28 AM',
      dayGroup: 'Monday, 16 Nov 2026',
      status: 'SETTLED'
    }
  ];

  // Group by dayGroup
  const dayGroups = [
    {
      title: 'Today • Wednesday, 18 Nov 2026',
      badge: 'ACTIVE LEDGER',
      netOutflow: '−₹1,215.00',
      items: displayList.filter(i => (i.dayGroup || '').includes('18 Nov'))
    },
    {
      title: 'Yesterday • Tuesday, 17 Nov 2026',
      badge: null,
      netInflow: '+₹23,560.00',
      items: displayList.filter(i => (i.dayGroup || '').includes('17 Nov'))
    },
    {
      title: 'Monday, 16 Nov 2026',
      badge: null,
      netOutflow: '−₹1,890.00',
      items: displayList.filter(i => (i.dayGroup || '').includes('16 Nov'))
    }
  ];

  return (
    <div className="stitch-container">
      {/* 1. Protocol Sub-Header Top Status */}
      <div className="ledger-proto-status">
        <div className="flex items-center gap-2">
          <span className="proto-pulse-dot" />
          <span>LEDGER CLEARANCE PROTOCOL · REAL-TIME AUDIT · VAULT CYCLE 024-N</span>
        </div>

        <div className="ledger-records-badge">
          <span className="ledger-records-pill">142 RECORDS · SYNCED</span>
          <span className="ledger-live-badge">Live INR Ledger</span>
        </div>
      </div>

      {/* 2. Page Main Heading & Actions */}
      <div className="ledger-header-row">
        <div>
          <h1 className="ledger-main-heading">Transaction History & Financial Ledger</h1>
          <p className="ledger-sub-caption">
            Nordic multi-asset clearance ledger with zero-latency reconciliation and telemetry audit tracking.
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
        {/* Card 1: Filtered Records */}
        <div className="ledger-stat-card">
          <div className="ledger-stat-top">
            <span>FILTERED RECORDS IN VIEW</span>
            <Layers size={13} color="#94A3B8" />
          </div>
          <div className="ledger-stat-count-wrap">
            <span className="ledger-stat-big-num">{summary.settledCount}</span>
            <span className="ledger-stat-tag-settled">settled</span>
          </div>
          <div className="ledger-stat-sub">
            <span className="proto-pulse-dot" /> {summary.pendingCount} pending batch settlement protocol
          </div>
        </div>

        {/* Card 2: Total Outflow */}
        <div className="ledger-stat-card">
          <div className="ledger-stat-top">
            <span>TOTAL OUTFLOW (EXPENSES)</span>
            <span className="ledger-pill-mtd">MTD</span>
          </div>
          <div className="ledger-stat-outflow-num">
            {formatRupees(summary.totalOutflowPaise)}
          </div>
          <div className="ledger-stat-sub text-secondary">
            Avg burn ₹1,288/day · 32 days run rate
          </div>
        </div>

        {/* Card 3: Total Inflow */}
        <div className="ledger-stat-card">
          <div className="ledger-stat-top">
            <span>TOTAL INFLOW (CAPITAL & DEPOSITS)</span>
            <span className="ledger-pill-growth">+18.2%</span>
          </div>
          <div className="ledger-stat-inflow-num">
            {formatRupees(summary.totalInflowPaise)}
          </div>
          <div className="ledger-stat-sub text-emerald">
            ▲ +18.2% surplus rate against target
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
            <span>Nov 2026 (Current Cycle) ▾</span>
          </div>
        </div>

        {/* Category Filter Pills Strip */}
        <div className="ledger-pills-strip">
          {[
            { id: 'ALL', label: 'All', count: 142 },
            { id: 'DINING', label: 'Dining & Food', count: 42 },
            { id: 'TRANSIT', label: 'Transit & Fuel', count: 24 },
            { id: 'GOAL', label: 'Goals Deposit', count: 18 },
            { id: 'SUBSCRIPTIONS', label: 'Subscriptions & Tech', count: 22 },
            { id: 'HOUSEHOLD', label: 'Household & Bills', count: 16 },
            { id: 'REVENUE', label: 'Revenue & Freelance', count: 8 }
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
        {dayGroups.map((group, gIdx) => (
          <div key={gIdx} className="ledger-day-group">
            <div className="ledger-day-header">
              <div className="ledger-day-left">
                <span className="ledger-day-title">{group.title}</span>
                {group.badge && <span className="ledger-day-badge">{group.badge}</span>}
              </div>
              <div className={group.netInflow ? 'ledger-day-net text-emerald' : 'ledger-day-net text-rose'}>
                {group.netInflow ? `Daily Net Inflow: ${group.netInflow}` : `Daily Net Outflow: ${group.netOutflow}`}
              </div>
            </div>

            {/* List items for this day */}
            <div>
              {group.items.map((item) => {
                const isIncome = item.type === 'income';
                const isVault = item.type === 'vault';

                return (
                  <div key={item._id} className="ledger-row-item">
                    {/* Left: Icon + Entity Details */}
                    <div className="ledger-row-left">
                      <div className={isIncome ? 'ledger-icon-box ledger-icon-income' : isVault ? 'ledger-icon-box ledger-icon-vault' : 'ledger-icon-box ledger-icon-expense'}>
                        {item.categoryLabel === 'Dining' ? <Coffee size={15} /> :
                         item.categoryLabel === 'Transit' || item.categoryLabel === 'Transit & Fuel' ? <Compass size={15} /> :
                         item.categoryLabel === 'Goal Deposit' ? <Target size={15} /> :
                         item.categoryLabel === 'Revenue' ? <Laptop size={15} /> :
                         item.categoryLabel === 'Academics' ? <BookOpen size={15} /> :
                         <ShoppingBag size={15} />}
                      </div>

                      <div>
                        <div className="ledger-entity-name">
                          <span>{item.subcategory}</span>
                          {item.tag && (
                            <span className={item.tag === 'Treasury Credit' ? 'ledger-tag-pill tag-treasury' : 'ledger-tag-pill tag-vault'}>
                              {item.tag}
                            </span>
                          )}
                        </div>

                        <div className="ledger-meta-chain">
                          <span>{item.note}</span>
                          <span className="ledger-meta-dot" />
                          <span>{item.categoryLabel}</span>
                          <span className="ledger-meta-dot" />
                          <span>{item.paymentMethod}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Timestamp & Financial Amount */}
                    <div className="ledger-row-right">
                      <span className="ledger-row-time">{item.time}</span>
                      
                      <div className="ledger-row-amount-wrap">
                        <div className={isIncome ? 'ledger-row-val-income' : isVault ? 'ledger-row-val-vault' : 'ledger-row-val-expense'}>
                          {isIncome ? '+' : '−'}{formatRupees(item.amountPaise)}
                        </div>
                        <div className={
                          item.status === 'SETTLED' ? 'ledger-row-status-tag status-settled' :
                          item.status === 'CREDITED' ? 'ledger-row-status-tag status-credited' :
                          item.status === 'VAULTED' ? 'ledger-row-status-tag status-vaulted' :
                          'ledger-row-status-tag status-recurring'
                        }>
                          {item.status}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* 6. Pagination & Audit Footer */}
        <div className="ledger-pagination-bar">
          <div className="flex items-center gap-2">
            <span className="proto-pulse-dot" />
            <span>Displaying 9 of 142 cleared transactions • Paging protocol 1-20</span>
          </div>

          <div className="ledger-page-btn-group">
            <button className="ledger-page-btn">Previous</button>
            <button className="ledger-page-btn ledger-page-btn-active">1</button>
            <button className="ledger-page-btn">2</button>
            <button className="ledger-page-btn">3</button>
            <span className="px-1 text-muted">...</span>
            <button className="ledger-page-btn">15</button>
            <button className="ledger-page-btn">Next</button>
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
