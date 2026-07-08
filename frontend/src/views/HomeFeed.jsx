import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import PostCard from '../components/PostCard';
import Sidebar from '../components/Sidebar';
import { ChevronLeft, ChevronRight, MessageSquare, AlertCircle } from 'lucide-react';

export default function HomeFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination & Sorting states
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('new'); // new, hot, top

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.getPosts(currentPage, 10, sortBy);
        if (response && response.content) {
          setPosts(response.content);
          setTotalPages(response.totalPages);
        } else {
          setPosts([]);
        }
      } catch (err) {
        console.error("Failed to load posts", err);
        setError(err.message || "Failed to load posts. Please make sure the backend is running.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, [currentPage, sortBy]);

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setCurrentPage(0); // Reset to first page
  };

  return (
    <div className="main-content">
      <div>
        <div className="feed-header">
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Popular Feed</h2>
          
          <div className="feed-sort">
            <button
              onClick={() => handleSortChange('new')}
              className={`sort-btn ${sortBy === 'new' ? 'active' : ''}`}
            >
              New
            </button>
            <button
              onClick={() => handleSortChange('hot')}
              className={`sort-btn ${sortBy === 'hot' ? 'active' : ''}`}
            >
              Hot
            </button>
            <button
              onClick={() => handleSortChange('top')}
              className={`sort-btn ${sortBy === 'top' ? 'active' : ''}`}
            >
              Top
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
            <div className="spinner" style={{ border: '3px solid var(--border-color)', borderTop: '3px solid var(--accent-red)', borderRadius: '50%', width: '32px', height: '32px', margin: '0 auto 16px auto', animation: 'spin 1s linear infinite' }}></div>
            Loading posts...
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        ) : error ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '48px', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '12px', textAlign: 'center' }}>
            <AlertCircle size={32} color="var(--accent-red)" />
            <div style={{ color: 'var(--text-muted)' }}>{error}</div>
            <button onClick={() => setCurrentPage(currentPage)} className="btn btn-secondary">Retry</button>
          </div>
        ) : posts.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
            No posts found in the DevHub ecosystem yet. Be the first to write a post!
          </div>
        ) : (
          <>
            <div>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '24px', marginBottom: '16px' }}>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
                  disabled={currentPage === 0}
                  className="btn btn-secondary"
                  style={{ padding: '8px' }}
                >
                  <ChevronLeft size={18} />
                </button>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Page {currentPage + 1} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1))}
                  disabled={currentPage === totalPages - 1}
                  className="btn btn-secondary"
                  style={{ padding: '8px' }}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <Sidebar />
    </div>
  );
}
