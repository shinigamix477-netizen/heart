package com.java.backend.controller;

import com.java.backend.dto.AppointmentListAdminViewDTO;
import com.java.backend.dto.DoctorDTO;
import com.java.backend.dto.PatientMedicalTestsViewDTO;
import com.java.backend.dto.PersonDTO;
import com.java.backend.exception.UserNotFoundException;
import com.java.backend.model.Patient;
import com.java.backend.repository.AppointmentRepository;
import com.java.backend.service.AdminService;
import com.java.backend.service.MedicalTestService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import tools.jackson.databind.DeserializationContext;
import tools.jackson.databind.ObjectMapper;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AdminController.class)
class AdminControllerTest{

    private static final String BASE_URL = "/api/admin";

    @MockitoBean
    private AdminService adminService;

    @MockitoBean
    private MedicalTestService medicalTestService;

    @MockitoBean
    private AppointmentRepository appointmentRepository;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void viewAllUsers_ExceptAdmins_ShouldReturnListOfPersonDTO() throws Exception {
        PersonDTO personDTO1 = new PersonDTO();
        PersonDTO personDTO2 = new PersonDTO();
        PersonDTO personDTO3 = new PersonDTO();
        List<PersonDTO> mockUsersList = List.of(personDTO1,personDTO2,personDTO3);

        when(adminService.getAllUsersExceptAdmins()).thenReturn(mockUsersList);


        MvcResult res = mockMvc.perform(get(BASE_URL+"/users")).andExpect(status().isOk()).andReturn();

        List<PersonDTO> users = objectMapper.readValue(
                res.getResponse().getContentAsString(),
                objectMapper.getTypeFactory().constructCollectionType(List.class, PersonDTO.class)
        );
        assertEquals(3, users.size());
    }

    @Test
    public void viewAllUses_ShouldReturnNoContent()throws Exception{
        when(adminService.getAllUsersExceptAdmins()).thenReturn(List.of());
        mockMvc.perform(get(BASE_URL+"/users")).andExpect(status().isNoContent());
    }


    @Test
    public void viewUser_ShouldReturnPerosnDTOById()throws Exception{
        PersonDTO personDTO = new PersonDTO();
        personDTO.setId(2L);
        personDTO.setEmail("user2@example.com");
        when(adminService.viewUser(2L)).thenReturn(personDTO);

        MvcResult res = mockMvc.perform(get(BASE_URL+"/users/2")).andExpect(status().isOk()).andReturn();

        PersonDTO user = objectMapper.readValue(res.getResponse().getContentAsString(), objectMapper.getTypeFactory().constructType(PersonDTO.class));

        assertEquals("user2@example.com",user.getEmail());

    }

    @Test
    public void viewUser_ShouldThrowUserNotFoundException()throws Exception{
        when(adminService.viewUser(2L)).thenThrow(new UserNotFoundException("No users with id: 2"));

        mockMvc.perform(get(BASE_URL+"/users/2")).andExpect(status().isNotFound());
    }

    @Test
    public void deleteUser_ShouldDeleteUserById()throws Exception{
        Mockito.doNothing().when(adminService).deleteUser(2L);
        mockMvc.perform(delete(BASE_URL+"/users/2"))
                .andExpect(status().isOk())
                .andExpect(content().string("User Id: 2 Deleted successfully"));

        verify(adminService, times(1)).deleteUser(2L);
    }

