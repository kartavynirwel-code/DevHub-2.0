package com.devhub.service.impl;

import com.devhub.entity.Post;
import com.devhub.entity.User;
import com.devhub.entity.Vote;
import com.devhub.exception.ResourceNotFoundException;
import com.devhub.repository.PostRepository;
import com.devhub.repository.UserRepository;
import com.devhub.repository.VoteRepository;
import com.devhub.service.VoteService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Slf4j
@Service
public class VoteServiceImpl implements VoteService {

    private final VoteRepository voteRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public VoteServiceImpl(VoteRepository voteRepository,
                           PostRepository postRepository,
                           UserRepository userRepository) {
        this.voteRepository = voteRepository;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public void castVote(Long postId, String username, Vote.VoteType voteType) {
        log.info("User {} casting {} vote on post ID: {}", username, voteType, postId);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with ID: " + postId));

        Optional<Vote> existingVote = voteRepository.findByUserAndPost(user, post);

        if (existingVote.isPresent()) {
            Vote vote = existingVote.get();
            if (vote.getVoteType() == voteType) {
                // Toggle off (remove vote)
                voteRepository.delete(vote);
                voteRepository.flush(); // Flush delete to DB before updating score
            } else {
                // Change vote type
                vote.setVoteType(voteType);
                voteRepository.saveAndFlush(vote); // Flush save to DB before updating score
            }
        } else {
            // Create new vote
            Vote vote = Vote.builder()
                    .user(user)
                    .post(post)
                    .voteType(voteType)
                    .build();
            voteRepository.saveAndFlush(vote); // Flush save to DB before updating score
        }

        updatePostScore(post);
    }

    @Override
    @Transactional
    public void removeVote(Long postId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + postId));

        voteRepository.findByUserAndPost(user, post)
                .ifPresent(vote -> {
                    voteRepository.delete(vote);
                    voteRepository.flush();
                    updatePostScore(post);
                });
    }

    @Override
    @Transactional(readOnly = true)
    public Integer getPostScore(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with ID: " + postId));

        Long upvotes = voteRepository.countByPostAndVoteType(post, Vote.VoteType.UPVOTE);
        Long downvotes = voteRepository.countByPostAndVoteType(post, Vote.VoteType.DOWNVOTE);

        return upvotes.intValue() - downvotes.intValue();
    }

    private void updatePostScore(Post post) {
        int oldScore = post.getScore() != null ? post.getScore() : 0;

        Long upvotes = voteRepository.countByPostAndVoteType(post, Vote.VoteType.UPVOTE);
        Long downvotes = voteRepository.countByPostAndVoteType(post, Vote.VoteType.DOWNVOTE);

        int newScore = upvotes.intValue() - downvotes.intValue();
        post.setUpvotes(upvotes.intValue());
        post.setDownvotes(downvotes.intValue());
        post.setScore(newScore);

        postRepository.save(post);

        // Update post author's karma points
        User author = post.getAuthor();
        if (author != null) {
            int karmaDiff = newScore - oldScore;
            author.setKarmaPoints((author.getKarmaPoints() != null ? author.getKarmaPoints() : 0) + karmaDiff);
            userRepository.save(author);
        }
    }
}
