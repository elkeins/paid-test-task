/**
 * Core types for the Soccer Tactics Board
 */

export interface Position {
  x: number; // SVG coordinate (0–750)
  y: number; // SVG coordinate (0–1200)
}

export type Team = 'blue' | 'red';

export interface Player {
  id: string;
  number: number;
  team: Team;
  x: number; // SVG x coordinate
  y: number; // SVG y coordinate
}

/** Field dimensions in SVG units (10x yard scale) */
const FIELD_WIDTH = 750;
const FIELD_HEIGHT = 1200;
const FIELD_PADDING = 40;

export const FIELD = {
  WIDTH: FIELD_WIDTH,
  HEIGHT: FIELD_HEIGHT,
  PADDING: FIELD_PADDING,
  LEFT: FIELD_PADDING,
  TOP: FIELD_PADDING,
  RIGHT: FIELD_WIDTH - FIELD_PADDING,
  BOTTOM: FIELD_HEIGHT - FIELD_PADDING,
  PLAY_WIDTH: FIELD_WIDTH - 2 * FIELD_PADDING,
  PLAY_HEIGHT: FIELD_HEIGHT - 2 * FIELD_PADDING,
} as const;

/** Player token radius in SVG units (smaller for 22 players) */
export const PLAYER_RADIUS = 18;

/** Snap grid size (0 = no snap) */
export const SNAP_GRID = 10;

/** Team color configuration */
export const TEAM_COLORS: Record<Team, { fill: string; stroke: string; text: string }> = {
  blue: { fill: '#3B82F6', stroke: '#2563EB', text: '#FFFFFF' },
  red:  { fill: '#EF4444', stroke: '#DC2626', text: '#FFFFFF' },
};

// ─── Formation System ────────────────────────────────────────────────

/**
 * A formation position defined as normalized coordinates (0–1).
 * x: 0 = left edge, 1 = right edge of field
 * y: 0 = own goal line, 1 = halfway line
 * These are mirrored for the opposing team.
 */
export interface FormationPosition {
  x: number; // 0–1 horizontal
  y: number; // 0–1 vertical (0 = goal, 1 = midfield)
}

/** A named formation template with 11 positions */
export interface FormationPreset {
  id: string;
  name: string;
  shortName: string; // e.g. "4-4-2"
  description: string;
  positions: FormationPosition[]; // exactly 11
}

/** A user-saved formation with actual player coordinates */
export interface SavedFormation {
  id: string;
  name: string;
  createdAt: number; // timestamp
  players: Player[];
}

/** localStorage key for saved formations */
export const STORAGE_KEY = 'tactics-board-formations';

// ─── Preset Formations (11 positions each) ───────────────────────────

export const PRESET_FORMATIONS: FormationPreset[] = [
  {
    id: 'preset-442',
    name: 'Classic 4-4-2',
    shortName: '4-4-2',
    description: 'Balanced formation with two strikers and a flat midfield four.',
    positions: [
      { x: 0.50, y: 0.05 }, // GK
      { x: 0.15, y: 0.28 }, // LB
      { x: 0.38, y: 0.22 }, // CB
      { x: 0.62, y: 0.22 }, // CB
      { x: 0.85, y: 0.28 }, // RB
      { x: 0.12, y: 0.52 }, // LM
      { x: 0.37, y: 0.48 }, // CM
      { x: 0.63, y: 0.48 }, // CM
      { x: 0.88, y: 0.52 }, // RM
      { x: 0.35, y: 0.78 }, // ST
      { x: 0.65, y: 0.78 }, // ST
    ],
  },
  {
    id: 'preset-433',
    name: 'Attacking 4-3-3',
    shortName: '4-3-3',
    description: 'Wide attacking formation with three forwards and a midfield triangle.',
    positions: [
      { x: 0.50, y: 0.05 }, // GK
      { x: 0.15, y: 0.28 }, // LB
      { x: 0.38, y: 0.22 }, // CB
      { x: 0.62, y: 0.22 }, // CB
      { x: 0.85, y: 0.28 }, // RB
      { x: 0.30, y: 0.50 }, // CM
      { x: 0.50, y: 0.45 }, // CM
      { x: 0.70, y: 0.50 }, // CM
      { x: 0.12, y: 0.78 }, // LW
      { x: 0.50, y: 0.82 }, // ST
      { x: 0.88, y: 0.78 }, // RW
    ],
  },
  {
    id: 'preset-352',
    name: 'Wing-Back 3-5-2',
    shortName: '3-5-2',
    description: 'Three center-backs with wing-backs providing width in midfield.',
    positions: [
      { x: 0.50, y: 0.05 }, // GK
      { x: 0.25, y: 0.22 }, // CB
      { x: 0.50, y: 0.19 }, // CB
      { x: 0.75, y: 0.22 }, // CB
      { x: 0.08, y: 0.48 }, // LWB
      { x: 0.30, y: 0.45 }, // CM
      { x: 0.50, y: 0.42 }, // CM
      { x: 0.70, y: 0.45 }, // CM
      { x: 0.92, y: 0.48 }, // RWB
      { x: 0.35, y: 0.76 }, // ST
      { x: 0.65, y: 0.76 }, // ST
    ],
  },
  {
    id: 'preset-4231',
    name: 'Modern 4-2-3-1',
    shortName: '4-2-3-1',
    description: 'Dominant modern formation with double pivot and creative midfield trio.',
    positions: [
      { x: 0.50, y: 0.05 }, // GK
      { x: 0.15, y: 0.28 }, // LB
      { x: 0.38, y: 0.22 }, // CB
      { x: 0.62, y: 0.22 }, // CB
      { x: 0.85, y: 0.28 }, // RB
      { x: 0.35, y: 0.42 }, // CDM
      { x: 0.65, y: 0.42 }, // CDM
      { x: 0.15, y: 0.62 }, // LW
      { x: 0.50, y: 0.60 }, // CAM
      { x: 0.85, y: 0.62 }, // RW
      { x: 0.50, y: 0.82 }, // ST
    ],
  },
];

// ─── Helper Functions ────────────────────────────────────────────────

/**
 * Convert normalized formation positions (0–1) to SVG coordinates
 * for both teams (blue = top half, red = bottom half mirrored).
 */
export function formationToPlayers(preset: FormationPreset): Player[] {
  const left = FIELD.LEFT;
  const pw = FIELD.PLAY_WIDTH;
  const top = FIELD.TOP;
  const halfH = FIELD.PLAY_HEIGHT / 2;

  const players: Player[] = [];

  // Blue team — top half (y: 0 = top goal line, 1 = halfway)
  preset.positions.forEach((pos, i) => {
    players.push({
      id: `b${i + 1}`,
      number: i + 1,
      team: 'blue',
      x: Math.round((left + pos.x * pw) / SNAP_GRID) * SNAP_GRID,
      y: Math.round((top + pos.y * halfH) / SNAP_GRID) * SNAP_GRID,
    });
  });

  // Red team — bottom half (mirrored: y: 0 = bottom goal line, 1 = halfway)
  preset.positions.forEach((pos, i) => {
    players.push({
      id: `r${i + 1}`,
      number: i + 1,
      team: 'red',
      x: Math.round((left + (1 - pos.x) * pw) / SNAP_GRID) * SNAP_GRID, // mirror x
      y: Math.round((FIELD.BOTTOM - pos.y * halfH) / SNAP_GRID) * SNAP_GRID,
    });
  });

  return players;
}

/**
 * Get default 11v11 players using the 4-4-2 formation.
 */
export function getDefaultPlayers(): Player[] {
  return formationToPlayers(PRESET_FORMATIONS[0]);
}
