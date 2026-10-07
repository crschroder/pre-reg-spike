import { Link } from '@tanstack/react-router'
import { useAuth0 } from '@auth0/auth0-react'

import { useEffect, useMemo, useState } from 'react'
import {
  Database,
  Home,
  Menu,
  Table,
  X,
} from 'lucide-react'

import api from '@/api/axios'

const normalizeRoles = (roles: unknown): string[] =>
  Array.isArray(roles)
    ? roles.map((role) => String(role).trim().toLowerCase()).filter(Boolean)
    : []

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [userRoles, setUserRoles] = useState<string[]>([])
  const { isAuthenticated, user, loginWithRedirect, logout } = useAuth0()

  const userEmail = user?.email?.trim().toLowerCase() ?? ''

  useEffect(() => {
    if (!isAuthenticated || !userEmail) {
      setUserRoles([])
      return
    }

    let cancelled = false

    const loadRoles = async () => {
      try {
        const response = await api.get('/api/me/roles', {
          params: { email: userEmail },
        })

        if (!cancelled) {
          setUserRoles(normalizeRoles(response.data?.roles))
        }
      } catch (error) {
        console.error('Failed to load user roles for header', error)
        if (!cancelled) {
          setUserRoles([])
        }
      }
    }

    void loadRoles()

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, userEmail])

  const hasOrganizerAccess = useMemo(
    () => userRoles.includes('organizer') || userRoles.includes('administrator'),
    [userRoles],
  )

  const buildVersion = import.meta.env.VITE_BUILD_VERSION as string | undefined
  const buildSha = import.meta.env.VITE_BUILD_SHA as string | undefined
  const buildTime = import.meta.env.VITE_BUILD_TIME as string | undefined

  const buildParts = [
    buildVersion ? `v${buildVersion}` : undefined,
    buildSha ? buildSha.slice(0, 8) : undefined,
    buildTime ? new Date(buildTime).toISOString().replace(/\.\d{3}Z$/, 'Z') : undefined,
  ].filter(Boolean)

  const buildLabel = buildParts.length > 0 ? buildParts.join(' · ') : 'dev'

  return (
    <>
      <header className="p-4 flex items-center justify-between bg-gray-800 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Open menu"
            type="button"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-semibold leading-none">
            <Link to="/" className="flex items-center gap-4">
              <img
                src="/KYOKAI-LOGO2.svg"
                alt="Kyuoku Kai Logo"
                className="h-16 w-auto"
              />
              <span>Kyokai Event Manager</span>
            </Link>
          </h1>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400 whitespace-nowrap sm:gap-4">
          {isAuthenticated && (
            <>
              <span className="hidden md:inline">Build: {buildLabel}</span>
              <span className="hidden md:inline text-cyan-300">Signed in as {user?.name ?? user?.email ?? 'member'}</span>
            </>
          )}

          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
              className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Log out
            </button>
          ) : (
            <button
              type="button"
              onClick={() =>
                loginWithRedirect({
                  authorizationParams: {
                    screen_hint: 'login',
                  },
                })
              }
              className="px-3 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
            >
              Log in
            </button>
          )}
        </div>
      </header>

      <aside
        className={`fixed top-0 left-0 h-full w-80 bg-gray-900 text-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold">Navigation</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
            activeProps={{
              className:
                'flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2',
            }}
          >
            <Home size={20} />
            <span className="font-medium">Home</span>
          </Link>

          {hasOrganizerAccess && (
            <Link
              to="/tournament/organizer"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
              activeOptions={{ exact: true }}
              activeProps={{
                className:
                  'flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2',
              }}
            >
              <Home size={20} />
              <span className="font-medium">Organizer Dashboard</span>
            </Link>
          )}

          {hasOrganizerAccess && (
            <Link
              to="/tournament/organizer/create"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
              activeOptions={{ exact: true }}
              activeProps={{
                className:
                  'flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2',
              }}
            >
              <Home size={20} />
              <span className="font-medium">Create New Tournament</span>
            </Link>
          )}

          <Link
            to="/tournament/participant"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
            activeProps={{
              className:
                'flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2',
            }}
          >
            <Database size={20} />
            <span className="font-medium">Register Tournament</span>
          </Link>

          {/* Demo Links Start */}

          {/* <Link
            to="/demo/table"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
            activeProps={{
              className:
                'flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2',
            }}
          >
            <Table size={20} />
            <span className="font-medium">TanStack Table</span>
          </Link> */}

          {/* Demo Links End */}
        </nav>
      </aside>
    </>
  )
}
