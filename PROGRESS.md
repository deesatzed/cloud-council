# PROGRESS

Last updated 2026-11-19. **Project scaffold and export script exist; the export has NOT been run, and the debate screen is not built.**

## Done
- Repo created from the specs in the Council handoff repo (`/Volumes/WS4TB/abetterme-council-handoff`, commit 209f3bb).

- Next.js 16.4.6, React 19.3.1, TypeScript 7.0.2 scaffold (`npm run build` and `tsc --noEmit` pass; the home page is an "under construction" stub).
- `src/lib/quotes.ts`: `verifyQuote` as specified. No tests yet (see open items).
- Sky visuals (first build, spec §13 feature 1): `src/components/CloudSky.tsx` (canvas clouds with faint faces, Option A left / Option B right, horizon band, names on pills), `src/lib/skyPhysics.ts` (stance to position, spring), `SkyPlayground.tsx` (the user drags a cloud or picks a radio button; nothing is simulated). Home page shows the four first-export mentors by name and years from the roster. `npx vitest run`: 5 of 5 pass (physics only). `tsc` and `npm run build` pass.
- Checked by eye: one headless-Chrome screenshot at 1000 px wide (light mode, all four mentors at "between"). The Chrome extension was not connected.
- `scripts/export-corpus.ts` (`npm run export:corpus`): written and loads under `tsx`; **never run against Gutenberg**. It checks each work's Gutenberg record (title, author, "Public domain in the USA") before using it, caches downloads in `corpus/raw/`, waits 3 s between requests, and writes `data/export/council-export.json`.

## Decisions
- 2026-11-17: this repo reads a **Council export file** (corpus with verified chunks, plus approved principles). It does not call Council live and does not build its own corpus pipeline. The export format is still to be defined; Council's M10 plan includes an export.

- 2026-11-17: stack is **Next.js + TypeScript**, with canvas or WebGL for the clouds, so prompts, quote verification and the export reader can be shared with Council. The exact Next.js version, database and test tools are not chosen yet.

- 2026-11-17: **no mocks or fake accounts.** Tests and demos call a real, low-priced OpenRouter model with a dollar-capped API key (the cap is set on the OpenRouter key; the app also enforces `COST_CAP_USD`). The key lives only in the environment.

- 2026-11-17: voice model is **`deepseek/deepseek-v4.1-flash-1017`** via OpenRouter (listed 2026-11-17 at $0.036 in / $0.500 out per million tokens; the Council handoff also uses it). Per the handoff, requests use JSON-schema output with reasoning disabled. Quality for in-character writing is untested; swap after measuring.

- 2026-11-17: the OpenRouter key goes in `/Volumes/WS4TB/cloud-council/.env.local`, created by the owner (`OPENROUTER_API_KEY=...`). It is gitignored. Claude never reads or prints it; the app loads it at run time. Not yet created.

- 2026-11-17: the first export is made by a **small export script in this repo** (tooling only; the debate app reads the file and never runs the pipeline). It downloads real public-domain texts for 3-5 mentors from Project Gutenberg, splits, indexes and writes the export. No mocks. This refines the decision above: no runtime corpus pipeline here, but one-off export tooling is allowed.

- 2026-11-17: first export covers four mentors: **Marcus Aurelius** (Meditations), **Benjamin Franklin** (Autobiography), **Henry David Thoreau** (Walden and Civil Disobedience), **Florence Nightingale** (Notes on Nursing). The script checks Project Gutenberg's copyright flag for each and skips any that fail.

- 2026-11-17: first principles are **derived from the owner's CLAUDE.md** (8 drafts in `local/principles.json`, gitignored, status `draft`). The owner approved sending approved principles to OpenRouter inside debate prompts. They are work-style rules, not health or identifying data. The owner edits and approves them; only `approved` ones are used.

- 2026-11-19: Project Gutenberg was still in maintenance (HTTP 503), and `aleph.gutenberg.org` failed its certificate check (not bypassed). The owner chose to **wait and retry** the export later rather than switch sources.

## Open items
**Blocked / not yet verified**
- **Export not run.** On 2026-11-18, www.gutenberg.org returned HTTP 503 ("Temporarily Down", retry-after 3600). Gutendex (the catalog API the handoff names) returns HTTP 403 to scripts behind a Cloudflare challenge, so the script does not use it. Re-run `npm run export:corpus` after Gutenberg is back.
- **Gutenberg ids come from memory** (2680, 148, 205, 17366). The script rejects any id whose record doesn't match the expected title, author and rights, but none has been checked yet.
- **Heuristic filter only.** The LLM "authorial" step and embeddings need a model key and weren't built. Translator introductions may remain in the export, and retrieval must use keyword search until embeddings exist.
- **No tests yet, on purpose.** Under the no-mocks rule, tests for the chunker and `verifyQuote` will use real passages from the downloaded texts, so they wait for the first successful export.

- **Not yet verified in a browser:** dragging a cloud, hover wake-up of faces, dark mode, reduced-motion, keyboard use of the radio buttons, and the phone layout (the one phone-width screenshot looked clipped, but headless Chrome enforces a minimum window width, so it proves nothing).
- **Not built:** rain-drop quote cards, tap-to-ask, the debate itself, the principles band content, the real faces (only abstract shading so far).

**Need the owner**
1. **Name.** `cloud-council` is a working name.
2. **Cost target** for multi-turn debates: set after measuring real cost per debate.
3. **Portrait image rights** unchecked; use abstract silhouettes until recorded.
4. **`MENTOR_VOICE` untested.** Model IDs must be looked up and chosen by the owner.
5. **Repo is public** at https://github.com/deesatzed/cloud-council. Pushes are authorized by the owner for this repo.
