package com.devhub.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PostResponse {
    private Long id;
    private String title;
    private String content;
    private String authorUsername;
    private Long communityId;
    private String communityName;
    private Integer upvotes;
    private Integer downvotes;
    private Integer score;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer commentsCount;
    private String userVote;
}
