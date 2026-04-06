import { ROLE_CARD_IDS } from "./roleCards";
import type { RoleCardID } from "./sharedTypes";

export function assembleRoleDeck(playerCount: number): RoleCardID[] {
  switch (playerCount) {
    case 5:
      return [
        ROLE_CARD_IDS.MERLIN,
        ROLE_CARD_IDS.PERCIVAL,
        ROLE_CARD_IDS.ASSASSIN,
        ROLE_CARD_IDS.MORGANA,
        ROLE_CARD_IDS.SERVANT_1,
      ];
    case 6:
      return [
        ROLE_CARD_IDS.MERLIN,
        ROLE_CARD_IDS.PERCIVAL,
        ROLE_CARD_IDS.ASSASSIN,
        ROLE_CARD_IDS.MORGANA,
        ROLE_CARD_IDS.SERVANT_1,
        ROLE_CARD_IDS.SERVANT_2,
      ];
    case 7:
      return [
        ROLE_CARD_IDS.MERLIN,
        ROLE_CARD_IDS.PERCIVAL,
        ROLE_CARD_IDS.ASSASSIN,
        ROLE_CARD_IDS.MORGANA,
        ROLE_CARD_IDS.SERVANT_1,
        ROLE_CARD_IDS.SERVANT_2,
        ROLE_CARD_IDS.OBERON,
      ];
    case 8:
      return [
        ROLE_CARD_IDS.MERLIN,
        ROLE_CARD_IDS.PERCIVAL,
        ROLE_CARD_IDS.ASSASSIN,
        ROLE_CARD_IDS.MORGANA,
        ROLE_CARD_IDS.SERVANT_1,
        ROLE_CARD_IDS.SERVANT_2,
        ROLE_CARD_IDS.SERVANT_3,
        ROLE_CARD_IDS.MINION,
      ];
    case 9:
      return [
        ROLE_CARD_IDS.MERLIN,
        ROLE_CARD_IDS.PERCIVAL,
        ROLE_CARD_IDS.ASSASSIN,
        ROLE_CARD_IDS.MORGANA,
        ROLE_CARD_IDS.MORDRED,
        ROLE_CARD_IDS.SERVANT_1,
        ROLE_CARD_IDS.SERVANT_2,
        ROLE_CARD_IDS.SERVANT_3,
        ROLE_CARD_IDS.SERVANT_4,
      ];
    case 10:
      return [
        ROLE_CARD_IDS.MERLIN,
        ROLE_CARD_IDS.PERCIVAL,
        ROLE_CARD_IDS.ASSASSIN,
        ROLE_CARD_IDS.MORGANA,
        ROLE_CARD_IDS.MORDRED,
        ROLE_CARD_IDS.SERVANT_1,
        ROLE_CARD_IDS.SERVANT_2,
        ROLE_CARD_IDS.SERVANT_3,
        ROLE_CARD_IDS.SERVANT_4,
        ROLE_CARD_IDS.OBERON,
      ];
    default:
      throw new Error(`Unsupported player count: ${playerCount}`);
  }
}
