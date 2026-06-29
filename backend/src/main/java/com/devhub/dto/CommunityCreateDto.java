package com.devhub.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CommunityCreateDto {
    @NotBlank(message = "Community name is required")
    @Size(min = 3, max = 50, message = "Community name must be between 3 and 50 characters")
    private String name;

    @NotBlank(message = "Description is required")
    @Size(min = 10, message = "Description must be at least 10 characters")
    private String description;
}
