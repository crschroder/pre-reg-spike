import { createFileRoute } from '@tanstack/react-router'
// Import everything from the generated client.ts file
// Import the generated file
//import * as client from '../../../generated/prisma/client.ts'

// Explicitly grab the value export


export const Route = createFileRoute('/tournament/api/tournment/events')({
   server: {
    handlers: {
      GET: async () => {
       // Call your Node API server instead of importing Prisma
        const res = await fetch('http://localhost:4000/tournament/api/tournment/events')
        if (!res.ok) {
          return new Response(JSON.stringify({ error: 'Server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        const tournaments = await res.json()


        return new Response(JSON.stringify(tournaments), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      },
    },
  },



})

