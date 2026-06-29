import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Terminal, Search, Plus, LogOut, User } from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="nav-left">
          <Link to="/" className="logo">
            <Terminal size={22} color="#ef4444" />
            DevHub <span>2.0</span>
          </Link>

          <form onSubmit={handleSearchSubmit} className="nav-search">
            <Search />
            <input
              type="text"
              placeholder="Search DevHub posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        <div className="nav-right">
          {user ? (
            <>
              <Link to="/create-post" className="btn btn-primary">
                <Plus size={16} />
                Create Post
              </Link>

              <div className="user-menu">
                <Link to={`/u/${user.username}`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img
                    src={user.profileImageUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                    alt={user.username}
                    className="user-avatar"
                  />
                  <div className="user-info-text">
                    <span className="user-name">u/{user.username}</span>
                    <span className="user-karma">{user.karmaPoints || 0} karma</span>
                  </div>
                </Link>
                
                <button 
                  onClick={() => { logout(); navigate('/'); }} 
                  className="btn btn-secondary" 
                  style={{ padding: '6px', minWidth: 'auto' }}
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/auth?mode=login" className="btn btn-secondary">
                Log In
              </Link>
              <Link to="/auth?mode=register" className="btn btn-primary">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
