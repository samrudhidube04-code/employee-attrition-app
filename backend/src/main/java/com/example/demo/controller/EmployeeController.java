package com.example.demo.controller;

import com.example.demo.entity.Employee;
import com.example.demo.service.EmployeeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = "http://localhost:3000")  // React frontend
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    // ── POST /api/employees ────────────────────────────────────────
    // Add new employee → auto-predicts → saves to DB
    @PostMapping
    public ResponseEntity<Employee> addEmployee(@RequestBody Employee emp) {
        Employee saved = employeeService.saveEmployee(emp);
        return ResponseEntity.ok(saved);
    }

    // ── GET /api/employees ─────────────────────────────────────────
    // Get all employees
    @GetMapping
    public ResponseEntity<List<Employee>> getAllEmployees() {
        return ResponseEntity.ok(employeeService.getAllEmployees());
    }

    // ── GET /api/employees/{id} ────────────────────────────────────
    // Get single employee by ID
    @GetMapping("/{id}")
    public ResponseEntity<Employee> getEmployeeById(@PathVariable Long id) {
        return employeeService.getEmployeeById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ── PUT /api/employees/{id} ────────────────────────────────────
    // Update employee → re-predicts → saves
    @PutMapping("/{id}")
    public ResponseEntity<Employee> updateEmployee(@PathVariable Long id,
                                                    @RequestBody Employee emp) {
        try {
            return ResponseEntity.ok(employeeService.updateEmployee(id, emp));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ── DELETE /api/employees/{id} ─────────────────────────────────
    // Delete employee
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id) {
        try {
            employeeService.deleteEmployee(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ── GET /api/employees/at-risk ─────────────────────────────────
    // All employees predicted to leave
    @GetMapping("/at-risk")
    public ResponseEntity<List<Employee>> getAtRiskEmployees() {
        return ResponseEntity.ok(employeeService.getAtRiskEmployees());
    }

    // ── GET /api/employees/risk-level/{level} ──────────────────────
    // Filter by High / Medium / Low
    @GetMapping("/risk-level/{level}")
    public ResponseEntity<List<Employee>> getByRiskLevel(@PathVariable String level) {
        return ResponseEntity.ok(employeeService.getByRiskLevel(level));
    }

    // ── GET /api/employees/department/{name} ───────────────────────
    // Filter by department
    @GetMapping("/department/{name}")
    public ResponseEntity<List<Employee>> getByDepartment(@PathVariable String name) {
        return ResponseEntity.ok(employeeService.getByDepartment(name));
    }

    // ── GET /api/employees/stats ───────────────────────────────────
    // Summary: total, at-risk count, attrition rate
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        long total  = employeeService.getAllEmployees().size();
        long atRisk = employeeService.countAtRisk();
        double rate = total > 0 ? (double) atRisk / total * 100 : 0;

        return ResponseEntity.ok(Map.of(
                "totalEmployees",   total,
                "atRiskCount",      atRisk,
                "atRiskPercentage", String.format("%.1f%%", rate)
        ));
    }
}