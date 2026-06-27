package com.java.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.Range;

import java.util.List;

@Data
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
public class Person {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    @Size(min = 3, message = "at least 3 characters required in the name")
    private String name;

    @Column(nullable = false)
    @Size(min = 3, message = "at least 3 characters required in the password")
    private String userName;

    @Column(nullable = false,unique = true)
    @Email(message = "Email is Invalid")
    @Pattern(
            regexp = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$",
            message = "Email must contain a valid domain like .com or .net"
    )
    private String email;

    @Column(nullable = false)
    @Size(min = 5, message = "at least 5 characters required in the password")
    private String password;

    @Column(nullable = false)
    @Pattern(regexp = "^\\+?[0-9]{10,15}$",message = "Invalid Contact Number!")
    private String contactNumber;

    @Range(min = 0, max = 150, message = "Age must be between 0 and 150")
    private Integer age;

    @ManyToOne(cascade = CascadeType.PERSIST)
    @JoinColumn // default: nullable = true
    private Address address;//one to one- uni

    @ManyToOne
    @JoinColumn(nullable = false)
    private Role role;//Many to one - uni
}
