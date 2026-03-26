package com.example.demo.repository;

import com.example.demo.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    List<Employee> findByPrediction(String prediction);

    List<Employee> findByRiskLevel(String riskLevel);

    List<Employee> findByDepartment(String department);

    @Query("SELECT COUNT(e) FROM Employee e WHERE e.prediction = 'Yes'")
    long countAtRiskEmployees();
}