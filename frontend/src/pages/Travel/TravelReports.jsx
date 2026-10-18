import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { formatRupees } from '../../services/currency';
import { 
  FileText, 
  Download, 
  Filter, 
  Calendar, 
  TrendingUp, 
  Receipt, 
  Percent, 
  MapPin, 
  Users, 
  Clock
} from 'lucide-react';

export default function TravelReports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportPeriod, setReportPeriod] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = {};
      const now = new Date();

      if (reportPeriod === 'this-month') {
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const today = now.toISOString().split('T')[0];
        params.startDate = firstDay;
        params.endDate = today;
      } else if (reportPeriod === 'last-month') {
        const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
        const lastDay = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
        params.startDate = firstDay;
        params.endDate = lastDay;
      } else if (reportPeriod === 'custom' && (startDate || endDate)) {
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
      }

      const res = await API.get('/travel/dashboard', { params });
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [reportPeriod, startDate, endDate]);

  const handlePrint = () => {
    window.print();
  };

  const { metrics = {}, expenseCategoryBreakdown = [], tripProfitability = [] } = data || {};

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '28px 24px 80px 24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#0284C7', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              EXECUTIVE FINANCIAL AUDIT
            </span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0F172A', margin: 0 }}>
            Profit & Loss Reports & Financial Analytics
          </h1>
          <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0 0' }}>
            Comprehensive company statement of income, trip operating expenses, vendor commissions, and net profit margins
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="btn btn-secondary"
          style={{ padding: '10px 16px', fontSize: 13, fontWeight: 700, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <Download size={15} /> Print / Save PDF Report
        </button>
      </div>

      {/* Reporting Period Filter */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: '14px 18px', border: '1px solid #E2E8F0', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#0F172A' }}>Reporting Period:</span>
          {['all', 'this-month', 'last-month', 'custom'].map(p => (
            <button
              key={p}
              onClick={() => setReportPeriod(p)}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: reportPeriod === p ? '#0B132B' : '#F1F5F9',
                color: reportPeriod === p ? '#FFFFFF' : '#475569'
              }}
            >
              {p === 'all' ? 'All Time' : (p === 'this-month' ? 'This Month' : (p === 'last-month' ? 'Last Month' : 'Custom Dates'))}
            </button>
          ))}
        </div>

        {reportPeriod === 'custom' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, color: '#64748B' }}>From:</span>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 12 }} />
            <span style={{ fontSize: 11, color: '#64748B' }}>To:</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 12 }} />
          </div>
        )}
      </div>

      {/* Comprehensive P&L Statement Card */}
      <div className="card" style={{ padding: '28px', borderRadius: 16, border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', marginBottom: 24 }}>
        <div style={{ borderBottom: '2px solid #0F172A', paddingBottom: 16, marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            CONSOLIDATED STATEMENT OF PROFIT & LOSS
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', margin: '4px 0 0 0' }}>
            PennyWise Tours & Travels Company
          </h2>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
            Currency: INR (₹) · Verified Ledger Aggregation
          </div>
        </div>

        {/* Financial Lines */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 14 }}>
          {/* Section 1: Income */}
          <div style={{ fontWeight: 800, color: '#0F172A', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', backgroundColor: '#F8FAFC', padding: '6px 10px', borderRadius: 6 }}>
            1. Operating Revenues (Collected)
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: 12 }}>
            <span style={{ color: '#334155' }}>Passenger Package Payments Collected (Net of Refunds)</span>
            <span style={{ fontWeight: 700, color: '#15803D' }}>
              ₹{(metrics.totalIncomeCollectedRupees - (metrics.totalCommissionsReceivedRupees || 0)).toLocaleString('en-IN')}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: 12 }}>
            <span style={{ color: '#334155' }}>Commissions Received (Hotels, Flights, Affiliates)</span>
            <span style={{ fontWeight: 700, color: '#15803D' }}>
              ₹{(metrics.totalCommissionsReceivedRupees || 0).toLocaleString('en-IN')}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: 8, paddingLeft: 12, fontWeight: 800 }}>
            <span>Total Collected Operating Revenue</span>
            <span style={{ color: '#16A34A', fontSize: 16 }}>
              ₹{(metrics.totalIncomeCollectedRupees || 0).toLocaleString('en-IN')}
            </span>
          </div>

          {/* Section 2: Expenses */}
          <div style={{ fontWeight: 800, color: '#0F172A', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', backgroundColor: '#F8FAFC', padding: '6px 10px', borderRadius: 6, marginTop: 10 }}>
            2. Operating Expenses & Disbursements
          </div>

          {expenseCategoryBreakdown.map(item => (
            <div key={item.category} style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: 12 }}>
              <span style={{ color: '#475569' }}>{item.category}</span>
              <span style={{ fontWeight: 600, color: '#BE123C' }}>
                ₹{item.amountRupees.toLocaleString('en-IN')}
              </span>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: 8, paddingLeft: 12, fontWeight: 800 }}>
            <span>Total Operating Costs</span>
            <span style={{ color: '#BE123C', fontSize: 16 }}>
              −₹{(metrics.totalExpensesRupees || 0).toLocaleString('en-IN')}
            </span>
          </div>

          {/* Section 3: Net Profit */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: (metrics.totalNetProfitRupees || 0) >= 0 ? '#F0FDF4' : '#FFF1F2',
            padding: '16px 20px',
            borderRadius: 12,
            border: (metrics.totalNetProfitRupees || 0) >= 0 ? '1.5px solid #86EFAC' : '1.5px solid #FECDD3',
            marginTop: 12
          }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: (metrics.totalNetProfitRupees || 0) >= 0 ? '#15803D' : '#BE123C' }}>
                NET COMPANY PROFIT / (LOSS)
              </div>
              <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                Net Cash Flow Margin
              </div>
            </div>
            <div style={{
              fontSize: 26,
              fontWeight: 900,
              fontFamily: 'var(--font-heading)',
              color: (metrics.totalNetProfitRupees || 0) >= 0 ? '#15803D' : '#BE123C'
            }}>
              ₹{(metrics.totalNetProfitRupees || 0).toLocaleString('en-IN')}
            </div>
          </div>

          {/* Section 4: Receivables Note */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', backgroundColor: '#FFFBEB', borderRadius: 8, border: '1px solid #FDE68A', fontSize: 12, marginTop: 10 }}>
            <span style={{ color: '#92400E', fontWeight: 600 }}>
              * Outstanding Passenger Receivables (Pending Collections):
            </span>
            <span style={{ color: '#B45309', fontWeight: 800 }}>
              ₹{(metrics.outstandingPassengerPaymentsRupees || 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
