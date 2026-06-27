package com.java.backend.dto;

import lombok.Data;

import java.time.LocalDateTime;
@Data
public class PatientMedicalTestsViewDTO {

    private String patientUserName;

    private Long testId;

    private Integer age;

    private Integer sex; // 1 = male; 0 = female

    private Integer cp; // chest pain type

    private Integer trestbps; // resting blood pressure

    private Integer chol; // serum cholestoral in mg/dl

    private Integer fbs; // fasting blood sugar > 120 mg/dl

    private Integer restecg; // resting electrocardiographic results

    private Integer thalch; // maximum heart rate achieved

    private Integer exang; // exercise induced angina

    private Double oldpeak; // ST depression induced by exercise relative to rest

    private Integer slope; // the slope of the peak exercise ST segment

    private Integer ca; // number of major vessels colored by flourosopy

    private Integer thal;

    private String diagnosis;

    private Double riskProbability;

    private String riskCategory;

    private LocalDateTime createdAt;

}
