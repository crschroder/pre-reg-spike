import { useMemo } from "react";
import { useAtomValue } from "jotai";
import { selectedRegistrationsAtom } from "@/store/selectedRegistrations";

type RegistrationRow = {
  id: number;
  firstName: string;
  lastName: string;
  participantGender: string;
  participantRank: string;
  divisionName: string;
  eventName: string;
  eventDislayName: string;
};

type SeededParticipant = {
  registration: RegistrationRow;
  seed: number;
};

type ParticipantSource = {
  kind: "participant";
  id: string;
  label: string;
  seed: number;
};

type MatchSource = {
  kind: "match";
  matchId: string;
};

type Source = ParticipantSource | MatchSource;

type MatchInput = {
  source: Source;
  y: number;
};

type VisibleMatch = {
  id: string;
  round: number;
  y: number;
  top: MatchInput;
  bottom: MatchInput;
};

type BuildResult = {
  source: Source;
  y: number;
  matches: VisibleMatch[];
};

type BuiltBracket = {
  bracketSize: number;
  matches: VisibleMatch[];
  rounds: number[];
  totalRounds: number;
};

function nextPowerOfTwo(value: number) {
  let size = 1;

  while (size < value) {
    size *= 2;
  }

  return size;
}

function getParticipantLabel(registration: RegistrationRow) {
  return `${registration.firstName} ${registration.lastName}`;
}

function getRoundLabel(roundIndex: number, totalRounds: number) {
  const roundsFromEnd = totalRounds - roundIndex - 1;

  if (roundsFromEnd === 0) {
    return "Final";
  }

  if (roundsFromEnd === 1) {
    return "Semifinal";
  }

  if (roundsFromEnd === 2) {
    return "Quarterfinal";
  }

  return `Round ${roundIndex + 1}`;
}

function buildSeedOrder(size: number) {
  if (size === 1) {
    return [1];
  }

  let order = [1, 2];

  while (order.length < size) {
    const nextSize = order.length * 2;
    const nextOrder: number[] = [];

    for (const seed of order) {
      nextOrder.push(seed, nextSize + 1 - seed);
    }

    order = nextOrder;
  }

  return order;
}

function buildSeededBracket(participants: RegistrationRow[]) {
  if (participants.length === 0) {
    return {
      bracketSize: 0,
      matches: [],
      rounds: [],
      totalRounds: 0,
    } satisfies BuiltBracket;
  }

  const bracketSize = nextPowerOfTwo(Math.max(participants.length, 2));
  const totalRounds = Math.log2(bracketSize);
  const seedOrder = buildSeedOrder(bracketSize);
  const slots = seedOrder.map((seed) => {
    const registration = participants[seed - 1];

    if (!registration) {
      return null;
    }

    return {
      registration,
      seed,
    } satisfies SeededParticipant;
  });

  const topPadding = 72;
  const leafSpacing = 132;
  let matchCounter = 1;

  function build(rangeStart: number, size: number, round: number): BuildResult | null {
    if (size === 1) {
      const slot = slots[rangeStart];

      if (!slot) {
        return null;
      }

      return {
        source: {
          kind: "participant",
          id: `seed-${slot.seed}`,
          label: getParticipantLabel(slot.registration),
          seed: slot.seed,
        },
        y: topPadding + rangeStart * leafSpacing,
        matches: [],
      };
    }

    const halfSize = size / 2;
    const left = build(rangeStart, halfSize, round - 1);
    const right = build(rangeStart + halfSize, halfSize, round - 1);

    if (!left && !right) {
      return null;
    }

    if (!left) {
      return right;
    }

    if (!right) {
      return left;
    }

    const matchId = `match-${matchCounter}`;
    const matchY = (left.y + right.y) / 2;
    const match: VisibleMatch = {
      id: matchId,
      round,
      y: matchY,
      top: {
        source: left.source,
        y: left.y,
      },
      bottom: {
        source: right.source,
        y: right.y,
      },
    };

    matchCounter += 1;

    return {
      source: {
        kind: "match",
        matchId,
      },
      y: matchY,
      matches: [...left.matches, ...right.matches, match],
    };
  }

  const root = build(0, bracketSize, totalRounds);
  const matches = root?.matches ?? [];
  const rounds = Array.from(new Set(matches.map((match) => match.round))).sort(
    (left, right) => left - right
  );

  return {
    bracketSize,
    matches,
    rounds,
    totalRounds,
  } satisfies BuiltBracket;
}

