const $ = id => document.getElementById(id);
const NS = 'http://www.w3.org/2000/svg';
function el(name, attrs, parent) {
  const e = document.createElementNS(NS, name);
  for (const k in (attrs || {})) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}

/* ───────────── data ───────────── */
// الجزر الأربعة + جزيرة الكنز (الأخيرة)
const ISLANDS = [
  { x: 82,  y: 482, r: 40, name: 'جزيرة الحنان',  obj: '🌴', taps: 3, hint: 'هزّي النخلة 3 مرات',
    item: '🗝️', itemName: 'مفتاح الحنان',  clue: 'انتي أحن حضن في حياتي كلها 🤍', deco: 'palm' },
  { x: 278, y: 388, r: 40, name: 'جزيرة الضحك',   obj: '🐚', taps: 3, hint: 'دوسي على الصدفة 3 مرات',
    item: '🧭', itemName: 'بوصلة الضحك',  clue: 'ضحكتك بتنوّر أي مكان بتدخليه ✨', deco: 'shell' },
  { x: 84,  y: 294, r: 40, name: 'جزيرة الشغف',   obj: '🍾', taps: 3, hint: 'فتحي الإزازة (دوسي 3 مرات)',
    item: '🗺️', itemName: 'خريطة الشغف',  clue: 'انتي رجّعتيلي الشغف في حياتي تاني 🌅', deco: 'rock' },
  { x: 276, y: 200, r: 40, name: 'جزيرة الأمان',  obj: '⚓', taps: 3, hint: 'ارفعي المرساة 3 مرات',
    item: '💎', itemName: 'جوهرة الأمان', clue: 'انتي مصدر أماني وطمأنينتي 🤍', deco: 'light' },
  { x: 164, y: 104, r: 52, name: 'جزيرة الكنز',   final: true, deco: 'treasure' }
];
const START = { x: 180, y: 590 };

// نقطة الرسو: على جنب الجزيرة عشان المركب ميغطيش الاسم
function dock(i) {
  const s = ISLANDS[i];
  const side = s.x < 180 ? 1 : -1;
  return { x: s.x + side * (s.r + 30), y: s.y + 10 };
}

/* ───────────── cat drawing ───────────── */
function catInner(hat) {
  return `
<path d="M92 98 C124 96 122 62 102 64" fill="none" stroke="#E9A56F" stroke-width="9" stroke-linecap="round"/>
<ellipse cx="60" cy="94" rx="34" ry="23" fill="#F2B98A"/>
<ellipse cx="60" cy="100" rx="19" ry="14" fill="#FFF1E2"/>
<ellipse cx="44" cy="113" rx="10" ry="6" fill="#FFF1E2"/><ellipse cx="76" cy="113" rx="10" ry="6" fill="#FFF1E2"/>
<path d="M32 38 L34 10 L56 28 Z" fill="#F2B98A"/><path d="M88 38 L86 10 L64 28 Z" fill="#F2B98A"/>
<path d="M37 32 L38 18 L49 28 Z" fill="#F4B6C2"/><path d="M83 32 L82 18 L71 28 Z" fill="#F4B6C2"/>
<circle cx="60" cy="54" r="31" fill="#F2B98A"/>
<path d="M40 40 q4 -7 8 0 M72 40 q4 -7 8 0" stroke="#E9A56F" stroke-width="3" fill="none" stroke-linecap="round"/>
<ellipse cx="48" cy="55" rx="4.4" ry="5.2" fill="#3A2530"/><ellipse cx="72" cy="55" rx="4.4" ry="5.2" fill="#3A2530"/>
<circle cx="49.6" cy="53" r="1.6" fill="#fff"/><circle cx="73.6" cy="53" r="1.6" fill="#fff"/>
<path d="M56 63 h8 l-4 5 z" fill="#E58AA0"/>
<path d="M60 68 q-5 6 -10 2 M60 68 q5 6 10 2" stroke="#3A2530" stroke-width="1.8" fill="none" stroke-linecap="round"/>
<path d="M30 60 l-16 -3 M30 66 l-16 3 M90 60 l16 -3 M90 66 l16 3" stroke="#8a6a58" stroke-width="1.4" stroke-linecap="round"/>
<ellipse cx="38" cy="65" rx="6" ry="4" fill="#F4A9B8" opacity=".5"/><ellipse cx="82" cy="65" rx="6" ry="4" fill="#F4A9B8" opacity=".5"/>
${hat ? `<path d="M20 32 Q60 -18 100 32 Q60 20 20 32 Z" fill="#3A2530"/>
<path d="M25 31 Q60 18 95 31" stroke="#C9758F" stroke-width="4" fill="none"/>
<text x="60" y="14" text-anchor="middle" font-size="15" fill="#fff">♥</text>` : ''}`;
}
const catSVG = hat => `<svg viewBox="0 0 120 120">${catInner(hat)}</svg>`;
$('catStart').innerHTML = catSVG(true);
$('catBig').innerHTML = catSVG(true);

