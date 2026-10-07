/* =========================================================
   AUTOCARE — shop/shop-common.js
   Shared shop UI: product card, quick add-to-cart,
   stock labels. Used by landing + shop pages.
   ========================================================= */
window.AC = window.AC || {};

AC.shopUI = (function () {
  const u = AC.u, H = AC.data.productHelpers;

  function stockLabel(stock, min) {
    const st = H.stockStatus(stock, min);
    return '<span class="stock-dot ' + (st === 'Out of Stock' ? 'out' : st === 'Low Stock' ? 'low' : '') + '">' + (st === 'Low Stock' ? 'Only ' + stock + ' left' : st) + '</span>';
  }
  function unitShort(p) { return p.cat === 'tires' ? '/ tire' : p.cat === 'wheels' ? '/ set' : ''; }

  function card(p, opts) {
    opts = opts || {};
    const base = opts.base || '#/product/';
    const v = opts.variant || p.variants.find((x) => x.stock > 0) || p.variants[0];
    const many = p.variants.length > 1;
    const total = H.totalStock(p);
    const href = base + encodeURIComponent(p.id) + (opts.variant ? '?v=' + encodeURIComponent(v.key) : '');
    return '<article class="card card-hover product-card">' +
      '<a class="media" href="' + href + '" aria-label="' + u.esc(p.title) + '">' + AC.art.product(p) +
      '<div class="flags">' + (p.tags || []).slice(0, 1).map((t) => '<span class="badge badge-dark no-dot">' + u.esc(t) + '</span>').join('') +
      (total === 0 ? '<span class="badge badge-red no-dot">Sold out</span>' : '') + '</div>' +
      '<span class="quick btn btn-white btn-sm">' + AC.icon('eye') + 'View</span></a>' +
      '<div class="info"><div class="brand">' + u.esc(p.brand) + '</div>' +
      '<a class="name" href="' + href + '">' + u.esc(p.name) + '</a>' +
      '<div class="spec">' + u.esc(H.variantSpec(p, v)) + (many && !opts.variant ? ' · +' + (p.variants.length - 1) + ' more' : '') + '</div>' +
      '<div class="flex items-center between gap-8"><span class="rating">' + AC.icon('star') + p.rating.toFixed(1) + ' <span class="muted">(' + p.reviews + ')</span></span>' + stockLabel(v.stock, p.minStock) + '</div>' +
      '<div class="row"><div class="price">' + (many && !opts.variant ? '<small>from </small>' : '') + u.peso(opts.variant ? v.price : H.minPrice(p)) + ' <small>' + unitShort(p) + '</small></div>' +
      '<button class="add-btn" data-add="' + p.id + '" data-vkey="' + u.esc(v.key) + '" aria-label="Add ' + u.esc(p.title) + ' to cart" ' + (v.stock <= 0 ? 'disabled style="opacity:.4"' : '') + '>' + AC.icon('plus') + '</button></div>' +
      '</div></article>';
  }

  /* Delegated quick-add */
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-add]');
    if (!b || b.disabled) return;
    e.preventDefault();
    const p = AC.store.product(b.dataset.add);
    const qty = p && p.cat === 'tires' ? 4 : 1;
    if (AC.store.addToCart(b.dataset.add, b.dataset.vkey, qty)) {
      AC.ui.toast('Added to cart', (qty > 1 ? qty + ' × ' : '') + p.title + ' · ' + b.dataset.vkey, 'success');
      b.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.18)' }, { transform: 'scale(1)' }], { duration: 300 });
    } else AC.ui.toast('Out of stock', 'This size is currently unavailable.', 'warning');
  });

  return { card, stockLabel, unitShort };
})();