export function DivisionDraw() {
  const registrations = useAtomValue(selectedRegistrationsAtom) ?? [];

  const bracket = useMemo(() => buildSeededBracket(registrations), [registrations]);

  const titleRegistration = registrations[0];
  const roundSpacing = 220;
  const roundOneStartX = 24;
  const roundOneJoinX = 220;
  const finalLineLength = 180;
  const chartHeight = Math.max(bracket.bracketSize * 132 + 12, 360);
  const chartWidth =
    bracket.totalRounds > 0
      ? roundOneJoinX + (bracket.totalRounds - 1) * roundSpacing + finalLineLength + 36
      : 0;

  function getJoinX(round: number) {
    return roundOneJoinX + (round - 1) * roundSpacing;
  }

  function getEntryX(round: number) {
    if (round === 1) {
      return roundOneStartX;
    }

    return getJoinX(round - 1);
  }

  function renderSourceText(source: ParticipantSource, x: number, y: number) {
    return (
      <text
        x={x + 12}
        y={y - 10}
        fill="currentColor"
        fontSize="14"
        className="text-white print:text-black"
      >
        <tspan fontWeight="700">{source.seed}</tspan>
        <tspan dx="12">{source.label}</tspan>
      </text>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6 text-white print:min-h-0 print:bg-white print:p-4 print:text-black">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Tournament Draw Sheet</h2>
        <p className="mt-1 text-sm text-gray-300 print:text-gray-600">
          Single-elimination printable bracket.
        </p>
      </div>

      {registrations.length === 0 ? (
        <p>No registrations selected.</p>
      ) : (
        <section className="rounded-lg border border-gray-700 bg-gray-800 p-6 print:border-gray-400 print:bg-white">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold">
                {titleRegistration?.divisionName || "Division"}
              </h3>
              <p className="text-sm text-gray-300 print:text-gray-600">
                {titleRegistration?.eventDislayName || titleRegistration?.eventName || ""}
              </p>
            </div>

            <div className="text-right text-sm text-gray-300 print:text-gray-600">
              <div>{registrations.length} competitors</div>
              <div>Single Elimination</div>
            </div>
          </div>

          {bracket.matches.length === 0 ? (
            <div className="rounded border border-gray-600 p-6 text-sm print:border-gray-400">
              {registrations[0]
                ? `${registrations[0].firstName} ${registrations[0].lastName}`
                : "No bracket available."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <svg
                width={chartWidth}
                height={chartHeight}
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="min-w-max overflow-visible text-white print:text-black"
                role="img"
                aria-label="Single elimination tournament bracket"
              >
                {bracket.rounds.map((round) => (
                  <text
                    key={`round-label-${round}`}
                    x={getEntryX(round)}
                    y={28}
                    fill="currentColor"
                    fontSize="13"
                    fontWeight="600"
                    className="uppercase tracking-wide text-gray-300 print:text-gray-600"
                  >
                    {getRoundLabel(round - 1, bracket.totalRounds)}
                  </text>
                ))}

                {bracket.matches.map((match) => {
                  const joinX = getJoinX(match.round);
                  const topStartX =
                    match.top.source.kind === "participant"
                      ? getEntryX(match.round)
                      : getJoinX(match.round - 1);
                  const bottomStartX =
                    match.bottom.source.kind === "participant"
                      ? getEntryX(match.round)
                      : getJoinX(match.round - 1);

                  return (
                    <g key={match.id}>
                      <line
                        x1={topStartX}
                        y1={match.top.y}
                        x2={joinX}
                        y2={match.top.y}
                        stroke="currentColor"
                        strokeWidth="2"
                      />

                      <line
                        x1={bottomStartX}
                        y1={match.bottom.y}
                        x2={joinX}
                        y2={match.bottom.y}
                        stroke="currentColor"
                        strokeWidth="2"
                      />

                      <line
                        x1={joinX}
                        y1={match.top.y}
                        x2={joinX}
                        y2={match.bottom.y}
                        stroke="currentColor"
                        strokeWidth="2"
                      />

                      {match.round < bracket.totalRounds && (
                        <line
                          x1={joinX}
                          y1={match.y}
                          x2={getJoinX(match.round + 1)}
                          y2={match.y}
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      )}

                      {match.round === bracket.totalRounds && (
                        <line
                          x1={joinX}
                          y1={match.y}
                          x2={joinX + finalLineLength}
                          y2={match.y}
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      )}

                      {match.top.source.kind === "participant" &&
                        renderSourceText(match.top.source, topStartX, match.top.y)}

                      {match.bottom.source.kind === "participant" &&
                        renderSourceText(match.bottom.source, bottomStartX, match.bottom.y)}
                    </g>
                  );
                })}
              </svg>
            </div>
          )}
        </section>
      )}
    </div>
  );
}