import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ChevronUp, ChevronDown, MessageSquare, Clock } from 'lucide-react';

export function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  
  if (diffMs < 0) return 'just now'; // timezone alignment safety
  
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${diffDay}d ago`;
}

export default function PostCard({ post }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [score, setScore] = useState(post.score || 0);
  const [userVote, setUserVote] = useState(post.userVote); // "UPVOTE", "DOWNVOTE", or null

  const handleVote = async (type) => {
    if (!user) {
      navigate('/auth?mode=login');
      return;
    }

    // Optimistic UI update
    let scoreChange = 0;
    let newVote = null;

    if (type === 'UPVOTE') {
      if (userVote === 'UPVOTE') {
        scoreChange = -1;
        newVote = null;
      } else if (userVote === 'DOWNVOTE') {
        scoreChange = 2;
        newVote = 'UPVOTE';
      } else {
        scoreChange = 1;
        newVote = 'UPVOTE';
      }
    } else if (type === 'DOWNVOTE') {
      if (userVote === 'DOWNVOTE') {
        scoreChange = 1;
        newVote = null;
      } else if (userVote === 'UPVOTE') {
        scoreChange = -2;
        newVote = 'DOWNVOTE';
      } else {
        scoreChange = -1;
        newVote = 'DOWNVOTE';
      }
    }

    setScore(prev => prev + scoreChange);
    setUserVote(newVote);

    try {
      // API call to cast vote
      const res = await api.votePost(post.id, type);
      // Sync with final server score if necessary
      if (res && typeof res.score === 'number') {
        setScore(res.score);
      }
    } catch (err) {
      console.error("Failed to register vote", err);
      // Revert on error
      setScore(prev => prev - scoreChange);
      setUserVote(userVote);
    }
  };

  return (
    <div className="post-card">
      <div className="post-vote-col">
        <button
          onClick={() => handleVote('UPVOTE')}
          className={`vote-arrow up ${userVote === 'UPVOTE' ? 'active' : ''}`}
          title="Upvote"
        >
          <ChevronUp size={22} />
        </button>
        <span className={`vote-score ${userVote === 'UPVOTE' ? 'up-active' : userVote === 'DOWNVOTE' ? 'down-active' : ''}`}>
          {score}
        </span>
        <button
          onClick={() => handleVote('DOWNVOTE')}
          className={`vote-arrow down ${userVote === 'DOWNVOTE' ? 'active' : ''}`}
          title="Downvote"
        >
          <ChevronDown size={22} />
        </button>
      </div>

      <div className="post-content-col">
        <div className="post-meta">
          <Link to={`/c/${post.communityId}`} className="post-community-badge">
            c/{post.communityName}
          </Link>
          <span>•</span>
          <span style={{ color: 'var(--text-dark)' }}>Posted by</span>
          <Link to={`/u/${post.authorUsername}`} style={{ color: 'var(--text-muted)' }}>
            u/{post.authorUsername}
          </Link>
          <span>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} />
            {formatRelativeTime(post.createdAt)}
          </span>
        </div>

        <Link to={`/posts/${post.id}`}>
          <h2 className="post-title">{post.title}</h2>
        </Link>

        <p className="post-body-snippet">{post.content}</p>

        <div className="post-footer">
          <Link to={`/posts/${post.id}`} className="post-footer-item">
            <MessageSquare size={16} />
            {post.commentsCount || 0} {post.commentsCount === 1 ? 'Comment' : 'Comments'}
          </Link>
        </div>
      </div>
    </div>
  );
}
