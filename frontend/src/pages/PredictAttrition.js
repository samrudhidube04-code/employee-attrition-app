import { useState, useEffect, useRef } from "react";

const API_BASE = "http://localhost:8080/api/employees";

/* ═══════════════════════════════════════════════════════════
   SHARED SURVEY STORE
   Import this in your EmployeeDashboard too and call
   surveyStore.push(entry) after form submission.
═══════════════════════════════════════════════════════════ */
export const surveyStore = {
    _surveys: [],
    _listeners: [],
    subscribe(fn) {
        this._listeners.push(fn);
        return () => { this._listeners = this._listeners.filter(l => l !== fn); };
    },
    push(entry) {
        const idx = this._surveys.findIndex(s => s.email === entry.email);
        if (idx >= 0) this._surveys[idx] = entry;
        else this._surveys.push(entry);
        this._listeners.forEach(fn => fn([...this._surveys]));
    },
    getAll() { return [...this._surveys]; },
};

/* ═══════════════════════════════════════════════════════════
   ATTRITION PREDICTION ENGINE
═══════════════════════════════════════════════════════════ */
function runPrediction(data) {
    let score = 0;

    const age = Number(data.age);
    const income = Number(data.salary || data.monthlyIncome || 0);
    const years = Number(data.yearsOfExperience || data.yearsAtCompany || 0);
    const dist = Number(data.distanceFromHome || 0);
    const companies = Number(data.numCompaniesWorked || 0);
    const envSat = Number(data.environmentSatisfaction || 2);

    if (age < 30) score += 15; else if (age < 35) score += 8;
    if (income < 30000) score += 20; else if (income < 60000) score += 10; else if (income > 150000) score -= 10;
    if (years < 2) score += 15; else if (years > 7) score -= 10;
    if (dist > 50) score += 12; else if (dist > 25) score += 6;
    if (companies > 4) score += 15; else if (companies > 2) score += 7;
    if (envSat === 1) score += 12; else if (envSat === 2) score += 6; else if (envSat >= 4) score -= 6;
    if (data.overTime === "Yes") score += 20;
    if (data.businessTravel === "Travel_Frequently") score += 12;
    else if (data.businessTravel === "Travel_Rarely") score += 5;

    const probability = Math.min(Math.max(score / 1.4 + 18, 5), 95);
    const level = probability >= 60 ? "High" : probability >= 35 ? "Medium" : "Low";
    const prediction = probability >= 50 ? "Yes" : "No";
    return { probability: probability.toFixed(1), level, prediction };
}

/* ═══════════════════════════════════════════════════════════
   DESIGN TOKENS (matching your existing dark theme)
═══════════════════════════════════════════════════════════ */
const C = {
    bg: "#080e1e",
    surface: "rgba(255,255,255,0.03)",
    card: "rgba(255,255,255,0.04)",
    border: "rgba(255,255,255,0.08)",
    borderHi: "rgba(255,255,255,0.15)",
    accent: "#7c3aed",
    accentDim: "rgba(124,58,237,0.12)",
    blue: "#2563eb",
    teal: "#4ade80",
    tealDim: "rgba(74,222,128,0.1)",
    amber: "#FAC775",
    amberDim: "rgba(250,199,117,0.1)",
    red: "#F09595",
    redDim: "rgba(240,149,149,0.1)",
    purple: "#a78bfa",
    purpleDim: "rgba(167,139,250,0.1)",
    t1: "#ffffff",
    t2: "rgba(255,255,255,0.6)",
    t3: "rgba(255,255,255,0.3)",
    t4: "rgba(255,255,255,0.1)",
    font: "'Outfit', sans-serif",
    mono: "'JetBrains Mono', monospace",
};

const RISK = {
    High: { color: "#F09595", dim: "rgba(240,149,149,0.12)", border: "rgba(240,149,149,0.3)", icon: "⚠", label: "High Risk" },
    Medium: { color: "#FAC775", dim: "rgba(250,199,117,0.12)", border: "rgba(250,199,117,0.3)", icon: "◈", label: "Medium Risk" },
    Low: { color: "#4ade80", dim: "rgba(74,222,128,0.12)", border: "rgba(74,222,128,0.3)", icon: "✓", label: "Low Risk" },
};

/* ─── Tiny shared UI pieces ─── */
const Label = ({ children }) => (
    <div style={{ fontSize: 10, fontWeight: 600, color: C.t3, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 5 }}>
        {children}
    </div>
);

const Field = ({ label, children }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <Label>{label}</Label>
        {children}
    </div>
);

