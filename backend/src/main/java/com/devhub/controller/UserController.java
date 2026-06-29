package com.devhub.controller;

import com.devhub.dto.PostResponse;
import com.devhub.dto.UserResponse;
import com.devhub.service.PostService;
import com.devhub.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/users")
@Slf4j
public class UserController {

    private final UserService userService;
    private final PostService postService;

    public UserController(UserService userService, PostService postService) {
        this.userService = userService;
        this.postService = postService;
    }

    @GetMapping("/{username}")
    public ResponseEntity<UserResponse> getUserProfile(@PathVariable String username) {
        log.info("Requesting profile for username: {}", username);
        UserResponse response = userService.getProfile(username);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{username}/posts")
    public ResponseEntity<Page<PostResponse>> getUserPosts(
            @PathVariable String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Principal principal) {

        log.info("Requesting posts for username: {}", username);
        String currentUsername = principal != null ? principal.getName() : null;
        Pageable pageable = PageRequest.of(page, size);
        Page<PostResponse> posts = postService.getPostsByAuthor(username, pageable, currentUsername);
        return ResponseEntity.ok(posts);
    }
}
