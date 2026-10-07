# Build progress

Goal: build "Creative Face & Festival Makeup — From First Brushstroke to Artistic Designs" per
`curriculum/plan.md`, `curriculum/outline.md` and the binding guidelines
`C:\Users\TalGiladi\OneDrive\repos\tals-academy\docs\new-course-instructions.md`, until the dry-run
import reports `0 problems`.

## Resume procedure

1. Read this file, then `curriculum/status/*.log`. Skip anything already done.
2. Module agents follow `curriculum/writing-guide.md`. At most two writing agents at once, one
   module each. Shared files (`_sidebar.md`, `README.md`, `glossary.md`, `references/`,
   `templates/`, `labs/common/`, `curriculum/tools/lib/`) are edited only by the main session.
3. After each module: `node curriculum/tools/merge-inbox.mjs` (glossary + fix-it guide), merge
   `curriculum/inbox/notes-NN.md` and `materials-NN.md` by hand, run the dry-run import, commit, push.

```bash
cd C:/Users/TalGiladi/OneDrive/repos/tals-academy && npm run check-course -- ../course-creator/creative-face-festival-makeup-course
```

Tools: `curriculum/tools/lib/` (geom, face, art, figure, sheet), `assets-mNN.mjs`, `sheets-mNN.mjs`,
`sheets-common.mjs`, `sidebar.mjs`, `merge-inbox.mjs`, `render.mjs` (SVG -> PNG for checking).

## Units

- [x] Decisions: Level 4 is an optional final module (Tal, 2026-10-07); repo created and pushed by Claude
- [x] Tooling: drawing library (face, strokes, sponge, glitter, gems, step strips), sheet writer
- [x] Common printables (`labs/common`, 10 templates x A4/Letter x PDF/SVG)
- [x] Safety and product research (`curriculum/research/safety-sources.md`)
- [x] Foundations: README, `_sidebar.md`, glossary, templates, references (materials, safety, sources), writing guide
- [x] Example lesson 01.1
- [x] M1 Tools, Materials and Safety
- [x] M2 Brush Control
- [x] M3 Color and Symmetry
- [x] M4 First Designs (+ P1-P5)
- [x] M5 Festival Faces
- [ ] M6 Glitter, Gems and Neon (+ P7, P8)
- [ ] M7 Patterns and Complete Looks (+ P6, P9)
- [ ] M8 Advanced Color and Illusion
- [ ] M9 Fantasy Characters and Masks (+ P10-P12)
- [ ] M10 Body Art (Optional) (+ P13)
- [x] Simulations: color mixing (03.1); symmetry mirror not needed (03.4 works without it)
- [ ] Final QA (dry-run 0 problems, links, renders, sheets print at 100%, git clean)

## Working now

- Agent A: M7 (+ P6, P9). Agent B: M6 (+ P7, P8). Main session: merges inboxes, checks, commits after each module.

## Decisions during the build

- Folder and repo renamed from the generic `makeup-course` to `creative-face-festival-makeup-course`
  (Tal: future makeup courses may exist). Slug `face-festival-makeup`.
- US spelling (color, center, gray) in all learner content.
- All demonstrations are drawn SVG made by the course's own scripts; no photos, no copied images.
- Lesson `##` sections (fixed, every lesson): Materials, How it works, Demonstration, Step by step,
  Practice exercise, Mini-project, Common beginner mistakes, Optional challenge.
- Project `##` sections (fixed, every project): Finished look, Materials, Step by step, Practice
  version, Variations, You're done when.

## Open questions

- QA: turn plain-text "Module 6" mentions in 05.1 and 05.4 into links.
- QA: m02-l05-sampler crops the hand so tightly it reads as a brown block; show the whole hand in final QA.
