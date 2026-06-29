import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { ArrowLeft } from 'lucide-react';

export default function CreateCommunity() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/auth?mode=login');
    }
  }, [user, navigate]);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validations
    const cleanName = name.trim();
    if (cleanName.includes(' ')) {
      setError('Community name cannot contain spaces. Use CamelCase or underscores (e.g., SpringBoot, react_native)');
      return;
    }
    if (cleanName.length < 3 || cleanName.length > 50) {
      setError('Community name must be between 3 and 50 characters.');
      return;
    }
    if (description.trim().length < 10) {
      setError('Description must be at least 10 characters.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.createCommunity(cleanName, description.trim());
      navigate(`/c/${response.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create community. Name might already be taken.');
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <div>
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', background: 'transparent', border: 'none', fontSize: '0.85rem', marginBottom: '16px', fontWeight: '600', cursor: 'pointer' }}>
          <ArrowLeft size={16} />
          Cancel
        </button>

        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '20px' }}>Create a Community</h2>

          {error && <div className="error-message" style={{ marginBottom: '16px' }}>{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
              <label htmlFor="name">Community Name</label>
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: '8px', paddingLeft: '12px' }}>
                <span style={{ color: 'var(--accent-red)', fontWeight: '700', fontSize: '0.9rem' }}>c/</span>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. SpringBoot"
                  style={{ border: 'none', background: 'transparent', width: '100%', paddingLeft: '4px' }}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this community for? Briefly explain what developers should post here..."
                style={{ minHeight: '120px', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px', fontSize: '0.9rem', color: 'var(--text-main)', resize: 'vertical', outline: 'none' }}
                required
                disabled={loading}
              />
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
                disabled={loading || !name.trim() || !description.trim()}
              >
                {loading ? 'Creating...' : 'Create Community'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <Sidebar />
    </div>
  );
}
