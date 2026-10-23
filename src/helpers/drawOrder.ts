export type DrawOrderParticipant = {
  registrationId: number;
  dojoName?: string | null;
  firstName?: string;
  lastName?: string;
};

const stableShuffle = <T>(items: T[], randomFn: () => number): T[] => {
  const nextItems = [...items];

  for (let index = nextItems.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(randomFn() * (index + 1));
    [nextItems[index], nextItems[swapIndex]] = [nextItems[swapIndex], nextItems[index]];
  }

  return nextItems;
};

const normalizeDojo = (dojoName?: string | null) => {
  return (dojoName ?? "Unknown").trim() || "Unknown";
};

const buildValidPairs = <T extends DrawOrderParticipant>(participants: T[], randomFn: () => number): T[][] => {
  const shuffledParticipants = stableShuffle(participants, randomFn);
  const memo = new Map<string, T[][] | null>();

  const scorePairings = (pairings: T[][]): number => {
    return pairings.reduce((total, pair) => {
      if (pair.length < 2) {
        return total;
      }

      const [left, right] = pair;
      return total + (normalizeDojo(left.dojoName) === normalizeDojo(right.dojoName) ? 1 : 0);
    }, 0);
  };

  const search = (remaining: T[]): T[][] | null => {
    if (remaining.length === 0) {
      return [];
    }

    if (remaining.length === 1) {
      return [[remaining[0]]];
    }

    const key = [...remaining]
      .map((participant) => participant.registrationId)
      .sort((left, right) => left - right)
      .join(",");

    if (memo.has(key)) {
      return memo.get(key) ?? null;
    }

    const current = remaining[0];
    const currentDojo = normalizeDojo(current.dojoName);
    const candidatePool = stableShuffle(remaining.slice(1), randomFn);
    const orderedCandidates = [...
      candidatePool.filter((candidate) => normalizeDojo(candidate.dojoName) !== currentDojo),
      ...candidatePool.filter((candidate) => normalizeDojo(candidate.dojoName) === currentDojo),
    ];

    let bestPairings: T[][] | null = null;

    for (const candidate of orderedCandidates) {
      const nextRemaining = remaining.filter(
        (participant) => participant.registrationId !== current.registrationId && participant.registrationId !== candidate.registrationId,
      );
      const pairings = search(nextRemaining);

      if (pairings) {
        const result = [[current, candidate], ...pairings];

        if (!bestPairings || scorePairings(result) < scorePairings(bestPairings)) {
          bestPairings = result;
        }

        if (scorePairings(bestPairings) === 0) {
          memo.set(key, bestPairings);
          return bestPairings;
        }
      }
    }

    memo.set(key, bestPairings);
    return bestPairings;
  };

  return search(shuffledParticipants) ?? [];
};

export function formatParticipantLabel<T extends { firstName?: string; lastName?: string; dojoName?: string | null }>(
  participant: T,
): string {
  const firstName = participant.firstName?.trim() ?? "";
  const lastName = participant.lastName?.trim() ?? "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || "Unknown";
  const dojoName = participant.dojoName?.trim();

  return dojoName ? `${fullName} [${dojoName}]` : fullName;
}

export function randomizeBracketOrder<T extends DrawOrderParticipant>(
  participants: T[],
  randomFn: () => number = Math.random,
): T[] {
  if (participants.length <= 1) {
    return [...participants];
  }

  const pairs = buildValidPairs(participants, randomFn);
  const firstRoundOrder = pairs.flat();
  const adjusted = firstRoundOrder.length === participants.length ? firstRoundOrder : [...firstRoundOrder, ...participants.filter((participant) => !firstRoundOrder.some((entry) => entry.registrationId === participant.registrationId))];

  return adjusted;
}

export function sortByDrawOrder<T extends { registrationId: number }>(
  items: T[],
  drawOrder: T[],
): T[] {
  if (!drawOrder.length) {
    return [...items];
  }

  const drawOrderIndex = new Map<number, number>();

  drawOrder.forEach((participant, index) => {
    drawOrderIndex.set(participant.registrationId, index);
  });

  return [...items].sort((left, right) => {
    const leftIndex = drawOrderIndex.get(left.registrationId);
    const rightIndex = drawOrderIndex.get(right.registrationId);

    if (leftIndex === undefined && rightIndex === undefined) {
      return 0;
    }

    if (leftIndex === undefined) {
      return 1;
    }

    if (rightIndex === undefined) {
      return -1;
    }

    return leftIndex - rightIndex;
  });
}
