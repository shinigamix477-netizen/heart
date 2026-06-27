package com.java.backend.service;

import com.java.backend.exception.UserNotFoundException;
import com.java.backend.model.Person;
import com.java.backend.repository.PersonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {
   @Autowired
   PersonRepository personRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<Person> person = personRepository.findByEmail(username);
        if(person.isEmpty())
            throw new UserNotFoundException("UD: Email or Password not correct!");
        return User.withUsername(username)
                .password(person.get().getPassword())
                .roles(person.get().getRole().getName())
                .build();
    }
}
