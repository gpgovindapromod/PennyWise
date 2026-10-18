import React, { useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import TravelSidebar from './components/TravelSidebar';
import AddExpenseModal from './components/AddExpenseModal';
import ForcedPasswordModal from './components/ForcedPasswordModal';

// Code-split pages for high performance
// Student modules
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const Transactions = lazy(() => import('./pages/Transactions/Transactions'));
const Academics = lazy(() => import('./pages/Academics/Academics'));
const Goals = lazy(() => import('./pages/Goals/Goals'));
const Reports = lazy(() => import('./pages/Reports/Reports'));
const Settings = lazy(() => import('./pages/Settings/Settings'));
const Login = lazy(() => import('./pages/Auth/Login'));
const Register = lazy(() => import('./pages/Auth/Register'));

// Travel Company Admin modules
const TravelDashboard = lazy(() => import('./pages/Travel/TravelDashboard'));
const TravelTrips = lazy(() => import('./pages/Travel/TravelTrips'));
const TravelPassengers = lazy(() => import('./pages/Travel/TravelPassengers'));
const TravelPayments = lazy(() => import('./pages/Travel/TravelPayments'));
const TravelExpenses = lazy(() => import('./pages/Travel/TravelExpenses'));
const TravelCommissions = lazy(() => import('./pages/Travel/TravelCommissions'));
const TravelOtherIncome = lazy(() => import('./pages/Travel/TravelOtherIncome'));
const TravelTransactions = lazy(() => import('./pages/Travel/TravelTransactions'));
const TravelReports = lazy(() => import('./pages/Travel/TravelReports'));
const TravelSettings = lazy(() => import('./pages/Travel/TravelSettings'));

import MobileBottomNav from './components/MobileBottomNav';

function RoleBasedHomeRedirect() {
  const { user } = useAuth();
  if (user?.role === 'travel_admin') {
    return <Navigate to="/travel" replace />;
  }
  return <Navigate to="/" replace />;
}

function StudentProtectedLayout({ children, onOpenAddExpense }) {
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

  // If travel_admin tries to view student dashboard, redirect them to their dedicated Travel ERP
  if (user.role === 'travel_admin') {
    return <Navigate to="/travel" replace />;
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

function TravelProtectedLayout({ children, onOpenAddModal }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0B132B', color: '#94A3B8' }}>
        Loading PennyWise Travel ERP...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Only travel_admin or admin can enter travel ERP
  if (user.role !== 'travel_admin' && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="car-app-shell" style={{ backgroundColor: '#F8FAFC' }}>
      <TravelSidebar onOpenAddModal={onOpenAddModal} />
      <div className="car-main-content-wrapper" style={{ backgroundColor: '#F8FAFC' }}>
        <main className="car-main-content" style={{ flex: 1, overflowY: 'auto', backgroundColor: '#F8FAFC' }}>
          {children}
        </main>
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
      {/* Forced Password Change Modal for initial credentials */}
      <ForcedPasswordModal />

      <Suspense fallback={
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0D1117', color: '#8B949E' }}>
          Ignition in progress...
        </div>
      }>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Root dynamic redirect based on authenticated user role */}
          <Route
            path="/"
            element={
              <StudentProtectedLayout onOpenAddExpense={() => handleOpenAddExpense(null)}>
                <Dashboard key={refreshKey} onOpenAddExpense={() => handleOpenAddExpense(null)} />
              </StudentProtectedLayout>
            }
          />
          <Route
            path="/transactions"
            element={
              <StudentProtectedLayout onOpenAddExpense={() => handleOpenAddExpense(null)}>
                <Transactions 
                  key={refreshKey} 
                  onOpenAddExpense={() => handleOpenAddExpense(null)} 
                  onEditTransaction={handleOpenEditTransaction}
                />
              </StudentProtectedLayout>
            }
          />
          <Route
            path="/academics"
            element={
              <StudentProtectedLayout onOpenAddExpense={() => handleOpenAddExpense(null)}>
                <Academics
                  key={refreshKey}
                  onOpenAddExpense={() => handleOpenAddExpense(null)}
                  onPayFeeInstallment={(fee) => handleOpenAddExpense(fee)}
                />
              </StudentProtectedLayout>
            }
          />
          <Route
            path="/goals"
            element={
              <StudentProtectedLayout onOpenAddExpense={() => handleOpenAddExpense(null)}>
                <Goals key={refreshKey} />
              </StudentProtectedLayout>
            }
          />
          <Route
            path="/reports"
            element={
              <StudentProtectedLayout onOpenAddExpense={() => handleOpenAddExpense(null)}>
                <Reports key={refreshKey} />
              </StudentProtectedLayout>
            }
          />
          <Route
            path="/settings"
            element={
              <StudentProtectedLayout onOpenAddExpense={() => handleOpenAddExpense(null)}>
                <Settings />
              </StudentProtectedLayout>
            }
          />

          {/* ======================================================= */}
          {/* TRAVEL COMPANY MANAGEMENT MODULE (DEDICATED DASHBOARD)   */}
          {/* ======================================================= */}
          <Route
            path="/travel"
            element={
              <TravelProtectedLayout>
                <TravelDashboard />
              </TravelProtectedLayout>
            }
          />
          <Route
            path="/travel/trips"
            element={
              <TravelProtectedLayout>
                <TravelTrips />
              </TravelProtectedLayout>
            }
          />
          <Route
            path="/travel/passengers"
            element={
              <TravelProtectedLayout>
                <TravelPassengers />
              </TravelProtectedLayout>
            }
          />
          <Route
            path="/travel/payments"
            element={
              <TravelProtectedLayout>
                <TravelPayments />
              </TravelProtectedLayout>
            }
          />
          <Route
            path="/travel/expenses"
            element={
              <TravelProtectedLayout>
                <TravelExpenses />
              </TravelProtectedLayout>
            }
          />
          <Route
            path="/travel/commissions"
            element={
              <TravelProtectedLayout>
                <TravelCommissions />
              </TravelProtectedLayout>
            }
          />
          <Route
            path="/travel/other-income"
            element={
              <TravelProtectedLayout>
                <TravelOtherIncome />
              </TravelProtectedLayout>
            }
          />
          <Route
            path="/travel/transactions"
            element={
              <TravelProtectedLayout>
                <TravelTransactions />
              </TravelProtectedLayout>
            }
          />
          <Route
            path="/travel/reports"
            element={
              <TravelProtectedLayout>
                <TravelReports />
              </TravelProtectedLayout>
            }
          />
          <Route
            path="/travel/settings"
            element={
              <TravelProtectedLayout>
                <TravelSettings />
              </TravelProtectedLayout>
            }
          />

          <Route path="*" element={<RoleBasedHomeRedirect />} />
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