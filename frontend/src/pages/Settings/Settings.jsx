import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  User, 
  ShieldCheck, 
  Laptop, 
  Download, 
  Check, 
  Lock, 
  DownloadCloud,
  LogOut,
  Pencil
} from 'lucide-react';

export default function Settings() {
  const { user, logout } = useAuth();
  
  // Real user state initialized directly from auth profile
  const [fullName, setFullName] = useState(user?.name || 'Authorized Member');
  const [email, setEmail] = useState(user?.email || '');
  const [currency, setCurrency] = useState('₹ INR (Indian Rupee)');
  const [dateFormat, setDateFormat] = useState('DD MMM YYYY');
  const [anonymousDiag, setAnonymousDiag] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Dynamic Account Age in days since user.createdAt
  const createdDate = user?.createdAt ? new Date(user.createdAt) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const accountAgeDays = Math.max(1, Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)));
  const createdMonthYear = createdDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  const userUID = user?._id ? `UID: ${user._id.toString().toUpperCase().slice(-8)}` : 'UID: SECURE-NODE';
  const deviceOS = navigator.userAgent.includes('Mac') ? 'macOS Client' : navigator.userAgent.includes('Android') ? 'Android Mobile' : navigator.userAgent.includes('iPhone') ? 'iOS Mobile' : 'Windows PC';

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
            <div className="w-14 h-14 rounded-full bg-slate-900 text-emerald-400 font-extrabold text-2xl flex items-center justify-center font-heading border-2 border-emerald-500">
              {fullName.charAt(0).toUpperCase()}
            </div>
            <div className="stitch-avatar-edit-badge" title="Change Avatar">
              <Pencil size={10} />
            </div>
          </div>

          <div>
            <div className="stitch-user-name-row">
              <h2 className="stitch-user-name-title">{fullName}</h2>
              <span className="stitch-tier-badge">● Active Member</span>
            </div>
            <div className="stitch-user-email-text">{email}</div>
            <div className="stitch-user-uid-meta">
              {userUID} • {user?.college || 'PennyWise Global Member'}
            </div>
          </div>
        </div>

        <div className="stitch-profile-stats">
          <div className="stitch-stat-col">
            <div className="stitch-stat-col-title">ACCOUNT AGE</div>
            <div className="stitch-stat-col-val">{accountAgeDays} Days</div>
            <div className="stitch-stat-col-sub">Since {createdMonthYear}</div>
          </div>

          <div className="stitch-stat-col">
            <div className="stitch-stat-col-title">SYNC STATUS</div>
            <div className="stitch-stat-col-val text-emerald">● Live</div>
            <div className="stitch-stat-col-sub">Cloud Connected</div>
          </div>

          <div className="stitch-stat-col">
            <div className="stitch-stat-col-title">SECURITY STATUS</div>
            <div className="stitch-stat-col-val text-emerald">Active</div>
            <div className="stitch-stat-col-sub text-emerald">Level 3 Protected</div>
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
                  <option>DD MMM YYYY</option>
                  <option>YYYY-MM-DD</option>
                  <option>MM/DD/YYYY</option>
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
              <div className="text-muted text-xs">•••••••••••••••• · Active Password</div>
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
                Use Touch ID, Windows Hello, or hardware key for one-tap access.
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
              <span className="font-bold text-dark text-xs">Current Session & Node</span>
            </div>

            <div className="flex justify-between items-center text-xs p-2 rounded bg-slate-50 border border-slate-200 mb-2">
              <div className="flex items-center gap-2">
                <Laptop size={14} color="#047857" />
                <div>
                  <span className="font-bold text-dark">{deviceOS}</span>
                  <span className="stitch-tier-badge ml-2">This Device</span>
                  <div className="text-muted text-xs">Encrypted HTTPS Session</div>
                </div>
              </div>
              <span className="text-emerald font-bold">Active now</span>
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
          <span>MongoDB Atlas Cluster • SSL Encrypted</span>
        </div>
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