const inputStyle = {
    padding: "9px 12px", borderRadius: 9,
    border: `1px solid ${C.border}`,
    background: "rgba(255,255,255,0.05)",
    color: C.t1, fontSize: 13, outline: "none",
    fontFamily: C.font, width: "100%", boxSizing: "border-box",
    transition: "border-color 0.2s",
};

const TI = ({ label, type = "text", value, onChange, placeholder }) => (
    <Field label={label}>
        <input type={type} value={value} onChange={onChange} placeholder={placeholder}
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = C.purple}
            onBlur={e => e.target.style.borderColor = C.border}
        />
    </Field>
);

const SI = ({ label, value, onChange, options }) => (
    <Field label={label}>
        <select value={value} onChange={onChange}
            style={{ ...inputStyle, cursor: "pointer", appearance: "none", WebkitAppearance: "none" }}
            onFocus={e => e.target.style.borderColor = C.purple}
            onBlur={e => e.target.style.borderColor = C.border}
        >
            <option value="">Select…</option>
            {options.map(o => <option key={o.v} value={o.v} style={{ background: "#1a1f35" }}>{o.l}</option>)}
        </select>
    </Field>
);

const Scale = ({ label, value, onChange, labels }) => (
    <Field label={label}>
        <div style={{ display: "flex", gap: 5 }}>
            {[1, 2, 3, 4].map(n => {
                const active = Number(value) === n;
                return (
                    <button key={n} onClick={() => onChange(n)} style={{
                        flex: 1, padding: "8px 4px", borderRadius: 8, fontSize: 11, fontWeight: 600,
                        border: `1px solid ${active ? C.purple : C.border}`,
                        background: active ? C.accentDim : "rgba(255,255,255,0.03)",
                        color: active ? C.purple : C.t3, cursor: "pointer",
                        fontFamily: C.font, transition: "all 0.15s",
                    }}>
                        {n}
                        {labels && <div style={{ fontSize: 9, marginTop: 1, color: active ? C.purple : C.t4 }}>{labels[n - 1]}</div>}
                    </button>
                );
            })}
        </div>
    </Field>
);

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   Usage: <PredictAttrition />
   Drop this wherever your PredictAttrition tab content goes.
