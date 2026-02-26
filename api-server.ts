import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { safeParse } from 'valibot'

import { HttpError, errorHandler } from './errors/HttpError'
import { TournamentStatus, validStatuses } from './shared'
import { TournamentSchema } from './validations/TournamentSchema'

import type { Prisma } from '@prisma/client'
import type { NextFunction, Request, Response } from 'express'
import type {
  CreateRegistrationPayload,
  DivisionPayload,
  DojoResponse,
  EventSelection,
  ParticipantUpdatePayload,
  TournamentEventDivisionRow,
  TournamentEventPayload,
  TournamentStatusType,
  TypedRequest,
} from './shared'
import e from 'cors'

dotenv.config()

let prismaClient: PrismaClient | undefined

function getPrisma(): PrismaClient {
  if (prismaClient) return prismaClient

  if (!process.env.DATABASE_URL) {
    throw new HttpError('DATABASE_URL is not configured', 500)
  }

  const shouldUseSsl =
    process.env.PGSSLMODE === 'require' || process.env.DATABASE_URL.includes('sslmode=require')

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ...(shouldUseSsl ? { ssl: { rejectUnauthorized: false } } : {}),
  })
  const adapter = new PrismaPg(pool)

  const isProduction = process.env.NODE_ENV === 'production'
  const logQueriesEnv = process.env.PRISMA_LOG_QUERIES
  const logQueries = logQueriesEnv ? logQueriesEnv === 'true' : !isProduction
  const prismaLog = [
    ...(isProduction ? ([] as const) : (['info'] as const)),
    ...(logQueries ? (['query'] as const) : ([] as const)),
    'warn' as const,
    'error' as const,
  ]

  prismaClient = new PrismaClient({
    log: prismaLog,
    adapter,
  })

  return prismaClient
}


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
const allowedOrigins = (process.env.CORS_ORIGINS?.split(',') ?? []).map((origin) => origin.trim())

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, mobile apps, server-to-server)
    if (!origin) return callback(null, true)

    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    }

    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
}

app.use(
  cors(corsOptions)
)
// Explicitly handle CORS preflight before auth middleware
app.options(/.*/, cors(corsOptions))
app.use(express.json());

// Health check endpoint - NO AUTH REQUIRED
app.get('/ping', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'pong',
    dbConfigured: Boolean(process.env.DATABASE_URL),
  })
})

