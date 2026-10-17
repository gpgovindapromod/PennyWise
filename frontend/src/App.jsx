import React, { useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import AddExpenseModal from './components/AddExpenseModal';

// Code-split pages for high Lighthouse Performance
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const Transactions = lazy(() => import('./pages/Transactions/Transactions'));
const Academics = lazy(() => import('./pages/Academics/Academics'));
const Goals = lazy(() => import('./pages/Goals/Goals'));
const Reports = lazy(() => import('./pages/Reports/Reports'));
const Settings = lazy(() => import('./pages/Settings/Settings'));
const Login = lazy(() => import('./pages/Auth/Login'));
const Register = lazy(() => import('./pages/Auth/Register'));

import MobileBottomNav from './components/MobileBottomNav';

function ProtectedLayout({ children, onOpenAddExpense }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0D1117', color: '#8B949E' }}>
        Ignition in progress...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="car-app-shell">
      <Sidebar onOpenAddExpense={onOpenAddExpense} />
      <div className="car-main-content-wrapper">
        <main className="car-main-content" style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </main>
        <MobileBottomNav onOpenAddExpense={onOpenAddExpense} />
      </div>
    </div>
  );
}

function AppContent() {
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [selectedAcademicFee, setSelectedAcademicFee] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleOpenAddExpense = (fee = null) => {
    setSelectedAcademicFee(fee);
    setEditingTransaction(null);
    setIsAddExpenseOpen(true);
  };

  const handleOpenEditTransaction = (tx) => {
    setEditingTransaction(tx);
    setSelectedAcademicFee(null);
    setIsAddExpenseOpen(true);
  };

  const handleExpenseSuccess = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <BrowserRouter>
      <Suspense fallback={
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0D1117', color: '#8B949E' }}>
          Ignition in progress...
        </div>
      }>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

        <Route
          path="/"
          element={
            <ProtectedLayout onOpenAddExpense={() => handleOpenAddExpense(null)}>
              <Dashboard key={refreshKey} onOpenAddExpense={() => handleOpenAddExpense(null)} />
            </ProtectedLayout>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedLayout onOpenAddExpense={() => handleOpenAddExpense(null)}>
              <Transactions 
                key={refreshKey} 
                onOpenAddExpense={() => handleOpenAddExpense(null)} 
                onEditTransaction={handleOpenEditTransaction}
              />
            </ProtectedLayout>
          }
        />
        <Route
          path="/academics"
          element={
            <ProtectedLayout onOpenAddExpense={() => handleOpenAddExpense(null)}>
              <Academics
                key={refreshKey}
                onOpenAddExpense={() => handleOpenAddExpense(null)}
                onPayFeeInstallment={(fee) => handleOpenAddExpense(fee)}
              />
            </ProtectedLayout>
          }
        />
        <Route
          path="/goals"
          element={
            <ProtectedLayout onOpenAddExpense={() => handleOpenAddExpense(null)}>
              <Goals key={refreshKey} />
            </ProtectedLayout>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedLayout onOpenAddExpense={() => handleOpenAddExpense(null)}>
              <Reports key={refreshKey} />
            </ProtectedLayout>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedLayout onOpenAddExpense={() => handleOpenAddExpense(null)}>
              <Settings />
            </ProtectedLayout>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>

      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => {
          setIsAddExpenseOpen(false);
          setSelectedAcademicFee(null);
          setEditingTransaction(null);
        }}
        onSuccess={handleExpenseSuccess}
        defaultAcademicFee={selectedAcademicFee}
        editingTransaction={editingTransaction}
      />
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}