package com.devhub.service;

import com.devhub.dto.UserRegistrationDto;
import com.devhub.dto.UserResponse;

public interface UserService {
    void registerUser(UserRegistrationDto dto);
    UserResponse getProfile(String username);
}
