import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { formatRupees, rupeesToPaise } from '../../services/currency';
import { 
  Target, 
  Save, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Sliders, 
  Check, 
  ArrowRight,
  TrendingDown,
  Calendar,
  Sparkles,
  ShieldAlert,
  Info,
  DollarSign,
  PieChart
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Goals() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [limitRupees, setLimitRupees] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthName = now.toLocaleString('default', { month: 'long' });

  const fetchGoal = async () => {
    try {
      const res = await API.get(`/budgets/${monthKey}`);
      setData(res.data.data);
      if (res.data.data?.budget) {
        setLimitRupees((res.data.data.budget.limitPaise / 100).toString());
        setNotes(res.data.data.budget.notes || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoal();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.put(`/budgets/${monthKey}`, {
        limitPaise: rupeesToPaise(limitRupees),
        notes
      });
      setMsg('Monthly budget updated successfully in cloud database!');
      fetchGoal();
      setTimeout(() => setMsg(''), 3500);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update budget');
    } finally {
      setSaving(false);
    }
  };

  const setPresetLimit = (amount) => {
    setLimitRupees(amount.toString());
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 1100, margin: '40px auto', padding: '0 24px', color: '#64748B' }}>
        Loading monthly budget details...
      </div>
    );
  }

  const { budget = {}, spentPaise = 0, remainingPaise = 0, percentUsed = 0 } = data || {};
  const isExceeded = spentPaise > (budget.limitPaise || 0) && (budget.limitPaise || 0) > 0;
  const isWarning = percentUsed >= 80 && !isExceeded;
  const progressRatio = Math.min(Math.max(percentUsed, 0), 100);

  // Daily budget projection calculation for desktop insights
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const currentDay = now.getDate();
  const remainingDays = Math.max(1, daysInMonth - currentDay);
  const dailyPaceLimitPaise = budget.limitPaise > 0 ? Math.round(budget.limitPaise / daysInMonth) : 0;
  const dailyRemainingPacePaise = remainingPaise > 0 ? Math.round(remainingPaise / remainingDays) : 0;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px 80px 24px' }}>
      
      {/* 1. Desktop Page Header */}
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
              <Target size={12} /> SPENDING CONTROLS
            </span>
            <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>
              Fiscal Month: {monthName} {now.getFullYear()}
            </span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
            Monthly Expense Budget
          </h1>
          <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0 0' }}>
            Set spending thresholds, monitor daily consumption pace, and prevent overspending
          </p>
        </div>

        {/* Header Quick Status Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '10px 16px',
          borderRadius: 12,
          background: isExceeded ? '#FFF1F2' : (isWarning ? '#FEF3C7' : '#ECFDF5'),
          border: isExceeded ? '1px solid #FECDD3' : (isWarning ? '1px solid #FDE68A' : '1px solid #A7F3D0')
        }}>
          {isExceeded ? (
            <AlertTriangle size={18} color="#E11D48" />
          ) : isWarning ? (
            <AlertTriangle size={18} color="#D97706" />
          ) : (
            <CheckCircle2 size={18} color="#059669" />
          )}
          <div>
            <div style={{
              fontSize: 12,
              fontWeight: 800,
              color: isExceeded ? '#9F1239' : (isWarning ? '#92400E' : '#065F46'),
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              {isExceeded ? 'Budget Exceeded' : (isWarning ? 'Near Ceiling (80%+)' : 'On Budget Target')}
            </div>
            <div style={{ fontSize: 11, color: isExceeded ? '#E11D48' : (isWarning ? '#B45309' : '#047857') }}>
              {percentUsed}% of limit consumed
            </div>
          </div>
        </div>
      </div>

      {msg && (
        <div style={{
          padding: '12px 18px',
          background: '#ECFDF5',
          color: '#065F46',
          borderRadius: 12,
          fontSize: 13,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 20,
          border: '1px solid #A7F3D0',
          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.08)'
        }}>
          <Check size={18} color="#059669" /> {msg}
        </div>
      )}

      {/* 2. Panoramic Web KPI Stat Cards Row (3 Clean Columns) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 18,
        marginBottom: 24
      }}>
        {/* KPI 1: Monthly Limit */}
        <div className="card" style={{
          background: '#FFFFFF',
          borderRadius: 18,
          border: '1px solid #E2E8F0',
          padding: '22px',
          boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#64748B', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Allocated Monthly Limit
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, fontFamily: 'var(--font-heading)', color: '#0F172A', marginTop: 4 }}>
                {budget.limitPaise > 0 ? formatRupees(budget.limitPaise) : '₹0.00'}
              </div>
            </div>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              backgroundColor: '#EFF6FF',
              color: '#3B82F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Target size={20} />
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 12 }}>
            {budget.limitPaise > 0 ? `Target set for ${monthName}` : 'No limit active. Enter a limit below.'}
          </div>
        </div>

        {/* KPI 2: Spent This Month */}
        <div className="card" style={{
          background: '#FFFFFF',
          borderRadius: 18,
          border: '1px solid #E2E8F0',
          padding: '22px',
          boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#E11D48', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Total Spent This Month
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, fontFamily: 'var(--font-heading)', color: '#0F172A', marginTop: 4 }}>
                {formatRupees(spentPaise)}
              </div>
            </div>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              backgroundColor: '#FFF1F2',
              color: '#E11D48',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TrendingDown size={20} />
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 12 }}>
            <span>{percentUsed}% of total budget consumed</span>
          </div>
        </div>

        {/* KPI 3: Remaining Allowance */}
        <div className="card" style={{
          background: isExceeded ? '#FFF1F2' : '#F0FDF4',
          borderRadius: 18,
          border: isExceeded ? '1px solid #FECDD3' : '1px solid #BBF7D0',
          padding: '22px',
          boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{
                fontSize: 11,
                fontWeight: 800,
                color: isExceeded ? '#E11D48' : '#15803D',
                letterSpacing: '0.08em',
                textTransform: 'uppercase'
              }}>
                {isExceeded ? 'Over Budget By' : 'Remaining Allowance'}
              </div>
              <div style={{
                fontSize: 28,
                fontWeight: 900,
                fontFamily: 'var(--font-heading)',
                color: isExceeded ? '#E11D48' : '#15803D',
                marginTop: 4
              }}>
                {remainingPaise >= 0 ? formatRupees(remainingPaise) : `−${formatRupees(Math.abs(remainingPaise))}`}
              </div>
            </div>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              backgroundColor: isExceeded ? '#FFE4E6' : '#DCFCE7',
              color: isExceeded ? '#E11D48' : '#15803D',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {isExceeded ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
            </div>
          </div>
          <div style={{ fontSize: 12, color: isExceeded ? '#9F1239' : '#166534', marginTop: 12, fontWeight: 600 }}>
            {remainingPaise >= 0 
              ? `~${formatRupees(dailyRemainingPacePaise)} / day left for ${remainingDays} days`
              : 'Limit exceeded for this month'}
          </div>
        </div>
      </div>

      {/* 3. Wide Multi-Column Layout: Progress Bar & Analytics on Left, Edit Form on Right */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: 24,
        alignItems: 'start'
      }}>
        
        {/* Left Column: Real-time Budget Status & Consumption Gauge */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Main Dark Web Gauge Card */}
          <div style={{
            background: 'linear-gradient(145deg, #0D1117 0%, #161B22 100%)',
            borderRadius: 20,
            padding: '24px',
            color: '#FFFFFF',
            border: '1px solid #21262D',
            boxShadow: '0 8px 24px rgba(13, 17, 23, 0.35)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#FB7185', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  BUDGET CONSUMPTION GAUGE
                </span>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#FFFFFF', marginTop: 2 }}>
                  {percentUsed}% Consumed
                </div>
              </div>
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: 8,
                background: isExceeded ? 'rgba(225,29,72,0.25)' : 'rgba(16,185,129,0.2)',
                color: isExceeded ? '#FB7185' : '#34D399',
                border: `1px solid ${isExceeded ? 'rgba(225,29,72,0.5)' : 'rgba(16,185,129,0.4)'}`
              }}>
                {isExceeded ? 'Exceeded' : (isWarning ? 'Caution' : 'Optimal')}
              </span>
            </div>

            {/* High-visibility Multi-color Progress Bar */}
            <div style={{ width: '100%', height: 12, background: '#21262D', borderRadius: 99, overflow: 'hidden', position: 'relative', marginBottom: 16 }}>
              <div style={{
                width: `${progressRatio}%`,
                height: '100%',
                background: isExceeded
                  ? 'linear-gradient(90deg, #F43F5E 0%, #E11D48 100%)'
                  : isWarning
                  ? 'linear-gradient(90deg, #F59E0B 0%, #EA580C 100%)'
                  : 'linear-gradient(90deg, #10B981 0%, #059669 100%)',
                borderRadius: 99,
                transition: 'width 0.4s ease'
              }} />
            </div>

            {/* Quick Metrics Breakdown Strip */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
              padding: '14px',
              background: 'rgba(255, 255, 255, 0.04)',
              borderRadius: 14,
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div>
                <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>Daily Spending Pace</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#FFFFFF', marginTop: 2 }}>
                  {formatRupees(dailyPaceLimitPaise)} <span style={{ fontSize: 11, color: '#64748B' }}>/ day</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>Days Remaining in Month</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#FFFFFF', marginTop: 2 }}>
                  {remainingDays} days
                </div>
              </div>
            </div>
          </div>

          {/* Budget Guidelines & Tips Card */}
          <div className="card" style={{
            background: '#FFFFFF',
            borderRadius: 20,
            border: '1px solid #E2E8F0',
            padding: '22px',
            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)'
          }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Info size={16} color="#3B82F6" /> Smart Budget Recommendations
            </h3>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#64748B', lineHeight: 1.6 }}>
              <li>Setting a monthly limit does not block transactions; it sends alerts and visually warns when spending exceeds thresholds.</li>
              <li>Academic semester obligations and tuition fees are tracked separately in <Link to="/academics" style={{ color: '#E11D48', fontWeight: 600 }}>Academic Tracker</Link> so they don't skew your day-to-day allowance.</li>
              <li>Expenses like tea, canteen meals, and travel auto-decrement from this budget.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Interactive Budget Configuration Card */}
        <div className="card" style={{
          background: '#FFFFFF',
          borderRadius: 20,
          border: '1px solid #E2E8F0',
          padding: '24px 26px',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: '#FFF1F2',
              color: '#E11D48',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sliders size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Adjust Monthly Budget
              </h3>
              <p style={{ fontSize: 12, color: '#64748B', margin: '2px 0 0 0' }}>
                Set your spending target for {monthName} {now.getFullYear()}
              </p>
            </div>
          </div>

          <form onSubmit={handleSave}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Monthly Spending Limit (₹ INR)
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 16, top: 12, fontSize: 18, fontWeight: 800, color: '#64748B' }}>
                  ₹
                </span>
                <input
                  type="number"
                  step="100"
                  value={limitRupees}
                  onChange={(e) => setLimitRupees(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 38px',
                    fontSize: 20,
                    fontWeight: 800,
                    borderRadius: 12,
                    border: '1.5px solid #CBD5E1',
                    color: '#0F172A',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  placeholder="5000"
                  required
                />
              </div>

              {/* Quick Preset Buttons for Student Budgets */}
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 6 }}>
                  Quick Preset Recommendations:
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[3000, 5000, 8000, 12000].map((amt) => (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => setPresetLimit(amt)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 8,
                        border: '1px solid #E2E8F0',
                        background: limitRupees === amt.toString() ? '#0F172A' : '#F8FAFC',
                        color: limitRupees === amt.toString() ? '#FFFFFF' : '#334155',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      ₹{amt.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Budget Strategy Notes (Optional)
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: 13,
                  borderRadius: 12,
                  border: '1.5px solid #CBD5E1',
                  color: '#0F172A',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
                placeholder="e.g. Save for semester end project materials, daily chai & mess bills, and bike fuel."
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                cursor: 'pointer'
              }}
            >
              <Save size={16} /> {saving ? 'Updating Budget...' : 'Save Monthly Budget'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}