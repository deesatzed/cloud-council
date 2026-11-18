// One-off export tool. Downloads real public-domain texts from Project Gutenberg and writes
// data/export/council-export.json, the file the debate app reads. The app itself never runs this.
//
// Usage: npm run export:corpus -- [--refresh] [--only=marcus-aurelius,benjamin-franklin]
//
// Per docs/MENTOR_CORPUS.md: only works whose Gutenberg record says "Public domain in the USA" are
// used, and the record's title and author must match what we expect, so a wrong id fails loudly.
// Not done here (needs a model key): the LLM "authorial" filter and embeddings. This script applies
// a heuristic filter instead and records that in the output (authorialFilter: "heuristic-v1").

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const RAW_DIR = path.join(ROOT, "corpus", "raw");
const OUT_FILE = path.join(ROOT, "data", "export", "council-export.json");
const USER_AGENT = "cloud-council-export/0.0.1 (one-off personal research script)";
const DELAY_MS = 3000;

// Gutenberg ids for the first export. They are checked against the record's title, author and
// rights at run time; an id that does not match is rejected, not trusted.
const FIRST_EXPORT = [
  { mentorId: "marcus-aurelius", gutenbergId: 2680, titleMatch: /meditations/i, authorMatch: /aurelius/i },
  { mentorId: "benjamin-franklin", gutenbergId: 148, titleMatch: /autobiography/i, authorMatch: /franklin/i },
  { mentorId: "henry-david-thoreau", gutenbergId: 205, titleMatch: /walden/i, authorMatch: /thoreau/i },
  { mentorId: "florence-nightingale", gutenbergId: 17366, titleMatch: /notes on nursing/i, authorMatch: /nightingale/i },
];

type RosterWork = { title: string; author: string; translator: string | null; source: string; attributed: boolean };
type RosterMentor = { id: string; name: string; years: string; diedYear: number; roles: unknown; bio: string; works: RosterWork[] };

type Chunk = { id: string; mentorId: string; workId: string; locator: string; text: string; words: number };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const words = (s: string) => (s.trim() === "" ? 0 : s.trim().split(/\s+/).length);
const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");
const exists = (p: string) => access(p).then(() => true, () => false);

async function fetchCached(url: string, cachePath: string, refresh: boolean): Promise<string> {
  if (!refresh && (await exists(cachePath))) return readFile(cachePath, "utf8");
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) {
    const retry = res.headers.get("retry-after");
    throw new Error(`GET ${url} -> HTTP ${res.status}${retry ? ` (retry-after ${retry}s)` : ""}`);
  }
  const body = await res.text();
  await mkdir(path.dirname(cachePath), { recursive: true });
  await writeFile(cachePath, body);
  await sleep(DELAY_MS); // be polite to Project Gutenberg
  return body;
}

function xmlField(xml: string, tag: string): string[] {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "g");
  return [...xml.matchAll(re)].map((m) => m[1].trim());
}

function stripGutenberg(raw: string): string {
  const text = raw.replace(/\r\n?/g, "\n");
  const start = text.match(/^\*\*\* ?START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*\*\*\*[^\n]*$/m);
  const end = text.match(/^\*\*\* ?END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*\*\*\*[^\n]*$/m);
  if (!start || start.index === undefined || !end || end.index === undefined) {
    throw new Error("could not find the START/END markers of the Gutenberg text");
  }
  return text.slice(start.index + start[0].length, end.index).trim();
}

const HEADING_RE = /^(BOOK|CHAPTER|LETTER|ESSAY|PART|SECTION|THE\s+\w+\s+BOOK)\b/i;
const ROMAN_RE = /^[IVXLCDM]+\.?$/;

function isHeading(para: string): boolean {
  const t = para.trim();
  if (t.includes("\n") || t.length > 80) return false;
  return HEADING_RE.test(t) || ROMAN_RE.test(t);
}

