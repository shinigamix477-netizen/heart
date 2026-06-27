package com.java.backend.repository;

import com.java.backend.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    Optional<Doctor> findByEmail(String  email);
    boolean existsByEmail(String email);

    Optional<Doctor>  findByName(String doctorName);
}
