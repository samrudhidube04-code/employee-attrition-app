import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

function Navbar({ onLogout }) {
    const [showNotifs, setShowNotifs] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [seenIds, setSeenIds] = useState(new Set());

    const notifRef = useRef(null);
    const dropdownRef = useRef(null);

    const unread = notifications.filter(n => !n.read).length;

    // ── Dynamic notifications from employee data ────────────────────────────
    const buildNotifications = (employees) => {
        const notifs = [];

        employees.forEach(emp => {
            // High risk employee alert
            if (emp.riskLevel === "High") {
                notifs.push({
                    id: `high-${emp.id}`,
                    icon: "🚨",
                    msg: `${emp.name || "An employee"} is at HIGH risk of attrition`,
                    sub: emp.department ? `Dept: ${emp.department}` : null,
                    time: "Just now",
                    color: "#f87171",
                    bg: "rgba(248,113,113,0.08)",
                    border: "#f87171",
                });
            }

            // Overtime warning
            if (emp.overTime === "Yes" && emp.riskLevel !== "Low") {
                notifs.push({
                    id: `ot-${emp.id}`,
                    icon: "⚠️",
                    msg: `${emp.name || "Employee"} is working overtime`,
                    sub: emp.jobSatisfaction <= 2 ? "Low job satisfaction too" : null,
                    time: "Recent",
                    color: "#fb923c",
                    bg: "rgba(251,146,60,0.08)",
                    border: "#fb923c",
                });
            }

            // Long tenure without promotion
            if (Number(emp.yearsSinceLastPromotion) >= 4) {
                notifs.push({
                    id: `promo-${emp.id}`,
                    icon: "📌",
                    msg: `${emp.name || "Employee"} hasn't been promoted in ${emp.yearsSinceLastPromotion} years`,
                    sub: null,
                    time: "Flagged",
                    color: "#a78bfa",
                    bg: "rgba(167,139,250,0.08)",
                    border: "#a78bfa",
                });
            }
        });

        // Global stats alerts
        const highCount = employees.filter(e => e.riskLevel === "High").length;
        if (highCount > 0) {
            notifs.unshift({
                id: "global-high",
                icon: "📊",
                msg: `${highCount} employee${highCount > 1 ? "s" : ""} currently at HIGH attrition risk`,
                sub: "Dashboard updated",
                time: "Live",
                color: "#94D2BD",
                bg: "rgba(148,210,189,0.08)",
                border: "#94D2BD",
            });
        }

        const attritionRate = employees.length
            ? +((employees.filter(e => e.prediction === "Yes").length / employees.length) * 100).toFixed(1)
            : 0;

        if (attritionRate > 30) {
            notifs.unshift({
                id: "global-rate",
                icon: "🔥",
                msg: `Attrition rate is critically high at ${attritionRate}%`,
                sub: "Immediate action recommended",
                time: "Alert",
                color: "#f87171",
                bg: "rgba(248,113,113,0.08)",
                border: "#f87171",
            });
        }

        // Keep max 8, mark new ones as unread
        return notifs.slice(0, 8).map(n => ({
            ...n,
            read: seenIds.has(n.id),
        }));
    };

    // Poll employees every 5 seconds to refresh notifications
    useEffect(() => {
        const fetchAndBuild = async () => {
            try {
                const res = await axios.get("http://localhost:8080/api/employees");
                const employees = Array.isArray(res.data) ? res.data : [];
                const built = buildNotifications(employees);
                setNotifications(built);
            } catch (err) {
                // silently fail — don't break navbar if backend is down
            }
        };

        fetchAndBuild();
        const interval = setInterval(fetchAndBuild, 5000);
        return () => clearInterval(interval);
    }, [seenIds]);

    // ── Close dropdowns on outside click ───────────────────────────────────
    useEffect(() => {
        const handler = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const markAllRead = () => {
        const allIds = new Set(notifications.map(n => n.id));
        setSeenIds(prev => new Set([...prev, ...allIds]));
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const handleLogout = () => {
        setShowDropdown(false);
        if (onLogout) onLogout();
        else { localStorage.clear(); window.location.href = "/"; }
    };

    return (
        <div style={s.topbar}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
        .dd-item:hover { background: rgba(255,255,255,0.06) !important; color: white !important; }
        .notif-item:hover { background: rgba(255,255,255,0.04) !important; }
        .icon-btn:hover { background: rgba(255,255,255,0.08) !important; border-color: rgba(255,255,255,0.15) !important; }
        @keyframes dropIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        .dropdown-anim { animation: dropIn 0.18s ease forwards; }
      `}</style>

            {/* LEFT — Brand */}
            <div style={s.left}>
                <div style={s.brandIcon}>🧠</div>
                <div>
                    <p style={s.brandTitle}>
                        Employee <span style={{ color: "#94D2BD" }}>Attrition</span> Prediction
                    </p>
                    <p style={s.brandSub}>HR Intelligence System</p>
                </div>
            </div>

            {/* RIGHT */}
            <div style={s.right}>

                {/* Notifications */}
                <div ref={notifRef} style={{ position: "relative" }}>
                    <button className="icon-btn" style={s.iconBtn} onClick={() => { setShowNotifs(!showNotifs); setShowDropdown(false); }}>
                        🔔
                        {unread > 0 && <span style={s.badge}>{unread}</span>}
                    </button>

                    {showNotifs && (
                        <div className="dropdown-anim" style={s.notifPanel}>
                            <div style={s.notifHeader}>
                                <span style={s.notifTitle}>🔔 Live Alerts</span>
                                <button style={s.markRead} onClick={markAllRead}>Mark all read</button>
                            </div>

                            {notifications.length === 0 ? (
                                <div style={{ padding: "24px 14px", textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 12 }}>
                                    No alerts right now 🎉
                                </div>
                            ) : notifications.map(n => (
                                <div key={n.id} className="notif-item" style={{
                                    ...s.notifItem,
                                    background: n.read ? "transparent" : n.bg,
                                    borderLeft: `3px solid ${n.read ? "transparent" : n.border}`,
                                }}>
                                    <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                                        <span style={{ fontSize: 15, flexShrink: 0 }}>{n.icon}</span>
                                        <div>
                                            <p style={{ ...s.notifMsg, color: n.read ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.85)" }}>
                                                {n.msg}
                                            </p>
                                            {n.sub && <p style={s.notifSub}>{n.sub}</p>}
                                            <p style={{ ...s.notifTime, color: n.color }}>{n.time}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div style={s.divider} />

                {/* Profile dropdown */}
                <div ref={dropdownRef} style={{ position: "relative" }}>
                    <button className="icon-btn" style={{ ...s.iconBtn, width: "auto", padding: "0 12px", gap: 8 }}
                        onClick={() => { setShowDropdown(!showDropdown); setShowNotifs(false); }}>
                        <div style={s.avatar}>HR</div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "white", fontFamily: "'Outfit',sans-serif" }}>HR Admin</span>
                        <span style={{ fontSize: 10, opacity: 0.4 }}>▼</span>
                    </button>

                    {showDropdown && (
                        <div className="dropdown-anim" style={s.dropdown}>
                            <div style={s.ddHeader}>
                                <div style={{ ...s.avatar, width: 38, height: 38, fontSize: 14 }}>HR</div>
                                <div>
                                    <p style={{ fontSize: 13, fontWeight: 600, color: "white", margin: 0 }}>HR Admin</p>
                                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", margin: 0 }}>admin@company.com</p>
                                </div>
                            </div>
                            <div style={s.ddDivider} />
                            <a href="/settings" className="dd-item" style={s.ddItem}>⚙️ &nbsp;Settings</a>
                            <div style={s.ddDivider} />
                            <button className="dd-item" onClick={handleLogout}
                                style={{ ...s.ddItem, color: "#f87171", width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>
                                🚪 &nbsp;Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const s = {
    topbar: {
        background: "#0c1528", height: 60, padding: "0 24px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        position: "sticky", top: 0, zIndex: 1000,
        fontFamily: "'Outfit', sans-serif", flexShrink: 0,
    },
    left: { display: "flex", alignItems: "center", gap: 10 },
    brandIcon: {
        width: 34, height: 34, borderRadius: 10,
        background: "linear-gradient(135deg,#378ADD,#8B5CF6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 16, flexShrink: 0, boxShadow: "0 4px 14px rgba(55,138,221,0.25)",
    },
    brandTitle: { fontSize: 13, fontWeight: 700, color: "white", margin: 0, whiteSpace: "nowrap" },
    brandSub: { fontSize: 10, color: "rgba(255,255,255,0.25)", margin: 0 },

    right: { display: "flex", alignItems: "center", gap: 10 },
    iconBtn: {
        position: "relative", background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)", borderRadius: 9,
        height: 36, width: 36, display: "flex", alignItems: "center",
        justifyContent: "center", cursor: "pointer", fontSize: 15, transition: "all 0.2s",
    },
    badge: {
        position: "absolute", top: -5, right: -5,
        background: "#E24B4A", color: "white",
        fontSize: 9, fontWeight: 700, padding: "2px 5px",
        borderRadius: "50%", lineHeight: 1,
    },
    divider: { width: 1, height: 28, background: "rgba(255,255,255,0.07)" },
    avatar: {
        width: 28, height: 28, borderRadius: "50%",
        background: "linear-gradient(135deg,#378ADD,#8B5CF6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 10, fontWeight: 700, color: "white", flexShrink: 0,
    },

    notifPanel: {
        position: "absolute", top: "calc(100% + 10px)", right: 0,
        width: 320, background: "#0f1a2e",
        border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14,
        overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.5)", zIndex: 9999,
        maxHeight: 420, overflowY: "auto",
    },
    notifHeader: {
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,0.07)",
        position: "sticky", top: 0, background: "#0f1a2e", zIndex: 1,
    },
    notifTitle: { fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.07em" },
    markRead: { background: "none", border: "none", color: "#94D2BD", fontSize: 11, cursor: "pointer", fontFamily: "'Outfit',sans-serif" },
    notifItem: { padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer", transition: "background 0.15s" },
    notifMsg: { fontSize: 12, margin: "0 0 2px", lineHeight: 1.4 },
    notifSub: { fontSize: 11, color: "rgba(255,255,255,0.3)", margin: "0 0 3px" },
    notifTime: { fontSize: 10, margin: 0, fontWeight: 600 },

    dropdown: {
        position: "absolute", top: "calc(100% + 10px)", right: 0,
        width: 210, background: "#0f1a2e",
        border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14,
        overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.5)", zIndex: 9999, padding: "6px",
    },
    ddHeader: { display: "flex", alignItems: "center", gap: 10, padding: "10px 10px 12px" },
    ddDivider: { height: 1, background: "rgba(255,255,255,0.07)", margin: "2px 0" },
    ddItem: {
        display: "flex", alignItems: "center",
        padding: "9px 10px", borderRadius: 8,
        fontSize: 13, color: "rgba(255,255,255,0.55)",
        textDecoration: "none", transition: "all 0.15s",
    },
};

export default Navbar;