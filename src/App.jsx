// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import Dashboard from './pages/Dashboard';
import CreateZone from './pages/CreateZone';
import Reports from './pages/Reports';
import ProtectedRoute from './components/ProtectedRoute';
import UserLayout from './components/Layout/UserLayout';

// Admin imports
import AdminLayout from './components/Layout/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersManagement from './pages/admin/UsersManagement';
import ZonesManagement from './pages/admin/ZonesManagement';
import PlantsManagement from './pages/admin/PlantsManagement';
import DevicesManagement from './pages/admin/DevicesManagement';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* User Dashboard Routes with Layout - Protected */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="create-zone" element={<CreateZone />} />
            <Route path="reports" element={<Reports />} />
          </Route>

          {/* Super Admin Routes - NO PROTECTION for now */}
          <Route path="/admin-dashboard" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin-dashboard/overview" replace />} />
            <Route path="overview" element={<AdminDashboard />} />
            <Route path="users" element={<UsersManagement />} />
            <Route path="zones" element={<ZonesManagement />} />
            <Route path="plants" element={<PlantsManagement />} />
            <Route path="devices" element={<DevicesManagement />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;