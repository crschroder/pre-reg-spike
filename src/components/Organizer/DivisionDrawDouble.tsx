import { useMemo } from "react";
import { useAtomValue } from "jotai";
import { selectedRegistrationsAtom, type DrawRegistration } from "@/store/selectedRegistrations";

type TemplateSize = 4 | 8 | 16;

type TextLabel = {
    id: string;
    text: string;
    x: number;
    y: number;
};

type WinnerSlot = {
    id: string;
    seed: number;
    x: number;
    y: number;
};

type WinnerMatchTemplate = {
    id: string;
    round: number;
    topSourceId: string;
    bottomSourceId: string;
    joinX: number;
    centerY: number;
    matchNumber?: number;
    loserDestination?: string;
};

type SourcePoint = {
    kind: "slot" | "match" | "feeder";
    id: string;
    x: number;
    y: number;
    label?: string;
    feedMatchId?: string;
    feedLabelPrefix?: "Loser of" | "Winner of";
};

type RenderedMatch = {
    id: string;
    joinX: number;
    centerY: number;
    top: SourcePoint;
    bottom: SourcePoint;
    nextX?: number;
    matchNumber?: number;
    matchLabel?: string;
    loserDestination?: string;
};

type ChampionLine = {
    startX: number;
    endX: number;
    y: number;
    labelX: number;
    labelY: number;
    label: string;
};

type DoubleEliminationTemplate = {
    size: TemplateSize;
    viewBoxWidth: number;
    viewBoxHeight: number;
    printFrameWidth: number;
    printFrameHeight: number;
    sectionLabels: TextLabel[];
    winnersRoundLabels: TextLabel[];
    losersRoundLabels: TextLabel[];
    winnerSlots: WinnerSlot[];
    winnerMatches: WinnerMatchTemplate[];
    winnerRootMatchId: string;
    losersMatches: RenderedMatch[];
    championLine: ChampionLine;
    secondPlaceLabel: TextLabel;
    secondPlaceMatch: RenderedMatch;
};

type DoubleTemplateConfig = {
    size: TemplateSize;
    viewBoxWidth: number;
    viewBoxHeight: number;
    print: {
        frameWidth: number;
        frameHeight: number;
    };
    winners: {
        slotStartX: number;
        topPadding: number;
        leafSpacing: number;
        roundLength: number;
        roundLabelY: number;
    };
    losers: {
        slotStartX: number;
        topPadding: number;
        firstRoundMatchSpacing: number;
        feedEntryOffset: number;
        roundOffsetY: number;
        roundLength: number;
        roundLabelY: number;
        repeatedRoundHeightScale: number;
        repeatedRoundHeightGrowth: number;
        verticalShift: number;
        headerOffsetY: number;
        roundLabelOffsetY: number;
    };
    grandFinal: {
        roundLength: number;
        matchOffsetY: number;
        entryGap: number;
        labelOffsetX: number;
        labelOffsetY: number;
    };
};

const PRINT_FRAME_WIDTH_IN = 10.72;
const PRINT_FRAME_HEIGHT_IN = 8.22;

type PopulatedWinnerSlot = WinnerSlot & {
    competitor: DrawRegistration | null;
    label: string;
};

type WinnerRenderModel = {
    slots: PopulatedWinnerSlot[];
    visibleSlotSources: SourcePoint[];
    visibleMatches: RenderedMatch[];
};

type DoubleRenderModel = {
    template: DoubleEliminationTemplate;
    winners: WinnerRenderModel;
    losers: {
        visibleMatches: RenderedMatch[];
    };
};

function computeVisibleViewBoxHeight(
    template: DoubleEliminationTemplate,
    winners: WinnerRenderModel,
    losers: { visibleMatches: RenderedMatch[] }
) {
    const winnerSlotBottom = winners.visibleSlotSources.reduce((maxY, source) => Math.max(maxY, source.y), 0);
    const winnerMatchBottom = winners.visibleMatches.reduce(
        (maxY, match) => Math.max(maxY, match.bottom.y, match.centerY),
        0,
    );
    const loserMatchBottom = losers.visibleMatches.reduce(
        (maxY, match) => Math.max(maxY, match.bottom.y, match.centerY),
        0,
    );
    const secondPlaceBottom = Math.max(
        template.secondPlaceMatch.bottom.y,
        template.secondPlaceMatch.centerY,
        template.secondPlaceLabel.y,
    );
    const championBottom = Math.max(template.championLine.y, template.championLine.labelY);
    const contentBottom = Math.max(
        winnerSlotBottom,
        winnerMatchBottom,
        loserMatchBottom,
        secondPlaceBottom,
        championBottom,
    );

    return Math.max(template.viewBoxHeight, contentBottom + 48, 720);
}

function cloneSourcePoint(source: SourcePoint): SourcePoint {
    return {
        ...source,
    };
}

function cloneRenderedMatch(match: RenderedMatch): RenderedMatch {
    return {
        ...match,
        top: cloneSourcePoint(match.top),
        bottom: cloneSourcePoint(match.bottom),
    };
}

function cloneDoubleTemplate(template: DoubleEliminationTemplate): DoubleEliminationTemplate {
    return {
        ...template,
        sectionLabels: template.sectionLabels.map((label) => ({ ...label })),
        winnersRoundLabels: template.winnersRoundLabels.map((label) => ({ ...label })),
        losersRoundLabels: template.losersRoundLabels.map((label) => ({ ...label })),
        winnerSlots: template.winnerSlots.map((slot) => ({ ...slot })),
        winnerMatches: template.winnerMatches.map((match) => ({ ...match })),
        losersMatches: template.losersMatches.map((match) => cloneRenderedMatch(match)),
        championLine: { ...template.championLine },
        secondPlaceLabel: { ...template.secondPlaceLabel },
        secondPlaceMatch: cloneRenderedMatch(template.secondPlaceMatch),
    };
}

function getLosersRoundIndex(matchId: string) {
    const match = /^loser-r(\d+)m\d+$/.exec(matchId);

    if (!match) {
        return null;
    }

    return Number(match[1]) - 1;
}

function clearDynamicAnnotations(template: DoubleEliminationTemplate) {
    template.winnerMatches.forEach((match) => {
        delete match.matchNumber;
        delete match.loserDestination;
    });

    template.losersMatches.forEach((match) => {
        delete match.matchNumber;
        delete match.matchLabel;
        delete match.loserDestination;
        delete match.top.label;
        delete match.bottom.label;
        delete match.top.feedMatchId;
        delete match.bottom.feedMatchId;
        delete match.top.feedLabelPrefix;
        delete match.bottom.feedLabelPrefix;
    });

    delete template.secondPlaceMatch.matchNumber;
    template.secondPlaceMatch.matchLabel = "2nd Place Match";
    delete template.secondPlaceMatch.loserDestination;
    delete template.secondPlaceMatch.top.label;
    delete template.secondPlaceMatch.bottom.label;
    delete template.secondPlaceMatch.top.feedMatchId;
    delete template.secondPlaceMatch.bottom.feedMatchId;
    delete template.secondPlaceMatch.top.feedLabelPrefix;
    delete template.secondPlaceMatch.bottom.feedLabelPrefix;
}

