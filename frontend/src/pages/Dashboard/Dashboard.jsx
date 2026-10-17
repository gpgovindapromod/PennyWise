import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { formatRupees, formatDate } from '../../services/currency';
import { 
  PlusCircle, 
  Gauge, 
  Fuel, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  Flag, 
  ChevronRight,
  GraduationCap,
  Utensils,
  Sparkles,
  ArrowRight,
  Target,
  Receipt
} from 'lucide-react';
import { Link } from 'react-router-dom';
import InstallPwaBanner from '../../components/InstallPwaBanner';

export default function Dashboard({ onOpenAddExpense }) {
  // SWR Pattern: Load from local cache instantly to kill critical path waterfall delay
  const [data, setData] = useState(() => {
    try {
      const cached = localStorage.getItem('pennywise_dashboard_cache');
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(() => {
    return !localStorage.getItem('pennywise_dashboard_cache');
  });

  const fetchSummary = async () => {
    try {
      const res = await API.get('/dashboard/summary');
      setData(res.data.data);
      localStorage.setItem('pennywise_dashboard_cache', JSON.stringify(res.data.data));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px' }}>
        <div style={{ height: 40, width: 220, backgroundColor: '#E2E8F0', borderRadius: 8, marginBottom: 24 }} />
        {/* Skeleton Hero Card with exact height */}
        <div style={{ minHeight: 180, height: 180, backgroundColor: '#0D1117', borderRadius: 20, marginBottom: 20, border: '1px solid #21262D' }} />
        {/* Skeleton Grid matching exact minHeight */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18, marginBottom: 24, minHeight: 154 }}>
          <div style={{ minHeight: 154, backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0' }} />
          <div style={{ minHeight: 154, backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0' }} />
        </div>
        {/* Skeleton Recent Transactions */}
        <div style={{ minHeight: 280, backgroundColor: '#FFFFFF', borderRadius: 14, border: '1px solid #E2E8F0' }} />
      </div>
    );
  }

  const {
    currentBalancePaise = 0,
    incomeThisMonthPaise = 0,
    expensesThisMonthPaise = 0,
    academicFeesPaidThisMonthPaise = 0,
    budget = {},
    recentTransactions = [],
    academicExpensesThisMonthPaise = 0
  } = data || {};

  const currentMonthName = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const safeBudgetLimit = budget?.limitPaise || 0;
  const safeRemaining = typeof budget?.remainingPaise === 'number' ? budget.remainingPaise : (safeBudgetLimit - expensesThisMonthPaise);
  const isBudgetExceeded = expensesThisMonthPaise > safeBudgetLimit && safeBudgetLimit > 0;
  const fuelBurnRatePercent = safeBudgetLimit > 0 
    ? Math.min(Math.round((expensesThisMonthPaise / safeBudgetLimit) * 100), 100)
    : 0;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px' }}>
      
      {/* PWA Install Promotion Banner */}
      <InstallPwaBanner />

      {/* 1. Top Bar / Cockpit Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              padding: '3px 8px',
              borderRadius: 4,
              backgroundColor: '#9F1239',
              color: '#FFFFFF'
            }}>
              <Zap size={11} /> MONTHLY OVERVIEW
            </span>
            <span style={{ fontSize: 13, color: '#334155', fontWeight: 700 }}>
              {currentMonthName}
            </span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
            Financial Dashboard
          </h1>
        </div>

        <div className="page-header-actions" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={onOpenAddExpense}
            className="btn btn-primary"
            style={{
              padding: '10px 18px',
              fontSize: 13,
              fontWeight: 700,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: 'pointer'
            }}
          >
            <PlusCircle size={16} /> Add Expense / Fuel
          </button>
        </div>
      </div>

      {/* 2. Automotive Hero Banner with Sports Car Visual */}
      <div
        className="card cockpit-hero-card"
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 20,
          padding: '24px',
          marginBottom: 20,
          backgroundColor: '#0D1117',
          color: '#FFFFFF',
          border: '1px solid #21262D',
          boxShadow: '0 8px 30px rgba(13, 17, 23, 0.4)'
        }}
      >
        {/* Background Car Image Overlay */}
        <div
          className="hero-car-overlay"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: '55%',
            backgroundImage: `linear-gradient(to right, #0D1117 15%, rgba(13,17,23,0.4) 60%, rgba(13,17,23,0.1) 100%), url('/sports-car-hero.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.92,
            pointerEvents: 'none'
          }}
        />

        <div className="hero-content-box" style={{ position: 'relative', zIndex: 1, maxWidth: '65%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#FB7185', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              CURRENT TOTAL BALANCE
            </span>
          </div>

          <div style={{
            fontSize: 42,
            fontWeight: 900,
            fontFamily: 'var(--font-heading)',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            color: '#FFFFFF',
            marginBottom: 16
          }}>
            {formatRupees(currentBalancePaise)}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <TrendingUp size={16} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#8B949E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Income / Added</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#10B981' }}>+{formatRupees(incomeThisMonthPaise)}</div>
              </div>
            </div>

            <div style={{ width: 1, height: 28, backgroundColor: '#30363D' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                backgroundColor: 'rgba(225, 29, 72, 0.15)',
                color: '#E11D48',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <TrendingDown size={16} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#8B949E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Monthly Expenses</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#F43F5E' }}>−{formatRupees(expensesThisMonthPaise)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Sporty Overview Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 18,
        marginBottom: 24
      }}>
        {/* Monthly Expense Budget Card */}
        <div className="card" style={{ padding: '20px', borderRadius: 12, border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#64748B', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                MONTHLY EXPENSE BUDGET
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', marginTop: 2 }}>
                {budget.limitPaise > 0 ? formatRupees(budget.limitPaise) : 'No Budget Set'}
              </div>
            </div>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              backgroundColor: '#FFF1F2',
              color: '#E11D48',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Target size={18} />
            </div>
          </div>

          {/* Budget Progress Bar */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
              <span style={{ color: '#64748B' }}>Budget Remaining</span>
              <span style={{ color: isBudgetExceeded ? '#E11D48' : '#0F172A' }}>
                {safeRemaining >= 0 ? `${formatRupees(safeRemaining)} left` : `${formatRupees(Math.abs(safeRemaining))} OVER BUDGET`}
              </span>
            </div>
            <div style={{ width: '100%', height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{
                width: `${fuelBurnRatePercent}%`,
                height: '100%',
                backgroundColor: isBudgetExceeded ? '#E11D48' : (fuelBurnRatePercent > 75 ? '#F97316' : '#10B981'),
                borderRadius: 4,
                transition: 'width 0.4s ease'
              }} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: '#64748B' }}>
            <span>{fuelBurnRatePercent}% of budget spent</span>
            <Link to="/goals" style={{ color: '#E11D48', fontWeight: 700, textDecoration: 'none' }}>
              Set Monthly Budget →
            </Link>
          </div>
        </div>

        {/* Academic Expenses */}
        <div className="card" style={{ padding: '20px', borderRadius: 12, border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#64748B', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                STUDY EXPENSES (THIS MONTH)
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', marginTop: 2 }}>
                {formatRupees(academicExpensesThisMonthPaise)}
              </div>
            </div>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              backgroundColor: '#EFF6FF',
              color: '#3B82F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <GraduationCap size={18} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 6,
              backgroundColor: '#F1F5F9',
              color: '#475569'
            }}>
              Books & Supplies
            </span>
            {academicFeesPaidThisMonthPaise > 0 && (
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 6,
                backgroundColor: '#EDE9FE',
                color: '#6D28D9'
              }}>
                + {formatRupees(academicFeesPaidThisMonthPaise)} Fee Paid
              </span>
            )}
          </div>

          <p style={{ fontSize: 11, color: '#64748B', margin: '0 0 12px 0', lineHeight: 1.4 }}>
            Textbooks, stationery, photocopies & prints. Semester & exam fees are tracked separately.
          </p>

          <Link to="/academics" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 12,
            fontWeight: 800,
            color: '#1D4ED8',
            textDecoration: 'none'
          }}>
            Manage Fees & Academics <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* 4. Recent Transactions */}
      <div className="card" style={{ padding: '24px', borderRadius: 14, border: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Receipt size={18} color="#E11D48" />
            <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Recent Transactions
            </h2>
          </div>
          <Link to="/transactions" style={{ fontSize: 12, fontWeight: 700, color: '#E11D48', textDecoration: 'none' }}>
            View All Transactions →
          </Link>
        </div>

        {recentTransactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 16px', color: '#64748B' }}>
            <div style={{ display: 'inline-flex', padding: 12, borderRadius: '50%', backgroundColor: '#F1F5F9', color: '#E11D48', marginBottom: 8 }}>
              <Receipt size={20} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: 0 }}>No transactions recorded yet</p>
            <p style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
              Click "Add Expense / Fuel" above to record canteen food, fuel (petrol), travel, or books.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentTransactions.slice(0, 5).map((tx) => (
              <div
                key={tx._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: 8,
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #EDF2F7',
                  transition: 'transform 0.15s ease, border-color 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    backgroundColor: tx.categoryId === 'food-drinks' ? '#FFF1F2' : '#F1F5F9',
                    color: tx.categoryId === 'food-drinks' ? '#E11D48' : '#0F172A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {tx.categoryId === 'academic' ? (
                      <GraduationCap size={17} />
                    ) : (
                      <Utensils size={17} />
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                      {tx.subcategory}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>
                      {tx.categoryLabel} · {formatDate(tx.date)}
                    </div>
                  </div>
                </div>

                <div style={{
                  fontSize: 15,
                  fontWeight: 800,
                  fontFamily: 'var(--font-heading)',
                  color: tx.type === 'income' ? '#10B981' : '#0F172A'
                }}>
                  {tx.type === 'income' ? '+' : '−'}{formatRupees(tx.amountPaise)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}