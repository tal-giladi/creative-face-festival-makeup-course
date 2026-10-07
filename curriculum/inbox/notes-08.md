# Module 8 notes (for the main session)

## Done
- Lessons 08.1-08.4 with quizzes (4 questions each); module quiz (10 questions) and intro page.
- 24 diagrams `assets/m08-l01-*` to `assets/m08-l04-*` from `curriculum/tools/assets-m08.mjs`.
  Skin tones: fair (08.1); medium, brown (08.2); tan, deep, medium (08.3); light, brown, medium, tan,
  fair (08.4).
- `curriculum/tools/sheets-m08.mjs` -> `labs/module-08/`: blend-and-one-stroke, value-ladder,
  stencil-cutouts, scales-lace-practice, illusion-outlines (A4 + Letter, PDF + SVG), plus README.
- No project pages (none assigned to Module 8). The module practical is the mini-project of 08.4
  ("one finished illusion"), planned on the `illusion-outlines` sheet.

## Sources checked on 2026-10-07
- International Face Painting School, "One Stroke Face Painting: Techniques and Tips" (loaded):
  mist the split cake once or twice until glossy, damp brush, lay it across the stripes and slide back
  and forth with identical moves; resistance means add water, muddy means too much water; load
  heavily. Used in 08.1.
- International Face Painting School, stencils guide (loaded): dabbing movement, hold the stencil
  firmly, low-density sponge, wipe stencils between customers before the paint dries. Used in 08.3.
- Jest Paint, "Face Painting with Stencils" (loaded): nearly dry applicator, paint from the edges
  inward, hold firmly, clean in soapy water and press dry between paper towels; fishnet and lace as
  alternatives; caution near the eyes. Used in 08.3.
- Proko, "Light, Shadow & Value" (loaded): highlight, midtone, core shadow, reflected light, cast
  shadow. Used in 08.2 and 08.4 (simplified to five parts).
- Nude by Nature, "Cracked Porcelain Doll Halloween Make Up" (loaded): cracks drawn with black liner
  and filled with pencil; imperfect lines look more real. Used in 08.4.
- facepaint.com pages (split cakes, broken doll tutorials) returned HTTP 403 to the fetch tool; they
  are cited from the search index only, as earlier modules cite facepaint.com.
- "No stencils over the eyes" is taught as a safety rule derived from the existing eye-area rules
  (AAO eye makeup page; references/safety.md) and Jest Paint's caution near the eyes; no primary
  source states it as a rule. No new regulatory claims were added.

## Decisions
- No SFX latex, spirit gum or adhesives in Module 8 (per the brief); 08.4 says so in its WARNING, in
  quiz 08.4 q3 and in the module quiz.
- Illusions kept tasteful: no blood or wounds; seams in a dusky skin shade; what shows "underneath"
  is a galaxy or scales.
- Prerequisites: 08.1 ["02.2","03.2","04.4"], 08.2 ["03.1","03.2","03.3"], 08.3 ["02.3","02.4",
  "08.1","08.2"], 08.4 ["03.4","08.1","08.2","08.3"]. No Module 7 ids are needed.
- 08.4 links 05.2 for using a cream foundation as a skin-tone paint.
- Local helpers in assets-m08.mjs that could move to lib: `sliced` (a stroke colored across its width:
  one-stroke loads, shaded horns), `frameOf`/`at` (points along and across a stroke), `blendPatch`
  (faded multi-color sponge patch), `sphere`, `hexGem`, `horn`, `scaleGrid`/`scaleMask`/`scaleCells`
  (scales and scale stencils), `laceParts`, `innerShadow`, `splitCake`, `flatBrush`, `linG`/`radG`.
  sheets-m08.mjs repeats the crack, seam, zipper and peel coordinates from assets-m08.mjs (keep both
  in sync if one changes).

## Open questions
- None blocking. Suggest adding to references/safety.md (Hygiene): "Stencils never go over the eyes;
  wash stencils after every use; fishnet or lace used as a stencil must be new and washed."
