package com.java.backend.controller;

import com.java.backend.dto.LoginRequestDTO;
import com.java.backend.service.AdminService;
import com.java.backend.service.AppointmentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import java.net.http.HttpRequest;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthenticationController {

    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository securityContextRepository = new HttpSessionSecurityContextRepository(); // Use this for sessions
    private final AdminService adminService;
    private final AppointmentService appointmentService;

    public AuthenticationController(AuthenticationManager authenticationManager, AdminService adminService, AppointmentService appointmentService){
        this.authenticationManager= authenticationManager;
        this.adminService = adminService;
        this.appointmentService = appointmentService;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String,String>> login(@RequestBody @Valid LoginRequestDTO loginRequestDTO, HttpServletRequest httpRequest, HttpServletResponse httpResponse){
        // 1. Authenticate the user
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequestDTO.email(), loginRequestDTO.password())
        );

        // 2. Create and set the SecurityContext
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);

        // 3. IMPORTANT: Explicitly save the context to the session repository
        securityContextRepository.saveContext(context, httpRequest, httpResponse);

        // update appointments
        appointmentService.updateAppointments();

        return ResponseEntity.ok(Map.of("email",loginRequestDTO.email(), "role", adminService.getUserRole(loginRequestDTO.email())));
    }



    @GetMapping("/logout")
    public ResponseEntity<Map<String,String> >logout(HttpServletRequest request, @AuthenticationPrincipal UserDetails userDetails){
        if(userDetails == null)
            return ResponseEntity.ok(Map.of("message", "Error: No Logged in users to Logged out!!"));


        String email = userDetails.getUsername();

        HttpSession session = request.getSession(false);
        if(session != null)
            session.invalidate();
        return ResponseEntity.ok(Map.of("message", "Logged Out Successfully!\nSee you later "+email));

    }
}
