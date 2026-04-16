import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RegisterPage from "./pages/auth/RegisterPage";
import LoginPage from "./pages/auth/LoginPage";
import DashboardLayout from "./components/Layout/DashboardLayout";
import Equipment from "./pages/Equipment";
import Dashboard from "./pages/Dashboard";
import Indices from "./pages/Indices";
import Reports from "./pages/Reports";
import Alerts from "./pages/Alerts";
import History from "./pages/History";
import Users from "./pages/Users";

const App = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />

          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="equipment" element={<Equipment />} />
            <Route path="indices" element={<Indices />} />
            <Route path="reports" element={<Reports />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="history" element={<History />} />
            <Route path="users" element={<Users />} />

          </Route>
        </Routes>
      </Router>
    </>
  );
};

export default App;
