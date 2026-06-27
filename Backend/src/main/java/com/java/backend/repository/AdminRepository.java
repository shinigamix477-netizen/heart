package com.java.backend.repository;

import com.java.backend.model.Person;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdminRepository extends JpaRepository<Person, Long> {

    Optional<Person> findByEmail(String email);
}
