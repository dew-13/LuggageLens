import { create } from 'zustand';
import apiClient from '../services/apiClient';

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      // Call backend API using centralized client
      const { data } = await apiClient.post('/auth/login', { email, password });

      set({
        user: data.user,
        token: data.token,
        isLoading: false
      });

      // Save to localStorage
      localStorage.setItem('jwt_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  logout: () => {
    set({ user: null, token: null });
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user');
  },

  setUser: (user) => set({ user }),
  setToken: (token) => set({ token })
}));

export default useAuthStore;
