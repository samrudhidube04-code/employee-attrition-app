import React, { useState } from "react";
import "./Login.css";
import EmployeeDashboard from "./EmployeeDashboard";

const DEFAULT_EMAIL = "admin@company.com";
const DEFAULT_PASSWORD = "hr@admin123";

export default function Login({ onLogin, onEmployeeLogin }) {
    const [tab, setTab] = useState("hr"); // "hr" | "employee"
    const [mode, setMode] = useState("login"); // "login" | "register"

    // HR login state
    const [hrEmail, setHrEmail] = useState("");
    const [hrPassword, setHrPassword] = useState("");
    const [showHrPass, setShowHrPass] = useState(false);
    const [hrError, setHrError] = useState("");
    const [hrLoading, setHrLoading] = useState(false);

    // Employee login state
    const [empEmail, setEmpEmail] = useState("");
    const [empPassword, setEmpPassword] = useState("");
    const [showEmpPass, setShowEmpPass] = useState(false);
    const [empError, setEmpError] = useState("");
    const [empLoading, setEmpLoading] = useState(false);

    // Employee register state
    const [regName, setRegName] = useState("");
    const [regEmail, setRegEmail] = useState("");
    const [regDept, setRegDept] = useState("");
    const [regPassword, setRegPassword] = useState("");
    const [regConfirm, setRegConfirm] = useState("");
    const [showRegPass, setShowRegPass] = useState(false);
    const [regError, setRegError] = useState("");
    const [regSuccess, setRegSuccess] = useState("");
    const [regLoading, setRegLoading] = useState(false);

    const hintEmail = localStorage.getItem("hr_profile_email") || DEFAULT_EMAIL;

    // ── HR Submit ──
    const handleHrSubmit = (e) => {
        e.preventDefault();
        setHrError("");
        setHrLoading(true);
        setTimeout(() => {
            const savedEmail = localStorage.getItem("hr_profile_email") || DEFAULT_EMAIL;
            const savedPassword = localStorage.getItem("hr_profile_password") || DEFAULT_PASSWORD;
            if (hrEmail === savedEmail && hrPassword === savedPassword) {
                localStorage.setItem("hr_logged_in", "true");
                localStorage.setItem("hr_email", hrEmail);
                onLogin();
            } else {
                setHrError("Invalid email or password. Please try again.");
            }
            setHrLoading(false);
        }, 800);
    };

    // ── Employee Register ──
    const handleRegister = (e) => {
        e.preventDefault();
        setRegError("");
        setRegSuccess("");
        if (regPassword !== regConfirm) { setRegError("Passwords do not match."); return; }
        if (regPassword.length < 6) { setRegError("Password must be at least 6 characters."); return; }
        setRegLoading(true);
        setTimeout(() => {
            const employees = JSON.parse(localStorage.getItem("emp_accounts") || "[]");
            if (employees.find(e => e.email === regEmail)) {
                setRegError("An account with this email already exists.");
                setRegLoading(false);
                return;
            }
            employees.push({ name: regName, email: regEmail, department: regDept, password: regPassword });
            localStorage.setItem("emp_accounts", JSON.stringify(employees));
            setRegSuccess("Account created! You can now log in.");
            setRegName(""); setRegEmail(""); setRegDept(""); setRegPassword(""); setRegConfirm("");
            setRegLoading(false);
            setTimeout(() => { setMode("login"); setRegSuccess(""); }, 1800);
        }, 800);
    };

    // ── Employee Login ──
    const handleEmpSubmit = (e) => {
        e.preventDefault();
        setEmpError("");
        setEmpLoading(true);
        setTimeout(() => {
            const employees = JSON.parse(localStorage.getItem("emp_accounts") || "[]");
            const found = employees.find(e => e.email === empEmail && e.password === empPassword);
            if (found) {
                onEmployeeLogin(found); // pass employee to parent, parent renders EmployeeDashboard
            } else {
                setEmpError("Invalid email or password.");
            }
            setEmpLoading(false);
        }, 800);
    };

    return (
        <div className="login-page">
            <div className="login-bg-grid" />

            <div className="login-card">
                {/* Brand */}
                <div className="login-brand">
                    <div className="login-brand-icon">🧠</div>
                    <div>
                        <p className="login-brand-title">
                            Employee <span>Attrition</span> Prediction
                        </p>
                        <p className="login-brand-sub">HR Intelligence System</p>
                    </div>
                </div>

                <div className="login-divider" />

                {/* Tab Switcher */}
                <div className="login-tabs">
                    <button
                        className={`login-tab-btn ${tab === "hr" ? "active" : ""}`}
                        onClick={() => { setTab("hr"); setHrError(""); }}
                    >
                        👔 HR Admin
                    </button>
                    <button
                        className={`login-tab-btn ${tab === "employee" ? "active" : ""}`}
                        onClick={() => { setTab("employee"); setEmpError(""); setRegError(""); setMode("login"); }}
                    >
                        👤 Employee
                    </button>
                </div>

                {/* ── HR Login ── */}
                {tab === "hr" && (
                    <>
                        <h2 className="login-heading">Welcome back</h2>
                        <p className="login-sub">Sign in to access your HR dashboard</p>

                        {hrError && <div className="login-error">⚠️ {hrError}</div>}

                        <form onSubmit={handleHrSubmit} className="login-form">
                            <div className="login-field">
                                <label className="login-label">Email Address</label>
                                <div className="login-input-wrap">
                                    <span className="login-icon">✉️</span>
                                    <input
                                        className="login-input"
                                        type="email"
                                        placeholder={hintEmail}
                                        value={hrEmail}
                                        onChange={e => { setHrEmail(e.target.value); setHrError(""); }}
                                        required
                                        autoComplete="email"
                                    />
                                </div>
                            </div>

                            <div className="login-field">
                                <label className="login-label">Password</label>
                                <div className="login-input-wrap">
                                    <span className="login-icon">🔒</span>
                                    <input
                                        className="login-input"
                                        type={showHrPass ? "text" : "password"}
                                        placeholder="Enter your password"
                                        value={hrPassword}
                                        onChange={e => { setHrPassword(e.target.value); setHrError(""); }}
                                        required
                                        autoComplete="current-password"
                                    />
                                    <button type="button" className="login-toggle" onClick={() => setShowHrPass(!showHrPass)}>
                                        {showHrPass ? "🙈" : "👁️"}
                                    </button>
                                </div>
                            </div>

                            <div className="login-hint">
                                <span>Credentials can be updated from the Settings page</span>
                            </div>

                            <button type="submit" className={`login-btn ${hrLoading ? "loading" : ""}`} disabled={hrLoading}>
                                {hrLoading ? <span className="login-spinner" /> : "Sign In →"}
                            </button>
                        </form>
                    </>
                )}

                {/* ── Employee Login / Register ── */}
                {tab === "employee" && (
                    <>
                        <div className="emp-mode-toggle">
                            <button
                                className={`emp-mode-btn ${mode === "login" ? "active" : ""}`}
                                onClick={() => { setMode("login"); setEmpError(""); setRegError(""); }}
                            >
                                Login
                            </button>
                            <button
                                className={`emp-mode-btn ${mode === "register" ? "active" : ""}`}
                                onClick={() => { setMode("register"); setEmpError(""); setRegError(""); }}
                            >
                                Register
                            </button>
                        </div>

                        {mode === "login" && (
                            <>
                                <h2 className="login-heading">Employee Login</h2>
                                <p className="login-sub">Access your wellness survey & profile</p>

                                {empError && <div className="login-error">⚠️ {empError}</div>}

                                <form onSubmit={handleEmpSubmit} className="login-form">
                                    <div className="login-field">
                                        <label className="login-label">Email Address</label>
                                        <div className="login-input-wrap">
                                            <span className="login-icon">✉️</span>
                                            <input
                                                className="login-input"
                                                type="email"
                                                placeholder="your@email.com"
                                                value={empEmail}
                                                onChange={e => { setEmpEmail(e.target.value); setEmpError(""); }}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="login-field">
                                        <label className="login-label">Password</label>
                                        <div className="login-input-wrap">
                                            <span className="login-icon">🔒</span>
                                            <input
                                                className="login-input"
                                                type={showEmpPass ? "text" : "password"}
                                                placeholder="Enter your password"
                                                value={empPassword}
                                                onChange={e => { setEmpPassword(e.target.value); setEmpError(""); }}
                                                required
                                            />
                                            <button type="button" className="login-toggle" onClick={() => setShowEmpPass(!showEmpPass)}>
                                                {showEmpPass ? "🙈" : "👁️"}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="login-hint">
                                        <span>Don't have an account?{" "}
                                            <button type="button" className="login-link" onClick={() => setMode("register")}>
                                                Register here
                                            </button>
                                        </span>
                                    </div>

                                    <button type="submit" className={`login-btn emp-btn ${empLoading ? "loading" : ""}`} disabled={empLoading}>
                                        {empLoading ? <span className="login-spinner" /> : "Sign In →"}
                                    </button>
                                </form>
                            </>
                        )}

                        {mode === "register" && (
                            <>
                                <h2 className="login-heading">Create Account</h2>
                                <p className="login-sub">Register as an employee to access the portal</p>

                                {regError && <div className="login-error">⚠️ {regError}</div>}
                                {regSuccess && <div className="login-success">✅ {regSuccess}</div>}

                                <form onSubmit={handleRegister} className="login-form">
                                    <div className="login-field">
                                        <label className="login-label">Full Name</label>
                                        <div className="login-input-wrap">
                                            <span className="login-icon">👤</span>
                                            <input className="login-input" type="text" placeholder="Your full name" value={regName} onChange={e => setRegName(e.target.value)} required />
                                        </div>
                                    </div>

                                    <div className="login-field">
                                        <label className="login-label">Email Address</label>
                                        <div className="login-input-wrap">
                                            <span className="login-icon">✉️</span>
                                            <input className="login-input" type="email" placeholder="your@company.com" value={regEmail} onChange={e => setRegEmail(e.target.value)} required />
                                        </div>
                                    </div>

                                    <div className="login-field">
                                        <label className="login-label">Department</label>
                                        <div className="login-input-wrap">
                                            <span className="login-icon">🏢</span>
                                            <select className="login-input login-select" value={regDept} onChange={e => setRegDept(e.target.value)} required>
                                                <option value="">Select your department</option>
                                                <option>Engineering</option>
                                                <option>Human Resources</option>
                                                <option>Finance</option>
                                                <option>Marketing</option>
                                                <option>Sales</option>
                                                <option>Operations</option>
                                                <option>IT</option>
                                                <option>Other</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="login-field">
                                        <label className="login-label">Password</label>
                                        <div className="login-input-wrap">
                                            <span className="login-icon">🔒</span>
                                            <input className="login-input" type={showRegPass ? "text" : "password"} placeholder="Min. 6 characters" value={regPassword} onChange={e => setRegPassword(e.target.value)} required />
                                            <button type="button" className="login-toggle" onClick={() => setShowRegPass(!showRegPass)}>
                                                {showRegPass ? "🙈" : "👁️"}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="login-field">
                                        <label className="login-label">Confirm Password</label>
                                        <div className="login-input-wrap">
                                            <span className="login-icon">🔒</span>
                                            <input className="login-input" type="password" placeholder="Re-enter password" value={regConfirm} onChange={e => setRegConfirm(e.target.value)} required />
                                        </div>
                                    </div>

                                    <div className="login-hint">
                                        <span>Already have an account?{" "}
                                            <button type="button" className="login-link" onClick={() => setMode("login")}>Login here</button>
                                        </span>
                                    </div>

                                    <button type="submit" className={`login-btn emp-btn ${regLoading ? "loading" : ""}`} disabled={regLoading}>
                                        {regLoading ? <span className="login-spinner" /> : "Create Account →"}
                                    </button>
                                </form>
                            </>
                        )}
                    </>
                )}

                <p className="login-footer">
                    🔐 Secure HR Admin Portal · Unauthorized access is prohibited
                </p>
            </div>
        </div>
    );
}