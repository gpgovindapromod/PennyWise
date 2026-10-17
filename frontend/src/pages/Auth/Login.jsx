import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/auth/login', { email, password });
      login(res.data.data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
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
          <h2 style={{ fontSize: 20, color: 'var(--color-chocolate)', marginBottom: 6, fontWeight: 700 }}>
            Sign in to your account
          </h2>
          <p style={{ fontSize: 13, color: 'var(--color-chocolate-light)', marginBottom: 20 }}>
            Access your student financial workspace
          </p>

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
              <label className="form-label">Password</label>
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
              style={{ width: '100%', padding: '12px 16px', fontSize: 15, marginTop: 10 }}
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