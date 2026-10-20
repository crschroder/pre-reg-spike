import { useQuery } from '@tanstack/react-query'

import api from '@/api/axios'

const normalizeRoles = (roles: unknown): string[] =>
  Array.isArray(roles)
    ? roles.map((role) => String(role).trim().toLowerCase()).filter(Boolean)
    : []

export function useUserRoles(email?: string, enabled = true) {
  return useQuery({
    queryKey: ['userRoles', email ?? 'anonymous'],
    enabled: Boolean(email) && enabled,
    queryFn: async () => {
      const response = await api.get('/api/me/roles', {
        params: { email },
      })

      return normalizeRoles(response.data?.roles)
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  })
}
