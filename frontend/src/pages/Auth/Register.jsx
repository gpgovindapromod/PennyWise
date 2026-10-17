import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle, Loader2, Mail, CheckCircle2, ArrowLeft, RefreshCw } from 'lucide-react';

export default function Register() {
  const [step, setStep] = useState('details'); // 'details' | 'otp'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [college, setCollege] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  // Step 1: Send OTP to student email
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMsg('');

    if (!name.trim() || !email.trim() || !password) {
      setError('Please provide your name, email, and password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/auth/register-otp', {
        name: name.trim(),
        email: email.trim(),
        password,
        college: college.trim()
      });
      setStep('otp');
      setInfoMsg(res.data.message || `Verification code sent to ${email.trim()}`);
      if (res.data.devOtp) {
        setInfoMsg(`Code sent! (Dev Auto-fill: ${res.data.devOtp})`);
        setOtp(res.data.devOtp);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setError('');
    setResending(true);
    try {
      const res = await API.post('/auth/register-otp', {
        name: name.trim(),
        email: email.trim(),
        password,
        college: college.trim()
      });
      setInfoMsg(res.data.message || `New code sent to ${email.trim()}`);
      if (res.data.devOtp) {
        setOtp(res.data.devOtp);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  // Step 2: Verify OTP and finalize profile creation
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.trim().length < 6) {
      setError('Please enter the 6-digit verification code sent to your email.');
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/auth/verify-register', {
        email: email.trim(),
        otp: otp.trim()
      });
      login(res.data.data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'var(--color-neutral-bg)', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
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
          {step === 'details' ? (
            <>
              <h2 style={{ fontSize: 20, color: 'var(--color-chocolate)', marginBottom: 6, fontWeight: 700 }}>
                Create student account
              </h2>
              <p style={{ fontSize: 13, color: 'var(--color-chocolate-light)', marginBottom: 20 }}>
                We'll verify your email with a secure 6-digit OTP code
              </p>

              {error && (
                <div style={{ padding: '10px 14px', background: 'var(--color-expense-bg)', color: 'var(--color-expense)', borderRadius: 'var(--radius-md)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <form onSubmit={handleRequestOtp}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-input"
                    required
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email address</label>
                  <input
                    type="email"
                    placeholder="rahul@college.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">College / University</label>
                  <input
                    type="text"
                    placeholder="e.g. Model Engineering College"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Password (min 6 characters)</label>
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
                      <Loader2 size={16} className="animate-spin" /> Sending Verification Code...
                    </>
                  ) : (
                    <>
                      <Mail size={16} /> Send Email OTP
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <button
                  type="button"
                  onClick={() => { setStep('details'); setError(''); }}
                  style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: 4 }}
                  title="Back to details"
                >
                  <ArrowLeft size={18} />
                </button>
                <h2 style={{ fontSize: 20, color: 'var(--color-chocolate)', margin: 0, fontWeight: 700 }}>
                  Enter 6-Digit Code
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

              <form onSubmit={handleVerifyOtp}>
                <div className="form-group">
                  <label className="form-label">Email Verification OTP</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="form-input"
                    style={{ textAlign: 'center', fontSize: 24, letterSpacing: 8, fontWeight: 800, fontFamily: 'monospace' }}
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
                      <Loader2 size={16} className="animate-spin" /> Verifying Code...
                    </>
                  ) : (
                    'Verify & Create Account'
                  )}
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, fontSize: 12 }}>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resending}
                    style={{ background: 'none', border: 'none', color: 'var(--color-burgundy)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <RefreshCw size={12} className={resending ? 'animate-spin' : ''} /> Resend Code
                  </button>
                  <button
                    type="button"
                    onClick={() => { setStep('details'); setError(''); }}
                    style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
                  >
                    Change Email
                  </button>
                </div>
              </form>
            </>
          )}

          <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--color-chocolate-light)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--color-burgundy)', fontWeight: 600, textDecoration: 'none' }}>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}