function buildLoserRenderModel(template: DoubleEliminationTemplate) {
    const matchesById = new Map(template.losersMatches.map((match) => [match.id, match]));
    const resolvedSources = new Map<string, SourcePoint | null>();
    const visibleMatches: RenderedMatch[] = [];

    function resolveFeederSource(source: SourcePoint): SourcePoint | null {
        if (!source.feedMatchId) {
            return null;
        }

        return {
            ...source,
        };
    }

    function resolveSource(source: SourcePoint): SourcePoint | null {
        if (source.kind === "feeder") {
            return resolveFeederSource(source);
        }

        if (source.kind !== "match") {
            return { ...source };
        }

        return resolveMatch(source.id);
    }

    function promoteSource(source: SourcePoint, match: RenderedMatch): SourcePoint {
        if (source.kind === "feeder") {
            return {
                ...source,
                x: match.joinX,
                y: match.centerY,
            };
        }

        return source;
    }

    function resolveMatch(matchId: string): SourcePoint | null {
        if (resolvedSources.has(matchId)) {
            return resolvedSources.get(matchId) ?? null;
        }

        const match = matchesById.get(matchId);

        if (!match) {
            resolvedSources.set(matchId, null);

            return null;
        }

        const top = resolveSource(match.top);
        const bottom = resolveSource(match.bottom);

        if (!top && !bottom) {
            resolvedSources.set(matchId, null);

            return null;
        }

        if (!top && bottom) {
            const promoted = promoteSource(bottom, match);

            resolvedSources.set(matchId, promoted);

            return promoted;
        }

        if (!bottom && top) {
            const promoted = promoteSource(top, match);

            resolvedSources.set(matchId, promoted);

            return promoted;
        }

        const visibleMatch = {
            ...match,
            top: top!,
            bottom: bottom!,
        } satisfies RenderedMatch;
        const resolved = {
            kind: "match" as const,
            id: match.id,
            x: match.joinX,
            y: match.centerY,
        };

        visibleMatches.push(visibleMatch);
        resolvedSources.set(matchId, resolved);

        return resolved;
    }

    const loserFinal = template.losersMatches[template.losersMatches.length - 1];

    if (loserFinal) {
        resolveMatch(loserFinal.id);
    }

    visibleMatches.sort((left, right) => {
        if (left.joinX !== right.joinX) {
            return left.joinX - right.joinX;
        }

        return left.centerY - right.centerY;
    });

    return {
        visibleMatches,
    };
}

function applyDynamicNumberingAndFeeds(
    template: DoubleEliminationTemplate,
    initialWinners: WinnerRenderModel,
    participants: DrawRegistration[]
) {
    clearDynamicAnnotations(template);

    const totalWinnerRounds = Math.log2(template.size);
    const visibleWinnerIds = new Set(initialWinners.visibleMatches.map((match) => match.id));
    const visibleWinnerMatchesByRound = Array.from({ length: totalWinnerRounds }, (_, index) => {
        const round = index + 1;

        return template.winnerMatches
            .filter((match) => match.round === round && visibleWinnerIds.has(match.id))
            .sort((left, right) => left.centerY - right.centerY);
    });

    const losersMatchesByRound = template.losersMatches.reduce<RenderedMatch[][]>((acc, match) => {
        const roundIndex = getLosersRoundIndex(match.id);

        if (roundIndex == null) {
            return acc;
        }

        acc[roundIndex] ??= [];
        acc[roundIndex].push(match);

        return acc;
    }, []);

    losersMatchesByRound.forEach((matches) => matches.sort((left, right) => left.centerY - right.centerY));
    const winnerLoserTargets = new Map<string, string>();

    const firstRoundWinners = visibleWinnerMatchesByRound[0] ?? [];
    const firstLoserRound = losersMatchesByRound[0] ?? [];

    firstRoundWinners.forEach((match, index) => {
        const targetMatch = firstLoserRound[Math.floor(index / 2)];

        if (!targetMatch) {
            return;
        }

        winnerLoserTargets.set(match.id, targetMatch.id);

        if (index % 2 === 0) {
            targetMatch.top.feedMatchId = match.id;
            targetMatch.top.feedLabelPrefix = "Loser of";
        } else {
            targetMatch.bottom.feedMatchId = match.id;
            targetMatch.bottom.feedLabelPrefix = "Loser of";
        }
    });

    for (let round = 2; round < totalWinnerRounds; round += 1) {
        const targetLoserRoundIndex = 2 * round - 3;
        const targetLoserRound = losersMatchesByRound[targetLoserRoundIndex] ?? [];

        visibleWinnerMatchesByRound[round - 1].forEach((match, index) => {
            const targetMatch = targetLoserRound[index];

            if (!targetMatch) {
                return;
            }

            winnerLoserTargets.set(match.id, targetMatch.id);
            targetMatch.top.feedMatchId = match.id;
            targetMatch.top.feedLabelPrefix = "Loser of";
        });
    }

    const winnerFinal = visibleWinnerMatchesByRound[totalWinnerRounds - 1]?.[0];

    if (winnerFinal) {
        template.secondPlaceMatch.bottom.feedMatchId = winnerFinal.id;
        template.secondPlaceMatch.bottom.feedLabelPrefix = "Loser of";
    }

    const losers = buildLoserRenderModel(template);
    const visibleLosersByRound = losers.visibleMatches.reduce<RenderedMatch[][]>((acc, match) => {
        const roundIndex = getLosersRoundIndex(match.id);

        if (roundIndex == null) {
            return acc;
        }

        acc[roundIndex] ??= [];
        acc[roundIndex].push(match);

        return acc;
    }, []);

    visibleLosersByRound.forEach((matches) => matches.sort((left, right) => left.centerY - right.centerY));
    const templateLoserMatchById = new Map(template.losersMatches.map((match) => [match.id, match]));

    let nextMatchNumber = 1;

    for (let roundIndex = 0; roundIndex < totalWinnerRounds; roundIndex += 1) {
        for (const match of visibleWinnerMatchesByRound[roundIndex]) {
            match.matchNumber = nextMatchNumber;
            nextMatchNumber += 1;
        }

        const visibleLoserRound = visibleLosersByRound[roundIndex] ?? [];

        for (const match of visibleLoserRound) {
            match.matchNumber = nextMatchNumber;
            const templateMatch = templateLoserMatchById.get(match.id);

            if (templateMatch) {
                templateMatch.matchNumber = nextMatchNumber;
            }

            nextMatchNumber += 1;
        }
    }

    for (let roundIndex = totalWinnerRounds; roundIndex < visibleLosersByRound.length; roundIndex += 1) {
        const visibleLoserRound = visibleLosersByRound[roundIndex] ?? [];

        for (const match of visibleLoserRound) {
            match.matchNumber = nextMatchNumber;
            const templateMatch = templateLoserMatchById.get(match.id);

            if (templateMatch) {
                templateMatch.matchNumber = nextMatchNumber;
            }

            nextMatchNumber += 1;
        }
    }

    template.secondPlaceMatch.matchNumber = nextMatchNumber;

    const visibleLosersFinal = visibleLosersByRound[visibleLosersByRound.length - 1]?.[0];

    if (visibleLosersFinal) {
        template.secondPlaceMatch.top.feedMatchId = visibleLosersFinal.id;
        template.secondPlaceMatch.top.feedLabelPrefix = "Winner of";
    }

    const numberByMatchId = new Map<string, number>();

    template.winnerMatches.forEach((match) => {
        if (match.matchNumber != null) {
            numberByMatchId.set(match.id, match.matchNumber);
        }
    });

    template.losersMatches.forEach((match) => {
        if (match.matchNumber != null) {
            numberByMatchId.set(match.id, match.matchNumber);
        }
    });

    if (template.secondPlaceMatch.matchNumber != null) {
        numberByMatchId.set(template.secondPlaceMatch.id, template.secondPlaceMatch.matchNumber);
    }

    function applySourceLabel(source: SourcePoint) {
        if (!source.feedMatchId || !source.feedLabelPrefix) {
            return;
        }

        const matchNumber = numberByMatchId.get(source.feedMatchId);

        if (matchNumber != null) {
            source.label = `${source.feedLabelPrefix} ${matchNumber}`;
        }
    }

    template.losersMatches.forEach((match) => {
        applySourceLabel(match.top);
        applySourceLabel(match.bottom);
    });

    applySourceLabel(template.secondPlaceMatch.top);
    applySourceLabel(template.secondPlaceMatch.bottom);

    winnerLoserTargets.forEach((targetMatchId, winnerMatchId) => {
        const winnerMatch = template.winnerMatches.find((match) => match.id === winnerMatchId);
        const targetMatchNumber = numberByMatchId.get(targetMatchId);

        if (winnerMatch && targetMatchNumber != null) {
            winnerMatch.loserDestination = `Loser to ${targetMatchNumber}`;
        }
    });

    if (winnerFinal?.matchNumber != null && template.secondPlaceMatch.matchNumber != null) {
        winnerFinal.loserDestination = `Loser to ${template.secondPlaceMatch.matchNumber}`;
    }

    const winners = buildWinnerRenderModel(participants, template);
    const finalizedLosers = buildLoserRenderModel(template);

    return {
        winners,
        losers: finalizedLosers,
    };
}

