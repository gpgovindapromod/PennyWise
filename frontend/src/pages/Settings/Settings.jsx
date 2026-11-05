import React, { useState, useRef } from 'react';
import API from '../../services/api';
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
  Pencil,
  UploadCloud
} from 'lucide-react';

export default function Settings() {
  const { user, logout, updateUser } = useAuth();
  const fileInputRef = useRef(null);
  
  // Real user state initialized directly from auth profile
  const [fullName, setFullName] = useState(user?.name || 'Authorized Member');
  const [email, setEmail] = useState(user?.email || '');
  const [currency, setCurrency] = useState('₹ INR (Indian Rupee)');
  const [dateFormat, setDateFormat] = useState('DD MMM YYYY');
  const [anonymousDiag, setAnonymousDiag] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [savingAvatar, setSavingAvatar] = useState(false);

  // Dynamic Account Age in days since user.createdAt
  const createdDate = user?.createdAt ? new Date(user.createdAt) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const accountAgeDays = Math.max(1, Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)));
  const createdMonthYear = createdDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  const userUID = user?._id ? `UID: ${user._id.toString().toUpperCase().slice(-8)}` : 'UID: SECURE-NODE';
  const deviceOS = navigator.userAgent.includes('Mac') ? 'macOS Client' : navigator.userAgent.includes('Android') ? 'Android Mobile' : navigator.userAgent.includes('iPhone') ? 'iOS Mobile' : 'Windows PC';

  // Handle uploading and persisting image file as Data URL directly to MongoDB User
  const handleAvatarFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Image file is too large. Please select an image under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result;
      setAvatarPreview(base64Data);
      setSavingAvatar(true);
      try {
        const res = await API.put('/auth/profile', { avatar: base64Data });
        if (res.data?.data) {
          updateUser({ avatar: base64Data });
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to save avatar image');
      } finally {
        setSavingAvatar(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    try {
      await API.put('/auth/profile', { name: fullName });
      updateUser({ name: fullName });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile');
    }
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
          {/* Avatar Upload Container */}
          <div className="stitch-avatar-wrap">
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*" 
              onChange={handleAvatarFileSelect}
              style={{ display: 'none' }}
            />

            {avatarPreview ? (
              <img 
                src={avatarPreview} 
                alt={fullName} 
                className="stitch-avatar-img"
                onError={() => setAvatarPreview('')}
              />
            ) : (
              <div className="stitch-avatar-fallback">
                {fullName.charAt(0).toUpperCase()}
              </div>
            )}

            <div 
              onClick={() => fileInputRef.current?.click()}
              className="stitch-avatar-edit-badge" 
              title={savingAvatar ? "Saving..." : "Upload Profile Photo"}
            >
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
              <ShieldCheck size={14} color="#047857" /> Security & Authentication
            </h3>
            <span className="text-emerald text-xs font-extrabold uppercase tracking-wider">● ENCLAVE ACTIVE</span>
          </div>

          <div className="stitch-security-stack">
            {/* 1. Account Password Card */}
            <div className="stitch-sec-item">
              <div className="stitch-sec-item-left">
                <div className="stitch-sec-icon-wrap">
                  <Lock size={15} color="#047857" />
                </div>
                <div>
                  <div className="font-bold text-dark text-xs">Account Password</div>
                  <div className="text-muted text-xs">•••••••••••••••• · Encrypted bcrypt hash</div>
                </div>
              </div>
              <button 
                onClick={() => {
                  const newPass = prompt('Enter new password (min 6 characters):');
                  if (newPass && newPass.length >= 6) {
                    API.put('/auth/change-password', { newPassword: newPass })
                      .then(() => alert('Password updated successfully!'))
                      .catch(err => alert(err.response?.data?.message || 'Failed to change password'));
                  }
                }}
                className="btn-goals-outline text-xs py-1.5 px-3"
              >
                Change Password
              </button>
            </div>

            {/* 2. Biometrics & Passkeys Card */}
            <div className="stitch-sec-item">
              <div className="stitch-sec-item-left">
                <div className="stitch-sec-icon-wrap">
                  <ShieldCheck size={15} color="#047857" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-dark text-xs">Biometrics & Fast Auth</span>
                    <span className="stitch-tier-badge">ENABLED</span>
                  </div>
                  <div className="text-muted text-xs mt-0.5">
                    Biometric session verification on supported devices
                  </div>
                </div>
              </div>
              <input 
                type="checkbox" 
                checked={biometricsEnabled} 
                onChange={() => setBiometricsEnabled(!biometricsEnabled)}
                className="w-4 h-4 accent-emerald-600 cursor-pointer"
              />
            </div>

            {/* 3. Current Session Node Card */}
            <div className="stitch-sec-item">
              <div className="stitch-sec-item-left">
                <div className="stitch-sec-icon-wrap">
                  <Laptop size={15} color="#047857" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-dark text-xs">{deviceOS}</span>
                    <span className="stitch-tier-badge">THIS NODE</span>
                  </div>
                  <div className="text-muted text-xs mt-0.5">
                    TLS 1.3 · Cloud Synchronized Session
                  </div>
                </div>
              </div>
              <div className="text-emerald font-extrabold text-xs flex items-center gap-1">
                <span className="proto-pulse-dot" /> Connected
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Install Desktop App Strip */}
      <div className="stitch-install-banner">
        <div className="stitch-install-banner-left">
          <div className="stitch-sec-icon-wrap">
            <Laptop size={16} color="#047857" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-dark text-xs">Install Desktop App</span>
              <span className="stitch-tier-badge">OFFLINE READY</span>
            </div>
            <div className="text-muted text-xs mt-0.5">
              Instantaneous launch times and system tray synchronization via the PWA client.
            </div>
          </div>
        </div>

        <button className="btn-goals-outline text-xs py-1.5 px-3">
          <DownloadCloud size={13} /> Install
        </button>
      </div>

      {/* 5. Session & Account Actions */}
      <div className="stitch-session-bar">
        <div className="stitch-session-bar-left">
          <div className="stitch-sec-icon-wrap">
            <User size={15} color="#047857" />
          </div>
          <div>
            <div className="font-bold text-dark text-xs">Session & Account Actions</div>
            <div className="text-muted text-xs mt-0.5">
              Sign out of your active workspace or reset locally cached ledger data.
            </div>
          </div>
        </div>

        <div className="stitch-session-actions-btns">
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

      {/* 6. Security Attestation & Footer */}
      <div className="stitch-footer-container">
        <div className="stitch-attestation-status">
          <ShieldCheck size={14} color="#047857" />
          <span>Cloud Verified Engine · SSL 256-Bit Encrypted</span>
        </div>

        <div className="stitch-attestation-bar">
          <span>© 2026 PENNYWISE WEALTH STUDIO. NORDIC PRECISION FINANCIAL SYSTEMS.</span>
          <div className="stitch-footer-links">
            <span>Treasury Protocol</span>
            <span>Security & Attestation</span>
            <span>API Architecture</span>
          </div>
        </div>
      </div>
    </div>
  );
}
