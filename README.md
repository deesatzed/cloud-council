# Cloud Council

A visual, real-time debate between historical mentors, plus user-set trigger phrases that bring your own principles into the moment you act. Spun out of A Better Me: Council so it can be built and changed separately.

**Status: design documents only. No application code has been written or run.**

## For a novice
You describe a decision. A sky fills with clouds that turn into the faces of historical writers (Marcus Aurelius, Franklin, Nightingale and others). They talk it through and argue with each other. Clouds drift toward the option each one favors, so you can see where the council splits. When a mentor's real, verified words apply, they fall as a quote card with a citation. Everything a mentor says in its own voice is labeled as simulated.

A second part lets you list phrases you often type ("done", "deploy", "sample data"). When one appears, a short note from your own principles is attached. It never blocks you.

## Rules that stay fixed
1. **Your principles are the only authority.** Nothing here blocks, vetoes or scolds. Mentors are lenses.
2. **Quotes are verified; voices are simulated and labeled.** Text in quotation marks is a verbatim quote verified by code against a stored corpus chunk, with its citation, or it is not shown. Mentors may speak in the first person and say how they would think; that voice is generated, always labeled "simulated voice," never in quotation marks and never stored as a quote. (Owner decision, 2026-11-17.)
3. **Mentors died before 1956**, and only writings public domain in the US are used.
4. **Never judge other people**; redirect to what your own ideals ask of you.
5. **Personal data stays on this machine** unless the owner approves a specific destination.

## Layout
- `docs/SPEC.md`: Cloud Council screen (§13) and trigger phrases (§14)
- `docs/PROMPTS.md`: the `MENTOR_VOICE` prompt
- `docs/BUILD_PLAN.md`: milestones M11 (Cloud Council) and M12 (trigger phrases)
- `docs/TEST_PLAN.md`, `docs/QUOTE_VERIFICATION.md`
- `seed/mentor_roster.json`: the 18 candidate mentors
- `PROGRESS.md`: status and open items

## Dependency on Council
Verified quotes need a mentor corpus, and the sky needs the user's approved principles. Both are built by Council (corpus pipeline M6, constitution M5), which is not in this repo. How this repo gets them is an open decision (see PROGRESS.md).
