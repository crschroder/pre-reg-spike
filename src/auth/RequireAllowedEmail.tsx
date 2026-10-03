import { useAuth0 } from '@auth0/auth0-react'
import { useEffect, useMemo } from 'react'
import type { ComponentType } from 'react'

const getAllowedEmails = (): string[] => {
  const raw = import.meta.env.VITE_ALLOWED_EMAILS ?? ''

  return raw
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

export function RequireAllowedEmail<P extends object>(Component: ComponentType<P>) {
  const WrappedComponent = (props: P) => {
    const { isAuthenticated, isLoading, user, loginWithRedirect } = useAuth0()

    const allowedEmails = useMemo(() => getAllowedEmails(), [])
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

    if (isLoading) {
      return <div className="min-h-screen bg-slate-900 p-6 text-white">Checking access…</div>
    }

    if (!isAuthenticated) {
      return <div className="min-h-screen bg-slate-900 p-6 text-white">Redirecting to sign in…</div>
    }

    if (!userEmail) {
      return <div className="min-h-screen bg-slate-900 p-6 text-white">No email was found for this account.</div>
    }

    if (allowedEmails.length === 0) {
      return (
        <div className="min-h-screen bg-slate-900 p-6 text-white">
          Access is not configured. Add VITE_ALLOWED_EMAILS to your local .env file.
        </div>
      )
    }

    if (!allowedEmails.includes(userEmail)) {
      return (
        <div className="min-h-screen bg-slate-900 p-6 text-white">
          Access denied for {userEmail}. Please contact the administrator.
        </div>
      )
    }

    return <Component {...props} />
  }

  WrappedComponent.displayName = `RequireAllowedEmail(${Component.displayName ?? Component.name ?? 'Component'})`

  return WrappedComponent
}
