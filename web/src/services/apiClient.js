import axios from 'axios';
import { getProductionBackendUrl } from '../config/production.config';

/**
 * Smart API URL Detection
 * Automatically uses the correct backend URL based on environment:
 * - Local development: http://localhost:5000/api
 * - Vercel production: Uses REACT_APP_API_URL from environment
 * - Auto-detects if running on Vercel and uses production URL
 */
const getApiUrl = () => {
  // 1. Check if explicit environment variable is set (highest priority)
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // 2. Auto-detect Vercel deployment
  if (window.location.hostname.includes('vercel.app')) {
    // Running on Vercel - use production backend from config
    return getProductionBackendUrl();
  }

  // 3. Check if running on localhost
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }

  // 4. Default fallback
  return 'http://localhost:5000/api';
};

const API_URL = getApiUrl();

console.log('🔗 API Client initialized with URL:', API_URL);

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000, // Increased timeout for Render cold starts
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add JWT token to all requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear auth
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    // Log network errors for debugging
    if (error.code === 'ECONNABORTED') {
      console.error('⚠️ Request timeout - backend may be sleeping (Render free tier)');
    } else if (error.message === 'Network Error') {
      console.error('⚠️ Network error - check if backend is running:', API_URL);
    }

    return Promise.reject(error);
  }
);

export default apiClient;

