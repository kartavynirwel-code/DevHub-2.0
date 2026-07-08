import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { Eye, Edit3, ArrowLeft } from 'lucide-react';

export default function CreatePost() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // If not logged in, redirect to auth
  useEffect(() => {
    if (!user) {
      navigate('/auth?mode=login');
    }
  }, [user, navigate]);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [communityId, setCommunityId] = useState('');
  const [communities, setCommunities] = useState([]);
  
  const [previewMode, setPreviewMode] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const data = await api.getCommunities();
        setCommunities(data);
        
        // Check for query param ?communityId=X
        const paramId = searchParams.get('communityId');
        if (paramId) {
          setCommunityId(paramId);
        } else if (data.length > 0) {
          setCommunityId(data[0].id); // default to first
        }
      } catch (err) {
        console.error("Failed to load communities", err);
      }
    };
    fetchCommunities();
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !communityId) {
      setError('All fields are required.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await api.createPost(title.trim(), content.trim(), Number(communityId));
      navigate(`/posts/${response.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create post.');
      setLoading(false);
    }
  };

  // Duplicate lightweight parser for live preview
  function renderPreview(text) {
    if (!text) return <p style={{ color: 'var(--text-dark)', fontStyle: 'italic' }}>Nothing to preview</p>;
    
    const parts = text.split(/(```[\s\S]*?```)/g);
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

  return (
    <div className="main-content">
      <div>
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', background: 'transparent', border: 'none', fontSize: '0.85rem', marginBottom: '16px', fontWeight: '600', cursor: 'pointer' }}>
          <ArrowLeft size={16} />
          Cancel
        </button>

        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '20px' }}>Create a Post</h2>

          {error && <div className="error-message" style={{ marginBottom: '16px' }}>{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
              <label htmlFor="community">Choose a Community</label>
              <select
                id="community"
                value={communityId}
                onChange={(e) => setCommunityId(e.target.value)}
                disabled={loading}
              >
                {communities.map((c) => (
                  <option key={c.id} value={c.id}>
                    c/{c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="An interesting title"
                maxLength={200}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label>Body Content</label>
                <div style={{ display: 'flex', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '2px' }}>
                  <button
                    type="button"
                    onClick={() => setPreviewMode(false)}
                    className={`sort-btn ${!previewMode ? 'active' : ''}`}
                    style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                  >
                    <Edit3 size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                    Write
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode(true)}
                    className={`sort-btn ${previewMode ? 'active' : ''}`}
                    style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                  >
                    <Eye size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                    Preview
                  </button>
                </div>
              </div>

              {!previewMode ? (
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Tell other developers about your code, question, or link... Use ```lang\ncode\n``` for blocks and `code` for inline."
                  style={{ minHeight: '240px', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px', fontSize: '0.9rem', color: 'var(--text-main)', resize: 'vertical', outline: 'none' }}
                  required
                  disabled={loading}
                />
              ) : (
                <div style={{ minHeight: '240px', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px', overflowY: 'auto' }}>
                  <div className="post-body-full">
                    {renderPreview(content)}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate(-1)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !title.trim() || !content.trim()}
              >
                {loading ? 'Publishing...' : 'Publish Post'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <Sidebar />
    </div>
  );
}
