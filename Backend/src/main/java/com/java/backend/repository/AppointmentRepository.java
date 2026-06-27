package com.java.backend.repository;

import com.java.backend.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Repository
@Transactional
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    @Modifying
    @Query("UPDATE Appointment a SET a.status = 'PASSED' WHERE a.time < CURRENT_TIMESTAMP AND a.status = 'CONFIRMED'")
    void updateAppointmentsStatus();

    @Modifying
    @Query(" DELETE FROM Appointment a WHERE a.status IN ('PASSED','CANCELLED') AND (a.time  < :cutoffTime)")
    void deletePassedAndCancelledAppointmentsBy2Days(@Param("cutoffTime") LocalDateTime cutoffTime);

}
