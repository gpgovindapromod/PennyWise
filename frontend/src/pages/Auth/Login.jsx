import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  AlertCircle, 
  Loader2, 
  Mail, 
  CheckCircle2, 
  ArrowLeft, 
  KeyRound, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Lock, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export default function Login() {
  const [mode, setMode] = useState('login'); // 'login' | 'forgot' | 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
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
    <div className="auth-page-wrapper">
      <div className="auth-grid-overlay" />
      <div className="auth-container">
        {/* Brand header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div className="auth-header-badge">
            <Sparkles size={13} /> Student & Travel Financial Hub
          </div>
          <h1 className="auth-logo-text">pennywise</h1>
          <p className="auth-subheading">Know your money. Plan your month.</p>
        </div>

        {/* Form Card */}
        <div className="auth-glass-card">
          {mode === 'login' && (
            <>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: 22, color: '#FFFFFF', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
                  Sign in
                </h2>
                <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 4 }}>
                  Access your secure financial workspace
                </p>
              </div>

              {infoMsg && (
                <div className="auth-banner-success">
                  <CheckCircle2 size={16} /> <span>{infoMsg}</span>
                </div>
              )}

              {error && (
                <div className="auth-banner-error">
                  <AlertCircle size={16} /> <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="auth-input-group">
                  <label className="auth-label">Email address</label>
                  <div className="auth-input-wrapper">
                    <Mail size={17} className="auth-input-icon" />
                    <input
                      type="email"
                      placeholder="student@college.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="auth-input-field"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <div className="auth-label">
                    <span>Password</span>
                    <button
                      type="button"
                      onClick={() => { setMode('forgot'); setError(''); setInfoMsg(''); }}
                      className="auth-pill-link"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="auth-input-wrapper">
                    <Lock size={17} className="auth-input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="auth-input-field"
                      style={{ paddingRight: 42 }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="auth-password-toggle"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="auth-submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 size={17} className="animate-spin" /> Signing in...
                    </>
                  ) : (
                    'Sign In to Dashboard'
                  )}
                </button>
              </form>
            </>
          )}

          {mode === 'forgot' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); setInfoMsg(''); }}
                  style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 6, borderRadius: 8, display: 'flex', alignItems: 'center' }}
                  title="Back to login"
                >
                  <ArrowLeft size={16} />
                </button>
                <h2 style={{ fontSize: 20, color: '#FFFFFF', margin: 0, fontWeight: 700 }}>
                  Reset Password
                </h2>
              </div>
              <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 20 }}>
                Enter your registered email address to receive a secure 6-digit OTP code.
              </p>

              {error && (
                <div className="auth-banner-error">
                  <AlertCircle size={16} /> <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleRequestResetOtp}>
                <div className="auth-input-group">
                  <label className="auth-label">Registered Email</label>
                  <div className="auth-input-wrapper">
                    <Mail size={17} className="auth-input-icon" />
                    <input
                      type="email"
                      placeholder="student@college.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="auth-input-field"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="auth-submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 size={17} className="animate-spin" /> Sending Code...
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
                    style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: 12.5, cursor: 'pointer' }}
                  >
                    Cancel and return to login
                  </button>
                </div>
              </form>
            </>
          )}

          {mode === 'reset' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <button
                  type="button"
                  onClick={() => { setMode('forgot'); setError(''); }}
                  style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 6, borderRadius: 8, display: 'flex', alignItems: 'center' }}
                  title="Back"
                >
                  <ArrowLeft size={16} />
                </button>
                <h2 style={{ fontSize: 20, color: '#FFFFFF', margin: 0, fontWeight: 700 }}>
                  Set New Password
                </h2>
              </div>
              <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 20 }}>
                Verification code sent to <strong style={{ color: '#F8FAFC' }}>{email}</strong>
              </p>

              {infoMsg && (
                <div className="auth-banner-success">
                  <CheckCircle2 size={16} /> <span>{infoMsg}</span>
                </div>
              )}

              {error && (
                <div className="auth-banner-error">
                  <AlertCircle size={16} /> <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleConfirmReset}>
                <div className="auth-input-group">
                  <label className="auth-label">6-Digit Verification Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="auth-input-field"
                    style={{ textAlign: 'center', fontSize: 22, letterSpacing: 8, fontWeight: 800, fontFamily: 'monospace', paddingLeft: 14 }}
                    required
                    autoFocus
                  />
                </div>

                <div className="auth-input-group">
                  <label className="auth-label">New Password (min 6 characters)</label>
                  <div className="auth-input-wrapper">
                    <Lock size={17} className="auth-input-icon" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="auth-input-field"
                      style={{ paddingRight: 42 }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="auth-password-toggle"
                      aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                      tabIndex={-1}
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="auth-submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 size={17} className="animate-spin" /> Updating Password...
                    </>
                  ) : (
                    <>
                      <KeyRound size={16} /> Set New Password
                    </>
                  )}
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, fontSize: 12.5 }}>
                  <button
                    type="button"
                    onClick={handleRequestResetOtp}
                    style={{ background: 'none', border: 'none', color: '#FB7185', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
                  >
                    <RefreshCw size={13} /> Resend Code
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(''); }}
                    style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            </>
          )}

          <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: '#94A3B8' }}>
            Don't have an account yet?{' '}
            <Link to="/register" className="auth-pill-link">
              Create an account
            </Link>
          </div>

          <div className="auth-security-badge">
            <ShieldCheck size={14} color="#10B981" />
            <span>End-to-end encrypted · Anti-Injection Protected</span>
          </div>
        </div>
      </div>
    </div>
  );
}
