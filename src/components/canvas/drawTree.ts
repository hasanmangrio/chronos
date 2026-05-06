import type { TreeStage, TreeSpecies } from '../../types';
import { SessionPhase } from '../../types';

// Canopy colour table per species
const CANOPY: Record<TreeSpecies, { main: string; dark: string; light: string; accent?: string }> = {
  oak:    { main: '#3D8C40', dark: '#1F5C22', light: '#5EAF62', accent: '#A8E063' },
  pine:   { main: '#2A6B3A', dark: '#163D22', light: '#3D9454', accent: '#60B872' },
  cherry: { main: '#D4547A', dark: '#9C2B50', light: '#F0A0BA', accent: '#F9D0E0' },
  maple:  { main: '#D4882A', dark: '#A05A10', light: '#F0B050', accent: '#FFD580' },
};

const TRUNK_LIGHT = '#6B3A1F';
const TRUNK_DARK  = '#3D2010';
const DIRT        = '#4A3018';

function drawTrunk(
  ctx: CanvasRenderingContext2D,
  x: number, groundY: number,
  trunkH: number, baseW: number, topW: number,
  withered = false,
) {
  ctx.fillStyle = withered ? '#3A2510' : TRUNK_LIGHT;
  ctx.beginPath();
  ctx.moveTo(x - baseW / 2, groundY);
  ctx.lineTo(x - topW / 2,  groundY - trunkH);
  ctx.lineTo(x + topW / 2,  groundY - trunkH);
  ctx.lineTo(x + baseW / 2, groundY);
  ctx.closePath();
  ctx.fill();

  // Right-side shadow strip
  ctx.fillStyle = withered ? '#2A1A08' : TRUNK_DARK;
  ctx.beginPath();
  ctx.moveTo(x + topW / 2 * 0.4,  groundY - trunkH);
  ctx.lineTo(x + topW / 2,         groundY - trunkH);
  ctx.lineTo(x + baseW / 2,        groundY);
  ctx.lineTo(x + baseW / 2 * 0.5,  groundY);
  ctx.closePath();
  ctx.fill();
}

function circle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

