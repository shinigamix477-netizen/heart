package com.java.backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class PatientMedicalDataDTO {

    @NotNull(message = "Age is required")
    @Min(value = 1, message = "Age must be greater than 0")
    @Max(value = 120, message = "Age must be less than 120")
    private Integer age;

    @NotNull(message = "Sex is required")
    @Min(0) @Max(1)
    private Integer sex; // 1 = male; 0 = female

    @NotNull(message = "Chest pain type (cp) is required")
    @Min(0) @Max(3)
    private Integer cp; // chest pain type

    @NotNull(message = "Resting blood pressure (trestbps) is required")
    @Min(50) @Max(300)
    private Integer trestbps; // resting blood pressure

    @NotNull(message = "Serum cholestoral (chol) is required")
    @Min(50) @Max(600)
    private Integer chol; // serum cholestoral in mg/dl

    @NotNull(message = "Fasting blood sugar (fbs) is required")
    @Min(0) @Max(1)
    private Integer fbs; // fasting blood sugar > 120 mg/dl

    @NotNull(message = "Resting ECG results (restecg) is required")
    @Min(0) @Max(2)
    private Integer restecg; // resting electrocardiographic results

    @NotNull(message = "Maximum heart rate (thalach) is required")
    @Min(50) @Max(250)
    private Integer thalch; // maximum heart rate achieved

    @NotNull(message = "Exercise induced angina (exang) is required")
    @Min(0) @Max(1)
    private Integer exang; // exercise induced angina

    @NotNull(message = "Oldpeak is required")
    @DecimalMin("0.0")
    private Double oldpeak; // ST depression induced by exercise relative to rest

    @NotNull(message = "Slope is required")
    @Min(0) @Max(2)
    private Integer slope; // the slope of the peak exercise ST segment

    @NotNull(message = "Number of major vessels (ca) is required")
    @Min(0) @Max(4)
    private Integer ca; // number of major vessels colored by flourosopy

    @NotNull(message = "Thal is required")
    @Min(1) @Max(7)
    private Integer thal; // 3 = normal; 6 = fixed defect; 7 = reversable defect
}
