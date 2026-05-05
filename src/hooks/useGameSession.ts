import { useReducer, useRef, useCallback } from 'react';
import { SessionPhase, type SessionConfig, type TreeStage } from '../types';

interface SessionState {
  phase: SessionPhase;
  config: SessionConfig | null;
  remainingMs: number;
  totalMs: number;
}

type Action =
  | { type: 'START'; config: SessionConfig }
  | { type: 'ADVANCE'; to: SessionPhase }
  | { type: 'TICK'; remaining: number }
  | { type: 'RESET' };

const INITIAL: SessionState = {
  phase: SessionPhase.Idle,
  config: null,
  remainingMs: 0,
  totalMs: 0,
};

function reducer(state: SessionState, action: Action): SessionState {
  switch (action.type) {
    case 'START':
      return { phase: SessionPhase.WalkingIn, config: action.config, totalMs: action.config.durationMs, remainingMs: action.config.durationMs };
    case 'ADVANCE':
      return { ...state, phase: action.to };
    case 'TICK':
      return { ...state, remainingMs: action.remaining };
    case 'RESET':
      return INITIAL;
  }
}

export function useGameSession(
  onComplete: (config: SessionConfig) => void,
  onAbandoned: () => void,
) {
  const [state, dispatch] = useReducer(reducer, INITIAL);

  // Keep a ref so callbacks always see fresh state without stale closures
  const stateRef = useRef(state);
  stateRef.current = state;

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endTimeRef = useRef<number>(0);

  const clearTick = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startCountdown = useCallback(() => {
    clearTick();
    endTimeRef.current = Date.now() + stateRef.current.totalMs;
    intervalRef.current = setInterval(() => {
      const left = endTimeRef.current - Date.now();
      if (left <= 0) {
        clearTick();
        dispatch({ type: 'ADVANCE', to: SessionPhase.Complete });
      } else {
        dispatch({ type: 'TICK', remaining: left });
      }
    }, 100);
  }, [clearTick]);

  const startSession = useCallback((config: SessionConfig) => {
    clearTick();
    dispatch({ type: 'START', config });
  }, [clearTick]);

  const abandonSession = useCallback(() => {
    clearTick();
    dispatch({ type: 'ADVANCE', to: SessionPhase.Abandoned });
  }, [clearTick]);

  // Called by the canvas when an animation phase finishes
  const onPhaseAnimationComplete = useCallback((phase: SessionPhase) => {
    if (phase === SessionPhase.WalkingIn) {
      dispatch({ type: 'ADVANCE', to: SessionPhase.Planting });
    } else if (phase === SessionPhase.Planting) {
      dispatch({ type: 'ADVANCE', to: SessionPhase.Growing });
      startCountdown();
    } else if (phase === SessionPhase.Complete) {
      const { config } = stateRef.current;
      if (config) onComplete(config);
      dispatch({ type: 'RESET' });
    } else if (phase === SessionPhase.Abandoned) {
      onAbandoned();
      dispatch({ type: 'RESET' });
    }
  }, [startCountdown, onComplete, onAbandoned]);

  const progress = state.totalMs > 0 ? Math.max(0, 1 - state.remainingMs / state.totalMs) : 0;
  const treeStage = Math.min(10, Math.floor(progress * 10)) as TreeStage;

  return {
    phase: state.phase,
    config: state.config,
    remainingMs: state.remainingMs,
    totalMs: state.totalMs,
    progress,
    treeStage,
    startSession,
    abandonSession,
    onPhaseAnimationComplete,
  };
}
