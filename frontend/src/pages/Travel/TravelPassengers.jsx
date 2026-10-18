import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { formatRupees, rupeesToPaise } from '../../services/currency';
import { 
  Users, 
  PlusCircle, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard, 
  Edit2, 
  Trash2, 
  X, 
  CheckCircle2, 
  Clock,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TravelPassengers() {
  const [passengers, setPassengers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
    tripId: '',
    seatsBooked: '1',
    packagePriceRupees: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [paxRes, tripsRes] = await Promise.all([
        API.get('/travel/passengers', { params: { search } }),
        API.get('/travel/trips')
      ]);
      setPassengers(paxRes.data.data || []);
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({
      name: '',
      phone: '',
      email: '',
      address: '',
      notes: '',
      tripId: trips.length > 0 ? trips[0]._id : '',
      seatsBooked: '1',
      packagePriceRupees: trips.length > 0 ? (trips[0].packagePricePaise / 100).toString() : ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (p) => {
    setEditingId(p._id);
    setForm({
      name: p.name,
      phone: p.phone,
      email: p.email || '',
      address: p.address || '',
      notes: p.notes || '',
      tripId: '',
      seatsBooked: '1',
      packagePriceRupees: ''
    });
    setShowModal(true);
  };

  const handleTripSelectChange = (tripId) => {
    const trip = trips.find(t => t._id === tripId);
    setForm({
      ...form,
      tripId,
      packagePriceRupees: trip ? (trip.packagePricePaise / 100).toString() : form.packagePriceRupees
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put(`/travel/passengers/${editingId}`, {
          name: form.name,
          phone: form.phone,
          email: form.email,
          address: form.address,
          notes: form.notes
        });
      } else {
        await API.post('/travel/passengers', {
          name: form.name,
          phone: form.phone,
          email: form.email,
          address: form.address,
          notes: form.notes,
          tripId: form.tripId || undefined,
          seatsBooked: parseInt(form.seatsBooked, 10) || 1,
          packagePricePaise: form.packagePriceRupees ? rupeesToPaise(form.packagePriceRupees) : undefined
        });
      }

      setShowModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save passenger');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name}?`)) return;
    try {
      await API.delete(`/travel/passengers/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Cannot delete passenger with payment history');
    }
  };

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '28px 24px 80px 24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#0284C7', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              PASSENGER DIRECTORY
            </span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0F172A', margin: 0 }}>
            Passengers & Travel Bookings
          </h1>
          <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0 0' }}>
            Manage client profiles, seat bookings, package assignments, and individual payment balances
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="btn btn-primary"
          style={{ padding: '10px 18px', fontSize: 13, fontWeight: 700, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8, backgroundColor: '#0284C7', borderColor: '#0284C7' }}
        >
          <PlusCircle size={16} /> Register Passenger
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: '14px 18px', border: '1px solid #E2E8F0', marginBottom: 20 }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Search size={16} color="#64748B" />
          <input
            type="text"
            placeholder="Search passenger by full name, phone number, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: 13 }}
          />
        </form>
      </div>

      {/* Passengers Table / Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748B' }}>Loading passengers...</div>
      ) : passengers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 16px', backgroundColor: '#FFFFFF', borderRadius: 14, border: '1px solid #E2E8F0' }}>
          <Users size={32} color="#0284C7" style={{ marginBottom: 10 }} />
          <h3 style={{ margin: 0, color: '#0F172A', fontWeight: 800 }}>No passengers registered</h3>
          <p style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
            Click "Register Passenger" to add your first passenger and associate them with a trip package.
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: '0', borderRadius: 14, border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1.5px solid #E2E8F0', color: '#64748B', fontWeight: 800, fontSize: 11, textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 16px' }}>Passenger Name & Contact</th>
                  <th style={{ padding: '12px 16px' }}>Booked Trips</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Total Booked</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Amount Paid</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Balance Due</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {passengers.map((p) => (
                  <tr key={p._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 800, color: '#0F172A', fontSize: 14 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: '#64748B', display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                        <span><Phone size={10} style={{ display: 'inline', marginRight: 2 }} /> {p.phone}</span>
                        {p.email && <span><Mail size={10} style={{ display: 'inline', marginRight: 2 }} /> {p.email}</span>}
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      {p.bookings && p.bookings.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {p.bookings.map(b => (
                            <span key={b._id} style={{ fontSize: 12, fontWeight: 700, color: '#0284C7' }}>
                              • {b.tripId?.name || 'Assigned Tour'} ({b.seatsBooked} {b.seatsBooked > 1 ? 'seats' : 'seat'})
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: '#94A3B8' }}>No active bookings</span>
                      )}
                    </td>

                    <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 800, color: '#0F172A' }}>
                      {formatRupees(p.totalBookedPaise || 0)}
                    </td>

                    <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 800, color: '#16A34A' }}>
                      {formatRupees(p.totalPaidPaise || 0)}
                    </td>

                    <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 900, color: (p.balancePaise || 0) > 0 ? '#D97706' : '#15803D' }}>
                      {formatRupees(p.balancePaise || 0)}
                    </td>

                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: 6,
                        fontSize: 10,
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        backgroundColor: p.paymentStatus === 'paid' ? '#DCFCE7' : (p.paymentStatus === 'partially_paid' ? '#FEF3C7' : '#FEE2E2'),
                        color: p.paymentStatus === 'paid' ? '#166534' : (p.paymentStatus === 'partially_paid' ? '#92400E' : '#991B1B')
                      }}>
                        {p.paymentStatus ? p.paymentStatus.replace('_', ' ') : 'Pending'}
                      </span>
                    </td>

                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <Link
                          to="/travel/payments"
                          style={{
                            padding: '4px 8px',
                            borderRadius: 6,
                            backgroundColor: '#F0F9FF',
                            color: '#0284C7',
                            fontSize: 11,
                            fontWeight: 700,
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 2
                          }}
                          title="Record payment for this passenger"
                        >
                          <CreditCard size={12} /> Pay
                        </Link>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: 4 }}
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(p._id, p.name)}
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

      {/* Registration Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ fontSize: 18, fontWeight: 900, margin: 0, color: '#0F172A' }}>
                {editingId ? 'Edit Passenger Profile' : 'Register Passenger & Book Tour'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Aarav Patel"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="passenger@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="form-input"
                />
              </div>

              {!editingId && (
                <div style={{ backgroundColor: '#F0F9FF', padding: '14px', borderRadius: 10, border: '1px solid #BAE6FD', marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#0369A1', marginBottom: 8 }}>
                    Optional: Link Passenger to a Trip Booking
                  </div>

                  <div className="form-group" style={{ marginBottom: 10 }}>
                    <label className="form-label" style={{ fontSize: 11 }}>Select Trip Package</label>
                    <select
                      value={form.tripId}
                      onChange={(e) => handleTripSelectChange(e.target.value)}
                      className="form-input"
                    >
                      <option value="">-- No trip right now (Register passenger only) --</option>
                      {trips.map(t => (
                        <option key={t._id} value={t._id}>{t.name} ({t.destination}) - ₹{(t.packagePricePaise / 100).toLocaleString('en-IN')}</option>
                      ))}
                    </select>
                  </div>

                  {form.tripId && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: 11 }}>Seats Booked</label>
                        <input
                          type="number"
                          min="1"
                          value={form.seatsBooked}
                          onChange={(e) => setForm({ ...form, seatsBooked: e.target.value })}
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: 11 }}>Rate / Seat (₹)</label>
                        <input
                          type="number"
                          value={form.packagePriceRupees}
                          onChange={(e) => setForm({ ...form, packagePriceRupees: e.target.value })}
                          className="form-input"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="form-group" style={{ marginBottom: 18 }}>
                <label className="form-label">Passenger Notes / Dietary Requirements</label>
                <textarea
                  rows={2}
                  placeholder="Vegetarian meal, window seat preference, senior citizen..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="form-input"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', fontSize: 14, fontWeight: 700, borderRadius: 10, backgroundColor: '#0284C7', borderColor: '#0284C7' }}
              >
                {editingId ? 'Save Profile Changes' : 'Confirm Passenger & Save'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
