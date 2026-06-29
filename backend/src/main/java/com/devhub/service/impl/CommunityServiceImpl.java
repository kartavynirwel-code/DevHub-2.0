package com.devhub.service.impl;

import com.devhub.dto.CommunityCreateDto;
import com.devhub.dto.CommunityResponse;
import com.devhub.entity.Community;
import com.devhub.entity.User;
import com.devhub.exception.ResourceNotFoundException;
import com.devhub.repository.CommunityRepository;
import com.devhub.repository.UserRepository;
import com.devhub.service.CommunityService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class CommunityServiceImpl implements CommunityService {

    private final CommunityRepository communityRepository;
    private final UserRepository userRepository;

    public CommunityServiceImpl(CommunityRepository communityRepository, UserRepository userRepository) {
        this.communityRepository = communityRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public CommunityResponse createCommunity(CommunityCreateDto dto, String username) {
        log.info("User {} is creating community: {}", username, dto.getName());

        if (communityRepository.existsByName(dto.getName())) {
            throw new IllegalArgumentException("Community name already exists!");
        }

        User creator = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        Community community = Community.builder()
                .name(dto.getName().trim())
                .description(dto.getDescription().trim())
                .createdBy(creator)
                .build();

        Community saved = communityRepository.save(community);

        // Creator automatically joins the community
        creator.getJoinedCommunities().add(saved);
        userRepository.save(creator);

        return mapToCommunityResponse(saved, username);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommunityResponse> getAllCommunities(String currentUsername) {
        List<Community> communities = communityRepository.findAll();
        return communities.stream()
                .map(community -> mapToCommunityResponse(community, currentUsername))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CommunityResponse getCommunityById(Long id, String currentUsername) {
        Community community = communityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Community not found with ID: " + id));
        return mapToCommunityResponse(community, currentUsername);
    }

    @Override
    @Transactional
    public void joinCommunity(Long id, String username) {
        log.info("User {} toggling join state for community ID: {}", username, id);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        Community community = communityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Community not found with ID: " + id));

        // Check if user is already a member
        if (user.getJoinedCommunities().contains(community)) {
            user.getJoinedCommunities().remove(community);
            log.info("User {} left community {}", username, community.getName());
        } else {
            user.getJoinedCommunities().add(community);
            log.info("User {} joined community {}", username, community.getName());
        }

        userRepository.save(user);
    }

    private CommunityResponse mapToCommunityResponse(Community community, String currentUsername) {
        if (community == null) {
            return null;
        }

        int membersCount = community.getMembers() != null ? community.getMembers().size() : 0;
        boolean isJoined = false;

        if (currentUsername != null) {
            isJoined = community.getMembers() != null && community.getMembers().stream()
                    .anyMatch(m -> m.getUsername().equals(currentUsername));
        }

        return CommunityResponse.builder()
                .id(community.getId())
                .name(community.getName())
                .description(community.getDescription())
                .createdByUsername(community.getCreatedBy().getUsername())
                .membersCount(membersCount)
                .createdAt(community.getCreatedAt())
                .isJoined(isJoined)
                .build();
    }
}
