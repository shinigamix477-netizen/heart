package com.java.backend.service;

import com.java.backend.dto.AppointmentListAdminViewDTO;
import com.java.backend.dto.DoctorDTO;
import com.java.backend.dto.PatientMedicalTestsViewDTO;
import com.java.backend.dto.PersonDTO;
import com.java.backend.exception.EmailAlreadyUsedException;
import com.java.backend.exception.UserNotFoundException;
import com.java.backend.mapper.AppointmentMapper;
import com.java.backend.mapper.DoctorMapper;
import com.java.backend.mapper.MedicalTestsMapper;
import com.java.backend.mapper.PersonMapper;
import com.java.backend.model.Appointment;
import com.java.backend.model.Doctor;
import com.java.backend.model.MedicalTest;
import com.java.backend.model.Person;
import com.java.backend.repository.*;
import com.java.backend.utilities.AppointmentStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import org.springframework.data.querydsl.ListQuerydslPredicateExecutor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
 @Transactional
public class AdminService {
    private final PersonRepository personRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final MedicalTestRepository medicalTestRepository;
    private final DoctorMapper doctorMapper;
    private final PersonMapper personMapper;
    private final AdminRepository adminRepository;
    private MedicalTestsMapper medicalTestsMapper;
    private AppointmentRepository appointmentRepository;
    private AppointmentMapper appointmentMapper;

    public AdminService(PersonRepository personRepository, AppointmentMapper appointmentMapper, AppointmentRepository appointmentRepository, MedicalTestsMapper medicalTestsMapper, MedicalTestRepository medicalTestRepository, DoctorRepository doctorRepository, PatientRepository patientRepository, DoctorMapper doctorMapper, PersonMapper personMapper, AdminRepository adminRepository) {
        this.personRepository = personRepository;
        this.medicalTestRepository = medicalTestRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.doctorMapper = doctorMapper;
        this.personMapper = personMapper;
        this.medicalTestsMapper = medicalTestsMapper;
        this.appointmentRepository = appointmentRepository;
        this.appointmentMapper = appointmentMapper;
        this.adminRepository = adminRepository;
    }

    public List<PersonDTO> getAllUsersExceptAdmins() {
        //get all users except admins from person repository
        List<Person> users = personRepository.findAllExceptAdmins();
        return  users.stream().map(personMapper::toDto).toList();
    }

    public PersonDTO viewUser(Long id) {
        return personRepository.findById(id)
                .filter(person -> !person.getRole().getName().equals("ADMIN"))
                .map(personMapper::toDto)
                .orElseThrow(() -> new UserNotFoundException("No users with id: " + id));
    }

    public void deleteUser(Long id) {
        Optional<Person> person = personRepository.findById(id);

        if(person.isEmpty() || person.get().getRole().getName().equals("ADMIN"))
            throw new UserNotFoundException("No users with id: "+id);


        personRepository.deleteById(id);
        if(person.get().getRole().getName().equals("DOCTOR")) {
            doctorRepository.deleteById(id);
        }else {
            patientRepository.deleteById(id);
        }
    }

    public List<PatientMedicalTestsViewDTO> getMedicalTestsDTOS() {
        List<MedicalTest> medicalTestList =  medicalTestRepository.findAll();
        return medicalTestList.stream().map(medicalTestsMapper::toDTO).toList();
    }

    public Map<String, String> registerNewDoctor(DoctorDTO doctorDTO) {
        if(doctorRepository.existsByEmail(doctorDTO.getEmail())){
            throw new EmailAlreadyUsedException("Email already in use!");
        }
        Doctor doctor = doctorRepository.save(doctorMapper.toDoctorEntity(doctorDTO));

        Map<String, String> map = new HashMap<>();
        map.put("message","Registered Successfully");
        map.put("role",doctor.getRole().getName());
        return map;
    }

    public List<AppointmentListAdminViewDTO> getAllAppointment() {
        List<AppointmentListAdminViewDTO> appointmentListAdminViewDTOS =
                appointmentRepository.findAll().stream().map(appointmentMapper:: toAppointmentListAdminViewDTO).toList();
        return appointmentListAdminViewDTOS;
    }

    public void deleteAppointmentById(Long appointmentId) {
        appointmentRepository.deleteById(appointmentId);
    }

    public String getUserRole(String email) {
      Person person =  adminRepository.findByEmail(email).orElseThrow(() -> new UserNotFoundException("No such user with this email"));
      return person.getRole().getName();
    }
}
