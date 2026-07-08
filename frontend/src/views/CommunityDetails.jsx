import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import Sidebar from '../components/Sidebar';
import { ChevronLeft, ChevronRight, MessageSquare, AlertCircle, Plus, Users } from 'lucide-react';

export default function CommunityDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Join/Leave local state
  const [isJoined, setIsJoined] = useState(false);
  const [membersCount, setMembersCount] = useState(0);

  // Pagination & Sorting states
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('new'); // new, hot, top

  useEffect(() => {
    const fetchCommunityInfo = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await api.getCommunity(id);
        setCommunity(data);
        setIsJoined(data.isJoined);
        setMembersCount(data.membersCount);
      } catch (err) {
        console.error("Failed to load community details", err);
        setError("Failed to load community details.");
      } finally {
        setLoading(false);
      }
    };

    fetchCommunityInfo();
    setCurrentPage(0); // Reset page on community change
  }, [id]);

  useEffect(() => {
    const fetchCommunityPosts = async () => {
      setPostsLoading(true);
      try {
        const response = await api.getPosts(currentPage, 10, sortBy, id);
        if (response && response.content) {
          setPosts(response.content);
          setTotalPages(response.totalPages);
        } else {
          setPosts([]);
        }
      } catch (err) {
        console.error("Failed to load community posts", err);
      } finally {
        setPostsLoading(false);
      }
    };

    if (community) {
      fetchCommunityPosts();
    }
  }, [community, currentPage, sortBy, id]);

  const handleJoinToggle = async () => {
    if (!user) {
      // Redirect or alert
      alert("Please log in to join communities.");
      return;
    }

    try {
      // Toggle local state optimistically
      const wasJoined = isJoined;
      setIsJoined(!wasJoined);
      setMembersCount(prev => wasJoined ? prev - 1 : prev + 1);

      await api.joinCommunity(id);
    } catch (err) {
      console.error("Failed to join community", err);
      // Revert state on error
      setIsJoined(community.isJoined);
      setMembersCount(community.membersCount);
    }
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setCurrentPage(0);
  };

  if (loading) {
    return (
      <div className="main-content">
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
          Loading community details...
        </div>
        <Sidebar />
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className="main-content">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '48px', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '12px', textAlign: 'center', width: '100%' }}>
          <AlertCircle size={32} color="var(--accent-red)" />
          <div style={{ color: 'var(--text-muted)' }}>{error || "Community not found"}</div>
          <Link to="/" className="btn btn-primary">Back Home</Link>
        </div>
        <Sidebar />
      </div>
    );
  }

  return (
    <div className="main-content">
      <div>
        <div className="community-banner">
          <div className="community-banner-details">
            <h2 className="community-banner-title">c/{community.name}</h2>
            <p className="community-banner-desc">{community.description}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)', marginTop: '8px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Users size={14} />
                {membersCount} {membersCount === 1 ? 'member' : 'members'}
              </span>
              <span>•</span>
              <span>Created by u/{community.createdByUsername}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {user && (
              <Link to={`/create-post?communityId=${community.id}`} className="btn btn-outline" style={{ border: '1px solid white', color: 'white' }}>
                Post here
              </Link>
            )}
            <button
              onClick={handleJoinToggle}
              className={`btn ${isJoined ? 'btn-secondary' : 'btn-primary'}`}
            >
              {isJoined ? 'Joined' : 'Join'}
            </button>
          </div>
        </div>

        <div className="feed-header">
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Community Posts</h3>
          
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

        {postsLoading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
            Loading posts...
          </div>
        ) : posts.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
            No posts found in c/{community.name} yet.
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
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '24px' }}>
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
