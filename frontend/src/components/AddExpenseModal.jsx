import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { rupeesToPaise } from '../services/currency';
import { 
  X, 
  Check, 
  AlertCircle, 
  Loader2, 
  TrendingDown, 
  TrendingUp, 
  RotateCcw,
  Fuel,
  Sparkles,
  Calendar,
  FileText
} from 'lucide-react';

export default function AddExpenseModal({ isOpen, onClose, onExpenseAdded, defaultAcademicFee = null, editingTransaction = null }) {
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

      if (editingTransaction) {
        setType(editingTransaction.type || 'expense');
        setAmount((editingTransaction.amountPaise / 100).toString());
        setCategoryId(editingTransaction.categoryId || 'food-drinks');
        setCategoryLabel(editingTransaction.categoryLabel || 'Food & Drinks');
        setSubcategory(editingTransaction.subcategory || '');
        setPaymentMethod(editingTransaction.paymentMethod || 'upi');
        setDate(editingTransaction.date ? new Date(editingTransaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
        setNote(editingTransaction.note || '');
      } else if (defaultAcademicFee) {
        setType('expense');
        setCategoryId('academic');
        setCategoryLabel('Academic Expenses');
        setSubcategory('College fees');
        setNote('Installment for: ' + defaultAcademicFee.title);
        setAmount('');
      } else {
        setAmount('');
        setNote('');
        setCustomItem('');
      }
    }
  }, [isOpen, defaultAcademicFee, editingTransaction]);

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
      const payload = {
        type,
        amountPaise,
        categoryId,
        categoryLabel,
        subcategory: finalSubcategory,
        paymentMethod,
        date,
        note
      };

      if (editingTransaction) {
        await API.patch(`/transactions/${editingTransaction._id}`, payload);
      } else {
        await API.post('/transactions', payload);
      }

      setSuccessMsg(editingTransaction ? 'Updated successfully!' : 'Saved successfully!');
      setTimeout(() => {
        setIsSubmitting(false);
        setAmount('');
        setNote('');
        setCustomItem('');
        onExpenseAdded();
        onClose();
      }, 700);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save transaction');
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content transaction-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Mobile Drag Indicator Handle */}
        <div className="modal-drag-handle" />

        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
                {editingTransaction ? 'Edit Transaction' : (defaultAcademicFee ? 'Pay Fee Installment' : 'New Transaction')}
              </h3>
            </div>
            <p style={{ fontSize: 12, color: '#64748B', margin: '3px 0 0 0' }}>
              {editingTransaction ? `Updating entry #${editingTransaction._id.slice(-6)}` : (defaultAcademicFee ? defaultAcademicFee.title : 'Record expense, fuel, or income')}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="modal-close-btn"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{
            padding: '10px 14px',
            background: '#FFF1F2',
            color: '#E11D48',
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 16,
            border: '1px solid #FECDD3'
          }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {successMsg && (
          <div style={{
            padding: '10px 14px',
            background: '#ECFDF5',
            color: '#065F46',
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 16,
            border: '1px solid #A7F3D0'
          }}>
            <Check size={16} /> {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* 1. Transaction Type Segmented Toggle */}
          {!defaultAcademicFee && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 6,
              marginBottom: 18,
              background: '#F1F5F9',
              padding: 4,
              borderRadius: 14
            }}>
              <button
                type="button"
                onClick={() => setType('expense')}
                style={{
                  padding: '9px 10px',
                  borderRadius: 10,
                  border: 'none',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  background: type === 'expense' ? '#FFFFFF' : 'transparent',
                  color: type === 'expense' ? '#E11D48' : '#64748B',
                  boxShadow: type === 'expense' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  transition: 'all 0.15s ease'
                }}
              >
                <TrendingDown size={14} /> Expense
              </button>

              <button
                type="button"
                onClick={() => {
                  setType('income');
                  setCategoryId('allowance');
                  setCategoryLabel('Allowance / Pocket Money');
                  setSubcategory('Monthly allowance from home');
                }}
                style={{
                  padding: '9px 10px',
                  borderRadius: 10,
                  border: 'none',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  background: type === 'income' ? '#FFFFFF' : 'transparent',
                  color: type === 'income' ? '#059669' : '#64748B',
                  boxShadow: type === 'income' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  transition: 'all 0.15s ease'
                }}
              >
                <TrendingUp size={14} /> Income
              </button>

              <button
                type="button"
                onClick={() => setType('refund')}
                style={{
                  padding: '9px 10px',
                  borderRadius: 10,
                  border: 'none',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  background: type === 'refund' ? '#FFFFFF' : 'transparent',
                  color: type === 'refund' ? '#D97706' : '#64748B',
                  boxShadow: type === 'refund' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  transition: 'all 0.15s ease'
                }}
              >
                <RotateCcw size={14} /> Refund
              </button>
            </div>
          )}

          {/* 2. Amount Input Hero Box */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
              Amount
            </label>
            <div style={{
              position: 'relative',
              background: '#F8FAFC',
              borderRadius: 16,
              border: '1.5px solid #E2E8F0',
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
            }}>
              <span style={{
                position: 'absolute',
                left: 18,
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: 22,
                color: type === 'income' ? '#059669' : '#E11D48',
                fontWeight: 900
              }}>
                ₹
              </span>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 18px 14px 44px',
                  fontSize: 28,
                  fontWeight: 900,
                  fontFamily: 'var(--font-heading)',
                  color: '#0F172A',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                autoFocus
              />
            </div>
          </div>

          {/* 3. Category Dropdown */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
              Category
            </label>
            <select
              value={categoryId}
              onChange={handleCategoryChange}
              disabled={!!defaultAcademicFee}
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: 12,
                border: '1.5px solid #CBD5E1',
                fontSize: 14,
                fontWeight: 600,
                color: '#0F172A',
                background: '#FFFFFF',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Subcategory / Specific Item */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
              {categoryId === 'fuel' ? 'Fuel Type' : (categoryId === 'food-drinks' ? 'Food / Drink Item' : 'Specific Item / Subcategory')}
            </label>
            {activeCategory && activeCategory.subcategories ? (
              <select
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: 12,
                  border: '1.5px solid #CBD5E1',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#0F172A',
                  background: '#FFFFFF',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
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
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: 12,
                  border: '1.5px solid #CBD5E1',
                  fontSize: 14,
                  color: '#0F172A',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            )}
          </div>

          {subcategory === '__custom__' && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 4 }}>
                Enter custom item name
              </label>
              <input
                type="text"
                placeholder="e.g. Lime juice, Parotta, Bike fuel"
                value={customItem}
                onChange={(e) => setCustomItem(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: '1.5px solid #CBD5E1',
                  fontSize: 13,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          )}

          {/* 5. Payment Method Selector Segmented Buttons */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
              Payment Method
            </label>
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
                      borderRadius: 12,
                      border: isSelected ? '1.5px solid #E11D48' : '1px solid #E2E8F0',
                      backgroundColor: isSelected ? '#FFF1F2' : '#FFFFFF',
                      color: isSelected ? '#E11D48' : '#334155',
                      fontWeight: isSelected ? 800 : 600,
                      fontSize: 13,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 2px 6px rgba(225, 29, 72, 0.12)' : 'none'
                    }}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. Date & Note Two-Column Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 10, marginBottom: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1.5px solid #CBD5E1',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#0F172A',
                  background: '#FFFFFF',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                Note (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Canteen lunch"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1.5px solid #CBD5E1',
                  fontSize: 13,
                  color: '#0F172A',
                  background: '#FFFFFF',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* 7. Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={isSubmitting}
              style={{
                padding: '11px 18px',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 700
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{
                padding: '11px 24px',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer'
              }}
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