import type { ForestState } from '../../types';
import styles from './ForestStats.module.css';
import { drawMiniTree } from '../canvas/drawTree';
import { useRef, useEffect } from 'react';
import { SPECIES } from '../../types';

function formatFocusTime(ms: number): string {
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function forestFlavor(n: number): string {
  if (n === 0)  return 'Your forest awaits';
  if (n < 3)    return 'First seeds planted';
  if (n < 8)    return 'Saplings sprouting';
  if (n < 15)   return 'A grove is forming';
  if (n < 30)   return 'The forest grows';
  if (n < 60)   return 'A dense woodland';
  return 'Ancient forest 🏆';
}

interface Props {
  forest: ForestState;
}

export function ForestStats({ forest }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width  = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const trees = forest.trees.slice(-20); // show last 20
    if (trees.length === 0) return;
    const spacing = Math.min(32, w / trees.length);
    const startX  = (w - spacing * (trees.length - 1)) / 2;
    trees.forEach((tree, i) => {
      const species = tree.species ?? SPECIES[i % SPECIES.length];
      drawMiniTree(ctx, startX + i * spacing, h - 4, species, 24);
    });
  }, [forest.trees]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statNum}>{forest.sessionsCompleted}</span>
          <span className={styles.statLabel}>trees grown</span>
        </div>
        <div className={styles.divider} />
        <div className={styles.stat}>
          <span className={styles.statNum}>{formatFocusTime(forest.totalFocusMs)}</span>
          <span className={styles.statLabel}>focused</span>
        </div>
      </div>
      <p className={styles.flavor}>{forestFlavor(forest.sessionsCompleted)}</p>
      {forest.trees.length > 0 && (
        <canvas ref={canvasRef} className={styles.miniForest} />
      )}
    </div>
  );
}
