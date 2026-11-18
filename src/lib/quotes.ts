// Quote verification, as specified in docs/QUOTE_VERIFICATION.md.
// A quote may be shown as a mentor's words only if it passes verifyQuote against a stored chunk.

export function normalize(s: string): string {
  return s
    .normalize("NFKC")
    .replace(/[‘’‛']/g, "'")
    .replace(/[“”"]/g, '"')
    .replace(/[–—-]+/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function wordCount(s: string): number {
  const t = s.trim();
  return t === "" ? 0 : t.split(/\s+/).length;
}

export function verifyQuote(quote: string, chunkText: string): boolean {
  return (
    wordCount(quote) >= 8 &&
    !quote.includes("...") &&
    !quote.includes("…") &&
    normalize(chunkText).includes(normalize(quote))
  );
}
