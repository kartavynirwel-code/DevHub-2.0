package com.devhub.service.impl;

import com.devhub.dto.PostCreateDto;
import com.devhub.dto.PostResponse;
import com.devhub.entity.Community;
import com.devhub.entity.Post;
import com.devhub.entity.User;
import com.devhub.entity.Vote;
import com.devhub.exception.ResourceNotFoundException;
import com.devhub.repository.CommunityRepository;
import com.devhub.repository.PostRepository;
import com.devhub.repository.UserRepository;
import com.devhub.repository.VoteRepository;
import com.devhub.service.PostService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Slf4j
@Service
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final CommunityRepository communityRepository;
    private final VoteRepository voteRepository;

    public PostServiceImpl(PostRepository postRepository,
                           UserRepository userRepository,
                           CommunityRepository communityRepository,
                           VoteRepository voteRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.communityRepository = communityRepository;
        this.voteRepository = voteRepository;
    }

    @Override
    @Transactional
    public PostResponse createPost(PostCreateDto dto, String username) {
        log.info("Creating post: {} by user: {}", dto.getTitle(), username);

        User author = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        Community community = communityRepository.findById(dto.getCommunityId())
                .orElseThrow(() -> new ResourceNotFoundException("Community not found with ID: " + dto.getCommunityId()));

        Post post = Post.builder()
                .title(dto.getTitle().trim())
                .content(dto.getContent().trim())
                .author(author)
                .community(community)
                .upvotes(0)
                .downvotes(0)
                .score(0)
                .build();

        Post saved = postRepository.save(post);
        return mapToPostResponse(saved, username);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PostResponse> getAllPosts(Pageable pageable, String sortBy, String currentUsername) {
        Pageable sortedPageable = getSortedPageable(pageable, sortBy);
        Page<Post> posts = postRepository.findAll(sortedPageable);
        return posts.map(post -> mapToPostResponse(post, currentUsername));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PostResponse> getPostsByCommunity(Long communityId, Pageable pageable, String sortBy, String currentUsername) {
        Pageable sortedPageable = getSortedPageable(pageable, sortBy);
        Page<Post> posts = postRepository.findByCommunityId(communityId, sortedPageable);
        return posts.map(post -> mapToPostResponse(post, currentUsername));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PostResponse> getPostsByAuthor(String username, Pageable pageable, String currentUsername) {
        Pageable sortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Post> posts = postRepository.findByAuthorUsername(username, sortedPageable);
        return posts.map(post -> mapToPostResponse(post, currentUsername));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PostResponse> searchPosts(String keyword, Pageable pageable, String currentUsername) {
        Pageable sortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Post> posts = postRepository.searchByKeyword(keyword, sortedPageable);
        return posts.map(post -> mapToPostResponse(post, currentUsername));
    }

    @Override
    @Transactional(readOnly = true)
    public PostResponse getPostById(Long id, String currentUsername) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with ID: " + id));
        return mapToPostResponse(post, currentUsername);
    }

    private Pageable getSortedPageable(Pageable pageable, String sortBy) {
        Sort sort = switch (sortBy != null ? sortBy.toLowerCase() : "new") {
            case "top" -> Sort.by(Sort.Direction.DESC, "score");
            case "hot" -> Sort.by(Sort.Direction.DESC, "upvotes");
            default -> Sort.by(Sort.Direction.DESC, "createdAt");
        };
        return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);
    }

    private PostResponse mapToPostResponse(Post post, String currentUsername) {
        String userVote = null;
        if (currentUsername != null) {
            Optional<Vote> vote = voteRepository.findByUserUsernameAndPostId(currentUsername, post.getId());
            if (vote.isPresent()) {
                userVote = vote.get().getVoteType().name();
            }
        }

        return PostResponse.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .authorUsername(post.getAuthor().getUsername())
                .communityId(post.getCommunity().getId())
                .communityName(post.getCommunity().getName())
                .upvotes(post.getUpvotes())
                .downvotes(post.getDownvotes())
                .score(post.getScore())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .commentsCount(post.getComments() != null ? post.getComments().size() : 0)
                .userVote(userVote)
                .build();
    }
}
