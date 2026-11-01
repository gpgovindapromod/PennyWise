import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { formatRupees, formatDate, rupeesToPaise } from '../../services/currency';
import { 
  GraduationCap, 
  Plus, 
  Calendar, 
  CreditCard, 
  FileText, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  Printer, 
  Cpu, 
  PenTool, 
  ShieldCheck, 
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Academics({ onOpenAddExpense, onPayFeeInstallment }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [feeForm, setFeeForm] = useState({
    title: '',
    department: 'Dept. of Computer Science & Engineering',
    installment: 'Installment 1 of 2',
    clearedPaise: 0,
    totalPaise: 2500000,
    dueDate: '15 Dec 2026',
    status: 'mandatory'
  });

  const fetchAcademics = async () => {
    try {
      const res = await API.get('/academics/summary');
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAcademics();
  }, []);

  // Real-time data from API summary or live state
  const { 
    currentMonthStudyOutlayPaise = 485000,
    academicYearCumulativePaise = 18420000,
    pendingImmediatePaise = 2850000,
    recentStudyExpenses = [],
    feeObligations = []
  } = data || {};

  // Default rich obligations state synced with real-time payments
  const [obligations, setObligations] = useState(() => {
    try {
      const saved = localStorage.getItem('pennywise_academic_obligations');
      return saved ? JSON.parse(saved) : [
        {
          id: 'fee-1',
          type: 'MANDATORY · INSTITUTIONAL',
          typeClass: 'type-mandatory',
          title: 'Semester 5 Tuition Fee',
          dept: 'Dept. of Computer Science & Engineering • Installment 2 of 3',
          clearedPaise: 6500000,
          totalPaise: 9500000,
          progress: 68.4,
          dueDate: 'Due 15 Dec 2026',
          installmentPayRupees: 15000,
          cleared: false
        },
        {
          id: 'fee-2',
          type: 'FULLY CLEARED',
          typeClass: 'type-cleared',
          title: 'University Exam Protocol',
          dept: 'Autonomous Examination Board • All Core Papers',
          clearedPaise: 450000,
          totalPaise: 450000,
          progress: 100,
          dueDate: 'Settled on 10 Nov via UPI',
          cleared: true
        },
        {
          id: 'fee-3',
          type: 'EQUIPMENT ALLOCATION',
          typeClass: 'type-equipment',
          title: 'Robotics Lab & Hardware Kit',
          dept: 'Embedded Systems Specialization Lab Fee',
          clearedPaise: 900000,
          totalPaise: 1800000,
          progress: 50.0,
          dueDate: 'Due 05 Jan 2027',
          installmentPayRupees: 9000,
          cleared: false
        }
      ];
    } catch (e) {
      return [];
    }
  });

  const handlePayInstallment = (id, amountRupees) => {
    const updated = obligations.map(ob => {
      if (ob.id === id) {
        const nextCleared = Math.min(ob.totalPaise, ob.clearedPaise + amountRupees * 100);
        const nextProgress = Math.round((nextCleared / ob.totalPaise) * 100);
        return {
          ...ob,
          clearedPaise: nextCleared,
          progress: nextProgress,
          cleared: nextCleared >= ob.totalPaise
        };
      }
      return ob;
    });
    setObligations(updated);
    localStorage.setItem('pennywise_academic_obligations', JSON.stringify(updated));
  };

  // Recent Study Outlay rows (from real API or rich live state)
  const studyLogs = recentStudyExpenses.length > 0 ? recentStudyExpenses : [
    {
      id: 'log-1',
      description: 'Crossword Book Depot',
      sub: 'Distributed Systems Monograph',
      category: 'ACADEMICS',
      amountPaise: 64000,
      method: 'Visa Platinum',
      date: '17 Nov 2026'
    },
    {
      id: 'log-2',
      description: 'Campus Reprographics',
      sub: 'Thesis Draft Spiral Binding',
      category: 'PRINTS',
      amountPaise: 18500,
      method: 'UPI Fast',
      date: '16 Nov 2026'
    },
    {
      id: 'log-3',
      description: 'Robotics Studio Component Store',
      sub: 'ESP32 & Sensor Kit Expansion',
      category: 'LAB KIT',
      amountPaise: 145000,
      method: 'UPI HDFC',
      date: '14 Nov 2026'
    },
    {
      id: 'log-4',
      description: 'Stationery Hub',
      sub: 'Technical Drafting Pens & Grid Sheets',
      category: 'STATIONERY',
      amountPaise: 32000,
      method: 'Cash',
      date: '12 Nov 2026'
    }
  ];

  return (
    <div className="stitch-container">
      {/* 1. Protocol Sub-Header & Breadcrumb */}
      <div className="academic-proto-bar">
        <span className="proto-pulse-dot" />
        <span>ACADEMIC PORTFOLIO ALLOCATION · PROTOCOL V2.4</span>
        <span className="academic-semester-badge">Active Semester 5</span>
      </div>

      {/* 2. Main Title Row & Actions */}
      <div className="academic-header-row">
        <div>
          <h1 className="academic-main-heading">Academic Obligations & College Fee Tracker</h1>
          <p className="academic-sub-caption">
            Dedicated educational capital ledger, milestone installment tracking, and semester material outlays.
          </p>
        </div>

        <div className="academic-header-actions">
          <button className="btn-goals-outline">
            <Calendar size={13} /> TERM 2026-2027 (WINTER CYCLE)
          </button>
          <button onClick={onOpenAddExpense} className="btn-goals-outline">
            + Record Study Cost
          </button>
          <button onClick={() => setShowFeeModal(true)} className="btn-goals-primary">
            + New Obligation
          </button>
        </div>
      </div>

      {/* 3. Three Stat Telemetry Cards */}
      <div className="academic-stats-grid">
        {/* Metric 1 */}
        <div className="academic-stat-card">
          <div className="academic-stat-top">
            <span>CURRENT MONTH STUDY OUTLAY</span>
            <span className="academic-badge-danger">▲ +4.2%</span>
          </div>
          <div className="academic-stat-big-val">
            {formatRupees(currentMonthStudyOutlayPaise)}
          </div>
          <div className="academic-stat-sub-row">
            <span>Textbooks, lab kit & research prints</span>
            <span className="text-secondary font-bold">Burn: Normal</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="academic-stat-card">
          <div className="academic-stat-top">
            <span>ACADEMIC YEAR CUMULATIVE</span>
            <span className="academic-badge-schedule">● On Schedule</span>
          </div>
          <div className="academic-stat-big-val">
            {formatRupees(academicYearCumulativePaise)}
          </div>
          <div className="academic-stat-sub-row">
            <span>Across 2 semesters & amortizations</span>
            <span className="text-emerald font-bold">Within projected budget</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="academic-stat-card">
          <div className="academic-stat-top">
            <span>PENDING IMMEDIATE OBLIGATIONS</span>
            <span className="academic-badge-danger">! Due in 15 days</span>
          </div>
          <div className="academic-stat-big-val">
            {formatRupees(pendingImmediatePaise)}
          </div>
          <div className="academic-stat-sub-row">
            <span>2 installments due before 15 Dec 2026</span>
            <span className="text-rose font-bold">Priority: High</span>
          </div>
        </div>
      </div>

      {/* 4. Active Fee Obligations Section */}
      <div className="obligations-section-head">
        <h3 className="obligations-section-title">
          Active Fee Obligations <span className="obligations-count-pill">{obligations.length} Active</span>
        </h3>
        <div className="flex gap-2">
          <button className="btn-milestone-more"><SlidersHorizontal size={13} /></button>
        </div>
      </div>

      <div className="obligations-grid-3">
        {obligations.map((ob) => {
          const remPaise = Math.max(0, ob.totalPaise - ob.clearedPaise);
          return (
            <div key={ob.id} className="obligation-card">
              <div>
                <div className="obligation-top-row">
                  <span className={`obligation-type-pill ${ob.typeClass}`}>{ob.type}</span>
                  <span className="text-muted text-xs cursor-pointer">•••</span>
                </div>

                <h4 className="obligation-title">{ob.title}</h4>
                <div className="obligation-dept-sub">{ob.dept}</div>

                <div className="obligation-cleared-bar-meta">
                  <span>CLEARED TO DATE</span>
                  <span className="obligation-cleared-val">
                    ₹{(ob.clearedPaise / 100).toLocaleString('en-IN')}.00 / ₹{(ob.totalPaise / 100).toLocaleString('en-IN')}.00
                  </span>
                </div>

                <div className="obligation-track">
                  <div className={ob.cleared ? 'obligation-fill-emerald w-pct-full' : 'obligation-fill-dark'} />
                </div>

                <div className="obligation-progress-meta">
                  <span>Progress: {ob.progress}%</span>
                  <span>Rem: ₹{(remPaise / 100).toLocaleString('en-IN')}.00</span>
                </div>

                <div className="obligation-due-row">
                  <span>{ob.dueDate}</span>
                  <span className="text-emerald font-bold cursor-pointer">
                    {ob.cleared ? 'SETTLED' : 'View Invoice ↗'}
                  </span>
                </div>
              </div>

              <div>
                {ob.cleared ? (
                  <button className="btn-obligation-cleared">
                    <CheckCircle2 size={13} color="#047857" /> Receipt Downloaded (PDF)
                  </button>
                ) : (
                  <button 
                    onClick={() => handlePayInstallment(ob.id, ob.installmentPayRupees || 10000)}
                    className="btn-obligation-pay"
                  >
                    <CreditCard size={13} /> Pay Installment (₹{(ob.installmentPayRupees || 10000).toLocaleString('en-IN')})
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. Two-column Bottom: Category Breakdown & Recent Study Outlay */}
      <div className="academic-bottom-grid">
        
        {/* Column A: Category Breakdown */}
        <div className="academic-breakdown-card">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="font-extrabold text-sm m-0 text-dark">Category Breakdown</h4>
              <div className="text-muted text-xs">Allocated Study Material Ceilings</div>
            </div>
            <span className="text-muted text-xs font-bold">SEMESTER 5 CAP</span>
          </div>

          <div className="breakdown-item">
            <div className="breakdown-head">
              <span className="breakdown-label">Textbooks & Academic Monographs</span>
              <span className="breakdown-vals">₹6,200 / ₹8,000</span>
            </div>
            <div className="breakdown-track">
              <div className="breakdown-fill-emerald w-pct-78" />
            </div>
            <div className="breakdown-sub-row">
              <span>77.5% consumed</span>
              <span className="text-emerald font-bold">₹1,800 room left</span>
            </div>
          </div>

          <div className="breakdown-item">
            <div className="breakdown-head">
              <span className="breakdown-label">Photostat, Research & Xerox Prints</span>
              <span className="breakdown-vals">₹1,450 / ₹2,500</span>
            </div>
            <div className="breakdown-track">
              <div className="breakdown-fill-emerald w-pct-58" />
            </div>
            <div className="breakdown-sub-row">
              <span>58.0% consumed</span>
              <span className="text-emerald font-bold">₹1,050 room left</span>
            </div>
          </div>

          <div className="breakdown-item">
            <div className="breakdown-head">
              <span className="breakdown-label">Drafting & Engineering Stationery</span>
              <span className="breakdown-vals">₹850 / ₹1,500</span>
            </div>
            <div className="breakdown-track">
              <div className="breakdown-fill-emerald w-pct-57" />
            </div>
            <div className="breakdown-sub-row">
              <span>56.6% consumed</span>
              <span className="text-emerald font-bold">₹650 room left</span>
            </div>
          </div>

          <div className="breakdown-item">
            <div className="breakdown-head">
              <span className="breakdown-label">Lab Equipment & Microcontrollers</span>
              <span className="breakdown-vals">₹4,200 / ₹5,000</span>
            </div>
            <div className="breakdown-track">
              <div className="breakdown-fill-emerald w-pct-84" />
            </div>
            <div className="breakdown-sub-row">
              <span>84.0% consumed (Near cap)</span>
              <span className="text-emerald font-bold">₹800 room left</span>
            </div>
          </div>
        </div>

        {/* Column B: Recent Study Outlay Log */}
        <div className="clearance-table-card">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="font-extrabold text-sm m-0 text-dark">Recent Study Outlay Log</h4>
              <div className="text-muted text-xs">Micro-audit of courseware & material receipts</div>
            </div>
            <button className="btn-goals-outline text-xs py-1 px-2">Export CSV ⤓</button>
          </div>

          <div className="clearance-table-head">
            <span>Description</span>
            <span>Category</span>
            <span>Amount</span>
            <span className="text-right">Method / Date</span>
          </div>

          {studyLogs.map((log) => (
            <div key={log.id} className="clearance-table-row">
              <div className="flex items-center gap-2">
                <div className="clearance-icon-expense">
                  {log.category === 'ACADEMICS' ? <BookOpen size={13} /> :
                   log.category === 'PRINTS' ? <Printer size={13} /> :
                   log.category === 'LAB KIT' ? <Cpu size={13} /> :
                   <PenTool size={13} />}
                </div>
                <div>
                  <div className="font-bold text-dark text-xs">{log.description}</div>
                  <div className="text-muted text-xs">{log.sub}</div>
                </div>
              </div>

              <div>
                <span className="clearance-category-expense">{log.category}</span>
              </div>

              <div className="font-extrabold text-dark text-xs">
                {formatRupees(log.amountPaise)}
              </div>

              <div className="text-right text-xs">
                <div className="text-dark font-medium">{log.method}</div>
                <div className="text-muted text-xs">{log.date}</div>
              </div>
            </div>
          ))}

          <div className="clearance-footer-bar">
            <span>Showing 4 of 28 disbursements</span>
            <Link to="/transactions" className="clearance-footer-link">View Full Log →</Link>
          </div>
        </div>
      </div>

      {/* 6. Automatic Capital Buffer Allocation Strip */}
      <div className="academic-buffer-banner">
        <div className="buffer-left">
          <div className="buffer-icon-box">
            <ShieldCheck size={16} />
          </div>
          <div>
            <div className="buffer-title">Automatic Capital Buffer Allocation Active</div>
            <div className="buffer-subtitle">
              PennyWise AutoSweep reserves ₹10,000 on the 1st of every month into the Education Sinking Fund.
            </div>
          </div>
        </div>

        <div className="buffer-right">
          <span className="buffer-held-val">Buffer: ₹10,000 Held</span>
          <button className="btn-buffer-adjust">Adjust Sweep</button>
        </div>
      </div>

      {/* Modal: New Obligation */}
      {showFeeModal && (
        <div className="modal-overlay" onClick={() => setShowFeeModal(false)}>
          <div className="modal-content modal-stitch-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-stitch-header">
              <h3 className="font-extrabold text-sm m-0">Arm New Educational Obligation</h3>
              <button onClick={() => setShowFeeModal(false)} className="modal-close-btn">✕</button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const form = e.target;
              const newOb = {
                id: `fee-${Date.now()}`,
                type: 'MANDATORY · CUSTOM',
                typeClass: 'type-mandatory',
                title: form.obTitle.value,
                dept: form.obDept.value || 'Departmental Fee Board',
                clearedPaise: 0,
                totalPaise: Number(form.obTotal.value) * 100,
                progress: 0,
                dueDate: `Due ${form.obDate.value}`,
                installmentPayRupees: Math.round(Number(form.obTotal.value) / 2),
                cleared: false
              };
              const updated = [newOb, ...obligations];
              setObligations(updated);
              localStorage.setItem('pennywise_academic_obligations', JSON.stringify(updated));
              setShowFeeModal(false);
            }}>
              <div className="mb-3">
                <label className="block text-secondary font-bold text-xs mb-1">Obligation Title</label>
                <input name="obTitle" required placeholder="e.g. Semester 6 Tuition Fee" className="form-input text-xs" />
              </div>
              <div className="mb-3">
                <label className="block text-secondary font-bold text-xs mb-1">Department / Board</label>
                <input name="obDept" placeholder="e.g. Examination Directorate" className="form-input text-xs" />
              </div>
              <div className="mb-3">
                <label className="block text-secondary font-bold text-xs mb-1">Total Fee Amount (INR)</label>
                <input name="obTotal" type="number" required placeholder="45000" className="form-input text-xs" />
              </div>
              <div className="mb-3">
                <label className="block text-secondary font-bold text-xs mb-1">Due Date</label>
                <input name="obDate" required placeholder="15 Jan 2027" className="form-input text-xs" />
              </div>
              <button type="submit" className="modal-stitch-submit">
                Initialize Obligation
              </button>
            </form>
          </div>
        </div>
      )}

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
