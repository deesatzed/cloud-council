# PROGRESS

Last updated 2026-11-17. **Documents only. No code written or run.**

## Done
- Repo created from the specs in the Council handoff repo (`/Volumes/WS4TB/abetterme-council-handoff`, commit 209f3bb).

## Decisions
- 2026-11-17: this repo reads a **Council export file** (corpus with verified chunks, plus approved principles). It does not call Council live and does not build its own corpus pipeline. The export format is still to be defined; Council's M10 plan includes an export.

- 2026-11-17: stack is **Next.js + TypeScript**, with canvas or WebGL for the clouds, so prompts, quote verification and the export reader can be shared with Council. The exact Next.js version, database and test tools are not chosen yet.

- 2026-11-17: **no mocks or fake accounts.** Tests and demos call a real, low-priced OpenRouter model with a dollar-capped API key (the cap is set on the OpenRouter key; the app also enforces `COST_CAP_USD`). The key lives only in the environment.

## Open items (need the owner)
1. **Name.** `cloud-council` is a working name.
2. **Which model.** The owner picks the OpenRouter model from the current list (looked up 2026-11-17).
3. **Cost target** for multi-turn debates: set after measuring real cost per debate.
4. **Portrait image rights** unchecked; use abstract silhouettes until recorded.
5. **`MENTOR_VOICE` untested.** Model IDs must be looked up and chosen by the owner.
6. **Repo is public** at https://github.com/deesatzed/cloud-council. Pushes are authorized by the owner for this repo.
