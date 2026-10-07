# Module 3 notes

## Done
- Lessons 03.1-03.5 with quizzes (4, 4, 4, 4, 5 questions); module quiz (10 questions) and intro page.
- 21 diagrams `assets/m03-l01-*` to `assets/m03-l05-*` from `curriculum/tools/assets-m03.mjs`. Skin tones: fair (03.1 arm), tan (03.2 arm), deep (03.3 face), medium and light (03.4), brown, light and deep (03.5).
- `curriculum/tools/sheets-m03.mjs` -> `labs/module-03/`: color-mixing-chart, gradient-practice, pop-practice, symmetry-practice, palette-cards, three-palettes (A4 + Letter, PDF + SVG), plus README.
- Simulation `simulations/color-mixing/` (index.html, style.css, app.js): a paint-mixing plate. Six paints (yellow, orange-red, pink, blue, white, black) are reflectance curves mixed by weighted geometric mean (a simple subtractive model) and shown via CIE 1931 color matching functions and sRGB. Add/remove drops, live advice (muddy, black is strong, red+blue dull), ten target colors with a closeness check, a saved chart. Labelled "educational model", no network, works at 360 px (checked), all controls are buttons/select (keyboard). Optional `?target=Brown` preset. Embedded in 03.1. The BUILD_PROGRESS unit "Simulations: color mixing" can be ticked; the symmetry mirror simulation was not built (03.4 works without it).

## Sources (checked 2026-10-07)
- Loaded: drawpaintacademy.com/muddy-colors (Dan Scott), winsornewton.com primary colours guide (primaries include Permanent Rose, a pink-red: used for "pink mixes cleaner purples"), color.adobe.com color wheel (harmony rules), freecodecamp.org 60-30-10 (Faith Olohijere, 15 May 2023).
- Search only (fetch tool got 403 or a redirect): facepaint.com "art of face painting how to do blending tutorial" and "sponging techniques by Athena Zhe" (03.2: dab/tap, light to dark, neighbor colors blend best); facepaint.com "getting good coverage on varying skin tones" (03.5: yellow and orange give the least coverage on darker skin); facepaint.com "how to paint a rose" (03.3); facepaintingschool.com "7 steps to achieve symmetry" (03.4: work detail by detail switching sides, rather than a whole half; the URL now redirects to a different IFPS article). Worth a second check when merging sources.
- No new safety or regulatory facts. Safety lines come from references/safety.md and safety-sources.md.

## Decisions
- "White underneath first" for light colors on deep skin (03.5) is face-painting practice from the facepaint.com coverage article, not a safety claim.
- 03.4's demo design sits over the brows; glossary defines the brows as eye area, so the lesson's warning says eye-safe paint only, otherwise move the design onto forehead and temples. The mini-project itself is on the paper template.
- 03.3 order rule "colors, dry, black, then white" follows common face-painting advice (black is hard to cover).
- 03.4 lists 02.2, 02.3 and 02.5 as prerequisites (teardrops, swirls, painting on the face). 03.3 lists 02.1 (pressure stroke). Links point to ../module-02/lesson-01.md only.
- Local drawing helpers in assets-m03.mjs that could move to lib if other modules want them: `wheel`/`sector` (color wheel), `blob` (paint pool), `plate`, `spongeBottom` (sponge loaded with one or two colors), `gradPatch` + `faded` (sponged gradient with soft edges), `heartPts`/`heartOutline`/`heartShine` (heart with thin-thick outline and highlight), `forearm` (copy of the m01 helper), `motif` (03.5 practice flower).

## Open questions
- none
