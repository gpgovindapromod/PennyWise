import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { formatRupees, rupeesToPaise } from '../../services/currency';
import { 
  Target, 
  Plus, 
  SlidersHorizontal, 
  CheckCircle2, 
  Laptop, 
  Plane, 
  ShieldCheck, 
  Landmark, 
  Coffee, 
  Compass, 
  Tv, 
  Zap, 
  TrendingUp, 
  MoreHorizontal,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Goals() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [limitRupees, setLimitRupees] = useState('8000');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeVaultTab, setActiveVaultTab] = useState('ALL');
  const [showCapModal, setShowCapModal] = useState(false);
  const [showNewGoalModal, setShowNewGoalModal] = useState(false);

  // Auto-Save Velocity Simulator State
  const [simWeeklyDeposit, setSimWeeklyDeposit] = useState(2000);

  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const [milestones, setMilestones] = useState(() => {
    try {
      const saved = localStorage.getItem('pennywise_savings_vaults');
      return saved ? JSON.parse(saved) : [
        {
          id: 'gear-fund',
          priority: 'PRIORITY 1 · EQUIPMENT',
          deadline: 'Jan 2027',
          daysLeft: '62 days remaining',
          title: 'MacBook / Tech Gear Fund',
          icon: 'laptop',
          currentRupees: 42000,
          targetRupees: 65000,
          ratePace: '₹2,500/mo active',
          tag: 'SIP ACTIVE',
          status: 'active'
        },
        {
          id: 'goa-trip',
          priority: 'PRIORITY 2 · LEISURE',
          deadline: 'Mar 2027',
          daysLeft: '114 days remaining',
          title: 'Goa Retreat & Travel',
          icon: 'plane',
          currentRupees: 18500,
          targetRupees: 25000,
          ratePace: '₹1,500/mo active',
          tag: 'WEEKLY SPLIT',
          status: 'active'
        },
        {
          id: 'emergency-vault',
          priority: 'TARGET SECURED',
          deadline: '100.0%',
          daysLeft: 'Instant Arbitrage Pool',
          title: 'Emergency Buffer Vault',
          icon: 'shield',
          currentRupees: 15000,
          targetRupees: 15000,
          ratePace: 'High-Yield Treasury Escrow',
          tag: 'LOCKED',
          status: 'completed',
          secured: true
        },
        {
          id: 'tax-escrow',
          priority: 'PRIORITY 3 · MANDATORY',
          deadline: 'Q1 2027',
          daysLeft: 'Scheduled Tax Payout',
          title: 'Insurance & Tax Escrow',
          icon: 'landmark',
          currentRupees: 28000,
          targetRupees: 40000,
          ratePace: '₹3,000/mo active',
          tag: 'ON SCHEDULE',
          status: 'active'
        }
      ];
    } catch (e) {
      return [];
    }
  });

  const fetchGoal = async () => {
    try {
      const res = await API.get(`/budgets/${monthKey}`);
      setData(res.data.data);
      if (res.data.data?.budget) {
        setLimitRupees((res.data.data.budget.limitPaise / 100).toString());
        setNotes(res.data.data.budget.notes || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoal();
  }, []);

  const handleDepositToVault = (id, amt = 1000) => {
    const updated = milestones.map((m) => {
      if (m.id === id) {
        const nextVal = Math.min(m.targetRupees, m.currentRupees + amt);
        return { ...m, currentRupees: nextVal };
      }
      return m;
    });
    setMilestones(updated);
    localStorage.setItem('pennywise_savings_vaults', JSON.stringify(updated));
  };

  const handleUpdateLimit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.put(`/budgets/${monthKey}`, {
        limitPaise: rupeesToPaise(limitRupees),
        notes
      });
      setShowCapModal(false);
      fetchGoal();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update budget limit');
    } finally {
      setSaving(false);
    }
  };

  const { budget = {}, spentPaise = 0 } = data || {};
  const currentLimitPaise = budget.limitPaise || 800000;
  const currentSpentPaise = spentPaise || 336000;
  const burnPercent = currentLimitPaise > 0 
    ? Math.min(Math.round((currentSpentPaise / currentLimitPaise) * 100), 100) 
    : 42;

  const filteredVaults = milestones.filter(v => {
    if (activeVaultTab === 'ALL') return true;
    if (activeVaultTab === 'ACTIVE') return v.status === 'active';
    if (activeVaultTab === 'COMPLETED') return v.status === 'completed';
    return true;
  });

  return (
    <div className="stitch-container">
      {/* 1. Sub-Header Protocol Breadcrumb & Main Header */}
      <div className="goals-proto-bar">
        <span className="proto-pulse-dot" />
        <span>STRATEGIC CAPITAL ALLOCATION · PROTOCOL V4.8 · STABLE PACING</span>
      </div>

      <div className="goals-header-wrap">
        <div>
          <h1 className="goals-main-heading">Financial Goals & Budget Ceiling</h1>
          <p className="goals-sub-caption">
            Real-time discretionary burn envelope & multi-horizon milestone vault management with programmatic liquidity lock-in.
          </p>
        </div>

        <div className="goals-header-actions">
          <button onClick={() => setShowCapModal(true)} className="btn-goals-outline">
            <SlidersHorizontal size={14} /> Rebalance Caps
          </button>
          <button onClick={() => setShowNewGoalModal(true)} className="btn-goals-primary">
            <Plus size={14} /> Create New Goal
          </button>
        </div>
      </div>

      {/* 2. Top Envelope Hero Section (Burn Ratio Gauge + Micro-Caps Breakdown) */}
      <div className="goals-envelope-grid">
        
        {/* Left: Active Envelope Gauge */}
        <div className="goals-card-surface">
          <div className="goals-card-head">
            <div className="goals-badge-protocol">
              <Compass size={13} /> ACTIVE ENVELOPE GAUGE
            </div>
            <div className="goals-badge-pacing">
              4% AHEAD OF PACING
            </div>
          </div>

          <div className="goals-gauge-wrap">
            {/* Minimal SVG Semi-Circle Radial Meter */}
            <svg width="220" height="120" viewBox="0 0 220 120">
              <path 
                d="M 25 110 A 85 85 0 0 1 195 110" 
                fill="none" 
                stroke="#F1F5F9" 
                strokeWidth="14" 
                strokeLinecap="round" 
              />
              <path 
                d="M 25 110 A 85 85 0 0 1 195 110" 
                fill="none" 
                stroke="#047857" 
                strokeWidth="14" 
                strokeLinecap="round" 
                strokeDasharray="267" 
                strokeDashoffset={267 - (267 * (burnPercent / 100))} 
              />
            </svg>

            <div className="goals-gauge-center-text">
              <div className="goals-burn-ratio-title">BURN RATIO</div>
              <div className="goals-burn-ratio-val">{burnPercent}.0%</div>
              <div className="goals-burn-ratio-sub">
                ₹{(currentSpentPaise / 100).toLocaleString('en-IN')} Expended
              </div>
            </div>

            <div className="goals-gauge-limits">
              <span>₹0</span>
              <span>Cap: ₹{(currentLimitPaise / 100).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* 3 Metrics Bottom Bar */}
          <div className="goals-trio-metrics">
            <div className="goals-metric-box">
              <div className="goals-metric-box-label">MONTHLY CAP</div>
              <div className="goals-metric-box-val">₹{(currentLimitPaise / 100).toLocaleString('en-IN')}</div>
              <div className="goals-metric-box-sub">Refreshes 1 Dec</div>
            </div>

            <div className="goals-metric-box">
              <div className="goals-metric-box-label">SAFE CUSHION</div>
              <div className="goals-metric-box-val text-emerald">
                ₹{((currentLimitPaise - currentSpentPaise) / 100).toLocaleString('en-IN')}
              </div>
              <div className="goals-metric-box-sub">{100 - burnPercent}% Remaining</div>
            </div>

            <div className="goals-metric-box">
              <div className="goals-metric-box-label">SAFE VELOCITY</div>
              <div className="goals-metric-box-val">
                ₹{Math.round(((currentLimitPaise - currentSpentPaise) / 100) / 25)}.00<span className="text-muted text-xs font-normal">/day</span>
              </div>
              <div className="goals-metric-box-sub">12 Days Active</div>
            </div>
          </div>
        </div>

        {/* Right: Discretionary Bucket Partitions & Micro-Caps */}
        <div className="goals-card-surface">
          <div className="goals-card-head">
            <div>
              <div className="goals-metric-box-label">DISCRETIONARY BUCKET PARTITIONS</div>
              <h3 className="microcaps-title">Category Velocity & Micro-Caps</h3>
            </div>
            <div className="microcaps-armed-pill">
              <CheckCircle2 size={12} color="#047857" /> 4 Categories Armed
            </div>
          </div>

          <div className="microcaps-list">
            {/* Cap 1: Dining */}
            <div className="microcap-item">
              <div className="microcap-head">
                <div className="microcap-left">
                  <div className="microcap-icon-box">
                    <Coffee size={13} />
                  </div>
                  <div>
                    <div className="microcap-label">Dining & Specialty Coffee</div>
                    <div className="microcap-spent-meta">₹1,820 spent of ₹3,000 ceiling</div>
                  </div>
                </div>
                <div className="microcap-right">
                  <span className="microcap-status-pill status-controlled">CONTROLLED · 60%</span>
                  <span className="microcap-left-val">₹1,180 left</span>
                </div>
              </div>
              <div className="microcap-track">
                <div className="microcap-fill-dark w-pct-60" />
              </div>
            </div>

            {/* Cap 2: Transit */}
            <div className="microcap-item">
              <div className="microcap-head">
                <div className="microcap-left">
                  <div className="microcap-icon-box">
                    <Compass size={13} />
                  </div>
                  <div>
                    <div className="microcap-label">Transit & Urban Mobility</div>
                    <div className="microcap-spent-meta">₹740 spent of ₹2,000 ceiling</div>
                  </div>
                </div>
                <div className="microcap-right">
                  <span className="microcap-status-pill status-optimal">OPTIMAL · 37%</span>
                  <span className="microcap-left-val">₹1,260 left</span>
                </div>
              </div>
              <div className="microcap-track">
                <div className="microcap-fill-emerald w-pct-37" />
              </div>
            </div>

            {/* Cap 3: Subscriptions */}
            <div className="microcap-item">
              <div className="microcap-head">
                <div className="microcap-left">
                  <div className="microcap-icon-box">
                    <Tv size={13} />
                  </div>
                  <div>
                    <div className="microcap-label">Digital Subscriptions & Media</div>
                    <div className="microcap-spent-meta">₹800 spent of ₹1,500 ceiling</div>
                  </div>
                </div>
                <div className="microcap-right">
                  <span className="microcap-status-pill status-optimal">OPTIMAL · 53%</span>
                  <span className="microcap-left-val">₹700 left</span>
                </div>
              </div>
              <div className="microcap-track">
                <div className="microcap-fill-emerald w-pct-53" />
              </div>
            </div>

            {/* Cap 4: Impulse & Miscellaneous */}
            <div className="microcap-item">
              <div className="microcap-head">
                <div className="microcap-left">
                  <div className="microcap-icon-box">
                    <Zap size={13} />
                  </div>
                  <div>
                    <div className="microcap-label">Impulse & Miscellaneous Buffer</div>
                    <div className="microcap-spent-meta">₹0 spent of ₹1,500 ceiling</div>
                  </div>
                </div>
                <div className="microcap-right">
                  <span className="microcap-status-pill status-untouched">UNTOUCHED · 0%</span>
                  <span className="microcap-left-val">₹1,500 left</span>
                </div>
              </div>
              <div className="microcap-track">
                <div className="microcap-fill-dark w-pct-0" />
              </div>
            </div>
          </div>

          <div className="microcaps-footer">
            <span className="text-secondary font-bold">
              Aggregated Allocation Cap: ₹8,000 / ₹8,000 INR
            </span>
            <span className="text-emerald font-bold cursor-pointer">
              CONFIGURE ALERTS &gt;
            </span>
          </div>
        </div>
      </div>

      {/* 3. Multi-Horizon Capital Vaults (Active Savings Milestones) */}
      <div className="milestones-header">
        <div className="milestones-title-group">
          <div className="milestones-meta-pill">MULTI-HORIZON CAPITAL VAULTS</div>
          <h3>Active Savings Milestones</h3>
        </div>

        <div className="milestones-tab-strip">
          {['ALL', 'ACTIVE', 'COMPLETED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveVaultTab(tab)}
              className={activeVaultTab === tab ? 'milestones-tab-btn milestones-tab-btn-active' : 'milestones-tab-btn'}
            >
              {tab === 'ALL' ? 'All Vaults (5)' : tab === 'ACTIVE' ? 'Active (4)' : 'Completed (1)'}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Cards Grid */}
      <div className="milestones-grid-4">
        {filteredVaults.map((vault) => {
          const ratio = Math.min(100, Math.round((vault.currentRupees / vault.targetRupees) * 100));
          const deficit = Math.max(0, vault.targetRupees - vault.currentRupees);

          return (
            <div key={vault.id} className="milestone-vault-card">
              <div>
                <div className="milestone-top-meta">
                  <span>{vault.priority}</span>
                  <span>{vault.deadline}</span>
                </div>

                <div className="milestone-header">
                  <div className={vault.secured ? 'milestone-icon-wrap milestone-icon-secured' : 'milestone-icon-wrap milestone-icon-default'}>
                    {vault.icon === 'laptop' ? <Laptop size={15} /> :
                     vault.icon === 'plane' ? <Plane size={15} /> :
                     vault.icon === 'shield' ? <ShieldCheck size={15} /> :
                     <Landmark size={15} />}
                  </div>
                  <div>
                    <h4 className="milestone-title-text">{vault.title}</h4>
                    <div className="milestone-days-left">{vault.daysLeft}</div>
                  </div>
                </div>

                <div className="milestone-financial-row">
                  <span className="milestone-current-val">
                    ₹{vault.currentRupees.toLocaleString('en-IN')}
                  </span>
                  <span className="milestone-target-val">
                    Target ₹{vault.targetRupees.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="milestone-percent-row">
                  <span>{ratio}.0% Achieved</span>
                  <span className="text-secondary font-bold">
                    {deficit > 0 ? `₹${deficit.toLocaleString('en-IN')} deficit` : 'Fulfilled'}
                  </span>
                </div>

                <div className="milestone-progress-bar">
                  <div className="milestone-progress-fill" style={{ width: `${ratio}%` }} />
                </div>
              </div>

              <div>
                <div className="milestone-footer-strip">
                  <span>{vault.ratePace}</span>
                  <span className="text-dark font-extrabold">{vault.tag}</span>
                </div>

                <div className="milestone-action-row">
                  <button 
                    onClick={() => handleDepositToVault(vault.id, 1000)}
                    className="btn-milestone-deposit"
                  >
                    + Deposit
                  </button>
                  <button className="btn-milestone-more">
                    <MoreHorizontal size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Quantitative Acceleration Engine: Auto-Save Velocity Simulator */}
      <div className="simulator-card-surface">
        <div className="simulator-header-row">
          <div className="simulator-title-group">
            <div className="simulator-meta-pill">QUANTITATIVE ACCELERATION ENGINE</div>
            <h4>Auto-Save Velocity Simulator</h4>
          </div>
          <div className="goals-badge-pacing">
            OPTIMIZED VELOCITY
          </div>
        </div>

        <div className="simulator-controls-row">
          <div>
            <div className="text-secondary text-xs font-bold mb-2">
              WEEKLY LIQUIDITY SWEEP: ₹{simWeeklyDeposit.toLocaleString('en-IN')}
            </div>
            <input 
              type="range" 
              min="500" 
              max="10000" 
              step="500" 
              value={simWeeklyDeposit} 
              onChange={(e) => setSimWeeklyDeposit(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-muted text-xs font-bold mt-1">
              <span>₹500 / wk</span>
              <span>₹10,000 / wk</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="text-muted text-xs font-extrabold uppercase tracking-wider">
              PROJECTED ANNUAL IMPACT
            </div>
            <div className="text-xl font-black text-emerald font-heading mt-1">
              +₹{(simWeeklyDeposit * 52).toLocaleString('en-IN')}.00
            </div>
            <div className="text-secondary text-xs mt-1">
              Accelerates Goa Retreat by 34 days & MacBook Vault by 51 days.
            </div>
          </div>
        </div>
      </div>

      {/* Rebalance Modal */}
      {showCapModal && (
        <div className="modal-overlay" onClick={() => setShowCapModal(false)}>
          <div className="modal-content modal-stitch-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-stitch-header">
              <h3 className="font-extrabold text-sm m-0">Rebalance Monthly Cap</h3>
              <button onClick={() => setShowCapModal(false)} className="modal-close-btn">✕</button>
            </div>
            <form onSubmit={handleUpdateLimit}>
              <div className="mb-3">
                <label className="block text-secondary font-bold text-xs mb-1">
                  Discretionary Hard Ceiling (INR)
                </label>
                <input 
                  type="number" 
                  value={limitRupees} 
                  onChange={(e) => setLimitRupees(e.target.value)} 
                  className="form-input font-extrabold text-base"
                />
              </div>
              <button type="submit" disabled={saving} className="modal-stitch-submit">
                {saving ? 'Updating...' : 'Save Rebalanced Cap'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create New Goal Modal */}
      {showNewGoalModal && (
        <div className="modal-overlay" onClick={() => setShowNewGoalModal(false)}>
          <div className="modal-content modal-stitch-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-stitch-header">
              <h3 className="font-extrabold text-sm m-0">Arm New Savings Goal</h3>
              <button onClick={() => setShowNewGoalModal(false)} className="modal-close-btn">✕</button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const form = e.target;
              const title = form.goalTitle.value;
              const target = Number(form.goalTarget.value);
              const newGoal = {
                id: `goal-${Date.now()}`,
                priority: 'PRIORITY 4 · CUSTOM',
                deadline: 'Dec 2027',
                daysLeft: '365 days remaining',
                title,
                icon: 'target',
                currentRupees: 0,
                targetRupees: target,
                ratePace: 'Auto-pilot active',
                tag: 'NEW VAULT',
                status: 'active'
              };
              const updated = [...milestones, newGoal];
              setMilestones(updated);
              localStorage.setItem('pennywise_savings_vaults', JSON.stringify(updated));
              setShowNewGoalModal(false);
            }}>
              <div className="mb-3">
                <label className="block text-secondary font-bold text-xs mb-1">Goal Designation</label>
                <input name="goalTitle" required placeholder="e.g. Electric Vehicle Downpayment" className="form-input text-xs" />
              </div>
              <div className="mb-3">
                <label className="block text-secondary font-bold text-xs mb-1">Target Capital (INR)</label>
                <input name="goalTarget" type="number" required placeholder="50000" className="form-input text-xs" />
              </div>
              <button type="submit" className="modal-stitch-submit">
                Initialize Milestone Vault
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Footer Attestation */}
      <div className="stitch-attestation-bar">
        <span>© 2026 PENNYWISE WEALTH STUDIO. STRATEGIC CAPITAL PROTOCOLS.</span>
        <div className="flex gap-3">
          <span>Envelope Guard</span>
          <span>Vault Attestation</span>
          <span>Arbitrage Engine</span>
        </div>
      </div>
    </div>
  );
}
