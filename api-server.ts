import express from 'express';
import type { NextFunction, Request, Response } from 'express'
import { PrismaClient, Prisma } from '@prisma/client';
import { safeParse } from 'valibot';
import { TournamentSchema } from './validations/TournamentSchema';
import { errorHandler, HttpError } from './errors/HttpError';
import cors from "cors";
import { CreateRegistrationPayload, DivisionPayload, TournamentEventDivisionRow, TournamentEventPayload, TournamentStatus, TournamentStatusType, validStatuses } from './shared';

import dotenv from 'dotenv';
dotenv.config();
export const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error']
});


type EventAllowedDivisionWithDivision =
  Prisma.EventAllowedDivisionGetPayload<{
    include: {
      divisionType: {
        include: {
          divisions: { include: { beltRank: true } }
        },
      }
    }
  }>;



  
const app = express()
const allowedOrigins = process.env.CORS_ORIGINS?.split(',') ?? []

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, mobile apps, server-to-server)
      if (!origin) return callback(null, true)

      if (allowedOrigins.includes(origin)) {
        return callback(null, true)
      }

      return callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
  })
)
app.use(express.json());

// Health check endpoint - NO AUTH REQUIRED
app.get('/ping', (_req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'pong' })
})

// API Key auth middleware - applies to all other routes
app.use((req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
});

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

app.get(
  "/api/tournaments",
  async (req: Request<{}, {}, {}, { status?: TournamentStatusType }>, res, next) => {
    try {
      const { status } = req.query;

      if (status && !validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status filter" });
      }

      const now = new Date();
      let where: any = {};

      switch (status) {
        case TournamentStatus.Upcoming:
         where = {date: { gt: now }};
          break;

        case TournamentStatus.Past:
          where = {date: { lt: now }};
          break;

        case TournamentStatus.Open:
          where = {
            preregOpenDate: { lte: now },
            preregCloseDate: { gte: now },
          };
          break;

        case TournamentStatus.Closed:
          where = {
            preregCloseDate: { lt: now },
            startDate: { gt: now },
          };
          break;
      }

      const tournaments = await prisma.tournament.findMany({
        where,
        orderBy: { date: "asc" },
      });

      res.json(tournaments);
    } catch (error) {
      next(error);
    }
  }
);

