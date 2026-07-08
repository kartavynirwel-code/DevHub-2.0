package com.devhub.service;

import com.devhub.dto.CommentResponse;
import java.util.List;

public interface CommentService {
    CommentResponse addComment(Long postId, String content, Long parentId, String username);
    List<CommentResponse> getPostComments(Long postId);
    CommentResponse getCommentById(Long id);
    void deleteComment(Long id, String username);
}
