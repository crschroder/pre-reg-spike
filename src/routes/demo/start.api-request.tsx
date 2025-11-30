import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {useQuery} from '@tanstack/react-query'

import { TodoRow } from './api.names'
function getRows() {
  return fetch('/demo/api/names').then((res) => res.json() as Promise<TodoRow[]>)
}

export const Route = createFileRoute('/demo/start/api-request')({
  component: Home,
})

function Home() {
  // const [names, setNames] = useState<Array<string>>([])

  // useEffect(() => {     
  //    getRows().then ((rows)=> {
  //     setNames(rows.map(row=> row.title))
  //    });
  // }, [])

    const { data: rows, isLoading, error } = useQuery<TodoRow[]>({
    queryKey: ['todos'],       // unique cache key
    queryFn: getRows,          // your fetch function
  })


  const names = rows?.map((row) => row.title) ?? []


  
  return (
    <div
      className="flex items-center justify-center min-h-screen p-4 text-white"
      style={{
        backgroundColor: '#000',
        backgroundImage:
          'radial-gradient(ellipse 60% 60% at 0% 100%, #444 0%, #222 60%, #000 100%)',
      }}
    >
      <div className="w-full max-w-2xl p-8 rounded-xl backdrop-blur-md bg-black/50 shadow-xl border-8 border-black/10">
        <h1 className="text-2xl mb-4">Start API Request Demo - Names List</h1>

        {isLoading && <div className="text-gray-300">Loading please wait...</div>}
        {error && <div className="text-red-400">Error loading data</div>}

        {!isLoading && !error && (
          <ul className="mb-4 space-y-2">
            {names.map((name) => (
              <li
                key={name}
                className="bg-white/10 border border-white/20 rounded-lg p-3 backdrop-blur-sm shadow-md"
              >
                <span className="text-lg text-white">{name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )

}
