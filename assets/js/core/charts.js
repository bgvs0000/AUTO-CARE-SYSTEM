/* =========================================================
   AUTOCARE — core/charts.js
   Dependency-free SVG charts: line/area, bar, donut,
   horizontal bars, sparkline. Responsive + hover tooltips.
   Palette (validated categorical order): blue, orange, aqua, pink
   ========================================================= */
window.AC = window.AC || {};

AC.charts = (function () {
  const u = AC.u;
  const PALETTE = ['#2a78d6', '#eb6834', '#1baf7a', '#e87ba4'];
  const NS = 'http://www.w3.org/2000/svg';

  function niceMax(v) {
    if (v <= 0) return 1;
    const p = Math.pow(10, Math.floor(Math.log10(v))), m = v / p;
    const n = m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10;
    return n * p;
  }
  function fmtDefault(v) { return u.num(Math.round(v)); }

  /* Mount with auto re-render on resize */
  function mount(el, draw) {
    if (!el) return;
    el.classList.add('chart');
    const render = () => { if (el.isConnected) draw(el, Math.max(260, el.clientWidth || 600)); };
    render();
    if ('ResizeObserver' in window) {
      let lastW = el.clientWidth;
      const ro = new ResizeObserver(() => {
        if (!el.isConnected) { ro.disconnect(); return; }
        if (Math.abs(el.clientWidth - lastW) > 4) { lastW = el.clientWidth; render(); }
      });
      ro.observe(el);
    }
  }

  function legendHtml(series) {
    if (series.length < 2) return '';
    return '<div class="legend mb-12">' + series.map((s, i) => '<span class="legend-item"><span class="legend-key" style="background:' + (s.color || PALETTE[i]) + '"></span>' + u.esc(s.name) + '</span>').join('') + '</div>';
  }
  function tipEl(el) {
    let t = el.querySelector('.chart-tip');
    if (!t) { t = document.createElement('div'); t.className = 'chart-tip'; el.appendChild(t); }
    return t;
  }

  /* ---------------- Line / Area ---------------- */
  function line(el, o) {
    if (el && !el.id) el.id = 'ch' + Math.random().toString(36).slice(2, 8);
    mount(el, (root, W) => {
      const H = o.height || 260, pl = 48, pr = 12, pt = 12, pb = 28;
      const fmt = o.format || fmtDefault;
      const max = niceMax(Math.max.apply(null, o.series.flatMap((s) => s.data)) * 1.08);
      const n = o.labels.length, iw = W - pl - pr, ih = H - pt - pb;
      const x = (i) => pl + (n === 1 ? iw / 2 : (i * iw) / (n - 1));
      const y = (v) => pt + ih - (v / max) * ih;
      let s = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + u.esc(o.label || 'Line chart') + '"><defs>';
      o.series.forEach((se, i) => { const c = se.color || PALETTE[i]; s += '<linearGradient id="lg' + i + '-' + el.id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + c + '" stop-opacity=".16"/><stop offset="1" stop-color="' + c + '" stop-opacity="0"/></linearGradient>'; });
      s += '</defs>';
      for (let g = 0; g <= 4; g++) {
        const v = (max / 4) * g, yy = y(v);
        s += '<line class="grid-line" x1="' + pl + '" x2="' + (W - pr) + '" y1="' + yy + '" y2="' + yy + '"/>';
        s += '<text class="axis-text" x="' + (pl - 8) + '" y="' + (yy + 4) + '" text-anchor="end">' + (o.axisFormat || fmt)(v) + '</text>';
      }
      const step = Math.ceil(n / Math.max(2, Math.floor(iw / 64)));
      o.labels.forEach((l, i) => { if (i % step === 0 || i === n - 1) s += '<text class="axis-text" x="' + x(i) + '" y="' + (H - 8) + '" text-anchor="middle">' + u.esc(l) + '</text>'; });
      o.series.forEach((se, i) => {
        const c = se.color || PALETTE[i];
        const pts = se.data.map((v, j) => [x(j), y(v)]);
        const d = pts.map((p, j) => (j ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
        if (o.area !== false) s += '<path d="' + d + ' L' + x(n - 1) + ' ' + (pt + ih) + ' L' + x(0) + ' ' + (pt + ih) + ' Z" fill="url(#lg' + i + '-' + el.id + ')"/>';
        s += '<path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" style="--len:2400;stroke-dasharray:2400;animation:drawLine 1.2s ease forwards"/>';
      });
      s += '<line class="xh" x1="0" x2="0" y1="' + pt + '" y2="' + (pt + ih) + '" stroke="#111" stroke-opacity=".2" stroke-dasharray="3 3" style="display:none"/>';
      o.series.forEach((se, i) => { s += '<circle class="hd hd' + i + '" r="4.5" fill="' + (se.color || PALETTE[i]) + '" stroke="#fff" stroke-width="2" style="display:none"/>'; });
      s += '<rect class="hit" x="' + pl + '" y="' + pt + '" width="' + iw + '" height="' + ih + '" fill="transparent"/></svg>';
      root.innerHTML = legendHtml(o.series) + s;
      const svg = root.querySelector('svg'), tip = tipEl(root), xh = svg.querySelector('.xh');
      const hit = svg.querySelector('.hit');
      const move = (clientX) => {
        const r = svg.getBoundingClientRect();
        const mx = clientX - r.left;
        const i = u.clamp(Math.round(((mx - pl) / iw) * (n - 1)), 0, n - 1);
        xh.setAttribute('x1', x(i)); xh.setAttribute('x2', x(i)); xh.style.display = '';
        o.series.forEach((se, k) => { const c = svg.querySelector('.hd' + k); c.setAttribute('cx', x(i)); c.setAttribute('cy', y(se.data[i])); c.style.display = ''; });
        tip.innerHTML = '<div class="tip-title">' + u.esc(o.labels[i]) + '</div>' + o.series.map((se, k) => '<div class="tip-row"><span class="tip-key" style="background:' + (se.color || PALETTE[k]) + '"></span>' + u.esc(se.name) + '<b style="margin-left:auto;padding-left:12px">' + fmt(se.data[i]) + '</b></div>').join('');
        const top = Math.min.apply(null, o.series.map((se) => y(se.data[i])));
        tip.style.left = u.clamp(x(i), 70, W - 70) + 'px'; tip.style.top = (top + (root.querySelector('.legend') ? 34 : 0)) + 'px';
        tip.classList.add('show');
      };
      const leave = () => { xh.style.display = 'none'; svg.querySelectorAll('.hd').forEach((c) => (c.style.display = 'none')); tip.classList.remove('show'); };
      hit.addEventListener('mousemove', (e) => move(e.clientX));
      hit.addEventListener('touchstart', (e) => move(e.touches[0].clientX), { passive: true });
      hit.addEventListener('mouseleave', leave);
    });
  }

  /* ---------------- Bar (grouped) ---------------- */
  function bar(el, o) {
    mount(el, (root, W) => {
      const H = o.height || 260, pl = 48, pr = 8, pt = 12, pb = 28;
      const fmt = o.format || fmtDefault;
      const max = niceMax(Math.max.apply(null, o.series.flatMap((s) => s.data)) * 1.08);
      const n = o.labels.length, iw = W - pl - pr, ih = H - pt - pb;
      const band = iw / n, ns = o.series.length;
      const bw = Math.max(4, Math.min(28, (band * .66 - (ns - 1) * 2) / ns));
      const y = (v) => pt + ih - (v / max) * ih;
      let s = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + u.esc(o.label || 'Bar chart') + '">';
      for (let g = 0; g <= 4; g++) {
        const v = (max / 4) * g, yy = y(v);
        s += '<line class="grid-line" x1="' + pl + '" x2="' + (W - pr) + '" y1="' + yy + '" y2="' + yy + '"/>';
        s += '<text class="axis-text" x="' + (pl - 8) + '" y="' + (yy + 4) + '" text-anchor="end">' + (o.axisFormat || fmt)(v) + '</text>';
      }
      const step = Math.ceil(n / Math.max(2, Math.floor(iw / 48)));
      o.labels.forEach((l, i) => {
        const cx = pl + band * i + band / 2;
        s += '<rect class="band" data-i="' + i + '" x="' + (pl + band * i) + '" y="' + pt + '" width="' + band + '" height="' + ih + '" fill="transparent"/>';
        const gw = ns * bw + (ns - 1) * 2;
        o.series.forEach((se, k) => {
          const v = se.data[i], bx = cx - gw / 2 + k * (bw + 2), by = y(v), bh = pt + ih - by, r = Math.min(4, bw / 2, bh);
          const c = se.color || PALETTE[k];
          s += '<path class="bar" data-i="' + i + '" d="M' + bx + ' ' + (pt + ih) + ' V' + (by + r) + ' Q' + bx + ' ' + by + ' ' + (bx + r) + ' ' + by + ' H' + (bx + bw - r) + ' Q' + (bx + bw) + ' ' + by + ' ' + (bx + bw) + ' ' + (by + r) + ' V' + (pt + ih) + ' Z" fill="' + c + '" style="transform-origin:0 ' + (pt + ih) + 'px;animation:growY .7s var(--ease) both ' + (i * .03) + 's;transition:opacity .2s"/>';
        });
        if (i % step === 0) s += '<text class="axis-text" x="' + cx + '" y="' + (H - 8) + '" text-anchor="middle">' + u.esc(l) + '</text>';
      });
      s += '</svg>';
      root.innerHTML = legendHtml(o.series) + s;
      const svg = root.querySelector('svg'), tip = tipEl(root);
      const show = (i) => {
        svg.querySelectorAll('.bar').forEach((b) => (b.style.opacity = b.dataset.i == i ? 1 : .35));
        tip.innerHTML = '<div class="tip-title">' + u.esc(o.labels[i]) + '</div>' + o.series.map((se, k) => '<div class="tip-row"><span class="tip-key" style="background:' + (se.color || PALETTE[k]) + '"></span>' + u.esc(se.name) + '<b style="margin-left:auto;padding-left:12px">' + fmt(se.data[i]) + '</b></div>').join('');
        const top = Math.min.apply(null, o.series.map((se) => y(se.data[i])));
        tip.style.left = u.clamp(pl + band * i + band / 2, 70, W - 70) + 'px'; tip.style.top = (top + (root.querySelector('.legend') ? 34 : 0)) + 'px';
        tip.classList.add('show');
      };
      svg.querySelectorAll('.band').forEach((b) => {
        b.addEventListener('mouseenter', () => show(+b.dataset.i));
        b.addEventListener('touchstart', () => show(+b.dataset.i), { passive: true });
      });
      svg.addEventListener('mouseleave', () => { svg.querySelectorAll('.bar').forEach((b) => (b.style.opacity = 1)); tip.classList.remove('show'); });
    });
  }

  /* ---------------- Donut ---------------- */
  function donut(el, o) {
    el.classList.add('chart');
    const fmt = o.format || fmtDefault;
    const total = u.sum(o.items, (i) => i.value) || 1;
    const R = 70, C = 2 * Math.PI * R, size = o.size || 180;
    let off = 0;
    let s = '<svg width="' + size + '" height="' + size + '" viewBox="0 0 180 180" role="img" aria-label="' + u.esc(o.label || 'Donut chart') + '" style="flex-shrink:0;width:' + size + 'px">';
    s += '<circle cx="90" cy="90" r="' + R + '" fill="none" stroke="#f1f2f4" stroke-width="20"/>';
    o.items.forEach((it, i) => {
      const len = (it.value / total) * C, gap = o.items.length > 1 ? 2 : 0;
      s += '<circle class="seg" data-i="' + i + '" cx="90" cy="90" r="' + R + '" fill="none" stroke="' + (it.color || PALETTE[i % 4]) + '" stroke-width="20" stroke-dasharray="' + Math.max(0, len - gap) + ' ' + (C - Math.max(0, len - gap)) + '" stroke-dashoffset="' + (-off) + '" transform="rotate(-90 90 90)" style="transition:stroke-width .2s, opacity .2s;cursor:pointer"/>';
      off += len;
    });
    s += '<text x="90" y="86" text-anchor="middle" font-size="20" font-weight="750" fill="#111" font-family="Inter,Arial" class="dc-v">' + u.esc(o.center ? o.center.value : fmt(total)) + '</text>';
    s += '<text x="90" y="106" text-anchor="middle" font-size="11" fill="#6b7280" font-family="Inter,Arial" class="dc-l">' + u.esc(o.center ? o.center.label : 'Total') + '</text></svg>';
    const legend = '<div class="donut-legend">' + o.items.map((it, i) => '<div class="row" data-i="' + i + '"><span class="legend-key" style="background:' + (it.color || PALETTE[i % 4]) + '"></span>' + u.esc(it.label) + '<b>' + fmt(it.value) + '</b><span class="muted small" style="width:40px;text-align:right">' + Math.round((it.value / total) * 100) + '%</span></div>').join('') + '</div>';
    el.innerHTML = '<div class="donut-wrap">' + s + legend + '</div>';
    const segs = el.querySelectorAll('.seg'), v = el.querySelector('.dc-v'), l = el.querySelector('.dc-l');
    const hi = (i) => {
      segs.forEach((c) => { c.style.opacity = i == null || c.dataset.i == i ? 1 : .3; c.setAttribute('stroke-width', c.dataset.i == i ? 24 : 20); });
      if (i == null) { v.textContent = o.center ? o.center.value : fmt(total); l.textContent = o.center ? o.center.label : 'Total'; }
      else { v.textContent = fmt(o.items[i].value); l.textContent = o.items[i].label.length > 16 ? o.items[i].label.slice(0, 15) + '…' : o.items[i].label; }
    };
    el.querySelectorAll('.seg, .donut-legend .row').forEach((n) => { n.addEventListener('mouseenter', () => hi(n.dataset.i)); n.addEventListener('mouseleave', () => hi(null)); });
  }

  /* ---------------- Horizontal bars ---------------- */
  function hbars(el, items, o) {
    o = o || {};
    const fmt = o.format || fmtDefault;
    const max = Math.max.apply(null, items.map((i) => i.value)) || 1;
    el.innerHTML = items.map((it) => '<div class="hbar-row"><span class="truncate" title="' + u.esc(it.label) + '">' + u.esc(it.label) + '</span><div class="hbar-track"><div class="hbar-fill" style="width:0;background:' + (o.color || PALETTE[0]) + '" data-w="' + ((it.value / max) * 100).toFixed(1) + '"></div></div><b class="text-right" style="font-variant-numeric:tabular-nums">' + fmt(it.value) + '</b></div>').join('');
    requestAnimationFrame(() => requestAnimationFrame(() => el.querySelectorAll('.hbar-fill').forEach((f) => (f.style.width = f.dataset.w + '%'))));
  }

  /* ---------------- Sparkline ---------------- */
  function spark(values, color) {
    const W = 120, H = 44, max = Math.max.apply(null, values), min = Math.min.apply(null, values), rg = max - min || 1;
    const pts = values.map((v, i) => [(i / (values.length - 1)) * W, H - 6 - ((v - min) / rg) * (H - 14)]);
    const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
    const c = color || PALETTE[0];
    return '<svg class="stat-spark" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" aria-hidden="true"><path d="' + d + ' L' + W + ' ' + H + ' L0 ' + H + ' Z" fill="' + c + '" opacity=".08"/><path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>';
  }

  return { line, bar, donut, hbars, spark, PALETTE };
})();
