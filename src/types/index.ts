export const SessionPhase = {
  Idle:      'idle',
  WalkingIn: 'walking_in',
  Planting:  'planting',
  Growing:   'growing',
  Complete:  'complete',
  Abandoned: 'abandoned',
} as const;
export type SessionPhase = typeof SessionPhase[keyof typeof SessionPhase];

export type TreeStage = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type TreeSpecies = 'oak' | 'pine' | 'cherry' | 'maple';

export interface SavedTree {
  id: string;
  plantedAt: number;
  durationMs: number;
  species: TreeSpecies;
  forestX: number;
  forestLayer: 0 | 1 | 2;
}

export interface ForestState {
  trees: SavedTree[];
  totalFocusMs: number;
  sessionsCompleted: number;
  sessionsAbandoned: number;
}

export interface SessionConfig {
  durationMs: number;
  species: TreeSpecies;
}

export const FOREST_STORAGE_KEY = 'chronos_forest_v1';

export const PRESET_DURATIONS: { label: string; ms: number; sub: string }[] = [
  { label: '15m', ms: 15 * 60_000, sub: 'Quick sprint' },
  { label: '25m', ms: 25 * 60_000, sub: 'Pomodoro' },
  { label: '45m', ms: 45 * 60_000, sub: 'Deep work' },
  { label: '1h',  ms: 60 * 60_000, sub: 'Power hour' },
];

export const SPECIES: TreeSpecies[] = ['oak', 'pine', 'cherry', 'maple'];
