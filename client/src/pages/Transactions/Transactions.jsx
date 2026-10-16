import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { formatRupees, formatDate } from '../../services/currency';
import { Search, Filter, Trash2, PlusCircle, AlertCircle } from 'lucide-react';

export default function Transactions({ onOpenAddExpense }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [type, setType] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [categories, setCategories] = useState([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await API.get('/transactions', {
        params: { search, category, type, page, limit: 15 }
      });
      setTransactions(res.data.data.transactions);
      setPagination(res.data.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    API.get('/categories')
      .then((res) => setCategories(res.data.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [category, type, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/transactions/${id}`);
      setDeleteConfirmId(null);
      fetchTransactions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete transaction');
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, color: 'var(--color-burgundy)' }}>Transactions</h1>
          <p style={{ fontSize: 13, color: 'var(--color-chocolate-light)' }}>
            Search, filter, and inspect your full income and expense log
          </p>
        </div>
        <button onClick={onOpenAddExpense} className="btn btn-primary">
          <PlusCircle size={16} /> Add Expense
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="card" style={{ marginBottom: 20, padding: '16px 20px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr auto', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--color-chocolate-light)' }} />
            <input
              type="text"
              placeholder="Search by item, note, or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ paddingLeft: 36 }}
            />
          </div>

          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="form-select"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>

          <select
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(1); }}
            className="form-select"
          >
            <option value="all">All Types</option>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
            <option value="refund">Refund</option>
          </select>

          <button type="submit" className="btn btn-secondary">
            Search
          </button>
        </form>
      </div>

      {/* Transactions Table / List */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-chocolate-light)' }}>
            Loading transactions...
          </div>
        ) : transactions.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--color-chocolate-light)' }}>
            No transactions found matching your criteria.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
            <thead>
              <tr style={{ background: 'var(--color-neutral-surface)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-chocolate-light)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <th style={{ padding: '12px 18px' }}>Date</th>
                <th style={{ padding: '12px 18px' }}>Item / Description</th>
                <th style={{ padding: '12px 18px' }}>Category</th>
                <th style={{ padding: '12px 18px' }}>Account</th>
                <th style={{ padding: '12px 18px', textAlign: 'right' }}>Amount</th>
                <th style={{ padding: '12px 18px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx._id} style={{ borderBottom: '1px solid var(--color-border-subtle)', transition: 'background-color 0.1s ease' }}>
                  <td style={{ padding: '14px 18px', color: 'var(--color-chocolate-light)', whiteSpace: 'nowrap' }}>
                    {formatDate(tx.date)}
                  </td>
                  <td style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--color-chocolate)' }}>
                    <div>{tx.subcategory}</div>
                    {tx.note && (
                      <div style={{ fontSize: 12, fontWeight: 400, color: 'var(--color-chocolate-light)' }}>
                        {tx.note}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '14px 18px', color: 'var(--color-chocolate)' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 12,
                      background: tx.categoryId === 'academic' ? 'var(--color-baby-pink)' : (tx.categoryId === 'food-drinks' ? 'var(--color-cream)' : 'var(--color-neutral-surface)')
                    }}>
                      {tx.categoryLabel}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', color: 'var(--color-chocolate-light)', fontSize: 13 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>{tx.accountId?.name || 'Cash in Hand'}</span>
                      <span style={{
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '2px 6px',
                        borderRadius: 4,
                        backgroundColor: tx.paymentMethod === 'upi' ? '#EFF6FF' : (tx.paymentMethod === 'card' ? '#F5F3FF' : '#F1F5F9'),
                        color: tx.paymentMethod === 'upi' ? '#2563EB' : (tx.paymentMethod === 'card' ? '#7C3AED' : '#475569')
                      }}>
                        {tx.paymentMethod ? tx.paymentMethod.toUpperCase() : 'UPI'}
                      </span>
                    </div>
                  </td>
                  <td style={{
                    padding: '14px 18px',
                    textAlign: 'right',
                    fontWeight: 700,
                    fontFamily: 'var(--font-heading)',
                    fontSize: 16,
                    color: tx.type === 'income' ? 'var(--color-income)' : (tx.type === 'refund' ? 'var(--color-warm-orange)' : 'var(--color-chocolate)')
                  }}>
                    {tx.type === 'income' ? '+' : (tx.type === 'refund' ? '+' : '−')}
                    {formatRupees(tx.amountPaise)}
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                    {deleteConfirmId === tx._id ? (
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                        <button
                          onClick={() => handleDelete(tx._id)}
                          style={{ padding: '4px 8px', fontSize: 11, background: 'var(--color-expense)', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          style={{ padding: '4px 8px', fontSize: 11, background: 'var(--color-neutral-surface)', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(tx._id)}
                        title="Delete record"
                        style={{ background: 'none', border: 'none', color: 'var(--color-chocolate-light)', cursor: 'pointer', padding: 4 }}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination Footer */}
        {pagination.pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', background: 'var(--color-neutral-surface)', borderTop: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: 13, color: 'var(--color-chocolate-light)' }}>
              Page {pagination.page} of {pagination.pages} ({pagination.total} records total)
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: 12 }}
              >
                Previous
              </button>
              <button
                disabled={page >= pagination.pages}
                onClick={() => setPage(p => p + 1)}
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: 12 }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}