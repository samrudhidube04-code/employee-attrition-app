import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:8080/api/employees";
const EmployeeContext = createContext(null);

// ── ML Prediction Logic ───────────────────────────────────────────────────────
export function mockPredict(data) {
    let score = 0;
    if (data.overTime === "Yes") score += 28;
    if (Number(data.jobSatisfaction) <= 2) score += 18;
    if (Number(data.workLifeBalance) <= 2) score += 15;
    if (Number(data.age) < 30) score += 8;
    if (Number(data.yearsAtCompany) <= 3) score += 10;
    if (Number(data.monthlyIncome) < 40000) score += 12;
    if (data.businessTravel === "Travel_Frequently") score += 10;
    if (data.maritalStatus === "Single") score += 7;
    if (Number(data.distanceFromHome) > 20) score += 6;
    if (Number(data.numCompaniesWorked) >= 4) score += 8;
    if (Number(data.environmentSatisfaction) <= 2) score += 10;
    if (Number(data.jobLevel) === 1) score += 8;

    const probability = Math.min(0.97, Math.max(0.03, score / 100));
    const prediction = probability > 0.45 ? "Yes" : "No";
    const riskLevel = probability > 0.65 ? "High" : probability > 0.38 ? "Medium" : "Low";
    return { prediction, probability, riskLevel };
}

// ── Derive Stats for Dashboard ────────────────────────────────────────────────
export function deriveStats(employees) {
    const total = employees.length;
    const atRisk = employees.filter(e => e.riskLevel === "High" || e.riskLevel === "Medium").length;
    const safe = employees.filter(e => e.riskLevel === "Low").length;
    const high = employees.filter(e => e.riskLevel === "High").length;
    const medium = employees.filter(e => e.riskLevel === "Medium").length;
    const low = employees.filter(e => e.riskLevel === "Low").length;
    const attritionRate = total > 0
        ? +((employees.filter(e => e.prediction === "Yes").length / total) * 100).toFixed(1)
        : 0;

    const depts = {};
    employees.forEach(e => {
        const d = (e.department || "Other").toLowerCase();
        if (!depts[d]) depts[d] = { total: 0, atRisk: 0 };
        depts[d].total++;
        if (e.prediction === "Yes") depts[d].atRisk++;
    });

    const DEPT_COLORS = {
        engineering: "#378ADD", sales: "#E24B4A",
        hr: "#1D9E75", operations: "#EF9F27", product: "#8B5CF6",
    };

    const deptAttrition = Object.entries(depts).map(([dept, v]) => ({
        dept: dept.charAt(0).toUpperCase() + dept.slice(1),
        rate: v.total > 0 ? +((v.atRisk / v.total) * 100).toFixed(1) : 0,
        count: v.atRisk,
        color: DEPT_COLORS[dept] || "#94D2BD",
    }));

    const avg = (field) => {
        const vals = employees.map(e => Number(e[field])).filter(v => v > 0);
        return vals.length
            ? +((vals.reduce((a, b) => a + b, 0) / vals.length) * 25).toFixed(1)
            : 0;
    };

    const satisfactionRadar = [
        { metric: "Job Role", score: avg("jobSatisfaction") },
        { metric: "Manager", score: avg("relationshipSatisfaction") },
        { metric: "Environment", score: avg("environmentSatisfaction") },
        { metric: "Work-Life", score: avg("workLifeBalance") },
        { metric: "Growth", score: avg("jobInvolvement") },
        { metric: "Compensation", score: avg("performanceRating") },
    ];

    return { total, atRisk, safe, high, medium, low, attritionRate, deptAttrition, satisfactionRadar };
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function EmployeeProvider({ children }) {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Load existing employees from backend once on mount
    useEffect(() => {
        axios.get(API)
            .then(res => {
                const list = Array.isArray(res.data) ? res.data : [];
                const enriched = list.map(emp => ({
                    ...emp,
                    ...(!emp.riskLevel ? mockPredict(emp) : {}),
                }));
                setEmployees(enriched);
            })
            .catch(() => {
                setEmployees([]); // start empty if backend is offline
            })
            .finally(() => {
                setLoading(false);
            });
    }, []); // runs once only

    // ── ADD one employee ────────────────────────────────────────────────────────
    // Immediately appends to list — no re-fetch, no reset
    const addEmployee = (formData) => {
        const pred = mockPredict(formData);
        const tempId = Date.now();                          // temporary local id
        const newRecord = { ...formData, id: tempId, ...pred };

        // Append instantly so user sees it right away
        setEmployees(prev => [...prev, newRecord]);

        // Save to backend in background
        axios.post(API, { ...formData, ...pred })
            .then(res => {
                const saved = {
                    ...res.data,
                    prediction: res.data.prediction ?? pred.prediction,
                    probability: res.data.probability ?? pred.probability,
                    riskLevel: res.data.riskLevel ?? pred.riskLevel,
                };
                // Replace temp record with real server record
                setEmployees(prev =>
                    prev.map(e => e.id === tempId ? saved : e)
                );
            })
            .catch(() => {
                // Backend failed — local record stays, nothing breaks
            });
    };

    // ── EDIT one employee ───────────────────────────────────────────────────────
    const updateEmployee = (id, formData) => {
        const pred = mockPredict(formData);
        const updated = { ...formData, id, ...pred };

        // Update instantly in list
        setEmployees(prev =>
            prev.map(e => String(e.id) === String(id) ? updated : e)
        );

        // Sync to backend in background
        axios.put(`${API}/${id}`, updated)
            .then(res => {
                const saved = {
                    ...res.data,
                    prediction: res.data.prediction ?? pred.prediction,
                    probability: res.data.probability ?? pred.probability,
                    riskLevel: res.data.riskLevel ?? pred.riskLevel,
                };
                setEmployees(prev =>
                    prev.map(e => String(e.id) === String(id) ? saved : e)
                );
            })
            .catch(() => { });
    };

    // ── DELETE one employee ─────────────────────────────────────────────────────
    const deleteEmployee = (id) => {
        // Remove instantly from list
        setEmployees(prev =>
            prev.filter(e => String(e.id) !== String(id))
        );

        // Delete from backend in background
        axios.delete(`${API}/${id}`).catch(() => { });
    };

    const stats = deriveStats(employees);

    return (
        <EmployeeContext.Provider value={{
            employees,
            loading,
            error,
            setError,
            stats,
            addEmployee,
            updateEmployee,
            deleteEmployee,
        }}>
            {children}
        </EmployeeContext.Provider>
    );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useEmployees() {
    const ctx = useContext(EmployeeContext);
    if (!ctx) throw new Error("useEmployees must be used inside <EmployeeProvider>");
    return ctx;
}