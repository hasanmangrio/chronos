import { useEffect, useRef } from 'react';
import styles from './NatureBackground.module.css';

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
  speed: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  life: number;
  maxLife: number;
  seed: number;
}

interface Caustic {
  cx: number;
  cy: number;
  radius: number;
  a: number;
  b: number;
  freqA: number;
  freqB: number;
  delta: number;
  speed: number;
}

export function NatureBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    let rafId: number;

    const ripples: Ripple[] = [];
    const particles: Particle[] = [];
    const caustics: Caustic[] = [];

    let width = 0;
    let height = 0;
    let dpr = 1;

    function resize() {
      const el = canvas!;
      dpr = window.devicePixelRatio || 1;
      width = el.clientWidth;
      height = el.clientHeight;
      el.width = width * dpr;
      el.height = height * dpr;
      ctx.scale(dpr, dpr);
    }

    function spawnRipple() {
      ripples.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 0,
        maxRadius: 60 + Math.random() * 160,
        opacity: 1,
        speed: 0.4 + Math.random() * 0.5,
      });
    }

    function spawnParticle() {
      particles.push({
        x: Math.random() * width,
        y: height * 0.4 + Math.random() * height * 0.6,
        vx: 0,
        vy: -(0.08 + Math.random() * 0.17),
        radius: 0.8 + Math.random() * 2.2,
        opacity: 0,
        life: 0,
        maxLife: 3000 + Math.random() * 5000,
        seed: Math.random() * 1000,
      });
    }

    function initCaustics() {
      for (let i = 0; i < 4; i++) {
        caustics.push({
          cx: width * (0.15 + Math.random() * 0.7),
          cy: height * (0.15 + Math.random() * 0.7),
          radius: 120 + Math.random() * 200,
          a: 80 + Math.random() * 120,
          b: 60 + Math.random() * 100,
          freqA: 0.2 + Math.random() * 0.4,
          freqB: 0.15 + Math.random() * 0.35,
          delta: Math.random() * Math.PI * 2,
          speed: 0.0002 + Math.random() * 0.0003,
        });
      }
    }

    // Seed initial state
    for (let i = 0; i < 60; i++) spawnParticle();
    spawnRipple();
    initCaustics();

    let nextRippleAt = Date.now() + 1200 + Math.random() * 1800;
    let lastParticleAt = 0;

    function frame(timestamp: number) {
      const t = timestamp * 0.001;
      const now = Date.now();

      // Gradient background
      const hueShift = (Math.sin(t * 0.025) + 1) / 2; // 0..1
      const midR = Math.round(13 + hueShift * 5);
      const midG = Math.round(33 + hueShift * 12);
      const midB = Math.round(55 - hueShift * 20);

      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#0a1628');
      grad.addColorStop(0.55, `rgb(${midR},${midG},${midB})`);
      grad.addColorStop(1, '#071420');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Caustic blobs
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      for (const c of caustics) {
        const x = c.cx + c.a * Math.sin(c.freqA * t + c.delta);
        const y = c.cy + c.b * Math.sin(c.freqB * t);
        const rg = ctx.createRadialGradient(x, y, 0, x, y, c.radius);
        rg.addColorStop(0, 'rgba(78,204,163,0.045)');
        rg.addColorStop(1, 'rgba(78,204,163,0)');
        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.arc(x, y, c.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Ripples
      if (now >= nextRippleAt) {
        spawnRipple();
        nextRippleAt = now + 1200 + Math.random() * 1800;
      }
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += r.speed;
        r.opacity = 1 - r.radius / r.maxRadius;
        if (r.opacity <= 0) {
          ripples.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(78,204,163,${r.opacity * 0.22})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Particles
      if (now - lastParticleAt > 400) {
        spawnParticle();
        lastParticleAt = now;
      }
      const frameDeltaMs = 16; // ~60fps assumption for life tracking
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life += frameDeltaMs;
        const progress = p.life / p.maxLife;
        if (progress >= 1) {
          particles.splice(i, 1);
          continue;
        }
        // Fade in 10%, hold, fade out last 20%
        if (progress < 0.1) p.opacity = progress / 0.1;
        else if (progress > 0.8) p.opacity = (1 - progress) / 0.2;
        else p.opacity = 1;

        p.x += p.vx + Math.sin(t * 0.8 + p.seed) * 0.12;
        p.y += p.vy;

        const alpha = p.opacity * (i % 3 === 0 ? 0.5 : 0.35);
        const color = i % 5 === 0
          ? `rgba(160,210,200,${alpha})`
          : `rgba(78,204,163,${alpha})`;

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
