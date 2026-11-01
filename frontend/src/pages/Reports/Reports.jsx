import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { formatRupees, formatDate } from '../../services/currency';
import { 
  TrendingUp, 
  TrendingDown, 
  PieChart as PieIcon, 
  Calendar, 
  Download, 
  SlidersHorizontal, 
  Sparkles, 
  ArrowUpRight, 
  CheckCircle2, 
  Target, 
  ShieldCheck, 
  Lock,
  Layers,
  ChevronRight
} from 'lucide-react';

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('3M');

  useEffect(() => {
    API.get('/reports/expenses?period=monthly')
      .then(res => {
        setData(res.data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="stitch-container">
      {/* 1. Protocol Top Status */}
      <div className="proto-status-bar">
        <div className="flex items-center gap-2">
          <span className="proto-pulse-dot" />
          <span>MACRO LIQUIDITY TELEMETRY · ANALYTICS ENGINE V3.2</span>
          <span className="academic-semester-badge">● Live Audit · 98.4% Confidence</span>
        </div>

        <div className="flex items-center gap-2">
          {['1M', '3M', '6M', '1Y', 'YTD'].map(r => (
            <button 
              key={r}
              onClick={() => setRange(r)}
              className={range === r ? 'proto-filter-pill-active' : 'proto-filter-pill'}
            >
              {r}
            </button>
          ))}
          <button className="btn-goals-outline text-xs py-1 px-2">
            <Download size={12} /> Export Insights Report
          </button>
        </div>
      </div>

      {/* 2. Main Title Row */}
      <div className="goals-header-wrap">
        <div>
          <h1 className="goals-main-heading">Financial Insights & Wealth Analytics</h1>
          <p className="goals-sub-caption">
            Continuous liquidity modeling, burn trajectory dynamics, and multi-horizon capital accumulation velocity across distributed sovereign reserves.
          </p>
        </div>
      </div>

      {/* 3. Three Macro Telemetry Cards */}
      <div className="telemetry-strip-grid">
        <div className="telemetry-card-box">
          <div className="telemetry-title-row">
            <span className="telemetry-title-text">NET CAPITAL ACCUMULATION</span>
            <span className="telemetry-pill-drop">▲ +14.2% MoM</span>
          </div>
          <div className="telemetry-value-dark">
            ₹45,550.00 <span className="text-muted text-xs font-normal">/ mo</span>
          </div>
          <div className="telemetry-sub-row">
            <span className="text-secondary">● Retained cash margin:</span>
            <span className="text-emerald font-bold">54.1%</span>
          </div>
        </div>

        <div className="telemetry-card-box">
          <div className="telemetry-title-row">
            <span className="telemetry-title-text">ROLLING BURN VELOCITY</span>
            <span className="telemetry-pill-drop">▼ -8.4% Burn</span>
          </div>
          <div className="telemetry-value-dark">
            ₹1,288.33 <span className="text-muted text-xs font-normal">/ day</span>
          </div>
          <div className="telemetry-sub-row">
            <span className="text-secondary">● Dynamic ceiling status:</span>
            <span className="text-emerald font-bold">OPTIMAL COMPLIANCE</span>
          </div>
        </div>

        <div className="telemetry-card-box">
          <div className="telemetry-title-row">
            <span className="telemetry-title-text">COMPOUND VELOCITY INDEX</span>
            <span className="text-muted text-xs font-bold">EST. 1.4x DELTA</span>
          </div>
          <div className="telemetry-value-emerald">
            1.38x <span className="text-muted text-xs font-normal">+0.14 Pacing</span>
          </div>
          <div className="telemetry-sub-row">
            <span className="text-secondary">● Reserve posture:</span>
            <span className="text-dark font-extrabold">HIGH LIQUIDITY BUFFER</span>
          </div>
        </div>
      </div>

      {/* 4. Cash Flow Curves & Liquidity Delta Card */}
      <div className="analytics-curves-card">
        <div className="analytics-curves-head">
          <div>
            <div className="flex items-center gap-2">
              <span className="proto-pulse-dot" />
              <h3 className="font-extrabold text-sm m-0 text-dark">Cash Flow Curves & Liquidity Delta</h3>
            </div>
            <div className="text-muted text-xs mt-1">
              High-precision dual telemetry comparing realized inflows versus sovereign discretionary spend vectors.
            </div>
          </div>

          <div className="curves-legend-strip">
            <span className="text-emerald font-bold flex items-center gap-1">
              <span className="inline-block w-3 h-1 bg-emerald-600 rounded" /> Inflow Capital (+)
            </span>
            <span className="text-muted font-bold flex items-center gap-1">
              <span className="inline-block w-3 h-1 bg-slate-400 rounded" /> Discretionary Outflow (−)
            </span>
          </div>
        </div>

        {/* Dual Velocity Wave SVG */}
        <div className="analytics-svg-wrap">
          <svg width="100%" height="100%" viewBox="0 0 800 200" fill="none" preserveAspectRatio="none">
            <path 
              d="M 0 160 C 150 140, 250 80, 400 60 C 550 40, 650 65, 800 50" 
              stroke="#047857" 
              strokeWidth="3" 
              strokeLinecap="round" 
            />
            <path 
              d="M 0 160 C 150 140, 250 80, 400 60 C 550 40, 650 65, 800 50 L 800 200 L 0 200 Z" 
              fill="rgba(16, 185, 129, 0.08)" 
            />
            <path 
              d="M 0 180 C 150 175, 250 160, 400 140 C 550 120, 650 135, 800 130" 
              stroke="#94A3B8" 
              strokeWidth="2" 
              strokeDasharray="4 4" 
            />
          </svg>
        </div>

        <div className="analytics-trio-bottom">
          <div>
            <div className="text-muted text-xs font-bold uppercase">AVERAGE GROSS INFLOW</div>
            <div className="text-xl font-black text-dark font-heading mt-1">₹84,200.00</div>
            <div className="text-emerald text-xs font-bold">+9.6% above baseline model</div>
          </div>
          <div>
            <div className="text-muted text-xs font-bold uppercase">AVERAGE MONTHLY BURN</div>
            <div className="text-xl font-black text-dark font-heading mt-1">₹38,650.00</div>
            <div className="text-secondary text-xs">Discretionary ratio: 45.9%</div>
          </div>
          <div>
            <div className="text-muted text-xs font-bold uppercase">NET FLOW EFFICIENCY</div>
            <div className="text-xl font-black text-emerald font-heading mt-1">+118% Coverage</div>
            <div className="text-emerald text-xs font-bold">Surplus liquidity sustained</div>
          </div>
        </div>
      </div>

      {/* 5. Lower Section: Discretionary Outflow Drivers + Savings Velocity & Milestones */}
      <div className="academic-bottom-grid">
        {/* Box A: Outflow Drivers */}
        <div className="academic-breakdown-card">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="font-extrabold text-sm m-0 text-dark">Discretionary Outflow Drivers</h4>
              <div className="text-muted text-xs">Breakdown by capital destination & burn volatility</div>
            </div>
            <span className="telemetry-pill-drop">−8.4% DINING BURN</span>
          </div>

          <div className="flex items-center gap-6 mb-4">
            <div className="w-24 h-24 rounded-full border-8 border-slate-100 border-t-emerald-600 border-r-emerald-600 flex flex-col items-center justify-center">
              <span className="text-xs font-black text-dark font-heading">₹38,650</span>
              <span className="text-muted text-xs">Under Budget</span>
            </div>

            <div className="flex-1 flex flex-col gap-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-dark">■ Food & Specialty Dining</span>
                <span className="font-black text-dark">₹14,000</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="font-bold text-emerald">■ Academic & Study Outlay</span>
                <span className="font-black text-dark">₹9,600</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="font-bold text-secondary">■ Travel & Urban Mobility</span>
                <span className="font-black text-dark">₹8,280</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="font-bold text-muted">■ Shopping & Tech Gear</span>
                <span className="font-black text-dark">₹6,770</span>
              </div>
            </div>
          </div>
        </div>

        {/* Box B: Savings Velocity & Goal Milestones */}
        <div className="academic-breakdown-card">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="font-extrabold text-sm m-0 text-dark">Savings Velocity & Goal Milestones</h4>
              <div className="text-muted text-xs">Predictive milestone pacing based on 90-day surplus</div>
            </div>
            <span className="text-muted text-xs font-bold">TOTAL: ₹75,500</span>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center p-2 rounded bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} color="#047857" />
                <span className="text-xs font-bold text-dark">Emergency Vault (₹15,000 / ₹15,000)</span>
              </div>
              <span className="academic-badge-schedule">COMPLETED</span>
            </div>

            <div className="flex justify-between items-center p-2 rounded bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2">
                <Target size={14} color="#047857" />
                <span className="text-xs font-bold text-dark">Goa Retreat Fund (₹18,500 / ₹25,000)</span>
              </div>
              <span className="telemetry-pill-drop">+14D ACCELERATED</span>
            </div>

            <div className="flex justify-between items-center p-2 rounded bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2">
                <Target size={14} color="#64748B" />
                <span className="text-xs font-bold text-dark">MacBook Pro Tech Fund (₹42,000 / ₹65,000)</span>
              </div>
              <span className="text-muted text-xs font-bold">ON TARGET</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Algorithmic Telemetry Audit & Capital Actions */}
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={14} color="#047857" />
        <h3 className="font-extrabold text-sm m-0 text-dark">Algorithmic Telemetry Audit & Capital Actions</h3>
      </div>

      <div className="analytics-audit-actions-grid">
        <div className="analytics-action-box">
          <div className="text-muted text-xs font-bold uppercase mb-1">BURN COMPRESSION</div>
          <h4 className="font-extrabold text-sm text-dark m-0">Weekend Dining Normalized</h4>
          <p className="text-secondary text-xs mt-1 mb-3">
            Weekly recurring weekend leisure spend contracted by ₹640 versus last month's running median.
          </p>
          <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-100">
            <span className="text-muted font-bold">STATUS: STABILIZED</span>
            <span className="text-emerald font-bold">DELTA: -15%</span>
          </div>
        </div>

        <div className="analytics-action-box">
          <div className="text-muted text-xs font-bold uppercase mb-1">SINKING FUND ALLOCATION</div>
          <h4 className="font-extrabold text-sm text-dark m-0">Education Sweep Scheduled</h4>
          <p className="text-secondary text-xs mt-1 mb-3">
            Automatic sweep of ₹10,000 queued for December 1st into term fees escrow vault without liquidity breach.
          </p>
          <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-100">
            <span className="text-muted font-bold">EXECUTION: 01 DEC 2026</span>
            <span className="text-emerald font-bold">PRE-APPROVED</span>
          </div>
        </div>

        <div className="analytics-action-box">
          <div className="text-muted text-xs font-bold uppercase mb-1">ESCROW & TREASURY YIELD</div>
          <h4 className="font-extrabold text-sm text-dark m-0">High-Yield Buffer Provisioning</h4>
          <p className="text-secondary text-xs mt-1 mb-3">
            ₹28,000 deployed across sovereign liquid instruments generating a continuous 7.2% APR risk-free return.
          </p>
          <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-100">
            <span className="text-muted font-bold">YIELD: +₹168.20 / mo</span>
            <span className="text-emerald font-bold">7.2% APR</span>
          </div>
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
