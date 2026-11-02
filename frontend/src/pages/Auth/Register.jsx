import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  AlertCircle, 
  Loader2, 
  Mail, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  RefreshCw, 
  ShieldCheck, 
  Sparkles,
  CheckCircle2,
  Check
} from 'lucide-react';

export default function Register() {
  const [step, setStep] = useState('details'); // 'details' | 'otp'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  // Password strength calculation
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { score: 1, label: 'Weak', color: '#EF4444' };
    if (score <= 3) return { score: 2, label: 'Fair', color: '#F59E0B' };
    if (score === 4) return { score: 3, label: 'Good', color: '#3B82F6' };
    return { score: 4, label: 'Strong', color: '#10B981' };
  };

  const strength = getPasswordStrength(password);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  // Step 1: Send OTP to user email
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

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your confirm password.');
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/auth/register-otp', {
        name: name.trim(),
        email: email.trim(),
        password
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
        password
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
    <div className="auth-page-wrapper">
      <div className="auth-grid-overlay" />
      <div className="auth-container" style={{ maxWidth: 480 }}>
        {/* Brand header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div className="auth-header-badge">
            <Sparkles size={13} /> Secure Verified Onboarding
          </div>
          <h1 className="auth-logo-text">pennywise</h1>
          <p className="auth-subheading">Know your money. Plan your month.</p>
        </div>

        {/* Form Card */}
        <div className="auth-glass-card">
          {step === 'details' ? (
            <>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: 22, color: '#FFFFFF', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
                  Create Account
                </h2>
                <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 4 }}>
                  Register your personal workspace with verified email security
                </p>
              </div>

              {error && (
                <div className="auth-banner-error">
                  <AlertCircle size={16} /> <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleRequestOtp}>
                <div className="auth-input-group">
                  <label className="auth-label">Full Name</label>
                  <div className="auth-input-wrapper">
                    <User size={17} className="auth-input-icon" />
                    <input
                      type="text"
                      placeholder="e.g. Alex Taylor"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="auth-input-field"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label className="auth-label">Email address</label>
                  <div className="auth-input-wrapper">
                    <Mail size={17} className="auth-input-icon" />
                    <input
                      type="email"
                      placeholder="alex@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="auth-input-field"
                      required
                    />
                  </div>
                </div>

                <div className="auth-input-group" style={{ marginBottom: 12 }}>
                  <label className="auth-label">Password (min 6 characters)</label>
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

                  {/* Dynamic Password Strength Indicator */}
                  {password.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontSize: 11, color: '#94A3B8' }}>Strength:</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: strength.color }}>{strength.label}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 4, height: 4 }}>
                        {[1, 2, 3, 4].map((bar) => (
                          <div
                            key={bar}
                            style={{
                              flex: 1,
                              borderRadius: 2,
                              backgroundColor: bar <= strength.score ? strength.color : 'rgba(255, 255, 255, 0.1)',
                              transition: 'background-color 0.25s ease'
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="auth-input-group" style={{ marginBottom: 16 }}>
                  <div className="auth-label">
                    <span>Confirm Password</span>
                    {confirmPassword.length > 0 && (
                      <span style={{ fontSize: 11, fontWeight: 600, color: passwordsMatch ? '#10B981' : '#EF4444', display: 'flex', alignItems: 'center', gap: 3 }}>
                        {passwordsMatch ? (
                          <>
                            <Check size={12} /> Passwords match
                          </>
                        ) : (
                          'Passwords do not match'
                        )}
                      </span>
                    )}
                  </div>
                  <div className="auth-input-wrapper">
                    <Lock size={17} className="auth-input-icon" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="auth-input-field"
                      style={{ 
                        paddingRight: 42,
                        borderColor: confirmPassword.length > 0 ? (passwordsMatch ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)') : undefined
                      }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="auth-password-toggle"
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
                      <Loader2 size={17} className="animate-spin" /> Sending Verification Code...
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <button
                  type="button"
                  onClick={() => { setStep('details'); setError(''); }}
                  style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 6, borderRadius: 8, display: 'flex', alignItems: 'center' }}
                  title="Back to details"
                >
                  <ArrowLeft size={16} />
                </button>
                <h2 style={{ fontSize: 20, color: '#FFFFFF', margin: 0, fontWeight: 700 }}>
                  Enter Verification Code
                </h2>
              </div>
              <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 20 }}>
                A 6-digit code was sent to <strong style={{ color: '#F8FAFC' }}>{email}</strong>
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

              <form onSubmit={handleVerifyOtp}>
                <div className="auth-input-group">
                  <label className="auth-label">6-Digit Code</label>
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

                <button
                  type="submit"
                  className="auth-submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 size={17} className="animate-spin" /> Verifying Code...
                    </>
                  ) : (
                    'Verify & Complete Registration'
                  )}
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, fontSize: 12.5 }}>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resending}
                    style={{ background: 'none', border: 'none', color: '#FB7185', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
                  >
                    <RefreshCw size={13} className={resending ? 'animate-spin' : ''} /> {resending ? 'Sending...' : 'Resend Code'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setStep('details'); setError(''); }}
                    style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                  >
                    Change Email
                  </button>
                </div>
              </form>
            </>
          )}

          <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: '#94A3B8' }}>
            Already have an account?{' '}
            <Link to="/login" className="auth-pill-link">
              Sign in
            </Link>
          </div>

          <div className="auth-security-badge">
            <ShieldCheck size={14} color="#10B981" />
            <span>Anti-NoSQL Injection Guard · 256-Bit SSL Secured</span>
          </div>
        </div>
      </div>
    </div>
  );
}
