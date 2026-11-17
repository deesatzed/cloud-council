# Build plan

Extracted from the Council handoff (`docs/BUILD_PLAN.md`, M11 and M12). They assume Council's corpus, constitution and consult pieces exist; see the README, "Dependency on Council."

## M11: Cloud Council (v1.1, after M10)
**Tasks**
- `MENTOR_VOICE` prompt and orchestrator (speaker choice by stance distance, `maxTurns`, convergence stop, budget stop), streamed over SSE like `consult`.
- `/council/cloud`: sides map, rain-drop quote cards, tap-to-ask, forecast, transcript view (see `docs/PRODUCT_SPEC.md` §13).
- `Consult.kind` and per-utterance `simulated` flag in the data model.
- `assets/mentors/CREDITS.md` and abstract-silhouette fallback.

**Acceptance**
- Unit: stance → left/right/middle position; next-speaker choice; a voiced line containing a quotation mark is retried and then shown without quote handling; a fabricated quote in `cites` produces no card.
- e2e (real low-priced model, capped key): a debate streams at least 3 turns; every voiced bubble has `data-simulated="true"` and the label; every `[data-quote]` is verified; the budget stop shows "paused: budget"; reduced-motion shows the transcript.
- Measure and record real cost per debate in `PROGRESS.md` before setting a cost target.

## M12: Trigger phrases (after M10; independent of M11)
**Tasks**
- `/settings/triggers` list, token generation (hashed), `POST /api/council/trigger` (string matching, no model call), token-authenticated consult route, and a small command-line client.

**Acceptance**
- Unit: whole-word and whole-phrase matching, case-insensitivity, cooldown, mute.
- Integration: the passive route makes zero provider calls; a missing or wrong token is rejected; ledger rows hold counts and phrase ids but no raw text; the server refuses non-localhost connections by default.
