/* =========================================================
   AUTOCARE — core/art.js
   Generated SVG illustrations: vehicles, tires, wheels,
   batteries, bottles, parts. No external images needed.
   ========================================================= */
window.AC = window.AC || {};

(function () {
  let uid = 0;
  const id = (p) => p + '-' + (++uid);

  function shade(hex, pct) {
    let h = hex.replace('#', '');
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    const n = parseInt(h, 16);
    let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const t = pct < 0 ? 0 : 255, p = Math.abs(pct) / 100;
    r = Math.round((t - r) * p + r); g = Math.round((t - g) * p + g); b = Math.round((t - b) * p + b);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

  /* ---------------- Vehicles ---------------- */
  const BODIES = {
    sedan: {
      d: 'M14 100 C14 90 20 84 34 82 L86 76 C104 62 128 48 160 46 L206 46 C230 46 248 58 266 74 L298 80 C310 83 316 90 316 100 L316 106 C316 110 313 112 308 112 L22 112 C17 112 14 109 14 104 Z',
      win: ['M110 76 C122 64 138 54 158 54 L180 54 L180 76 Z', 'M188 54 L206 54 C224 54 238 64 254 76 L188 76 Z'],
      wheels: [80, 252], r: 21, door: 184, belt: 86
    },
    hatch: {
      d: 'M18 100 C18 90 24 84 38 82 L88 76 C104 60 126 48 156 46 L236 46 C250 46 262 56 272 70 L296 84 C304 88 306 94 306 100 L306 106 C306 110 303 112 298 112 L26 112 C21 112 18 109 18 104 Z',
      win: ['M106 76 C118 62 134 54 156 54 L182 54 L182 76 Z', 'M190 54 L234 54 C246 54 254 62 264 76 L190 76 Z'],
      wheels: [82, 240], r: 21, door: 186, belt: 86
    },
    suv: {
      d: 'M14 102 C14 88 18 80 32 78 L68 74 L94 46 C98 40 104 38 112 38 L262 38 C272 38 278 44 282 52 L296 74 C308 77 314 84 314 96 L314 106 C314 110 311 112 306 112 L20 112 C16 112 14 109 14 104 Z',
      win: ['M104 48 L150 48 L150 70 L82 70 Z', 'M158 48 L212 48 L212 70 L158 70 Z', 'M220 48 L258 48 C264 48 268 52 271 58 L278 70 L220 70 Z'],
      wheels: [84, 252], r: 24, door: 154, belt: 80, rails: true
    },
    pickup: {
      d: 'M14 102 C14 88 18 80 32 78 L72 74 L96 46 C100 40 106 38 114 38 L180 38 C186 38 190 42 190 48 L190 74 L308 74 C312 74 314 77 314 81 L314 106 C314 110 311 112 306 112 L20 112 C16 112 14 109 14 104 Z',
      win: ['M106 48 L142 48 L142 70 L86 70 Z', 'M148 48 L182 48 L182 70 L148 70 Z'],
      wheels: [82, 262], r: 24, door: 145, belt: 82, bed: true
    },
    van: {
      d: 'M16 106 L16 74 C16 62 24 54 36 48 L62 34 C68 31 74 30 82 30 L296 30 C306 30 312 36 312 46 L312 106 C312 110 309 112 304 112 L22 112 C18 112 16 110 16 106 Z',
      win: ['M72 42 L112 38 L112 66 L40 66 C44 56 56 48 72 42 Z', 'M120 38 L182 38 L182 66 L120 66 Z', 'M190 38 L250 38 L250 66 L190 66 Z', 'M258 38 L300 38 L300 66 L258 66 Z'],
      wheels: [80, 262], r: 21, door: 116, belt: 76
    }
  };

  function car(opts) {
    opts = opts || {};
    const b = BODIES[opts.body] || BODIES.sedan;
    const color = opts.color || '#c0c6cd';
    const hero = !!opts.hero;
    const g = id('cb'), w = id('cw'), rimG = id('cr');
    const light = shade(color, 28), dark = shade(color, -32);
    const rimLight = hero ? '#e5e7eb' : '#dfe3e8';
    let s = '<svg viewBox="0 0 330 142" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(opts.label || 'Vehicle') + '">';
    s += '<defs>' +
      '<linearGradient id="' + g + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + light + '"/><stop offset=".55" stop-color="' + color + '"/><stop offset="1" stop-color="' + dark + '"/></linearGradient>' +
      '<linearGradient id="' + w + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3b4658"/><stop offset=".5" stop-color="#151b26"/><stop offset="1" stop-color="' + (hero ? '#1d4ed8' : '#0b0f17') + '"/></linearGradient>' +
      '<radialGradient id="' + rimG + '"><stop offset="0" stop-color="#f8fafc"/><stop offset="1" stop-color="' + (hero ? '#94a3b8' : '#a8b0ba') + '"/></radialGradient>' +
      '</defs>';
    s += '<ellipse cx="165" cy="133" rx="152" ry="6" fill="' + (hero ? 'rgba(59,130,246,.35)' : 'rgba(17,17,17,.14)') + '"/>';
    if (b.rails) s += '<path d="M112 34 L258 34" stroke="' + shade(color, -55) + '" stroke-width="3" stroke-linecap="round"/>';
    s += '<path d="' + b.d + '" fill="url(#' + g + ')" stroke="' + shade(color, -40) + '" stroke-opacity=".35" stroke-width="1"/>';
    b.win.forEach((d) => { s += '<path d="' + d + '" fill="url(#' + w + ')"/>'; });
    s += '<path d="M28 ' + b.belt + ' L304 ' + b.belt + '" stroke="#fff" stroke-opacity="' + (hero ? .45 : .3) + '" stroke-width="1.5"/>';
    s += '<path d="M' + b.door + ' ' + (b.belt - 8) + ' L' + b.door + ' 108" stroke="#000" stroke-opacity=".14" stroke-width="1.2"/>';
    s += '<rect x="' + (b.door - 22) + '" y="' + (b.belt + 4) + '" width="12" height="3" rx="1.5" fill="#000" opacity=".22"/>';
    if (b.bed) s += '<path d="M196 82 L310 82" stroke="#000" stroke-opacity=".18" stroke-width="2"/>';
    // lights
    s += '<rect x="15" y="' + (b.belt - 2) + '" width="18" height="7" rx="3.5" fill="' + (hero ? '#dbeafe' : '#f1f5f9') + '"/>';
    if (hero) s += '<ellipse cx="18" cy="' + (b.belt + 1) + '" rx="22" ry="6" fill="#93c5fd" opacity=".35"/>';
    s += '<rect x="304" y="' + (b.belt - 2) + '" width="10" height="7" rx="3" fill="#ef4444" opacity=".85"/>';
    // wheels
    b.wheels.forEach((cx) => {
      const r = b.r, cy = 110, a = r + 5;
      s += '<path d="M' + (cx - a) + ' ' + (cy + 1) + ' A' + a + ' ' + a + ' 0 0 1 ' + (cx + a) + ' ' + (cy + 1) + ' Z" fill="#0d0f13" opacity=".88"/>';
      s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="#141518"/>';
      s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * .64) + '" fill="url(#' + rimG + ')"/>';
      for (let i = 0; i < 5; i++) {
        const ang = (i * 72 - 90) * Math.PI / 180;
        s += '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + Math.cos(ang) * r * .6).toFixed(1) + '" y2="' + (cy + Math.sin(ang) * r * .6).toFixed(1) + '" stroke="#6b7280" stroke-width="2.4" stroke-linecap="round"/>';
      }
      s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * .18) + '" fill="' + rimLight + '" stroke="#6b7280"/>';
    });
    s += '</svg>';
    return s;
  }

  /* ---------------- Tire ---------------- */
  function tire(opts) {
    opts = opts || {};
    const tp = id('tp'), rg = id('tr'), sg = id('ts');
    const brand = esc((opts.brand || 'AUTOCARE').toUpperCase());
    let s = '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Tire">';
    s += '<defs><radialGradient id="' + rg + '" cx=".4" cy=".35"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#cfd5dc"/><stop offset="1" stop-color="#8d96a1"/></radialGradient>' +
      '<radialGradient id="' + sg + '" cx=".5" cy=".5"><stop offset=".72" stop-color="#2a2c31"/><stop offset="1" stop-color="#16171a"/></radialGradient>' +
      '<path id="' + tp + '" d="M100,35 a65,65 0 1,1 -0.1,0"/></defs>';
    s += '<ellipse cx="100" cy="190" rx="70" ry="6" fill="rgba(17,17,17,.15)"/>';
    s += '<circle cx="100" cy="98" r="90" fill="#121315"/>';
    s += '<circle cx="100" cy="98" r="86" fill="none" stroke="#2b2d32" stroke-width="7" stroke-dasharray="7 5"/>';
    s += '<circle cx="100" cy="98" r="76" fill="url(#' + sg + ')"/>';
    s += '<g transform="translate(0,-2)"><text font-family="Inter,Arial,sans-serif" font-size="11" font-weight="800" letter-spacing="3" fill="#80868f"><textPath href="#' + tp + '">' + brand + ' • ' + esc(opts.model || '') + ' • ' + esc(opts.size || '') + '</textPath></text></g>';
    s += '<circle cx="100" cy="98" r="54" fill="url(#' + rg + ')" stroke="#6b7280" stroke-width="1"/>';
    s += '<circle cx="100" cy="98" r="44" fill="#9aa3ad"/>';
    for (let i = 0; i < 5; i++) {
      const a = (i * 72 - 90) * Math.PI / 180, a1 = a - .2, a2 = a + .2;
      const p = [[100 + Math.cos(a - .35) * 12, 98 + Math.sin(a - .35) * 12], [100 + Math.cos(a1) * 50, 98 + Math.sin(a1) * 50], [100 + Math.cos(a2) * 50, 98 + Math.sin(a2) * 50], [100 + Math.cos(a + .35) * 12, 98 + Math.sin(a + .35) * 12]];
      s += '<polygon points="' + p.map((q) => q.map((v) => v.toFixed(1)).join(',')).join(' ') + '" fill="#e5e8ec" stroke="#8b939d" stroke-width=".8"/>';
    }
    s += '<circle cx="100" cy="98" r="13" fill="#d7dce2" stroke="#7b838d"/><circle cx="100" cy="98" r="5" fill="#3b82f6"/>';
    s += '</svg>';
    return s;
  }

  /* ---------------- Wheel / Mag ---------------- */
  const FINISH = {
    'Silver': '#cdd2d8', 'Hyper Silver': '#b9c0c8', 'Diamond Silver': '#d7dbe0', 'Liquid Silver': '#dfe3e7',
    'Gunmetal': '#4b5058', 'Diamond Dark Gunmetal': '#3f444b', 'Graphite': '#5b6068', 'Matte Graphite': '#61666e',
    'Matte Black': '#2a2b2e', 'Gloss Black': '#17181a', 'Racing Hyper Black': '#26282c', 'Flat Black': '#2d2e31',
    'White': '#f2f4f6', 'Dash White': '#eef0f2', 'Matte Black Machined': '#2a2b2e', 'Textured Matte Gunmetal': '#4a4e55'
  };
  function wheel(opts) {
    opts = opts || {};
    const col = FINISH[opts.finish] || opts.color || '#c9ced5';
    const lip = id('wl'), style = opts.style || 'five';
    const darkFinish = parseInt(col.slice(1, 3), 16) < 120;
    const edge = darkFinish ? shade(col, 30) : shade(col, -30);
    let s = '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Wheel">';
    s += '<defs><radialGradient id="' + lip + '" cx=".35" cy=".3"><stop offset="0" stop-color="' + shade(col, 35) + '"/><stop offset="1" stop-color="' + shade(col, -18) + '"/></radialGradient></defs>';
    s += '<ellipse cx="100" cy="190" rx="66" ry="6" fill="rgba(17,17,17,.15)"/>';
    s += '<circle cx="100" cy="98" r="88" fill="url(#' + lip + ')" stroke="' + edge + '" stroke-width="1.5"/>';
    s += '<circle cx="100" cy="98" r="80" fill="#1c1d20"/>';
    s += '<circle cx="100" cy="98" r="76" fill="#2a2c30"/>';
    const spokes = { five: [5, .2, .1], six: [6, .17, .08], ten: [10, .09, .05], twin5: [10, .085, .045], split5: [5, .24, .14], mesh: [10, .07, .04], eight: [8, .13, .07] }[style] || [5, .2, .1];
    const n = spokes[0];
    const poly = (a, w1, w2, r1, r2) => {
      const p = [[a - w1, r1], [a - w2, r2], [a + w2, r2], [a + w1, r1]].map(([ang, r]) => (100 + Math.cos(ang) * r).toFixed(1) + ',' + (98 + Math.sin(ang) * r).toFixed(1));
      return '<polygon points="' + p.join(' ') + '" fill="url(#' + lip + ')" stroke="' + edge + '" stroke-width=".8" stroke-linejoin="round"/>';
    };
    for (let i = 0; i < n; i++) {
      let a = (i * (360 / n) - 90) * Math.PI / 180;
      if (style === 'twin5') a += (i % 2 ? -.12 : .12);
      if (style === 'split5') { s += poly(a - .1, .12, .04, 18, 77) + poly(a + .1, .12, .04, 18, 77); continue; }
      s += poly(a, spokes[1] + .25, spokes[2], 16, 77);
    }
    if (style === 'mesh') {
      for (let i = 0; i < 10; i++) {
        const a = (i * 36 - 72) * Math.PI / 180, b2 = ((i + 1) * 36 - 72) * Math.PI / 180;
        s += '<line x1="' + (100 + Math.cos(a) * 42).toFixed(1) + '" y1="' + (98 + Math.sin(a) * 42).toFixed(1) + '" x2="' + (100 + Math.cos(b2 + .3) * 74).toFixed(1) + '" y2="' + (98 + Math.sin(b2 + .3) * 74).toFixed(1) + '" stroke="' + shade(col, 10) + '" stroke-width="3.5"/>';
      }
    }
    s += '<circle cx="100" cy="98" r="22" fill="url(#' + lip + ')" stroke="' + edge + '"/>';
    const lugs = opts.lugs || 5;
    for (let i = 0; i < lugs; i++) {
      const a = (i * (360 / lugs) - 90) * Math.PI / 180;
      s += '<circle cx="' + (100 + Math.cos(a) * 15).toFixed(1) + '" cy="' + (98 + Math.sin(a) * 15).toFixed(1) + '" r="2.6" fill="#1f2125"/>';
    }
    s += '<circle cx="100" cy="98" r="8" fill="#111" /><text x="100" y="101.5" text-anchor="middle" font-family="Inter,Arial" font-size="8" font-weight="800" fill="#60a5fa">' + esc((opts.brand || 'A').charAt(0)) + '</text>';
    s += '</svg>';
    return s;
  }

  /* ---------------- Battery ---------------- */
  function battery(opts) {
    opts = opts || {};
    const c = opts.color || '#111111', g = id('bg');
    let s = '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Battery">';
    s += '<defs><linearGradient id="' + g + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f3237"/><stop offset="1" stop-color="#141518"/></linearGradient></defs>';
    s += '<ellipse cx="100" cy="176" rx="74" ry="6" fill="rgba(17,17,17,.15)"/>';
    s += '<rect x="44" y="40" width="20" height="16" rx="3" fill="#9ca3af"/><rect x="136" y="40" width="20" height="16" rx="3" fill="#9ca3af"/>';
    s += '<rect x="30" y="52" width="140" height="120" rx="10" fill="url(#' + g + ')"/>';
    s += '<rect x="30" y="52" width="140" height="22" rx="10" fill="#3a3d43"/>';
    s += '<rect x="40" y="88" width="120" height="54" rx="6" fill="' + c + '"/>';
    s += '<text x="100" y="112" text-anchor="middle" font-family="Inter,Arial" font-size="14" font-weight="800" fill="#fff" letter-spacing="1">' + esc((opts.brand || '').toUpperCase()) + '</text>';
    s += '<text x="100" y="130" text-anchor="middle" font-family="Inter,Arial" font-size="10" font-weight="600" fill="#fff" opacity=".8">' + esc(opts.model || '12V') + '</text>';
    s += '<text x="54" y="70" text-anchor="middle" font-family="Inter,Arial" font-size="14" font-weight="800" fill="#60a5fa">+</text><text x="146" y="70" text-anchor="middle" font-family="Inter,Arial" font-size="14" font-weight="800" fill="#d1d5db">−</text>';
    s += '</svg>';
    return s;
  }

  /* ---------------- Bottle (oil / fluid / care) ---------------- */
  function bottle(opts) {
    opts = opts || {};
    const c = opts.color || '#2563eb', g = id('og');
    let s = '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Bottle">';
    s += '<defs><linearGradient id="' + g + '" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="' + shade(c, -20) + '"/><stop offset=".45" stop-color="' + shade(c, 15) + '"/><stop offset="1" stop-color="' + shade(c, -30) + '"/></linearGradient></defs>';
    s += '<ellipse cx="100" cy="182" rx="60" ry="6" fill="rgba(17,17,17,.15)"/>';
    s += '<rect x="82" y="20" width="30" height="18" rx="4" fill="#111"/>';
    s += '<path d="M54 64 C54 48 66 38 84 38 L112 38 C122 38 128 42 134 50 L148 64 L148 168 C148 176 142 180 134 180 L66 180 C58 180 54 176 54 168 Z" fill="url(#' + g + ')"/>';
    s += '<path d="M120 46 L140 46 C146 46 150 50 150 56 L150 84" fill="none" stroke="' + shade(c, -25) + '" stroke-width="10" stroke-linecap="round"/>';
    s += '<rect x="64" y="92" width="74" height="66" rx="6" fill="#fff" opacity=".95"/>';
    s += '<rect x="64" y="92" width="74" height="12" rx="6" fill="' + shade(c, -35) + '"/>';
    s += '<text x="101" y="124" text-anchor="middle" font-family="Inter,Arial" font-size="11" font-weight="800" fill="#111">' + esc((opts.brand || '').toUpperCase().slice(0, 10)) + '</text>';
    s += '<text x="101" y="142" text-anchor="middle" font-family="Inter,Arial" font-size="10" font-weight="700" fill="' + shade(c, -30) + '">' + esc(opts.label || '') + '</text>';
    s += '<rect x="62" y="56" width="6" height="110" rx="3" fill="#fff" opacity=".18"/>';
    s += '</svg>';
    return s;
  }

  /* ---------------- Brake (rotor + caliper) ---------------- */
  function brake(opts) {
    opts = opts || {};
    const c = opts.color || '#dc2626', g = id('bk');
    let s = '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Brake">';
    s += '<defs><radialGradient id="' + g + '"><stop offset=".3" stop-color="#e5e7eb"/><stop offset="1" stop-color="#9ca3af"/></radialGradient></defs>';
    s += '<ellipse cx="100" cy="188" rx="66" ry="6" fill="rgba(17,17,17,.15)"/>';
    s += '<circle cx="96" cy="100" r="80" fill="url(#' + g + ')" stroke="#6b7280"/>';
    for (let i = 0; i < 24; i++) { const a = i * 15 * Math.PI / 180; s += '<circle cx="' + (96 + Math.cos(a) * 60).toFixed(1) + '" cy="' + (100 + Math.sin(a) * 60).toFixed(1) + '" r="2.4" fill="#6b7280"/>'; }
    s += '<circle cx="96" cy="100" r="34" fill="#4b5563"/><circle cx="96" cy="100" r="12" fill="#1f2937"/>';
    for (let i = 0; i < 5; i++) { const a = (i * 72 - 90) * Math.PI / 180; s += '<circle cx="' + (96 + Math.cos(a) * 22).toFixed(1) + '" cy="' + (100 + Math.sin(a) * 22).toFixed(1) + '" r="4" fill="#d1d5db"/>'; }
    s += '<path d="M140 34 C168 52 182 78 182 100 C182 122 168 148 140 166 L122 150 C140 136 150 118 150 100 C150 82 140 64 122 50 Z" fill="' + (opts.part === 'pads' ? '#111' : c) + '"/>';
    s += '<text x="160" y="104" text-anchor="middle" font-family="Inter,Arial" font-size="9" font-weight="800" fill="#fff" transform="rotate(90 160 100)">' + esc((opts.brand || '').toUpperCase().slice(0, 9)) + '</text>';
    s += '</svg>';
    return s;
  }

  /* ---------------- Filter ---------------- */
  function filter(opts) {
    opts = opts || {};
    const c = opts.color || '#2563eb';
    let s = '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Filter">';
    s += '<ellipse cx="100" cy="182" rx="60" ry="7" fill="rgba(17,17,17,.15)"/>';
    s += '<rect x="48" y="40" width="104" height="136" rx="14" fill="' + c + '"/>';
    for (let i = 0; i < 8; i++) s += '<rect x="' + (54 + i * 12.5) + '" y="46" width="6" height="124" rx="3" fill="#000" opacity=".12"/>';
    s += '<ellipse cx="100" cy="40" rx="52" ry="12" fill="' + shade(c, 25) + '"/><ellipse cx="100" cy="40" rx="20" ry="5" fill="#111"/>';
    s += '<rect x="58" y="96" width="84" height="30" rx="5" fill="#fff"/>';
    s += '<text x="100" y="116" text-anchor="middle" font-family="Inter,Arial" font-size="11" font-weight="800" fill="#111">' + esc((opts.brand || '').toUpperCase().slice(0, 10)) + '</text>';
    s += '</svg>';
    return s;
  }

  /* ---------------- Shock / Coilover ---------------- */
  function shock(opts) {
    opts = opts || {};
    const c = opts.color || '#3b82f6';
    let s = '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Suspension">';
    s += '<ellipse cx="100" cy="188" rx="40" ry="5" fill="rgba(17,17,17,.15)"/>';
    s += '<rect x="94" y="12" width="12" height="60" rx="4" fill="#cbd5e1"/><circle cx="100" cy="16" r="10" fill="none" stroke="#6b7280" stroke-width="5"/>';
    s += '<rect x="80" y="70" width="40" height="104" rx="8" fill="#1f2937"/><circle cx="100" cy="180" r="10" fill="none" stroke="#6b7280" stroke-width="5"/>';
    let d = 'M70 48';
    for (let i = 0; i < 9; i++) d += ' L130 ' + (54 + i * 12) + ' L70 ' + (60 + i * 12);
    s += '<path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>';
    s += '<rect x="66" y="40" width="68" height="8" rx="3" fill="#9ca3af"/><rect x="66" y="160" width="68" height="8" rx="3" fill="#9ca3af"/>';
    s += '</svg>';
    return s;
  }

  /* ---------------- Bulb ---------------- */
  function bulb(opts) {
    opts = opts || {};
    let s = '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Bulb">';
    const g = id('lb');
    s += '<defs><radialGradient id="' + g + '"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#dbeafe"/><stop offset="1" stop-color="#93c5fd" stop-opacity="0"/></radialGradient></defs>';
    s += '<circle cx="100" cy="74" r="70" fill="url(#' + g + ')"/>';
    s += '<path d="M76 70 C76 50 88 38 100 38 C112 38 124 50 124 70 L120 112 L80 112 Z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>';
    s += '<rect x="94" y="58" width="12" height="36" rx="3" fill="#60a5fa"/>';
    s += '<rect x="78" y="112" width="44" height="18" rx="3" fill="#9ca3af"/><rect x="74" y="130" width="52" height="34" rx="5" fill="#1f2937"/>';
    s += '<g stroke="#4b5563" stroke-width="3">' + [0, 1, 2, 3].map((i) => '<line x1="' + (82 + i * 12) + '" y1="164" x2="' + (82 + i * 12) + '" y2="178"/>').join('') + '</g>';
    s += '<text x="100" y="152" text-anchor="middle" font-family="Inter,Arial" font-size="9" font-weight="800" fill="#fff">' + esc((opts.brand || '').toUpperCase().slice(0, 9)) + '</text>';
    s += '</svg>';
    return s;
  }

  /* ---------------- Generic tile ---------------- */
  function generic(opts) {
    opts = opts || {};
    const icon = AC.icon ? AC.icon(opts.icon || 'box') : '';
    return '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Product">' +
      '<ellipse cx="100" cy="176" rx="62" ry="6" fill="rgba(17,17,17,.12)"/>' +
      '<rect x="36" y="34" width="128" height="128" rx="26" fill="' + (opts.color || '#111') + '"/>' +
      '<rect x="36" y="34" width="128" height="64" rx="26" fill="#fff" opacity=".06"/>' +
      '<g transform="translate(64 58) scale(3)" fill="none" stroke="#60a5fa" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + icon.replace(/<svg[^>]*>/, '').replace('</svg>', '') + '</g>' +
      '<text x="100" y="150" text-anchor="middle" font-family="Inter,Arial" font-size="10" font-weight="800" fill="#fff" letter-spacing="1.5">' + esc((opts.brand || '').toUpperCase().slice(0, 14)) + '</text>' +
      '</svg>';
  }

  /* Product image dispatcher */
  function product(p, big) {
    if (!p) return generic({});
    const a = p.art || {};
    switch (a.kind) {
      case 'tire': return tire({ brand: p.brand, model: p.name, size: p.variants && p.variants[0] ? p.variants[0].label : '' });
      case 'wheel': return wheel({ brand: p.brand, finish: a.finish, style: a.style, lugs: a.lugs });
      case 'battery': return battery({ brand: p.brand, model: a.model, color: a.color });
      case 'bottle': return bottle({ brand: p.brand, label: a.label, color: a.color });
      case 'brake': return brake({ brand: p.brand, color: a.color, part: a.part });
      case 'filter': return filter({ brand: p.brand, color: a.color });
      case 'shock': return shock({ color: a.color });
      case 'bulb': return bulb({ brand: p.brand });
      default: return generic({ icon: a.icon, brand: p.brand, color: a.color });
    }
  }

  AC.art = { car, tire, wheel, battery, bottle, brake, filter, shock, bulb, generic, product, shade, FINISH };
})();
