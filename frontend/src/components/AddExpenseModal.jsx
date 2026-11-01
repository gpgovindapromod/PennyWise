import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { rupeesToPaise } from '../services/currency';
import { 
  X, 
  Check, 
  Coffee, 
  BookOpen, 
  Compass, 
  Laptop, 
  ShoppingBag, 
  Zap, 
  Heart, 
  MoreHorizontal
} from 'lucide-react';

export default function AddExpenseModal({ isOpen, onClose, onExpenseAdded, onSuccess, defaultAcademicFee = null, editingTransaction = null }) {
  const notifySuccess = onSuccess || onExpenseAdded || (() => {});
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [sector, setSector] = useState('Dining & Coffee');
  const [route, setRoute] = useState('UPI FastPay');
  const [merchantMemo, setMerchantMemo] = useState('');
  const [date, setDate] = useState(() => new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      if (editingTransaction) {
        setType(editingTransaction.type || 'expense');
        setAmount((editingTransaction.amountPaise / 100).toString());
        setMerchantMemo(editingTransaction.subcategory || editingTransaction.note || '');
      } else if (defaultAcademicFee) {
        setType('expense');
        setSector('Academics');
        setMerchantMemo('Installment for: ' + defaultAcademicFee.title);
        setAmount((defaultAcademicFee.totalAmountPaise / 100).toString());
      } else {
        setAmount('');
        setMerchantMemo('');
      }
    }
  }, [isOpen, defaultAcademicFee, editingTransaction]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid settlement amount');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        type,
        amountPaise: rupeesToPaise(amount),
        categoryId: sector === 'Dining & Coffee' ? 'food-drinks' :
                    sector === 'Academics' ? 'academic' :
                    sector === 'Transit & Metro' ? 'travel' :
                    sector === 'Tech & SaaS' ? 'academic' :
                    sector === 'Groceries' ? 'food-drinks' : 'bills-utilities',
        categoryLabel: sector,
        subcategory: merchantMemo || sector,
        note: merchantMemo,
        paymentMethod: route.toLowerCase(),
        date: new Date().toISOString()
      };

      const res = await API.post('/transactions', payload);
      notifySuccess(res.data.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record clearance');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sectors = [
    { label: 'Dining & Coffee', sub: 'HOSPITALITY', icon: Coffee },
    { label: 'Academics', sub: 'KNOWLEDGE', icon: BookOpen },
    { label: 'Transit & Metro', sub: 'MOBILITY', icon: Compass },
    { label: 'Tech & SaaS', sub: 'SOFTWARE', icon: Laptop },
    { label: 'Groceries', sub: 'PROVISIONS', icon: ShoppingBag },
    { label: 'Utilities', sub: 'OVERHEAD', icon: Zap },
    { label: 'Wellness', sub: 'HEALTH', icon: Heart },
    { label: 'Buffer Misc', sub: 'FLOATING', icon: MoreHorizontal }
  ];

  return (
    <div className="stitch-modal-overlay" onClick={onClose}>
      <div className="stitch-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="stitch-modal-top-meta">
          <span>RAPID CLEARANCE PROTOCOL · LIVE LOG</span>
          <span className="cursor-pointer" onClick={onClose}>✕</span>
        </div>

        <div className="stitch-modal-title-row">
          <h2 className="stitch-modal-title">Log New Entry</h2>
        </div>

        {/* Expense / Income / Deposit to Goal Selector */}
        <div className="stitch-modal-type-tabs">
          {['Expense', 'Income', 'Deposit to Goal'].map((t) => {
            const key = t === 'Expense' ? 'expense' : t === 'Income' ? 'income' : 'vault';
            return (
              <button
                key={t}
                type="button"
                onClick={() => setType(key)}
                className={type === key ? 'stitch-type-tab-btn stitch-type-tab-active' : 'stitch-type-tab-btn'}
              >
                {t}
              </button>
            );
          })}
        </div>

        {/* Settlement Volume Input Box */}
        <div className="stitch-modal-amount-box">
          <div className="stitch-modal-volume-title">SETTLEMENT AMOUNT (INR)</div>
          <div className="stitch-amount-input-row">
            <span className="stitch-currency-symbol">₹</span>
            <input 
              type="number"
              value={amount}
              placeholder="0"
              onChange={(e) => setAmount(e.target.value)}
              className="stitch-amount-number-input"
              autoFocus
            />
          </div>

          <div className="stitch-quick-increments">
            {['+₹100', '+₹500', '+₹1,000', '+₹2,500', 'Round to ₹100'].map((btn) => (
              <button
                key={btn}
                type="button"
                onClick={() => {
                  if (btn === 'Round to ₹100') {
                    setAmount(Math.ceil((Number(amount) || 0) / 100) * 100);
                  } else {
                    const add = Number(btn.replace(/[^0-9]/g, ''));
                    setAmount((Number(amount) || 0) + add);
                  }
                }}
                className="stitch-quick-btn"
              >
                {btn}
              </button>
            ))}
          </div>
        </div>

        {/* Classification Taxonomy */}
        <div className="stitch-taxonomy-header">
          <span>CLASSIFICATION TAXONOMY</span>
          <span>8 Sectors</span>
        </div>

        <div className="stitch-taxonomy-grid">
          {sectors.map((sec) => (
            <button
              key={sec.label}
              type="button"
              onClick={() => setSector(sec.label)}
              className={sector === sec.label ? 'stitch-sector-btn stitch-sector-btn-active' : 'stitch-sector-btn'}
            >
              <div className="flex items-center gap-1">
                <sec.icon size={12} color={sector === sec.label ? '#047857' : '#475569'} />
                <span className="stitch-sector-label">{sec.label.split(' ')[0]}</span>
              </div>
              <span className="stitch-sector-sub">{sec.sub}</span>
            </button>
          ))}
        </div>

        {/* Origin Route */}
        <div className="stitch-taxonomy-header">
          <span>PAYMENT METHOD</span>
        </div>
        <div className="stitch-routes-strip">
          {['UPI FastPay', 'Cash Reserve', 'HDFC Platinum', 'Bank Wire'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRoute(r)}
              className={route === r ? 'stitch-route-pill stitch-route-active' : 'stitch-route-pill'}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Memo & Date Fields */}
        <div className="stitch-memo-input-wrap">
          <input 
            type="text" 
            value={merchantMemo}
            onChange={(e) => setMerchantMemo(e.target.value)}
            placeholder="Merchant note / settlement purpose..."
            className="stitch-memo-field"
          />
          <input 
            type="text" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="stitch-memo-field text-center font-bold text-dark"
          />
        </div>

        {error && <div className="text-rose text-xs font-bold mb-3">{error}</div>}

        <div className="stitch-modal-submit-row">
          <div className="text-muted text-xs">
            Directly syncs to MongoDB Ledger
          </div>
          <button 
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="btn-stitch-record"
          >
            <Check size={14} /> {isSubmitting ? 'Recording...' : 'Record Transaction'}
          </button>
        </div>
      </div>
    </div>
  );
}