const LIVE_FONT_SIZES = {
    sectionLabel: 17,
    roundLabel: 14,
    matchNumber: 12,
    feedLabel: 12,
    matchLabel: 15,
    championLabel: 15,
    secondPlaceLabel: 16,
    slotLabel: 17,
} as const;

const PRINT_FONT_SIZES = {
    sectionLabel: 23,
    roundLabel: 20,
    matchNumber: 18,
    feedLabel: 18,
    matchLabel: 21,
    championLabel: 21,
    secondPlaceLabel: 22,
    slotLabel: 23,
} as const;

const SHOW_BRACKET_SECTION_LABELS = false;
const SHOW_BRACKET_ROUND_LABELS = false;
const SLOT_LABEL_OFFSET_Y = 6;
const LOSERS_HEADER_LIFT = 58;
const LOSERS_ROUND_LABEL_LIFT = 66;
const LOSER_FEED_LABEL_OFFSET_Y = 20;

function getMatchNumberPosition(match: RenderedMatch) {
    return {
        x: match.joinX - 14,
        y: (match.top.y + match.bottom.y) / 2 + 4,
    };
}

function getTopFeedLabelPosition(source: SourcePoint) {
    const isLoserLabel = source.label?.startsWith("Loser of");
    const isWinnerLabel = source.label?.startsWith("Winner of");

    return {
        x: source.x + 6,
        y: isLoserLabel || isWinnerLabel ? source.y + LOSER_FEED_LABEL_OFFSET_Y : source.y - 10,
    };
}

function getBottomFeedLabelPosition(source: SourcePoint) {
    const isLoserLabel = source.label?.startsWith("Loser of");

    return {
        x: source.x + 6,
        y: isLoserLabel ? source.y + LOSER_FEED_LABEL_OFFSET_Y : source.y - 10,
    };
}

function getLoserDestinationPosition(match: RenderedMatch) {
    return {
        x: match.joinX + 12,
        y: match.centerY + 24,
    };
}

const DOUBLE_TEMPLATE_CONFIGS: Record<TemplateSize, DoubleTemplateConfig> = {
    4: {
        size: 4,
        viewBoxWidth: 1120,
        viewBoxHeight: 860,
        print: {
            frameWidth: 1650,
            frameHeight: 1300,
        },
        winners: {
            slotStartX: 24,
            topPadding: 110,
            leafSpacing: 205,
            roundLength: 390,
            roundLabelY: 42,
        },
        losers: {
            slotStartX: 120,
            topPadding: 520,
            firstRoundMatchSpacing: 198,
            feedEntryOffset: 58,
            roundOffsetY: 54,
            roundLength: 318,
            roundLabelY: 452,
            repeatedRoundHeightScale: 0.85,
            repeatedRoundHeightGrowth: 31,
            verticalShift: 22,
            headerOffsetY: 44,
            roundLabelOffsetY: 22,
        },
        grandFinal: {
            roundLength: 390,
            matchOffsetY: 20,
            entryGap: 42,
            labelOffsetX: 24,
            labelOffsetY: 82,
        },
    },
    8: {
        size: 8,
        viewBoxWidth: 1400,
        viewBoxHeight: 980,
        print: {
            frameWidth: 2080,
            frameHeight: 1760,
        },
        winners: {
            slotStartX: 24,
            topPadding: 92,
            leafSpacing: 114,
            roundLength: 530,
            roundLabelY: 38,
        },
        losers: {
            slotStartX: 110,
            topPadding: 610,
            firstRoundMatchSpacing: 330,
            feedEntryOffset: 66,
            roundOffsetY: 132,
            roundLength: 530,
            roundLabelY: 540,
            repeatedRoundHeightScale: 0.85,
            repeatedRoundHeightGrowth: 50,
            verticalShift: 34,
            headerOffsetY: 44,
            roundLabelOffsetY: 22,
        },
        grandFinal: {
            roundLength: 400,
            matchOffsetY: 20,
            entryGap: 42,
            labelOffsetX: 24,
            labelOffsetY: 82,
        },
    },
    16: {
        size: 16,
        viewBoxWidth: 1680,
        viewBoxHeight: 1220,
        print: {
            frameWidth: 2180,
            frameHeight: 2120,
        },
        winners: {
            slotStartX: 24,
            topPadding: 88,
            leafSpacing: 76,
            roundLength: 492,
            roundLabelY: 34,
        },
        losers: {
            slotStartX: 96,
            topPadding: 760,
            firstRoundMatchSpacing: 184,
            feedEntryOffset: 56,
            roundOffsetY: 88,
            roundLength: 396,
            roundLabelY: 690,
            repeatedRoundHeightScale: 0.85,
            repeatedRoundHeightGrowth: 30,
            verticalShift: 28,
            headerOffsetY: 44,
            roundLabelOffsetY: 22,
        },
        grandFinal: {
            roundLength: 492,
            matchOffsetY: 20,
            entryGap: 42,
            labelOffsetX: 24,
            labelOffsetY: 82,
        },
    },
};

function chooseTemplateSize(count: number): TemplateSize | null {
    if (count <= 0) {
        return null;
    }

    if (count <= 4) {
        return 4;
    }

    if (count <= 8) {
        return 8;
    }

    if (count <= 16) {
        return 16;
    }

    return null;
}

function getParticipantLabel(registration: DrawRegistration) {
    return `${registration.firstName} ${registration.lastName}`;
}

