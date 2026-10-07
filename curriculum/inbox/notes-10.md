# Module 10 notes (optional module)

## Done
- Lessons 10.1-10.3 with quizzes (4, 4, 5 questions); module quiz (9 questions) and intro page.
- Project `projects/p13-body-art-piece.md` (Intermediate, 75 minutes).
- Diagrams from `curriculum/tools/assets-m10.mjs`: m10-l01 (replan, scale, flow, zones), m10-l02 (steps, wrap, bracelets, mistakes), m10-l03 (placement, steps, reach, clothing), p13-arm-shoulder(+steps). Skin tones: tan, fair, light (10.1); deep, tan, medium, brown (10.2); fair, brown, light, medium (10.3); tan (P13).
- Printables from `curriculum/tools/sheets-m10.mjs` -> `labs/module-10/`: face-to-body-plan, vine-bracelet, collarbone-necklace, arm-shoulder-piece (A4 + Letter, PDF + SVG) and README. Importing assets-m10.mjs from the sheets script rebuilds the m10 diagrams.
- Every lesson intro and the project and module quiz pages say the module is optional and the core course is complete without it.

## Local helpers (could move to curriculum/tools/lib)
- `LONG`: ARM extended to the elbow (frame 400 x 720) and `longHand()` (also a mirrored palm view).
- `TORSO`: BODY closed and extended to y 440, `upperBody()` with optional tank top, center line and back view (`BACKLINES`).
- `AF` / `armFig()`: shoulder and whole arm, front view (frame 400 x 800, center line x 330), with a top.
- A 3D forearm tube with a helix (front solid, back dashed) for "wraps around" diagrams (m10-l02-wrap).
- leaf/vine/flower helpers copied from assets-m04.mjs (not imported, to avoid rebuilding m04 assets).

## Sources added (checked 2026-10-07)
- Snazaroo FAQ (already in safety-sources): face paints "designed for use on the face and body"; "some colours may stain" fabric; paint "may rub off if something brushes up against it". Used for clothing contact and staining in 10.1-10.3.
- American Academy of Dermatology, "Hair removal: How to shave" https://www.aad.org/public/everyday-care/skin-care-basics/hair/how-to-shave (search result; AAD pages refuse the fetch tool): shaving can irritate skin; tips to avoid razor bumps and burns. Used for "don't shave just to paint; if you do, the day before" in 10.1.
- No new regulatory facts: all safety statements reuse safety-sources.md (same products as face, patch test, no broken/sunburned skin, glitter and gem rules, removal with soap and oil cleanser, remove before sleep).

## Decisions
- Prerequisites: 10.1 ["02.5","04.1","05.2","07.4"], 10.2 ["10.1","01.3","02.5","06.2"], 10.3 ["10.1","10.2","03.4","05.2","06.2"]. No Module 9 ids.
- Painting your own non-dominant hand/arm is the default; a helper is presented as optional only, for the back of the shoulders.
- Privacy: designs only on skin the learner would normally show (shoulders, collarbones, arms), above the neckline; diagrams show a tank top.
- "Wash hands before eating if hands are painted" is in the 10.2 warning, steps and quiz; stated as hygiene, not as a regulatory claim.
- The 10.3 mini-project is on the template (optionally on the learner), and it points to P13 as the module's larger practical piece.

## Open questions
- None blocking. The module quiz intro also says the module is optional; adjust if Tal prefers the quiz to be required for course completion.
- `references/materials.md` could get the small additions in materials-10.md.
