import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { formatRupees } from '../../services/currency';
import { 
  Compass, 
  MapPin, 
  Users, 
  CreditCard, 
  Receipt, 
  Percent, 
  TrendingUp, 
  Calendar, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight, 
  Filter,
  DollarSign,
  Briefcase,
  AlertTriangle,
  PlaneTakeoff,
  Car,
  Hotel
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TravelDashboard({ onOpenAddModal }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState('all');

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (selectedTrip && selectedTrip !== 'all') params.tripId = selectedTrip;

      const res = await API.get('/travel/dashboard', { params });
      setData(res.data.data);
    } catch (err) {
      console.error('Failed to load travel dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTripsList = async () => {
    try {
      const res = await API.get('/travel/trips');
      setTrips(res.data.data || []);
    } catch (e) {}
  };

  useEffect(() => {
    fetchTripsList();
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [startDate, endDate, selectedTrip]);

  if (loading && !data) {
    return (
      <div style={{ maxWidth: 1200, margin: '40px auto', padding: '0 24px', color: '#94A3B8' }}>
        Loading Travel Company Ledger & Analytics...
      </div>
    );
  }

  const { metrics = {}, expenseCategoryBreakdown = [], recentTransactions = [], tripProfitability = [] } = data || {};

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '28px 24px 80px 24px' }}>
      
      {/* 1. Top Header Banner with Travel Agency Identity */}
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
              backgroundColor: '#0284C7',
              color: '#FFFFFF'
            }}>
              <Compass size={11} /> TRAVEL AGENCY COCKPIT
            </span>
            <span style={{ fontSize: 13, color: '#64748B', fontWeight: 700 }}>
              Live Financial Performance
            </span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
            Travel Operations & Financial Ledger
          </h1>
        </div>

        {/* Quick Actions Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {onOpenAddModal && (
            <>
              <button
                onClick={() => onOpenAddModal('expense')}
                className="btn btn-secondary"
                style={{ padding: '9px 16px', fontSize: 13, fontWeight: 700, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <PlusCircle size={15} /> Add Expense
              </button>
              <button
                onClick={() => onOpenAddModal('passenger')}
                className="btn btn-primary"
                style={{ padding: '9px 16px', fontSize: 13, fontWeight: 700, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6, backgroundColor: '#0284C7', borderColor: '#0284C7' }}
              >
                <Users size={15} /> Register Passenger
              </button>
            </>
          )}
        </div>
      </div>

      {/* 2. Global Filter Toolbar (Date range & Trip Selector) */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: '14px 18px',
        border: '1px solid #E2E8F0',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={16} color="#0284C7" />
          <span style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>Filter Analytics:</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {/* Trip Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: '#64748B', fontWeight: 700 }}>Trip:</span>
            <select
              value={selectedTrip}
              onChange={(e) => setSelectedTrip(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                border: '1px solid #CBD5E1',
                fontSize: 12,
                fontWeight: 600,
                color: '#0F172A',
                backgroundColor: '#F8FAFC',
                outline: 'none'
              }}
            >
              <option value="all">All Trips & Tour Packages</option>
              {trips.map(t => {
                const dep = t.departureDate ? new Date(t.departureDate).toLocaleDateString('en-IN') : '';
                const ret = t.returnDate ? new Date(t.returnDate).toLocaleDateString('en-IN') : '';
                const dateStr = dep && ret ? ` (${dep} → ${ret})` : (dep ? ` (${dep})` : '');
                return (
                  <option key={t._id} value={t._id}>{t.name} - {t.destination}{dateStr}</option>
                );
              })}
            </select>
          </div>

          {/* Date Range */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: '#64748B', fontWeight: 700 }}>From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 12, outline: 'none' }}
            />
            <span style={{ fontSize: 12, color: '#64748B', fontWeight: 700 }}>To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 12, outline: 'none' }}
            />
            {(startDate || endDate || selectedTrip !== 'all') && (
              <button
                onClick={() => { setStartDate(''); setEndDate(''); setSelectedTrip('all'); }}
                style={{ padding: '5px 10px', fontSize: 11, fontWeight: 700, color: '#E11D48', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Hero Financial Summary Cards Grid (10 Required Metrics) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: 16,
        marginBottom: 24
      }}>
        {/* Card 1: Total Income Collected */}
        <div className="card" style={{ padding: '18px', borderRadius: 14, border: '1px solid #E2E8F0', background: 'linear-gradient(135deg, #F0FDF4 0%, #FFFFFF 100%)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#16A34A', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Total Income Collected
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, fontFamily: 'var(--font-heading)', color: '#15803D', marginTop: 4 }}>
                ₹{metrics.totalIncomeCollectedRupees?.toLocaleString('en-IN') || '0'}
              </div>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ fontSize: 11, color: '#64748B', marginTop: 8 }}>
            Passenger payments + commissions
          </div>
        </div>

        {/* Card 2: Total Expenses */}
        <div className="card" style={{ padding: '18px', borderRadius: 14, border: '1px solid #E2E8F0', background: 'linear-gradient(135deg, #FFF1F2 0%, #FFFFFF 100%)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#E11D48', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Total Expenses
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, fontFamily: 'var(--font-heading)', color: '#BE123C', marginTop: 4 }}>
                ₹{metrics.totalExpensesRupees?.toLocaleString('en-IN') || '0'}
              </div>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#FFE4E6', color: '#E11D48', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Receipt size={18} />
            </div>
          </div>
          <div style={{ fontSize: 11, color: '#64748B', marginTop: 8 }}>
            Hotels, fuel, food, driver tips, tickets
          </div>
        </div>

        {/* Card 3: Total Net Profit */}
        <div className="card" style={{ padding: '18px', borderRadius: 14, border: '1px solid #E2E8F0', background: metrics.totalNetProfitRupees >= 0 ? '#0B132B' : '#881337', color: '#FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#38BDF8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Net Company Profit
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, fontFamily: 'var(--font-heading)', color: '#FFFFFF', marginTop: 4 }}>
                ₹{metrics.totalNetProfitRupees?.toLocaleString('en-IN') || '0'}
              </div>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(56, 189, 248, 0.2)', color: '#38BDF8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Compass size={18} />
            </div>
          </div>
          <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 8 }}>
            Income Collected − Total Expenses
          </div>
        </div>

        {/* Card 4: Outstanding Passenger Receivables */}
        <div className="card" style={{ padding: '18px', borderRadius: 14, border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#D97706', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Outstanding Passenger Due
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, fontFamily: 'var(--font-heading)', color: '#B45309', marginTop: 4 }}>
                ₹{metrics.outstandingPassengerPaymentsRupees?.toLocaleString('en-IN') || '0'}
              </div>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={18} />
            </div>
          </div>
          <div style={{ fontSize: 11, color: '#64748B', marginTop: 8 }}>
            Uncollected passenger balances
          </div>
        </div>
      </div>

      {/* Secondary Metrics Row (Commissions, Trips, Passengers, Avg Profit) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 14,
        marginBottom: 24
      }}>
        {/* Metric 5: Total Commissions Received */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: 12, border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: 11, color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Commissions Received</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginTop: 4 }}>
            ₹{metrics.totalCommissionsReceivedRupees?.toLocaleString('en-IN') || '0'}
          </div>
          <div style={{ fontSize: 11, color: '#0284C7', marginTop: 4 }}>
            + ₹{metrics.outstandingCommissionsRupees?.toLocaleString('en-IN') || '0'} pending
          </div>
        </div>

        {/* Metric 6: Total Trips */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: 12, border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: 11, color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Total Trips</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginTop: 4 }}>
            {metrics.totalTrips || 0}
          </div>
          <div style={{ fontSize: 11, color: '#16A34A', marginTop: 4 }}>
            {metrics.upcomingTrips || 0} upcoming · {metrics.ongoingTrips || 0} ongoing
          </div>
        </div>

        {/* Metric 7: Total Passengers */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: 12, border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: 11, color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Total Passengers</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginTop: 4 }}>
            {metrics.totalPassengers || 0}
          </div>
          <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>
            Registered travellers
          </div>
        </div>

        {/* Metric 8: Average Profit Per Trip */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: 12, border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: 11, color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Avg Profit / Trip</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginTop: 4 }}>
            ₹{metrics.averageProfitPerTripRupees?.toLocaleString('en-IN') || '0'}
          </div>
          <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>
            Operating margin
          </div>
        </div>
      </div>

      {/* 4. Split Sections: Category Breakdown & Recent Ledger Activity */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
        gap: 20,
        marginBottom: 24
      }}>
        {/* Category-Wise Expense Breakdown */}
        <div className="card" style={{ padding: '22px', borderRadius: 14, border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Receipt size={18} color="#0284C7" />
              <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Expense Breakdown by Category
              </h2>
            </div>
            <Link to="/travel/expenses" style={{ fontSize: 12, fontWeight: 700, color: '#0284C7', textDecoration: 'none' }}>
              View All Expenses →
            </Link>
          </div>

          {expenseCategoryBreakdown.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94A3B8' }}>
              No expenses recorded for this selection yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {expenseCategoryBreakdown.slice(0, 6).map((item) => {
                const total = metrics.totalExpensesRupees || 1;
                const percent = Math.min(100, Math.round((item.amountRupees / total) * 100));

                return (
                  <div key={item.category}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                      <span style={{ color: '#334155' }}>{item.category}</span>
                      <span style={{ color: '#0F172A' }}>₹{item.amountRupees.toLocaleString('en-IN')} ({percent}%)</span>
                    </div>
                    <div style={{ width: '100%', height: 7, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{
                        width: `${percent}%`,
                        height: '100%',
                        backgroundColor: '#0284C7',
                        borderRadius: 4
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Ledger Activity */}
        <div className="card" style={{ padding: '22px', borderRadius: 14, border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CreditCard size={18} color="#16A34A" />
              <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Recent Financial Activity
              </h2>
            </div>
            <Link to="/travel/transactions" style={{ fontSize: 12, fontWeight: 700, color: '#0284C7', textDecoration: 'none' }}>
              Full Ledger →
            </Link>
          </div>

          {recentTransactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94A3B8' }}>
              No recent payments or expenses recorded yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentTransactions.map((tx) => (
                <div key={tx.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 12px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: 8
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{tx.title}</div>
                    <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                      {new Date(tx.date).toLocaleDateString('en-IN')} · {tx.category} · {tx.paymentMethod?.toUpperCase()}
                    </div>
                  </div>
                  <div style={{
                    fontSize: 14,
                    fontWeight: 900,
                    fontFamily: 'var(--font-heading)',
                    color: tx.amountRupees > 0 ? '#15803D' : '#BE123C'
                  }}>
                    {tx.amountRupees > 0 ? '+' : ''}₹{Math.abs(tx.amountRupees).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5. Trip-Wise Profitability Ledger Table */}
      <div className="card" style={{ padding: '24px', borderRadius: 14, border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPin size={18} color="#0284C7" />
            <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Trip-Wise Performance & Profitability
            </h2>
          </div>
          <Link to="/travel/trips" style={{ fontSize: 12, fontWeight: 700, color: '#0284C7', textDecoration: 'none' }}>
            Manage Trips & Packages →
          </Link>
        </div>

        {tripProfitability.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 16px', color: '#64748B' }}>
            <PlaneTakeoff size={28} color="#CBD5E1" style={{ marginBottom: 8 }} />
            <p style={{ margin: 0, fontWeight: 700, color: '#0F172A' }}>No trips created yet</p>
            <p style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
              Click on Trips & Packages to create your first tour package (e.g. Manali 5D4N, Goa Weekend, Ooty Special).
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid #CBD5E1', color: '#64748B', fontWeight: 800, fontSize: 11, textTransform: 'uppercase' }}>
                  <th style={{ padding: '10px 12px' }}>Trip Name & Destination</th>
                  <th style={{ padding: '10px 12px' }}>Status</th>
                  <th style={{ padding: '10px 12px' }}>Pax</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Collected Income</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Trip Expenses</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Net Profit</th>
                </tr>
              </thead>
              <tbody>
                {tripProfitability.map((item) => (
                  <tr key={item.tripId} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 800, color: '#0F172A' }}>{item.tripName}</div>
                      <div style={{ fontSize: 11, color: '#64748B' }}>{item.destination}</div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: 6,
                        fontSize: 10,
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        backgroundColor: item.status === 'completed' ? '#DCFCE7' : (item.status === 'ongoing' ? '#FEF3C7' : (item.status === 'cancelled' ? '#FEE2E2' : '#EFF6FF')),
                        color: item.status === 'completed' ? '#166534' : (item.status === 'ongoing' ? '#92400E' : (item.status === 'cancelled' ? '#991B1B' : '#1E40AF'))
                      }}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontWeight: 700, color: '#334155' }}>
                      {item.passengerCount}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 800, color: '#16A34A' }}>
                      ₹{item.incomeRupees.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 800, color: '#BE123C' }}>
                      ₹{item.expenseRupees.toLocaleString('en-IN')}
                    </td>
                    <td style={{
                      padding: '12px',
                      textAlign: 'right',
                      fontWeight: 900,
                      fontFamily: 'var(--font-heading)',
                      color: item.netProfitRupees >= 0 ? '#15803D' : '#BE123C'
                    }}>
                      ₹{item.netProfitRupees.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
