import create from 'zustand';

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      // Call backend API
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        set({
          user: data.user,
          token: data.token,
          isLoading: false
        });

        // Save to localStorage
        localStorage.setItem('jwt_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        return true;
      } else {
        set({ error: data.error || 'Login failed', isLoading: false });
        return false;
      }
    } catch (error) {
      set({ error: error.message, isLoading: false });
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
