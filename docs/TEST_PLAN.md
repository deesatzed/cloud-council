# Test plan (Cloud Council and triggers)

Must-have tests. Owner decision 2026-11-17: **no mocks.** Tests call a real, low-priced OpenRouter model with a dollar-capped API key (read from the environment, never stored in the repo), and the app's own `COST_CAP_USD` also applies. Record the measured cost of each test run in PROGRESS.md.

1. **Cite-or-silence for quotes:** no rendered mentor quote lacks a verified `chunkId`. A Playwright assertion collects all `[data-quote]` elements and checks `data-verified="true"`.
2. **Voice labeling:** first-person mentor text (matches `^I |\bI am\b|\bmy\b`) is allowed only inside an element marked `data-simulated="true"` that shows the "simulated voice" label. Fail if such text appears outside one, if a simulated element sits inside or looks like a `[data-quote]` element, or if simulated text is written to the quote store or export.
3. **Simulated never stored as quote:** after a Cloud Council e2e run, no quote-store row came from a voiced line, and every voiced utterance row has `simulated = true`.
4. **No blocking UI:** grep test that fails if UI copy contains "BLOCK", "veto" or "blocked".
5. **Trigger privacy:** the passive trigger route makes zero LLM or embedding calls, and no ledger payload contains the text sent to it.
6. **Budget:** at a tiny `COST_CAP_USD`, debates stop with "paused: budget" and show no stack traces.