/* ───────────── sea ───────────── */
const waves = $('waves');
for (let i = 0; i < 26; i++) {
  const x = Math.random() * 340 + 10, y = Math.random() * 620 + 10;
  const p = el('path', { class: 'wave', d: `M${x} ${y} q5 -5 10 0 t10 0` }, waves);
  p.style.animationDelay = (-Math.random() * 4) + 's';
  p.style.animationDuration = (3 + Math.random() * 3) + 's';
}

// route guide lines (between docks)
const routesG = $('routes');
const legs = [];
function ctrl(a, b, k) {
  const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
  const dx = b.x - a.x, dy = b.y - a.y;
  return { x: mx - dy * k, y: my + dx * k };
}
(function buildRoutes() {
  let prev = START;
  ISLANDS.forEach((_, i) => {
    const d = dock(i);
    const c = ctrl(prev, d, i % 2 ? 0.18 : -0.18);
    const path = el('path', { class: 'route', d: `M${prev.x} ${prev.y} Q${c.x} ${c.y} ${d.x} ${d.y}` }, routesG);
    legs.push({ from: prev, to: d, c, path });
    prev = d;
  });
})();

/* ───────────── islands ───────────── */
function palm(g, x, y, s) {
  const p = el('g', { transform: `translate(${x} ${y}) scale(${s})` }, g);
  el('path', { d: 'M0 0 Q4 -14 2 -28', fill: 'none', stroke: '#B58655', 'stroke-width': 4, 'stroke-linecap': 'round' }, p);
  [[-16, -26, -25], [16, -26, 25], [-9, -35, -60], [9, -35, 60], [0, -38, 0]].forEach(l => {
    el('ellipse', { cx: 2 + l[0] * .5, cy: l[1], rx: 14, ry: 4.5, fill: '#7DBE8C', transform: `rotate(${l[2]} 2 -28)` }, p);
  });
  el('circle', { cx: 0, cy: -27, r: 2.6, fill: '#8F6A44' }, p);
  el('circle', { cx: 5, cy: -26, r: 2.6, fill: '#8F6A44' }, p);
}

