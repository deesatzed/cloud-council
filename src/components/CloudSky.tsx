"use client";

// The sky: one cloud per mentor, each drifting toward the option its stance favors, with a faint
// face that "wakes up" when the cloud is active. Purely visual: it draws what it is given.
// No mentor text appears here, only names and years from the roster.

import { useEffect, useRef, useState } from "react";
import { springStep, stanceToX, xToStance } from "@/lib/skyPhysics";

export type SkyMentor = { id: string; name: string; years: string };

type Props = {
  mentors: SkyMentor[];
  /** stance per mentor id, -1 (option A) to +1 (option B); missing = 0 (between) */
  stances: Record<string, number>;
  /** called while the user drags a cloud sideways */
  onStanceChange: (id: string, stance: number) => void;
  /** mentor currently speaking or selected; its face wakes up */
  activeId?: string | null;
};

type Puff = { dx: number; dy: number; r: number; phase: number; speed: number };
type Face = { eyeGap: number; eyeY: number; browTilt: number; mouthCurve: number; noseLen: number };
type CloudState = { id: string; x: number; vx: number; wake: number; puffs: Puff[]; face: Face };

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h >>> 0;
}
function rng(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeCloud(id: string, x: number): CloudState {
  const r = rng(hash(id));
  const puffs: Puff[] = Array.from({ length: 11 }, () => ({
    dx: (r() * 2 - 1) * 1.15,
    dy: (r() * 0.8 - 0.5) * 0.9,
    r: 0.42 + r() * 0.4,
    phase: r() * Math.PI * 2,
    speed: 0.25 + r() * 0.35,
  }));
  const face: Face = {
    eyeGap: 0.3 + r() * 0.14,
    eyeY: -0.14 - r() * 0.08,
    browTilt: (r() - 0.5) * 0.5,
    mouthCurve: (r() - 0.35) * 0.4,
    noseLen: 0.14 + r() * 0.1,
  };
  return { id, x, vx: 0, wake: 0.18, puffs, face };
}

const ROWS_TOP = 0.2;
const ROWS_BOTTOM = 0.66;

export default function CloudSky({ mentors, stances, onStanceChange, activeId = null }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const propsRef = useRef({ mentors, stances, activeId, onStanceChange });
  propsRef.current = { mentors, stances, activeId, onStanceChange };
  const cloudsRef = useRef<Map<string, CloudState>>(new Map());
  const hoverRef = useRef<string | null>(null);
  const dragRef = useRef<string | null>(null);
  const sizeRef = useRef({ w: 800, h: 520 });
  const [reduced, setReduced] = useState(false);
  const reducedRef = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const set = () => {
      setReduced(mq.matches);
      reducedRef.current = mq.matches;
    };
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dark = window.matchMedia("(prefers-color-scheme: dark)");

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      sizeRef.current = { w: rect.width, h: rect.height };
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const rowY = (i: number, n: number) => {
      const { h } = sizeRef.current;
      const f = n <= 1 ? 0.5 : i / (n - 1);
      return h * (ROWS_TOP + f * (ROWS_BOTTOM - ROWS_TOP));
    };

    let raf = 0;
    let last = performance.now();
    const t0 = last;

    const frame = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const t = reducedRef.current ? 0 : (now - t0) / 1000;
      const { w, h } = sizeRef.current;
      const { mentors: ms, stances: st, activeId: act } = propsRef.current;
      const isDark = dark.matches;

      // sync cloud states with the mentor list
      const clouds = cloudsRef.current;
      for (const id of [...clouds.keys()]) if (!ms.some((m) => m.id === id)) clouds.delete(id);
      for (const m of ms) if (!clouds.has(m.id)) clouds.set(m.id, makeCloud(m.id, stanceToX(st[m.id] ?? 0, w)));

      // sky
      const g = ctx.createLinearGradient(0, 0, 0, h);
      if (isDark) { g.addColorStop(0, "#0c1330"); g.addColorStop(0.7, "#2a3764"); g.addColorStop(1, "#4a4f78"); }
      else { g.addColorStop(0, "#7fb2e8"); g.addColorStop(0.7, "#cfe4f7"); g.addColorStop(1, "#f3e9d8"); }
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // centre line: where the council "splits"
      ctx.strokeStyle = isDark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.45)";
      ctx.setLineDash([6, 10]);
      ctx.beginPath();
      ctx.moveTo(w / 2, h * 0.08);
      ctx.lineTo(w / 2, h * 0.84);
      ctx.stroke();
      ctx.setLineDash([]);

      const R = Math.min(w * 0.1, h * 0.105);

      ms.forEach((m, i) => {
        const c = clouds.get(m.id)!;
        const targetX = stanceToX(st[m.id] ?? 0, w);
        if (reducedRef.current) { c.x = targetX; c.vx = 0; }
        else { const s = springStep(c.x, c.vx, targetX, dt); c.x = s.pos; c.vx = s.vel; }
        const awake = act === m.id || hoverRef.current === m.id || dragRef.current === m.id;
        const wakeTarget = awake ? 1 : 0.18;
        c.wake += (wakeTarget - c.wake) * Math.min(1, dt * 4);
        const cy = rowY(i, ms.length) + Math.sin(t * 0.6 + i) * R * 0.05;

        // soft shadow underside, then white puffs
        for (const pass of [0, 1] as const) {
          for (const p of c.puffs) {
            const wob = Math.sin(t * p.speed + p.phase);
            const px = c.x + (p.dx + wob * 0.05) * R;
            const py = cy + (p.dy + Math.cos(t * p.speed + p.phase) * 0.04) * R + (pass === 0 ? R * 0.16 : 0);
            const pr = p.r * R * (1 + wob * 0.04);
            const rg = ctx.createRadialGradient(px, py - pr * 0.15, pr * 0.1, px, py, pr);
            if (pass === 0) {
              rg.addColorStop(0, isDark ? "rgba(70,80,120,0.55)" : "rgba(110,135,170,0.40)");
              rg.addColorStop(1, "rgba(110,135,170,0)");
            } else {
              rg.addColorStop(0, isDark ? "rgba(235,240,255,0.92)" : "rgba(255,255,255,0.96)");
              rg.addColorStop(0.65, isDark ? "rgba(210,220,250,0.55)" : "rgba(255,255,255,0.6)");
              rg.addColorStop(1, "rgba(255,255,255,0)");
            }
            ctx.fillStyle = rg;
            ctx.beginPath();
            ctx.arc(px, py, pr, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // the face, as soft shading inside the cloud
        const f = c.face;
        const a = c.wake;
        const shade = isDark ? `rgba(30,40,80,${0.5 * a})` : `rgba(70,95,135,${0.42 * a})`;
        for (const side of [-1, 1]) {
          const ex = c.x + side * f.eyeGap * R;
          const ey = cy + f.eyeY * R;
          const eg = ctx.createRadialGradient(ex, ey, 0, ex, ey, R * 0.2);
          eg.addColorStop(0, shade);
          eg.addColorStop(1, "rgba(70,95,135,0)");
          ctx.fillStyle = eg;
          ctx.beginPath();
          ctx.ellipse(ex, ey, R * 0.2, R * 0.13 * (1 - 0.5 * (1 - a) * 0), 0, 0, Math.PI * 2);
          ctx.fill();
          // brow
          ctx.strokeStyle = shade;
          ctx.lineWidth = R * 0.05;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(ex - R * 0.14, ey - R * 0.2 + side * f.browTilt * R * 0.1);
          ctx.lineTo(ex + R * 0.14, ey - R * 0.2 - side * f.browTilt * R * 0.1);
          ctx.stroke();
        }
        ctx.strokeStyle = shade;
        ctx.lineWidth = R * 0.045;
        ctx.beginPath(); // nose
        ctx.moveTo(c.x, cy + f.eyeY * R * 0.4);
        ctx.lineTo(c.x + R * 0.03, cy + (f.eyeY * 0.4 + f.noseLen) * R);
        ctx.stroke();
        ctx.beginPath(); // mouth
        const my = cy + R * 0.34;
        ctx.moveTo(c.x - R * 0.2, my);
        ctx.quadraticCurveTo(c.x, my + f.mouthCurve * R, c.x + R * 0.2, my);
        ctx.stroke();

      });

      // names go on last, on a soft pill, so a cloud drawn later never hides an earlier name
      ms.forEach((m, i) => {
        const c = clouds.get(m.id)!;
        const cy = rowY(i, ms.length) + Math.sin(t * 0.6 + i) * R * 0.05;
        const nameSize = Math.max(12, Math.round(R * 0.2));
        const yearSize = Math.max(11, Math.round(R * 0.16));
        ctx.textAlign = "center";
        ctx.font = `600 ${nameSize}px system-ui, sans-serif`;
        const tw = Math.max(ctx.measureText(m.name).width, ctx.measureText(m.years).width);
        const px = 8;
        const top = cy + R * 0.8;
        const hgt = nameSize + yearSize + 12;
        ctx.fillStyle = isDark ? "rgba(12,19,48,0.55)" : "rgba(255,255,255,0.6)";
        ctx.beginPath();
        ctx.roundRect(c.x - tw / 2 - px, top, tw + px * 2, hgt, 8);
        ctx.fill();
        ctx.fillStyle = isDark ? "rgba(255,255,255,0.95)" : "rgba(20,35,60,0.95)";
        ctx.fillText(m.name, c.x, top + nameSize + 2);
        ctx.font = `${yearSize}px system-ui, sans-serif`;
        ctx.fillStyle = isDark ? "rgba(255,255,255,0.7)" : "rgba(20,35,60,0.7)";
        ctx.fillText(m.years, c.x, top + nameSize + yearSize + 5);
      });

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    // pointer: hover wakes a face, dragging sets the stance
    const pos = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const hit = (x: number, y: number): string | null => {
      const { w, h } = sizeRef.current;
      const R = Math.min(w * 0.1, h * 0.105);
      const ms = propsRef.current.mentors;
      let best: string | null = null;
      let bestD = Infinity;
      ms.forEach((m, i) => {
        const c = cloudsRef.current.get(m.id);
        if (!c) return;
        const d = Math.hypot(x - c.x, y - rowY(i, ms.length));
        if (d < R * 1.3 && d < bestD) { best = m.id; bestD = d; }
      });
      return best;
    };
    const down = (e: PointerEvent) => {
      const p = pos(e);
      const id = hit(p.x, p.y);
      if (!id) return;
      dragRef.current = id;
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = "grabbing";
    };
    const move = (e: PointerEvent) => {
      const p = pos(e);
      if (dragRef.current) {
        propsRef.current.onStanceChange(dragRef.current, xToStance(p.x, sizeRef.current.w));
      } else {
        hoverRef.current = hit(p.x, p.y);
        canvas.style.cursor = hoverRef.current ? "grab" : "default";
      }
    };
    const up = (e: PointerEvent) => {
      dragRef.current = null;
      if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
      canvas.style.cursor = "default";
    };
    const leave = () => { hoverRef.current = null; };
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    canvas.addEventListener("pointerleave", leave);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
      canvas.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <div className="sky" ref={wrapRef}>
      <canvas ref={canvasRef} className="sky-canvas" aria-hidden="true" />
      <span className="side side-a">Option A</span>
      <span className="side side-b">Option B</span>
      <div className="horizon">
        <span>Your principles will appear here.</span>
      </div>
      {reduced && <span className="sr-only">Motion is reduced; clouds jump to position.</span>}
    </div>
  );
}
