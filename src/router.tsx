import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { Auth0Provider } from '@auth0/auth0-react'

import './styles.css'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

const router = createRouter({
  routeTree,
  scrollRestoration: true,
  defaultPreloadStaleTime: 0,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router    
  }
   interface StaticDataRouteOption {
    publicMode?: boolean
  }
}

const rootEl = document.getElementById('root')
if (!rootEl) {
  throw new Error('Missing #root element')
}

const authDomain = import.meta.env.VITE_AUTH0_DOMAIN
const authClientId = import.meta.env.VITE_AUTH0_CLIENT_ID

const renderApp = () => {
  if (!authDomain || !authClientId) {
    ReactDOM.createRoot(rootEl).render(
      <React.StrictMode>
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-6">
          <div className="max-w-xl text-center">
            <h1 className="text-2xl font-bold mb-3">Auth0 is not configured</h1>
            <p className="text-slate-300 mb-4">
              Add VITE_AUTH0_DOMAIN and VITE_AUTH0_CLIENT_ID to your local .env file before using the login button.
            </p>
            <p className="text-sm text-slate-400">
              Example: VITE_AUTH0_DOMAIN=your-tenant.us.auth0.com and VITE_AUTH0_CLIENT_ID=your-client-id
            </p>
          </div>
        </div>
      </React.StrictMode>,
    )
    return
  }

  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <Auth0Provider
        domain={authDomain}
        clientId={authClientId}
        authorizationParams={{ redirect_uri: window.location.origin }}
        onRedirectCallback={(appState) => {
          router.history.replace(appState?.returnTo ?? '/')
        }}
      >
        <RouterProvider router={router} />
      </Auth0Provider>
    </React.StrictMode>,
  )
}

renderApp()
