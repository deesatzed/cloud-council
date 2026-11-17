# Quote verification (copied from the Council handoff, `docs/MENTOR_CORPUS.md`)

## Quote verification (`lib/council/quotes.ts`)

```ts
normalize(s) = s.normalize('NFKC')
  .replace(/[‘’‛']/g, "'")
  .replace(/[“”"]/g, '"')
  .replace(/[–—-]+/g, '-')
  .replace(/\s+/g, ' ')
  .trim()
  .toLowerCase();

verifyQuote(quote, chunkText) =
  wordCount(quote) >= 8
  && !quote.includes('...') && !quote.includes('…')
  && normalize(chunkText).includes(normalize(quote));
```

- Every rejection is written to the ledger as `quote.rejected`, with the prompt id and mentor.
- The UI renders **only** quotes that passed verification and are stored with their `chunkId`. The citation link opens the chunk in context: the passage plus its neighbors, with the work and locator.

