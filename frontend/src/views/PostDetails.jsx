import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import PostCard from '../components/PostCard';
import CommentSection from '../components/CommentSection';
import Sidebar from '../components/Sidebar';
import { ArrowLeft, AlertCircle } from 'lucide-react';

// Custom lightweight parser for code blocks (```code```) and inline code (`code`)
function renderPostBody(content) {
  if (!content) return null;
  
  const parts = content.split(/(```[\s\S]*?```)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith('```') && part.endsWith('```')) {
      const lines = part.slice(3, -3).trim().split('\n');
      let language = 'code';
      let codeContent = part.slice(3, -3).trim();
      
      if (lines.length > 0 && !lines[0].includes(' ') && lines[0].length < 15 && lines[0].trim() !== '') {
        language = lines[0].trim();
        codeContent = lines.slice(1).join('\n');
      }
      
      return (
        <pre key={index}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dark)', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 'bold', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
            {language}
          </div>
          <code>{codeContent}</code>
        </pre>
      );
    }
    
    // Process inline code blocks
    const inlineParts = part.split(/(`[^`\n]+`)/g);
    return (
      <span key={index} style={{ whiteSpace: 'pre-wrap' }}>
        {inlineParts.map((subPart, subIndex) => {
          if (subPart.startsWith('`') && subPart.endsWith('`')) {
            return <code key={subIndex}>{subPart.slice(1, -1)}</code>;
          }
          return subPart;
        })}
      </span>
    );
  });
}

export default function PostDetails() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPostData = async () => {
    try {
      const postData = await api.getPost(id);
      setPost(postData);
      
      const commentsData = await api.getComments(id);
      setComments(commentsData);
    } catch (err) {
      console.error("Failed to load post details", err);
      setError("Failed to load post details. It may have been deleted.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchPostData();
  }, [id]);

  // Insert a new comment at the appropriate node in the comments tree
  const handleCommentAdded = (newComment) => {
    // If it's a top-level comment (parentId is null)
    if (!newComment.parentId) {
      setComments(prev => [newComment, ...prev]);
      return;
    }

    // If it's a nested reply, recursively insert it
    const insertReply = (list) => {
      return list.map(item => {
        if (item.id === newComment.parentId) {
          return {
            ...item,
            replies: [newComment, ...(item.replies || [])]
          };
        } else if (item.replies && item.replies.length > 0) {
          return {
            ...item,
            replies: insertReply(item.replies)
          };
        }
        return item;
      });
    };

    setComments(prev => insertReply(prev));
  };

  // Filter out the deleted comment from the tree
  const handleCommentDeleted = (commentId) => {
    const removeComment = (list) => {
      return list
        .filter(item => item.id !== commentId)
        .map(item => {
          if (item.replies && item.replies.length > 0) {
            return {
              ...item,
              replies: removeComment(item.replies)
            };
          }
          return item;
        });
    };

    setComments(prev => removeComment(prev));
  };

  if (loading) {
    return (
      <div className="main-content">
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
          Loading post details...
        </div>
        <Sidebar />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="main-content">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '48px', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '12px', textAlign: 'center', width: '100%' }}>
          <AlertCircle size={32} color="var(--accent-red)" />
          <div style={{ color: 'var(--text-muted)' }}>{error}</div>
          <Link to="/" className="btn btn-primary">Back Home</Link>
        </div>
        <Sidebar />
      </div>
    );
  }

  return (
    <div className="main-content">
      <div>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px', fontWeight: '600' }}>
          <ArrowLeft size={16} />
          Back to Feed
        </Link>

        {/* Re-use PostCard for consistent styling and voting */}
        <PostCard post={post} />

        {/* Display Expanded Content */}
        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderTop: 'none', borderRadius: '0 0 12px 12px', marginTop: '-16px', padding: '0 24px 24px 60px' }}>
          <div className="post-body-full">
            {renderPostBody(post.content)}
          </div>
          
          <CommentSection
            postId={post.id}
            comments={comments}
            onCommentAdded={handleCommentAdded}
            onCommentDeleted={handleCommentDeleted}
          />
        </div>
      </div>

      <Sidebar />
    </div>
  );
}
