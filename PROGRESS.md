# PROGRESS

Last updated 2026-11-17. **Documents only. No code written or run.**

## Done
- Repo created from the specs in the Council handoff repo (`/Volumes/WS4TB/abetterme-council-handoff`, commit 209f3bb).

## Decisions
- 2026-11-17: this repo reads a **Council export file** (corpus with verified chunks, plus approved principles). It does not call Council live and does not build its own corpus pipeline. The export format is still to be defined; Council's M10 plan includes an export.

## Open items (need the owner)
1. **Stack and name.** The Council plan uses Next.js 14, TypeScript, Prisma and SQLite. Nothing here is decided. The name `cloud-council` is a working name.
2. **Fake test accounts and mock providers** need the owner's explicit approval, and must be labeled where they appear.
3. **Cost target** for multi-turn debates: set after measuring real cost per debate.
4. **Portrait image rights** unchecked; use abstract silhouettes until recorded.
5. **`MENTOR_VOICE` untested.** Model IDs must be looked up and chosen by the owner.
6. **No GitHub remote.** The repo is local only. Creating or pushing to GitHub needs the owner's go-ahead.
