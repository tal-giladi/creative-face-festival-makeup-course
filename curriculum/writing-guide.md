# Writing guide for module agents

Read before writing anything, in this order:

1. `C:\Users\TalGiladi\OneDrive\repos\tals-academy\docs\new-course-instructions.md` (binding; wins over everything here).
2. `curriculum/plan.md` (the course plan) and `curriculum/outline.md` (your module's lessons, levels,
   hands-on results and projects; titles there are fixed).
3. This guide.
4. `curriculum/research/safety-sources.md` (verified safety and regulatory facts, with URLs), and
   `references/materials.md` and `references/safety.md` (what the course already says).
5. The finished example lesson `lessons/module-01/lesson-01.md`, its `.quiz.yaml`, and
   `curriculum/tools/assets-m01.mjs`. Match their tone, length, structure and drawing style.

## What you own

Only your module: `lessons/module-NN/`, `assessments/module-NN-quiz.*`, `labs/module-NN/`,
`assets/mNN-*`, `curriculum/tools/assets-mNN.mjs`, `curriculum/tools/sheets-mNN.mjs`,
`curriculum/status/module-NN.log`, your inbox files (below), and the project pages assigned to your
module in `curriculum/outline.md`. Never edit `_sidebar.md`, `README.md`, `glossary.md`,
`references/`, `templates/`, `labs/common/`, `curriculum/tools/lib/`, or another module's files.
Never run git. If the shared library lacks something you need, write a local helper in your own
`assets-mNN.mjs` and say so in your notes inbox.

## Who the learner is

A complete beginner: no makeup, art or drawing experience, little money, maybe no specialty shop
nearby, and **no model** (no child, friend or mannequin). Their English may be limited. So:

- Short sentences, everyday words, warm "you". Explain every new word the first time it appears
  and add it to your glossary inbox. Never "as everyone knows".
- Simplest method first; the professional method as an optional upgrade.
- The pictures must teach on their own: a learner who reads little English should be able to follow
  the step strip.
- Practice order, always: paper or printed template -> own hand/arm -> own face (in a mirror) or a
  willing person's face. Never require another person.
- US spelling (color, center, gray, practice as verb and noun).

## Lesson file

Front-matter (all fields, in this order):

```yaml
---
id: "04.3"
module: 4
minutes: 6                  # reading time, target 4-8
practice_minutes: 35        # hands-on time, most of the lesson
prerequisites: ["02.2", "03.4"]   # earlier lesson ids only; [] for none
objectives:
  - Measurable objective that starts with a verb (2-4 of them).
volatility: concept         # implementation for lessons naming products, brands, prices, regulations
sources:
  - title: "Source actually used"
    url: https://...
last_verified: "2026-10-07"
---
```

Then the H1 `# NN.M · <exact title from outline.md>`, then ONE plain intro paragraph (no heading,
list, bold, link or image at the start). It starts with the level and time, exactly like
`Beginner · 40 minutes.` (minutes = reading + practice, rounded to 5), then says in 1-3 sentences
what the learner will be able to paint after the lesson. This paragraph plus `objectives` is the
"What you will learn".

Then exactly these `##` sections, in this order, in every lesson (use `###` inside them):

1. `## Materials` — a short list. For each item: what it does here, the ideal item, a cheap or easy
   substitute and what the substitute must be able to do (one line each is fine; link
   `../../references/materials.md` for the full story). Name the printables
   (`../../labs/module-NN/` or `../../labs/common/`) and say "or draw the outline freehand".
2. `## How it works` — the idea in 1-3 short paragraphs (why the stroke, blend or layout works).
3. `## Demonstration` — the step strip(s) and any diagrams: `![alt](../../assets/mNN-lMM-name.svg)`
   with a sentence each saying what to notice. Optional YouTube link alone on its own line (see Videos).
4. `## Step by step` — numbered steps matching the strip panels, each one short and physical
   ("Load the brush to the tip", "Press down as you pull, lift at the end").
5. `## Practice exercise` — the drill: on paper or a template first, then on the hand/arm. Say how
   long, how many repeats and how you know it worked ("Stop when …"). Optional
   `<details><summary>Hint</summary>…</details>`.
