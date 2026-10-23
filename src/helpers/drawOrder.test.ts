import { describe, expect, it } from "vitest";
import {
  applyWinnerLoserDestinationLabels,
  assignLoserDestinationLabel,
  assignLoserFeedTarget,
} from "@/components/Organizer/DivisionDrawDouble";
import { formatParticipantLabel, randomizeBracketOrder, sortByDrawOrder } from "./drawOrder";

describe("randomizeBracketOrder", () => {
  it("keeps same-dojo participants out of the same first-round pair", () => {
    const participants = [
      { registrationId: 1, dojoName: "Alpha" },
      { registrationId: 2, dojoName: "Alpha" },
      { registrationId: 3, dojoName: "Bravo" },
      { registrationId: 4, dojoName: "Bravo" },
      { registrationId: 5, dojoName: "Charlie" },
      { registrationId: 6, dojoName: "Charlie" },
    ];

    const randomized = randomizeBracketOrder(participants, () => 0.5);

    for (let index = 0; index < randomized.length - 1; index += 2) {
      expect(randomized[index].dojoName).not.toBe(randomized[index + 1].dojoName);
    }
  });

  it("returns all participants exactly once", () => {
    const participants = [
      { registrationId: 1, dojoName: "Alpha" },
      { registrationId: 2, dojoName: "Beta" },
      { registrationId: 3, dojoName: "Gamma" },
      { registrationId: 4, dojoName: "Delta" },
    ];

    const randomized = randomizeBracketOrder(participants, () => 0.25);

    expect(randomized).toHaveLength(participants.length);
    expect(new Set(randomized.map((p) => p.registrationId)).size).toBe(participants.length);
  });

  it("sorts rows according to the draw order", () => {
    const items = [
      { registrationId: 1, dojoName: "Alpha" },
      { registrationId: 2, dojoName: "Beta" },
      { registrationId: 3, dojoName: "Gamma" },
    ];

    const drawOrder = [
      { registrationId: 3, dojoName: "Gamma" },
      { registrationId: 1, dojoName: "Alpha" },
      { registrationId: 2, dojoName: "Beta" },
    ];

    expect(sortByDrawOrder(items, drawOrder).map((item) => item.registrationId)).toEqual([3, 1, 2]);
  });

  it("adds the dojo name in a compact bracketed label", () => {
    expect(
      formatParticipantLabel({
        registrationId: 1,
        firstName: "Jane",
        lastName: "Doe",
        dojoName: "Northside Karate",
      })
    ).toBe("Jane Doe [Northside Karate]");

    expect(
      formatParticipantLabel({
        registrationId: 2,
        firstName: "John",
        lastName: "Smith",
        dojoName: undefined,
      })
    ).toBe("John Smith");
  });

  it("prefers cross-dojo first-round matches when dojo counts are uneven", () => {
    const participants = [
      { registrationId: 1, dojoName: "A" },
      { registrationId: 2, dojoName: "A" },
      { registrationId: 3, dojoName: "A" },
      { registrationId: 4, dojoName: "B" },
      { registrationId: 5, dojoName: "B" },
      { registrationId: 6, dojoName: "C" },
      { registrationId: 7, dojoName: "C" },
    ];

    const randomSequence = [0, 0, 0.2, 0, 0.9, 0.1, 0.2, 0.7];
    let index = 0;

    const randomized = randomizeBracketOrder(participants, () => {
      const next = randomSequence[index % randomSequence.length];
      index += 1;
      return next;
    });

    for (let pairIndex = 0; pairIndex < randomized.length - 1; pairIndex += 2) {
      expect(randomized[pairIndex].dojoName).not.toBe(randomized[pairIndex + 1].dojoName);
    }
  });

  it("assigns a loser feed to the first empty slot in the target match when the bracket is sparse", () => {
    const targetMatch = {
      id: "loser-r2m1",
      joinX: 0,
      centerY: 0,
      top: { kind: "feeder", id: "loser-r2m1-top", x: 0, y: -10 },
      bottom: { kind: "feeder", id: "loser-r2m1-bottom", x: 0, y: 10 },
    } as any;

    assignLoserFeedTarget(targetMatch, "winner-r2m1");
    expect(targetMatch.top.feedMatchId).toBe("winner-r2m1");

    const secondTarget = {
      id: "loser-r2m2",
      joinX: 0,
      centerY: 0,
      top: {
        kind: "feeder",
        id: "loser-r2m2-top",
        x: 0,
        y: -10,
        feedMatchId: "winner-r1m1",
        feedLabelPrefix: "Loser of",
      },
      bottom: { kind: "feeder", id: "loser-r2m2-bottom", x: 0, y: 10 },
    } as any;

    assignLoserFeedTarget(secondTarget, "winner-r2m2");
    expect(secondTarget.bottom.feedMatchId).toBe("winner-r2m2");
  });

  it("adds the loser destination label to a sparse winner match when the target loser match is known", () => {
    const winnerMatch = { loserDestination: undefined } as { loserDestination?: string };

    assignLoserDestinationLabel(winnerMatch, { matchNumber: 7 });

    expect(winnerMatch.loserDestination).toBe("Loser to 7");
  });

  it("applies loser-to labels to every visible winner match in a sparse round", () => {
    const winnerMatchesByRound = [
      [
        { id: "winner-r1m1", matchNumber: 1 },
        { id: "winner-r1m2", matchNumber: 2 },
        { id: "winner-r1m3", matchNumber: 3 },
      ],
      [{ id: "winner-r2m1", matchNumber: 5 }],
    ];
    const loserMatchesByRound = [
      [{ matchNumber: 4 }, { matchNumber: 7 }],
      [{ matchNumber: 8 }],
    ];

    applyWinnerLoserDestinationLabels(winnerMatchesByRound, loserMatchesByRound);

    expect(winnerMatchesByRound[0].every((match) => match.loserDestination)).toBe(true);
    expect(winnerMatchesByRound[0][0].loserDestination).toBe("Loser to 4");
    expect(winnerMatchesByRound[0][2].loserDestination).toBe("Loser to 7");
    expect(winnerMatchesByRound[1][0].loserDestination).toBe("Loser to 8");
  });

  it("falls back to the next available loser target when the sparse bracket leaves a gap", () => {
    const winnerMatchesByRound = [
      [{ id: "winner-r1m1", matchNumber: 1 }, { id: "winner-r1m2", matchNumber: 2 }],
      [{ id: "winner-r2m1", matchNumber: 5 }, { id: "winner-r2m2", matchNumber: 6 }],
    ];
    const loserMatchesByRound = [
      [{ matchNumber: 4 }],
      [{ matchNumber: 8 }, { matchNumber: 10 }],
    ];

    applyWinnerLoserDestinationLabels(winnerMatchesByRound, loserMatchesByRound);

    expect(winnerMatchesByRound[0].every((match) => match.loserDestination)).toBe(true);
    expect(winnerMatchesByRound[1].every((match) => match.loserDestination)).toBe(true);
  });
});
