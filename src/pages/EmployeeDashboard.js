import React, { useState } from "react";

import { surveyStore } from "./PredictAttrition";

// inside handleSubmit, after saving to localStorage:

const JOB_ROLES = [
    "Trainee Engineer", "Junior Software Engineer", "Senior Software Engineer", "Manager",
    "Sales Executive", "Research Scientist", "Healthcare Representative", "Human Resources"
];

const TRAVEL_OPTIONS = [
    { value: "Non-Travel", label: "Non-Travel" },
    { value: "Travel_Rarely", label: "Travel Rarely" },
    { value: "Travel_Frequently", label: "Travel Frequently" },
];

const initialForm = {
    name: "",
    age: "",
    salary: "",
    jobRole: "",
    overTime: "",
    businessTravel: "",
    distanceFromHome: "",
    yearsOfExperience: "",
    numCompaniesWorked: "",
    environmentSatisfaction: "",
};

export default function EmployeeDashboard({ employee, onLogout }) {
    const [form, setForm] = useState({ ...initialForm, name: employee.name || "" });
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handle = (e) => {
        setForm(f => ({ ...f, [e.target.name]: e.target.value }));
        setErrors(err => ({ ...err, [e.target.name]: "" }));
    };

    const validate = () => {
        const e = {};
        const required = ["name", "age", "salary", "jobRole", "overTime", "businessTravel",
            "distanceFromHome", "yearsOfExperience", "numCompaniesWorked", "environmentSatisfaction"];
        required.forEach(k => { if (!form[k]) e[k] = "Required"; });
        if (form.age && (Number(form.age) < 18 || Number(form.age) > 65)) e.age = "Must be 18–65";
        if (form.salary && Number(form.salary) < 0) e.salary = "Invalid salary";
        return e;
    };

    const handleSubmit = (e) => {

        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setLoading(true);

        setTimeout(() => {
            // Save to localStorage so HR dashboard can read it
            const existing = JSON.parse(localStorage.getItem("emp_survey_responses") || "[]");

            const entry = {
                ...form,
                email: employee.email,
                department: employee.department,
                submittedAt: new Date().toISOString(),

            }; surveyStore.push({ ...entry, email: employee.email });

            // Replace previous entry from same email or append
            const idx = existing.findIndex(r => r.email === employee.email);
            if (idx >= 0) existing[idx] = entry;
            else existing.push(entry);
            localStorage.setItem("emp_survey_responses", JSON.stringify(existing));

            setLoading(false);
            setSubmitted(true);
        }, 900);
    };

    // ── Success Screen ──────────────────────────────────────────────────────
    if (submitted) {
        return (
            <div style={s.page}>
                <TopBar employee={employee} onLogout={onLogout} />
                <div style={s.successWrap}>
                    <div style={s.successCard}>
                        <div style={s.successIcon}>✅</div>
                        <h2 style={s.successTitle}>Submitted Successfully!</h2>
                        <p style={s.successMsg}>
                            Thank you, <strong>{form.name}</strong>. Your information has been saved
                            and is now visible to the HR team.
                        </p>
                        <button style={s.resubmitBtn} onClick={() => { setSubmitted(false); setForm({ ...initialForm, name: employee.name || "" }); }}>
                            Submit Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ── Form ────────────────────────────────────────────────────────────────
    return (
        <div style={s.page}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.2) !important; }
                select option { background: #1a1f35; color: white; }
                ::-webkit-scrollbar { width: 5px; }
                ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
                .emp-field input:focus, .emp-field select:focus { border-color: rgba(167,139,250,0.5) !important; background: rgba(167,139,250,0.07) !important; outline: none; }
                .scale-opt:hover { border-color: rgba(167,139,250,0.5) !important; background: rgba(167,139,250,0.08) !important; cursor: pointer; }
                .scale-opt.sel { border-color: #a78bfa !important; background: rgba(167,139,250,0.15) !important; color: #a78bfa !important; }
                .yn-opt:hover { border-color: rgba(167,139,250,0.5) !important; cursor: pointer; }
                .yn-opt.sel-yes { border-color: #4ade80 !important; background: rgba(74,222,128,0.1) !important; color: #4ade80 !important; }
                .yn-opt.sel-no  { border-color: #f87171 !important; background: rgba(248,113,113,0.1) !important; color: #f87171 !important; }
            `}</style>

            <TopBar employee={employee} onLogout={onLogout} />

            <div style={s.content}>
                <div style={s.headerBlock}>
                    <h1 style={s.pageTitle}>Employee Information Form</h1>
                    <p style={s.pageSub}>Fill in your details below. This data is shared with HR to support attrition analysis.</p>
                </div>

                <form onSubmit={handleSubmit} style={s.card}>

                    {/* ── Section: Personal Info ── */}
                    <SectionLabel>👤 Personal Information</SectionLabel>
                    <div style={s.grid2}>
                        <Field label="Full Name" error={errors.name}>
                            <input name="name" value={form.name} onChange={handle} placeholder="e.g. Aarav Shah" style={inp(errors.name)} />
                        </Field>
                        <Field label="Age" error={errors.age}>
                            <input name="age" type="number" min={18} max={65} value={form.age} onChange={handle} placeholder="e.g. 28" style={inp(errors.age)} />
                        </Field>
                    </div>

                    {/* ── Section: Job Details ── */}
                    <SectionLabel>💼 Job Details</SectionLabel>
                    <div style={s.grid2}>
                        <Field label="Job Role" error={errors.jobRole}>
                            <select name="jobRole" value={form.jobRole} onChange={handle} style={inp(errors.jobRole)}>
                                <option value="">Select role…</option>
                                {JOB_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </Field>
                        <Field label="Monthly Salary (₹)" error={errors.salary}>
                            <input name="salary" type="number" min={0} value={form.salary} onChange={handle} placeholder="e.g. 65000" style={inp(errors.salary)} />
                        </Field>
                        <Field label="Years of Experience" error={errors.yearsOfExperience}>
                            <input name="yearsOfExperience" type="number" min={0} max={50} value={form.yearsOfExperience} onChange={handle} placeholder="e.g. 4" style={inp(errors.yearsOfExperience)} />
                        </Field>
                        <Field label="Previous Companies Worked" error={errors.numCompaniesWorked}>
                            <input name="numCompaniesWorked" type="number" min={0} max={20} value={form.numCompaniesWorked} onChange={handle} placeholder="e.g. 2" style={inp(errors.numCompaniesWorked)} />
                        </Field>
                    </div>

                    {/* ── Section: Work Conditions ── */}
                    <SectionLabel>🏢 Work Conditions</SectionLabel>
                    <div style={s.grid2}>
                        <Field label="Distance From Home (km)" error={errors.distanceFromHome}>
                            <input name="distanceFromHome" type="number" min={0} value={form.distanceFromHome} onChange={handle} placeholder="e.g. 12" style={inp(errors.distanceFromHome)} />
                        </Field>
                        <Field label="Business Travel" error={errors.businessTravel}>
                            <select name="businessTravel" value={form.businessTravel} onChange={handle} style={inp(errors.businessTravel)}>
                                <option value="">Select…</option>
                                {TRAVEL_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                        </Field>
                    </div>

                    {/* ── Works Overtime ── */}
                    <Field label="Do you work overtime?" error={errors.overTime} style={{ marginBottom: 20 }}>
                        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                            {["Yes", "No"].map(opt => (
                                <button
                                    key={opt} type="button"
                                    className={`yn-opt ${form.overTime === opt ? (opt === "Yes" ? "sel-yes" : "sel-no") : ""}`}
                                    onClick={() => { setForm(f => ({ ...f, overTime: opt })); setErrors(err => ({ ...err, overTime: "" })); }}
                                    style={{ ...s.ynBtn, ...(form.overTime === opt && opt === "Yes" ? { borderColor: "#4ade80", background: "rgba(74,222,128,0.1)", color: "#4ade80" } : form.overTime === opt && opt === "No" ? { borderColor: "#f87171", background: "rgba(248,113,113,0.1)", color: "#f87171" } : {}) }}
                                >
                                    {opt === "Yes" ? "✓ Yes" : "✗ No"}
                                </button>
                            ))}
                        </div>
                    </Field>

                    {/* ── Environment Satisfaction ── */}
                    <Field label="Environment Satisfaction" error={errors.environmentSatisfaction}>
                        <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                            {[["1", "😞 Low"], ["2", "😐 Medium"], ["3", "🙂 High"], ["4", "😄 Very High"]].map(([val, lbl]) => (
                                <button
                                    key={val} type="button"
                                    className={`scale-opt ${form.environmentSatisfaction === val ? "sel" : ""}`}
                                    onClick={() => { setForm(f => ({ ...f, environmentSatisfaction: val })); setErrors(err => ({ ...err, environmentSatisfaction: "" })); }}
                                    style={{ ...s.scaleBtn, ...(form.environmentSatisfaction === val ? { borderColor: "#a78bfa", background: "rgba(167,139,250,0.15)", color: "#a78bfa" } : {}) }}
                                >
                                    {lbl}
                                </button>
                            ))}
                        </div>
                    </Field>

                    {/* Submit */}
                    <button type="submit" disabled={loading} style={{ ...s.submitBtn, ...(loading ? { opacity: 0.6 } : {}) }}>
                        {loading ? "⟳  Saving..." : "Submit Information →"}
                    </button>
                </form>
            </div>
        </div>
    );
}

// ── Sub-components ──────────────────────────────────────────────────────────
function TopBar({ employee, onLogout }) {
    return (
        <div style={s.topbar}>
            <div style={s.brand}>🧠 <span style={{ color: "#a78bfa" }}>Employee</span> Portal</div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>👤 {employee.name}</span>
                {employee.department && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "rgba(167,139,250,0.1)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.2)" }}>{employee.department}</span>}
                <button onClick={onLogout} style={s.logoutBtn}>Logout</button>
            </div>
        </div>
    );
}

function SectionLabel({ children }) {
    return <p style={s.sectionLabel}>{children}</p>;
}

function Field({ label, error, children, style }) {
    return (
        <div className="emp-field" style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 4, ...style }}>
            <label style={s.label}>{label}</label>
            {children}
            {error && <span style={s.errMsg}>⚠ {error}</span>}
        </div>
    );
}

// input style helper
const inp = (err) => ({
    padding: "10px 12px",
    borderRadius: 10,
    border: `1px solid ${err ? "rgba(248,113,113,0.5)" : "rgba(255,255,255,0.1)"}`,
    background: err ? "rgba(248,113,113,0.05)" : "rgba(255,255,255,0.05)",
    color: "white",
    fontSize: 13,
    fontFamily: "'Outfit',sans-serif",
    width: "100%",
    transition: "border-color 0.2s, background 0.2s",
    appearance: "none",
    WebkitAppearance: "none",
});

// ── Styles ──────────────────────────────────────────────────────────────────
const s = {
    page: { minHeight: "100vh", background: "linear-gradient(160deg,#0f0c29 0%,#1a1a2e 60%,#16213e 100%)", fontFamily: "'Outfit',sans-serif", color: "white" },
    topbar: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 28px", borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 100 },
    brand: { fontSize: 18, fontWeight: 700, color: "white" },
    logoutBtn: { padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit',sans-serif" },
    content: { maxWidth: 680, margin: "0 auto", padding: "36px 20px 60px" },
    headerBlock: { marginBottom: 28 },
    pageTitle: { fontSize: 26, fontWeight: 700, background: "linear-gradient(90deg,#e2e8f0,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
    pageSub: { fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 6 },
    card: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "28px 28px 32px", backdropFilter: "blur(16px)", display: "flex", flexDirection: "column", gap: 8 },
    sectionLabel: { fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.8px", margin: "12px 0 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 8 },
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 4 },
    label: { fontSize: 11, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.6px", fontWeight: 500 },
    errMsg: { fontSize: 11, color: "#f87171" },
    ynBtn: { flex: 1, padding: "10px 0", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit',sans-serif", transition: "all 0.15s" },
    scaleBtn: { padding: "8px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "'Outfit',sans-serif", transition: "all 0.15s", whiteSpace: "nowrap" },
    submitBtn: { marginTop: 20, padding: "14px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#7c3aed,#db2777)", color: "white", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit',sans-serif", boxShadow: "0 4px 20px rgba(124,58,237,0.4)", transition: "opacity 0.2s" },
    successWrap: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh", padding: 20 },
    successCard: { textAlign: "center", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "48px 40px", maxWidth: 420 },
    successIcon: { fontSize: 52, marginBottom: 16 },
    successTitle: { fontSize: 22, fontWeight: 700, color: "white", marginBottom: 12 },
    successMsg: { fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: 24 },
    resubmitBtn: { padding: "10px 28px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#7c3aed,#2563eb)", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit',sans-serif" },
};