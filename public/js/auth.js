// Authentication helper functions
const API_BASE_URL = window.location.origin + '/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Set auth token to localStorage
const setAuthToken = (token) => {
  localStorage.setItem('authToken', token);
};

// Remove auth token from localStorage
const removeAuthToken = () => {
  localStorage.removeItem('authToken');
};

// Check if user is authenticated
const isAuthenticated = () => {
  return !!getAuthToken();
};

// Logout function
const logout = () => {
  removeAuthToken();
  localStorage.removeItem('userName');
  localStorage.removeItem('userEmail');
  window.location.href = '/login';
};

// API call with authentication
const apiCall = async (endpoint, options = {}) => {
  const token = getAuthToken();

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        // Unauthorized - redirect to login
        logout();
        return;
      }
      throw new Error(data.message || 'API call failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Check authentication on page load for protected pages
document.addEventListener('DOMContentLoaded', () => {
  const currentPage = window.location.pathname;
  const publicPages = ['/', '/login', '/register'];

  if (!publicPages.includes(currentPage) && !isAuthenticated()) {
    window.location.href = '/login';
  }
});
