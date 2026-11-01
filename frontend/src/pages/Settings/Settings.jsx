import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  User, 
  ShieldCheck, 
  Key, 
  Smartphone, 
  Laptop, 
  Download, 
  Check, 
  Sparkles, 
  Lock, 
  DownloadCloud,
  LogOut,
  Pencil
} from 'lucide-react';

export default function Settings() {
  const { user, logout } = useAuth();
  
  // Real user state initialized directly from auth profile
  const [fullName, setFullName] = useState(user?.name || 'Dr. Maya Lindqvist');
  const [email, setEmail] = useState(user?.email || 'maya.lindqvist@nordic.bank');
  const [currency, setCurrency] = useState('₹ INR (Indian Rupee)');
  const [dateFormat, setDateFormat] = useState('DD MMM YYYY (14 Nov 2026)');
  const [anonymousDiag, setAnonymousDiag] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveChanges = (e) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="stitch-container">
      {/* 1. Page Header & Actions */}
      <div className="ledger-header-row mb-6">
        <div>
          <h1 className="goals-main-heading">Settings & Profile</h1>
          <p className="goals-sub-caption">
            Manage your account identity, security credentials, and regional workspace preferences.
          </p>
        </div>

        <div className="ledger-header-actions">
          <button className="btn-goals-outline">
            <Download size={13} /> Export Data
          </button>
          <button onClick={handleSaveChanges} className="btn-goals-primary">
            <Check size={14} color="#34D399" /> {saveSuccess ? 'Saved Changes!' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* 2. White Profile Header Hero Card */}
      <div className="stitch-profile-hero">
        <div className="stitch-profile-left">
          <div className="stitch-avatar-wrap">
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" 
              alt="Profile" 
              className="stitch-avatar-img"
            />
            <div className="stitch-avatar-edit-badge" title="Change Avatar">
              <Pencil size={10} />
            </div>
          </div>

          <div>
            <div className="stitch-user-name-row">
              <h2 className="stitch-user-name-title">{fullName}</h2>
              <span className="stitch-tier-badge">● Tier-1 Verified</span>
            </div>
            <div className="stitch-user-email-text">{email}</div>
            <div className="stitch-user-uid-meta">
              UID: ATLAS-8842-DK • Nordic Quantitative Chair
            </div>
          </div>
        </div>

        <div className="stitch-profile-stats">
          <div className="stitch-stat-col">
            <div className="stitch-stat-col-title">ACCOUNT AGE</div>
            <div className="stitch-stat-col-val">844 Days</div>
            <div className="stitch-stat-col-sub">Since Aug 2024</div>
          </div>

          <div className="stitch-stat-col">
            <div className="stitch-stat-col-title">SYNC STATUS</div>
            <div className="stitch-stat-col-val text-emerald">● Live</div>
            <div className="stitch-stat-col-sub">P2P Real-time</div>
          </div>

          <div className="stitch-stat-col">
            <div className="stitch-stat-col-title">SECURITY SCORE</div>
            <div className="stitch-stat-col-val">98<span className="text-muted text-xs font-normal">/100</span></div>
            <div className="stitch-stat-col-sub text-emerald">Optimal (A+)</div>
          </div>
        </div>
      </div>

      {/* 3. Two-Column Settings Grid */}
      <div className="stitch-settings-grid">
        
        {/* Column 1: Account & Preferences */}
        <div className="stitch-settings-card">
          <div className="stitch-card-section-head">
            <h3 className="stitch-section-heading">
              <User size={13} color="#047857" /> Account & Preferences
            </h3>
          </div>

          <form onSubmit={handleSaveChanges}>
            <div className="stitch-form-group">
              <label className="stitch-field-label">Full Name</label>
              <input 
                type="text" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)}
                className="stitch-input-box" 
              />
            </div>

            <div className="stitch-form-group">
              <label className="stitch-field-label">Email Address</label>
              <div className="stitch-input-wrap-verified">
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="stitch-input-box" 
                />
                <span className="stitch-verified-tag">Verified</span>
              </div>
            </div>

            <div className="stitch-dual-field-row">
              <div>
                <label className="stitch-field-label">Default Currency</label>
                <select 
                  value={currency} 
                  onChange={(e) => setCurrency(e.target.value)}
                  className="stitch-input-box"
                >
                  <option>₹ INR (Indian Rupee)</option>
                  <option>$ USD (US Dollar)</option>
                  <option>€ EUR (Euro)</option>
                </select>
              </div>

              <div>
                <label className="stitch-field-label">Date & Time Format</label>
                <select 
                  value={dateFormat} 
                  onChange={(e) => setDateFormat(e.target.value)}
                  className="stitch-input-box"
                >
                  <option>DD MMM YYYY (14 Nov 2026)</option>
                  <option>YYYY-MM-DD (2026-11-14)</option>
                  <option>MM/DD/YYYY (11/14/2026)</option>
                </select>
              </div>
            </div>

            <div className="stitch-toggle-row">
              <div>
                <div className="font-bold text-dark text-xs">Anonymous Diagnostics</div>
                <div className="text-muted text-xs">Share zero-PII performance analytics to improve sync latency</div>
              </div>
              <input 
                type="checkbox" 
                checked={anonymousDiag} 
                onChange={() => setAnonymousDiag(!anonymousDiag)}
                className="w-4 h-4 accent-emerald-600"
              />
            </div>
          </form>
        </div>

        {/* Column 2: Security & Authentication */}
        <div className="stitch-settings-card">
          <div className="stitch-card-section-head">
            <h3 className="stitch-section-heading">
              <ShieldCheck size={13} color="#047857" /> Security & Authentication
            </h3>
            <span className="text-emerald text-xs font-extrabold uppercase tracking-wider">PROTECTED</span>
          </div>

          {/* Account Password */}
          <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border border-slate-200 mb-4">
            <div>
              <div className="font-bold text-dark text-xs">Account Password</div>
              <div className="text-muted text-xs">•••••••••••••••• · Rotated 42d ago</div>
            </div>
            <button className="btn-goals-outline text-xs py-1 px-3">
              Change Password
            </button>
          </div>

          {/* Biometrics & Passkeys */}
          <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border border-slate-200 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-dark text-xs">Biometrics & Passkeys</span>
                <span className="stitch-tier-badge">Active</span>
              </div>
              <div className="text-muted text-xs mt-1">
                Use Touch ID, Windows Hello, or YubiKey FIDO2 for one-tap biometric access.
              </div>
            </div>
            <input 
              type="checkbox" 
              checked={biometricsEnabled} 
              onChange={() => setBiometricsEnabled(!biometricsEnabled)}
              className="w-4 h-4 accent-emerald-600"
            />
          </div>

          {/* Active Devices & Sessions */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-dark text-xs">Active Devices & Sessions</span>
              <span className="text-rose text-xs font-bold cursor-pointer">Sign out other devices</span>
            </div>

            <div className="flex justify-between items-center text-xs p-2 rounded bg-slate-50 border border-slate-200 mb-2">
              <div className="flex items-center gap-2">
                <Laptop size={14} color="#047857" />
                <div>
                  <span className="font-bold text-dark">Mac Studio M3 Ultra</span>
                  <span className="stitch-tier-badge ml-2">This Device</span>
                  <div className="text-muted text-xs">Chrome 131 • Bengaluru, IN</div>
                </div>
              </div>
              <span className="text-emerald font-bold">Active now</span>
            </div>

            <div className="flex justify-between items-center text-xs p-2 rounded bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2">
                <Smartphone size={14} color="#64748B" />
                <div>
                  <span className="font-bold text-dark">iPhone 16 Pro</span>
                  <span className="text-muted text-xs ml-2">PWA</span>
                  <div className="text-muted text-xs">iOS 18.2 • Bengaluru, IN</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-muted">
                <span>12m ago</span>
                <span className="cursor-pointer">✕</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Install Desktop App Strip */}
      <div className="stitch-install-banner">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
            <Laptop size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-dark text-xs">Install Desktop App</span>
              <span className="stitch-tier-badge">OFFLINE READY</span>
            </div>
            <div className="text-muted text-xs">
              Get instantaneous launch times and system tray synchronization via the PWA client.
            </div>
          </div>
        </div>

        <button className="btn-goals-outline text-xs py-1.5 px-3">
          <DownloadCloud size={13} /> Install
        </button>
      </div>

      {/* 5. Cryptography Attestation Bar */}
      <div className="flex justify-between items-center text-xs text-muted mb-4 px-2">
        <div className="flex items-center gap-2">
          <ShieldCheck size={13} color="#047857" />
          <span>Ledger hash verified • Hardware enclave locked</span>
        </div>
        <span className="cursor-pointer text-dark font-bold">API Keys</span>
      </div>

      {/* 6. Session & Account Actions */}
      <div className="stitch-session-bar">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
            <User size={15} />
          </div>
          <div>
            <div className="font-bold text-dark text-xs">Session & Account Actions</div>
            <div className="text-muted text-xs">
              Sign out of your active workspace or reset locally cached ledger data.
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => {
              if (window.confirm('Reset local cache data?')) {
                localStorage.clear();
                window.location.reload();
              }
            }} 
            className="btn-goals-outline text-rose text-xs py-1.5 px-3"
          >
            Reset Local Data
          </button>
          <button onClick={logout} className="btn-goals-primary text-xs py-1.5 px-3">
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </div>

      {/* Footer Attestation */}
      <div className="stitch-attestation-bar">
        <span>© 2026 PENNYWISE WEALTH STUDIO. NORDIC PRECISION FINANCIAL SYSTEMS.</span>
        <div className="flex gap-3">
          <span>Treasury Protocol</span>
          <span>Security & Attestation</span>
          <span>API Architecture</span>
        </div>
      </div>
    </div>
  );
}
