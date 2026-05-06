import { useEffect, useRef } from 'react';
import { SessionPhase } from '../../types';
import type { ForestState, TreeStage, TreeSpecies } from '../../types';
import { drawScene, type SceneState } from './drawScene';
import type { CharAnim } from './drawCharacter';
import type { Particle } from './animationHelpers';
import {
  tickParticles, spawnSparkles, spawnLeaves, spawnDust,
} from './animationHelpers';
import styles from './ForestCanvas.module.css';

interface Props {
  phase: SessionPhase;
  treeStage: TreeStage;
  species: TreeSpecies;
  forest: ForestState;
  onPhaseAnimationComplete: (p: SessionPhase) => void;
}

// ── Phase timings ─────────────────────────────────────────────────────────
const WALK_IN_DURATION  = 2.2; // s
const PLANTING_DURATION = 3.0; // s
const END_DURATION      = 3.5; // s

export function ForestCanvas({
  phase,
  treeStage,
  species,
  forest,
  onPhaseAnimationComplete,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Mutable refs — canvas reads these every frame without triggering re-renders
  const phaseRef      = useRef<SessionPhase>(phase);
  const stageRef      = useRef<TreeStage>(treeStage);
  const speciesRef    = useRef<TreeSpecies>(species);
  const forestRef     = useRef<ForestState>(forest);
  const particlesRef  = useRef<Particle[]>([]);
  const charXRef      = useRef<number>(0);
  const charAnimRef   = useRef<CharAnim>('idle');
  const facingRef     = useRef<boolean>(true);
  const swayRef       = useRef<number>(0);
  const phaseStartRef = useRef<number>(0);   // t when phase last changed
  const prevPhaseRef  = useRef<SessionPhase>(phase);
  const prevStageRef  = useRef<TreeStage>(treeStage);
  const notifiedRef   = useRef<Set<SessionPhase>>(new Set());
  const tRef          = useRef<number>(0);   // current animTime (seconds)

  // Keep refs in sync with props every render
  phaseRef.current   = phase;
  stageRef.current   = treeStage;
  speciesRef.current = species;
  forestRef.current  = forest;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    let rafId: number;
    let width = 0, height = 0, dpr = 1;
    let startTs = 0;

    function resize() {
      dpr    = window.devicePixelRatio || 1;
      width  = canvas!.clientWidth;
      height = canvas!.clientHeight;
      canvas!.width  = width  * dpr;
      canvas!.height = height * dpr;
      ctx.scale(dpr, dpr);
      // Initial character position (off-screen left)
      charXRef.current = -40;
    }

    function frame(ts: number) {
      if (startTs === 0) startTs = ts;
      const t = (ts - startTs) * 0.001;
      tRef.current = t;

      const phase = phaseRef.current;

      // ── Detect phase change ───────────────────────────────────────────
      if (phase !== prevPhaseRef.current) {
        phaseStartRef.current = t;
        notifiedRef.current.delete(prevPhaseRef.current);
        prevPhaseRef.current = phase;

        if (phase === SessionPhase.WalkingIn) {
          charXRef.current = -40;
          charAnimRef.current = 'walking';
          facingRef.current = true;
          particlesRef.current = [];
        } else if (phase === SessionPhase.Planting) {
          charAnimRef.current = 'digging';
        } else if (phase === SessionPhase.Growing) {
          charAnimRef.current = 'watering';
          facingRef.current = true;
        } else if (phase === SessionPhase.Complete) {
          charAnimRef.current = 'celebrating';
          particlesRef.current = [
            ...particlesRef.current,
            ...spawnSparkles(width * 0.5, height * 0.72 - 80),
            ...spawnLeaves(width * 0.5, height * 0.72 - 100, '#A8E063'),
          ];
        } else if (phase === SessionPhase.Abandoned) {
          charAnimRef.current = 'crying';
          facingRef.current = false;
          particlesRef.current = [...particlesRef.current, ...spawnDust(width * 0.5, height * 0.72 - 10)];
        } else if (phase === SessionPhase.Idle) {
          charAnimRef.current = 'idle';
          charXRef.current = -40;
          particlesRef.current = [];
        }
      }

      const phaseElapsed = t - phaseStartRef.current;
      const groundY = height * 0.72;

      // ── Per-phase animation logic ─────────────────────────────────────
      switch (phase) {
        case SessionPhase.WalkingIn: {
          const progress = Math.min(phaseElapsed / WALK_IN_DURATION, 1);
          charXRef.current = -40 + (width * 0.68 - (-40)) * (1 - Math.pow(1 - progress, 2));
          if (progress >= 1 && !notifiedRef.current.has(phase)) {
            notifiedRef.current.add(phase);
            charAnimRef.current = 'digging';
            onPhaseAnimationComplete(phase);
          }
          break;
        }
        case SessionPhase.Planting: {
          charXRef.current = width * 0.68;
          const half = PLANTING_DURATION / 2;
          charAnimRef.current = phaseElapsed < half ? 'digging' : 'planting';
          if (phaseElapsed >= PLANTING_DURATION && !notifiedRef.current.has(phase)) {
            notifiedRef.current.add(phase);
            onPhaseAnimationComplete(phase);
          }
          break;
        }
        case SessionPhase.Growing: {
          // Sway the tree
          swayRef.current = Math.sin(t * 0.7) * (2 + stageRef.current * 0.8);

          // Detect stage advances → burst of sparkles
          if (stageRef.current > prevStageRef.current) {
            particlesRef.current = [
              ...particlesRef.current,
              ...spawnSparkles(width * 0.5, groundY - 60),
            ];
          }
          prevStageRef.current = stageRef.current;

          // Alternate character activities
          const cycle = Math.floor(t / 8) % 3;
          charXRef.current = width * (cycle === 1 ? 0.32 : 0.68);
          facingRef.current = cycle !== 1;
          charAnimRef.current = cycle === 0 ? 'watering' : 'tending';
          break;
        }
        case SessionPhase.Complete: {
          charXRef.current = width * 0.68;
          charAnimRef.current = 'celebrating';
          if (phaseElapsed >= END_DURATION && !notifiedRef.current.has(phase)) {
            notifiedRef.current.add(phase);
            onPhaseAnimationComplete(phase);
          }
          break;
        }
        case SessionPhase.Abandoned: {
          charXRef.current = width * 0.68;
          charAnimRef.current = 'crying';
          if (phaseElapsed >= END_DURATION - 1 && !notifiedRef.current.has(phase)) {
            notifiedRef.current.add(phase);
            onPhaseAnimationComplete(phase);
          }
          break;
        }
      }

      // ── Tick particles ────────────────────────────────────────────────
      particlesRef.current = tickParticles(particlesRef.current);

      // ── Draw ──────────────────────────────────────────────────────────
      const scene: SceneState = {
        phase,
        treeStage:   stageRef.current,
        species:     speciesRef.current,
        t,
        charX:       charXRef.current,
        charAnim:    charAnimRef.current,
        facingRight: facingRef.current,
        particles:   particlesRef.current,
        forest:      forestRef.current,
        sway:        swayRef.current,
      };

      drawScene(ctx, width, height, scene);
      rafId = requestAnimationFrame(frame);
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // runs once — all state is read via refs

  return <canvas ref={canvasRef} className={styles.canvas} />;
}
