import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Shield, CreditCard, RefreshCw, Check } from 'lucide-react';

export default function Settings() {
  const { user, logout } = useAuth();
  const [msg, setMsg] = useState('');

  return (
    <div style={{ maxWidth: 840, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, color: 'var(--color-burgundy)' }}>Settings & Preferences</h1>
        <p style={{ fontSize: 13, color: 'var(--color-chocolate-light)' }}>
          Manage your student profile, default currency, and local financial workspace
        </p>
      </div>

      {msg && (
        <div style={{ padding: '12px 16px', background: 'var(--color-income-bg)', color: 'var(--color-income)', borderRadius: 'var(--radius-md)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <Check size={16} /> {msg}
        </div>
      )}

      {/* Profile Card */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <User size={18} color="var(--color-burgundy)" />
          <h3 style={{ fontSize: 18, color: 'var(--color-burgundy)' }}>Personal Information</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-chocolate-light)' }}>Name</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-chocolate)', marginTop: 4 }}>
              {user?.name || 'Student'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-chocolate-light)' }}>Email</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-chocolate)', marginTop: 4 }}>
              {user?.email || 'student@college.edu'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-chocolate-light)' }}>Institution</div>
            <div style={{ fontSize: 15, color: 'var(--color-chocolate)', marginTop: 4 }}>
              {user?.college || 'Engineering College'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-chocolate-light)' }}>Default Currency</div>
            <div style={{ fontSize: 15, color: 'var(--color-chocolate)', marginTop: 4 }}>
              Indian Rupee — INR (₹)
            </div>
          </div>
        </div>
      </div>

      {/* Account Security & Design Guidelines */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <Shield size={18} color="var(--color-burgundy)" />
          <h3 style={{ fontSize: 18, color: 'var(--color-burgundy)' }}>Privacy & Data Isolation</h3>
        </div>

        <p style={{ fontSize: 13, color: 'var(--color-chocolate-light)', lineHeight: 1.6, marginBottom: 12 }}>
          Pennywise strictly isolates your records per user session with owner-scoped MongoDB queries.
          Amounts are stored with integer paise precision to eliminate floating-point penny rounding inaccuracies.
        </p>

        <div style={{ padding: '12px 14px', background: 'var(--color-neutral-surface)', borderRadius: 'var(--radius-md)', fontSize: 12, color: 'var(--color-chocolate-light)' }}>
          Design standard: Clean white background mode only, without distracting dark mode toggles or AI gradients.
        </div>
      </div>

      {/* Data Management & Wipe Demo Data */}
      <div className="card" style={{ marginBottom: 20, borderColor: 'var(--color-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <RefreshCw size={18} color="var(--color-burgundy)" />
          <h3 style={{ fontSize: 18, color: 'var(--color-burgundy)' }}>Data Management</h3>
        </div>
        <p style={{ fontSize: 13, color: 'var(--color-chocolate-light)', marginBottom: 16 }}>
          Start fresh with your own live expenses. Wiping will clear all sample transactions, reset cash balance to ₹0, and delete sample fee obligations.
        </p>
        <button
          onClick={async () => {
            if (window.confirm('Are you sure you want to clear all transactions and start fresh with ₹0 balance?')) {
              try {
                const API = (await import('../../services/api')).default;
                await API.post('/auth/reset-data');
                setMsg('All demo data cleared! Your dashboard now shows your live 0 balance.');
                setTimeout(() => window.location.href = '/', 1200);
              } catch (err) {
                alert('Failed to reset data');
              }
            }
          }}
          className="btn"
          style={{ background: 'var(--color-expense-bg)', color: 'var(--color-expense)', border: '1px solid #F5C6CB', fontSize: 13, fontWeight: 600 }}
        >
          Clear All Demo Data & Start Fresh
        </button>
      </div>

      {/* Session Action */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-chocolate)' }}>Sign out of Pennywise</div>
          <div style={{ fontSize: 12, color: 'var(--color-chocolate-light)' }}>End your current authenticated financial session</div>
        </div>
        <button onClick={logout} className="btn btn-secondary">
          Sign Out
        </button>
      </div>
    </div>

  );
}