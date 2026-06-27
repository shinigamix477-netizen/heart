package com.java.backend.repository;

import com.java.backend.dto.DoctorListItemDTO;
import com.java.backend.model.Person;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PersonRepository extends JpaRepository<Person,Long> {
    Optional<Person> findByEmail(String username);

    @Query("SELECT p FROM Person p WHERE p.role.name <> 'ADMIN'")
    List<Person> findAllExceptAdmins();

    @Query(""" 
                SELECT new com.java.backend.dto.DoctorListItemDTO(
                d.id, d.name, d.contactNumber, d.address.streetAddress,
                d.address.city, d.address.state, d.address.country, d.specialization, d.fromDay, d.toDay, d.fromTime, d.toTime) 
                FROM Doctor d
                WHERE d.address.state = :state AND d.specialization = :specialization """)
    List<DoctorListItemDTO> getSpecializedDoctorsBasedonState(@Param("specialization") String specialization, @Param("state") String state);

    @Query(""" 
                SELECT new com.java.backend.dto.DoctorListItemDTO(
                d.id, d.name, d.contactNumber, d.address.streetAddress,
                d.address.city, d.address.state, d.address.country, d.specialization, d.fromDay, d.toDay, d.fromTime, d.toTime) 
                FROM Doctor d
                WHERE d.address.city = :city AND d.specialization = :specialization """)
    List<DoctorListItemDTO> getSpecializedDoctorsBasedonCity(@Param("specialization") String specialization, @Param("city") String city);

    @Query(""" 
                SELECT new com.java.backend.dto.DoctorListItemDTO(
                d.id, d.name, d.contactNumber, d.address.streetAddress,
                d.address.city, d.address.state, d.address.country, d.specialization, d.fromDay, d.toDay, d.fromTime, d.toTime) 
                FROM Doctor d
                WHERE d.address.country = :country AND d.specialization = :specialization """)
    List<DoctorListItemDTO> getSpecializedDoctorsBasedonCountry(@Param("specialization") String specialization, @Param("country") String country);

}
