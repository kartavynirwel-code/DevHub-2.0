package com.devhub.controller;

import com.devhub.dto.*;
import com.devhub.entity.Vote;
import com.devhub.service.CommentService;
import com.devhub.service.PostService;
import com.devhub.service.VoteService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/posts")
@Slf4j
public class PostController {

    private final PostService postService;
    private final CommentService commentService;
    private final VoteService voteService;

    public PostController(PostService postService,
                          CommentService commentService,
                          VoteService voteService) {
        this.postService = postService;
        this.commentService = commentService;
        this.voteService = voteService;
    }

    @GetMapping
    public ResponseEntity<Page<PostResponse>> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "new") String sortBy,
            @RequestParam(required = false) Long communityId,
            Principal principal) {

        String username = principal != null ? principal.getName() : null;
        Pageable pageable = PageRequest.of(page, size);

        if (communityId != null) {
            return ResponseEntity.ok(postService.getPostsByCommunity(communityId, pageable, sortBy, username));
        }
        return ResponseEntity.ok(postService.getAllPosts(pageable, sortBy, username));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<PostResponse>> searchPosts(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Principal principal) {

        String username = principal != null ? principal.getName() : null;
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(postService.searchPosts(keyword, pageable, username));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostResponse> getPostById(@PathVariable Long id, Principal principal) {
        String username = principal != null ? principal.getName() : null;
        return ResponseEntity.ok(postService.getPostById(id, username));
    }

    @PostMapping
    public ResponseEntity<PostResponse> createPost(@Valid @RequestBody PostCreateDto dto, Principal principal) {
        log.info("Request to create post by user: {}", principal.getName());
        PostResponse response = postService.createPost(dto, principal.getName());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/{id}/vote")
    public ResponseEntity<Map<String, Object>> handleVote(
            @PathVariable Long id,
            @RequestParam Vote.VoteType type,
            Principal principal) {

        log.info("User {} voted {} on post ID: {}", principal.getName(), type, id);
        voteService.castVote(id, principal.getName(), type);

        Integer newScore = voteService.getPostScore(id);
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Vote cast successfully");
        response.put("score", newScore);
        return ResponseEntity.ok(response);
    }

    // Comment Endpoints
    @GetMapping("/{id}/comments")
    public ResponseEntity<List<CommentResponse>> getPostComments(@PathVariable Long id) {
        return ResponseEntity.ok(commentService.getPostComments(id));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable Long id,
            @Valid @RequestBody CommentRequest request,
            Principal principal) {

        log.info("User {} adding comment to post ID: {}", principal.getName(), id);
        CommentResponse response = commentService.addComment(id, request.getContent(), request.getParentId(), principal.getName());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Map<String, String>> deleteComment(
            @PathVariable Long commentId,
            Principal principal) {

        log.info("User {} request to delete comment ID: {}", principal.getName(), commentId);
        commentService.deleteComment(commentId, principal.getName());
        Map<String, String> response = new HashMap<>();
        response.put("message", "Comment deleted successfully");
        return ResponseEntity.ok(response);
    }
}
