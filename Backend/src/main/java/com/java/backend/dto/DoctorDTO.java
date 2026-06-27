package com.java.backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import org.hibernate.validator.constraints.Range;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
public class DoctorDTO {
    private Long id;

    @Size(min = 3, message = "at least 3 characters required in the name")
    private String name;

    @Size(min = 3, message = "at least 3 characters required in the password")
    private String userName;

    @Email(message = "Email is Invalid")
    @Pattern(
            regexp = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$",
            message = "Email must contain a valid domain like .com or .net"
    )
    private String email;

    @Size(min = 5, message = "at least 5 characters required in the password")
    private String password;

// TODO:   Add photo attribute;

    @NotBlank(message = "Phone number is required")
    @Pattern(
            regexp = "^(?:\\+20|20|0)?1(0|1|2|5)[0-9]{8}$",
            message = "Invalid Egyptian mobile number!"
    )
    private String contactNumber;

    @Range(min = 0, max = 150, message = "Age must be between 0 and 150")
    private Integer age;

    @NotBlank(message = "Street is required")
    @Size(min = 3, max = 100)
    private String streetAddress;

    @NotBlank(message = "City is required")
    @Size(min = 2, max = 50)
    private String city;

    @NotBlank(message = "State is required")
    @Size(min = 2, max = 50)
    private String state;

    @NotBlank(message = "Country is required")
    private String country;

    @NotNull(message = "Specialization can not be null")
    @Size(min = 3, message = "At least 3 characters in Specialization")
    private String specialization;

    @NotNull(message = "From day cannot be null")
    private DayOfWeek fromDay;

    @NotNull(message = "To day cannot be null")
    private DayOfWeek toDay;

    @NotNull(message = "From time cannot be null")
    private LocalTime fromTime;

    @NotNull(message = "To time cannot be null")
    private LocalTime toTime;

}

