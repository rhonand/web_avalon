import type { Player, Room, SeatMetaInfo } from "../types/gameTypes";
import { getRoleCardOf } from "./roleEngine";

export type VisiblePlayerInfo = {
  displayName: string;
  lines: string[];
};



export function getSeatMetaInfoForViewer(
  viewer: Player,
  target: Player
): SeatMetaInfo {
  const viewerCard = getRoleCardOf(viewer);
  const targetCard = getRoleCardOf(target);

  if (!viewerCard || !targetCard) return null;

  // Self
  if (viewer.id === target.id) {
    return {
      text: viewerCard.bref,
      tone: viewerCard.team === "evil" ? "evil" : "good",
    };
  }

  // Merlin
  if (viewerCard.role === "Merlin") {
    const visibleAsEvil =
      targetCard.team === "evil" &&
      targetCard.role !== "Mordred";

    if (visibleAsEvil) {
      return {
        text: "Evil",
        tone: "evil",
      };
    }

    return null;
  }
  
  // Percival
  if (viewerCard.role === "Percival") {
    const possibleMerlin =
      targetCard.role === "Merlin" ||
      targetCard.role === "Morgana";

    if (possibleMerlin) {
      return {
        text: "Merlin?",
        tone: "neutral",
      };
    }

    return null;
  }

  // Evil team
  if (viewerCard.team === "evil" && viewerCard.role !== "Oberon") {
    if (targetCard.team === "evil" && targetCard.role !== "Oberon") {
      return {
        text: targetCard.bref,
        tone: "evil",
      };
    }

    return null;
  }

  
  return null;
}

export function getVisiblePlayerInfo(
  viewer: Player,
  target: Player,
  room: Room
): VisiblePlayerInfo {
  const viewerCard = getRoleCardOf(viewer);
  const targetCard = getRoleCardOf(target);

  if (!targetCard) {
    return {
      displayName: target.name,
      lines: ["No role assigned."],
    };
  }

  // Self
  if (viewer.id === target.id) {
    return {
      displayName: target.name,
      
      lines: [
       `Character: ${target.role}`,
        `Team: ${target.team}`,
      ],
    };
  }

  // Merlin
  if (viewerCard?.role === "Merlin") {
    const visibleAsEvil =
      target.team === "evil" &&
      target.role !== "Mordred";

    if (visibleAsEvil) {
      return {
        displayName: target.name,
        lines: ["This player appears evil."],
      };
    }

    return {
      displayName: target.name,
      lines: ["No special information."],
    };
  }

  // Percival
  if (viewerCard?.role === "Percival") {
    if (
      target.role === "Merlin" ||
      target.role === "Morgana"
    ) {
      return {
        displayName: target.name,
        lines: ["This player may be Merlin."],
      };
    }

    return {
      displayName: target.name,
      lines: ["No special information."],
    };
  }

  // Evil Team
  if (viewer.team === "evil") {
    const viewerIsOberon = viewer.role === "Oberon";
    const targetIsOberon = target.role === "Oberon";

    if (!viewerIsOberon && !targetIsOberon && target.team === "evil") {
      return {
        displayName: target.name,
        lines: [`${target.role}`],
      };
    }

    return {
      displayName: target.name,
      lines: ["No special information."],
    };
  }

  // 
  return {
    displayName: target.name,
    lines: ["No special information."],
  };
}