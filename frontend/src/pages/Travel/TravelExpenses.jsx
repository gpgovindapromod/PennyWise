import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { formatRupees, rupeesToPaise } from '../../services/currency';
import { 
  Receipt, 
  PlusCircle, 
  Search, 
  Trash2, 
  Edit2, 
  MapPin, 
  Calendar, 
  Filter, 
  X, 
  Hotel, 
  Fuel, 
  Utensils, 
  FileText
} from 'lucide-react';

export const TRAVEL_EXPENSE_CATEGORIES = [
  'Food and Meals',
  'Accommodation and Hotels',
  'Tips and Gratuities',
  'Transportation and Fuel',
  'Flight and Ticket Expenses',
  'Tour Guide Fees',
  'Entry Tickets and Sightseeing',
  'Driver Expenses',
  'Staff Expenses',
  'Visa and Documentation',
  'Travel Insurance',
  'Vehicle Rental',
  'Passenger-Related Expenses',
  'Marketing and Advertising',
  'Office and Administrative Expenses',
  'Miscellaneous Expenses'
];

export default function TravelExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [tripFilter, setTripFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    title: '',
    category: TRAVEL_EXPENSE_CATEGORIES[0],
    amountRupees: '',
    tripId: '',
    expenseDate: new Date().toISOString().split('T')[0],
    vendor: '',
    paymentMethod: 'cash',
    transactionReference: '',
    description: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [expRes, tripsRes] = await Promise.all([
        API.get('/travel/expenses', {
          params: {
            category: categoryFilter !== 'all' ? categoryFilter : undefined,
            tripId: tripFilter !== 'all' ? tripFilter : undefined,
            search
          }
        }),
        API.get('/travel/trips')
      ]);

      setExpenses(expRes.data.data?.expenses || []);
      setTrips(tripsRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [categoryFilter, tripFilter]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({
      title: '',
      category: TRAVEL_EXPENSE_CATEGORIES[0],
      amountRupees: '',
      tripId: '',
      expenseDate: new Date().toISOString().split('T')[0],
      vendor: '',
      paymentMethod: 'cash',
      transactionReference: '',
      description: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (e) => {
    setEditingId(e._id);
    setForm({
      title: e.title,
      category: e.category,
      amountRupees: (e.amountPaise / 100).toString(),
      tripId: e.tripId?._id || '',
      expenseDate: e.expenseDate ? new Date(e.expenseDate).toISOString().split('T')[0] : '',
      vendor: e.vendor || '',
      paymentMethod: e.paymentMethod || 'cash',
      transactionReference: e.transactionReference || '',
      description: e.description || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.amountRupees) return;

    try {
      const payload = {
        title: form.title,
        category: form.category,
        amountPaise: rupeesToPaise(form.amountRupees),
        tripId: form.tripId || null,
        expenseDate: form.expenseDate,
        vendor: form.vendor,
        paymentMethod: form.paymentMethod,
        transactionReference: form.transactionReference,
        description: form.description
      };

      if (editingId) {
        await API.put(`/travel/expenses/${editingId}`, payload);
      } else {
        await API.post('/travel/expenses', payload);
      }

      setShowModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save expense');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete expense "${title}"?`)) return;
    try {
      await API.delete(`/travel/expenses/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const totalExpensePaise = expenses.reduce((sum, e) => sum + (e.amountPaise || 0), 0);

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '28px 24px 80px 24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#BE123C', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              DISBURSEMENTS & COST LEDGER
            </span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0F172A', margin: 0 }}>
            Trip & General Business Expenses
          </h1>
          <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0 0' }}>
            Record hotel bookings, fuel, driver tips, entry tickets, tour guide fees, and company overheads
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="btn btn-primary"
          style={{ padding: '10px 18px', fontSize: 13, fontWeight: 700, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8, backgroundColor: '#BE123C', borderColor: '#BE123C' }}
        >
          <PlusCircle size={16} /> Record Expense
        </button>
      </div>

      {/* Overview Stat Card */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: '18px 20px', borderRadius: 12, border: '1px solid #E2E8F0', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Filtered Total Expenses</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#BE123C', marginTop: 2 }}>
            {formatRupees(totalExpensePaise)}
          </div>
        </div>
        <div style={{ fontSize: 12, color: '#64748B' }}>
          {expenses.length} expense records categorized
        </div>
      </div>

      {/* Filter Toolbar */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: '14px 18px', border: '1px solid #E2E8F0', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 240 }}>
          <Search size={16} color="#64748B" />
          <input
            type="text"
            placeholder="Search by vendor, title, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchData()}
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: 13 }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 12, outline: 'none' }}
            >
              <option value="all">All Categories</option>
              {TRAVEL_EXPENSE_CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>Trip:</span>
            <select
              value={tripFilter}
              onChange={(e) => setTripFilter(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 12, outline: 'none' }}
            >
              <option value="all">All Trips & General</option>
              {trips.map(t => (
                <option key={t._id} value={t._id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748B' }}>Loading expenses...</div>
      ) : expenses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 16px', backgroundColor: '#FFFFFF', borderRadius: 14, border: '1px solid #E2E8F0' }}>
          <Receipt size={32} color="#BE123C" style={{ marginBottom: 10 }} />
          <h3 style={{ margin: 0, color: '#0F172A', fontWeight: 800 }}>No expense records found</h3>
          <p style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
            Click "Record Expense" to add hotel costs, petrol, driver tips, or sightseeing permits.
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, borderRadius: 14, border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1.5px solid #E2E8F0', color: '#64748B', fontWeight: 800, fontSize: 11, textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 16px' }}>Date</th>
                  <th style={{ padding: '12px 16px' }}>Expense Title & Vendor</th>
                  <th style={{ padding: '12px 16px' }}>Category</th>
                  <th style={{ padding: '12px 16px' }}>Allocated Trip</th>
                  <th style={{ padding: '12px 16px' }}>Method</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Amount</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((e) => (
                  <tr key={e._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 16px', color: '#475569', fontWeight: 600 }}>
                      {new Date(e.expenseDate).toLocaleDateString('en-IN')}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 800, color: '#0F172A' }}>{e.title}</div>
                      {e.vendor && <div style={{ fontSize: 11, color: '#64748B' }}>Vendor: {e.vendor}</div>}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 700,
                        backgroundColor: '#FFF1F2',
                        color: '#BE123C'
                      }}>
                        {e.category}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {e.tripId ? (
                        <div style={{ fontWeight: 700, color: '#0284C7' }}>{e.tripId.name}</div>
                      ) : (
                        <span style={{ fontSize: 11, color: '#94A3B8', fontStyle: 'italic' }}>Company Overhead</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ textTransform: 'uppercase', fontSize: 10, fontWeight: 800, color: '#475569' }}>
                        {e.paymentMethod}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 900, color: '#BE123C', fontFamily: 'var(--font-heading)' }}>
                      −{formatRupees(e.amountPaise)}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <button
                          onClick={() => handleOpenEdit(e)}
                          style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: 4 }}
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(e._id, e.title)}
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
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ fontSize: 18, fontWeight: 900, margin: 0, color: '#0F172A' }}>
                {editingId ? 'Edit Travel Expense' : 'Record Travel Expense'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">Expense Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Hotel Snow Valley 3 Nights, Tempo Diesel Refill, Driver Food"
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
                    {TRAVEL_EXPENSE_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Amount (₹) *</label>
                  <input
                    type="number"
                    placeholder="8500"
                    value={form.amountRupees}
                    onChange={(e) => setForm({ ...form, amountRupees: e.target.value })}
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
                    <option value="">-- General Company Overhead --</option>
                    {trips.map(t => (
                      <option key={t._id} value={t._id}>{t.name} ({t.destination})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Vendor / Recipient</label>
                  <input
                    type="text"
                    placeholder="e.g. HP Petrol Pump, Snow Valley Resort"
                    value={form.vendor}
                    onChange={(e) => setForm({ ...form, vendor: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div className="form-group">
                  <label className="form-label">Expense Date</label>
                  <input
                    type="date"
                    value={form.expenseDate}
                    onChange={(e) => setForm({ ...form, expenseDate: e.target.value })}
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
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="bank_transfer">Bank Transfer / NEFT</option>
                    <option value="card">Company Card</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 18 }}>
                <label className="form-label">Notes & Reference</label>
                <input
                  type="text"
                  placeholder="Bill #, driver tip receipt, toll booth receipt..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="form-input"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', fontSize: 14, fontWeight: 700, borderRadius: 10, backgroundColor: '#BE123C', borderColor: '#BE123C' }}
              >
                {editingId ? 'Update Expense Record' : 'Save Expense Record'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
