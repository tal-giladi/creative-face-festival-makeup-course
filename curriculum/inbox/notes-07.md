# Module 7 notes

## Done
- Lessons 07.1-07.4 with quizzes (4, 4, 4, 5 questions); module quiz (10 questions) and intro page.
- Projects `projects/p06-festival-eye.md` and `projects/p09-symmetrical-trance.md`.
- Diagrams from `curriculum/tools/assets-m07.mjs`: m07-l01 (dot-tools, quarters, mandala-steps, face-steps, mistakes), m07-l02 (short-strokes, shapes, face-steps, placement), m07-l03 (nested, face-steps, flow, vibration), m07-l04 (plan, order, photos), p06-festival-eye(+steps), p09-symmetrical-trance(+steps). Skin tones: brown (07.1), tan, fair (07.2), deep, medium (07.3), light, brown (07.4), medium (P6), fair (P9).
- Printables from `curriculum/tools/sheets-m07.mjs` -> `labs/module-07/`: dot-mandala-grids, geometric-guides, wave-drill, festival-look-plan, festival-eye, trance-face (A4 + Letter, PDF + SVG) and README. Importing assets-m07.mjs from the sheets script rebuilds the m07 diagrams (same output).

## Sources added (checked 2026-10-07)
- Envato Tuts+, "Vibrating Boundaries: Making Colors Pop" (search result; used for optical vibration of saturated complementary colors) https://design.tutsplus.com/articles/vibrating-boundaries-making-colors-pop--cms-108939
- FacePaint.com Impact Dotter Wand product page (search result; face-painting dotting brush exists and makes uniform dots) https://facepaint.com/products/impact-dotter-wand-face-painting-brush
- No new safety facts: all safety statements reuse safety-sources.md and Module 5/6 lessons (eye area, no fluorescent colors near the eyes, glitter/gems off lids and lash line, gem removal with oil from the edge, glitter removal with tape, FDA 85 °F storage).

## Decisions
- Prerequisites: 07.1 ["02.4","03.4","05.3"], 07.2 ["02.1","05.3","07.1"], 07.3 ["02.3","03.5","07.2"], 07.4 ["05.2","05.4","06.2","06.3","06.4","07.3"]. Module 6 lessons are linked by path from 07.3, 07.4, P6 and P9.
- Order of work in 07.4: glitter and gems after setting (consistent with templates/design-plan.md, which lists "Glitter and gems (last)"). The reason is given as technique (spray/powder should not land on glitter base or gems), not as a product claim.
- The 07.4 mini-project is the module practical; it points to P6 and P9 as guided versions.
- 07.4 is volatility: implementation (products, storage temperature); 07.1-07.3 are concept.
- Local helpers in assets-m07.mjs that could move to lib: offsetCurve/bandD/nest (nested parallel bands along a curve), mandala(), chevron/chevStack, tri/seg, liner/crease/browBone/browDots (copied from assets-m05.mjs to avoid importing it, which would rewrite m05 assets).

## Open questions
- None blocking. In 05.x, "Module 6" plain-text mentions could now also point to 07.4 for the full order of work.
- The trace sheets draw swirl outlines slightly past the face edge (the colored diagrams clip them to the head); harmless on paper.
