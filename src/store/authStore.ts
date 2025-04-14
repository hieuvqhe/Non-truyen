import { create } from 'zustand'
import { getAccessTokenFromLS, removeAccessTokenFromLS } from '../utils/auth'
import { getProfile } from '../apis/user.api';

// Update interface to match the API response structure
interface User {
  id?: string
  email?: string
  name?: string
  avatar?: string
  role?: "user" | "admin"
}

interface AuthState {
  isAuthenticated: boolean
  user: User | null
  setUser: (user: User) => void
  initializeAuth: () => void // New method to initialize auth from localStorage
  logout: () => void
  updateUserData: (userData: User) => void
}

const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: Boolean(getAccessTokenFromLS()),
  user: null,
  setUser: (user) => {
    // Save user to localStorage when setting
    localStorage.setItem('user', JSON.stringify(user))
    set({ user, isAuthenticated: true })
  },
  initializeAuth: async () => {
    const accessToken = getAccessTokenFromLS();
    
    if (accessToken) {
      // First set authentication state to true
      set({ isAuthenticated: true });
      
      // Try to load user from localStorage first for immediate display
      try {
        const cachedUser = localStorage.getItem('user');
        if (cachedUser) {
          const userData = JSON.parse(cachedUser);
          set({ user: userData });
        }
      } catch (error) {
        console.error('Failed to parse cached user data:', error);
      }
      
      // Then refresh user data from API
      try {
        const response = await getProfile();
        if (response && response.user) {
          // Update user data in store and localStorage
          localStorage.setItem('user', JSON.stringify(response.user));
          set({ user: response.user });
        }
      } catch (error) {
        console.error('Failed to fetch user profile during auth initialization:', error);
      }
    } else {
      set({ isAuthenticated: false, user: null });
    }
  },
  updateUserData: (userData: User) => {
    // Update both in store and localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    set({ user: userData });
  },
  logout: () => {
    removeAccessTokenFromLS()
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    set({ user: null, isAuthenticated: false })
  }
}))

export default useAuthStore
