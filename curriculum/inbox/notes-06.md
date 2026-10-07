# Module 6 notes (for the main session)

## New facts checked on 2026-10-07 (beyond curriculum/research/safety-sources.md)

- AAO "How To Use Cosmetics Safely Around Your Eyes" (re-fetched): "Larger glitter or inclusions in
  makeup can scratch the eye, much like getting sand or dirt in your eye"; glitter eye makeup "is a
  common cause of corneal irritation or infection, especially for people who wear contact lenses".
  Used in 06.1-06.3 and P8 for "craft glitter / glitter near eyes".
- EU 2023/2055 Commission page (re-fetched): dates as in safety-sources (craft loose glitter banned
  17 Oct 2023; rinse-off to 16 Oct 2027, leave-on to 16 Oct 2029, make-up/lip/nail to 16 Oct 2035,
  microplastics label from 17 Oct 2031); not covered: "inorganic (e.g. glass, metal), natural,
  biodegradable or soluble in water". Lessons say "which date applies depends on product type" and do
  not claim GB/NI status (only "rules in the UK and elsewhere may differ").
- National Geographic (19 Jul 2024, re-fetched): conventional glitter = plastic core + reflective
  coating + plastic layer; cellulose glitter from eucalyptus pulp, sometimes coated; one study found
  cellulose and mica glitter more damaging to duckweed/phytoplankton than conventional glitter. Hence
  "lower-impact, not eco-safe".
- Mehron GlitterDust (manufacturer page): ingredients start "Polyethylene Terephthalate,
  Polyurethane-33..." (example that cosmetic plastic glitter lists PET); directions: apply to damp
  paint or cream makeup for best hold. Used for "plastic glitter often lists PET" and "glitter sticks
  to slightly damp face paint". NatGeo does not name PET.
- TAG Bio-Glitter (Art Factory retailer page): eucalyptus cellulose; "tap over face or body designs
  using aloe gel, glitter gel, or a cosmetic-grade adhesive"; removes with soap and water. Supports
  aloe gel as a glitter base.
- Ontario Poison Centre super glue page (re-fetched): skin - leave or soak in warm water, don't pull
  skin apart, mineral/vegetable oil or petroleum jelly for tender skin or around the eyes; eye - rinse
  with lukewarm water if lids not stuck; if stuck, warm compress, no alcohol/acetone, call the Poison
  Centre. Used in 06.3 and the module quiz.
- Jest Paint "UV/Neon fluorescent paints" (retailer page): neon/UV colors marked Special FX "are not
  considered a cosmetic product within the USA and Europe", sold "to be used on paper, clothing, over
  prosthetics"; non-day-glow UV colors (often blue, purple, white) look dull unless under black light.
  Used in 06.4 label reading and daylight-vs-UV. Mehron Paradise neon SFX shades confirm the pattern
  (retailer listings, search only).

## Unconfirmed / not claimed

- UV torch (365 nm) eye safety: no primary consumer page could be loaded (US Army Public Health Center
  "Hazard Alert for Ultraviolet-A Flashlights and Black Lights" is blocked by a firewall; its indexed
  text says UV-A lamps "pose a hazard to the eye" but would not injure in normal use). The course only
  says "never shine it into anyone's eyes" (already in references/materials.md), without a cited
  statistic.
- "Don't rub the eye if a flake gets in; blink and rinse" (06.2) is general first aid, consistent with
  safety.md's rinse-then-seek-help rule; no new source.
- Pros-Aide being latex-free remains unconfirmed; lessons do not claim it.
- Choking hazard of gems for small children: common sense (as in safety-sources section 10); stated
  as "small enough to swallow".

## Decisions

- Eye zones: glitter and gems use a small no-go zone (lids, lash line, just under the eye); neon/UV/glow
  uses the larger eye area including the brows, matching m01-l02-neon. Both are drawn on the maps.
- Skin tones: 06.1 medium (arm), 06.2 deep (roots on brown), 06.3 light, 06.4 tan, P7 brown, P8 fair.
- 06.4's mini-project is the Module 6 practical: paint P7 or P8.
- Prerequisites link to Module 5 lessons by id/path (05.1, 05.2, 05.3, 05.4), written in parallel.
  06.4 links lesson-04 of module 5 for "eye-safe colors" and 05.1/05.3 for bold color and symmetry;
  06.2 lists 05.2 (skin prep and setting); 06.3 links 05.3 (planning a layout with dots).

## Tools

- curriculum/tools/assets-m06.mjs (all m06-* and p07-*/p08-* assets) exports ZONES and LINEART;
  curriculum/tools/sheets-m06.mjs imports them (running it also regenerates the assets). Local helpers
  that could move to lib/: noGo/yesZone hatched zones, glitFill (dense glitter with tint), gel (base
  layer), jar/magnifier, uvLayer + glowing (black-light rendering of a face), fluffy brush, card.
  sheets-m06.mjs has a hatched-ellipse helper for PDF (no clipping in the sheet lib) and a copy of the
  m04 SVG-fragment flattener.
- gem() shapes 'drop' and 'star' use SVG arcs, which lib/geom samplePath does not flatten correctly
  for printables (lines shoot off the page). The P8 sheet uses dots/teardrops instead. Worth fixing in
  the lib if other modules flatten gems.

## Open questions

- None blocking. projects/README.md (if it lists projects) is shared: P7 and P8 need adding there by
  the main session.
