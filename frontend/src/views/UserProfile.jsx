import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import PostCard from '../components/PostCard';
import Sidebar from '../components/Sidebar';
import { Calendar, Award, AlertCircle } from 'lucide-react';

export default function UserProfile() {
  const { username } = useParams();
  
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await api.getUserProfile(username);
        setProfile(data);
      } catch (err) {
        console.error("Failed to load user profile", err);
        setError("User profile not found.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    setCurrentPage(0); // Reset page on profile change
  }, [username]);

  useEffect(() => {
    const fetchUserPosts = async () => {
      setPostsLoading(true);
      try {
        const response = await api.getUserPosts(username, currentPage, 10);
        if (response && response.content) {
          setPosts(response.content);
          setTotalPages(response.totalPages);
        } else {
          setPosts([]);
        }
      } catch (err) {
        console.error("Failed to load user posts", err);
      } finally {
        setPostsLoading(false);
      }
    };

    if (profile) {
      fetchUserPosts();
    }
  }, [profile, currentPage, username]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="main-content">
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
          Loading developer profile...
        </div>
        <Sidebar />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="main-content">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '48px', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '12px', textAlign: 'center', width: '100%' }}>
          <AlertCircle size={32} color="var(--accent-red)" />
          <div style={{ color: 'var(--text-muted)' }}>{error || "Profile not found"}</div>
        </div>
        <Sidebar />
      </div>
    );
  }

  return (
    <div className="main-content">
      <div>
        <div className="profile-card">
          <img
            src={profile.profileImageUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.username}`}
            alt={profile.username}
            className="profile-avatar-large"
          />
          <div className="profile-info">
            <h2 className="profile-name">u/{profile.username}</h2>
            <p className="profile-bio">
              {profile.bio || "This developer hasn't set a bio yet. Busy writing bugs and fixing code!"}
            </p>
            
            <div className="profile-stats">
              <div className="profile-stat-box">
                <span className="profile-stat-value">{profile.karmaPoints || 0}</span>
                <span className="profile-stat-label">Karma</span>
              </div>
              <div className="profile-stat-box" style={{ marginLeft: '16px' }}>
                <span className="profile-stat-value" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.95rem', marginTop: '4px' }}>
                  <Calendar size={14} />
                  {formatDate(profile.createdAt)}
                </span>
                <span className="profile-stat-label">Member Since</span>
              </div>
            </div>
          </div>
        </div>

        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '16px' }}>Posts by u/{profile.username}</h3>

        {postsLoading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
            Loading posts...
          </div>
        ) : posts.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
            u/{profile.username} hasn't posted anything yet.
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
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
                  disabled={currentPage === 0}
                  className="btn btn-secondary"
                  style={{ padding: '6px' }}
                >
                  Prev
                </button>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Page {currentPage + 1} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1))}
                  disabled={currentPage === totalPages - 1}
                  className="btn btn-secondary"
                  style={{ padding: '6px' }}
                >
                  Next
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
