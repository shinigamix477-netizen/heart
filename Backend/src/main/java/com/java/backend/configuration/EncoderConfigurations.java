package com.java.backend.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;


@Configuration
public class EncoderConfigurations {
    @Bean
    @Lazy
    PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }
}
