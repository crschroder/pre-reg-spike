import {
  ManageDivisions,
  type ManageDivisionsSearch,
} from '@/components/Organizer/ManageDivisions';
import { createFileRoute } from '@tanstack/react-router'

const toStringArray = (value: unknown): string[] | undefined => {
  if (Array.isArray(value)) {
    const normalized = value
      .flatMap((item) => String(item).split(','))
      .map((item) => item.trim())
      .filter(Boolean)

    return normalized.length > 0 ? normalized : undefined
  }

  if (typeof value === 'string') {
    const normalized = value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)

    return normalized.length > 0 ? normalized : undefined
  }

  return undefined
}

const toBooleanArray = (value: unknown): boolean[] | undefined => {
  const values = Array.isArray(value) ? value : value == null ? [] : [value]
  const normalized = values.flatMap((item) => {
    if (typeof item === 'boolean') {
      return [item]
    }

    if (typeof item === 'string') {
      return item
        .split(',')
        .map((entry) => entry.trim().toLowerCase())
        .filter((entry): entry is 'true' | 'false' => entry === 'true' || entry === 'false')
        .map((entry) => entry === 'true')
    }

    return []
  })

  return normalized.length > 0 ? normalized : undefined
}

const toSearchString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined
  }

  const normalized = value.trim()
  return normalized.length > 0 ? normalized : undefined
}

export const Route = createFileRoute(
  '/tournament/organizer/manage-divisions/$id',
)({
   params: {
    parse: (params) => ({
      id: Number(params.id),
    }),
    stringify: (params) => ({
      id: String(params.id),
    }),
  },
  validateSearch: (search: Record<string, unknown>): ManageDivisionsSearch => ({
    fullName: toSearchString(search.fullName),
    eventDisplayName: toStringArray(search.eventDisplayName),
    divisionName: toStringArray(search.divisionName),
    eventName: toStringArray(search.eventName),
    participantRank: toStringArray(search.participantRank),
    participantGender: toStringArray(search.participantGender),
    checkedIn: toBooleanArray(search.checkedIn),
    isPaid: toBooleanArray(search.isPaid),
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams();
  const search = Route.useSearch();

  return <ManageDivisions tournamentId={id} search={search} />;
}
