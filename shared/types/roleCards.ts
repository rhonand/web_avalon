import type { Role, RoleCardID, Team } from "./sharedTypes";

export type RoleCard = {
  id: RoleCardID;
  role: Role;
  team: Team;
  bref: string;
};

export const ROLE_CARD_IDS = {
  MERLIN: 0,
  PERCIVAL: 1,
  ASSASSIN: 2,
  MORGANA: 3,
  MORDRED: 4,
  SERVANT_1: 5,
  SERVANT_2: 6,
  SERVANT_3: 7,
  SERVANT_4: 8,
  OBERON: 9,
  MINION: 10,
  LANCELOT_GOOD: 11,
  LANCELOT_EVIL: 12,
} as const;

export const ROLE_CARD_DEFS: Record<RoleCardID, RoleCard> = {
  [ROLE_CARD_IDS.MERLIN]: {
    id: ROLE_CARD_IDS.MERLIN,
    role: "Merlin",
    team: "good",
    bref: "Merlin",
  },
  [ROLE_CARD_IDS.PERCIVAL]: {
    id: ROLE_CARD_IDS.PERCIVAL,
    role: "Percival",
    team: "good",
    bref: "Percival",
  },
  [ROLE_CARD_IDS.ASSASSIN]: {
    id: ROLE_CARD_IDS.ASSASSIN,
    role: "Assassin",
    team: "evil",
    bref: "Assassin",
  },
  [ROLE_CARD_IDS.MORGANA]: {
    id: ROLE_CARD_IDS.MORGANA,
    role: "Morgana",
    team: "evil",
    bref: "Morgana",
  },
  [ROLE_CARD_IDS.MORDRED]: {
    id: ROLE_CARD_IDS.MORDRED,
    role: "Mordred",
    team: "evil",
    bref: "Mordred",
  },
  [ROLE_CARD_IDS.SERVANT_1]: {
    id: ROLE_CARD_IDS.SERVANT_1,
    role: "Loyal Servant of Arthur",
    team: "good",
    bref: "Servant",
  },
  [ROLE_CARD_IDS.SERVANT_2]: {
    id: ROLE_CARD_IDS.SERVANT_2,
    role: "Loyal Servant of Arthur",
    team: "good",
    bref: "Servant",
  },
  [ROLE_CARD_IDS.SERVANT_3]: {
    id: ROLE_CARD_IDS.SERVANT_3,
    role: "Loyal Servant of Arthur",
    team: "good",
    bref: "Servant",
  },
  [ROLE_CARD_IDS.SERVANT_4]: {
    id: ROLE_CARD_IDS.SERVANT_4,
    role: "Loyal Servant of Arthur",
    team: "good",
    bref: "Servant",
  },
  [ROLE_CARD_IDS.OBERON]: {
    id: ROLE_CARD_IDS.OBERON,
    role: "Oberon",
    team: "evil",
    bref: "Oberon",
  },
  [ROLE_CARD_IDS.MINION]: {
    id: ROLE_CARD_IDS.MINION,
    role: "Minion of Mordred",
    team: "evil",
    bref: "Minion",
  },
  [ROLE_CARD_IDS.LANCELOT_GOOD]: {
    id: ROLE_CARD_IDS.LANCELOT_GOOD,
    role: "Lancelot",
    team: "good",
    bref: "Lancelot",
  },
  [ROLE_CARD_IDS.LANCELOT_EVIL]: {
    id: ROLE_CARD_IDS.LANCELOT_EVIL,
    role: "Lancelot",
    team: "evil",
    bref: "Lancelot",
  },
};
