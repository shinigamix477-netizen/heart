package com.java.backend.controller;

import com.java.backend.dto.*;
import com.java.backend.exception.*;
import com.java.backend.mapper.PatientMapper;
import com.java.backend.model.Address;
import com.java.backend.model.Appointment;
import com.java.backend.model.Patient;
import com.java.backend.service.DoctorService;
import com.java.backend.service.PatientService;
import com.java.backend.utilities.ConnectivityType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.*;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PatientController.class)
class PatientControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private PatientService patientService;

    @MockitoBean
    private DoctorService doctorService;

    @MockitoBean
    private PatientMapper patientMapper;

    @Autowired
    private ObjectMapper objectMapper;

    private static final String BASE_URL = "/api/patient";

    // ==================== REGISTER TESTS ====================

    @Test
    void register_ShouldReturnCreated_WhenValidPatientDTO() throws Exception {
        // Given
        PatientDTO patientDTO = createValidPatientDTO();
        Map<String, String> expectedResponse = Map.of(
                "message", "Registered Successfully",
                "role", "PATIENT"
        );

        when(patientService.registerNewPatient(any(PatientDTO.class)))
                .thenReturn(expectedResponse);

        // When & Then
        mockMvc.perform(post(BASE_URL + "/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(patientDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("Registered Successfully"))
                .andExpect(jsonPath("$.role").value("PATIENT"));

        verify(patientService, times(1)).registerNewPatient(any(PatientDTO.class));
    }

    @Test
    void register_ShouldReturnBadRequest_WhenEmailAlreadyExists() throws Exception {
        // Given
        PatientDTO patientDTO = createValidPatientDTO();

        when(patientService.registerNewPatient(any(PatientDTO.class)))
                .thenThrow(new EmailAlreadyUsedException("Email already in use!"));

        // When & Then
        mockMvc.perform(post(BASE_URL + "/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(patientDTO)))
                .andExpect(status().isImUsed());

        verify(patientService, times(1)).registerNewPatient(any(PatientDTO.class));
    }

    @Test
    void register_ShouldReturnBadRequest_WhenInvalidDTO() throws Exception {
        // Given - Empty DTO (missing required fields)
        PatientDTO invalidDTO = new PatientDTO();

        // When & Then
        mockMvc.perform(post(BASE_URL + "/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidDTO)))
                .andExpect(status().isBadRequest());

        verify(patientService, never()).registerNewPatient(any(PatientDTO.class));
    }

    // ==================== VIEW PERSONAL DETAILS TESTS ====================

    @Test
    void viewPersonalDetails_ShouldReturnOK_WhenPatientExists() throws Exception {
        // Given
        String email = "patient@test.com";
        Patient patient = createMockPatient(email);
        PatientDTO patientDTO = createValidPatientDTO();

        when(patientService.getPatientByEmail(email)).thenReturn(patient);
        when(patientMapper.toPatientDTO(patient)).thenReturn(patientDTO);

        // When & Then
        mockMvc.perform(get(BASE_URL + "/me")
                        .param("patientEmail", email))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("patient@test.com"))
                .andExpect(jsonPath("$.name").value("John Doe"));

        verify(patientService, times(1)).getPatientByEmail(email);
        verify(patientMapper, times(1)).toPatientDTO(patient);
    }

    @Test
    void viewPersonalDetails_ShouldReturnNotFound_WhenPatientDoesNotExist() throws Exception {
        // Given
        String email = "nonexistent@test.com";

        when(patientService.getPatientByEmail(email))
                .thenThrow(new UserNotFoundException("User With Email = " + email + " Not Found"));

        // When & Then
        mockMvc.perform(get(BASE_URL + "/me")
                        .param("patientEmail", email))
                .andExpect(status().isNotFound());

        verify(patientService, times(1)).getPatientByEmail(email);
    }

    // ==================== VIEW APPOINTMENTS TESTS ====================

    @Test
    void viewAppointments_ShouldReturnOK_WhenAppointmentsExist() throws Exception {
        // Given
        String email = "patient@test.com";
        List<AppointmentListPatientViewDTO> appointments = createMockAppointmentList();

        when(patientService.getPatientAppointment(email)).thenReturn(appointments);

        // When & Then
        mockMvc.perform(get(BASE_URL + "/me/appointments")
                        .param("patientEmail", email))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].doctorName").value("Dr. Smith"));

        verify(patientService, times(1)).getPatientAppointment(email);
    }

    @Test
    void viewAppointments_ShouldReturnNotFound_WhenPatientDoesNotExist() throws Exception {
        // Given
        String email = "nonexistent@test.com";

        when(patientService.getPatientAppointment(email))
                .thenThrow(new UserNotFoundException("Patient with email: " + email + " not found"));

        // When & Then
        mockMvc.perform(get(BASE_URL + "/me/appointments")
                        .param("patientEmail", email))
                .andExpect(status().isNotFound());
    }

    @Test
    void viewAppointments_ShouldReturnEmptyList_WhenNoAppointments() throws Exception {
        // Given
        String email = "patient@test.com";

        when(patientService.getPatientAppointment(email)).thenReturn(new ArrayList<>());

        // When & Then
        mockMvc.perform(get(BASE_URL + "/me/appointments")
                        .param("patientEmail", email))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        verify(patientService, times(1)).getPatientAppointment(email);
    }

    // ==================== VIEW MEDICAL TESTS TESTS ====================

    @Test
    void viewPatientMedicalTests_ShouldReturnOK_WhenTestsExist() throws Exception {
        // Given
        String email = "patient@test.com";
        List<PatientMedicalTestsViewDTO> tests = createMockMedicalTests();

        when(patientService.getPatientMedicalTests(email)).thenReturn(tests);

        // When & Then
        mockMvc.perform(get(BASE_URL + "/me/medical-tests")
                        .param("patientEmail", email))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].diagnosis").value("Healthy"));

        verify(patientService, times(1)).getPatientMedicalTests(email);
    }

    @Test
    void viewPatientMedicalTests_ShouldReturnNotFound_WhenPatientDoesNotExist() throws Exception {
        // Given
        String email = "nonexistent@test.com";

        when(patientService.getPatientMedicalTests(email))
                .thenThrow(new UserNotFoundException("Patient with email: " + email + " not found"));

        // When & Then
        mockMvc.perform(get(BASE_URL + "/me/medical-tests")
                        .param("patientEmail", email))
                .andExpect(status().isNotFound());
    }

    // ==================== VIEW PRESCRIPTIONS TESTS ====================

//    @Test
//    void viewPatientPrescriptions_ShouldReturnOK_WhenPrescriptionsExist() throws Exception {
//        // Given
//        String email = "patient@test.com";
//        List<PrescriptionDTO> prescriptions = createMockPrescriptions();
//
//        when(patientService.getPatientPrescriptions(email)).thenReturn(prescriptions);
//
//        // When & Then
//        mockMvc.perform(get(BASE_URL + "/me/prescriptions")
//                        .param("patientEmail", email))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.length()").value(2))
//                .andExpect(jsonPath("$[0].patientName").value("John Doe"));
//
//        verify(patientService, times(1)).getPatientPrescriptions(email);
//    }

    @Test
    void viewPatientPrescriptions_ShouldReturnNotFound_WhenPatientDoesNotExist() throws Exception {
        // Given
        String email = "nonexistent@test.com";

        when(patientService.getPatientPrescriptions(email))
                .thenThrow(new UserNotFoundException("Patient with email: " + email + " not found"));

        // When & Then
        mockMvc.perform(get(BASE_URL + "/me/prescriptions")
                        .param("patientEmail", email))
                .andExpect(status().isNotFound());
    }

    // ==================== UPDATE PATIENT TESTS ====================

    @Test
    void updatePatient_ShouldReturnOK_WhenValidRequest() throws Exception {
        // Given
        String email = "patient@test.com";
        PatientDTO patientDTO = createValidPatientDTO();
        String successMessage = "Patient Saved successfully.";

        when(patientService.updatePatient(any(PatientDTO.class), eq(email)))
                .thenReturn(successMessage);

        // When & Then
        mockMvc.perform(put(BASE_URL + "/update")
                        .param("patientEmail", email)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(patientDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.Message").value("Patient Saved successfully."));

        verify(patientService, times(1)).updatePatient(any(PatientDTO.class), eq(email));
    }

    @Test
    void updatePatient_ShouldReturnNotFound_WhenPatientDoesNotExist() throws Exception {
        // Given
        String email = "nonexistent@test.com";
        PatientDTO patientDTO = createValidPatientDTO();

        when(patientService.updatePatient(any(PatientDTO.class), eq(email)))
                .thenThrow(new UserNotFoundException("User With Email = " + email + " Not Found"));

        // When & Then
        mockMvc.perform(put(BASE_URL + "/update")
                        .param("patientEmail", email)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(patientDTO)))
                .andExpect(status().isNotFound());
    }

    @Test
    void updatePatient_ShouldReturnBadRequest_WhenInvalidDTO() throws Exception {
        // Given
        String email = "patient@test.com";
        PatientDTO invalidDTO = new PatientDTO(); // Empty DTO

        // When & Then
        mockMvc.perform(put(BASE_URL + "/update")
                        .param("patientEmail", email)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidDTO)))
                .andExpect(status().isBadRequest());

        verify(patientService, never()).updatePatient(any(PatientDTO.class), anyString());
    }

    // ==================== PREDICT HEART DISEASE TESTS ====================

    @Test
    void predictionHeartDisease_ShouldReturnOK_WhenValidRequest() throws Exception {
        // Given
        String email = "patient@test.com";
        PatientMedicalDataDTO medicalData = createMockMedicalData();
        PredictionResultDTO predictionResult = createMockPredictionResult();

        when(patientService.predictHeartDisease(any(PatientMedicalDataDTO.class), eq(email)))
                .thenReturn(predictionResult);

        // When & Then
        mockMvc.perform(post(BASE_URL + "/predict")
                        .param("patientEmail", email)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(medicalData)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.diagnosis").value("Healthy"))
                .andExpect(jsonPath("$.riskCategory").value("General Cardiac Risk Pattern"));

        verify(patientService, times(1)).predictHeartDisease(any(PatientMedicalDataDTO.class), eq(email));
    }

    @Test
    void predictionHeartDisease_ShouldReturnNotFound_WhenPatientDoesNotExist() throws Exception {
        // Given
        String email = "nonexistent@test.com";
        PatientMedicalDataDTO medicalData = createMockMedicalData();

        when(patientService.predictHeartDisease(any(PatientMedicalDataDTO.class), eq(email)))
                .thenThrow(new UserNotFoundException("Patient with email: " + email + " not found"));

        // When & Then
        mockMvc.perform(post(BASE_URL + "/predict")
                        .param("patientEmail", email)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(medicalData)))
                .andExpect(status().isNotFound());
    }

    @Test
    void predictionHeartDisease_ShouldReturnBadRequest_WhenInvalidData() throws Exception {
        // Given
        String email = "patient@test.com";
        PatientMedicalDataDTO invalidData = new PatientMedicalDataDTO(); // Missing required fields

        // When & Then
        mockMvc.perform(post(BASE_URL + "/predict")
                        .param("patientEmail", email)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidData)))
                .andExpect(status().isBadRequest());

        verify(patientService, never()).predictHeartDisease(any(PatientMedicalDataDTO.class), anyString());
    }

    // ==================== VIEW ALL DOCTORS TESTS ====================

    @Test
    void viewAllDoctors_ShouldReturnOK_WhenDoctorsExist() throws Exception {
        // Given
        String email = "patient@test.com";
        List<DoctorListItemDTO> doctors = createMockDoctorList();

        when(doctorService.getAllDoctors()).thenReturn(doctors);

        // When & Then
        mockMvc.perform(get(BASE_URL + "/doctors")
                        .param("patientEmail", email))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value("Dr. Smith"));

        verify(doctorService, times(1)).getAllDoctors();
    }

    @Test
    void viewAllDoctors_ShouldReturnEmptyList_WhenNoDoctors() throws Exception {
        // Given
        String email = "patient@test.com";

        when(doctorService.getAllDoctors()).thenReturn(new ArrayList<>());

        // When & Then
        mockMvc.perform(get(BASE_URL + "/doctors")
                        .param("patientEmail", email))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        verify(doctorService, times(1)).getAllDoctors();
    }

    // ==================== BOOK APPOINTMENT TESTS ====================

    @Test
    void bookAppointment_ShouldReturnOK_WhenValidRequest() throws Exception {
        // Given
        String email = "patient@test.com";
        Long doctorId = 1L;
        String connectivityType = "ONLINE";
        LocalDateTime time = LocalDateTime.now().plusDays(1);
        Appointment mockAppointment = new Appointment();
        mockAppointment.setMeetingLink("https://meet.jit.si/test-room");

        when(patientService.bookAppointment(eq(email), eq(doctorId), eq(ConnectivityType.ONLINE), any(LocalDateTime.class)))
                .thenReturn(mockAppointment);

        // When & Then
        mockMvc.perform(post(BASE_URL + "/book-appointment/{doctorId}", doctorId)
                        .param("patientEmail", email)
                        .param("connectivityType", connectivityType)
                        .param("time", "2024-12-25 10:00:00")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Appointment confirmed successfully")));

        verify(patientService, times(1))
                .bookAppointment(eq(email), eq(doctorId), eq(ConnectivityType.ONLINE), any(LocalDateTime.class));
    }

    @Test
    void bookAppointment_ShouldReturnOK_WithOfflineConnectivity() throws Exception {
        // Given
        String email = "patient@test.com";
        Long doctorId = 1L;
        String connectivityType = "OFFLINE";
        LocalDateTime time = LocalDateTime.now().plusDays(1);
        Appointment mockAppointment = new Appointment();
        mockAppointment.setMeetingLink(null);

        when(patientService.bookAppointment(eq(email), eq(doctorId), eq(ConnectivityType.OFFLINE), any(LocalDateTime.class)))
                .thenReturn(mockAppointment);

        // When & Then
        mockMvc.perform(post(BASE_URL + "/book-appointment/{doctorId}", doctorId)
                        .param("patientEmail", email)
                        .param("connectivityType", connectivityType)
                        .param("time", "2024-12-25 10:00:00")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Appointment confirmed successfully")));

        verify(patientService, times(1))
                .bookAppointment(eq(email), eq(doctorId), eq(ConnectivityType.OFFLINE), any(LocalDateTime.class));
    }

    @Test
    void bookAppointment_ShouldReturnNotFound_WhenPatientDoesNotExist() throws Exception {
        // Given
        String email = "nonexistent@test.com";
        Long doctorId = 1L;

        when(patientService.bookAppointment(eq(email), eq(doctorId), any(ConnectivityType.class), any(LocalDateTime.class)))
                .thenThrow(new UserNotFoundException("No such Patient with this Email: " + email));

        // When & Then
        mockMvc.perform(post(BASE_URL + "/book-appointment/{doctorId}", doctorId)
                        .param("patientEmail", email)
                        .param("connectivityType", "ONLINE")
                        .param("time", "2024-12-25 10:00:00")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    void bookAppointment_ShouldReturnNotFound_WhenDoctorDoesNotExist() throws Exception {
        // Given
        String email = "patient@test.com";
        Long doctorId = 999L;

        when(patientService.bookAppointment(eq(email), eq(doctorId), any(ConnectivityType.class), any(LocalDateTime.class)))
                .thenThrow(new UserNotFoundException("No Doctors with id: " + doctorId));

        // When & Then
        mockMvc.perform(post(BASE_URL + "/book-appointment/{doctorId}", doctorId)
                        .param("patientEmail", email)
                        .param("connectivityType", "ONLINE")
                        .param("time", "2024-12-25 10:00:00")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    void bookAppointment_ShouldReturnBadRequest_WhenDoctorNotAvailable() throws Exception {
        // Given
        String email = "patient@test.com";
        Long doctorId = 1L;

        when(patientService.bookAppointment(eq(email), eq(doctorId), any(ConnectivityType.class), any(LocalDateTime.class)))
                .thenThrow(new DoctorNotAvailableException("Doctor is not available at this time"));

        // When & Then
        mockMvc.perform(post(BASE_URL + "/book-appointment/{doctorId}", doctorId)
                        .param("patientEmail", email)
                        .param("connectivityType", "ONLINE")
                        .param("time", "2024-12-25 10:00:00")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isConflict());
    }

    @Test
    void bookAppointment_ShouldReturnBadRequest_WhenNoMedicalTests() throws Exception {
        // Given
        String email = "patient@test.com";
        Long doctorId = 1L;

        when(patientService.bookAppointment(eq(email), eq(doctorId), any(ConnectivityType.class), any(LocalDateTime.class)))
                .thenThrow(new NoMedicalTestException("Patient must have at least one medical test to book an appointment."));

        // When & Then
        mockMvc.perform(post(BASE_URL + "/book-appointment/{doctorId}", doctorId)
                        .param("patientEmail", email)
                        .param("connectivityType", "ONLINE")
                        .param("time", "2024-12-25 10:00:00")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnprocessableContent());
    }

    // ==================== CANCEL APPOINTMENT TESTS ====================

    @Test
    void cancelAppointment_ShouldReturnOK_WhenValidRequest() throws Exception {
        // Given
        String email = "patient@test.com";
        Long appointmentId = 1L;

        doNothing().when(patientService).cancelAppointment(appointmentId);

        // When & Then
        mockMvc.perform(patch(BASE_URL + "/cancel-appointment/{appointmentId}", appointmentId)
                        .param("patientEmail", email))
                .andExpect(status().isOk())
                .andExpect(content().string("Appointment Cancelled Successfully"));

        verify(patientService, times(1)).cancelAppointment(appointmentId);
    }

    @Test
    void cancelAppointment_ShouldReturnNotFound_WhenAppointmentDoesNotExist() throws Exception {
        // Given
        String email = "patient@test.com";
        Long appointmentId = 999L;

        doThrow(new UserNotFoundException("No appointment with this id " + appointmentId))
                .when(patientService).cancelAppointment(appointmentId);

        // When & Then
        mockMvc.perform(patch(BASE_URL + "/cancel-appointment/{appointmentId}", appointmentId)
                        .param("patientEmail", email))
                .andExpect(status().isNotFound());

        verify(patientService, times(1)).cancelAppointment(appointmentId);
    }

    // ==================== HELPER METHODS ====================

    private PatientDTO createValidPatientDTO() {
        PatientDTO dto = new PatientDTO();
        dto.setEmail("patient@test.com");
        dto.setName("John Doe");
        dto.setUserName("johndoe");
        dto.setPassword("password123");
        dto.setContactNumber("1234567890");
        dto.setAge(30);
        dto.setStreetAddress("123 Main St");
        dto.setCity("New York");
        dto.setState("NY");
        dto.setCountry("USA");
        return dto;
    }

    private Patient createMockPatient(String email) {
        Patient patient = new Patient();
        patient.setEmail(email);
        patient.setName("John Doe");
        patient.setUserName("johndoe");
        patient.setContactNumber("1234567890");
        patient.setAge(30);
        Address address = new Address();
        address.setStreetAddress("123 Main St");
        address.setCity("New York");
        address.setState("NY");
        address.setCountry("USA");
        patient.setAddress(address);
        return patient;
    }

    private List<AppointmentListPatientViewDTO> createMockAppointmentList() {
        AppointmentListPatientViewDTO dto1 = new AppointmentListPatientViewDTO();
        dto1.setDoctorName("Dr. Smith");
        dto1.setTime(LocalDateTime.now());
        dto1.setConnectivityType(ConnectivityType.ONLINE);

        AppointmentListPatientViewDTO dto2 = new AppointmentListPatientViewDTO();
        dto2.setDoctorName("Dr. Johnson");
        dto2.setTime(LocalDateTime.now().plusDays(1));
        dto2.setConnectivityType(ConnectivityType.OFFLINE);

        return List.of(dto1, dto2);
    }

    private List<PatientMedicalTestsViewDTO> createMockMedicalTests() {
        PatientMedicalTestsViewDTO dto1 = new PatientMedicalTestsViewDTO();
        dto1.setDiagnosis("Healthy");
        dto1.setCreatedAt(LocalDateTime.now());
        dto1.setPatientUserName("patient1");

        PatientMedicalTestsViewDTO dto2 = new PatientMedicalTestsViewDTO();
        dto2.setDiagnosis("Risk Pattern");
        dto2.setCreatedAt(LocalDateTime.now().minusDays(1));
        dto2.setPatientUserName("patient2");

        return List.of(dto1, dto2);
    }

//    private List<PrescriptionDTO> createMockPrescriptions() {
//        PrescriptionDTO dto1 = new PrescriptionDTO();
//        dto1.setPatientName("John Doe");
//        dto1.setDoctorName("Dr. Smith");
//        dto1.setPrescriptionDate(LocalDateTime.now());
//        dto1.setContent(List.of("Aspirin 500mg", "Take twice daily"));
//
//        PrescriptionDTO dto2 = new PrescriptionDTO();
//        dto2.setPatientName("John Doe");
//        dto2.setDoctorName("Dr. Johnson");
//        dto2.setPrescriptionDate(LocalDateTime.now().minusDays(1));
//        dto2.setContent(List.of("Ibuprofen 200mg", "Take as needed"));
//
//        return List.of(dto1, dto2);
//    }

    private PatientMedicalDataDTO createMockMedicalData() {
        PatientMedicalDataDTO dto = new PatientMedicalDataDTO();
        dto.setAge(55);
        dto.setSex(1);
        dto.setCp(0);
        dto.setTrestbps(130);
        dto.setChol(200);
        dto.setFbs(0);
        dto.setRestecg(0);
        dto.setThalch(150);
        dto.setExang(0);
        dto.setOldpeak(0.5);
        dto.setSlope(1);
        dto.setCa(0);
        dto.setThal(2);
        return dto;
    }

    private PredictionResultDTO createMockPredictionResult() {
        PredictionResultDTO dto = new PredictionResultDTO();
        dto.setDiagnosis("Healthy");
        dto.setRiskCategory("General Cardiac Risk Pattern");
        dto.setRecommendationMsg("Enjoy your day!");
        dto.setDateAndTime(LocalDateTime.now());
        dto.setBelongsTo("patient@test.com");
        return dto;
    }

    private List<DoctorListItemDTO> createMockDoctorList() {
        DoctorListItemDTO dto1 = new DoctorListItemDTO();
        dto1.setId(1L);
        dto1.setName("Dr. Smith");
        dto1.setSpecialization("Cardiology");

        DoctorListItemDTO dto2 = new DoctorListItemDTO();
        dto2.setId(2L);
        dto2.setName("Dr. Johnson");
        dto2.setSpecialization("Neurology");

        return List.of(dto1, dto2);
    }
}