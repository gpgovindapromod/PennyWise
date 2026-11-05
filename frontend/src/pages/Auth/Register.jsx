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
    if (score === 4) return { score: 3, label: 'Good', color: '#0284C7' };
    return { score: 4, label: 'Strong', color: '#047857' };
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
      // In local dev with simulated email, devOtp can auto-fill for testing convenience
      if (res.data.devOtp && import.meta.env.DEV) {
        setInfoMsg(`Code sent to your inbox.`);
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
      if (res.data.devOtp && import.meta.env.DEV) {
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
      <div className="auth-container" style={{ maxWidth: 460 }}>
        {/* Brand header */}
        <div className="auth-brand-center">
          <div className="auth-header-badge">
            <Sparkles size={13} /> Secure Verified Onboarding
          </div>
          <div className="auth-brand-badge-wrap">
            <div className="auth-brand-logo-icon">P</div>
            <h1 className="auth-logo-text" style={{ margin: 0 }}>PennyWise</h1>
          </div>
          <p className="auth-subheading">Know your money. Plan your month.</p>
        </div>

        {/* Form Card */}
        <div className="auth-glass-card">
          {step === 'details' ? (
            <>
              <div style={{ marginBottom: 20 }}>
                <h2 className="auth-card-title">Create Account</h2>
                <p className="auth-card-subtitle">
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
                      className="auth-input-field auth-password-input"
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
                    <div className="auth-strength-container">
                      <div className="auth-strength-header">
                        <span style={{ fontSize: 11, color: '#64748B' }}>Strength:</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: strength.color }}>{strength.label}</span>
                      </div>
                      <div className="auth-strength-bars">
                        {[1, 2, 3, 4].map((bar) => (
                          <div
                            key={bar}
                            className="auth-strength-bar"
                            style={{
                              backgroundColor: bar <= strength.score ? strength.color : '#E5E7EB'
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
                      <span style={{ fontSize: 11, fontWeight: 700, color: passwordsMatch ? '#047857' : '#DC2626', display: 'flex', alignItems: 'center', gap: 3 }}>
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
                      className="auth-input-field auth-password-input"
                      style={{ 
                        borderColor: confirmPassword.length > 0 ? (passwordsMatch ? '#047857' : '#EF4444') : undefined
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
              <div className="auth-header-bar">
                <button
                  type="button"
                  onClick={() => { setStep('details'); setError(''); }}
                  className="auth-back-btn"
                  title="Back to details"
                >
                  <ArrowLeft size={16} />
                </button>
                <h2 className="auth-card-title">Enter Verification Code</h2>
              </div>
              <p className="auth-card-subtitle" style={{ marginBottom: 20 }}>
                A 6-digit code was sent to <strong>{email}</strong>
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
                    className="auth-input-field auth-otp-input"
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

                <div className="auth-sub-actions">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resending}
                    className="auth-action-link-btn"
                  >
                    <RefreshCw size={13} className={resending ? 'animate-spin' : ''} /> {resending ? 'Sending...' : 'Resend Code'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setStep('details'); setError(''); }}
                    className="auth-muted-link-btn"
                  >
                    Change Email
                  </button>
                </div>
              </form>
            </>
          )}

          <div className="auth-switch-text">
            Already have an account?{' '}
            <Link to="/login" className="auth-pill-link">
              Sign in
            </Link>
          </div>

          <div className="auth-security-badge">
            <ShieldCheck size={14} color="#047857" />
            <span>End-to-End Encrypted · 256-Bit SSL Protected</span>
          </div>
        </div>
      </div>
    </div>
  );
}