function buildDrawMetaTitle(title: string, eventName: string) {
    return eventName ? `${title} - ${eventName}` : title;
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

function getWinnersRoundLabel(roundIndex: number, totalRounds: number) {
    if (roundIndex === totalRounds - 1) {
        return "W Final";
    }

    return `W${roundIndex + 1}`;
}

function getLosersRoundCounts(size: TemplateSize) {
    const totalWinnerRounds = Math.log2(size);
    const counts: number[] = [];

    for (let exponent = totalWinnerRounds - 2; exponent >= 0; exponent -= 1) {
        const matchCount = 2 ** exponent;

        counts.push(matchCount, matchCount);
    }

    counts.pop();

    return counts;
}

function createDoubleTemplate(config: DoubleTemplateConfig): DoubleEliminationTemplate {
    const totalWinnerRounds = Math.log2(config.size);
    const seedOrder = buildSeedOrder(config.size);
    const winnerLeafSpacing = config.winners.leafSpacing;
    const winnerRoundLength = config.winners.roundLength;
    const loserFirstRoundSpacing = config.losers.firstRoundMatchSpacing;
    const loserFeedEntryOffset = config.losers.feedEntryOffset;
    const loserRoundLength = config.losers.roundLength;
    const finalRoundLength = config.grandFinal.roundLength;
    const losersRoundHeightScale = config.losers.repeatedRoundHeightScale;
    const losersRoundHeightGrowth = config.losers.repeatedRoundHeightGrowth;
    const winnerBottomY =
        config.winners.topPadding + (config.size - 1) * winnerLeafSpacing;
    const losersTopPadding = Math.max(config.losers.topPadding, winnerBottomY + 120) + config.losers.verticalShift;
    const losersHeaderY = losersTopPadding - config.losers.headerOffsetY - LOSERS_HEADER_LIFT;
    const losersRoundLabelY = losersTopPadding - config.losers.roundLabelOffsetY - LOSERS_ROUND_LABEL_LIFT;
    const winnerJoinXs = Array.from({ length: totalWinnerRounds }, (_, index) => {
        return config.winners.slotStartX + winnerRoundLength * (index + 1);
    });
    const winnerSlots = seedOrder.map((seed, index) => {
        return {
            id: `winner-slot-${seed}`,
            seed,
            x: config.winners.slotStartX,
            y: config.winners.topPadding + index * winnerLeafSpacing,
        } satisfies WinnerSlot;
    });
    const winnerMatchCounts: Record<number, number> = {};
    const winnerMatches: WinnerMatchTemplate[] = [];

    function buildWinners(rangeStart: number, size: number, round: number): { sourceId: string; y: number } {
        if (size === 1) {
            const slot = winnerSlots[rangeStart];

            return {
                sourceId: slot.id,
                y: slot.y,
            };
        }

        const halfSize = size / 2;
        const top = buildWinners(rangeStart, halfSize, round - 1);
        const bottom = buildWinners(rangeStart + halfSize, halfSize, round - 1);
        const matchNumber = (winnerMatchCounts[round] ?? 0) + 1;
        const matchId = `winner-r${round}m${matchNumber}`;
        const centerY = (top.y + bottom.y) / 2;

        winnerMatchCounts[round] = matchNumber;
        winnerMatches.push({
            id: matchId,
            round,
            topSourceId: top.sourceId,
            bottomSourceId: bottom.sourceId,
            joinX: winnerJoinXs[round - 1],
            centerY,
        });

        return {
            sourceId: matchId,
            y: centerY,
        };
    }

    const winnerRoot = buildWinners(0, config.size, totalWinnerRounds);
    const winnersRoundLabels = Array.from({ length: totalWinnerRounds }, (_, index) => {
        return {
            id: `winner-round-${index + 1}`,
            text: getWinnersRoundLabel(index, totalWinnerRounds),
            x: index === 0 ? config.winners.slotStartX : winnerJoinXs[index - 1] + 12,
            y: config.winners.roundLabelY,
        } satisfies TextLabel;
    });

    const losersRoundCounts = getLosersRoundCounts(config.size);
    const loserJoinXs = Array.from({ length: losersRoundCounts.length }, (_, index) => {
        return config.losers.slotStartX + loserRoundLength * (index + 1);
    });
    const losersMatchesByRound: RenderedMatch[][] = [];
    const loserRoundCenters: number[][] = [];
    const losersRoundLabels = losersRoundCounts.map((_, index) => {
        return {
            id: `loser-round-${index + 1}`,
            text: `L${index + 1}`,
            x: index === 0 ? config.losers.slotStartX : loserJoinXs[index - 1] + 12,
            y: losersRoundLabelY,
        } satisfies TextLabel;
    });

    for (let roundIndex = 0; roundIndex < losersRoundCounts.length; roundIndex += 1) {
        const matchCount = losersRoundCounts[roundIndex];
        const joinX = loserJoinXs[roundIndex];
        const entryGap = Math.round(loserFeedEntryOffset * losersRoundHeightScale);
        const roundMatches: RenderedMatch[] = [];
        const templateCenters =
            roundIndex === 0
                ? Array.from({ length: matchCount }, (_, matchIndex) => {
                        return (
                            losersTopPadding +
                            config.losers.roundOffsetY +
                            matchIndex * loserFirstRoundSpacing
                        );
                    })
                : (() => {
                        const previousCenters = loserRoundCenters[roundIndex - 1];
                        const previousCount = losersRoundCounts[roundIndex - 1];

                        if (matchCount === previousCount) {
                            return [...previousCenters];
                        }

                        return Array.from({ length: matchCount }, (_, matchIndex) => {
                            return (previousCenters[matchIndex * 2] + previousCenters[matchIndex * 2 + 1]) / 2;
                        });
                    })();

        const actualRoundCenters: number[] = [];

        for (let matchIndex = 0; matchIndex < matchCount; matchIndex += 1) {
            const matchId = `loser-r${roundIndex + 1}m${matchIndex + 1}`;
            let top: SourcePoint;
            let bottom: SourcePoint;
            let centerY: number;

            if (roundIndex === 0) {
                centerY = templateCenters[matchIndex];
                top = {
                    kind: "feeder",
                    id: `${matchId}-top-feeder`,
                    x: config.losers.slotStartX,
                    y: centerY - entryGap,
                };
                bottom = {
                    kind: "feeder",
                    id: `${matchId}-bottom-feeder`,
                    x: config.losers.slotStartX,
                    y: centerY + entryGap,
                };
            } else {
                const previousRound = losersMatchesByRound[roundIndex - 1];
                const previousCount = losersRoundCounts[roundIndex - 1];

                if (matchCount === previousCount) {
                    const previousMatch = previousRound[matchIndex];
                    const previousMatchHeight = Math.abs(previousMatch.bottom.y - previousMatch.top.y);
                    const nextMatchHeight = Math.round((previousMatchHeight + losersRoundHeightGrowth) * losersRoundHeightScale);
                    const feederY = previousMatch.centerY - nextMatchHeight;

                    centerY = (feederY + previousMatch.centerY) / 2;

                    top = {
                        kind: "feeder",
                        id: `${matchId}-top-feeder`,
                        x: joinX - loserRoundLength,
                        y: feederY,
                    };
                    bottom = {
                        kind: "match",
                        id: previousMatch.id,
                        x: previousMatch.joinX,
                        y: previousMatch.centerY,
                    };
                } else {
                    const previousTop = previousRound[matchIndex * 2];
                    const previousBottom = previousRound[matchIndex * 2 + 1];

                    centerY = (previousTop.centerY + previousBottom.centerY) / 2;

                    top = {
                        kind: "match",
                        id: previousTop.id,
                        x: previousTop.joinX,
                        y: previousTop.centerY,
                    };
                    bottom = {
                        kind: "match",
                        id: previousBottom.id,
                        x: previousBottom.joinX,
                        y: previousBottom.centerY,
                    };
                }
            }

            actualRoundCenters.push(centerY);
            roundMatches.push({
                id: matchId,
                joinX,
                centerY,
                top,
                bottom,
            });
        }

        loserRoundCenters.push(actualRoundCenters);
        losersMatchesByRound.push(roundMatches);
    }

    const lastLoserRoundCenters = loserRoundCenters[loserRoundCenters.length - 1] ?? [losersTopPadding];
    const loserBracketBottomY =
        Math.max(...lastLoserRoundCenters, ...loserRoundCenters.flat()) + loserFirstRoundSpacing / 2 + 56;

    const winnerMatchesByRound = Array.from({ length: totalWinnerRounds }, (_, index) => {
        const round = index + 1;

        return winnerMatches
            .filter((match) => match.round === round)
            .sort((left, right) => left.centerY - right.centerY);
    });
    let nextMatchNumber = 1;

    for (let roundIndex = 0; roundIndex < totalWinnerRounds; roundIndex += 1) {
        for (const match of winnerMatchesByRound[roundIndex]) {
            match.matchNumber = nextMatchNumber;
            nextMatchNumber += 1;
        }

        if (roundIndex < losersMatchesByRound.length) {
            for (const match of losersMatchesByRound[roundIndex]) {
                match.matchNumber = nextMatchNumber;
                nextMatchNumber += 1;
            }
        }
    }

    for (let roundIndex = totalWinnerRounds; roundIndex < losersMatchesByRound.length; roundIndex += 1) {
        for (const match of losersMatchesByRound[roundIndex]) {
            match.matchNumber = nextMatchNumber;
            nextMatchNumber += 1;
        }
    }

    const secondPlaceMatchNumber = nextMatchNumber;
    const losersMatches = losersMatchesByRound.flat();
    const losersFinal = losersMatchesByRound[losersMatchesByRound.length - 1][0];
    const winnerFinal = winnerMatchesByRound[totalWinnerRounds - 1][0];
    const championEndX = winnerFinal.joinX + finalRoundLength;
    const secondPlaceJoinX = Math.max(winnerFinal.joinX, losersFinal.joinX) + finalRoundLength;
    const secondPlaceWinnerX = secondPlaceJoinX + finalRoundLength;
    const secondPlaceCenterY = (winnerFinal.centerY + losersFinal.centerY) / 2 + config.grandFinal.matchOffsetY;
    const secondPlaceEntryGap = config.grandFinal.entryGap;
    const secondPlaceMatch = {
        id: "second-place-match",
        joinX: secondPlaceJoinX,
        centerY: secondPlaceCenterY,
        top: {
            kind: "feeder",
            id: "second-place-top-feeder",
            x: secondPlaceJoinX - finalRoundLength,
            y: secondPlaceCenterY - secondPlaceEntryGap,
            label: "",
        },
        bottom: {
            kind: "feeder",
            id: "second-place-bottom-feeder",
            x: secondPlaceJoinX - finalRoundLength,
            y: secondPlaceCenterY + secondPlaceEntryGap,
            label: "",
        },
        nextX: secondPlaceWinnerX,
        matchNumber: secondPlaceMatchNumber,
        matchLabel: "2nd Place Match",
    } satisfies RenderedMatch;

    for (const match of winnerMatchesByRound[0]) {
        const targetMatch = losersMatchesByRound[0][Math.floor((match.matchNumber! - 1) / 2)];

        match.loserDestination = `Loser to ${targetMatch.matchNumber}`;

        if ((match.matchNumber! - 1) % 2 === 0) {
            targetMatch.top.label = `Loser of ${match.matchNumber}`;
        } else {
            targetMatch.bottom.label = `Loser of ${match.matchNumber}`;
        }
    }

    for (let round = 2; round < totalWinnerRounds; round += 1) {
        const targetLoserRoundIndex = 2 * round - 3;

        if (!losersMatchesByRound[targetLoserRoundIndex]) {
            continue;
        }

        winnerMatchesByRound[round - 1].forEach((match, index) => {
            const targetMatch = losersMatchesByRound[targetLoserRoundIndex][index];

            match.loserDestination = `Loser to ${targetMatch.matchNumber}`;
            targetMatch.top.label = `Loser of ${match.matchNumber}`;
        });
    }

    winnerFinal.loserDestination = `Loser to ${secondPlaceMatchNumber}`;
    secondPlaceMatch.top.label = `Winner of ${losersFinal.matchNumber}`;
    secondPlaceMatch.bottom.label = `Loser of ${winnerFinal.matchNumber}`;

    const championLine = {
        startX: winnerFinal.joinX,
        endX: championEndX,
        y: winnerFinal.centerY,
        labelX: championEndX - finalRoundLength + 12,
        labelY: winnerFinal.centerY - 14,
        label: "1st Place",
    } satisfies ChampionLine;

    const viewBoxHeight = Math.max(
        config.viewBoxHeight,
        loserBracketBottomY,
        secondPlaceCenterY + 84,
    );
    const viewBoxWidth = Math.max(config.viewBoxWidth, secondPlaceWinnerX + 40);

    return {
        size: config.size,
        viewBoxWidth,
        viewBoxHeight,
        printFrameWidth: config.print.frameWidth,
        printFrameHeight: config.print.frameHeight,
        sectionLabels: [
            {
                id: "winners-label",
                text: "Winners Bracket",
                x: config.winners.slotStartX,
                y: 22,
            },
            {
                id: "losers-label",
                text: "Losers Bracket",
                x: config.losers.slotStartX,
                y: losersHeaderY,
            },
        ],
        winnersRoundLabels,
        losersRoundLabels,
        winnerSlots,
        winnerMatches,
        winnerRootMatchId: winnerRoot.sourceId,
        losersMatches,
        championLine,
        secondPlaceLabel: {
            id: "second-place-label",
            text: "2nd Place Match",
            x: secondPlaceJoinX - config.grandFinal.labelOffsetX,
            y: secondPlaceCenterY - config.grandFinal.labelOffsetY,
        },
        secondPlaceMatch,
    };
}

const DOUBLE_TEMPLATES: Record<TemplateSize, DoubleEliminationTemplate> = {
    4: createDoubleTemplate(DOUBLE_TEMPLATE_CONFIGS[4]),
    8: createDoubleTemplate(DOUBLE_TEMPLATE_CONFIGS[8]),
    16: createDoubleTemplate(DOUBLE_TEMPLATE_CONFIGS[16]),
};

function buildWinnerRenderModel(
    participants: DrawRegistration[],
    template: DoubleEliminationTemplate
): WinnerRenderModel {
    const slots = template.winnerSlots.map((slot) => {
        const competitor = participants[slot.seed - 1] ?? null;

        return {
            ...slot,
            competitor,
            label: competitor ? getParticipantLabel(competitor) : "",
        } satisfies PopulatedWinnerSlot;
    });
    const slotsById = new Map(slots.map((slot) => [slot.id, slot]));
    const matchesById = new Map(template.winnerMatches.map((match) => [match.id, match]));
    const visibleMatches: RenderedMatch[] = [];
    const resolvedSources = new Map<string, SourcePoint | null>();

    function resolveSource(sourceId: string): SourcePoint | null {
        if (resolvedSources.has(sourceId)) {
            return resolvedSources.get(sourceId) ?? null;
        }

        const slot = slotsById.get(sourceId);

        if (slot) {
            const resolved = slot.competitor
                ? {
                        kind: "slot" as const,
                        id: slot.id,
                        x: slot.x,
                        y: slot.y,
                    }
                : null;

            resolvedSources.set(sourceId, resolved);

            return resolved;
        }

        const match = matchesById.get(sourceId);

        if (!match) {
            resolvedSources.set(sourceId, null);

            return null;
        }

        const top = resolveSource(match.topSourceId);
        const bottom = resolveSource(match.bottomSourceId);

        if (!top && !bottom) {
            resolvedSources.set(sourceId, null);

            return null;
        }

        if (!top) {
            const promotedBottom =
                bottom?.kind === "slot"
                    ? {
                            ...bottom,
                            x: match.joinX,
                            y: match.centerY,
                        }
                    : (bottom ?? null);

            resolvedSources.set(sourceId, promotedBottom);

            return promotedBottom;
        }

        if (!bottom) {
            const promotedTop =
                top.kind === "slot"
                    ? {
                            ...top,
                            x: match.joinX,
                            y: match.centerY,
                        }
                    : top;

            resolvedSources.set(sourceId, promotedTop);

            return promotedTop;
        }

        const visibleMatch = {
            id: match.id,
            joinX: match.joinX,
            centerY: match.centerY,
            top,
            bottom,
            matchNumber: match.matchNumber,
            loserDestination: match.loserDestination,
        } satisfies RenderedMatch;
        const resolved = {
            kind: "match" as const,
            id: match.id,
            x: match.joinX,
            y: match.centerY,
        };

        visibleMatches.push(visibleMatch);
        resolvedSources.set(sourceId, resolved);

        return resolved;
    }

    resolveSource(template.winnerRootMatchId);

    visibleMatches.sort((left, right) => {
        if (left.joinX !== right.joinX) {
            return left.joinX - right.joinX;
        }

        return left.centerY - right.centerY;
    });

    const visibleSlotSources = Array.from(
        new Map(
            visibleMatches
                .flatMap((match) => [match.top, match.bottom])
                .filter((source): source is SourcePoint => source.kind === "slot")
                .map((source) => [source.id, source])
        ).values()
    ).sort((left, right) => left.y - right.y);

    return {
        slots,
        visibleSlotSources,
        visibleMatches,
    };
}

function buildDoubleRenderModel(participants: DrawRegistration[]): DoubleRenderModel | null {
    const templateSize = chooseTemplateSize(participants.length);

    if (!templateSize) {
        return null;
    }

    const template = cloneDoubleTemplate(DOUBLE_TEMPLATES[templateSize]);
    const initialWinners = buildWinnerRenderModel(participants, template);
    const { winners, losers } = applyDynamicNumberingAndFeeds(template, initialWinners, participants);
    template.viewBoxHeight = computeVisibleViewBoxHeight(template, winners, losers);

    return {
        template,
        winners,
        losers,
    };
}

function escapeHtml(value: string) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function buildMatchMarkup(match: RenderedMatch) {
    const nextLine = match.nextX
        ? `<line x1="${match.joinX}" y1="${match.centerY}" x2="${match.nextX}" y2="${match.centerY}" stroke="currentColor" stroke-width="2" />`
        : "";
    const numberPosition = getMatchNumberPosition(match);
    const topLabelPosition = match.top.label ? getTopFeedLabelPosition(match.top) : null;
    const bottomLabelPosition = match.bottom.label ? getBottomFeedLabelPosition(match.bottom) : null;
    const loserDestinationPosition = match.loserDestination ? getLoserDestinationPosition(match) : null;
    const numberMarkup =
        match.matchNumber != null
            ? `<text x="${numberPosition.x}" y="${numberPosition.y}" fill="currentColor" font-size="${PRINT_FONT_SIZES.matchNumber}" font-weight="700" text-anchor="middle">${match.matchNumber}</text>`
            : "";
    const topLabel = match.top.label
        ? `<text x="${topLabelPosition!.x}" y="${topLabelPosition!.y}" fill="currentColor" font-size="${PRINT_FONT_SIZES.feedLabel}" font-weight="600" font-style="italic">${escapeHtml(match.top.label)}</text>`
        : "";
    const bottomLabel = match.bottom.label
        ? `<text x="${bottomLabelPosition!.x}" y="${bottomLabelPosition!.y}" fill="currentColor" font-size="${PRINT_FONT_SIZES.feedLabel}" font-weight="600" font-style="italic">${escapeHtml(match.bottom.label)}</text>`
        : "";
    const loserDestination = match.loserDestination
        ? `<text x="${loserDestinationPosition!.x}" y="${loserDestinationPosition!.y}" fill="currentColor" font-size="${PRINT_FONT_SIZES.feedLabel}" font-style="italic">${escapeHtml(match.loserDestination)}</text>`
        : "";
    const matchLabel = match.matchLabel
        ? `<text x="${match.joinX - 18}" y="${match.centerY - 52}" fill="currentColor" font-size="${PRINT_FONT_SIZES.matchLabel}" font-weight="700">${escapeHtml(match.matchLabel)}</text>`
        : "";

    return `<g id="${match.id}">
            ${matchLabel}
            ${numberMarkup}
            ${topLabel}
            ${bottomLabel}
            ${loserDestination}
            <line x1="${match.top.x}" y1="${match.top.y}" x2="${match.joinX}" y2="${match.top.y}" stroke="currentColor" stroke-width="2" />
            <line x1="${match.bottom.x}" y1="${match.bottom.y}" x2="${match.joinX}" y2="${match.bottom.y}" stroke="currentColor" stroke-width="2" />
            <line x1="${match.joinX}" y1="${match.top.y}" x2="${match.joinX}" y2="${match.bottom.y}" stroke="currentColor" stroke-width="2" />
            ${nextLine}
        </g>`;
}

function buildPrintSvgMarkup(renderModel: DoubleRenderModel) {
    const printFrameWidth = renderModel.template.printFrameWidth;
    const printFrameHeight = renderModel.template.printFrameHeight;
    const mainBracketTransform =
        renderModel.template.size === 16
            ? 'translate(0 -32) scale(1.08 1.015)'
            : undefined;
    const secondPlaceTransform = renderModel.template.size === 8 ? 'translate(-72 0)' : undefined;
    const sectionLabels = SHOW_BRACKET_SECTION_LABELS
        ? renderModel.template.sectionLabels
                .map((label) => {
                    return `<text x="${label.x}" y="${label.y}" fill="currentColor" font-size="${PRINT_FONT_SIZES.sectionLabel}" font-weight="700">${escapeHtml(label.text)}</text>`;
                })
                .join("")
        : "";
    const winnerRoundLabels = SHOW_BRACKET_ROUND_LABELS
        ? renderModel.template.winnersRoundLabels
                .map((label) => {
                    return `<text x="${label.x}" y="${label.y}" fill="currentColor" font-size="${PRINT_FONT_SIZES.roundLabel}" font-weight="600">${escapeHtml(label.text)}</text>`;
                })
                .join("")
        : "";
    const loserRoundLabels = SHOW_BRACKET_ROUND_LABELS
        ? renderModel.template.losersRoundLabels
                .map((label) => {
                    return `<text x="${label.x}" y="${label.y}" fill="currentColor" font-size="${PRINT_FONT_SIZES.roundLabel}" font-weight="600">${escapeHtml(label.text)}</text>`;
                })
                .join("")
        : "";
    const winnerMatches = renderModel.winners.visibleMatches.map((match) => buildMatchMarkup(match)).join("");
    const loserMatches = renderModel.losers.visibleMatches.map((match) => buildMatchMarkup(match)).join("");
    const secondPlaceMatch = buildMatchMarkup(renderModel.template.secondPlaceMatch);
    const slotLookup = new Map(renderModel.winners.slots.map((slot) => [slot.id, slot]));
    const winnerLabels = renderModel.winners.visibleSlotSources
        .map((source) => {
            const slot = slotLookup.get(source.id);

            if (!slot?.competitor) {
                return "";
            }

            return `<text x="${source.x + 12}" y="${source.y - SLOT_LABEL_OFFSET_Y}" fill="currentColor" font-size="${PRINT_FONT_SIZES.slotLabel}">
                <tspan font-weight="700">${slot.seed}</tspan>
                <tspan dx="12">${escapeHtml(slot.label)}</tspan>
            </text>`;
        })
        .join("");

    return `<svg viewBox="0 0 ${printFrameWidth} ${printFrameHeight}" class="division-draw-svg" preserveAspectRatio="xMinYMin meet" role="img" aria-label="Double elimination tournament bracket">
        <g id="main-bracket"${mainBracketTransform ? ` transform="${mainBracketTransform}"` : ""}>
            <g id="section-labels">${sectionLabels}</g>
            <g id="winners-round-labels">${winnerRoundLabels}</g>
            <g id="losers-round-labels">${loserRoundLabels}</g>
            <g id="winner-matches">${winnerMatches}</g>
            <g id="loser-matches">${loserMatches}</g>
            <g id="champion-line">
                <text x="${renderModel.template.championLine.labelX}" y="${renderModel.template.championLine.labelY}" fill="currentColor" font-size="${PRINT_FONT_SIZES.championLabel}" font-weight="700">${escapeHtml(renderModel.template.championLine.label)}</text>
                <line x1="${renderModel.template.championLine.startX}" y1="${renderModel.template.championLine.y}" x2="${renderModel.template.championLine.endX}" y2="${renderModel.template.championLine.y}" stroke="currentColor" stroke-width="2" />
            </g>
            <g id="winner-slot-labels">${winnerLabels}</g>
        </g>
        <g id="second-place"${secondPlaceTransform ? ` transform="${secondPlaceTransform}"` : ""}>
            <g id="second-place-label"><text x="${renderModel.template.secondPlaceLabel.x}" y="${renderModel.template.secondPlaceLabel.y}" fill="currentColor" font-size="${PRINT_FONT_SIZES.secondPlaceLabel}" font-weight="700">${escapeHtml(renderModel.template.secondPlaceLabel.text)}</text></g>
            <g id="second-place-match">${secondPlaceMatch}</g>
        </g>
    </svg>`;
}

function buildPrintDocumentMarkup(
    renderModel: DoubleRenderModel,
    title: string,
    eventName: string,
    competitorCount: number
) {
    const svgMarkup = buildPrintSvgMarkup(renderModel);
    const metaTitle = buildDrawMetaTitle(title, eventName);

    return `
        <!doctype html>
        <html>
            <head>
                <meta charset="utf-8" />
                <title>Double Elimination Draw Sheet</title>
                <style>
                    @page {
                        size: letter landscape;
                        margin: 0.1in;
                    }

                    html,
                    body {
                        margin: 0;
                        padding: 0;
                        width: 100%;
                        min-height: 100%;
                        background: #e5e7eb;
                        color: #111827;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }

                    body {
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
                            "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
                        padding: 24px;
                        box-sizing: border-box;
                    }

                    .print-preview-toolbar {
                        position: fixed;
                        top: 16px;
                        right: 16px;
                        display: flex;
                        gap: 12px;
                        z-index: 10;
                    }

                    .print-preview-toolbar button {
                        border: 1px solid #111827;
                        background: white;
                        color: #111827;
                        padding: 10px 14px;
                        font-size: 14px;
                        line-height: 1;
                        border-radius: 6px;
                        cursor: pointer;
                    }

                    .division-draw-print-root {
                        width: min(${PRINT_FRAME_WIDTH_IN}in, calc(100vw - 32px));
                        height: min(${PRINT_FRAME_HEIGHT_IN}in, calc(100vh - 32px));
                        margin: 0 auto;
                        background: white;
                        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
                        box-sizing: border-box;
                        display: grid;
                        grid-template-rows: auto 1fr;
                        gap: 0.02in;
                        padding: 0.04in 0.03in 0.02in;
                        overflow: hidden;
                    }

                    .division-draw-meta {
                        display: flex;
                        align-items: flex-start;
                        justify-content: space-between;
                        gap: 0.18in;
                        padding: 0 0 0.01in;
                        margin: 0;
                    }

                    .division-draw-meta h3 {
                        margin: 0;
                        font-size: 16px;
                        line-height: 1.1;
                        font-weight: 600;
                    }

                    .division-draw-meta p,
                    .division-draw-meta div {
                        margin: 0;
                        font-size: 10px;
                        line-height: 1.1;
                    }

                    .division-draw-frame {
                        width: 100%;
                        height: 100%;
                        min-height: 0;
                        overflow: hidden;
                        display: flex;
                        align-items: flex-start;
                        justify-content: flex-start;
                    }

                    .division-draw-svg {
                        width: 100%;
                        height: 100%;
                        display: block;
                        color: black;
                    }

                    svg text {
                        fill: currentColor;
                    }

                    @media print {
                        html,
                        body {
                            background: white;
                            width: auto;
                            height: auto;
                            min-height: 0;
                            overflow: visible;
                            padding: 0;
                            display: block;
                        }

                        .print-preview-toolbar {
                            display: none !important;
                        }

                        .division-draw-print-root {
                            width: ${PRINT_FRAME_WIDTH_IN}in;
                            height: ${PRINT_FRAME_HEIGHT_IN}in;
                            margin: 0;
                            box-shadow: none;
                            page-break-inside: avoid;
                            break-inside: avoid-page;
                            page-break-after: avoid;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="print-preview-toolbar">
                    <button type="button" onclick="window.print()">Print / Save PDF</button>
                </div>
                <div class="division-draw-print-root">
                    <div class="division-draw-meta">
                        <div>
                            <h3>${escapeHtml(metaTitle)}</h3>
                        </div>
                        <div style="text-align:right;">
                            <div>${competitorCount} competitors</div>
                            <div>Double Elimination</div>
                        </div>
                    </div>
                    <div class="division-draw-frame">${svgMarkup}</div>
                </div>
            </body>
        </html>
    `;
}

export function DivisionDrawDouble() {
    const registrations = useAtomValue(selectedRegistrationsAtom) ?? [];
    const renderModel = useMemo(() => buildDoubleRenderModel(registrations), [registrations]);
    const titleRegistration = registrations[0];
    const divisionTitle = Array.from(new Set(registrations.map((r) => r.divisionName))).join(" / ");//titleRegistration?.divisionName || "Division";
    const eventTitle = Array.from(new Set(registrations.map((r) => r.eventDisplayName || r.eventName))).sort().join(" / ");//titleRegistration?.eventDisplayName || titleRegistration?.eventName || "";
    const drawMetaTitle = buildDrawMetaTitle(divisionTitle, eventTitle);

    function handlePrint() {
        if (!renderModel) {
            return;
        }

        const printMarkup = buildPrintDocumentMarkup(
            renderModel,
            divisionTitle,
            eventTitle,
            registrations.length
        );
        const printBlob = new Blob([printMarkup], { type: "text/html" });
        const printUrl = URL.createObjectURL(printBlob);
        const printWindow = window.open(printUrl, "_blank");

        if (!printWindow) {
            URL.revokeObjectURL(printUrl);
        }
    }

    function renderMatch(match: RenderedMatch) {
        return (
            <g key={match.id} id={match.id}>
                {match.matchLabel && (
                    <text
                        x={match.joinX - 18}
                        y={match.centerY - 52}
                        fill="currentColor"
                        fontSize={LIVE_FONT_SIZES.matchLabel}
                        fontWeight="700"
                        className="text-gray-100 print:text-black"
                    >
                        {match.matchLabel}
                    </text>
                )}

                {match.matchNumber != null && (
                    (() => {
                        const numberPosition = getMatchNumberPosition(match);

                        return (
                    <text
                        x={numberPosition.x}
                        y={numberPosition.y}
                        fill="currentColor"
                        fontSize={LIVE_FONT_SIZES.matchNumber}
                        fontWeight="700"
                        textAnchor="middle"
                        className="text-gray-400 print:text-gray-700"
                    >
                        {match.matchNumber}
                    </text>
                        );
                    })()
                )}

                {match.top.label && (
                    (() => {
                        const labelPosition = getTopFeedLabelPosition(match.top);

                        return (
                    <text
                        x={labelPosition.x}
                        y={labelPosition.y}
                        fill="currentColor"
                        fontSize={LIVE_FONT_SIZES.feedLabel}
                        fontWeight="600"
                        fontStyle="italic"
                        className="text-gray-300 print:text-gray-600"
                    >
                        {match.top.label}
                    </text>
                        );
                    })()
                )}

                {match.bottom.label && (
                    (() => {
                        const labelPosition = getBottomFeedLabelPosition(match.bottom);

                        return (
                    <text
                        x={labelPosition.x}
                        y={labelPosition.y}
                        fill="currentColor"
                        fontSize={LIVE_FONT_SIZES.feedLabel}
                        fontWeight="600"
                        fontStyle="italic"
                        className="text-gray-300 print:text-gray-600"
                    >
                        {match.bottom.label}
                    </text>
                        );
                    })()
                )}

                {match.loserDestination && (
                    (() => {
                        const labelPosition = getLoserDestinationPosition(match);

                        return (
                    <text
                        x={labelPosition.x}
                        y={labelPosition.y}
                        fill="currentColor"
                        fontSize={LIVE_FONT_SIZES.feedLabel}
                        fontStyle="italic"
                        className="text-gray-300 print:text-gray-600"
                    >
                        {match.loserDestination}
                    </text>
                        );
                    })()
                )}

                <line x1={match.top.x} y1={match.top.y} x2={match.joinX} y2={match.top.y} stroke="currentColor" strokeWidth="2" />
                <line x1={match.bottom.x} y1={match.bottom.y} x2={match.joinX} y2={match.bottom.y} stroke="currentColor" strokeWidth="2" />
                <line x1={match.joinX} y1={match.top.y} x2={match.joinX} y2={match.bottom.y} stroke="currentColor" strokeWidth="2" />
                {match.nextX && (
                    <line x1={match.joinX} y1={match.centerY} x2={match.nextX} y2={match.centerY} stroke="currentColor" strokeWidth="2" />
                )}
            </g>
        );
    }

    function renderWinnerSlot(source: SourcePoint) {
        const slot = renderModel?.winners.slots.find((candidate) => candidate.id === source.id);

        if (!slot?.competitor) {
            return null;
        }

        return (
            <g key={slot.id} id={slot.id}>
                <text
                    x={source.x + 12}
                    y={source.y - SLOT_LABEL_OFFSET_Y}
                    fill="currentColor"
                    fontSize={LIVE_FONT_SIZES.slotLabel}
                    className="text-white print:text-black"
                >
                    <tspan fontWeight="700">{slot.seed}</tspan>
                    <tspan dx="12">{slot.label}</tspan>
                </text>
            </g>
        );
    }

    return (
        <div className="division-draw-page min-h-screen bg-gray-900 p-4 text-white print:min-h-0 print:bg-white print:p-0 print:text-black">
            <div className="division-draw-screen-header mb-4 flex items-start justify-between gap-4 print:hidden">
                <div>
                    <h2 className="text-2xl font-semibold">Double Elimination Draw Sheet</h2>
                    <p className="mt-1 text-sm text-gray-300 print:text-gray-600">
                        Template-driven printable double-elimination bracket.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handlePrint}
                    disabled={!renderModel}
                    className="rounded border border-gray-500 px-4 py-2 text-sm font-medium text-white transition hover:border-gray-300 hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 print:hidden"
                >
                    Print
                </button>
            </div>

            {registrations.length === 0 ? (
                <p>No registrations selected.</p>
            ) : !renderModel ? (
                <section className="division-draw-sheet rounded-lg border border-gray-700 bg-gray-800 p-4 print:border-0 print:bg-white print:p-0">
                    <div className="rounded border border-gray-600 p-6 text-sm print:border-gray-400">
                        Double-elimination templates currently support up to 16 competitors.
                    </div>
                </section>
            ) : registrations.length < 2 ? (
                <section className="division-draw-sheet rounded-lg border border-gray-700 bg-gray-800 p-4 print:border-0 print:bg-white print:p-0">
                    <div className="rounded border border-gray-600 p-6 text-sm print:border-gray-400">
                        At least 2 competitors are required to create a double-elimination draw.
                    </div>
                </section>
            ) : (
                <section className="division-draw-sheet rounded-lg border border-gray-700 bg-gray-800 p-4 print:border-0 print:bg-white print:p-0">
                    <div className="division-draw-meta mb-2 flex items-start justify-between gap-4 print:mb-1">
                        <div>
                            <h3 className="text-lg font-semibold">{drawMetaTitle}</h3>
                        </div>

                        <div className="text-right text-sm text-gray-300 print:text-gray-600">
                            <div>{registrations.length} competitors</div>
                            <div>Double Elimination</div>
                        </div>
                    </div>

                    <div className="division-draw-frame overflow-x-auto print:overflow-hidden">
                        <div
                            className="division-draw-svg-shell"
                            style={{
                                width: `${renderModel.template.viewBoxWidth}px`,
                                height: `${renderModel.template.viewBoxHeight}px`,
                            }}
                        >
                            <svg
                                viewBox={`0 0 ${renderModel.template.viewBoxWidth} ${renderModel.template.viewBoxHeight}`}
                                className="division-draw-svg block overflow-visible text-white print:text-black"
                                preserveAspectRatio="xMinYMin meet"
                                role="img"
                                aria-label="Double elimination tournament bracket"
                            >
                                {SHOW_BRACKET_SECTION_LABELS && (
                                    <g id="section-labels">
                                        {renderModel.template.sectionLabels.map((label) => (
                                            <text
                                                key={label.id}
                                                x={label.x}
                                                y={label.y}
                                                fill="currentColor"
                                                fontSize={LIVE_FONT_SIZES.sectionLabel}
                                                fontWeight="700"
                                                className="text-gray-100 print:text-black"
                                            >
                                                {label.text}
                                            </text>
                                        ))}
                                    </g>
                                )}

                                {SHOW_BRACKET_ROUND_LABELS && (
                                    <g id="winner-round-labels">
                                        {renderModel.template.winnersRoundLabels.map((label) => (
                                            <text
                                                key={label.id}
                                                x={label.x}
                                                y={label.y}
                                                fill="currentColor"
                                                fontSize={LIVE_FONT_SIZES.roundLabel}
                                                fontWeight="600"
                                                className="text-gray-300 print:text-gray-600"
                                            >
                                                {label.text}
                                            </text>
                                        ))}
                                    </g>
                                )}

                                {SHOW_BRACKET_ROUND_LABELS && (
                                    <g id="loser-round-labels">
                                        {renderModel.template.losersRoundLabels.map((label) => (
                                            <text
                                                key={label.id}
                                                x={label.x}
                                                y={label.y}
                                                fill="currentColor"
                                                fontSize={LIVE_FONT_SIZES.roundLabel}
                                                fontWeight="600"
                                                className="text-gray-300 print:text-gray-600"
                                            >
                                                {label.text}
                                            </text>
                                        ))}
                                    </g>
                                )}

                                <g id="winner-matches">
                                    {renderModel.winners.visibleMatches.map((match) => renderMatch(match))}
                                </g>

                                <g id="loser-matches">
                                    {renderModel.losers.visibleMatches.map((match) => renderMatch(match))}
                                </g>

                                <g id="champion-line">
                                    <text
                                        x={renderModel.template.championLine.labelX}
                                        y={renderModel.template.championLine.labelY}
                                        fill="currentColor"
                                        fontSize={LIVE_FONT_SIZES.championLabel}
                                        fontWeight="700"
                                        className="text-gray-100 print:text-black"
                                    >
                                        {renderModel.template.championLine.label}
                                    </text>

                                    <line
                                        x1={renderModel.template.championLine.startX}
                                        y1={renderModel.template.championLine.y}
                                        x2={renderModel.template.championLine.endX}
                                        y2={renderModel.template.championLine.y}
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    />
                                </g>

                                <g id="second-place-label">
                                    <text
                                        x={renderModel.template.secondPlaceLabel.x}
                                        y={renderModel.template.secondPlaceLabel.y}
                                        fill="currentColor"
                                        fontSize={LIVE_FONT_SIZES.secondPlaceLabel}
                                        fontWeight="700"
                                        className="text-gray-100 print:text-black"
                                    >
                                        {renderModel.template.secondPlaceLabel.text}
                                    </text>
                                </g>

                                <g id="second-place-match">{renderMatch(renderModel.template.secondPlaceMatch)}</g>

                                <g id="winner-slot-labels">
                                    {renderModel.winners.visibleSlotSources.map((source) => renderWinnerSlot(source))}
                                </g>
                            </svg>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}