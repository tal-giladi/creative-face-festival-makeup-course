# Creative Face & Festival Makeup — course plan

> **Course guidelines (binding):** before writing or changing any course content, read
> `C:\Users\TalGiladi\OneDrive\repos\tals-academy\docs\new-course-instructions.md`. It wins over
> anything in this file or the course plan unless Tal says otherwise in chat.

Create a **free, beginner-friendly course** for Tal's Academy called:

**Creative Face & Festival Makeup — From First Brushstroke to Artistic Designs**

The goal is to teach a complete beginner how to create attractive artistic face-painting and makeup
designs without requiring previous makeup, art, or drawing experience.

## How and where to build it

- Build the course in this repo (`course-creator/creative-face-festival-makeup-course`; run `git init` first, GitHub repo
  `tal-giladi/creative-face-festival-makeup-course`, public). Never edit the Academy repo; the Academy imports the course
  from GitHub later.
- Follow the guidelines' repo layout, `_sidebar.md`, lesson front-matter and quiz format exactly.
  Plain markdown and YAML only, English only, UTF-8, LF line endings.
- Before writing content:
  - `curriculum/course-details.md` (guidelines section 8): slug `face-festival-makeup`, free, and a risk notice,
    e.g. "Use only products made for skin, and keep anything not approved for the eye area away from
    the eyes. Patch-test new products and stop if skin reacts.";
  - `BUILD_PROGRESS.md` with every module as a checkbox, and `TODO_FOR_TAL.md` for anything Tal must
    decide (for example whether Level 4 is listed as an optional final module or as projects only).
- Work module by module, at most two writing agents at a time, commit after every module, and run
  the Academy dry-run import after every module until it reports `0 problems` (guidelines sections
  9-10).

## Course philosophy

Make the course:

- **Short and modular**, not a huge professional makeup course.
- Accessible to someone with **zero experience**.
- Progressive: each section teaches useful skills on its own, while later sections build naturally
  on earlier ones.
- A learner should be able to **stop after any major section and already have a practical skill**.
- **Learning by doing:** every lesson ends in something the learner paints, on paper, a printed
  template or their own hand/arm. Theory is kept to a few short paragraphs.
- Use very simple explanations and avoid assuming artistic ability.
- Prefer inexpensive, commonly available materials.
- Never make a specific brand or product mandatory when an equivalent alternative exists.

## Course structure

Levels are stage lines in `_sidebar.md` (plain text). Each level contains one or more modules
(`- **Module N — Title**`), each with its lessons and a module quiz. Suggested split (adjust when
writing the outline in `curriculum/`):

### Level 1 — Creative Face Painting

- Module 1 — Tools, materials and safety: basic tools and paints, skin-safe materials, hygiene,
  patch testing, removal.
- Module 2 — Brush control: lines, dots, curves, spirals and simple shapes.
- Module 3 — Color: color mixing, simple gradients, symmetry.
- Module 4 — First designs: flowers, stars, hearts, butterflies, simple animals, rainbows, simple
  superhero/fantasy designs.

Ends with several complete beginner projects.

### Level 2 — Festival & Trance Makeup

- Stronger color combinations, symmetrical face designs.
- Cosmetic glitter, face gems and skin-safe adhesives.
- Neon/UV-style looks (which UV/fluorescent pigments are permitted where, and which are not allowed
  near the eyes).
- Geometric and psychedelic patterns, bold eye-area designs.
- Combining face paint with conventional makeup.
- Creating a complete festival/trance look.

Ends with several complete looks of increasing difficulty.

### Level 3 — Fantasy & Artistic Makeup

- Advanced gradients, complex patterns, illusions.
- Fantasy characters, decorative masks.
- More sophisticated color composition.
- Turning a simple idea into a complete face design; designing an original artistic look.

Ends with several portfolio-quality projects.

### Optional Level 4 — Body Art

Show how the same principles transfer from the face to hands, arms, shoulders and upper body. Keep
it short and clearly marked optional in the module title and intro so the core course stays short
(Tal decides how it is listed; see `TODO_FOR_TAL.md`).

## Materials

This is extremely important. Design the course around **accessibility and substitutions**.

For every material, explain:

1. What it is used for.
2. The ideal material.
3. A cheaper/easier-to-find alternative.
4. What characteristics the substitute should have.

For example, don't simply say "Use a #4 round face-painting brush." Explain what the brush needs to
accomplish and suggest several practical alternatives.

Do the same for brushes, sponges, face paints, cosmetic glitter, gems, applicators, makeup products,
mixing palettes, water containers and cleaning materials. Collect them in a materials reference page
(`references/materials.md`, linked from the top of `_sidebar.md`) and repeat the relevant items in
each lesson's Materials section.

Prefer materials that can realistically be bought in ordinary art stores, cosmetic stores,
supermarkets, or inexpensive online marketplaces.

**Safety matters.** Clearly distinguish products intended for skin/face use from ordinary craft
paints, glitter, glue, markers, etc. Never recommend putting an unsuitable craft product on skin
simply because it is cheap. Safety content opens with `> [!WARNING]` or `> [!CAUTION]`.