6. `## Mini-project` — one small finished piece using the lesson (on a template, hand, arm or face),
   with a 3-5 item "You're done when" checklist (`- [ ]`). The last lesson of each module makes its
   mini-project the module's larger practical piece (or points to the module's project pages).
7. `## Common beginner mistakes` — 3-5 symptom -> cause -> fix items (a table is fine). Add each to
   your troubleshooting inbox.
8. `## Optional challenge` — one harder variation for those who want more. Core content never
   depends on it, and quizzes never test it.

No quiz/knowledge-check/assessment section. No other `##` headings.

### Safety (always)

- Facts must match `curriculum/research/safety-sources.md` and `references/safety.md`. Do not add
  safety or regulatory claims from memory; if you need a fact that is not there, verify it with
  WebSearch/WebFetch on a primary source (FDA, EU law/CosIng, UK government, a manufacturer's own
  page), cite it in `sources`, and put it in your notes inbox for the main session.
- Any lesson touching products on skin, eyes, adhesives, glitter, UV/neon, removal or hygiene puts a
  `> [!WARNING]` or `> [!CAUTION]` at the top of `## Materials` (or where the risky step is).
- Never suggest craft paint, acrylics, markers, craft glitter, school glue, superglue, eyelash glue
  on large areas, or "black henna" on skin. If cheapness tempts, say plainly why not and what to use.
- Eye area: only products whose label allows eye-area use; no glitter or gems on the eyelid near
  the lash line for beginners; no UV/fluorescent pigments near the eyes unless the label allows it.
- Never paint over broken, sunburned or irritated skin; patch-test new products (lesson 01.3).

## Diagrams (`assets/`)

All demonstrations are drawn SVG made by your script `curriculum/tools/assets-mNN.mjs` with the
shared library. Read these files before you start:

- `curriculum/tools/lib/face.mjs` — the face (400 x 500 frame, center x = 200), landmarks `L`
  (eyeL, cheekL, templeL, forehead, …), `SKIN` tones, `ARM`, `BODY`, `circleD`, `handSVG` (filled hand + forearm).
- `curriculum/tools/lib/art.mjs` — paint colors `P`; `stroke` (thin-thick-thin brush stroke through
  points), `line`, `teardrop`, `petal`, `dot`, `dots`, `spiral`, `star`, `sparkle`, `heart`,
  `sponge` (soft gradient fill), `glow`, `stipple`, `glitter`, `gem`, `cake`, `brush`, `curlPts`, `label`,
  `arrow`, `badge`, `tick`, `cross`.
- `curriculum/tools/lib/figure.mjs` — `faceFig` (one face with `under` = paint layer below the
  eyes/brows/lips, `over` = gems/labels on top, `view` to crop), `strip` (Step 1 -> 2 -> … -> Done
  sequence of panels), `facePanel`, `paperPanel`, `plain` (any diagram).
- `curriculum/tools/assets-m01.mjs` — the worked example.

Rules:

- Every design lesson has at least one step strip (`strip`) that shows the design built up step by
  step, ending in a "Done" panel. Technique lessons show the stroke or blend step by step on paper
  (`paperPanel`). Add a good-vs-bad comparison where a mistake is common (`tick`/`cross`).
- Rotate skin tones across lessons (`light`, `fair`, `medium`, `tan`, `brown`, `deep`) so the
  course shows many skin tones. Check white and pale paint still reads on light skin (add a thin
  gray outline if needed) and dark paint on deep skin.
- Designs placed with the landmarks so they sit where the face map says. Symmetric designs: draw
  one half and mirror it (`transform="translate(400 0) scale(-1 1)"`).
- Naming: `assets/mNN-lMM-short-name.svg` (projects: `assets/pNN-short-name.svg`).
- Few labels, short, font size ≥ 13; no text-heavy images. Explanations go in the markdown.
- Alt text describes the step in words, so the lesson works without the picture
  ("Step 2: a white teardrop on each side of the black body, tails pointing down").
- Render every SVG to PNG and look at it before you use it:
  `node curriculum/tools/render.mjs <your scratch dir> assets/mNN-*.svg`, then view the PNGs. Fix
  shapes until they look like a clean, attractive face-painting design a beginner would want to copy.
  This is the course's only demonstration material, so quality matters more than quantity: 2-5
  diagrams per lesson.

