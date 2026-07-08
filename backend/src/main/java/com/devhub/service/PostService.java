package com.devhub.service;

import com.devhub.dto.PostCreateDto;
import com.devhub.dto.PostResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PostService {
    PostResponse createPost(PostCreateDto dto, String username);
    Page<PostResponse> getAllPosts(Pageable pageable, String sortBy, String currentUsername);
    Page<PostResponse> getPostsByCommunity(Long communityId, Pageable pageable, String sortBy, String currentUsername);
    Page<PostResponse> getPostsByAuthor(String username, Pageable pageable, String currentUsername);
    Page<PostResponse> searchPosts(String keyword, Pageable pageable, String currentUsername);
    PostResponse getPostById(Long id, String currentUsername);
}
