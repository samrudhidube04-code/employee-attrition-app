import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const NAV_ITEMS = [
    { to: "/", icon: "⬡", label: "Dashboard" },
    { to: "/employees", icon: "👥", label: "Employee List" },
    { to: "/prediction", icon: "📈", label: "Prediction Attrition" },
    { to: "/reports", icon: "📊", label: "Reports" },
    { to: "/settings", icon: "⚙️", label: "Settings" },
];

export default function Sidebar() {
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');

        .sidebar {
            width: 220px;
            min-height: 100vh;
            background: #080e1e;
            border-right: 1px solid rgba(255,255,255,0.06);
            display: flex;
            flex-direction: column;
            padding: 24px 14px;
            font-family: 'Outfit', sans-serif;
            transition: width 0.3s cubic-bezier(0.4,0,0.2,1);
            position: relative;
            flex-shrink: 0;
        }

        .sidebar.collapsed {
            width: 68px;
        }

        /* Brand */
        .sidebar-brand {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 6px 10px 24px;
            border-bottom: 1px solid rgba(255,255,255,0.06);
            margin-bottom: 20px;
            overflow: hidden;
        }

        .brand-icon {
            width: 34px;
            height: 34px;
            border-radius: 10px;
            background: linear-gradient(135deg, #378ADD, #8B5CF6);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            flex-shrink: 0;
            box-shadow: 0 4px 14px rgba(55,138,221,0.3);
        }

        .brand-text {
            overflow: hidden;
            transition: opacity 0.2s, width 0.3s;
        }

        .collapsed .brand-text {
            opacity: 0;
            width: 0;
        }

        .brand-title {
            font-size: 14px;
            font-weight: 700;
            color: white;
            margin: 0;
            white-space: nowrap;
        }

        .brand-sub {
            font-size: 10px;
            color: rgba(255,255,255,0.3);
            margin: 0;
            white-space: nowrap;
        }

        /* Nav */
        .sidebar-nav {
            display: flex;
            flex-direction: column;
            gap: 4px;
            flex: 1;
        }

        .nav-link {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 12px;
            border-radius: 10px;
            text-decoration: none;
            color: rgba(255,255,255,0.4);
            font-size: 13px;
            font-weight: 500;
            transition: all 0.18s ease;
            position: relative;
            overflow: hidden;
            white-space: nowrap;
        }

        .nav-link:hover {
            color: rgba(255,255,255,0.8);
            background: rgba(255,255,255,0.05);
        }

        .nav-link.active {
            color: #94D2BD;
            background: rgba(148,210,189,0.1);
            border: 1px solid rgba(148,210,189,0.15);
        }

        .nav-link.active::before {
            content: '';
            position: absolute;
            left: 0;
            top: 20%;
            height: 60%;
            width: 3px;
            background: #94D2BD;
            border-radius: 0 3px 3px 0;
        }

        .nav-icon {
            font-size: 16px;
            flex-shrink: 0;
            width: 20px;
            text-align: center;
        }

        .nav-label {
            transition: opacity 0.2s;
            overflow: hidden;
        }

        .collapsed .nav-label {
            opacity: 0;
            width: 0;
        }

        /* Collapse toggle */
        .collapse-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            width: 100%;
            padding: 10px 12px;
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.07);
            border-radius: 10px;
            color: rgba(255,255,255,0.3);
            font-size: 12px;
            font-family: 'Outfit', sans-serif;
            cursor: pointer;
            transition: all 0.18s;
            margin-top: 8px;
            overflow: hidden;
            white-space: nowrap;
        }

        .collapse-btn:hover {
            color: rgba(255,255,255,0.6);
            background: rgba(255,255,255,0.06);
            border-color: rgba(255,255,255,0.12);
        }

        .collapse-arrow {
            font-size: 10px;
            transition: transform 0.3s;
            flex-shrink: 0;
        }

        .collapsed .collapse-arrow {
            transform: rotate(180deg);
        }

        .collapse-text {
            transition: opacity 0.2s;
        }

        .collapsed .collapse-text {
            opacity: 0;
            width: 0;
            overflow: hidden;
        }

        /* Footer */
        .sidebar-footer {
            padding-top: 16px;
            border-top: 1px solid rgba(255,255,255,0.06);
            margin-top: 16px;
        }

        .user-row {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px 10px;
            border-radius: 10px;
            overflow: hidden;
        }

        .user-avatar {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background: linear-gradient(135deg,
                hsl(200, 40%, 35%),
                hsl(260, 40%, 40%)
            );
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: 700;
            color: white;
            flex-shrink: 0;
        }

        .user-info {
            overflow: hidden;
            transition: opacity 0.2s, width 0.3s;
        }

        .collapsed .user-info {
            opacity: 0;
            width: 0;
        }

        .user-name {
            font-size: 12px;
            font-weight: 600;
            color: rgba(255,255,255,0.7);
            white-space: nowrap;
            margin: 0;
        }

        .user-role {
            font-size: 10px;
            color: rgba(255,255,255,0.25);
            white-space: nowrap;
            margin: 0;
        }

        /* Tooltip for collapsed state */
        .nav-link[data-label]:hover::after {
            content: attr(data-label);
            position: absolute;
            left: calc(100% + 12px);
            top: 50%;
            transform: translateY(-50%);
            background: rgba(15,26,46,0.97);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 7px;
            padding: 5px 10px;
            font-size: 12px;
            color: white;
            white-space: nowrap;
            pointer-events: none;
            z-index: 999;
            display: none;
        }

        .collapsed .nav-link[data-label]:hover::after {
            display: block;
        }
      `}</style>

            {/* Brand */}
            <div className="sidebar-brand">
                <div className="brand-icon">🧠</div>
                <div className="brand-text">
                    <p className="brand-title">HR Admin</p>
                    <p className="brand-sub">Attrition System</p>
                </div>
            </div>

            {/* Nav Links */}
            <nav className="sidebar-nav">
                {NAV_ITEMS.map(({ to, icon, label }) => (
                    <Link
                        key={to}
                        to={to}
                        data-label={label}
                        className={`nav-link ${location.pathname === to ? "active" : ""}`}
                    >
                        <span className="nav-icon">{icon}</span>
                        <span className="nav-label">{label}</span>
                    </Link>
                ))}

                <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
                    <span className="collapse-arrow">◀</span>
                    <span className="collapse-text">Collapse</span>
                </button>
            </nav>

            {/* Footer */}
            <div className="sidebar-footer">
                <div className="user-row">
                    <div className="user-avatar">JD</div>
                    <div className="user-info">
                        <p className="user-name">John Doe</p>
                        <p className="user-role">Administrator</p>
                    </div>
                </div>
            </div>
        </div>
    );
}