import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { formatRupees, rupeesToPaise } from '../../services/currency';
import { 
  MapPin, 
  PlusCircle, 
  Calendar, 
  Users, 
  TrendingUp, 
  Receipt, 
  Trash2, 
  Edit2, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  X,
  Search,
  Filter
} from 'lucide-react';

export default function TravelTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingTripId, setEditingTripId] = useState(null);

  const [form, setForm] = useState({
    name: '',
    destination: '',
    route: '',
    departureDate: '',
    returnDate: '',
    packageDescription: '',
    packagePriceRupees: '',
    maxCapacity: '30',
    status: 'upcoming',
    notes: ''
  });

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const res = await API.get('/travel/trips', {
        params: { search, status: statusFilter }
      });
      setTrips(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTrips();
  };

  const handleOpenCreate = () => {
    setEditingTripId(null);
    setForm({
      name: '',
      destination: '',
      route: '',
      departureDate: '',
      returnDate: '',
      packageDescription: '',
      packagePriceRupees: '',
      maxCapacity: '30',
      status: 'upcoming',
      notes: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (t) => {
    setEditingTripId(t._id);
    setForm({
      name: t.name,
      destination: t.destination,
      route: t.route || '',
      departureDate: t.departureDate ? new Date(t.departureDate).toISOString().split('T')[0] : '',
      returnDate: t.returnDate ? new Date(t.returnDate).toISOString().split('T')[0] : '',
      packageDescription: t.packageDescription || '',
      packagePriceRupees: (t.packagePricePaise / 100).toString(),
      maxCapacity: (t.maxCapacity || 30).toString(),
      status: t.status || 'upcoming',
      notes: t.notes || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        destination: form.destination,
        route: form.route,
        departureDate: form.departureDate,
        returnDate: form.returnDate,
        packageDescription: form.packageDescription,
        packagePricePaise: rupeesToPaise(form.packagePriceRupees),
        maxCapacity: parseInt(form.maxCapacity, 10) || 30,
        status: form.status,
        notes: form.notes
      };

      if (editingTripId) {
        await API.put(`/travel/trips/${editingTripId}`, payload);
      } else {
        await API.post('/travel/trips', payload);
      }

      setShowModal(false);
      fetchTrips();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save trip');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove or cancel "${name}"?`)) return;
    try {
      const res = await API.delete(`/travel/trips/${id}`);
      if (res.data?.message) alert(res.data.message);
      fetchTrips();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete trip');
    }
  };

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '28px 24px 80px 24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#0284C7', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              TOUR OPERATIONS
            </span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0F172A', margin: 0 }}>
            Trips & Tour Packages
          </h1>
          <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0 0' }}>
            Plan routes, track passenger bookings, monitor trip expenses, and calculate net trip profit
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="btn btn-primary"
          style={{ padding: '10px 18px', fontSize: 13, fontWeight: 700, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8, backgroundColor: '#0284C7', borderColor: '#0284C7' }}
        >
          <PlusCircle size={16} /> Create Tour Package
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: '14px 18px',
        border: '1px solid #E2E8F0',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12
      }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 260 }}>
          <Search size={16} color="#64748B" />
          <input
            type="text"
            placeholder="Search by trip title, destination, or route..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: 13, color: '#0F172A' }}
          />
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 12, outline: 'none', backgroundColor: '#F8FAFC' }}
          >
            <option value="all">All Statuses</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Trips Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748B' }}>Loading tour packages...</div>
      ) : trips.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 16px', backgroundColor: '#FFFFFF', borderRadius: 14, border: '1px solid #E2E8F0' }}>
          <MapPin size={32} color="#0284C7" style={{ marginBottom: 10 }} />
          <h3 style={{ margin: 0, color: '#0F172A', fontWeight: 800 }}>No trips found</h3>
          <p style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
            Click "Create Tour Package" above to launch a new trip.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 18 }}>
          {trips.map((t) => {
            const isProfit = (t.netProfitPaise || 0) >= 0;

            return (
              <div key={t._id} className="card" style={{ padding: '20px', borderRadius: 14, border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: 6,
                      fontSize: 10,
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      backgroundColor: t.status === 'completed' ? '#DCFCE7' : (t.status === 'ongoing' ? '#FEF3C7' : (t.status === 'cancelled' ? '#FEE2E2' : '#EFF6FF')),
                      color: t.status === 'completed' ? '#166534' : (t.status === 'ongoing' ? '#92400E' : (t.status === 'cancelled' ? '#991B1B' : '#1E40AF'))
                    }}>
                      {t.status}
                    </span>
                    <h3 style={{ fontSize: 17, fontWeight: 900, color: '#0F172A', margin: '8px 0 2px 0' }}>{t.name}</h3>
                    <div style={{ fontSize: 12, color: '#64748B', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={12} color="#0284C7" /> {t.destination}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      onClick={() => handleOpenEdit(t)}
                      style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: 4 }}
                      title="Edit trip"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(t._id, t.name)}
                      style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 4 }}
                      title="Delete or cancel trip"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {t.route && (
                  <div style={{ fontSize: 12, color: '#475569', marginBottom: 10, backgroundColor: '#F8FAFC', padding: '6px 10px', borderRadius: 6 }}>
                    <strong>Route:</strong> {t.route}
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12, color: '#64748B', marginBottom: 14 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Calendar size={13} /> {new Date(t.departureDate).toLocaleDateString('en-IN')} → {new Date(t.returnDate).toLocaleDateString('en-IN')}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Users size={13} /> {t.passengerCount || 0} / {t.maxCapacity || 30} Pax
                  </span>
                </div>

                {/* Financial Health Snapshot Card for this Trip */}
                <div style={{ marginTop: 'auto', backgroundColor: '#F8FAFC', padding: '12px', borderRadius: 10, border: '1px solid #F1F5F9' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 11, marginBottom: 8 }}>
                    <div>
                      <div style={{ color: '#64748B' }}>Package Rate</div>
                      <div style={{ fontWeight: 800, color: '#0F172A', fontSize: 13 }}>{formatRupees(t.packagePricePaise)} / Pax</div>
                    </div>
                    <div>
                      <div style={{ color: '#64748B' }}>Collected Income</div>
                      <div style={{ fontWeight: 800, color: '#16A34A', fontSize: 13 }}>+{formatRupees(t.collectedPassengerPaymentsPaise || 0)}</div>
                    </div>
                    <div>
                      <div style={{ color: '#64748B' }}>Trip Expenses</div>
                      <div style={{ fontWeight: 800, color: '#BE123C', fontSize: 13 }}>−{formatRupees(t.totalExpensesPaise || 0)}</div>
                    </div>
                    <div>
                      <div style={{ color: '#64748B' }}>Outstanding Due</div>
                      <div style={{ fontWeight: 800, color: '#D97706', fontSize: 13 }}>{formatRupees(t.outstandingPaymentsPaise || 0)}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', paddingTop: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Net Trip Profit</span>
                    <span style={{ fontSize: 15, fontWeight: 900, color: isProfit ? '#15803D' : '#BE123C', fontFamily: 'var(--font-heading)' }}>
                      {formatRupees(t.netProfitPaise || 0)}
                    </span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ fontSize: 18, fontWeight: 900, margin: 0, color: '#0F172A' }}>
                {editingTripId ? 'Edit Tour Package' : 'Create New Tour Package'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">Trip / Package Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Manali Snow Adventure 5D4N"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="form-input"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div className="form-group">
                  <label className="form-label">Destination *</label>
                  <input
                    type="text"
                    placeholder="e.g. Manali, Himachal Pradesh"
                    value={form.destination}
                    onChange={(e) => setForm({ ...form, destination: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Package Price / Pax (₹) *</label>
                  <input
                    type="number"
                    placeholder="15000"
                    value={form.packagePriceRupees}
                    onChange={(e) => setForm({ ...form, packagePriceRupees: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">Travel Route / Stops</label>
                <input
                  type="text"
                  placeholder="e.g. Delhi -> Chandigarh -> Kullu -> Manali"
                  value={form.route}
                  onChange={(e) => setForm({ ...form, route: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div className="form-group">
                  <label className="form-label">Departure Date *</label>
                  <input
                    type="date"
                    value={form.departureDate}
                    onChange={(e) => setForm({ ...form, departureDate: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Return Date *</label>
                  <input
                    type="date"
                    value={form.returnDate}
                    onChange={(e) => setForm({ ...form, returnDate: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div className="form-group">
                  <label className="form-label">Max Pax Capacity</label>
                  <input
                    type="number"
                    value={form.maxCapacity}
                    onChange={(e) => setForm({ ...form, maxCapacity: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Trip Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="form-input"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 18 }}>
                <label className="form-label">Tour Notes & Itinerary Highlights</label>
                <textarea
                  rows={2}
                  placeholder="Hotels booked, vehicle number, driver contact info..."
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
                {editingTripId ? 'Update Tour Package' : 'Launch Tour Package'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
