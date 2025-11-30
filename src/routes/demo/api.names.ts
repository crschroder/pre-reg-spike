import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'

import { getClient } from '@/db'
export type TodoRow = {
  id: number 
  title: string
}

export const Route = createFileRoute('/demo/api/names')({
  server: {
    handlers: {
      GET: async () => {
        const client = await getClient();
         if (!client) {
          return json({ error: 'Database connection failed' }, { status: 500 })
        }

      

        const result = await client.query(`SELECT id, title FROM todos`)
        const rows = result as TodoRow[];

        const todos: Array<{ id: number; title: string }> = rows.map(row => ({
          id: Number(row.id),
          title: String(row.title),
        }))
          return json(todos)


      },
    },

      },  
})

