import { useReducer, useRef, useCallback } from 'react';
import type { StopwatchStatus } from '../types';

interface StopwatchState {
  elapsed: number;
  laps: number[];
  status: StopwatchStatus;
}

type Action =
  | { type: 'START' }
  | { type: 'STOP' }
  | { type: 'RESET' }
  | { type: 'LAP' }
  | { type: 'TICK'; elapsed: number };

const initial: StopwatchState = { elapsed: 0, laps: [], status: 'idle' };

function reducer(state: StopwatchState, action: Action): StopwatchState {
  switch (action.type) {
    case 'START':
      return { ...state, status: 'running' };
    case 'STOP':
      return { ...state, status: 'stopped' };
    case 'RESET':
      return { ...initial };
    case 'LAP': {
      const lapElapsed = state.laps.reduce((a, b) => a + b, 0);
      return { ...state, laps: [...state.laps, state.elapsed - lapElapsed] };
    }
    case 'TICK':
      return { ...state, elapsed: action.elapsed };
    default:
      return state;
  }
}

export function useStopwatch() {
  const [state, dispatch] = useReducer(reducer, initial);
  const rafRef = useRef<number | null>(null);
  const startAtRef = useRef<number>(0);
  const accumulatedRef = useRef<number>(0);

  const cancelRaf = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    const elapsed = accumulatedRef.current + (Date.now() - startAtRef.current);
    dispatch({ type: 'TICK', elapsed });
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const start = useCallback(() => {
    startAtRef.current = Date.now();
    dispatch({ type: 'START' });
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const stop = useCallback(() => {
    cancelRaf();
    accumulatedRef.current += Date.now() - startAtRef.current;
    dispatch({ type: 'STOP' });
  }, [cancelRaf]);

  const reset = useCallback(() => {
    cancelRaf();
    accumulatedRef.current = 0;
    startAtRef.current = 0;
    dispatch({ type: 'RESET' });
  }, [cancelRaf]);

  const lap = useCallback(() => {
    dispatch({ type: 'LAP' });
  }, []);

  return { ...state, start, stop, reset, lap };
}
