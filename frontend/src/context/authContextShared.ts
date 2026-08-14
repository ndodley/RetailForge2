import { createContext } from 'react'
import type { RegisterAuthInput, AuthUser } from '../api/auth'

export interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  isAuthenticated: boolean
  canAccessAdmin: boolean
  login: (email: string, password: string) => Promise<{ user: AuthUser | null; error: string | null }>
  register: (input: RegisterAuthInput) => Promise<{ user: AuthUser | null; error: string | null }>
  logout: () => Promise<void>
  refreshUser: () => Promise<AuthUser | null>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

