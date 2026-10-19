import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { formatRupees, rupeesToPaise } from '../../services/currency';
import { 
  TrendingUp, 
  PlusCircle, 
  Search, 
  Trash2, 
  Edit2, 
  X,
  FileCheck
} from 'lucide-react';

export const OTHER_INCOME_CATEGORIES = [
  'Service Charges',
  'Booking Fees',
  'Cancellation Charges',
  'Tour Upgrades',
  'Additional Passenger Services',
  'Consulting or Planning Fees',
  'Other Miscellaneous Revenue'
];

export default function TravelOtherIncome() {
  const [incomes, setIncomes] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    title: '',
    category: OTHER_INCOME_CATEGORIES[0],
    tripId: '',
    amountEarnedRupees: '',
    paymentMethod: 'upi',
    transactionReference: '',
    dateEarned: new Date().toISOString().split('T')[0],
    status: 'received',
    notes: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [incRes, tripsRes] = await Promise.all([
        API.get('/travel/other-income'),
        API.get('/travel/trips')
      ]);
      setIncomes(incRes.data.data?.otherIncomes || []);
      setTrips(tripsRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.amountEarnedRupees) return;

    try {
      const payload = {
        title: form.title,
        category: form.category,
        tripId: form.tripId || null,
        amountEarnedPaise: rupeesToPaise(form.amountEarnedRupees),
        amountReceivedPaise: rupeesToPaise(form.amountEarnedRupees),
        paymentMethod: form.paymentMethod,
        transactionReference: form.transactionReference,
        dateEarned: form.dateEarned,
        status: form.status,
        notes: form.notes
      };

      await API.post('/travel/other-income', payload);
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save record');
    }
  };

  const totalEarnedPaise = incomes.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + (o.amountEarnedPaise || 0), 0);

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '28px 24px 80px 24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#0D9488', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              ANCILLARY REVENUE
            </span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0F172A', margin: 0 }}>
            Other Income & Ancillary Fees
          </h1>
          <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0 0' }}>
            Record tour upgrades, booking convenience fees, cancellation charges, and travel consulting fees
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary"
          style={{ padding: '10px 18px', fontSize: 13, fontWeight: 700, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8, backgroundColor: '#0D9488', borderColor: '#0D9488' }}
        >
          <PlusCircle size={16} /> Record Other Income
        </button>
      </div>

      {/* Summary Card */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: '18px 20px', borderRadius: 12, border: '1px solid #E2E8F0', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Total Ancillary Income</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#0D9488', marginTop: 2 }}>
            +{formatRupees(totalEarnedPaise)}
          </div>
        </div>
        <div style={{ fontSize: 12, color: '#64748B' }}>
          {incomes.length} ancillary revenue entries
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748B' }}>Loading other incomes...</div>
      ) : incomes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 16px', backgroundColor: '#FFFFFF', borderRadius: 14, border: '1px solid #E2E8F0' }}>
          <TrendingUp size={32} color="#0D9488" style={{ marginBottom: 10 }} />
          <h3 style={{ margin: 0, color: '#0F172A', fontWeight: 800 }}>No ancillary income recorded yet</h3>
          <p style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
            Record service charges, room upgrades, or cancellation fees using the button above.
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, borderRadius: 14, border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1.5px solid #E2E8F0', color: '#64748B', fontWeight: 800, fontSize: 11, textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 16px' }}>Date</th>
                  <th style={{ padding: '12px 16px' }}>Title & Description</th>
                  <th style={{ padding: '12px 16px' }}>Category</th>
                  <th style={{ padding: '12px 16px' }}>Trip</th>
                  <th style={{ padding: '12px 16px' }}>Method</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {incomes.map((o) => (
                  <tr key={o._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>
                      {new Date(o.dateEarned).toLocaleDateString('en-IN')}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 800, color: '#0F172A' }}>{o.title}</div>
                      {o.notes && <div style={{ fontSize: 11, color: '#64748B' }}>{o.notes}</div>}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, backgroundColor: '#CCFBF1', color: '#0F766E' }}>
                        {o.category}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#0284C7', fontWeight: 600 }}>
                      {o.tripId?.name || 'General Revenue'}
                    </td>
                    <td style={{ padding: '12px 16px', textTransform: 'uppercase', fontSize: 10, fontWeight: 800, color: '#475569' }}>
                      {o.paymentMethod}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 900, color: '#0D9488', fontFamily: 'var(--font-heading)' }}>
                      +{formatRupees(o.amountReceivedPaise || o.amountEarnedPaise)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ fontSize: 18, fontWeight: 900, margin: 0, color: '#0F172A' }}>
                Record Ancillary Income
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">Income Description *</label>
                <input
                  type="text"
                  placeholder="e.g. Deluxe Room Upgrade, Tour Planning Fee"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="form-input"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="form-input"
                  >
                    {OTHER_INCOME_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Amount (₹) *</label>
                  <input
                    type="number"
                    placeholder="1200"
                    value={form.amountEarnedRupees}
                    onChange={(e) => setForm({ ...form, amountEarnedRupees: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div className="form-group">
                  <label className="form-label">Associated Trip</label>
                  <select
                    value={form.tripId}
                    onChange={(e) => setForm({ ...form, tripId: e.target.value })}
                    className="form-input"
                  >
                    <option value="">-- General / Multi-trip --</option>
                    {trips.map(t => {
                      const dep = t.departureDate ? new Date(t.departureDate).toLocaleDateString('en-IN') : '';
                      const ret = t.returnDate ? new Date(t.returnDate).toLocaleDateString('en-IN') : '';
                      const dateStr = dep && ret ? ` (${dep} → ${ret})` : (dep ? ` (${dep})` : '');
                      return (
                        <option key={t._id} value={t._id}>
                          {t.name} - {t.destination}{dateStr}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <select
                    value={form.paymentMethod}
                    onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                    className="form-input"
                  >
                    <option value="upi">UPI</option>
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="card">Card</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 18 }}>
                <label className="form-label">Notes & Reference</label>
                <input
                  type="text"
                  placeholder="Receipt #, passenger reference, notes..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="form-input"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', fontSize: 14, fontWeight: 700, borderRadius: 10, backgroundColor: '#0D9488', borderColor: '#0D9488' }}
              >
                Save Income Record
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
