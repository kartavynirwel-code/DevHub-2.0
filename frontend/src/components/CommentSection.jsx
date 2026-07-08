import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { formatRelativeTime } from './PostCard';
import { MessageSquare, Trash, CornerDownRight } from 'lucide-react';

// Sub-component to recursively render each comment and its replies
function CommentNode({ comment, postId, activeUser, onCommentAdded, onCommentDeleted }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setSubmitting(true);
    setError('');
    try {
      const newComment = await api.addComment(postId, replyText.trim(), comment.id);
      setReplyText('');
      setShowReplyForm(false);
      onCommentAdded(newComment); // Notify parent to refresh
    } catch (err) {
      setError(err.message || "Failed to add reply");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        await api.deleteComment(comment.id);
        onCommentDeleted(comment.id);
      } catch (err) {
        alert(err.message || "Failed to delete comment");
      }
    }
  };

  return (
    <div className="comment-node">
      <div className="comment-meta">
        <span className="comment-author">u/{comment.authorUsername}</span>
        <span>•</span>
        <span>{formatRelativeTime(comment.createdAt)}</span>
      </div>

      <div className="comment-content">{comment.content}</div>

      <div className="comment-actions">
        {activeUser && (
          <button 
            className="comment-action-btn" 
            onClick={() => setShowReplyForm(!showReplyForm)}
          >
            <CornerDownRight size={14} />
            Reply
          </button>
        )}

        {activeUser && activeUser.username === comment.authorUsername && (
          <button 
            className="comment-action-btn delete" 
            onClick={handleDelete}
            style={{ marginLeft: '12px' }}
          >
            <Trash size={14} />
            Delete
          </button>
        )}
      </div>

      {showReplyForm && (
        <form onSubmit={handleReplySubmit} className="comment-input-box" style={{ marginTop: '10px', padding: '12px' }}>
          <textarea
            placeholder="Write a nested reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            disabled={submitting}
          />
          {error && <div className="error-message">{error}</div>}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
              onClick={() => setShowReplyForm(false)}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
              disabled={submitting}
            >
              {submitting ? 'Replying...' : 'Submit'}
            </button>
          </div>
        </form>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div style={{ marginTop: '4px' }}>
          {comment.replies.map((reply) => (
            <CommentNode
              key={reply.id}
              comment={reply}
              postId={postId}
              activeUser={activeUser}
              onCommentAdded={onCommentAdded}
              onCommentDeleted={onCommentDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommentSection({ postId, comments, onCommentAdded, onCommentDeleted }) {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmitting(true);
    setError('');
    try {
      const newComment = await api.addComment(postId, commentText.trim());
      setCommentText('');
      onCommentAdded(newComment); // Trigger parent update
    } catch (err) {
      setError(err.message || "Failed to submit comment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="comments-container">
      <h3 style={{ fontSize: '1.1rem', fontWeight: '800', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
        Comments ({comments ? countComments(comments) : 0})
      </h3>

      {user ? (
        <form onSubmit={handleCommentSubmit} className="comment-input-box">
          <textarea
            placeholder="Add to the discussion..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            disabled={submitting}
          />
          {error && <div className="error-message">{error}</div>}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={submitting || !commentText.trim()}
            >
              {submitting ? 'Posting...' : 'Comment'}
            </button>
          </div>
        </form>
      ) : (
        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', padding: '16px', borderRadius: '8px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Please log in to participate in the discussion.
        </div>
      )}

      {comments && comments.length > 0 ? (
        <div>
          {comments.map((comment) => (
            <CommentNode
              key={comment.id}
              comment={comment}
              postId={postId}
              activeUser={user}
              onCommentAdded={onCommentAdded}
              onCommentDeleted={onCommentDeleted}
            />
          ))}
        </div>
      ) : (
        <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-dark)', fontSize: '0.9rem' }}>
          No comments yet. Be the first to share your thoughts!
        </div>
      )}
    </div>
  );
}

// Helper to count total comments in tree (recursively)
function countComments(commentsList) {
  let count = 0;
  for (const c of commentsList) {
    count++;
    if (c.replies && c.replies.length > 0) {
      count += countComments(c.replies);
    }
  }
  return count;
}
