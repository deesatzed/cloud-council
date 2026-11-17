# Cloud Council and trigger phrases: product spec

Extracted from the Council handoff (`docs/PRODUCT_SPEC.md` §13 and §14, commit 209f3bb). Section numbers are kept so references still match.

### 13. `/council/cloud` — Cloud Council (v1.1, first build)
Entry: a "Hear the council argue" button on `/consult/[id]` and on `/council`. Input is the situation (with optional options A/B). The crisis gate and scope gate run on it as everywhere, and nothing here blocks.

The scene is a sky. Each council mentor is a cloud that morphs into a face as it "wakes up." The user's approved principles are the horizon band at the bottom, each with its status chip.

**First build (three features):**
1. **Sides map.** Option A is on the left, option B on the right. Each mentor cloud drifts toward the option it favors (the `stance` returned with each voiced turn; `between` sits in the middle, `none` drifts back). The fault line label (`FAULT_LINE_LABEL`) shows once clouds have split. The user sees where the council divides and which cloud sits with them.
2. **Rain-drop quotes.** A verified verbatim quote falls from its cloud as a solid card with its citation (`data-quote`, `data-verified="true"`). Voiced speech is a soft speech bubble with a visible "simulated voice" label (`data-simulated="true"`). The two never look alike.
3. **Tap-to-ask.** Tapping a mentor offers "Why?", "What would you do in my place?" and a free-text question. Each choice triggers one more voiced turn from that mentor.

**Debate mechanics:**
- The orchestrator picks the next speaker as the mentor whose stance differs most from the last speaker's. Each turn is one `MENTOR_VOICE` call (`docs/LLM_PROMPTS.md`). Mentors may address each other by name.
- A debate ends at convergence (stances close together), at `maxTurns` (default 8), when the user stops it, or when the budget cap is reached ("paused: budget").
- It ends with a forecast: `NEXT_STEP` plus the fault line. If the sides converged, the sky clears. If not, a "storm" marker shows the unresolved split.
- Saved as a `Consult` with `kind = 'cloud'`. Every utterance is stored with `simulated = true`. A quote card is stored only after `verifyQuote` passes.
- Every turn writes a ledger event (cost, model, no raw personal text).

**Visual and access:**
- Canvas or WebGL clouds. `prefers-reduced-motion` or a toggle switches to a plain transcript view, which is also the screen-reader view.
- Faces use public-domain portraits, busts or engravings. Rights for each image are recorded in `assets/mentors/CREDITS.md` before the image ships. Until then, use abstract silhouettes.

**Later, not in the first build:** drag two clouds together to make them face off; "argue the option I'm leaning against"; a weather history of past debates on `/decisions`.

**Cost:** a debate makes many generation calls, so the "consult under $0.05" goal does not apply. Set a new target after measuring real costs.

### 14. Trigger phrases (passive and active)
The user keeps a list of phrases, each tied to one or more approved principles and an optional note. Settings page: `/settings/triggers`. Entries start disabled and the user turns on the ones they want.

- **Passive.** `POST /api/council/trigger` takes some text and returns the phrases found, each with its principles and note. It is plain string matching with no model call, so it is private and cheap. The caller (for example a Claude Code prompt hook) attaches the notes to what it is doing. It never blocks anything.
- **Active.** A command (for example `council pause "<draft>"`) or hotkey calls the same consult pipeline as `/consult` through a token-authenticated route and returns the full result.
- **Safeguards.** Per-phrase cooldown (default 30 minutes), a fire count, "mute," and a "useful / noise" button whose counts go to the ledger. Matching is case-insensitive, whole-word or whole-phrase.
- **Auth.** A token generated in settings and stored hashed. The routes listen on localhost only unless the owner changes it. Ledger rows store counts and phrase ids, never the raw text.

Starter examples (the owner edits or deletes them):

| Phrase | Note |
|---|---|
| "done", "ready", "fixed", "shipped" | Only claim what you can point to evidence for. Say what is unverified. |
| "update the README", "update docs" | Docs must match what was actually run. List anything unchecked. |
| "send to", "summary for" | Plain sentences, terms spelled out, no invented labels. |
| "mock", "placeholder", "sample data" | Fake data needs approval, must be labeled, and goes on the open-items list. |
| "genome", "patient", "upload" | Sensitive data stays on this machine. |
| "deploy", "force-push", "delete" | Irreversible: confirm first. |
| "estimate", "how long", "cost" | Measured numbers only. |
| "still failing", "again" | After a second failed fix, stop patching and list causes. |

