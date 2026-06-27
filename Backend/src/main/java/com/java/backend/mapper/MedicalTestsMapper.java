package com.java.backend.mapper;

import com.java.backend.dto.PatientMedicalDataDTO;
import com.java.backend.dto.PatientMedicalTestsViewDTO;
import com.java.backend.dto.PredictionResultDTO;
import com.java.backend.model.MedicalTest;
import com.java.backend.model.Patient;
import org.springframework.stereotype.Component;

@Component
public class MedicalTestsMapper {
    public PatientMedicalTestsViewDTO toDTO(MedicalTest medicalTest) {
        if (medicalTest == null) {
            return null;
        }

        PatientMedicalTestsViewDTO dto = new PatientMedicalTestsViewDTO();
        dto.setTestId(medicalTest.getId());
        dto.setPatientUserName(medicalTest.getPatient() != null ? medicalTest.getPatient().getUserName() : null);
        dto.setAge(medicalTest.getAge());
        dto.setSex(medicalTest.getSex());
        dto.setCp(medicalTest.getCp());
        dto.setTrestbps(medicalTest.getTrestbps());
        dto.setChol(medicalTest.getChol());
        dto.setFbs(medicalTest.getFbs());
        dto.setRestecg(medicalTest.getRestecg());
        dto.setThalch(medicalTest.getThalch());
        dto.setExang(medicalTest.getExang());
        dto.setOldpeak(medicalTest.getOldpeak());
        dto.setSlope(medicalTest.getSlope());
        dto.setCa(medicalTest.getCa());
        dto.setThal(medicalTest.getThal());
        dto.setDiagnosis(medicalTest.getDiagnosis());
        dto.setRiskProbability(medicalTest.getRiskProbability());
        dto.setRiskCategory(medicalTest.getRiskCategory());
        dto.setCreatedAt(medicalTest.getCreatedAt());

        return dto;
    }

    public MedicalTest toEntity(PredictionResultDTO predictionResultDTO, PatientMedicalDataDTO patientMedicalDataDTO, Patient patient) {
        if (predictionResultDTO == null || patientMedicalDataDTO == null) {
            return null;
        }

        MedicalTest medicalTest = new MedicalTest();
        
        // Map data from PatientMedicalDataDTO
        medicalTest.setAge(patientMedicalDataDTO.getAge());
        medicalTest.setSex(patientMedicalDataDTO.getSex());
        medicalTest.setCp(patientMedicalDataDTO.getCp());
        medicalTest.setTrestbps(patientMedicalDataDTO.getTrestbps());
        medicalTest.setChol(patientMedicalDataDTO.getChol());
        medicalTest.setFbs(patientMedicalDataDTO.getFbs());
        medicalTest.setRestecg(patientMedicalDataDTO.getRestecg());
        medicalTest.setThalch(patientMedicalDataDTO.getThalch());
        medicalTest.setExang(patientMedicalDataDTO.getExang());
        medicalTest.setOldpeak(patientMedicalDataDTO.getOldpeak());
        medicalTest.setSlope(patientMedicalDataDTO.getSlope());
        medicalTest.setCa(patientMedicalDataDTO.getCa());
        medicalTest.setThal(patientMedicalDataDTO.getThal());

        // Map data from PredictionResultDTO
        medicalTest.setDiagnosis(predictionResultDTO.getDiagnosis());
        String riskProbability = predictionResultDTO.getRiskProbability();
        medicalTest.setRiskProbability(Double.parseDouble(riskProbability.substring(0, riskProbability.length() - 2)));
        medicalTest.setRiskCategory(predictionResultDTO.getRiskCategory());
        medicalTest.setPatient(patient);

        return medicalTest;
    }
}
