import { useMemo } from "react";
import { useAtomValue } from "jotai";
import { selectedRegistrationsAtom, type DrawRegistration } from "@/store/selectedRegistrations";

type RegistrationRow = DrawRegistration;

type TemplateSize = 4 | 8 | 16 | 32;

type TemplateSlot = {
  id: string;
  seed: number;
  lineStartX: number;
  lineY: number;
  textX: number;
  textY: number;
};

type TemplateMatch = {
  id: string;
  round: number;
  topSourceId: string;
  bottomSourceId: string;
  joinX: number;
  centerY: number;
  nextX?: number;
};

type TemplateRoundLabel = {
  id: string;
  text: string;
  x: number;
  y: number;
};

type TemplateThirdPlaceBracket = {
  labelX: number;
  labelY: number;
  lineStartX: number;
  joinX: number;
  winnerX: number;
  topY: number;
  bottomY: number;
};

type TemplatePlacementLine = {
  id: string;
  label: string;
  labelX: number;
  lineStartX: number;
  lineEndX: number;
  y: number;
};

type BracketTemplate = {
  size: TemplateSize;
  viewBoxWidth: number;
  viewBoxHeight: number;
  rounds: number[];
  rootMatchId: string | null;
  roundLabels: TemplateRoundLabel[];
  slots: TemplateSlot[];
  matches: TemplateMatch[];
  thirdPlaceBracket: TemplateThirdPlaceBracket;
  placementLines: TemplatePlacementLine[];
};

type TemplateConfig = {
  size: TemplateSize;
  slotStartX: number;
  roundLabelY: number;
  topPadding: number;
  leafSpacing: number;
  firstJoinX: number;
  roundSpacing: number;
  finalLineLength: number;
  viewBoxWidth: number;
  viewBoxHeight: number;
  sidePanelWidth: number;
  rightColumnInset: number;
  thirdPlaceTopY: number;
  thirdPlaceBottomY: number;
  placementStartY: number;
  placementSpacing: number;
};

type PopulatedSlot = TemplateSlot & {
  competitor: RegistrationRow | null;
  label: string;
};

type ResolvedSource = {
  kind: "slot" | "match";
  id: string;
  x: number;
  y: number;
};

type RenderedMatch = {
  id: string;
  round: number;
  joinX: number;
  centerY: number;
  nextX?: number;
  top: ResolvedSource;
  bottom: ResolvedSource;
};

type TemplateRenderModel = {
  template: BracketTemplate;
  slots: PopulatedSlot[];
  visibleSlotSources: ResolvedSource[];
  visibleMatches: RenderedMatch[];
};

const SLOT_LABEL_FONT_SIZE = 16;
const SLOT_LABEL_OFFSET_Y = 6;
const PLACEMENT_LABELS = ["1st", "2nd", "3rd", "4th"] as const;
const THIRD_PLACE_OUTER_LINE_EXTENSION = 72;

const TEMPLATE_CONFIGS: Record<TemplateSize, TemplateConfig> = {
  4: {
    size: 4,
    slotStartX: 24,
    roundLabelY: 16,
    topPadding: 96,
    leafSpacing: 160,
    firstJoinX: 275,
    roundSpacing: 340,
    finalLineLength: 240,
    viewBoxWidth: 880,
    viewBoxHeight: 670,
    sidePanelWidth: 230,
    rightColumnInset: 32,
    thirdPlaceTopY: 104,
    thirdPlaceBottomY: 152,
    placementStartY: 524,
    placementSpacing: 38,
  },
  8: {
    size: 8,
    slotStartX: 24,
    roundLabelY: 16,
    topPadding: 84,
    leafSpacing: 90,
    firstJoinX: 280,
    roundSpacing: 320,
    finalLineLength: 220,
    viewBoxWidth: 1120,
    viewBoxHeight: 760,
    sidePanelWidth: 240,
    rightColumnInset: 34,
    thirdPlaceTopY: 98,
    thirdPlaceBottomY: 150,
    placementStartY: 628,
    placementSpacing: 36,
  },
  16: {
    size: 16,
    slotStartX: 24,
    roundLabelY: 16,
    topPadding: 62,
    leafSpacing: 60,
    firstJoinX: 240,
    roundSpacing: 255,
    finalLineLength: 180,
    viewBoxWidth: 1180,
    viewBoxHeight: 980,
    sidePanelWidth: 250,
    rightColumnInset: 34,
    thirdPlaceTopY: 92,
    thirdPlaceBottomY: 146,
    placementStartY: 804,
    placementSpacing: 40,
  },
  32: {
    size: 32,
    slotStartX: 24,
    roundLabelY: 16,
    topPadding: 46,
    leafSpacing: 33,
    firstJoinX: 232,
    roundSpacing: 235,
    finalLineLength: 165,
    viewBoxWidth: 1320,
    viewBoxHeight: 1080,
    sidePanelWidth: 270,
    rightColumnInset: 34,
    thirdPlaceTopY: 88,
    thirdPlaceBottomY: 144,
    placementStartY: 900,
    placementSpacing: 40,
  },
};

