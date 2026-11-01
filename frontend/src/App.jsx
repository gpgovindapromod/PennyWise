import React, { useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import AddExpenseModal from './components/AddExpenseModal';
import ForcedPasswordModal from './components/ForcedPasswordModal';

// Code-split pages
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const Transactions = lazy(() => import('./pages/Transactions/Transactions'));
const Academics = lazy(() => import('./pages/Academics/Academics'));
const Goals = lazy(() => import('./pages/Goals/Goals'));
const Reports = lazy(() => import('./pages/Reports/Reports'));
const Settings = lazy(() => import('./pages/Settings/Settings'));
const Login = lazy(() => import('./pages/Auth/Login'));
const Register = lazy(() => import('./pages/Auth/Register'));

function ProtectedLayout({ children, onOpenAddExpense }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark text-secondary">
        Initializing PennyWise Wealth Studio...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar onOpenAddExpense={onOpenAddExpense} />
      <main className="flex-1">
        <div key={location.pathname}>
          {children}
        </div>
      </main>
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
      <ForcedPasswordModal />

      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-dark text-secondary">
          Initializing PennyWise Wealth Studio...
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
