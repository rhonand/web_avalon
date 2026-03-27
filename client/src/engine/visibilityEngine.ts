import type { Player, Room, SeatMetaInfo, Team } from "../types/gameTypes";
import { getRoleCardOf } from "./roleEngine";

export type VisiblePlayerInfo = {
  displayName: string;
  lines: string[];
};

function getKnownTeamFromLady(viewer: Player, target: Player, room: Room): Team | null {
  if (viewer.id === target.id) {
    return null;
  }

  return room.ladyKnowledge[target.id] ?? null;
}

function getPercivalResolvedMeta(target: Player, room: Room): SeatMetaInfo {
  const candidates = room.players.filter(
    (player) => player.role === "Merlin" || player.role === "Morgana"
  );
  const knownCandidate = candidates.find(
    (candidate) => room.ladyKnowledge[candidate.id] !== undefined
  );

  if (!knownCandidate) {
    return null;
  }

  const knownTeam = room.ladyKnowledge[knownCandidate.id];
  const counterpart = candidates.find((candidate) => candidate.id !== knownCandidate.id);

  if (target.id === knownCandidate.id) {
    return knownTeam === "good"
      ? { text: "Merlin", tone: "good" }
      : { text: "Morgana", tone: "evil" };
  }

  if (counterpart && target.id === counterpart.id) {
    return knownTeam === "good"
      ? { text: "Morgana", tone: "evil" }
      : { text: "Merlin", tone: "good" };
  }

  return null;
}

function getAssassinateMetaForViewer(target: Player): SeatMetaInfo {
  if (!target.role || !target.team) {
    return null;
  }

  if (target.team === "evil") {
    return {
      text: target.role,
      tone: "evil",
    };
  }

  return null;
}

function getPercivalAssassinateMeta(target: Player, room: Room): SeatMetaInfo {
  const candidates = room.players.filter(
    (player) => player.role === "Merlin" || player.role === "Morgana"
  );
  const morgana = candidates.find((player) => player.role === "Morgana");
  const merlin = candidates.find((player) => player.role === "Merlin");

  if (morgana && target.id === morgana.id) {
    return {
      text: "Morgana",
      tone: "evil",
    };
  }

  if (merlin && target.id === merlin.id) {
    return {
      text: "Merlin",
      tone: "good",
    };
  }

  return getAssassinateMetaForViewer(target);
}

export function getSeatMetaInfoForViewer(
  viewer: Player,
  target: Player,
  room: Room
): SeatMetaInfo {
  const viewerCard = getRoleCardOf(viewer);
  const targetCard = getRoleCardOf(target);
  if (!viewerCard) return null;

  // Self
  if (viewer.id === target.id) {
    return {
      text: viewerCard.bref,
      tone: viewerCard.team === "evil" ? "evil" : "good",
    };
  }

  const knownTeam = getKnownTeamFromLady(viewer, target, room);

  if (room.phase === "assassinate") {
    if (viewerCard.role === "Percival") {
      return getPercivalAssassinateMeta(target, room);
    }

    return getAssassinateMetaForViewer(target);
  }

  // Merlin
  if (viewerCard.role === "Merlin") {
    const visibleAsEvil =
      !!targetCard &&
      targetCard.team === "evil" &&
      targetCard.role !== "Mordred";

    if (visibleAsEvil) {
      return {
        text: "Evil",
        tone: "evil",
      };
    }

    if (knownTeam) {
      return {
        text: knownTeam === "good" ? "Good" : "Evil",
        tone: knownTeam,
      };
    }

    return null;
  }
  
  // Percival
  if (viewerCard.role === "Percival") {
    const resolvedMeta = getPercivalResolvedMeta(target, room);
    if (resolvedMeta) {
      return resolvedMeta;
    }

    const possibleMerlin =
      !!targetCard &&
      targetCard.role === "Merlin" ||
      targetCard?.role === "Morgana";

    if (possibleMerlin) {
      return {
        text: "Merlin?",
        tone: "neutral",
      };
    }

    if (knownTeam) {
      return {
        text: knownTeam === "good" ? "Good" : "Evil",
        tone: knownTeam,
      };
    }

    return null;
  }

  // Evil team
  if (viewerCard.team === "evil" && viewerCard.role !== "Oberon") {
    if (
      targetCard &&
      targetCard.team === "evil" &&
      targetCard.role !== "Oberon"
    ) {
      return {
        text: targetCard.bref,
        tone: "evil",
      };
    }

    if (knownTeam) {
      return {
        text: knownTeam === "good" ? "Good" : "Evil",
        tone: knownTeam,
      };
    }

    return null;
  }

  if (knownTeam) {
    return {
      text: knownTeam === "good" ? "Good" : "Evil",
      tone: knownTeam,
    };
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
  const knownTeam = getKnownTeamFromLady(viewer, target, room);

  if (room.phase === "assassinate") {
    const meta =
      viewerCard?.role === "Percival"
        ? getPercivalAssassinateMeta(target, room)
        : getAssassinateMetaForViewer(target);

    if (meta) {
      return {
        displayName: target.name,
        lines: [`This player is ${meta.text}.`],
      };
    }
  }

  if (!targetCard && !knownTeam) {
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
      !!targetCard &&
      target.team === "evil" &&
      target.role !== "Mordred";

    if (visibleAsEvil) {
      return {
        displayName: target.name,
        lines: ["This player appears evil."],
      };
    }

    if (knownTeam) {
      return {
        displayName: target.name,
        lines: [`This player is on the ${knownTeam} side.`],
      };
    }

    return {
      displayName: target.name,
      lines: ["No special information."],
    };
  }

  // Percival
  if (viewerCard?.role === "Percival") {
    const resolvedMeta = getPercivalResolvedMeta(target, room);
    if (resolvedMeta) {
      return {
        displayName: target.name,
        lines: [`This player is ${resolvedMeta.text}.`],
      };
    }

    if (
      targetCard &&
      target.role === "Merlin" ||
      target.role === "Morgana"
    ) {
      return {
        displayName: target.name,
        lines: ["This player may be Merlin."],
      };
    }

    if (knownTeam) {
      return {
        displayName: target.name,
        lines: [`This player is on the ${knownTeam} side.`],
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
    const targetIsOberon = targetCard?.role === "Oberon";

    if (
      targetCard &&
      !viewerIsOberon &&
      !targetIsOberon &&
      target.team === "evil"
    ) {
      return {
        displayName: target.name,
        lines: [`${target.role}`],
      };
    }

    if (knownTeam) {
      return {
        displayName: target.name,
        lines: [`This player is on the ${knownTeam} side.`],
      };
    }

    return {
      displayName: target.name,
      lines: ["No special information."],
    };
  }

  // 
  if (knownTeam) {
    return {
      displayName: target.name,
      lines: [`This player is on the ${knownTeam} side.`],
    };
  }

  return {
    displayName: target.name,
    lines: ["No special information."],
  };
}
