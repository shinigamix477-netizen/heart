package com.java.backend.aspects;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RequestParam;

import java.lang.reflect.Parameter;

@Aspect
@Component
public class CheckAuthoritiesAspect {

    @Before("execution(* com.java.backend.controller.DoctorController.*(..))")
    public void checkDoctorAuthorization(JoinPoint joinPoint){
        String authorizedDoctorEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Object[] args = joinPoint.getArgs();
        String inputDoctorEmail = (String) args[0];

        if(!authorizedDoctorEmail.equals(inputDoctorEmail))
            throw new IllegalCallerException("Doctor with email " + inputDoctorEmail + " is not authorized");
    }

    @Before("!execution(* com.java.backend.controller.PatientController.register(..)) && "+"execution(* com.java.backend.controller.PatientController.*(..))")
    public void checkPatientAuthorization(JoinPoint joinPoint){
        String authorizedPatientEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Object[] args = joinPoint.getArgs();
        String inputPatientEmail = (String) args[0];

        if(!authorizedPatientEmail.equals(inputPatientEmail))
            throw new IllegalCallerException("Patient with email " + inputPatientEmail + " is not authorized");
    }
}
