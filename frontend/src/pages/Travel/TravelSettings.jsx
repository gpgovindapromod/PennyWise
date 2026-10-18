import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { 
  Settings, 
  Save, 
  Building, 
  Phone, 
  Mail, 
  MapPin, 
  Hash, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  Trash2
} from 'lucide-react';

export default function TravelSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const [form, setForm] = useState({
    companyName: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    currency: 'INR',
    receiptPrefix: 'TRV',
    customExpenseCategory: ''
  });

  const fetchSettings = async () => {
    try {
      const res = await API.get('/travel/settings');
      const data = res.data.data;
      setSettings(data);
      setForm({
        companyName: data.companyName || '',
        contactEmail: data.contactEmail || '',
        contactPhone: data.contactPhone || '',
        address: data.address || '',
        currency: data.currency || 'INR',
        receiptPrefix: data.receiptPrefix || 'TRV',
        customExpenseCategory: ''
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');

    try {
      await API.put('/travel/settings', {
        companyName: form.companyName,
        contactEmail: form.contactEmail,
        contactPhone: form.contactPhone,
        address: form.address,
        currency: form.currency,
        receiptPrefix: form.receiptPrefix
      });

      setMsg('Business settings updated successfully!');
      fetchSettings();
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 900, margin: '40px auto', padding: '0 24px', color: '#64748B' }}>
        Loading business preferences...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 24px 80px 24px' }}>
      
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#0284C7', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            CONFIGURATION
          </span>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0F172A', margin: 0 }}>
          Travel Company Business Settings
        </h1>
        <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0 0' }}>
          Configure tour agency identity, official contact details, receipt prefixing, and custom categories
        </p>
      </div>

      {msg && (
        <div style={{ padding: '12px 16px', backgroundColor: '#F0FDF4', color: '#166534', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, border: '1px solid #BBF7D0', fontWeight: 600, fontSize: 13 }}>
          <CheckCircle2 size={16} /> {msg}
        </div>
      )}

      {/* Settings Form */}
      <div className="card" style={{ padding: '28px', borderRadius: 16, border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
        <form onSubmit={handleSave}>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">Agency / Tour Operator Name *</label>
            <input
              type="text"
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              className="form-input"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div className="form-group">
              <label className="form-label">Official Contact Email</label>
              <input
                type="email"
                value={form.contactEmail}
                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Business Phone / Helpline</label>
              <input
                type="tel"
                value={form.contactPhone}
                onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">Office & Headquarter Address</label>
            <input
              type="text"
              placeholder="e.g. Shop 4B, MG Road, Ernakulam, Kerala 682016"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="form-input"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div className="form-group">
              <label className="form-label">Operating Currency</label>
              <select
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className="form-input"
              >
                <option value="INR">INR (₹) - Indian Rupee</option>
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="AED">AED (د.إ) - UAE Dirham</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Receipt / Voucher Number Prefix</label>
              <input
                type="text"
                value={form.receiptPrefix}
                onChange={(e) => setForm({ ...form, receiptPrefix: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary"
            style={{ padding: '12px 24px', fontSize: 14, fontWeight: 700, borderRadius: 10, backgroundColor: '#0284C7', borderColor: '#0284C7', display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Save size={16} /> {saving ? 'Saving...' : 'Save Company Settings'}
          </button>
        </form>
      </div>

    </div>
  );
}
