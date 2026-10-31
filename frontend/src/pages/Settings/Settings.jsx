import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import { 
  User, 
  Mail, 
  Building2, 
  IndianRupee, 
  ShieldCheck, 
  Trash2, 
  LogOut, 
  ChevronRight, 
  Check, 
  Edit2, 
  Save, 
  X, 
  Camera, 
  UploadCloud, 
  Image as ImageIcon,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  Smartphone,
  Download,
  AlertCircle,
  KeyRound,
  RotateCcw
} from 'lucide-react';

export default function Settings() {
  const { user, logout, updateUser } = useAuth();
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Profile edit state
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [college, setCollege] = useState(user?.college || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  // Password change state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [passSaving, setPassSaving] = useState(false);
  const [passMsg, setPassMsg] = useState('');
  const [passError, setPassError] = useState('');

  // Handle demo data reset
  const handleResetData = async () => {
    if (window.confirm('Are you sure you want to clear demo transactions and start fresh with ₹0 balance?')) {
      try {
        await API.post('/auth/reset-data');
        setMsg('Data cleared successfully! Balance reset to ₹0.');
        setTimeout(() => window.location.href = '/', 1200);
      } catch (err) {
        alert('Failed to reset data');
      }
    }
  };

  // Convert uploaded image to an optimized Base64 data URL
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WebP)');
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      alert('Image file size must be under 4MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = Math.min(img.width, img.height);
        canvas.width = 300;
        canvas.height = 300;
        const ctx = canvas.getContext('2d');
        
        const startX = (img.width - size) / 2;
        const startY = (img.height - size) / 2;
        ctx.drawImage(img, startX, startY, size, size, 0, 0, 300, 300);
        
        const optimizedBase64 = canvas.toDataURL('image/jpeg', 0.85);
        setAvatar(optimizedBase64);
        setAvatarPreview(optimizedBase64);
        setIsEditing(true);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    try {
      const res = await API.put('/auth/profile', { name, college, avatar });
      updateUser(res.data.data);
      setIsEditing(false);
      setMsg('Profile & Picture updated successfully!');
      setTimeout(() => setMsg(''), 3500);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleRemovePhoto = () => {
    setAvatar('');
    setAvatarPreview('');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassMsg('');

    if (newPassword.length < 6) {
      setPassError('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match');
      return;
    }

    setPassSaving(true);
    try {
      const res = await API.put('/auth/change-password', {
        currentPassword,
        newPassword
      });
      setPassMsg(res.data.message || 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setShowPasswordModal(false);
        setPassMsg('');
      }, 2000);
    } catch (err) {
      setPassError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPassSaving(false);
    }
  };

  const getInitials = (n) => {
    if (!n) return 'U';
    const parts = n.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return n.slice(0, 2).toUpperCase();
  };

  const currentDisplayAvatar = isEditing ? avatarPreview : (user?.avatar || avatar);

  return (
    <div className="profile-container">
      {/* Hidden file input for photo upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />

      {/* 1. Profile Hero Card */}
      <div className="profile-hero-card">
        <div className="profile-hero-glow" />

        <div className="profile-hero-content">
          {/* Avatar with Camera badge */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {currentDisplayAvatar ? (
              <img
                src={currentDisplayAvatar}
                alt={user?.name || 'Profile'}
                className="profile-avatar-img"
              />
            ) : (
              <div className="profile-avatar-fallback">
                {getInitials(user?.name)}
              </div>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Upload Profile Picture"
              className="profile-camera-btn"
            >
              <Camera size={13} />
            </button>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h2 className="profile-user-name">
                {user?.name || 'Active Member'}
              </h2>
              <span className="profile-status-badge">
                {user?.role === 'travel_admin' ? 'Travel Admin' : 'Active Plan'}
              </span>
            </div>

            <p className="profile-subtext">
              {user?.email || 'user@example.com'}
            </p>
            <p className="profile-subtext" style={{ opacity: 0.85, marginTop: 2 }}>
              {user?.college || user?.companyName || 'Finance Hub'}
            </p>
          </div>

          <div className="profile-header-actions">
            <button
              onClick={() => {
                setName(user?.name || '');
                setCollege(user?.college || '');
                setAvatar(user?.avatar || '');
                setAvatarPreview(user?.avatar || '');
                setIsEditing(!isEditing);
              }}
              className="profile-edit-toggle-btn"
            >
              {isEditing ? <X size={14} /> : <Edit2 size={14} />}
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>
      </div>

      {msg && (
        <div style={{
          padding: '10px 14px',
          background: '#DCFCE7',
          color: '#15803D',
          borderRadius: 10,
          fontSize: 12.5,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 14,
          border: '1px solid #BBF7D0'
        }}>
          <Check size={16} /> {msg}
        </div>
      )}

      {errorMsg && (
        <div style={{
          padding: '10px 14px',
          background: '#FEE2E2',
          color: '#991B1B',
          borderRadius: 10,
          fontSize: 12.5,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 14,
          border: '1px solid #FECDD3'
        }}>
          <AlertCircle size={16} /> {errorMsg}
        </div>
      )}

      {/* 2. Profile Edit Form (Inline card when editing) */}
      {isEditing && (
        <form onSubmit={handleSaveProfile} className="profile-section-card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-chocolate-dark)' }}>
              Edit Profile & Photo
            </span>
            <span style={{ fontSize: 11, color: 'var(--color-chocolate-light)', fontWeight: 600 }}>
              Live Database Update
            </span>
          </div>

          {/* Photo Upload Box */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 12px',
            borderRadius: 10,
            background: 'var(--color-cream-surface)',
            border: '1px dashed var(--color-border)',
            marginBottom: 14,
            flexWrap: 'wrap'
          }}>
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar preview"
                style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-burgundy)' }}
              />
            ) : (
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
                <ImageIcon size={20} />
              </div>
            )}

            <div style={{ flex: 1, minWidth: 120 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-chocolate-dark)' }}>Profile Picture</div>
              <div style={{ fontSize: 10.5, color: 'var(--color-chocolate-light)' }}>PNG, JPG or WebP (max 4MB)</div>
            </div>

            <div style={{ display: 'flex', gap: 6 }}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-secondary"
                style={{ padding: '6px 10px', fontSize: 11.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <UploadCloud size={13} /> Upload
              </button>
              {avatarPreview && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="btn btn-secondary"
                  style={{ padding: '6px 10px', fontSize: 11.5, fontWeight: 700, color: 'var(--color-burgundy)', borderColor: '#FECDD3' }}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
          
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: 'var(--color-chocolate-light)', marginBottom: 4 }}>
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="form-input"
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--color-border)', fontSize: 13.5, fontWeight: 600, boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: 'var(--color-chocolate-light)', marginBottom: 4 }}>
              Organization / College
            </label>
            <input
              type="text"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              placeholder="e.g. CET Trivandrum"
              className="form-input"
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--color-border)', fontSize: 13.5, fontWeight: 600, boxSizing: 'border-box' }}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary"
            style={{ width: '100%', padding: '10px', borderRadius: 10, fontSize: 13.5, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer' }}
          >
            <Save size={15} /> {saving ? 'Saving...' : 'Save Profile & Photo'}
          </button>
        </form>
      )}

      {/* 3. Account Details Section */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-chocolate-light)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0 4px 6px 4px' }}>
          Account Details
        </div>

        <div className="profile-section-card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Full Name */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderBottom: '1px solid var(--color-border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--color-baby-pink)', color: 'var(--color-burgundy)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={16} />
              </div>
              <div>
                <div style={{ fontSize: 10.5, color: 'var(--color-chocolate-light)', fontWeight: 600 }}>Full Name</div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--color-chocolate-dark)' }}>{user?.name || 'Active Member'}</div>
              </div>
            </div>
            <button
              onClick={() => {
                setName(user?.name || '');
                setCollege(user?.college || '');
                setIsEditing(true);
              }}
              style={{ background: 'none', border: 'none', color: 'var(--color-burgundy)', fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}
            >
              Change
            </button>
          </div>

          {/* Email */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderBottom: '1px solid var(--color-border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mail size={16} />
              </div>
              <div>
                <div style={{ fontSize: 10.5, color: 'var(--color-chocolate-light)', fontWeight: 600 }}>Email Address</div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--color-chocolate-dark)' }}>{user?.email || 'user@example.com'}</div>
              </div>
            </div>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: '#15803D', background: '#DCFCE7', padding: '2px 7px', borderRadius: 5 }}>
              Verified
            </span>
          </div>

          {/* College / Organization */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderBottom: '1px solid var(--color-border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F5F3FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={16} />
              </div>
              <div>
                <div style={{ fontSize: 10.5, color: 'var(--color-chocolate-light)', fontWeight: 600 }}>Organization / College</div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--color-chocolate-dark)' }}>{user?.college || user?.companyName || 'Finance Hub'}</div>
              </div>
            </div>
            <button
              onClick={() => {
                setName(user?.name || '');
                setCollege(user?.college || '');
                setIsEditing(true);
              }}
              style={{ background: 'none', border: 'none', color: 'var(--color-burgundy)', fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}
            >
              Change
            </button>
          </div>

          {/* Currency */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#DCFCE7', color: '#15803D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IndianRupee size={16} />
              </div>
              <div>
                <div style={{ fontSize: 10.5, color: 'var(--color-chocolate-light)', fontWeight: 600 }}>Currency Ledger</div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--color-chocolate-dark)' }}>Indian Rupee (₹ INR)</div>
              </div>
            </div>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: '#15803D', background: '#DCFCE7', padding: '2px 7px', borderRadius: 5 }}>
              Active
            </span>
          </div>
        </div>
      </div>

      {/* 4. Security & Web Access Control */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-chocolate-light)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0 4px 6px 4px' }}>
          Security & Web Control
        </div>

        <div className="profile-section-card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Change Password Trigger */}
          <div 
            onClick={() => {
              setShowPasswordModal(true);
              setPassError('');
              setPassMsg('');
            }}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              padding: '12px 14px', 
              borderBottom: '1px solid var(--color-border-subtle)',
              cursor: 'pointer' 
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#FEF3C7', color: '#B45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <KeyRound size={16} />
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--color-chocolate-dark)' }}>Change Password</div>
                <div style={{ fontSize: 11, color: 'var(--color-chocolate-light)' }}>Update your web app login credentials</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11.5, fontWeight: 700, color: 'var(--color-burgundy)' }}>
              Update <ChevronRight size={15} />
            </div>
          </div>

          {/* Install PWA */}
          <div 
            onClick={() => {
              if (window.deferredPwaPrompt) {
                window.deferredPwaPrompt.prompt();
              } else {
                alert('PennyWise is installed or can be added to your Home Screen via browser menu.');
              }
            }}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              padding: '12px 14px', 
              borderBottom: '1px solid var(--color-border-subtle)',
              cursor: 'pointer' 
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Smartphone size={16} />
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--color-chocolate-dark)' }}>Install Web App (PWA)</div>
                <div style={{ fontSize: 11, color: 'var(--color-chocolate-light)' }}>Add to device home screen for fast offline launch</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11.5, fontWeight: 700, color: '#2563EB' }}>
              <Download size={13} /> Install
            </div>
          </div>

          {/* Cloud Atlas Security */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderBottom: '1px solid var(--color-border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--color-cream-surface)', color: 'var(--color-chocolate-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={16} />
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--color-chocolate-dark)' }}>Cloud Data Encryption</div>
                <div style={{ fontSize: 11, color: 'var(--color-chocolate-light)' }}>Owner-isolated MongoDB Atlas database</div>
              </div>
            </div>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: '#15803D', background: '#DCFCE7', padding: '2px 7px', borderRadius: 5 }}>
              Secured
            </span>
          </div>

          {/* Reset Demo Data */}
          <div 
            onClick={handleResetData}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              padding: '12px 14px', 
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--color-baby-pink)', color: 'var(--color-burgundy)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trash2 size={16} />
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--color-burgundy)' }}>Reset Account Ledger</div>
                <div style={{ fontSize: 11, color: 'var(--color-chocolate-light)' }}>Clear transaction history and start at ₹0</div>
              </div>
            </div>
            <ChevronRight size={16} color="var(--color-chocolate-muted)" />
          </div>
        </div>
      </div>

      {/* 5. Logout Button */}
      <button
        onClick={logout}
        className="profile-logout-btn"
      >
        <LogOut size={16} /> Sign Out of PennyWise
      </button>

      {/* App Version */}
      <div style={{ textAlign: 'center', marginTop: 14, fontSize: 11, color: 'var(--color-chocolate-muted)', fontWeight: 500 }}>
        PennyWise Web App v1.2.0 · Live Atlas MongoDB
      </div>

      {/* Modal: Change Password */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420, padding: '20px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <KeyRound size={18} color="var(--color-burgundy)" />
                <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-chocolate-dark)', margin: 0 }}>
                  Change Password
                </h3>
              </div>
              <button 
                onClick={() => setShowPasswordModal(false)}
                className="modal-close-btn"
              >
                <X size={16} />
              </button>
            </div>

            {passMsg && (
              <div style={{ padding: '8px 12px', background: '#DCFCE7', color: '#15803D', borderRadius: 8, fontSize: 12, fontWeight: 600, marginBottom: 12 }}>
                {passMsg}
              </div>
            )}

            {passError && (
              <div style={{ padding: '8px 12px', background: '#FEE2E2', color: '#991B1B', borderRadius: 8, fontSize: 12, fontWeight: 600, marginBottom: 12 }}>
                {passError}
              </div>
            )}

            <form onSubmit={handleChangePassword}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: 'var(--color-chocolate-light)', marginBottom: 4 }}>
                  Current Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    placeholder="Enter current password"
                    className="form-input"
                    style={{ paddingRight: 36, fontSize: 13 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: 'var(--color-chocolate-light)', marginBottom: 4 }}>
                  New Password (min 6 characters)
                </label>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Enter new password"
                  className="form-input"
                  style={{ fontSize: 13 }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: 'var(--color-chocolate-light)', marginBottom: 4 }}>
                  Confirm New Password
                </label>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Re-enter new password"
                  className="form-input"
                  style={{ fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '9px', fontSize: 13 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passSaving}
                  className="btn btn-primary"
                  style={{ flex: 1.5, padding: '9px', fontSize: 13, fontWeight: 700 }}
                >
                  {passSaving ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