app.get('/tournament/api/tournment/events', async (_req: Request, res: Response, next: NextFunction) => {
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

app.post('/api/tournaments/:id/tournamentEvents', async (req: Request<{ id: string }, any, TournamentEventPayload>,
    res: Response,
    next: NextFunction) => {
      try{
      const tournamentId = Number(req.params.id);
      const { eventIds } = req.body;
      if (!Array.isArray(eventIds) || eventIds.length === 0) {
        return res.status(400).json({ error: "eventIds must be a non-empty array" });
      }

      // Insert multiple TournamentEvent rows
      await prisma.tournamentEvent.createMany({
        data: eventIds.map(eventId => ({
          tournamentId,
          eventId,
        })),
        skipDuplicates: true, // optional but helpful
      });
      const created = await prisma.tournamentEvent.findMany({
        where: { tournamentId }
      });
      res.json(created);   

    } catch (error) {
      next(error);
    }
});

app.put(
  "/api/tournaments/:id/tournamentEvents",
  async (
    req: Request<{ id: string }, any, TournamentEventPayload>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const tournamentId = Number(req.params.id);
      const { eventIds } = req.body;

      if (!Array.isArray(eventIds)) {
        return res.status(400).json({ error: "eventIds must be an array" });
      }

      // 1. Fetch existing TournamentEvent rows
      const existing = await prisma.tournamentEvent.findMany({
        where: { tournamentId },
      });

      const existingIds = existing.map(te => te.eventId);

      // 2. Determine which eventIds to add
      const toAdd = eventIds.filter(id => !existingIds.includes(id));

      // 3. Determine which eventIds to remove
      const toRemove = existingIds.filter(id => !eventIds.includes(id));

      // 4. Insert new TournamentEvent rows
      if (toAdd.length > 0) {
        await prisma.tournamentEvent.createMany({
          data: toAdd.map(eventId => ({
            tournamentId,
            eventId,
          })),
        });
      }

      // 5. Delete removed TournamentEvent rows
      if (toRemove.length > 0) {
        await prisma.tournamentEvent.deleteMany({
          where: {
            tournamentId,
            eventId: { in: toRemove },
          },
        });
      }

      res.json({
        success: true,
        added: toAdd,
        removed: toRemove,
      });
    } catch (err) {
      next(err);
    }
  }
);

app.get('/api/tournaments/:id/tournamentEvents', async (req, res, next) => {
  try {
    const { id } = req.params;
    const tournamentId = Number(id);

    const tournamentEvents = await prisma.tournamentEvent.findMany({
      where: { tournamentId },
      include: { event: true }
    });

    res.json(tournamentEvents);
  } catch (error) {
    next(error);
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
// Get the list of possible events 
app.get('/api/event-types', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const eventTypes = await prisma.event.findMany();
    res.json(eventTypes);
  } catch (err) {
    next(err); // delegate to error handler
  }
});

app.get('/api/event/:eventId/allowed-divisions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eventIdNum =  
    Number(req.params.eventId);

    if (isNaN(eventIdNum)) {
      return res.status(400).json({ error: "Invalid eventId" });
    }

    // Prisma query
    const allowedDivisions: EventAllowedDivisionWithDivision[] =
      await prisma.eventAllowedDivision.findMany({
        where: { eventId: eventIdNum },
        include: {
          divisionType: {
            include: {
              divisions: { include: { beltRank: true } }
            },
          },    
        },
        orderBy: {
          divisionType: {minAge: 'asc'}
        },
      });

    // Return only the division objects (cleaner for UI)
    //const divisions = allowedDivisions.map(ad => ad.divisionType.divisions).flat();

    //res.json(mapDivisions(divisions));
     res.json(allowedDivisions.map(a => a.divisionType));

  } catch (err) {
    next(err); // delegate to error handler
  }
});

