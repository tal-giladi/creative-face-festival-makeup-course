# Module 1 notes

## Done
- Lessons 01.2-01.5 with quizzes; module quiz (10 questions).
- 15 new diagrams `assets/m01-l02-*` to `assets/m01-l05-*` (curriculum/tools/assets-m01.mjs extended; the 01.1 figures are unchanged).
- New `curriculum/tools/sheets-m01.mjs` -> `labs/module-01/` label-sort, consistency-test, clean-up-record (A4 + Letter, PDF + SVG); README updated.

## New facts verified (for references/sources.md)
- EU Annex IV (https://www.legislation.gov.uk/eur/2009/1223/annex/IV, fetched 2026-10-07): CI 77891 titanium dioxide, CI 77491/77492/77499 iron oxides and CI 77007 ultramarines have no field-of-use restriction; a restricted example (entry 107, polychloro copper phthalocyanine) says "Not to be used in eye products". 01.2 uses "CI 77891 is titanium dioxide, a white".
- Everything else comes from curriculum/research/safety-sources.md.

## Decisions
- 01.2 cites the ACMI page (search-only in the research file) for "non-toxic = safe for art use as intended".
- Patch test of a palette: a row of small spots, one per color, in a noted order, so a reaction can be traced to one color. Practical advice, not from a source.
- 01.5 eye-area removal is rehearsed with plain water only (eye-area painting comes in Module 5).
- Local drawing helpers (inner forearm, product icons, clock, tap, bottles, towel) live in assets-m01.mjs. `forearm()` could move to lib/face.mjs if other modules need an inner-arm view.

## Open questions
- 01.5's caution box says "if paint gets into an eye, rinse it with clean, lukewarm water". The lukewarm-water rinse is from the Ontario Poison Centre superglue page, not a face-paint source; references/safety.md only says "after rinsing". Confirm or soften when merging.
- 01.3 lists contact lenses among the "ask before painting" questions (AAO: glitter irritates eyes especially with contact lenses).
