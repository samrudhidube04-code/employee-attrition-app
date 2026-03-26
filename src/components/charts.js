import React from "react";
import {
    PieChart, Pie, Cell,
    BarChart, Bar,
    XAxis, YAxis,
    Tooltip, ResponsiveContainer
} from "recharts";

const COLORS = ["#ef4444", "#22c55e", "#3b82f6", "#facc15"];

function Charts({ departmentData, jobLevelData }) {

    return (
        <div style={{ display: "flex", gap: "30px", marginTop: "40px" }}>

            {/* Pie Chart */}
            <div style={{ flex: 1, background: "white", padding: "20px", borderRadius: "10px" }}>
                <h3>Attrition by Department</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={departmentData}
                            dataKey="value"
                            nameKey="name"
                            outerRadius={100}
                            label
                        >
                            {departmentData.map((entry, index) => (
                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Bar Chart */}
            <div style={{ flex: 1, background: "white", padding: "20px", borderRadius: "10px" }}>
                <h3>Attrition by Job Level</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={jobLevelData}>
                        <XAxis dataKey="level" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

        </div>
    );
}

export default Charts;