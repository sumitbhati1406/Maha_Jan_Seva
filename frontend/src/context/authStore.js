import { create } from 'zustand'
import api from '../utils/api'

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('mjs_user') || 'null'),
  token: localStorage.getItem('mjs_token') || null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('mjs_token', data.token);
      localStorage.setItem('mjs_user', JSON.stringify(data.user));
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      set({ user: data.user, token: data.token, loading: false });
      return { success: true, user: data.user };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      set({ loading: false, error: msg });
      return { success: false, message: msg };
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/register', userData);
      localStorage.setItem('mjs_token', data.token);
      localStorage.setItem('mjs_user', JSON.stringify(data.user));
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      set({ user: data.user, token: data.token, loading: false });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      set({ loading: false, error: msg });
      return { success: false, message: msg };
    }
  },

  logout: () => {
    localStorage.removeItem('mjs_token');
    localStorage.removeItem('mjs_user');
    delete api.defaults.headers.common['Authorization'];
    set({ user: null, token: null });
  },

  updateUser: (user) => {
    localStorage.setItem('mjs_user', JSON.stringify(user));
    set({ user });
  },

  refreshUser: async () => {
    try {
      const { data } = await api.get('/auth/me');
      localStorage.setItem('mjs_user', JSON.stringify(data.user));
      set({ user: data.user });
    } catch (e) {
      // If refresh fails (expired token), log out
      localStorage.removeItem('mjs_token');
      localStorage.removeItem('mjs_user');
      set({ user: null, token: null });
    }
  }
}));

// Set token on init
const token = localStorage.getItem('mjs_token');
if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

export default useAuthStore;
