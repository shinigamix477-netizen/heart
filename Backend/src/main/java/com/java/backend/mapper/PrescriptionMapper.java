package com.java.backend.mapper;

import com.java.backend.dto.PrescriptionDTO;
import com.java.backend.model.Prescription;
import com.java.backend.repository.DoctorRepository;
import com.java.backend.repository.PatientRepository;
import org.springframework.stereotype.Component;

@Component
public class PrescriptionMapper {

    private final PatientRepository patientRepository;
    private  final DoctorRepository doctorRepository;

    public PrescriptionMapper(PatientRepository patientRepository, DoctorRepository doctorRepository){
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
    }
    public PrescriptionDTO toDTO(Prescription prescription) {
        if (prescription == null) {
            return null;
        }

        PrescriptionDTO dto = new PrescriptionDTO();
        
        if (prescription.getPatient() != null) {
//            dto.setPatientId(prescription.getPatient().getId());
            dto.setPatientName(prescription.getPatient().getName());
        }

        if (prescription.getDoctor() != null) {
//            dto.setDoctorId(prescription.getDoctor().getId());
            dto.setDoctorName(prescription.getDoctor().getName());
        }

        dto.setPrescriptionDate(prescription.getPrescriptionDate());
        dto.setContent(prescription.getContent());

        return dto;
    }

    public Prescription toEntity(PrescriptionDTO dto) {
        if (dto == null) {
            return null;
        }

        Prescription prescription = new Prescription();
        prescription.setPatient(patientRepository.findByName(dto.getPatientName()).orElseThrow(
                () -> new RuntimeException("Patient not found")
        ));
        prescription.setDoctor(doctorRepository.findByName(dto.getDoctorName()).orElseThrow(
                () -> new RuntimeException("Doctor not found")
        ));
        prescription.setPrescriptionDate(dto.getPrescriptionDate());
        prescription.setContent(dto.getContent());
        prescription.setPrescriptionDate(dto.getPrescriptionDate());
        return prescription;
    }
}