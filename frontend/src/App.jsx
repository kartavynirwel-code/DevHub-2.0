import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Header from './components/Header';
import HomeFeed from './views/HomeFeed';
import Auth from './views/Auth';
import CommunityDetails from './views/CommunityDetails';
import PostDetails from './views/PostDetails';
import CreatePost from './views/CreatePost';
import CreateCommunity from './views/CreateCommunity';
import UserProfile from './views/UserProfile';
import SearchFeed from './views/SearchFeed';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--bg-dark)', color: 'var(--text-main)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ border: '3px solid var(--border-color)', borderTop: '3px solid var(--accent-red)', borderRadius: '50%', width: '40px', height: '40px', margin: '0 auto 16px auto', animation: 'spin 1s linear infinite' }}></div>
          <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Initializing DevHub 2.0...</span>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Header />
      <main className="main-layout">
        <Routes>
          <Route path="/" element={<HomeFeed />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/c/:id" element={<CommunityDetails />} />
          <Route path="/posts/:id" element={<PostDetails />} />
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/create-community" element={<CreateCommunity />} />
          <Route path="/u/:username" element={<UserProfile />} />
          <Route path="/search" element={<SearchFeed />} />
          <Route path="*" element={
            <div style={{ textAlign: 'center', padding: '48px', width: '100%', maxWidth: 'var(--max-width)' }}>
              <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>404 - Page Not Found</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>The route you are looking for does not exist in the DevHub ecosystem.</p>
              <Link to="/" className="btn btn-primary">Go Home</Link>
            </div>
          } />
        </Routes>
      </main>
    </div>
  );
}
