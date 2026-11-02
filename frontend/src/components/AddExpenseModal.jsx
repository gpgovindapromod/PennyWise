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

// Helpers for robust IST date handling
function getTodayIST() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date());
  const year = parts.find(p => p.type === 'year')?.value;
  const month = parts.find(p => p.type === 'month')?.value;
  const day = parts.find(p => p.type === 'day')?.value;
  return `${year}-${month}-${day}`;
}

function formatDateForInput(dateVal) {
  if (!dateVal) return getTodayIST();
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return getTodayIST();
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(d);
  const year = parts.find(p => p.type === 'year')?.value;
  const month = parts.find(p => p.type === 'month')?.value;
  const day = parts.find(p => p.type === 'day')?.value;
  return `${year}-${month}-${day}`;
}

function toISTIsoString(dateStr) {
  if (!dateStr || typeof dateStr !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return new Date().toISOString();
  }
  // Peg to 12:00:00 IST (+05:30) to firmly anchor calendar day invariant across UTC
  const d = new Date(`${dateStr}T12:00:00.000+05:30`);
  if (isNaN(d.getTime())) {
    return new Date().toISOString();
  }
  return d.toISOString();
}

export default function AddExpenseModal({ isOpen, onClose, onExpenseAdded, onSuccess, defaultAcademicFee = null, editingTransaction = null }) {
  const notifySuccess = onSuccess || onExpenseAdded || (() => {});
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [sector, setSector] = useState('Dining & Coffee');
  const [subcategory, setSubcategory] = useState('');
  const [route, setRoute] = useState('UPI FastPay');
  const [merchantMemo, setMerchantMemo] = useState('');
  const [date, setDate] = useState(getTodayIST);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Predefined meaningful subcategories per sector
  const sectorSubcategories = {
    'Dining & Coffee': ['Coffee & Snacks', 'Meals & Dining', 'Hostel Canteen', 'Other Food'],
    'Academics': ['Stationery', 'College fees', 'Tuition fees', 'Semester fees', 'Examination fees', 'Textbooks & Records', 'Other study costs'],
    'Transit & Metro': ['Bus ticket / pass', 'Metro', 'Train ticket', 'Cab / Uber / Ola', 'Petrol / Fuel', 'Other travel'],
    'Tech & SaaS': ['Software & Subscriptions', 'Cloud & Hosting', 'Developer Tools', 'Domain & Services'],
    'Groceries': ['Groceries', 'Supermarket', 'Fruits & Vegetables', 'Household Provisions'],
    'Utilities': ['Electricity bill', 'Mobile recharge', 'Wi-Fi / Internet', 'Room rent', 'Mess bill'],
    'Wellness': ['Medicines', 'Doctor appointment', 'Personal Care / Grooming', 'Health & Fitness'],
    'Buffer Misc': ['Miscellaneous expense', 'Emergency Buffer', 'General Outlay']
  };

  const currentSubcategories = sectorSubcategories[sector] || ['General'];

  useEffect(() => {
    if (isOpen) {
      setError('');
      if (editingTransaction) {
        setType(editingTransaction.type || 'expense');
        setAmount((editingTransaction.amountPaise / 100).toString());
        setMerchantMemo(editingTransaction.note || '');
        setSubcategory(editingTransaction.subcategory || '');
        setDate(formatDateForInput(editingTransaction.date));
        if (editingTransaction.categoryId === 'academic') {
          setSector('Academics');
        } else if (editingTransaction.categoryId === 'travel' || editingTransaction.categoryId === 'fuel') {
          setSector('Transit & Metro');
        } else if (editingTransaction.categoryId === 'bills-utilities') {
          setSector(editingTransaction.categoryLabel === 'Tech & SaaS' ? 'Tech & SaaS' : 'Utilities');
        } else if (editingTransaction.categoryId === 'food-drinks') {
          setSector(editingTransaction.categoryLabel === 'Groceries' ? 'Groceries' : 'Dining & Coffee');
        } else if (editingTransaction.categoryLabel) {
          setSector(editingTransaction.categoryLabel);
        }
      } else if (defaultAcademicFee) {
        setType('expense');
        setSector('Academics');
        setSubcategory('College fees');
        setMerchantMemo('Installment for: ' + defaultAcademicFee.title);
        setAmount((defaultAcademicFee.totalAmountPaise / 100).toString());
        setDate(getTodayIST());
      } else {
        setAmount('');
        setMerchantMemo('');
        setSubcategory('');
        setDate(getTodayIST());
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
      // Map payment method correctly to backend enum: 'upi' | 'cash' | 'card'
      const paymentMethodMap = {
        'UPI FastPay': 'upi',
        'Cash Reserve': 'cash',
        'HDFC Platinum': 'card',
        'Bank Wire': 'upi'
      };

      const isVaultTransfer = type === 'vault';
      const actualType = isVaultTransfer ? 'transfer_out' : type;

      // Determine meaningful subcategory fallback if not explicitly chosen
      const defaultSub = isVaultTransfer 
        ? 'Goal Contribution' 
        : sector === 'Tech & SaaS' 
          ? 'Software & Subscriptions' 
          : (currentSubcategories[0] || sector);
      const finalSubcategory = subcategory || (editingTransaction?.subcategory) || defaultSub;

      const payload = {
        type: actualType,
        amountPaise: rupeesToPaise(amount),
        categoryId: isVaultTransfer ? 'vault' : (
          sector === 'Dining & Coffee' ? 'food-drinks' :
          sector === 'Academics' ? 'academic' :
          sector === 'Transit & Metro' ? 'travel' :
          sector === 'Tech & SaaS' ? 'bills-utilities' :
          sector === 'Groceries' ? 'food-drinks' : 'bills-utilities'
        ),
        categoryLabel: isVaultTransfer ? 'Savings Vault' : sector,
        subcategory: finalSubcategory,
        note: merchantMemo ? merchantMemo.trim() : (isVaultTransfer ? 'Contribution to savings vault' : ''),
        paymentMethod: paymentMethodMap[route] || 'upi',
        date: toISTIsoString(date)
      };

      let res;
      if (editingTransaction && editingTransaction._id) {
        res = await API.patch(`/transactions/${editingTransaction._id}`, payload);
      } else {
        res = await API.post('/transactions', payload);
      }
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
          <h2 className="stitch-modal-title">
            {editingTransaction ? 'Edit Transaction' : 'Log New Entry'}
          </h2>
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
              onClick={() => {
                setSector(sec.label);
                const nextSubs = sectorSubcategories[sec.label] || ['General'];
                setSubcategory(nextSubs[0]);
              }}
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

        {/* Subcategory Pills Strip */}
        <div className="stitch-taxonomy-header">
          <span>SUBCATEGORY BUCKET</span>
        </div>
        <div className="stitch-routes-strip">
          {currentSubcategories.map((sub) => {
            const isSelected = (subcategory || currentSubcategories[0]) === sub;
            return (
              <button
                key={sub}
                type="button"
                onClick={() => setSubcategory(sub)}
                className={isSelected ? 'stitch-route-pill stitch-route-active' : 'stitch-route-pill'}
              >
                {sub}
              </button>
            );
          })}
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
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max="2099-12-31"
            min="2000-01-01"
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
            <Check size={14} /> {isSubmitting ? (editingTransaction ? 'Updating...' : 'Recording...') : (editingTransaction ? 'Update Transaction' : 'Record Transaction')}
          </button>
        </div>
      </div>
    </div>
  );
}
