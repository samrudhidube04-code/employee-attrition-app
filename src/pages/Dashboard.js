import { useState, useEffect } from "react";
import axios from "axios";
import {
    BarChart, Bar, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { mockPredict, deriveStats } from "./EmployeeContext";

function useCountUp(target, duration = 700) {
    const [val, setVal] = useState(0);
    useEffect(() => {
        let start = 0;
        const step = target / (duration / 16);
        const t = setInterval(() => {
            start += step;
            if (start >= target) { setVal(target); clearInterval(t); }
            else setVal(Math.floor(start));
        }, 16);
        return () => clearInterval(t);
    }, [target]);
    return val;
}

const RISK_COLOR = { High: "#E24B4A", Medium: "#EF9F27", Low: "#1D9E75" };
const RISK_BG = { High: "rgba(226,75,74,0.12)", Medium: "rgba(239,159,39,0.12)", Low: "rgba(29,158,117,0.12)" };

const Tip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: "rgba(8,14,30,0.97)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px", fontFamily: "'Outfit',sans-serif" }}>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, marginBottom: 5 }}>{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color, fontSize: 13, fontWeight: 600, margin: "2px 0" }}>
                    {p.name}: {p.value}{p.name === "Rate" ? "%" : ""}
                </p>
            ))}
        </div>
    );
};

function KpiCard({ label, value, suffix = "", sub, trend, barPct, barColor }) {
    const n = useCountUp(parseFloat(value) || 0);
    return (
        <div style={cs.kpi} className="kpi-card">
            <p style={cs.kpiLabel}>{label}</p>
            <p style={{ ...cs.kpiVal, color: trend === "up" ? "#E24B4A" : trend === "dn" ? "#1D9E75" : "white" }}>
                {n}{suffix}
            </p>
            {sub && <p style={{ fontSize: 11, color: trend === "up" ? "#E24B4A" : trend === "dn" ? "#1D9E75" : "rgba(255,255,255,0.3)", marginTop: 4 }}>{sub}</p>}
            <div style={cs.kpiBarTrack}>
                <div className="bar-grow" style={{ "--w": `${Math.min(barPct || 0, 100)}%`, height: "100%", borderRadius: 2, background: barColor }} />
            </div>
        </div>
    );
}

