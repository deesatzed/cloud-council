"use client";

// Holds the stances while the sky is being built. Stances here come only from the user dragging a
// cloud or choosing a radio button, never from made-up data. In the real debate they come from
// each mentor's turn (docs/SPEC.md §13).

import { useState } from "react";
import CloudSky, { type SkyMentor } from "./CloudSky";
import { clampStance, stanceLabel } from "@/lib/skyPhysics";

export default function SkyPlayground({ mentors }: { mentors: SkyMentor[] }) {
  const [stances, setStances] = useState<Record<string, number>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const set = (id: string, s: number) => setStances((prev) => ({ ...prev, [id]: clampStance(s) }));

  return (
    <>
      <CloudSky mentors={mentors} stances={stances} onStanceChange={set} activeId={activeId} />
      <p className="hint">
        Drag a cloud left or right to try the sides map. In the real debate each mentor&rsquo;s clouds will
        move by themselves as they speak.
      </p>
      <ul className="mentor-list" aria-label="Mentor positions">
        {mentors.map((m) => {
          const label = stanceLabel(stances[m.id] ?? 0);
          return (
            <li key={m.id} onMouseEnter={() => setActiveId(m.id)} onMouseLeave={() => setActiveId(null)}>
              <span className="mentor-name">
                {m.name} <span className="mentor-years">{m.years}</span>
              </span>
              <fieldset className="stance">
                <legend className="sr-only">Position of {m.name}</legend>
                {([["leans A", -0.7], ["between", 0], ["leans B", 0.7]] as const).map(([name, value]) => (
                  <label key={name}>
                    <input
                      type="radio"
                      name={`stance-${m.id}`}
                      checked={label === name}
                      onChange={() => set(m.id, value)}
                      onFocus={() => setActiveId(m.id)}
                      onBlur={() => setActiveId(null)}
                    />
                    {name === "leans A" ? "Option A" : name === "leans B" ? "Option B" : "Between"}
                  </label>
                ))}
              </fieldset>
            </li>
          );
        })}
      </ul>
    </>
  );
}