function chooseTemplateSize(count: number): TemplateSize {
  if (count <= 4) {
    return 4;
  }

  if (count <= 8) {
    return 8;
  }

  if (count <= 16) {
    return 16;
  }

  return 32;
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

function createTemplate(config: TemplateConfig): BracketTemplate {
  const totalRounds = Math.log2(config.size);
  const seedOrder = buildSeedOrder(config.size);
  const joinXs = Array.from({ length: totalRounds }, (_, index) => {
    return config.firstJoinX + index * config.roundSpacing;
  });
  const slots = seedOrder.map((seed, index) => {
    const lineY = config.topPadding + index * config.leafSpacing;

    return {
      id: `slot-${seed}`,
      seed,
      lineStartX: config.slotStartX,
      lineY,
      textX: config.slotStartX + 12,
      textY: lineY - 12,
    } satisfies TemplateSlot;
  });
  const matchCounts: Record<number, number> = {};
  const matches: TemplateMatch[] = [];

  function build(rangeStart: number, size: number, round: number): { sourceId: string; y: number } {
    if (size === 1) {
      const slot = slots[rangeStart];

      return {
        sourceId: slot.id,
        y: slot.lineY,
      };
    }

    const halfSize = size / 2;
    const top = build(rangeStart, halfSize, round - 1);
    const bottom = build(rangeStart + halfSize, halfSize, round - 1);
    const matchNumber = (matchCounts[round] ?? 0) + 1;
    const matchId = `r${round}m${matchNumber}`;
    const centerY = (top.y + bottom.y) / 2;

    matchCounts[round] = matchNumber;
    matches.push({
      id: matchId,
      round,
      topSourceId: top.sourceId,
      bottomSourceId: bottom.sourceId,
      joinX: joinXs[round - 1],
      centerY,
      nextX: round === totalRounds ? joinXs[round - 1] + config.finalLineLength : undefined,
    });

    return {
      sourceId: matchId,
      y: centerY,
    };
  }

  const root = build(0, config.size, totalRounds);
  const rightPanelStartX = config.viewBoxWidth - config.sidePanelWidth;
  const thirdPlaceLineStartX = rightPanelStartX - THIRD_PLACE_OUTER_LINE_EXTENSION;
  const thirdPlaceWinnerX = config.viewBoxWidth - config.rightColumnInset;
  const thirdPlaceJoinX = Math.min(rightPanelStartX + 52, thirdPlaceWinnerX - 52);
  const thirdPlaceBracket = {
    labelX: rightPanelStartX,
    labelY: config.thirdPlaceTopY - 18,
    lineStartX: thirdPlaceLineStartX,
    joinX: thirdPlaceJoinX,
    winnerX: thirdPlaceWinnerX,
    topY: config.thirdPlaceTopY,
    bottomY: config.thirdPlaceBottomY,
  } satisfies TemplateThirdPlaceBracket;
  const placementLines = PLACEMENT_LABELS.map((label, index) => {
    return {
      id: `placement-${label.toLowerCase()}`,
      label,
      labelX: rightPanelStartX,
      lineStartX: rightPanelStartX + 42,
      lineEndX: thirdPlaceWinnerX,
      y: config.placementStartY + index * config.placementSpacing,
    } satisfies TemplatePlacementLine;
  });
  const roundLabels = Array.from({ length: totalRounds }, (_, index) => {
    return {
      id: `round-${index + 1}`,
      text: getRoundLabel(index, totalRounds),
      x: index === 0 ? config.slotStartX : joinXs[index - 1] + 12,
      y: config.roundLabelY,
    } satisfies TemplateRoundLabel;
  });

  return {
    size: config.size,
    viewBoxWidth: config.viewBoxWidth,
    viewBoxHeight: config.viewBoxHeight,
    rounds: Array.from({ length: totalRounds }, (_, index) => index + 1),
    rootMatchId: root.sourceId,
    roundLabels,
    slots,
    matches,
    thirdPlaceBracket,
    placementLines,
  };
}

const BRACKET_TEMPLATES: Record<TemplateSize, BracketTemplate> = {
  4: createTemplate(TEMPLATE_CONFIGS[4]),
  8: createTemplate(TEMPLATE_CONFIGS[8]),
  16: createTemplate(TEMPLATE_CONFIGS[16]),
  32: createTemplate(TEMPLATE_CONFIGS[32]),
};

function buildTemplateRenderModel(participants: RegistrationRow[]): TemplateRenderModel {
  const template = BRACKET_TEMPLATES[chooseTemplateSize(participants.length)];
  const slots = template.slots.map((slot) => {
    const competitor = participants[slot.seed - 1] ?? null;

    return {
      ...slot,
      competitor,
      label: competitor ? getParticipantLabel(competitor) : "",
    } satisfies PopulatedSlot;
  });
  const slotsById = new Map(slots.map((slot) => [slot.id, slot]));
  const matchesById = new Map(template.matches.map((match) => [match.id, match]));
  const visibleMatches: RenderedMatch[] = [];
  const resolvedSources = new Map<string, ResolvedSource | null>();

  function resolveSource(sourceId: string): ResolvedSource | null {
    if (resolvedSources.has(sourceId)) {
      return resolvedSources.get(sourceId) ?? null;
    }

    const slot = slotsById.get(sourceId);

    if (slot) {
      const resolved = slot.competitor
        ? {
            kind: "slot" as const,
            id: slot.id,
            x: slot.lineStartX,
            y: slot.lineY,
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
      round: match.round,
      joinX: match.joinX,
      centerY: match.centerY,
      nextX: match.nextX,
      top,
      bottom,
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

  if (template.rootMatchId) {
    resolveSource(template.rootMatchId);
  }

  visibleMatches.sort((left, right) => {
    if (left.round !== right.round) {
      return left.round - right.round;
    }

    return left.centerY - right.centerY;
  });

  const visibleSlotSources = Array.from(
    new Map(
      visibleMatches
        .flatMap((match) => [match.top, match.bottom])
        .filter((source): source is ResolvedSource => source.kind === "slot")
        .map((source) => [source.id, source])
    ).values()
  ).sort((left, right) => left.y - right.y);

  return {
    template,
    slots,
    visibleSlotSources,
    visibleMatches,
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

function buildPrintSvgMarkup(renderModel: TemplateRenderModel) {
  const roundLabels = renderModel.template.roundLabels
    .map((label) => {
      return `<text x="${label.x}" y="${label.y}" fill="currentColor" font-size="13" font-weight="600">${escapeHtml(label.text)}</text>`;
    })
    .join("");
  const thirdPlaceBracket = renderModel.template.thirdPlaceBracket;
  const matches = renderModel.visibleMatches
    .map((match) => {
      const nextLine = match.nextX
        ? `<line x1="${match.joinX}" y1="${match.centerY}" x2="${match.nextX}" y2="${match.centerY}" stroke="currentColor" stroke-width="2" />`
        : "";

      return `<g id="${match.id}">
        <line x1="${match.top.x}" y1="${match.top.y}" x2="${match.joinX}" y2="${match.top.y}" stroke="currentColor" stroke-width="2" />
        <line x1="${match.bottom.x}" y1="${match.bottom.y}" x2="${match.joinX}" y2="${match.bottom.y}" stroke="currentColor" stroke-width="2" />
        <line x1="${match.joinX}" y1="${match.top.y}" x2="${match.joinX}" y2="${match.bottom.y}" stroke="currentColor" stroke-width="2" />
        ${nextLine}
      </g>`;
    })
    .join("");
  const thirdPlaceMarkup = `<g id="third-place-match">
      <text x="${thirdPlaceBracket.labelX}" y="${thirdPlaceBracket.labelY}" fill="currentColor" font-size="12" font-weight="600">3rd Place Match</text>
      <line x1="${thirdPlaceBracket.lineStartX}" y1="${thirdPlaceBracket.topY}" x2="${thirdPlaceBracket.joinX}" y2="${thirdPlaceBracket.topY}" stroke="currentColor" stroke-width="2" />
      <line x1="${thirdPlaceBracket.lineStartX}" y1="${thirdPlaceBracket.bottomY}" x2="${thirdPlaceBracket.joinX}" y2="${thirdPlaceBracket.bottomY}" stroke="currentColor" stroke-width="2" />
      <line x1="${thirdPlaceBracket.joinX}" y1="${thirdPlaceBracket.topY}" x2="${thirdPlaceBracket.joinX}" y2="${thirdPlaceBracket.bottomY}" stroke="currentColor" stroke-width="2" />
      <line x1="${thirdPlaceBracket.joinX}" y1="${(thirdPlaceBracket.topY + thirdPlaceBracket.bottomY) / 2}" x2="${thirdPlaceBracket.winnerX}" y2="${(thirdPlaceBracket.topY + thirdPlaceBracket.bottomY) / 2}" stroke="currentColor" stroke-width="2" />
    </g>`;
  const placementLinesMarkup = renderModel.template.placementLines
    .map((line) => {
      return `<g id="${line.id}">
        <text x="${line.labelX}" y="${line.y - 4}" fill="currentColor" font-size="13" font-weight="600">${escapeHtml(line.label)}</text>
        <line x1="${line.lineStartX}" y1="${line.y}" x2="${line.lineEndX}" y2="${line.y}" stroke="currentColor" stroke-width="2" />
      </g>`;
    })
    .join("");
  const slotLookup = new Map(renderModel.slots.map((slot) => [slot.id, slot]));
  const labels = renderModel.visibleSlotSources
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

  return `<svg viewBox="0 0 ${renderModel.template.viewBoxWidth} ${renderModel.template.viewBoxHeight}" class="division-draw-svg" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Single elimination tournament bracket">
    <g id="round-labels">${roundLabels}</g>
    <g id="match-lines">${matches}</g>
    ${thirdPlaceMarkup}
    <g id="placement-lines">${placementLinesMarkup}</g>
    <g id="slot-labels">${labels}</g>
  </svg>`;
}

function buildPrintDocumentMarkup(
  renderModel: TemplateRenderModel,
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
        <title>Tournament Draw Sheet</title>
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
            </div>
          </div>
          <div class="division-draw-frame">${svgMarkup}</div>
        </div>
      </body>
    </html>
  `;
}

export function DivisionDraw() {
  const registrations = useAtomValue(selectedRegistrationsAtom) ?? [];
  const renderModel = useMemo(() => buildTemplateRenderModel(registrations), [registrations]);
  const titleRegistration = registrations[0];
  const divisionNames = Array.from(new Set(registrations.map((r) => r.divisionName))).join(" / ");
  const displayEventNames = Array.from(new Set(registrations.map((r) => r.eventDisplayName || r.eventName))).join(" / ");


  const matchesByRound = useMemo(() => {
    const grouped = new Map<number, RenderedMatch[]>();

    for (const match of renderModel.visibleMatches) {
      const roundMatches = grouped.get(match.round) ?? [];

      roundMatches.push(match);
      grouped.set(match.round, roundMatches);
    }

    return grouped;
  }, [renderModel.visibleMatches]);

  function handlePrint() {
    const printMarkup = buildPrintDocumentMarkup(
      renderModel,
      divisionNames || "Division",
      displayEventNames || "",
      registrations.length
    );
    const printBlob = new Blob([printMarkup], { type: "text/html" });
    const printUrl = URL.createObjectURL(printBlob);
    const printWindow = window.open(printUrl, "_blank");

    if (!printWindow) {
      URL.revokeObjectURL(printUrl);
    }
  }

  function renderSlotLabel(source: ResolvedSource) {
    const slot = renderModel.slots.find((candidate) => candidate.id === source.id);

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

  function renderMatch(match: RenderedMatch) {
    return (
      <g key={match.id} id={match.id}>
        <line
          x1={match.top.x}
          y1={match.top.y}
          x2={match.joinX}
          y2={match.top.y}
          stroke="currentColor"
          strokeWidth="2"
        />

        <line
          x1={match.bottom.x}
          y1={match.bottom.y}
          x2={match.joinX}
          y2={match.bottom.y}
          stroke="currentColor"
          strokeWidth="2"
        />

        <line
          x1={match.joinX}
          y1={match.top.y}
          x2={match.joinX}
          y2={match.bottom.y}
          stroke="currentColor"
          strokeWidth="2"
        />

        {match.nextX && (
          <line
            x1={match.joinX}
            y1={match.centerY}
            x2={match.nextX}
            y2={match.centerY}
            stroke="currentColor"
            strokeWidth="2"
          />
        )}
      </g>
    );
  }

  function renderThirdPlaceBracket() {
    const thirdPlaceBracket = renderModel.template.thirdPlaceBracket;
    const centerY = (thirdPlaceBracket.topY + thirdPlaceBracket.bottomY) / 2;

    return (
      <g id="third-place-match">
        <text
          x={thirdPlaceBracket.labelX}
          y={thirdPlaceBracket.labelY}
          fill="currentColor"
          fontSize="12"
          fontWeight="600"
          className="text-gray-300 print:text-gray-600"
        >
          3rd Place Match
        </text>

        <line
          x1={thirdPlaceBracket.lineStartX}
          y1={thirdPlaceBracket.topY}
          x2={thirdPlaceBracket.joinX}
          y2={thirdPlaceBracket.topY}
          stroke="currentColor"
          strokeWidth="2"
        />

        <line
          x1={thirdPlaceBracket.lineStartX}
          y1={thirdPlaceBracket.bottomY}
          x2={thirdPlaceBracket.joinX}
          y2={thirdPlaceBracket.bottomY}
          stroke="currentColor"
          strokeWidth="2"
        />

        <line
          x1={thirdPlaceBracket.joinX}
          y1={thirdPlaceBracket.topY}
          x2={thirdPlaceBracket.joinX}
          y2={thirdPlaceBracket.bottomY}
          stroke="currentColor"
          strokeWidth="2"
        />

        <line
          x1={thirdPlaceBracket.joinX}
          y1={centerY}
          x2={thirdPlaceBracket.winnerX}
          y2={centerY}
          stroke="currentColor"
          strokeWidth="2"
        />
      </g>
    );
  }

  function renderPlacementLine(line: TemplatePlacementLine) {
    return (
      <g key={line.id} id={line.id}>
        <text
          x={line.labelX}
          y={line.y - 4}
          fill="currentColor"
          fontSize="13"
          fontWeight="600"
          className="text-gray-300 print:text-gray-600"
        >
          {line.label}
        </text>

        <line
          x1={line.lineStartX}
          y1={line.y}
          x2={line.lineEndX}
          y2={line.y}
          stroke="currentColor"
          strokeWidth="2"
        />
      </g>
    );
  }

  return (
    <div className="division-draw-page min-h-screen bg-gray-900 p-6 text-white print:min-h-0 print:bg-white print:p-0 print:text-black">
      <div className="division-draw-screen-header mb-6 flex items-start justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-semibold">Tournament Draw Sheet</h2>
          <p className="mt-1 text-sm text-gray-300 print:text-gray-600">
            Single-elimination printable bracket.
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="rounded border border-gray-500 px-4 py-2 text-sm font-medium text-white transition hover:border-gray-300 hover:bg-gray-800 print:hidden"
        >
          Print
        </button>
      </div>

      {registrations.length === 0 ? (
        <p>No registrations selected.</p>
      ) : (
        <section className="division-draw-sheet rounded-lg border border-gray-700 bg-gray-800 p-6 print:border-0 print:bg-white print:p-0">
          <div className="division-draw-meta mb-3 flex items-start justify-between gap-4 print:mb-1">
            <div>
              <h3 className="text-xl font-semibold">
                {divisionNames || "Division"}
              </h3>
              <p className="text-sm text-gray-300 print:text-gray-600">
                {displayEventNames || titleRegistration?.eventName || ""}
              </p>
            </div>

            <div className="text-right text-sm text-gray-300 print:text-gray-600">
              <div>{registrations.length} competitors</div>
              <div>{renderModel.template.size}-Competitor Template</div>
            </div>
          </div>

          {renderModel.visibleMatches.length === 0 ? (
            <div className="rounded border border-gray-600 p-6 text-sm print:border-gray-400">
              {registrations[0]
                ? `${registrations[0].firstName} ${registrations[0].lastName}`
                : "No bracket available."}
            </div>
          ) : (
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
                  aria-label="Single elimination tournament bracket"
                >
                  <g id="round-labels">
                    {renderModel.template.roundLabels.map((label) => (
                      <text
                        key={label.id}
                        x={label.x}
                        y={label.y}
                        fill="currentColor"
                        fontSize="13"
                        fontWeight="600"
                        className="uppercase tracking-wide text-gray-300 print:text-gray-600"
                      >
                        {label.text}
                      </text>
                    ))}
                  </g>

                  {renderThirdPlaceBracket()}

                  <g id="placement-lines">
                    {renderModel.template.placementLines.map((line) => renderPlacementLine(line))}
                  </g>

                  {renderModel.template.rounds.map((round) => {
                    const roundMatches = matchesByRound.get(round) ?? [];

                    if (roundMatches.length === 0) {
                      return null;
                    }

                    return (
                      <g key={`round-${round}`} id={`round-${round}-matches`}>
                        {roundMatches.map((match) => renderMatch(match))}
                      </g>
                    );
                  })}

                  <g id="slot-labels">
                    {renderModel.visibleSlotSources.map((source) => renderSlotLabel(source))}
                  </g>
                </svg>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}