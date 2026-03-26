import React from "react";

function EmployeeTable({ employees }) {
    return (
        <div className="table-container">
            <h3>Employee List</h3>

            <table width="100%" border="0">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Department</th>
                        <th>Income</th>
                        <th>Attrition</th>
                    </tr>
                </thead>

                <tbody>
                    {employees.map(emp => (
                        <tr key={emp.id}>
                            <td>{emp.id}</td>
                            <td>{emp.name}</td>
                            <td>{emp.department}</td>
                            <td>{emp.salary}</td>
                            <td>
                                <span style={{
                                    color: emp.attrition === "Yes" ? "red" : "green"
                                }}>
                                    {emp.attrition || "Not Predicted"}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default EmployeeTable;