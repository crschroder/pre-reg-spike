// src/routes/tournaments/create.tsx
import CreateTournament from '@/components/Create/CreateTournament'
import { createFileRoute } from '@tanstack/react-router'
import { RequireAllowedEmail } from '@/auth/RequireAllowedEmail'

export const Route = createFileRoute('/tournament/organizer/create')({
  component: RequireAllowedEmail(TournamentCreatePage, ['organizer', 'administrator']),
})

function TournamentCreatePage() {
  console.log('Rendering TournamentCreatePage')
  return <CreateTournament tournamentId={undefined} />
}
