import { useAuth0 } from '@auth0/auth0-react'
import { createFileRoute } from '@tanstack/react-router'
import {
  Zap,
  Server,
  Route as RouteIcon,
  Shield,
  Waves,
  Sparkles,
} from 'lucide-react'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const { isAuthenticated, loginWithRedirect, logout, user, isLoading } = useAuth0()
 
  

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <section className="relative py-20 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10"></div>
        <div className="relative max-w-5xl mx-auto">
          <div className="flex items-center justify-center gap-6 mb-6">
            <img
              src="/KYOKAI-LOGO2.svg"
              alt="Kyuoku Kai Logo"
              className="w-24 h-24 md:w-32 md:h-32"
            />
            <h1 className="text-6xl md:text-7xl font-black text-white [letter-spacing:-0.08em]">
              <span className="text-gray-300">KYO</span>
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                KAI
              </span>
            </h1>
          </div>
          <p className="text-2xl md:text-3xl text-gray-300 mb-4 font-light">
            This is a demo application for the Kyokai Event Manager.
          </p>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto mb-8">
            The purpose of this application is to move the pre-registration process for our tournaments online. It is built using the latest web technologies, including React, TypeScript, and Tailwind CSS, to provide a modern and responsive user experience.
          </p>
          <div className="flex flex-col items-center gap-4">
            {isLoading ? (
              <div className="text-gray-300">Loading…</div>
            ) : isAuthenticated ? (
              <>
                <div className="text-lg text-cyan-300">
                  Signed in as {user?.name ?? user?.email ?? 'member'}
                </div>
                <button
                  type="button"
                  onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                  className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Log out
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() =>
                  loginWithRedirect({
                    authorizationParams: {
                      screen_hint: 'signup',
                    },
                  })
                }
                className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-cyan-500/50"
              >
                Sign up / log in
              </button>
            )}
          </div>
        </div>
      </section>

      {/* <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section> */}
    </div>
  )
}
