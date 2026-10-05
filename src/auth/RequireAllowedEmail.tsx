import { useAuth0 } from '@auth0/auth0-react'
import { useEffect, useMemo, useState } from 'react'
import type { ComponentType } from 'react'

import api from '@/api/axios'

const normalizeRoles = (roles: unknown): string[] =>
  Array.isArray(roles)
    ? roles.map((role) => String(role).trim().toLowerCase()).filter(Boolean)
    : []

export function NoAccess() {
  return (
    <div className="min-h-screen bg-slate-900 p-6 text-white">
      You do not have access to this page Please contact the administrator if you think you recieved message by mistake.
    </div>
  )
}

export function RequireAllowedEmail<P extends object>(
  Component: ComponentType<P>,
  requiredRoles: string[] = ['organizer', 'admin'],
) {
  const WrappedComponent = (props: P) => {
    const { isAuthenticated, isLoading, user, loginWithRedirect } = useAuth0()
    const [userRoles, setUserRoles] = useState<string[]>([])
    const [isCheckingRoles, setIsCheckingRoles] = useState(false)

    const normalizedRequiredRoles = useMemo(
      () => requiredRoles.map((role) => role.trim().toLowerCase()).filter(Boolean),
      [requiredRoles],
    )
    const userEmail = user?.email?.trim().toLowerCase() ?? ''

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        loginWithRedirect({
          appState: {
            returnTo: window.location.pathname + window.location.search,
          },
        })
      }
    }, [isAuthenticated, isLoading, loginWithRedirect])

    useEffect(() => {
      if (!isAuthenticated || !userEmail) {
        setUserRoles([])
        setIsCheckingRoles(false)
        return
      }

      let cancelled = false
      setIsCheckingRoles(true)

      const loadRoles = async () => {
        try {
          const response = await api.get('/api/me/roles', {
            params: { email: userEmail },
          })

          if (!cancelled) {
            setUserRoles(normalizeRoles(response.data?.roles))
          }
        } catch (error) {
          console.error('Failed to load user roles', error)
          if (!cancelled) {
            setUserRoles([])
          }
        } finally {
          if (!cancelled) {
            setIsCheckingRoles(false)
          }
        }
      }

      void loadRoles()

      return () => {
        cancelled = true
      }
    }, [isAuthenticated, userEmail])

    if (isLoading || (isAuthenticated && userEmail && isCheckingRoles)) {
      return <div className="min-h-screen bg-slate-900 p-6 text-white">Checking access…</div>
    }

    if (!isAuthenticated) {
      return <div className="min-h-screen bg-slate-900 p-6 text-white">Redirecting to sign in…</div>
    }

    if (!userEmail) {
      return <div className="min-h-screen bg-slate-900 p-6 text-white">No email was found for this account.</div>
    }

    const hasRequiredRole = normalizedRequiredRoles.some((role) => userRoles.includes(role))

    if (!hasRequiredRole) {
      return <NoAccess />
    }

    return <Component {...props} />
  }

  WrappedComponent.displayName = `RequireAllowedEmail(${Component.displayName ?? Component.name ?? 'Component'})`

  return WrappedComponent
}
