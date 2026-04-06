import { ROLE_CARD_DEFS, ROLE_CARD_IDS } from "../../../shared/types/roleCards";
import { assembleRoleDeck } from "../../../shared/types/gameSetup";
import type { RoleCardID } from "../types/gameTypes";
import type { PlayerMarkAssignment, PlayerMarkDefinition } from "../types/playerMarks";

const BASE_MARKS: PlayerMarkDefinition[] = [
  {
    id: "good-generic",
    label: "Good",
    tone: "good",
    unique: false,
  },
  {
    id: "evil-generic",
    label: "Evil",
    tone: "evil",
    unique: false,
  },
];

const SPECIAL_MARKS: Record<number, PlayerMarkDefinition> = {
  [ROLE_CARD_IDS.MERLIN]: {
    id: "merlin",
    label: "Merlin",
    tone: "good",
    glyph: "M",
    unique: true,
  },
  [ROLE_CARD_IDS.PERCIVAL]: {
    id: "percival",
    label: "Percival",
    tone: "good",
    glyph: "P",
    unique: true,
  },
  [ROLE_CARD_IDS.MORDRED]: {
    id: "mordred",
    label: "Mordred",
    tone: "evil",
    glyph: "M",
    unique: true,
  },
  [ROLE_CARD_IDS.MORGANA]: {
    id: "morgana",
    label: "Morgana",
    tone: "evil",
    glyph: "G",
    unique: true,
  },
  [ROLE_CARD_IDS.OBERON]: {
    id: "oberon",
    label: "Oberon",
    tone: "evil",
    glyph: "O",
    unique: true,
  },
  [ROLE_CARD_IDS.LANCELOT_GOOD]: {
    id: "lancelot-good",
    label: "Lancelot",
    tone: "good",
    glyph: "L",
    unique: true,
  },
  [ROLE_CARD_IDS.LANCELOT_EVIL]: {
    id: "lancelot-evil",
    label: "Lancelot",
    tone: "evil",
    glyph: "L",
    unique: true,
  },
};

export function buildPlayerMarkLibrary(playerCount: number): PlayerMarkDefinition[] {
  const deck = assembleRoleDeck(playerCount);
  const specialMarks = deck.flatMap((roleCardId) =>
    SPECIAL_MARKS[roleCardId] ? [SPECIAL_MARKS[roleCardId]] : []
  );

  return [...BASE_MARKS, ...specialMarks];
}

export function getPlayerMarkDefinition(
  markId: string | null | undefined,
  library: PlayerMarkDefinition[]
): PlayerMarkDefinition | null {
  if (!markId) {
    return null;
  }

  return library.find((mark) => mark.id === markId) ?? null;
}

export function getAvailablePlayerMarks(
  library: PlayerMarkDefinition[],
  assignments: PlayerMarkAssignment,
  playerId: string
): PlayerMarkDefinition[] {
  const takenUniqueMarkIds = new Set(
    Object.entries(assignments)
      .filter(([assignedPlayerId, markId]) => assignedPlayerId !== playerId && Boolean(markId))
      .map(([, markId]) => markId as string)
  );

  return library.filter((mark) => !mark.unique || !takenUniqueMarkIds.has(mark.id));
}

export function sanitizePlayerMarkAssignments(
  assignments: PlayerMarkAssignment,
  playerIds: string[],
  playerCount: number
): PlayerMarkAssignment {
  const library = buildPlayerMarkLibrary(playerCount);
  const markById = new Map(library.map((mark) => [mark.id, mark]));
  const validPlayerIds = new Set(playerIds);
  const usedUniqueMarks = new Set<string>();

  const sanitizedEntries = Object.entries(assignments).flatMap(([playerId, markId]) => {
    if (!validPlayerIds.has(playerId) || markId === null) {
      return [];
    }

    const mark = markById.get(markId);
    if (!mark) {
      return [];
    }

    if (mark.unique) {
      if (usedUniqueMarks.has(mark.id)) {
        return [];
      }

      usedUniqueMarks.add(mark.id);
    }

    return [[playerId, markId] as const];
  });

  return Object.fromEntries(sanitizedEntries);
}

export function getRoleDeckSummary(playerCount: number): string[] {
  const grouped = new Set(
    assembleRoleDeck(playerCount).map((roleCardId) => {
      const roleCard = ROLE_CARD_DEFS[roleCardId as RoleCardID];
      return roleCard.role;
    })
  );

  return [...grouped];
}
