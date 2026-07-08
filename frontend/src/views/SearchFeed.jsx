import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import PostCard from '../components/PostCard';
import Sidebar from '../components/Sidebar';
import { ChevronLeft, ChevronRight, AlertCircle, Compass } from 'lucide-react';

export default function SearchFeed() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query.trim()) {
        setPosts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const response = await api.searchPosts(query, currentPage, 10);
        if (response && response.content) {
          setPosts(response.content);
          setTotalPages(response.totalPages);
        } else {
          setPosts([]);
        }
      } catch (err) {
        console.error("Failed to fetch search results", err);
        setError("Failed to fetch search results.");
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query, currentPage]);

  useEffect(() => {
    setCurrentPage(0); // Reset page when query changes
  }, [query]);

  return (
    <div className="main-content">
      <div>
        <div className="feed-header">
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>
            Search Results for "{query}"
          </h2>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
            Searching DevHub posts...
          </div>
        ) : error ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '48px', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '12px', textAlign: 'center' }}>
            <AlertCircle size={32} color="var(--accent-red)" />
            <div style={{ color: 'var(--text-muted)' }}>{error}</div>
          </div>
        ) : posts.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
            No posts found matching your search. Try adjusting your query or keywords!
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
