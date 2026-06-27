package com.java.backend.dto;

import com.java.backend.utilities.AppointmentStatus;
import com.java.backend.utilities.ConnectivityType;
import lombok.Data;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@Data
public class AppointmentListAdminViewDTO {
    private Long id;
    private String patientName;
    private String doctorName;
    private LocalDateTime appointmentTime;
    private AppointmentStatus status;
    private ConnectivityType connectivityType;
    private String meetingLink;
}
