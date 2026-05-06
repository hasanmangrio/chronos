import { SessionPhase, type TreeStage, type TreeSpecies } from '../../types';
import type { ForestState } from '../../types';
import { drawTree } from './drawTree';
import { drawCharacter, type CharAnim } from './drawCharacter';
import type { Particle } from './animationHelpers';
import { drawParticles } from './animationHelpers';

export interface SceneState {
  phase: SessionPhase;
  treeStage: TreeStage;
  species: TreeSpecies;
  t: number;             // seconds of animation time
  charX: number;
  charAnim: CharAnim;
  facingRight: boolean;
  particles: Particle[];
  forest: ForestState;
  sway: number;          // tree canopy sway (pixels)
}

export function drawScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  s: SceneState,
) {
  const groundY = h * 0.72;

  // ── Layer 0: Night sky ────────────────────────────────────────────────────
  const sky = ctx.createLinearGradient(0, 0, 0, groundY);
  sky.addColorStop(0,   '#0A1520');
  sky.addColorStop(0.5, '#0F2318');
  sky.addColorStop(1,   '#1A3A10');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, groundY);

  // ── Layer 1: Stars ────────────────────────────────────────────────────────
  // Use seeded positions so they don't flicker (derived from canvas dimensions)
  const starSeed = Math.round(w * 0.01) * 100 + Math.round(h * 0.01);
  let sr = starSeed;
  const rnd = () => { sr = (sr * 1664525 + 1013904223) & 0xffffffff; return (sr >>> 0) / 0xffffffff; };
  for (let i = 0; i < 80; i++) {
    const sx = rnd() * w;
    const sy = rnd() * groundY * 0.75;
    const alpha = 0.25 + rnd() * 0.65;
    const pulse = alpha * (0.7 + 0.3 * Math.sin(s.t * (0.5 + rnd() * 1.5) + rnd() * 6.28));
    ctx.fillStyle = `rgba(255,255,220,${pulse})`;
    ctx.beginPath();
    ctx.arc(sx, sy, 0.5 + rnd() * 1, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Layer 2: Moon ─────────────────────────────────────────────────────────
  const mx = w * 0.82, my = h * 0.12, mr = 24;
  const moonGlow = ctx.createRadialGradient(mx, my, 0, mx, my, mr * 2.5);
  moonGlow.addColorStop(0, 'rgba(245,230,200,0.18)');
  moonGlow.addColorStop(1, 'rgba(245,230,200,0)');
  ctx.fillStyle = moonGlow;
  ctx.beginPath();
  ctx.arc(mx, my, mr * 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#F5E6C8';
  ctx.beginPath();
  ctx.arc(mx, my, mr, 0, Math.PI * 2);
  ctx.fill();

  // ── Layer 3: Background forest silhouettes (forestLayer === 0) ────────────
  ctx.globalAlpha = 0.55;
  for (const tree of s.forest.trees.filter(t => t.forestLayer === 0)) {
    drawTree(ctx, tree.forestX * w, groundY, 7, tree.species, SessionPhase.Idle, 0, 0.32, 'rgba(8,18,5,1)');
  }
  ctx.globalAlpha = 1;

  // ── Layer 4: Distant hills ────────────────────────────────────────────────
  ctx.fillStyle = '#122810';
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.bezierCurveTo(w * 0.15, groundY - 70, w * 0.42, groundY - 95, w * 0.62, groundY);
  ctx.lineTo(0, groundY);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#0E1E0C';
  ctx.beginPath();
  ctx.moveTo(w * 0.38, groundY);
  ctx.bezierCurveTo(w * 0.55, groundY - 60, w * 0.78, groundY - 88, w, groundY);
  ctx.lineTo(w * 0.38, groundY);
  ctx.closePath();
  ctx.fill();

  // ── Layer 5: Ground ───────────────────────────────────────────────────────
  const groundGrad = ctx.createLinearGradient(0, groundY, 0, h);
  groundGrad.addColorStop(0,   '#243B12');
  groundGrad.addColorStop(0.3, '#1C2E0E');
  groundGrad.addColorStop(1,   '#111A08');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, groundY, w, h - groundY);

  // Grass edge
  ctx.strokeStyle = '#3A5C1A';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(w, groundY);
  ctx.stroke();

  // ── Layer 6: Midground trees (forestLayer === 1) ──────────────────────────
  ctx.globalAlpha = 0.7;
  for (const tree of s.forest.trees.filter(t => t.forestLayer === 1)) {
    drawTree(ctx, tree.forestX * w, groundY, 6, tree.species, SessionPhase.Idle, 0, 0.52, 'rgba(10,22,6,1)');
  }
  ctx.globalAlpha = 1;

  // ── Layer 7: Fireflies ────────────────────────────────────────────────────
  sr = starSeed + 99;
  for (let i = 0; i < 16; i++) {
    const fx = rnd() * w;
    const fy = groundY * 0.4 + rnd() * groundY * 0.55;
    const phase = rnd() * Math.PI * 2;
    const glow = 0.4 * Math.abs(Math.sin(s.t * (0.8 + rnd()) + phase));
    if (glow < 0.05) continue;
    ctx.fillStyle = `rgba(120,230,90,${glow})`;
    ctx.beginPath();
    ctx.arc(fx + Math.sin(s.t * 0.4 + phase) * 6, fy + Math.cos(s.t * 0.3 + phase) * 4, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Layer 8: Active tree ──────────────────────────────────────────────────
  if (s.phase !== SessionPhase.Idle) {
    drawTree(ctx, w * 0.5, groundY, s.treeStage, s.species, s.phase, s.sway);
  }

  // ── Layer 9: Character ────────────────────────────────────────────────────
  if (s.phase !== SessionPhase.Idle) {
    drawCharacter(ctx, s.charX, groundY, s.charAnim, s.t, s.facingRight);
  }

  // ── Layer 10: Particles ───────────────────────────────────────────────────
  drawParticles(ctx, s.particles);

  // ── Layer 11: Foreground trees (forestLayer === 2) ────────────────────────
  ctx.globalAlpha = 0.85;
  for (const tree of s.forest.trees.filter(t => t.forestLayer === 2)) {
    drawTree(ctx, tree.forestX * w, groundY, 5, tree.species, SessionPhase.Idle, 0, 0.68, 'rgba(5,12,3,1)');
  }
  ctx.globalAlpha = 1;

  // ── Layer 12: Vignette ────────────────────────────────────────────────────
  const vig = ctx.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, h * 0.85);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.45)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);
}