═══════════════════════════════════════════════════════════ */
export default function PredictAttrition() {
    const [surveys, setSurveys] = useState(surveyStore.getAll());
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState(null);
    const [result, setResult] = useState(null);
    const [predicting, setPredicting] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null); // "saved" | "error" | null
    const [newIds, setNewIds] = useState(new Set());
    const prevCount = useRef(0);

    // Subscribe to live survey submissions
    useEffect(() => {
        return surveyStore.subscribe(updated => {
            setSurveys(updated);
            // Track newly arrived entries for "NEW" badge
            if (updated.length > prevCount.current) {
                const latest = updated[updated.length - 1];
                setNewIds(prev => new Set([...prev, latest.email]));
                setTimeout(() => {
                    setNewIds(prev => { const n = new Set(prev); n.delete(latest.email); return n; });
                }, 5000);
            }
            prevCount.current = updated.length;
        });
    }, []);

    const selectEmployee = (s) => {
        setSelected(s);
        setResult(null);
        setSaveStatus(null);
        setForm({
            name: s.name || "",
            age: s.age || "",
            salary: s.salary || s.monthlyIncome || "",
            jobRole: s.jobRole || "",
            overTime: s.overTime || "",
            businessTravel: s.businessTravel || "",
            distanceFromHome: s.distanceFromHome || "",
            yearsOfExperience: s.yearsOfExperience || s.yearsAtCompany || "",
            numCompaniesWorked: s.numCompaniesWorked || "",
            environmentSatisfaction: s.environmentSatisfaction || "",
            department: s.department || "",
            email: s.email || s.employeeId || "",
        });
    };

    const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handlePredict = () => {
        setPredicting(true);
        setResult(null);
        setSaveStatus(null);
        setTimeout(() => {
            const res = runPrediction(form);
            setResult(res);
            setPredicting(false);
        }, 1100);
    };

    // Save predicted employee to Spring Boot DB → triggers employee list refresh
    const handleSaveToEmployeeList = async () => {
        if (!result) return;
        setSaving(true);
        setSaveStatus(null);

        const payload = {
            name: form.name,
            age: Number(form.age),
            monthlyIncome: Number(form.salary),
            jobRole: form.jobRole || "Unknown",
            overTime: form.overTime,
            businessTravel: form.businessTravel,
            distanceFromHome: Number(form.distanceFromHome),
            yearsOfExperience: Number(form.yearsOfExperience),
            numCompaniesWorked: Number(form.numCompaniesWorked),
            department: form.department,
            email: form.email,
            // Prediction results
            prediction: result.prediction,
            riskLevel: result.level,
            probability: parseFloat(result.probability) / 100,
            // Extra survey fields
            environmentSatisfaction: Number(form.environmentSatisfaction),
        };

        try {
            // Check if employee already exists (by email) → PUT, else POST
            const checkRes = await fetch(`${API_BASE}?email=${encodeURIComponent(form.email)}`);
            const existing = checkRes.ok ? await checkRes.json() : [];
            const match = Array.isArray(existing) ? existing.find(e => e.email === form.email) : null;

            let res;
            if (match) {
                res = await fetch(`${API_BASE}/${match.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...payload, id: match.id }),
                });
            } else {
                res = await fetch(API_BASE, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
            }

            if (!res.ok) throw new Error(`Server error ${res.status}`);
            setSaveStatus("saved");
        } catch (err) {
            console.error(err);
            setSaveStatus("error");
        } finally {
            setSaving(false);
        }
    };

    /* ── render ── */
    return (
        <div style={{ fontFamily: C.font, color: C.t1 }}>
            <style>{`
        @keyframes fadeUp   { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes badgePop { 0%{transform:scale(0.8);opacity:0} 60%{transform:scale(1.15)} 100%{transform:scale(1);opacity:1} }
        @keyframes spin     { to{transform:rotate(360deg)} }
        .survey-card:hover  { border-color: rgba(167,139,250,0.4) !important; background: rgba(167,139,250,0.05) !important; }
        .predict-in         { animation: fadeUp 0.35s ease forwards; }
        select option       { background: #1a1f35; color: white; }
        input::-webkit-inner-spin-button { -webkit-appearance: none; }
      `}</style>

            <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20, alignItems: "start" }}>

                {/* ══ LEFT: Submitted Surveys ══ */}
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: C.t3, letterSpacing: "0.07em", textTransform: "uppercase" }}>
                            Submitted Surveys
                        </span>
                        <span style={{ fontFamily: C.mono, fontSize: 11, color: C.t3 }}>{surveys.length}</span>
                    </div>

                    {surveys.length === 0 ? (
                        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "36px 20px", textAlign: "center" }}>
                            <div style={{ fontSize: 28, marginBottom: 10 }}>📭</div>
                            <p style={{ color: C.t3, fontSize: 12, margin: 0, lineHeight: 1.7 }}>
                                No surveys submitted yet.<br />Employee submissions appear here instantly.
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {surveys.map((s, i) => {
                                const isActive = selected?.email === s.email || selected?.employeeId === s.email;
                                const isNew = newIds.has(s.email);
                                return (
                                    <div key={s.email || i}
                                        className="survey-card"
                                        onClick={() => selectEmployee(s)}
                                        style={{
                                            background: isActive ? "rgba(124,58,237,0.12)" : C.card,
                                            border: `1px solid ${isActive ? "rgba(167,139,250,0.5)" : C.border}`,
                                            borderRadius: 12, padding: "14px 16px", cursor: "pointer", transition: "all 0.15s",
                                        }}
                                    >
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                            {/* Avatar + name */}
                                            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                                <div style={{
                                                    width: 34, height: 34, borderRadius: "50%",
                                                    background: `hsl(${(s.name || "").charCodeAt(0) * 7 % 360},40%,32%)`,
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    fontSize: 11, fontWeight: 700, flexShrink: 0,
                                                }}>
                                                    {(s.name || "?").slice(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: 13, fontWeight: 600, color: C.t1, display: "flex", alignItems: "center", gap: 6 }}>
                                                        {s.name}
                                                        {isNew && (
                                                            <span style={{ fontSize: 9, fontWeight: 700, background: "#4ade80", color: "#080e1e", borderRadius: 20, padding: "1px 6px", animation: "badgePop 0.4s ease" }}>NEW</span>
                                                        )}
                                                    </div>
                                                    <div style={{ fontSize: 11, color: C.t3, marginTop: 1 }}>{s.department}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quick stats */}
                                        <div style={{ marginTop: 10, display: "flex", gap: 5, flexWrap: "wrap" }}>
                                            {[
                                                { v: `₹${Number(s.salary || s.monthlyIncome || 0).toLocaleString()}`, hi: false },
                                                { v: s.overTime === "Yes" ? "OT ⚠" : "No OT", hi: s.overTime === "Yes" },
                                                { v: (s.businessTravel || "").replace("Travel_", "") || "No Travel", hi: s.businessTravel === "Travel_Frequently" },
                                            ].map(({ v, hi }) => (
                                                <span key={v} style={{
                                                    fontSize: 10, padding: "2px 7px", borderRadius: 6,
                                                    background: hi ? C.amberDim : C.surface,
                                                    color: hi ? C.amber : C.t3,
                                                    border: `1px solid ${hi ? "rgba(250,199,117,0.25)" : C.border}`,
                                                }}>{v}</span>
                                            ))}
                                        </div>
                                        <div style={{ marginTop: 6, fontSize: 10, color: C.t4 }}>{s.submittedAt}</div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ══ RIGHT: Edit Form + Prediction ══ */}
                <div>
                    {!form ? (
                        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "64px 24px", textAlign: "center" }}>
                            <div style={{ fontSize: 40, marginBottom: 14 }}>🔮</div>
                            <div style={{ fontSize: 15, fontWeight: 600, color: C.t2, marginBottom: 6 }}>Select an Employee</div>
                            <div style={{ fontSize: 13, color: C.t3 }}>Click any survey card on the left to load their data and run an attrition prediction.</div>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                            {/* Employee header */}
                            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
                                <div style={{
                                    width: 42, height: 42, borderRadius: "50%",
                                    background: `hsl(${(form.name || "").charCodeAt(0) * 7 % 360},40%,32%)`,
                                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700,
                                }}>
                                    {(form.name || "?").slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 15, color: C.t1 }}>{form.name}</div>
                                    <div style={{ fontSize: 12, color: C.t3, marginTop: 1 }}>{form.email} · {form.department}</div>
                                </div>
                                <div style={{ marginLeft: "auto", fontSize: 11, color: C.t3, fontStyle: "italic" }}>Auto-filled · editable</div>
                            </div>

                            {/* ── Editable Fields ── */}
                            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 22 }}>
                                <div style={{ fontSize: 11, fontWeight: 600, color: C.t3, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 18 }}>
                                    Survey Data
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
                                    <TI label="Age" type="number" value={form.age} onChange={e => setF("age", e.target.value)} />
                                    <TI label="Monthly Salary (₹)" type="number" value={form.salary} onChange={e => setF("salary", e.target.value)} />
                                    <TI label="Distance (km)" type="number" value={form.distanceFromHome} onChange={e => setF("distanceFromHome", e.target.value)} />
                                    <TI label="Years Experience" type="number" value={form.yearsOfExperience} onChange={e => setF("yearsOfExperience", e.target.value)} />
                                    <TI label="Prev. Companies" type="number" value={form.numCompaniesWorked} onChange={e => setF("numCompaniesWorked", e.target.value)} />
                                    <SI label="Job Role" value={form.jobRole} onChange={e => setF("jobRole", e.target.value)}
                                        options={["Trainee Engineer", "Junior Software Engineer", "Senior Software Engineer", "Manager", "Sales Executive", "Research Scientist", "Healthcare Representative", "Human Resources"].map(r => ({ v: r, l: r }))} />
                                    <SI label="Overtime" value={form.overTime} onChange={e => setF("overTime", e.target.value)}
                                        options={[{ v: "Yes", l: "Yes" }, { v: "No", l: "No" }]} />
                                    <SI label="Business Travel" value={form.businessTravel} onChange={e => setF("businessTravel", e.target.value)}
                                        options={[{ v: "Non-Travel", l: "Non-Travel" }, { v: "Travel_Rarely", l: "Travel Rarely" }, { v: "Travel_Frequently", l: "Travel Frequently" }]} />
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14 }}>
                                    <Scale label="Environment Satisfaction" value={form.environmentSatisfaction} onChange={v => setF("environmentSatisfaction", v)} labels={["Low", "Med", "High", "V.High"]} />
                                </div>
                            </div>

                            {/* ── Predict Button + Result ── */}
                            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 22 }}>

                                <button onClick={handlePredict} disabled={predicting}
                                    style={{
                                        width: "100%", padding: "13px 0", borderRadius: 11, border: "none",
                                        background: predicting ? "rgba(124,58,237,0.4)" : "linear-gradient(135deg,#7c3aed,#2563eb)",
                                        color: "white", fontSize: 15, fontWeight: 700, cursor: predicting ? "not-allowed" : "pointer",
                                        fontFamily: C.font, boxShadow: "0 4px 20px rgba(124,58,237,0.35)",
                                        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                                        marginBottom: (result || predicting) ? 20 : 0,
                                    }}
                                >
                                    {predicting ? (
                                        <>
                                            <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
                                            Analyzing…
                                        </>
                                    ) : result ? "🔄 Re-run Prediction" : "🔮 Run Attrition Prediction"}
                                </button>

                                {predicting && (
                                    <div style={{ padding: "14px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 10, border: `1px solid ${C.border}`, marginBottom: 16 }}>
                                        {["Loading survey features", "Weighing risk factors", "Computing attrition score"].map((s, i) => (
                                            <div key={s} style={{ fontSize: 11, color: C.t3, padding: "3px 0", fontFamily: C.mono }}>
                                                <span style={{ color: C.purple, marginRight: 6 }}>›</span>{s}…
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {result && !predicting && (() => {
                                    const rm = RISK[result.level];
                                    return (
                                        <div className="predict-in">

                                            {/* Risk badge */}
                                            <div style={{ background: rm.dim, border: `1px solid ${rm.border}`, borderRadius: 14, padding: "24px 20px", textAlign: "center", marginBottom: 16 }}>
                                                <div style={{ fontSize: 30, marginBottom: 6 }}>{rm.icon}</div>
                                                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: rm.color, marginBottom: 4 }}>ATTRITION RISK</div>
                                                <div style={{ fontSize: 30, fontWeight: 700, color: rm.color, fontFamily: C.mono, letterSpacing: -1 }}>{result.level}</div>
                                                <div style={{ fontSize: 24, fontWeight: 700, color: rm.color, fontFamily: C.mono, marginTop: 2 }}>{result.probability}%</div>
                                                <div style={{ marginTop: 12, fontSize: 13, fontWeight: 600, color: result.prediction === "Yes" ? "#F09595" : "#4ade80" }}>
                                                    {result.prediction === "Yes" ? "⚠ Likely to Leave" : "✓ Likely to Stay"}
                                                </div>
                                            </div>

                                            {/* Factor breakdown */}
                                            <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 12, padding: 16, border: `1px solid ${C.border}`, marginBottom: 16 }}>
                                                <div style={{ fontSize: 10, fontWeight: 600, color: C.t3, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Risk Factor Breakdown</div>
                                                {[
                                                    { label: "Overtime", val: form.overTime || "—", hi: form.overTime === "Yes" },
                                                    { label: "Environment Satisfaction", val: form.environmentSatisfaction ? `${form.environmentSatisfaction}/4` : "—", hi: Number(form.environmentSatisfaction) <= 1 },
                                                    { label: "Distance", val: `${form.distanceFromHome || 0} km`, hi: Number(form.distanceFromHome) > 40 },
                                                    { label: "Travel", val: (form.businessTravel || "—").replace("Travel_", ""), hi: form.businessTravel === "Travel_Frequently" },
                                                    { label: "Salary", val: `₹${Number(form.salary || 0).toLocaleString()}`, hi: Number(form.salary) < 30000 },
                                                ].map(f => (
                                                    <div key={f.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: `1px solid ${C.border}` }}>
                                                        <span style={{ fontSize: 12, color: C.t2 }}>{f.label}</span>
                                                        <span style={{ fontSize: 12, fontWeight: 600, fontFamily: C.mono, color: f.hi ? "#F09595" : "#4ade80" }}>{f.val}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Save to Employee List button */}
                                            <button
                                                onClick={handleSaveToEmployeeList}
                                                disabled={saving || saveStatus === "saved"}
                                                style={{
                                                    width: "100%", padding: "12px 0", borderRadius: 11, border: "none",
                                                    background: saveStatus === "saved"
                                                        ? "rgba(74,222,128,0.15)"
                                                        : saveStatus === "error"
                                                            ? "rgba(240,149,149,0.15)"
                                                            : "linear-gradient(135deg,#059669,#0284c7)",
                                                    color: saveStatus === "saved" ? "#4ade80" : saveStatus === "error" ? "#F09595" : "white",
                                                    fontSize: 13, fontWeight: 700, cursor: saving || saveStatus === "saved" ? "not-allowed" : "pointer",
                                                    fontFamily: C.font,
                                                    border: `1px solid ${saveStatus === "saved" ? "rgba(74,222,128,0.3)" : saveStatus === "error" ? "rgba(240,149,149,0.3)" : "transparent"}`,
                                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                                }}
                                            >
                                                {saving ? (
                                                    <>
                                                        <span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
                                                        Saving to Database…
                                                    </>
                                                ) : saveStatus === "saved" ? "✅ Saved to Employee List"
                                                    : saveStatus === "error" ? "❌ Save Failed — Retry"
                                                        : "💾 Save to Employee List"}
                                            </button>

                                            {saveStatus === "error" && (
                                                <div style={{ marginTop: 10, fontSize: 11, color: "#F09595", textAlign: "center" }}>
                                                    Could not reach {API_BASE}. Check your Spring Boot server.
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
