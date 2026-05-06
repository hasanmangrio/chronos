export function pad(n: number): string {
  return String(Math.floor(n)).padStart(2, '0');
}

export function formatCountdown(ms: number): { h: string; m: string; s: string } {
  const total = Math.max(0, ms);
  const h = Math.floor(total / 3_600_000);
  const m = Math.floor((total % 3_600_000) / 60_000);
  const s = Math.floor((total % 60_000) / 1_000);
  return { h: pad(h), m: pad(m), s: pad(s) };
}

export function formatStopwatch(ms: number): { m: string; s: string; cs: string } {
  const m = Math.floor(ms / 60_000);
  const s = Math.floor((ms % 60_000) / 1_000);
  const cs = Math.floor((ms % 1_000) / 10);
  return { m: pad(m), s: pad(s), cs: pad(cs) };
}
