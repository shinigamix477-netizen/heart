package com.java.backend.mapper;

import com.java.backend.dto.DoctorDTO;
import com.java.backend.dto.DoctorListItemDTO;
import com.java.backend.model.Address;
import com.java.backend.model.Doctor;
import com.java.backend.repository.RoleRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DoctorMapper {
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public DoctorMapper(RoleRepository roleRepository, PasswordEncoder passwordEncoder){
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public DoctorListItemDTO toDoctorListItemDTO(Doctor doctor) {
        if (doctor == null) {
            return null;
        }

        DoctorListItemDTO dto = new DoctorListItemDTO();

        dto.setId(doctor.getId());
        dto.setName(doctor.getName());
        dto.setContactNumber(doctor.getContactNumber());

        Address address = doctor.getAddress();

        dto.setStreetAddress(address.getStreetAddress());
        dto.setCity(address.getCity());
        dto.setState(address.getState());
        dto.setCountry(address.getCountry());

        dto.setSpecialization(doctor.getSpecialization());
        dto.setFromDay(doctor.getFromDay());
        dto.setToDay(doctor.getToDay());
        dto.setFromTime(doctor.getFromTime());
        dto.setToTime(doctor.getToTime());


        return dto;
    }

    public Doctor toDoctorEntity(DoctorDTO dto) {
        if (dto == null) {
            return null;
        }

        Doctor doctor = new Doctor();

        // Mapping Fields from Person (inherited)
        doctor.setName(dto.getName());
        doctor.setUserName(dto.getUserName());
        doctor.setEmail(dto.getEmail());
        doctor.setPassword(passwordEncoder.encode(dto.getPassword()));
        doctor.setContactNumber(dto.getContactNumber());
        doctor.setAge(dto.getAge());

        // Mapping Address (Assuming you have an Address object in Doctor/Person)
        Address address = new Address();
        address.setStreetAddress(dto.getStreetAddress());
        address.setCity(dto.getCity());
        address.setState(dto.getState());
        address.setCountry(dto.getCountry());
        doctor.setAddress(address);

        // Mapping Doctor-specific fields
        doctor.setSpecialization(dto.getSpecialization());
        doctor.setFromDay(dto.getFromDay());
        doctor.setToDay(dto.getToDay());
        doctor.setFromTime(dto.getFromTime());
        doctor.setToTime(dto.getToTime());
        
        roleRepository.findByName("DOCTOR")
                .ifPresent(doctor::setRole);

        return doctor;
    }
}
