import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { formatRupees, formatDate, rupeesToPaise } from '../../services/currency';
import { 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  PlusCircle, 
  CreditCard,
  TrendingDown,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  ChevronRight,
  Check
} from 'lucide-react';

export default function Academics({ onOpenAddExpense, onPayFeeInstallment }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'fees', 'expenses'
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
      <div style={{ maxWidth: 1100, margin: '40px auto', padding: '0 24px', color: '#64748B' }}>
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

  const pendingFeesCount = fees.items.filter(f => f.status !== 'paid').length;
  const paidFeesCount = fees.items.filter(f => f.status === 'paid').length;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px 80px 20px' }}>
      
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
              <GraduationCap size={12} /> ACADEMY & TUITION
            </span>
            <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>
              Term 2026-2027
            </span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
            Academic Expenses
          </h1>
          <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0 0' }}>
            College tuition, exam fees, textbooks, notes, and lab expenses organized in one hub
          </p>
        </div>

        {/* Action Buttons */}
        <div className="page-header-actions" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowFeeModal(true)}
            className="btn btn-secondary"
            style={{
              padding: '10px 16px',
              fontSize: 13,
              fontWeight: 700,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            + New Obligation
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
              gap: 8
            }}
          >
            <PlusCircle size={16} /> Record Academic Cost
          </button>
        </div>
      </div>

      {/* 2. Structured Overview Cards (Organized Grid) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 16,
        marginBottom: 24
      }}>
        {/* Card 1: Monthly Study Burn */}
        <div className="card" style={{
          background: '#FFFFFF',
          borderRadius: 16,
          padding: '20px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#E11D48', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                This Month
              </div>
              <div style={{ fontSize: 26, fontWeight: 900, fontFamily: 'var(--font-heading)', color: '#0F172A', marginTop: 4 }}>
                {formatRupees(spendingThisMonthPaise)}
              </div>
            </div>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: '#FFE4E6',
              color: '#E11D48',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BookOpen size={18} />
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>Books, photocopies, printouts & supplies</span>
          </div>
        </div>

        {/* Card 2: Cumulative Study Investment */}
        <div className="card" style={{
          background: '#FFFFFF',
          borderRadius: 16,
          padding: '20px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#475569', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Academic Year Total
              </div>
              <div style={{ fontSize: 26, fontWeight: 900, fontFamily: 'var(--font-heading)', color: '#0F172A', marginTop: 4 }}>
                {formatRupees(spendingThisYearPaise)}
              </div>
            </div>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: '#F1F5F9',
              color: '#334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TrendingDown size={18} />
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 10 }}>
            <span>Cumulative course expenditure</span>
          </div>
        </div>

        {/* Card 3: Pending Fee Obligations (Highlight Card) */}
        <div className="card" style={{
          background: fees.totalPendingFeesPaise > 0 
            ? 'linear-gradient(135deg, #FFF1F2 0%, #FFFFFF 100%)' 
            : 'linear-gradient(135deg, #ECFDF5 0%, #FFFFFF 100%)',
          borderRadius: 16,
          padding: '20px',
          border: fees.totalPendingFeesPaise > 0 ? '1px solid #FECDD3' : '1px solid #A7F3D0',
          boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{
                fontSize: 11,
                fontWeight: 800,
                color: fees.totalPendingFeesPaise > 0 ? '#E11D48' : '#059669',
                letterSpacing: '0.08em',
                textTransform: 'uppercase'
              }}>
                Pending Fee Obligations
              </div>
              <div style={{
                fontSize: 26,
                fontWeight: 900,
                fontFamily: 'var(--font-heading)',
                color: fees.totalPendingFeesPaise > 0 ? '#E11D48' : '#059669',
                marginTop: 4
              }}>
                {formatRupees(fees.totalPendingFeesPaise)}
              </div>
            </div>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: fees.totalPendingFeesPaise > 0 ? '#FFE4E6' : '#D1FAE5',
              color: fees.totalPendingFeesPaise > 0 ? '#E11D48' : '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {fees.totalPendingFeesPaise > 0 ? <Clock size={18} /> : <CheckCircle2 size={18} />}
            </div>
          </div>
          <div style={{ fontSize: 12, color: fees.totalPendingFeesPaise > 0 ? '#9F1239' : '#047857', marginTop: 10, fontWeight: 600 }}>
            {fees.totalFeePaidPaise > 0 
              ? `${formatRupees(fees.totalFeePaidPaise)} paid · ${pendingFeesCount} pending` 
              : `${fees.items.length} obligations registered`}
          </div>
        </div>
      </div>

      {/* 3. Filter Navigation Pills */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 20,
        overflowX: 'auto',
        paddingBottom: 4
      }}>
        {[
          { id: 'all', label: 'All Modules' },
          { id: 'fees', label: `College Fee Obligations (${fees.items.length})` },
          { id: 'expenses', label: 'Study Supplies & Logs' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '7px 16px',
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 700,
              border: activeTab === tab.id ? '1px solid #E11D48' : '1px solid #E2E8F0',
              backgroundColor: activeTab === tab.id ? '#E11D48' : '#FFFFFF',
              color: activeTab === tab.id ? '#FFFFFF' : '#475569',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4. Main Section: Fee Obligations Tracker */}
      {(activeTab === 'all' || activeTab === 'fees') && (
        <div className="card" style={{
          background: '#FFFFFF',
          borderRadius: 20,
          border: '1px solid #E2E8F0',
          padding: '24px',
          marginBottom: 24,
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  College & Semester Fee Obligations
                </h3>
                <span style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 12,
                  backgroundColor: '#F1F5F9',
                  color: '#475569'
                }}>
                  {fees.items.length} Total
                </span>
              </div>
              <p style={{ fontSize: 12, color: '#64748B', margin: '4px 0 0 0' }}>
                Track fee liabilities separately so your wallet balance isn't deducted until paid
              </p>
            </div>

            <button
              onClick={() => setShowFeeModal(true)}
              className="btn btn-secondary"
              style={{ padding: '6px 14px', fontSize: 12, fontWeight: 700 }}
            >
              + Add Fee
            </button>
          </div>

          {fees.items.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              backgroundColor: '#F8FAFC',
              borderRadius: 16,
              border: '1px dashed #CBD5E1'
            }}>
              <GraduationCap size={36} color="#94A3B8" style={{ marginBottom: 12 }} />
              <div style={{ fontSize: 14, fontWeight: 700, color: '#334155' }}>
                No Fee Obligations Logged
              </div>
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 4, maxWidth: 360, margin: '4px auto 16px auto' }}>
                Record tuition, exam fees, or library deposits to track payment installments and due dates.
              </div>
              <button
                onClick={() => setShowFeeModal(true)}
                className="btn btn-primary"
                style={{ padding: '8px 16px', fontSize: 12 }}
              >
                + Create First Fee Obligation
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {fees.items.map((fee) => {
                const paidPaise = fee.installments?.reduce((sum, i) => sum + i.amountPaise, 0) || 0;
                const remainingPaise = Math.max(0, fee.totalAmountPaise - paidPaise);
                const percent = Math.min(Math.round((paidPaise / fee.totalAmountPaise) * 100), 100);
                const isPaid = fee.status === 'paid' || remainingPaise === 0;

                return (
                  <div
                    key={fee._id}
                    style={{
                      padding: '18px 20px',
                      borderRadius: 16,
                      border: isPaid ? '1px solid #A7F3D0' : '1px solid #E2E8F0',
                      background: isPaid ? '#F0FDF4' : '#FFFFFF',
                      boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>
                            {fee.title}
                          </span>
                          <span style={{
                            fontSize: 10,
                            fontWeight: 800,
                            padding: '3px 8px',
                            borderRadius: 6,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            background: isPaid ? '#DCFCE7' : (paidPaise > 0 ? '#FEF3C7' : '#F1F5F9'),
                            color: isPaid ? '#15803D' : (paidPaise > 0 ? '#B45309' : '#475569')
                          }}>
                            {isPaid ? 'Paid in Full' : (paidPaise > 0 ? 'Partially Paid' : 'Unpaid')}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: '#64748B', marginTop: 4, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 600, color: '#334155' }}>{fee.semester}</span>
                          <span>·</span>
                          <span>Due: {formatDate(fee.dueDate)}</span>
                          {fee.notes && (
                            <>
                              <span>·</span>
                              <span style={{ fontStyle: 'italic', color: '#64748B' }}>"{fee.notes}"</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 18, fontWeight: 900, fontFamily: 'var(--font-heading)', color: '#0F172A' }}>
                          {formatRupees(fee.totalAmountPaise)}
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: isPaid ? '#15803D' : '#E11D48', marginTop: 2 }}>
                          {isPaid ? 'Cleared' : `${formatRupees(remainingPaise)} remaining`}
                        </div>
                      </div>
                    </div>

                    {/* Clean Installment Progress Bar */}
                    <div style={{ width: '100%', height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, overflow: 'hidden', marginBottom: 12 }}>
                      <div style={{
                        width: `${percent}%`,
                        height: '100%',
                        backgroundColor: isPaid ? '#10B981' : '#E11D48',
                        borderRadius: 3,
                        transition: 'width 0.3s ease'
                      }} />
                    </div>

                    {/* Bottom Status & Installment Action */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                      <div style={{ fontSize: 12, color: '#64748B', fontWeight: 500 }}>
                        {fee.installments?.length || 0} payment(s) made · {percent}% cleared
                      </div>

                      {!isPaid && (
                        <button
                          onClick={() => onPayFeeInstallment(fee)}
                          className="btn btn-secondary"
                          style={{
                            padding: '6px 14px',
                            fontSize: 12,
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            backgroundColor: '#FFFFFF',
                            borderColor: '#CBD5E1'
                          }}
                        >
                          <CreditCard size={14} color="#E11D48" /> Pay Installment
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. Two-Column Modular Layout: Supplies Breakdown + Recent Activity */}
      {(activeTab === 'all' || activeTab === 'expenses') && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 20
        }}>
          {/* Card A: Study Items & Supplies Breakdown */}
          <div className="card" style={{
            background: '#FFFFFF',
            borderRadius: 20,
            border: '1px solid #E2E8F0',
            padding: '24px',
            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Layers size={18} color="#E11D48" />
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Study Items & Supplies
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Object.keys(subcategoryTotals).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: '#94A3B8', fontSize: 13 }}>
                  No study supplies logged this month.
                </div>
              ) : (
                Object.entries(subcategoryTotals).map(([subcat, amountPaise]) => (
                  <div
                    key={subcat}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 14px',
                      background: '#F8FAFC',
                      borderRadius: 12,
                      border: '1px solid #EDF2F7'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        backgroundColor: '#FFE4E6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#E11D48'
                      }}>
                        <BookOpen size={14} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>
                        {subcat}
                      </span>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#0F172A' }}>
                      {formatRupees(amountPaise)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Card B: Recent Academic Activity Timeline */}
          <div className="card" style={{
            background: '#FFFFFF',
            borderRadius: 20,
            border: '1px solid #E2E8F0',
            padding: '24px',
            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Clock size={18} color="#E11D48" />
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Recent Academic Logs
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentAcademicTransactions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: '#94A3B8', fontSize: 13 }}>
                  No recent academic entries recorded.
                </div>
              ) : (
                recentAcademicTransactions.map((tx) => (
                  <div
                    key={tx._id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 12px',
                      borderBottom: '1px solid #F1F5F9'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                        {tx.subcategory || 'Academic Expense'}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                        {formatDate(tx.date)} {tx.note && `· ${tx.note}`}
                      </div>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#E11D48', fontFamily: 'var(--font-heading)' }}>
                      −{formatRupees(tx.amountPaise)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Fee Obligation Modal */}
      {showFeeModal && (
        <div className="modal-overlay" onClick={() => setShowFeeModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480, borderRadius: 20 }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 16 }}>
              Add College Fee Obligation
            </h3>

            {feeError && (
              <div style={{ padding: '10px 14px', background: '#FEE2E2', color: '#991B1B', borderRadius: 10, fontSize: 13, marginBottom: 16 }}>
                {feeError}
              </div>
            )}

            <form onSubmit={handleCreateFee}>
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label" style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6, display: 'block' }}>
                  Fee Title / Obligation
                </label>
                <input
                  type="text"
                  placeholder="e.g. Semester 5 Tuition & Exam Fee"
                  value={feeForm.title}
                  onChange={(e) => setFeeForm({ ...feeForm, title: e.target.value })}
                  className="form-input"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6, display: 'block' }}>
                    Total Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="25000"
                    value={feeForm.totalAmountRupees}
                    onChange={(e) => setFeeForm({ ...feeForm, totalAmountRupees: e.target.value })}
                    className="form-input"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1' }}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6, display: 'block' }}>
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={feeForm.dueDate}
                    onChange={(e) => setFeeForm({ ...feeForm, dueDate: e.target.value })}
                    className="form-input"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6, display: 'block' }}>
                    Fee Type
                  </label>
                  <select
                    value={feeForm.feeType}
                    onChange={(e) => setFeeForm({ ...feeForm, feeType: e.target.value })}
                    className="form-select"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1' }}
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
                  <label className="form-label" style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6, display: 'block' }}>
                    Semester / Year
                  </label>
                  <input
                    type="text"
                    value={feeForm.semester}
                    onChange={(e) => setFeeForm({ ...feeForm, semester: e.target.value })}
                    className="form-input"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 18 }}>
                <label className="form-label" style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6, display: 'block' }}>
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pay before hall ticket distribution"
                  value={feeForm.notes}
                  onChange={(e) => setFeeForm({ ...feeForm, notes: e.target.value })}
                  className="form-input"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
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