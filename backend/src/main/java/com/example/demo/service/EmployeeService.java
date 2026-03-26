package com.example.demo.service;

import com.example.demo.entity.Employee;
import com.example.demo.repository.EmployeeRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final PredictionService  predictionService;

    public EmployeeService(EmployeeRepository employeeRepository,
                           PredictionService predictionService) {
        this.employeeRepository = employeeRepository;
        this.predictionService  = predictionService;
    }

    // ── Save + auto predict ────────────────────────────────────────
    public Employee saveEmployee(Employee emp) {
        emp = predictionService.getPrediction(emp);  // call Flask first
        return employeeRepository.save(emp);          // then save to MySQL
    }

    // ── Get all ────────────────────────────────────────────────────
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    // ── Get by ID ──────────────────────────────────────────────────
    public Optional<Employee> getEmployeeById(Long id) {
        return employeeRepository.findById(id);
    }

    // ── Update + re-predict ────────────────────────────────────────
    public Employee updateEmployee(Long id, Employee updatedEmp) {
        return employeeRepository.findById(id).map(existing -> {
            updatedEmp.setId(id);
            Employee withPrediction = predictionService.getPrediction(updatedEmp);
            return employeeRepository.save(withPrediction);
        }).orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));
    }

    // ── Delete ─────────────────────────────────────────────────────
    public void deleteEmployee(Long id) {
        if (!employeeRepository.existsById(id)) {
            throw new RuntimeException("Employee not found with id: " + id);
        }
        employeeRepository.deleteById(id);
    }

    // ── Filters ────────────────────────────────────────────────────
    public List<Employee> getAtRiskEmployees() {
        return employeeRepository.findByPrediction("Yes");
    }

    public List<Employee> getByRiskLevel(String riskLevel) {
        return employeeRepository.findByRiskLevel(riskLevel);
    }

    public List<Employee> getByDepartment(String department) {
        return employeeRepository.findByDepartment(department);
    }

    public long countAtRisk() {
        return employeeRepository.countAtRiskEmployees();
    }
}