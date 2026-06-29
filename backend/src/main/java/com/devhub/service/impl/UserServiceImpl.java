package com.devhub.service.impl;

import com.devhub.dto.UserRegistrationDto;
import com.devhub.dto.UserResponse;
import com.devhub.entity.User;
import com.devhub.exception.ResourceNotFoundException;
import com.devhub.repository.UserRepository;
import com.devhub.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void registerUser(UserRegistrationDto dto) {
        log.info("Attempting to register user: {}", dto.getUsername());

        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new IllegalArgumentException("Username is already taken.");
        }

        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Email is already registered.");
        }

        User user = User.builder()
                .username(dto.getUsername().trim())
                .email(dto.getEmail().trim())
                .password(passwordEncoder.encode(dto.getPassword()))
                .profileImageUrl("https://api.dicebear.com/7.x/bottts/svg?seed=" + dto.getUsername().trim())
                .karmaPoints(0)
                .build();

        userRepository.save(user);
        log.info("User {} registered successfully.", user.getUsername());
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .bio(user.getBio())
                .profileImageUrl(user.getProfileImageUrl())
                .karmaPoints(user.getKarmaPoints())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