function Card({ title, children, style = {}, action }) {
    return (
        <div style={{ ...cs.card, ...style }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <p style={cs.cardTitle}>{title}</p>
                {action}
            </div>
            {children}
        </div>
    );
}

export default function Dashboard() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [riskFilter, setRiskFilter] = useState("all");
    const [selectedEmp, setSelectedEmp] = useState(null);

    const fetchEmployees = async () => {
        try {
            const res = await axios.get("http://localhost:8080/api/employees");
            const list = Array.isArray(res.data) ? res.data : [];
            const enriched = list.map(emp => ({ ...emp, ...mockPredict(emp) }));
            setEmployees(enriched);
        } catch (error) {
            console.error("Error fetching employees:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
        const interval = setInterval(fetchEmployees, 3000);
        return () => clearInterval(interval);
    }, []);

    const stats = deriveStats(employees);

    // Fix: Safe = employees whose prediction is "No" (stable/safe employees)
    const safeCount = employees.filter(e => e.prediction === "No").length;
    const highCount = employees.filter(e => (e.riskLevel || "").toLowerCase() === "high").length;
    const mediumCount = employees.filter(e => (e.riskLevel || "").toLowerCase() === "medium").length;
    const lowRiskCount = employees.filter(e => (e.riskLevel || "").toLowerCase() === "low").length;
    const atRiskCount = employees.filter(e => e.prediction === "Yes").length;
    const attritionRate = employees.length ? ((atRiskCount / employees.length) * 100).toFixed(1) : 0;

    // Risk distribution bar chart data — only 3 risk levels, no separate Safe bar
    const riskBarData = [
        { name: "High Risk", count: highCount, color: "#E24B4A" },
        { name: "Medium Risk", count: mediumCount, color: "#EF9F27" },
        { name: "Low Risk", count: lowRiskCount + safeCount, color: "#1D9E75" },
    ];

    // Department-wise attrition breakdown (skip employees with no department)
    const deptData = (() => {
        const map = {};
        employees.forEach(e => {
            const d = e.department;
            if (!d || d.trim() === "") return; // skip unknown/empty
            if (!map[d]) map[d] = { dept: d, total: 0, atRisk: 0 };
            map[d].total++;
            if (e.prediction === "Yes") map[d].atRisk++;
        });
        return Object.values(map)
            .map(d => ({ ...d, rate: d.total ? +((d.atRisk / d.total) * 100).toFixed(0) : 0 }))
            .sort((a, b) => b.rate - a.rate)
            .slice(0, 6);
    })();

    const filtered = employees.filter(e => {
        const q = search.toLowerCase();
        const rl = (e.riskLevel || "").toLowerCase();
        // "low" filter shows low-risk AND stable (prediction=No) employees
        const riskMatch = riskFilter === "all"
            || rl === riskFilter
            || (riskFilter === "low" && e.prediction === "No");
        return riskMatch
            && ((e.name || "").toLowerCase().includes(q) || (e.department || "").toLowerCase().includes(q));
    });

    // Top at-risk employees
    const topAtRisk = [...employees]
        .filter(e => e.prediction === "Yes")
        .sort((a, b) => (b.probability || 0) - (a.probability || 0))
        .slice(0, 5);

    return (
        <div style={cs.page}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes barGrow{from{width:0}to{width:var(--w)}}
        .kpi-card{animation:fadeIn 0.5s ease forwards;transition:transform 0.2s,box-shadow 0.2s;}
        .kpi-card:hover{transform:translateY(-2px);box-shadow:0 12px 40px rgba(0,0,0,0.45);}
        .bar-grow{animation:barGrow 0.9s cubic-bezier(0.34,1.56,0.64,1) forwards;width:0;}
        .tab-btn:hover{opacity:0.85;}
        .emp-row:hover{background:rgba(255,255,255,0.04)!important;}
        input::placeholder{color:rgba(255,255,255,0.2)!important;}
        ::-webkit-scrollbar{width:4px;height:4px;}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px;}
      `}</style>

            {/* Header */}
            <div style={cs.header}>
                <div>
                    <h1 style={cs.pageTitle}>Attrition Dashboard</h1>
                    <p style={cs.pageSub}>
                        Live · {employees.length} employees · {atRiskCount} at risk · {safeCount} stable
                        {!employees.length && " · Add employees from Employee Form to populate"}
                    </p>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    {["all", "high", "medium", "low"].map(r => {
                        const key = r.charAt(0).toUpperCase() + r.slice(1);
                        return (
                            <button key={r} className="tab-btn" onClick={() => setRiskFilter(r)} style={{
                                ...cs.chip,
                                background: riskFilter === r ? (RISK_BG[key] || "rgba(55,138,221,0.15)") : "rgba(255,255,255,0.04)",
                                color: riskFilter === r ? (RISK_COLOR[key] || "#378ADD") : "rgba(255,255,255,0.35)",
                                border: `1px solid ${riskFilter === r ? (RISK_COLOR[key] || "#378ADD") + "66" : "rgba(255,255,255,0.08)"}`,
                            }}>{r === "all" ? "All" : key}</button>
                        );
                    })}
                </div>
            </div>

            {!employees.length && !loading && (
                <div style={cs.emptyBanner}>
                    <span style={{ fontSize: 24 }}>📋</span>
                    <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.7)", margin: 0 }}>No employee data yet</p>
                        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 3 }}>Go to Employee Form and add employees. All KPIs and charts update automatically.</p>
                    </div>
                </div>
            )}

            {/* KPI Cards */}
            <div style={cs.kpiGrid}>
                <KpiCard
                    label="Total Employees"
                    value={employees.length}
                    sub={employees.length ? `${employees.length} records loaded` : "Add employees to start"}
                    barPct={80}
                    barColor="#378ADD"
                />
                <KpiCard
                    label="At Risk"
                    value={atRiskCount}
                    trend={atRiskCount ? "up" : undefined}
                    sub={atRiskCount ? `${highCount} high · ${mediumCount} medium` : "None yet"}
                    barPct={employees.length ? (atRiskCount / employees.length) * 100 : 0}
                    barColor="#E24B4A"
                />
                <KpiCard
                    label="Safe (Stable)"
                    value={safeCount}
                    trend={safeCount ? "dn" : undefined}
                    sub={safeCount ? `${employees.length ? ((safeCount / employees.length) * 100).toFixed(0) : 0}% of workforce` : "—"}
                    barPct={employees.length ? (safeCount / employees.length) * 100 : 0}
                    barColor="#1D9E75"
                />
                <KpiCard
                    label="Attrition Rate"
                    value={attritionRate}
                    suffix="%"
                    trend={attritionRate > 15 ? "up" : "dn"}
                    sub={employees.length ? `Based on ${employees.length} employees` : "—"}
                    barPct={parseFloat(attritionRate)}
                    barColor="#EF9F27"
                />
            </div>

            {/* Row 2: Risk Level Distribution — full width */}
            <div style={{ marginBottom: 14 }}>
                <Card title="Risk Level Distribution">
                    {!employees.length ? (
                        <div style={cs.chartEmpty}>Add employees to see risk distribution</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={210}>
                            <BarChart data={riskBarData} margin={{ top: 8, right: 10, left: -18, bottom: 0 }} barSize={64}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                                <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 13, fontFamily: "Outfit" }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "Outfit" }} axisLine={false} tickLine={false} allowDecimals={false} />
                                <Tooltip content={<Tip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                                <Bar dataKey="count" name="Employees" radius={[6, 6, 0, 0]}>
                                    {riskBarData.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} fillOpacity={0.85} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </Card>
            </div>

            {/* Row 3: Employee List + Top At-Risk */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>

                {/* Employee List */}
                <Card title={`Employees (${filtered.length})`}
                    action={<div style={cs.searchMini}><input placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} style={{ background: "none", border: "none", color: "white", fontSize: 12, outline: "none", fontFamily: "'Outfit',sans-serif", width: 100 }} /></div>}>
                    <div style={{ maxHeight: 270, overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
                        {!filtered.length ? (
                            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 12, textAlign: "center", padding: "24px 0" }}>
                                {!employees.length ? "No employees added yet" : "No matches"}
                            </p>
                        ) : filtered.map(emp => (
                            <div key={emp.id}
                                className="emp-row"
                                onClick={() => setSelectedEmp(selectedEmp?.id === emp.id ? null : emp)}
                                style={{
                                    display: "flex", alignItems: "center", gap: 8, padding: "7px 8px", borderRadius: 8, cursor: "pointer", transition: "background 0.15s",
                                    background: selectedEmp?.id === emp.id ? "rgba(55,138,221,0.08)" : "transparent",
                                    borderLeft: selectedEmp?.id === emp.id ? "2px solid #378ADD" : "2px solid transparent"
                                }}>
                                <div style={{ width: 30, height: 30, borderRadius: "50%", background: `hsl(${(emp.name || "").charCodeAt(0) * 7 % 360},35%,32%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "white", flexShrink: 0 }}>
                                    {(emp.name || "?").slice(0, 2).toUpperCase()}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontSize: 13, fontWeight: 500, color: "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{emp.name || "—"}</p>
                                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{emp.department || "—"} · {emp.yearsAtCompany ?? "-"}yr</p>
                                </div>
                                <div style={{ textAlign: "right", flexShrink: 0 }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: emp.prediction === "No" ? "rgba(29,158,117,0.12)" : (RISK_BG[emp.riskLevel] || "rgba(255,255,255,0.06)"), color: emp.prediction === "No" ? "#1D9E75" : (RISK_COLOR[emp.riskLevel] || "rgba(255,255,255,0.4)") }}>
                                        {emp.probability != null ? (emp.probability * 100).toFixed(0) + "%" : "—"}
                                    </div>
                                    <p style={{ fontSize: 9, color: emp.prediction === "No" ? "#1D9E75" : (RISK_COLOR[emp.riskLevel] || "rgba(255,255,255,0.3)"), marginTop: 2, textTransform: "uppercase" }}>
                                        {emp.prediction === "No" ? "Stable" : (emp.riskLevel || "—")}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    {selectedEmp && (
                        <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: "rgba(55,138,221,0.06)", border: "1px solid rgba(55,138,221,0.18)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                <span style={{ fontSize: 11, fontWeight: 600, color: "#378ADD" }}>{selectedEmp.name}</span>
                                <button onClick={() => setSelectedEmp(null)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 13 }}>✕</button>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                                {[
                                    ["Dept", selectedEmp.department || "—"],
                                    ["Job Level", `L${selectedEmp.jobLevel || "?"}`],
                                    ["Income", `₹${Number(selectedEmp.monthlyIncome || 0).toLocaleString()}`],
                                    ["Overtime", selectedEmp.overTime || "—"],
                                    ["Status", selectedEmp.prediction === "No" ? "Stable" : (selectedEmp.riskLevel || "—")],
                                    ["Score", selectedEmp.probability != null ? (selectedEmp.probability * 100).toFixed(1) + "%" : "—"]
                                ].map(([k, v]) => (
                                    <div key={k}>
                                        <p style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.07em" }}>{k}</p>
                                        <p style={{ fontSize: 12, color: "white", fontWeight: 500 }}>{v}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Card>

                {/* Top At-Risk Employees */}
                <Card title="Top At-Risk Employees">
                    {!topAtRisk.length ? (
                        <div style={cs.chartEmpty}>No at-risk employees detected yet</div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {topAtRisk.map((emp, i) => {
                                const pct = emp.probability != null ? (emp.probability * 100).toFixed(0) : 0;
                                const riskColor = RISK_COLOR[emp.riskLevel] || "#EF9F27";
                                return (
                                    <div key={emp.id || i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        {/* Rank */}
                                        <div style={{ width: 20, fontSize: 11, color: "rgba(255,255,255,0.2)", fontFamily: "'JetBrains Mono',monospace", textAlign: "center", flexShrink: 0 }}>
                                            #{i + 1}
                                        </div>
                                        {/* Avatar */}
                                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: `hsl(${(emp.name || "").charCodeAt(0) * 7 % 360},35%,32%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "white", flexShrink: 0 }}>
                                            {(emp.name || "?").slice(0, 2).toUpperCase()}
                                        </div>
                                        {/* Info */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontSize: 13, fontWeight: 600, color: "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{emp.name || "—"}</p>
                                            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{emp.department || "—"} · {emp.jobRole || "—"}</p>
                                            {/* Progress bar */}
                                            <div style={{ marginTop: 5, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                                                <div style={{ width: `${pct}%`, height: "100%", borderRadius: 2, background: riskColor, transition: "width 0.8s ease" }} />
                                            </div>
                                        </div>
                                        {/* Score */}
                                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                                            <div style={{ fontSize: 13, fontWeight: 700, color: riskColor, fontFamily: "'JetBrains Mono',monospace" }}>{pct}%</div>
                                            <div style={{ fontSize: 9, color: riskColor, textTransform: "uppercase", marginTop: 1 }}>{emp.riskLevel}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Card>
            </div>

            {/* Row 4: Department Attrition — full width */}
            <div>
                <Card title="Department Attrition Rate">
                    {!deptData.length ? <div style={cs.chartEmpty}>No department data yet</div> : (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 40px" }}>
                            {deptData.map(d => (
                                <div key={d.dept}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "65%" }}>{d.dept}</span>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: d.rate >= 50 ? "#E24B4A" : d.rate >= 25 ? "#EF9F27" : "#1D9E75", fontFamily: "'JetBrains Mono',monospace" }}>
                                            {d.atRisk}/{d.total} · {d.rate}%
                                        </span>
                                    </div>
                                    <div style={{ height: 5, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                                        <div className="bar-grow" style={{ "--w": `${d.rate}%`, height: "100%", borderRadius: 3, background: d.rate >= 50 ? "#E24B4A" : d.rate >= 25 ? "#EF9F27" : "#1D9E75" }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}

const cs = {
    page: { padding: "24px 28px 48px", minHeight: "100vh", background: "#080e1e", fontFamily: "'Outfit',sans-serif", color: "white" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 },
    pageTitle: { fontSize: 22, fontWeight: 700, color: "white", margin: 0 },
    pageSub: { fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 4 },
    chip: { padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "'Outfit',sans-serif", transition: "all 0.15s" },
    emptyBanner: { display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderRadius: 12, background: "rgba(55,138,221,0.06)", border: "1px solid rgba(55,138,221,0.15)", marginBottom: 18 },
    kpiGrid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 14 },
    kpi: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "16px 18px", position: "relative" },
    kpiLabel: { fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.35)", margin: "0 0 8px", fontWeight: 500 },
    kpiVal: { fontSize: 26, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", lineHeight: 1 },
    kpiBarTrack: { position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: "rgba(255,255,255,0.04)", borderRadius: "0 0 14px 14px", overflow: "hidden" },
    card: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "18px 18px 16px" },
    cardTitle: { fontSize: 10, textTransform: "uppercase", letterSpacing: "0.09em", color: "rgba(255,255,255,0.35)", fontWeight: 600, margin: 0 },
    searchMini: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 7, padding: "4px 8px" },
    chartEmpty: { height: 160, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.2)", fontSize: 12, textAlign: "center", padding: "0 20px" },
};
