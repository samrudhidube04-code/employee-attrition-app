import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./Reports.css";

export default function Reports() {
    const [employees, setEmployees] = useState([]);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const res = await axios.get("http://localhost:8080/api/employees");
            setEmployees(res.data);
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    };

    const generateReport = () => {
        const doc = new jsPDF("landscape");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        doc.setTextColor(106, 17, 203);
        doc.text("Employee Attrition Report", 14, 18);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(120, 120, 120);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 26);
        doc.text(`Total Employees: ${employees.length}`, 14, 32);

        const tableColumn = [
            "#", "Name", "Age", "Monthly Income", "Job Level",
            "Years At Company", "OverTime", "Marital Status",
            "Prediction", "Risk Level", "Probability"
        ];

        const tableRows = employees.map((emp, i) => [
            i + 1,
            emp.name || "—",
            emp.age || "—",
            emp.monthlyIncome ? `${emp.monthlyIncome.toLocaleString()}` : "—",
            emp.jobLevel || "—",
            emp.yearsAtCompany || "—",
            emp.overTime || "—",
            emp.maritalStatus || "—",
            emp.prediction === "Yes" ? "At Risk" : emp.prediction === "No" ? "Stable" : "—",
            emp.riskLevel || "—",
            emp.probability != null ? `${(emp.probability * 100).toFixed(1)}%` : "—",
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 38,
            theme: "grid",
            headStyles: {
                fillColor: [124, 58, 237],
                textColor: 255,
                fontStyle: "bold",
                fontSize: 9,
            },
            bodyStyles: {
                fontSize: 8.5,
                textColor: [40, 40, 40],
            },
            alternateRowStyles: {
                fillColor: [245, 243, 255],
            },
            columnStyles: {
                0: { halign: "center", cellWidth: 10 },
                2: { halign: "center" },
                4: { halign: "center" },
                5: { halign: "center" },
                6: { halign: "center" },
                8: { halign: "center" },
                9: { halign: "center" },
                10: { halign: "center" },
            },
            didDrawCell: (data) => {
                if (data.section === "body" && data.column.index === 8) {
                    const val = data.cell.raw;
                    if (val === "At Risk") {
                        doc.setTextColor(220, 53, 69);
                    } else if (val === "Stable") {
                        doc.setTextColor(40, 167, 69);
                    }
                }
            },
        });

        doc.save("Employee_Attrition_Report.pdf");
    };

    return (
        <div className="report-page">
            <div className="report-container">
                <h1>Employee Reports</h1>

                <div className="report-meta">
                    <span>Total Employees: <strong>{employees.length}</strong></span>
                    <span>At Risk: <strong style={{ color: "#f87171" }}>
                        {employees.filter(e => e.prediction === "Yes").length}
                    </strong></span>
                    <span>Stable: <strong style={{ color: "#4ade80" }}>
                        {employees.filter(e => e.prediction === "No").length}
                    </strong></span>
                </div>

                <button className="download-btn" onClick={generateReport}>
                    ⬇️ Download PDF Report
                </button>

                <div className="report-table-container">
                    <table className="report-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Age</th>
                                <th>Monthly Income</th>
                                <th>Job Level</th>
                                <th>Years At Company</th>
                                <th>OverTime</th>
                                <th>Marital Status</th>
                                <th>Prediction</th>
                                <th>Risk Level</th>
                                <th>Probability</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.length === 0 ? (
                                <tr>
                                    <td colSpan={11} style={{ textAlign: "center", padding: "30px", color: "rgba(255,255,255,0.3)" }}>
                                        No employees found.
                                    </td>
                                </tr>
                            ) : (
                                employees.map((emp, i) => (
                                    <tr key={emp.id}>
                                        <td>{i + 1}</td>
                                        <td>{emp.name || "—"}</td>
                                        <td>{emp.age || "—"}</td>
                                        <td>₹{emp.monthlyIncome?.toLocaleString() || "—"}</td>
                                        <td>{emp.jobLevel || "—"}</td>
                                        <td>{emp.yearsAtCompany || "—"}</td>
                                        <td>{emp.overTime || "—"}</td>
                                        <td>{emp.maritalStatus || "—"}</td>
                                        <td>
                                            <span className={emp.prediction === "Yes" ? "badge-risk" : "badge-stable"}>
                                                {emp.prediction === "Yes" ? "At Risk" : emp.prediction === "No" ? "Stable" : "—"}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={
                                                emp.riskLevel === "High" ? "badge-high" :
                                                    emp.riskLevel === "Medium" ? "badge-medium" :
                                                        emp.riskLevel === "Low" ? "badge-low" : ""
                                            }>
                                                {emp.riskLevel || "—"}
                                            </span>
                                        </td>
                                        <td>
                                            {emp.probability != null
                                                ? (emp.probability * 100).toFixed(1) + "%"
                                                : "—"}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

