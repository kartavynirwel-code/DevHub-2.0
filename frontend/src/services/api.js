const API_BASE = '/api';

// Helper for making API calls
async function request(url, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      const errBody = await response.json();
      errorMessage = errBody.message || errBody.error || errorMessage;
    } catch (e) {
      // Not JSON
    }
    throw new Error(errorMessage);
  }

  // Handle empty responses (like 204 or void returns)
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  return null;
}

export const api = {
  // Auth
  login: (username, password) => 
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  register: (username, email, password) => 
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    }),

  getMe: () => request('/auth/me'),

  // Communities
  getCommunities: () => request('/communities'),
  
  getCommunity: (id) => request(`/communities/${id}`),
  
  createCommunity: (name, description) => 
    request('/communities', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    }),
    
  joinCommunity: (id) => 
    request(`/communities/${id}/join`, {
      method: 'POST',
    }),

  // Posts
  getPosts: (page = 0, size = 10, sortBy = 'new', communityId = null) => {
    let url = `/posts?page=${page}&size=${size}&sortBy=${sortBy}`;
    if (communityId) {
      url += `&communityId=${communityId}`;
    }
    return request(url);
  },

  getPost: (id) => request(`/posts/${id}`),

  createPost: (title, content, communityId) => 
    request('/posts', {
      method: 'POST',
      body: JSON.stringify({ title, content, communityId }),
    }),

  votePost: (id, voteType) => 
    request(`/posts/${id}/vote?type=${voteType}`, {
      method: 'POST',
    }),

  searchPosts: (keyword, page = 0, size = 10) => 
    request(`/posts/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`),

  // Comments
  getComments: (postId) => request(`/posts/${postId}/comments`),

  addComment: (postId, content, parentId = null) => 
    request(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content, parentId }),
    }),

  deleteComment: (commentId) => 
    request(`/posts/comments/${commentId}`, {
      method: 'DELETE',
    }),

  // Users
  getUserProfile: (username) => request(`/users/${username}`),
  
  getUserPosts: (username, page = 0, size = 10) => 
    request(`/users/${username}/posts?page=${page}&size=${size}`),
};
