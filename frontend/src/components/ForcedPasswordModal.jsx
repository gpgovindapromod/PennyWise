import React, { useState } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Lock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function ForcedPasswordModal() {
  const { user, updateUser } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Only render if user has mustChangePassword flag
  if (!user || !user.mustChangePassword) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword === '123456') {
      setError('You must choose a new password different from the initial temporary password.');
      return;
    }

    setLoading(true);
    try {
      await API.put('/auth/change-password', { newPassword });
      updateUser({ mustChangePassword: false });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999, backgroundColor: 'rgba(13, 17, 23, 0.85)', backdropFilter: 'blur(8px)' }}>
      <div className="modal-content" style={{ maxWidth: 440, padding: 32, borderRadius: 18, border: '1px solid #30363D', backgroundColor: '#161B22', color: '#F0F6FC' }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            backgroundColor: 'rgba(244, 63, 94, 0.15)',
            color: '#FB7185',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12
          }}>
            <Lock size={24} />
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 6px 0', color: '#FFFFFF' }}>
            Change Initial Password
          </h3>
          <p style={{ fontSize: 13, color: '#8B949E', margin: 0, lineHeight: 1.5 }}>
            Welcome to PennyWise Travel Company Management! For the security of your business and client records, please choose a private password.
          </p>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', backgroundColor: 'rgba(244, 63, 94, 0.15)', color: '#FB7185', borderRadius: 8, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label" style={{ color: '#C9D1D9' }}>New Private Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="form-input"
              style={{ backgroundColor: '#0D1117', borderColor: '#30363D', color: '#F0F6FC' }}
              required
              autoFocus
            />
          </div>

          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label" style={{ color: '#C9D1D9' }}>Confirm New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="form-input"
              style={{ backgroundColor: '#0D1117', borderColor: '#30363D', color: '#F0F6FC' }}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '12px 16px', fontSize: 14, fontWeight: 700, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Saving New Password...
              </>
            ) : (
              <>
                <CheckCircle2 size={16} /> Secure Account & Proceed
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
