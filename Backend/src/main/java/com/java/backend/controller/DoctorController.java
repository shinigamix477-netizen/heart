package com.java.backend.controller;

import com.java.backend.dto.*;
import com.java.backend.service.DoctorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/doctor")
public class DoctorController {

    private final DoctorService doctorService;

    public DoctorController(DoctorService doctorService){
        this.doctorService = doctorService;
    }

    @GetMapping("/appointments")
    public ResponseEntity<List<AppointmentListDoctorViewDTO>> viewAppointments(@RequestParam("doctorEmail") String doctorEmail){

        List<AppointmentListDoctorViewDTO> appointmentListDoctorViewDTOS = doctorService.getAppointmentListDTO(doctorEmail);
        return ResponseEntity.ok(appointmentListDoctorViewDTOS);
    }

    @GetMapping("/appointment/{appointmentId}/medical-tests")
    public ResponseEntity<List<PatientMedicalTestsViewDTO>> viewPatientMedicalTests( @RequestParam("doctorEmail") String doctorEmail,@PathVariable Long appointmentId) {
        List<PatientMedicalTestsViewDTO> patientMedicalTestsViewDTOS = doctorService.getPatientMedicalTestsViewDTOS(appointmentId,doctorEmail);
        return ResponseEntity.ok(patientMedicalTestsViewDTOS);
    }

    @GetMapping("/appointment/{appointmentId}/prescription")
    public ResponseEntity<PrescriptionDTO> initializePrescription(@RequestParam("doctorEmail") String doctorEmail,@PathVariable Long appointmentId) {

        PrescriptionDTO prescriptiondto = doctorService.initializePrescription(appointmentId,doctorEmail);
        return ResponseEntity.ok(prescriptiondto);
    }

    @PostMapping("/save-prescription")
    public ResponseEntity<String> savePrescription(@RequestParam("doctorEmail") String doctorEmail, @RequestBody @Valid PrescriptionDTO prescriptionDTO) {

        doctorService.savePrescription(prescriptionDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body("Prescription saved successfully!");
    }
}
