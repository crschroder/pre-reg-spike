// src/auth/requireAuth.tsx
import type { ComponentType } from 'react'
import { withAuthenticationRequired } from '@auth0/auth0-react'

export function requireAuth<T extends object>(Component: ComponentType<T>) {
  return withAuthenticationRequired(Component, {
    onRedirecting: () => <div>Redirecting to sign in…</div>,
  }) as ComponentType<T>
}