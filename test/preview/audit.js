// SPDX-License-Identifier: AGPL-3.0-or-later
// In-page WCAG contrast audit for the static preview pages. Usage in the page: `await vigilAudit('light')`.
// Checks every text node (4.5:1, or 3:1 for large text) against the worst case of its background stack, including
// gradients (every colour stop) and translucent glass layers, in the base state and with :hover, :focus, :focus-visible
// and :active styles forced on every element. Also checks form-control borders at 3:1.
(() => {
  const parse = c => { const q = c && c.match(/color\(srgb ([^)]+)\)/); if (q) { const p = q[1].split(/[ \/]+/).filter(Boolean).map(Number); return { r: p[0] * 255, g: p[1] * 255, b: p[2] * 255, a: p[3] === undefined ? 1 : p[3] }; } const m = c && c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p[3] === undefined ? 1 : p[3] }; };
  const lum = ({ r, g, b }) => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
  const over = (t, b) => { const a = t.a + b.a * (1 - t.a); return a === 0 ? { r: 0, g: 0, b: 0, a: 0 } : { r: (t.r * t.a + b.r * b.a * (1 - t.a)) / a, g: (t.g * t.a + b.g * b.a * (1 - t.a)) / a, b: (t.b * t.a + b.b * b.a * (1 - t.a)) / a, a }; };
  const ratio = (x, y) => { const a = lum(x), b = lum(y); return (Math.max(a, b) + .05) / (Math.min(a, b) + .05); };
  const key = c => [c.r, c.g, c.b].map(v => Math.round(v / 3)).join(',');
  const dedupe = list => { const m = new Map(); list.forEach(c => m.set(key(c), c)); return [...m.values()].slice(0, 60); };

  // Alternatives for one element's own background layer: colour, plus every gradient stop composited over it.
  const layerAlts = cs => {
    const col = parse(cs.backgroundColor) || { r: 0, g: 0, b: 0, a: 0 };
    const img = cs.backgroundImage;
    if (!img || img === 'none') return col.a > 0 ? [col] : [];
    if (/url\(/.test(img)) return [{ r: 128, g: 128, b: 128, a: 1, image: true }];
    const stops = (img.match(/(?:rgba?|color)\([^)]+\)/g) || []).map(parse).filter(s => s && s.a > 0);
    return dedupe([...(col.a > 0 ? [col] : []), ...stops.map(s => over(s, col.a > 0 ? col : { r: 0, g: 0, b: 0, a: 0 }))]);
  };
  const backgrounds = el => {
    const layers = [];
    for (let e = el; e; e = e.parentElement) {
      const cs = getComputedStyle(e), alts = layerAlts(cs);
      if (alts.length) { layers.push(alts); if (alts.every(a => a.a === 1) && cs.backgroundImage === 'none') break; }
    }
    let bases = [{ r: 255, g: 255, b: 255, a: 1 }];
    for (let i = layers.length - 1; i >= 0; i--) bases = dedupe(bases.flatMap(b => layers[i].map(l => over(l, b))));
    return bases;
  };
  const opacityOf = el => { let o = 1; for (let e = el; e; e = e.parentElement) o *= +getComputedStyle(e).opacity; return o; };
  const name = el => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.') : '');

  const textChecks = () => {
    const out = [];
    for (const el of document.querySelectorAll('body *')) {
      if (!el.childNodes.length || ![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none') continue;
      const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
      const fg0 = parse(cs.color); if (!fg0) continue;
      const op = opacityOf(el); if (op === 0) continue;
      const size = parseFloat(cs.fontSize), bold = +cs.fontWeight >= 700, large = size >= 24 || (size >= 18.66 && bold), need = large ? 3 : 4.5;
      let worst = Infinity, wbg = null;
      for (const bg of backgrounds(el)) {
        const fg = over({ ...fg0, a: fg0.a * op }, bg), q = ratio(fg, bg);
        if (q < worst) { worst = q; wbg = bg; }
      }
      out.push({ sel: name(el), text: el.textContent.trim().slice(0, 28), ratio: +worst.toFixed(2), need, fg: cs.color, bg: wbg ? `rgb(${wbg.r | 0},${wbg.g | 0},${wbg.b | 0})` : '' , pass: worst >= need - 1e-9, image: !!(wbg && wbg.image) });
    }
    return out;
  };
  const controlChecks = () => [...document.querySelectorAll('input:not([type=checkbox]):not([type=radio]):not(:disabled), textarea, select')].map(el => {
    const cs = getComputedStyle(el), b = parse(cs.borderTopColor); if (!b || !parseFloat(cs.borderTopWidth)) return { sel: name(el), ratio: 0, need: 3, pass: false, text: 'control border' };
    let worst = Infinity; for (const bg of backgrounds(el.parentElement)) worst = Math.min(worst, ratio(over(b, bg), bg));
    return { sel: name(el), text: 'control border', ratio: +worst.toFixed(2), need: 3, pass: worst >= 3 };
  });

  const splitTop = s => { const out = []; let d = 0, cur = ''; for (const ch of s) { if (ch === '(') d++; if (ch === ')') d--; if (ch === ',' && d === 0) { out.push(cur); cur = ''; } else cur += ch; } out.push(cur); return out; };
  const stateSheet = state => {
    const css = [];
    const walk = rules => { for (const r of rules) {
      if (r.cssRules && r.media && !matchMedia(r.conditionText || r.media.mediaText).matches) continue;
      if (r.cssRules && !r.selectorText) { walk(r.cssRules); continue; }
      if (r.selectorText && r.selectorText.includes(':' + state)) {
        const sels = splitTop(r.selectorText).filter(s => s.includes(':' + state)).map(s => s.split(':' + state).join('.__st_' + state));
        css.push(sels.join(',') + '{' + r.style.cssText + '}');
      } } };
    for (const sh of document.styleSheets) { try { walk(sh.cssRules); } catch (e) {} }
    const st = document.createElement('style'); st.textContent = css.join('\n'); document.head.appendChild(st); return st;
  };

  window.vigilAudit = async function (theme) {
    const root = document.documentElement;
    if (theme) root.setAttribute('data-theme', theme);
    const result = { theme: theme || 'system', states: {} };
    const run = () => [...textChecks(), ...controlChecks()];
    const base = run(); result.states.base = { checked: base.length, fails: base.filter(x => !x.pass) };
    for (const state of ['hover', 'focus', 'focus-visible', 'active']) {
      const st = stateSheet(state), cls = '__st_' + state, all = [...document.querySelectorAll('body *')];
      all.forEach(e => e.classList.add(cls)); if (state === 'active') all.forEach(e => e.classList.add('__st_hover'));
      const res = run(); result.states[state] = { checked: res.length, fails: res.filter(x => !x.pass) };
      all.forEach(e => { e.classList.remove(cls); e.classList.remove('__st_hover'); }); st.remove();
    }
    result.total = Object.values(result.states).reduce((n, s) => n + s.checked, 0);
    result.failCount = Object.values(result.states).reduce((n, s) => n + s.fails.length, 0);
    return result;
  };
})();
