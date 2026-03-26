import { useState, useEffect } from "react";

const API_BASE = "http://localhost:8080/api/employees";

const RISK_COLOR = { High: "#E24B4A", Medium: "#EF9F27", Low: "#1D9E75" };
const RISK_BG = { High: "rgba(226,75,74,0.12)", Medium: "rgba(239,159,39,0.12)", Low: "rgba(29,158,117,0.12)" };

const TRAVEL_OPTIONS = ["Non-Travel", "Travel_Rarely", "Travel_Frequently"];
const JOB_ROLES = [
    "Trainee Engineer", "Junior Software Engineer", "Senior Software Engineer", "Manager",
    "Sales Executive", "Research Scientist", "Healthcare Representative", "Human Resources"
];

// ── Safely resolve years of experience from any backend field name ──────────
const getYearsOfExperience = (emp) =>
    emp.yearsOfExperience ??
    emp.yearsAtCompany ??
    emp.totalWorkingYears ??
    emp.experience ??
    emp.workExperience ??
    emp.years ??
    0;

function calcRisk(emp) {
    const yoe = Number(getYearsOfExperience(emp));
    let prob = 0.1;
    if (emp.overTime === "Yes") prob += 0.25;
    if (emp.businessTravel === "Travel_Frequently") prob += 0.15;
    if (emp.businessTravel === "Travel_Rarely") prob += 0.07;
    if (Number(emp.monthlyIncome) < 40000) prob += 0.15;
    if (Number(emp.monthlyIncome) < 25000) prob += 0.1;
    if (Number(emp.distanceFromHome) > 40) prob += 0.1;
    if (yoe < 3) prob += 0.1;
    if (Number(emp.age) < 28) prob += 0.08;
    if (emp.jobRole === "Trainee Engineer") prob += 0.1;
    if (emp.jobRole === "Manager") prob -= 0.1;
    prob = Math.min(0.95, Math.max(0.04, prob));
    return {
        probability: prob,
        prediction: prob > 0.5 ? "Yes" : "No",
        riskLevel: prob > 0.65 ? "High" : prob > 0.38 ? "Medium" : "Low",
    };
}

