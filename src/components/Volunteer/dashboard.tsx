import { getUpcomingTournaments } from '@/api/tournaments'
import { TournamentStatus } from '@shared/index'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { format } from 'date-fns'

type UpcomingTournament = {
	id: number
	name: string
	date: string
	location: string | null
}

export function VolunteerDashboard() {
	const status = TournamentStatus.Upcoming
	const navigate = useNavigate()

	const { data: upcomingTournaments = [], isLoading: upcomingIsLoading } = useQuery({
		queryKey: ['tournaments', status],
		queryFn: () => getUpcomingTournaments(status),
	})

	function handleManageDivisions(id: number) {
		navigate({ to: `/tournament/organizer/manage-divisions/${id}` })
	}

	function handleManageRegistrants(id: number) {
		navigate({ to: `/tournament/organizer/manage-registrants/${id}` })
	}

	function handleViewDivisions(id: number) {
		navigate({ to: `/tournament/organizer/tournamentSummary/${id}` })
	}

	return (
		<div className="min-h-screen bg-gray-900 p-6 text-white flex flex-col items-center">
			<h1 className="text-3xl font-semibold mb-6">Volunteer Dashboard</h1>
			<div className="max-w-3xl mx-auto p-6">
				<h2 className="text-3xl font-bold mb-6 text-white">Select a Tournament</h2>

				{upcomingIsLoading ? <p className="text-gray-300">Loading tournaments...</p> : null}

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{upcomingTournaments.map((t: UpcomingTournament) => {
						return (
							<div key={t.id} className="p-5 rounded-lg border border-gray-700 bg-gray-800">
								<h3 className="text-xl font-semibold text-white">
									{t.name} ({t.id})
								</h3>
								<p className="text-gray-300">{format(new Date(t.date), 'MMM d, yyyy')}</p>
								<p className="text-gray-400">{t.location ?? 'Location TBD'}</p>

								<div className="mt-4 flex flex-wrap gap-2">
									<button
										onClick={() => handleManageRegistrants(t.id)}
										className="flex-1 min-w-max px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
									>
										Manage Registrants
									</button>
									<button
										onClick={() => handleManageDivisions(t.id)}
										className="flex-1 min-w-max px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
									>
										Manage Divisions
									</button>
									<button
										onClick={() => handleViewDivisions(t.id)}
										className="flex-1 min-w-max px-3 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 text-sm"
									>
										View Divisions
									</button>
								</div>
							</div>
						)
					})}
				</div>
			</div>
		</div>
	)
}

