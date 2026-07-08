package com.devhub.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CommunityResponse {
    private Long id;
    private String name;
    private String description;
    private String createdByUsername;
    private Integer membersCount;
    private LocalDateTime createdAt;
    private Boolean isJoined;
}
