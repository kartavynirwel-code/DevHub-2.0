package com.devhub.repository;

import com.devhub.entity.Comment;
import com.devhub.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPost(Post post);
    List<Comment> findByPostIdAndParentCommentIsNull(Long postId);
    List<Comment> findByParentCommentIsNull();
}