function buildIsland(i) {
  const s = ISLANDS[i], r = s.r;
  const outer = el('g', { class: 'isl-wrap', transform: `translate(${s.x} ${s.y})`, 'data-i': i }, $('islands'));
  const g = el('g', { class: 'isl', 'data-i': i }, outer);
  const body = el('g', { class: 'body' }, g);

  // glow + pulse
  el('ellipse', { class: 'glow', cx: 0, cy: r * .3, rx: r + 22, ry: (r + 22) * .5, fill: '#FFF7C9', opacity: .0 }, body);
  el('ellipse', { class: 'pulse', cx: 0, cy: r * .3, rx: r + 14, ry: (r + 14) * .5 }, body);
  // foam / sand / grass
  el('ellipse', { cx: 0, cy: r * .34, rx: r + 9, ry: (r + 9) * .45, fill: '#fff', opacity: .55 }, body);
  el('ellipse', { cx: 0, cy: r * .3, rx: r, ry: r * .45, fill: '#F6E3B8' }, body);
  el('ellipse', { cx: 0, cy: r * .1, rx: r * .66, ry: r * .32, fill: '#B9DDB0' }, body);
  el('ellipse', { cx: -r * .12, cy: r * .02, rx: r * .4, ry: r * .2, fill: '#9ACD9F' }, body);

  switch (s.deco) {
    case 'palm':
      palm(body, -8, 4, 1); palm(body, 16, 10, .7); break;
    case 'shell':
      palm(body, 12, 6, .85);
      el('path', { d: 'M-24 14 q8 -14 16 0 z', fill: '#F4B6C2', stroke: '#C9758F', 'stroke-width': 1.2 }, body);
      el('path', { d: 'M-14 20 q6 -10 12 0 z', fill: '#FFE3E9', stroke: '#C9758F', 'stroke-width': 1.2 }, body);
      break;
    case 'rock':
      el('path', { d: 'M-22 14 L-8 -16 L6 14 Z', fill: '#B9B3C6' }, body);
      el('path', { d: 'M0 14 L12 -4 L26 14 Z', fill: '#CFCADA' }, body);
      el('path', { d: 'M-8 -16 L-3 -6 L-13 -6 Z', fill: '#fff', opacity: .8 }, body);
      palm(body, -26, 12, .6);
      break;
    case 'light':
      el('rect', { x: -7, y: -30, width: 14, height: 40, rx: 2, fill: '#fff', stroke: '#E9C5CF', 'stroke-width': 1.2 }, body);
      el('rect', { x: -7, y: -20, width: 14, height: 8, fill: '#C9758F' }, body);
      el('rect', { x: -7, y: -2, width: 14, height: 8, fill: '#C9758F' }, body);
      el('path', { d: 'M-9 -30 L0 -42 L9 -30 Z', fill: '#C9758F' }, body);
      el('circle', { cx: 0, cy: -34, r: 3, fill: '#FFE9A8' }, body);
      break;
    case 'treasure':
      palm(body, -22, 6, 1.05); palm(body, 26, 10, .85);
      el('path', { d: 'M-7 5 L7 17 M7 5 L-7 17', stroke: '#C9758F', 'stroke-width': 4, 'stroke-linecap': 'round' }, body);
      el('text', { x: 0, y: -12, 'text-anchor': 'middle', 'font-size': 14 }, body).textContent = '✨';
      break;
  }

  // flag (visited)
  const fl = el('g', { class: 'flag', transform: `translate(${r * .62} ${-r * .05})` }, body);
  el('line', { x1: 0, y1: 8, x2: 0, y2: -18, stroke: '#8F6A44', 'stroke-width': 2 }, fl);
  el('path', { d: 'M0 -18 L14 -13 L0 -8 Z', fill: '#C9758F' }, fl);

  const t = el('text', { class: 'lbl', x: 0, y: r * .75 + 15 }, outer);
  t.textContent = s.name;

  outer.addEventListener('click', () => onIsland(i));
}
ISLANDS.forEach((_, i) => buildIsland(i));
const islEls = [...document.querySelectorAll('.isl')];

/* ───────────── ship ───────────── */
const ship = $('ship');
const shipPos = el('g', {}, ship);          // translate
const shipFlip = el('g', {}, shipPos);      // scaleX
const shipBob = el('g', { class: 'bob' }, shipFlip);
shipBob.style.transformBox = 'fill-box';
shipBob.style.transformOrigin = 'center bottom';

// hull + mast + sail + flag
el('path', { d: 'M-36 0 L36 0 L26 17 L-26 17 Z', fill: '#C99A6B', stroke: '#8F6A44', 'stroke-width': 2 }, shipBob);
el('path', { d: 'M-30 6 L30 6', stroke: '#E3B866', 'stroke-width': 2 }, shipBob);
el('rect', { x: -1.6, y: -54, width: 3.2, height: 54, fill: '#8F6A44' }, shipBob);
el('path', { d: 'M3 -50 Q38 -32 3 -8 Z', fill: '#fff', stroke: '#F0C9D4', 'stroke-width': 1.5 }, shipBob);
el('path', { d: 'M-3 -44 Q-26 -30 -3 -12 Z', fill: '#FFF1F4', stroke: '#F0C9D4', 'stroke-width': 1.5 }, shipBob);
el('text', { x: 16, y: -26, 'text-anchor': 'middle', 'font-size': 13, fill: '#C9758F' }, shipBob).textContent = '♥';
el('path', { d: 'M0 -54 L17 -49 L0 -44 Z', fill: '#C9758F' }, shipBob);
// the cat on the stern
const catG = el('g', { transform: 'translate(-34 -26) scale(.26)' }, shipBob);
catG.innerHTML = catInner(true);
const catHit = el('circle', { class: 'catHit', cx: -21, cy: -12, r: 18, fill: 'transparent' }, shipBob);

