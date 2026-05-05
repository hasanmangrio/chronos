export function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function rotateAround(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  angle: number,
  draw: () => void,
) {
  ctx.save();
  ctx.translate(px, py);
  ctx.rotate(angle);
  ctx.translate(-px, -py);
  draw();
  ctx.restore();
}

// ── Particle system ────────────────────────────────────────────────────────

export interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  life: number;   // 0→1 remaining life
  decay: number;  // fraction per frame (~0.008–0.02)
  r: number;
  color: string;
}

export function tickParticles(ps: Particle[]): Particle[] {
  const out: Particle[] = [];
  for (const p of ps) {
    p.life -= p.decay;
    if (p.life <= 0) continue;
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.06; // gravity
    out.push(p);
  }
  return out;
}

export function drawParticles(ctx: CanvasRenderingContext2D, ps: Particle[]) {
  for (const p of ps) {
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export function spawnSparkles(x: number, y: number, n = 14): Particle[] {
  const out: Particle[] = [];
  for (let i = 0; i < n; i++) {
    const angle = (Math.PI * 2 * i) / n + Math.random() * 0.4;
    const speed = 1.5 + Math.random() * 3;
    const colors = ['#FFD700', '#FF6B35', '#FFFFFF', '#F7C948', '#A8E063'];
    out.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      life: 1,
      decay: 0.012 + Math.random() * 0.01,
      r: 2 + Math.random() * 3,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }
  return out;
}

export function spawnLeaves(x: number, y: number, color: string, n = 10): Particle[] {
  const out: Particle[] = [];
  for (let i = 0; i < n; i++) {
    out.push({
      x: x + (Math.random() - 0.5) * 60,
      y: y + (Math.random() - 0.5) * 40,
      vx: (Math.random() - 0.5) * 1.5,
      vy: -(0.5 + Math.random() * 1.5),
      life: 1,
      decay: 0.008 + Math.random() * 0.006,
      r: 3 + Math.random() * 3,
      color,
    });
  }
  return out;
}

export function spawnDust(x: number, y: number, n = 12): Particle[] {
  const out: Particle[] = [];
  for (let i = 0; i < n; i++) {
    out.push({
      x: x + (Math.random() - 0.5) * 30,
      y,
      vx: (Math.random() - 0.5) * 2,
      vy: -(0.2 + Math.random() * 1),
      life: 0.8,
      decay: 0.01 + Math.random() * 0.008,
      r: 2 + Math.random() * 3,
      color: '#8B6C42',
    });
  }
  return out;
}
