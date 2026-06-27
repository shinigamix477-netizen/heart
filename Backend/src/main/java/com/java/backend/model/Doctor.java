package com.java.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.ToString;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@ToString(exclude = {"appointments"})
public class Doctor extends Person{

    @NotNull(message = "Specialization can not be null")
    @Size(min = 3, message = "At least 3 characters in Specialization")
    private String specialization;

    @NotNull(message = "From day cannot be null")
    @Enumerated(EnumType.STRING)
    private DayOfWeek fromDay;

    @NotNull(message = "To day cannot be null")
    @Enumerated(EnumType.STRING)
    private DayOfWeek toDay;

    @NotNull(message = "From time cannot be null")
    private LocalTime fromTime;

    @NotNull(message = "To time cannot be null")
    private LocalTime toTime;

    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL)
    private List<Appointment> appointments = new ArrayList<>();

}