## Printables (`labs/module-NN/`)

- Shared templates are in `labs/common/` (face-front, face-front-open-eyes, face-front-2up,
  face-map, half-face-left/right, eye-area, hand-arm, upper-body, swatch-card). Use them first.
- Add module sheets only when lessons need them (stroke drill sheets with gray models to trace,
  design outlines to trace on a face template, palette cards): `curriculum/tools/sheets-mNN.mjs`
  with `curriculum/tools/lib/sheet.mjs` (`Sheet`, `frame`, `path` to place face paths, `pline`,
  `text`, `rect`, `circle`) and `FACE` from `face.mjs`. Every sheet in A4 and Letter, saved with
  `sheet.save(path)` (writes PDF + SVG). See `curriculum/tools/sheets-common.mjs`.
- `labs/module-NN/README.md` (always, even if it only points to `labs/common/`): what each sheet is
  for, which lesson uses it, print at 100% ("Actual size") and check the 10 cm line, and the
  sheet-protector trick (slide the template into a clear plastic sleeve and paint on the plastic;
  wipe clean and repeat).

## Projects (`projects/`)

Project pages: front-matter is not needed. H1 `# Project N · Title`, then one plain intro paragraph
starting with level and time (`Beginner+ · 60 minutes.`), then exactly these `##` sections:
Finished look (the reference image + what makes it work), Materials, Step by step (with a step
strip), Practice version (on which printable template, first), Variations, You're done when (a
`- [ ]` self-check list). Link the lessons it uses by path.

## Videos

Optional, never required, at most one per lesson. Only a current video from a reputable face-paint
artist, brand or educator, and only after confirming it exists by fetching
`https://www.youtube.com/oembed?url=<video url>&format=json` (a 200 with the title). Link alone on its
own line in `## Demonstration` with a sentence before it saying what to watch for. Zero is fine.

## Quizzes

- `lessons/module-NN/lesson-MM.quiz.yaml`: 3-5 questions. `assessments/module-NN-quiz.quiz.yaml`:
  8-10 scenario questions. Follow guidelines §5 exactly (4 options, one correct, `correct` 0-3
  spread ~evenly with no pattern, explanation 1-3 sentences, `>-` block scalars, no all/none of the
  above, correct option not longer than the others).
- Practical decisions, not recall: "Your gradient looks streaky. What is the most likely cause?",
  "Which product can go around the eyes?", "Where on the face map does the butterfly's body go?"
  Wrong options are real beginner beliefs (more water, press harder, craft glitter is fine if it's
  fine, glue from the drawer).
- Only core content (never the Optional challenge).
- Parse every file and check counts, spread and lengths:
  `node curriculum/tools/check-quiz.mjs lessons/module-NN assessments` (prints problems; fix until clean).
- Module quiz page `assessments/module-NN-quiz.md`: H1 `# Module N quiz`, a short paragraph on what it
  covers, the pass mark (70%), links back to the module's lessons. No questions, no answers.

## Inbox files (the main session merges these)

- `curriculum/inbox/glossary-NN.md` — `- **term** — plain definition (NN.M)`.
- `curriculum/inbox/troubleshooting-NN.md` — `- symptom | likely cause | fix | NN.M`.
- `curriculum/inbox/materials-NN.md` — any material or substitute your lessons use that
  `references/materials.md` lacks, in its format.
- `curriculum/inbox/notes-NN.md` — open questions, new safety facts with sources, decisions.

## Status

After each finished lesson (lesson `.md` + `.quiz.yaml` + its diagrams) append `lesson-MM done` to
`curriculum/status/module-NN.log`; after the module quiz, printables and projects, append
`module done`. On start, read that log and skip finished lessons.

## Before you report done

Run the dry-run import and fix every problem in your module:

```bash
cd C:/Users/TalGiladi/OneDrive/repos/tals-academy && npm run check-course -- ../course-creator/creative-face-festival-makeup-course
```

Problems in other modules (lessons not yet written) are expected; only yours must be zero. Report:
files written, any open question, and the check result for your module.
