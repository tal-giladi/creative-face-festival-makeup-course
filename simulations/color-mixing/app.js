// Paint mixing plate - educational model.
// Each paint is a reflectance curve (how much light it reflects at 8 points across the visible
// spectrum). Mixing takes a weighted geometric mean of the curves, a simple stand-in for how
// pigments absorb light together (subtractive mixing). The result is turned into a screen color
// with the CIE 1931 color matching functions and sRGB.

const PAINTS = [
  { id: 'yellow', name: 'Yellow', curve: [0.05, 0.06, 0.18, 0.62, 0.86, 0.88, 0.88, 0.88] },
  { id: 'red', name: 'Red (orange-red)', curve: [0.06, 0.05, 0.04, 0.04, 0.06, 0.5, 0.85, 0.88] },
  { id: 'pink', name: 'Pink (cool red)', curve: [0.58, 0.42, 0.15, 0.06, 0.12, 0.62, 0.88, 0.9] },
  { id: 'blue', name: 'Blue', curve: [0.36, 0.52, 0.42, 0.25, 0.07, 0.035, 0.03, 0.05] },
  { id: 'white', name: 'White', curve: [0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9] },
  { id: 'black', name: 'Black', curve: [0.012, 0.012, 0.012, 0.012, 0.012, 0.012, 0.012, 0.012] },
];
const MAX = 20;

// ---------- color science ----------
const g = (x, m, s1, s2) => { const t = (x - m) / (x < m ? s1 : s2); return Math.exp(-t * t / 2); };
const cmf = (l) => [
  1.056 * g(l, 599.8, 37.9, 31) + 0.362 * g(l, 442, 16, 26.7) - 0.065 * g(l, 501.1, 20.4, 26.2),
  0.821 * g(l, 568.8, 46.9, 40.5) + 0.286 * g(l, 530.9, 16.3, 31.1),
  1.217 * g(l, 437, 11.8, 36) + 0.681 * g(l, 459, 26, 13.8),
];
const WL = []; for (let l = 400; l <= 700; l += 10) WL.push(l);
const CTRL = [410, 450, 490, 530, 570, 610, 650, 690];
function dense(c) {
  return WL.map((l) => {
    if (l <= CTRL[0]) return c[0];
    if (l >= CTRL[7]) return c[7];
    let i = 0; while (l >= CTRL[i + 1]) i++;
    const t = (l - CTRL[i]) / 40; return c[i] + (c[i + 1] - c[i]) * t;
  });
}
for (const p of PAINTS) p.dense = dense(p.curve);
const toXYZ = (R) => { let X = 0, Y = 0, Z = 0; WL.forEach((l, i) => { const [x, y, z] = cmf(l); X += x * R[i]; Y += y * R[i]; Z += z * R[i]; }); return [X, Y, Z]; };
const lin = ([X, Y, Z]) => [3.2406 * X - 1.5372 * Y - 0.4986 * Z, -0.9689 * X + 1.8758 * Y + 0.0415 * Z, 0.0557 * X - 0.204 * Y + 1.057 * Z];
const WHITE = lin(toXYZ(WL.map(() => 1)));

function linearRGB(R) { return lin(toXYZ(R)).map((v, i) => Math.max(0, Math.min(1, v / WHITE[i]))); }
const gam = (v) => (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055);
const hex = (rgb) => '#' + rgb.map((v) => Math.round(gam(v) * 255).toString(16).padStart(2, '0')).join('');

// CIELAB from the reflectance (relative to the equal-energy white), for "how close" checks.
function lab(R) {
  const W = toXYZ(WL.map(() => 1)), [X, Y, Z] = toXYZ(R);
  const f = (t) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116);
  const fx = f(X / W[0]), fy = f(Y / W[1]), fz = f(Z / W[2]);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

function mixCurve(drops) {
  const total = Object.values(drops).reduce((a, b) => a + b, 0);
  if (!total) return null;
  return WL.map((_, i) => Math.exp(PAINTS.reduce((a, p) => a + ((drops[p.id] || 0) / total) * Math.log(p.dense[i]), 0)));
}

// ---------- state ----------
const drops = Object.fromEntries(PAINTS.map((p) => [p.id, 0]));
const TARGETS = [
  { name: 'Orange', recipe: { yellow: 3, red: 1 } },
  { name: 'Grass green', recipe: { yellow: 3, blue: 1 } },
  { name: 'Sea green', recipe: { yellow: 1, blue: 1 } },
  { name: 'Baby pink', recipe: { white: 3, red: 1 } },
  { name: 'Sky blue', recipe: { white: 3, blue: 1 } },
  { name: 'Bright purple', recipe: { pink: 1, blue: 1 } },
  { name: 'Lilac', recipe: { white: 3, pink: 1, blue: 1 } },
  { name: 'Brown', recipe: { red: 2, yellow: 2, blue: 1 } },
  { name: 'Gray', recipe: { white: 3, black: 1 } },
  { name: 'Dark red', recipe: { red: 5, black: 1 } },
];
for (const t of TARGETS) { const c = mixCurve(t.recipe); t.hex = hex(linearRGB(c)); t.lab = lab(c); }

const $ = (id) => document.getElementById(id);
const potsEl = $('pots');

function recipeText(d) {
  const parts = PAINTS.filter((p) => d[p.id]).map((p) => `${d[p.id]} ${p.id}`);
  return parts.length ? parts.join(' + ') : '';
}

