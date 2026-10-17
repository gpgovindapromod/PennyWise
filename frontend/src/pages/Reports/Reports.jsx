import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { formatRupees } from '../../services/currency';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  BarChart2, 
  Utensils, 
  GraduationCap, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  Calendar,
  Layers,
  ArrowUpRight,
  BookOpen,
  DollarSign
} from 'lucide-react';

const COLORS = ['#E11D48', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#64748B'];

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'categories', 'canteen', 'academics'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [preset, setPreset] = useState('all'); // 'all', 'this-month', 'last-month', 'semester'

  const fetchReports = async (sDate = startDate, eDate = endDate) => {
    setLoading(true);
    try {
      const res = await API.get('/reports/summary', {
        params: {
          startDate: sDate || undefined,
          endDate: eDate || undefined
        }
      });
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (type) => {
    setPreset(type);
    const now = new Date();
    let s = '';
    let e = '';

    if (type === 'this-month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      s = firstDay.toISOString().split('T')[0];
      e = now.toISOString().split('T')[0];
    } else if (type === 'last-month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
      s = firstDay.toISOString().split('T')[0];
      e = lastDay.toISOString().split('T')[0];
    } else if (type === 'semester') {
      // Semester rolling 6-month
      const semStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      s = semStart.toISOString().split('T')[0];
      e = now.toISOString().split('T')[0];
    }

    setStartDate(s);
    setEndDate(e);
    fetchReports(s, e);
  };

  useEffect(() => {
    fetchReports('', '');
  }, []);

  if (loading) {
    return (
      <div style={{ maxWidth: 1100, margin: '40px auto', padding: '0 24px', color: '#64748B' }}>
        Loading financial analytics & reports...
      </div>
    );
  }

  const {
    monthlyTrend = [],
    categoryBreakdown = [],
    foodBreakdown = [],
    academicBreakdown = [],
    institutionalFeesRupees = 0
  } = data || {};

  // Total sums for current period KPIs
  const totalCategorySpending = categoryBreakdown.reduce((sum, item) => sum + item.amountRupees, 0);
  const totalFoodSpending = foodBreakdown.reduce((sum, item) => sum + item.amountRupees, 0);
  const totalAcademicSpending = academicBreakdown.reduce((sum, item) => sum + item.amountRupees, 0);

  // Top spending item
  const topCategory = categoryBreakdown.length > 0 ? categoryBreakdown[0] : null;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px 80px 24px' }}>
      
      {/* 1. Header Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
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
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              padding: '2px 8px',
              borderRadius: 4,
              backgroundColor: '#FFE4E6',
              color: '#E11D48'
            }}>
              <BarChart2 size={12} /> SPENDING TELEMETRY & ANALYTICS
            </span>
            <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>
              {startDate && endDate ? `${startDate} to ${endDate}` : 'All-Time Analytics'}
            </span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
            Reports & Financial Insights
          </h1>
          <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0 0' }}>
            Interactive cash-flow trends, item-level canteen habits, and semester study breakdowns
          </p>
        </div>

        {/* Date Filter Bar & Quick Preset Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}>
          {/* Quick Presets */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button
              onClick={() => applyPreset('all')}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                background: preset === 'all' && !startDate ? '#0F172A' : '#F1F5F9',
                color: preset === 'all' && !startDate ? '#FFFFFF' : '#475569'
              }}
            >
              All Time
            </button>
            <button
              onClick={() => applyPreset('this-month')}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                background: preset === 'this-month' ? '#0F172A' : '#F1F5F9',
                color: preset === 'this-month' ? '#FFFFFF' : '#475569'
              }}
            >
              This Month
            </button>
            <button
              onClick={() => applyPreset('last-month')}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                background: preset === 'last-month' ? '#0F172A' : '#F1F5F9',
                color: preset === 'last-month' ? '#FFFFFF' : '#475569'
              }}
            >
              Last Month
            </button>
            <button
              onClick={() => applyPreset('semester')}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                background: preset === 'semester' ? '#0F172A' : '#F1F5F9',
                color: preset === 'semester' ? '#FFFFFF' : '#475569'
              }}
            >
              Semester (6 Mo)
            </button>
          </div>

          {/* Custom Date Pickers */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#FFFFFF', padding: '4px 10px', borderRadius: 8, border: '1px solid #CBD5E1' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPreset('custom');
                  fetchReports(e.target.value, endDate);
                }}
                style={{ border: 'none', outline: 'none', fontSize: 12, color: '#0F172A' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#FFFFFF', padding: '4px 10px', borderRadius: 8, border: '1px solid #CBD5E1' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPreset('custom');
                  fetchReports(startDate, e.target.value);
                }}
                style={{ border: 'none', outline: 'none', fontSize: 12, color: '#0F172A' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Structured Top KPI Stats Cards Row (Reusing Academics Design Standard) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 16,
        marginBottom: 24
      }}>
        {/* KPI 1: Cumulative Category Spending */}
        <div className="card" style={{
          background: '#FFFFFF',
          borderRadius: 16,
          padding: '20px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#64748B', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Total Analyzed Spending
              </div>
              <div style={{ fontSize: 26, fontWeight: 900, fontFamily: 'var(--font-heading)', color: '#0F172A', marginTop: 4 }}>
                ₹{totalCategorySpending.toLocaleString('en-IN')}
              </div>
            </div>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              backgroundColor: '#FFF1F2',
              color: '#E11D48',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TrendingDown size={18} />
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 10 }}>
            Across {categoryBreakdown.length} active spending categories
          </div>
        </div>

        {/* KPI 2: Food & Canteen Burn */}
        <div className="card" style={{
          background: '#FFFFFF',
          borderRadius: 16,
          padding: '20px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#E11D48', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Food & Canteen
              </div>
              <div style={{ fontSize: 26, fontWeight: 900, fontFamily: 'var(--font-heading)', color: '#0F172A', marginTop: 4 }}>
                ₹{totalFoodSpending.toLocaleString('en-IN')}
              </div>
            </div>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              backgroundColor: '#FFE4E6',
              color: '#E11D48',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Utensils size={18} />
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 10 }}>
            Meals, tea, snacks, and hostel food
          </div>
        </div>

        {/* KPI 3: Academic Investment */}
        <div className="card" style={{
          background: '#FFFFFF',
          borderRadius: 16,
          padding: '20px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#2563EB', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Study & Course Supplies
              </div>
              <div style={{ fontSize: 26, fontWeight: 900, fontFamily: 'var(--font-heading)', color: '#0F172A', marginTop: 4 }}>
                ₹{totalAcademicSpending.toLocaleString('en-IN')}
              </div>
            </div>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              backgroundColor: '#EFF6FF',
              color: '#3B82F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <GraduationCap size={18} />
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 10 }}>
            {institutionalFeesRupees > 0 
              ? `Books & notes · (₹${institutionalFeesRupees.toLocaleString('en-IN')} fee isolated)` 
              : 'Books, xerox, pens & lab stationery'}
          </div>
        </div>

        {/* KPI 4: Largest Expense Driver */}
        <div className="card" style={{
          background: '#FFFFFF',
          borderRadius: 16,
          padding: '20px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#64748B', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Largest Expense Driver
              </div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#0F172A', marginTop: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {topCategory ? topCategory.name : 'None'}
              </div>
            </div>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              backgroundColor: '#F1F5F9',
              color: '#334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <PieChart size={18} />
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#E11D48', marginTop: 10, fontWeight: 700 }}>
            {topCategory ? `₹${topCategory.amountRupees.toLocaleString('en-IN')} logged` : 'No expenses logged'}
          </div>
        </div>
      </div>

      {/* 3. Filter Navigation Pills */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 20,
        overflowX: 'auto',
        paddingBottom: 4
      }}>
        {[
          { id: 'overview', label: 'Cash Flow Trends' },
          { id: 'categories', label: 'Category Distribution' },
          { id: 'canteen', label: 'Food & Canteen Items' },
          { id: 'academics', label: 'Academic Supplies' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '7px 16px',
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 700,
              border: activeTab === tab.id ? '1px solid #E11D48' : '1px solid #E2E8F0',
              backgroundColor: activeTab === tab.id ? '#E11D48' : '#FFFFFF',
              color: activeTab === tab.id ? '#FFFFFF' : '#475569',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4. Tab 1: 6-Month Income vs Expense Bar Chart */}
      {(activeTab === 'overview' || activeTab === 'all') && (
        <div className="card" style={{
          background: '#FFFFFF',
          borderRadius: 20,
          border: '1px solid #E2E8F0',
          padding: '24px',
          marginBottom: 24,
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Income vs Expenses (Rolling 6 Months)
              </h3>
              <p style={{ fontSize: 12, color: '#64748B', margin: '2px 0 0 0' }}>
                Monthly comparison showing net flow in INR (₹)
              </p>
            </div>
            <div style={{ display: 'flex', gap: 16, fontSize: 13, fontWeight: 700 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, backgroundColor: '#10B981', borderRadius: 3 }} /> Income
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, backgroundColor: '#E11D48', borderRadius: 3 }} /> Expenses
              </span>
            </div>
          </div>

          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="label" stroke="#94A3B8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                <Tooltip
                  formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
                  contentStyle={{ background: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0', boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}
                />
                <Bar dataKey="income" name="Income" fill="#10B981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#E11D48" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 5. Tab 2: Category Distribution Grid (reusing 2-column structured component) */}
      {(activeTab === 'categories' || activeTab === 'overview') && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: 20,
          marginBottom: 24
        }}>
          {/* Card A: Category List breakdown */}
          <div className="card" style={{
            background: '#FFFFFF',
            borderRadius: 20,
            border: '1px solid #E2E8F0',
            padding: '24px',
            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Layers size={18} color="#E11D48" />
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Category Breakdown
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {categoryBreakdown.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: '#94A3B8', fontSize: 13 }}>
                  No expenses recorded yet.
                </div>
              ) : (
                categoryBreakdown.map((item, idx) => {
                  const percent = totalCategorySpending > 0 
                    ? Math.round((item.amountRupees / totalCategorySpending) * 100)
                    : 0;
                  return (
                    <div
                      key={item.name}
                      style={{
                        padding: '12px 14px',
                        background: '#F8FAFC',
                        borderRadius: 12,
                        border: '1px solid #EDF2F7'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: COLORS[idx % COLORS.length]
                          }} />
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>{item.name}</span>
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#0F172A' }}>
                          ₹{item.amountRupees.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div style={{ width: '100%', height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ width: `${percent}%`, height: '100%', backgroundColor: COLORS[idx % COLORS.length] }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Card B: Donut Visualization Chart */}
          <div className="card" style={{
            background: '#FFFFFF',
            borderRadius: 20,
            border: '1px solid #E2E8F0',
            padding: '24px',
            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', marginBottom: 12, textAlign: 'center' }}>
              Proportional Distribution
            </h3>

            {categoryBreakdown.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#94A3B8', fontSize: 13 }}>
                No distribution data available
              </div>
            ) : (
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={categoryBreakdown}
                      dataKey="amountRupees"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                    >
                      {categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Amount']}
                      contentStyle={{ background: '#FFFFFF', borderRadius: 10, border: '1px solid #E2E8F0' }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. Tab 3: Food & Canteen Analysis */}
      {(activeTab === 'canteen' || activeTab === 'overview') && (
        <div className="card" style={{
          background: '#FFFFFF',
          borderRadius: 20,
          border: '1px solid #E2E8F0',
          padding: '24px',
          marginBottom: 24,
          boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: '#FFE4E6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#E11D48'
            }}>
              <Utensils size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Food, Chai & Canteen Habit Analysis
              </h3>
              <p style={{ fontSize: 12, color: '#64748B', margin: '2px 0 0 0' }}>
                Itemized breakdown of tea, snacks, mandi, meals, and hostel mess expenses
              </p>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 12,
            marginTop: 18
          }}>
            {foodBreakdown.length === 0 ? (
              <div style={{ color: '#94A3B8', fontSize: 13, gridColumn: '1 / -1', textAlign: 'center', padding: '24px 0' }}>
                No food or drink items logged yet.
              </div>
            ) : (
              foodBreakdown.map((item) => (
                <div
                  key={item.name}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 14,
                    background: '#F8FAFC',
                    border: '1px solid #EDF2F7',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>Canteen / Dining</div>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 900, fontFamily: 'var(--font-heading)', color: '#E11D48' }}>
                    ₹{item.amountRupees.toLocaleString('en-IN')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 7. Tab 4: Academic Supplies Breakdown */}
      {(activeTab === 'academics' || activeTab === 'overview') && (
        <div className="card" style={{
          background: '#FFFFFF',
          borderRadius: 20,
          border: '1px solid #E2E8F0',
          padding: '24px',
          boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: '#EFF6FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3B82F6'
            }}>
              <GraduationCap size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Course Materials & Study Supplies Breakdown
              </h3>
              <p style={{ fontSize: 12, color: '#64748B', margin: '2px 0 0 0' }}>
                Expenditure on textbooks, printouts, lab supplies, and course components
              </p>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 12,
            marginTop: 18
          }}>
            {academicBreakdown.length === 0 ? (
              <div style={{ color: '#94A3B8', fontSize: 13, gridColumn: '1 / -1', textAlign: 'center', padding: '24px 0' }}>
                No study items logged yet.
              </div>
            ) : (
              academicBreakdown.map((item) => (
                <div
                  key={item.name}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 14,
                    background: '#F8FAFC',
                    border: '1px solid #EDF2F7',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>Academic Materials</div>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 900, fontFamily: 'var(--font-heading)', color: '#2563EB' }}>
                    ₹{item.amountRupees.toLocaleString('en-IN')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}