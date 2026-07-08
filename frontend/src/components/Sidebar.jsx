import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Compass, Plus, Users } from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuth();
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const data = await api.getCommunities();
        setCommunities(data);
      } catch (err) {
        console.error("Failed to load communities", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCommunities();
  }, []);

  return (
    <div className="sidebar-container" style={{ width: '300px' }}>
      <div className="sidebar-panel">
        <h3 className="sidebar-title">
          <Compass size={18} style={{ marginRight: '8px', verticalAlign: 'middle', color: '#ef4444' }} />
          Explore Communities
        </h3>

        {loading ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading communities...</div>
        ) : communities.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No communities yet. Create one!</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {communities.slice(0, 8).map((community) => (
              <Link key={community.id} to={`/c/${community.id}`} className="community-list-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={16} color="var(--text-muted)" />
                  <span className="community-list-name">c/{community.name}</span>
                </div>
                <span className="community-list-count">{community.membersCount} members</span>
              </Link>
            ))}
          </div>
        )}

        {user && (
          <Link to="/create-community" className="btn btn-secondary" style={{ width: '100%', marginTop: '10px' }}>
            <Plus size={16} />
            Create Community
          </Link>
        )}
      </div>

      <div className="sidebar-panel" style={{ marginTop: '16px' }}>
        <h3 className="sidebar-title">DevHub 2.0</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
          Welcome to the developer community hub! Discuss code, share tech articles, and solve bugs together. Built with React, Spring Boot, and MySQL.
        </p>
      </div>
    </div>
  );
}
