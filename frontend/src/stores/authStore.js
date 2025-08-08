import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getToken, setToken, removeToken, decodeToken } from '../utils/auth';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isInitialized: false,

      // Initialize auth state from stored token
      initializeAuth: () => {
        set({ isLoading: true });
        
        const token = getToken();
        if (token) {
          try {
            const decoded = decodeToken(token);
            if (decoded.exp * 1000 > Date.now()) {
              set({ user: decoded, isLoading: false, isInitialized: true });
              return;
            } else {
              removeToken();
            }
          } catch (error) {
            removeToken();
          }
        }
        
        set({ user: null, isLoading: false, isInitialized: true });
      },

      // Login action
      login: (userData) => {
        set({ user: userData });
      },

      // Logout action
      logout: () => {
        removeToken();
        set({ user: null });
      },

      // Check if user is authenticated
      isAuthenticated: () => {
        const { user } = get();
        return !!user;
      },

      // Get current user
      getCurrentUser: () => {
        const { user } = get();
        return user;
      },

      // Update user data
      updateUser: (userData) => {
        set(state => ({ user: { ...state.user, ...userData } }));
      }
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
