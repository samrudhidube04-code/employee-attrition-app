import React, { useState } from "react";
import "./Settings.css";

const DEFAULT_EMAIL = "admin@company.com";
const DEFAULT_PASSWORD = "hr@admin123";
const DEFAULT_NAME = "John Doe";

export default function Settings() {
    const [profile, setProfile] = useState({
        name: localStorage.getItem("hr_profile_name") || DEFAULT_NAME,
        email: localStorage.getItem("hr_profile_email") || DEFAULT_EMAIL,
        password: localStorage.getItem("hr_profile_password") || DEFAULT_PASSWORD,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [saved, setSaved] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(p => ({ ...p, [name]: value }));
        setSaved(false);
    };

    const handleSave = () => {
        if (!profile.name.trim() || !profile.email.trim() || !profile.password.trim()) {
            alert("All fields are required.");
            return;
        }

        // Save to localStorage — Login.js will read these on next login
        localStorage.setItem("hr_profile_name", profile.name.trim());
        localStorage.setItem("hr_profile_email", profile.email.trim());
        localStorage.setItem("hr_profile_password", profile.password.trim());

        // Also update the current session email
        localStorage.setItem("hr_email", profile.email.trim());

        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const initials = profile.name
        .split(" ")
        .map(n => n[0] || "")
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="settings-page">
            <div className="settings-wrapper">

                {/* Header */}
                <div className="settings-header">
                    <h1 className="settings-title">Settings</h1>
                    <p className="settings-sub">Changes here affect your login credentials</p>
                </div>

                {/* Avatar Card */}
                <div className="settings-card avatar-card">
                    <div className="avatar-circle">{initials || "HR"}</div>
                    <div className="avatar-info">
                        <p className="avatar-name">{profile.name || "Your Name"}</p>
                        <p className="avatar-email">{profile.email || "your@email.com"}</p>
                    </div>
                    <div className="avatar-badge">Admin</div>
                </div>

                {/* Profile Form */}
                <div className="settings-card">
                    <p className="card-section-title">Profile & Login Credentials</p>

                    <div className="field-group">
                        <label className="field-label">Full Name</label>
                        <div className="field-wrap">
                            <span className="field-icon">👤</span>
                            <input
                                className="field-input"
                                type="text"
                                name="name"
                                value={profile.name}
                                onChange={handleChange}
                                placeholder="Enter your name"
                            />
                        </div>
                    </div>

                    <div className="field-group">
                        <label className="field-label">Email Address <span style={{ color: "#f87171", fontSize: 10 }}>(used to login)</span></label>
                        <div className="field-wrap">
                            <span className="field-icon">✉️</span>
                            <input
                                className="field-input"
                                type="email"
                                name="email"
                                value={profile.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                            />
                        </div>
                    </div>

                    <div className="field-group">
                        <label className="field-label">Password <span style={{ color: "#f87171", fontSize: 10 }}>(used to login)</span></label>
                        <div className="field-wrap">
                            <span className="field-icon">🔒</span>
                            <input
                                className="field-input"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={profile.password}
                                onChange={handleChange}
                                placeholder="Enter new password"
                            />
                            <button
                                className="toggle-pass"
                                onClick={() => setShowPassword(!showPassword)}
                                type="button"
                            >
                                {showPassword ? "🙈" : "👁️"}
                            </button>
                        </div>
                    </div>

                    {saved && (
                        <div style={{
                            padding: "10px 14px", borderRadius: 10, marginBottom: 14,
                            background: "rgba(29,158,117,0.1)", border: "1px solid rgba(29,158,117,0.3)",
                            fontSize: 12, color: "#1D9E75",
                        }}>
                            ✅ Credentials saved! Use the new email & password on next login.
                        </div>
                    )}

                    <button
                        className={`save-btn ${saved ? "saved" : ""}`}
                        onClick={handleSave}
                    >
                        {saved ? "✅ Saved Successfully!" : "💾 Save Changes"}
                    </button>
                </div>

                {/* Danger Zone */}
                <div className="settings-card danger-card">
                    <p className="card-section-title danger-title">Danger Zone</p>
                    <p className="danger-desc">
                        Reset all credentials back to default values.
                    </p>
                    {!confirmDelete ? (
                        <button className="danger-btn" onClick={() => setConfirmDelete(true)}>
                            Reset to Default Credentials
                        </button>
                    ) : (
                        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                            <button className="danger-btn" onClick={() => {
                                localStorage.removeItem("hr_profile_name");
                                localStorage.removeItem("hr_profile_email");
                                localStorage.removeItem("hr_profile_password");
                                setProfile({ name: DEFAULT_NAME, email: DEFAULT_EMAIL, password: DEFAULT_PASSWORD });
                                setConfirmDelete(false);
                                setSaved(false);
                            }}>
                                ✅ Yes, Reset
                            </button>
                            <button onClick={() => setConfirmDelete(false)} style={{
                                padding: "9px 16px", borderRadius: 9,
                                border: "1px solid rgba(255,255,255,0.1)",
                                background: "rgba(255,255,255,0.04)",
                                color: "rgba(255,255,255,0.5)",
                                cursor: "pointer", fontSize: 12,
                                fontFamily: "'Outfit',sans-serif",
                            }}>
                                Cancel
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}