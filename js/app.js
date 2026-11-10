/* =====================================================================
   APP – Handy-Quiz + Präsentation (Beamer)
   ---------------------------------------------------------------------
   Inhalte stehen in js/quiz.js und js/slides.js. Hier ist nur die Technik.

   Aufruf:
     …/index.html#host   → Präsentation (Beamer)
     …/index.html?s=ID   → Quiz auf dem Handy (kommt über den QR-Code)

   Datenübertragung: ntfy.sh (kostenlos, ohne Login). Für lokale Tests
   kann mit ?relay=http://… ein anderer Server angegeben werden.
   ===================================================================== */
(function () {
'use strict';

const P = new URLSearchParams(location.search);
const RELAY = (P.get('relay') || 'https://ntfy.sh').replace(/\/$/, '');
const IS_HOST = location.hash.indexOf('host') >= 0 || P.has('host');
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmt = (n, d = 1) => Number(n).toLocaleString('de-DE', { minimumFractionDigits: d, maximumFractionDigits: d });
const pct = (a, b) => b ? Math.round(100 * a / b) : 0;
const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  del(k) { try { localStorage.removeItem(k); } catch (e) {} }
};
const rid = n => { const a = 'abcdefghijkmnpqrstuvwxyz23456789'; let s = ''; for (const x of crypto.getRandomValues(new Uint8Array(n))) s += a[x % a.length]; return s; };
const qById = id => QUIZ.find(q => q.id === id);

function isCorrect(q, v) {
  if (v === undefined || v === null) return false;
  if (q.kind === 'slider') return Math.abs(+v - q.correct) <= q.tolerance + 1e-9;
  return String(v) === String(q.correct);
}

/* ---------- Relay ---------- */
async function relayPost(topic, obj) {
  const r = await fetch(RELAY + '/' + topic, { method: 'POST', body: JSON.stringify(obj) });
  if (!r.ok) throw new Error('HTTP ' + r.status);
}
async function relayPoll(topic) {
  const r = await fetch(RELAY + '/' + topic + '/json?poll=1&since=all');
  if (!r.ok) throw new Error('HTTP ' + r.status);
  const out = [];
  (await r.text()).split('\n').forEach(l => {
    if (!l.trim()) return;
    try { const d = JSON.parse(l); if (d.event === 'message') out.push(JSON.parse(d.message)); } catch (e) {}
  });
  return out;
}

/* ---------- Antwort-Bausteine (Handy) ---------- */
function answerHTML(q, g) {
  if (q.kind === 'slider') {
    const m = q.max[g];
    return `<div class="slider"><div class="val empty" data-val>–<small> %</small></div>
      <input type="range" min="0" max="${m}" step="0.1" value="0" aria-label="Schätzung in Prozent">
      <div class="ends"><span>0 %</span><span>${m} %</span></div></div>`;
  }
  if (q.kind === 'choice') {
    const star = q.star && q.star[g];
    return `<div class="opts">${q.options.map(o => `<button class="opt" data-v="${o.id}"><span class="rad"></span><span class="lbl">${esc(o.label)}</span>${star === o.id ? '<span class="star" aria-hidden="true">★</span>' : ''}</button>`).join('')}</div>`;
  }
  const caps = q.captionsFor === g;
  return `<div class="tiles">${q.options.map((o, i) => `<button class="tile" data-v="${o.id}"><img src="${o.img}" alt="Paywall Nr. ${i + 1}"><span class="num">${i + 1}</span><span class="zoomb" data-zoom="${o.img}" aria-label="vergrößern">⤢</span>${caps ? `<div class="cap">${esc(o.caption)}</div>` : ''}</button>`).join('')}</div>`;
}

function lightbox(src) {
  const d = document.createElement('div');
  d.className = 'lightbox';
  d.innerHTML = `<img src="${src}" alt=""><button class="x">Schließen</button>`;
  d.onclick = () => d.remove();
  document.body.appendChild(d);
}

/* =================================================================
   HANDY
   ================================================================= */
function participant() {
  document.body.className = 'part';
  const topic = P.get('s');
  const app = $('#app');
  if (!topic) {
    app.innerHTML = `<div class="phead"><div class="row"><span>A/B-Testing · Quiz</span></div></div><div class="pmain"><div class="screen"><p class="ptitle">Bitte scanne den QR-Code auf der Leinwand.</p></div></div>`;
    return;
  }
  const KEY = 'abq_' + topic;
  const st = store.get(KEY) || { pid: rid(10), g: null, joined: false, step: 0, ans: {}, sent: false };
  const save = () => store.set(KEY, st);
  let groupReady = !!st.g;

  // Gruppenzuteilung: kleinere Gruppe bevorzugen, damit A und B etwa gleich groß werden
  async function assign() {
    if (st.g) { groupReady = true; return; }
    let g = null;
    try {
      const c = { A: new Set(), B: new Set() };
      (await relayPoll(topic)).forEach(m => { if (m && (m.t === 'j' || m.t === 'a') && c[m.g]) c[m.g].add(m.p); });
      const d = c.A.size - c.B.size, small = d < 0 ? 'A' : 'B';
      if (Math.abs(d) >= 2) g = small;
      else if (Math.abs(d) === 1) g = Math.random() < .75 ? small : (small === 'A' ? 'B' : 'A');
    } catch (e) {}
    st.g = g || (Math.random() < .5 ? 'A' : 'B'); save(); groupReady = true;
    if (!st.joined) { try { await relayPost(topic, { t: 'j', p: st.pid, g: st.g }); st.joined = true; save(); } catch (e) {} }
  }
  const assigning = assign();

  app.innerHTML = `<div class="phead"><div class="row"><span>A/B-Testing · Quiz</span><span class="dots"><i></i><i></i><i></i></span></div></div><main class="pmain" id="pm"></main>`;
  const pm = $('#pm');
  const dots = n => $$('.dots i').forEach((d, i) => d.classList.toggle('on', i < n));

  function start() {
    dots(0);
    pm.innerHTML = `<section class="screen">
      <div class="kicker up">Kurzes Quiz</div>
      <h1 class="ptitle up d1">Drei echte A/B-Tests. Was schätzt du?</h1>
      <p class="ptext up d2">Drei Fragen, etwa zwei Minuten. Es gibt keine Punkte und keinen Gewinner – nimm dir also ruhig Zeit und schau dir die Screens genau an.</p>
      <button class="btn up d3" id="go" ${groupReady ? '' : 'disabled'}>${groupReady ? 'Los geht’s' : 'Einen Moment …'}</button>
    </section>`;
    const go = $('#go');
    if (!groupReady) Promise.race([assigning, new Promise(r => setTimeout(r, 5000))]).then(() => {
      if (!st.g) { st.g = Math.random() < .5 ? 'A' : 'B'; save(); }
      go.disabled = false; go.textContent = 'Los geht’s';
    });
    go.onclick = () => { st.step = 1; save(); render(); };
  }

  function question(i) {
    const q = QUIZ[i], g = st.g, last = i === QUIZ.length - 1;
    dots(i + 1);
    pm.innerHTML = `<section class="screen">
      <div class="kicker">Frage ${i + 1} von ${QUIZ.length} · ${esc(q.brand)}</div>
      <p class="ptext" style="margin-top:10px">${esc(q.intro)}</p>
      ${q.img ? `<button class="shot" id="shot"><img src="${q.img}" alt="${esc(q.brand)}: Variante A und B"><span class="zoom">Tippen zum Vergrößern</span></button>` : ''}
      <h2 class="ask">${esc(q.ask)}</h2>
      <div id="ans">${answerHTML(q, g)}</div>
      <button class="btn" id="next" disabled>${last ? 'Absenden' : 'Weiter'}</button>
      ${q.kind === 'slider' ? '<p class="hint" id="hint">Schieb den Regler auf deine Schätzung.</p>' : ''}
      ${q.kind === 'tiles' ? '<p class="hint">Tippe auf einen Screen, um ihn auszuwählen. ⤢ vergrößert.</p>' : ''}
    </section>`;
    window.scrollTo(0, 0);
    const next = $('#next');
    let val = st.ans[q.id];
    if (q.img) $('#shot').onclick = () => lightbox(q.img);
    if (q.kind === 'slider') {
      const inp = $('#ans input'), out = $('#ans [data-val]');
      const upd = touched => {
        const v = +inp.value;
        inp.style.setProperty('--p', (100 * v / q.max[g]) + '%');
        if (!touched) return;
        out.classList.remove('empty'); out.innerHTML = fmt(v) + '<small> %</small>';
        val = v; next.disabled = false;
        const h = $('#hint'); if (h) h.style.visibility = 'hidden';
      };
      if (typeof val === 'number') { inp.value = val; upd(true); } else upd(false);
      inp.addEventListener('input', () => upd(true));
    } else {
      const items = $$('#ans [data-v]');
      const sel = v => { items.forEach(b => b.classList.toggle('sel', b.dataset.v === String(v))); val = v; next.disabled = false; };
      if (val != null) sel(val);
      items.forEach(b => b.onclick = e => {
        const z = e.target.closest('.zoomb');
        if (z) { e.stopPropagation(); lightbox(z.dataset.zoom); return; }
        sel(b.dataset.v);
      });
    }
    next.onclick = () => { st.ans[q.id] = val; st.step = i + 2; save(); if (last) submit(); render(); };
  }

  async function submit() {
    await Promise.race([assigning, new Promise(r => setTimeout(r, 4000))]);
    for (let k = 0; k < 20 && !st.sent; k++) {
      try { await relayPost(topic, { t: 'a', p: st.pid, g: st.g, a: st.ans }); st.sent = true; save(); }
      catch (e) { await new Promise(r => setTimeout(r, 3000 + Math.random() * 3000)); }
      const s = $('#sendstate'); if (s) s.textContent = st.sent ? 'Antworten gespeichert ✓' : 'Antworten werden gesendet …';
    }
    const s = $('#sendstate'); if (s) s.textContent = st.sent ? 'Antworten gespeichert ✓' : 'Senden hat nicht geklappt – bitte Seite neu laden.';
  }

  function done() {
    dots(3);
    pm.innerHTML = `<section class="screen done">
      <div class="big up">✓</div>
      <h1 class="ptitle up d1">Danke!</h1>
      <p class="ptext up d2">Schau jetzt wieder nach vorne – gleich geht’s weiter.</p>
      <p class="sendstate up d3" id="sendstate">${st.sent ? 'Antworten gespeichert ✓' : 'Antworten werden gesendet …'}</p>
    </section>`;
    if (!st.sent) submit();
  }

  function render() { if (st.step === 0) start(); else if (st.step <= QUIZ.length) question(st.step - 1); else done(); }
  render();
}

/* =================================================================
   PRÄSENTATION
   ================================================================= */
/* Titel mit Schriftwechsel: links Grotesk, rechts Serif. Die Trennstelle liegt
   genau auf der Farbgrenze. Mit „|“ im Text legt man sie selbst fest
   (z. B. 'Grenzen | der Methode' = an der Wortlücke, 'Vorg|ehen' = zwischen zwei
   Buchstaben). Ohne „|“ wird die Wortlücke nahe der Mitte genommen. */
function split(t) {
  t = String(t);
  let L, R;
  const i = t.indexOf('|');
  if (i >= 0) { L = t.slice(0, i); R = t.slice(i + 1); }
  else {
    const mid = t.length / 2, sp = [];
    for (let k = 0; k < t.length; k++) if (t[k] === ' ') sp.push(k);
    const k = sp.length ? sp.reduce((a, b) => Math.abs(b - mid) < Math.abs(a - mid) ? b : a) : Math.round(mid);
    L = t.slice(0, k); R = t.slice(k);
  }
  const word = /\s$/.test(L) || /^\s/.test(R);
  return `<div class="splitT${word ? ' word' : ''}"><span class="l">${esc(L.trim())}</span><span class="r">${esc(R.trim())}</span></div>`;
}
const foot = () => DECK.footer ? `<div class="deckfoot">${esc(DECK.footer)}</div>` : '';

const RENDER = {
  cover: s => `
    <div class="cv-a a a1">${esc(s.a)}</div><div class="cv-b a a1">${esc(s.b)}</div>
    <div class="cv-t a a2">${split(s.title)}</div>
    <div class="cv-n a a3">${split(s.names)}</div>`,

  'quiz-lobby': s => `
    <div class="half L lobbyL">
      <div class="hk a a1">${esc(s.kicker)}</div>
      <h1 class="a a2">${esc(s.title)}</h1>
      <p class="a a3">${esc(s.text)}</p>
      <div class="counter a a4"><div><b data-c="join">0</b><span>dabei</span></div><div><b data-c="done">0</b><span>fertig</span></div></div>
    </div>
    <div class="half R"><div class="qrwrap a a2"><div class="qrcard" data-qr></div><div class="qrurl" data-qrurl></div></div></div>
    <div class="conn" data-conn><i></i><span>verbinde …</span></div>
    <div class="badge-sim hidden" data-simbadge>Testdaten aktiv</div>
    <div class="ctrl"><button data-act="fs">Vollbild (F)</button><button data-act="sim"></button><button data-act="new">Neue Session</button></div>
    <button class="startbtn" data-act="next">Weiter →</button>`,

  section: s => `<div class="t-section"><div class="secT a a1">${split(s.title)}</div></div>${foot()}`,

  'quiz-result': s => {
    const q = qById(s.q);
    return `
    <div class="rhead a a1"><div class="hk">${esc(s.kicker || 'Quiz-Auswertung')}</div>${split(s.brand)}</div>
    <div class="half L rL a a2"><img class="rimg" src="${s.img}" alt="${esc(s.brand)}: getestete Varianten"></div>
    <div class="rTop" data-step="2">
      <div class="rk">Echtes Ergebnis</div>
      <div class="rnums">${s.numbers.map(n => `<div class="rnum"><b>${esc(n[0])}</b><span>${esc(n[1])}</span></div>`).join('')}</div>
      ${s.note ? `<p class="rnote">${esc(s.note)}</p>` : ''}
    </div>
    <div class="rBot" data-step="3">
      <div class="rk">Und ihr?</div>
      <div class="rnums live"><div class="rnum"><b data-r="right">–</b><span>lagen richtig</span></div><div class="rnum"><b data-r="wrong">–</b><span>lagen falsch</span></div></div>
      <p class="rsmall">Richtig: ${esc(q.correctLabel)}${q.kind === 'slider' ? ` (±${fmt(q.tolerance, 0)} Prozentpunkte)` : ''}</p>
      <p class="printnote">Wurde live im Vortrag ausgewertet.</p>
    </div>${foot()}`;
  },

  'steps-rows': s => {
    const tops = [17.6, 27.4, 38.4];
    return `
    <div class="ttop a a1">${split(s.title)}</div>
    <div class="clabel cL a a2">${esc(s.leftLabel)}</div><div class="clabel cR serif a a2">${esc(s.rightLabel)}</div>
    ${s.rows.map((r, i) => `
      <div class="rowL${i ? '' : ' a a3'}" style="top:${tops[i] || 17.6 + i * 10}rem" ${i ? `data-step="${i + 1}"` : ''}><h3>${esc(r.h)}</h3><p>${esc(r.p)}</p></div>
      <div class="rowR${i ? '' : ' a a3'}" style="top:${(tops[i] || 17.6 + i * 10) - (i ? 0 : 1)}rem" ${i ? `data-step="${i + 1}"` : ''}>${r.right}</div>`).join('')}
    ${foot()}`;
  },

  surprise: s => `
    <div class="sk a a1">${esc(s.kicker)}</div>
    <div class="stitle a a1">${s.lines.map(l => split(l)).join('')}</div>
    ${['A', 'B'].map(g => `
    <div class="scol ${g === 'A' ? 'L' : 'R'} a a3">
      <div class="tname">Team ${g}</div><div class="tn" data-n="${g}"></div>
      <ul>${s.saw[g].map(x => `<li>${esc(x)}</li>`).join('')}</ul>
    </div>`).join('')}
    ${foot()}`,

  'quiz-hypothesis': (s, idx) => `
    <div class="hhead">
      <div class="hk a a1">Auswertung ${idx.n} / ${idx.of} · ${esc(s.brand)}</div>
      <div class="a a1">${split(DECK.hypothesisTitle || 'Hypo|these')}</div>
      <p class="hyp a a2">${esc(s.hypothesis)}</p>
    </div>
    ${['A', 'B'].map(g => `
    <div class="hcol ${g === 'A' ? 'L' : 'R'} a a3">
      <div class="tname">Team ${g}</div><div class="tsaw">${esc(s.saw[g])}</div>
      <div class="hv" data-step="2"><b data-h="${g}">–</b><span>lagen richtig</span><small data-hs="${g}"></small></div>
    </div>`).join('')}
    <div class="verdict" data-step="2"><div class="pill" data-v>–</div><p data-vt></p></div>
    <p class="printnote hnote">Ergebnis wurde live im Vortrag ausgewertet.</p>
    ${foot()}`,

  'steps-visual': s => {
    const tops = [17.2, 25.2, 33.2, 41.2];
    return `
    <div class="ttop a a1">${split(s.title)}</div>
    ${s.items.map((it, i) => `
      <div class="gitem${i ? '' : ' a a2'}" style="top:${tops[i] || 17.2 + i * 8}rem" ${i ? `data-step="${i + 1}"` : ''}>
        <h3>${esc(it.h)}</h3>${it.p ? `<p data-only="${i + 1}">${esc(it.p)}</p>` : ''}
      </div>
      <div class="gvis" data-only="${i + 1}">${it.visual}</div>`).join('')}
    ${foot()}`;
  },

  split: s => `
    <div class="ttop a a1">${split(s.title)}</div>
    <div class="half L splitL a a2">${s.left}</div>
    <div class="half R splitR a a3">${s.right}</div>
    ${foot()}`,

  sources: s => `
    <div class="half L srcL"><h2 class="a a1">${s.title}</h2></div>
    <div class="half R srcR a a2">
      <ol>${s.links.map(l => `<li><a href="${esc(l)}" target="_blank" rel="noopener">${esc(l)}</a></li>`).join('')}</ol>
      <p>${s.text}</p>
    </div>
    ${foot()}`,

  html: s => s.html
};

function host() {
  document.body.className = 'host' + (P.has('print') ? ' print' : '');
  let topic = P.get('s') || store.get('abHostTopic');
  if (!topic) { topic = 'hm-abtest-' + rid(12); store.set('abHostTopic', topic); }
  const people = new Map();
  let sim = store.get('abSim_' + topic) || false, simPeople = null;
  const base = location.origin + location.pathname;
  const joinUrl = base + '?s=' + encodeURIComponent(topic) + (P.get('relay') ? '&relay=' + encodeURIComponent(P.get('relay')) : '');
  const qrUrl = P.get('qr') || joinUrl; // ?qr=… nur für den PDF-Export

  /* --- Folien bauen --- */
  const hypTotal = SLIDES.filter(s => s.type === 'quiz-hypothesis').length;
  let hypN = 0;
  $('#app').innerHTML = `<div class="stage"><div class="frame" id="frame">${SLIDES.map((s, i) => {
    const idx = s.type === 'quiz-hypothesis' ? { n: ++hypN, of: hypTotal } : null;
    const r = RENDER[s.type];
    return `<section class="slide t-${s.type}" data-i="${i}">${r ? r(s, idx) : `<p>Unbekannter Folientyp: ${esc(s.type)}</p>`}</section>`;
  }).join('')}</div></div><div class="navhint"><button data-act="prev">←</button><button data-act="next">→</button></div>`;
  const slides = $$('.slide');
  const stepsOf = el => Math.max(1, ...$$('[data-step],[data-only]', el).map(x => +(x.dataset.step || x.dataset.only)));

  /* --- QR --- */
  $$('[data-qr]').forEach(el => { try { const qr = qrcode(0, 'M'); qr.addData(qrUrl); qr.make(); el.innerHTML = qr.createSvgTag({ scalable: true, margin: 0 }); } catch (e) { el.textContent = 'QR-Fehler'; } });
  $$('[data-qrurl]').forEach(el => el.textContent = qrUrl.replace(/^https?:\/\//, ''));

  /* --- Navigation --- */
  let cur = store.get('abPos_' + topic) || { s: 0, step: 1 };
  if (cur.s >= slides.length) cur = { s: 0, step: 1 };
  function go(s, step) {
    cur = { s, step }; store.set('abPos_' + topic, cur);
    slides.forEach((el, i) => {
      const on = i === s;
      el.classList.toggle('on', on);
      $$('[data-step]', el).forEach(x => x.classList.toggle('shown', on && step >= +x.dataset.step));
      $$('[data-only]', el).forEach(x => x.classList.toggle('shown', on && step === +x.dataset.only));
    });
    refresh();
    countUp(slides[s]);
  }
  const next = () => { if (cur.step < stepsOf(slides[cur.s])) go(cur.s, cur.step + 1); else if (cur.s < slides.length - 1) go(cur.s + 1, 1); };
  const prev = () => { if (cur.step > 1) go(cur.s, cur.step - 1); else if (cur.s > 0) go(cur.s - 1, stepsOf(slides[cur.s - 1])); };
  const fs = () => { if (!document.fullscreenElement) document.documentElement.requestFullscreen && document.documentElement.requestFullscreen(); else document.exitFullscreen(); };
  document.addEventListener('keydown', e => {
    if (['ArrowRight', 'PageDown', ' ', 'Enter', 'ArrowDown'].includes(e.key)) { e.preventDefault(); next(); }
    else if (['ArrowLeft', 'PageUp', 'Backspace', 'ArrowUp'].includes(e.key)) { e.preventDefault(); prev(); }
    else if (e.key === 'f' || e.key === 'F') fs();
    else if (e.key === 'Home') go(0, 1);
  });
  const simLabel = () => {
    $$('[data-act="sim"]').forEach(b => b.textContent = sim ? 'Testdaten aus' : 'Probelauf mit Testdaten');
    $$('[data-simbadge]').forEach(b => b.classList.toggle('hidden', !sim));
  };
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-act]'); if (!b) return;
    const a = b.dataset.act;
    if (a === 'next') next();
    if (a === 'prev') prev();
    if (a === 'fs') fs();
    if (a === 'sim') { sim = !sim; store.set('abSim_' + topic, sim); simLabel(); refresh(); countUp(slides[cur.s]); }
    if (a === 'new') {
      if (!b.dataset.armed) { b.dataset.armed = 1; b.textContent = 'Wirklich? Nochmal klicken'; setTimeout(() => { delete b.dataset.armed; b.textContent = 'Neue Session'; }, 3000); return; }
      store.del('abHostTopic'); store.del('abPos_' + topic); location.href = base + '#host'; location.reload();
    }
  });
  simLabel();

  /* --- Daten --- */
  function data() {
    const src = sim ? (simPeople || (simPeople = makeSim())) : people;
    const all = [...src.values()];
    return { joined: all.length, done: all.filter(p => p.a).map(p => ({ g: p.g, a: p.a })) };
  }
  function handle(m) {
    if (!m || !m.p || !(m.g === 'A' || m.g === 'B')) return;
    const p = people.get(m.p) || { g: m.g, a: null };
    p.g = m.g; if (m.t === 'a' && m.a) p.a = m.a;
    people.set(m.p, p);
  }
  let rt = null; const refreshSoon = () => { clearTimeout(rt); rt = setTimeout(refresh, 250); };
  const seen = new Set(); let pollT = null;
  const setConn = (ok, txt) => $$('[data-conn]').forEach(c => { c.classList.toggle('ok', ok); c.querySelector('span').textContent = txt; });
  function connect() {
    try {
      const es = new EventSource(RELAY + '/' + topic + '/sse?since=all');
      es.onopen = () => setConn(true, 'verbunden');
      es.onmessage = e => { try { const d = JSON.parse(e.data); if (d.event !== 'message' || seen.has(d.id)) return; seen.add(d.id); handle(JSON.parse(d.message)); refreshSoon(); } catch (x) {} };
      es.onerror = () => { setConn(false, 'Verbindung unterbrochen – versuche erneut …'); if (es.readyState === 2) startPoll(); };
    } catch (e) { startPoll(); }
  }
  function startPoll() {
    if (pollT) return;
    const tick = async () => { try { (await relayPoll(topic)).forEach(handle); setConn(true, 'verbunden (Polling)'); refresh(); } catch (e) { setConn(false, 'keine Verbindung'); } };
    tick(); pollT = setInterval(tick, 6000);
  }
  connect();

  /* --- Ergebnisse in die Folien schreiben --- */
  function refresh() {
    const D = data();
    $$('[data-c="join"]').forEach(e => e.textContent = D.joined);
    $$('[data-c="done"]').forEach(e => e.textContent = D.done.length);
    ['A', 'B'].forEach(g => { const n = D.done.filter(p => p.g === g).length; $$(`[data-n="${g}"]`).forEach(e => e.textContent = n + (n === 1 ? ' Person' : ' Personen')); });

    SLIDES.forEach((s, i) => {
      const el = slides[i];
      if (s.type === 'quiz-result') {
        const q = qById(s.q);
        const ans = D.done.map(p => p.a[q.id]).filter(v => v !== undefined && v !== null);
        const right = ans.filter(v => isCorrect(q, v)).length;
        setCount($('[data-r="right"]', el), ans.length ? right : NaN);
        setCount($('[data-r="wrong"]', el), ans.length ? ans.length - right : NaN);
      }
      if (s.type === 'quiz-hypothesis') {
        const q = qById(s.q);
        const r = {};
        ['A', 'B'].forEach(g => {
          const ans = D.done.filter(p => p.g === g).map(p => p.a[q.id]).filter(v => v !== undefined && v !== null);
          r[g] = { n: ans.length, right: ans.filter(v => isCorrect(q, v)).length, vals: ans };
          r[g].share = pct(r[g].right, r[g].n);
          setCount($(`[data-h="${g}"]`, el), r[g].n ? r[g].share : NaN, ' %');
          let small = `${r[g].right} von ${r[g].n}`;
          if (q.kind === 'slider' && r[g].n) small += ` (±${fmt(q.tolerance, 0)} Prozentpunkte) · Ø Schätzung ${fmt(r[g].vals.reduce((a, b) => a + b, 0) / r[g].n)} %`;
          $(`[data-hs="${g}"]`, el).textContent = r[g].n ? small : '';
        });
        const pill = $('[data-v]', el), vt = $('[data-vt]', el);
        if (!r.A.n || !r.B.n) { pill.textContent = '–'; pill.className = 'pill'; vt.textContent = 'Noch zu wenige Antworten.'; return; }
        const diff = r.A.share - r.B.share;
        const p = fisher(r.A.right, r.A.n - r.A.right, r.B.right, r.B.n - r.B.right);
        const ps = p < 0.001 ? 'p < 0,001' : 'p = ' + fmt(p, p < 0.01 ? 3 : 2);
        const yes = diff > 0;
        pill.textContent = yes ? 'Ja' : 'Nein';
        pill.className = 'pill ' + (yes ? 'yes' : 'no');
        const sig = p < 0.05 ? 'statistisch signifikant' : 'nicht signifikant';
        const pp = n => n + (Math.abs(n) === 1 ? ' Prozentpunkt' : ' Prozentpunkte');
        vt.textContent = yes
          ? `Team A lag ${pp(diff)} häufiger richtig · ${sig} (${ps})`
          : (diff === 0 ? `Beide Teams lagen gleich oft richtig (${ps})` : `Team B lag sogar ${pp(-diff)} häufiger richtig · ${sig} (${ps})`);
      }
    });
  }
  function setCount(el, v, suf = '') {
    if (!el) return;
    el.dataset.count = isFinite(v) ? v : '';
    el.dataset.suf = suf;
    if (!el.dataset.animating) el.textContent = isFinite(v) ? v + suf : '–';
  }
  function countUp(root) {
    $$('[data-count]', root).forEach(el => {
      const t = parseFloat(el.dataset.count); if (!isFinite(t)) return;
      const host = el.closest('[data-step]');
      if (host && !host.classList.contains('shown')) return;
      if (el.dataset.done === String(t) + '|' + cur.s + '|' + cur.step) return;
      el.dataset.done = String(t) + '|' + cur.s + '|' + cur.step;
      const t0 = performance.now(), dur = 1000, suf = el.dataset.suf || '';
      el.dataset.animating = 1;
      const f = now => { const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3); el.textContent = Math.round(t * e) + suf; if (k < 1) requestAnimationFrame(f); else { delete el.dataset.animating; el.textContent = el.dataset.count === '' ? '–' : el.dataset.count + suf; } };
      requestAnimationFrame(f);
    });
  }

  function makeSim() {
    const m = new Map(), rnd = (a, b) => a + Math.random() * (b - a);
    for (let i = 0; i < 20; i++) {
      const g = i % 2 ? 'B' : 'A', k = i >> 1;
      const q1 = g === 'A' ? rnd(4, 13) : rnd(6, 26);
      const q2 = g === 'A' ? ['gesunken', 'gesunken', 'leicht', 'gesunken', 'stark', 'gesunken', 'kaum', 'gesunken', 'leicht', 'gesunken'][k] : ['leicht', 'gesunken', 'stark', 'leicht', 'kaum', 'gesunken', 'stark', 'leicht', 'gesunken', 'stark'][k];
      const q3 = g === 'A' ? ['weiss', 'abo', 'weiss', 'blau', 'weiss', 'original', 'weiss', 'abo', 'weiss', 'blau'][k] : ['abo', 'abo', 'weiss', 'abo', 'blau', 'abo', 'original', 'abo', 'weiss', 'abo'][k];
      m.set('sim' + i, { g, a: { q1: Math.round(q1 * 10) / 10, q2, q3 } });
    }
    return m;
  }

  go(cur.s, cur.step);
}

/* ---------- Statistik: zweiseitiger exakter Test nach Fisher ---------- */
function fisher(a, b, c, d) {
  const lf = n => { let s = 0; for (let i = 2; i <= n; i++) s += Math.log(i); return s; };
  const r1 = a + b, r2 = c + d, c1 = a + c, N = r1 + r2;
  const pr = x => Math.exp(lf(r1) + lf(r2) + lf(c1) + lf(N - c1) - lf(N) - lf(x) - lf(r1 - x) - lf(c1 - x) - lf(r2 - c1 + x));
  const p0 = pr(a); let p = 0;
  for (let x = Math.max(0, c1 - r2); x <= Math.min(r1, c1); x++) { const px = pr(x); if (px <= p0 * (1 + 1e-9)) p += px; }
  return Math.min(1, p);
}

if (IS_HOST) host(); else participant();
})();
