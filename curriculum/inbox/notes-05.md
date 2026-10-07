# Module 5 notes

## Done
- Lessons 05.1-05.4 with quizzes (4, 5, 4, 5 questions); module quiz (10 questions) and intro page.
- 16 diagrams `assets/m05-l01-*` to `assets/m05-l04-*` from `curriculum/tools/assets-m05.mjs`. Skin tones: deep, light, brown, tan (05.1); medium, fair, brown (05.2); tan, light, deep (05.3); brown, deep, medium, light (05.4).
- `curriculum/tools/sheets-m05.mjs` -> `labs/module-05/`: bold-palette-cards, prep-and-set-test, festival-face-map, festival-layouts, eye-designs (A4 + Letter, PDF + SVG), plus README. `sheets-m05.mjs` imports the design helpers from `assets-m05.mjs`, so running it also rebuilds the m05 diagrams (same output).
- No project pages: the outline assigns none to Module 5. The module practical is the mini-project of 05.4 ("your first festival face").

## New facts with sources (checked 2026-10-07)
- FDA Eye Cosmetic Safety (loaded): never apply or remove eye cosmetics in a moving vehicle; don't add saliva to mascara; discard eye cosmetics used during an eye infection; manufacturers usually recommend discarding mascara 2-4 months after purchase; "Don't store cosmetics at temperatures above 85 degrees F". Used in 05.2 (kit in the shade) and 05.4.
- AAO eye makeup page (loaded): apply makeup "outside the lash line, away from the eye" to avoid blocking the oil glands; never apply in a moving vehicle; avoid exfoliating scrubs around the eyes. Used in 05.4 (waterline reason).
- Cedars-Sinai "Contact Lens Safety Tips" (loaded): put on soft contact lenses before applying makeup; rigid gas permeable lenses after makeup; remove lenses before removing makeup. The American Optometric Association gives the same advice (search only; aoa.org page not loaded). Used in 05.4 and its quizzes. Worth adding to references/safety.md.
- Mehron Barrier Spray page (loaded): mist on clean, dry face after skincare before makeup, and over finished makeup to seal it; remove with makeup remover, then soap and water. Spray distance (14 inches) and "hold breath, keep away from eyes" come from Mehron's brochure as indexed by search (the PDF did not render): search only. Lesson 05.2 says "close your eyes and mouth and hold your breath" and "about an arm's length, as the label says" without citing a number.
- Water-based paint beading over oily skin or wet cream (05.2) is face-painting practice found on several face-paint retailer and blog pages (search only, no manufacturer page confirmed). It is taught as technique, not as a safety claim.

## Decisions
- Prerequisites use only Modules 1-3 and earlier Module 5 lessons (Module 4 was being written in parallel): 05.1 ["03.3","03.5"], 05.2 ["01.3","01.5","05.1"], 05.3 ["03.4","05.1"], 05.4 ["01.2","05.2","05.3"]. If wanted, 05.4 could also list "04.6" (hero masks, eye area) once Module 4 is in.
- 05.1 and 05.4 mention "Module 6" for neon and glitter in plain text (no link), since 06.x lessons don't exist yet. When Module 6 is written, the main session may turn these into links to ../module-06/lesson-01.md and lesson-04.md.
- 05.2 and 05.4 are `volatility: implementation` (product and regulatory guidance); 05.1 and 05.3 are `concept`.
- The "neon look" in 05.1 uses ordinary face paint only, so UV/fluorescent rules stay in 06.4.
- Local helpers in assets-m05.mjs that could move to lib: `band` (closed shape between two splines), `wedge` (pie slice for cutting a band into color blocks), `embed` (face content inside a plain canvas), `liner` (eyeliner with a filled wing), `crease`, `browDots`, `browBone`, `swoosh`, `layoutA/B/C`. In sheets-m05.mjs: `flipD` (mirror absolute path data) and `outlinesBoth` (outline a design and its mirror for sheets, since sheet outlines ignore SVG transforms).

## Open questions
- None blocking. Suggest adding the contact-lens order (lenses in before makeup, out before removal) and "never in a moving vehicle" to references/safety.md.
