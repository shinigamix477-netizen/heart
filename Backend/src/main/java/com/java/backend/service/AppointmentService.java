package com.java.backend.service;

import com.java.backend.repository.AppointmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Transactional
public class AppointmentService {

    private AppointmentRepository appointmentRepository;

    public AppointmentService(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    public void updateAppointments() {
        appointmentRepository.updateAppointmentsStatus();
        LocalDateTime cutoffTime = LocalDateTime.now().minusDays(2);
        appointmentRepository.deletePassedAndCancelledAppointmentsBy2Days(cutoffTime);
    }
}