    @Test
    public void deleteUser_ShouldThrowUserNotFoundException() throws Exception {
        Mockito.doThrow(new UserNotFoundException("User not found")).when(adminService).deleteUser(99L);

        mockMvc.perform(delete(BASE_URL + "/users/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    public void viewAllMedicalTests_ShouldReturnListOfMedicalTests() throws Exception {
        PatientMedicalTestsViewDTO medicalTest1 = new PatientMedicalTestsViewDTO();
        PatientMedicalTestsViewDTO medicalTest2 = new PatientMedicalTestsViewDTO();
        List<PatientMedicalTestsViewDTO> mockMedicalTests = List.of(medicalTest1, medicalTest2);

        when(adminService.getMedicalTestsDTOS()).thenReturn(mockMedicalTests);

        MvcResult res = mockMvc.perform(get(BASE_URL + "/medical-tests"))
                .andExpect(status().isOk())
                .andReturn();

        List<PatientMedicalTestsViewDTO> medicalTests = objectMapper.readValue(
                res.getResponse().getContentAsString(),
                objectMapper.getTypeFactory().constructCollectionType(List.class, PatientMedicalTestsViewDTO.class)
        );
        assertEquals(2, medicalTests.size());
    }

    @Test
    public void viewAllMedicalTests_ShouldReturnNoContent() throws Exception {
        when(adminService.getMedicalTestsDTOS()).thenReturn(List.of());

        mockMvc.perform(get(BASE_URL + "/medical-tests"))
                .andExpect(status().isNoContent());
    }

    @Test
    public void getPatientOfMedicalTest_ShouldReturnPersonDTO() throws Exception {
        Long id = 10L;
        Patient mockPatient = new Patient();
        mockPatient.setId(id);

        PersonDTO mockPersonDTO = new PersonDTO();
        mockPersonDTO.setId(id);
        mockPersonDTO.setEmail("patient@example.com");

        when(medicalTestService.getPatientOfMedicalTest(id)).thenReturn(mockPatient);
        when(adminService.viewUser(id)).thenReturn(mockPersonDTO);

        MvcResult res = mockMvc.perform(get(BASE_URL + "/medical-tests/{testId}/patient", id))
                .andExpect(status().isOk())
                .andReturn();

        PersonDTO patient = objectMapper.readValue(res.getResponse().getContentAsString(), PersonDTO.class);

        assertEquals(id, patient.getId());
        assertEquals("patient@example.com", patient.getEmail());
        verify(medicalTestService, times(1)).getPatientOfMedicalTest(id);
        verify(adminService, times(1)).viewUser(id);
    }

    @Test
    public void getPatientOfMedicalTest_ShouldReturnNotFoundWhenMedicalTestPatientNotFound() throws Exception {
        Long id = 10L;
        Patient mockPatient = new Patient();
        mockPatient.setId(id);

        when(medicalTestService.getPatientOfMedicalTest(id)).thenThrow(new UserNotFoundException("MedicalTest or associated User not found for testId: " + id));
//        when(adminService.viewUser(id)).thenThrow(new UserNotFoundException("Patient not found"));

        mockMvc.perform(get(BASE_URL + "/medical-tests/{testId}/patient", id))
                .andExpect(status().isNotFound());

        verify(medicalTestService, times(1)).getPatientOfMedicalTest(id);
        verify(adminService, never()).viewUser(id);
    }

    @Test
    public void deleteMedicalTest_ShouldDeleteMedicalTestById() throws Exception {
        Long medicalTestId = 5L;
        Mockito.doNothing().when(medicalTestService).deleteById(medicalTestId);

        mockMvc.perform(delete(BASE_URL + "/medical-test/{id}", medicalTestId))
                .andExpect(status().isOk())
                .andExpect(content().string("Medical test with id: " + medicalTestId + " has been deleted."));

        verify(medicalTestService, times(1)).deleteById(medicalTestId);
    }

    @Test
    public void deleteMedicalTest_ShouldReturnNotFoundWhenMedicalTestDoesNotExist() throws Exception {
        Long medicalTestId = 99L;
        Mockito.doThrow(new UserNotFoundException("Medical test not found")).when(medicalTestService).deleteById(medicalTestId);

        mockMvc.perform(delete(BASE_URL + "/medical-test/{id}", medicalTestId))
                .andExpect(status().isNotFound());

        verify(medicalTestService, times(1)).deleteById(medicalTestId);
    }

    @Test
    public void getAllAppointments_ShouldReturnListOfAppointments() throws Exception {
        AppointmentListAdminViewDTO appointment1 = new AppointmentListAdminViewDTO();
        AppointmentListAdminViewDTO appointment2 = new AppointmentListAdminViewDTO();
        List<AppointmentListAdminViewDTO> mockAppointments = List.of(appointment1, appointment2);

        when(adminService.getAllAppointment()).thenReturn(mockAppointments);

        MvcResult res = mockMvc.perform(get(BASE_URL + "/appointments"))
                .andExpect(status().isOk())
                .andReturn();

        List<AppointmentListAdminViewDTO> appointments = objectMapper.readValue(
                res.getResponse().getContentAsString(),
                objectMapper.getTypeFactory().constructCollectionType(List.class, AppointmentListAdminViewDTO.class)
        );
        assertEquals(2, appointments.size());
        verify(adminService, times(1)).getAllAppointment();
    }

    @Test
    public void getAllAppointments_ShouldReturnNoContent() throws Exception {
        when(adminService.getAllAppointment()).thenReturn(List.of());

        mockMvc.perform(get(BASE_URL + "/appointments"))
                .andExpect(status().isNoContent());

        verify(adminService, times(1)).getAllAppointment();
    }

    @Test
    public void deleteAppointment_ShouldDeleteAppointmentById() throws Exception {
        Long appointmentId = 7L;
        Mockito.doNothing().when(adminService).deleteAppointmentById(appointmentId);

        mockMvc.perform(delete(BASE_URL + "/appointment/{appointmentId}", appointmentId))
                .andExpect(status().isOk())
                .andExpect(content().string("Appointment with id: " + appointmentId + " has been deleted."));

        verify(adminService, times(1)).deleteAppointmentById(appointmentId);
    }

    @Test
    public void deleteAppointment_ShouldReturnNotFoundWhenAppointmentDoesNotExist() throws Exception {
        Long appointmentId = 99L;
        Mockito.doThrow(new UserNotFoundException("Appointment not found")).when(adminService).deleteAppointmentById(appointmentId);

        mockMvc.perform(delete(BASE_URL + "/appointment/{appointmentId}", appointmentId))
                .andExpect(status().isNotFound());

        verify(adminService, times(1)).deleteAppointmentById(appointmentId);
    }

    @Test
    public void addDoctor_ShouldRegisterNewDoctor()throws Exception{
        DoctorDTO doctor = new DoctorDTO();
        doctor.setId(1L);
        doctor.setName("Ahmed Hassan");
        doctor.setUserName("ahmed.hassan");
        doctor.setEmail("ahmed.hassan@example.com");
        doctor.setPassword("SecurePass123");
        doctor.setContactNumber("01012345678");
        doctor.setAge(42);
        doctor.setStreetAddress("15 Tahrir Street");
        doctor.setCity("Cairo");
        doctor.setState("Cairo Governorate");
        doctor.setCountry("Egypt");
        doctor.setSpecialization("Cardiology");
        doctor.setFromDay(DayOfWeek.MONDAY);
        doctor.setToDay(DayOfWeek.FRIDAY);
        doctor.setFromTime(LocalTime.of(9, 0));
        doctor.setToTime(LocalTime.of(17, 0));
        // we must initialize all fields cuz of @Valid in addController api's parameters.

        Map<String, String > map = new HashMap<>();
        map.put("message","Registered Successfully");
        map.put("role","DOCTOR");

        when(adminService.registerNewDoctor(doctor)).thenReturn(map);

        mockMvc.perform(post(BASE_URL+"/doctors")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(doctor)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("Registered Successfully"))
                .andExpect(jsonPath("$.role").value("DOCTOR"));

        verify(adminService,times(1)).registerNewDoctor(doctor);
    }
}