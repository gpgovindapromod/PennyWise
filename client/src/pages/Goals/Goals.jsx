import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { formatRupees, rupeesToPaise } from '../../services/currency';
import { Target, AlertTriangle, CheckCircle2, Save } from 'lucide-react';

export default function Goals() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [limitRupees, setLimitRupees] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const fetchGoal = async () => {
    try {
      const res = await API.get(`/budgets/${monthKey}`);
      setData(res.data.data);
      if (res.data.data.budget) {
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
    setMsg('');
    const val = parseFloat(limitRupees);
    if (isNaN(val) || val <= 0) {
      alert('Please enter a valid monthly limit in rupees');
      return;
    }

    setSaving(true);
    try {
      await API.put(`/budgets/${monthKey}`, {
        limitPaise: rupeesToPaise(limitRupees),
        notes
      });
      setMsg('Monthly goal updated successfully!');
      fetchGoal();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update goal');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 1200, margin: '40px auto', padding: '0 24px', color: 'var(--color-chocolate-light)' }}>
        Loading monthly spending plan...
      </div>
    );
  }

  const { budget = {}, spentPaise = 0, remainingPaise = 0, percentUsed = 0 } = data || {};
  const isExceeded = spentPaise > (budget.limitPaise || 0);
  const isWarning = percentUsed >= 80 && !isExceeded;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, color: 'var(--color-burgundy)' }}>October Spending Plan</h1>
        <p style={{ fontSize: 13, color: 'var(--color-chocolate-light)' }}>
          Set your personal expense ceiling, maintain discipline, and get warned before overspending
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 28 }}>
        {/* Left: Spending Limit Status Cards */}
        <div>
          <div className="card" style={{
            marginBottom: 20,
            borderLeft: isExceeded ? '5px solid var(--color-expense)' : (isWarning ? '5px solid var(--color-warm-orange)' : '5px solid var(--color-burgundy)')
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-chocolate-light)' }}>Monthly Limit</div>
                <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--color-burgundy)' }}>
                  {formatRupees(budget.limitPaise)}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-chocolate-light)' }}>Spent So Far</div>
                <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--color-chocolate)' }}>
                  {formatRupees(spentPaise)}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-chocolate-light)' }}>Remaining Allowance</div>
                <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-heading)', color: remainingPaise >= 0 ? 'var(--color-income)' : 'var(--color-expense)' }}>
                  {remainingPaise >= 0 ? formatRupees(remainingPaise) : `−${formatRupees(Math.abs(remainingPaise))}`}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-chocolate-light)' }}>Budget Used</div>
                <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-heading)', color: isExceeded ? 'var(--color-expense)' : (isWarning ? 'var(--color-warm-orange)' : 'var(--color-chocolate)') }}>
                  {percentUsed}%
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ width: '100%', height: 12, background: 'var(--color-neutral-surface)', borderRadius: 6, overflow: 'hidden', marginBottom: 16 }}>
              <div style={{
                width: `${Math.min(percentUsed, 100)}%`,
                height: '100%',
                background: isExceeded ? 'var(--color-expense)' : (isWarning ? 'var(--color-warm-orange)' : 'var(--color-burgundy)'),
                transition: 'width 0.4s ease'
              }} />
            </div>

            {/* Status alert text */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500 }}>
              {isExceeded ? (
                <span style={{ color: 'var(--color-expense)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertTriangle size={16} /> You have exceeded your planned spending limit for this month.
                </span>
              ) : isWarning ? (
                <span style={{ color: 'var(--color-warm-orange)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertTriangle size={16} /> Warning: You have consumed over 80% of your allowance.
                </span>
              ) : (
                <span style={{ color: 'var(--color-income)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={16} /> Healthy spending pace: You are safely within your budget limit.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Configure Monthly Goal */}
        <div className="card">
          <h3 style={{ fontSize: 18, color: 'var(--color-burgundy)', marginBottom: 16 }}>
            Adjust Monthly Spending Target
          </h3>

          {msg && (
            <div style={{ padding: '10px 14px', background: 'var(--color-income-bg)', color: 'var(--color-income)', borderRadius: 'var(--radius-md)', fontSize: 13, marginBottom: 16 }}>
              {msg}
            </div>
          )}

          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Monthly Limit in Rupees (₹)</label>
              <input
                type="number"
                step="100"
                value={limitRupees}
                onChange={(e) => setLimitRupees(e.target.value)}
                className="form-input"
                style={{ fontSize: 18, fontWeight: 700 }}
                placeholder="6000"
                required
              />
              <span style={{ fontSize: 11, color: 'var(--color-chocolate-light)' }}>
                Recommended for students: ₹4,000 – ₹8,000 depending on hostel canteen & mess costs
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Notes or Personal Goal</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="form-textarea"
                placeholder="e.g. Saving up for semester study tour or new laptop RAM"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              style={{ width: '100%', marginTop: 8 }}
            >
              <Save size={16} /> {saving ? 'Saving Limit...' : 'Update Monthly Goal'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}