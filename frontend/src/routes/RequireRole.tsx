import { Navigate, useLocation } from 'react-router-dom'
import type { ReactElement } from 'react'
import { useAuth } from '../hooks/useAuth'
import type { AuthRole } from '../api/auth'

interface RequireRoleProps {
  allowedRoles: AuthRole[]
  children: ReactElement
}

export function RequireRole({ allowedRoles, children }: RequireRoleProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return null
  }

  if (!user) {
    return (
      <Navigate
        to="/auth?tab=login"
        replace
        state={{ from: { pathname: location.pathname, search: location.search } }}
      />
    )
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/products" replace />
  }

  return children
}


