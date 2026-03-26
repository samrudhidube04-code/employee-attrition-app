package com.example.demo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "employees")
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    // ── Numeric fields ─────────────────────────────────────────────
    private Integer age;
    private Integer dailyRate;
    private Integer distanceFromHome;
    private Integer education;
    private Integer environmentSatisfaction;
    private Integer hourlyRate;
    private Integer jobInvolvement;
    private Integer jobLevel;
    private Integer jobSatisfaction;
    private Double  monthlyIncome;
    private Integer monthlyRate;
    private Integer numCompaniesWorked;
    private Integer percentSalaryHike;
    private Integer performanceRating;
    private Integer relationshipSatisfaction;
    private Integer stockOptionLevel;
    private Integer totalWorkingYears;
    private Integer trainingTimesLastYear;
    private Integer workLifeBalance;
    private Integer yearsAtCompany;
    private Integer yearsInCurrentRole;
    private Integer yearsSinceLastPromotion;
    private Integer yearsWithCurrManager;

    // ── FIXED: maps to years_of_experience column in DB ───────────
    @Column(name = "years_of_experience")
    private Integer yearsOfExperience;

    // ── String fields ──────────────────────────────────────────────
    private String businessTravel;
    private String department;
    private String educationField;
    private String gender;
    private String jobRole;
    private String maritalStatus;
    private String attrition;

    // overTime stored as "Yes"/"No" in DB — must be String
    @Column(name = "over_time")
    private String overTime;

    // ── Prediction result fields (written by PredictionService) ────
    private String  prediction;
    private String  riskLevel;
    private Double  probability;

    // ── Getters and Setters ────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public Integer getDailyRate() { return dailyRate; }
    public void setDailyRate(Integer dailyRate) { this.dailyRate = dailyRate; }

    public Integer getDistanceFromHome() { return distanceFromHome; }
    public void setDistanceFromHome(Integer distanceFromHome) { this.distanceFromHome = distanceFromHome; }

    public Integer getEducation() { return education; }
    public void setEducation(Integer education) { this.education = education; }

    public Integer getEnvironmentSatisfaction() { return environmentSatisfaction; }
    public void setEnvironmentSatisfaction(Integer environmentSatisfaction) { this.environmentSatisfaction = environmentSatisfaction; }

    public Integer getHourlyRate() { return hourlyRate; }
    public void setHourlyRate(Integer hourlyRate) { this.hourlyRate = hourlyRate; }

    public Integer getJobInvolvement() { return jobInvolvement; }
    public void setJobInvolvement(Integer jobInvolvement) { this.jobInvolvement = jobInvolvement; }

    public Integer getJobLevel() { return jobLevel; }
    public void setJobLevel(Integer jobLevel) { this.jobLevel = jobLevel; }

    public Integer getJobSatisfaction() { return jobSatisfaction; }
    public void setJobSatisfaction(Integer jobSatisfaction) { this.jobSatisfaction = jobSatisfaction; }

    public Double getMonthlyIncome() { return monthlyIncome; }
    public void setMonthlyIncome(Double monthlyIncome) { this.monthlyIncome = monthlyIncome; }

    public Integer getMonthlyRate() { return monthlyRate; }
    public void setMonthlyRate(Integer monthlyRate) { this.monthlyRate = monthlyRate; }

    public Integer getNumCompaniesWorked() { return numCompaniesWorked; }
    public void setNumCompaniesWorked(Integer numCompaniesWorked) { this.numCompaniesWorked = numCompaniesWorked; }

    public Integer getPercentSalaryHike() { return percentSalaryHike; }
    public void setPercentSalaryHike(Integer percentSalaryHike) { this.percentSalaryHike = percentSalaryHike; }

    public Integer getPerformanceRating() { return performanceRating; }
    public void setPerformanceRating(Integer performanceRating) { this.performanceRating = performanceRating; }

    public Integer getRelationshipSatisfaction() { return relationshipSatisfaction; }
    public void setRelationshipSatisfaction(Integer relationshipSatisfaction) { this.relationshipSatisfaction = relationshipSatisfaction; }

    public Integer getStockOptionLevel() { return stockOptionLevel; }
    public void setStockOptionLevel(Integer stockOptionLevel) { this.stockOptionLevel = stockOptionLevel; }

    public Integer getTotalWorkingYears() { return totalWorkingYears; }
    public void setTotalWorkingYears(Integer totalWorkingYears) { this.totalWorkingYears = totalWorkingYears; }

    public Integer getTrainingTimesLastYear() { return trainingTimesLastYear; }
    public void setTrainingTimesLastYear(Integer trainingTimesLastYear) { this.trainingTimesLastYear = trainingTimesLastYear; }

    public Integer getWorkLifeBalance() { return workLifeBalance; }
    public void setWorkLifeBalance(Integer workLifeBalance) { this.workLifeBalance = workLifeBalance; }

    public Integer getYearsAtCompany() { return yearsAtCompany; }
    public void setYearsAtCompany(Integer yearsAtCompany) { this.yearsAtCompany = yearsAtCompany; }

    public Integer getYearsInCurrentRole() { return yearsInCurrentRole; }
    public void setYearsInCurrentRole(Integer yearsInCurrentRole) { this.yearsInCurrentRole = yearsInCurrentRole; }

    public Integer getYearsSinceLastPromotion() { return yearsSinceLastPromotion; }
    public void setYearsSinceLastPromotion(Integer yearsSinceLastPromotion) { this.yearsSinceLastPromotion = yearsSinceLastPromotion; }

    public Integer getYearsWithCurrManager() { return yearsWithCurrManager; }
    public void setYearsWithCurrManager(Integer yearsWithCurrManager) { this.yearsWithCurrManager = yearsWithCurrManager; }

    // ── yearsOfExperience getter/setter ───────────────────────────
    public Integer getYearsOfExperience() { return yearsOfExperience; }
    public void setYearsOfExperience(Integer yearsOfExperience) { this.yearsOfExperience = yearsOfExperience; }

    public String getBusinessTravel() { return businessTravel; }
    public void setBusinessTravel(String businessTravel) { this.businessTravel = businessTravel; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getEducationField() { return educationField; }
    public void setEducationField(String educationField) { this.educationField = educationField; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getJobRole() { return jobRole; }
    public void setJobRole(String jobRole) { this.jobRole = jobRole; }

    public String getMaritalStatus() { return maritalStatus; }
    public void setMaritalStatus(String maritalStatus) { this.maritalStatus = maritalStatus; }

    public String getAttrition() { return attrition; }
    public void setAttrition(String attrition) { this.attrition = attrition; }

    public String getOverTime() { return overTime; }
    public void setOverTime(String overTime) { this.overTime = overTime; }

    public String getPrediction() { return prediction; }
    public void setPrediction(String prediction) { this.prediction = prediction; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public Double getProbability() { return probability; }
    public void setProbability(Double probability) { this.probability = probability; }
}