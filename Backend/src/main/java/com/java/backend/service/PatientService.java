package com.java.backend.service;

import com.java.backend.dto.*;
import com.java.backend.exception.DoctorNotAvailableException;
import com.java.backend.exception.EmailAlreadyUsedException;
import com.java.backend.exception.NoMedicalTestException;
import com.java.backend.exception.UserNotFoundException;
import com.java.backend.mapper.AppointmentMapper;
import com.java.backend.mapper.MedicalTestsMapper;
import com.java.backend.mapper.PatientMapper;
import com.java.backend.mapper.PrescriptionMapper;
import com.java.backend.model.*;
import com.java.backend.repository.*;
import com.java.backend.utilities.AppointmentStatus;
import com.java.backend.utilities.ConnectivityType;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatusCode;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.*;

@Service
@Transactional
public class PatientService {
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final PatientMapper patientMapper;
    private final MedicalTestRepository medicalTestRepository;
    private final PersonRepository personRepository;
    private final MedicalTestsMapper medicalTestsMapper;
    private WebClient predictionWebClient;
    private AppointmentRepository appointmentRepository;
    private AppointmentMapper appointmentMapper;
    private final PrescriptionMapper prescriptionMapper;

    public PatientService(PatientRepository patientRepository,AppointmentMapper appointmentMapper, AppointmentRepository appointmentRepository, WebClient predictionWebClient, PatientMapper patientMapper, DoctorRepository doctorRepository, MedicalTestRepository medicalTestRepository, PersonRepository personRepository, MedicalTestsMapper medicalTestsMapper, PrescriptionMapper prescriptionMapper) {
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.patientMapper = patientMapper;
        this.predictionWebClient = predictionWebClient;
        this.medicalTestRepository = medicalTestRepository;
        this.personRepository = personRepository;
        this.appointmentRepository = appointmentRepository;
        this.medicalTestsMapper = medicalTestsMapper;
        this.appointmentMapper = appointmentMapper;
        this.prescriptionMapper = prescriptionMapper;
    }

    public Patient getPatientByEmail(String email) {
        Optional<Patient> patient = patientRepository.findByEmail(email);
        if (patient.isEmpty())
            throw new UserNotFoundException("User With Email = " + email + " Not Found");
        return patient.get();
    }

    public Map<String, String> registerNewPatient(@Valid PatientDTO patientDTO) {
        if (patientRepository.existsByEmail(patientDTO.getEmail())) {
            throw new EmailAlreadyUsedException("Email already in use!");
        }
        Patient patient = patientRepository.save(patientMapper.toPatientEntity(patientDTO, "SAVE", null));

        Map<String, String> map = new HashMap<>();
        map.put("email", patient.getEmail());
        map.put("role", patient.getRole().getName());
        return map;
    }

    public String updatePatient(@Valid PatientDTO patientDTO, String patientEmail) {
        Patient existingPatient = getPatientByEmail(patientEmail);
        Patient patient = patientMapper.toPatientEntity(patientDTO, "EDIT", existingPatient);

        patientRepository.save(patient);// return will never be null.
        return "Patient Saved successfully.";
    }

    public Appointment bookAppointment(String patientEmail, Long doctorId, ConnectivityType connectivityType, LocalDateTime appointmentTime) {
        Patient patient = patientRepository.findByEmail(patientEmail).orElseThrow(() -> new UserNotFoundException("No such Patient with this Email: " + patientEmail));

        if(patient.getMedicalTestList().isEmpty())
            throw new NoMedicalTestException("Patient must have at least one medical test to book an appointment.");


        Doctor doctor = doctorRepository.findById(doctorId).orElseThrow(() -> new UserNotFoundException("No Doctors with id: " + doctorId));
        boolean isDoctorAvailable = isDoctorAvailable(doctor, appointmentTime);
        if (!isDoctorAvailable)
            throw new DoctorNotAvailableException("Doctor is not available at this time");

        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setConnectivityType(connectivityType);
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        appointment.setTime(appointmentTime);
        if (connectivityType.equals(ConnectivityType.ONLINE)) {
            String roomName = "Dr."+doctor.getUserName() + "-patient." + patient.getUserName() + "-" + UUID.randomUUID();
            String meetingLink =
                    "https://meet.jit.si/" + roomName;
            appointment.setMeetingLink(meetingLink);
        }
        appointmentRepository.save(appointment);
        return appointment;
    }

