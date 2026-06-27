package com.java.backend.service;

import com.java.backend.exception.UserNotFoundException;
import com.java.backend.model.MedicalTest;
import com.java.backend.model.Patient;
import com.java.backend.repository.MedicalTestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MedicalTestService {

    private final MedicalTestRepository medicalTestRepository;

    public MedicalTestService(MedicalTestRepository medicalTestRepository) {
        this.medicalTestRepository = medicalTestRepository;
    }
@Transactional(readOnly = true)
    public Patient getPatientOfMedicalTest(Long testId) {
        return medicalTestRepository.findById(testId)
                .map(MedicalTest::getPatient)
                .filter(patient -> patient != null)
                .orElseThrow(() -> new UserNotFoundException("MedicalTest or associated User not found for testId: " + testId));
    }

    @Transactional
    public void deleteById(Long id) {
        medicalTestRepository.deleteById(id);
    }
}
