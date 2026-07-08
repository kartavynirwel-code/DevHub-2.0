package com.devhub.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private String bio;
    private String profileImageUrl;
    private Integer karmaPoints;
    private LocalDateTime createdAt;
}