app.get(
  "/api/tournaments/:tournamentId/events/:eventId/divisions",
  async (req, res, next) => {
    try {
      const tournamentId = Number(req.params.tournamentId);
      const eventId = Number(req.params.eventId);

      // 1. Find the TournamentEvent row
      const tournamentEvent = await prisma.tournamentEvent.findFirst({
        where: { tournamentId, eventId },
      });

      if (!tournamentEvent) {
        return res.status(400).json({ error: "TournamentEvent not found" });
      }

      // 2. Fetch existing divisions
      const rows = await prisma.tournamentEventDivision.findMany({
        where: { tournamentEventId: tournamentEvent.id },
        select: {
          divisionId: true,
          genderId: true,
        },
      });

      return res.status(200).json(rows);
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);
app.post(
  "/api/tournaments/:tournamentId/events/:eventId/divisions",
  async (req, res, next) => {
    try {
      const tournamentId = Number(req.params.tournamentId);
      const eventId = Number(req.params.eventId);

      const divisions = req.body.divisions as DivisionPayload[];

      if (!Array.isArray(divisions)) {
        return res.status(400).json({ error: "Invalid payload: divisions must be an array" });
      }

      // 1. Find the TournamentEvent row
      const tournamentEvent = await prisma.tournamentEvent.findFirst({
        where: { tournamentId, eventId },
      });

      if (!tournamentEvent) {
        return res.status(400).json({ error: "TournamentEvent not found" });
      }

      // 2. Delete existing rows
      await prisma.tournamentEventDivision.deleteMany({
        where: { tournamentEventId: tournamentEvent.id },
      });

      // 3. Build typed rows for Prisma
      const rows: TournamentEventDivisionRow[] = divisions.map((d) => ({
        tournamentEventId: tournamentEvent.id,
        divisionId: d.divisionId,
        genderId: d.genderId,
      }));

      // 4. Insert new rows
      const created = await prisma.tournamentEventDivision.createMany({
        data: rows,
      });

      return res.status(200).json({ count: created.count });
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

app.post('/api/tournaments/:id/registrations', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tournamentId = Number(req.params.id);
    const payload = req.body as CreateRegistrationPayload;
    if (!tournamentId || isNaN(tournamentId)) {
  return res.status(400).json({ error: "Invalid tournament ID" });
}

if (!payload?.participant || !payload?.events) {
  return res.status(400).json({ error: "Invalid payload" });
}
const {
  userId,
  participant: {
    firstName,
    lastName,
    age,
    genderId,
    beltRankId,
    notes
  },
  events
} = payload;

const divisions = await prisma.tournamentEventDivision.findMany({
  where: {
    tournamentEvent: {
      tournamentId
    },
    genderId: {
      in: [genderId, 3]   // competitor gender OR coed
    },
    division: {
      beltRankId: beltRankId,
      divisionType: {
        minAge: { lte: age },
        maxAge: { gte: age }
      }
    }
  },
  include: {
    tournamentEvent: {
      include: { event: true }
    },
    division: {
      include: {
        divisionType: true,
        beltRank: true
      }
    }
  }
});

const selectedDivisionIds: number[] = [];

events.forEach(event => {
  const eventName = String(event).toLowerCase();
  
  const genderMatches = divisions.filter(
    d =>
      d.tournamentEvent.event.name.toLowerCase() === eventName &&
      d.genderId === genderId
  );

  const matches =
    genderMatches.length > 0
      ? genderMatches
      : divisions.filter(
          d =>
            d.tournamentEvent.event.name.toLowerCase() === eventName &&
            d.genderId === 3
        );

  selectedDivisionIds.push(...matches.map(d => d.id));
});




// const selectedDivisionIds = divisions
//   .filter(d => events.includes(d.tournamentEvent.event.name.toLowerCase() as EventSelection))
//   .map(d => d.id);

  const result = await prisma.$transaction(async (tx) => {
  const participant = await tx.participant.create({
    data: {
      firstName,
      lastName,
      age,
      genderId,
      beltRankId,
      tournamentId,
      userId,
      notes,
      paid: false
    }
  });

  await tx.registration.createMany({
    data: selectedDivisionIds.map((divisionId) => ({
      participantId: participant.id,
      eventDivisionId: divisionId
    }))
  });

  return participant;
});
return res.status(201).json({
  message: "Registration created",
  participant: result,
  events: selectedDivisionIds
});
  } catch (error) {
    next(error);
  }
});

  app.get('/api/participant/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const participantId = Number(req.params.id);
      if (!participantId || isNaN(participantId)) {
        return res.status(400).json({ error: "Invalid participant ID" });
      }

      const participant = await prisma.participant.findUnique({
        where: { id: participantId },
        include: {
          gender: true,
          rank: true,
          registrations: {
            include: {
              tournamentEventDivision: {
                include: {
                  division: {
                    include: {
                      divisionType: true,
                      beltRank: true
                    }
                  }
                  ,
                  tournamentEvent: {
                    include: {
                      event: true
                    }
                  }
                }
              }
            }
          }
        }
      });
      if (!participant) {
        return res.status(404).json({ error: "Participant not found" });
      }

      return res.json(participant);


    } catch (err) {
      next(err);
    }

  });

app.get('/api/tournaments/:id/participants', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tournamentId = Number(req.params.id);
    if (!tournamentId || isNaN(tournamentId)) {
      return res.status(400).json({ error: "Invalid tournament ID" });
    }

    const participants = await prisma.participant.findMany({
      where: { tournamentId },
      include: {
        gender: true,
        rank: true,
        registrations: {
          include: {
            tournamentEventDivision: {
              include: {
                eventGender: true,
                division: {
                  include: {
                    divisionType: true,
                    beltRank: true
                  }
                }
                ,
                tournamentEvent: {
                  include: {
                    event: true
                  }
                }
              }
            }
          }
        }
      }
    });
      return res.json(participants);
    } catch (err) {
      next(err);
    }
  });

// app.get('/api/tournaments/:id/divisions', async (req: Request, res: Response, next: NextFunction) => {
// });


app.use(errorHandler);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`)
})