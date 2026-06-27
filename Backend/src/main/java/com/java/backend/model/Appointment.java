package com.java.backend.model;

import com.java.backend.utilities.AppointmentStatus;
import com.java.backend.utilities.ConnectivityType;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Entity
@Data
@ToString(exclude = {"patient", "doctor"})
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    private Patient patient;

    @ManyToOne
    private Doctor doctor;

    private LocalDateTime time;

    @NotNull(message = "Connectivity type cannot be null")
    @Enumerated(EnumType.STRING)
    private ConnectivityType connectivityType;

    @NotNull(message = "Status cannot be null")
    @Enumerated(EnumType.STRING)
    private AppointmentStatus status;

    @Nullable
    private String meetingLink;
}
