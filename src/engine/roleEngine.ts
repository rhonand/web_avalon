import type { Player, RoleCardID, RoleCard } from "../types/gameTypes";
import { ROLE_CARD_IDS, ROLE_CARD_DEFS } from "../types/gameTypes";

export function assembleRoleDeck(playerCount: number): RoleCardID[] {
  switch (playerCount) {
    case 5:
      return [  
        ROLE_CARD_IDS.MERLIN,
        ROLE_CARD_IDS.PERCIVAL,
        ROLE_CARD_IDS.ASSASSIN,
        ROLE_CARD_IDS.MORGANA,
        ROLE_CARD_IDS.SERVANT_1
        ];

    case 6:
      return [
        ROLE_CARD_IDS.MERLIN,
        ROLE_CARD_IDS.PERCIVAL,
        ROLE_CARD_IDS.ASSASSIN,
        ROLE_CARD_IDS.MORGANA,
        ROLE_CARD_IDS.SERVANT_1,
        ROLE_CARD_IDS.SERVANT_2
      ];

    case 7:
      return [
        ROLE_CARD_IDS.MERLIN,
        ROLE_CARD_IDS.PERCIVAL,
        ROLE_CARD_IDS.ASSASSIN,
        ROLE_CARD_IDS.MORGANA,
        ROLE_CARD_IDS.SERVANT_1,
        ROLE_CARD_IDS.SERVANT_2,
        ROLE_CARD_IDS.OBERON
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
        ROLE_CARD_IDS.MINION
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
        ROLE_CARD_IDS.SERVANT_4
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
        ROLE_CARD_IDS.OBERON
      ];

    default:
      throw new Error(`Unsupported player count: ${playerCount}`);
  }
}



export function dealCardsToPlayers(players: Player[], deck: RoleCardID[]): Player[] {
  const shuffledDeck = shuffle(deck);

  return players.map((player, index) => ({
    ...player,
    roleCardID: shuffledDeck[index],
    role: ROLE_CARD_DEFS[shuffledDeck[index]].role,
    team: ROLE_CARD_DEFS[shuffledDeck[index]].team
  }));
}

export function getRoleCardDef(cardId: RoleCardID): RoleCard {
  return ROLE_CARD_DEFS[cardId];
}

export function getRoleCardOf(player: Player): RoleCard | null {
  if (player.roleCardID === undefined) return null;
  return ROLE_CARD_DEFS[player.roleCardID];
}

function shuffle<T>(array: T[]): T[] {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}