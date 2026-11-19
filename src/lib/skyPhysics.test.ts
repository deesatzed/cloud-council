import { describe, expect, it } from "vitest";
import { SPAN, clampStance, springStep, stanceLabel, stanceToX, xToStance } from "./skyPhysics";

describe("stance mapping", () => {
  it("puts a neutral stance in the centre and the extremes SPAN of the width either side", () => {
    expect(stanceToX(0, 1000)).toBe(500);
    expect(stanceToX(-1, 1000)).toBeCloseTo(500 - 1000 * SPAN);
    expect(stanceToX(1, 1000)).toBeCloseTo(500 + 1000 * SPAN);
  });
  it("round-trips x and stance, and clamps beyond the extremes", () => {
    for (const s of [-1, -0.6, 0, 0.3, 1]) expect(xToStance(stanceToX(s, 800), 800)).toBeCloseTo(s);
    expect(xToStance(-5000, 800)).toBe(-1);
    expect(xToStance(9000, 800)).toBe(1);
    expect(clampStance(Number.NaN)).toBe(0);
  });
  it("labels stances with a dead zone around the middle", () => {
    expect(stanceLabel(-0.26)).toBe("leans A");
    expect(stanceLabel(-0.25)).toBe("between");
    expect(stanceLabel(0.25)).toBe("between");
    expect(stanceLabel(0.26)).toBe("leans B");
  });
});

describe("springStep", () => {
  it("settles on the target without NaN within three seconds at 60 fps", () => {
    let s = { pos: 100, vel: 0 };
    for (let i = 0; i < 180; i++) {
      s = springStep(s.pos, s.vel, 700, 1 / 60);
      expect(Number.isFinite(s.pos)).toBe(true);
    }
    expect(Math.abs(s.pos - 700)).toBeLessThan(1);
    expect(Math.abs(s.vel)).toBeLessThan(1);
  });
  it("stays stable when a frame takes far too long", () => {
    const s = springStep(0, 0, 1000, 10);
    expect(Number.isFinite(s.pos)).toBe(true);
    expect(s.pos).toBeLessThan(1000);
  });
});
