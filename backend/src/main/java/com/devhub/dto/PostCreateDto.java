package com.devhub.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class PostCreateDto {
    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title cannot exceed 200 characters")
    private String title;

    @NotBlank(message = "Content is required")
    private String content;

    @NotNull(message = "Community ID is required")
    private Long communityId;
}
