// Pure helpers for the sky scene: where a mentor cloud sits for a given stance, and how it moves there.
// stance runs from -1 (option A, left) through 0 (between) to +1 (option B, right).

/** Fraction of the scene width a cloud travels from the centre when |stance| = 1. */
export const SPAN = 0.36;

export type StanceLabel = "leans A" | "between" | "leans B";

export function clampStance(s: number): number {
  if (Number.isNaN(s)) return 0;
  return Math.max(-1, Math.min(1, s));
}

export function stanceToX(stance: number, width: number): number {
  return width / 2 + clampStance(stance) * width * SPAN;
}

export function xToStance(x: number, width: number): number {
  return clampStance((x - width / 2) / (width * SPAN));
}

export function stanceLabel(stance: number): StanceLabel {
  if (stance < -0.25) return "leans A";
  if (stance > 0.25) return "leans B";
  return "between";
}

/** One step of a slightly underdamped spring, so clouds ease in with a soft overshoot. */
export function springStep(pos: number, vel: number, target: number, dt: number, stiffness = 18, damping = 7) {
  const h = Math.min(Math.max(dt, 0), 0.05);
  const accel = stiffness * (target - pos) - damping * vel;
  const v = vel + accel * h;
  return { pos: pos + v * h, vel: v };
}
