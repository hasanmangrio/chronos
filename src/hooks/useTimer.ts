import { useReducer, useRef, useCallback } from 'react';
import type { TimerStatus } from '../types';

interface TimerState {
  inputH: number;
  inputM: number;
  inputS: number;
  remaining: number;
  total: number;
  status: TimerStatus;
}

type TimerAction =
  | { type: 'SET_INPUT'; field: 'h' | 'm' | 's'; value: number }
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'RESET' }
  | { type: 'TICK'; remaining: number }
  | { type: 'DONE' };

const initial: TimerState = {
  inputH: 0,
  inputM: 25,
  inputS: 0,
  remaining: 0,
  total: 0,
  status: 'idle',
};

function reducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case 'SET_INPUT': {
      const next = { ...state };
      if (action.field === 'h') next.inputH = action.value;
      if (action.field === 'm') next.inputM = action.value;
      if (action.field === 's') next.inputS = action.value;
      return next;
    }
    case 'START': {
      const ms =
        state.inputH * 3_600_000 +
        state.inputM * 60_000 +
        state.inputS * 1_000;
      if (ms <= 0) return state;
      return { ...state, remaining: ms, total: ms, status: 'running' };
    }
    case 'PAUSE':
      return { ...state, status: 'paused' };
    case 'RESUME':
      return { ...state, status: 'running' };
    case 'RESET':
      return { ...initial, inputH: state.inputH, inputM: state.inputM, inputS: state.inputS };
    case 'TICK':
      return { ...state, remaining: action.remaining };
    case 'DONE':
      return { ...state, remaining: 0, status: 'done' };
    default:
      return state;
  }
}

export function useTimer() {
  const [state, dispatch] = useReducer(reducer, initial);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endTimeRef = useRef<number>(0);

  const clearTick = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTick = useCallback((remaining: number) => {
    clearTick();
    endTimeRef.current = Date.now() + remaining;
    intervalRef.current = setInterval(() => {
      const left = endTimeRef.current - Date.now();
      if (left <= 0) {
        clearTick();
        dispatch({ type: 'DONE' });
      } else {
        dispatch({ type: 'TICK', remaining: left });
      }
    }, 100);
  }, [clearTick]);

  const start = useCallback(() => {
    const ms =
      state.inputH * 3_600_000 +
      state.inputM * 60_000 +
      state.inputS * 1_000;
    if (ms <= 0) return;
    dispatch({ type: 'START' });
    startTick(ms);
  }, [state.inputH, state.inputM, state.inputS, startTick]);

  const pause = useCallback(() => {
    clearTick();
    dispatch({ type: 'PAUSE' });
  }, [clearTick]);

  const resume = useCallback(() => {
    dispatch({ type: 'RESUME' });
    startTick(state.remaining);
  }, [state.remaining, startTick]);

  const reset = useCallback(() => {
    clearTick();
    dispatch({ type: 'RESET' });
  }, [clearTick]);

  const setInput = useCallback((field: 'h' | 'm' | 's', value: number) => {
    dispatch({ type: 'SET_INPUT', field, value });
  }, []);

  return { ...state, start, pause, resume, reset, setInput };
}
