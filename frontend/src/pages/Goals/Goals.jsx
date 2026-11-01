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
  MoreHorizontal
} from 'lucide-react';

export default function Goals() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [limitRupees, setLimitRupees] = useState('8000');
  const [saving, setSaving] = useState(false);
  const [activeVaultTab, setActiveVaultTab] = useState('ALL');
  const [showCapModal, setShowCapModal] = useState(false);
  const [showNewGoalModal, setShowNewGoalModal] = useState(false);
  const [creatingGoal, setCreatingGoal] = useState(false);

  // 100% Real-time savings goals queried from MongoDB backend
  const [goals, setGoals] = useState([]);

  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const fetchGoalsData = async () => {
    try {
      const [budgetRes, goalsRes] = await Promise.all([
        API.get(`/budgets/${monthKey}`),
        API.get('/goals')
      ]);

      setData(budgetRes.data.data);
      if (budgetRes.data.data?.budget) {
        setLimitRupees((budgetRes.data.data.budget.limitPaise / 100).toString());
      }
      setGoals(goalsRes.data.data || []);
    } catch (err) {
      console.error('Failed to load goals or budget:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoalsData();
  }, []);

  // Atomic deposit into Goal vault using transfer_out on Account
  const handleDepositToVault = async (goalId, amt = 1000) => {
    try {
      await API.post(`/goals/${goalId}/deposit`, {
        amountPaise: rupeesToPaise(amt)
      });
      await fetchGoalsData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to deposit to vault');
    }
  };

  // Delete Goal from MongoDB
  const handleDeleteGoal = async (goalId) => {
    if (!window.confirm('Are you sure you want to remove this milestone vault?')) return;
    try {
      await API.delete(`/goals/${goalId}`);
      await fetchGoalsData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove goal');
    }
  };

  const handleUpdateLimit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.put(`/budgets/${monthKey}`, {
        limitPaise: rupeesToPaise(limitRupees)
      });
      setShowCapModal(false);
      await fetchGoalsData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update budget limit');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateNewGoal = async (e) => {
    e.preventDefault();
    setCreatingGoal(true);
    const form = e.target;
    try {
      await API.post('/goals', {
        name: form.goalTitle.value,
        targetPaise: Number(form.goalTarget.value) * 100,
        deadline: form.goalDate?.value || null,
        priority: 'CUSTOM GOAL'
      });
      setShowNewGoalModal(false);
      await fetchGoalsData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create goal');
    } finally {
      setCreatingGoal(false);
    }
  };

  const { budget = {}, spentPaise = 0, remainingPaise = 0, categoryBreakdown = [] } = data || {};
  const currentLimitPaise = budget.limitPaise || 800000;
  const currentSpentPaise = spentPaise;
  const burnPercent = currentLimitPaise > 0 
    ? Math.min(Math.round((currentSpentPaise / currentLimitPaise) * 100), 100) 
    : 0;

  const filteredVaults = goals.filter(v => {
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
        <span>STRATEGIC CAPITAL ALLOCATION · MONGODB DATABASE RECONCILED</span>
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

      {/* 2. Top Envelope Hero Section */}
      <div className="goals-envelope-grid">
        <div className="goals-card-surface">
          <div className="goals-card-head">
            <div className="goals-badge-protocol">
              <Compass size={13} /> ACTIVE ENVELOPE GAUGE
            </div>
            <div className="goals-badge-pacing">
              {burnPercent > 80 ? 'HIGH BURN PACING' : 'STABLE PACING'}
            </div>
          </div>

          <div className="goals-gauge-wrap">
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
                {formatRupees(currentSpentPaise)} Expended
              </div>
            </div>

            <div className="goals-gauge-limits">
              <span>₹0</span>
              <span>Cap: {formatRupees(currentLimitPaise)}</span>
            </div>
          </div>

          <div className="goals-trio-metrics">
            <div className="goals-metric-box">
              <div className="goals-metric-box-label">MONTHLY CAP</div>
              <div className="goals-metric-box-val">{formatRupees(currentLimitPaise)}</div>
              <div className="goals-metric-box-sub">Current Cycle</div>
            </div>

            <div className="goals-metric-box">
              <div className="goals-metric-box-label">SAFE CUSHION</div>
              <div className="goals-metric-box-val text-emerald">
                {formatRupees(Math.max(0, currentLimitPaise - currentSpentPaise))}
              </div>
              <div className="goals-metric-box-sub">{100 - burnPercent}% Remaining</div>
            </div>

            <div className="goals-metric-box">
              <div className="goals-metric-box-label">SAFE VELOCITY</div>
              <div className="goals-metric-box-val">
                {formatRupees(Math.round(Math.max(0, currentLimitPaise - currentSpentPaise) / 25))}<span className="text-muted text-xs font-normal">/day</span>
              </div>
              <div className="goals-metric-box-sub">Pacing Target</div>
            </div>
          </div>
        </div>

        {/* Right: Real-time Category Breakdown */}
        <div className="goals-card-surface">
          <div className="goals-card-head">
            <div>
              <div className="goals-metric-box-label">DISCRETIONARY BUCKET PARTITIONS</div>
              <h3 className="microcaps-title">Live Category Burn</h3>
            </div>
            <div className="microcaps-armed-pill">
              <CheckCircle2 size={12} color="#047857" /> Synchronized
            </div>
          </div>

          <div className="microcaps-list">
            {categoryBreakdown.length === 0 ? (
              <div className="text-center py-10 text-muted text-xs">
                No categorical outlays recorded yet this month.
              </div>
            ) : (
              categoryBreakdown.slice(0, 4).map((cat) => {
                const catSpentPaise = (cat.amountRupees || 0) * 100;
                const catRatio = currentSpentPaise > 0 ? Math.min(100, Math.round((catSpentPaise / currentSpentPaise) * 100)) : 0;
                return (
                  <div key={cat.name} className="microcap-item">
                    <div className="microcap-head">
                      <div className="microcap-left">
                        <div className="microcap-icon-box">
                          <Coffee size={13} />
                        </div>
                        <div>
                          <div className="microcap-label">{cat.name}</div>
                          <div className="microcap-spent-meta">{formatRupees(catSpentPaise)} disbursed</div>
                        </div>
                      </div>
                      <div className="microcap-right">
                        <span className="microcap-status-pill status-optimal">{catRatio}% of Outflow</span>
                      </div>
                    </div>
                    <div className="microcap-track">
                      <div className="microcap-fill-emerald" style={{ width: `${catRatio}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 3. Multi-Horizon Capital Vaults - 100% from MongoDB */}
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
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="milestones-grid-4">
        {filteredVaults.length === 0 ? (
          <div className="col-span-4 text-center py-10 bg-white rounded-xl border border-slate-200">
            <p className="text-secondary text-sm font-bold">No savings goals found in your database.</p>
            <button onClick={() => setShowNewGoalModal(true)} className="btn-goals-primary mt-2">
              <Plus size={14} /> Initialize Your First Vault
            </button>
          </div>
        ) : (
          filteredVaults.map((vault) => {
            const savedRupees = Math.round((vault.savedPaise || 0) / 100);
            const targetRupees = Math.round((vault.targetPaise || 0) / 100);
            const ratio = targetRupees > 0 ? Math.min(100, Math.round((savedRupees / targetRupees) * 100)) : 100;
            const deficit = Math.max(0, targetRupees - savedRupees);
            const deadlineFormatted = vault.deadline ? new Date(vault.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Flexible Target';

            return (
              <div key={vault._id} className="milestone-vault-card">
                <div>
                  <div className="milestone-top-meta">
                    <span>{vault.priority || 'SAVINGS VAULT'}</span>
                    <span>{deadlineFormatted}</span>
                  </div>

                  <div className="milestone-header">
                    <div className="milestone-icon-wrap milestone-icon-default">
                      <Target size={15} />
                    </div>
                    <div>
                      <h4 className="milestone-title-text">{vault.name}</h4>
                      <div className="milestone-days-left">
                        {vault.status === 'completed' ? 'Fulfilled Goal' : 'Active Accumulation'}
                      </div>
                    </div>
                  </div>

                  <div className="milestone-financial-row">
                    <span className="milestone-current-val">
                      ₹{savedRupees.toLocaleString('en-IN')}
                    </span>
                    <span className="milestone-target-val">
                      Target ₹{targetRupees.toLocaleString('en-IN')}
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
                  <div className="milestone-action-row">
                    <button 
                      onClick={() => handleDepositToVault(vault._id, 1000)}
                      className="btn-milestone-deposit"
                      disabled={vault.status === 'completed'}
                    >
                      {vault.status === 'completed' ? 'Fulfilled' : '+ Deposit ₹1,000'}
                    </button>
                    <button 
                      onClick={() => handleDeleteGoal(vault._id)}
                      className="btn-milestone-more text-rose-500"
                      title="Remove Goal Vault"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
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
            <form onSubmit={handleCreateNewGoal}>
              <div className="mb-3">
                <label className="block text-secondary font-bold text-xs mb-1">Goal Designation</label>
                <input name="goalTitle" required placeholder="e.g. Laptop Replacement Fund" className="form-input text-xs" />
              </div>
              <div className="mb-3">
                <label className="block text-secondary font-bold text-xs mb-1">Target Capital (INR)</label>
                <input name="goalTarget" type="number" required placeholder="50000" className="form-input text-xs" />
              </div>
              <div className="mb-3">
                <label className="block text-secondary font-bold text-xs mb-1">Target Deadline</label>
                <input name="goalDate" type="date" className="form-input text-xs" />
              </div>
              <button type="submit" disabled={creatingGoal} className="modal-stitch-submit">
                {creatingGoal ? 'Saving to Database...' : 'Initialize Milestone Vault'}
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
