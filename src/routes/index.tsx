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
  const { isAuthenticated, user, isLoading } = useAuth0()

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
            Welcome to the Kyokai Event Page .
          </p>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto mb-8">
            Here you can find information about upcoming events and manage your participation.
          </p>
          
          <div className="mx-auto mt-6 max-w-4xl rounded-xl border border-slate-700 bg-slate-900/80 p-6 text-left text-slate-100 shadow-2xl shadow-cyan-500/10">
            <h2 className="mb-4 text-2xl font-black text-white md:text-3xl">
              Sherwood Park & Beaumont Karate Tournament
            </h2>

            <div className="space-y-3 text-base md:text-lg">
              <div className="flex flex-col gap-1 md:flex-row md:items-start">
                <span className="min-w-[120px] font-black uppercase tracking-wide text-white">Date:</span>
                <span>Saturday, October 24, 2026</span>
              </div>

              <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between md:gap-4">
                <div className="flex flex-col gap-1 md:flex-row md:items-start">
                  <span className="min-w-[120px] font-black uppercase tracking-wide text-white">Registration:</span>
                  <span>8:30-9:30 am (Tournament starts at 10 am)</span>
                </div>

                <button
                  type="button"
                  onClick={() => (window.location.href = '/tournament/participant/register/28/create-participant-dayof')}
                  className="mt-2 inline-flex items-center justify-center rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-400 md:mt-0"
                >
                  Or Pre-Register Now
                </button>
              </div>

              <div className="flex flex-col gap-1 md:flex-row md:items-start">
                <span className="min-w-[120px] font-black uppercase tracking-wide text-white">Location:</span>
                <span>
                  F.R. Haythorne Junior High School<br />
                  300 Colwill Blvd, Sherwood Park, AB, T8R 5R7
                </span>
              </div>

              <div className="flex flex-col gap-1 md:flex-row md:items-start">
                <span className="min-w-[120px] font-black uppercase tracking-wide text-white">Cost:</span>
                <span>
                  - Pre-reg prices (October 1 to 20): $45 for 1 person, $75 for 2 family members, add $25 for each additional family member<br />
                  - Day of prices (Oct 24): $60 for 1 person/$90 for 2 family members, add $30 for each additional family member
                </span>
              </div>

              <div className="flex flex-col gap-1 md:flex-row md:items-start">
                <span className="min-w-[120px] font-black uppercase tracking-wide text-white">Events:</span>
                <span>Kobudo (weapons), Kata &amp; Kumite (sparring)</span>
              </div>

              <div className="flex flex-col gap-1 md:flex-row md:items-start">
                <span className="min-w-[120px] font-black uppercase tracking-wide text-white">Awards:</span>
                <span>Medals will be awarded for 1st, 2nd &amp; 3rd place finishes.</span>
              </div>

              <div className="flex flex-col gap-1 md:flex-row md:items-start">
                <span className="min-w-[120px] font-black uppercase tracking-wide text-white">Kumite:</span>
                <span>
                  Up to 4th Kyu, coloured belt matches will run 2 minutes/3 full points<br />
                  Black &amp; Brown belt matches will run 2 minutes/3 full points or 6 half points.<br />
                  <em className="text-cyan-300">*all kumite events will be double elimination</em>
                </span>
              </div>

              <div className="flex flex-col gap-1 md:flex-row md:items-start">
                <span className="min-w-[120px] font-black uppercase tracking-wide text-white">Kata:</span>
                <span>
                  Competitors may perform any kata of their choice. We advise choosing a kata you are proficient with. Individual kata will be head-to-head &amp; decided by a show of flags.<br />
                  Brown &amp; Red/Black belts will be required to do a different kata for each round.
                </span>
              </div>

              <div className="flex flex-col gap-1 md:flex-row md:items-start">
                <span className="min-w-[120px] font-black uppercase tracking-wide text-white">Kobudo:</span>
                <span>
                  Weapons kata will be scored using the flag system as well. We will run 4 divisions: 2 junior and 2 adult&apos;s division. Kyu grades may perform Kihon or traditional weapons katas. Black Belts must perform a traditional weapons kata and may perform the same kata for subsequent rounds.
                </span>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-700 pt-4 text-base text-slate-200">
              <p>
                Our tournament is for all Adult &amp; Junior Shito Ryu Karate-Do Kyokai members &amp; invited dojo.
              </p>
              <p className="mt-2">
                We are looking forward to seeing you on Saturday October 24, 2026.
              </p>
              <p className="mt-4">
                Steve Hartnett (780-938-0218; shartnett@shaw.ca) &amp;<br />
                Kendall Watson (780-504-4475; beamontkarate-do@live.ca)
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center gap-4">
            {isLoading ? (
              <div className="text-gray-300">Loading…</div>
            ) : isAuthenticated ? (
              <div className="text-lg text-cyan-300">
                Signed in as {user?.name ?? user?.email ?? 'member'}
              </div>
            ) : null}
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