// ── Edit Modal ────────────────────────────────────────────────────────────────
function EditModal({ emp, onClose, onSave }) {
    const [form, setForm] = useState({
        name: emp.name,
        age: emp.age,
        monthlyIncome: emp.monthlyIncome,
        businessTravel: emp.businessTravel,
        distanceFromHome: emp.distanceFromHome,
        yearsOfExperience: getYearsOfExperience(emp),
        jobRole: emp.jobRole,
        overTime: emp.overTime,
    });

    const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSave = () => {
        const updated = {
            ...emp, ...form,
            age: Number(form.age),
            monthlyIncome: Number(form.monthlyIncome),
            distanceFromHome: Number(form.distanceFromHome),
            yearsOfExperience: Number(form.yearsOfExperience),
        };
        onSave({ ...updated, ...calcRisk(updated) });
    };

    const preview = calcRisk({
        ...form,
        age: Number(form.age),
        monthlyIncome: Number(form.monthlyIncome),
        distanceFromHome: Number(form.distanceFromHome),
        yearsOfExperience: Number(form.yearsOfExperience),
    });

    const F = { display: "flex", flexDirection: "column", gap: 6 };
    const L = { fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.6px", fontWeight: 500 };
    const I = { padding: "9px 12px", borderRadius: 9, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "white", fontSize: 13, outline: "none", fontFamily: "'Outfit',sans-serif", width: "100%", boxSizing: "border-box" };
    const S = { ...I, appearance: "none", WebkitAppearance: "none", cursor: "pointer" };

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ background: "#0f1629", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: 32, width: "100%", maxWidth: 520, boxShadow: "0 32px 80px rgba(0,0,0,0.7)", animation: "modalIn 0.25s cubic-bezier(0.34,1.56,0.64,1)" }}>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                    <div>
                        <h3 style={{ fontSize: 18, fontWeight: 700, color: "white", margin: 0 }}>Edit Employee</h3>
                        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 3 }}>ID #{emp.id} · Prediction updates live as you edit</p>
                    </div>
                    <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "rgba(255,255,255,0.5)", fontSize: 16, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div style={F}><label style={L}>Full Name</label><input name="name" value={form.name} onChange={handle} style={I} /></div>
                    <div style={F}><label style={L}>Age</label><input name="age" type="number" min={18} max={65} value={form.age} onChange={handle} style={I} /></div>
                    <div style={F}><label style={L}>Monthly Income (₹)</label><input name="monthlyIncome" type="number" min={0} value={form.monthlyIncome} onChange={handle} style={I} /></div>
                    <div style={F}><label style={L}>Distance From Home (km)</label><input name="distanceFromHome" type="number" min={0} value={form.distanceFromHome} onChange={handle} style={I} /></div>
                    <div style={F}><label style={L}>Years of Experience</label><input name="yearsOfExperience" type="number" min={0} value={form.yearsOfExperience} onChange={handle} style={I} /></div>
                    <div style={F}>
                        <label style={L}>Job Role</label>
                        <select name="jobRole" value={form.jobRole} onChange={handle} style={S}>
                            {JOB_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                    <div style={F}>
                        <label style={L}>Business Travel</label>
                        <select name="businessTravel" value={form.businessTravel} onChange={handle} style={S}>
                            {TRAVEL_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div style={F}>
                        <label style={L}>Works Overtime?</label>
                        <select name="overTime" value={form.overTime} onChange={handle} style={S}>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                        </select>
                    </div>
                </div>

                <div style={{ marginTop: 18, padding: "12px 16px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Live Prediction Preview</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono',monospace", color: preview.probability > 0.65 ? "#F09595" : preview.probability > 0.38 ? "#FAC775" : "#97C459" }}>
                            {(preview.probability * 100).toFixed(1)}%
                        </span>
                        <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 600, background: RISK_BG[preview.riskLevel], color: RISK_COLOR[preview.riskLevel], border: `1px solid ${RISK_COLOR[preview.riskLevel]}44` }}>
                            {preview.riskLevel} Risk
                        </span>
                        <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 600, background: preview.prediction === "Yes" ? "rgba(226,75,74,0.12)" : "rgba(29,158,117,0.12)", color: preview.prediction === "Yes" ? "#F09595" : "#97C459" }}>
                            {preview.prediction === "Yes" ? "⚠ At Risk" : "✓ Stable"}
                        </span>
                    </div>
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                    <button onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>
                        Cancel
                    </button>
                    <button onClick={handleSave} style={{ flex: 2, padding: "10px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#7c3aed,#2563eb)", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit',sans-serif", boxShadow: "0 4px 16px rgba(124,58,237,0.35)" }}>
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function EmployeeList() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [toast, setToast] = useState(null);
    const [sortCol, setSortCol] = useState(null);
    const [sortDir, setSortDir] = useState("asc");
    const [riskFilter, setRiskFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [editEmp, setEditEmp] = useState(null);
    const PAGE_SIZE = 20;

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await fetch(API_BASE);
            if (!res.ok) throw new Error(`Server error: ${res.status}`);
            const data = await res.json();
            setEmployees(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;
        try {
            const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error(`Failed to delete: ${res.status}`);
            setEmployees(prev => prev.filter(e => e.id !== id));
            showToast(`🗑️ ${name} removed.`, "warn");
        } catch (err) {
            showToast(`❌ Could not delete ${name}: ${err.message}`, "error");
        }
    };

    const handleSave = async (updated) => {
        try {
            const res = await fetch(`${API_BASE}/${updated.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updated),
            });
            if (!res.ok) throw new Error(`Failed to update: ${res.status}`);
            const savedEmp = await res.json();
            setEmployees(prev => prev.map(e => e.id === savedEmp.id ? savedEmp : e));
            setEditEmp(null);
            showToast(`✅ ${savedEmp.name} updated successfully.`);
        } catch (err) {
            showToast(`❌ Could not save changes: ${err.message}`, "error");
        }
    };

    const handleSort = (col) => {
        if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
        else { setSortCol(col); setSortDir("asc"); }
        setPage(1);
    };

    let filtered = employees.filter(e => {
        const q = search.toLowerCase();
        const matchSearch =
            (e.name || "").toLowerCase().includes(q) ||
            (e.jobRole || "").toLowerCase().includes(q) ||
            (e.businessTravel || "").toLowerCase().includes(q);
        const matchRisk = riskFilter === "all" || (e.riskLevel || "").toLowerCase() === riskFilter;
        return matchSearch && matchRisk;
    });

    if (sortCol) {
        filtered = [...filtered].sort((a, b) => {
            // Special handling for yearsOfExperience since it may be aliased
            const resolveVal = (emp, col) => col === "yearsOfExperience" ? getYearsOfExperience(emp) : emp[col] ?? "";
            const av = resolveVal(a, sortCol), bv = resolveVal(b, sortCol);
            const cmp = typeof av === "number" ? av - bv : String(av).localeCompare(String(bv));
            return sortDir === "asc" ? cmp : -cmp;
        });
    }

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const SortIcon = ({ col }) => <span style={{ opacity: sortCol === col ? 1 : 0.35 }}>{sortCol === col ? (sortDir === "asc" ? " ↑" : " ↓") : " ↕"}</span>;

    const COLUMNS = [
        ["#", null], ["Name", "name"], ["Job Role", "jobRole"], ["Age", "age"], ["Monthly Income", "monthlyIncome"],
        ["Business Travel", "businessTravel"], ["Distance (km)", "distanceFromHome"],
        ["Yrs Exp", "yearsOfExperience"], ["Prediction", "prediction"],
        ["Risk", "riskLevel"], ["Probability", "probability"], ["Actions", null],
    ];

    if (loading) return (
        <div style={{ ...s.page, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid rgba(255,255,255,0.1)", borderTop: "3px solid #7c3aed", animation: "spin 0.8s linear infinite" }} />
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Loading employees from server...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    if (error) return (
        <div style={{ ...s.page, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
            <p style={{ color: "#F09595", fontSize: 15, fontWeight: 600 }}>Failed to load employees</p>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>{error}</p>
            <button onClick={fetchEmployees} style={{ marginTop: 8, padding: "9px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#7c3aed,#2563eb)", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                Retry
            </button>
        </div>
    );

    return (
        <div style={s.page}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        @keyframes fadeIn  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes toastIn { from{opacity:0;transform:translateX(100px)} to{opacity:1;transform:translateX(0)} }
        @keyframes modalIn { from{opacity:0;transform:scale(0.93)} to{opacity:1;transform:scale(1)} }
        .row-in  { animation: fadeIn 0.25s ease forwards; }
        .toast   { animation: toastIn 0.4s cubic-bezier(0.16,1,0.3,1) forwards; }
        .emp-row:hover td { background: rgba(148,210,189,0.04) !important; }
        .sort-th:hover { color:rgba(255,255,255,0.75); cursor:pointer; }
        .act-btn { transition: all 0.15s; }
        .act-btn:hover { opacity:0.8; transform:scale(0.95); }
        input::placeholder { color:rgba(255,255,255,0.18) !important; }
        ::-webkit-scrollbar { width:5px; height:5px; }
        ::-webkit-scrollbar-track { background:rgba(255,255,255,0.02); }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:3px; }
        .page-btn:hover { background: rgba(255,255,255,0.1) !important; }
        select option { background: #1a1f35; color: white; }
      `}</style>

            {editEmp && <EditModal emp={editEmp} onClose={() => setEditEmp(null)} onSave={handleSave} />}

            {toast && (
                <div className="toast" style={{
                    ...s.toast,
                    background: toast.type === "warn" ? "rgba(239,159,39,0.15)" : toast.type === "error" ? "rgba(226,75,74,0.15)" : "rgba(29,158,117,0.15)",
                    borderColor: toast.type === "warn" ? "#EF9F27" : toast.type === "error" ? "#E24B4A" : "#1D9E75"
                }}>
                    <span style={{ fontSize: 13, color: "white" }}>{toast.msg}</span>
                </div>
            )}

            {/* Header */}
            <div style={s.header}>
                <div>
                    <h2 style={s.title}>Employee Records</h2>
                    <p style={s.sub}>
                        {employees.length} total &nbsp;·&nbsp;
                        {employees.filter(e => e.riskLevel === "High").length} high risk &nbsp;·&nbsp;
                        {employees.filter(e => e.prediction === "Yes").length} predicted to leave
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div style={s.filterRow}>
                <div style={s.searchWrap}>
                    <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>🔍</span>
                    <input style={s.searchInput} placeholder="Search name, role, travel…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
                    {search && <button onClick={() => { setSearch(""); setPage(1); }} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 14 }}>✕</button>}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                    {["all", "high", "medium", "low"].map(r => (
                        <button key={r} onClick={() => { setRiskFilter(r); setPage(1); }} style={{
                            ...s.filterChip,
                            background: riskFilter === r ? (RISK_BG[r.charAt(0).toUpperCase() + r.slice(1)] || "rgba(148,210,189,0.15)") : "rgba(255,255,255,0.04)",
                            color: riskFilter === r ? (RISK_COLOR[r.charAt(0).toUpperCase() + r.slice(1)] || "#94D2BD") : "rgba(255,255,255,0.4)",
                            border: `1px solid ${riskFilter === r ? (RISK_COLOR[r.charAt(0).toUpperCase() + r.slice(1)] || "#94D2BD") : "rgba(255,255,255,0.1)"}`,
                        }}>
                            {r === "all" ? "All" : r.charAt(0).toUpperCase() + r.slice(1)}
                        </button>
                    ))}
                </div>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginLeft: "auto" }}>{filtered.length} of {employees.length} records</span>
            </div>

            {/* Table */}
            <div style={s.tableWrap}>
                <table style={s.table}>
                    <thead>
                        <tr>
                            {COLUMNS.map(([label, col]) => (
                                <th key={label} className={col ? "sort-th" : ""} onClick={() => col && handleSort(col)} style={s.th}>
                                    {label}{col && <SortIcon col={col} />}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginated.length === 0 ? (
                            <tr><td colSpan={COLUMNS.length} style={{ textAlign: "center", padding: "30px 0", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>No records match your search.</td></tr>
                        ) : paginated.map((emp, i) => {
                            const yoe = getYearsOfExperience(emp);
                            return (
                                <tr key={emp.id} className="emp-row row-in" style={{ animationDelay: `${Math.min(i, 15) * 25}ms` }}>
                                    <td style={s.td}><span style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, fontFamily: "'JetBrains Mono',monospace" }}>{(page - 1) * PAGE_SIZE + i + 1}</span></td>

                                    <td style={s.td}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            <div style={{ width: 30, height: 30, borderRadius: "50%", background: `hsl(${(emp.name || "").charCodeAt(0) * 7 % 360},40%,35%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "white", flexShrink: 0 }}>
                                                {(emp.name || "?").slice(0, 2).toUpperCase()}
                                            </div>
                                            <span style={{ fontSize: 13, fontWeight: 500, color: "white" }}>{emp.name}</span>
                                        </div>
                                    </td>

                                    <td style={s.td}>
                                        <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 500, background: "rgba(167,139,250,0.1)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.2)", whiteSpace: "nowrap" }}>
                                            {emp.jobRole}
                                        </span>
                                    </td>

                                    <td style={s.td}><span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{emp.age}</span></td>
                                    <td style={s.td}><span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>₹{Number(emp.monthlyIncome).toLocaleString()}</span></td>

                                    <td style={s.td}>
                                        <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, fontWeight: 600, background: emp.businessTravel === "Travel_Frequently" ? "rgba(226,75,74,0.12)" : emp.businessTravel === "Travel_Rarely" ? "rgba(239,159,39,0.12)" : "rgba(29,158,117,0.12)", color: emp.businessTravel === "Travel_Frequently" ? "#F09595" : emp.businessTravel === "Travel_Rarely" ? "#FAC775" : "#94D2BD" }}>
                                            {emp.businessTravel === "Non-Travel" ? "None" : emp.businessTravel === "Travel_Rarely" ? "Rarely" : "Frequent"}
                                        </span>
                                    </td>

                                    <td style={s.td}><span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{emp.distanceFromHome} km</span></td>

                                    {/* ── Fixed: uses getYearsOfExperience() helper ── */}
                                    <td style={s.td}>
                                        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>
                                            {yoe !== null && yoe !== undefined && yoe !== "" ? `${yoe} yrs` : "—"}
                                        </span>
                                    </td>

                                    <td style={s.td}>
                                        <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 600, background: emp.prediction === "Yes" ? "rgba(226,75,74,0.12)" : "rgba(29,158,117,0.12)", color: emp.prediction === "Yes" ? "#F09595" : "#97C459" }}>
                                            {emp.prediction === "Yes" ? "⚠ At Risk" : "✓ Stable"}
                                        </span>
                                    </td>

                                    <td style={s.td}>
                                        <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 600, background: RISK_BG[emp.riskLevel], color: RISK_COLOR[emp.riskLevel], border: `1px solid ${RISK_COLOR[emp.riskLevel]}44` }}>
                                            {emp.riskLevel}
                                        </span>
                                    </td>

                                    <td style={s.td}>
                                        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: emp.probability > 0.65 ? "#F09595" : emp.probability > 0.38 ? "#FAC775" : "#97C459" }}>
                                            {(emp.probability * 100).toFixed(1)}%
                                        </span>
                                    </td>

                                    <td style={s.td}>
                                        <div style={{ display: "flex", gap: 6 }}>
                                            <button className="act-btn" onClick={() => setEditEmp(emp)} title="Edit employee" style={{ padding: "5px 10px", borderRadius: 7, border: "1px solid rgba(99,130,255,0.35)", background: "rgba(99,130,255,0.1)", cursor: "pointer", fontSize: 12 }}>✏️</button>
                                            <button className="act-btn" onClick={() => handleDelete(emp.id, emp.name)} title="Delete employee" style={{ padding: "5px 10px", borderRadius: 7, border: "1px solid rgba(226,75,74,0.35)", background: "rgba(226,75,74,0.1)", cursor: "pointer", fontSize: 12 }}>🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div style={s.pagination}>
                    <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ ...s.pageBtn, opacity: page === 1 ? 0.3 : 1 }}>← Prev</button>
                    <div style={{ display: "flex", gap: 4 }}>
                        {Array.from({ length: Math.min(7, totalPages) }, (_, idx) => {
                            let p;
                            if (totalPages <= 7) p = idx + 1;
                            else if (page <= 4) p = idx + 1;
                            else if (page >= totalPages - 3) p = totalPages - 6 + idx;
                            else p = page - 3 + idx;
                            return (
                                <button key={p} className="page-btn" onClick={() => setPage(p)} style={{ ...s.pageBtn, background: page === p ? "rgba(148,210,189,0.2)" : "rgba(255,255,255,0.04)", color: page === p ? "#94D2BD" : "rgba(255,255,255,0.4)", border: `1px solid ${page === p ? "#94D2BD44" : "rgba(255,255,255,0.08)"}`, minWidth: 34 }}>{p}</button>
                            );
                        })}
                    </div>
                    <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ ...s.pageBtn, opacity: page === totalPages ? 0.3 : 1 }}>Next →</button>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginLeft: 8 }}>Page {page} of {totalPages}</span>
                </div>
            )}
        </div>
    );
}

const s = {
    page: { padding: "24px 28px", minHeight: "100vh", background: "#080e1e", fontFamily: "'Outfit',sans-serif", color: "white", position: "relative" },
    toast: { position: "fixed", top: 20, right: 20, zIndex: 9999, padding: "12px 18px", borderRadius: 12, border: "1px solid", backdropFilter: "blur(20px)", maxWidth: 340 },
    header: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 },
    title: { fontSize: 22, fontWeight: 700, color: "white", margin: 0 },
    sub: { fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 4 },
    filterRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" },
    searchWrap: { display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "8px 12px", flex: 1, minWidth: 220 },
    searchInput: { background: "none", border: "none", color: "white", fontSize: 13, flex: 1, fontFamily: "'Outfit',sans-serif", outline: "none" },
    filterChip: { padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "'Outfit',sans-serif", transition: "all 0.15s" },
    tableWrap: { overflowX: "auto", borderRadius: 14, border: "1px solid rgba(255,255,255,0.07)" },
    table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
    th: { padding: "12px 14px", textAlign: "left", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.3)", fontWeight: 500, background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.07)", whiteSpace: "nowrap", userSelect: "none" },
    td: { padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.04)", verticalAlign: "middle", whiteSpace: "nowrap", transition: "background 0.15s" },
    pagination: { display: "flex", alignItems: "center", gap: 6, marginTop: 16, flexWrap: "wrap" },
    pageBtn: { padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer", fontFamily: "'Outfit',sans-serif", transition: "all 0.15s" },
};