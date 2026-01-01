import express from 'express';
import type { NextFunction, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client';
import { safeParse } from 'valibot';
import { TournamentSchema } from './validations/TournamentSchema.ts';
import { errorHandler, HttpError } from './errors/HttpError.ts';


const prisma = new PrismaClient();

const app = express()

// Health check endpoint
app.get('/ping', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'pong' })
})

app.get('/api/tournaments/:id', async (req, res, next) => {
  try {
    const { id} = req.params;
     const tournamentId = Number(id);


    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: { organizer: true, events: true, participants: true },
    });

    if (!tournament) {
      return next(new HttpError("Tournament not found", 404));
    }

    res.json(tournament);
  } catch (error) {
    next(error);
  }
});




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

// Create a new tournament
// Create a new tournament
app.post('/api/tournaments', async (req, res, next) => {
  try {
    const { name, date, location, organizerId } = req.body;

      const result = safeParse(TournamentSchema, req.body);

    if (!result.success) {
      const err = new Error(result.issues.map(i => i.message).join(", "));
      (err as any).status = 400;
      return next(err);
    }



    // ✅ Step 1: Verify organizer exists
    const organizer = await prisma.user.findUnique({
      where: { id: organizerId }
    });

    if (!organizer) {   
      return next(new HttpError('Organizer not found', 400));
    }

    // ✅ Step 2: Create tournament
    const tournament = await prisma.tournament.create({
      data: {
        name,
        date: new Date(date),
        location,
        organizerId
      }
    });

    res.status(201).json(tournament);
  } catch (error) {
    next(error); // 👈 Pass to centralized error handler
  }
});

// Update an existing tournament
app.put('/api/tournaments/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const tournamentId = Number(id);
    
    const { name, date, location, organizerId } = req.body;

    // ✅ Validate input
    const result = safeParse(TournamentSchema, req.body);
    if (!result.success) {
      const err = new Error(result.issues.map(i => i.message).join(", "));
      (err as any).status = 400;
      return next(err);
    }

    // ✅ Verify organizer exists
    const organizer = await prisma.user.findUnique({
      where: { id: organizerId }
    });
    if (!organizer) {
      return next(new HttpError("Organizer not found", 400));
    }

    // ✅ Update tournament
    const tournament = await prisma.tournament.update({
      where: { id: tournamentId },
      data: {
        name,
        date: new Date(date),
        location,
        organizerId
      }
    });

    res.json(tournament);
  } catch (error) {
    next(error);
  }
});



app.use(errorHandler);


app.listen(4000, () => {
  console.log('API server running on http://localhost:4000')
})