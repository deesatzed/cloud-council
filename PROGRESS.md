# PROGRESS

Last updated 2026-11-17. **Documents only. No code written or run.**

## Done
- Repo created from the specs in the Council handoff repo (`/Volumes/WS4TB/abetterme-council-handoff`, commit 209f3bb).

## Decisions
- 2026-11-17: this repo reads a **Council export file** (corpus with verified chunks, plus approved principles). It does not call Council live and does not build its own corpus pipeline. The export format is still to be defined; Council's M10 plan includes an export.

- 2026-11-17: stack is **Next.js + TypeScript**, with canvas or WebGL for the clouds, so prompts, quote verification and the export reader can be shared with Council. The exact Next.js version, database and test tools are not chosen yet.

- 2026-11-17: **no mocks or fake accounts.** Tests and demos call a real, low-priced OpenRouter model with a dollar-capped API key (the cap is set on the OpenRouter key; the app also enforces `COST_CAP_USD`). The key lives only in the environment.

- 2026-11-17: voice model is **`deepseek/deepseek-v4.1-flash-1017`** via OpenRouter (listed 2026-11-17 at $0.036 in / $0.500 out per million tokens; the Council handoff also uses it). Per the handoff, requests use JSON-schema output with reasoning disabled. Quality for in-character writing is untested; swap after measuring.

- 2026-11-17: the OpenRouter key goes in `/Volumes/WS4TB/cloud-council/.env.local`, created by the owner (`OPENROUTER_API_KEY=...`). It is gitignored. Claude never reads or prints it; the app loads it at run time. Not yet created.

- 2026-11-17: the first export is made by a **small export script in this repo** (tooling only; the debate app reads the file and never runs the pipeline). It downloads real public-domain texts for 3-5 mentors from Project Gutenberg, splits, indexes and writes the export. No mocks. This refines the decision above: no runtime corpus pipeline here, but one-off export tooling is allowed.

- 2026-11-17: first export covers four mentors: **Marcus Aurelius** (Meditations), **Benjamin Franklin** (Autobiography), **Henry David Thoreau** (Walden and Civil Disobedience), **Florence Nightingale** (Notes on Nursing). The script checks Project Gutenberg's copyright flag for each and skips any that fail.

- 2026-11-17: first principles are **derived from the owner's CLAUDE.md** (8 drafts in `local/principles.json`, gitignored, status `draft`). The owner approved sending approved principles to OpenRouter inside debate prompts. They are work-style rules, not health or identifying data. The owner edits and approves them; only `approved` ones are used.

## Open items (need the owner)
1. **Name.** `cloud-council` is a working name.
2. **Cost target** for multi-turn debates: set after measuring real cost per debate.
3. **Portrait image rights** unchecked; use abstract silhouettes until recorded.
4. **`MENTOR_VOICE` untested.** Model IDs must be looked up and chosen by the owner.
5. **Repo is public** at https://github.com/deesatzed/cloud-council. Pushes are authorized by the owner for this repo.
