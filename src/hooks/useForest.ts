import { useState, useCallback } from 'react';
import type { ForestState, SavedTree } from '../types';
import { FOREST_STORAGE_KEY, SPECIES } from '../types';

const DEFAULT_FOREST: ForestState = {
  trees: [],
  totalFocusMs: 0,
  sessionsCompleted: 0,
  sessionsAbandoned: 0,
};

function load(): ForestState {
  try {
    const raw = localStorage.getItem(FOREST_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ForestState;
  } catch { /* ignore parse errors */ }
  return DEFAULT_FOREST;
}

function persist(state: ForestState) {
  localStorage.setItem(FOREST_STORAGE_KEY, JSON.stringify(state));
}

// Assigns a non-overlapping forestX position for a new tree
function assignForestX(existing: SavedTree[]): number {
  const taken = existing.map(t => t.forestX);
  let candidate = 0;
  let attempts = 0;
  do {
    candidate = 0.04 + Math.random() * 0.92;
    attempts++;
  } while (attempts < 30 && taken.some(x => Math.abs(x - candidate) < 0.055));
  return candidate;
}

export function useForest() {
  const [forest, setForest] = useState<ForestState>(load);

  const saveTree = useCallback((config: { durationMs: number; species: string }) => {
    setForest(prev => {
      const tree: SavedTree = {
        id: crypto.randomUUID(),
        plantedAt: Date.now(),
        durationMs: config.durationMs,
        species: (SPECIES.includes(config.species as any) ? config.species : 'oak') as SavedTree['species'],
        forestX: assignForestX(prev.trees),
        forestLayer: (prev.trees.length % 3) as 0 | 1 | 2,
      };
      const next: ForestState = {
        trees: [...prev.trees, tree],
        totalFocusMs: prev.totalFocusMs + config.durationMs,
        sessionsCompleted: prev.sessionsCompleted + 1,
        sessionsAbandoned: prev.sessionsAbandoned,
      };
      persist(next);
      return next;
    });
  }, []);

  const recordAbandoned = useCallback(() => {
    setForest(prev => {
      const next = { ...prev, sessionsAbandoned: prev.sessionsAbandoned + 1 };
      persist(next);
      return next;
    });
  }, []);

  const clearForest = useCallback(() => {
    persist(DEFAULT_FOREST);
    setForest(DEFAULT_FOREST);
  }, []);

  return { forest, saveTree, recordAbandoned, clearForest };
}
