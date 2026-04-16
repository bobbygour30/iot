import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import RegisterPage from "./pages/auth/RegisterPage";
import LoginPage from "./pages/auth/LoginPage";
import DashboardLayout from "./components/Layout/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Equipment from "./pages/Equipment";
import Dashboard from "./pages/Dashboard";
import Indices from "./pages/Indices";
import Reports from "./pages/Reports";
import Alerts from "./pages/Alerts";
import History from "./pages/History";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
// import Integrations from "./pages/Integrations";
// import Support from "./pages/Support";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/register" replace />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="equipment" element={<Equipment />} />
            <Route path="indices" element={<Indices />} />
            <Route path="reports" element={<Reports />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="history" element={<History />} />
            <Route path="users" element={<Users />} />
            <Route path="settings" element={<Settings />} />
            {/* <Route path="integrations" element={<Integrations />} /> */}
            {/* <Route path="support" element={<Support />} /> */}
          </Route>

          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;