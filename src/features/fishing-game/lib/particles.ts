export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  decay: number;
  sz: number;
  col: string;
}

export function spawnParticles(
  x: number,
  y: number,
  n: number,
  cols: string[],
  upward: boolean,
  target: Particle[]
): void {
  for (let i = 0; i < n; i++) {
    const a = upward
      ? (Math.random() - 0.5) * Math.PI * 1.2 - Math.PI / 2
      : Math.random() * Math.PI * 2;
    const sp = 1 + Math.random() * 3;
    target.push({
      x,
      y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - (upward ? 2 : 0),
      life: 1,
      decay: 0.025 + Math.random() * 0.03,
      sz: 2 + Math.random() * 3,
      col: cols[Math.floor(Math.random() * cols.length)],
    });
  }
}

export function updateParticles(particles: Particle[], dt: number): Particle[] {
  const step = dt / 16;
  return particles
    .map((p) => ({
      ...p,
      x: p.x + p.vx * step,
      vy: p.vy + 0.1 * step,
      y: p.y + p.vy * step,
      life: p.life - p.decay * step,
    }))
    .filter((p) => p.life > 0);
}
