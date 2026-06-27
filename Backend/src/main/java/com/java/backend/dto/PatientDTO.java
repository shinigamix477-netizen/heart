package com.java.backend.dto;

import com.java.backend.model.Appointment;
import com.java.backend.model.MedicalTest;
import jakarta.validation.constraints.*;
import lombok.Data;
import org.hibernate.validator.constraints.Range;

import java.util.List;


@Data
public class PatientDTO {

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

    private String password;

    @NotBlank(message = "Phone number is required")
    @Pattern(
            regexp = "^(?:\\+20|20|0)?1(0|1|2|5)[0-9]{8}$",
            message = "Invalid Egyptian mobile number!"
    )
   private String contactNumber;

    @NotBlank(message = "Street is required")
    @Size(min = 3, max = 100)
    private String streetAddress;

    @NotBlank(message = "City is required")
    @Size(min = 2, max = 50)
    private String city;

    @NotBlank(message = "State is required")
    @Size(min = 2, max = 50)
    private String state;

    @Range(min = 0, max = 150, message = "Age must be between 0 and 150")
    private Integer age;

    @NotBlank(message = "Country is required")
    private String country;

}