**Up to date:** verify safety and product guidance against current primary sources before writing
(e.g. FDA color-additive and face-paint guidance, EU Cosmetics Regulation and its annex of permitted
colorants, current guidance on cosmetic vs craft glitter and on eye-area use). Record them in each
lesson's `sources` front-matter with `last_verified`. Product availability and prices change: mark
those lessons `volatility: implementation`.

## Visual teaching

Because this is an artistic course, make it **highly visual**. Whenever possible, include
step-by-step drawings, diagrams, before/after examples, face maps showing where each element goes,
brush-stroke diagrams, color-combination examples, and finished examples.

For example, when teaching a butterfly design, show **Step 1 → Step 2 → Step 3 → Step 4 → Finished
butterfly** as a sequence of images. Likewise for gradients, rainbows, flowers, stars, symmetry, etc.
Use visuals so the instructions are understandable even when the learner's English is limited.

Format rules (guidelines section 4):

- Images are SVG (preferred) or PNG files under `assets/`, linked with
  `![meaningful alt text](../../assets/m04-butterfly-step-1.svg)`. No inline `<svg>` or HTML boxes.
- Every image has alt text that describes the step in words, so the lesson still works without it.
- A YouTube demo may be linked alone on its own line if a good, current one exists.
- Optional simulations (guidelines section 7), e.g. a color-mixing or symmetry practice tool, are
  welcome if they help; plain HTML/JS, no network requests, labelled "educational model".

## Practice without needing another person

Learners must be able to practise **without a human model**. The course never assumes the learner
has a child, friend, model, or professional mannequin available.

Provide printable **practice face templates** (SVG and/or PDF): front-facing blank face, left/right
face, eye area, half face, and arm/hand/upper-body templates for Level 4. Put each module's
printables in `labs/module-NN/` with a `README.md` (the Academy offers that folder as the module's
zip download) and shared templates in `labs/common/`. Lessons link to `../../labs/module-NN/`.

Exercises practise lines, shapes, symmetry, color combinations and complete designs: first on paper
or a printed template, then on the learner's own hand or arm, then on the face.

## Lessons

Keep lessons short (`minutes` reading time small, `practice_minutes` most of the time). Each lesson
uses this fixed set of `##` sections (guidelines section 4: one fixed set for the whole course):

1. **Materials**
2. **How it works** (very short explanation)
3. **Demonstration** (the visual step sequence)
4. **Step by step**
5. **Practice exercise**
6. **Mini-project**
7. **Common beginner mistakes**
8. **Optional challenge**

"What you will learn" is the lesson's `objectives` front-matter plus its intro paragraph. There is no
quiz section in the markdown: each lesson has a `.quiz.yaml` with 3-5 multiple-choice questions.

## Progressive difficulty

Mark every lesson Beginner, Beginner+, Intermediate or Advanced, as the first words of the lesson's
intro paragraph (e.g. "Beginner · 25 minutes. …"), and in each project brief.

Do not introduce a technique that depends heavily on an unexplained earlier technique. If something
from an earlier lesson is required, link back to it and list it in `prerequisites`.

## Quizzes

Every lesson has a `.quiz.yaml` (3-5 questions) and every module a module quiz (8-10 questions,
pass mark 70%), following guidelines section 5 exactly. Questions are practical decisions, not
recall, for example:

- Which product is safe for a design around the eyes?
- A gradient looks streaky: what is the most likely cause and fix?
- Where on the face map does the butterfly's body go for a symmetrical result?

## Projects

Make projects increasingly impressive:

- **Level 1:** rainbow, butterfly, flower, simple animal, star design.
- **Level 2:** festival eye design, neon-inspired design, glitter/gem design, symmetrical trance
  design.
- **Level 3:** fantasy character, artistic mask, complex original face design.

Each project is a page in `projects/` (imported as the Projects section) with: finished reference
image, materials, difficulty, estimated time, step-by-step instructions, a practice version on the
printable template, optional variations, and a self-check list ("you're done when…"). Each module
ends with its project or a larger practical piece that uses everything in it.

## Accessibility

Design the course for people who may have very limited artistic ability, very little money, limited
access to specialty makeup products, no model to practise on, and no previous makeup experience.

- Never assume that "everyone knows" a basic technique.
- Explain unfamiliar terminology the first time it appears and collect it in `glossary.md`.
- Where a technique can be done several ways, show the simplest method first and the professional
  method as an optional upgrade.

## Final course design

The finished course should feel like: **"I have never done this before → I can make a simple face
design today → I can create a festival look → I can eventually create my own artistic designs."**

Do not turn this into a professional certification course or an exhaustive makeup encyclopedia.
Prioritise **accessibility, visual learning, short lessons, practical exercises, inexpensive
materials, and satisfying results**. The course is published free on Tal's Academy.

## Done when

The guidelines' section 10 checklist passes, `npm run check-course -- ../course-creator/creative-face-festival-makeup-course`
reports `0 problems`, every image and printable link resolves, everything is committed, and
`TODO_FOR_TAL.md` says the course is ready to import with the repo name and commit.
