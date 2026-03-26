package com.example.demo.service;

import com.example.demo.entity.Employee;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class PredictionService {

    // ✅ Single shared instance — not created per call
    private final RestTemplate restTemplate = new RestTemplate();

    private static final String FLASK_URL = "http://127.0.0.1:5000/predict";

    /**
     * Sends employee data to Flask API and writes prediction result
     * back into the Employee object before it is saved to MySQL.
     */
    public Employee getPrediction(Employee emp) {

        // Field names in PascalCase to match train_columns.pkl from Python
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("Age",                     emp.getAge());
        requestBody.put("BusinessTravel",           emp.getBusinessTravel());
        requestBody.put("DailyRate",                emp.getDailyRate());
        requestBody.put("Department",               emp.getDepartment());
        requestBody.put("DistanceFromHome",         emp.getDistanceFromHome());
        requestBody.put("Education",                emp.getEducation());
        requestBody.put("EducationField",           emp.getEducationField());
        requestBody.put("EnvironmentSatisfaction",  emp.getEnvironmentSatisfaction());
        requestBody.put("Gender",                   emp.getGender());
        requestBody.put("HourlyRate",               emp.getHourlyRate());
        requestBody.put("JobInvolvement",           emp.getJobInvolvement());
        requestBody.put("JobLevel",                 emp.getJobLevel());
        requestBody.put("JobRole",                  emp.getJobRole());
        requestBody.put("JobSatisfaction",          emp.getJobSatisfaction());
        requestBody.put("MaritalStatus",            emp.getMaritalStatus());
        requestBody.put("MonthlyIncome",            emp.getMonthlyIncome());
        requestBody.put("MonthlyRate",              emp.getMonthlyRate());
        requestBody.put("NumCompaniesWorked",       emp.getNumCompaniesWorked());
        requestBody.put("OverTime",                 emp.getOverTime());
        requestBody.put("PercentSalaryHike",        emp.getPercentSalaryHike());
        requestBody.put("PerformanceRating",        emp.getPerformanceRating());
        requestBody.put("RelationshipSatisfaction", emp.getRelationshipSatisfaction());
        requestBody.put("StockOptionLevel",         emp.getStockOptionLevel());
        requestBody.put("TotalWorkingYears",        emp.getTotalWorkingYears());
        requestBody.put("TrainingTimesLastYear",    emp.getTrainingTimesLastYear());
        requestBody.put("WorkLifeBalance",          emp.getWorkLifeBalance());
        requestBody.put("YearsAtCompany",           emp.getYearsAtCompany());
        requestBody.put("YearsInCurrentRole",       emp.getYearsInCurrentRole());
        requestBody.put("YearsSinceLastPromotion",  emp.getYearsSinceLastPromotion());
        requestBody.put("YearsWithCurrManager",     emp.getYearsWithCurrManager());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(FLASK_URL, entity, Map.class);
            Map body = response.getBody();

            if (body != null && body.get("prediction") != null) {
                emp.setPrediction(body.get("prediction").toString());  // "Yes" or "No"
                emp.setRiskLevel(body.getOrDefault("riskLevel", "Unknown").toString());
                Object prob = body.get("probability");
                if (prob != null) {
                    emp.setProbability(Double.parseDouble(prob.toString()));
                }
            } else {
                emp.setPrediction("Unavailable");
                emp.setRiskLevel("Unknown");
            }

        } catch (Exception e) {
            e.printStackTrace();
            emp.setPrediction("Error");
            emp.setRiskLevel("Unknown");
            emp.setProbability(0.0);
        }

        return emp;
    }
}