package com.java.backend.mapper;

import com.java.backend.dto.AppointmentListAdminViewDTO;
import com.java.backend.dto.AppointmentListDoctorViewDTO;
import com.java.backend.dto.AppointmentListPatientViewDTO;
import com.java.backend.model.Appointment;
import org.springframework.stereotype.Component;

@Component
public class AppointmentMapper {
    public AppointmentListDoctorViewDTO toAppointmentListDoctorViewDTO(Appointment appointment) {
        if (appointment == null) {
            return null;
        }

      AppointmentListDoctorViewDTO dto = new AppointmentListDoctorViewDTO();

        if (appointment.getPatient() != null) {
            dto.setAppointmentId(appointment.getId());
            dto.setPatientName(appointment.getPatient().getName());
        }

        dto.setTime(appointment.getTime());
        dto.setConnectivityType(appointment.getConnectivityType());
        dto.setAppointmentStatus(appointment.getStatus());
        dto.setMeetingLink(appointment.getMeetingLink());

        return dto;
    }

    public AppointmentListPatientViewDTO toAppointmentListPatientViewDTO(Appointment appointment) {
        if (appointment == null) {
            return null;
        }

        AppointmentListPatientViewDTO dto = new AppointmentListPatientViewDTO();
        dto.setAppointmentId(appointment.getId());

        if (appointment.getDoctor() != null) {
            dto.setDoctorName(appointment.getDoctor().getName());
        }

        dto.setTime(appointment.getTime());
        dto.setConnectivityType(appointment.getConnectivityType());
        dto.setAppointmentStatus(appointment.getStatus());
        dto.setMeetingLink(appointment.getMeetingLink());

        return dto;
    }
    public AppointmentListAdminViewDTO toAppointmentListAdminViewDTO(Appointment appointment) {
        if (appointment == null) {
            return null;
        }

        AppointmentListAdminViewDTO dto = new AppointmentListAdminViewDTO();
        dto.setId(appointment.getId());
        if (appointment.getPatient() != null) {
            dto.setPatientName(appointment.getPatient().getName());
        }
        if (appointment.getDoctor() != null) {
            dto.setDoctorName(appointment.getDoctor().getName());
        }
        dto.setAppointmentTime(appointment.getTime());
        dto.setStatus(appointment.getStatus());
        dto.setConnectivityType(appointment.getConnectivityType());
        dto.setMeetingLink(appointment.getMeetingLink());

        return dto;
    }
}
