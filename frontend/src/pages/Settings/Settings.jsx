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
  Calendar,
  Database,
  Smartphone,
  Download
} from 'lucide-react';

export default function Settings() {
  const { user, logout, updateUser } = useAuth();
  const [msg, setMsg] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [college, setCollege] = useState(user?.college || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

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
    try {
      const res = await API.put('/auth/profile', { name, college, avatar });
      updateUser(res.data.data);
      setIsEditing(false);
      setMsg('Profile & Picture updated successfully in live database!');
      setTimeout(() => setMsg(''), 3500);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleRemovePhoto = () => {
    setAvatar('');
    setAvatarPreview('');
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

      {/* 1. Perfect Hero Profile Card (Responsive: Dark App Card on Mobile, Panoramic Card on Desktop) */}
      <div className="profile-hero-card">
        {/* Glow orb */}
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

            {/* Quick Upload Camera Trigger Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Upload Profile Picture"
              className="profile-camera-btn"
            >
              <Camera size={14} />
            </button>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h2 className="profile-user-name">
                {user?.name || 'Active Student'}
              </h2>
              <span className="profile-status-badge">
                Student Pro
              </span>
            </div>

            <p className="profile-subtext">
              {user?.email || 'student@college.edu'}
            </p>
            <p className="profile-subtext" style={{ opacity: 0.85, marginTop: 2 }}>
              {user?.college || 'Engineering Institute'}
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
          padding: '12px 16px',
          background: '#ECFDF5',
          color: '#065F46',
          borderRadius: 14,
          fontSize: 13,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 16,
          border: '1px solid #A7F3D0'
        }}>
          <Check size={16} /> {msg}
        </div>
      )}

      {/* 2. Profile Edit Form (Inline modal/card when editing) */}
      {isEditing && (
        <form onSubmit={handleSaveProfile} className="profile-section-card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>
              Edit Profile & Photo
            </span>
            <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>
              Live Database Update
            </span>
          </div>

          {/* Photo Upload Box inside form */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '12px 14px',
            borderRadius: 14,
            background: '#F8FAFC',
            border: '1px dashed #CBD5E1',
            marginBottom: 16,
            flexWrap: 'wrap'
          }}>
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar preview"
                style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', border: '2px solid #E11D48' }}
              />
            ) : (
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
                <ImageIcon size={22} />
              </div>
            )}

            <div style={{ flex: 1, minWidth: 140 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0F172A' }}>Profile Picture</div>
              <div style={{ fontSize: 11, color: '#64748B' }}>PNG, JPG or WebP (max 4MB)</div>
            </div>

            <div style={{ display: 'flex', gap: 6 }}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-secondary"
                style={{ padding: '7px 12px', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <UploadCloud size={14} /> Upload
              </button>
              {avatarPreview && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="btn btn-secondary"
                  style={{ padding: '7px 10px', fontSize: 12, fontWeight: 700, color: '#E11D48', borderColor: '#FECDD3' }}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
          
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748B', marginBottom: 4 }}>
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="form-input"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #CBD5E1', fontSize: 14, fontWeight: 600, boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748B', marginBottom: 4 }}>
              College / University
            </label>
            <input
              type="text"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              placeholder="e.g. CET Trivandrum"
              className="form-input"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #CBD5E1', fontSize: 14, fontWeight: 600, boxSizing: 'border-box' }}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', borderRadius: 12, fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer' }}
          >
            <Save size={16} /> {saving ? 'Saving Changes...' : 'Save Profile & Photo'}
          </button>
        </form>
      )}

      {/* 3. Account Details Section */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0 8px 8px 8px' }}>
          Account Details
        </div>

        <div className="profile-section-card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Item 1: Name */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #F1F5F9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FFF1F2', color: '#E11D48', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={18} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>Full Name</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{user?.name || 'Active Student'}</div>
              </div>
            </div>
            <button
              onClick={() => {
                setName(user?.name || '');
                setCollege(user?.college || '');
                setIsEditing(true);
              }}
              style={{ background: 'none', border: 'none', color: '#E11D48', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
            >
              Change
            </button>
          </div>

          {/* Item 2: Email */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #F1F5F9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#EFF6FF', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mail size={18} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>Email Address</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{user?.email || 'student@college.edu'}</div>
              </div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#059669', background: '#ECFDF5', padding: '3px 8px', borderRadius: 6 }}>
              Verified
            </span>
          </div>

          {/* Item 3: College */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #F1F5F9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F5F3FF', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={18} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>College / University</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{user?.college || 'Engineering Institute'}</div>
              </div>
            </div>
            <button
              onClick={() => {
                setName(user?.name || '');
                setCollege(user?.college || '');
                setIsEditing(true);
              }}
              style={{ background: 'none', border: 'none', color: '#E11D48', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
            >
              Change
            </button>
          </div>

          {/* Item 4: Currency */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IndianRupee size={18} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>Currency Ledger</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Indian Rupee (₹ INR)</div>
              </div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#10B981', background: '#ECFDF5', padding: '3px 8px', borderRadius: 6 }}>
              Integer Paise
            </span>
          </div>
        </div>
      </div>

      {/* 4. Security & Cloud Data Actions */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0 8px 8px 8px' }}>
          Security & Database
        </div>

        <div className="profile-section-card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* PWA App Install Row */}
          <div 
            onClick={() => {
              if (window.deferredPwaPrompt) {
                window.deferredPwaPrompt.prompt();
              } else {
                alert('PennyWise is installed or can be installed via your browser menu (Add to Home Screen).');
              }
            }}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              padding: '14px 16px', 
              borderBottom: '1px solid #F1F5F9',
              cursor: 'pointer' 
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Smartphone size={18} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Install PennyWise App</div>
                <div style={{ fontSize: 12, color: '#64748B' }}>Add to Home Screen for native experience</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#2563EB' }}>
              <Download size={14} /> Install
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #F1F5F9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F1F5F9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={18} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Atlas Cloud Security</div>
                <div style={{ fontSize: 12, color: '#64748B' }}>Owner-scoped MongoDB queries & HSTS</div>
              </div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#059669', background: '#ECFDF5', padding: '3px 8px', borderRadius: 6 }}>
              Active
            </span>
          </div>

          {/* Reset Demo Data */}
          <div 
            onClick={handleResetData}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              padding: '14px 16px', 
              cursor: 'pointer',
              transition: 'background-color 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FFF1F2', color: '#E11D48', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trash2 size={18} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#E11D48' }}>Clear Demo Data</div>
                <div style={{ fontSize: 12, color: '#64748B' }}>Reset records and restart with ₹0 balance</div>
              </div>
            </div>
            <ChevronRight size={18} color="#94A3B8" />
          </div>
        </div>
      </div>

      {/* 5. Logout Button */}
      <button
        onClick={logout}
        className="profile-logout-btn"
      >
        <LogOut size={18} /> Sign Out
      </button>

      {/* App Version */}
      <div style={{ textAlign: 'center', marginTop: 18, fontSize: 12, color: '#94A3B8', fontWeight: 500 }}>
        PennyWise GT v1.0.0 · Live MongoDB Atlas
      </div>
    </div>
  );
}