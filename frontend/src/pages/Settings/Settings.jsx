import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldCheck, 
  Key, 
  Smartphone, 
  Laptop, 
  Trash2, 
  LogOut, 
  Download, 
  Lock, 
  Radio, 
  AlertTriangle
} from 'lucide-react';

export default function Settings() {
  const { user, logout } = useAuth();
  const [fidoActive, setFidoActive] = useState(true);
  const [currency, setCurrency] = useState('INR (Indian Rupee)');

  return (
    <div className="stitch-container">
      {/* 1. Protocol Sub-Header Status */}
      <div className="proto-status-bar">
        <div className="flex items-center gap-2">
          <span className="proto-pulse-dot" />
          <span>ACCOUNT GOVERNANCE & CRYPTOGRAPHIC SECURITY · ATLAS PROTOCOL V2.2</span>
          <span className="academic-semester-badge">● LIVE AUTHENTICATED SESSION</span>
        </div>

        <div className="flex items-center gap-2">
          <button className="btn-goals-outline text-xs py-1 px-2">
            <Download size={12} /> Export Security Audit Log
          </button>
        </div>
      </div>

      {/* 2. Main Title */}
      <div className="goals-header-wrap">
        <div>
          <h1 className="goals-main-heading">User Profile & Security Hub</h1>
          <p className="goals-sub-caption">
            Administrative master console, biometric authentication protocols, PWA device synchronization, and ledger integrity governance.
          </p>
        </div>
      </div>

      {/* 3. Real User Profile Hero Banner */}
      <div className="security-hero-banner">
        <div className="security-profile-left">
          <div className="w-16 h-16 rounded-full bg-emerald-700 text-white font-black text-2xl flex items-center justify-center font-heading border-2 border-emerald-400">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white m-0 font-heading">
                {user?.name || 'Authorized Member'}
              </h2>
              <span className="academic-semester-badge">VERIFIED ACCOUNT</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {user?.email || 'user@pennywise.finance'} • Role: {user?.role || 'student'}
            </div>
            <div className="text-xs text-emerald-400 font-bold mt-1">
              INSTITUTION: {user?.college?.toUpperCase() || 'PENNYWISE GLOBAL WEALTH STUDIO'}
            </div>
          </div>
        </div>

        <div className="security-hero-stats">
          <div className="security-stat-group">
            <div className="security-stat-title">DATABASE STATUS</div>
            <div className="security-stat-val text-emerald-400">CONNECTED</div>
            <div className="text-xs text-slate-400">MongoDB Atlas Cluster</div>
          </div>

          <div className="security-stat-group">
            <div className="security-stat-title">SECURITY STATUS</div>
            <div className="security-stat-val text-white">LEVEL 3 ENFORCED</div>
            <div className="text-xs text-slate-400">JWT Protected Session</div>
          </div>
        </div>
      </div>

      {/* 4. Two-Column Security Grid */}
      <div className="security-two-col-grid">
        <div className="security-box-surface">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} color="#047857" />
              <h3 className="font-extrabold text-sm text-dark m-0">Authentication & Access Control</h3>
            </div>
            <span className="text-muted text-xs font-bold">ACTIVE</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 mb-3">
            <div className="font-bold text-dark text-xs">Primary User Identity</div>
            <div className="text-secondary text-xs mt-1">
              Email: <span className="font-bold">{user?.email}</span>
            </div>
            <div className="text-secondary text-xs">
              College / Org: <span className="font-bold">{user?.college || 'N/A'}</span>
            </div>
          </div>

          <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border border-slate-200 mb-4">
            <div>
              <div className="font-bold text-dark text-xs">Biometric & FIDO2 Security</div>
              <div className="text-muted text-xs">Touch ID / Face ID hardware binding</div>
            </div>
            <input 
              type="checkbox" 
              checked={fidoActive} 
              onChange={() => setFidoActive(!fidoActive)}
              className="w-4 h-4 accent-emerald-600"
            />
          </div>

          <div className="border-t border-slate-200 pt-3">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-dark text-xs">Current Session</span>
            </div>
            <div className="flex justify-between items-center text-xs p-2 rounded bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2">
                <Laptop size={14} color="#047857" />
                <div>
                  <span className="font-bold text-dark">{navigator.userAgent.includes('Mac') ? 'macOS Client' : 'Windows Client'} • Chrome / Web App</span>
                  <div className="text-muted text-xs">Authenticated & Encrypted</div>
                </div>
              </div>
              <span className="text-emerald font-bold">Active Now</span>
            </div>
          </div>
        </div>

        <div className="security-box-surface">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Radio size={16} color="#047857" />
              <h3 className="font-extrabold text-sm text-dark m-0">Platform & Cache Governance</h3>
            </div>
            <span className="text-muted text-xs font-bold">SYNCHRONIZED</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-bold text-dark">Data Storage Mode</span>
              <span className="text-emerald font-bold">● Pure Cloud Database</span>
            </div>
            <div className="text-muted text-xs">
              All financial transactions, budgets, and academics sync directly with your cloud cluster.
            </div>
          </div>

          {/* Danger Zone */}
          <div className="security-danger-zone">
            <div className="security-danger-title">
              <AlertTriangle size={14} /> Danger Zone: Local Session Purge
            </div>
            <div className="text-xs text-rose-700 mb-3">
              Clear all locally cached auth tokens and cookies from this workstation.
            </div>
            <button 
              onClick={() => {
                if (window.confirm('Clear local authentication token and sign out?')) {
                  logout();
                }
              }}
              className="btn btn-secondary w-full text-rose-600 font-bold text-xs py-2"
            >
              Sign Out & Clear Session Cache
            </button>
          </div>
        </div>
      </div>

      {/* 5. Studio Localization */}
      <div className="security-box-surface mb-4">
        <div className="flex justify-between items-center flex-wrap gap-4 text-xs">
          <div>
            <div className="font-bold text-dark">Studio Valuation Currency</div>
            <div className="text-muted">Default currency denomination applied across dashboard and ledger.</div>
          </div>

          <div>
            <select 
              value={currency} 
              onChange={(e) => setCurrency(e.target.value)}
              className="p-1 rounded border border-slate-200 font-bold text-xs"
            >
              <option>INR (Indian Rupee - ₹)</option>
              <option>USD ($)</option>
              <option>EUR (€)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 6. Sign Out Actions */}
      <div className="flex justify-between items-center p-3 rounded-xl bg-white border border-slate-200">
        <div className="text-xs text-muted flex items-center gap-2">
          <Lock size={13} /> Active authentication session verified.
        </div>
        <div className="flex gap-2">
          <button onClick={logout} className="btn-goals-primary text-xs">
            <LogOut size={13} /> Sign Out of PennyWise
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
