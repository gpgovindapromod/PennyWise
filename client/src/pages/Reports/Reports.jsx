import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { formatRupees } from '../../services/currency';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Coffee, GraduationCap, Utensils, PieChart, TrendingUp } from 'lucide-react';

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      const res = await API.get('/reports/summary');
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div style={{ maxWidth: 1200, margin: '40px auto', padding: '0 24px', color: 'var(--color-chocolate-light)' }}>
        Loading student financial insights...
      </div>
    );
  }

  const {
    monthlyTrend = [],
    categoryBreakdown = [],
    foodBreakdown = [],
    academicBreakdown = []
  } = data || {};

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, color: 'var(--color-burgundy)' }}>Reports & Insights</h1>
        <p style={{ fontSize: 13, color: 'var(--color-chocolate-light)' }}>
          Detailed cash-flow trends, canteen item analysis, and study expense breakdowns
        </p>
      </div>

      {/* 6-Month Income vs Expense Bar Chart */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 18, color: 'var(--color-burgundy)' }}>Income vs Expenses (Last 6 Months)</h3>
            <p style={{ fontSize: 12, color: 'var(--color-chocolate-light)' }}>
              Amounts displayed in INR (₹)
            </p>
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 12, height: 12, background: 'var(--color-income)', borderRadius: 2 }} /> Income
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 12, height: 12, background: 'var(--color-burgundy)', borderRadius: 2 }} /> Expenses
            </span>
          </div>
        </div>

        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="label" stroke="var(--color-chocolate-light)" fontSize={12} tickLine={false} />
              <YAxis stroke="var(--color-chocolate-light)" fontSize={12} tickLine={false} tickFormatter={(val) => `₹${val}`} />
              <Tooltip
                formatter={(value) => [`₹${value}`, '']}
                contentStyle={{ background: '#fff', borderRadius: 8, border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}
              />
              <Bar dataKey="income" name="Income" fill="var(--color-income)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Expense" fill="var(--color-burgundy)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category & Item Breakdown Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>
        {/* Overall Category Breakdown */}
        <div className="card">
          <h3 style={{ fontSize: 18, color: 'var(--color-burgundy)', marginBottom: 16 }}>
            Overall Spending by Category
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {categoryBreakdown.length === 0 ? (
              <div style={{ color: 'var(--color-chocolate-light)', fontSize: 13 }}>No expenses recorded yet.</div>
            ) : (
              categoryBreakdown.map((item) => (
                <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--color-neutral-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-chocolate)' }}>{item.name}</span>
                  <span style={{ fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--color-burgundy)' }}>
                    ₹{item.amountRupees.toLocaleString('en-IN')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Food & Drinks Item-Level Breakdown */}
        <div className="card" style={{ background: 'var(--color-cream)', borderColor: '#F2E4D4' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Utensils size={18} color="var(--color-burgundy)" />
            <h3 style={{ fontSize: 18, color: 'var(--color-burgundy)' }}>
              Food & Canteen Item Analysis
            </h3>
          </div>
          <p style={{ fontSize: 12, color: 'var(--color-chocolate-light)', marginBottom: 16 }}>
            Detailed breakdown of what you spent on tea, mandi, biriyani, snacks, and hostel food
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {foodBreakdown.length === 0 ? (
              <div style={{ color: 'var(--color-chocolate-light)', fontSize: 13 }}>No food purchases logged yet.</div>
            ) : (
              foodBreakdown.map((item) => (
                <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-chocolate)' }}>{item.name}</span>
                  <span style={{ fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--color-chocolate)' }}>
                    ₹{item.amountRupees.toLocaleString('en-IN')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Academic Items Breakdown */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <GraduationCap size={18} color="var(--color-burgundy)" />
          <h3 style={{ fontSize: 18, color: 'var(--color-burgundy)' }}>
            Academic Costs Item Breakdown
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
          {academicBreakdown.length === 0 ? (
            <div style={{ color: 'var(--color-chocolate-light)', fontSize: 13 }}>No academic expenses logged yet.</div>
          ) : (
            academicBreakdown.map((item) => (
              <div key={item.name} style={{ padding: '14px 16px', background: 'var(--color-neutral-surface)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: 12, color: 'var(--color-chocolate-light)' }}>{item.name}</div>
                <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--color-burgundy)', marginTop: 4 }}>
                  ₹{item.amountRupees.toLocaleString('en-IN')}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}