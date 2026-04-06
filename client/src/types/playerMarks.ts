export type PlayerMarkTone = "good" | "evil";

export type PlayerMarkDefinition = {
  id: string;
  label: string;
  tone: PlayerMarkTone;
  glyph?: string;
  unique: boolean;
};

export type PlayerMarkAssignment = Record<string, string | null>;
