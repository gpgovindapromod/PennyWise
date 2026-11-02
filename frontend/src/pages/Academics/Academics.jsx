import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { formatRupees, formatDate, rupeesToPaise } from '../../services/currency';
import { 
  GraduationCap, 
  Plus, 
  Calendar, 
  CreditCard, 
  FileText, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  Printer, 
  Cpu, 
  PenTool, 
  ShieldCheck, 
  SlidersHorizontal,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Academics({ onOpenAddExpense }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [submittingFee, setSubmittingFee] = useState(false);
  const [activePaymentFee, setActivePaymentFee] = useState(null);
  const [paymentAmountRupees, setPaymentAmountRupees] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);

  const fetchAcademics = async () => {
    try {
      const res = await API.get('/academics/summary');
      setData(res.data.data);
    } catch (err) {
      console.error('Failed to load academic summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAcademics();
  }, []);

  const { 
    spendingThisMonthPaise = 0,
    spendingThisYearPaise = 0,
    subcategoryTotals = {},
    fees = {},
    recentAcademicTransactions = []
  } = data || {};

  const feeItems = fees.items || [];
  const totalObligationsPaise = fees.totalObligationsPaise || 0;
  const totalFeePaidPaise = fees.totalFeePaidPaise || 0;
  const totalPendingFeesPaise = fees.totalPendingFeesPaise || 0;

  // Handle Recording New Obligation directly into MongoDB
  const handleCreateFee = async (e) => {
    e.preventDefault();
    setSubmittingFee(true);
    const form = e.target;
    try {
      await API.post('/academics/fees', {
        title: form.obTitle.value,
        feeType: form.feeType.value || 'semester',
        semester: form.semester.value || 'Semester 1',
        totalAmountPaise: Math.round(Number(form.obTotal.value) * 100),
        dueDate: form.obDate.value,
        notes: form.obDept.value || ''
      });
      setShowFeeModal(false);
      await fetchAcademics();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create obligation');
    } finally {
      setSubmittingFee(false);
    }
  };

  // Handle Recording Real-Time Payment directly into MongoDB
  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!activePaymentFee || !paymentAmountRupees) return;
    setSubmittingPayment(true);
    try {
      await API.post(`/academics/fees/${activePaymentFee._id}/payments`, {
        amountPaise: Math.round(Number(paymentAmountRupees) * 100),
        paymentMethod: 'UPI'
      });
      setActivePaymentFee(null);
      setPaymentAmountRupees('');
      await fetchAcademics();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record fee payment');
    } finally {
      setSubmittingPayment(false);
    }
  };

  // Dynamic Category Breakdown from real MongoDB subcategories
  const subcategoryEntries = Object.entries(subcategoryTotals || {});

  return (
    <div className="stitch-container">
      {/* 1. Protocol Sub-Header & Breadcrumb */}
      <div className="academic-proto-bar">
        <span className="proto-pulse-dot" />
        <span>ACADEMIC PORTFOLIO ALLOCATION · MONGODB DATABASE RECONCILED</span>
        <span className="academic-semester-badge">Real-Time Ledger</span>
      </div>

      {/* 2. Main Title Row & Actions */}
      <div className="academic-header-row">
        <div>
          <h1 className="academic-main-heading">Academic Obligations & College Fee Tracker</h1>
          <p className="academic-sub-caption">
            Dedicated educational capital ledger, milestone installment tracking, and semester material outlays.
          </p>
        </div>

        <div className="academic-header-actions">
          <button onClick={onOpenAddExpense} className="btn-goals-outline">
            + Record Study Cost
          </button>
          <button onClick={() => setShowFeeModal(true)} className="btn-goals-primary">
            + New Obligation
          </button>
        </div>
      </div>

      {/* 3. Three Stat Telemetry Cards Driven 100% by Live Database */}
      <div className="academic-stats-grid">
        {/* Metric 1 */}
        <div className="academic-stat-card">
          <div className="academic-stat-top">
            <span>CURRENT MONTH STUDY OUTLAY</span>
            <span className="academic-badge-schedule">● Live Database</span>
          </div>
          <div className="academic-stat-big-val">
            {formatRupees(spendingThisMonthPaise)}
          </div>
          <div className="academic-stat-sub-row">
            <span>Course materials & academic expenses</span>
            <span className="text-secondary font-bold">This Month</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="academic-stat-card">
          <div className="academic-stat-top">
            <span>ACADEMIC YEAR CUMULATIVE</span>
            <span className="academic-badge-schedule">● Cumulative</span>
          </div>
          <div className="academic-stat-big-val">
            {formatRupees(spendingThisYearPaise)}
          </div>
          <div className="academic-stat-sub-row">
            <span>Total educational disbursements</span>
            <span className="text-emerald font-bold">Year to Date</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="academic-stat-card">
          <div className="academic-stat-top">
            <span>PENDING FEE OBLIGATIONS</span>
            <span className={totalPendingFeesPaise > 0 ? "academic-badge-danger" : "academic-badge-schedule"}>
              {totalPendingFeesPaise > 0 ? "! Unsettled" : "● Cleared"}
            </span>
          </div>
          <div className="academic-stat-big-val">
            {formatRupees(totalPendingFeesPaise)}
          </div>
          <div className="academic-stat-sub-row">
            <span>Total dues across all institutional fees</span>
            <span className={totalPendingFeesPaise > 0 ? "text-rose font-bold" : "text-emerald font-bold"}>
              {feeItems.length} active fees
            </span>
          </div>
        </div>
      </div>

      {/* 4. Active Fee Obligations Section */}
      <div className="obligations-section-head">
        <h3 className="obligations-section-title">
          Active Fee Obligations <span className="obligations-count-pill">{feeItems.length} Registered</span>
        </h3>
      </div>

      {feeItems.length === 0 ? (
        <div className="goals-card-surface text-center py-10 mb-6">
          <GraduationCap size={36} className="mx-auto text-emerald-600 mb-2" />
          <h4 className="font-extrabold text-sm text-dark mb-1">No Institutional Fee Obligations Found</h4>
          <p className="text-muted text-xs mb-4">
            Track college tuition, semester fees, and examination dues with automated installment reconciliation.
          </p>
          <button onClick={() => setShowFeeModal(true)} className="btn-goals-primary mx-auto">
            + Arm Your First Obligation
          </button>
        </div>
      ) : (
        <div className="obligations-grid-3">
          {feeItems.map((fee) => {
            const clearedPaise = fee.installments?.reduce((sum, i) => sum + i.amountPaise, 0) || 0;
            const remPaise = Math.max(0, fee.totalAmountPaise - clearedPaise);
            const progress = fee.totalAmountPaise > 0 ? Math.min(100, Math.round((clearedPaise / fee.totalAmountPaise) * 100)) : 100;
            const isCleared = remPaise === 0 || fee.status === 'paid';
            const dueFormatted = fee.dueDate ? new Date(fee.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Flexible';

            return (
              <div key={fee._id} className="obligation-card">
                <div>
                  <div className="obligation-top-row">
                    <span className={`obligation-type-pill ${isCleared ? 'type-cleared' : 'type-mandatory'}`}>
                      {isCleared ? 'FULLY CLEARED' : (fee.feeType?.toUpperCase() || 'MANDATORY')}
                    </span>
                  </div>

                  <h4 className="obligation-title">{fee.title}</h4>
                  <div className="obligation-dept-sub">
                    {fee.notes || `${fee.semester || 'Semester'} • ${fee.academicYear || 'Academic Year'}`}
                  </div>

                  <div className="obligation-cleared-bar-meta">
                    <span>CLEARED TO DATE</span>
                    <span className="obligation-cleared-val">
                      {formatRupees(clearedPaise)} / {formatRupees(fee.totalAmountPaise)}
                    </span>
                  </div>

                  <div className="obligation-track">
                    <div 
                      className={isCleared ? 'obligation-fill-emerald' : 'obligation-fill-dark'}
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="obligation-progress-meta">
                    <span>Progress: {progress}%</span>
                    <span>Rem: {formatRupees(remPaise)}</span>
                  </div>

                  <div className="obligation-due-row">
                    <span>Due: {dueFormatted}</span>
                    <span className="text-emerald font-bold">
                      {isCleared ? 'SETTLED' : `${fee.installments?.length || 0} Installments`}
                    </span>
                  </div>
                </div>

                <div>
                  {isCleared ? (
                    <button className="btn-obligation-cleared" disabled>
                      <CheckCircle2 size={13} color="#047857" /> Obligation Cleared
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        setActivePaymentFee(fee);
                        setPaymentAmountRupees(Math.min(Math.round(remPaise / 100), 5000).toString());
                      }}
                      className="btn-obligation-pay"
                    >
                      <CreditCard size={13} /> Record Payment
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Two-column Bottom: Category Breakdown & Recent Study Outlay */}
      <div className="academic-bottom-grid">
        
        {/* Column A: Dynamic Category Breakdown */}
        <div className="academic-breakdown-card">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="font-extrabold text-sm m-0 text-dark">Courseware Category Breakdown</h4>
              <div className="text-muted text-xs">Dynamic aggregation from MongoDB study receipts</div>
            </div>
            <span className="text-muted text-xs font-bold">DATABASE RECONCILED</span>
          </div>

          {subcategoryEntries.length === 0 ? (
            <div className="text-center py-8 text-muted text-xs">
              No academic subcategory expenses logged yet.
            </div>
          ) : (
            subcategoryEntries.map(([subcat, amountPaise]) => {
              const ratio = spendingThisYearPaise > 0 ? Math.min(100, Math.round((amountPaise / spendingThisYearPaise) * 100)) : 0;
              return (
                <div key={subcat} className="breakdown-item">
                  <div className="breakdown-head">
                    <span className="breakdown-label capitalize">{subcat || 'General Courseware'}</span>
                    <span className="breakdown-vals">{formatRupees(amountPaise)}</span>
                  </div>
                  <div className="breakdown-track">
                    <div className="breakdown-fill-emerald" style={{ width: `${ratio}%` }} />
                  </div>
                  <div className="breakdown-sub-row">
                    <span>{ratio}% of academic total</span>
                    <span className="text-emerald font-bold">Reconciled</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Column B: Recent Study Outlay Log */}
        <div className="clearance-table-card">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="font-extrabold text-sm m-0 text-dark">Recent Study Outlay Log</h4>
              <div className="text-muted text-xs">Live database audit of courseware & material receipts</div>
            </div>
            <Link to="/transactions" className="btn-goals-outline text-xs py-1 px-2">
              View All ↗
            </Link>
          </div>

          <div className="clearance-table-wrapper">
            <div className="clearance-table-head">
              <span>Description</span>
              <span>Category</span>
              <span>Amount</span>
              <span className="text-right">Date</span>
            </div>

            {recentAcademicTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted text-xs">
                No recent study transactions recorded. Click '+ Record Study Cost' above to add one.
              </div>
            ) : (
              recentAcademicTransactions.map((tx) => (
                <div key={tx._id} className="clearance-table-row">
                  <div className="flex items-center gap-2">
                    <div className="clearance-icon-expense">
                      <BookOpen size={13} />
                    </div>
                    <div>
                      <div className="font-bold text-dark text-xs">{tx.note || tx.subcategory || 'Study Outlay'}</div>
                      <div className="text-muted text-xs">{tx.subcategory || 'Academics'}</div>
                    </div>
                  </div>

                  <div>
                    <span className="clearance-category-expense">{tx.categoryLabel || 'Academic'}</span>
                  </div>

                  <div className="font-extrabold text-dark text-xs">
                    {formatRupees(tx.amountPaise)}
                  </div>

                  <div className="text-right text-xs">
                    <div className="text-dark font-medium">{tx.paymentMethod || 'UPI'}</div>
                    <div className="text-muted text-xs">
                      {new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="clearance-footer-bar">
            <span>Showing {recentAcademicTransactions.length} recent database disbursements</span>
            <Link to="/transactions" className="clearance-footer-link">View Full Ledger →</Link>
          </div>
        </div>
      </div>

      {/* Modal: New Obligation */}
      {showFeeModal && (
        <div className="modal-overlay" onClick={() => setShowFeeModal(false)}>
          <div className="modal-content modal-stitch-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-stitch-header">
              <h3 className="font-extrabold text-sm m-0">Arm New Educational Obligation</h3>
              <button onClick={() => setShowFeeModal(false)} className="modal-close-btn">✕</button>
            </div>
            <form onSubmit={handleCreateFee}>
              <div className="mb-3">
                <label className="block text-secondary font-bold text-xs mb-1">Obligation Title</label>
                <input name="obTitle" required placeholder="e.g. Semester 6 Tuition Fee" className="form-input text-xs" />
              </div>
              <div className="mb-3">
                <label className="block text-secondary font-bold text-xs mb-1">Fee Type</label>
                <select name="feeType" className="form-input text-xs">
                  <option value="semester">Semester Fee</option>
                  <option value="tuition">Tuition Fee</option>
                  <option value="examination">Examination Fee</option>
                  <option value="lab">Lab & Equipment Fee</option>
                  <option value="hostel">Hostel & Living Fee</option>
                  <option value="admission">Admission Fee</option>
                  <option value="library">Library Fee</option>
                  <option value="other">Courseware & Other</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="block text-secondary font-bold text-xs mb-1">Semester / Term</label>
                <input name="semester" placeholder="e.g. Semester 6" className="form-input text-xs" />
              </div>
              <div className="mb-3">
                <label className="block text-secondary font-bold text-xs mb-1">Notes / Department</label>
                <input name="obDept" placeholder="e.g. Department of Engineering" className="form-input text-xs" />
              </div>
              <div className="mb-3">
                <label className="block text-secondary font-bold text-xs mb-1">Total Fee Amount (INR)</label>
                <input name="obTotal" type="number" required placeholder="45000" className="form-input text-xs" />
              </div>
              <div className="mb-3">
                <label className="block text-secondary font-bold text-xs mb-1">Due Date</label>
                <input name="obDate" type="date" required className="form-input text-xs" />
              </div>
              <button type="submit" disabled={submittingFee} className="modal-stitch-submit">
                {submittingFee ? 'Saving to MongoDB...' : 'Initialize Obligation'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Record Fee Payment */}
      {activePaymentFee && (
        <div className="modal-overlay" onClick={() => setActivePaymentFee(null)}>
          <div className="modal-content modal-stitch-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-stitch-header">
              <h3 className="font-extrabold text-sm m-0">Record Fee Installment</h3>
              <button onClick={() => setActivePaymentFee(null)} className="modal-close-btn">✕</button>
            </div>
            <form onSubmit={handleRecordPayment}>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg mb-3">
                <div className="font-bold text-dark text-xs">{activePaymentFee.title}</div>
                <div className="text-muted text-xs mt-1">
                  Total: {formatRupees(activePaymentFee.totalAmountPaise)}
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-secondary font-bold text-xs mb-1">Payment Amount (INR)</label>
                <input 
                  type="number" 
                  required 
                  value={paymentAmountRupees}
                  onChange={(e) => setPaymentAmountRupees(e.target.value)}
                  className="form-input text-xs" 
                />
              </div>
              <button type="submit" disabled={submittingPayment} className="modal-stitch-submit">
                {submittingPayment ? 'Recording to Ledger...' : 'Commit Payment'}
              </button>
            </form>
          </div>
        </div>
      )}

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
