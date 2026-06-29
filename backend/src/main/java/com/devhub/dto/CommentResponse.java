package com.devhub.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CommentResponse {
    private Long id;
    private String content;
    private String authorUsername;
    private Long postId;
    private Long parentId;
    private List<CommentResponse> replies;
    private LocalDateTime createdAt;
}
