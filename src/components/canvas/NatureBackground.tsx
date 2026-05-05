import { useEffect, useRef } from 'react';
import styles from './NatureBackground.module.css';

interface Orb {
  cx: number;
  cy: number;
  radius: number;
  r: number; g: number; b: number;
  // Lissajous drift params
  ax: number; ay: number;
  fx: number; fy: number;
  phaseX: number; phaseY: number;
  // Breathe
  breatheSpeed: number;
  breathePhase: number;
}

interface Speck {
  x: number; y: number;
  vx: number; vy: number;
  radius: number;
  opacity: number;
  life: number; maxLife: number;
  seed: number;
}

export function NatureBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    let rafId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Headspace-style warm orb palette
    const orbDefs = [
      { r: 255, g: 107, b: 53,  baseRadius: 0.55, ax: 0.12, ay: 0.08, fx: 0.08, fy: 0.06 },  // orange
      { r: 247, g: 201, b: 72,  baseRadius: 0.40, ax: 0.10, ay: 0.13, fx: 0.05, fy: 0.09 },  // yellow
      { r: 220, g: 100, b: 190, baseRadius: 0.45, ax: 0.14, ay: 0.09, fx: 0.07, fy: 0.11 },  // pink/coral
      { r: 100, g: 84,  b: 220, baseRadius: 0.50, ax: 0.09, ay: 0.14, fx: 0.10, fy: 0.07 },  // indigo
      { r: 255, g: 140, b: 80,  baseRadius: 0.35, ax: 0.13, ay: 0.10, fx: 0.09, fy: 0.08 },  // peach
    ];

    const orbs: Orb[] = [];
    const specks: Speck[] = [];

    function initOrbs() {
      orbs.length = 0;
      orbDefs.forEach((def, i) => {
        orbs.push({
          cx: width * (0.2 + (i / (orbDefs.length - 1)) * 0.6),
          cy: height * (0.2 + Math.random() * 0.6),
          radius: Math.min(width, height) * def.baseRadius,
          r: def.r, g: def.g, b: def.b,
          ax: width * def.ax,
          ay: height * def.ay,
          fx: def.fx,
          fy: def.fy,
          phaseX: Math.random() * Math.PI * 2,
          phaseY: Math.random() * Math.PI * 2,
          breatheSpeed: 0.25 + Math.random() * 0.2,
          breathePhase: Math.random() * Math.PI * 2,
        });
      });
    }

    function spawnSpeck() {
      specks.push({
        x: Math.random() * width,
        y: height * 0.3 + Math.random() * height * 0.7,
        vx: (Math.random() - 0.5) * 0.15,
        vy: -(0.05 + Math.random() * 0.12),
        radius: 0.6 + Math.random() * 1.8,
        opacity: 0,
        life: 0,
        maxLife: 4000 + Math.random() * 6000,
        seed: Math.random() * 1000,
      });
    }

    function resize() {
      dpr = window.devicePixelRatio || 1;
      width = canvas!.clientWidth;
      height = canvas!.clientHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      ctx.scale(dpr, dpr);
      initOrbs();
    }

    for (let i = 0; i < 50; i++) spawnSpeck();
    let lastSpeckAt = 0;

    function frame(timestamp: number) {
      const t = timestamp * 0.001;
      const now = Date.now();

      // Deep warm-purple gradient base
      const bg = ctx.createLinearGradient(0, 0, width * 0.6, height);
      bg.addColorStop(0, '#160D35');
      bg.addColorStop(0.5, '#1E1045');
      bg.addColorStop(1, '#120A28');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      // Draw orbs with screen blend for luminous overlap
      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      for (const orb of orbs) {
        const breathe = 1 + 0.06 * Math.sin(t * orb.breatheSpeed + orb.breathePhase);
        const x = orb.cx + orb.ax * Math.sin(orb.fx * t + orb.phaseX);
        const y = orb.cy + orb.ay * Math.sin(orb.fy * t + orb.phaseY);
        const r = orb.radius * breathe;

        const rg = ctx.createRadialGradient(x, y, 0, x, y, r);
        rg.addColorStop(0,   `rgba(${orb.r},${orb.g},${orb.b},0.22)`);
        rg.addColorStop(0.4, `rgba(${orb.r},${orb.g},${orb.b},0.10)`);
        rg.addColorStop(1,   `rgba(${orb.r},${orb.g},${orb.b},0)`);

        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      // Tiny warm specks drifting upward (firefly-like)
      if (now - lastSpeckAt > 500) {
        spawnSpeck();
        lastSpeckAt = now;
      }
      const dt = 16;
      for (let i = specks.length - 1; i >= 0; i--) {
        const p = specks[i];
        p.life += dt;
        const progress = p.life / p.maxLife;
        if (progress >= 1) { specks.splice(i, 1); continue; }

        if (progress < 0.12) p.opacity = progress / 0.12;
        else if (progress > 0.75) p.opacity = (1 - progress) / 0.25;
        else p.opacity = 1;

        p.x += p.vx + Math.sin(t * 0.5 + p.seed) * 0.08;
        p.y += p.vy;

        const alpha = p.opacity * 0.55;
        // Alternate between warm orange and soft gold specks
        const color = i % 3 === 0
          ? `rgba(247,201,72,${alpha})`
          : `rgba(255,140,80,${alpha})`;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      }

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
  }, []);

  return <canvas ref={canvasRef} className={styles.canvas} />;
}
