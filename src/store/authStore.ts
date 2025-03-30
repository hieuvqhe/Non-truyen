import { create } from 'zustand'
import { getAccessTokenFromLS, removeAccessTokenFromLS } from '../utils/auth'

interface User {
  id?: string
  email?: string
  name?: string
  avatar?: string
}

interface AuthState {
  isAuthenticated: boolean
  user: User | null
  setUser: (user: User) => void
  logout: () => void
}

const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: Boolean(getAccessTokenFromLS()),
  user: null,
  setUser: (user) => set({ user, isAuthenticated: true }),
  logout: () => {
    removeAccessTokenFromLS()
    set({ user: null, isAuthenticated: false })
  }
}))

export default useAuthStore