const bubble = el('g', { class: 'bubble', opacity: 0 }, shipPos);
el('rect', { x: -44, y: -92, width: 52, height: 22, rx: 11, fill: '#fff', stroke: '#F0C9D4' }, bubble);
el('path', { d: 'M-22 -70 l4 8 l4 -8 z', fill: '#fff' }, bubble);
const bubTxt = el('text', { x: -18, y: -77, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 700, fill: '#5B3A45' }, bubble);
bubTxt.textContent = 'مياو 💗';

let pos = { x: START.x, y: START.y }, dir = 1;
function placeShip(x, y, d) {
  pos = { x, y }; if (d) dir = d;
  shipPos.setAttribute('transform', `translate(${x} ${y})`);
  shipFlip.setAttribute('transform', `scale(${dir} 1)`);
}
placeShip(START.x, START.y, 1);

const MEOWS = ['مياو 💗', 'ميياو ✨', 'مرررر 🐾', 'مياو مياو!'];
let meowT = null, meowN = 0;
function meow() {
  bubTxt.textContent = MEOWS[meowN++ % MEOWS.length];
  bubble.setAttribute('transform', `translate(${0} 0)`);
  bubble.setAttribute('opacity', 1);
  burst(['💗'], 3);
  clearTimeout(meowT);
  meowT = setTimeout(() => bubble.setAttribute('opacity', 0), 1400);
}
catHit.addEventListener('click', e => { e.stopPropagation(); meow(); });

/* ───────────── effects ───────────── */
const fx = $('fx');
function burst(syms, n) {
  for (let i = 0; i < n; i++) {
    setTimeout(() => {
      const h = document.createElement('span');
      h.className = 'fl';
      h.textContent = syms[Math.floor(Math.random() * syms.length)];
      h.style.left = (8 + Math.random() * 84) + 'vw';
      h.style.fontSize = (16 + Math.random() * 18) + 'px';
      h.style.animationDuration = (2.6 + Math.random() * 1.8) + 's';
      fx.appendChild(h);
      setTimeout(() => h.remove(), 4600);
    }, i * 110);
  }
}
function coinRain(n) {
  for (let i = 0; i < n; i++) {
    setTimeout(() => {
      const c = document.createElement('span');
      c.className = 'coin';
      c.textContent = Math.random() > .3 ? '🪙' : '💗';
      c.style.left = (Math.random() * 96) + 'vw';
      c.style.fontSize = (18 + Math.random() * 16) + 'px';
      c.style.animationDuration = (2.4 + Math.random() * 2) + 's';
      fx.appendChild(c);
      setTimeout(() => c.remove(), 4800);
    }, i * 70);
  }
}
const toastEl = $('toast');
let toastT = null;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastT);
  toastT = setTimeout(() => toastEl.classList.remove('show'), 2200);
}

/* ───────────── game state ───────────── */
let next = 0;          // الجزيرة الجاية
let sailing = false;
let inPanel = false;
const collected = [];

function markNext() {
  islEls.forEach((g, i) => {
    g.classList.toggle('next', i === next);
    g.classList.toggle('visited', i < next);
  });
}
markNext();

