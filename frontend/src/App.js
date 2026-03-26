import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import EmployeeList from "./pages/EmployeeList";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import "./App.css";
import PredictAttrition from "./pages/PredictAttrition";


export default function App() {
  // HR login
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("hr_logged_in") === "true"
  );

  // Employee login
  const [employee, setEmployee] = useState(null);

  const [activeTab, setActiveTab] = useState("dashboard");


  <div>
    <button onClick={() => setActiveTab("prediction")}>
      Prediction
    </button>

    {activeTab === "prediction" && <PredictAttrition />}
  </div>

  // HR logout
  const handleLogout = () => {
    localStorage.removeItem("hr_logged_in");
    localStorage.removeItem("hr_email");
    setIsLoggedIn(false);
  };

  // Employee login handler ✅
  const handleEmployeeLogin = (empData) => {
    setEmployee(empData);
  };

  // Employee logout ✅
  const handleEmployeeLogout = () => {
    setEmployee(null);
  };

  // 👉 If employee logged in → show Employee Dashboard
  if (employee) {
    return (
      <EmployeeDashboard
        employee={employee}
        onLogout={handleEmployeeLogout}
      />
    );
  }

  // 👉 If HR NOT logged in → show Login page
  if (!isLoggedIn) {
    return (
      <Login
        onLogin={() => setIsLoggedIn(true)}
        onEmployeeLogin={handleEmployeeLogin} // ✅ FIX HERE
      />
    );
  }

  // 👉 HR Dashboard
  return (
    <BrowserRouter>
      <div className="app-root">
        <Navbar onLogout={handleLogout} />
        <div className="layout">
          <Sidebar />
          <div className="main">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/employees" element={<EmployeeList />} />

              <Route path="/prediction" element={<PredictAttrition />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}