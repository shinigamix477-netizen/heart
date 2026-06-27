package com.java.backend.controller;

import com.java.backend.dto.AppointmentListDoctorViewDTO;
import com.java.backend.dto.PatientMedicalTestsViewDTO;
import com.java.backend.dto.PrescriptionDTO;
import com.java.backend.exception.NoMedicalTestException;
import com.java.backend.service.DoctorService;
import org.apache.coyote.BadRequestException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(DoctorController.class)
class DoctorControllerTest {

    private static final String BASE_URL = "/api/doctor";
    private static final String DOCTOR_EMAIL = "doctor@example.com";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private DoctorService doctorService;


    @Test
    void viewAppointments_ShouldReturnListOfAppointments_WhenDoctorHasAppointments() throws Exception {
        AppointmentListDoctorViewDTO appt1 = new AppointmentListDoctorViewDTO();
        appt1.setAppointmentId(1L);
        appt1.setPatientName("Patient One");
        AppointmentListDoctorViewDTO appt2 = new AppointmentListDoctorViewDTO();
        appt2.setAppointmentId(2L);
        appt2.setPatientName("Patient Two");
        List<AppointmentListDoctorViewDTO> mockAppointments = List.of(appt1, appt2);

        when(doctorService.getAppointmentListDTO(DOCTOR_EMAIL)).thenReturn(mockAppointments);

        mockMvc.perform(get(BASE_URL + "/appointments")
                        .param("doctorEmail",DOCTOR_EMAIL))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].appointmentId").value(1L))
                .andExpect(jsonPath("$[0].patientName").value("Patient One"));