    private boolean isDoctorAvailable(Doctor doctor, LocalDateTime appointmentTime) {
        // Assuming appointmentTime is in UTC, convert to local timezone
        ZoneId egyptZone = ZoneId.of("Africa/Cairo");
        ZonedDateTime utcDateTime = appointmentTime.atZone(ZoneId.of("UTC"));
        ZonedDateTime localDateTime = utcDateTime.withZoneSameInstant(egyptZone);
        LocalDateTime adjustedTime = localDateTime.toLocalDateTime();

        int fromDay = doctor.getFromDay().getValue();
        int toDay = doctor.getToDay().getValue();
        int appointDay = adjustedTime.getDayOfWeek().getValue();

        // Check if day is within range
        boolean isDayValid;
        if (fromDay > toDay) {
            isDayValid = appointDay <= toDay || appointDay >= fromDay;
        } else if (fromDay < toDay) {
            isDayValid = appointDay >= fromDay && appointDay <= toDay;
        } else {
            // Same day
            isDayValid = appointDay == fromDay;
        }

        if (!isDayValid) {
            return false;
        }

        // Check the time slot within the range
        LocalTime appointmentTimeOnly = adjustedTime.toLocalTime();
        boolean isTimeValid = !appointmentTimeOnly.isBefore(doctor.getFromTime())
                && !appointmentTimeOnly.isAfter(doctor.getToTime());

        return isTimeValid;
    }

    public PredictionResultDTO predictHeartDisease(PatientMedicalDataDTO patientMedicalDataDTO, String patientEmail) {
        PredictionResultDTO predictionResultDTO = predictionWebClient.post()
                .uri("/predict")
                .bodyValue(patientMedicalDataDTO)
                .retrieve().onStatus(HttpStatusCode::isError, response ->
                        response.bodyToMono(String.class)
                                .flatMap(errorBody -> {
                                    System.err.println("Python service error: " + errorBody);
                                    return Mono.error(new RuntimeException("Prediction service failed: " + errorBody));
                                })
                )
                .bodyToMono(PredictionResultDTO.class)
                .block();

        customizeResult(predictionResultDTO, patientMedicalDataDTO, patientEmail);
        return predictionResultDTO;
    }

    private void customizeResult(PredictionResultDTO predictionResultDTO, PatientMedicalDataDTO patientMedicalDataDTO, String email) {
        String diagnosis = predictionResultDTO.getDiagnosis(), recommendationMessage = "Enjoy your day!", riskCategory = "";
        Set<DoctorListItemDTO> recommendedDoctors = new LinkedHashSet<>();
        Patient patient = patientRepository.findByEmail(email).orElseThrow(() -> new UserNotFoundException("Patient not found"));
        if (diagnosis != null && !diagnosis.equals("Healthy")) {
            recommendationMessage = "Please consult a healthcare professional.";
            riskCategory = classifyRiskCategory(patientMedicalDataDTO);
            recommendedDoctors = getRecommendedDoctor(riskCategory, patient.getAddress());
        }


        predictionResultDTO.setRecommendationMsg(recommendationMessage);
        predictionResultDTO.setRiskCategory(riskCategory);
        predictionResultDTO.setRecommendedDoctors(recommendedDoctors);
        predictionResultDTO.setDateAndTime(LocalDateTime.now());
        predictionResultDTO.setBelongsTo(email);

        MedicalTest medicalTest = medicalTestsMapper.toEntity(predictionResultDTO, patientMedicalDataDTO, patient);
        medicalTestRepository.save(medicalTest);

    }

    private Set<DoctorListItemDTO> getRecommendedDoctor(String category, Address address) {
        String doctorSpecialization = "";
        switch (category) {
            case "Exercise-Induced Ischemic Risk Pattern":
                doctorSpecialization = "Sports Cardiologist";
                break;

            case "ECG Abnormality Pattern":
                doctorSpecialization = "Cardiac Electrophysiologist";
                break;

            case "Severe Cardiovascular Risk Pattern":
                doctorSpecialization = "Cardiac Surgery Unit";
                break;

            default:
                doctorSpecialization = "General Cardiologist";
        }
        Set<DoctorListItemDTO> doctorListItemDTOList = getSpecializedDoctorInArea(doctorSpecialization, address);
        return doctorListItemDTOList;
    }

