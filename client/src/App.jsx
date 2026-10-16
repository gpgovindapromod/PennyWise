import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import AddExpenseModal from './components/AddExpenseModal';
import Dashboard from './pages/Dashboard/Dashboard';
import Transactions from './pages/Transactions/Transactions';
import Academics from './pages/Academics/Academics';
import Goals from './pages/Goals/Goals';
import Reports from './pages/Reports/Reports';
import Settings from './pages/Settings/Settings';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

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
        <main style={{ flex: 1, overflowY: 'auto' }}>{children}</main>
      </div>
    </div>
  );
}

function AppContent() {
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [selectedAcademicFee, setSelectedAcademicFee] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleOpenAddExpense = (fee = null) => {
    setSelectedAcademicFee(fee);
    setIsAddExpenseOpen(true);
  };

  const handleExpenseSuccess = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <BrowserRouter>
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
              <Transactions key={refreshKey} onOpenAddExpense={() => handleOpenAddExpense(null)} />
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

      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => {
          setIsAddExpenseOpen(false);
          setSelectedAcademicFee(null);
        }}
        onSuccess={handleExpenseSuccess}
        defaultAcademicFee={selectedAcademicFee}
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