export function drawTree(
  ctx: CanvasRenderingContext2D,
  x: number,
  groundY: number,
  stage: TreeStage,
  species: TreeSpecies,
  phase: SessionPhase,
  sway = 0,          // horizontal sway offset for canopy (pixels)
  scale = 1,         // uniform scale
  silhouetteColor?: string,  // if set, everything is this flat colour
) {
  ctx.save();
  ctx.translate(x, groundY);
  ctx.scale(scale, scale);
  const gY = 0; // local ground

  const withered = phase === SessionPhase.Abandoned;
  const c = CANOPY[species];
  const canopyMain  = silhouetteColor ?? (withered ? '#5A4020' : c.main);
  const canopyDark  = silhouetteColor ?? (withered ? '#3A2C10' : c.dark);
  const canopyLight = silhouetteColor ?? (withered ? '#7A5830' : c.light);

  if (stage === 0) {
    // Dirt mound only
    ctx.fillStyle = silhouetteColor ?? DIRT;
    ctx.beginPath();
    ctx.ellipse(0, gY - 2, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  if (stage === 1) {
    ctx.fillStyle = silhouetteColor ?? DIRT;
    ctx.beginPath();
    ctx.ellipse(0, gY - 2, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = silhouetteColor ?? '#4A3018';
    ctx.fillRect(-1, gY - 14, 2, 12);
    ctx.fillStyle = canopyMain;
    circle(ctx, 0, gY - 17, 5);
    ctx.restore();
    return;
  }

  if (stage === 2) {
    ctx.fillStyle = silhouetteColor ?? TRUNK_LIGHT;
    ctx.fillRect(-2, gY - 22, 4, 22);
    ctx.fillStyle = canopyMain;
    circle(ctx, 0,  gY - 26, 8);
    circle(ctx, -5, gY - 23, 5);
    circle(ctx, 5,  gY - 23, 5);
    ctx.restore();
    return;
  }

  // Stage 3+: use tapered trunk + growing canopy
  const configs: { trunkH: number; baseW: number; topW: number; canopyY: number; r: number[] }[] = [
    //  3
    { trunkH: 38,  baseW: 7,  topW: 4,  canopyY: -52,  r: [20, 14, 14] },
    //  4
    { trunkH: 55,  baseW: 9,  topW: 5,  canopyY: -70,  r: [26, 18, 18] },
    //  5
    { trunkH: 73,  baseW: 11, topW: 6,  canopyY: -92,  r: [33, 23, 22, 20] },
    //  6
    { trunkH: 90,  baseW: 13, topW: 7,  canopyY: -112, r: [40, 27, 26, 24] },
    //  7
    { trunkH: 108, baseW: 15, topW: 8,  canopyY: -133, r: [47, 32, 30, 28, 26] },
    //  8
    { trunkH: 125, baseW: 17, topW: 9,  canopyY: -153, r: [53, 36, 34, 32, 30] },
    //  9
    { trunkH: 143, baseW: 19, topW: 10, canopyY: -172, r: [60, 40, 38, 35, 33, 30] },
    // 10
    { trunkH: 160, baseW: 22, topW: 12, canopyY: -192, r: [68, 46, 44, 40, 38, 35, 32] },
  ];

  const cfg = configs[stage - 3];
  drawTrunk(ctx, 0, gY, cfg.trunkH, cfg.baseW, cfg.topW, withered);

  // Draw canopy clusters
  const offsets = [
    [0, 0],
    [-cfg.r[0] * 0.6, cfg.r[0] * 0.35],
    [cfg.r[0] * 0.58, cfg.r[0] * 0.32],
    [-cfg.r[0] * 0.3, cfg.r[0] * 0.55],
    [cfg.r[0] * 0.28, cfg.r[0] * 0.52],
    [-cfg.r[0] * 0.55, cfg.r[0] * 0.12],
    [cfg.r[0] * 0.52, cfg.r[0] * 0.08],
  ];

  // Shadow pass
  ctx.fillStyle = canopyDark;
  for (let i = 1; i < cfg.r.length; i++) {
    const [ox, oy] = offsets[i];
    circle(ctx, ox + sway * 0.7, cfg.canopyY + oy, cfg.r[i]);
  }

  // Main pass
  ctx.fillStyle = canopyMain;
  circle(ctx, sway, cfg.canopyY, cfg.r[0]);
  for (let i = 1; i < Math.min(cfg.r.length, 5); i++) {
    const [ox, oy] = offsets[i];
    circle(ctx, ox + sway * 0.6, cfg.canopyY + oy, cfg.r[i] * 0.9);
  }

  // Light highlight
  ctx.fillStyle = canopyLight;
  circle(ctx, sway - cfg.r[0] * 0.22, cfg.canopyY - cfg.r[0] * 0.22, cfg.r[0] * 0.42);

  // Pine: add triangular overlay for pointed silhouette
  if (species === 'pine' && stage >= 4 && !silhouetteColor) {
    ctx.fillStyle = c.dark;
    ctx.beginPath();
    ctx.moveTo(sway, cfg.canopyY - cfg.r[0] - 8);
    ctx.lineTo(sway - cfg.r[0] * 0.55, cfg.canopyY + cfg.r[0] * 0.3);
    ctx.lineTo(sway + cfg.r[0] * 0.55, cfg.canopyY + cfg.r[0] * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = c.main;
    ctx.beginPath();
    ctx.moveTo(sway, cfg.canopyY - cfg.r[0] - 4);
    ctx.lineTo(sway - cfg.r[0] * 0.4, cfg.canopyY + cfg.r[0] * 0.2);
    ctx.lineTo(sway + cfg.r[0] * 0.4, cfg.canopyY + cfg.r[0] * 0.2);
    ctx.closePath();
    ctx.fill();
  }

  // Cherry: blossom clusters on stage 8+
  if (species === 'cherry' && stage >= 8 && !silhouetteColor) {
    ctx.fillStyle = c.accent ?? '#F9D0E0';
    for (let i = 0; i < 18; i++) {
      const angle = (Math.PI * 2 * i) / 18 + 0.3;
      const dist = cfg.r[0] * (0.3 + Math.random() * 0.6);
      circle(ctx, sway + Math.cos(angle) * dist, cfg.canopyY + Math.sin(angle) * dist * 0.7, 4);
    }
  }

  // Maple: accent-coloured leaf patches on stage 7+
  if (species === 'maple' && stage >= 7 && !silhouetteColor) {
    ctx.fillStyle = c.accent ?? '#FFD580';
    for (let i = 0; i < 10; i++) {
      const angle = (Math.PI * 2 * i) / 10;
      const dist = cfg.r[0] * 0.55;
      circle(ctx, sway + Math.cos(angle) * dist, cfg.canopyY + Math.sin(angle) * dist * 0.8, 5);
    }
  }

  // Fruit dots for oak stage 9+
  if (species === 'oak' && stage >= 9 && !silhouetteColor) {
    ctx.fillStyle = '#C0392B';
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8 + 1;
      const dist = cfg.r[0] * 0.6;
      circle(ctx, sway + Math.cos(angle) * dist, cfg.canopyY + Math.sin(angle) * dist * 0.75, 4);
    }
  }

  // Stage 10: ambient glow ring
  if (stage === 10 && !withered && !silhouetteColor) {
    const rg = ctx.createRadialGradient(sway, cfg.canopyY, cfg.r[0] * 0.8, sway, cfg.canopyY, cfg.r[0] * 1.5);
    rg.addColorStop(0, `${canopyMain}22`);
    rg.addColorStop(1, `${canopyMain}00`);
    ctx.fillStyle = rg;
    circle(ctx, sway, cfg.canopyY, cfg.r[0] * 1.5);
  }

  ctx.restore();
}

// Tiny version for forest stats panel
export function drawMiniTree(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  species: TreeSpecies,
  size = 28,
) {
  const c = CANOPY[species];
  ctx.save();
  ctx.fillStyle = TRUNK_LIGHT;
  const tw = size * 0.14;
  const th = size * 0.45;
  ctx.fillRect(x - tw / 2, y - th, tw, th);
  ctx.fillStyle = c.dark;
  circle(ctx, x, y - th - size * 0.32, size * 0.38);
  ctx.fillStyle = c.main;
  circle(ctx, x, y - th - size * 0.36, size * 0.33);
  ctx.fillStyle = c.light;
  circle(ctx, x - size * 0.08, y - th - size * 0.44, size * 0.18);
  ctx.restore();
}
