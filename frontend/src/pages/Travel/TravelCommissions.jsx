import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { formatRupees, rupeesToPaise } from '../../services/currency';
import { 
  Percent, 
  PlusCircle, 
  Search, 
  Trash2, 
  Edit2, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  X,
  Hotel,
  Plane
} from 'lucide-react';

export const COMMISSION_CATEGORIES = [
  'Hotel Booking Commissions',
  'Flight Booking Commissions',
  'Travel Agent Commissions',
  'Tour Package Commissions',
  'Transport Provider Commissions',
  'Third-Party Booking Commissions',
  'Referral Commissions',
  'Other Commissions'
];

export default function TravelCommissions() {
  const [commissions, setCommissions] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    title: '',
    category: COMMISSION_CATEGORIES[0],
    tripId: '',
    amountEarnedRupees: '',
    amountReceivedRupees: '',
    dateEarned: new Date().toISOString().split('T')[0],
    dateReceived: '',
    paymentMethod: 'bank_transfer',
    transactionReference: '',
    status: 'pending',
    notes: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [commRes, tripsRes] = await Promise.all([
        API.get('/travel/commissions'),
        API.get('/travel/trips')
      ]);
      setCommissions(commRes.data.data?.commissions || []);
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

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({
      title: '',
      category: COMMISSION_CATEGORIES[0],
      tripId: '',
      amountEarnedRupees: '',
      amountReceivedRupees: '',
      dateEarned: new Date().toISOString().split('T')[0],
      dateReceived: '',
      paymentMethod: 'bank_transfer',
      transactionReference: '',
      status: 'pending',
      notes: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (c) => {
    setEditingId(c._id);
    setForm({
      title: c.title,
      category: c.category,
      tripId: c.tripId?._id || '',
      amountEarnedRupees: (c.amountEarnedPaise / 100).toString(),
      amountReceivedRupees: (c.amountReceivedPaise / 100).toString(),
      dateEarned: c.dateEarned ? new Date(c.dateEarned).toISOString().split('T')[0] : '',
      dateReceived: c.dateReceived ? new Date(c.dateReceived).toISOString().split('T')[0] : '',
      paymentMethod: c.paymentMethod || 'bank_transfer',
      transactionReference: c.transactionReference || '',
      status: c.status || 'pending',
      notes: c.notes || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.amountEarnedRupees) return;

    try {
      const payload = {
        title: form.title,
        category: form.category,
        tripId: form.tripId || null,
        amountEarnedPaise: rupeesToPaise(form.amountEarnedRupees),
        amountReceivedPaise: form.amountReceivedRupees ? rupeesToPaise(form.amountReceivedRupees) : 0,
        dateEarned: form.dateEarned,
        dateReceived: form.dateReceived || null,
        paymentMethod: form.paymentMethod,
        transactionReference: form.transactionReference,
        status: form.status,
        notes: form.notes
      };

      if (editingId) {
        await API.put(`/travel/commissions/${editingId}`, payload);
      } else {
        await API.post('/travel/commissions', payload);
      }

      setShowModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save commission');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete commission record "${title}"?`)) return;
    try {
      await API.delete(`/travel/commissions/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const totalEarnedPaise = commissions.filter(c => c.status !== 'cancelled').reduce((sum, c) => sum + (c.amountEarnedPaise || 0), 0);
  const totalReceivedPaise = commissions.filter(c => c.status !== 'cancelled').reduce((sum, c) => sum + (c.amountReceivedPaise || 0), 0);
  const outstandingPaise = Math.max(0, totalEarnedPaise - totalReceivedPaise);

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '28px 24px 80px 24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              AFFILIATE & PARTNER REVENUE
            </span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0F172A', margin: 0 }}>
            Commissions Management
          </h1>
          <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0 0' }}>
            Track commissions earned from hotels, flights, tour partners, and monitor unpaid vendor payouts
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="btn btn-primary"
          style={{ padding: '10px 18px', fontSize: 13, fontWeight: 700, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8, backgroundColor: '#7C3AED', borderColor: '#7C3AED' }}
        >
          <PlusCircle size={16} /> Record Commission
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ padding: '18px', borderRadius: 12, backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Commissions Earned</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', marginTop: 4 }}>
            {formatRupees(totalEarnedPaise)}
          </div>
          <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>Hotel, flight & partner payouts</div>
        </div>

        <div className="card" style={{ padding: '18px', borderRadius: 12, backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#16A34A', textTransform: 'uppercase' }}>Commissions Received (Cash)</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#16A34A', marginTop: 4 }}>
            +{formatRupees(totalReceivedPaise)}
          </div>
          <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>Cleared in company bank accounts</div>
        </div>

        <div className="card" style={{ padding: '18px', borderRadius: 12, backgroundColor: '#FFFBEB', border: '1px solid #FDE68A' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#D97706', textTransform: 'uppercase' }}>Outstanding Commission Due</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#B45309', marginTop: 4 }}>
            {formatRupees(outstandingPaise)}
          </div>
          <div style={{ fontSize: 11, color: '#92400E', marginTop: 4 }}>Pending vendor disbursements</div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748B' }}>Loading commissions...</div>
      ) : commissions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 16px', backgroundColor: '#FFFFFF', borderRadius: 14, border: '1px solid #E2E8F0' }}>
          <Percent size={32} color="#7C3AED" style={{ marginBottom: 10 }} />
          <h3 style={{ margin: 0, color: '#0F172A', fontWeight: 800 }}>No commission records yet</h3>
          <p style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
            Record referral or booking commissions from hotels, airlines, or local transporters.
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, borderRadius: 14, border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1.5px solid #E2E8F0', color: '#64748B', fontWeight: 800, fontSize: 11, textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 16px' }}>Date</th>
                  <th style={{ padding: '12px 16px' }}>Title & Partner Source</th>
                  <th style={{ padding: '12px 16px' }}>Category</th>
                  <th style={{ padding: '12px 16px' }}>Associated Trip</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Earned</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Received</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {commissions.map((c) => (
                  <tr key={c._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>
                      {new Date(c.dateEarned).toLocaleDateString('en-IN')}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 800, color: '#0F172A' }}>{c.title}</div>
                      {c.notes && <div style={{ fontSize: 11, color: '#64748B' }}>{c.notes}</div>}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, backgroundColor: '#F5F3FF', color: '#7C3AED' }}>
                        {c.category}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#0284C7', fontWeight: 600 }}>
                      {c.tripId?.name || 'General / Multi-trip'}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: '#0F172A' }}>
                      {formatRupees(c.amountEarnedPaise)}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: '#16A34A' }}>
                      {formatRupees(c.amountReceivedPaise)}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: 6,
                        fontSize: 10,
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        backgroundColor: c.status === 'received' ? '#DCFCE7' : (c.status === 'partially_received' ? '#FEF3C7' : '#FEE2E2'),
                        color: c.status === 'received' ? '#166534' : (c.status === 'partially_received' ? '#92400E' : '#991B1B')
                      }}>
                        {c.status ? c.status.replace('_', ' ') : 'Pending'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <button
                          onClick={() => handleOpenEdit(c)}
                          style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: 4 }}
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(c._id, c.title)}
                          style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 4 }}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
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
                {editingId ? 'Edit Commission Record' : 'Record Commission'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">Commission Title / Partner *</label>
                <input
                  type="text"
                  placeholder="e.g. Radisson Hotel Group Referral, Air India Group Booking"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="form-input"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div className="form-group">
                  <label className="form-label">Commission Source *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="form-input"
                  >
                    {COMMISSION_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Associated Trip</label>
                  <select
                    value={form.tripId}
                    onChange={(e) => setForm({ ...form, tripId: e.target.value })}
                    className="form-input"
                  >
                    <option value="">-- General / No Trip --</option>
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
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div className="form-group">
                  <label className="form-label">Amount Earned (₹) *</label>
                  <input
                    type="number"
                    placeholder="2500"
                    value={form.amountEarnedRupees}
                    onChange={(e) => setForm({ ...form, amountEarnedRupees: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Amount Received (₹)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={form.amountReceivedRupees}
                    onChange={(e) => setForm({ ...form, amountReceivedRupees: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div className="form-group">
                  <label className="form-label">Date Earned</label>
                  <input
                    type="date"
                    value={form.dateEarned}
                    onChange={(e) => setForm({ ...form, dateEarned: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="form-input"
                  >
                    <option value="pending">Pending</option>
                    <option value="partially_received">Partially Received</option>
                    <option value="received">Received</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 18 }}>
                <label className="form-label">Notes & Reference</label>
                <input
                  type="text"
                  placeholder="Hotel invoice ref, voucher #, contact person..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="form-input"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', fontSize: 14, fontWeight: 700, borderRadius: 10, backgroundColor: '#7C3AED', borderColor: '#7C3AED' }}
              >
                {editingId ? 'Update Commission' : 'Save Commission'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