// Split an over-long paragraph at sentence ends so no chunk exceeds the limit.
function splitLong(para: string, max: number): string[] {
  const sentences = para.match(/[^.!?]+(?:[.!?]+["'”’)]*\s+|$)/g) ?? [para];
  const out: string[] = [];
  let cur = "";
  for (const s of sentences) {
    if (cur && words(cur) + words(s) > max) {
      out.push(cur.trim());
      cur = "";
    }
    cur += s;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

function chunkText(body: string, mentorId: string, workId: string, short: string): Chunk[] {
  const MIN = 150;
  const MAX = 450;
  const paras = body.split(/\n\s*\n/).map((p) => p.replace(/\s*\n\s*/g, " ").trim()).filter(Boolean);
  const chunks: Chunk[] = [];
  let heading = "";
  let buf: string[] = [];
  let bufWords = 0;
  let firstOrdinal = 0;
  let sectionOrdinal = 0;

  const flush = () => {
    if (!buf.length) return;
    const text = buf.join("\n\n");
    const locator = heading ? `${short}, ${heading}, ¶${firstOrdinal}` : `${short}, ¶${firstOrdinal}`;
    chunks.push({ id: `${mentorId}-${workId}-${String(chunks.length + 1).padStart(4, "0")}`, mentorId, workId, locator, text, words: words(text) });
    buf = [];
    bufWords = 0;
  };

  paras.forEach((p, i) => {
    const ordinal = i + 1;
    if (isHeading(p)) {
      flush();
      heading = p.replace(/\s+/g, " ").trim();
      sectionOrdinal = 0;
      return;
    }
    sectionOrdinal++;
    for (const piece of words(p) > MAX ? splitLong(p, MAX) : [p]) {
      const w = words(piece);
      if (buf.length && bufWords + w > MAX) flush();
      if (!buf.length) firstOrdinal = ordinal;
      buf.push(piece);
      bufWords += w;
      if (bufWords >= MIN) flush();
    }
  });
  flush();
  void sectionOrdinal;
  return chunks;
}

// Heuristic stand-in for the LLM "authorial" decision (heuristic-v1).
function looksAuthorial(c: Chunk): boolean {
  const t = c.text;
  if (/project gutenberg/i.test(t)) return false;
  if (/\b(transcriber'?s? note|produced by|e-?text|illustration[s]?:)\b/i.test(t)) return false;
  const lines = t.split("\n").filter((l) => l.trim());
  const tocish = lines.filter((l) => /\.{3,}|\s\d{1,4}$/.test(l.trim())).length;
  if (lines.length > 4 && tocish / lines.length > 0.4) return false; // table of contents
  return c.words >= 40;
}

async function main() {
  const args = process.argv.slice(2);
  const refresh = args.includes("--refresh");
  const only = args.find((a) => a.startsWith("--only="))?.slice(7).split(",");
  const roster: RosterMentor[] = JSON.parse(await readFile(path.join(ROOT, "seed", "mentor_roster.json"), "utf8")).mentors;

  const mentorsOut: unknown[] = [];
  const chunksOut: Chunk[] = [];
  const failures: string[] = [];

  for (const spec of FIRST_EXPORT) {
    if (only && !only.includes(spec.mentorId)) continue;
    const mentor = roster.find((m) => m.id === spec.mentorId);
    if (!mentor) { failures.push(`${spec.mentorId}: not in seed/mentor_roster.json`); continue; }
    const rosterWork = mentor.works.find((w) => spec.titleMatch.test(w.title)) ?? mentor.works[0];
    const id = spec.gutenbergId;
    try {
      const rdf = await fetchCached(`https://www.gutenberg.org/cache/epub/${id}/pg${id}.rdf`, path.join(RAW_DIR, `pg${id}.rdf`), refresh);
      const title = xmlField(rdf, "dcterms:title")[0] ?? "";
      const authors = xmlField(rdf, "pgterms:name").join(" | ");
      const rights = xmlField(rdf, "dcterms:rights").join(" | ");
      if (!/public domain in the usa/i.test(rights)) throw new Error(`rights is "${rights}", not "Public domain in the USA"`);
      if (!spec.titleMatch.test(title)) throw new Error(`id ${id} is titled "${title}", expected ${spec.titleMatch}`);
      if (!spec.authorMatch.test(authors)) throw new Error(`id ${id} is by "${authors}", expected ${spec.authorMatch}`);

      const raw = await fetchCached(`https://www.gutenberg.org/cache/epub/${id}/pg${id}.txt`, path.join(RAW_DIR, `pg${id}.txt`), refresh);
      const body = stripGutenberg(raw);
      const workId = String(rosterWork.title).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
      const short = rosterWork.title.split(/[:,]/)[0].replace(/^The /, "").trim();
      const all = chunkText(body, mentor.id, workId, short);
      const kept = all.filter(looksAuthorial);
      const keptWords = kept.reduce((n, c) => n + c.words, 0);

      mentorsOut.push({
        id: mentor.id, name: mentor.name, years: mentor.years, diedYear: mentor.diedYear, bio: mentor.bio, roles: mentor.roles,
        works: [{
          id: workId, title: title, author: authors, translator: rosterWork.translator, attributed: rosterWork.attributed,
          source: "gutenberg", gutenbergId: id, sourceUrl: `https://www.gutenberg.org/ebooks/${id}`,
          license: `Public domain in the US; source: Project Gutenberg #${id}`,
          sha256: sha256(raw), chunksTotal: all.length, chunksKept: kept.length, wordsKept: keptWords,
          meetsWordThreshold: keptWords >= 30000,
        }],
      });
      chunksOut.push(...kept);
      console.log(`ok   ${mentor.id}: "${title}" -> ${kept.length}/${all.length} chunks, ${keptWords} words${keptWords < 30000 ? "  (below the 30,000-word threshold)" : ""}`);
    } catch (e) {
      failures.push(`${spec.mentorId}: ${(e as Error).message}`);
      console.error(`FAIL ${spec.mentorId}: ${(e as Error).message}`);
    }
  }

  if (mentorsOut.length === 0) {
    console.error("\nNo mentor exported; nothing written.");
    process.exit(1);
  }
  const out = {
    formatVersion: 1,
    createdAt: new Date().toISOString(),
    source: "Project Gutenberg, public domain in the US (checked per work from its record)",
    authorialFilter: "heuristic-v1",
    embeddings: "none",
    note: "Translator introductions and editor notes may remain; the LLM authorial filter was not run. Retrieval must use keyword search until embeddings exist.",
    mentors: mentorsOut,
    chunks: chunksOut,
    failures,
  };
  await mkdir(path.dirname(OUT_FILE), { recursive: true });
  await writeFile(OUT_FILE, JSON.stringify(out));
  console.log(`\nWrote ${path.relative(ROOT, OUT_FILE)}: ${mentorsOut.length} mentor(s), ${chunksOut.length} chunks.`);
  if (failures.length) { console.error(`${failures.length} failure(s):\n- ${failures.join("\n- ")}`); process.exit(1); }
}

main().catch((e) => { console.error(e); process.exit(1); });
