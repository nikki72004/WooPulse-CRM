import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppShell } from './components/layout/AppShell';

// Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { CustomerList } from './pages/customers/CustomerList';
import { CustomerProfile } from './pages/customers/CustomerProfile';
import { DuplicateQueue } from './pages/customers/DuplicateQueue';
import { OrderList } from './pages/orders/OrderList';
import { Communications } from './pages/communications/Communications';
import { Insights } from './pages/Insights';
import { Agent } from './pages/Agent';
import { Settings } from './pages/settings/Settings';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center text-white text-xs font-mono">
        Initializing workspace security...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <AppShell>{children}</AppShell>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Protected CRM Routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/customers" element={
            <ProtectedRoute>
              <CustomerList />
            </ProtectedRoute>
          } />

          <Route path="/customers/duplicates" element={
            <ProtectedRoute>
              <DuplicateQueue />
            </ProtectedRoute>
          } />

          <Route path="/customers/:id" element={
            <ProtectedRoute>
              <CustomerProfile />
            </ProtectedRoute>
          } />

          <Route path="/orders" element={
            <ProtectedRoute>
              <OrderList />
            </ProtectedRoute>
          } />

          <Route path="/communications" element={
            <ProtectedRoute>
              <Communications />
            </ProtectedRoute>
          } />

          <Route path="/insights" element={
            <ProtectedRoute>
              <Insights />
            </ProtectedRoute>
          } />

          <Route path="/agent" element={
            <ProtectedRoute>
              <Agent />
            </ProtectedRoute>
          } />

          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
