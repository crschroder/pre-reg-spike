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
    winners: {
        slotStartX: number;
        topPadding: number;
        leafSpacing: number;
        firstJoinX: number;
        roundSpacing: number;
        roundLabelY: number;
    };
    losers: {
        slotStartX: number;
        topPadding: number;
        regionHeight: number;
        firstJoinX: number;
        roundSpacing: number;
        roundLabelY: number;
        feederOffset: number;
    };
    grandFinal: {
        joinX: number;
        winnerX: number;
    };
};

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
};

const SLOT_LABEL_FONT_SIZE = 16;
const SLOT_LABEL_OFFSET_Y = 6;

const DOUBLE_TEMPLATE_CONFIGS: Record<TemplateSize, DoubleTemplateConfig> = {
    4: {
        size: 4,
        viewBoxWidth: 1120,
        viewBoxHeight: 860,
        winners: {
            slotStartX: 24,
            topPadding: 110,
            leafSpacing: 150,
            firstJoinX: 250,
            roundSpacing: 170,
            roundLabelY: 42,
        },
        losers: {
            slotStartX: 120,
            topPadding: 520,
            regionHeight: 140,
            firstJoinX: 305,
            roundSpacing: 150,
            roundLabelY: 452,
            feederOffset: 72,
        },
        grandFinal: {
            joinX: 965,
            winnerX: 1075,
        },
    },
    8: {
        size: 8,
        viewBoxWidth: 1400,
        viewBoxHeight: 980,
        winners: {
            slotStartX: 24,
            topPadding: 92,
            leafSpacing: 82,
            firstJoinX: 260,
            roundSpacing: 150,
            roundLabelY: 38,
        },
        losers: {
            slotStartX: 110,
            topPadding: 610,
            regionHeight: 230,
            firstJoinX: 285,
            roundSpacing: 140,
            roundLabelY: 540,
            feederOffset: 72,
        },
        grandFinal: {
            joinX: 1225,
            winnerX: 1360,
        },
    },
    16: {
        size: 16,
        viewBoxWidth: 1680,
        viewBoxHeight: 1220,
        winners: {
            slotStartX: 24,
            topPadding: 88,
            leafSpacing: 52,
            firstJoinX: 230,
            roundSpacing: 130,
            roundLabelY: 34,
        },
        losers: {
            slotStartX: 96,
            topPadding: 760,
            regionHeight: 330,
            firstJoinX: 250,
            roundSpacing: 125,
            roundLabelY: 690,
            feederOffset: 68,
        },
        grandFinal: {
            joinX: 1485,
            winnerX: 1640,
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
    const winnerBottomY =
        config.winners.topPadding + (config.size - 1) * config.winners.leafSpacing;
    const losersTopPadding = Math.max(config.losers.topPadding, winnerBottomY + 120);
    const losersRoundLabelY = losersTopPadding - 70;
    const viewBoxHeight = Math.max(
        config.viewBoxHeight,
        losersTopPadding + config.losers.regionHeight + 120,
    );
    const winnerJoinXs = Array.from({ length: totalWinnerRounds }, (_, index) => {
        return config.winners.firstJoinX + index * config.winners.roundSpacing;
    });
    const winnerSlots = seedOrder.map((seed, index) => {
        return {
            id: `winner-slot-${seed}`,
            seed,
            x: config.winners.slotStartX,
            y: config.winners.topPadding + index * config.winners.leafSpacing,
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
    const losersMatchesByRound: RenderedMatch[][] = [];
    const losersRoundLabels = losersRoundCounts.map((_, index) => {
        return {
            id: `loser-round-${index + 1}`,
            text: `L${index + 1}`,
            x: index === 0 ? config.losers.slotStartX : config.losers.firstJoinX + (index - 1) * config.losers.roundSpacing + 12,
            y: losersRoundLabelY,
        } satisfies TextLabel;
    });

    for (let roundIndex = 0; roundIndex < losersRoundCounts.length; roundIndex += 1) {
        const matchCount = losersRoundCounts[roundIndex];
        const joinX = config.losers.firstJoinX + roundIndex * config.losers.roundSpacing;
        const interval = config.losers.regionHeight / matchCount;
        const entryGap = Math.max(16, Math.min(34, interval / 4));
        const roundMatches: RenderedMatch[] = [];

        for (let matchIndex = 0; matchIndex < matchCount; matchIndex += 1) {
            const centerY = losersTopPadding + interval * (matchIndex + 0.5);
            const matchId = `loser-r${roundIndex + 1}m${matchIndex + 1}`;
            let top: SourcePoint;
            let bottom: SourcePoint;

            if (roundIndex === 0) {
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

                    top = {
                        kind: "match",
                        id: previousMatch.id,
                        x: previousMatch.joinX,
                        y: previousMatch.centerY,
                    };
                    bottom = {
                        kind: "feeder",
                        id: `${matchId}-bottom-feeder`,
                        x: joinX - config.losers.feederOffset,
                        y: centerY + entryGap,
                    };
                } else {
                    const previousTop = previousRound[matchIndex * 2];
                    const previousBottom = previousRound[matchIndex * 2 + 1];

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

            roundMatches.push({
                id: matchId,
                joinX,
                centerY,
                top,
                bottom,
            });
        }

        losersMatchesByRound.push(roundMatches);
    }

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
    const secondPlaceCenterY = (winnerFinal.centerY + losersFinal.centerY) / 2 + 20;
    const secondPlaceEntryGap = 34;
    const secondPlaceMatch = {
        id: "second-place-match",
        joinX: config.grandFinal.joinX,
        centerY: secondPlaceCenterY,
        top: {
            kind: "feeder",
            id: "second-place-top-feeder",
            x: config.grandFinal.joinX - 120,
            y: secondPlaceCenterY - secondPlaceEntryGap,
            label: "",
        },
        bottom: {
            kind: "feeder",
            id: "second-place-bottom-feeder",
            x: config.grandFinal.joinX - 120,
            y: secondPlaceCenterY + secondPlaceEntryGap,
            label: "",
        },
        nextX: config.grandFinal.winnerX,
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
            targetMatch.bottom.label = `Loser of ${match.matchNumber}`;
        });
    }

    winnerFinal.loserDestination = `Loser to ${secondPlaceMatchNumber}`;
    secondPlaceMatch.top.label = `Winner of ${losersFinal.matchNumber}`;
    secondPlaceMatch.bottom.label = `Loser of ${winnerFinal.matchNumber}`;

    const championLine = {
        startX: winnerFinal.joinX,
        endX: config.grandFinal.winnerX,
        y: winnerFinal.centerY,
        labelX: config.grandFinal.joinX + 12,
        labelY: winnerFinal.centerY - 14,
        label: "1st Place",
    } satisfies ChampionLine;

    return {
        size: config.size,
        viewBoxWidth: config.viewBoxWidth,
        viewBoxHeight,
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
                y: losersRoundLabelY - 20,
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
            x: config.grandFinal.joinX - 24,
            y: secondPlaceCenterY - 82,
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

    const template = DOUBLE_TEMPLATES[templateSize];

    return {
        template,
        winners: buildWinnerRenderModel(participants, template),
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
    const numberMarkup =
        match.matchNumber != null
            ? `<text x="${match.joinX + 6}" y="${match.centerY - 10}" fill="currentColor" font-size="11" font-weight="600">${match.matchNumber}</text>`
            : "";
    const topLabel = match.top.label
        ? `<text x="${match.top.x + 4}" y="${match.top.y - 8}" fill="currentColor" font-size="11" font-style="italic">${escapeHtml(match.top.label)}</text>`
        : "";
    const bottomLabel = match.bottom.label
        ? `<text x="${match.bottom.x + 4}" y="${match.bottom.y - 8}" fill="currentColor" font-size="11" font-style="italic">${escapeHtml(match.bottom.label)}</text>`
        : "";
    const loserDestination = match.loserDestination
        ? `<text x="${match.joinX + 8}" y="${match.centerY + 18}" fill="currentColor" font-size="11" font-style="italic">${escapeHtml(match.loserDestination)}</text>`
        : "";
    const matchLabel = match.matchLabel
        ? `<text x="${match.joinX - 18}" y="${match.centerY - 52}" fill="currentColor" font-size="14" font-weight="700">${escapeHtml(match.matchLabel)}</text>`
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
    const sectionLabels = renderModel.template.sectionLabels
        .map((label) => {
            return `<text x="${label.x}" y="${label.y}" fill="currentColor" font-size="16" font-weight="700">${escapeHtml(label.text)}</text>`;
        })
        .join("");
    const winnerRoundLabels = renderModel.template.winnersRoundLabels
        .map((label) => {
            return `<text x="${label.x}" y="${label.y}" fill="currentColor" font-size="13" font-weight="600">${escapeHtml(label.text)}</text>`;
        })
        .join("");
    const loserRoundLabels = renderModel.template.losersRoundLabels
        .map((label) => {
            return `<text x="${label.x}" y="${label.y}" fill="currentColor" font-size="13" font-weight="600">${escapeHtml(label.text)}</text>`;
        })
        .join("");
    const winnerMatches = renderModel.winners.visibleMatches.map((match) => buildMatchMarkup(match)).join("");
    const loserMatches = renderModel.template.losersMatches.map((match) => buildMatchMarkup(match)).join("");
    const secondPlaceMatch = buildMatchMarkup(renderModel.template.secondPlaceMatch);
    const slotLookup = new Map(renderModel.winners.slots.map((slot) => [slot.id, slot]));
    const winnerLabels = renderModel.winners.visibleSlotSources
        .map((source) => {
            const slot = slotLookup.get(source.id);

            if (!slot?.competitor) {
                return "";
            }

            return `<text x="${source.x + 12}" y="${source.y - SLOT_LABEL_OFFSET_Y}" fill="currentColor" font-size="${SLOT_LABEL_FONT_SIZE}">
                <tspan font-weight="700">${slot.seed}</tspan>
                <tspan dx="12">${escapeHtml(slot.label)}</tspan>
            </text>`;
        })
        .join("");

    return `<svg viewBox="0 0 ${renderModel.template.viewBoxWidth} ${renderModel.template.viewBoxHeight}" class="division-draw-svg" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Double elimination tournament bracket">
        <g id="section-labels">${sectionLabels}</g>
        <g id="winners-round-labels">${winnerRoundLabels}</g>
        <g id="losers-round-labels">${loserRoundLabels}</g>
        <g id="winner-matches">${winnerMatches}</g>
        <g id="loser-matches">${loserMatches}</g>
        <g id="champion-line">
            <text x="${renderModel.template.championLine.labelX}" y="${renderModel.template.championLine.labelY}" fill="currentColor" font-size="14" font-weight="700">${escapeHtml(renderModel.template.championLine.label)}</text>
            <line x1="${renderModel.template.championLine.startX}" y1="${renderModel.template.championLine.y}" x2="${renderModel.template.championLine.endX}" y2="${renderModel.template.championLine.y}" stroke="currentColor" stroke-width="2" />
        </g>
        <g id="second-place-label"><text x="${renderModel.template.secondPlaceLabel.x}" y="${renderModel.template.secondPlaceLabel.y}" fill="currentColor" font-size="15" font-weight="700">${escapeHtml(renderModel.template.secondPlaceLabel.text)}</text></g>
        <g id="second-place-match">${secondPlaceMatch}</g>
        <g id="winner-slot-labels">${winnerLabels}</g>
    </svg>`;
}

function buildPrintDocumentMarkup(
    renderModel: DoubleRenderModel,
    title: string,
    eventName: string,
    competitorCount: number
) {
    const svgMarkup = buildPrintSvgMarkup(renderModel);

    return `
        <!doctype html>
        <html>
            <head>
                <meta charset="utf-8" />
                <title>Double Elimination Draw Sheet</title>
                <style>
                    @page {
                        size: letter landscape;
                        margin: 0.2in;
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
                        width: min(10.4in, calc(100vw - 48px));
                        height: min(7.9in, calc(100vh - 48px));
                        margin: 0 auto;
                        background: white;
                        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
                        box-sizing: border-box;
                        display: grid;
                        grid-template-rows: auto 1fr;
                        gap: 0.08in;
                        padding: 0;
                        overflow: hidden;
                    }

                    .division-draw-meta {
                        display: flex;
                        align-items: flex-start;
                        justify-content: space-between;
                        gap: 0.25in;
                        padding: 0 0 0.04in;
                        margin: 0;
                    }

                    .division-draw-meta h3 {
                        margin: 0;
                        font-size: 20px;
                        line-height: 1.2;
                        font-weight: 600;
                    }

                    .division-draw-meta p,
                    .division-draw-meta div {
                        margin: 0;
                        font-size: 12px;
                        line-height: 1.35;
                    }

                    .division-draw-frame {
                        width: 100%;
                        height: 100%;
                        min-height: 0;
                        overflow: hidden;
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
                            width: 10.4in;
                            height: 7.9in;
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
                            <h3>${escapeHtml(title)}</h3>
                            <p>${escapeHtml(eventName)}</p>
                        </div>
                        <div style="text-align:right;">
                            <div>${competitorCount} competitors</div>
                            <div>${renderModel.template.size}-Competitor Template</div>
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

    function handlePrint() {
        if (!renderModel) {
            return;
        }

        const printMarkup = buildPrintDocumentMarkup(
            renderModel,
            titleRegistration?.divisionName || "Division",
            titleRegistration?.eventDisplayName || titleRegistration?.eventName || "",
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
                        fontSize="14"
                        fontWeight="700"
                        className="text-gray-100 print:text-black"
                    >
                        {match.matchLabel}
                    </text>
                )}

                {match.matchNumber != null && (
                    <text
                        x={match.joinX + 6}
                        y={match.centerY - 10}
                        fill="currentColor"
                        fontSize="11"
                        fontWeight="600"
                        className="text-gray-400 print:text-gray-700"
                    >
                        {match.matchNumber}
                    </text>
                )}

                {match.top.label && (
                    <text
                        x={match.top.x + 4}
                        y={match.top.y - 8}
                        fill="currentColor"
                        fontSize="11"
                        fontStyle="italic"
                        className="text-gray-300 print:text-gray-600"
                    >
                        {match.top.label}
                    </text>
                )}

                {match.bottom.label && (
                    <text
                        x={match.bottom.x + 4}
                        y={match.bottom.y - 8}
                        fill="currentColor"
                        fontSize="11"
                        fontStyle="italic"
                        className="text-gray-300 print:text-gray-600"
                    >
                        {match.bottom.label}
                    </text>
                )}

                {match.loserDestination && (
                    <text
                        x={match.joinX + 8}
                        y={match.centerY + 18}
                        fill="currentColor"
                        fontSize="11"
                        fontStyle="italic"
                        className="text-gray-300 print:text-gray-600"
                    >
                        {match.loserDestination}
                    </text>
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
                    fontSize={SLOT_LABEL_FONT_SIZE}
                    className="text-white print:text-black"
                >
                    <tspan fontWeight="700">{slot.seed}</tspan>
                    <tspan dx="12">{slot.label}</tspan>
                </text>
            </g>
        );
    }

    return (
        <div className="division-draw-page min-h-screen bg-gray-900 p-6 text-white print:min-h-0 print:bg-white print:p-0 print:text-black">
            <div className="division-draw-screen-header mb-6 flex items-start justify-between gap-4 print:hidden">
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
                <section className="division-draw-sheet rounded-lg border border-gray-700 bg-gray-800 p-6 print:border-0 print:bg-white print:p-0">
                    <div className="rounded border border-gray-600 p-6 text-sm print:border-gray-400">
                        Double-elimination templates currently support up to 16 competitors.
                    </div>
                </section>
            ) : registrations.length < 2 ? (
                <section className="division-draw-sheet rounded-lg border border-gray-700 bg-gray-800 p-6 print:border-0 print:bg-white print:p-0">
                    <div className="rounded border border-gray-600 p-6 text-sm print:border-gray-400">
                        At least 2 competitors are required to create a double-elimination draw.
                    </div>
                </section>
            ) : (
                <section className="division-draw-sheet rounded-lg border border-gray-700 bg-gray-800 p-6 print:border-0 print:bg-white print:p-0">
                    <div className="division-draw-meta mb-3 flex items-start justify-between gap-4 print:mb-1">
                        <div>
                            <h3 className="text-xl font-semibold">{titleRegistration?.divisionName || "Division"}</h3>
                            <p className="text-sm text-gray-300 print:text-gray-600">
                                {titleRegistration?.eventDisplayName || titleRegistration?.eventName || ""}
                            </p>
                        </div>

                        <div className="text-right text-sm text-gray-300 print:text-gray-600">
                            <div>{registrations.length} competitors</div>
                            <div>{renderModel.template.size}-Competitor Template</div>
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
                                preserveAspectRatio="xMidYMid meet"
                                role="img"
                                aria-label="Double elimination tournament bracket"
                            >
                                <g id="section-labels">
                                    {renderModel.template.sectionLabels.map((label) => (
                                        <text
                                            key={label.id}
                                            x={label.x}
                                            y={label.y}
                                            fill="currentColor"
                                            fontSize="16"
                                            fontWeight="700"
                                            className="text-gray-100 print:text-black"
                                        >
                                            {label.text}
                                        </text>
                                    ))}
                                </g>

                                <g id="winner-round-labels">
                                    {renderModel.template.winnersRoundLabels.map((label) => (
                                        <text
                                            key={label.id}
                                            x={label.x}
                                            y={label.y}
                                            fill="currentColor"
                                            fontSize="13"
                                            fontWeight="600"
                                            className="text-gray-300 print:text-gray-600"
                                        >
                                            {label.text}
                                        </text>
                                    ))}
                                </g>

                                <g id="loser-round-labels">
                                    {renderModel.template.losersRoundLabels.map((label) => (
                                        <text
                                            key={label.id}
                                            x={label.x}
                                            y={label.y}
                                            fill="currentColor"
                                            fontSize="13"
                                            fontWeight="600"
                                            className="text-gray-300 print:text-gray-600"
                                        >
                                            {label.text}
                                        </text>
                                    ))}
                                </g>

                                <g id="winner-matches">
                                    {renderModel.winners.visibleMatches.map((match) => renderMatch(match))}
                                </g>

                                <g id="loser-matches">
                                    {renderModel.template.losersMatches.map((match) => renderMatch(match))}
                                </g>

                                <g id="champion-line">
                                    <text
                                        x={renderModel.template.championLine.labelX}
                                        y={renderModel.template.championLine.labelY}
                                        fill="currentColor"
                                        fontSize="14"
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
                                        fontSize="15"
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