function advice(d) {
  const total = Object.values(d).reduce((a, b) => a + b, 0);
  if (!total) return [];
  const has = (k) => d[k] > 0;
  const hues = ['yellow', 'red', 'pink', 'blue'].filter(has);
  const out = [];
  if (hues.length >= 3) out.push('Three colors together turn brown and muddy. Keep a mix to two colors, plus white or black.');
  if (has('red') && has('blue') && !has('pink')) out.push('Orange-red and blue make a dull purple. For a bright purple, use pink and blue.');
  if (has('yellow') && has('black') && hues.length === 1) out.push('Yellow and black make olive green, not dark yellow.');
  if (has('black') && hues.length && d.black / total >= 0.2) out.push('Black is strong: one drop changes a lot. Too much makes colors look dirty.');
  if (has('white') && hues.length && d.white / total >= 0.5) out.push('Lots of white makes a tint: a soft pastel.');
  if (has('black') && has('white') && !hues.length) out.push('White and black make gray.');
  if (!out.length && hues.length === 2) out.push('Two colors: a clean mix. Add more of the light one to make it lighter.');
  return out;
}

function render() {
  const curve = mixCurve(drops);
  const mixEl = $('mix');
  if (!curve) {
    mixEl.style.background = 'transparent';
    mixEl.classList.add('empty');
    mixEl.setAttribute('aria-label', 'Empty plate');
    $('recipe').textContent = 'The plate is empty. Add a drop of paint.';
    $('advice').textContent = '';
    $('mineSwatch').style.background = 'transparent';
    $('mineSwatch').classList.add('empty');
  } else {
    const h = hex(linearRGB(curve));
    mixEl.classList.remove('empty');
    mixEl.style.background = h;
    mixEl.setAttribute('aria-label', `Your mix: ${recipeText(drops)}`);
    $('recipe').textContent = `Your mix: ${recipeText(drops)}`;
    $('advice').textContent = advice(drops).join(' ');
    $('mineSwatch').style.background = h;
    $('mineSwatch').classList.remove('empty');
  }
  for (const p of PAINTS) {
    $(`n-${p.id}`).textContent = String(drops[p.id]);
    $(`minus-${p.id}`).disabled = drops[p.id] === 0;
    $(`plus-${p.id}`).disabled = drops[p.id] >= MAX;
  }
  $('save').disabled = !curve;
  match(curve);
}

function match(curve) {
  const t = TARGETS[$('target').selectedIndex];
  $('targetSwatch').style.background = t.hex;
  $('targetSwatch').setAttribute('aria-label', `Target: ${t.name}`);
  if (!curve) { $('match').textContent = `Mix ${t.name.toLowerCase()} on the plate.`; return; }
  const m = lab(curve), d = Math.hypot(m[0] - t.lab[0], m[1] - t.lab[1], m[2] - t.lab[2]);
  const tips = [];
  if (m[0] - t.lab[0] > 6) tips.push('yours is lighter');
  if (t.lab[0] - m[0] > 6) tips.push('yours is darker');
  const cm = Math.hypot(m[1], m[2]), ct = Math.hypot(t.lab[1], t.lab[2]);
  if (ct - cm > 10) tips.push('yours is duller');
  if (cm - ct > 10) tips.push('yours is brighter');
  let msg;
  if (d < 6) msg = 'Match! Write the recipe down.';
  else if (d < 14) msg = 'Very close.';
  else if (d < 28) msg = 'Getting closer.';
  else msg = 'Not yet.';
  $('match').textContent = msg + (d >= 6 && tips.length ? ` Hint: ${tips.join(', ')}.` : '');
}

// ---------- build the UI ----------
for (const p of PAINTS) {
  const li = document.createElement('div');
  li.className = 'pot';
  const fill = hex(linearRGB(p.dense));
  li.innerHTML = `<div class="cake" style="background:${fill}" aria-hidden="true"></div>
    <div class="pot-name">${p.name}</div>
    <div class="pot-ctrl">
      <button type="button" id="minus-${p.id}" aria-label="Remove a drop of ${p.id}">&minus;</button>
      <output id="n-${p.id}" aria-label="${p.id} drops">0</output>
      <button type="button" id="plus-${p.id}" aria-label="Add a drop of ${p.id}">+</button>
    </div>`;
  potsEl.appendChild(li);
  li.querySelector(`#plus-${p.id}`).addEventListener('click', () => { if (drops[p.id] < MAX) { drops[p.id]++; render(); } });
  li.querySelector(`#minus-${p.id}`).addEventListener('click', () => { if (drops[p.id] > 0) { drops[p.id]--; render(); } });
}
for (const t of TARGETS) { const o = document.createElement('option'); o.textContent = t.name; $('target').appendChild(o); }
$('target').addEventListener('change', () => render());

$('clear').addEventListener('click', () => { for (const k in drops) drops[k] = 0; render(); });
$('save').addEventListener('click', () => {
  const curve = mixCurve(drops); if (!curve) return;
  const li = document.createElement('li');
  const h = hex(linearRGB(curve));
  li.innerHTML = `<span class="chip" style="background:${h}" aria-hidden="true"></span><span>${recipeText(drops)}</span>`;
  const chart = $('chart');
  chart.appendChild(li);
  while (chart.children.length > 12) chart.removeChild(chart.firstChild);
});

// Optional preset from the link, e.g. ?target=Brown
try {
  const want = new URLSearchParams(location.search).get('target');
  const i = TARGETS.findIndex((t) => t.name.toLowerCase() === String(want || '').toLowerCase());
  if (i >= 0) $('target').selectedIndex = i;
} catch { /* ignore */ }
render();
