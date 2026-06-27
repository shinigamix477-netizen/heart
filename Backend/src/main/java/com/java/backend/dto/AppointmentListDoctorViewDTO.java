package com.java.backend.dto;

import com.java.backend.utilities.AppointmentStatus;
import com.java.backend.utilities.ConnectivityType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AppointmentListDoctorViewDTO {
    private Long appointmentId;
    private String patientName;
    private LocalDateTime time;
    private ConnectivityType connectivityType;
    private AppointmentStatus appointmentStatus;
    private String meetingLink;
}