    private Set<DoctorListItemDTO> getSpecializedDoctorInArea(String specialization, Address address) {
        Set<DoctorListItemDTO> doctorListItemDTOList = new LinkedHashSet<>();
        doctorListItemDTOList.addAll(personRepository.getSpecializedDoctorsBasedonState(specialization, address.getState()));
        doctorListItemDTOList.addAll(personRepository.getSpecializedDoctorsBasedonCity(specialization, address.getCity()));
        if (doctorListItemDTOList.isEmpty())
            doctorListItemDTOList.addAll(personRepository.getSpecializedDoctorsBasedonCountry(specialization, address.getCountry()));
        return doctorListItemDTOList;
    }

    private String classifyRiskCategory(PatientMedicalDataDTO medicalData) {
        if (medicalData.getExang() == 1 && medicalData.getOldpeak() > 2.0)
            return "Exercise-Induced Ischemic Risk Pattern";

        else if (medicalData.getChol() > 240 && medicalData.getCp() >= 3)
            return "Atherosclerotic Risk Pattern";

        else if (medicalData.getTrestbps() >= 140)
            return "Hypertensive Cardiac Stress Pattern";

        else if (medicalData.getFbs() == 1 && medicalData.getCp() >= 2)
            return "Diabetes-Associated Cardiac Risk";

        else if (medicalData.getRestecg() > 1)
            return "ECG Abnormality Pattern";

        else if (medicalData.getThal() < 120 && medicalData.getOldpeak() > 1.0)
            return "Reduced Cardiac Performance Pattern";

        else if (medicalData.getCa() >= 2 || medicalData.getThal() >= 6)
            return "Severe Cardiovascular Risk Pattern";

        return "General Cardiac Risk Pattern";
    }

    public List<AppointmentListPatientViewDTO> getPatientAppointment(String email) {
        Patient patient = patientRepository.findByEmail(email).orElseThrow(()-> new UserNotFoundException("Patient with email: "+email+" not found"));
        List<Appointment> appointmentListPatientViewDTOS = Optional.ofNullable(patient.getAppointments()).orElse(new ArrayList<>());
        List<AppointmentListPatientViewDTO> DTOS2 = new ArrayList<>();
        for(Appointment appointment : appointmentListPatientViewDTOS){
            AppointmentListPatientViewDTO dto = appointmentMapper.toAppointmentListPatientViewDTO(appointment);
            DTOS2.add(dto);
        }
        return DTOS2;
    }

    public List<PatientMedicalTestsViewDTO> getPatientMedicalTests(String email) {
        Patient patient = patientRepository.findByEmail(email).orElseThrow(()-> new UserNotFoundException("Patient with email: "+email+" not found"));
        List<PatientMedicalTestsViewDTO> patientMedicalTestsViewDTOS = Optional.ofNullable(patient.getMedicalTestList()).orElse(new ArrayList<>()).stream().map(medicalTestsMapper :: toDTO).toList();
        return patientMedicalTestsViewDTOS;
    }

    public List<PrescriptionDTO> getPatientPrescriptions(String email) {
        Patient patient = patientRepository.findByEmail(email).orElseThrow(() -> new UserNotFoundException("Patient with email: " + email + " not found"));
        return Optional.ofNullable(patient.getPrescriptions()).orElse(new ArrayList<>()).stream().map(prescriptionMapper::toDTO).toList();
    }

    public void cancelAppointment(Long appointmentId) {
       //TODO: make sure that this appointment belongs to the authenticated patient.
        Appointment appointment = appointmentRepository.findById(appointmentId).orElseThrow(() -> new UserNotFoundException("No appointment with this id "+ appointmentId));
        if(appointment.getStatus().equals(AppointmentStatus.CONFIRMED)){
            appointment.setStatus(AppointmentStatus.CANCELLED);
            appointmentRepository.save(appointment);
        }
    }
}
