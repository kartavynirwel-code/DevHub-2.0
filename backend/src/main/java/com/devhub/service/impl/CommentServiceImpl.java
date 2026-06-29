package com.devhub.service.impl;

import com.devhub.dto.CommentResponse;
import com.devhub.entity.Comment;
import com.devhub.entity.Post;
import com.devhub.entity.User;
import com.devhub.exception.ResourceNotFoundException;
import com.devhub.repository.CommentRepository;
import com.devhub.repository.PostRepository;
import com.devhub.repository.UserRepository;
import com.devhub.service.CommentService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public CommentServiceImpl(CommentRepository commentRepository,
                              PostRepository postRepository,
                              UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public CommentResponse addComment(Long postId, String content, Long parentId, String username) {
        log.info("User {} adding comment to post ID: {}", username, postId);

        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException("Comment content cannot be empty.");
        }

        User author = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with ID: " + postId));

        Comment parentComment = null;
        if (parentId != null) {
            parentComment = commentRepository.findById(parentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Parent comment not found with ID: " + parentId));
        }

        Comment comment = Comment.builder()
                .content(content.trim())
                .author(author)
                .post(post)
                .parentComment(parentComment)
                .build();

        Comment saved = commentRepository.save(comment);
        return mapToCommentResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommentResponse> getPostComments(Long postId) {
        if (!postRepository.existsById(postId)) {
            throw new ResourceNotFoundException("Post not found with ID: " + postId);
        }
        // Fetch only top level comments for the post
        List<Comment> topLevelComments = commentRepository.findByPostIdAndParentCommentIsNull(postId);
        return topLevelComments.stream()
                .map(this::mapToCommentResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CommentResponse getCommentById(Long id) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with ID: " + id));
        return mapToCommentResponse(comment);
    }

    @Override
    @Transactional
    public void deleteComment(Long id, String username) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with ID: " + id));

        if (!comment.getAuthor().getUsername().equals(username)) {
            throw new IllegalArgumentException("You can only delete your own comments.");
        }

        commentRepository.delete(comment);
    }

    private CommentResponse mapToCommentResponse(Comment comment) {
        if (comment == null) {
            return null;
        }

        List<CommentResponse> replies = null;
        if (comment.getReplies() != null) {
            replies = comment.getReplies().stream()
                    .map(this::mapToCommentResponse)
                    .collect(Collectors.toList());
        }

        return CommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .authorUsername(comment.getAuthor().getUsername())
                .postId(comment.getPost().getId())
                .parentId(comment.getParentComment() != null ? comment.getParentComment().getId() : null)
                .replies(replies)
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