function ease(t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

function sailTo(i, done) {
  const leg = legs[i];
  const from = leg.from, c = leg.c, to = leg.to;
  const dirNow = to.x >= from.x ? 1 : -1;
  placeShip(from.x, from.y, dirNow);
  sailing = true;
  $('goal').classList.add('hide');
  const dur = 2600;
  const t0 = performance.now();
  let lastDot = 0;
  (function step(now) {
    const p = Math.min(1, (now - t0) / dur), t = ease(p);
    const u = 1 - t;
    const x = u * u * from.x + 2 * u * t * c.x + t * t * to.x;
    const y = u * u * from.y + 2 * u * t * c.y + t * t * to.y;
    // face along the curve
    const dx = 2 * u * (c.x - from.x) + 2 * t * (to.x - c.x);
    placeShip(x, y, dx >= 0 ? 1 : -1);
    if (p - lastDot > .045) {
      lastDot = p;
      const d = el('circle', { class: 'wk', cx: x, cy: y + 18, r: 2.4 }, $('wake'));
      d.animate([{ opacity: .8, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(2.2)' }],
        { duration: 1400, fill: 'forwards' });
      setTimeout(() => d.remove(), 1500);
    }
    if (p < 1) requestAnimationFrame(step);
    else { sailing = false; leg.path.classList.add('done'); done(); }
  })(t0);
}

function onIsland(i) {
  if (sailing || inPanel) return;
  if (i < next) { toast('زرتي الجزيرة دي قبل كده ✓'); return; }
  if (i > next) { toast('لسه بدري.. روحي الجزيرة اللي بتنوّر ✨'); return; }
  sailTo(i, () => arrive(i));
}

/* ───────────── island panel ───────────── */
const sheet = $('sheet'), obj = $('obj'), dots = $('dots'), reveal = $('reveal');
let tapsLeft = 0, curI = 0;

function arrive(i) {
  curI = i;
  if (ISLANDS[i].final) return openTreasure();
  const s = ISLANDS[i];
  inPanel = true;
  $('sName').textContent = s.name;
  $('sHint').textContent = s.hint;
  obj.textContent = s.obj;
  obj.style.display = '';
  tapsLeft = s.taps;
  dots.innerHTML = '';
  for (let k = 0; k < s.taps; k++) dots.appendChild(document.createElement('i'));
  reveal.hidden = true;
  sheet.classList.add('open');
  sheet.setAttribute('aria-hidden', 'false');
}

obj.addEventListener('click', () => {
  if (tapsLeft <= 0) return;
  tapsLeft--;
  const s = ISLANDS[curI];
  const done = s.taps - tapsLeft;
  [...dots.children].forEach((d, k) => d.classList.toggle('on', k < done));
  obj.classList.remove('shake'); void obj.offsetWidth; obj.classList.add('shake');
  burst(['✨'], 2);
  if (tapsLeft === 0) setTimeout(() => foundItem(curI), 350);
});

function foundItem(i) {
  const s = ISLANDS[i];
  obj.style.display = 'none';
  $('sHint').textContent = 'لقيتي حاجة!';
  $('piece').textContent = s.item;
  $('pieceName').textContent = s.itemName;
  $('clue').textContent = s.clue;
  reveal.hidden = false;
  collected.push(s.item);
  const slot = document.querySelector(`.slot[data-k="${collected.length - 1}"]`);
  if (slot) { slot.textContent = s.item; slot.classList.add('on'); }
  burst(['💗', '✨'], 8);
}

$('go').addEventListener('click', () => {
  sheet.classList.remove('open');
  sheet.setAttribute('aria-hidden', 'true');
  inPanel = false;
  next++;
  markNext();
  if (next < ISLANDS.length - 1) toast('كمّلي للجزيرة اللي بتنوّر ⛵');
  else toast('الكنز الكبير مستنيكي ✨');
  $('goal').textContent = next < ISLANDS.length - 1 ? 'اضغطي على الجزيرة اللي بتنوّر ✨' : 'آخر جزيرة.. جزيرة الكنز! 💎';
  $('goal').classList.remove('hide');
});

/* ───────────── treasure ───────────── */
const treasure = $('treasure'), chestBtn = $('chestBtn');
let chestOpened = false;

function openTreasure() {
  inPanel = true;
  const locks = $('locks');
  locks.innerHTML = '';
  collected.forEach(c => { const sp = document.createElement('span'); sp.textContent = c; locks.appendChild(sp); });
  treasure.classList.add('open');
  treasure.setAttribute('aria-hidden', 'false');
}

chestBtn.addEventListener('click', () => {
  if (chestOpened) return;
  chestOpened = true;
  chestBtn.classList.add('chest-open');
  $('tHint').textContent = 'الكنز اتفتح!! ✨';
  coinRain(28);
  setTimeout(() => {
    $('tClosed').hidden = true;
    $('tOpened').hidden = false;
    treasure.scrollTop = 0;
    burst(['💗'], 5);
  }, 2000);
});

$('catBig').addEventListener('click', () => {
  const c = $('catBig');
  c.classList.remove('purr'); void c.offsetWidth; c.classList.add('purr');
  const says = ['مياو 💗', 'مرررر 🐾', 'ملك أحلى كابتن!', 'مياو مياو ✨'];
  $('catSay').textContent = says[Math.floor(Math.random() * says.length)];
  burst(['💗'], 5);
});

$('again').addEventListener('click', () => location.reload());

/* ───────────── start ───────────── */
$('startBtn').addEventListener('click', () => {
  $('start').classList.add('gone');
  meow();
});
