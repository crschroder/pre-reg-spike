import { createFileRoute } from '@tanstack/react-router'
import { useAuth0 } from '@auth0/auth0-react'
import { useEffect, useState } from 'react'
import { createVolunteerByEmail } from '@/api/tournaments'

export const Route = createFileRoute('/tournament/volunteer/signup')({
  component: RouteComponent,
})

const VOLUNTEER_SIGNUP_INTENT_KEY = 'volunteer-signup-intent'

function RouteComponent() {
  const { isAuthenticated, isLoading, user, loginWithRedirect } = useAuth0()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  const createVolunteerForEmail = async (email: string) => {
    setIsSubmitting(true)
    setStatusMessage('')

    try {
      await createVolunteerByEmail(email)
      setStatusMessage('Volunteer account created successfully.')
    } catch (error: any) {
      const status = error?.response?.status
      if (status === 409) {
        setStatusMessage('This email is already registered as a volunteer.')
      } else if (status === 404) {
        setStatusMessage('Volunteer role is not configured yet. Please contact support.')
      } else {
        setStatusMessage('Unable to create volunteer account right now. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSignUp = async () => {
    if (!isAuthenticated) {
      sessionStorage.setItem(VOLUNTEER_SIGNUP_INTENT_KEY, '1')
      await loginWithRedirect({
        appState: {
          returnTo: '/tournament/volunteer/signup',
        },
        authorizationParams: {
          screen_hint: 'signup',
        },
      })
      return
    }

    if (!user?.email) {
      setStatusMessage('No email was found in your Auth0 profile.')
      return
    }

    await createVolunteerForEmail(user.email)
  }

  useEffect(() => {
    if (isLoading || !isAuthenticated) {
      return
    }

    const signupIntent = sessionStorage.getItem(VOLUNTEER_SIGNUP_INTENT_KEY)
    if (signupIntent !== '1') {
      return
    }

    sessionStorage.removeItem(VOLUNTEER_SIGNUP_INTENT_KEY)

    if (!user?.email) {
      setStatusMessage('No email was found in your Auth0 profile.')
      return
    }

    void createVolunteerForEmail(user.email)
  }, [isAuthenticated, isLoading, user?.email])

  return (
    <div className="min-h-screen bg-gray-900 px-6 pb-6 pt-10 text-white">
      <div className="mx-auto mt-6 max-w-2xl rounded-xl border border-gray-700 bg-gray-800/95 p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-white md:text-4xl">Volunteer Sign Up</h1>
        <p className="mt-3 text-base text-gray-300 md:text-lg">
          Create your volunteer account to access tournament schedules, assignments, and updates.
        </p>

        <div className="mt-8">
          <button
            type="button"
            onClick={handleSignUp}
            disabled={isLoading || isSubmitting}
            className="inline-flex items-center justify-center rounded-lg bg-cyan-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-gray-800"
          >
            {isSubmitting ? 'Creating volunteer account...' : 'Sign up to volunteer'}
          </button>
          {statusMessage ? <p className="mt-3 text-sm text-gray-200">{statusMessage}</p> : null}
        </div>
      </div>
    </div>
  )
}
