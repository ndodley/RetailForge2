import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
    fetchCurrentAuthUser,
    loginAuthUser,
    logoutAuthUser,
    registerAuthUser,
    type AuthRole,
    type AuthUser,
} from '../api/auth'
import { AuthContext, type AuthContextValue } from './authContextShared'

const adminRoles = new Set<AuthRole>(['manager', 'employee'])

interface AuthProviderProps {
  children: ReactNode
}

// The AuthProvider component manages authentication state and provides it to the rest of the app via context.
// It handles loading the current user on mount, and provides functions for logging in, registering, logging out, and refreshing the user data.
export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [loading, setLoading] = useState(true)

    async function refreshUser() {
        try {
            const currentUser = await fetchCurrentAuthUser()
            setUser(currentUser)
            return currentUser
        } catch {
            setUser(null)
            return null
        }
    }

    useEffect(() => {
        let mounted = true

        async function loadUser() {
            try {
                const currentUser = await fetchCurrentAuthUser()
                if (mounted) {
                    setUser(currentUser)
                }
            } catch {
                if (mounted) {
                    setUser(null)
                }
            } finally {
                if (mounted) {
                    setLoading(false)
                }
            }
        }

        void loadUser()

        return () => {
            mounted = false
        }
    }, [])

    const value = useMemo<AuthContextValue>(
        () => ({
            user,
            loading,
            isAuthenticated: user !== null,
            canAccessAdmin: user !== null && adminRoles.has(user.role),
            login: async (email: string, password: string) => {
                const result = await loginAuthUser(email, password)
                if (result.user) {
                    setUser(result.user)
                }
                return result
            },
            register: async (input) => {
                const result = await registerAuthUser(input)
                if (result.user) {
                    setUser(result.user)
                }
                return result
            },
            logout: async () => {
                await logoutAuthUser()
                setUser(null)
            },
            refreshUser,
        }),
        [user, loading],
    )

    useEffect(() => {
        console.log("🔍 AUTH DEBUG")
        console.log("User:", user)
        console.log("Role:", user?.role)
        console.log("Admin roles:", adminRoles)
        console.log("canAccessAdmin:", user ? adminRoles.has(user.role) : false)
    }, [user])

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
