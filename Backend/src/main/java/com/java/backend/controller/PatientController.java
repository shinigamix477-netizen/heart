package com.java.backend.controller;

import com.java.backend.dto.*;
import com.java.backend.mapper.PatientMapper;
import com.java.backend.model.Appointment;
import com.java.backend.model.Patient;
import com.java.backend.service.DoctorService;
import com.java.backend.service.PatientService;
import com.java.backend.utilities.ConnectivityType;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/patient")
public class PatientController {

   private final PatientService patientService;
   private final DoctorService doctorService;
    private PatientMapper patientMapper;

    public PatientController(PatientService patientService,PatientMapper patientMapper,DoctorService doctorService){
        this.patientService = patientService;
        this.doctorService = doctorService;
        this.patientMapper = patientMapper;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody @Valid PatientDTO patientDTO){
        Map<String ,String> result =  patientService.registerNewPatient(patientDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }


    @GetMapping("/me")
    public ResponseEntity<PatientDTO> viewPersonalDetails(@RequestParam("patientEmail") String patientEmail){


        Patient patient = patientService.getPatientByEmail(patientEmail);

        // map it to person DTO
        PatientDTO patientDTO = patientMapper.toPatientDTO(patient);

        // forward it
        return ResponseEntity.ok(patientDTO);
    }

    @GetMapping("/me/appointments")
    public ResponseEntity<List<AppointmentListPatientViewDTO>> viewAppointments(@RequestParam("patientEmail") String patientEmail) {

        List<AppointmentListPatientViewDTO> appointmentListPatientViewDTOS = patientService.getPatientAppointment(patientEmail);

        return  ResponseEntity.ok(appointmentListPatientViewDTOS);
    }

    @GetMapping("/me/medical-tests")
    public ResponseEntity<List<PatientMedicalTestsViewDTO>> viewPatientMedicalTests(@RequestParam("patientEmail") String patientEmail){

        List<PatientMedicalTestsViewDTO> patientMedicalTestsViewDTOS = patientService.getPatientMedicalTests(patientEmail);

        return ResponseEntity.ok(patientMedicalTestsViewDTOS);
    }

    @GetMapping("/me/prescriptions")
    public ResponseEntity<List<PrescriptionDTO>> viewPatientPrescriptions(@RequestParam("patientEmail") String patientEmail){
        List<PrescriptionDTO> patientPrescriptionDTOS = patientService.getPatientPrescriptions(patientEmail);
        return ResponseEntity.ok(patientPrescriptionDTOS);
    }


    @PutMapping("/update")
    public ResponseEntity<Map<String, String>> updatePatient(@RequestParam("patientEmail") String patientEmail,@RequestBody @Valid PatientDTO patientDTO){

        String result = patientService.updatePatient(patientDTO,patientEmail);

        return ResponseEntity.ok(Map.of("Message",result));
    }


    @PostMapping("/predict")
    public ResponseEntity<PredictionResultDTO> predictionHeartDisease(@RequestParam("patientEmail") String patientEmail, @RequestBody @Valid PatientMedicalDataDTO patientMedicalDataDTO){
        PredictionResultDTO predictionResultDTO = patientService.predictHeartDisease(patientMedicalDataDTO,patientEmail);
        return ResponseEntity.ok(predictionResultDTO);
    }


    @GetMapping("/doctors")
    public ResponseEntity<List<DoctorListItemDTO>>viewAllDoctors(@RequestParam("patientEmail") String patientEmail){ // this parameter used in AOP
        List<DoctorListItemDTO> doctors = doctorService.getAllDoctors();
        return ResponseEntity.ok(doctors);
    }


    @PostMapping("/book-appointment/{doctorId}")
    public ResponseEntity<String> bookAppointment(@RequestParam("patientEmail") String patientEmail,
                                                  @PathVariable Long doctorId, @RequestParam String connectivityType, @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime time){
        ConnectivityType connectivity = connectivityType.toUpperCase().equals("ONLINE")? ConnectivityType.ONLINE : ConnectivityType.OFFLINE;
        Appointment appointment = patientService.bookAppointment(patientEmail, doctorId,connectivity, time);
        return ResponseEntity.ok("Appointment confirmed successfully\n"+appointment.getMeetingLink());
    }

    @PatchMapping("/cancel-appointment/{appointmentId}")
    public ResponseEntity<String> cancelAppointment(@RequestParam("patientEmail") String patientEmail, @PathVariable Long appointmentId) {
        patientService.cancelAppointment(appointmentId);
        return ResponseEntity.ok("Appointment Cancelled Successfully");
    }
}
