import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { formatRupees } from '../../services/currency';
import { 
  History, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight, 
  CreditCard, 
  Download
} from 'lucide-react';

export default function TravelTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flowFilter, setFlowFilter] = useState('all'); // 'all' | 'inflow' | 'outflow'
  const [methodFilter, setMethodFilter] = useState('all');
  const [tripFilter, setTripFilter] = useState('all');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [txRes, tripsRes] = await Promise.all([
        API.get('/travel/transactions', {
          params: {
            type: flowFilter !== 'all' ? flowFilter : undefined,
            paymentMethod: methodFilter !== 'all' ? methodFilter : undefined,
            tripId: tripFilter !== 'all' ? tripFilter : undefined
          }
        }),
        API.get('/travel/trips')
      ]);

      setTransactions(txRes.data.data || []);
      setTrips(tripsRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [flowFilter, methodFilter, tripFilter]);

  const handleExportCSV = () => {
    if (transactions.length === 0) return;

    const headers = ['Date', 'Type', 'Flow', 'Description', 'Trip', 'Amount (INR)', 'Payment Method', 'Reference'];
    const rows = transactions.map(t => [
      new Date(t.date).toLocaleDateString('en-IN'),
      `"${t.transactionType}"`,
      t.flow,
      `"${t.description.replace(/"/g, '""')}"`,
      `"${t.tripName.replace(/"/g, '""')}"`,
      t.amountRupees,
      t.paymentMethod || 'N/A',
      `"${(t.reference || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PennyWise_Travel_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalInflow = transactions.filter(t => t.flow === 'inflow').reduce((sum, t) => sum + t.amountRupees, 0);
  const totalOutflow = transactions.filter(t => t.flow === 'outflow').reduce((sum, t) => sum + Math.abs(t.amountRupees), 0);
  const netCashMovement = totalInflow - totalOutflow;

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '28px 24px 80px 24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#0284C7', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              MASTER FINANCIAL LEDGER
            </span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0F172A', margin: 0 }}>
            Unified Financial Transactions & Cash Flow
          </h1>
          <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0 0' }}>
            Complete audit trail of passenger payments, commission receipts, tour expenses, and client refunds
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="btn btn-secondary"
          style={{ padding: '10px 16px', fontSize: 13, fontWeight: 700, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <Download size={15} /> Export Ledger (CSV)
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 20 }}>
        <div className="card" style={{ padding: '18px', borderRadius: 12, backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#16A34A', textTransform: 'uppercase' }}>Filtered Inflows</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#16A34A', marginTop: 4 }}>
            +₹{totalInflow.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>Passenger dues, commissions, fees</div>
        </div>

        <div className="card" style={{ padding: '18px', borderRadius: 12, backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#BE123C', textTransform: 'uppercase' }}>Filtered Outflows</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#BE123C', marginTop: 4 }}>
            −₹{totalOutflow.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>Expenses, fuel, refunds, driver tips</div>
        </div>

        <div className="card" style={{ padding: '18px', borderRadius: 12, backgroundColor: '#0B132B', color: '#FFFFFF', border: '1px solid #1C2541' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#38BDF8', textTransform: 'uppercase' }}>Net Cash Movement</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: netCashMovement >= 0 ? '#4ADE80' : '#FB7185', marginTop: 4 }}>
            {netCashMovement >= 0 ? '+' : ''}₹{netCashMovement.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>Total Inflow − Total Outflow</div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: '14px 18px', border: '1px solid #E2E8F0', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>Flow:</span>
            <select
              value={flowFilter}
              onChange={(e) => setFlowFilter(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 12, outline: 'none' }}
            >
              <option value="all">All Cash Movements</option>
              <option value="inflow">Inflows Only (Income & Commissions)</option>
              <option value="outflow">Outflows Only (Expenses & Refunds)</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>Method:</span>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 12, outline: 'none' }}
            >
              <option value="all">All Methods</option>
              <option value="upi">UPI</option>
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="card">Card</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>Trip:</span>
            <select
              value={tripFilter}
              onChange={(e) => setTripFilter(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 12, outline: 'none' }}
            >
              <option value="all">All Trips & Overheads</option>
              {trips.map(t => (
                <option key={t._id} value={t._id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ fontSize: 12, color: '#64748B' }}>
          {transactions.length} verified transactions
        </div>
      </div>

      {/* Unified Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748B' }}>Loading financial ledger...</div>
      ) : transactions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 16px', backgroundColor: '#FFFFFF', borderRadius: 14, border: '1px solid #E2E8F0' }}>
          <History size={32} color="#0284C7" style={{ marginBottom: 10 }} />
          <h3 style={{ margin: 0, color: '#0F172A', fontWeight: 800 }}>No transactions recorded</h3>
          <p style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
            Record payments, commissions, or expenses to view unified ledger entries.
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, borderRadius: 14, border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1.5px solid #E2E8F0', color: '#64748B', fontWeight: 800, fontSize: 11, textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 16px' }}>Date</th>
                  <th style={{ padding: '12px 16px' }}>Transaction Type</th>
                  <th style={{ padding: '12px 16px' }}>Description / Client / Vendor</th>
                  <th style={{ padding: '12px 16px' }}>Allocated Trip</th>
                  <th style={{ padding: '12px 16px' }}>Method & Ref</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Cash Flow Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t, idx) => {
                  const isInflow = t.flow === 'inflow';

                  return (
                    <tr key={t.id || idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 16px', color: '#475569', fontWeight: 600 }}>
                        {new Date(t.date).toLocaleDateString('en-IN')}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: 6,
                          fontSize: 10,
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          backgroundColor: isInflow ? '#DCFCE7' : '#FFE4E6',
                          color: isInflow ? '#15803D' : '#BE123C'
                        }}>
                          {t.transactionType}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0F172A' }}>
                        {t.description}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#0284C7', fontWeight: 600 }}>
                        {t.tripName}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ textTransform: 'uppercase', fontSize: 10, fontWeight: 800, color: '#334155', backgroundColor: '#F1F5F9', padding: '2px 6px', borderRadius: 4 }}>
                          {t.paymentMethod}
                        </span>
                        {t.reference && t.reference !== 'N/A' && (
                          <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>{t.reference}</div>
                        )}
                      </td>
                      <td style={{
                        padding: '12px 16px',
                        textAlign: 'right',
                        fontWeight: 900,
                        fontFamily: 'var(--font-heading)',
                        fontSize: 15,
                        color: isInflow ? '#15803D' : '#BE123C'
                      }}>
                        {isInflow ? '+' : '−'}₹{Math.abs(t.amountRupees).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
