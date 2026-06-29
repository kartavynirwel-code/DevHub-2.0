package com.devhub.service;

import com.devhub.entity.Vote;

public interface VoteService {
    void castVote(Long postId, String username, Vote.VoteType voteType);
    void removeVote(Long postId, String username);
    Integer getPostScore(Long postId);
}
