import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { formatRupees, formatDate, rupeesToPaise } from '../../services/currency';
import { GraduationCap, BookOpen, FileText, CheckCircle2, Clock, AlertCircle, PlusCircle, CreditCard } from 'lucide-react';

export default function Academics({ onOpenAddExpense, onPayFeeInstallment }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [feeForm, setFeeForm] = useState({
    title: '',
    feeType: 'semester',
    academicYear: '2026-2027',
    semester: 'Semester 5',
    totalAmountRupees: '',
    dueDate: '',
    notes: ''
  });
  const [feeSubmitting, setFeeSubmitting] = useState(false);
  const [feeError, setFeeError] = useState('');

  const fetchAcademics = async () => {
    try {
      const res = await API.get('/academics/summary');
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAcademics();
  }, []);

  const handleCreateFee = async (e) => {
    e.preventDefault();
    setFeeError('');

    if (!feeForm.title || !feeForm.totalAmountRupees || !feeForm.dueDate) {
      setFeeError('Please provide title, total amount, and due date.');
      return;
    }

    setFeeSubmitting(true);
    try {
      await API.post('/academics/fees', {
        title: feeForm.title,
        feeType: feeForm.feeType,
        academicYear: feeForm.academicYear,
        semester: feeForm.semester,
        totalAmountPaise: rupeesToPaise(feeForm.totalAmountRupees),
        dueDate: feeForm.dueDate,
        notes: feeForm.notes
      });
      setShowFeeModal(false);
      setFeeForm({
        title: '',
        feeType: 'semester',
        academicYear: '2026-2027',
        semester: 'Semester 5',
        totalAmountRupees: '',
        dueDate: '',
        notes: ''
      });
      fetchAcademics();
    } catch (err) {
      setFeeError(err.response?.data?.message || 'Failed to create fee obligation');
    } finally {
      setFeeSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 1200, margin: '40px auto', padding: '0 24px', color: 'var(--color-chocolate-light)' }}>
        Loading academic finances...
      </div>
    );
  }

  const {
    spendingThisMonthPaise = 0,
    spendingThisYearPaise = 0,
    subcategoryTotals = {},
    fees = { totalObligationsPaise: 0, totalFeePaidPaise: 0, totalPendingFeesPaise: 0, items: [] },
    recentAcademicTransactions = []
  } = data || {};

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 28, color: 'var(--color-burgundy)' }}>Academic Expenses</h1>
          <p style={{ fontSize: 13, color: 'var(--color-chocolate-light)' }}>
            Your education costs, fee obligations, xerox printing, and books organized in one place
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setShowFeeModal(true)} className="btn btn-secondary">
            + New Fee Obligation
          </button>
          <button onClick={onOpenAddExpense} className="btn btn-primary">
            <PlusCircle size={16} /> Record Academic Cost
          </button>
        </div>
      </div>

      {/* Top Academic Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: 20, marginBottom: 28 }}>
        <div className="card">
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-chocolate-light)', marginBottom: 6 }}>
            Academic Spending (This Month)
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--color-burgundy)' }}>
            {formatRupees(spendingThisMonthPaise)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-chocolate-light)', marginTop: 4 }}>
            Books, notes, lab supplies & fees paid
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-chocolate-light)', marginBottom: 6 }}>
            Academic Spending (Academic Year)
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--color-chocolate)' }}>
            {formatRupees(spendingThisYearPaise)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-chocolate-light)', marginTop: 4 }}>
            Cumulative study investment
          </div>
        </div>

        <div className="card" style={{ background: 'var(--color-cream)', borderColor: '#F2E4D4' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-chocolate-light)', marginBottom: 6 }}>
            Pending Fee Obligations Due
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, fontFamily: 'var(--font-heading)', color: fees.totalPendingFeesPaise > 0 ? 'var(--color-warm-orange)' : 'var(--color-income)' }}>
            {formatRupees(fees.totalPendingFeesPaise)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-chocolate-light)', marginTop: 4 }}>
            {fees.totalFeePaidPaise > 0 ? `${formatRupees(fees.totalFeePaidPaise)} paid so far` : 'No payments made yet'}
          </div>
        </div>
      </div>

      {/* Section: Fee Tracker (Obligations vs Paid Installments) */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 18, color: 'var(--color-burgundy)' }}>College & Semester Fee Obligations</h3>
            <p style={{ fontSize: 12, color: 'var(--color-chocolate-light)' }}>
              Fees marked as due do not decrease cash until an installment is recorded (prevents double counting)
            </p>
          </div>
        </div>

        {fees.items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--color-chocolate-light)', fontSize: 14 }}>
            No fee obligations recorded. Click "+ New Fee Obligation" to track tuition or exam fees.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {fees.items.map((fee) => {
              const paidPaise = fee.installments.reduce((sum, i) => sum + i.amountPaise, 0);
              const remainingPaise = Math.max(0, fee.totalAmountPaise - paidPaise);
              const percent = Math.min(Math.round((paidPaise / fee.totalAmountPaise) * 100), 100);

              return (
                <div key={fee._id} style={{
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  background: fee.status === 'paid' ? 'var(--color-income-bg)' : 'var(--color-neutral-bg)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-chocolate)' }}>
                          {fee.title}
                        </span>
                        <span style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: 4,
                          textTransform: 'uppercase',
                          background: fee.status === 'paid' ? 'var(--color-income)' : (fee.status === 'partially_paid' ? 'var(--color-warm-orange)' : 'var(--color-chocolate-light)'),
                          color: '#fff'
                        }}>
                          {fee.status === 'paid' ? 'Paid in Full' : (fee.status === 'partially_paid' ? 'Partially Paid' : 'Unpaid')}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-chocolate-light)', marginTop: 4 }}>
                        {fee.semester} · Due: {formatDate(fee.dueDate)} {fee.notes && `· Note: "${fee.notes}"`}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--color-chocolate)' }}>
                        {formatRupees(fee.totalAmountPaise)}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-chocolate-light)' }}>
                        {formatRupees(remainingPaise)} remaining
                      </div>
                    </div>
                  </div>

                  {/* Installment Progress */}
                  <div style={{ width: '100%', height: 6, background: 'var(--color-border)', borderRadius: 3, overflow: 'hidden', marginBottom: 12 }}>
                    <div style={{ width: `${percent}%`, height: '100%', background: fee.status === 'paid' ? 'var(--color-income)' : 'var(--color-warm-orange)' }} />
                  </div>

                  {/* Actions / Installments list */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 12, color: 'var(--color-chocolate-light)' }}>
                      {fee.installments.length} installment(s) paid ({percent}% cleared)
                    </div>

                    {fee.status !== 'paid' && (
                      <button
                        onClick={() => onPayFeeInstallment(fee)}
                        className="btn btn-secondary"
                        style={{ padding: '6px 14px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
                      >
                        <CreditCard size={14} /> Pay Installment
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section: Academic Subcategories & Study Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Study items breakdown */}
        <div className="card">
          <h3 style={{ fontSize: 18, color: 'var(--color-burgundy)', marginBottom: 16 }}>
            Education Items & Supplies
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Object.keys(subcategoryTotals).length === 0 ? (
              <div style={{ color: 'var(--color-chocolate-light)', fontSize: 13 }}>No study supplies logged yet.</div>
            ) : (
              Object.entries(subcategoryTotals).map(([subcat, amountPaise]) => (
                <div key={subcat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--color-neutral-surface)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <BookOpen size={16} color="var(--color-burgundy)" />
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-chocolate)' }}>{subcat}</span>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--color-chocolate)' }}>
                    {formatRupees(amountPaise)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Academic Transactions */}
        <div className="card">
          <h3 style={{ fontSize: 18, color: 'var(--color-burgundy)', marginBottom: 16 }}>
            Recent Academic Activity
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recentAcademicTransactions.length === 0 ? (
              <div style={{ color: 'var(--color-chocolate-light)', fontSize: 13 }}>No recent academic transactions.</div>
            ) : (
              recentAcademicTransactions.map((tx) => (
                <div key={tx._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-chocolate)' }}>{tx.subcategory}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-chocolate-light)' }}>{formatDate(tx.date)} {tx.note && `· ${tx.note}`}</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-chocolate)' }}>
                    −{formatRupees(tx.amountPaise)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* New Fee Obligation Modal */}
      {showFeeModal && (
        <div className="modal-overlay" onClick={() => setShowFeeModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 20, color: 'var(--color-burgundy)', marginBottom: 16 }}>
              Add College Fee Obligation
            </h3>

            {feeError && (
              <div style={{ padding: '10px 14px', background: 'var(--color-expense-bg)', color: 'var(--color-expense)', borderRadius: 'var(--radius-md)', fontSize: 13, marginBottom: 16 }}>
                {feeError}
              </div>
            )}

            <form onSubmit={handleCreateFee}>
              <div className="form-group">
                <label className="form-label">Fee Title / Obligation</label>
                <input
                  type="text"
                  placeholder="e.g. Semester 5 Tuition & Exam Fee"
                  value={feeForm.title}
                  onChange={(e) => setFeeForm({ ...feeForm, title: e.target.value })}
                  className="form-input"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Total Amount in Rupees (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="25000"
                    value={feeForm.totalAmountRupees}
                    onChange={(e) => setFeeForm({ ...feeForm, totalAmountRupees: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input
                    type="date"
                    value={feeForm.dueDate}
                    onChange={(e) => setFeeForm({ ...feeForm, dueDate: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Fee Type</label>
                  <select
                    value={feeForm.feeType}
                    onChange={(e) => setFeeForm({ ...feeForm, feeType: e.target.value })}
                    className="form-select"
                  >
                    <option value="tuition">Tuition Fee</option>
                    <option value="semester">Semester Fee</option>
                    <option value="examination">Examination Fee</option>
                    <option value="lab">Lab Supplies Fee</option>
                    <option value="admission">Admission Fee</option>
                    <option value="hostel">Hostel Fee</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Semester / Year</label>
                  <input
                    type="text"
                    value={feeForm.semester}
                    onChange={(e) => setFeeForm({ ...feeForm, semester: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Pay before hall ticket distribution"
                  value={feeForm.notes}
                  onChange={(e) => setFeeForm({ ...feeForm, notes: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
                <button
                  type="button"
                  onClick={() => setShowFeeModal(false)}
                  className="btn btn-secondary"
                  disabled={feeSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={feeSubmitting}
                >
                  {feeSubmitting ? 'Creating...' : 'Save Obligation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}