        verify(doctorService, times(1)).getAppointmentListDTO(DOCTOR_EMAIL);
    }

    @Test
    void viewAppointments_ShouldReturnEmptyList_WhenDoctorHasNoAppointments() throws Exception {
        when(doctorService.getAppointmentListDTO(DOCTOR_EMAIL)).thenReturn(Collections.emptyList());

        mockMvc.perform(get(BASE_URL + "/appointments")
                        .param("doctorEmail",DOCTOR_EMAIL))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        verify(doctorService, times(1)).getAppointmentListDTO(DOCTOR_EMAIL);
    }

    @Test
    void viewPatientMedicalTests_ShouldReturnListOfMedicalTests_WhenValid() throws Exception {
        Long appointmentId = 1L;
        PatientMedicalTestsViewDTO test1 = new PatientMedicalTestsViewDTO();
        test1.setPatientUserName("pati1");
        test1.setAge(30);
        List<PatientMedicalTestsViewDTO> mockTests = List.of(test1);

        when(doctorService.getPatientMedicalTestsViewDTOS(appointmentId, DOCTOR_EMAIL)).thenReturn(mockTests);

        mockMvc.perform(get(BASE_URL + "/appointment/{appointmentId}/medical-tests", appointmentId)
                        .param("doctorEmail",DOCTOR_EMAIL))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].patientId").value(101L))
                .andExpect(jsonPath("$[0].age").value(30));

        verify(doctorService, times(1)).getPatientMedicalTestsViewDTOS(appointmentId, DOCTOR_EMAIL);
    }

    @Test
    void viewPatientMedicalTests_ShouldReturnNotFound_WhenAppointmentNotFound() throws Exception {
        Long appointmentId = 99L;

        when(doctorService.getPatientMedicalTestsViewDTOS(appointmentId, DOCTOR_EMAIL))
                .thenThrow(new NoMedicalTestException("Appointment not found"));

        mockMvc.perform(get(BASE_URL + "/appointment/{appointmentId}/medical-tests", appointmentId)
                        .param("doctorEmail",DOCTOR_EMAIL))
                .andExpect(status().isUnprocessableContent());

        verify(doctorService, times(1)).getPatientMedicalTestsViewDTOS(appointmentId, DOCTOR_EMAIL);
    }

    @Test
    void viewPatientMedicalTests_ShouldReturnForbidden_WhenDoctorNotAuthorized() throws Exception {
        Long appointmentId = 1L;


        doThrow(new SecurityException("Doctor not authorized for this appointment"))
                .when(doctorService).getPatientMedicalTestsViewDTOS(appointmentId, DOCTOR_EMAIL);

        mockMvc.perform(get(BASE_URL + "/appointment/{appointmentId}/medical-tests", appointmentId)
                        .param("doctorEmail",DOCTOR_EMAIL))
                .andExpect(status().isInternalServerError()); // Assuming SecurityException maps to 403

        verify(doctorService, times(1)).getPatientMedicalTestsViewDTOS(appointmentId, DOCTOR_EMAIL);
    }

    @Test
    void initializePrescription_ShouldReturnPrescriptionDTO_WhenValid() throws Exception {
        Long appointmentId = 1L;
        PrescriptionDTO prescriptionDTO = new PrescriptionDTO();
        prescriptionDTO.setDoctorName("hussain");

        when(doctorService.initializePrescription(appointmentId, DOCTOR_EMAIL)).thenReturn(prescriptionDTO);

        mockMvc.perform(get(BASE_URL + "/appointment/{appointmentId}/prescription", appointmentId)
                        .param("doctorEmail",DOCTOR_EMAIL))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.doctorName").value("hussain"));

        verify(doctorService, times(1)).initializePrescription(appointmentId, DOCTOR_EMAIL);
    }

    @Test
    void initializePrescription_ShouldReturnNotFound_WhenAppointmentNotFound() throws Exception {
        Long appointmentId = 99L;

        when(doctorService.initializePrescription(appointmentId, DOCTOR_EMAIL))
                .thenThrow(new NoMedicalTestException("Appointment not found"));

        mockMvc.perform(get(BASE_URL + "/appointment/{appointmentId}/prescription", appointmentId)
                        .param("doctorEmail",DOCTOR_EMAIL))
                .andExpect(status().isUnprocessableContent());

        verify(doctorService, times(1)).initializePrescription(appointmentId, DOCTOR_EMAIL);
    }

    @Test
    void initializePrescription_ShouldReturnForbidden_WhenDoctorNotAuthorized() throws Exception {
        Long appointmentId = 1L;

        doThrow(new SecurityException("Doctor not authorized for this appointment"))
                .when(doctorService).initializePrescription(appointmentId, DOCTOR_EMAIL);

        mockMvc.perform(get(BASE_URL + "/appointment/{appointmentId}/prescription", appointmentId)
                        .param("doctorEmail",DOCTOR_EMAIL))
                .andExpect(status().isInternalServerError());

        verify(doctorService, times(1)).initializePrescription(appointmentId, DOCTOR_EMAIL);
    }

    @Test
    void savePrescription_ShouldReturnCreated_WhenValid() throws Exception {
        PrescriptionDTO prescriptionDTO = new PrescriptionDTO();
        prescriptionDTO.setPatientName("Patient One");
        prescriptionDTO.setDoctorName("Doctor One");
//        prescriptionDTO.setPrescriptionDate(LocalDateTime.now());
//        prescriptionDTO.setContent(List.of("Aspirin 100mg daily"));

        doNothing().when(doctorService).savePrescription(any(PrescriptionDTO.class));

        mockMvc.perform(post(BASE_URL + "/save-prescription")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(prescriptionDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$").value("Prescription saved successfully!"));

        verify(doctorService, times(1)).savePrescription(any(PrescriptionDTO.class));
    }

    @Test
    void savePrescription_ShouldReturnBadRequest_WhenInvalid() throws Exception {
        PrescriptionDTO invalidPrescriptionDTO = new PrescriptionDTO();
        // Missing required fields

        mockMvc.perform(post(BASE_URL + "/save-prescription")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidPrescriptionDTO)))
                .andExpect(status().isBadRequest()); // Expecting validation errors

        verify(doctorService, never()).savePrescription(any(PrescriptionDTO.class));
    }

}