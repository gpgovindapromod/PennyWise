import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { rupeesToPaise } from '../services/currency';
import { X, Check, AlertCircle, Loader2 } from 'lucide-react';

export default function AddExpenseModal({ isOpen, onClose, onSuccess, defaultAcademicFee = null }) {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('food-drinks');
  const [categoryLabel, setCategoryLabel] = useState('Food & Drinks');
  const [subcategory, setSubcategory] = useState('Tea with snacks');
  const [customItem, setCustomItem] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccessMsg('');
      API.get('/categories')
        .then((res) => {
          setCategories(res.data.data);
        })
        .catch(() => {});

      if (defaultAcademicFee) {
        setType('expense');
        setCategoryId('academic');
        setCategoryLabel('Academic Expenses');
        setSubcategory('College fees');
        setNote('Installment for: ' + defaultAcademicFee.title);
      }
    }
  }, [isOpen, defaultAcademicFee]);

  const activeCategory = categories.find((c) => c.id === categoryId);

  const handleCategoryChange = (e) => {
    const id = e.target.value;
    setCategoryId(id);
    const cat = categories.find((c) => c.id === id);
    if (cat) {
      setCategoryLabel(cat.label);
      if (cat.subcategories && cat.subcategories.length > 0) {
        setSubcategory(cat.subcategories[0]);
      } else {
        setSubcategory('General');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount greater than ₹0');
      return;
    }

    if (!date) {
      setError('Please select a transaction date');
      return;
    }

    const finalSubcategory = subcategory === '__custom__' ? customItem.trim() : subcategory;
    if (!finalSubcategory) {
      setError('Please specify an item name');
      return;
    }

    setIsSubmitting(true);

    try {
      const amountPaise = rupeesToPaise(amount);
      await API.post('/transactions', {
        type,
        amountPaise,
        categoryId,
        categoryLabel,
        subcategory: finalSubcategory,
        paymentMethod,
        date,
        note,
        academicFeeId: defaultAcademicFee ? defaultAcademicFee._id : null
      });

      setSuccessMsg('Transaction recorded successfully!');
      setTimeout(() => {
        setIsSubmitting(false);
        onSuccess && onSuccess();
        onClose();
      }, 400);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save transaction');
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Mobile Drag Indicator Handle */}
        <div style={{
          width: 36,
          height: 4,
          backgroundColor: '#CBD5E1',
          borderRadius: 2,
          margin: '0 auto 14px auto',
          display: 'block'
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 19, fontWeight: 800, color: '#0F172A', margin: 0 }}>
              {defaultAcademicFee ? 'Pay Fee Installment' : 'Log Pit Stop'}
            </h3>
            <p style={{ fontSize: 12, color: 'var(--color-chocolate-light)', marginTop: 2 }}>
              {defaultAcademicFee ? defaultAcademicFee.title : 'Record your expense or fuel'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#F1F5F9',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-chocolate)',
              width: 32,
              height: 32,
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', background: 'var(--color-expense-bg)', color: 'var(--color-expense)', borderRadius: 'var(--radius-md)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {successMsg && (
          <div style={{ padding: '10px 14px', background: 'var(--color-income-bg)', color: 'var(--color-income)', borderRadius: 'var(--radius-md)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Check size={16} /> {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!defaultAcademicFee && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16, background: 'var(--color-neutral-surface)', padding: 4, borderRadius: 'var(--radius-md)' }}>
              <button
                type="button"
                onClick={() => setType('expense')}
                style={{
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: 'none',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                  background: type === 'expense' ? 'var(--color-clean-white)' : 'transparent',
                  color: type === 'expense' ? 'var(--color-burgundy)' : 'var(--color-chocolate-light)',
                  boxShadow: type === 'expense' ? 'var(--shadow-subtle)' : 'none'
                }}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => { setType('income'); setCategoryId('allowance'); setCategoryLabel('Allowance / Pocket Money'); setSubcategory('Monthly allowance from home'); }}
                style={{
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: 'none',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                  background: type === 'income' ? 'var(--color-clean-white)' : 'transparent',
                  color: type === 'income' ? 'var(--color-income)' : 'var(--color-chocolate-light)',
                  boxShadow: type === 'income' ? 'var(--shadow-subtle)' : 'none'
                }}
              >
                Income
              </button>
              <button
                type="button"
                onClick={() => setType('refund')}
                style={{
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: 'none',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                  background: type === 'refund' ? 'var(--color-clean-white)' : 'transparent',
                  color: type === 'refund' ? 'var(--color-warm-orange)' : 'var(--color-chocolate-light)',
                  boxShadow: type === 'refund' ? 'var(--shadow-subtle)' : 'none'
                }}
              >
                Refund
              </button>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Amount in Rupees (₹)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: 10, fontSize: 16, color: 'var(--color-chocolate-light)', fontWeight: 600 }}>₹</span>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="form-input"
                style={{ paddingLeft: 32, fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-heading)' }}
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              value={categoryId}
              onChange={handleCategoryChange}
              className="form-select"
              disabled={!!defaultAcademicFee}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              {categoryId === 'food-drinks' ? 'Choose what you actually purchased' : 'Specific Item / Subcategory'}
            </label>
            {activeCategory && activeCategory.subcategories ? (
              <select
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="form-select"
              >
                {activeCategory.subcategories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
                <option value="__custom__">+ Custom specific item...</option>
              </select>
            ) : (
              <input
                type="text"
                placeholder="Item name"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="form-input"
              />
            )}
          </div>

          {subcategory === '__custom__' && (
            <div className="form-group">
              <label className="form-label">Enter custom item name</label>
              <input
                type="text"
                placeholder="e.g. Lime juice, Parotta, Record notebook"
                value={customItem}
                onChange={(e) => setCustomItem(e.target.value)}
                className="form-input"
              />
            </div>
          )}

          {/* Payment Method Selector */}
          <div className="form-group">
            <label className="form-label">Payment Method</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {[
                { id: 'upi', label: '⚡ UPI' },
                { id: 'cash', label: '💵 Cash' },
                { id: 'card', label: '💳 Card' }
              ].map((m) => {
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    style={{
                      padding: '10px 8px',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected ? '2px solid #E11D48' : '1px solid var(--color-border)',
                      backgroundColor: isSelected ? '#FFF1F2' : 'var(--color-clean-white)',
                      color: isSelected ? '#E11D48' : 'var(--color-chocolate)',
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: 13,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Note (Optional)</label>
              <input
                type="text"
                placeholder="Notes / details"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Saving...
                </>
              ) : (
                'Save Record'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}