import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle, Loader2, Mail, CheckCircle2, ArrowLeft, KeyRound, RefreshCw } from 'lucide-react';

export default function Login() {
  const [mode, setMode] = useState('login'); // 'login' | 'forgot' | 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  // Handle standard password login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/auth/login', { email: email.trim(), password });
      login(res.data.data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password - Request 6-digit OTP
  const handleRequestResetOtp = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMsg('');

    if (!email.trim()) {
      setError('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/auth/forgot-password', { email: email.trim() });
      setMode('reset');
      setInfoMsg(res.data.message || `Password reset code sent to ${email.trim()}`);
      if (res.data.devOtp) {
        setInfoMsg(`Code sent! (Dev Auto-fill: ${res.data.devOtp})`);
        setOtp(res.data.devOtp);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  // Handle Reset Password with OTP & new password
  const handleConfirmReset = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.trim().length < 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/auth/reset-password', {
        email: email.trim(),
        otp: otp.trim(),
        newPassword
      });
      setMode('login');
      setInfoMsg(res.data.message || 'Password reset successful! Please sign in.');
      setPassword('');
      setOtp('');
      setNewPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'var(--color-neutral-bg)', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Brand header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 36, color: 'var(--color-burgundy)', letterSpacing: '-0.02em', marginBottom: 6 }}>
            pennywise
          </h1>
          <p style={{ fontSize: 14, color: 'var(--color-chocolate-light)' }}>
            Know your money. Plan your month.
          </p>
        </div>

        {/* Form Card */}
        <div className="card" style={{ padding: 32 }}>
          {mode === 'login' && (
            <>
              <h2 style={{ fontSize: 20, color: 'var(--color-chocolate)', marginBottom: 6, fontWeight: 700 }}>
                Sign in to your account
              </h2>
              <p style={{ fontSize: 13, color: 'var(--color-chocolate-light)', marginBottom: 20 }}>
                Access your student financial workspace
              </p>

              {infoMsg && (
                <div style={{ padding: '10px 14px', background: '#F0FDF4', color: '#15803D', borderRadius: 'var(--radius-md)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <CheckCircle2 size={16} /> {infoMsg}
                </div>
              )}

              {error && (
                <div style={{ padding: '10px 14px', background: 'var(--color-expense-bg)', color: 'var(--color-expense)', borderRadius: 'var(--radius-md)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Email address</label>
                  <input
                    type="email"
                    placeholder="student@college.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                    required
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label className="form-label" style={{ margin: 0 }}>Password</label>
                    <button
                      type="button"
                      onClick={() => { setMode('forgot'); setError(''); setInfoMsg(''); }}
                      style={{ background: 'none', border: 'none', color: 'var(--color-burgundy)', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0 }}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  style={{ width: '100%', padding: '12px 16px', fontSize: 15, marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>
            </>
          )}

          {mode === 'forgot' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); setInfoMsg(''); }}
                  style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: 4 }}
                  title="Back to login"
                >
                  <ArrowLeft size={18} />
                </button>
                <h2 style={{ fontSize: 20, color: 'var(--color-chocolate)', margin: 0, fontWeight: 700 }}>
                  Reset Password
                </h2>
              </div>
              <p style={{ fontSize: 13, color: 'var(--color-chocolate-light)', marginBottom: 20 }}>
                Enter your email address and we'll send a 6-digit verification code
              </p>

              {error && (
                <div style={{ padding: '10px 14px', background: 'var(--color-expense-bg)', color: 'var(--color-expense)', borderRadius: 'var(--radius-md)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <form onSubmit={handleRequestResetOtp}>
                <div className="form-group">
                  <label className="form-label">Registered Email</label>
                  <input
                    type="email"
                    placeholder="student@college.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                    required
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  style={{ width: '100%', padding: '12px 16px', fontSize: 15, marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Sending Code...
                    </>
                  ) : (
                    <>
                      <Mail size={16} /> Send Password Reset OTP
                    </>
                  )}
                </button>

                <div style={{ textAlign: 'center', marginTop: 16 }}>
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(''); }}
                    style={{ background: 'none', border: 'none', color: '#64748B', fontSize: 12, cursor: 'pointer' }}
                  >
                    Cancel and return to login
                  </button>
                </div>
              </form>
            </>
          )}

          {mode === 'reset' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <button
                  type="button"
                  onClick={() => { setMode('forgot'); setError(''); }}
                  style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: 4 }}
                  title="Back"
                >
                  <ArrowLeft size={18} />
                </button>
                <h2 style={{ fontSize: 20, color: 'var(--color-chocolate)', margin: 0, fontWeight: 700 }}>
                  Enter Code & New Password
                </h2>
              </div>
              <p style={{ fontSize: 13, color: 'var(--color-chocolate-light)', marginBottom: 20 }}>
                Verification code sent to <strong>{email}</strong>
              </p>

              {infoMsg && (
                <div style={{ padding: '10px 14px', background: '#F0FDF4', color: '#15803D', borderRadius: 'var(--radius-md)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <CheckCircle2 size={16} /> {infoMsg}
                </div>
              )}

              {error && (
                <div style={{ padding: '10px 14px', background: 'var(--color-expense-bg)', color: 'var(--color-expense)', borderRadius: 'var(--radius-md)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <form onSubmit={handleConfirmReset}>
                <div className="form-group">
                  <label className="form-label">6-Digit Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="form-input"
                    style={{ textAlign: 'center', fontSize: 22, letterSpacing: 6, fontWeight: 800, fontFamily: 'monospace' }}
                    required
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">New Password (min 6 characters)</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  style={{ width: '100%', padding: '12px 16px', fontSize: 15, marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Updating Password...
                    </>
                  ) : (
                    <>
                      <KeyRound size={16} /> Set New Password
                    </>
                  )}
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, fontSize: 12 }}>
                  <button
                    type="button"
                    onClick={handleRequestResetOtp}
                    style={{ background: 'none', border: 'none', color: 'var(--color-burgundy)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <RefreshCw size={12} /> Resend Code
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(''); }}
                    style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            </>
          )}

          <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--color-chocolate-light)' }}>
            Don't have an account yet?{' '}
            <Link to="/register" style={{ color: 'var(--color-burgundy)', fontWeight: 600, textDecoration: 'none' }}>
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}