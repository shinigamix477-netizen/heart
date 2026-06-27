package com.java.backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PatientListItemDTO {

    private Long id;
    private String patientName;

//  private String photo;
@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime BookingDateAndTime;
}
