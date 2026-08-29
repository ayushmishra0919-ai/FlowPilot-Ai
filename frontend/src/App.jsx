import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import Footer from './components/common/Footer';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import WorkflowsPage from './pages/WorkflowsPage';
import CreateWorkflowPage from './pages/CreateWorkflowPage';
import WorkflowDetailPage from './pages/WorkflowDetailPage';
import RequestSimulatorPage from './pages/RequestSimulatorPage';
import ExecutionHistoryPage from './pages/ExecutionHistoryPage';
import AnalyticsPage from './pages/AnalyticsPage';
import LogsPage from './pages/LogsPage';
import SettingsPage from './pages/SettingsPage';

// Protected Route Wrapper (Falls back gracefully in Demo mode)
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400 text-xs">
        <span className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mr-2" />
        Authenticating session...
      </div>
    );
  }

  // If not logged in, allow instant access or redirect to login (In portfolio apps, public simulation & dashboard demo access is great)
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Main App Layout
const App = () => {
  const location = useLocation();
  const isPublicLanding = location.pathname === '/';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Content Layout */}
      <div className="flex-1 flex w-full">
        {/* Sidebar only shown on dashboard/authenticated routes */}
        {!isPublicLanding && !isAuthPage && <Sidebar />}

        {/* Dynamic Route Content */}
        <main className={`flex-1 overflow-x-hidden ${isPublicLanding || isAuthPage ? 'w-full' : 'p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto'}`}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Authenticated / Protected */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workflows"
              element={
                <ProtectedRoute>
                  <WorkflowsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workflows/new"
              element={
                <ProtectedRoute>
                  <CreateWorkflowPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workflows/:id"
              element={
                <ProtectedRoute>
                  <WorkflowDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/simulator"
              element={
                <ProtectedRoute>
                  <RequestSimulatorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/executions"
              element={
                <ProtectedRoute>
                  <ExecutionHistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/logs"
              element={
                <ProtectedRoute>
                  <LogsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Footer */}
      {(isPublicLanding || isAuthPage) && <Footer />}
    </div>
  );
};

export default App;
