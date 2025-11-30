import express from 'express';
import type { NextFunction, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();
// import * as client from './generated/prisma/client.ts'; // not in the src folder now so only going one up
//   const PrismaClientClass = client.PrismaClient as unknown as new () => any

//         const prisma = new PrismaClientClass()
const app = express()

// Static array of items
const tournaments2 = [
  { id: 1, name: 'Teenage Dirtbag', artist: 'Wheatus' },
  { id: 2, name: 'Smells Like Teen Spirit', artist: 'Nirvana' },
  { id: 3, name: 'The Middle', artist: 'Jimmy Eat World' },
  { id: 4, name: 'My Own Worst Enemy', artist: 'Lit' },
  { id: 5, name: 'Fat Lip', artist: 'Sum 41' },
  { id: 6, name: 'All the Small Things', artist: 'blink-182' },
  { id: 7, name: 'Beverly Hills', artist: 'Weezer' },
]

// Health check endpoint
app.get('/ping', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'pong' })
})



app.get('/tournament/api/tournment/events', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tournaments = await prisma.tournament.findMany({
      include: { organizer: true, events: true, participants: true },
    })
    res.json(tournaments)
  } catch (err) {
     next(err) // delegate to error handler

  }
})


app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err)
  res.status(500).json({ error: 'Internal server error' })
})


app.listen(4000, () => {
  console.log('API server running on http://localhost:4000')
})