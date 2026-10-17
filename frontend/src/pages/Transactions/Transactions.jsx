import React, { useState, useEffect, useRef, useCallback } from 'react';
import API from '../../services/api';
import { formatRupees, formatDate } from '../../services/currency';
import { 
  Search, 
  Trash2, 
  PlusCircle, 
  Receipt, 
  Calendar, 
  CreditCard,
  TrendingDown,
  TrendingUp,
  RotateCcw,
  BookOpen,
  Utensils,
  Fuel,
  Bus,
  ShoppingBag,
  Zap,
  HeartPulse,
  Film,
  Smile,
  Wallet,
  Sparkles,
  Loader2,
  CheckCircle2,
  SlidersHorizontal,
  X,
  Download,
  FileSpreadsheet,
  Edit2
} from 'lucide-react';

export default function Transactions({ onOpenAddExpense, onEditTransaction }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [type, setType] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [categories, setCategories] = useState([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const observer = useRef();
  const searchTimeoutRef = useRef();

  // Fetch Categories once
  useEffect(() => {
    API.get('/categories')
      .then((res) => setCategories(res.data.data))
      .catch(() => {});
  }, []);

  // Fetch Transactions with pagination & infinite scroll
  const fetchTransactionsData = async (pageNum, isAppend = false) => {
    if (isAppend) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await API.get('/transactions', {
        params: {
          search: search.trim(),
          category,
          type,
          startDate,
          endDate,
          sortBy,
          sortOrder,
          page: pageNum,
          limit: 15
        }
      });

      const { transactions: newItems, pagination } = res.data.data;

      if (isAppend) {
        setTransactions((prev) => [...prev, ...newItems]);
      } else {
        setTransactions(newItems);
      }

      setTotalCount(pagination.total);
      setHasMore(pagination.page < pagination.pages);
      setPage(pagination.page);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Re-fetch from page 1 whenever filters change
  useEffect(() => {
    setPage(1);
    fetchTransactionsData(1, false);
  }, [category, type, startDate, endDate, sortBy, sortOrder]);

  // Debounced search
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setPage(1);
      fetchTransactionsData(1, false);
    }, 350);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    setPage(1);
    fetchTransactionsData(1, false);
  };

  // Intersection Observer for Infinite Scroll trigger
  const lastTransactionElementRef = useCallback((node) => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        setPage((prevPage) => {
          const nextPage = prevPage + 1;
          fetchTransactionsData(nextPage, true);
          return nextPage;
        });
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore]);

  const handleDelete = async (id) => {
    try {
      await API.delete(`/transactions/${id}`);
      setDeleteConfirmId(null);
      setTransactions((prev) => prev.filter((t) => t._id !== id));
      setTotalCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete transaction');
    }
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('all');
    setType('all');
    setStartDate('');
    setEndDate('');
    setSortBy('date');
    setSortOrder('desc');
  };

  // Export filtered transactions to CSV
  const [exporting, setExporting] = useState(false);
  const handleExportCsv = async () => {
    setExporting(true);
    try {
      // Fetch all matching records without pagination limit
      const res = await API.get('/transactions', {
        params: {
          search: search.trim(),
          category,
          type,
          startDate,
          endDate,
          sortBy,
          sortOrder,
          page: 1,
          limit: 10000
        }
      });

      const records = res.data.data?.transactions || transactions;
      if (!records || records.length === 0) {
        alert('No transactions found to export.');
        return;
      }

      // Build CSV headers and rows
      const headers = ['Date', 'Type', 'Category', 'Subcategory / Item', 'Amount (INR)', 'Payment Method', 'Note'];
      const rows = records.map((t) => [
        `"${new Date(t.date).toISOString().split('T')[0]}"`,
        `"${t.type.toUpperCase()}"`,
        `"${t.categoryLabel || t.categoryId}"`,
        `"${(t.subcategory || '').replace(/"/g, '""')}"`,
        (t.amountPaise / 100).toFixed(2),
        `"${(t.paymentMethod || 'upi').toUpperCase()}"`,
        `"${(t.note || '').replace(/"/g, '""')}"`
      ]);

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      const dateStr = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `PennyWise_Transactions_${dateStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to generate CSV export.');
    } finally {
      setExporting(false);
    }
  };

  const hasActiveFilters = category !== 'all' || type !== 'all' || startDate || endDate || search;

  // Icon mapping helper
  const getCategoryIcon = (catId) => {
    switch (catId) {
      case 'food-drinks': return <Utensils size={15} color="#E11D48" />;
      case 'academic': return <BookOpen size={15} color="#2563EB" />;
      case 'fuel': return <Fuel size={15} color="#D97706" />;
      case 'travel': return <Bus size={15} color="#059669" />;
      case 'shopping': return <ShoppingBag size={15} color="#7C3AED" />;
      case 'bills-utilities': return <Zap size={15} color="#EA580C" />;
      case 'health': return <HeartPulse size={15} color="#E11D48" />;
      case 'entertainment': return <Film size={15} color="#8B5CF6" />;
      default: return <Receipt size={15} color="#64748B" />;
    }
  };

  // Quick summary calculations from loaded set
  const totalExpensePaise = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amountPaise, 0);
  const totalIncomePaise = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amountPaise, 0);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px 80px 24px' }}>
      
      {/* 1. Header Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              padding: '2px 8px',
              borderRadius: 4,
              backgroundColor: '#FFE4E6',
              color: '#E11D48'
            }}>
              <Receipt size={12} /> GENERAL LEDGER
            </span>
            <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>
              {totalCount} Total Entries
            </span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
            Transaction History
          </h1>
          <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0 0' }}>
            Search, filter, and inspect your full cash-flow records with continuous infinite stream
          </p>
        </div>

        <div className="page-header-actions" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={handleExportCsv}
            disabled={exporting || transactions.length === 0}
            className="btn btn-secondary"
            title="Download full filtered ledger as Excel/CSV"
            style={{
              padding: '10px 15px',
              fontSize: 13,
              fontWeight: 700,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              color: '#334155',
              cursor: exporting ? 'wait' : 'pointer'
            }}
          >
            <Download size={15} color="#2563EB" />
            <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
          </button>

          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="btn btn-secondary"
            style={{
              padding: '10px 16px',
              fontSize: 13,
              fontWeight: 700,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              background: showAdvancedFilters ? '#F1F5F9' : '#FFFFFF'
            }}
          >
            <SlidersHorizontal size={15} />
            <span>{showAdvancedFilters ? 'Hide Filters' : 'Filter & Sort'}</span>
          </button>

          <button
            onClick={onOpenAddExpense}
            className="btn btn-primary"
            style={{
              padding: '10px 18px',
              fontSize: 13,
              fontWeight: 700,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: 'pointer'
            }}
          >
            <PlusCircle size={16} /> Add Transaction / Fuel
          </button>
        </div>
      </div>

      {/* 2. Structured Top KPI Stats Cards Row (Organized Grid) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 16,
        marginBottom: 24
      }}>
        {/* Card 1: Records In View */}
        <div className="card" style={{
          background: '#FFFFFF',
          borderRadius: 16,
          padding: '20px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#64748B', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Matching Records
              </div>
              <div style={{ fontSize: 26, fontWeight: 900, fontFamily: 'var(--font-heading)', color: '#0F172A', marginTop: 4 }}>
                {totalCount}
              </div>
            </div>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              backgroundColor: '#EFF6FF',
              color: '#3B82F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Receipt size={18} />
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 10 }}>
            Showing {transactions.length} loaded records
          </div>
        </div>

        {/* Card 2: Filtered Outflow */}
        <div className="card" style={{
          background: '#FFFFFF',
          borderRadius: 16,
          padding: '20px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#E11D48', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Loaded Outflow (Expenses)
              </div>
              <div style={{ fontSize: 26, fontWeight: 900, fontFamily: 'var(--font-heading)', color: '#0F172A', marginTop: 4 }}>
                {formatRupees(totalExpensePaise)}
              </div>
            </div>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              backgroundColor: '#FFE4E6',
              color: '#E11D48',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TrendingDown size={18} />
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 10 }}>
            Cumulative expenditure in current filter
          </div>
        </div>

        {/* Card 3: Filtered Inflow */}
        <div className="card" style={{
          background: '#FFFFFF',
          borderRadius: 16,
          padding: '20px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#059669', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Loaded Inflow (Income)
              </div>
              <div style={{ fontSize: 26, fontWeight: 900, fontFamily: 'var(--font-heading)', color: '#0F172A', marginTop: 4 }}>
                +{formatRupees(totalIncomePaise)}
              </div>
            </div>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              backgroundColor: '#DCFCE7',
              color: '#15803D',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 10 }}>
            Allowances, gifts, and grants
          </div>
        </div>
      </div>

      {/* 3. Filter Navigation Pills (Similar to Academics section) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
        overflowX: 'auto',
        paddingBottom: 4
      }}>
        {[
          { id: 'all', label: 'All Transactions' },
          { id: 'expense', label: 'Expenses Only' },
          { id: 'income', label: 'Income & Allowance' },
          { id: 'refund', label: 'Refunds' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setType(tab.id)}
            style={{
              padding: '7px 16px',
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 700,
              border: type === tab.id ? '1px solid #E11D48' : '1px solid #E2E8F0',
              backgroundColor: type === tab.id ? '#E11D48' : '#FFFFFF',
              color: type === tab.id ? '#FFFFFF' : '#475569',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4. Search and Filter Bar Card */}
      <div className="card" style={{
        background: '#FFFFFF',
        borderRadius: 20,
        border: '1px solid #E2E8F0',
        padding: '20px',
        marginBottom: 20,
        boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)'
      }}>
        <form onSubmit={handleSearchSubmit}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr)) auto',
            gap: 12,
            alignItems: 'center'
          }}>
            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 14, top: 13, color: '#94A3B8' }} />
              <input
                type="text"
                placeholder="Search by item, note, or shop..."
                value={search}
                onChange={handleSearchChange}
                className="form-input"
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 38px',
                  borderRadius: 10,
                  border: '1.5px solid #CBD5E1',
                  fontSize: 13,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Category Filter */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="form-select"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 10,
                border: '1.5px solid #CBD5E1',
                fontSize: 13,
                outline: 'none',
                boxSizing: 'border-box',
                backgroundColor: '#FFFFFF'
              }}
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>

            {/* Sort Order */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-');
                setSortBy(sb);
                setSortOrder(so);
              }}
              className="form-select"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 10,
                border: '1.5px solid #CBD5E1',
                fontSize: 13,
                outline: 'none',
                boxSizing: 'border-box',
                backgroundColor: '#FFFFFF'
              }}
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="btn btn-secondary"
                style={{
                  padding: '10px 14px',
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  color: '#E11D48'
                }}
              >
                <X size={14} /> Clear
              </button>
            )}
          </div>

          {/* Advanced Date Range Pickers (Expandable) */}
          {showAdvancedFilters && (
            <div style={{
              marginTop: 16,
              paddingTop: 16,
              borderTop: '1px solid #F1F5F9',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 12
            }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 4 }}>
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="form-input"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 4 }}>
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="form-input"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                />
              </div>
            </div>
          )}
        </form>
      </div>

      {/* 5. Responsive Transaction List & Infinite Scroll Card */}
      <div className="card" style={{
        background: '#FFFFFF',
        borderRadius: 20,
        border: '1px solid #E2E8F0',
        padding: 0,
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)'
      }}>
        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748B' }}>
            <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 12px auto', color: '#E11D48' }} />
            <div style={{ fontSize: 14, fontWeight: 700 }}>Loading transactions...</div>
          </div>
        ) : transactions.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748B' }}>
            <Receipt size={40} color="#CBD5E1" style={{ margin: '0 auto 12px auto' }} />
            <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>No transactions found</div>
            <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
              Try adjusting your search criteria or record a new transaction above.
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="btn btn-secondary"
                style={{ marginTop: 16, fontSize: 12, padding: '8px 16px' }}
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          <div>
            {/* Desktop Table Header */}
            <div className="desktop-only" style={{
              display: 'grid',
              gridTemplateColumns: '120px 1.8fr 1.2fr 140px 140px 60px',
              padding: '14px 20px',
              background: '#F8FAFC',
              borderBottom: '1px solid #E2E8F0',
              fontSize: 11,
              fontWeight: 800,
              color: '#64748B',
              textTransform: 'uppercase',
              letterSpacing: '0.06em'
            }}>
              <div>Date</div>
              <div>Item & Description</div>
              <div>Category</div>
              <div>Account / Method</div>
              <div style={{ textAlign: 'right' }}>Amount</div>
              <div style={{ textAlign: 'center' }}>Action</div>
            </div>

            {/* Transaction Items */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {transactions.map((tx, index) => {
                const isLastItem = index === transactions.length - 1;
                const isIncome = tx.type === 'income';
                const isRefund = tx.type === 'refund';

                return (
                  <div
                    key={tx._id}
                    ref={isLastItem ? lastTransactionElementRef : null}
                    style={{
                      padding: '16px 20px',
                      borderBottom: '1px solid #F1F5F9',
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    {/* Desktop View Row */}
                    <div className="desktop-only" style={{
                      display: 'grid',
                      gridTemplateColumns: '120px 1.8fr 1.2fr 140px 140px 60px',
                      alignItems: 'center'
                    }}>
                      <div style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>
                        {formatDate(tx.date)}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 34,
                          height: 34,
                          borderRadius: 10,
                          backgroundColor: isIncome ? '#DCFCE7' : '#F1F5F9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {getCategoryIcon(tx.categoryId)}
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
                            {tx.subcategory}
                          </div>
                          {tx.note && (
                            <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                              {tx.note}
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '3px 10px',
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 700,
                          backgroundColor: '#F8FAFC',
                          color: '#334155',
                          border: '1px solid #E2E8F0'
                        }}>
                          {tx.categoryLabel}
                        </span>
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 13, color: '#475569', fontWeight: 600 }}>
                            {tx.accountId?.name || 'Cash Wallet'}
                          </span>
                          <span style={{
                            fontSize: 10,
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            padding: '2px 6px',
                            borderRadius: 4,
                            backgroundColor: tx.paymentMethod === 'upi' ? '#EFF6FF' : (tx.paymentMethod === 'card' ? '#F5F3FF' : '#F1F5F9'),
                            color: tx.paymentMethod === 'upi' ? '#2563EB' : (tx.paymentMethod === 'card' ? '#7C3AED' : '#475569')
                          }}>
                            {tx.paymentMethod ? tx.paymentMethod.toUpperCase() : 'UPI'}
                          </span>
                        </div>
                      </div>

                      <div style={{
                        textAlign: 'right',
                        fontSize: 16,
                        fontWeight: 900,
                        fontFamily: 'var(--font-heading)',
                        color: isIncome ? '#15803D' : (isRefund ? '#D97706' : '#0F172A')
                      }}>
                        {isIncome ? '+' : (isRefund ? '+' : '−')}
                        {formatRupees(tx.amountPaise)}
                      </div>

                      <div style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <button
                          onClick={() => onEditTransaction && onEditTransaction(tx)}
                          title="Edit transaction"
                          style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: 4 }}
                        >
                          <Edit2 size={15} />
                        </button>

                        {deleteConfirmId === tx._id ? (
                          <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                            <button
                              onClick={() => handleDelete(tx._id)}
                              style={{ padding: '3px 8px', fontSize: 11, background: '#E11D48', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 700 }}
                            >
                              Del
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              style={{ padding: '3px 6px', fontSize: 11, background: '#F1F5F9', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(tx._id)}
                            title="Delete transaction"
                            style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 4 }}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Mobile Ergonomic Card Layout */}
                    <div style={{ display: 'none' }} className="mobile-only-block">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            backgroundColor: isIncome ? '#DCFCE7' : '#F1F5F9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {getCategoryIcon(tx.categoryId)}
                          </div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A' }}>{tx.subcategory}</div>
                            <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>{formatDate(tx.date)} · {tx.categoryLabel}</div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{
                            fontSize: 16,
                            fontWeight: 900,
                            fontFamily: 'var(--font-heading)',
                            color: isIncome ? '#15803D' : (isRefund ? '#D97706' : '#0F172A')
                          }}>
                            {isIncome ? '+' : (isRefund ? '+' : '−')}
                            {formatRupees(tx.amountPaise)}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
                            <span style={{ fontSize: 10, color: '#64748B', fontWeight: 600 }}>
                              {tx.paymentMethod ? tx.paymentMethod.toUpperCase() : 'UPI'}
                            </span>
                            <button
                              onClick={() => onEditTransaction && onEditTransaction(tx)}
                              style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: 2 }}
                              title="Edit"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleDelete(tx._id)}
                              style={{ background: 'none', border: 'none', color: '#E11D48', cursor: 'pointer', padding: 2 }}
                              title="Delete"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Infinite Scroll Loading Indicator */}
            {loadingMore && (
              <div style={{ padding: '20px', textAlign: 'center', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Loader2 size={18} className="animate-spin" color="#E11D48" />
                <span style={{ fontSize: 13, fontWeight: 600 }}>Loading more transactions...</span>
              </div>
            )}

            {!hasMore && transactions.length > 0 && (
              <div style={{ padding: '20px', textAlign: 'center', color: '#94A3B8', fontSize: 12, background: '#F8FAFC', borderTop: '1px solid #F1F5F9' }}>
                All {totalCount} transactions loaded
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}