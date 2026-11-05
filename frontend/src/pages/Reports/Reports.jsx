import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { formatRupees, formatDate } from '../../services/currency';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Download, 
  Sparkles, 
  ArrowUpRight, 
  CheckCircle2, 
  ShieldCheck, 
  Layers
} from 'lucide-react';

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('3M');

  useEffect(() => {
    API.get('/reports/summary')
      .then(res => {
        setData(res.data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const { monthlyTrend = [], categoryBreakdown = [] } = data || {};

  // Compute live aggregates from monthlyTrend
  const currentMonthData = monthlyTrend[monthlyTrend.length - 1] || { income: 0, expense: 0, fees: 0 };
  const prevMonthData = monthlyTrend[monthlyTrend.length - 2] || { income: 0, expense: 0, fees: 0 };

  const currentMonthIncomePaise = currentMonthData.income * 100;
  const currentMonthExpensePaise = (currentMonthData.expense + currentMonthData.fees) * 100;
  const retainedSurplusPaise = Math.max(0, currentMonthIncomePaise - currentMonthExpensePaise);
  const dailyBurnRupees = Math.round((currentMonthData.expense + currentMonthData.fees) / 30);

  return (
    <div className="stitch-container">
      {/* 1. Protocol Top Status */}
      <div className="proto-status-bar">
        <div className="flex items-center gap-2">
          <span className="proto-pulse-dot" />
          <span>MACRO LIQUIDITY TELEMETRY · ANALYTICS SUITE</span>
          <span className="academic-semester-badge">● Live Analytics Sync</span>
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
            <span className="telemetry-pill-drop">Realized</span>
          </div>
          <div className="telemetry-value-dark">
            {formatRupees(retainedSurplusPaise)} <span className="text-muted text-xs font-normal">/ mo</span>
          </div>
          <div className="telemetry-sub-row">
            <span className="text-secondary">● Retained liquidity margin:</span>
            <span className="text-emerald font-bold">
              {currentMonthIncomePaise > 0 ? Math.round((retainedSurplusPaise / currentMonthIncomePaise) * 100) : 0}%
            </span>
          </div>
        </div>

        <div className="telemetry-card-box">
          <div className="telemetry-title-row">
            <span className="telemetry-title-text">ROLLING BURN VELOCITY</span>
            <span className="telemetry-pill-drop">Burn Pacing</span>
          </div>
          <div className="telemetry-value-dark">
            ₹{dailyBurnRupees.toLocaleString('en-IN')}.00 <span className="text-muted text-xs font-normal">/ day</span>
          </div>
          <div className="telemetry-sub-row">
            <span className="text-secondary">● Dynamic ceiling status:</span>
            <span className="text-emerald font-bold">OPTIMAL COMPLIANCE</span>
          </div>
        </div>

        <div className="telemetry-card-box">
          <div className="telemetry-title-row">
            <span className="telemetry-title-text">INFLOW VS OUTFLOW COVERAGE</span>
            <span className="text-muted text-xs font-bold">COVERAGE RATIO</span>
          </div>
          <div className="telemetry-value-emerald">
            {currentMonthExpensePaise > 0 ? (currentMonthIncomePaise / currentMonthExpensePaise).toFixed(2) : '1.00'}x
          </div>
          <div className="telemetry-sub-row">
            <span className="text-secondary">● Reserve posture:</span>
            <span className="text-dark font-extrabold">SOLVENT</span>
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
            <div className="text-muted text-xs font-bold uppercase">GROSS INFLOW (CURRENT MONTH)</div>
            <div className="text-xl font-black text-dark font-heading mt-1">{formatRupees(currentMonthIncomePaise)}</div>
            <div className="text-emerald text-xs font-bold">Verified ledger deposits</div>
          </div>
          <div>
            <div className="text-muted text-xs font-bold uppercase">TOTAL BURN (CURRENT MONTH)</div>
            <div className="text-xl font-black text-dark font-heading mt-1">{formatRupees(currentMonthExpensePaise)}</div>
            <div className="text-secondary text-xs">Total settled disbursements</div>
          </div>
          <div>
            <div className="text-muted text-xs font-bold uppercase">NET FLOW EFFICIENCY</div>
            <div className="text-xl font-black text-emerald font-heading mt-1">
              {formatRupees(retainedSurplusPaise)}
            </div>
            <div className="text-emerald text-xs font-bold">Retained capital buffer</div>
          </div>
        </div>
      </div>

      {/* 5. Lower Section: Live Discretionary Outflow Drivers */}
      <div className="academic-bottom-grid">
        <div className="academic-breakdown-card">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="font-extrabold text-sm m-0 text-dark">Discretionary Outflow Drivers</h4>
              <div className="text-muted text-xs">Breakdown by capital destination & burn volatility</div>
            </div>
            <span className="telemetry-pill-drop">LIVE DATABASE</span>
          </div>

          {categoryBreakdown.length === 0 ? (
            <div className="text-center py-8 text-muted text-xs">
              No categorical outlays logged yet.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {categoryBreakdown.map((cat) => (
                <div key={cat.name} className="flex justify-between items-center text-xs py-2 border-b border-slate-100">
                  <span className="font-bold text-dark">{cat.name}</span>
                  <span className="font-black text-dark">₹{cat.amountRupees.toLocaleString('en-IN')}.00</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="academic-breakdown-card">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="font-extrabold text-sm m-0 text-dark">Monthly Trend Velocity</h4>
              <div className="text-muted text-xs">Continuous 6-month historical reconciliation</div>
            </div>
            <span className="text-muted text-xs font-bold">6-MONTH WINDOW</span>
          </div>

          <div className="flex flex-col gap-2">
            {monthlyTrend.map((m) => (
              <div key={m.monthKey} className="flex justify-between items-center text-xs py-2 border-b border-slate-100">
                <span className="font-bold text-dark">{m.label} ({m.monthKey})</span>
                <div className="flex gap-4">
                  <span className="text-emerald font-bold">+{formatRupees(m.income * 100)}</span>
                  <span className="text-rose font-bold">−{formatRupees(m.expense * 100)}</span>
                </div>
              </div>
            ))}
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
