package com.devhub.controller;

import com.devhub.dto.CommunityCreateDto;
import com.devhub.dto.CommunityResponse;
import com.devhub.service.CommunityService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/communities")
@Slf4j
public class CommunityController {

    private final CommunityService communityService;

    public CommunityController(CommunityService communityService) {
        this.communityService = communityService;
    }

    @GetMapping
    public ResponseEntity<List<CommunityResponse>> getAllCommunities(Principal principal) {
        String username = principal != null ? principal.getName() : null;
        return ResponseEntity.ok(communityService.getAllCommunities(username));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CommunityResponse> getCommunityById(@PathVariable Long id, Principal principal) {
        String username = principal != null ? principal.getName() : null;
        return ResponseEntity.ok(communityService.getCommunityById(id, username));
    }

    @PostMapping
    public ResponseEntity<CommunityResponse> createCommunity(@Valid @RequestBody CommunityCreateDto dto, Principal principal) {
        log.info("Request to create community by user: {}", principal.getName());
        CommunityResponse response = communityService.createCommunity(dto, principal.getName());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<Map<String, String>> joinCommunity(@PathVariable Long id, Principal principal) {
        log.info("User {} joining community ID: {}", principal.getName(), id);
        communityService.joinCommunity(id, principal.getName());
        Map<String, String> response = new HashMap<>();
        response.put("message", "Community membership toggled successfully!");
        return ResponseEntity.ok(response);
    }
}
