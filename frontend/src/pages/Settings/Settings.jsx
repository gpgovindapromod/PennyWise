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
  CheckCircle2, 
  FileCode2,
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
          <span className="academic-semester-badge">● SOVEREIGN ATTESTED · HARDWARE ENCLAVE ACTIVE</span>
        </div>

        <div className="flex items-center gap-2">
          <button className="btn-goals-outline text-xs py-1 px-2">
            <Download size={12} /> Export Security Audit Log
          </button>
          <button className="btn-goals-outline text-xs py-1 px-2">
            <FileCode2 size={12} /> API Credentials
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

      {/* 3. Nordic Profile Enclave Hero Card */}
      <div className="security-hero-banner">
        <div className="security-profile-left">
          <img 
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" 
            alt="Profile" 
            className="security-avatar-circle"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white m-0 font-heading">
                {user?.name || 'Dr. Maya Lindqvist'}
              </h2>
              <span className="academic-semester-badge">VERIFIED TIER-1 KYC</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {user?.email || 'maya.lindqvist@nordic.bank'} • UID: ATLAS-8842-DK
            </div>
            <div className="text-xs text-emerald-400 font-bold mt-1">
              RESEARCH CHAIR • QUANTITATIVE FINANCE • SEMESTER 5 FELLOW
            </div>
          </div>
        </div>

        <div className="security-hero-stats">
          <div className="security-stat-group">
            <div className="security-stat-title">AUDITED LONGEVITY</div>
            <div className="security-stat-val">844 Days</div>
            <div className="text-xs text-slate-400">Since Aug 2024</div>
          </div>

          <div className="security-stat-group">
            <div className="security-stat-title">SECURITY SCORE</div>
            <div className="security-stat-val text-emerald-400">98/100</div>
            <div className="text-xs text-slate-400">Zero vulnerabilities</div>
          </div>

          <div className="security-stat-group">
            <div className="security-stat-title">SYNC ENGINE</div>
            <div className="security-stat-val text-white">ZK-Local Cache</div>
            <div className="text-xs text-slate-400">Latency: 14ms (P2P Mesh)</div>
          </div>
        </div>
      </div>

      {/* 4. Two-Column Security Grid */}
      <div className="security-two-col-grid">
        
        {/* Column 1: Authentication & Access Control */}
        <div className="security-box-surface">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} color="#047857" />
              <h3 className="font-extrabold text-sm text-dark m-0">Authentication & Access Control</h3>
            </div>
            <span className="text-muted text-xs font-bold">LEVEL 3 ENFORCED</span>
          </div>

          <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border border-slate-200 mb-3">
            <div>
              <div className="font-bold text-dark text-xs">Account Passphrase</div>
              <div className="text-muted text-xs">Last rotated 42 days ago. Entropy score 94%.</div>
            </div>
            <button className="btn-goals-primary text-xs py-1 px-3">Update Password</button>
          </div>

          <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border border-slate-200 mb-4">
            <div>
              <div className="font-bold text-dark text-xs">Biometric & FIDO2 Hardware Keys</div>
              <div className="text-muted text-xs">MacBook Touch ID Enclave & YubiKey 5C NFC.</div>
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
              <span className="font-bold text-dark text-xs">Active Sessions & Authorized Nodes</span>
              <span className="text-rose text-xs font-bold cursor-pointer">Revoke Other Sessions</span>
            </div>

            <div className="flex justify-between items-center text-xs p-2 rounded bg-slate-50 border border-slate-200 mb-2">
              <div className="flex items-center gap-2">
                <Laptop size={14} color="#047857" />
                <div>
                  <span className="font-bold text-dark">Mac Studio M3 Ultra • Chrome 131</span>
                  <span className="academic-semester-badge ml-2">THIS SESSION</span>
                  <div className="text-muted text-xs">Bengaluru, KA, IN • TLS 1.3 Hardware Pinning</div>
                </div>
              </div>
              <span className="text-emerald font-bold">Active Now</span>
            </div>

            <div className="flex justify-between items-center text-xs p-2 rounded bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2">
                <Smartphone size={14} color="#64748B" />
                <div>
                  <span className="font-bold text-dark">iPhone 16 Pro • Standalone PWA</span>
                  <div className="text-muted text-xs">Bengaluru, KA, IN • iOS 18.2</div>
                </div>
              </div>
              <span className="text-muted">12m AGO</span>
            </div>
          </div>
        </div>

        {/* Column 2: Platform & Ledger Vault */}
        <div className="security-box-surface">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Radio size={16} color="#047857" />
              <h3 className="font-extrabold text-sm text-dark m-0">Platform & Ledger Vault</h3>
            </div>
            <span className="text-muted text-xs font-bold">SYNCHRONIZED</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-bold text-dark">Progressive Web App (PWA)</span>
              <span className="text-emerald font-bold">● Instant Offline Cache</span>
            </div>
            <div className="text-muted text-xs mb-2">
              Run PennyWise Wealth Studio as an ultra-low latency desktop application.
            </div>
            <button className="btn-goals-primary w-full text-xs py-2 justify-center">
              <Download size={13} /> Install Native Desktop Client
            </button>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-bold text-dark">Atlas Vault Cryptography</span>
              <span className="text-muted font-bold">SHA-256 CHECK</span>
            </div>
            <div className="flex justify-between text-xs py-1 border-b border-slate-200">
              <span className="text-muted">Encryption Standard:</span>
              <span className="font-bold text-dark">AES-256-GCM Hardware Tied</span>
            </div>
            <div className="flex justify-between text-xs py-1 border-b border-slate-200">
              <span className="text-muted">Ledger Hash Integrity:</span>
              <span className="text-emerald font-bold">0 Block Drift • Verified</span>
            </div>
            <div className="flex justify-between text-xs pt-1">
              <span className="text-muted">Cloud Relay Region:</span>
              <span className="font-bold text-dark">Stockholm (se-central-1)</span>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="security-danger-zone">
            <div className="security-danger-title">
              <AlertTriangle size={14} /> Danger Zone: Ledger Governance
            </div>
            <div className="text-xs text-rose-700 mb-3">
              Irreversibly purge cached transactions from this local machine. Server attestation keys remain untouched.
            </div>
            <button 
              onClick={() => {
                if (window.confirm('Are you sure you want to purge local cache?')) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="btn btn-secondary w-full text-rose-600 font-bold text-xs py-2"
            >
              Initiate Ledger Purge
            </button>
          </div>
        </div>
      </div>

      {/* 5. Studio Localization & Telemetry Bar */}
      <div className="security-box-surface mb-4">
        <div className="flex justify-between items-center flex-wrap gap-4 text-xs">
          <div>
            <div className="font-bold text-dark">Studio Localization & Telemetry</div>
            <div className="text-muted">Default valuation currency, chronological stamps, and privacy toggles.</div>
          </div>

          <div className="flex items-center gap-4">
            <div>
              <span className="text-muted mr-2">REPORTING CURRENCY:</span>
              <select 
                value={currency} 
                onChange={(e) => setCurrency(e.target.value)}
                className="p-1 rounded border border-slate-200 font-bold"
              >
                <option>INR (Indian Rupee)</option>
                <option>USD ($)</option>
                <option>EUR (€)</option>
              </select>
            </div>

            <div>
              <span className="text-muted mr-2">LEDGER TIMESTAMP:</span>
              <span className="font-bold text-dark">DD MMM YYYY (e.g. 18 Nov 2026)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Sign Out Actions */}
      <div className="flex justify-between items-center p-3 rounded-xl bg-white border border-slate-200">
        <div className="text-xs text-muted flex items-center gap-2">
          <Lock size={13} /> Session automatically invalidates after 15 minutes of zero activity.
        </div>
        <div className="flex gap-2">
          <button className="btn-goals-outline text-xs">Emergency Lock Account</button>
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