// API Key auth middleware - applies to all other routes
app.use((req, res, next) => {
  // Never require auth for health checks or CORS preflight
  if (req.method === 'OPTIONS' || req.path === '/ping') {
    return next()
  }

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


    const tournament = await getPrisma().tournament.findUnique({
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

      const tournaments = await getPrisma().tournament.findMany({
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
    const tournaments = await getPrisma().tournament.findMany({
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
    const organizer = await getPrisma().user.findUnique({
      where: { id: organizerId }
    });

    if (!organizer) {   
      return next(new HttpError('Organizer not found', 400));
    }

    // ✅ Step 2: Create tournament
    const tournament = await getPrisma().tournament.create({
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
      await getPrisma().tournamentEvent.createMany({
        data: eventIds.map(eventId => ({
          tournamentId,
          eventId,
        })),
        skipDuplicates: true, // optional but helpful
      });
      const created = await getPrisma().tournamentEvent.findMany({
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
      const existing = await getPrisma().tournamentEvent.findMany({
        where: { tournamentId },
      });

      const existingIds = existing.map(te => te.eventId);

      // 2. Determine which eventIds to add
      const toAdd = eventIds.filter(id => !existingIds.includes(id));

      // 3. Determine which eventIds to remove
      const toRemove = existingIds.filter(id => !eventIds.includes(id));

      // 4. Insert new TournamentEvent rows
      if (toAdd.length > 0) {
        await getPrisma().tournamentEvent.createMany({
          data: toAdd.map(eventId => ({
            tournamentId,
            eventId,
          })),
        });
      }

      // 5. Delete removed TournamentEvent rows
      if (toRemove.length > 0) {
        await getPrisma().tournamentEvent.deleteMany({
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

    const tournamentEvents = await getPrisma().tournamentEvent.findMany({
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
    const organizer = await getPrisma().user.findUnique({
      where: { id: organizerId }
    });
    if (!organizer) {
      return next(new HttpError("Organizer not found", 400));
    }

    // ✅ Update tournament
    const tournament = await getPrisma().tournament.update({
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
    const eventTypes = await getPrisma().event.findMany();
    res.json(eventTypes);
  } catch (err) {
    next(err); // delegate to error handler
  }
});

app.get('/api/event-types/:tournamentId', async (_req: Request, _res: Response, next: NextFunction) => {
  try {
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
      await getPrisma().eventAllowedDivision.findMany({
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
      const tournamentEvent = await getPrisma().tournamentEvent.findFirst({
        where: { tournamentId, eventId },
      });

      if (!tournamentEvent) {
        return res.status(400).json({ error: "TournamentEvent not found" });
      }

      // 2. Fetch existing divisions
      const rows = await getPrisma().tournamentEventDivision.findMany({
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
      const tournamentEvent = await getPrisma().tournamentEvent.findFirst({
        where: { tournamentId, eventId },
      });

      if (!tournamentEvent) {
        return res.status(400).json({ error: "TournamentEvent not found" });
      }

      // 2. Delete existing rows
      await getPrisma().tournamentEventDivision.deleteMany({
        where: { tournamentEventId: tournamentEvent.id },
      });

      // 3. Build typed rows for Prisma
      const rows: TournamentEventDivisionRow[] = divisions.map((d) => ({
        tournamentEventId: tournamentEvent.id,
        divisionId: d.divisionId,
        genderId: d.genderId,
      }));

      // 4. Insert new rows
      const created = await getPrisma().tournamentEventDivision.createMany({
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

    if (!payload?.participant || !payload?.events || !payload?.email) {
      return res.status(400).json({ error: "Invalid payload - email, participant, and events are required" });
    }

    const {
      email,
      participant: {
        firstName,
        lastName,
        age,
        genderId,
        beltRankId,
        notes, 
        dojoId
      },
      events
    } = payload;

    // Find or create user by email
    let user = await getPrisma().user.findUnique({
      where: { email }
    });

    if (!user) {
      user = await getPrisma().user.create({
        data: {
          email,
          role: "participant"
        }
      });
    }

    const userId = user.id;

const divisions = await getPrisma().tournamentEventDivision.findMany({
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
const selectedEventIds: number[] = [];

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
  
  // Track unique event IDs for ParticipantEvent table
  matches.forEach(match => {
    if (!selectedEventIds.includes(match.tournamentEvent.eventId)) {
      selectedEventIds.push(match.tournamentEvent.eventId);
    }
  });
});




// const selectedDivisionIds = divisions
//   .filter(d => events.includes(d.tournamentEvent.event.name.toLowerCase() as EventSelection))
//   .map(d => d.id);

  const result = await getPrisma().$transaction(async (tx) => {
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
      paid: false, 
      dojoId,
      otherDojoName: payload.participant.otherDojoName
    }
  });

  await tx.registration.createMany({
    data: selectedDivisionIds.map((divisionId) => ({
      participantId: participant.id,
      eventDivisionId: divisionId
    }))
  });

  // Insert selected events into ParticipantEvent table
  await tx.participantEvent.createMany({
    data: selectedEventIds.map((eventId) => ({
      participantId: participant.id,
      eventId: eventId
    }))
  });

  return participant;
});

return res.status(201).json({
  message: "Registration created",
  participant: result,
  user: { id: user.id, email: user.email },
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

      const participant = await getPrisma().participant.findUnique({
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

    const participants = await getPrisma().participant.findMany({
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


app.get('/api/tournaments/:id/participants/lite', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tournamentId = Number(req.params.id);
    if (!tournamentId || isNaN(tournamentId)) {
      return res.status(400).json({ error: "Invalid tournament ID" });
    }
    const participants = await getPrisma().participantSummary.findMany({ where: { tournamentId } });
    return res.json(participants);
  } catch (err) { next(err); }

});
  
// app.get('/api/tournaments/:id/divisions', async (req: Request, res: Response, next: NextFunction) => {
// });


app.patch('/api/participant/:id', async (req: TypedRequest<{ id: string }, ParticipantUpdatePayload>, res: Response, next: NextFunction) => {
  try {
    const participantId = Number(req.params.id);
    if (!participantId || isNaN(participantId)) {
      return res.status(400).json({ error: "Invalid participant ID" });
    }
    const payload = req.body as ParticipantUpdatePayload;
    const {
      //   email,

      //     firstName,
      //     lastName,
      age,
      genderId,
      beltRankId
      //     notes,
      //     dojoId,
      //     otherDojoName,
      //     paid,
      //     checkedIn,
    } = payload;
    let events: EventSelection[] = payload.events ?? [];

    const allowedFields: (keyof ParticipantUpdatePayload)[] = ['paid', 'checkedIn', 'notes', 'firstName', 'lastName', 'age', 'beltRankId', 'dojoId', 'otherDojoName', 'email', 'events'];
    const updateData: Prisma.ParticipantUpdateInput = {};

    for (const field of allowedFields) {
      if (field in payload && field !== 'events') {
        (updateData as any)[field] = payload[field];
      }
    }
    const updated = await getPrisma().participant.update({
      where: { id: participantId },
      data: updateData,
    });

    if (events) {
      // Delete all existing ParticipantEvent records for this participant
      await getPrisma().participantEvent.deleteMany({
        where: { participantId },
      });

      // Insert new ParticipantEvent records
      const eventIds = await getPrisma().event.findMany({
        where: {
          name: { in: events ? events.map((e: any) => String(e).toLowerCase()) : [] }
        },
        select: { id: true }
      });

      if (eventIds.length > 0) {
        await getPrisma().participantEvent.createMany({
          data: eventIds.map(({ id }) => ({
            participantId,
            eventId: id,
          })),
        });
      }
    }

    if (age || genderId || beltRankId || events) {

      const divisions = await getPrisma().tournamentEventDivision.findMany({
        where: {
          tournamentEvent: {
            tournamentId: updated.tournamentId
          },
          genderId: {
            in: [updated.genderId, 3]   // competitor gender OR coed
          },
          division: {
            beltRankId: updated.beltRankId,
            divisionType: {
              minAge: { lte: updated.age },
              maxAge: { gte: updated.age }
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
      const selectedEventIds: number[] = [];

      if (!events || events.length === 0) {
        events = [];
        
        events = await getPrisma().participantEvent.findMany({
          where: { participantId },
          include: { event: true }
        }).then(res => res.map(pe => pe.event.name.toLowerCase() as EventSelection));
      }

      events.forEach(event => {
        const eventName = String(event).toLowerCase();

        const genderMatches = divisions.filter(
          d =>
            d.tournamentEvent.event.name.toLowerCase() === eventName &&
            d.genderId === updated.genderId
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

        // Track unique event IDs for ParticipantEvent table
        matches.forEach(match => {
          if (!selectedEventIds.includes(match.tournamentEvent.eventId)) {
            selectedEventIds.push(match.tournamentEvent.eventId);
          }
        });
      });

      await getPrisma().registration.deleteMany({
        where: { participantId },
      });

      //const result = await getPrisma().$transaction(async (tx) => {
  

  await getPrisma().registration.createMany({
    data: selectedDivisionIds.map((divisionId) => ({
      participantId: updated.id,
      eventDivisionId: divisionId
    }))
  });

  // Insert selected events into ParticipantEvent table
  // await getPrisma().participantEvent.createMany({
  //   data: selectedEventIds.map((eventId) => ({
  //     participantId: updated.id,
  //     eventId: eventId
  //   }))
  // });



    }



    res.json({ message: "Participant updated", participant: updated });

  } catch (err) {
    next(err);
  }

});

app.get('/api/dojos', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const dojos = await getPrisma().dojo.findMany();
    const mapped: DojoResponse[] = dojos.map(({ id, dojoName, city }) => ({
  id,
  name: dojoName,
  city,
}));

    res.json(mapped);
  } catch (err) {
    next(err);
  }
});

app.get('/api/tournaments/:id/participant', async (req: Request, res: Response, next: NextFunction) => {
  try {    const participantId = Number(req.params.id);
    if (!participantId || isNaN(participantId)) {
      return res.status(400).json({ error: "Invalid participant ID" });
    }
    const participant = await getPrisma().participant.findUnique({
      where: { id: participantId },
      include: {events: {include: {event: true}},  
        user : true}
    });
    if (!participant) {
      return res.status(404).json({ error: "Participant not found" });
    }

    const mapped : CreateRegistrationPayload = {
      email: participant.user.email,
      participant: {
        firstName: participant.firstName,
        lastName: participant.lastName,
        age: participant.age,
        genderId: participant.genderId,
        beltRankId: participant.beltRankId,
        notes: participant.notes || undefined,
        dojoId: participant.dojoId || undefined,
        otherDojoName: participant.otherDojoName || undefined,
        paid: participant.paid || undefined,
        checkedIn: participant.checkedIn || undefined
      },
      events: participant.events.map(e => e.event.name.toLowerCase() as EventSelection)
    };  

    res.json(mapped);
  } catch (err) {
    next(err);
  }
});

app.use(errorHandler);

const PORT = Number(process.env.PORT ?? process.env.WEBSITES_PORT ?? 4000);

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`)
})