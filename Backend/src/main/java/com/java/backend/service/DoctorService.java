package com.java.backend.service;

import com.java.backend.dto.*;
import com.java.backend.exception.UserNotFoundException;
import com.java.backend.mapper.*;
import com.java.backend.model.*;
import com.java.backend.repository.DoctorRepository;
import com.java.backend.repository.PatientRepository;
import com.java.backend.repository.PrescriptionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final DoctorMapper doctorMapper;
    private final PatientMapper patientMapper;
    private final PrescriptionMapper prescriptionMapper;
    private PrescriptionRepository prescriptionRepository;
    private AppointmentMapper appointmentMapper;
    private MedicalTestsMapper medicalTestsMapper;

    public DoctorService(DoctorRepository doctorRepository,MedicalTestsMapper medicalTestsMapper, AppointmentMapper appointmentMapper, PrescriptionRepository prescriptionRepository, PatientRepository patientRepository, DoctorMapper doctorMapper, PatientMapper patientMapper, PrescriptionMapper prescriptionMapper) {
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.doctorMapper = doctorMapper;
        this.patientMapper = patientMapper;
        this.prescriptionMapper = prescriptionMapper;
        this.prescriptionRepository = prescriptionRepository;
        this.appointmentMapper = appointmentMapper;
        this.medicalTestsMapper = medicalTestsMapper;
    }

    public List<DoctorListItemDTO> getAllDoctors() {
        List<Doctor> doctors = doctorRepository.findAll();
        List<DoctorListItemDTO> doctorDTOsList = new ArrayList<>();
        for (Doctor doctor : doctors) {
            doctorDTOsList.add(doctorMapper.toDoctorListItemDTO(doctor));
        }
        return doctorDTOsList;
    }

    public List<AppointmentListDoctorViewDTO> getAppointmentListDTO(String email) {
        Optional<Doctor> doctor = doctorRepository.findByEmail(email);
        if (doctor.isEmpty()) {
            throw new UserNotFoundException("User With Email = " + email + " Not Found");
        }
        List<Appointment> appointmentList = doctor.get().getAppointments();
        return appointmentList.stream().map(appointmentMapper::toAppointmentListDoctorViewDTO).toList();
    }

    public List<PatientMedicalTestsViewDTO> getPatientMedicalTestsViewDTOS(Long appointmentId, String doctorEmail) {

        Appointment appointment = isAppointmentBelongToDoctor(appointmentId, doctorEmail);
        if (appointment == null)
            throw new RuntimeException("Doctor with email " + doctorEmail + " Does not have this appointment in his/her list");

       List<MedicalTest> medicalTests = appointment.getPatient().getMedicalTestList();

        //  Map to DTO list
        return medicalTests.stream()
                .map(medicalTestsMapper::toDTO)
                .toList();
    }


    protected Appointment isAppointmentBelongToDoctor(Long id, String doctorEmail) {
        Doctor doctor = doctorRepository.findByEmail(doctorEmail)
                .orElseThrow(() ->
                        new UserNotFoundException("Doctor not found"));
        for (Appointment appointment : doctor.getAppointments()) {
            if (appointment.getId().equals(id))
                return appointment;
        }
        return null;
    }

    public void savePrescription(PrescriptionDTO prescriptiondto) {
        Prescription prescription = prescriptionMapper.toEntity(prescriptiondto);
        prescription.getPatient().getPrescriptions().add(prescription);
        prescriptionRepository.save(prescription);
    }

    public PrescriptionDTO initializePrescription(Long appointmentId, String doctorEmail){
        Appointment appointment = isAppointmentBelongToDoctor(appointmentId, doctorEmail);
        if (appointment == null) {
            throw new RuntimeException("Doctor with email " + doctorEmail + " Does not have this appointment in his/her list");
        }

        Doctor doctor = doctorRepository.findByEmail(doctorEmail)
                .orElseThrow(() ->
                new UserNotFoundException("Doctor not found"));

        PrescriptionDTO prescriptiondto = new PrescriptionDTO();
        prescriptiondto.setPatientName(appointment.getPatient().getName());
        prescriptiondto.setDoctorName(doctor.getName());
        prescriptiondto.setPrescriptionDate(LocalDateTime.now());
        return prescriptiondto;
    }

}
