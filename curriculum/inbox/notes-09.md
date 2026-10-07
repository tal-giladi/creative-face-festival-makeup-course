# Module 9 notes

## Done
- Lessons 09.1-09.4 with quizzes (4, 5, 4, 4 questions); module quiz (10 questions) and intro page.
- Projects `projects/p10-fantasy-character.md` (emerald dragon), `projects/p11-artistic-mask.md`
  (royal masquerade with feathers), `projects/p12-original-design.md` (example: Sunset phoenix, with
  a process image).
- Diagrams from `curriculum/tools/assets-m09.mjs`: m09-l01 (idea, thumbnails, distance, plan, steps),
  m09-l02 (shapes, filigree, mask-steps, mistakes), m09-l03 (characters, textures, spirit-steps,
  mistakes), m09-l04 (process, references, iterate, portfolio), p10-fantasy-character(+steps),
  p11-artistic-mask(+steps), p12-original-design(+steps, +process). Skin tones: tan (09.1), deep
  (09.2 steps; shapes use fair, brown, medium, deep), fair / medium / deep (09.3 characters), light
  (09.4), medium (P10), light (P11), brown (P12).
- Printables from `curriculum/tools/sheets-m09.mjs` -> `labs/module-09/`: idea-thumbnails,
  mood-palette, filigree-drill, artistic-mask, fantasy-character, fairy-and-spirit, portfolio-page
  (A4 + Letter, PDF + SVG) and README. Importing assets-m09.mjs from the sheets script rebuilds the
  m09 diagrams (same output).

## Sources added (checked 2026-10-07)
- Smithsonian National Museum of the American Indian, "Native American Cultures and Clothing: Native
  American Is Not a Costume" (search result; states that dressing up as Native Americans is never
  appropriate) https://americanindian.si.edu/nk360/informational/cultures-and-clothing
- Google Arts & Culture, "Colorful Calaveras for the Day of the Dead" (search result; calaveras as
  celebratory figures of the Day of the Dead) https://artsandculture.google.com/story/TQJyS0dYYCYCIw
- No new safety facts: all safety statements reuse safety-sources.md and Modules 1, 5 and 6 (eye-safe
  only near the eyes, believe "not for use near the eyes" labels, no fluorescent colors near the
  eyes, no glitter or gems near the lash line, patch test, no craft products).

## Decisions
- Prerequisites: 09.1 ["03.4","03.5","07.4"], 09.2 ["04.6","05.4","06.3","08.2","08.3","09.1"],
  09.3 ["08.1","08.2","08.3","09.1"], 09.4 ["07.4","09.1","09.2","09.3"]. Module 8 lessons are linked
  by path (../module-08/lesson-0N.md); 08.2-08.4 did not exist yet when this module was written, so
  the dry-run import shows those links as missing until Module 8 is finished.
- Respect note (09.3): one short paragraph in How it works, with the two sources above; it names
  Día de los Muertos skulls and Indigenous face markings as examples and points to invented
  characters. The mood-palette sheet has a matching checkbox.
- Painted masks hide the brows in the diagrams (faceLayer brows: false), since paint covers them.
- 09.4's worked example is "Moon dreamer"; P12's example is a different design ("Sunset phoenix") so
  the project doesn't repeat the lesson.
- All lessons volatility: concept (no product names, prices or regulations beyond earlier modules).
- Local helpers in assets-m09.mjs that could move to lib: jewel (shaded faceted gem with shadow and
  optional gold setting), pearl, scales (overlapping U-scale field), lace (scallop edge along a
  curve), leaf (two-tone leaf with veins), feather, sliced/frameOf/outlineOf (same idea as
  assets-m08.mjs, copied, not imported), decoMask (mask shapes with holes, 3D shading, lace,
  filigree), sScrollPts. sheets-m09.mjs has traceMarkup (outlines SVG markup honoring nested
  transforms).

## Open questions
- None blocking. The main session may want to add "metallic gold face paint" and planning pencils
  to references/materials.md (see materials-09.md).
