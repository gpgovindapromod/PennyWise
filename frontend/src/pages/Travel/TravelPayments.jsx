import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { formatRupees, rupeesToPaise } from '../../services/currency';
import { 
  CreditCard, 
  PlusCircle, 
  RotateCcw, 
  Search, 
  Calendar, 
  Users, 
  MapPin, 
  CheckCircle2, 
  AlertCircle,
  X,
  FileText
} from 'lucide-react';

export default function TravelPayments() {
  const [payments, setPayments] = useState([]);
  const [trips, setTrips] = useState([]);
  const [passengers, setPassengers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [paymentTypeFilter, setPaymentTypeFilter] = useState('all');

  const [form, setForm] = useState({
    passengerId: '',
    tripId: '',
    amountRupees: '',
    paymentMethod: 'upi',
    transactionReference: '',
    paymentDate: new Date().toISOString().split('T')[0],
    type: 'payment',
    notes: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [payRes, tripsRes, paxRes] = await Promise.all([
        API.get('/travel/payments', { params: { type: paymentTypeFilter !== 'all' ? paymentTypeFilter : undefined } }),
        API.get('/travel/trips'),
        API.get('/travel/passengers')
      ]);
      setPayments(payRes.data.data || []);
      setTrips(tripsRes.data.data || []);
      setPassengers(paxRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [paymentTypeFilter]);

  const handleOpenModal = () => {
    setForm({
      passengerId: passengers.length > 0 ? passengers[0]._id : '',
      tripId: trips.length > 0 ? trips[0]._id : '',
      amountRupees: '',
      paymentMethod: 'upi',
      transactionReference: '',
      paymentDate: new Date().toISOString().split('T')[0],
      type: 'payment',
      notes: ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amountRupees || parseFloat(form.amountRupees) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      await API.post('/travel/payments', {
        passengerId: form.passengerId,
        tripId: form.tripId,
        amountPaise: rupeesToPaise(form.amountRupees),
        paymentMethod: form.paymentMethod,
        transactionReference: form.transactionReference,
        paymentDate: form.paymentDate,
        type: form.type,
        notes: form.notes
      });

      setShowModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record payment');
    }
  };

  const totalCollectedPaise = payments.filter(p => p.type === 'payment').reduce((sum, p) => sum + p.amountPaise, 0);
  const totalRefundedPaise = payments.filter(p => p.type === 'refund').reduce((sum, p) => sum + p.amountPaise, 0);
  const netPaise = totalCollectedPaise - totalRefundedPaise;

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '28px 24px 80px 24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#16A34A', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              REVENUE & RECEIVABLES
            </span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0F172A', margin: 0 }}>
            Passenger Payments & Refunds
          </h1>
          <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0 0' }}>
            Record partial payments, advance booking deposits, installment collections, and process client refunds
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="btn btn-primary"
          style={{ padding: '10px 18px', fontSize: 13, fontWeight: 700, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8, backgroundColor: '#16A34A', borderColor: '#16A34A' }}
        >
          <PlusCircle size={16} /> Record Payment / Refund
        </button>
      </div>

      {/* KPI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ padding: '18px', borderRadius: 12, backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Gross Received</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#16A34A', marginTop: 4 }}>
            {formatRupees(totalCollectedPaise)}
          </div>
          <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>Advance deposits & installments</div>
        </div>

        <div className="card" style={{ padding: '18px', borderRadius: 12, backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Passenger Refunds Paid</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#BE123C', marginTop: 4 }}>
            −{formatRupees(totalRefundedPaise)}
          </div>
          <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>Cancellations & adjustments</div>
        </div>

        <div className="card" style={{ padding: '18px', borderRadius: 12, backgroundColor: '#0B132B', color: '#FFFFFF', border: '1px solid #1C2541' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#38BDF8', textTransform: 'uppercase' }}>Net Passenger Cash</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#FFFFFF', marginTop: 4 }}>
            {formatRupees(netPaise)}
          </div>
          <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>Gross Received − Refunds Paid</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: '12px 18px', border: '1px solid #E2E8F0', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>Filter Type:</span>
          <select
            value={paymentTypeFilter}
            onChange={(e) => setPaymentTypeFilter(e.target.value)}
            style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 12, outline: 'none', backgroundColor: '#F8FAFC' }}
          >
            <option value="all">All (Payments & Refunds)</option>
            <option value="payment">Collections / Payments Only</option>
            <option value="refund">Refunds Only</option>
          </select>
        </div>
        <div style={{ fontSize: 12, color: '#64748B' }}>
          Showing {payments.length} ledger payment records
        </div>
      </div>

      {/* Payments Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748B' }}>Loading payment ledger...</div>
      ) : payments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 16px', backgroundColor: '#FFFFFF', borderRadius: 14, border: '1px solid #E2E8F0' }}>
          <CreditCard size={32} color="#16A34A" style={{ marginBottom: 10 }} />
          <h3 style={{ margin: 0, color: '#0F172A', fontWeight: 800 }}>No payment entries recorded</h3>
          <p style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
            Record an advance deposit or passenger payment using the button above.
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, borderRadius: 14, border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1.5px solid #E2E8F0', color: '#64748B', fontWeight: 800, fontSize: 11, textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 16px' }}>Date</th>
                  <th style={{ padding: '12px 16px' }}>Passenger</th>
                  <th style={{ padding: '12px 16px' }}>Associated Trip</th>
                  <th style={{ padding: '12px 16px' }}>Method & Ref</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>Type</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => {
                  const isRefund = p.type === 'refund';

                  return (
                    <tr key={p._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 16px', color: '#475569', fontWeight: 600 }}>
                        {new Date(p.paymentDate).toLocaleDateString('en-IN')}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 800, color: '#0F172A' }}>{p.passengerId?.name || 'Passenger'}</div>
                        <div style={{ fontSize: 11, color: '#64748B' }}>{p.passengerId?.phone}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#0284C7' }}>{p.tripId?.name || 'General / Tour'}</div>
                        <div style={{ fontSize: 11, color: '#64748B' }}>{p.tripId?.destination}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: 4,
                          fontSize: 10,
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          backgroundColor: p.paymentMethod === 'upi' ? '#EFF6FF' : '#F1F5F9',
                          color: p.paymentMethod === 'upi' ? '#1D4ED8' : '#334155'
                        }}>
                          {p.paymentMethod}
                        </span>
                        {p.transactionReference && (
                          <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                            Ref: {p.transactionReference}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: 6,
                          fontSize: 10,
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          backgroundColor: isRefund ? '#FEE2E2' : '#DCFCE7',
                          color: isRefund ? '#991B1B' : '#166534'
                        }}>
                          {isRefund ? 'Refund' : 'Payment'}
                        </span>
                      </td>
                      <td style={{
                        padding: '12px 16px',
                        textAlign: 'right',
                        fontWeight: 900,
                        fontFamily: 'var(--font-heading)',
                        fontSize: 15,
                        color: isRefund ? '#BE123C' : '#15803D'
                      }}>
                        {isRefund ? '−' : '+'}{formatRupees(p.amountPaise)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ fontSize: 18, fontWeight: 900, margin: 0, color: '#0F172A' }}>
                Record Passenger Payment / Refund
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">Transaction Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, type: 'payment' })}
                    style={{
                      padding: '10px',
                      borderRadius: 8,
                      border: '1.5px solid',
                      borderColor: form.type === 'payment' ? '#16A34A' : '#CBD5E1',
                      backgroundColor: form.type === 'payment' ? '#F0FDF4' : '#FFFFFF',
                      color: form.type === 'payment' ? '#16A34A' : '#64748B',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Receive Payment
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, type: 'refund' })}
                    style={{
                      padding: '10px',
                      borderRadius: 8,
                      border: '1.5px solid',
                      borderColor: form.type === 'refund' ? '#BE123C' : '#CBD5E1',
                      backgroundColor: form.type === 'refund' ? '#FFF1F2' : '#FFFFFF',
                      color: form.type === 'refund' ? '#BE123C' : '#64748B',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Process Refund
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">Select Passenger *</label>
                <select
                  value={form.passengerId}
                  onChange={(e) => setForm({ ...form, passengerId: e.target.value })}
                  className="form-input"
                  required
                >
                  <option value="">-- Choose Passenger --</option>
                  {passengers.map(p => (
                    <option key={p._id} value={p._id}>{p.name} ({p.phone})</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">Select Trip / Tour Package *</label>
                <select
                  value={form.tripId}
                  onChange={(e) => setForm({ ...form, tripId: e.target.value })}
                  className="form-input"
                  required
                >
                  <option value="">-- Choose Trip --</option>
                  {trips.map(t => (
                    <option key={t._id} value={t._id}>{t.name} ({t.destination})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div className="form-group">
                  <label className="form-label">Amount (₹) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 5000"
                    value={form.amountRupees}
                    onChange={(e) => setForm({ ...form, amountRupees: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <select
                    value={form.paymentMethod}
                    onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                    className="form-input"
                  >
                    <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank NEFT / RTGS</option>
                    <option value="card">Debit / Credit Card</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    value={form.paymentDate}
                    onChange={(e) => setForm({ ...form, paymentDate: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Reference / Receipt #</label>
                  <input
                    type="text"
                    placeholder="UPI-123898"
                    value={form.transactionReference}
                    onChange={(e) => setForm({ ...form, transactionReference: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 18 }}>
                <label className="form-label">Notes</label>
                <input
                  type="text"
                  placeholder="Advance deposit, final settlement, etc."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="form-input"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', fontSize: 14, fontWeight: 700, borderRadius: 10, backgroundColor: form.type === 'refund' ? '#BE123C' : '#16A34A', borderColor: form.type === 'refund' ? '#BE123C' : '#16A34A' }}
              >
                {form.type === 'refund' ? 'Confirm & Record Refund' : 'Confirm & Save Payment'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
