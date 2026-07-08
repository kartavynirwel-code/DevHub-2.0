package com.devhub.service;

import com.devhub.dto.CommunityCreateDto;
import com.devhub.dto.CommunityResponse;
import java.util.List;

public interface CommunityService {
    CommunityResponse createCommunity(CommunityCreateDto dto, String username);
    List<CommunityResponse> getAllCommunities(String currentUsername);
    CommunityResponse getCommunityById(Long id, String currentUsername);
    void joinCommunity(Long id, String username);
}
