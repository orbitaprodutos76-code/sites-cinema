(function (root) {
  'use strict';

  /* ================================================================
     GARIMPADOS SHOP — vitrine de afiliados + provador em pedestal
     ================================================================ */

  var RESET = ':root{color-scheme:light;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}html{scroll-padding-top:env(safe-area-inset-top,0px)}body{margin:0;padding:0;font:14px -apple-system,BlinkMacSystemFont,sans-serif;background:#fff;color:#000}img{max-width:100%}[hidden]:not([hidden=until-found i]){display:none!important}';
  var DEFAULT_STATE = {
    v: 4,
    store: { name: 'Garimpados Shop', tagline: 'Streetwear garimpado com preço de achado.', instagram: '' },
    products: []
  };

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function jsonLd(state) {
    var items = (state.products || []).filter(function (p) { return !p.hidden && p.link; }).slice(0, 40).map(function (p, i) {
      var it = { '@type': 'ListItem', position: i + 1, item: { '@type': 'Product', name: p.name, category: p.category || undefined, brand: p.store ? { '@type': 'Brand', name: p.store } : undefined, url: p.link } };
      if (p.price != null) it.item.offers = { '@type': 'Offer', price: Number(p.price).toFixed(2), priceCurrency: 'BRL', url: p.link, availability: 'https://schema.org/InStock' };
      return it;
    });
    var data = [{ '@context': 'https://schema.org', '@type': 'WebSite', name: state.store.name || 'Garimpados Shop', description: state.store.tagline || '', inLanguage: 'pt-BR' }];
    if (items.length) data.push({ '@context': 'https://schema.org', '@type': 'ItemList', name: 'Vitrine', itemListElement: items });
    return JSON.stringify(data).replace(/</g, '\\u003c');
  }
  /* Unbounded nos títulos (Google Fonts); Satoshi nos textos vem da pasta fonts/ (style.css) */
  var FONTS = 'https://fonts.googleapis.com/css2?family=Anton&family=JetBrains+Mono:wght@500;700&display=swap';
  function pageContent(state) {
    var json = JSON.stringify(state).replace(/</g, '\\u003c')
      .split(String.fromCharCode(0x2028)).join('\\u2028')
      .split(String.fromCharCode(0x2029)).join('\\u2029');
    var name = esc(state.store.name || 'Garimpados Shop');
    var desc = esc(((state.store.tagline || '') + ' Vitrine de streetwear com provador e links oficiais das lojas.').trim());
    return '<title>' + name + '</title>' +
      '<meta name="claude:viewport-fit-sides" content="cover">' +
      '<meta name="description" content="' + desc + '">' +
      '<meta name="theme-color" content="#000000">' +
      '<meta property="og:type" content="website"><meta property="og:title" content="' + name + '">' +
      '<meta property="og:description" content="' + desc + '"><meta name="twitter:card" content="summary">' +
      '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
      '<link rel="stylesheet" href="' + FONTS + '">' +
      '<link rel="preload" href="fonts/satoshi-400.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="fonts/satoshi-700.woff2" as="font" type="font/woff2" crossorigin>' +
      '<link rel="stylesheet" href="style.css">' +
      '<div id="app"></div><div id="admin-root"></div>' +
      '<script type="application/json" id="store-data">' + json + '</script>' +
      '<script type="application/ld+json">' + jsonLd(state) + '</script>' +
      '<script src="js/gsap.min.js"></script><script src="js/ScrollTrigger.min.js"></script><script src="js/camera.js"></script><script src="js/vitrine.js"></script><script src="js/atende.js"></script>' +
      /* formulário escondido: o Netlify lê na publicação e passa a guardar os contatos do "Avise quando baixar" */
      '<form name="avise" data-netlify="true" netlify-honeypot="bot" hidden><input name="bot"><input name="peca"><input name="id"><input name="preco"><input name="contato"><input name="consentimento"><input name="data"></form>' +
      '<script src="app.js" charset="utf-8"></script>';
  }
  function pageDocument(state) {
    return '<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover"><style>' +
      RESET + '</style></head><body>' + pageContent(state) + '</body></html>';
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { pageContent: pageContent, pageDocument: pageDocument, DEFAULT_STATE: DEFAULT_STATE };
    return;
  }
  if (typeof document === 'undefined') return;

  /* ---------------- estado ---------------- */
  document.documentElement.setAttribute('lang', 'pt-BR');
  var state = loadState();
  var ui = { tamR: readLS('gs-tam-r', ''), tg: { tam: readLS('gs-tam-t', ''), preco: '', off: '', estilo: '', sort: 'auto' }, hotTab: 'r', cat: 'all', sort: 'auto', favOnly: false, q: '', canEdit: false, apis: { artifact: null, assets: null, mcp: null, sample: null }, adminBuilt: false, editing: null, busy: false, slot: 'top', outfit: {}, sheet: null, sizes: readLS('gs-sizes', {}) };
  var favs = readLS('gs-favs', []);
  function readLS(k, fb) { try { var v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? fb : v; } catch (e) { return fb; } }
  function writeLS(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sem storage */ } }
  function loadState() {
    try {
      var d = JSON.parse(document.getElementById('store-data').textContent);
      if (d && Array.isArray(d.products) && d.store) { d.v = 4; return d; }
    } catch (e) { /* padrão */ }
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  /* ---------------- utilitários ---------------- */
  var BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  var ACCENTS = new RegExp('[' + String.fromCharCode(0x300) + '-' + String.fromCharCode(0x36f) + ']', 'g');
  function norm(s) { return String(s || '').normalize('NFD').replace(ACCENTS, '').toLowerCase(); }
  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); }
  function $(id) { return document.getElementById(id); }
  function reduced() { return !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); }
  function h(tag, props, kids) {
    var e = document.createElement(tag);
    if (props) Object.keys(props).forEach(function (k) {
      var v = props[k];
      if (v == null || v === false) return;
      if (k === 'class') e.className = v;
      else if (k === 'text') e.textContent = v;
      else if (k === 'svg') e.innerHTML = v; // somente SVG estático gerado aqui
      else if (k === 'style') e.setAttribute('style', v);
      else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? '' : v);
    });
    (kids || []).forEach(function (c) { if (c == null || c === false) return; e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }
  var ICONS = {
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21.2l7.8-7.7 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/>',
    tag: '<path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1"/>',
    ruler: '<path d="M3 17L17 3l4 4L7 21z"/><path d="M7 13l2 2M10 10l2 2M13 7l2 2"/>',
    close: '<path d="M18 6L6 18M6 6l12 12"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    sliders: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
    bag: '<path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 016 0v2"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    check: '<path d="M4.5 12.5l5 5L19.5 7"/>',
    gem: '<path d="M12 2.5l9.5 9.5-9.5 9.5L2.5 12z"/><path d="M12 7l5 5-5 5-5-5z"/>',
    dice: '<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1.2" fill="currentColor"/><circle cx="15" cy="15" r="1.2" fill="currentColor"/><circle cx="15" cy="9" r="1.2" fill="currentColor"/><circle cx="9" cy="15" r="1.2" fill="currentColor"/>',
    reset: '<path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v5h5"/>',
    hanger: '<path d="M12 7a2 2 0 1 1 2-2c0 1.2-2 1.6-2 3v1"/><path d="M12 9l9 7a1.5 1.5 0 0 1-1 2.6H4a1.5 1.5 0 0 1-1-2.6l9-7z"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    fire: '<path d="M12 21c-4 0-7-2.8-7-6.6 0-3.1 2.1-5 3.6-6.8.4 1.6 1.4 2.6 2.5 3 .1-3.4 1.6-6.1 4.4-7.6-.5 2.6.5 4.5 1.9 6.1 1.4 1.6 2.6 3.2 2.6 5.3 0 3.8-3 6.6-8 6.6z"/>',
    cart: '<path d="M3 4h2.2l2.3 11h10.3l2.2-8H6.3"/><circle cx="9.5" cy="19.5" r="1.4"/><circle cx="16.5" cy="19.5" r="1.4"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    star: '<path fill="currentColor" stroke="none" d="M12 2.6l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.4l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z"/>',
    share: '<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4"/>'
  };
  function icon(name, size) {
    var s = size || 18;
    return h('span', { class: 'ico', 'aria-hidden': 'true', svg: '<svg viewBox="0 0 24 24" width="' + s + '" height="' + s + '" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" focusable="false">' + ICONS[name] + '</svg>' });
  }
  var LOGO_SVG = '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 2l14 14-14 14L2 16z"/><path d="M16 9v14M9 16h14" stroke-width="1.6"/><circle cx="16" cy="16" r="3.2" fill="currentColor" stroke="none"/></svg>';
  function parsePrice(raw) {
    var s = String(raw == null ? '' : raw).replace(/R\$|\s/g, '');
    if (!s) return null;
    if (s.indexOf(',') >= 0) s = s.replace(/\./g, '').replace(',', '.');
    else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
    var n = Number(s);
    return isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : NaN;
  }
  function money(n) { return n == null ? '' : BRL.format(n); }
  function priceInput(n) { return n == null ? '' : String(n).replace('.', ','); }
  var STORES = [['shein', 'Shein'], ['amazon|amzn|^a\\.co$', 'Amazon'], ['shopee|shope\\.ee', 'Shopee'], ['mercadolivre|mercadolibre|meli\\.la', 'Mercado Livre'], ['magazineluiza|magalu', 'Magalu'], ['aliexpress', 'AliExpress'], ['netshoes', 'Netshoes'], ['centauro', 'Centauro'], ['dafiti', 'Dafiti'], ['renner', 'Renner'], ['nike', 'Nike'], ['adidas', 'Adidas']];
  function detectStore(href) {
    try { var host = new URL(href).hostname.replace(/^www\./, '').toLowerCase(); for (var i = 0; i < STORES.length; i++) if (new RegExp(STORES[i][0]).test(host)) return STORES[i][1]; } catch (e) { /* inválido */ }
    return '';
  }
  function cleanLink(raw) {
    var s = String(raw || '').trim(); if (!s) return '';
    if (!/^[a-z][a-z0-9+.-]*:/i.test(s)) s = 'https://' + s;
    try { var u = new URL(s); if ((u.protocol !== 'https:' && u.protocol !== 'http:') || u.hostname.indexOf('.') < 0) return ''; return u.href; } catch (e) { return ''; }
  }
  function off(p) { return p.oldPrice && p.price != null && p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0; }
  function photoOf(p, i) { var list = (p.photos && p.photos.length ? p.photos : (p.photo ? [p.photo] : [])); if (list[i || 0]) return list[i || 0]; if (i) return p.img2 ? '/_blob/' + p.img2 : ''; return p.img ? '/_blob/' + p.img : ''; }
  /* miniatura leve do recorte (320px) para listas; se não existir, cai no recorte original */
  function thumbOf(p) { var c = cutOf(p); return /^img\/p\/.+-recorte\.webp$/.test(c) ? c.replace(/-recorte\.webp$/, '-recorte-sm.webp') : c; }
  function srcsetDe(p, tam) {
    var c = cutOf(p); if (!p.md || !/^img\/p\/.+-recorte\.webp$/.test(c)) return '';
    return ' srcset="' + esc(c.replace(/-recorte\.webp$/, '-recorte-sm.webp')) + ' 260w, ' + esc(c.replace(/-recorte\.webp$/, '-recorte-md.webp')) + ' 640w" sizes="' + tam + '"';
  }
  /* vira a foto do card como um cartão; a foto das costas só é baixada quando alguém toca */
  function viraCard(bt) {
    var p = byId(bt.getAttribute('data-flip')), media = bt.closest('.card__media'), im = media && media.querySelector('img');
    if (!p || !im || bt.getAttribute('data-ocupado')) return;
    var costas = bt.getAttribute('aria-pressed') !== 'true';
    if (costas && !im.getAttribute('data-frente')) { im.setAttribute('data-frente', im.getAttribute('src')); im.setAttribute('data-frente-s', im.getAttribute('srcset') || ''); }
    var alvo = costas ? cutBackOf(p) : im.getAttribute('data-frente');
    var troca = function () {
      if (costas) { im.removeAttribute('srcset'); im.src = alvo; }
      else { var fs0 = im.getAttribute('data-frente-s'); if (fs0) im.setAttribute('srcset', fs0); im.src = alvo; }
      bt.setAttribute('aria-pressed', String(costas));
      bt.setAttribute('aria-label', (costas ? 'Ver a frente: ' : 'Ver as costas: ') + p.name);
    };
    var fim = function () { bt.removeAttribute('data-ocupado'); };
    bt.setAttribute('data-ocupado', '1');
    var pre = new Image(); pre.decoding = 'async';
    pre.onerror = function () { fim(); bt.hidden = true; };
    pre.onload = function () {
      if (REDUCED || !im.animate) { troca(); fim(); return; }
      im.animate([{ transform: 'perspective(700px) rotateY(0deg)' }, { transform: 'perspective(700px) rotateY(90deg)' }], { duration: 140, easing: 'ease-in' }).onfinish = function () {
        troca();
        im.animate([{ transform: 'perspective(700px) rotateY(-90deg)' }, { transform: 'perspective(700px) rotateY(0deg)' }], { duration: 180, easing: 'ease-out' }).onfinish = fim;
      };
    };
    pre.src = alvo;
  }
  function thumbImg(p, fb) {
    var full = cutOf(p) || fb || '', im = h('img', { src: thumbOf(p) || full, alt: '', loading: 'lazy', decoding: 'async' });
    im.addEventListener('error', function () { if (im.getAttribute('src') !== full && full) im.src = full; });
    return im;
  }
  function cutOf(p) { return p.cut || (p.cutImg ? '/_blob/' + p.cutImg : ''); }
  function cutBackOf(p) { return p.cutBack || (p.backImg ? '/_blob/' + p.backImg : ''); }
  function isSample(p) { return !!(p && p.sample); }
  function sizesOf(p) { return Array.isArray(p.sizes) ? p.sizes : String(p.sizes || '').split(/[,;/]+/).map(function (s) { return s.trim(); }).filter(Boolean); }
  /* ---------------- tipos de peça e partes do corpo ---------------- */
  var KINDS = {
    conjunto: { slot: 'conjunto', label: 'Conjunto' },
    tee: { slot: 'top', label: 'Camiseta' }, hoodie: { slot: 'top', label: 'Moletom' }, jacket: { slot: 'top', label: 'Jaqueta' },
    pants: { slot: 'baixo', label: 'Calça' }, shorts: { slot: 'baixo', label: 'Bermuda' }, sneakers: { slot: 'pes', label: 'Tênis' },
    cap: { slot: 'cabeca', label: 'Boné' }, beanie: { slot: 'cabeca', label: 'Gorro' }, glasses: { slot: 'rosto', label: 'Óculos' }, chain: { slot: 'pescoco', label: 'Corrente' },
    belt: { slot: 'cintura', label: 'Cinto' }, bag: { slot: 'bolsa', label: 'Bolsa' }, socks: { slot: 'meias', label: 'Meia' }
  };
  var SLOTS = [{ id: 'top', label: 'Parte de cima' }, { id: 'baixo', label: 'Parte de baixo' }, { id: 'conjunto', label: 'Conjunto' }, { id: 'cabeca', label: 'Boné ou gorro' }, { id: 'meias', label: 'Meias' }, { id: 'pes', label: 'Tênis' }, { id: 'rosto', label: 'Óculos' }, { id: 'pescoco', label: 'Corrente' }, { id: 'cintura', label: 'Cinto' }, { id: 'bolsa', label: 'Bolsa' }];
  var SLOT_IDS = { top: 1, baixo: 1, conjunto: 1, cabeca: 1, meias: 1, pes: 1, rosto: 1, pescoco: 1, cintura: 1, bolsa: 1 };
  /* altura da meia: lida do campo "cano" ou do nome (soquete, cano médio, cano alto) */
  var CANO = { baixo: { label: 'Soquete', cm: 10 }, medio: { label: 'Cano médio', cm: 18 }, alto: { label: 'Cano alto', cm: 26 } };
  function canoOf(p) {
    if (p.cano && CANO[p.cano]) return p.cano;
    var t = norm(p.name || '');
    if (/soquete|invisivel|sapatilha|no show|cano baixo|ankle/.test(t)) return 'baixo';
    if (/cano alto|cano longo|3\/4|crew alta/.test(t)) return 'alto';
    return 'medio';
  }
  function canWearP(p) { return canWear(p); }
  function canWear(p) { var k = kindOf(p); return !!(k && cutOf(p) && SLOT_IDS[KINDS[k].slot]); }
  var SLOT_EMPTY = { conjunto: 'conjunto', cabeca: 'boné ou gorro', camada: 'jaqueta', top: 'jaqueta, moletom ou camiseta', baixo: 'calça ou bermuda', pes: 'tênis', meias: 'meia', rosto: 'óculos', pescoco: 'corrente', cintura: 'cinto', bolsa: 'bolsa ou pochete' };
  var KIND_CAT = { conjunto: 'Conjuntos', tee: 'Camisetas', hoodie: 'Moletons', jacket: 'Jaquetas', pants: 'Calças', shorts: 'Bermudas', sneakers: 'Tênis', cap: 'Bonés', beanie: 'Gorros', glasses: 'Acessórios', chain: 'Acessórios', belt: 'Acessórios', bag: 'Bolsas', socks: 'Meias' };
  function autoCategory(p) { var k = kindOf(p); return (k && KIND_CAT[k]) || 'Geral'; }
  function kindOf(p) {
    if (p.kind === 'none') return null;
    if (p.kind && KINDS[p.kind]) return p.kind;
    var t = norm((p.category || '') + ' ' + (p.name || ''));
    if (/\bconjuntos?\b|\b2 pecas\b|\bduas pecas\b/.test(t)) return 'conjunto';
    if (/oculos|sunglass/.test(t)) return 'glasses';
    if (/corrente|colar|cordao de|pingente|chain/.test(t)) return 'chain';
    if (/cinto|belt/.test(t)) return 'belt';
    if (/bolsa|pochete|shoulder bag|transversal|bag\b/.test(t)) return 'bag';
    if (/gorro|touca|beanie/.test(t)) return 'beanie';
    if (/bone|cap\b|bucket|chapeu|trucker/.test(t)) return 'cap';
    if (/\bmeias?\b|soquete|\bsocks?\b/.test(t)) return 'socks';
    if (/tenis|sapato|bota|sneaker|chinelo|slide|calcado/.test(t)) return 'sneakers';
    if (/bermuda|short/.test(t)) return 'shorts';
    if (/calca|pant|jogger|cargo|jeans/.test(t)) return 'pants';
    if (/jaqueta|casaco|corta|jacket|blazer|puffer|bomber|colete|parka/.test(t)) return 'jacket';
    if (/molet|hood|canguru|blusa|sueter|tricot|manga longa/.test(t)) return 'hoodie';
    if (/camis|regata|polo|tee|t-shirt|cropped|top/.test(t)) return 'tee';
    return null;
  }

  /* ---------------- ícones extras ---------------- */
  ICONS.shirt = '<path d="M8.5 3.5L3.5 6.5l2 4 2-1V20.5h9V9.5l2 1 2-4-5-3c-.6 1.4-2 2.3-3.5 2.3s-2.9-.9-3.5-2.3z"/>';
  ICONS.pants = '<path d="M7 3.5h10l1.2 17h-4.3L12 10l-1.9 10.5H5.8z"/><path d="M7 6.5h10"/>';
  ICONS.cap = '<path d="M4 15.5a8 7.5 0 0 1 15 0"/><path d="M4 15.5h17c0 1.6-2.3 2.4-4.6 2.4"/><path d="M11.5 8V6.5"/>';
  ICONS.shoe = '<path d="M3 17.5v-6l5-1.2 3.2 3 8.3 1.8a1.8 1.8 0 0 1 1.5 1.8v.6z"/><path d="M3 20h18"/><path d="M9 12.5l1.5-1.2M11 14l1.5-1.2"/>';
  ICONS.rotate = '<path d="M20.5 12a8.5 8.5 0 1 1-2.6-6.1"/><path d="M20.5 4v4.5H16"/>';
  ICONS.camera = '<path d="M4 8h3l1.6-2.5h6.8L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.4"/>';
  ICONS.link = '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>';
  ICONS.grid = '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>';
  ICONS.chevl = '<path d="M15 5l-7 7 7 7"/>';
  ICONS.chevr = '<path d="M9 5l7 7-7 7"/>';
  function ico(name, size) { var s = size || 18; return '<svg class="ico" viewBox="0 0 24 24" width="' + s + '" height="' + s + '" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + ICONS[name] + '</svg>'; }
  ICONS.chat = '<path d="M4 5.5h16v11H9.5L5 20v-3.5H4z"/><path d="M8 10h8M8 13h5"/>';
  ICONS.bell = '<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>';
  ICONS.sock ='<path d="M9 3.5h6v9.2l3.6 3.1a2.6 2.6 0 0 1-3.4 3.9l-5-4.2A3.4 3.4 0 0 1 9 12.9z"/><path d="M9 6.5h6"/>';
  ICONS.conjunto = '<path d="M8.5 3l-5 2.6 1.7 3.4 1.8-.9V13h10V8.100l1.800.9 1.700-3.400-5-2.600c-.5 1.200-1.800 2-3.500 2s-3-.8-3.500-2z"/><path d="M7 15h10l.8 6h-3.600L12 17.500 9.800 21H6.200z"/>';
  ICONS.oculos = '<circle cx="7" cy="13" r="3.500"/><circle cx="17" cy="13" r="3.500"/><path d="M10.500 12.500c1-.7 2-.7 3 0M3.500 12L5 7.500M20.500 12L19 7.500"/>';
  ICONS.corrente = '<path d="M6 4c0 7 2.500 11 6 13 3.500-2 6-6 6-13"/><circle cx="12" cy="19" r="2"/>';
  ICONS.cinto = '<rect x="2.500" y="9.500" width="19" height="5" rx="1"/><rect x="9" y="8" width="6" height="8" rx="1"/><path d="M12 12h3"/>';
  ICONS.bolsa = '<path d="M6 9h12l1.500 11h-15z"/><path d="M8.500 9a3.500 3.500 0 0 1 7 0"/>';
  var SLOT_ICON = { top: 'shirt', baixo: 'pants', conjunto: 'conjunto', cabeca: 'cap', meias: 'sock', pes: 'shoe', rosto: 'oculos', pescoco: 'corrente', cintura: 'cinto', bolsa: 'bolsa' };
  var SLOT_LABEL = { top: 'Cima', baixo: 'Baixo', conjunto: 'Kits', cabeca: 'Cabeça', meias: 'Meias', pes: 'Tênis', rosto: 'Óculos', pescoco: 'Corrente', cintura: 'Cinto', bolsa: 'Bolsa' };
  var SLOT_LONG = { top: 'Parte de cima', baixo: 'Parte de baixo', conjunto: 'Kit', cabeca: 'Boné ou gorro', meias: 'Meias', pes: 'Pés', rosto: 'Óculos', pescoco: 'Corrente', cintura: 'Cinto', bolsa: 'Bolsa' };
  var OPTIONAL = { conjunto: 1, cabeca: 1, meias: 1, pes: 1, rosto: 1, pescoco: 1, cintura: 1, bolsa: 1 };
  /* acessórios da faixa embaixo do palco: entram na lista e no total, sem aparecer no boneco */
  var ACESS = ['pescoco', 'rosto', 'cintura'];
  /* peças pequenas que fecham o look: boné, gorro, meia e acessórios */
  var EXTRAS = ['cabeca', 'meias', 'bolsa'].concat(ACESS);

  /* ---------------- dados ---------------- */
  function visible() { return state.products.filter(function (p) { return ui.canEdit || !p.hidden; }); }
  /* exemplos (sem link) ficam fora da vitrine e das ofertas: aparecem só na página de tênis e no provador */
  function shopList() { return visible().filter(function (p) { return !isSample(p); }); }
  function byId(id) { for (var i = 0; i < state.products.length; i++) if (state.products[i].id === id) return state.products[i]; return null; }
  function wearable() { return state.products.filter(function (p) { return !p.hidden && canWear(p); }); }
  function wardrobe() { var m = {}; SLOTS.forEach(function (s) { m[s.id] = []; }); wearable().forEach(function (p) { m[KINDS[kindOf(p)].slot].push(p); }); return m; }
  function newest(list) { return list.slice().sort(function (a, b) { return String(b.createdAt || '').localeCompare(String(a.createdAt || '')); }); }
  function categoriesOf(list) {
    var map = {}; list.forEach(function (p) { var c = p.category || 'Geral'; map[c] = (map[c] || 0) + 1; });
    return Object.keys(map).sort(function (a, b) { return map[b] - map[a] || a.localeCompare(b); }).map(function (c) { return [c, map[c]]; });
  }
  function isTenis(p) { return kindOf(p) === 'sneakers'; }
  function tenisLoja() { return shopList().filter(isTenis); }
  /* numeração: os anúncios trazem BR (37, 38…) ou UK (UK 4…). UK vira BR aproximado para filtrar junto */
  var UK_BR = { 2.5: 33, 3: 34, 3.5: 34, 4: 35, 4.5: 36, 5: 36, 5.5: 37, 6: 38, 6.5: 38, 7: 39, 7.5: 40, 8: 40, 8.5: 41, 9: 42, 9.5: 42, 10: 43, 10.5: 44, 11: 44, 11.5: 45, 12: 46 };
  function brDe(s) {
    var t = String(s).trim().toUpperCase(), m = t.match(/^UK\s*(\d+(?:[.,]5)?)$/);
    if (m) return UK_BR[parseFloat(m[1].replace(',', '.'))] || null;
    var n = parseFloat(t.replace(',', '.')); return n >= 28 && n <= 48 ? Math.floor(n) : null;
  }
  function numeracoesBR(p) { var o = []; sizesOf(p).forEach(function (s) { var b = brDe(s); if (b && o.indexOf(b) < 0) o.push(b); }); return o; }
  /* estilo do tênis lido do nome cadastrado */
  var TG_ESTILOS = [['corrida', 'Corrida', /corrida|running|carbono|treino/], ['casual', 'Casual', /casual|estampad|lona/], ['chunky', 'Chunky / plataforma', /chunky|plataforma|robust|grosso/], ['basquete', 'Basquete', /basquete|basket|cano alto/], ['adidas', 'Adidas', /adidas/]];
  function estilosDe(p) { var t = norm(p.name); return TG_ESTILOS.filter(function (e) { return e[2].test(t); }).map(function (e) { return e[0]; }); }
  function roupas() { return shopList().filter(function (p) { return kindOf(p) !== 'sneakers'; }); }
  function tenisReais() { return shopList().filter(function (p) { return kindOf(p) === 'sneakers'; }); }
  function tamanhosDe(list) { var m = {}; list.forEach(function (p) { sizesOf(p).forEach(function (t) { m[t] = 1; }); }); var ORD = ['PP', 'P', 'M', 'G', 'GG', 'EG', 'EEGG']; return Object.keys(m).sort(function (a, b) { var x = ORD.indexOf(a), y = ORD.indexOf(b); if (x >= 0 || y >= 0) return (x < 0 ? 99 : x) - (y < 0 ? 99 : y); return String(a).localeCompare(String(b), 'pt-BR', { numeric: true }); }); }
  function preencheTam(id, list, atual, rotulo) { var el = $(id); if (!el) return; el.innerHTML = '<option value="">' + rotulo + '</option>' + tamanhosDe(list).map(function (t) { return '<option value="' + esc(t) + '"' + (t === atual ? ' selected' : '') + '>' + esc(t) + '</option>'; }).join(''); }
  function ordena(a, b, modo) {
    var pr = function (p) { return p.price == null ? 1e9 : p.price; }, novo = String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
    if (modo === 'low') return pr(a) - pr(b);
    if (modo === 'new') return novo;
    return (off(b) - off(a)) || (((b.stats && b.stats.rating) || 0) - ((a.stats && a.stats.rating) || 0)) || novo;
  }
  function filtered(list) {
    var q = norm(ui.q).split(/\s+/).filter(Boolean);
    var out = list.filter(function (p) {
      if (ui.tamR && sizesOf(p).indexOf(ui.tamR) < 0) return false;
      if (ui.cat !== 'all' && (p.category || 'Geral') !== ui.cat) return false;
      if (ui.favOnly && favs.indexOf(p.id) < 0) return false;
      if (q.length) { var t = norm([p.name, p.category, p.store, p.idShein || ''].join(' ')); if (!q.every(function (w) { return t.indexOf(w) >= 0; })) return false; }
      return true;
    });
    return out.sort(function (a, b) { return ordena(a, b, ui.sort === 'off' ? 'auto' : ui.sort); });
  }
  function pad2(n) { return String(n).padStart(2, '0'); }
  /* "2026-10-26" (só a data) é o dia escrito; new Date() leria como UTC e mostraria 25/10 no Brasil */
  function dayOf(iso) { var m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})$/); if (m) return m[3] + '/' + m[2]; var d = new Date(iso || ''); return isNaN(d) ? '' : pad2(d.getDate()) + '/' + pad2(d.getMonth() + 1); }
  /* a primeira página mostra o tênis com o maior desconto do momento */
  function heroTenisHTML() {
    var t = shopList().filter(function (p) { return kindOf(p) === 'sneakers' && cutOf(p); }).sort(function (a, b) { return off(b) - off(a); })[0];
    if (!t) return '';
    return '<button type="button" class="apr__tenis" data-open="' + esc(t.id) + '" aria-label="Ver ' + esc(t.name) + '"><img src="' + esc(cutOf(t)) + '" alt="' + esc(t.name) + '" fetchpriority="high" decoding="async"><span class="apr__ref" aria-hidden="true"></span>' +
      '<span class="apr__tag"><span class="apr__tagn">' + esc(t.name) + '</span>' + (t.price != null ? '<b class="mono">' + money(t.price) + '</b>' : '') + (off(t) ? '<em class="mono">-' + off(t) + '%</em>' : '') + '</span></button>';
  }
  function pad3(n) { return String(n).padStart(3, '0'); }
  /* número da edição: semanas desde o primeiro garimpo */
  function edicao() { return Math.max(1, Math.floor((Date.now() - Date.UTC(2026, 9, 26)) / 6048e5) + 1); }
  function haDias(iso) { var d = new Date(iso || ''); if (isNaN(d)) return ''; var n = Math.floor((Date.now() - d) / 864e5); return n <= 0 ? 'hoje' : n === 1 ? 'há 1 dia' : 'há ' + n + ' dias'; }
  /* site público (Netlify ou domínio próprio): tem link por produto e contagem de cliques */
  var PUB = /(\.netlify\.app|\.pages\.dev|garimpadosshop\.com\.br)$/i.test(location.hostname);
  function rastrear(t, id) { if (!PUB || !navigator.sendBeacon) return; try { navigator.sendBeacon('/api/e', JSON.stringify({ t: t, id: String(id || '').slice(0, 80) })); } catch (e) { /* sem medição */ } }
  /* só na versão do dono (Claude): mostra em cima de cada produto quantas pessoas clicaram em Compre agora no site público.
     A contagem vem do Cloudflare; se o Claude bloquear a conexão, os números simplesmente não aparecem. */
  var cliques = null;
  function marcaCliques() {
    if (PUB || !cliques) return;
    Array.prototype.forEach.call(document.querySelectorAll('.card[data-id], .hc[data-id]'), function (c) {
      var m = c.querySelector('.cnt'), n = (cliques.compra || {})[c.getAttribute('data-id')] || 0, txt = n + (n === 1 ? ' clique' : ' cliques');
      if (m) { if (m.textContent !== txt) m.textContent = txt; return; }
      var host = c.querySelector('.card__media, .hc__media'); if (!host) return;
      m = document.createElement('span'); m.className = 'cnt mono'; m.textContent = txt; m.title = 'Cliques em Compre agora no site público (últimos 90 dias)'; host.appendChild(m);
    });
  }
  function carregaCliques() {
    if (PUB || typeof fetch !== 'function') return;
    fetch('https://garimpados-shop.pages.dev/api/e', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
      if (!d) return; cliques = d; marcaCliques();
      var raiz = $('conteudo'), tm = 0;
      if (raiz && window.MutationObserver) new MutationObserver(function () { clearTimeout(tm); tm = setTimeout(marcaCliques, 120); }).observe(raiz, { childList: true, subtree: true });
    }).catch(function () { /* sem conexão ou bloqueado */ });
  }
  function lastUpdate() { var m = ''; state.products.forEach(function (p) { var t = p.createdAt || ''; if (t > m) m = t; }); return dayOf(m); }
  function storesOf() { var s = {}; state.products.forEach(function (p) { if (!p.hidden && p.store) s[p.store] = 1; }); return Object.keys(s); }
  function imgFor(p) { return cutOf(p) || photoOf(p, 0); }
  function buyLabel(p) { return p.store ? 'Compre agora na ' + p.store : 'Compre agora'; }
  /* ID de afiliado: entra sozinho nos links "longos" da loja; links curtos de afiliado (onelink, s.shopee, meli.la) já vêm com o seu ID e ficam como estão */
  var AFF_STORES = [['shein', 'Shein'], ['shopee', 'Shopee'], ['ml', 'Mercado Livre']];
  function affKey(store) { var s = norm(store); if (/shein/.test(s)) return 'shein'; if (/shopee/.test(s)) return 'shopee'; if (/mercado/.test(s)) return 'ml'; return ''; }
  function isShortLink(u) { var hn = u.hostname.toLowerCase(); return /(^|\.)(onelink\.shein\.com|shein\.top|s\.shopee\.com\.br|shope\.ee|meli\.la|amzn\.to|a\.co)$/.test(hn) || (/mercadolivre\.com$/.test(hn) && /^\/sec\//.test(u.pathname)); }
  function affLink(p) {
    var l = (p && p.link) || '';
    try {
      var cfg = (state.store.aff || {})[affKey(p.store || detectStore(l))]; if (!cfg) return l;
      var m = String(cfg).trim().replace(/^[?&]/, '').match(/^([A-Za-z0-9_.\-]+)=(.+)$/); if (!m) return l;
      var u = new URL(l); if (isShortLink(u) || u.searchParams.has(m[1])) return l;
      u.searchParams.set(m[1], m[2]); return u.toString();
    } catch (e) { return l; }
  }
  function hashStr(t) { var x = 2166136261; t = String(t); for (var i = 0; i < t.length; i++) { x ^= t.charCodeAt(i); x = Math.imul(x, 16777619); } return x >>> 0; }
  function seloHTML(p) { return '<span class="selo selo--' + (affKey(p.store) || 'loja') + '">' + esc(p.store || 'Loja') + '</span>'; }
  function starsHTML(p) {
    var r = p.stats && p.stats.rating; if (!r) return '';
    var full = Math.round(r * 2) / 2, out = '';
    for (var i = 1; i <= 5; i++) out += '<i class="' + (full >= i ? 'on' : full >= i - .5 ? 'half' : '') + '">' + ico('star', 15) + '</i>';
    return '<span class="stars" aria-hidden="true">' + out + '</span>';
  }
  function priceHTML(p, big) {
    if (p.price == null) return '<span class="price price--na">Ver preço na loja</span>';
    var o = off(p);
    return '<span class="price' + (big ? ' price--big' : '') + '">' + (p.priceFrom ? '<small class="price__from">a partir de</small>' : '') + '<b>' + money(p.price) + '</b>' + (o ? '<s>' + money(p.oldPrice) + '</s><em>-' + o + '%</em>' : '') + parcelaHTML(p) + '</span>';
  }
  /* parcelamento: só o que o anúncio mostrou. Sem juros dá para recalcular a parcela quando o preço muda; com juros mostra só o número de vezes */
  function parcelaTxt(p) {
    var c = p.parcela; if (!c || !(c.n > 1) || p.price == null) return '';
    return c.sj ? c.n + 'x de ' + money(Math.round(p.price / c.n * 100) / 100) + ' sem juros' : 'em até ' + c.n + 'x no cartão';
  }
  function parcelaHTML(p) { var t = parcelaTxt(p); return t ? '<small class="price__parc">ou ' + esc(t) + '</small>' : ''; }
  /* nota, avaliações e vendas lidas do anúncio (Shein) */
  function revLabel(r) { r = String(r || '').trim(); if (!r) return ''; return r.replace(/K\+?$/i, ' mil+').replace(/\.(\d{3})/g, '.$1'); }
  function statsHTML(p, big) {
    var st = p.stats; if (!st) return '';
    var bits = [];
    if (st.rating) bits.push('<span class="st__r"><svg viewBox="0 0 24 24" width="' + (big ? 15 : 13) + '" height="' + (big ? 15 : 13) + '" aria-hidden="true"><path fill="currentColor" d="M12 2.6l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.4l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z"/></svg><b>' + String(st.rating.toFixed(Math.round(st.rating * 100) % 10 ? 2 : 1)).replace('.', ',') + '</b>' + (st.reviews ? '<i>(' + esc(revLabel(st.reviews)) + (big ? ' avaliações' : '') + ')</i>' : '') + '</span>');
    else if (st.reviews && big) bits.push('<span class="st__r"><i>' + esc(revLabel(st.reviews)) + ' avaliações</i></span>');
    if (st.sold) bits.push('<span class="st__s">' + esc(revLabel(st.sold)) + ' vendidos</span>');
    if (st.rank) bits.push('<span class="st__k">#' + st.rank + ' mais vendido' + (big && st.rankIn ? ' em ' + esc(st.rankIn) : '') + '</span>');
    if (!bits.length) return '';
    var label = [st.rating ? 'Nota ' + st.rating + ' de 5' : '', st.reviews ? revLabel(st.reviews) + ' avaliações' : '', st.sold ? revLabel(st.sold) + ' vendidos' : '', st.rank ? 'número ' + st.rank + ' em mais vendidos' : ''].filter(Boolean).join(', ');
    return '<p class="st' + (big ? ' st--big' : '') + '" aria-label="' + esc(label + ' na ' + (p.store || 'loja')) + '">' + bits.join('') + '</p>' +
      (big && st.at ? '<p class="st__at mono">Avaliações e vendas da ' + esc(p.store || 'loja') + ', vistas em ' + dayOf(st.at) + '.</p>' : '');
  }
  function isFav(id) { return favs.indexOf(id) >= 0; }
  function toggleFav(id) { var i = favs.indexOf(id); if (i >= 0) favs.splice(i, 1); else favs.push(id); writeLS('gs-favs', favs); syncFavs(); }
  function syncFavs() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-fav]'), function (b) { var on = isFav(b.getAttribute('data-fav')); b.setAttribute('aria-pressed', on ? 'true' : 'false'); b.setAttribute('aria-label', on ? 'Tirar dos favoritos' : 'Salvar nos favoritos'); });
    var n = $('fav-n'); if (n) n.textContent = String(favs.filter(function (id) { return byId(id); }).length);
    var fb = $('fav-btn'); if (fb) fb.setAttribute('aria-pressed', ui.favOnly ? 'true' : 'false');
  }
  function brand() { var n = (state.store.name || 'Garimpados Shop').trim().split(/\s+/); return n.length > 1 ? { a: n.slice(0, -1).join(' '), b: n[n.length - 1] } : { a: n[0], b: '' }; }
  function wordmark(cls) { var b = brand(); return '<span class="wm' + (cls ? ' ' + cls : '') + '"><span class="wm__a">' + esc(b.a) + '</span>' + (b.b ? '<span class="wm__b">' + esc(b.b) + '</span>' : '') + '</span>'; }
  function imgTag(src, alt, cls, extra) { return src ? '<img class="' + (cls || '') + '" src="' + esc(src) + '" alt="' + esc(alt || '') + '" decoding="async"' + (extra || '') + '>' : ''; }

  /* ================================================================
     PÁGINA
     ================================================================ */
  var app = $('app');
  var REDUCED = reduced();
  var hasGsap = typeof window.gsap !== 'undefined';
  /* câmera (js/camera.js); sem ela, tudo continua funcionando parado */
  var cam = window.cam || (function () { var no = function () { return null; }; return { ok: function () { return false; }, wide: no, punch: no, sweep: no, progress: no, autoHide: no, grain: no, velocitySkew: no, magnetic: no, count: function (el, v, o) { if (el) el.textContent = (o && o.fmt ? o.fmt(v) : v); }, roll: function (el, t) { if (el) el.textContent = t; }, focusVars: function () { return { autoAlpha: .45 }; }, unfocusVars: function () { return { autoAlpha: 1 }; } }; })();

  var NAV = [['vitrine', 'Vitrine', 'grid'], ['tenis', 'Tênis', 'shoe'], ['provador', 'Outfit', 'hanger'], ['ofertas', 'Ofertas', 'fire']];
  function renderShell() {
    var up = lastUpdate();
    app.innerHTML =
      '<div class="neon" aria-hidden="true"></div>' +
      '<a class="skip" href="#vitrine">Pular para a vitrine</a>' +
      '<div class="progress" aria-hidden="true"><i id="progress"></i></div>' +
      '<header class="top" id="top"><div class="wrap top__in">' +
        '<a class="top__brand" href="#inicio" data-go="inicio" aria-label="' + esc(state.store.name) + ', início">' + wordmark() + '</a>' +
        '<nav class="top__nav" aria-label="Seções">' + NAV.map(function (x) { return '<a href="#' + x[0] + '" data-go="' + x[0] + '" data-nav="' + x[0] + '"' + (x[0] === 'ofertas' ? ' class="top__hot"' : '') + '>' + x[1] + '</a>'; }).join('') + '</nav>' +
        '<div class="top__acts"><button class="top__fav" type="button" id="fav-btn" aria-pressed="false" aria-label="Mostrar só favoritos">' + ico('heart', 17) + '<span id="fav-n" class="mono">0</span></button>' +
        '<button class="top__fav top__cart" type="button" id="cart-btn" aria-label="Abrir carrinho" aria-haspopup="dialog">' + ico('cart', 17) + '<span id="cart-n" class="mono">0</span></button></div>' +
      '</div></header>' +
      '<main id="conteudo">' +
        /* ---------- 1. apresentação: primeira tela, poucas palavras e a grade do fundo ---------- */
        '<section class="apr" id="inicio" aria-labelledby="apr-h"><div class="wrap apr__in">' +
          '<p class="apr__k mono"><span class="pulse" aria-hidden="true"></span>Atualizado' + (up ? ' em ' + up : '') + '</p>' +
          '<h1 class="apr__h" id="apr-h"><span class="apr__l"><span>Streetwear</span></span><span class="apr__l"><span>no preço</span></span><span class="apr__l"><span>certo.</span></span></h1>' +
          heroTenisHTML() +
          '<p class="apr__sub">Só o que vale o preço. Você compra direto na loja oficial. <b>Achou, garantiu.</b></p>' +
          '<div class="apr__cta"><a class="btn btn--gold" href="#garimpo" data-go="garimpo">Ver o garimpo' + ico('arrow', 18) + '</a><a class="btn btn--ghost" href="#provador" data-go="provador">Montar outfit</a></div>' +
        '</div><a class="apr__down mono" href="#garimpo" data-go="garimpo">Rola pra garimpar<i aria-hidden="true"></i></a></section>' +
        /* ---------- garimpo da semana: edição numerada ---------- */
        '<section class="gs" id="garimpo" aria-labelledby="gs-h"><div class="wrap"><div class="gs__head"><p class="gs__n mono">Garimpo <b>#' + pad3(edicao()) + '</b></p><h2 class="h2" id="gs-h">Os achados da semana.</h2></div><div class="gs__grid" id="gs-grid"></div></div></section>' +
        /* ---------- 2. vitrine: só roupas (tênis têm a seção deles) ---------- */
        '<section class="shop" id="vitrine" aria-labelledby="shop-h"><div class="wrap">' +
          '<div class="sec-head sec-head--row"><div><p class="eyebrow eyebrow--gold">' + ico('grid', 14) + ' Roupas</p><h2 class="h2" id="shop-h">Vitrine.</h2></div>' +
            '<div class="tools"><label class="search"><span class="sr">Buscar peça</span>' + ico('search', 17) + '<input id="q" type="search" placeholder="Buscar peça" autocomplete="off"></label>' +
            '<label class="sort"><span class="sr">Ordenar</span><select id="sort"><option value="auto">Melhores ofertas</option><option value="new">Novidades</option><option value="low">Menor preço</option><option value="off">Maior desconto</option></select></label><label class="sort"><span class="sr">Meu tamanho</span><select id="tam-r"></select></label></div>' +
          '</div>' +
          '<div class="chips-wrap"><div class="chips" id="chips" role="toolbar" aria-label="Categorias"></div></div>' +
          '<p class="count mono" id="count" aria-live="polite"></p>' +
          '<div class="grid" id="grid"></div>' +
          '<div class="busca-tenis" id="busca-tenis" hidden></div>' +
        '</div></section>' +
        /* ---------- 3. tênis: anel 3D (js/vitrine.js) ---------- */
        '<section class="kicks kicks--anel" id="tenis" aria-labelledby="vt-titulo">' +
          '<div class="vt" id="kicks" aria-roledescription="carrossel"></div>' +
          '<div class="wrap tg" id="tg" hidden>' +
            '<div class="sec-head sec-head--row"><div><p class="eyebrow eyebrow--gold">' + ico('shoe', 14) + ' Grade de tênis</p><h3 class="h2" id="tg-h">Todos os tênis.</h3></div>' +
              '<label class="sort"><span class="sr">Ordenar tênis</span><select id="tg-sort"><option value="auto">Melhores ofertas</option><option value="low">Menor preço</option><option value="off">Maior desconto</option><option value="rate">Mais bem avaliados</option></select></label></div>' +
            '<div class="tg__f" id="tg-f" role="group" aria-label="Filtros de tênis"></div>' +
            '<p class="count mono" id="tg-count" aria-live="polite"></p>' +
            '<div class="grid grid--tenis" id="tg-grid"></div>' +
          '</div>' +
        '</section>' +
        /* ---------- 4. montar outfit ---------- */
        '<section class="fit" id="provador" aria-labelledby="fit-h"><div class="wrap">' +
          '<div class="sec-head"><p class="eyebrow eyebrow--gold">' + ico('hanger', 14) + ' Montar outfit</p><h2 class="h2" id="fit-h">Monta o fit.</h2><p class="lead">Arrasta pra trocar. Compra cada peça direto na loja.</p></div>' +
          '<div class="fit__grid">' +
            '<div class="fit__main">' +
              '<div class="rail" id="rail" role="tablist" aria-label="Partes do outfit"></div>' +
              '<div class="stage" id="stage">' +
                '<div class="stage__luz" aria-hidden="true"><i></i></div>' +
                '<div class="stage__floor" aria-hidden="true"></div>' +
                '<div class="stage__fig" id="fig" aria-live="polite"></div>' +
                '<div class="acc" id="acc" role="group" aria-label="Acessórios do outfit"></div>' +
                '<button type="button" class="fit-rnd" id="fit-rnd">' + ico('dice', 17) + '<span>Outfit aleatório</span></button>' +
                '<button type="button" class="b360" id="b360" hidden><span class="b360__i">' + ico('rotate', 16) + '</span><span>Ver tênis 360</span></button>' +
                '<span class="stage__lb mono" aria-hidden="true">Outfit <b id="look-n">01</b></span>' +
                '<div class="face" role="group" aria-label="Lado das peças"><button type="button" class="face__b" data-face="front" aria-pressed="true">Frente</button><button type="button" class="face__b" data-face="back" aria-pressed="false">Costas</button></div>' +
                '<button type="button" class="arr arr--l" data-step="-1" aria-label="Peça anterior">' + ico('chevl', 20) + '</button>' +
                '<button type="button" class="arr arr--r" data-step="1" aria-label="Próxima peça">' + ico('chevr', 20) + '</button>' +
                '<p class="stage__hint mono" id="stage-hint" aria-hidden="true"><span>‹</span> arrasta pra trocar <span>›</span></p>' +
              '</div>' +
              '<div class="thumbs" id="thumbs" role="listbox" aria-label="Peças"></div>' +
              '<div class="acs" id="acs" role="group" aria-label="Acessórios do outfit"></div>' +
              '<button type="button" class="fit-tg mini" id="fit-toggle" hidden aria-pressed="false">Ajustar encaixe da peça</button><div class="fitbar" id="fitbar" hidden></div>' +
            '</div>' +
            '<div class="info" id="info" aria-live="polite"></div>' +
          '</div>' +
        '</div></section>' +
        /* ---------- 5. promoções ---------- */
        '<section class="hot" id="ofertas" aria-labelledby="hot-h" hidden>' +
          '' +
          '<div class="wrap">' +
          '<div class="hot__head"><div class="sec-head"><p class="eyebrow eyebrow--hot">Ofertas</p><h2 class="h2 hot__h" id="hot-h">Preço caiu.</h2><p class="lead">Os maiores descontos que achamos agora.</p></div>' +
            '<div class="chips" id="hot-tabs" role="tablist" aria-label="Tipo de oferta"></div>' +
          '</div>' +
          '<div class="hot__feat" id="hot-feat"></div>' +
          '<div class="hot__grid" id="hot-grid"></div>' +
        '</div></section>' +
        /* ---------- 6. dúvidas (js/atende.js) ---------- */
        '<section class="faq" id="duvidas" aria-label="Dúvidas frequentes"></section>' +
      '</main>' +
      '<footer class="foot"><div class="wrap foot__in">' +
        '<div class="foot__wm" aria-hidden="true">' + wordmark('wm--xl') + '</div>' +
        '<div class="foot__row"><p>' + esc(state.store.tagline || '') + '</p>' +
          (state.store.instagram ? '<a class="foot__ig" href="https://instagram.com/' + esc(state.store.instagram) + '" target="_blank" rel="noopener">@' + esc(state.store.instagram) + '</a>' : '') + '</div>' +
        '<div class="quem" id="quem"><h3 class="h3">Quem somos</h3><p>O ' + esc(state.store.name || 'Garimpados Shop') + ' é uma curadoria independente de streetwear. A gente garimpa peças nas lojas, avalia o que vale o preço e leva você direto ao anúncio oficial.</p><p>Não vendemos nem entregamos: a compra, o pagamento, a entrega e a troca são feitos na própria loja.</p>' + (state.store.whatsapp ? '<p>Fala com a gente: <a href="https://wa.me/' + esc(state.store.whatsapp) + '" target="_blank" rel="noopener">WhatsApp</a></p>' : '') + '</div>' +
        '<p class="foot__note"><b>Aviso de afiliado:</b> os links são de afiliado. Você paga o mesmo preço e a gente pode receber comissão da loja. Preço e estoque podem mudar no anúncio.</p>' +
      '</div></footer>' +
      '<nav class="dock" id="dock" aria-label="Atalhos">' + NAV.map(function (x) { return '<a href="#' + x[0] + '" data-go="' + x[0] + '" data-nav="' + x[0] + '" class="dock__a' + (x[0] === 'ofertas' ? ' dock__a--hot' : '') + '">' + ico(x[2], 21) + '<span>' + x[1] + '</span></a>'; }).join('') + '</nav>' +
      '<div class="scrim" id="scrim" hidden></div>' +
      '<aside class="sheet" id="sheet" role="dialog" aria-modal="true" aria-labelledby="sh-name" hidden></aside>' +
      '<aside class="sheet cart" id="cart" role="dialog" aria-modal="true" aria-labelledby="cart-h" hidden></aside>' +
      '<i class="cam-vig" id="cam-vig" aria-hidden="true"></i>';
  }

  /* ---------------- abertura: peça em destaque ---------------- */
  var heroList = [], heroIx = 0, heroTimer = 0;
  function renderHero() {
    heroList = newest(shopList().filter(function (p) { return !p.hidden && cutOf(p); })).slice(0, 5);
    if (!heroList.length) heroList = newest(shopList().filter(function (p) { return !p.hidden; })).slice(0, 5);
    var stage = $('hero-stage'); if (!stage) return;
    stage.hidden = !heroList.length;
    showHero(0, true);
    clearInterval(heroTimer);
    if (heroList.length > 1 && !REDUCED) heroTimer = setInterval(function () { if (!document.hidden) showHero((heroIx + 1) % heroList.length); }, 4200);
  }
  function showHero(i, first) {
    var p = heroList[i]; if (!p) return; heroIx = i;
    var box = $('hero-piece'), tag = $('hero-tag'), ix = $('hero-ix');
    var html = imgTag(imgFor(p), p.name, cutOf(p) ? 'is-cut' : 'is-photo', ' fetchpriority="high"');
    box.setAttribute('aria-label', 'Ver ' + p.name);
    box.setAttribute('data-id', p.id);
    var fill = function () {
      box.innerHTML = html;
      tag.innerHTML = '<span class="hero__tag-k mono">' + esc(p.store || 'Loja') + (KINDS[kindOf(p)] ? ' · ' + KINDS[kindOf(p)].label : '') + '</span><span class="hero__tag-n">' + esc(p.name) + '</span>' + priceHTML(p);
      ix.innerHTML = '<b>' + pad2(i + 1) + '</b> / ' + pad2(heroList.length);
    };
    if (first || !hasGsap || REDUCED) { fill(); return; }
    gsap.to([box, tag], { autoAlpha: 0, y: -14, filter: 'blur(6px)', duration: .32, ease: 'power2.in', onComplete: function () {
      fill(); gsap.fromTo([box, tag], { autoAlpha: 0, y: 18, filter: 'blur(6px)' }, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: .6, ease: 'expo.out', stagger: .06, clearProps: 'filter' });
    } });
  }

  /* ---------------- leitura da foto recortada: proporção, área da peça, tom e cores ---------------- */
  var LOOK_V = 2, lookCache = (function () { var c = readLS('gs-look', {}); return c && c.v === LOOK_V ? c : { v: LOOK_V }; })(), lookJobs = {};
  /* leituras em fila, uma por vez e com o navegador ocioso, na versão pequena da foto (-sm) quando existe:
     ler a foto grande no meio da rolagem travava a página (~1 s de getImageData). O cache grava 1x a cada 1,5 s. */
  var lookFila = [], lookRodando = false, lookSalva = 0, lookEspera = {};
  var ocioso = window.requestIdleCallback ? function (fn) { requestIdleCallback(fn, { timeout: 1200 }); } : function (fn) { setTimeout(fn, 80); };
  function lookProx() {
    if (lookRodando || !lookFila.length) return;
    lookRodando = true;
    var job = lookFila.shift();
    ocioso(function () { job(function () { lookRodando = false; lookProx(); }); });
  }
  function salvaLook() { clearTimeout(lookSalva); lookSalva = setTimeout(function () { writeLS('gs-look', lookCache); }, 1500); }
  function analyze(src, urgente) {
    if (!src) return Promise.resolve(null);
    if (lookCache[src]) return Promise.resolve(lookCache[src]);
    if (lookJobs[src]) {
      var fila0 = lookEspera[src];
      if (urgente && fila0) { delete lookEspera[src]; var ix = lookFila.indexOf(fila0); if (ix >= 0) lookFila.splice(ix, 1); fila0(); }
      return lookJobs[src];
    }
    var small = /^img\/p\/.+-recorte\.webp$/.test(src) ? src.replace(/-recorte\.webp$/, '-recorte-sm.webp') : '';
    lookJobs[src] = new Promise(function (res0) {
      var fim = function () { }, res = function (v) { res0(v); fim(); };
      var job = function (done) { delete lookEspera[src]; fim = done || fim; ler(); };
      if (urgente) job(); else { lookEspera[src] = job; lookFila.push(job); lookProx(); }
      function ler() {
      var im = new Image(); im.decoding = 'async';
      im.onload = function () {
        try {
          var nw = im.naturalWidth || 1, nh = im.naturalHeight || 1, S = 64, cw = Math.max(1, Math.round(nw >= nh ? S : S * nw / nh)), ch = Math.max(1, Math.round(nh >= nw ? S : S * nh / nw));
          var c = document.createElement('canvas'); c.width = cw; c.height = ch;
          var x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(im, 0, 0, cw, ch);
          var d = x.getImageData(0, 0, cw, ch).data, minX = cw, minY = ch, maxX = -1, maxY = -1, lum = 0, cnt = 0, bins = {};
          for (var y = 0; y < ch; y++) for (var xx = 0; xx < cw; xx++) {
            var i = (y * cw + xx) * 4, a = d[i + 3]; if (a < 24) continue;
            if (xx < minX) minX = xx; if (xx > maxX) maxX = xx; if (y < minY) minY = y; if (y > maxY) maxY = y;
            if (a < 200) continue;
            var r = d[i], g = d[i + 1], b = d[i + 2]; lum += (.2126 * r + .7152 * g + .0722 * b) / 255; cnt++;
            var k = (r >> 5) + ',' + (g >> 5) + ',' + (b >> 5); var bn = bins[k] || (bins[k] = [0, 0, 0, 0]); bn[0] += r; bn[1] += g; bn[2] += b; bn[3]++;
          }
          var cols = Object.keys(bins).map(function (k) { var bn = bins[k]; return [Math.round(bn[0] / bn[3]), Math.round(bn[1] / bn[3]), Math.round(bn[2] / bn[3]), bn[3]]; }).sort(function (p, q) { return q[3] - p[3]; });
          var pick = [];
          cols.forEach(function (c2) { if (pick.length >= 3 || c2[3] < cnt * .06) return; if (pick.some(function (q) { return Math.abs(q[0] - c2[0]) + Math.abs(q[1] - c2[1]) + Math.abs(q[2] - c2[2]) < 90; })) return; pick.push(c2.slice(0, 3)); });
          var accent = cols.filter(function (c2) { var mx = Math.max(c2[0], c2[1], c2[2]), mn = Math.min(c2[0], c2[1], c2[2]); return c2[3] > cnt * .02 && mx - mn > 70; })[0];
          var box = maxX < minX ? [0, 0, 1, 1] : [minX / cw, minY / ch, (maxX - minX + 1) / cw, (maxY - minY + 1) / ch];
          var out = { ar: nw / nh, box: box, lum: cnt ? lum / cnt : .5, colors: pick, accent: accent ? accent.slice(0, 3) : null };
          lookCache[src] = out; salvaLook(); res(out);
        } catch (e) { res(null); }
      };
      im.onerror = function () { if (small && im.src.indexOf(small) >= 0) { small = ''; im.src = src; } else res(null); };
      im.src = small || src;
      }
    });
    return lookJobs[src];
  }

  /* ================================================================
     TÊNIS: anel 3D que gira para trás (js/vitrine.js)
     ================================================================ */
  var SK_MAX = 8;
  function sneakers() {
    return state.products.filter(function (p) { return (ui.canEdit || !p.hidden) && kindOf(p) === 'sneakers' && (cutOf(p) || photoOf(p, 0)); })
      .sort(function (a, b) { return (isSample(a) - isSample(b)) || String(b.createdAt || '').localeCompare(String(a.createdAt || '')); });
  }
  var SK_STOP = /^(tenis|sapatenis|de|da|do|das|dos|e|com|para|masculino|masculina|feminino|feminina|unissex|sneaker|sneakers|casual|esportivo|esportiva|corrida|cano|baixo|alto|preto|preta|branco|branca|vermelho|vermelha|azul|cinza|verde|rosa|bege|marrom|prata|dourado|amarelo|roxo|laranja|off|white|black|novo|nova)$/;
  function skWord(p) {
    if (p.short) return String(p.short);
    var w = String(p.name || '').split(/[\s\-/]+/).filter(function (x) { return x.length > 2 && !SK_STOP.test(norm(x)); });
    w.sort(function (a, b) { return b.length - a.length; });
    return w[0] || 'Tênis';
  }
  /* cada tênis vira um item do anel: nome, preço, selos e as ações do site (favoritar, provar) */
  function ringItem(p) {
    var sample = isSample(p) || !p.link, o = off(p), st = p.stats || {}, sz = sizesOf(p), look = lookCache[imgFor(p)];
    var frase = st.rating ? 'Nota ' + String(st.rating.toFixed(1)).replace('.', ',') + ' ★ na ' + (p.store || 'loja') + (st.reviews ? ' · ' + revLabel(st.reviews) + ' avaliações' : '') + '.'
      : sz.length ? 'Numeração ' + (sz.length > 1 ? sz[0] + ' ao ' + sz[sz.length - 1] : sz[0]) + '.' : '';
    var selos = sample ? ['exemplo'] : [];
    if (!sample && o >= 15) selos.push('oferta');
    if (!sample && p.badge === 'novo') selos.push('novo');
    return {
      id: p.id, src: imgFor(p), alt: p.name, nome: p.name, palavra: skWord(p), frase: frase, selos: selos,
      rotulo: sample ? 'Exemplo · Tênis' : (p.store || 'Loja') + ' · Tênis', loja: p.store || '',
      preco: p.price != null ? p.price : null, precoAntigo: p.oldPrice || null,
      link: sample ? '' : affLink(p), cor: look ? look.accent : null,
      acoes: '<button type="button" class="round" data-fav="' + esc(p.id) + '" aria-pressed="' + isFav(p.id) + '">' + ico('heart', 20) + '</button>' +
        (canWear(p) ? '<button type="button" class="round" data-try="' + esc(p.id) + '" aria-label="Provar no outfit">' + ico('hanger', 20) + '</button>' : '')
    };
  }
  /* fileira "Mais tênis": todos os tênis (reais primeiro), tênis saindo do card com o brilho da cor dele */
  function renderKicksRow(all) {
    var row = $('kicks-row'); if (!row) return;
    var list = all.slice(0, 12);
    row.hidden = list.length < 2;
    if (row.hidden) { row.innerHTML = ''; return; }
    row.innerHTML = '<div class="wrap kicks__rowhead"><h3 class="h3">Mais tênis</h3><div class="kicks__arr"><button type="button" class="round round--sm" data-krow="-1" aria-label="Tênis anteriores">' + ico('chevl', 18) + '</button><button type="button" class="round round--sm" data-krow="1" aria-label="Próximos tênis">' + ico('chevr', 18) + '</button></div></div>' +
      '<ul class="kr" id="kr">' + list.map(function (p) {
        var src = cutOf(p) || photoOf(p, 0), look = lookCache[src], sample = isSample(p) || !p.link;
        return '<li class="kr__c" data-id="' + esc(p.id) + '"' + (look && look.accent ? ' style="--sk-c:' + look.accent.join(',') + '"' : '') + '>' +
          '<button type="button" class="kr__hit" data-open="' + esc(p.id) + '" aria-label="Ver ' + esc(p.name) + '"></button>' +
          '<span class="kr__glow" aria-hidden="true"></span><img class="kr__im" src="' + esc(thumbOf(p) || src) + '" alt="" loading="lazy" decoding="async">' +
          '<span class="kr__nm">' + esc(p.name) + '</span>' +
          '<span class="kr__ft">' + (p.stats && p.stats.rating ? '<span class="kr__st mono">' + ico('star', 12) + String(p.stats.rating.toFixed(1)).replace('.', ',') + '</span>' : sample ? '<span class="pill pill--ex">Exemplo</span>' : '') +
            '<b class="mono">' + (p.price != null ? money(p.price) : 'Em breve') + '</b></span>' +
          (canWear(p) ? '<button type="button" class="kr__add" data-row-try="' + esc(p.id) + '" aria-label="Pôr ' + esc(p.name) + ' no provador">' + ico('plus', 18) + '</button>' : '') +
        '</li>';
      }).join('') + '</ul>';
  }
  /* ---------------- anatomia: camadas, cortes padrão e textos (o dono troca no painel) ---------------- */
  var ANA_CORTES = [.7, .88];
  var ANA_PADRAO = [
    ['Cabedal', 'Mesh respirável', 'Ventila e segura o pé'],
    ['Entressola', 'Espuma EVA', 'Amortece cada passo'],
    ['Solado', 'Borracha', 'Aderência no asfalto']
  ];
  var ana = null, anaId = null, atende = null;
  function anaItem(p) {
    var a = p.anat || {}, c = Array.isArray(a.c) && a.c.length === 2 ? a.c : ANA_CORTES, sample = isSample(p) || !p.link;
    return {
      id: p.id, nome: p.name, src: imgFor(p), preco: p.price != null ? p.price : null, antigo: p.oldPrice && p.price != null && p.oldPrice > p.price ? p.oldPrice : null,
      link: sample ? '' : affLink(p), loja: p.store || '', exemplo: sample, cortes: [Math.min(c[0], c[1] - .05), c[1]],
      camadas: ANA_PADRAO.map(function (d, k) { return { parte: d[0], mat: (a.m && a.m[k]) || d[1], ben: (a.b && a.b[k]) || d[2] }; })
    };
  }
  function anaSet() {
    if (!ana) return;
    var list = sneakers().slice(0, SK_MAX), p = (anaId && byId(anaId)) || list[0];
    $('anatomia').hidden = !p; if (p) ana.set(anaItem(p));
  }
  function montarAnatomia() {
    var sec = $('anatomia'); if (!sec || ana || !window.GSAnatomia || !sneakers().length) return;
    if (hasGsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
    sec.hidden = false;
    ana = GSAnatomia.montar(sec, { movimento: hasGsap && !REDUCED && !!window.ScrollTrigger, fmt: money });
    anaSet();
  }
  /* roda fn uma vez quando el estiver a ~1 tela de entrar na tela */
  function quandoPerto(el, fn) {
    if (!el || !('IntersectionObserver' in window)) { fn(); return; }
    var io = new IntersectionObserver(function (en) { if (en.some(function (e) { return e.isIntersecting; })) { io.disconnect(); fn(); } }, { rootMargin: '900px 0px' });
    io.observe(el);
  }
  var ring = null;
  function renderKicks() {
    var sec = $('tenis'), el = $('kicks'); if (!sec || !el) return;
    var all = sneakers(), list = all.slice(0, SK_MAX);
    sec.hidden = !list.length;
    if (ring) { ring.destruir(); ring = null; }
    if (list.length && window.GSVitrine) {
      ring = GSVitrine.montar(el, {
        itens: list.map(ringItem), movimento: hasGsap && !REDUCED, fmt: money, onTroca: function (it) { syncFavs(); anaId = it && it.id; anaSet(); },
        titulo: '<p class="vt-eyebrow">Tênis</p><h2 class="vt-h" id="vt-titulo">Pisa <span>forte.</span></h2>'
      });
    }
    anaSet();
    /* a cor de cada foto pinta a palavra gigante atrás do tênis; só lê as fotos quando o anel chega perto,
       para não baixar as fotos grandes logo na abertura */
    quandoPerto(sec, function () {
      list.forEach(function (p) {
        var src = imgFor(p);
        if (!lookCache[src]) analyze(src).then(function (look) { if (look && ring) ring.cor(p.id, look.accent); });
      });
    });
    syncFavs();
  }

  /* ---------------- provador: peças empilhadas como na foto (cima, baixo encostado, tênis embaixo) ---------------- */
  /* altura real aproximada de cada tipo de peça, em cm: deixa as proporções certas entre moletom, bermuda e tênis */
  /* a calça fica menor que o comprimento real: no corpo a blusa cobre a parte de cima dela */
  /* o tênis aparece de lado e sozinho (sem o par): 36 cm de comprimento deixa ele na proporção visual da blusa */
  var REAL_CM = { conjunto: 118, hoodie: 74, jacket: 70, tee: 70, pants: 84, shorts: 50, cap: 15, beanie: 20, sneakers: 36 };
  /* veste uma peça: conjunto tira a blusa e a bermuda; blusa ou bermuda tira o conjunto (initOutfit repõe a outra parte) */
  function vestir(slot, id) {
    if (id) ui.outfit[slot] = id; else delete ui.outfit[slot];
    if (slot === 'conjunto' && id) { delete ui.outfit.top; delete ui.outfit.baixo; }
    if ((slot === 'top' || slot === 'baixo') && id) delete ui.outfit.conjunto;
    if (slot === 'conjunto' || slot === 'top' || slot === 'baixo') initOutfit();
  }
  function initOutfit() {
    var wb = wardrobe(); ui.filled = ui.filled || {};
    SLOTS.forEach(function (s) {
      var cur = ui.outfit[s.id];
      if (cur && !wb[s.id].some(function (p) { return p.id === cur; })) delete ui.outfit[s.id];
      if ((s.id === 'top' || s.id === 'baixo') && ui.outfit.conjunto) return;
      var auto = !OPTIONAL[s.id] || (s.id === 'pes' && !ui.filled.pes);
      if (!ui.outfit[s.id] && auto && wb[s.id].length) { ui.outfit[s.id] = newest(wb[s.id]).sort(function (a, b) { return isSample(a) - isSample(b); })[0].id; ui.filled[s.id] = 1; }
    });
    if (!wb[ui.slot] || !wb[ui.slot].length) { var first = SLOTS.filter(function (s) { return wb[s.id].length; })[0]; ui.slot = first ? first.id : 'top'; }
  }
  /* combina com o tênis: compara as cores da peça com o destaque e as cores principais do tênis escolhido */
  function shoeLook() { var s = ui.outfit.pes && byId(ui.outfit.pes); return s ? lookCache[cutOf(s)] : null; }
  function matchDist(p) {
    var sh = shoeLook(), lk = lookCache[cutOf(p)]; if (!sh || !lk || !lk.colors || !lk.colors.length) return null;
    var alvo = (sh.accent ? [sh.accent] : []).concat(sh.colors || []), mine = (lk.accent ? [lk.accent] : []).concat(lk.colors.slice(0, 2)), best = 1e9;
    mine.forEach(function (a) { alvo.forEach(function (b) { var d = Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]); if (d < best) best = d; }); });
    return best;
  }
  function combina(p) { var d = matchDist(p); return d != null && d < 95; }
  function slotList(slot) {
    var list = newest(wardrobe()[slot] || []).sort(function (a, b) { return isSample(a) - isSample(b); });
    if (EXTRAS.indexOf(slot) < 0 || !shoeLook()) return list;
    var d = function (p) { var v = matchDist(p); return v == null ? 999 : v; };
    return list.sort(function (a, b) { return (combina(b) - combina(a)) || (isSample(a) - isSample(b)) || (d(a) - d(b)); });
  }
  /* lê as cores das peças pequenas e do tênis; quando terminar, redesenha a lista uma vez */
  var corLida = {};
  function lerCores(slots, done) {
    var falta = [];
    slots.forEach(function (slot) { falta = falta.concat(wardrobe()[slot] || []); });
    if (ui.outfit.pes) falta.push(byId(ui.outfit.pes));
    falta = falta.filter(function (p) { var s = p && cutOf(p); if (!s || lookCache[s] || corLida[s]) return false; corLida[s] = 1; return true; });
    if (falta.length) Promise.all(falta.map(function (p) { return analyze(cutOf(p)); })).then(done);
  }
  function tipoOf(p) { var k = kindOf(p); return k === 'socks' ? CANO[canoOf(p)].label : (KINDS[k] ? KINDS[k].label : ''); }
  function semTxt(slot) { return 'Sem ' + (SLOT_EMPTY[slot] || SLOT_LABEL[slot].toLowerCase()); }
  function renderRail() {
    var wb = wardrobe(), rail = $('rail'); if (!rail) return;
    rail.innerHTML = SLOTS.filter(function (s) { return wb[s.id].length && ACESS.indexOf(s.id) < 0; }).map(function (s) {
      var on = ui.slot === s.id;
      return '<button type="button" role="tab" class="rail__b" id="tab-' + s.id + '" aria-selected="' + on + '" data-slot="' + s.id + '"><span class="rail__i">' + ico(SLOT_ICON[s.id], 20) + '</span><span>' + SLOT_LABEL[s.id] + '</span><span class="rail__n mono">' + wb[s.id].length + '</span></button>';
    }).join('') + (wb.conjunto.length ? '' : '<span class="rail__b is-breve"><span class="rail__i">' + ico('conjunto', 20) + '</span><span>Kits</span><span class="rail__n mono">em breve</span></span>');
  }
  function renderThumbs() {
    var list = slotList(ui.slot), el = $('thumbs'); if (!el) return;
    var cur = ui.outfit[ui.slot], extra = EXTRAS.indexOf(ui.slot) >= 0;
    lerCores(EXTRAS, function () { renderThumbs(); renderInfo(); renderAcc(); });
    var html = list.map(function (p) {
      var ok = extra && combina(p), sub = p.price != null ? money(p.price).replace(/,\d\d$/, '') : (extra ? tipoOf(p) : '');
      return '<button type="button" role="option" class="th' + (ok ? ' th--ok' : '') + '" aria-selected="' + (cur === p.id) + '" data-pick="' + esc(p.id) + '" aria-label="' + esc(p.name + (ok ? ', combina com o tênis' : '')) + '">' + (ok ? '<span class="th__ok">Combina</span>' : '') + imgTag(thumbOf(p), '', '', ' loading="lazy"') + (sub ? '<small class="mono">' + esc(sub) + '</small>' : '') + '</button>';
    }).join('');
    if (OPTIONAL[ui.slot]) html += '<button type="button" role="option" class="th th--none" aria-selected="' + !cur + '" data-pick="" aria-label="' + esc(semTxt(ui.slot)) + '">' + ico('close', 18) + '<small>Sem</small></button>';
    el.innerHTML = html;
    el.setAttribute('aria-label', SLOT_LONG[ui.slot]);
    var sel = el.querySelector('[aria-selected="true"]');
    if (sel) { var l = sel.offsetLeft - el.clientWidth / 2 + sel.clientWidth / 2; el.scrollTo({ left: Math.max(0, l), behavior: REDUCED ? 'auto' : 'smooth' }); }
  }
  function figSrc(p) { var c = cutOf(p); return (ui.back && cutBackOf(p)) || (p.md && /-recorte.webp$/.test(c) ? c.replace(/-recorte.webp$/, '-recorte-md.webp') : c); }
  function layoutFig() {
    var fig = $('fig'), stage = $('stage'); if (!fig || !stage) return;
    var W = stage.clientWidth, H = stage.clientHeight; if (!W || !H) return;
    var items = [];
    /* boné e meia ficam na coluna de acessórios do canto, fora do boneco */
    ['conjunto', 'top', 'baixo', 'pes'].forEach(function (sid) {
      var box = fig.querySelector('[data-slot-box="' + sid + '"]'), id = ui.outfit[sid], p = id && byId(id); if (!p || !box || box.hidden) return;
      var lk = lookCache[box.getAttribute('data-src')], k = kindOf(p);
      var bb = lk ? lk.box : [0, 0, 1, 1], ar = lk ? lk.ar : (k === 'sneakers' ? 1.1 : .9);
      var cr = ar * bb[2] / bb[3], h;
      if (k === 'sneakers') { var mx = REAL_CM.sneakers; h = cr >= 1 ? mx / cr : mx; } else if (k === 'socks') h = CANO[canoOf(p)].cm; else h = REAL_CM[k] || 64;
      items.push({ sid: sid, box: box, bb: bb, ar: ar, h: h, w: h * cr, p: p, k: k });
    });
    if (!items.length) return;
    /* empilha: cima, baixo encostado (a barra da blusa cobre o cós), tênis logo abaixo */
    var y = 0, prev = null;
    items.forEach(function (it) {
      it.cx = 0;
      if (prev) y += (prev.sid === 'top' && it.sid === 'baixo') ? (it.k === 'pants' ? -5 : -2.5) : it.sid === 'pes' ? 5 : 3;
      it.y = y; y += it.h; prev = it;
    });
    var meia = Math.max.apply(null, items.map(function (i) { return Math.abs(i.cx || 0) + i.w / 2; }));
    var padT = H * .08, padB = H * .1, padX = W * .07;
    var s = Math.min((H - padT - padB) / y, (W / 2 - padX) / meia);
    var top0 = padT + ((H - padT - padB) - y * s) / 2;
    items.forEach(function (it) {
      var ih = it.h * s / it.bb[3], iw = ih * it.ar;
      var left = W / 2 + it.cx * s - (it.bb[0] + it.bb[2] / 2) * iw, top = top0 + it.y * s - it.bb[1] * ih;
      /* encaixe fino salvo no produto (ou sendo ajustado agora): desloca, escala e gira em volta do centro da peça */
      var f = fitOf(it.p), giro = f.r + (it.rot || 0);
      if (f.s !== 1) { var cx = left + iw / 2, cy = top + ih / 2; iw *= f.s; ih *= f.s; left = cx - iw / 2; top = cy - ih / 2; }
      left += f.x / 100 * H; top += f.y / 100 * H;
      it.box.style.rotate = giro ? giro + 'deg' : '';
      it.box.style.left = (left / W * 100).toFixed(3) + '%'; it.box.style.top = (top / H * 100).toFixed(3) + '%';
      it.box.style.width = (iw / W * 100).toFixed(3) + '%'; it.box.style.height = (ih / H * 100).toFixed(3) + '%';
    });
    var fl = stage.querySelector('.stage__floor');
    if (fl) fl.style.top = ((top0 + y * s) / H * 100).toFixed(2) + '%';
  }
  /* ---------------- coluna de acessórios: boné e meia no canto do palco; tocar abre a lista da peça ---------------- */
  /* faixa de acessórios embaixo do palco: sem peça cadastrada, avisa que está chegando */
  function renderAcs() {
    var el = $('acs'); if (!el) return;
    var wb = wardrobe();
    el.innerHTML = '<p class="lbl">Acessórios</p><div class="acs__row">' + ACESS.map(function (sid) {
      var n = wb[sid].length, p = ui.outfit[sid] && byId(ui.outfit[sid]), nome = SLOT_LABEL[sid];
      if (!n) return '<span class="acs__c is-breve"><span class="acs__im">' + ico(SLOT_ICON[sid], 22) + '</span><span class="acs__t">' + nome + '</span><small class="mono">Em breve</small></span>';
      return '<button type="button" class="acs__c' + (ui.slot === sid ? ' is-on' : '') + '" data-slot="' + sid + '" aria-label="' + esc(p ? nome + ': ' + p.name + '. Trocar' : 'Escolher ' + nome.toLowerCase()) + '"><span class="acs__im">' + (p ? imgTag(thumbOf(p), '', '', ' loading="lazy"') : ico(SLOT_ICON[sid], 22)) + '</span><span class="acs__t">' + nome + '</span><small class="mono">' + (p && p.price != null ? esc(money(p.price)) : n + (n === 1 ? ' opção' : ' opções')) + '</small></button>';
    }).join('') + '</div>';
  }
  function renderAcc() {
    var el = $('acc'); if (!el) return;
    var wb = wardrobe();
    renderAcs();
    el.innerHTML = ['cabeca', 'meias'].filter(function (sid) { return wb[sid] && wb[sid].length; }).map(function (sid) {
      var p = ui.outfit[sid] && byId(ui.outfit[sid]), ok = p && combina(p);
      var nome = sid === 'cabeca' ? 'Boné' : 'Meia';
      return '<button type="button" class="acc__c' + (ui.slot === sid ? ' is-on' : '') + (p ? '' : ' is-vazio') + '" data-slot="' + sid + '" aria-label="' + esc(p ? nome + ': ' + p.name + '. Trocar' : 'Escolher ' + nome.toLowerCase()) + '">' +
        (ok ? '<span class="acc__ok" aria-hidden="true"></span>' : '') +
        '<span class="acc__im">' + (p ? imgTag(thumbOf(p), '', '', ' loading="lazy"') : ico('plus', 18)) + '</span>' +
        '<span class="acc__t mono">' + (p ? esc(tipoOf(p)) : nome) + '</span></button>';
    }).join('');
  }

  /* ---------------- tênis em 360: modelo 3D (.glb) com giro, zoom, RA e pontos de destaque ---------------- */
  var MV_SRC = 'https://cdn.jsdelivr.net/npm/@google/model-viewer@3.5.0/dist/model-viewer.min.js', mvLoad = null;
  var PONTOS = [
    ['cabedal', 'Cabedal', 'O corpo do tênis. Gira pra ver costura e acabamento de perto.'],
    ['cadarco', 'Cadarço', 'Cadarço e lingueta: ajuste firme no peito do pé.'],
    ['sola', 'Sola', 'Aderência e amortecimento. Dá zoom pra ver o desenho.']
  ];
  function modelOf(p) { return p ? (p.glb || (p.model3d ? '/_blob/' + p.model3d : '')) : ''; }
  /* o site não serve .glb: o modelo fica guardado como texto base64 (.txt ou no armazenamento) e vira 3D aqui */
  var mvUrls = {};
  function modelUrl(src) {
    if (mvUrls[src]) return Promise.resolve(mvUrls[src]);
    return fetch(src).then(function (r) { if (!r.ok) throw new Error('http'); return r.arrayBuffer(); }).then(function (buf) {
      var head = new Uint8Array(buf, 0, 4), bin;
      if (String.fromCharCode(head[0], head[1], head[2], head[3]) === 'glTF') bin = buf;
      else { var s = atob(new TextDecoder().decode(buf).replace(/\s+/g, '')), u = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); bin = u; }
      return (mvUrls[src] = URL.createObjectURL(new Blob([bin], { type: 'model/gltf-binary' })));
    });
  }
  function render360Btn() {
    var b = $('b360'), st = $('stage'); if (!b) return;
    var p = ui.outfit.pes && byId(ui.outfit.pes), tem = !!modelOf(p);
    b.hidden = !tem; if (st) st.classList.toggle('has-360', tem);
    if (tem) b.setAttribute('aria-label', 'Ver ' + p.name + ' em 360 graus');
  }
  function loadMV() {
    if (window.customElements && customElements.get('model-viewer')) return Promise.resolve();
    if (!mvLoad) mvLoad = new Promise(function (res, rej) {
      var s = document.createElement('script'); s.type = 'module'; s.src = MV_SRC;
      s.onerror = function () { mvLoad = null; rej(new Error('mv')); };
      document.head.appendChild(s);
      customElements.whenDefined('model-viewer').then(res);
    });
    return mvLoad;
  }
  function textoPonto(p, k, fb) { return (p.pontos && p.pontos[k]) || fb; }
  function open360(id) {
    var p = byId(id), src = modelOf(p); if (!p || !src) return;
    var el = $('v360');
    if (!el) { el = document.createElement('div'); el.className = 'v360'; el.id = 'v360'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-labelledby', 'v360-h'); el.hidden = true; document.body.appendChild(el); }
    var demo = !!p.glbDemo, link = p.link && !isSample(p);
    el.innerHTML =
      '<div class="v360__top"><div><p class="eyebrow eyebrow--gold">' + ico('rotate', 13) + ' 360 · gira e aproxima</p><h3 class="v360__h" id="v360-h">' + esc(p.name) + '</h3></div>' +
        '<button type="button" class="round round--sm" data-close aria-label="Fechar">' + ico('close', 18) + '</button></div>' +
      '<div class="v360__palco"><p class="v360__load mono" id="v360-load">Carregando o 3D…</p></div>' +
      '<div class="v360__pe">' + (demo ? '<p class="v360__demo mono">Modelo de demonstração, não é este tênis. 3D: Shopify, CC BY 4.0</p>' : '') +
        '<p class="v360__dica mono">Arrasta pra girar · pinça ou rodinha pra zoom · toca nos pontos</p>' +
        (link ? '<a class="btn btn--gold btn--wide" href="' + esc(affLink(p)) + '" target="_blank" rel="noopener sponsored">' + esc(buyLabel(p)) + ico('arrow', 17) + '</a>' : '') + '</div>';
    showLayer(el, function (fromPop) { hideLayer(el, fromPop === true); setTimeout(function () { if (el.hidden) { var mv = el.querySelector('model-viewer'); if (mv) mv.remove(); } }, 500); });
    Promise.all([loadMV(), modelUrl(src)]).then(function (r) {
      var palco = el.querySelector('.v360__palco'); if (!palco) return;
      var mv = document.createElement('model-viewer');
      mv.setAttribute('src', r[1]); mv.setAttribute('alt', 'Modelo 3D de ' + p.name);
      ['camera-controls', 'ar'].forEach(function (a) { mv.setAttribute(a, ''); });
      mv.setAttribute('ar-modes', 'webxr scene-viewer quick-look'); mv.setAttribute('touch-action', 'pan-y');
      mv.setAttribute('shadow-intensity', '1.1'); mv.setAttribute('shadow-softness', '.8'); mv.setAttribute('exposure', '1.05');
      mv.setAttribute('environment-image', 'neutral'); mv.setAttribute('interaction-prompt', 'auto'); mv.setAttribute('camera-orbit', '35deg 72deg auto');
      mv.setAttribute('min-camera-orbit', 'auto auto 40%'); mv.setAttribute('max-camera-orbit', 'auto auto 160%');
      mv.innerHTML = PONTOS.map(function (pt, i) {
        return '<button type="button" class="v360__hs" slot="hotspot-' + pt[0] + '" data-position="0 0 0" data-normal="0 1 0" aria-expanded="false"><i aria-hidden="true">' + (i + 1) + '</i><span class="v360__hs-t"><b>' + pt[1] + '</b>' + esc(textoPonto(p, pt[0], pt[2])) + '</span></button>';
      }).join('') + '<button type="button" slot="ar-button" class="v360__ar">' + ico('camera', 16) + ' Ver no meu espaço</button>';
      /* o evento load às vezes passa antes de a página ouvir (aba em segundo plano): confere também mv.loaded */
      var feito = false;
      var pronto = function () {
        if (feito) return; feito = true;
        var ld = $('v360-load'); if (ld) ld.hidden = true;
        /* pontos calculados pela caixa do modelo: serve para qualquer tênis gerado por IA, sem marcar à mão */
        var c = mv.getBoundingBoxCenter(), d = mv.getDimensions(), longoX = d.x >= d.z;
        var lado = longoX ? [0, 0, d.z / 2] : [d.x / 2, 0, 0], nLado = longoX ? '0m 0m 1m' : '1m 0m 0m';
        var pos = {
          cabedal: [c.x + lado[0], c.y + d.y * .12, c.z + lado[2], nLado],
          cadarco: [c.x + (longoX ? d.x * .12 : 0), c.y + d.y * .46, c.z + (longoX ? 0 : d.z * .12), '0m 1m 0m'],
          sola: [c.x + lado[0] - (longoX ? d.x * .25 : 0), c.y - d.y * .42, c.z + lado[2] - (longoX ? 0 : d.z * .25), nLado]
        };
        Object.keys(pos).forEach(function (k) { var v = pos[k]; mv.updateHotspot({ name: 'hotspot-' + k, position: v[0] + 'm ' + v[1] + 'm ' + v[2] + 'm', normal: v[3] }); });
      };
      mv.addEventListener('load', pronto);
      (function confere(n) { if (feito || !mv.isConnected && n > 4) return; if (mv.loaded) pronto(); else if (n < 120) setTimeout(function () { confere(n + 1); }, 250); })(0);
      mv.addEventListener('error', function () { var ld = $('v360-load'); if (ld) { ld.hidden = false; ld.textContent = 'Não deu para abrir o 3D deste tênis.'; } });
      mv.addEventListener('click', function (e) {
        var hs = e.target.closest('.v360__hs');
        Array.prototype.forEach.call(mv.querySelectorAll('.v360__hs'), function (h) { h.setAttribute('aria-expanded', String(h === hs && h.getAttribute('aria-expanded') !== 'true')); });
      });
      palco.appendChild(mv);
    }, function () { var ld = $('v360-load'); if (ld) ld.textContent = 'Não deu para carregar o 3D. Confira a internet e tente de novo.'; });
  }

  /* ---------------- encaixe fino (só o dono): x e y em % da altura do palco, s = escala, r = giro em graus ---------------- */
  var fitDraft = {};
  function fitOf(p) { var f = (p && (fitDraft[p.id] || p.fit)) || {}; return { x: +f.x || 0, y: +f.y || 0, s: +f.s || 1, r: +f.r || 0 }; }
  var FIT_CTL = [['x', 'Para os lados', -25, 25, .5, '%'], ['y', 'Para cima e para baixo', -25, 25, .5, '%'], ['s', 'Tamanho', .6, 1.5, .01, ''], ['r', 'Giro', -20, 20, .5, '°']];
  function renderFitBar() {
    var bar = $('fitbar'), tg = $('fit-toggle'); if (!bar || !tg) return;
    tg.hidden = !ui.canEdit; bar.hidden = !ui.fitMode;
    tg.setAttribute('aria-pressed', ui.fitMode ? 'true' : 'false');
    if (!ui.fitMode) return;
    var id = ui.outfit[ui.slot], p = id && byId(id);
    if (!p) { bar.innerHTML = '<p class="muted">Escolha uma peça para ajustar.</p>'; return; }
    var f = fitOf(p);
    bar.innerHTML = '<p class="fitbar__t"><b>Ajustar encaixe</b><span>' + esc(p.name) + '</span></p>' +
      '<p class="muted fitbar__h">Arraste a peça no boneco ou use os controles. Vale para esta peça em todo outfit.</p>' +
      FIT_CTL.map(function (c) { var v = f[c[0]]; return '<label class="fitbar__c"><span>' + c[1] + '<output id="fo-' + c[0] + '">' + (c[0] === 's' ? Math.round(v * 100) + '%' : String(v).replace('.', ',') + c[5]) + '</output></span><input type="range" data-fit="' + c[0] + '" min="' + c[2] + '" max="' + c[3] + '" step="' + c[4] + '" value="' + v + '"></label>'; }).join('') +
      '<div class="row-btns"><button class="btn btn--gold" type="button" id="fit-save">Salvar encaixe</button><button class="btn btn--ghost" type="button" id="fit-reset">Zerar</button></div>';
  }
  function setFit(k, v) {
    var id = ui.outfit[ui.slot], p = id && byId(id); if (!p) return;
    var f = fitOf(p); f[k] = v; fitDraft[p.id] = f;
    var o = $('fo-' + k); if (o) o.textContent = k === 's' ? Math.round(v * 100) + '%' : String(Math.round(v * 10) / 10).replace('.', ',') + (k === 'r' ? '°' : '%');
    layoutFig();
  }
  async function saveFit() {
    var id = ui.outfit[ui.slot], p = id && byId(id); if (!p || ui.busy) return;
    var f = fitOf(p), clean = (f.x || f.y || f.r || f.s !== 1) ? { x: Math.round(f.x * 10) / 10, y: Math.round(f.y * 10) / 10, s: Math.round(f.s * 100) / 100, r: Math.round(f.r * 10) / 10 } : null;
    var before = p.fit; if (clean) p.fit = clean; else delete p.fit;
    try { await commit('Encaixe salvo: ' + p.name); } catch (e) { if (before) p.fit = before; else delete p.fit; toast(errMsg(e)); }
  }
  function renderFig(changed, dir) {
    var fig = $('fig'); if (!fig) return;
    var any = false, pend = [];
    SLOTS.forEach(function (s) {
      var id = ui.outfit[s.id], p = id ? byId(id) : null, box = fig.querySelector('[data-slot-box="' + s.id + '"]');
      if (!box) { box = document.createElement('div'); box.className = 'slot slot--' + s.id; box.setAttribute('data-slot-box', s.id); fig.appendChild(box); }
      box.classList.toggle('is-active', ui.slot === s.id);
      if (EXTRAS.indexOf(s.id) >= 0) { if (p) any = true; p = null; }
      if (!p) { box.innerHTML = ''; box.hidden = true; box.removeAttribute('data-id'); box.removeAttribute('data-src'); return; }
      box.hidden = false; any = true;
      var src = figSrc(p);
      if (box.getAttribute('data-src') === src) return;
      var flip = box.getAttribute('data-id') === p.id;
      box.setAttribute('data-id', p.id); box.setAttribute('data-src', src);
      box.innerHTML = imgTag(src, p.name, 'slot__img');
      if (!lookCache[src]) pend.push(analyze(src, true));
      if (hasGsap && !REDUCED) {
        var im = box.querySelector('img');
        if (flip) gsap.fromTo(im, { scaleX: .1, autoAlpha: .4 }, { scaleX: 1, autoAlpha: 1, duration: .45, ease: 'expo.out', clearProps: 'transform' });
        else if (changed === s.id) gsap.fromTo(im, { x: (dir || 1) * 80, autoAlpha: 0, rotation: (dir || 1) * 5, scale: .94 }, { x: 0, autoAlpha: 1, rotation: 0, scale: 1, duration: .55, ease: 'expo.out', clearProps: 'transform' });
      }
    });
    fig.classList.toggle('is-empty', !any);
    renderAcc(); render360Btn();
    layoutFig();
    if (pend.length) Promise.all(pend).then(function () { layoutFig(); });
    var look = Object.keys(ui.outfit).filter(function (k) { return ui.outfit[k]; }).length;
    var ln = $('look-n'); if (ln) ln.textContent = pad2(look);
    Array.prototype.forEach.call(document.querySelectorAll('[data-face]'), function (b) { b.setAttribute('aria-pressed', String((b.getAttribute('data-face') === 'back') === !!ui.back)); });
  }
  function renderInfo() {
    var el = $('info'); if (!el) return;
    var id = ui.outfit[ui.slot], p = id ? byId(id) : null;
    var parts = SLOTS.map(function (s) { var x = ui.outfit[s.id] && byId(ui.outfit[s.id]); return x ? [s, x] : null; }).filter(Boolean);
    var priced = parts.filter(function (x) { return x[1].price != null; });
    var total = priced.reduce(function (a, x) { return a + x[1].price; }, 0);
    var head = '';
    if (p) {
      var sz = sizesOf(p), mine = ui.sizes[p.id] || '', sample = isSample(p) || !p.link;
      head =
        '<p class="eyebrow eyebrow--gold">' + (EXTRAS.indexOf(ui.slot) >= 0 ? esc(tipoOf(p)) : SLOT_LONG[ui.slot]) + (EXTRAS.indexOf(ui.slot) >= 0 && combina(p) ? '<span class="pill pill--ok">Combina com o tênis</span>' : '') + (p.badge === 'novo' && !sample ? '<span class="pill">Novo</span>' : '') + (sample ? '<span class="pill pill--ex">Exemplo</span>' : '') + '</p>' +
        '<h3 class="info__name" id="info-name">' + esc(p.name) + '</h3>' + statsHTML(p) +
        '<div class="info__price">' + (p.price != null ? priceHTML(p, true) : '<span class="price price--na">' + (sample ? 'Preço e link em breve' : 'Ver preço na loja') + '</span>') + '</div>' +
        (!sample && (p.priceAt || p.createdAt) ? '<p class="info__seen mono">Preço visto em ' + dayOf(p.priceAt || p.createdAt) + ' · ' + esc(p.store || 'loja') + '</p>' : '') +
        (sz.length ? '<div class="sizes"><p class="lbl">Tamanho <span class="mono">' + esc(mine || 'escolha') + '</span></p><div class="sizes__row" role="group" aria-label="Tamanhos">' + sz.map(function (s) { return '<button type="button" class="sz" data-size="' + esc(s) + '" data-for="' + esc(p.id) + '" aria-pressed="' + (mine === s) + '">' + esc(s) + '</button>'; }).join('') + '</div></div>' : '') +
        '<div class="info__cta">' + (sample ? '<span class="btn btn--gold btn--wide is-off" aria-disabled="true">Link em breve</span>' : '<a class="btn btn--gold btn--wide" href="' + esc(affLink(p)) + '" target="_blank" rel="noopener sponsored">' + esc(buyLabel(p)) + ico('external', 17) + '</a>') +
        '<button type="button" class="round" data-fav="' + esc(p.id) + '" aria-pressed="' + isFav(p.id) + '">' + ico('heart', 20) + '</button></div>' +
        '<button type="button" class="link-btn" data-open="' + esc(p.id) + '">Ver fotos e detalhes</button>';
    } else {
      head = '<p class="eyebrow eyebrow--gold">' + SLOT_LONG[ui.slot] + '</p><h3 class="info__name">' + esc(semTxt(ui.slot)) + ' no outfit</h3><p class="muted">Escolhe uma peça nas miniaturas.</p>';
    }
    /* fecha o look: sugere o boné e a meia que faltam, os que combinam com o tênis primeiro */
    var sug = parts.length ? EXTRAS.filter(function (sid) { return !ui.outfit[sid]; }).map(function (sid) { var c = slotList(sid)[0]; return c ? [sid, c] : null; }).filter(Boolean).slice(0, 3) : [];
    var sugPreco = sug.filter(function (x) { return x[1].price != null; }).reduce(function (a, x) { return a + x[1].price; }, 0);
    var fecha = sug.length ? '<div class="fecha"><p class="lbl">Fecha o outfit' + (sugPreco ? ' por <b class="mono">+ ' + money(sugPreco) + '</b>' : '') + '</p><ul>' + sug.map(function (x) {
      var ok = combina(x[1]);
      return '<li><button type="button" class="fecha__it" data-add="' + x[0] + '" data-id="' + esc(x[1].id) + '"><span class="look__th">' + imgTag(thumbOf(x[1]), '', '', ' loading="lazy"') + '</span><span class="look__nm">' + esc(x[1].name) + '<small>' + esc(tipoOf(x[1])) + (ok ? ' · combina com o tênis' : '') + '</small></span><span class="fecha__add mono">' + (x[1].price != null ? '+ ' + money(x[1].price) : '+ Pôr') + '</span></button></li>';
    }).join('') + '</ul></div>' : '';
    var look = parts.length > 1 ? '<div class="look"><p class="lbl">Outfit completo · ' + parts.length + ' peças</p><ul>' + parts.map(function (x) {
      return '<li><button type="button" class="look__it" data-slot="' + x[0].id + '"><span class="look__th">' + imgTag(thumbOf(x[1]), '', '', ' loading="lazy"') + '</span><span class="look__nm">' + esc(x[1].name) + '</span><span class="look__pr mono">' + (x[1].price != null ? money(x[1].price) : 'em breve') + '</span></button></li>';
    }).join('') + '</ul><p class="look__tot"><span>Total' + (priced.length < parts.length ? ' das peças com preço' : '') + '</span><b class="mono">' + money(total) + '</b></p></div>' : '';
    el.innerHTML = head + look + fecha;
  }
  function renderFit(changed, dir) {
    if (!wearable().length) { var f = $('provador'); if (f) f.hidden = true; return; }
    initOutfit(); renderRail(); renderThumbs(); renderFig(changed, dir); renderInfo(); renderFitBar(); syncFavs();
  }
  function pick(slot, id, dir) {
    vestir(slot, id);
    ui.slot = slot; renderThumbs(); renderFig(slot, dir); renderInfo(); renderRail(); renderFitBar(); syncFavs();
  }
  function step(slot, d) {
    var list = slotList(slot); if (!list.length) return;
    var ids = list.map(function (p) { return p.id; }); if (OPTIONAL[slot]) ids.push('');
    var i = ids.indexOf(ui.outfit[slot] || ''); if (i < 0) i = 0;
    pick(slot, ids[(i + d + ids.length) % ids.length], d);
    var hint = $('stage-hint'); if (hint) hint.classList.add('is-used');
  }
  function setFace(back) {
    if (back) {
      var any = SLOTS.some(function (s) { var p = ui.outfit[s.id] && byId(ui.outfit[s.id]); return p && cutBackOf(p); });
      if (!any) { toast('As peças deste outfit ainda não têm foto das costas. Quando tiverem, elas aparecem aqui.'); return; }
    }
    ui.back = !!back; renderFig();
  }
  function tryOn(id) {
    var p = byId(id); if (!p || !canWear(p)) return;
    var slot = KINDS[kindOf(p)].slot; vestir(slot, id); ui.slot = slot;
    closeSheet(); go('provador', function () { renderFit(slot); });
  }
  /* ---------------- look aleatório: sorteia entre as combinações com melhor nota, não entre todas ---------------- */
  function corInfo(c) {
    var mx = Math.max(c[0], c[1], c[2]), mn = Math.min(c[0], c[1], c[2]), d = mx - mn, sat = mx ? d / mx : 0, h = 0;
    if (d) { h = mx === c[0] ? ((c[1] - c[2]) / d + 6) % 6 : mx === c[1] ? (c[2] - c[0]) / d + 2 : (c[0] - c[1]) / d + 4; h *= 60; }
    return { h: h, sat: sat, neutro: sat < .22 || mx < 55 };
  }
  function difHue(a, b) { var d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; }
  /* cor mais marcante da peça: o destaque lido da foto ou, sem ele, a cor principal */
  function corPeca(p) { var lk = lookCache[cutOf(p)]; if (!lk) return null; var c = lk.accent || (lk.colors && lk.colors[0]); return c ? corInfo(c) : null; }
  function notaPeca(p) { var st = p.stats || {}; return ((st.rating || 4.2) - 4) * 2 + Math.min(off(p), 60) / 25; }
  function parCores(a, b) {
    if (!a || !b) return 0;
    if (a.neutro && b.neutro) return 2;
    if (a.neutro || b.neutro) return 3; /* uma cor só em cima de base neutra */
    var d = difHue(a.h, b.h);
    return d < 28 ? 3 : d > 150 ? 1 : -4; /* mesma família ou contraste de opostos; o meio-termo costuma brigar */
  }
  var rndOcupado = false, rndVistos = readLS('gs-rnd', {});
  function embaralha(l) { l = l.slice(); for (var k = l.length - 1; k > 0; k--) { var r = Math.floor(Math.random() * (k + 1)), x = l[k]; l[k] = l[r]; l[r] = x; } return l; }
  /* candidatas de uma parte: primeiro as que ainda não apareceram; quando todas apareceram, recomeça a volta */
  function fila(slot) {
    var todas = (wardrobe()[slot] || []).filter(function (p) { return !isSample(p) && p.link && p.price != null; });
    var ids = todas.map(function (p) { return p.id; });
    var vistos = (rndVistos[slot] || []).filter(function (id) { return ids.indexOf(id) >= 0; });
    if (vistos.length >= todas.length) vistos = [];
    rndVistos[slot] = vistos;
    var novas = embaralha(todas.filter(function (p) { return vistos.indexOf(p.id) < 0; }));
    return novas.concat(embaralha(todas.filter(function (p) { return vistos.indexOf(p.id) >= 0; })));
  }
  function escolhe(cands, nota) {
    var ord = cands.map(function (p) { return { p: p, n: nota(p) }; }).sort(function (a, b) { return b.n - a.n; });
    return ord[Math.floor(Math.random() * Math.min(2, ord.length))].p;
  }
  function lookAleatorio() {
    if (rndOcupado) return;
    var filaC = fila('top'), filaB = fila('baixo'), filaP = fila('pes');
    if (!filaC.length || !filaB.length) { toast('Ainda faltam peças para montar um outfit.'); return; }
    rndOcupado = true;
    var bt = $('fit-rnd'); if (bt) bt.classList.add('is-busy');
    var c = filaC[0], baixo = filaB.slice(0, 8), pes = filaP.slice(0, 6);
    var leitura = Promise.all([c].concat(baixo, pes).map(function (p) { return analyze(cutOf(p), true); }));
    Promise.race([leitura, new Promise(function (r) { setTimeout(r, 3000); })]).then(function () {
      var novo = function (slot, p) { return (rndVistos[slot] || []).indexOf(p.id) < 0 ? 4 : 0; };
      var corC = corPeca(c);
      var b = escolhe(baixo, function (p) { return parCores(corC, corPeca(p)) * 2 + novo('baixo', p) + notaPeca(p) * .3; });
      var corB = corPeca(b);
      var f = pes.length ? escolhe(pes, function (p) { var cf = corPeca(p); return parCores(corC, cf) + parCores(corB, cf) + novo('pes', p) + notaPeca(p) * .3; }) : null;
      rndVistos.top.push(c.id); rndVistos.baixo.push(b.id); if (f) rndVistos.pes.push(f.id);
      writeLS('gs-rnd', rndVistos);
      delete ui.outfit.conjunto;
      ui.outfit.top = c.id; ui.outfit.baixo = b.id;
      if (f) { ui.outfit.pes = f.id; ui.filled = ui.filled || {}; ui.filled.pes = 1; }
      ui.slot = 'top';
      renderFit('top', 1);
    }).catch(function () { toast('Não deu para montar agora. Tenta de novo.'); }).then(function () {
      rndOcupado = false; if (bt) bt.classList.remove('is-busy');
    });
  }
  /* arrastar pro lado em cima de uma peça troca aquela peça */
  function bindStage() {
    var st = $('stage'); if (!st) return;
    var x0 = 0, y0 = 0, slot0 = null, on = false, fit0 = null;
    /* no modo de encaixe, arrastar move a peça escolhida (não troca de peça) */
    st.addEventListener('pointermove', function (e) {
      if (!on || !fit0) return;
      var H = st.clientHeight || 1;
      setFit('x', Math.max(-25, Math.min(25, fit0.x + (e.clientX - x0) / H * 100)));
      setFit('y', Math.max(-25, Math.min(25, fit0.y + (e.clientY - y0) / H * 100)));
    });
    st.addEventListener('pointerdown', function (e) {
      if (e.target.closest('button')) return;
      on = true; x0 = e.clientX; y0 = e.clientY; slot0 = null; fit0 = null;
      if (ui.fitMode) { var fp = ui.outfit[ui.slot] && byId(ui.outfit[ui.slot]); if (fp) { fit0 = fitOf(fp); try { st.setPointerCapture(e.pointerId); } catch (er) { /* */ } } return; }
      var boxes = st.querySelectorAll('.slot:not([hidden])'), best = null, bd = 1e9;
      Array.prototype.forEach.call(boxes, function (b) {
        var r = b.getBoundingClientRect(), cy = (r.top + r.bottom) / 2;
        var inside = e.clientY >= r.top && e.clientY <= r.bottom, dd = inside ? Math.abs(e.clientY - cy) : 1e6 + Math.abs(e.clientY - cy);
        if (dd < bd) { bd = dd; best = b; }
      });
      if (best) slot0 = best.getAttribute('data-slot-box');
    });
    st.addEventListener('pointerup', function (e) {
      if (!on) return; on = false;
      if (fit0) { fit0 = null; renderFitBar(); return; }
      var dx = e.clientX - x0, dy = e.clientY - y0;
      if (Math.abs(dx) > 42 && Math.abs(dx) > Math.abs(dy) * 1.3) { var sl = slot0 || ui.slot; ui.slot = sl; renderRail(); step(sl, dx < 0 ? 1 : -1); }
      else if (Math.abs(dx) < 8 && Math.abs(dy) < 8 && slot0 && slot0 !== ui.slot) { ui.slot = slot0; renderRail(); renderThumbs(); renderFig(); renderInfo(); renderFitBar(); syncFavs(); }
    });
    st.addEventListener('pointercancel', function () { on = false; fit0 = null; });
    var main = st.closest('.fit__main');
    main.addEventListener('input', function (e) { var k = e.target.getAttribute && e.target.getAttribute('data-fit'); if (k) setFit(k, +e.target.value); });
    main.addEventListener('click', function (e) {
      if (e.target.closest('#fit-toggle')) { ui.fitMode = !ui.fitMode; st.classList.toggle('is-fitting', !!ui.fitMode); renderFitBar(); return; }
      if (e.target.closest('#fit-save')) { saveFit(); return; }
      if (e.target.closest('#fit-reset')) { var p = ui.outfit[ui.slot] && byId(ui.outfit[ui.slot]); if (p) { fitDraft[p.id] = { x: 0, y: 0, s: 1, r: 0 }; layoutFig(); renderFitBar(); } }
    });
    if ('ResizeObserver' in window) new ResizeObserver(function () { layoutFig(); }).observe(st);
    else window.addEventListener('resize', layoutFig);
  }

  /* ---------------- vitrine ---------------- */
  function renderChips() {
    var el = $('chips'); if (!el) return;
    var list = roupas(), cats = categoriesOf(list);
    el.innerHTML = '<button type="button" class="chip" data-cat="all" aria-pressed="' + (ui.cat === 'all') + '">Tudo <span class="mono">' + list.length + '</span></button>' +
      cats.map(function (c) { return '<button type="button" class="chip" data-cat="' + esc(c[0]) + '" aria-pressed="' + (ui.cat === c[0]) + '">' + esc(c[0]) + ' <span class="mono">' + c[1] + '</span></button>'; }).join('');
  }
  function card(p, feat) {
    var cut = cutOf(p), src = cut || photoOf(p, 0), o = off(p);
    return '<article class="card' + (feat ? ' card--feat' : '') + (p.hidden ? ' is-hidden' : '') + '" data-id="' + p.id + '">' +
      '<div class="card__media' + (cut ? ' is-cut' : '') + '">' + (src ? '<img src="' + esc(feat || !cut ? src : thumbOf(p) || src) + '"' + (cut && !feat ? ' data-full="' + esc(src) + '"' + srcsetDe(p, '(min-width: 900px) 23vw, 48vw') : '') + ' alt="" loading="lazy" decoding="async">' : '<span class="ph" aria-hidden="true">' + LOGO_SVG + '</span>') + (cut && cutBackOf(p) ? '<button type="button" class="card__flip round round--sm" data-flip="' + esc(p.id) + '" aria-pressed="false" aria-label="Ver as costas: ' + esc(p.name) + '">' + ico('rotate', 16) + '</button>' : '') + '</div>' +
      '<div class="card__top">' + (o ? '<span class="offb">-' + o + '%</span>' : '') + (p.hidden ? '<span class="tagm tagm--warn mono">Oculta</span>' : '') + '</div>' +
      /* hierarquia: nome e preço sempre; loja e nota só ao passar o mouse (no celular, linha discreta embaixo) */
      '<div class="card__meta">' + (feat ? '<span class="card__flag mono">Novo garimpo</span>' : '') + '<h3 class="card__nm">' + esc(p.name) + '</h3>' + priceHTML(p) +
        '<p class="card__info mono">' + esc(p.store || 'Loja') + (p.stats && p.stats.rating ? '<span>★ ' + String(p.stats.rating.toFixed(1)).replace('.', ',') + (p.stats.reviews ? ' (' + esc(revLabel(p.stats.reviews)) + ')' : '') + '</span>' : '') + '</p>' +
        (p.link && !isSample(p) ? '<a class="card__buy" href="' + esc(affLink(p)) + '" target="_blank" rel="noopener sponsored" aria-label="Compre agora: ' + esc(p.name) + (p.store ? ' na ' + esc(p.store) : '') + ' (abre a loja)">Compre agora' + ico('arrow', 14) + '</a>' : '') + '</div>' +
      '<button type="button" class="card__hit" data-open="' + p.id + '" aria-label="Ver ' + esc(p.name) + '"></button>' +
      '<button type="button" class="card__fav round round--sm" data-fav="' + p.id + '" aria-pressed="' + isFav(p.id) + '">' + ico('heart', 17) + '</button>' +
      '<button type="button" class="card__cart round round--sm" data-cart-add="' + p.id + '" aria-label="Adicionar ao carrinho">' + ico('cart', 17) + '</button>' +
      '</article>';
  }
  function renderGrid() {
    var el = $('grid'); if (!el) return;
    preencheTam('tam-r', roupas(), ui.tamR, 'Meu tamanho');
    var list = filtered(roupas());
    var feat = false; /* todas as peças no mesmo padrão grande e vertical */
    el.innerHTML = list.length ? list.map(function (p, i) { return card(p, feat && i === 0); }).join('') :
      '<div class="empty"><p class="h3">Nada por aqui</p><p class="muted">' + (ui.favOnly ? 'Toque no coração de uma peça para salvar nos favoritos.' : 'Tente outra busca ou outra categoria.') + '</p><button type="button" class="btn btn--ghost" id="reset-f">Ver todas as peças</button></div>';
    Array.prototype.forEach.call(el.querySelectorAll('img[data-full]'), function (im) { im.addEventListener('error', function () { im.removeAttribute('srcset'); if (im.src.indexOf(im.getAttribute('data-full')) < 0) im.src = im.getAttribute('data-full'); }, { once: true }); });
    var c = $('count'); if (c) c.textContent = list.length + (list.length === 1 ? ' peça' : ' peças') + (ui.favOnly ? ' nos favoritos' : '');
    var bt = $('busca-tenis'), qq = norm(ui.q).split(/\s+/).filter(Boolean);
    if (bt) { var ach = qq.length ? tenisReais().filter(function (p) { var t = norm([p.name, p.category, p.store, p.idShein || ''].join(' ')); return qq.every(function (w) { return t.indexOf(w) >= 0; }); }) : []; bt.hidden = !ach.length; bt.innerHTML = ach.length ? '<h3 class="h3">Tênis</h3><div class="grid">' + ach.map(function (p) { return card(p); }).join('') + '</div>' : ''; }
    syncFavs();
  }
  function updateShop() { renderChips(); renderGrid(); renderTenisGrid(); renderGarimpo(); }
  /* ---------------- grade de tênis: numeração, preço, desconto e estilo ---------------- */
  var TG_PRECO = [['ate150', 'Até R$ 150', function (v) { return v <= 150; }], ['150a250', 'R$ 150 a 250', function (v) { return v > 150 && v <= 250; }], ['250', 'Acima de R$ 250', function (v) { return v > 250; }]];
  var TG_OFF = [['15', 'Com desconto'], ['40', '40% off ou mais']];
  function tgPassa(p, sem) {
    var f = ui.tg;
    if (sem !== 'tam' && f.tam && numeracoesBR(p).indexOf(+f.tam) < 0) return false;
    if (sem !== 'preco' && f.preco) { var pr = TG_PRECO.filter(function (x) { return x[0] === f.preco; })[0]; if (pr && (p.price == null || !pr[2](p.price))) return false; }
    if (sem !== 'off' && f.off && off(p) < +f.off) return false;
    if (sem !== 'estilo' && f.estilo && estilosDe(p).indexOf(f.estilo) < 0) return false;
    return true;
  }
  function renderTenisGrid() {
    var box = $('tg'); if (!box) return;
    var all = tenisLoja(); box.hidden = !all.length; if (!all.length) return;
    var f = ui.tg, conta = function (grupo, teste) { return all.filter(function (p) { return tgPassa(p, grupo) && teste(p); }).length; };
    var chip = function (grupo, val, label, n) { var on = String(f[grupo]) === String(val); return n || on ? '<button type="button" class="chip" data-tg="' + grupo + ':' + esc(val) + '" aria-pressed="' + on + '">' + esc(label) + ' <span class="mono">' + n + '</span></button>' : ''; };
    var tams = []; all.forEach(function (p) { numeracoesBR(p).forEach(function (b) { if (tams.indexOf(b) < 0) tams.push(b); }); }); tams.sort(function (a, b) { return a - b; });
    var temUK = all.some(function (p) { return sizesOf(p).some(function (s) { return /^uk/i.test(String(s).trim()); }); });
    var linha = function (rot, html) { return html ? '<div class="tg__l"><p class="tg__k mono">' + rot + '</p><div class="chips">' + html + '</div></div>' : ''; };
    $('tg-f').innerHTML =
      linha('Numeração BR', tams.map(function (b) { return chip('tam', b, String(b), conta('tam', function (p) { return numeracoesBR(p).indexOf(b) >= 0; })); }).join('')) +
      linha('Preço', TG_PRECO.map(function (x) { return chip('preco', x[0], x[1], conta('preco', function (p) { return p.price != null && x[2](p.price); })); }).join('')) +
      linha('Desconto', TG_OFF.map(function (x) { return chip('off', x[0], x[1], conta('off', function (p) { return off(p) >= +x[0]; })); }).join('')) +
      linha('Estilo', TG_ESTILOS.map(function (x) { return chip('estilo', x[0], x[1], conta('estilo', function (p) { return estilosDe(p).indexOf(x[0]) >= 0; })); }).join('')) +
      (f.tam || f.preco || f.off || f.estilo ? '<button type="button" class="link-btn" data-tg="limpa:">Limpar filtros</button>' : '') +
      (temUK ? '<p class="tg__nota muted">Alguns tênis vêm em numeração UK no anúncio: aqui a conversão para BR é aproximada. Antes de comprar, confira a tabela em centímetros do anúncio.</p>' : '');
    var list = all.filter(function (p) { return tgPassa(p); }), s = f.sort;
    list.sort(function (a, b) {
      if (s === 'low') return (a.price == null ? 1e9 : a.price) - (b.price == null ? 1e9 : b.price);
      if (s === 'off') return off(b) - off(a);
      if (s === 'rate') return ((b.stats && b.stats.rating) || 0) - ((a.stats && a.stats.rating) || 0);
      return off(b) - off(a) || ((b.stats && b.stats.rating) || 0) - ((a.stats && a.stats.rating) || 0);
    });
    $('tg-grid').innerHTML = list.length ? list.map(function (p) { return card(p); }).join('') : '<div class="empty"><p class="h3">Nenhum tênis com esses filtros</p><button type="button" class="btn btn--ghost" data-tg="limpa:">Limpar filtros</button></div>';
    Array.prototype.forEach.call($('tg-grid').querySelectorAll('img[data-full]'), function (im) { im.addEventListener('error', function () { im.removeAttribute('srcset'); if (im.src.indexOf(im.getAttribute('data-full')) < 0) im.src = im.getAttribute('data-full'); }, { once: true }); });
    $('tg-count').textContent = list.length + ' de ' + all.length + ' tênis';
    syncFavs();
  }
  /* garimpo da semana: 4 peças entre as de melhor nota e desconto, muda a cada edição */
  function renderGarimpo() {
    var el = $('gs-grid'); if (!el) return;
    var ed = String(edicao());
    var nota = function (p) { return ((p.stats && p.stats.rating) || 4) * 10 + off(p) * .4; };
    var fortes = shopList().filter(function (p) { return p.price != null; }).sort(function (a, b) { return nota(b) - nota(a); }).slice(0, 12).sort(function (a, b) { return hashStr(ed + a.id) - hashStr(ed + b.id); }).slice(0, 4);
    el.innerHTML = fortes.map(function (p) { return card(p); }).join('');
    syncFavs();
  }

  /* ---------------- ficha da peça ---------------- */
  /* tabela de referência: BR = EUR - 2 é a conversão mostrada nos anúncios da Shein; UK e cm variam por marca */
  var TAB_TENIS = [[33, 35, '2,5', 22], [34, 36, '3,5', 22.5], [35, 37, '4', 23], [36, 38, '5', 24], [37, 39, '5,5', 24.5], [38, 40, '6,5', 25], [39, 41, '7', 25.5], [40, 42, '8', 26.5], [41, 43, '9', 27], [42, 44, '9,5', 27.5], [43, 45, '10,5', 28.5], [44, 46, '11', 29]];
  function guiaHTML(p) {
    if (kindOf(p) === 'sneakers') return '<details class="guia"><summary>' + ico('ruler', 15) + ' Guia de tamanho</summary><p>Fique em pé sobre uma folha, marque o calcanhar e o dedo maior e meça em cm. Compare com a tabela. Entre dois números, fique com o maior.</p><table><thead><tr><th>BR</th><th>EUR</th><th>UK</th><th>Pé (cm)</th></tr></thead><tbody>' + TAB_TENIS.map(function (l) { return '<tr><td>' + l[0] + '</td><td>' + l[1] + '</td><td>' + l[2] + '</td><td>' + String(l[3]).replace('.', ',') + '</td></tr>'; }).join('') + '</tbody></table><p class="muted">Tabela de referência: cada marca varia um pouco. Confirme na tabela do anúncio antes de pagar.</p></details>';
    return '<details class="guia"><summary>' + ico('ruler', 15) + ' Guia de tamanho</summary><p>Pegue uma peça sua que veste bem, estenda numa mesa e meça:</p><ul><li><b>Largura:</b> de axila a axila (ou de um lado a outro da cintura, em calças e bermudas).</li><li><b>Comprimento:</b> do ombro à barra (ou da cintura à barra).</li></ul><p>Compare em cm com a tabela do anúncio. Streetwear costuma ter caimento largo: na dúvida entre dois, fique com o maior.</p></details>';
  }
  function caimentoHTML(p) {
    var c = p.caimento; if (!c || c.r == null) return '';
    return '<div class="caim"><p class="caim__t"><b>' + c.r + '%</b> dizem que veste no tamanho certo</p><i class="caim__b" style="--r:' + c.r + '%"></i><p class="caim__s mono">Pequeno ' + (c.p || 0) + '% · Grande ' + (c.g || 0) + '% · avaliações da loja</p></div>';
  }
  /* por que garimpamos: nota escrita pelo dono ou motivos que os dados comprovam */
  function curadoriaHTML(p) {
    var it = [], st = p.stats || {}, c = p.caimento;
    if (st.rating >= 4.6) it.push('Nota ' + String(Number(st.rating).toFixed(1)).replace('.', ',') + (st.reviews ? ' com ' + revLabel(st.reviews) + ' avaliações na loja' : ' na loja'));
    if (off(p) >= 15) it.push(off(p) + '% abaixo do preço de lista da loja');
    if (c && c.r >= 85) it.push('Veste no tamanho certo para ' + c.r + '% de quem comprou');
    if (!p.nota && !it.length) return '';
    return '<div class="cura"><p class="cura__t">Por que garimpamos</p>' + (p.nota ? '<p>' + esc(p.nota) + '</p>' : '') + (it.length ? '<ul>' + it.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '') + '</div>';
  }
  /* histórico: só aparece com pelo menos 2 leituras de preço de verdade */
  function historicoHTML(p) {
    var h0 = Array.isArray(p.hist) ? p.hist.filter(function (x) { return x && x.p > 0; }) : []; if (h0.length < 2 || p.price == null) return '';
    var menor = h0.reduce(function (a, b) { return b.p < a.p ? b : a; });
    if (p.price <= menor.p) return '<p class="hist mono">' + ico('tag', 14) + ' Menor preço que já vimos</p>';
    return '<p class="hist mono">' + ico('tag', 14) + ' Menor preço que vimos: ' + money(menor.p) + ' em ' + dayOf(menor.d) + '</p>';
  }
  var lastFocus = null;
  function openSheet(id) {
    var p = byId(id); if (!p) return;
    var sh = $('sheet'), photos = [];
    (p.photos && p.photos.length ? p.photos : [photoOf(p, 0), photoOf(p, 1)]).forEach(function (s) { if (s && photos.indexOf(s) < 0) photos.push(s); });
    var cut = cutOf(p), sz = sizesOf(p), mine = ui.sizes[p.id] || '';
    var reais = Array.isArray(p.fotoReal) ? p.fotoReal : [];
    var slides = (cut && photos.length < 3 ? [['cut', cut]] : []).concat(photos.map(function (s) { return ['ph', s]; }), reais.map(function (s) { return ['real', s]; }));
    sh.innerHTML =
      '<div class="sheet__bar"><div class="sheet__grab" data-close aria-hidden="true"></div><button type="button" class="sheet__x round round--sm" id="sh-x" data-close aria-label="Fechar">' + ico('close', 18) + '</button></div>' +
      '<div class="gal" id="gal" tabindex="0" aria-label="Fotos da peça">' + slides.map(function (s, i) { return '<figure class="gal__s gal__s--' + s[0] + '">' + imgTag(s[1], i ? '' : p.name, '', (i ? ' loading="lazy"' : '') + (s[0] === 'real' ? ' referrerpolicy="no-referrer"' : '')) + (s[0] === 'real' ? '<figcaption class="mono">Foto real do anúncio</figcaption>' : '') + '</figure>'; }).join('') + '</div>' +
      (slides.length > 1 ? '<div class="gal__dots" aria-hidden="true">' + slides.map(function (s, i) { return '<i' + (i ? '' : ' class="on"') + '></i>'; }).join('') + '</div>' : '') +
      (reais.length ? '<p class="gal__nota" id="gal-nota">Imagens ilustrativas. <button type="button" class="link-btn" data-real>Ver foto real do anúncio</button></p>' : '') +
      '<div class="sheet__body">' +
        '<div class="sheet__tags">' + seloHTML(p) + '<span class="eyebrow eyebrow--gold">' + esc(p.category || 'Peça') + '</span>' + (isHot(p) ? '<span class="hotb mono">Oferta</span>' : '') + '</div>' +
        '<h2 class="sheet__nm" id="sh-name">' + esc(p.name) + '</h2>' +
        (p.idShein ? '<p class="sheet__id mono">ID do produto <b>' + esc(p.idShein) + '</b> <button type="button" class="link-btn" data-copyid="' + esc(p.idShein) + '">Copiar</button></p>' : '') +
        (p.stats && p.stats.rating ? '<div class="rate">' + starsHTML(p) + statsHTML(p, true) + '</div>' : statsHTML(p, true)) +
        '<div class="info__price">' + (isSample(p) ? '<span class="price price--na">Exemplo · preço e link em breve</span>' : priceHTML(p, true)) + '</div>' +
        (!isSample(p) && (p.priceAt || p.createdAt) ? '<p class="info__seen mono">Preço visto ' + haDias(p.priceAt || p.createdAt) + ' (' + dayOf(p.priceAt || p.createdAt) + '). Confira no anúncio antes de pagar.' + (p.parcela ? ' Parcelas e juros finais aparecem no pagamento da loja.' : '') + '</p>' + historicoHTML(p) : '') +
        (sz.length ? '<div class="sizes"><p class="lbl">Tamanho <span class="mono" id="sz-pick">' + esc(mine || 'escolha') + '</span></p><div class="sizes__row" role="group" aria-label="Tamanhos">' + sz.map(function (s) { return '<button type="button" class="sz" data-size="' + esc(s) + '" data-for="' + p.id + '" aria-pressed="' + (mine === s) + '">' + esc(s) + '</button>'; }).join('') + '</div>' + caimentoHTML(p) + guiaHTML(p) + '</div>' : '') +
        curadoriaHTML(p) +
        '<div class="sheet__row2">' + (isSample(p) ? '' : '<button type="button" class="btn btn--ghost" data-cart-add="' + p.id + '">' + ico('cart', 18) + 'Adicionar ao carrinho</button><button type="button" class="btn btn--ghost" data-avise="' + p.id + '">' + ico('bell', 18) + 'Avise quando baixar</button>') +
        (canWear(p) ? '<button type="button" class="btn btn--ghost" data-try="' + p.id + '">Vestir no provador</button>' : '') + '</div>' +
        (PUB ? '<button type="button" class="link-btn" data-share="' + esc(p.id) + '">' + ico('external', 15) + ' Compartilhar esta peça</button>' : '') +
        comboHTML(p) +
        (ui.canEdit ? '<button type="button" class="link-btn" data-edit="' + p.id + '">Editar no painel</button>' : '') +
        '<p class="sheet__af">Link de afiliado: você paga o mesmo preço e a gente pode receber comissão da loja.</p>' +
      '</div>' +
      /* barra de compra: fica sempre visível enquanto a pessoa rola a ficha */
      '<div class="sheet__buy"><div class="sheet__buyp">' + (p.price != null ? '<b class="mono">' + money(p.price) + '</b>' + (off(p) ? '<small class="mono">-' + off(p) + '%</small>' : '') : '') + '</div>' +
        (p.link ? '<a class="btn btn--gold" href="' + esc(affLink(p)) + '" target="_blank" rel="noopener sponsored">Compre agora' + ico('external', 16) + '</a>' : '') +
        '<button type="button" class="round" data-fav="' + p.id + '" aria-pressed="' + isFav(p.id) + '">' + ico('heart', 20) + '</button></div>';
    ui.sheet = id; lastFocus = document.activeElement;
    var gal = $('gal');
    if (gal && slides.length > 1) gal.addEventListener('scroll', function () { var i = Math.round(gal.scrollLeft / Math.max(1, gal.clientWidth)); Array.prototype.forEach.call(sh.querySelectorAll('.gal__dots i'), function (d, k) { d.classList.toggle('on', k === i); }); }, { passive: true });
    showLayer(sh, closeSheet); sh.scrollTop = 0; requestAnimationFrame(function () { sh.scrollTop = 0; }); syncFavs();
    /* link próprio da peça, para compartilhar e voltar */
    if (PUB) { try { history.replaceState(history.state, '', '/p/' + encodeURIComponent(id) + '/'); } catch (e) { /* */ } }
    rastrear('ver', id);
    if (atende) atende.sinal('ficha', p);
    /* foto do anúncio que não abrir (ex.: bloqueada pelo navegador) some sem deixar buraco */
    Array.prototype.forEach.call(sh.querySelectorAll('.gal__s--real img'), function (im) { im.addEventListener('error', function () { var fg = im.closest('figure'); if (fg) fg.remove(); if (!sh.querySelector('.gal__s--real')) { var nt = $('gal-nota'); if (nt) nt.hidden = true; } }, { once: true }); });
    $('sh-x').focus({ preventScroll: true });
  }
  function closeSheet(fromPop) { if (!ui.sheet) return; ui.sheet = null; if (atende) atende.sinal('fecha'); hideLayer($('sheet'), fromPop === true); if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true }); }
  /* ---------------- camadas (ficha, carrinho, painel): uma pilha só ----------------
     Toda camada aberta entra na pilha e ganha uma entrada no histórico, então fecha pelo X,
     pelo Esc, tocando fora e pelo botão voltar do celular. Fechar sempre passa por closeLayer. */
  var layers = [], popSkip = 0;
  function layerOpen(el) { return layers.some(function (l) { return l.el === el; }); }
  function showLayer(el, onClose) {
    var sc = $('scrim');
    if (!layerOpen(el)) {
      layers.push({ el: el, close: onClose || function () { hideLayer(el); } });
      try { history.pushState({ gsLayer: layers.length }, ''); } catch (e) { /* sem histórico */ }
    }
    sc.hidden = false; el.hidden = false; document.documentElement.classList.add('is-locked');
    /* só acende se a camada ainda estiver aberta: um toque rápido no X antes do quadro seguinte não deixa ela presa na tela */
    var on = function () { if (!layerOpen(el)) return; sc.classList.add('is-on'); el.classList.add('is-on'); };
    requestAnimationFrame(function () { requestAnimationFrame(on); });
  }
  function hideLayer(el, fromPop) {
    var sc = $('scrim'), i = -1;
    layers.forEach(function (l, k) { if (l.el === el) i = k; });
    if (i >= 0) { layers.splice(i, 1); if (!fromPop) { popSkip++; try { history.back(); } catch (e) { popSkip--; } } }
    el.classList.remove('is-on'); el.style.transform = '';
    if (!layers.length) { sc.classList.remove('is-on'); document.documentElement.classList.remove('is-locked'); }
    setTimeout(function () { if (!el.classList.contains('is-on')) el.hidden = true; if (!sc.classList.contains('is-on')) sc.hidden = true; }, 420);
  }
  /* fecha a camada de cima (Esc, toque fora, voltar) ou a camada que contém o botão */
  function closeLayer(el, fromPop) {
    var l = null;
    if (el) layers.forEach(function (x) { if (x.el === el || x.el.contains(el)) l = x; });
    else l = layers[layers.length - 1];
    if (!l) return false;
    l.close(fromPop);
    return true;
  }
  window.addEventListener('popstate', function () {
    if (popSkip > 0) { popSkip--; return; }
    closeLayer(null, true);
  });

  /* animações CSS que repetem (brilho, chama, pulso, luz do provador) param quando a seção sai da tela:
     a classe is-fora congela tudo dentro dela (style.css) */
  function pausaFora() {
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (en) { en.forEach(function (e) { e.target.classList.toggle('is-fora', !e.isIntersecting); }); }, { rootMargin: '120px 0px' });
    Array.prototype.forEach.call(document.querySelectorAll('#conteudo > section'), function (s) { io.observe(s); });
  }
  /* ---------------- ofertas quentes ---------------- */
  /* seleção do dia: as que você marcar + um sorteio diário entre os maiores descontos. Troca de verdade à meia-noite. */
  function isHot(p) { return !!(p && (p.hot || hotList().some(function (x) { return x.id === p.id; }))); }
  var hotCache = null, HOT_N = 7;
  function dayKey() { var d = new Date(); return String(d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()); }
  function hotList() {
    if (hotCache) return hotCache;
    var vis = state.products.filter(function (p) { return !p.hidden && !isSample(p) && p.link; });
    /* os maiores descontos de verdade, sem sorteio; roupas e tênis em abas separadas */
    var doTipo = function (tenis) { var l = vis.filter(function (p) { return (kindOf(p) === 'sneakers') === tenis; }); return l.filter(function (p) { return p.hot; }).concat(l.filter(function (p) { return !p.hot && p.noHot !== true && off(p) >= 8; }).sort(function (a, b) { return off(b) - off(a); })).slice(0, HOT_N).sort(function (a, b) { return off(b) - off(a); }); };
    hotCache = doTipo(false).concat(doTipo(true));
    return hotCache;
  }
  function toMidnight() { var n = new Date(), m = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1); return m - n; }
  function demand(p) {
    var st = p.stats; if (!st || !st.reviews) return null;
    var r = String(st.reviews), n = parseFloat(r.replace(/[^\d.,]/g, '').replace(/\./g, '').replace(',', '.')) || 0;
    if (/k|mil/i.test(r)) n *= 1000;
    var v = n >= 1000 ? 96 : n >= 500 ? 84 : n >= 100 ? 66 : Math.max(16, Math.min(56, 16 + n));
    return { v: v, label: n >= 500 ? 'Muito procurado' : n >= 100 ? 'Procurado' : 'Procura', txt: revLabel(r) + ' avaliações na ' + (p.store || 'loja') };
  }
  function hotCard(p, feat, rank) {
    var o = off(p), img = feat ? (cutOf(p) || photoOf(p, 0)) : (thumbOf(p) || photoOf(p, 0)), save = p.oldPrice && p.price != null ? p.oldPrice - p.price : 0, dem = demand(p);
    var sz = sizesOf(p).slice(0, feat ? 8 : 5), seen = p.priceAt || p.createdAt;
    /* detalhes reais da oferta: posição no ranking do dia, loja, quando o preço foi visto e tamanhos */
    var info = '<ul class="hc__info mono">' + '<li>#' + rank + ' em desconto</li>' + (p.store ? '<li>' + esc(p.store) + '</li>' : '') + (seen ? '<li>Preço visto ' + haDias(seen) + '</li>' : '') + '</ul>';
    return '<article class="hc' + (feat ? ' hc--feat' : '') + '" data-id="' + esc(p.id) + '">' +
      '<div class="hc__media' + (cutOf(p) ? ' is-cut' : '') + '">' + (img ? '<img src="' + esc(img) + '"' + (feat ? '' : srcsetDe(p, '(min-width: 900px) 30vw, 48vw')) + ' alt="" loading="lazy" decoding="async">' : '') +
        
        '<span class="hc__selo">' + seloHTML(p) + '</span>' +
        (o ? '<p class="hc__off" aria-label="' + o + '% de desconto"><b>-' + o + '</b><span>%<small>off</small></span></p>' : '') +
        '<button type="button" class="hc__hit" data-open="' + esc(p.id) + '" aria-label="Ver ' + esc(p.name) + '"></button></div>' +
      '<div class="hc__body">' + info +
        '<h3 class="hc__nm">' + esc(p.name) + '</h3>' +
        '<p class="hc__pr mono">' + (p.oldPrice && o ? '<s>De ' + money(p.oldPrice) + '</s>' : '') + '<b>' + (p.priceFrom ? '<small>a partir de </small>' : '') + money(p.price) + '</b>' + parcelaHTML(p) + '</p>' +
        (save >= 1 ? '<p class="hc__save">Você economiza <b class="mono">' + money(save) + '</b></p>' : '') +
        (sz.length ? '<p class="hc__sz mono" aria-label="Tamanhos">' + sz.map(function (s) { return '<span>' + esc(s) + '</span>'; }).join('') + '</p>' : '') +
        (dem ? '<div class="hc__dem"><p class="mono"><span>' + ico('fire', 13) + dem.label + '</span><span>' + esc(dem.txt) + '</span></p><i style="--v:' + dem.v + '%"></i></div>' : '') +
        '<a class="btn btn--hot btn--wide btn--compre" href="' + esc(affLink(p)) + '" target="_blank" rel="noopener sponsored">Compre agora' + ico('arrow', 17) + '</a>' +
      '</div></article>';
  }
  function renderHot() {
    hotCache = null;
    var sec = $('ofertas'), feat = $('hot-feat'), grid = $('hot-grid'); if (!sec || !feat || !grid) return;
    var list = hotList(); sec.hidden = !list.length;
    Array.prototype.forEach.call(document.querySelectorAll('[data-nav="ofertas"]'), function (a) { a.hidden = !list.length; });
    var abas = $('hot-tabs'), temT = list.some(function (p) { return kindOf(p) === 'sneakers'; }), temR = list.some(function (p) { return kindOf(p) !== 'sneakers'; });
    if (!temR) ui.hotTab = 't'; if (!temT) ui.hotTab = 'r';
    if (abas) abas.innerHTML = temR && temT ? '<button type="button" class="chip" data-hot="r" aria-pressed="' + (ui.hotTab === 'r') + '">Roupas</button><button type="button" class="chip" data-hot="t" aria-pressed="' + (ui.hotTab === 't') + '">Tênis</button>' : '';
    list = list.filter(function (p) { return (kindOf(p) === 'sneakers') === (ui.hotTab === 't'); });
    feat.innerHTML = list[0] ? hotCard(list[0], true, 1) : '';
    grid.innerHTML = list.slice(1).map(function (p, i) { return hotCard(p, false, i + 2); }).join('');
  }
  var timerOn = false, timerId = 0, hotSeen = false;
  function tickTimers() {
    var el = $('hot-clock'); if (!el) return;
    var t = Math.max(0, Math.floor(toMidnight() / 1000)), v = [Math.floor(t / 3600), Math.floor(t / 60) % 60, t % 60], bs = el.querySelectorAll('b');
    for (var i = 0; i < 3; i++) { var s = pad2(v[i]); if (bs[i] && bs[i].textContent !== s) { bs[i].textContent = s; if (i === 2 && !REDUCED) { bs[i].classList.remove('tick'); void bs[i].offsetWidth; bs[i].classList.add('tick'); } } }
    if (t === 0) setTimeout(renderHot, 1500);
  }
  function startTimers() {
    /* o relógio só roda quando as ofertas estão na tela: não pesa no celular */
    tickTimers(); if (timerOn) return; timerOn = true;
    var sec = $('ofertas'); if (!sec) return;
    var run = function (on) { clearInterval(timerId); if (on && !document.hidden) { tickTimers(); timerId = setInterval(tickTimers, 1000); } };
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { hotSeen = en[0].isIntersecting; run(hotSeen); }).observe(sec);
    else run(true);
    document.addEventListener('visibilitychange', function () { run(!document.hidden && hotSeen); });
  }

  /* ---------------- combina com ---------------- */
  function comboHTML(p) {
    var k = kindOf(p), slot = k && KINDS[k] ? KINDS[k].slot : '';
    var want = slot === 'conjunto' ? { pes: 1 } : slot === 'top' ? { baixo: 1 } : slot === 'baixo' ? { top: 1 } : { top: 1, baixo: 1 };
    var list = state.products.filter(function (x) { if (x.id === p.id || x.hidden || isSample(x)) return false; var kk = kindOf(x); return kk && KINDS[kk] && want[KINDS[kk].slot]; })
      .sort(function (a, b) { return hashStr(a.id + p.id) - hashStr(b.id + p.id); }).slice(0, 6);
    if (!list.length) return '';
    return '<div class="combo"><p class="lbl">Combina com</p><div class="combo__row">' + list.map(function (x) {
      return '<button type="button" class="combo__it" data-open="' + x.id + '" aria-label="Ver ' + esc(x.name) + '"><span class="combo__th">' + imgTag(thumbOf(x) || photoOf(x, 0), '', '', ' loading="lazy"') + '</span><span class="combo__pr mono">' + (x.price != null ? money(x.price) : 'ver') + '</span></button>';
    }).join('') + '</div></div>';
  }

  /* ---------------- carrinho (fica só no aparelho do cliente) ---------------- */
  var cart = readLS('gs-cart', []).filter(function (c) { return c && byId(c.id); });
  function saveCart() { writeLS('gs-cart', cart); syncCart(); }
  function syncCart() { var n = $('cart-n'); if (n) n.textContent = String(cart.length); var b = $('cart-btn'); if (b) b.classList.toggle('has-items', cart.length > 0); }
  function addToCart(id, btn) {
    var p = byId(id); if (!p) return;
    var size = ui.sizes[id] || '';
    if (sizesOf(p).length && !size && ui.sheet === id) { var lb = $('sz-pick'); if (lb) { lb.textContent = 'escolha antes'; lb.classList.add('is-bad'); } toast('Escolha o tamanho e toque de novo.'); return; }
    if (!cart.some(function (c) { return c.id === id && c.size === size; })) cart.push({ id: id, size: size, at: Date.now() });
    saveCart();
    if (btn) { btn.classList.add('is-added'); setTimeout(function () { btn.classList.remove('is-added'); }, 900); }
    var cb = $('cart-btn'); if (cb && hasGsap && !REDUCED) gsap.fromTo(cb, { scale: 1.25 }, { scale: 1, duration: .5, ease: 'back.out(3)' });
    toast(p.name + ' no carrinho.');
  }
  function renderCart() {
    var el = $('cart'); if (!el) return;
    var items = cart.map(function (c, i) { return [c, byId(c.id), i]; }).filter(function (x) { return x[1]; });
    var total = items.reduce(function (a, x) { return x[1].price != null ? a + x[1].price : a; }, 0);
    el.innerHTML = '<div class="sheet__bar"><div class="sheet__grab" data-close aria-hidden="true"></div><button type="button" class="sheet__x round round--sm" id="cart-x" data-close aria-label="Fechar carrinho">' + ico('close', 18) + '</button></div>' +
      '<div class="sheet__body"><p class="eyebrow eyebrow--gold">' + ico('cart', 14) + ' Carrinho</p><h2 class="sheet__nm" id="cart-h">' + (items.length ? items.length + (items.length === 1 ? ' peça' : ' peças') : 'Vazio') + '</h2>' +
      (items.length ? '<ul class="cart__list">' + items.map(function (x) {
        var p = x[1];
        return '<li class="cart__it"><button type="button" class="cart__th" data-open="' + p.id + '" aria-label="Ver ' + esc(p.name) + '">' + imgTag(thumbOf(p) || photoOf(p, 0), '', '', ' loading="lazy"') + '</button>' +
          '<div class="cart__info"><b>' + esc(p.name) + '</b><small class="mono">' + [p.store, x[0].size ? 'Tam. ' + x[0].size : ''].filter(Boolean).map(esc).join(' · ') + '</small>' + priceHTML(p) +
          '<a class="mini mini--gold" href="' + esc(affLink(p)) + '" target="_blank" rel="noopener sponsored">Comprar na ' + esc(p.store || 'loja') + ico('external', 13) + '</a></div>' +
          '<button type="button" class="cart__rm round round--sm" data-cart-rm="' + x[2] + '" aria-label="Tirar do carrinho">' + ico('trash', 16) + '</button></li>';
      }).join('') + '</ul>' +
      '<p class="look__tot"><span>Total estimado</span><b class="mono">' + money(total) + '</b></p>' +
      '<p class="muted cart__note">Cada peça é paga na loja dela. Toque em <b>Comprar</b> em cada item: abre o anúncio oficial com o tamanho que você escolheu.</p>' +
      '<button type="button" class="link-btn" id="cart-clear">Esvaziar carrinho</button>'
      : '<p class="muted">Toque no carrinho de uma peça para guardar aqui e comprar depois.</p><a class="btn btn--gold" href="#vitrine" data-go="vitrine" id="cart-go">Ver vitrine</a>') +
      '</div>';
  }
  function openCart() { renderCart(); ui.cartOpen = true; lastFocus = document.activeElement; showLayer($('cart'), closeCart); setTimeout(function () { var x = $('cart-x'); if (x) x.focus({ preventScroll: true }); }, 40); }
  function closeCart(fromPop) { if (!ui.cartOpen) return; ui.cartOpen = false; hideLayer($('cart'), fromPop === true); if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true }); }

  /* ---------------- transição entre seções ---------------- */
  var NAMES = { inicio: 'Início', tenis: 'Tênis', ofertas: 'Ofertas', provador: 'Provador', vitrine: 'Vitrine' };
  var going = false;
  function go(id, then) {
    var target = $(id); if (!target || going) return;
    var y1 = Math.max(0, id === 'inicio' ? 0 : target.getBoundingClientRect().top + window.scrollY - ($('top').offsetHeight || 0) + 1);
    var jump = function () { window.scrollTo(0, y1); if (then) then(); };
    if (REDUCED || !hasGsap) { jump(); return; }
    /* viagem de câmera, sem cortina: a câmera se afasta, a página viaja até a seção e a câmera se aproxima de novo */
    going = true;
    var main = $('conteudo'), vig = $('cam-vig'), y0 = window.scrollY, dist = Math.abs(y1 - y0);
    var dur = gsap.utils.clamp(.75, 1.6, .55 + dist / 5000), wide = cam.wide();
    var pos = { y: y0 }, origin = function () { gsap.set(main, { transformOrigin: '50% ' + (window.scrollY + window.innerHeight / 2) + 'px' }); };
    origin();
    gsap.timeline({ onComplete: function () { going = false; gsap.set(main, { clearProps: 'transform,transformOrigin' }); if (then) then(); } })
      .to(main, { scale: wide ? .94 : .96, duration: dur * .38, ease: 'power2.inOut' }, 0)
      .to(vig, { autoAlpha: 1, duration: dur * .38, ease: 'power2.inOut' }, 0)
      .to(pos, { y: y1, duration: dur, ease: 'power3.inOut', onUpdate: function () { window.scrollTo(0, pos.y); origin(); } }, 0)
      .to(main, { scale: 1, duration: dur * .45, ease: 'power2.out' }, dur * .62)
      .to(vig, { autoAlpha: 0, duration: dur * .45, ease: 'power2.out' }, dur * .62);
  }

  /* ---------------- eventos ---------------- */
  function bind() {
    /* TODOS os botões de fechar passam por aqui, na fase de captura: nada por cima engole o toque */
    document.addEventListener('click', function (e) {
      var x = e.target.closest && e.target.closest('[data-close]');
      if (!x) return;
      e.preventDefault(); e.stopPropagation();
      closeLayer(x);
    }, true);
    document.addEventListener('click', function (e) {
      var ct = e.target.closest('[data-cart-add],[data-cart-rm],#cart-btn,#cart-clear');
      if (ct) {
        if (ct.id === 'cart-btn') { openCart(); return; }
        if (ct.id === 'cart-clear') { cart = []; saveCart(); renderCart(); return; }
        if (ct.hasAttribute('data-cart-add')) { addToCart(ct.getAttribute('data-cart-add'), ct); return; }
        if (ct.hasAttribute('data-cart-rm')) { cart.splice(+ct.getAttribute('data-cart-rm'), 1); saveCart(); renderCart(); return; }
      }
      var kb = e.target.closest('[data-krow],[data-row-try]');
      if (kb) {
        if (kb.hasAttribute('data-krow')) { var kr = $('kr'); if (kr) kr.scrollBy({ left: +kb.getAttribute('data-krow') * kr.clientWidth * .8, behavior: REDUCED ? 'auto' : 'smooth' }); return; }
        var rp = byId(kb.getAttribute('data-row-try')); if (!rp || !canWear(rp)) return;
        ui.outfit.pes = rp.id; ui.filled = ui.filled || {}; ui.filled.pes = 1; renderFit('pes');
        cam.punch(kb, 1.18); toast('Tênis no provador. Desce até o Monta o fit pra ver o outfit.');
        return;
      }
      var t = e.target.closest('[data-go],[data-open],[data-fav],[data-pick],[data-slot],[data-cat],[data-cat-go],[data-size],[data-try],[data-edit],[data-step],[data-face],[data-add],[data-avise],#b360,#hero-piece,#reset-f,#fav-btn');
      if (!t) return;
      if (t.id === 'b360') { open360(ui.outfit.pes); return; }
      if (t.hasAttribute('data-avise')) { if (atende) atende.avisar(byId(t.getAttribute('data-avise'))); return; }
      if (t.hasAttribute('data-add')) { pick(t.getAttribute('data-add'), t.getAttribute('data-id'), 1); return; }
      if (t.hasAttribute('data-go')) { e.preventDefault(); if (ui.cartOpen) closeCart(); go(t.getAttribute('data-go')); return; }
      if (t.id === 'hero-piece') { var hid = t.getAttribute('data-id'); if (hid) openSheet(hid); return; }
      if (t.hasAttribute('data-fav')) { toggleFav(t.getAttribute('data-fav')); if (ui.favOnly) renderGrid(); return; }
      if (t.hasAttribute('data-open')) { if (ui.cartOpen) closeCart(); openSheet(t.getAttribute('data-open')); return; }
      if (t.hasAttribute('data-try')) { tryOn(t.getAttribute('data-try')); return; }
      if (t.hasAttribute('data-edit')) { var eid = t.getAttribute('data-edit'); closeSheet(); openAdmin(eid); return; }
      if (t.hasAttribute('data-pick')) { pick(ui.slot, t.getAttribute('data-pick')); return; }
      if (t.hasAttribute('data-slot')) { ui.slot = t.getAttribute('data-slot'); renderRail(); renderThumbs(); renderFig(); renderInfo(); renderFitBar(); syncFavs(); var tb = $('tab-' + ui.slot); if (tb && t.classList.contains('rail__b')) tb.focus();
        if (t.classList.contains('acc__c')) { var th = $('thumbs'); if (th) th.scrollIntoView({ block: 'nearest', behavior: REDUCED ? 'auto' : 'smooth' }); }
        return; }
      if (t.hasAttribute('data-cat')) { ui.cat = t.getAttribute('data-cat'); updateShop(); return; }
      if (t.hasAttribute('data-size')) {
        if (atende && t.getAttribute('data-for')) atende.sinal('tamanho');
        var pid = t.getAttribute('data-for') || ui.outfit[ui.slot], s = t.getAttribute('data-size');
        ui.sizes[pid] = ui.sizes[pid] === s ? '' : s; writeLS('gs-sizes', ui.sizes);
        var box = t.closest('.sizes'); Array.prototype.forEach.call(box.querySelectorAll('.sz'), function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-size') === ui.sizes[pid] ? 'true' : 'false'); });
        var lb = box.querySelector('.lbl .mono'); if (lb) { if (box.classList.contains('sizes--sk')) cam.roll(lb, ui.sizes[pid] || 'escolha'); else lb.textContent = ui.sizes[pid] || 'escolha'; lb.classList.remove('is-bad'); }
        cam.punch(t, 1.1);
        return;
      }
      if (t.id === 'reset-f') { ui.cat = 'all'; ui.q = ''; ui.favOnly = false; $('q').value = ''; updateShop(); return; }
      if (t.hasAttribute('data-step')) { step(ui.slot, +t.getAttribute('data-step')); return; }
      if (t.hasAttribute('data-face')) { setFace(t.getAttribute('data-face') === 'back'); return; }
      if (t.hasAttribute('data-cat-go')) { if (t.getAttribute('data-cat-go') === 'Tênis') { go('tg'); return; } ui.cat = t.getAttribute('data-cat-go'); ui.q = ''; ui.favOnly = false; var qi = $('q'); if (qi) qi.value = ''; updateShop(); go('vitrine'); return; }
      if (t.id === 'fav-btn') { ui.favOnly = !ui.favOnly; updateShop(); if (ui.favOnly) go('vitrine'); return; }
    });
    $('scrim').addEventListener('click', function () { closeLayer(); });
    /* gavetas de baixo (ficha e carrinho): arrastar o topo para baixo fecha, como no iPhone */
    ['sheet', 'cart'].forEach(function (id) {
      var sh = $(id), y0 = null, dy = 0;
      sh.addEventListener('touchstart', function (e) { if (sh.scrollTop > 0 || !e.touches[0] || e.target.closest('[data-close]')) { y0 = null; return; } y0 = e.touches[0].clientY; dy = 0; }, { passive: true });
      sh.addEventListener('touchmove', function (e) { if (y0 === null) return; dy = e.touches[0].clientY - y0; if (dy > 0 && sh.scrollTop <= 0) { sh.style.transition = 'none'; sh.style.transform = 'translateY(' + dy + 'px)'; } }, { passive: true });
      sh.addEventListener('touchend', function () { if (y0 === null) return; sh.style.transition = ''; sh.style.transform = ''; if (dy > 90) closeLayer(sh); y0 = null; dy = 0; });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && layers.length) { e.preventDefault(); closeLayer(); }
      if ((e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') && e.target.closest && e.target.closest('#rail')) {
        var tabs = Array.prototype.slice.call(document.querySelectorAll('#rail .rail__b')), i = tabs.indexOf(e.target); if (i < 0) return;
        e.preventDefault(); var n = tabs[(i + (e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length]; n.click(); n.focus();
      }
    });
    var qt = 0; $('q').addEventListener('input', function (e) { clearTimeout(qt); qt = setTimeout(function () { ui.q = e.target.value; renderGrid(); }, 160); });
    $('sort').addEventListener('change', function (e) { ui.sort = e.target.value; renderGrid(); });
    $('tg-sort').addEventListener('change', function (e) { ui.tg.sort = e.target.value; renderTenisGrid(); });
    document.addEventListener('change', function (e) {
      var id = e.target && e.target.id;
      if (id === 'tam-r') { ui.tamR = e.target.value; writeLS('gs-tam-r', ui.tamR); renderGrid(); }
    });
    /* conta os cliques para a loja (sem dado pessoal) */
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[rel~="sponsored"]'); if (!a) return;
      if (atende) atende.sinal('compra');
      var bl = a.closest('[data-id]'); rastrear('compra', (bl && bl.getAttribute('data-id')) || ui.sheet || anaId || '');
    }, true);
    document.addEventListener('click', function (e) {
      var tg = e.target.closest && e.target.closest('[data-tg]');
      if (tg) {
        var kv = tg.getAttribute('data-tg').split(':'), g = kv[0], v = kv.slice(1).join(':');
        if (g === 'limpa') ui.tg = { tam: '', preco: '', off: '', estilo: '', sort: ui.tg.sort };
        else ui.tg[g] = String(ui.tg[g]) === v ? '' : v;
        writeLS('gs-tam-t', ui.tg.tam);
        renderTenisGrid();
        var nb = document.querySelector('[data-tg="' + tg.getAttribute('data-tg') + '"]'); if (nb && g !== 'limpa') nb.focus({ preventScroll: true });
        return;
      }
      var t = e.target.closest && e.target.closest('[data-hot],[data-real],[data-share],[data-copyid],[data-flip]'); if (!t) return;
      if (t.hasAttribute('data-flip')) { viraCard(t); return; }
      if (t.hasAttribute('data-copyid')) { var cid = t.getAttribute('data-copyid'); if (navigator.clipboard) navigator.clipboard.writeText(cid).then(function () { toast('ID ' + cid + ' copiado.'); }, function () { toast('ID: ' + cid); }); else toast('ID: ' + cid); return; }
      if (t.hasAttribute('data-hot')) { ui.hotTab = t.getAttribute('data-hot'); renderHot(); return; }
      if (t.hasAttribute('data-real')) { var g = $('gal'), r = g && g.querySelector('.gal__s--real'); if (r) g.scrollTo({ left: r.offsetLeft - g.offsetLeft, behavior: REDUCED ? 'auto' : 'smooth' }); return; }
      var pc = byId(t.getAttribute('data-share')), url = location.origin + '/p/' + encodeURIComponent(t.getAttribute('data-share')) + '/';
      if (navigator.share) { navigator.share({ title: pc ? pc.name : document.title, url: url }).catch(function () { /* cancelou */ }); }
      else if (navigator.clipboard) navigator.clipboard.writeText(url).then(function () { toast('Link copiado.'); });
    });
    bindStage(); bindNavSpy();
    var rnd = $('fit-rnd'); if (rnd) rnd.addEventListener('click', lookAleatorio);
  }

  /* ---------------- movimento (GSAP) ---------------- */
  var mm = null;
  function initMotion() {
    if (!hasGsap) return;
    if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
    mm = gsap.matchMedia();
    mm.add({ ok: '(prefers-reduced-motion: no-preference)', wide: '(min-width: 900px)' }, function (ctx) {
      if (!ctx.conditions.ok || !window.ScrollTrigger) return;
      document.documentElement.classList.add('has-motion');
      /* base de câmera: barra de progresso, topo que some ao descer, granulado, skew de velocidade e botões magnéticos */
      cam.progress($('progress'));
      cam.autoHide($('top'));
      /* apresentação: ao rolar, as linhas do título se afastam para os lados e o resto sobe e some */
      var w0 = ctx.conditions.wide;
      gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '#inicio', start: 'top top', end: 'bottom top', scrub: .6 } })
        .to('.apr__l:nth-child(1)', { xPercent: w0 ? -22 : -14 }, 0)
        .to('.apr__l:nth-child(2)', { xPercent: w0 ? 16 : 10 }, 0)
        .to('.apr__l:nth-child(3)', { xPercent: w0 ? -10 : -6 }, 0)
        .to('.apr__h', { autoAlpha: 0, scale: .94, transformOrigin: '0% 50%' }, .35)
        .to('.apr__tenis img', { yPercent: -12, rotation: -5 }, 0)
        .to('.apr__k, .apr__sub, .apr__cta, .apr__down', { y: -50, autoAlpha: 0, stagger: .04 }, 0);
      /* o anel de tênis monta quando chega na tela */
      var ringIntro = ring && ring.entrar(true);
      if (ringIntro) ScrollTrigger.create({ trigger: '#tenis', start: 'top 70%', once: true, onEnter: function () { ringIntro.play(); } });
      return function () { document.documentElement.classList.remove('has-motion'); };
    });
  }
  var cardsSeen = new WeakSet();
  /* os cards aparecem direto: animar 40 cards ao rolar era um dos motivos das travadas */
  function revealCards() { if (window.ScrollTrigger) ScrollTrigger.refresh(); }

  /* ---------------- menu fixo: marca a seção em que a pessoa está ---------------- */
  function bindNavSpy() {
    if (!('IntersectionObserver' in window)) return;
    var cur = '';
    var set = function (id) {
      if (id === cur) return; cur = id;
      Array.prototype.forEach.call(document.querySelectorAll('[data-nav]'), function (a) { if (a.getAttribute('data-nav') === id) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
    };
    var io = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) set(e.target.id === 'inicio' ? '' : e.target.id); }); }, { rootMargin: '-45% 0px -50% 0px' });
    ['inicio', 'tenis', 'vitrine', 'provador', 'ofertas'].forEach(function (id) { var el = $(id); if (el) io.observe(el); });
  }

  /* ---------------- abertura: palavras fortes batem em sequência e a tela se abre ao meio (até 2 s, toda visita) ---------------- */
  function runIntro(done) {
    if (REDUCED || !hasGsap || readLS('gs-abertura', 0) || location.pathname.indexOf('/p/') === 0) { done(); return; }
    writeLS('gs-abertura', 1);
    var ov = document.createElement('div'); ov.className = 'abre'; ov.setAttribute('aria-hidden', 'true');
    var w = function (t, cls) { return '<p class="abre__w' + (cls ? ' ' + cls : '') + '">' + t + '</p>'; };
    ov.innerHTML = '<div class="abre__half abre__half--t"></div><div class="abre__half abre__half--b"></div>' +
      '<div class="abre__in">' + w('Achou.') + w('Garantiu.') +
        '<p class="abre__w abre__w--wm">' + brand().a.split('').map(function (ch) { return '<span>' + esc(ch) + '</span>'; }).join('') + '</p>' +
        '<i class="abre__risco"></i><i class="abre__faixa"></i></div>';
    document.body.appendChild(ov);
    var ws = ov.querySelectorAll('.abre__w'), risco = ov.querySelector('.abre__risco'), letras = ws[2].querySelectorAll('span');
    var tl = gsap.timeline({ onComplete: function () { ov.remove(); } });
    ov.addEventListener('click', function () { tl.progress(1); });
    /* cada palavra entra com um soco (grande → normal), segura e é cortada seca pela próxima */
    var bate = function (el, t) {
      tl.fromTo(el, { autoAlpha: 0, scale: 1.35, letterSpacing: '.08em' }, { autoAlpha: 1, scale: 1, letterSpacing: '-.02em', duration: .2, ease: 'expo.out' }, t)
        .fromTo(risco, { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1, duration: .16, ease: 'power3.out' }, t + .02)
        .set(risco, { scaleX: 0 }, t + .2);
    };
    bate(ws[0], 0);
    tl.set(ws[0], { autoAlpha: 0 }, .36);
    bate(ws[1], .36);
    tl.set(ws[1], { autoAlpha: 0 }, .72)
      .set(ws[2], { autoAlpha: 1 }, .72)
      .from(letras, { yPercent: 105, duration: .38, stagger: .025, ease: 'expo.out' }, .72)
      .fromTo(ov.querySelector('.abre__faixa'), { xPercent: -101 }, { xPercent: 101, duration: .42, ease: 'power3.inOut' }, 1.02)
      .to(ov.querySelector('.abre__in'), { scale: 1.08, autoAlpha: 0, duration: .26, ease: 'power2.in' }, 1.36)
      .add(function () { done(); }, 1.42)
      .to(ov.querySelector('.abre__half--t'), { yPercent: -101, duration: .5, ease: 'expo.inOut' }, 1.42)
      .to(ov.querySelector('.abre__half--b'), { yPercent: 101, duration: .5, ease: 'expo.inOut' }, 1.42);
  }
  function heroEntrance() {
    if (!hasGsap || REDUCED) return;
    /* apresentação: as linhas do título sobem, depois o apoio, os botões e os números contam */
    gsap.from('.apr__l > span', { yPercent: 110, duration: 1, ease: 'expo.out', stagger: .08 });
    gsap.from('.apr__tenis', { xPercent: 16, autoAlpha: 0, duration: 1.1, ease: 'expo.out', delay: .15 });
    gsap.from('.apr__k, .apr__sub, .apr__cta, .apr__down', { y: 24, autoAlpha: 0, duration: .8, ease: 'expo.out', stagger: .07, delay: .25 });
    gsap.from('.dock', { yPercent: 120, duration: .8, ease: 'expo.out', delay: .5 });
  }

  function loadImage(src) {
    return new Promise(function (resolve, reject) {
      var im = new Image(), url = null;
      if (typeof src !== 'string') { url = URL.createObjectURL(src); src = url; }
      im.onload = function () { if (url) URL.revokeObjectURL(url); resolve(im); };
      im.onerror = function () { if (url) URL.revokeObjectURL(url); reject(new Error('decode')); };
      im.src = src;
    });
  }
  /* ---- recorte com IA no próprio aparelho (modelo ISNet, ~45 MB, baixa uma vez e fica guardado) ---- */
  var ORT_V = '1.20.1', ORT_CDN = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@' + ORT_V + '/dist/';
  var ML_PARTS = ['ml/isnet-q8-0.wasm', 'ml/isnet-q8-1.wasm', 'ml/isnet-q8-2.wasm', 'ml/isnet-q8-3.wasm'], ML_SIZE = 46734856, ML_CACHE = 'gs-ml-isnet-v1';
  var mlState = { sess: null, loading: null };
  function loadScriptOnce(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement('script'); s.src = src; s.async = true; s.crossOrigin = 'anonymous';
      s.onload = function () { res(); }; s.onerror = function () { rej(new Error('script')); }; document.head.appendChild(s);
    });
  }
  async function mlFetchModel(onProg) {
    var cache = null; try { cache = await caches.open(ML_CACHE); } catch (e) { cache = null; }
    var bufs = [], got = 0;
    for (var i = 0; i < ML_PARTS.length; i++) {
      var r = null;
      if (cache) { try { r = await cache.match(ML_PARTS[i]); } catch (e) { r = null; } }
      if (!r) {
        r = await fetch(ML_PARTS[i]); if (!r.ok) throw new Error('model ' + r.status);
        if (cache) { try { await cache.put(ML_PARTS[i], r.clone()); } catch (e) { /* sem espaço: segue sem guardar */ } }
      }
      var b = new Uint8Array(await r.arrayBuffer()); bufs.push(b); got += b.length;
      if (onProg) onProg(Math.min(99, Math.round(got * 100 / ML_SIZE)));
    }
    var all = new Uint8Array(got), off = 0; bufs.forEach(function (b) { all.set(b, off); off += b.length; });
    return all;
  }
  function mlSession(onProg) {
    if (mlState.sess) return Promise.resolve(mlState.sess);
    if (mlState.loading) return mlState.loading;
    mlState.loading = (async function () {
      if (!window.ort) await loadScriptOnce(ORT_CDN + 'ort.min.js');
      var ort = window.ort; ort.env.wasm.wasmPaths = ORT_CDN;
      var wr = null, wc = null; try { wc = await caches.open(ML_CACHE); wr = await wc.match('ml/ort-wasm-simd-threaded.wasm'); } catch (e) { wr = null; }
      if (!wr) { wr = await fetch('ml/ort-wasm-simd-threaded.wasm'); if (!wr.ok) throw new Error('wasm ' + wr.status); if (wc) { try { await wc.put('ml/ort-wasm-simd-threaded.wasm', wr.clone()); } catch (e) { /* */ } } }
      ort.env.wasm.wasmBinary = await wr.arrayBuffer();
      ort.env.wasm.numThreads = self.crossOriginIsolated ? Math.min(4, navigator.hardwareConcurrency || 2) : 1;
      var model = await mlFetchModel(onProg);
      var sess = await ort.InferenceSession.create(model, { executionProviders: ['wasm'], graphOptimizationLevel: 'all' });
      mlState.sess = sess; return sess;
    })();
    mlState.loading.catch(function () { mlState.loading = null; });
    return mlState.loading;
  }
  async function mlCutout(im, onProg) {
    var sess = await mlSession(onProg), ort = window.ort, S = 1024;
    if (onProg) onProg(100);
    var inC = document.createElement('canvas'); inC.width = S; inC.height = S;
    var ix = inC.getContext('2d', { willReadFrequently: true }); ix.imageSmoothingQuality = 'high'; ix.drawImage(im, 0, 0, S, S);
    var px = ix.getImageData(0, 0, S, S).data, N = S * S, inp = new Float32Array(3 * N);
    for (var i = 0; i < N; i++) { inp[i] = px[i * 4] / 255 - .5; inp[N + i] = px[i * 4 + 1] / 255 - .5; inp[2 * N + i] = px[i * 4 + 2] / 255 - .5; }
    await new Promise(function (r) { setTimeout(r, 30); });
    var feeds = {}; feeds[sess.inputNames[0]] = new ort.Tensor('float32', inp, [1, 3, S, S]);
    var res = await sess.run(feeds), out = res[sess.outputNames[0]].data;
    var mn = 1e9, mx = -1e9; for (i = 0; i < N; i++) { if (out[i] < mn) mn = out[i]; if (out[i] > mx) mx = out[i]; }
    var rg = Math.max(1e-8, mx - mn), mC = document.createElement('canvas'); mC.width = S; mC.height = S;
    var mx2 = mC.getContext('2d'), md = mx2.createImageData(S, S);
    for (i = 0; i < N; i++) { var v = Math.round((out[i] - mn) / rg * 255); md.data[i * 4] = md.data[i * 4 + 1] = md.data[i * 4 + 2] = 255; md.data[i * 4 + 3] = v; }
    mx2.putImageData(md, 0, 0);
    /* máscara na resolução da foto */
    var c = workCanvas(im, 1400), w = c.width, H = c.height, n = w * H;
    var sC = document.createElement('canvas'); sC.width = w; sC.height = H; var sx = sC.getContext('2d', { willReadFrequently: true });
    sx.imageSmoothingQuality = 'high'; sx.drawImage(mC, 0, 0, w, H);
    var al = sx.getImageData(0, 0, w, H).data, a = new Uint8Array(n); for (i = 0; i < n; i++) a[i] = al[i * 4 + 3];
    /* tira manchas soltas: fica a peça e pedaços grandes dela */
    var hard = new Uint8Array(n); for (i = 0; i < n; i++) hard[i] = a[i] > 127 ? 1 : 0;
    var lab = new Int32Array(n), q = new Int32Array(n), sizes = [0], L = 0;
    for (i = 0; i < n; i++) {
      if (!hard[i] || lab[i]) continue; L++; var qh = 0, qt = 0; q[qt++] = i; lab[i] = L;
      while (qh < qt) { var u = q[qh++], ux = u % w; var nb0 = ux > 0 ? u - 1 : -1, nb1 = ux < w - 1 ? u + 1 : -1, nb2 = u - w, nb3 = u + w;
        if (nb0 >= 0 && hard[nb0] && !lab[nb0]) { lab[nb0] = L; q[qt++] = nb0; } if (nb1 >= 0 && hard[nb1] && !lab[nb1]) { lab[nb1] = L; q[qt++] = nb1; }
        if (nb2 >= 0 && hard[nb2] && !lab[nb2]) { lab[nb2] = L; q[qt++] = nb2; } if (nb3 < n && hard[nb3] && !lab[nb3]) { lab[nb3] = L; q[qt++] = nb3; } }
      sizes.push(qt);
    }
    if (L === 0) return null;
    var big = Math.max.apply(null, sizes); if (big < n * 0.02) return null;
    var keep = new Uint8Array(n); for (i = 0; i < n; i++) keep[i] = lab[i] && sizes[lab[i]] > big * 0.05 ? 1 : 0;
    keep = morph(morph(keep, w, H, true), w, H, true);
    var x = c.getContext('2d', { willReadFrequently: true }), id = x.getImageData(0, 0, w, H), d = id.data;
    var minX = w, minY = H, maxX = -1, maxY = -1;
    for (i = 0; i < n; i++) {
      var av = keep[i] ? a[i] : 0; d[i * 4 + 3] = av;
      if (av > 10) { var kx = i % w, ky = (i / w) | 0; if (kx < minX) minX = kx; if (kx > maxX) maxX = kx; if (ky < minY) minY = ky; if (ky > maxY) maxY = ky; }
    }
    if (maxX <= minX || maxY <= minY) return null;
    x.putImageData(id, 0, 0);
    var cw = maxX - minX + 1, ch = maxY - minY + 1, sc = Math.min(1, 800 / Math.max(cw, ch));
    var o = document.createElement('canvas'); o.width = Math.max(1, Math.round(cw * sc)); o.height = Math.max(1, Math.round(ch * sc));
    var ox = o.getContext('2d'); ox.imageSmoothingQuality = 'high'; ox.drawImage(c, minX, minY, cw, ch, 0, 0, o.width, o.height);
    return o;
  }
  /* recorte automático: separa a peça do fundo liso (cresce o fundo a partir das bordas) */
  function autoCutout(im) {
    var max = 900, r = Math.min(1, max / Math.max(im.naturalWidth, im.naturalHeight));
    var w = Math.max(1, Math.round(im.naturalWidth * r)), H = Math.max(1, Math.round(im.naturalHeight * r));
    var c = document.createElement('canvas'); c.width = w; c.height = H; var x = c.getContext('2d', { willReadFrequently: true });
    x.drawImage(im, 0, 0, w, H);
    var id = x.getImageData(0, 0, w, H), d = id.data, n = w * H;
    /* cor média do fundo em 16 trechos da borda */
    var segs = [], S = 16;
    function seg(i) { var px = i % w, py = (i / w) | 0; var t = (px + py) / (w + H); return Math.min(S - 1, (t * S) | 0); }
    for (var s = 0; s < S; s++) segs.push([0, 0, 0, 0]);
    function addB(i) { var k = seg(i), p = i * 4; segs[k][0] += d[p]; segs[k][1] += d[p + 1]; segs[k][2] += d[p + 2]; segs[k][3]++; }
    for (var xx = 0; xx < w; xx++) { addB(xx); addB((H - 1) * w + xx); }
    for (var yy = 0; yy < H; yy++) { addB(yy * w); addB(yy * w + w - 1); }
    var bgs = segs.filter(function (q) { return q[3]; }).map(function (q) { return [q[0] / q[3], q[1] / q[3], q[2] / q[3]]; });
    function bgDist(p) { var best = 1e9; for (var j = 0; j < bgs.length; j++) { var a = d[p] - bgs[j][0], b = d[p + 1] - bgs[j][1], cc = d[p + 2] - bgs[j][2]; var v = a * a + b * b + cc * cc; if (v < best) best = v; } return Math.sqrt(best); }
    /* textura do fundo: desvio médio na borda define a tolerância */
    var dev = 0, cnt = 0; for (xx = 0; xx < w; xx += 3) { dev += bgDist(xx * 4) + bgDist(((H - 1) * w + xx) * 4); cnt += 2; }
    var T = Math.max(26, Math.min(70, (dev / Math.max(1, cnt)) * 2.6 + 18));
    var bg = new Uint8Array(n), q = new Int32Array(n), qh = 0, qt = 0;
    /* suaviza para o fundo com textura (concreto, tecido) não virar "peça" */
    var sm = new Float32Array(n * 3);
    for (var yb = 0; yb < H; yb++) for (var xb = 0; xb < w; xb++) {
      var sr = 0, sg = 0, sb = 0, sc2 = 0;
      for (var ry = -2; ry <= 2; ry++) for (var rx = -2; rx <= 2; rx++) { var tx = xb + rx, ty = yb + ry; if (tx >= 0 && ty >= 0 && tx < w && ty < H) { var tp = (ty * w + tx) * 4; sr += d[tp]; sg += d[tp + 1]; sb += d[tp + 2]; sc2++; } }
      var si = (yb * w + xb) * 3; sm[si] = sr / sc2; sm[si + 1] = sg / sc2; sm[si + 2] = sb / sc2;
    }
    function smBg(i) { var p = i * 3, bst = 1e9; for (var j = 0; j < bgs.length; j++) { var a = sm[p] - bgs[j][0], b = sm[p + 1] - bgs[j][1], cc = sm[p + 2] - bgs[j][2]; var v = a * a + b * b + cc * cc; if (v < bst) bst = v; } return Math.sqrt(bst); }
    function step(i, f) { var a = sm[i * 3] - sm[f * 3], b = sm[i * 3 + 1] - sm[f * 3 + 1], cc = sm[i * 3 + 2] - sm[f * 3 + 2]; return Math.sqrt(a * a + b * b + cc * cc); }
    function push(i, f) { if (bg[i]) return; if (smBg(i) < T || (f >= 0 && step(i, f) < 3 && smBg(i) < T * 1.4)) { bg[i] = 1; q[qt++] = i; } }
    for (xx = 0; xx < w; xx++) { push(xx, -1); push((H - 1) * w + xx, -1); }
    for (yy = 0; yy < H; yy++) { push(yy * w, -1); push(yy * w + w - 1, -1); }
    while (qh < qt) { var i = q[qh++], px = i % w; if (px > 0) push(i - 1, i); if (px < w - 1) push(i + 1, i); if (i >= w) push(i - w, i); if (i < n - w) push(i + w, i); }
    /* maior bloco da peça + preenche furos pequenos */
    var lab = new Int32Array(n), best = 0, bestSize = 0, L = 0;
    for (var k = 0; k < n; k++) {
      if (bg[k] || lab[k]) continue; L++; var sz = 0; qh = 0; qt = 0; q[qt++] = k; lab[k] = L;
      while (qh < qt) { var j = q[qh++]; sz++; var jx = j % w; var nb = [jx > 0 ? j - 1 : -1, jx < w - 1 ? j + 1 : -1, j - w, j + w]; for (var z = 0; z < 4; z++) { var m = nb[z]; if (m >= 0 && m < n && !bg[m] && !lab[m]) { lab[m] = L; q[qt++] = m; } } }
      if (sz > bestSize) { bestSize = sz; best = L; }
    }
    if (!best || bestSize < n * 0.03) return null;
    var fg = new Uint8Array(n); for (k = 0; k < n; k++) fg[k] = lab[k] === best ? 1 : 0;
    var seen = new Uint8Array(n);
    for (k = 0; k < n; k++) {
      if (fg[k] || seen[k]) continue; qh = 0; qt = 0; q[qt++] = k; seen[k] = 1; var edge = false;
      while (qh < qt) { var u = q[qh++], ux = u % w, uy = (u / w) | 0; if (ux === 0 || uy === 0 || ux === w - 1 || uy === H - 1) edge = true; var nn = [ux > 0 ? u - 1 : -1, ux < w - 1 ? u + 1 : -1, u - w, u + w]; for (z = 0; z < 4; z++) { var v2 = nn[z]; if (v2 >= 0 && v2 < n && !fg[v2] && !seen[v2]) { seen[v2] = 1; q[qt++] = v2; } } }
      if (!edge && qt < n * 0.004) for (z = 0; z < qt; z++) fg[q[z]] = 1;
    }
    /* borda suave e corte rente */
    var minX = w, minY = H, maxX = 0, maxY = 0;
    for (k = 0; k < n; k++) {
      var kx = k % w, ky = (k / w) | 0, a = 0, c9 = 0;
      for (var oy = -1; oy <= 1; oy++) for (var ox = -1; ox <= 1; ox++) { var sx = kx + ox, sy = ky + oy; if (sx >= 0 && sy >= 0 && sx < w && sy < H) { a += fg[sy * w + sx]; c9++; } }
      d[k * 4 + 3] = Math.round(255 * a / c9);
      if (fg[k]) { if (kx < minX) minX = kx; if (kx > maxX) maxX = kx; if (ky < minY) minY = ky; if (ky > maxY) maxY = ky; }
    }
    x.putImageData(id, 0, 0);
    var cw = maxX - minX + 1, ch = maxY - minY + 1, sc = Math.min(1, 800 / Math.max(cw, ch));
    var o = document.createElement('canvas'); o.width = Math.max(1, Math.round(cw * sc)); o.height = Math.max(1, Math.round(ch * sc));
    o.getContext('2d').drawImage(c, minX, minY, cw, ch, 0, 0, o.width, o.height);
    return o;
  }
  /* ---- recorte com contorno do Claude: grade numerada -> polígono -> borda refinada pela cor ---- */
  function workCanvas(im, max) {
    var r = Math.min(1, max / Math.max(im.naturalWidth, im.naturalHeight));
    var c = document.createElement('canvas'); c.width = Math.max(1, Math.round(im.naturalWidth * r)); c.height = Math.max(1, Math.round(im.naturalHeight * r));
    c.getContext('2d', { willReadFrequently: true }).drawImage(im, 0, 0, c.width, c.height); return c;
  }
  function gridBlob(c) {
    var g = document.createElement('canvas'); g.width = c.width; g.height = c.height; var x = g.getContext('2d');
    x.drawImage(c, 0, 0); x.lineWidth = 1; x.font = 'bold 13px sans-serif';
    for (var gx = 0; gx <= c.width; gx += 50) { x.strokeStyle = gx % 100 ? 'rgba(255,230,0,.35)' : 'rgba(255,230,0,.85)'; x.beginPath(); x.moveTo(gx + .5, 0); x.lineTo(gx + .5, c.height); x.stroke(); if (!(gx % 100)) { x.fillStyle = '#ff0'; x.strokeStyle = '#000'; x.lineWidth = 3; x.strokeText(String(gx), gx + 3, 14); x.fillText(String(gx), gx + 3, 14); x.lineWidth = 1; } }
    for (var gy = 0; gy <= c.height; gy += 50) { x.strokeStyle = gy % 100 ? 'rgba(255,230,0,.35)' : 'rgba(255,230,0,.85)'; x.beginPath(); x.moveTo(0, gy + .5); x.lineTo(c.width, gy + .5); x.stroke(); if (!(gy % 100) && gy) { x.fillStyle = '#ff0'; x.strokeStyle = '#000'; x.lineWidth = 3; x.strokeText(String(gy), 3, gy - 3); x.fillText(String(gy), 3, gy - 3); x.lineWidth = 1; } }
    return new Promise(function (res, rej) { g.toBlob(function (b) { b ? res(b) : rej(new Error('blob')); }, 'image/jpeg', .9); });
  }
  function polyMask(w, H, outline, holes) {
    var c = document.createElement('canvas'); c.width = w; c.height = H; var x = c.getContext('2d');
    function path(pts) { x.beginPath(); pts.forEach(function (p, i) { var px = +p[0], py = +p[1]; if (i) x.lineTo(px, py); else x.moveTo(px, py); }); x.closePath(); x.fill(); }
    x.fillStyle = '#fff'; path(outline);
    x.globalCompositeOperation = 'destination-out'; (holes || []).forEach(function (hp) { if (Array.isArray(hp) && hp.length > 2) path(hp); });
    var d = x.getImageData(0, 0, w, H).data, m = new Uint8Array(w * H); for (var i = 0; i < m.length; i++) m[i] = d[i * 4 + 3] > 127 ? 1 : 0; return m;
  }
  function morph(m, w, H, grow) {
    var o = new Uint8Array(m.length);
    for (var y = 0; y < H; y++) for (var x = 0; x < w; x++) {
      var i = y * w + x, v = m[i];
      if (grow ? !v : v) { var hit = false; for (var oy = -1; oy <= 1 && !hit; oy++) for (var ox = -1; ox <= 1; ox++) { var sx = x + ox, sy = y + oy; if (sx < 0 || sy < 0 || sx >= w || sy >= H) { if (!grow) { hit = true; break; } continue; } if (grow ? m[sy * w + sx] : !m[sy * w + sx]) { hit = true; break; } } o[i] = grow ? (hit ? 1 : 0) : (hit ? 0 : 1); } else o[i] = v;
    }
    return o;
  }
  function kmeans(px, k) {
    if (!px.length) return [];
    var cs = []; for (var i = 0; i < k; i++) cs.push(px[Math.floor((i + .5) * px.length / k)].slice());
    for (var it = 0; it < 8; it++) {
      var acc = cs.map(function () { return [0, 0, 0, 0]; });
      px.forEach(function (p) { var b = 0, bd = 1e9; cs.forEach(function (c, j) { var dd = (p[0] - c[0]) * (p[0] - c[0]) + (p[1] - c[1]) * (p[1] - c[1]) + (p[2] - c[2]) * (p[2] - c[2]); if (dd < bd) { bd = dd; b = j; } }); acc[b][0] += p[0]; acc[b][1] += p[1]; acc[b][2] += p[2]; acc[b][3]++; });
      cs = acc.map(function (a, j) { return a[3] ? [a[0] / a[3], a[1] / a[3], a[2] / a[3]] : cs[j]; });
    }
    return cs;
  }
  function refineCut(c, m0) {
    var w = c.width, H = c.height, n = w * H, x = c.getContext('2d', { willReadFrequently: true }), id = x.getImageData(0, 0, w, H), d = id.data;
    var B = Math.max(4, Math.round(Math.max(w, H) * 0.012));
    var inner = m0, outer = m0; for (var i = 0; i < B; i++) { inner = morph(inner, w, H, false); outer = morph(outer, w, H, true); }
    var fgPx = [], bgPx = [], step = Math.max(1, Math.floor(n / 40000));
    for (i = 0; i < n; i += step) { var p = [d[i * 4], d[i * 4 + 1], d[i * 4 + 2]]; if (inner[i]) fgPx.push(p); else if (!outer[i]) bgPx.push(p); }
    var fc = kmeans(fgPx, 6), bc = kmeans(bgPx, 6);
    function near(cs, p) { var bd = 1e9; for (var j = 0; j < cs.length; j++) { var dd = (d[p] - cs[j][0]) * (d[p] - cs[j][0]) + (d[p + 1] - cs[j][1]) * (d[p + 1] - cs[j][1]) + (d[p + 2] - cs[j][2]) * (d[p + 2] - cs[j][2]); if (dd < bd) bd = dd; } return bd; }
    /* cor média 5x5 para a textura não decidir sozinha */
    var sd = new Float32Array(n * 4);
    for (var yy0 = 0; yy0 < H; yy0++) for (var xx0 = 0; xx0 < w; xx0++) {
      var ii = yy0 * w + xx0; if (inner[ii] || !outer[ii]) continue; var r0 = 0, g0 = 0, b0 = 0, c0 = 0;
      for (var ry = -2; ry <= 2; ry++) for (var rx = -2; rx <= 2; rx++) { var tx = xx0 + rx, ty = yy0 + ry; if (tx >= 0 && ty >= 0 && tx < w && ty < H) { var tp = (ty * w + tx) * 4; r0 += d[tp]; g0 += d[tp + 1]; b0 += d[tp + 2]; c0++; } }
      sd[ii * 4] = r0 / c0; sd[ii * 4 + 1] = g0 / c0; sd[ii * 4 + 2] = b0 / c0;
    }
    function nearS(cs, p) { var bd = 1e9; for (var j = 0; j < cs.length; j++) { var dd = (sd[p] - cs[j][0]) * (sd[p] - cs[j][0]) + (sd[p + 1] - cs[j][1]) * (sd[p + 1] - cs[j][1]) + (sd[p + 2] - cs[j][2]) * (sd[p + 2] - cs[j][2]); if (dd < bd) bd = dd; } return bd; }
    /* separação das cores: se fundo e peça são parecidos, confia mais no contorno */
    var sep = 1e9; fc.forEach(function (a) { bc.forEach(function (b) { var dd = Math.sqrt((a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]) + (a[2] - b[2]) * (a[2] - b[2])); if (dd < sep) sep = dd; }); });
    var K = 1.3, polyOnly = sep < 70; try { console.log('[rdg] cut sep', Math.round(sep)); } catch (e) { /* */ }
    var m = new Uint8Array(n);
    for (i = 0; i < n; i++) {
      if (inner[i]) m[i] = 1; else if (!outer[i]) m[i] = 0;
      else if (polyOnly) m[i] = m0[i];
      else { var df = nearS(fc, i * 4) + 1, db = nearS(bc, i * 4) + 1; m[i] = m0[i] ? (db * K < df ? 0 : 1) : (df * K < db ? 1 : 0); }
    }
    near = null;
    /* limpa: maioria 5x5 só na faixa da borda */
    var m2 = new Uint8Array(m);
    for (var y = 0; y < H; y++) for (var xx = 0; xx < w; xx++) { i = y * w + xx; if (inner[i] || !outer[i]) continue; var s = 0, t = 0; for (var oy = -2; oy <= 2; oy++) for (var ox = -2; ox <= 2; ox++) { var sx = xx + ox, sy = y + oy; if (sx >= 0 && sy >= 0 && sx < w && sy < H) { s += m[sy * w + sx]; t++; } } m2[i] = s * 2 > t ? 1 : 0; }
    /* abre 1px (solta fiapos), fica só o bloco principal e fecha furinhos */
    m2 = morph(morph(m2, w, H, false), w, H, true);
    var q = new Int32Array(n), lab = new Int32Array(n), L = 0, best = 0, bestN = 0;
    for (i = 0; i < n; i++) {
      if (!m2[i] || lab[i]) continue; L++; var qh = 0, qt = 0; q[qt++] = i; lab[i] = L;
      while (qh < qt) { var u = q[qh++], ux = u % w; [ux > 0 ? u - 1 : -1, ux < w - 1 ? u + 1 : -1, u - w, u + w].forEach(function (v) { if (v >= 0 && v < n && m2[v] && !lab[v]) { lab[v] = L; q[qt++] = v; } }); }
      if (qt > bestN) { bestN = qt; best = L; }
    }
    for (i = 0; i < n; i++) m2[i] = lab[i] === best ? 1 : 0;
    var seen = new Uint8Array(n);
    for (i = 0; i < n; i++) {
      if (m2[i] || seen[i]) continue; var qh2 = 0, qt2 = 0, edge = false; q[qt2++] = i; seen[i] = 1;
      while (qh2 < qt2) { var u2 = q[qh2++], x2 = u2 % w, y2 = (u2 / w) | 0; if (!x2 || !y2 || x2 === w - 1 || y2 === H - 1) edge = true; [x2 > 0 ? u2 - 1 : -1, x2 < w - 1 ? u2 + 1 : -1, u2 - w, u2 + w].forEach(function (v) { if (v >= 0 && v < n && !m2[v] && !seen[v]) { seen[v] = 1; q[qt2++] = v; } }); }
      if (!edge && qt2 < n * 0.002) for (var z = 0; z < qt2; z++) m2[q[z]] = 1;
    }
    var minX = w, minY = H, maxX = 0, maxY = 0;
    for (i = 0; i < n; i++) {
      var kx = i % w, ky = (i / w) | 0, a = 0, c9 = 0;
      for (oy = -1; oy <= 1; oy++) for (ox = -1; ox <= 1; ox++) { sx = kx + ox; sy = ky + oy; if (sx >= 0 && sy >= 0 && sx < w && sy < H) { a += m2[sy * w + sx]; c9++; } }
      d[i * 4 + 3] = Math.round(255 * a / c9);
      if (m2[i]) { if (kx < minX) minX = kx; if (kx > maxX) maxX = kx; if (ky < minY) minY = ky; if (ky > maxY) maxY = ky; }
    }
    if (maxX <= minX || maxY <= minY) return null;
    x.putImageData(id, 0, 0);
    var cw = maxX - minX + 1, ch = maxY - minY + 1, sc = Math.min(1, 800 / Math.max(cw, ch));
    var o = document.createElement('canvas'); o.width = Math.max(1, Math.round(cw * sc)); o.height = Math.max(1, Math.round(ch * sc));
    o.getContext('2d').drawImage(c, minX, minY, cw, ch, 0, 0, o.width, o.height);
    return o;
  }
  async function aiCutout(im) {
    var s = ui.apis.sample; if (!s) return null;
    var lim = await s.limits().catch(function () { return null; }); if (!lim || !lim.images) return null;
    var c = workCanvas(im, 800), gb = await gridBlob(c);
    var out = await s.json('A imagem anexada é a foto de UMA peça de roupa ou acessório (' + c.width + ' x ' + c.height + ' pixels) com uma grade amarela numerada a cada 100 px (linhas finas a cada 50 px).\n' +
      'Contorne a silhueta externa da peça com precisão, seguindo a borda real do tecido (cós, bolsos salientes, barras, mangas, capuz). Não inclua sombra, chão, cabide ou modelo.\n' +
      'Se houver vãos onde aparece o fundo por dentro da peça (entre as pernas de uma calça, entre manga e corpo, alça de bolsa), descreva cada vão como um furo.\n' +
      'Use as linhas da grade para dar coordenadas exatas em pixels desta imagem. Dê de 30 a 70 pontos no contorno, em ordem, sem repetir o primeiro no fim.\n' +
      'Responda só com JSON: {"outline":[[x,y],...],"holes":[[[x,y],...]]}', { images: [gb], modelTier: 'default' });
    if (!out || !Array.isArray(out.outline) || out.outline.length < 6) return null;
    var pts = out.outline.filter(function (p) { return Array.isArray(p) && isFinite(p[0]) && isFinite(p[1]); });
    if (pts.length < 6) return null;
    var m0 = polyMask(c.width, c.height, pts, Array.isArray(out.holes) ? out.holes : []);
    var area = 0; for (var i = 0; i < m0.length; i++) area += m0[i];
    if (area < m0.length * 0.05) return null;
    return refineCut(c, m0);
  }
  function shrink(file, keepAlpha) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file), im = new Image();
      im.onload = function () {
        var max = 1200, r = Math.min(1, max / Math.max(im.naturalWidth, im.naturalHeight));
        var w = Math.max(1, Math.round(im.naturalWidth * r)), hh = Math.max(1, Math.round(im.naturalHeight * r));
        var c = document.createElement('canvas'); c.width = w; c.height = hh; var x = c.getContext('2d');
        if (!keepAlpha) { x.fillStyle = '#fff'; x.fillRect(0, 0, w, hh); }
        x.drawImage(im, 0, 0, w, hh); URL.revokeObjectURL(url);
        c.toBlob(function (b) { b ? resolve(b) : reject(new Error('blob')); }, keepAlpha ? 'image/webp' : 'image/jpeg', .86);
      };
      im.onerror = function () { URL.revokeObjectURL(url); reject(new Error('decode')); };
      im.src = url;
    });
  }
  /* leitura simples, sem IA, de preço e tamanhos (Shein, Shopee, Mercado Livre) */
  function regexParse(t) {
    var out = { name: '', price: null, oldPrice: null, sizes: [], priceFrom: /a partir de|apartir de/i.test(t) };
    var nums = (t.match(/R\$\s?\d{1,3}(?:\.\d{3})*,\d{2}/g) || []).map(function (v) { return parsePrice(v); }).filter(function (v) { return v > 0; });
    if (nums.length) { out.price = nums[0]; if (nums[1] && nums[1] > nums[0]) out.oldPrice = nums[1]; }
    var tn = t.match(/^Título da página:\s*(.+)$/m); if (tn) out.name = tn[1].replace(/\s*\|.*$/, '').slice(0, 60);
    var rg = t.match(/radiogroup "Tamanho"([\s\S]{0,800})/i);
    if (rg) { out.sizes = (rg[1].match(/radio "([^"]{1,12})"/g) || []).map(function (v) { return v.replace(/^radio "|"$/g, '').replace(/\s*\(.*\)$/, ''); }); return out; }
    var m = t.match(/Tamanho[^\n]*\n([\s\S]{0,300}?)(Guia de tamanhos|Quantidade|Enviado|Comprar|ADICIONAR)/i);
    if (m) out.sizes = m[1].split(/\n+/).map(function (v) { return v.trim().replace(/\s*\(.*\)$/, ''); }).filter(function (v) { return v && v.length <= 6 && !/tamanho/i.test(v); });
    return out;
  }
  function pageText(res) {
    if (!res) return '';
    if (typeof res.payload === 'string') return res.payload;
    var t = (res.content || []).filter(function (b) { return b.type === 'text'; }).map(function (b) { return b.text; }).join('\n');
    return t || (res.payload ? JSON.stringify(res.payload) : '');
  }

  /* ================================================================
     PAINEL DO DONO: link + foto
     ================================================================ */
  function toast(msg) { var old = document.querySelector('.toast'); if (old) old.remove(); var t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg; document.body.appendChild(t); setTimeout(function () { t.remove(); }, 4200); }
  var SAVE_ERR = { conflict: 'Outra versão foi publicada primeiro. A página vai recarregar; refaça a alteração.', not_writer: 'Você não tem permissão para editar esta loja.', not_granted: 'Salvar não está liberado nesta visualização.', capability_disabled: 'Salvar não está disponível nesta visualização.', too_large: 'A loja ficou grande demais. Apague peças que não usa mais.', rate_limited: 'Muitas alterações seguidas. Espere um instante.' };
  function errMsg(e) { return (e && SAVE_ERR[e.code]) || 'Não foi possível publicar agora. Tente de novo.'; }
  function setStatus(msg, bad) { var s = $('f-status'); if (!s) return; s.textContent = msg || ''; s.className = 'status' + (bad ? ' is-bad' : ''); }
  function setLine(id, msg, kind) { var s = $(id); if (!s) return; s.hidden = !msg; s.querySelector('span').textContent = msg || ''; s.className = 'job' + (kind ? ' is-' + kind : ''); }
  async function commit(message) {
    var art = ui.apis.artifact; if (!art) throw { code: 'not_granted' };
    try { sessionStorage.setItem('gs-toast', message); sessionStorage.setItem('gs-admin', '1'); sessionStorage.setItem('gs-intro', '1'); } catch (e) { /* */ }
    ui.busy = true; setStatus('Publicando…');
    try { await art.publish(pageDocument(state)); } catch (e) { try { sessionStorage.removeItem('gs-toast'); } catch (_) { /* */ } ui.busy = false; throw e; }
  }
  function kindOptions() { var o = '<option value="">Automático</option>'; Object.keys(KINDS).forEach(function (k) { o += '<option value="' + k + '">' + KINDS[k].label + '</option>'; }); return o + '<option value="none">Não vestir</option>'; }
  var draft = { photo: '', cut: '', newPhoto: false, newCut: false, file: null };
  /* link da loja no claude.ai: no navegador do celular a galeria abre normal */
  var OWNER_URL = 'https://claude.ai/artifact/CjEtxTL8PNBczB5P8AD6hQ';
  var UA = (navigator.userAgent || '');
  var IS_ANDROID = /Android/i.test(UA);
  /* app do Claude no Android = WebView ("; wv)"): ele não repassa o toque para a galeria */
  var IN_APP = IS_ANDROID && (/; wv\)/.test(UA) || /Claude/i.test(UA) || !/Chrome\/\d/.test(UA));
  var CHROME_URL = 'intent://' + OWNER_URL.replace(/^https:\/\//, '') + '#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=' + encodeURIComponent(OWNER_URL) + ';end';
  /* percebe quando o toque em "Escolher foto" não abriu nada (app sem acesso à galeria) */
  var pickWatch = { timer: 0, left: false };
  /* WebView do app no Android: o toque no campo de arquivo não abre nada, então nem tenta e mostra a saída na hora */
  var IS_WV = IS_ANDROID && /; wv\)/.test(UA);
  function armPickWatch(inp) {
    pickWatch.left = false; clearTimeout(pickWatch.timer);
    pickWatch.timer = setTimeout(function () { if (!pickWatch.left) showNoGallery(inp); }, 1800);
  }
  /* o aviso "a galeria não abriu" aparece embaixo do campo que a pessoa tocou */
  function showNoGallery(inp) {
    var n = $('nogal'); if (!n) return;
    var host = inp && inp.closest && (inp.closest('.fld') || inp.closest('.panel__sec'));
    if (host && n.parentNode !== host) host.appendChild(n);
    n.hidden = false; n.scrollIntoView({ block: 'nearest', behavior: REDUCED ? 'auto' : 'smooth' });
  }
  function bindPickers(root) {
    Array.prototype.forEach.call(root.querySelectorAll('input[type="file"]'), function (inp) {
      inp.addEventListener('click', function (e) {
        if (IS_WV) { e.preventDefault(); showNoGallery(inp); return; }
        armPickWatch(inp);
      });
      inp.addEventListener('change', function () { pickWatch.left = true; clearTimeout(pickWatch.timer); var n = $('nogal'); if (n) n.hidden = true; });
      inp.addEventListener('cancel', function () { pickWatch.left = true; });
    });
  }
  async function pasteFromClipboard() {
    try {
      if (!navigator.clipboard || !navigator.clipboard.read) throw new Error('sem api');
      var items = await navigator.clipboard.read();
      for (var i = 0; i < items.length; i++) {
        var t = items[i].types.filter(function (x) { return /^image\//.test(x); })[0];
        if (t) { var bl = await items[i].getType(t); choosePhoto(new File([bl], 'foto', { type: bl.type || t })); return; }
      }
      setStatus('Não achei foto copiada. Na galeria, abra a foto, toque em Compartilhar ou nos 3 pontinhos e escolha Copiar.', true);
    } catch (e) {
      var pz = $('paste'); if (pz) { pz.focus(); }
      setStatus('O celular não deixou ler a foto copiada direto. Toque e segure no campo acima e escolha Colar.', true);
    }
  }
  var jobs = { cut: null, info: null, link: null };
  function imgSrc(v) { return /^\//.test(v) || /^img\//.test(v) || /^blob:/.test(v) ? v : '/_blob/' + v; }

  function buildAdmin() {
    if (ui.adminBuilt) return; ui.adminBuilt = true;
    var rootEl = $('admin-root');
    var fab = document.createElement('button'); fab.className = 'fab'; fab.type = 'button'; fab.id = 'fab'; fab.setAttribute('aria-haspopup', 'dialog');
    fab.innerHTML = ico('plus', 18) + '<span>Painel</span>'; fab.addEventListener('click', function () { openAdmin(); });
    var pn = document.createElement('aside'); pn.className = 'panel'; pn.id = 'panel'; pn.setAttribute('role', 'dialog'); pn.setAttribute('aria-modal', 'true'); pn.setAttribute('aria-labelledby', 'pn-title'); pn.hidden = true;
    pn.innerHTML =
      '<div class="panel__head"><div><p class="eyebrow eyebrow--gold">Só você vê</p><h2 id="pn-title" tabindex="-1">Painel</h2></div><button class="round round--sm" type="button" id="pn-x" data-close aria-label="Fechar painel">' + ico('close', 18) + '</button></div>' +
      '<div class="appwarn" id="appwarn"' + (IN_APP ? '' : ' hidden') + ' role="note"><b>Você abriu pelo app do Claude</b><p>No Android, o app não deixa a página abrir a galeria. Abra o painel no Chrome: lá a galeria abre normal e fica tudo salvo na mesma loja.</p>' +
        '<div class="mini-row"><a class="btn btn--gold btn--sm" href="' + CHROME_URL + '" target="_blank" rel="noopener">Abrir no Chrome</a><button class="mini" type="button" id="appwarn-copy">Copiar link</button></div></div>' +
      '<form class="panel__sec" id="pf" novalidate>' +
        '<h3 class="h3" id="pf-h">Nova peça</h3>' +
        '<div class="fld"><label for="f-link"><span class="fld__n mono">1</span>Link de afiliado</label><input id="f-link" type="url" inputmode="url" placeholder="Cole o link da Shein, Shopee ou Mercado Livre" autocomplete="off"></div>' +
        '<div class="fld"><span class="lbl-f" id="lb-photo"><span class="fld__n mono">2</span>Foto da peça</span>' +
          '<label class="pick" id="pick"><input class="file-in" id="file-photo" type="file" accept="image/*" aria-describedby="lb-photo" aria-label="Escolher foto da peça">' +
            '<span class="pick__empty" id="pick-empty">' + ico('camera', 26) + '<b>Escolher foto</b><small>Peça estendida, de frente, em fundo liso. Melhor ainda: já sem fundo, do Canva</small></span>' +
            '<span class="pick__prev" id="pick-prev" hidden><figure><img id="pv-photo" alt=""><figcaption>Foto</figcaption></figure><figure class="is-cut"><img id="pv-cut" alt="" hidden><span class="pv-wait" id="pv-wait"></span><figcaption>Recorte</figcaption></figure></span>' +
          '</label>' +
          '<label class="native" for="file-photo2"><span>Não abriu? Toque aqui</span><input id="file-photo2" type="file" accept="image/*"></label>' +
          '<div class="paste" id="paste" contenteditable="true" inputmode="none" role="textbox" aria-label="Colar foto copiada da galeria" spellcheck="false"></div>' +
          '<div class="mini-row"><button class="mini" type="button" id="b-paste">' + ico('camera', 14) + ' Colar foto copiada</button></div>' +
          '<p class="paste__hint">Não abriu a galeria? Copie a foto na galeria do celular e toque em <b>Colar foto copiada</b> (ou toque e segure no campo acima e escolha <b>Colar</b>).</p>' +
          '<div class="nogal" id="nogal" hidden role="alert">' +
            '<b>A galeria não abriu?</b>' +
            '<p>O app do Claude no celular às vezes bloqueia a galeria. Abra a loja no navegador do celular (Chrome ou Safari), entre na sua conta do Claude e use o Painel por lá: a galeria abre normal.</p>' +
            '<div class="mini-row">' + (IS_ANDROID ? '<a class="mini mini--gold" href="' + CHROME_URL + '" target="_blank" rel="noopener">Abrir no Chrome</a>' : '') + '<a class="mini" id="nogal-open" href="' + OWNER_URL + '" target="_blank" rel="noopener">Abrir no navegador</a><button class="mini" type="button" id="nogal-copy">Copiar link</button></div>' +
            '<input class="nogal__url" id="nogal-url" type="text" readonly value="' + OWNER_URL + '" aria-label="Link da loja para abrir no navegador">' +
            '<p class="muted">Outro jeito: mande a foto e o link de afiliado no chat do Claude que ele cadastra para você.</p>' +
          '</div>' +
        '</div>' +
        '<div class="jobs"><p class="job" id="j-link" hidden><i></i><span></span></p><p class="job" id="j-cut" hidden><i></i><span></span></p></div>' +
        '<div class="fld cutbox" id="cutbox"><span class="lbl-f"><span class="fld__n mono">3</span>Recorte do provador</span>' +
          '<p class="cutbox__p">O painel recorta a peça com <b>IA</b> no próprio celular. Na primeira vez ele baixa a IA (cerca de 45 MB, use Wi-Fi); depois fica guardada. Se quiser, ainda dá para enviar um PNG sem fundo pronto: ele substitui o recorte na hora.</p>' +
          '<div class="cutbox__btns"><a class="btn btn--gold" id="b-canva" href="https://www.canva.com/" target="_blank" rel="noopener">1. Tirar fundo no Canva</a>' +
          '<label class="btn btn--ghost cut-up" id="b-cut2"><input class="file-in" id="file-cut2" type="file" accept="image/*" aria-label="Enviar PNG sem fundo do Canva">2. Enviar PNG sem fundo</label></div>' +
          '<details class="canva-tip"><summary>Como tirar o fundo no Canva</summary><ol>' +
            '<li>No app do Canva, abra um design com a foto da peça e toque na foto.</li>' +
            '<li>Na barra de ferramentas, toque em <b>Removedor de fundo</b> e espere terminar.</li>' +
            '<li>Toque em <b>Compartilhar</b>, depois <b>Baixar</b>, escolha <b>PNG</b> e ative <b>Fundo transparente</b>.</li>' +
            '<li>Volte aqui e toque em <b>2. Enviar PNG sem fundo</b>.</li>' +
          '</ol><p class="muted">Sem Canva? Em muitos celulares (iPhone e Samsung, por exemplo) dá para segurar o dedo na peça dentro da galeria e salvar só a peça, já sem fundo. Esse arquivo também serve aqui.</p><p class="muted">Se você escolher um PNG sem fundo já no passo 2 (Foto da peça), o painel usa ele direto e monta a foto da vitrine sozinho.</p></details>' +
        '</div>' +
        '<div class="fld fv" id="fv"><span class="lbl-f"><span class="fld__n mono">4</span>Frente e verso <small class="muted">opcional</small></span>' +
          '<p class="muted">Com o verso, o botão Costas do provador mostra a peça virada. Use PNG sem fundo.</p>' +
          '<div class="fv__row">' +
            '<figure class="fv__c"><span class="fv__im" id="fv-front"><small>Sem frente</small></span><figcaption>Frente</figcaption><label class="mini mini--file"><input class="file-in" id="file-front" type="file" accept="image/png,image/webp,image/*" aria-label="Enviar frente sem fundo">Enviar frente</label></figure>' +
            '<figure class="fv__c"><span class="fv__im" id="fv-back"><small>Sem verso</small></span><figcaption>Verso</figcaption><label class="mini mini--file mini--gold"><input class="file-in" id="file-back" type="file" accept="image/png,image/webp,image/*" aria-label="Enviar verso sem fundo">Adicionar verso</label><button class="mini mini--x" type="button" id="fv-del" hidden>Tirar verso</button></figure>' +
          '</div><p class="job" id="j-back" hidden><i></i><span></span></p>' +
        '</div>' +
        '<div class="fld m3d" id="m3d"><span class="lbl-f"><span class="fld__n mono">5</span>Tênis em 360 <small class="muted">opcional, só tênis</small></span>' +
          '<p class="muted">Envie o modelo 3D (.glb) gerado por IA a partir das fotos (Meshy, Tripo). Com ele, o botão "Ver tênis 360" aparece no provador.</p>' +
          '<div class="m3d__row"><span class="m3d__st mono" id="m3d-st">Sem modelo 3D</span><label class="mini mini--file mini--gold"><input class="file-in" id="file-3d" type="file" accept=".glb,model/gltf-binary" aria-label="Enviar modelo 3D .glb"><span id="m3d-lb">Enviar .glb</span></label><button class="mini mini--x" type="button" id="m3d-del" hidden>Tirar 3D</button></div>' +
          '<p class="job" id="j-3d" hidden><i></i><span></span></p>' +
          '<details class="m3d__pts"><summary>Textos dos pontos de destaque</summary>' +
            PONTOS.map(function (pt) { return '<div class="fld"><label for="f-pt-' + pt[0] + '">' + pt[1] + '</label><input id="f-pt-' + pt[0] + '" type="text" maxlength="110" placeholder="' + esc(pt[2]) + '"></div>'; }).join('') +
            '<p class="muted">Em branco, vale o texto padrão.</p></details>' +
        '</div>' +
        '<div class="fld anaf" id="anaf"><span class="lbl-f"><span class="fld__n mono">6</span>Anatomia <small class="muted">opcional, só tênis</small></span>' +
          '<p class="muted">Onde o tênis se divide quando abre. Arraste até a linha de cima ficar na borda da espuma e a de baixo na borda da sola.</p>' +
          '<div class="anaf__prev" id="anaf-prev"><img id="anaf-img" alt=""><i id="anaf-l1"></i><i id="anaf-l2"></i><small class="muted" id="anaf-vazio">Escolha a foto primeiro</small></div>' +
          '<label class="fitbar__c"><span>Corte cabedal / entressola<output id="anaf-o1"></output></span><input type="range" id="anaf-c1" min="40" max="90" step="1"></label>' +
          '<label class="fitbar__c"><span>Corte entressola / solado<output id="anaf-o2"></output></span><input type="range" id="anaf-c2" min="55" max="97" step="1"></label>' +
          '<details class="m3d__pts"><summary>Materiais e benefícios das camadas</summary>' +
            ANA_PADRAO.map(function (d, k) { return '<div class="row2"><div class="fld"><label for="anaf-m' + k + '">' + d[0] + ': material</label><input id="anaf-m' + k + '" type="text" maxlength="40" placeholder="' + esc(d[1]) + '"></div><div class="fld"><label for="anaf-b' + k + '">Benefício</label><input id="anaf-b' + k + '" type="text" maxlength="50" placeholder="' + esc(d[2]) + '"></div></div>'; }).join('') +
            '<p class="muted">Em branco, vale o texto padrão. Confira no anúncio: o padrão é genérico.</p></details>' +
        '</div>' +
        '<details class="more" id="more"><summary>Ajustar dados <small>opcional</small></summary><div class="more__in">' +
          '<div class="fld"><label for="f-name">Nome</label><input id="f-name" type="text" maxlength="90" placeholder="Preenchido sozinho"></div>' +
          '<div class="row2"><div class="fld"><label for="f-price">Preço</label><input id="f-price" type="text" inputmode="decimal" placeholder="89,90"></div><div class="fld"><label for="f-old">Preço antigo</label><input id="f-old" type="text" inputmode="decimal"></div></div>' +
          '<div class="fld"><label for="f-sizes">Tamanhos</label><input id="f-sizes" type="text" maxlength="80" placeholder="P, M, G, GG"></div>' +
          '<div class="row2"><div class="fld"><label for="f-cat">Categoria</label><input id="f-cat" type="text" list="f-cats" maxlength="30"><datalist id="f-cats"></datalist></div><div class="fld"><label for="f-kind">Veste em</label><select id="f-kind">' + kindOptions() + '</select></div></div>' +
          '<div class="fld"><label for="f-store">Loja</label><input id="f-store" type="text" maxlength="30"></div>' +
          '<div class="fld"><label for="f-nota">Por que garimpamos <small class="muted">opcional</small></label><input id="f-nota" type="text" maxlength="160" placeholder="Ex.: couro firme, sola alta e caimento largo"></div>' +
          '<label class="chk"><input id="f-hot" type="checkbox"><span><b>Oferta quente</b><small>Entra sempre na seleção de Ofertas quentes</small></span></label>' +
          '<div class="mini-row"><label class="mini mini--file" id="b-print"><input class="file-in" id="file-print" type="file" accept="image/*">Ler preço por print</label><button class="mini" type="button" id="b-recut">Refazer recorte</button><label class="mini mini--file" id="b-cut"><input class="file-in" id="file-cut" type="file" accept="image/png,image/webp,image/*">Enviar recorte pronto</label></div>' +
        '</div></details>' +
        '<p class="status" id="f-status" role="status"></p>' +
        '<div class="row-btns"><button class="btn btn--gold btn--wide" type="submit" id="f-submit">Adicionar à vitrine</button><button class="btn btn--ghost" type="button" id="f-cancel" hidden>Cancelar</button></div>' +
      '</form>' +
      '<section class="panel__sec lote" id="lote" aria-labelledby="lote-h"><h3 class="h3" id="lote-h">Adicionar em lote</h3>' +
        '<p class="muted">Cole vários links (um por linha), escolha as fotos na mesma ordem e crie tudo de uma vez. Também dá para importar uma planilha.</p>' +
        '<div class="fld"><label for="l-text"><span class="fld__n mono">1</span>Links, um por linha</label><textarea id="l-text" rows="5" spellcheck="false" placeholder="https://onelink.shein.com/...\nhttps://s.shopee.com.br/...\n\nOpcional: link ; nome ; preço ; preço antigo ; tamanhos"></textarea></div>' +
        '<div class="mini-row"><label class="mini mini--file" id="l-csv-b"><input class="file-in" id="l-csv" type="file" accept=".csv,.tsv,.txt,text/csv,text/plain">Importar planilha (CSV)</label><button class="mini" type="button" id="l-model">Baixar modelo</button></div>' +
        '<div class="fld"><span class="lbl-f"><span class="fld__n mono">2</span>Fotos, na mesma ordem dos links <small class="muted">opcional</small></span>' +
          '<label class="pick pick--sm" id="l-pick"><input class="file-in" id="l-photos" type="file" accept="image/*" multiple aria-label="Escolher várias fotos"><span class="pick__empty">' + ico('camera', 22) + '<b id="l-pick-t">Escolher fotos</b><small>Segure numa foto e marque as outras</small></span></label>' +
          '<label class="native" for="l-photos2"><span>Não abriu? Toque aqui</span><input id="l-photos2" type="file" accept="image/*" multiple></label></div>' +
        '<label class="chk"><input id="l-cut" type="checkbox" checked><span><b>Recortar com IA para o provador</b><small>Uma por vez. No celular leva uns segundos por peça</small></span></label>' +
        '<label class="chk"><input id="l-hot" type="checkbox"><span><b>Marcar todas como Oferta quente</b></span></label>' +
        '<div class="lote__prev" id="l-prev"></div>' +
        '<p class="status" id="l-status" role="status"></p>' +
        '<button class="btn btn--gold btn--wide" type="button" id="l-go" disabled>Preparar peças</button>' +
        '<div class="lprog" id="l-prog" hidden><p><span id="l-prog-t">0 de 0</span><span id="l-prog-s"></span></p><i><b id="l-prog-b"></b></i></div>' +
        '<div class="lrev" id="l-rev"></div>' +
        '<div class="row-btns lrev__acts" id="l-acts" hidden><button class="btn btn--gold btn--wide" type="button" id="l-pub">Publicar tudo</button><button class="btn btn--ghost" type="button" id="l-drop">Descartar lote</button></div>' +
      '</section>' +
      '<section class="panel__sec"><h3 class="h3">Na vitrine <span class="mono" id="p-count">0</span></h3><div class="plist" id="plist"></div></section>' +
      '<details class="panel__sec more"><summary>Dados da loja</summary><form class="more__in" id="sf" novalidate>' +
        '<div class="fld"><label for="s-name">Nome da loja</label><input id="s-name" type="text" maxlength="40"></div>' +
        '<div class="fld"><label for="s-tag">Frase</label><input id="s-tag" type="text" maxlength="90"></div>' +
        '<div class="fld"><label for="s-ig">Instagram</label><input id="s-ig" type="text" maxlength="60" placeholder="@seuperfil"></div>' +
          '<div class="fld"><label for="s-zap">WhatsApp do atendimento</label><input id="s-zap" type="tel" inputmode="tel" maxlength="20" placeholder="(64) 99999-9999"><small class="muted">Aparece no botão flutuante, no assistente e no Avise quando baixar.</small></div>' +
        '<p class="lbl">Seu ID de afiliado</p><p class="muted">Entra sozinho em todo link longo que você colar (ex.: <span class="mono">aff_id=12345</span>). Links curtos de afiliado, como onelink.shein, s.shopee e meli.la, já levam o seu ID e ficam como estão.</p>' +
        AFF_STORES.map(function (a) { return '<div class="fld"><label for="s-aff-' + a[0] + '">' + a[1] + '</label><input id="s-aff-' + a[0] + '" type="text" maxlength="120" autocomplete="off" spellcheck="false" placeholder="parametro=seuID"></div>'; }).join('') +
        '<p class="status" id="s-status" role="status"></p><button class="btn btn--ghost" type="submit">Salvar dados da loja</button>' +
      '</form></details>';
    rootEl.appendChild(fab); rootEl.appendChild(pn);
    $('file-photo').addEventListener('change', function (e) { pickWatch.left = true; var f = e.target.files && e.target.files[0]; e.target.value = ''; if (f) choosePhoto(f); });
    bindPickers(pn);
    window.addEventListener('blur', function () { pickWatch.left = true; });
    document.addEventListener('visibilitychange', function () { if (document.hidden) pickWatch.left = true; });
    $('b-paste').addEventListener('click', pasteFromClipboard);
    $('file-photo2').addEventListener('change', function (e) { pickWatch.left = true; var f = e.target.files && e.target.files[0]; e.target.value = ''; if (f) choosePhoto(f); });
    $('appwarn-copy').addEventListener('click', function () { copyText(OWNER_URL, $('appwarn-copy')); });
    bindLote();
    $('nogal-copy').addEventListener('click', function () {
      var inp = $('nogal-url'), done = function () { $('nogal-copy').textContent = 'Link copiado'; };
      try { if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(OWNER_URL).then(done, function () { inp.select(); done(); try { document.execCommand('copy'); } catch (e) { /* */ } }); return; } } catch (e) { /* */ }
      inp.focus(); inp.select(); try { document.execCommand('copy'); done(); } catch (e) { setStatus('Segure no link abaixo e copie.', true); }
    });
    $('file-cut').addEventListener('change', function (e) { var f = e.target.files && e.target.files[0]; e.target.value = ''; if (f) uploadCut(f); });
    $('file-back').addEventListener('change', function (e) { var f = e.target.files && e.target.files[0]; e.target.value = ''; if (f) jobs.back = uploadBack(f); });
    $('file-cut2').addEventListener('change', function (e) { var f = e.target.files && e.target.files[0]; e.target.value = ''; if (f) uploadCut(f); });
    ['anaf-c1', 'anaf-c2'].forEach(function (id) { $(id).addEventListener('input', anafLinhas); });
    $('file-3d').addEventListener('change', function (e) { var f = e.target.files && e.target.files[0]; e.target.value = ''; if (f) jobs.m3d = upload3d(f); });
    $('m3d-del').addEventListener('click', function () { draft.m3d = ''; draft.newM3d = false; draft.delM3d = true; setLine('j-3d', 'Modelo 3D removido. Salve a peça para confirmar.', 'ok'); m3dPrev(); });
    $('file-front').addEventListener('change', function (e) { var f = e.target.files && e.target.files[0]; e.target.value = ''; if (f) uploadCut(f); });
    $('fv-del').addEventListener('click', function () { draft.back = ''; draft.newBack = false; draft.delBack = true; if (draft.backLocal) URL.revokeObjectURL(draft.backLocal); draft.backLocal = ''; setLine('j-back', 'Verso removido. Salve a peça para confirmar.', 'ok'); fvPrev(); });
    $('file-print').addEventListener('change', function (e) { var f = e.target.files && e.target.files[0]; e.target.value = ''; if (f) readPrint(f); });
    $('b-recut').addEventListener('click', function () { if (!draft.file && !draft.photo) { setStatus('Escolha a foto primeiro.', true); return; } jobs.cut = makeCut(); });
    var lt = 0;
    $('f-link').addEventListener('input', function () {
      var l = cleanLink($('f-link').value); if (l && !$('f-store').value) $('f-store').value = detectStore(l);
      clearTimeout(lt); if (l && ui.apis.mcp) lt = setTimeout(function () { jobs.link = fetchFromLink(); }, 700);
    });
    var pz = $('paste');
    pz.addEventListener('input', function () { /* imagem colada sem evento de arquivo: pega o src */
      var im = pz.querySelector('img'); pz.innerHTML = '';
      if (im && im.src) fetch(im.src).then(function (r) { return r.blob(); }).then(function (bl) { if (/^image\//.test(bl.type)) choosePhoto(new File([bl], 'foto', { type: bl.type })); else setStatus('Isso não é uma foto. Copie a imagem da peça e cole de novo.', true); }).catch(function () { setStatus('Não consegui ler a foto colada. Tente copiar de novo.', true); });
      else if (pz.textContent) setStatus('Isso colou texto. Copie a foto da peça na galeria e cole de novo.', true);
    });
    pn.addEventListener('paste', function (e) {
      var items = (e.clipboardData && e.clipboardData.items) || [];
      for (var i = 0; i < items.length; i++) if (items[i].kind === 'file' && /^image\//.test(items[i].type)) { e.preventDefault(); choosePhoto(items[i].getAsFile()); return; }
    });
    $('pick').addEventListener('dragover', function (e) { e.preventDefault(); $('pick').classList.add('is-over'); });
    $('pick').addEventListener('dragleave', function () { $('pick').classList.remove('is-over'); });
    $('pick').addEventListener('drop', function (e) { e.preventDefault(); $('pick').classList.remove('is-over'); var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]; if (f && /^image\//.test(f.type)) choosePhoto(f); });
    $('pf').addEventListener('submit', onSubmitProduct);
    $('sf').addEventListener('submit', onSubmitStore);
    $('f-cancel').addEventListener('click', resetForm);
    $('b-print').hidden = !ui.apis.sample;
    resetForm(); refreshAdmin();
  }
  function previews() {
    var has = !!(draft.photo || draft.local);
    $('pick-empty').hidden = has; $('pick-prev').hidden = !has;
    if (has) { $('pv-photo').src = draft.local || imgSrc(draft.photo); }
    var pc = $('pv-cut'); if (draft.cut) { pc.src = imgSrc(draft.cut); pc.hidden = false; } else { pc.hidden = true; pc.removeAttribute('src'); }
    $('pv-wait').textContent = draft.cut ? '' : (jobs.cutRunning ? 'recortando…' : 'sem recorte');
    $('file-photo').setAttribute('aria-label', has ? 'Trocar foto da peça' : 'Escolher foto da peça');
    fvPrev(); anafPrev();
  }
  /* modelo 3D do tênis: confere se é .glb de verdade (começa com "glTF") antes de enviar */
  async function upload3d(file) {
    if (file.size > 11 * 1024 * 1024) { setLine('j-3d', 'Arquivo grande demais (máx. 11 MB). Exporte o .glb com menos detalhes ou textura 2K.', 'bad'); return; }
    try {
      var head = new Uint8Array(await file.slice(0, 4).arrayBuffer());
      if (String.fromCharCode(head[0], head[1], head[2], head[3]) !== 'glTF') { setLine('j-3d', 'Esse arquivo não é um .glb. No site de 3D, baixe em formato GLB.', 'bad'); return; }
      setLine('j-3d', 'Enviando o modelo 3D…', 'run');
      /* vai como texto base64: o armazenamento do site não aceita .glb direto */
      var b64 = await new Promise(function (res, rej) { var fr = new FileReader(); fr.onload = function () { res(String(fr.result).split(',')[1] || ''); }; fr.onerror = rej; fr.readAsDataURL(file); });
      var res = await ui.apis.assets.upload(new Blob([b64], { type: 'text/plain' }));
      draft.m3d = res.id; draft.newM3d = true; draft.delM3d = false; m3dPrev();
      setLine('j-3d', 'Modelo 3D pronto. Salve a peça para o botão "Ver tênis 360" aparecer.', 'ok');
    } catch (e) { setLine('j-3d', 'Não foi possível enviar o modelo 3D. Tente de novo.', 'bad'); }
  }
  function m3dPrev() {
    var st = $('m3d-st'); if (!st) return;
    var ed = ui.editing && byId(ui.editing), tem = draft.m3d || (!draft.delM3d && ed && modelOf(ed));
    st.textContent = draft.newM3d ? 'Novo modelo 3D enviado' : tem ? 'Com modelo 3D' : 'Sem modelo 3D';
    st.classList.toggle('is-ok', !!tem);
    $('m3d-del').hidden = !tem; $('m3d-lb').textContent = tem ? 'Trocar .glb' : 'Enviar .glb';
  }
  /* anatomia no painel: prévia do recorte com as duas linhas de corte */
  function anafLinhas() {
    var a = +$('anaf-c1').value, b = +$('anaf-c2').value;
    if (b < a + 5) { b = Math.min(97, a + 5); $('anaf-c2').value = b; }
    $('anaf-l1').style.top = a + '%'; $('anaf-l2').style.top = b + '%';
    $('anaf-o1').textContent = a + '%'; $('anaf-o2').textContent = b + '%';
  }
  function anafPrev() {
    var im = $('anaf-img'); if (!im) return;
    var ed = ui.editing && byId(ui.editing), src = draft.cut ? imgSrc(draft.cut) : (ed ? imgFor(ed) : '');
    im.hidden = !src; if (src) im.src = src; else im.removeAttribute('src');
    /* a prévia tem a proporção da foto: a linha em 70% fica exatamente em 70% da altura do tênis */
    im.onload = function () { if (im.naturalWidth) $('anaf-prev').style.aspectRatio = String(im.naturalWidth / im.naturalHeight); };
    $('anaf-vazio').hidden = !!src;
  }
  function anafFill(p) {
    var a = (p && p.anat) || {}, c = Array.isArray(a.c) ? a.c : ANA_CORTES;
    $('anaf-c1').value = Math.round(c[0] * 100); $('anaf-c2').value = Math.round(c[1] * 100);
    [0, 1, 2].forEach(function (k) { $('anaf-m' + k).value = (a.m && a.m[k]) || ''; $('anaf-b' + k).value = (a.b && a.b[k]) || ''; });
    anafLinhas(); anafPrev();
  }
  function anafLer() {
    var c = [+$('anaf-c1').value / 100, +$('anaf-c2').value / 100], m = [], b = [], txt = false;
    [0, 1, 2].forEach(function (k) { m[k] = $('anaf-m' + k).value.trim(); b[k] = $('anaf-b' + k).value.trim(); if (m[k] || b[k]) txt = true; });
    var mudouCorte = c[0] !== ANA_CORTES[0] || c[1] !== ANA_CORTES[1];
    if (!mudouCorte && !txt) return null;
    var o = {}; if (mudouCorte) o.c = c; if (txt) { o.m = m; o.b = b; }
    return o;
  }
  /* frente e verso: mostra o recorte da frente e o das costas lado a lado */
  function fvPrev() {
    var fr = $('fv-front'), bk = $('fv-back'); if (!fr || !bk) return;
    var ed = ui.editing && byId(ui.editing);
    var fsrc = draft.cut ? imgSrc(draft.cut) : '';
    var bsrc = draft.backLocal || (draft.back ? imgSrc(draft.back) : (!draft.delBack && ed ? cutBackOf(ed) : ''));
    fr.innerHTML = fsrc ? '<img src="' + esc(fsrc) + '" alt="Frente">' : '<small>Sem frente</small>';
    bk.innerHTML = bsrc ? '<img src="' + esc(bsrc) + '" alt="Verso">' : '<small>Sem verso</small>';
    $('fv-del').hidden = !bsrc;
    var lb = $('file-back').parentNode; lb.lastChild.textContent = bsrc ? 'Trocar verso' : 'Adicionar verso';
  }
  async function choosePhoto(file) {
    if (!ui.apis.assets) { setStatus('Envio de fotos não está liberado nesta visualização.', true); return; }
    if (draft.local) URL.revokeObjectURL(draft.local);
    clearTimeout(pickWatch.timer); var ng = $('nogal'); if (ng) ng.hidden = true;
    /* foto que já vem sem fundo (Canva, remover fundo do celular): usa como recorte, sem mexer */
    try {
      var cl = await clearCut(file);
      if (cl) { await useReadyCut(file, cl); return; }
    } catch (e) { /* segue como foto comum */ }
    draft.file = file; draft.local = URL.createObjectURL(file); draft.cut = ''; draft.newCut = false; draft.manualCut = false; previews(); setStatus('');
    var up = (async function () { var blob = await shrink(file, false); var res = await ui.apis.assets.upload(blob); draft.photo = res.id; draft.newPhoto = true; })();
    jobs.photo = up.catch(function () { draft.photo = ''; setStatus('Não foi possível enviar essa foto. Use JPG, PNG ou WebP.', true); });
    jobs.cut = makeCut();
    if (ui.apis.sample && !$('f-name').value.trim()) jobs.info = identify(file);
  }
  /* devolve a peça aparada (canvas) quando a imagem tem fundo transparente de verdade */
  async function clearCut(file) {
    if (file.type && !/png|webp|gif/i.test(file.type)) return null;
    var im = await loadImage(file), max = 1400, r = Math.min(1, max / Math.max(im.naturalWidth, im.naturalHeight));
    var w = Math.max(1, Math.round(im.naturalWidth * r)), hh = Math.max(1, Math.round(im.naturalHeight * r));
    var c = document.createElement('canvas'); c.width = w; c.height = hh; var x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(im, 0, 0, w, hh);
    var d = x.getImageData(0, 0, w, hh).data, n = w * hh, clear = 0, edgeClear = 0, edge = 0;
    var minX = w, minY = hh, maxX = -1, maxY = -1;
    for (var i = 0; i < n; i++) {
      var a = d[i * 4 + 3], px = i % w, py = (i / w) | 0;
      if (a < 16) clear++;
      if (px === 0 || py === 0 || px === w - 1 || py === hh - 1) { edge++; if (a < 16) edgeClear++; }
      if (a > 24) { if (px < minX) minX = px; if (px > maxX) maxX = px; if (py < minY) minY = py; if (py > maxY) maxY = py; }
    }
    /* precisa de fundo transparente nas bordas e uma peça visível no meio */
    if (clear < n * 0.06 || edgeClear < edge * 0.6 || maxX < minX) return null;
    var cw = maxX - minX + 1, ch = maxY - minY + 1, sc = Math.min(1, 800 / Math.max(cw, ch));
    var o = document.createElement('canvas'); o.width = Math.max(1, Math.round(cw * sc)); o.height = Math.max(1, Math.round(ch * sc));
    var ox = o.getContext('2d'); ox.imageSmoothingQuality = 'high'; ox.drawImage(c, minX, minY, cw, ch, 0, 0, o.width, o.height);
    return o;
  }
  function toBlobP(cv, type, q) { return new Promise(function (res, rej) { cv.toBlob(function (b) { b ? res(b) : rej(new Error('blob')); }, type, q); }); }
  async function useReadyCut(file, cut) {
    /* foto da vitrine: a peça centralizada num fundo claro liso, formato 3:4 */
    var W = 900, H = 1200, s = Math.min(W * .74 / cut.width, H * .72 / cut.height);
    var card = document.createElement('canvas'); card.width = W; card.height = H; var cx = card.getContext('2d');
    /* fundo padrão da loja: preto com halo dourado atrás da peça */
    cx.fillStyle = '#050506'; cx.fillRect(0, 0, W, H);
    try { var bgi = await loadImage('img/hd/fundo-halo-hd.webp'); var bs = Math.max(W / bgi.naturalWidth, H / bgi.naturalHeight); cx.drawImage(bgi, (W - bgi.naturalWidth * bs) / 2, (H - bgi.naturalHeight * bs) / 2, bgi.naturalWidth * bs, bgi.naturalHeight * bs); } catch (e) { /* fica o preto */ }
    var dw = cut.width * s, dh = cut.height * s, dx = (W - dw) / 2, dy = H * .47 - dh / 2;
    var canFilter = false; try { cx.filter = 'blur(1px)'; canFilter = cx.filter === 'blur(1px)'; cx.filter = 'none'; } catch (e) { /* */ }
    if (canFilter) { cx.save(); cx.filter = 'blur(22px)'; cx.globalAlpha = .55; cx.drawImage(cut, dx, dy + dh * .025, dw, dh); cx.restore();
    cx.save(); cx.filter = 'blur(16px) brightness(0) invert(1) sepia(1) saturate(6) hue-rotate(-10deg)'; cx.globalAlpha = .22; cx.drawImage(cut, dx, dy, dw, dh); cx.restore(); }
    cx.imageSmoothingQuality = 'high'; cx.drawImage(cut, dx, dy, dw, dh);
    var cardBlob = await toBlobP(card, 'image/jpeg', .9);
    draft.file = new File([cardBlob], 'foto.jpg', { type: 'image/jpeg' }); draft.local = URL.createObjectURL(cardBlob);
    draft.cut = ''; draft.newCut = false; jobs.cutRunning = true; previews(); setStatus('');
    setLine('j-cut', 'Foto sem fundo detectada: usando o recorte como veio, sem mexer.', 'run');
    jobs.photo = (async function () { var res = await ui.apis.assets.upload(cardBlob); draft.photo = res.id; draft.newPhoto = true; })().catch(function () { draft.photo = ''; setStatus('Não foi possível enviar essa foto. Tente de novo.', true); });
    jobs.cut = (async function () {
      try { var cb = await toBlobP(cut, 'image/webp', .92); var up = await ui.apis.assets.upload(cb); draft.cut = up.id; draft.newCut = true; setLine('j-cut', 'Recorte pronto, do jeito que veio sem fundo.', 'ok'); }
      catch (e) { setLine('j-cut', 'Não foi possível enviar o recorte.', 'bad'); }
      finally { jobs.cutRunning = false; previews(); }
    })();
    if (ui.apis.sample && !$('f-name').value.trim()) jobs.info = identify(draft.file);
  }
  /* foto das costas sem fundo: aparece no botão Costas do provador */
  async function uploadBack(file) {
    setLine('j-back', 'Lendo o verso…', 'run');
    try {
      var cl = await clearCut(file);
      if (!cl) { setLine('j-back', 'Esse arquivo ainda tem fundo. Baixe em PNG com fundo transparente e envie de novo.', 'bad'); return; }
      var cb = await toBlobP(cl, 'image/webp', .92);
      if (draft.backLocal) URL.revokeObjectURL(draft.backLocal);
      draft.backLocal = URL.createObjectURL(cb); draft.delBack = false; fvPrev();
      setLine('j-back', 'Enviando o verso…', 'run');
      var res = await ui.apis.assets.upload(cb);
      draft.back = res.id; draft.newBack = true;
      setLine('j-back', 'Verso pronto. Salve a peça para aparecer no botão Costas do provador.', 'ok');
    } catch (e) { setLine('j-back', 'Não foi possível enviar as costas. Tente de novo.', 'bad'); }
  }
  async function uploadCut(file) {
    setLine('j-cut', 'Lendo o recorte…', 'run');
    try {
      var cl = await clearCut(file);
      if (!cl) { setLine('j-cut', 'Esse arquivo ainda tem fundo. No Canva, ative "Fundo transparente" ao baixar em PNG e envie de novo.', 'bad'); return; }
      draft.manualCut = true;
      if (!draft.file && !draft.photo) { await useReadyCut(file, cl); return; }
      setLine('j-cut', 'Enviando o recorte sem fundo…', 'run');
      var cb = await toBlobP(cl, 'image/webp', .92); var res = await ui.apis.assets.upload(cb);
      draft.cut = res.id; draft.newCut = true; jobs.cutRunning = false; previews();
      setLine('j-cut', 'Recorte preciso aplicado (do arquivo sem fundo). Ele substitui o recorte automático.', 'ok');
    } catch (e) { setLine('j-cut', 'Não foi possível enviar esse recorte. Tente de novo.', 'bad'); }
  }
  async function makeCut() {
    if (!ui.apis.assets) return;
    var src = draft.file || (draft.photo ? imgSrc(draft.photo) : null); if (!src) return;
    jobs.cutRunning = true; previews();
    setLine('j-cut', mlState.sess ? 'Recortando a peça com IA…' : 'Preparando a IA de recorte…', 'run');
    try {
      var im = await loadImage(src), cv = null, viaMl = false;
      try {
        cv = await mlCutout(im, function (pc) {
          if (draft.manualCut) return;
          setLine('j-cut', pc < 100 ? 'Baixando a IA de recorte, só na primeira vez: ' + pc + '%' : 'Recortando a peça com IA…', 'run');
        });
        viaMl = !!cv;
      } catch (e) { try { console.warn('[gs] ia de recorte', e); } catch (_) { /* */ } cv = null; }
      if (!cv && ui.apis.sample) { setLine('j-cut', 'Recortando a peça com o Claude (20 a 60 segundos)…', 'run'); try { cv = await aiCutout(im); } catch (e) { cv = null; } }
      if (!cv) cv = autoCutout(im);
      if (draft.manualCut) return;
      if (!cv) { setLine('j-cut', 'Não deu para separar a peça do fundo. Use foto com fundo liso ou envie um recorte pronto em Ajustar dados.', 'bad'); return; }
      var blob = await new Promise(function (res, rej) { cv.toBlob(function (b) { b ? res(b) : rej(new Error('blob')); }, 'image/webp', .86); });
      if (draft.manualCut) return;
      var up = await ui.apis.assets.upload(blob); if (draft.manualCut) return; draft.cut = up.id; draft.newCut = true;
      setLine('j-cut', viaMl ? 'Recorte com IA pronto. Confira a prévia antes de publicar.' : 'Recorte simples pronto (a IA não carregou). Se não ficou perfeito, toque em Refazer recorte ou envie um PNG sem fundo.', 'ok');
    } catch (e) { setLine('j-cut', 'Não foi possível recortar essa foto.', 'bad'); }
    finally { jobs.cutRunning = false; previews(); }
  }

  /* ---------- dados automáticos: link, foto ou print ---------- */
  var KIND_LIST = Object.keys(KINDS);
  function extractPrompt(source) {
    return 'Você extrai dados de um produto de loja online (Shein, Shopee, Mercado Livre ou outra) para a vitrine de streetwear masculino "' + (state.store.name || 'Garimpados Shop') + '".\n' +
      'Use SOMENTE o que aparece na fonte. Não invente preço nem tamanho: se não aparecer, use null ou [].\n' +
      'Responda só com um objeto JSON neste formato:\n' +
      '{"name":"nome curto em português, até 60 caracteres, sem marca e sem palavras de SEO, ex.: Calça jeans preta vintage de perna larga","price":189.99,"oldPrice":215.9,"sizes":["P","M","G"],"store":"Shein","category":"Calças","kind":"pants"}\n' +
      'price = preço atual em reais (número). oldPrice = preço riscado/antigo, ou null. sizes = tamanhos na ordem da página. ' +
      'category: uma de Jaquetas, Moletons, Camisetas, Calças, Bermudas, Tênis, Bonés, Gorros, Acessórios, Bolsas. ' +
      'kind: um de ' + KIND_LIST.join(', ') + ', ou null se não veste no manequim.\n\n' + source;
  }
  function applyData(d, how) {
    if (!d || typeof d !== 'object') return [];
    var filled = [];
    function put(id, v, label, force) { if (v == null || v === '' || (Array.isArray(v) && !v.length)) return; if (!force && $(id).value.trim()) return; $(id).value = v; filled.push(label); }
    put('f-name', d.name ? String(d.name).slice(0, 90) : '', 'nome', how === 'link');
    var pr = Number(d.price), op = Number(d.oldPrice);
    if (d.price != null && isFinite(pr) && pr > 0) put('f-price', priceInput(pr), 'preço', true);
    if (d.oldPrice != null && isFinite(op) && op > 0 && (!isFinite(pr) || op > pr)) put('f-old', priceInput(op), 'preço antigo', true);
    if (Array.isArray(d.sizes)) put('f-sizes', d.sizes.map(String).join(', ').slice(0, 80), 'tamanhos', true);
    if (d.category) put('f-cat', String(d.category).slice(0, 30), 'categoria');
    if (d.store) put('f-store', String(d.store).slice(0, 30), 'loja');
    if (d.kind && KINDS[d.kind] && !$('f-kind').value) $('f-kind').value = d.kind;
    return filled;
  }
  var SAMPLE_ERR = { not_granted: 'Leitura automática não autorizada.', sampling_disabled: 'O Claude não está disponível nesta conta.', rate_limited: 'Muitas leituras seguidas. Espere um pouco.', image_rejected: 'Não consegui abrir essa imagem.', session_expired: 'Entre de novo no Claude para usar a leitura automática.' };
  async function identify(file) {
    try {
      var d = await ui.apis.sample.json('A imagem é a foto de UMA peça de roupa ou acessório masculino para uma vitrine de streetwear. Descreva a peça. Responda só com JSON: {"name":"nome curto em português, até 55 caracteres, com tipo, cor e detalhe visível, ex.: Moletom zíper preto com bordado vermelho","category":"uma de Jaquetas, Moletons, Camisetas, Calças, Bermudas, Tênis, Bonés, Gorros, Acessórios, Bolsas","kind":"um de ' + KIND_LIST.join(', ') + ', ou null"}', { images: [file], modelTier: 'quick' });
      var f = applyData({ name: d && d.name, category: d && d.category, kind: d && d.kind }, 'foto');
      if (f.length && !$('f-price').value) setLine('j-link', 'Nome e categoria vieram da foto. ' + (ui.apis.mcp ? 'O preço vem do link.' : 'Para mostrar o preço, use "Ler preço por print" em Ajustar dados.'), 'ok');
    } catch (e) { /* segue sem nome automático */ }
  }
  async function readText(text, how) {
    var s = ui.apis.sample;
    if (!s) return applyData(regexParse(text), how);
    try { return applyData(await s.json(extractPrompt('Fonte (' + how + '):\n' + text.slice(0, 9000)), { modelTier: 'quick' }), how); }
    catch (e) { return applyData(regexParse(text), how); }
  }
  async function readPrint(file) {
    var s = ui.apis.sample; if (!s) return;
    setLine('j-link', 'Lendo o print…', 'run');
    try { var f = applyData(await s.json(extractPrompt('Fonte: a imagem anexada é um print da página do produto na loja.'), { images: [file], modelTier: 'default' }), 'link'); setLine('j-link', f.length ? 'Do print: ' + f.join(', ') + '.' : 'Não achei preço nesse print.', f.length ? 'ok' : 'bad'); }
    catch (e) { setLine('j-link', SAMPLE_ERR[e && e.code] || 'Não foi possível ler o print agora.', 'bad'); }
  }
  var MCP_ERR = { server_not_connected: 'O link abre sozinho só pelo app Claude no computador. Aqui, o nome vem da foto.', not_in_manifest: 'O navegador não está liberado para esta página.', approval_required: 'Precisa da sua autorização para abrir o link. Cole o link de novo e aceite.', cancelled: 'Abertura do link cancelada.' };
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  async function fetchFromLink() {
    var link = cleanLink($('f-link').value), m = ui.apis.mcp; if (!link || !m) return;
    setLine('j-link', 'Abrindo o link para puxar nome, preço e tamanhos…', 'run');
    var B = 'host:claude_browser';
    try {
      await m.callTool(B, 'navigate', { url: link }, { cache: false });
      var text = '', title = '';
      for (var i = 0; i < 6; i++) {
        await wait(i ? 2500 : 3500);
        text = pageText(await m.callTool(B, 'get_page_text', { max_chars: 20000 }, { cache: false }));
        if (/risk\/challenge|captcha|confirme que é você|verify|verifica/i.test(text) && !/R\$\s?\d/.test(text)) { setLine('j-link', 'A loja pediu verificação anti-robô. Resolva no navegador do app e cole o link de novo.', 'bad'); return; }
        title = ((text.match(/^Title:\s*(.+)$/m) || [])[1] || '').replace(/\s*\|[^|]*$/, '').trim();
        if (/R\$\s?\d/.test(text)) break;
      }
      if (!title && !/R\$\s?\d/.test(text)) { setLine('j-link', 'A página não carregou. O nome vem da foto; o preço você ajusta depois.', 'bad'); return; }
      var hasPrice = /R\$\s?\d/.test(text);
      var f = await readText(hasPrice ? 'Título da página: ' + title + '\n' + text : 'Título da página: ' + title + '\n(O preço e os tamanhos não apareceram; deixe price null e sizes [].)', 'link');
      setLine('j-link', f.length ? 'Do link: ' + f.join(', ') + '.' + (hasPrice ? '' : ' O preço não apareceu: use "Ler preço por print".') : 'Não achei os dados no link.', f.length ? 'ok' : 'bad');
    } catch (e) { setLine('j-link', MCP_ERR[e && e.code] || 'Não consegui abrir o link agora.', 'bad'); }
  }

  function resetForm() {
    ui.editing = null; $('pf').reset(); if (draft.local) URL.revokeObjectURL(draft.local); if (draft.backLocal) URL.revokeObjectURL(draft.backLocal);
    draft = { photo: '', cut: '', newPhoto: false, newCut: false, file: null, local: '', manualCut: false, back: '', newBack: false, backLocal: '', delBack: false, m3d: '', newM3d: false, delM3d: false }; jobs = { cut: null, info: null, link: null };
    previews(); m3dPrev(); anafFill(null); setLine('j-link', ''); setLine('j-cut', ''); setLine('j-back', ''); setLine('j-3d', ''); clearTimeout(pickWatch.timer); if ($('nogal')) $('nogal').hidden = true;
    $('pf-h').textContent = 'Nova peça'; $('f-submit').textContent = 'Adicionar à vitrine'; $('f-cancel').hidden = true; $('more').open = false; setStatus('');
  }
  function refreshAdmin() {
    if (!ui.adminBuilt) return;
    var dl = $('f-cats'), seen = {}, opts = '';
    ['Jaquetas', 'Moletons', 'Camisetas', 'Calças', 'Bermudas', 'Tênis', 'Bonés', 'Acessórios'].concat(state.products.map(function (p) { return p.category; })).forEach(function (c) { if (c && !seen[c]) { seen[c] = 1; opts += '<option value="' + esc(c) + '">'; } });
    dl.innerHTML = opts;
    $('p-count').textContent = String(state.products.length);
    var list = $('plist');
    list.innerHTML = state.products.length ? state.products.map(function (p) {
      return '<div class="pitem' + (p.hidden ? ' is-hidden' : '') + '"><span class="pitem__th">' + imgTag(thumbOf(p) || photoOf(p, 0), '', '', ' loading="lazy"') + '</span>' +
        '<span class="pitem__nm"><b>' + esc(p.name) + '</b><small class="mono">' + [p.price != null ? money(p.price) : 'sem preço', p.store, p.hidden ? 'oculta' : ''].filter(Boolean).map(esc).join(' · ') + '</small></span>' +
        '<span class="pitem__acts"><button type="button" class="mini" data-act="edit" data-pid="' + p.id + '">Editar</button><button type="button" class="mini' + (p.hot ? ' mini--gold' : '') + '" data-act="hot" data-pid="' + p.id + '" aria-pressed="' + !!p.hot + '">' + (p.hot ? 'Quente' : 'Pôr em oferta') + '</button><button type="button" class="mini" data-act="hide" data-pid="' + p.id + '">' + (p.hidden ? 'Mostrar' : 'Ocultar') + '</button><button type="button" class="mini mini--x" data-act="del" data-pid="' + p.id + '">Apagar</button></span></div>';
    }).join('') : '<p class="muted">Nenhuma peça ainda. Cole um link e escolha a foto acima.</p>';
    Array.prototype.forEach.call(list.querySelectorAll('[data-act]'), function (b) {
      var id = b.getAttribute('data-pid'), act = b.getAttribute('data-act'), armed = false, timer = 0;
      b.addEventListener('click', function () {
        if (act === 'edit') startEdit(id);
        else if (act === 'hide') toggleHidden(id);
        else if (act === 'hot') toggleHot(id);
        else { if (!armed) { armed = true; b.textContent = 'Confirmar'; b.classList.add('is-armed'); timer = setTimeout(function () { armed = false; b.textContent = 'Apagar'; b.classList.remove('is-armed'); }, 4000); return; } clearTimeout(timer); removeProduct(id); }
      });
    });
    $('s-name').value = state.store.name || ''; $('s-tag').value = state.store.tagline || ''; $('s-ig').value = state.store.instagram ? '@' + state.store.instagram : '';
    $('s-zap').value = (state.store.whatsapp || '').replace(/^55/, '');
    AFF_STORES.forEach(function (a) { $('s-aff-' + a[0]).value = (state.store.aff || {})[a[0]] || ''; });
  }
  function startEdit(id) {
    var p = byId(id); if (!p) return; resetForm(); ui.editing = id;
    $('f-link').value = p.link || ''; $('f-name').value = p.name || ''; $('f-price').value = priceInput(p.price); $('f-old').value = priceInput(p.oldPrice);
    $('f-cat').value = p.category || ''; $('f-store').value = p.store || ''; $('f-sizes').value = sizesOf(p).join(', '); $('f-kind').value = p.kind || ''; $('f-hot').checked = !!p.hot;
    draft.photo = p.img || photoOf(p, 0) || ''; draft.cut = p.cutImg || p.cut || ''; previews(); m3dPrev();
    PONTOS.forEach(function (pt) { $('f-pt-' + pt[0]).value = (p.pontos && p.pontos[pt[0]]) || ''; });
    anafFill(p); $('f-nota').value = p.nota || '';
    $('pf-h').textContent = 'Editar peça'; $('f-submit').textContent = 'Salvar alterações'; $('f-cancel').hidden = false; $('more').open = true;
    $('pf').scrollIntoView({ block: 'start', behavior: REDUCED ? 'auto' : 'smooth' }); $('f-link').focus({ preventScroll: true });
  }
  async function onSubmitProduct(ev) {
    ev.preventDefault(); if (ui.busy) return;
    var link = cleanLink($('f-link').value); if (!link) { setStatus('Cole o link de afiliado, começando com https://.', true); $('f-link').focus(); return; }
    var prev = ui.editing ? byId(ui.editing) : null;
    if (!prev && !draft.file) { setStatus('Escolha a foto da peça.', true); return; }
    $('f-submit').disabled = true;
    try {
      setStatus('Terminando a foto e o recorte…');
      await Promise.all([jobs.photo, jobs.cut, jobs.link, jobs.back].filter(Boolean));
      if (jobs.info) await Promise.race([jobs.info, wait(12000)]);
      if (draft.file && !draft.photo) { setStatus('A foto não foi enviada. Escolha de novo.', true); return; }
      var price = parsePrice($('f-price').value); if (price !== null && isNaN(price)) { setStatus('Preço inválido. Use 89,90.', true); $('more').open = true; return; }
      var old = parsePrice($('f-old').value); if (old !== null && isNaN(old)) { setStatus('Preço antigo inválido.', true); $('more').open = true; return; }
      var kindSel = $('f-kind').value, nameIn = $('f-name').value.trim();
      var guessKind = kindSel || kindOf({ name: nameIn, category: $('f-cat').value });
      var name = nameIn || (guessKind && KINDS[guessKind] ? KINDS[guessKind].label + ' garimpado' : 'Peça garimpada');
      var prod = Object.assign({}, prev || {}, {
        id: ui.editing || ('p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5)),
        name: name, link: link, store: $('f-store').value.trim() || detectStore(link), price: price, oldPrice: old,
        category: $('f-cat').value.trim() || autoCategory({ name: name, kind: kindSel }), sizes: sizesOf({ sizes: $('f-sizes').value }), kind: kindSel,
        badge: prev ? prev.badge : 'novo', createdAt: prev ? prev.createdAt : new Date().toISOString(), hidden: prev ? !!prev.hidden : false,
        priceAt: prev && prev.price === price && prev.priceAt ? prev.priceAt : new Date().toISOString(),
        hot: $('f-hot').checked
      });
      if (draft.newPhoto) { prod.img = draft.photo; delete prod.photos; delete prod.photo; delete prod.img2; }
      if (draft.newCut) { prod.cutImg = draft.cut; prod.cut = ''; } else if (draft.newPhoto) { delete prod.cutImg; prod.cut = ''; }
      if (draft.newBack) { prod.backImg = draft.back; delete prod.cutBack; } else if (draft.delBack) { delete prod.backImg; delete prod.cutBack; }
      if (draft.newM3d) { prod.model3d = draft.m3d; delete prod.glb; delete prod.glbDemo; } else if (draft.delM3d) { delete prod.model3d; delete prod.glb; delete prod.glbDemo; }
      var pts = {}; PONTOS.forEach(function (pt) { var v = $('f-pt-' + pt[0]).value.trim(); if (v) pts[pt[0]] = v; });
      if (Object.keys(pts).length) prod.pontos = pts; else delete prod.pontos;
      var an = anafLer(); if (an) prod.anat = an; else delete prod.anat;
      var nt = $('f-nota').value.trim(); if (nt) prod.nota = nt; else delete prod.nota;
      if (prod.sample && link) delete prod.sample;
      if (prev) state.products = state.products.map(function (p) { return p.id === prev.id ? prod : p; }); else state.products.unshift(prod);
      await commit(prev ? 'Peça atualizada.' : 'Peça publicada na vitrine.');
    } catch (e) { setStatus(errMsg(e), true); }
    finally { $('f-submit').disabled = false; }
  }
  async function onSubmitStore(ev) {
    ev.preventDefault(); if (ui.busy) return;
    var name = $('s-name').value.trim(), st = $('s-status'); if (!name) { st.textContent = 'Dê um nome à loja.'; st.className = 'status is-bad'; return; }
    var ig = $('s-ig').value.trim().replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/^@/, '').replace(/\/.*$/, '');
    if (ig && !/^[A-Za-z0-9._]{1,30}$/.test(ig)) { st.textContent = 'Instagram inválido.'; st.className = 'status is-bad'; return; }
    var aff = {}, bad = '';
    AFF_STORES.forEach(function (a) { var v = $('s-aff-' + a[0]).value.trim().replace(/^[?&]/, ''); if (v && !/^[A-Za-z0-9_.\-]+=.+$/.test(v)) bad = a[1]; if (v) aff[a[0]] = v; });
    if (bad) { st.textContent = 'ID de afiliado da ' + bad + ' precisa ser no formato parametro=valor.'; st.className = 'status is-bad'; return; }
    var zap = $('s-zap').value.replace(/\D/g, '');
    if (zap && (zap.length < 10 || zap.length > 13)) { st.textContent = 'WhatsApp inválido: use DDD + número.'; st.className = 'status is-bad'; return; }
    if (zap && zap.length <= 11) zap = '55' + zap;
    state.store = { name: name, tagline: $('s-tag').value.trim(), instagram: ig, aff: aff, whatsapp: zap };
    if (atende) atende.atualizar(zap);
    try { await commit('Dados da loja salvos.'); } catch (e) { st.textContent = errMsg(e); st.className = 'status is-bad'; }
  }
  async function toggleHidden(id) { state.products = state.products.map(function (p) { return p.id === id ? Object.assign({}, p, { hidden: !p.hidden }) : p; }); try { await commit('Visibilidade atualizada.'); } catch (e) { toast(errMsg(e)); } }
  async function toggleHot(id) { state.products = state.products.map(function (p) { return p.id === id ? Object.assign({}, p, { hot: !p.hot }) : p; }); try { await commit('Ofertas atualizadas.'); } catch (e) { toast(errMsg(e)); } }
  async function removeProduct(id) { state.products = state.products.filter(function (p) { return p.id !== id; }); try { await commit('Peça apagada.'); } catch (e) { toast(errMsg(e)); } }
  /* ================= LOTE ================= */
  function copyText(t, btn) {
    var done = function () { if (btn) btn.textContent = 'Link copiado'; };
    try { if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(t).then(done, function () { fallback(); }); return; } } catch (e) { /* */ }
    fallback();
    function fallback() { var i = document.createElement('textarea'); i.value = t; i.setAttribute('readonly', ''); i.style.position = 'fixed'; i.style.opacity = '0'; document.body.appendChild(i); i.select(); try { document.execCommand('copy'); done(); } catch (e) { toast('Segure no link e copie: ' + t); } i.remove(); }
  }
  var lote = { files: [], busy: false, items: [] };
  function splitCsvLine(line, sep) {
    var out = [], cur = '', q = false;
    for (var i = 0; i < line.length; i++) {
      var ch = line[i];
      if (q) { if (ch === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += ch; }
      else if (ch === '"') q = true; else if (ch === sep) { out.push(cur); cur = ''; } else cur += ch;
    }
    out.push(cur); return out.map(function (x) { return x.trim(); });
  }
  var COLS = { link: /^(link|url|afiliado|link de afiliado)$/, name: /^(nome|name|produto|titulo|título)$/, price: /^(pre[cç]o|price|valor|pre[cç]o promocional|promo)$/, oldPrice: /^(pre[cç]o antigo|antigo|de|old|oldprice|pre[cç]o original)$/, sizes: /^(tamanhos?|sizes?)$/, category: /^(categoria|category)$/, photo: /^(foto|imagem|image|photo|img)$/ };
  function parseLote(text) {
    var lines = String(text || '').split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean);
    if (!lines.length) return [];
    var first = lines[0], sep = first.indexOf('\t') >= 0 ? '\t' : first.indexOf(';') >= 0 ? ';' : (/^https?:\/\//i.test(first) && first.indexOf(',') < 0 ? ';' : ',');
    var head = splitCsvLine(first, sep).map(function (x) { return norm(x); }), map = null;
    if (head.some(function (h0) { return COLS.link.test(h0); })) { map = {}; head.forEach(function (h0, i) { Object.keys(COLS).forEach(function (k) { if (COLS[k].test(h0) && map[k] == null) map[k] = i; }); }); lines = lines.slice(1); }
    var order = ['link', 'name', 'price', 'oldPrice', 'sizes', 'category', 'photo'];
    return lines.map(function (l) {
      /* linha só com link: pega o primeiro https da linha */
      var cells = splitCsvLine(l, sep), r = {};
      if (map) Object.keys(map).forEach(function (k) { r[k] = cells[map[k]] || ''; });
      else order.forEach(function (k, i) { r[k] = cells[i] || ''; });
      if (!/^https?:\/\//i.test(r.link || '')) { var m = l.match(/https?:\/\/\S+/); r.link = m ? m[0].replace(/[;,]+$/, '') : ''; }
      r.link = cleanLink(r.link);
      return r;
    }).filter(function (r) { return r.link; });
  }
  function loteRows() { return parseLote($('l-text').value); }
  function renderLotePrev() {
    var rows = loteRows(), fl = lote.files, el = $('l-prev');
    var n = Math.max(rows.length, 0);
    $('l-pick-t').textContent = fl.length ? fl.length + (fl.length === 1 ? ' foto escolhida' : ' fotos escolhidas') : 'Escolher fotos';
    if (!n) { el.innerHTML = fl.length ? '<p class="muted">Agora cole os links na mesma ordem das fotos.</p>' : ''; $('l-go').disabled = true; $('l-go').textContent = 'Criar peças'; return; }
    el.innerHTML = '<ol>' + rows.slice(0, 60).map(function (r, i) {
      var f = fl[i], th = f ? '<img src="' + (f._u || (f._u = URL.createObjectURL(f))) + '" alt="">' : (r.photo ? '<img src="' + esc(r.photo) + '" alt="" referrerpolicy="no-referrer">' : '<span class="lote__nf">sem foto</span>');
      return '<li><span class="lote__th">' + th + '</span><span class="lote__tx"><b>' + esc(r.name || detectStore(r.link) + ' · peça ' + (i + 1)) + '</b><small class="mono">' + esc([detectStore(r.link), r.price ? 'R$ ' + r.price : '', r.sizes].filter(Boolean).join(' · ')) + '</small></span></li>';
    }).join('') + '</ol>' + (rows.length > 60 ? '<p class="muted">+ ' + (rows.length - 60) + ' peças</p>' : '') +
      (fl.length && fl.length !== rows.length ? '<p class="status is-bad">São ' + rows.length + ' links e ' + fl.length + ' fotos. As peças sem foto entram ocultas, para completar depois.</p>' : '');
    $('l-go').disabled = false; $('l-go').textContent = 'Preparar ' + rows.length + (rows.length === 1 ? ' peça' : ' peças');
  }
  function setLote(msg, bad) { var x = $('l-status'); x.textContent = msg || ''; x.className = 'status' + (bad ? ' is-bad' : ''); }
  function bindLote() {
    var t = 0;
    $('l-text').addEventListener('input', function () { clearTimeout(t); t = setTimeout(renderLotePrev, 250); });
    var takeFiles = function (e) { var fs = Array.prototype.slice.call((e.target.files) || []).filter(function (f) { return /^image\//.test(f.type) || /\.(jpe?g|png|webp|heic|avif)$/i.test(f.name); }); e.target.value = ''; if (!fs.length) return; lote.files.forEach(function (f) { if (f._u) URL.revokeObjectURL(f._u); }); lote.files = fs; renderLotePrev(); };
    $('l-photos').addEventListener('change', takeFiles); $('l-photos2').addEventListener('change', takeFiles);
    $('l-csv').addEventListener('change', function (e) {
      var f = e.target.files && e.target.files[0]; e.target.value = ''; if (!f) return;
      var rd = new FileReader(); rd.onload = function () { var txt = String(rd.result || '').replace(/^﻿/, ''); $('l-text').value = txt; renderLotePrev(); setLote(loteRows().length + ' linhas lidas da planilha.'); };
      rd.onerror = function () { setLote('Não consegui ler esse arquivo. Salve a planilha como CSV.', true); }; rd.readAsText(f);
    });
    $('l-model').addEventListener('click', function () {
      var csv = '﻿link;nome;preco;preco antigo;tamanhos;categoria;foto\nhttps://onelink.shein.com/...;Moletom capuz cinza;159,90;189,90;P, M, G;Moletons;\n';
      var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'modelo-garimpados.csv'; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
      setLote('Modelo baixado. Abra no Planilhas Google ou Excel, preencha e importe de volta como CSV.');
    });
    $('l-go').addEventListener('click', prepLote);
    $('l-pub').addEventListener('click', publishLote);
    $('l-drop').addEventListener('click', function () { if (lote.busy) return; lote.items = []; saveLoteDraft(); renderLoteRev(); setLote('Lote descartado.'); });
    var rev = $('l-rev');
    rev.addEventListener('click', function (e) {
      var b = e.target.closest('[data-lrm],[data-lretry]'); if (!b) return;
      var it = lote.items[+(b.getAttribute('data-lrm') || b.getAttribute('data-lretry'))]; if (!it) return;
      if (b.hasAttribute('data-lrm')) { lote.items.splice(lote.items.indexOf(it), 1); saveLoteDraft(); renderLoteRev(); return; }
      it.status = 'fila'; it.err = ''; renderLoteRev(); runLoteQueue();
    });
    rev.addEventListener('change', function (e) {
      var el = e.target, row = el.closest('[data-li]'); if (!row) return;
      var it = lote.items[+row.getAttribute('data-li')]; if (!it || !it.prod) return;
      if (el.type === 'file') { var f = el.files && el.files[0]; el.value = ''; if (f) { it.file = f; it.prod.img = ''; it.prod.cutImg = ''; it.photoDone = false; it.status = 'fila'; renderLoteRev(); runLoteQueue(); } return; }
      readLoteRow(it, row); saveLoteDraft();
    });
    bindPickers(rev);
    /* rascunho de um lote que ficou pela metade (internet caiu, aba fechou): volta para a revisão */
    var d = readLS('gs-lote', null);
    if (d && Array.isArray(d.items) && d.items.length) {
      lote.items = d.items.map(function (it) { if (it.status !== 'pronto' && it.status !== 'erro') { it.status = it.photoDone || !it.needPhoto ? 'fila' : 'sem-foto'; } return it; });
      renderLoteRev(); setLote('Você tinha um lote pela metade. Confira e publique, ou descarte.');
      runLoteQueue();
    }
  }
  /* ---------- lote: 1) preparar (lê os links e sobe as fotos) 2) revisar 3) publicar tudo de uma vez ---------- */
  var LOTE_POOL = 3;
  function saveLoteDraft() {
    writeLS('gs-lote', { at: Date.now(), items: lote.items.map(function (it) { return { r: it.r, prod: it.prod, status: it.status, err: it.err, infoDone: it.infoDone, photoDone: it.photoDone, needPhoto: it.needPhoto }; }) });
  }
  function loteDone() { return lote.items.filter(function (it) { return it.status === 'pronto' || it.status === 'erro' || it.status === 'sem-foto'; }).length; }
  function renderLoteProg(msg) {
    var tot = lote.items.length, done = loteDone(), pg = $('l-prog'); if (!pg) return;
    pg.hidden = !tot;
    $('l-prog-t').textContent = done + ' de ' + tot + ' prontas';
    $('l-prog-s').textContent = msg || '';
    $('l-prog-b').style.transform = 'scaleX(' + (tot ? done / tot : 0) + ')';
  }
  var LSTAT = { fila: 'Na fila', link: 'Lendo o link…', foto: 'Subindo a foto…', recorte: 'Recortando…', pronto: 'Pronta', erro: 'Erro', 'sem-foto': 'Falta a foto' };
  function renderLoteRev() {
    var el = $('l-rev'); if (!el) return;
    /* guarda o que a pessoa já digitou e onde está o cursor antes de redesenhar a lista */
    var ae = document.activeElement, keepLi = null, keepK = null, keepS = 0;
    Array.prototype.forEach.call(el.querySelectorAll('[data-li]'), function (row) { var it = lote.items[+row.getAttribute('data-li')]; if (it && it.status === 'pronto') readLoteRow(it, row); });
    if (ae && el.contains(ae) && ae.getAttribute('data-k')) { keepLi = ae.closest('[data-li]').getAttribute('data-li'); keepK = ae.getAttribute('data-k'); try { keepS = ae.selectionStart; } catch (e) { keepS = 0; } }
    setTimeout(function () { if (keepK == null) return; var f = el.querySelector('[data-li="' + keepLi + '"] [data-k="' + keepK + '"]'); if (f) { f.focus({ preventScroll: true }); try { f.setSelectionRange(keepS, keepS); } catch (e) { /* select */ } } }, 0);
    var cats = categoriesOf(state.products).map(function (c) { return c[0]; });
    el.innerHTML = lote.items.length ? '<ol class="lrev__list">' + lote.items.map(function (it, i) {
      var p = it.prod || {}, th = p.cutImg ? imgSrc(p.cutImg) : p.img ? imgSrc(p.img) : (it.file ? (it.file._u || (it.file._u = URL.createObjectURL(it.file))) : '');
      var busy = it.status !== 'pronto' && it.status !== 'erro' && it.status !== 'sem-foto';
      return '<li class="lrev__it is-' + it.status + '" data-li="' + i + '">' +
        '<label class="lrev__th" aria-label="Trocar a foto da peça ' + (i + 1) + '">' + (th ? '<img src="' + esc(th) + '" alt="">' : '<span>Foto</span>') + '<input class="file-in" type="file" accept="image/*"></label>' +
        '<div class="lrev__f">' +
          '<p class="lrev__st"><b>' + (i + 1) + '.</b> <span>' + LSTAT[it.status] + (it.err ? ': ' + esc(it.err) : '') + '</span>' + (busy ? '<i class="spin" aria-hidden="true"></i>' : '') + '</p>' +
          '<input class="lrev__in" data-k="name" type="text" maxlength="90" aria-label="Nome" placeholder="Nome" value="' + esc(p.name || '') + '"' + (busy ? ' disabled' : '') + '>' +
          '<div class="lrev__r">' +
            '<input class="lrev__in" data-k="price" type="text" inputmode="decimal" aria-label="Preço" placeholder="Preço" value="' + esc(priceInput(p.price)) + '"' + (busy ? ' disabled' : '') + '>' +
            '<input class="lrev__in" data-k="oldPrice" type="text" inputmode="decimal" aria-label="Preço antigo" placeholder="Antigo" value="' + esc(priceInput(p.oldPrice)) + '"' + (busy ? ' disabled' : '') + '>' +
          '</div>' +
          '<input class="lrev__in" data-k="sizes" type="text" maxlength="80" aria-label="Tamanhos" placeholder="Tamanhos: P, M, G" value="' + esc(sizesOf(p).join(', ')) + '"' + (busy ? ' disabled' : '') + '>' +
          '<div class="lrev__r">' +
            '<input class="lrev__in" data-k="category" type="text" maxlength="30" list="f-cats" aria-label="Categoria" placeholder="Categoria" value="' + esc(p.category || '') + '"' + (busy ? ' disabled' : '') + '>' +
            '<select class="lrev__in" data-k="kind" aria-label="Veste em"' + (busy ? ' disabled' : '') + '>' + kindOptions().replace('value="' + (p.kind || '') + '"', 'value="' + (p.kind || '') + '" selected') + '</select>' +
          '</div>' +
          '<div class="mini-row">' + (it.status === 'erro' || it.status === 'sem-foto' ? '<button class="mini mini--gold" type="button" data-lretry="' + i + '">Tentar de novo</button>' : '') + '<button class="mini" type="button" data-lrm="' + i + '">Tirar do lote</button></div>' +
        '</div></li>';
    }).join('') + '</ol>' : '';
    var ready = lote.items.filter(function (it) { return it.status === 'pronto'; }).length;
    $('l-acts').hidden = !lote.items.length;
    $('l-pub').disabled = !ready || lote.busy;
    $('l-pub').textContent = ready ? 'Publicar ' + ready + (ready === 1 ? ' peça' : ' peças') : 'Publicar tudo';
    renderLoteProg();
    if (cats.length) { var dl = $('f-cats'); if (dl && !dl.options.length) dl.innerHTML = cats.map(function (c) { return '<option value="' + esc(c) + '">'; }).join(''); }
  }
  function readLoteRow(it, row) {
    var p = it.prod; if (!p) return;
    Array.prototype.forEach.call(row.querySelectorAll('[data-k]'), function (inp) {
      var k = inp.getAttribute('data-k'), v = inp.value.trim();
      if (k === 'price' || k === 'oldPrice') { var n = v ? parsePrice(v) : null; p[k] = n == null || isNaN(n) ? null : n; }
      else if (k === 'sizes') p.sizes = sizesOf({ sizes: v });
      else if (k === 'kind') p.kind = v;
      else p[k] = v;
    });
    if (p.oldPrice != null && p.price != null && p.oldPrice <= p.price) p.oldPrice = null;
  }
  function prepLote() {
    if (lote.busy || ui.busy) return;
    var rows = loteRows(); if (!rows.length) { setLote('Cole pelo menos um link.', true); return; }
    if (!ui.apis.assets) { setLote('Envio de fotos não está liberado nesta visualização.', true); return; }
    var base = Date.now(), allHot = $('l-hot').checked;
    var fresh = rows.map(function (r, i) {
      var file = lote.files[i] || null;
      return { r: r, file: file, needPhoto: !!(file || r.photo), status: 'fila', err: '', infoDone: !!(r.name && r.price), photoDone: !(file || r.photo),
        prod: { id: 'p' + (base + i).toString(36) + Math.random().toString(36).slice(2, 5), link: r.link, store: detectStore(r.link), name: (r.name || '').slice(0, 90),
          price: r.price ? (isNaN(parsePrice(r.price)) ? null : parsePrice(r.price)) : null, oldPrice: r.oldPrice ? (isNaN(parsePrice(r.oldPrice)) ? null : parsePrice(r.oldPrice)) : null,
          sizes: sizesOf({ sizes: r.sizes || '' }), category: (r.category || '').slice(0, 30), kind: '', badge: 'novo', hot: allHot, hidden: false,
          createdAt: new Date(base - i * 1000).toISOString(), priceAt: new Date().toISOString(), cut: '' } };
    });
    lote.items = lote.items.concat(fresh);
    $('l-text').value = ''; lote.files = []; renderLotePrev();
    saveLoteDraft(); renderLoteRev(); setLote('Preparando ' + fresh.length + ' peças. Pode revisar as que forem ficando prontas.');
    runLoteQueue();
  }
  /* um navegador só lê os links (um de cada vez); as fotos sobem em paralelo, 3 por vez, enquanto isso */
  var lq = { link: false, photos: 0 };
  function runLoteQueue() {
    lote.busy = lote.items.some(function (it) { return it.status === 'fila' || it.status === 'link' || it.status === 'foto' || it.status === 'recorte'; });
    renderLoteRev();
    if (!lq.link) {
      var nx = lote.items.filter(function (it) { return it.status !== 'erro' && !it.infoDone && !it.linkBusy; })[0];
      if (nx) { lq.link = true; nx.linkBusy = true; loteInfo(nx).then(function () { nx.linkBusy = false; lq.link = false; finishItem(nx); runLoteQueue(); }); }
    }
    while (lq.photos < LOTE_POOL) {
      var np = lote.items.filter(function (it) { return it.status !== 'erro' && !it.photoDone && !it.photoBusy && (it.file || (it.r && it.r.photo)); })[0];
      if (!np) break;
      lq.photos++; np.photoBusy = true;
      lotePhoto(np).then(function (it) { return function () { it.photoBusy = false; lq.photos--; finishItem(it); runLoteQueue(); }; }(np));
    }
    lote.items.forEach(function (it) { if (!it.photoDone && !it.photoBusy && !it.file && !(it.r && it.r.photo) && it.needPhoto && it.status !== 'erro') it.status = 'sem-foto'; });
    if (!lote.busy && lote.items.length) { var ok = lote.items.filter(function (it) { return it.status === 'pronto'; }).length; setLote(ok + ' de ' + lote.items.length + ' prontas. Revise e toque em Publicar.'); }
  }
  async function loteInfo(it) {
    if (it.status === 'fila') it.status = 'link'; renderLoteRev();
    var info = null;
    for (var t = 0; t < 2 && !info; t++) info = await dataFromLink(it.r.link);
    info = info || {}; var p = it.prod;
    if (!p.name && info.name) p.name = String(info.name).slice(0, 90);
    if (p.price == null && isFinite(+info.price) && +info.price > 0) p.price = +info.price;
    if (p.oldPrice == null && isFinite(+info.oldPrice) && +info.oldPrice > 0 && (p.price == null || +info.oldPrice > p.price)) p.oldPrice = +info.oldPrice;
    if (!p.sizes.length && Array.isArray(info.sizes)) p.sizes = sizesOf({ sizes: info.sizes.join(',') });
    if (info.store) p.store = info.store;
    if (!p.category && info.category) p.category = String(info.category).slice(0, 30);
    if (!p.kind && info.kind && KINDS[info.kind]) p.kind = info.kind;
    if (info.stats) p.stats = info.stats;
    it.infoDone = true;
    if (!ui.apis.mcp && !p.name) it.err = 'sem leitor de links aqui, preencha à mão';
  }
  async function lotePhoto(it) {
    var p = it.prod;
    try {
      if (it.status !== 'link') it.status = 'foto'; renderLoteRev();
      var file = it.file || await photoFromUrl(it.r.photo);
      if (!file) { if (it.r.photo) { p.photos = [it.r.photo]; it.photoDone = true; return; } throw new Error('foto'); }
      var ready = null; try { ready = await clearCut(file); } catch (e) { ready = null; }
      if (ready) { var rb = await toBlobP(ready, 'image/webp', .92); var ru = await ui.apis.assets.upload(rb); p.img = ru.id; p.cutImg = ru.id; }
      else {
        var pb = await shrink(file, false); p.img = (await ui.apis.assets.upload(pb)).id;
        if ($('l-cut').checked) { if (it.status !== 'link') it.status = 'recorte'; renderLoteRev(); try { var cb = await cutFile(file); if (cb) p.cutImg = (await ui.apis.assets.upload(cb)).id; } catch (e) { /* sem recorte: a peça entra só com a foto */ } }
      }
      if (!p.name && ui.apis.sample) { try { var d = await ui.apis.sample.json('A imagem é UMA peça de roupa masculina streetwear. Responda só JSON: {"name":"nome curto em português até 55 caracteres com tipo, cor e detalhe","category":"uma de Jaquetas, Moletons, Camisetas, Calças, Bermudas, Tênis, Bonés, Gorros, Acessórios, Bolsas","kind":"um de ' + KIND_LIST.join(', ') + ' ou null"}', { images: [file], modelTier: 'quick' }); if (d) { if (!p.name) p.name = String(d.name || '').slice(0, 90); if (!p.category && d.category) p.category = d.category; if (!p.kind && d.kind && KINDS[d.kind]) p.kind = d.kind; } } catch (e) { /* */ } }
      it.photoDone = true;
    } catch (e) { it.status = 'erro'; it.err = 'a foto não subiu'; }
  }
  function finishItem(it) {
    if (it.status === 'erro') { saveLoteDraft(); return; }
    if (it.infoDone && it.photoDone) {
      var p = it.prod;
      if (!p.name) p.name = (p.store || 'Peça') + ' garimpada';
      if (!p.category) p.category = autoCategory(p);
      if (!p.img && !(p.photos && p.photos.length)) p.hidden = true;
      it.status = 'pronto';
    } else it.status = !it.infoDone && it.linkBusy ? 'link' : !it.photoDone && it.photoBusy ? 'foto' : 'fila';
    saveLoteDraft();
  }
  async function publishLote() {
    if (ui.busy) return;
    Array.prototype.forEach.call(document.querySelectorAll('#l-rev [data-li]'), function (row) { var it = lote.items[+row.getAttribute('data-li')]; if (it && it.status === 'pronto') readLoteRow(it, row); });
    var ready = lote.items.filter(function (it) { return it.status === 'pronto'; }), made = ready.map(function (it) { return it.prod; });
    if (!made.length) return;
    var rest = lote.items.filter(function (it) { return ready.indexOf(it) < 0; });
    $('l-pub').disabled = true; renderLoteProg('Publicando ' + made.length + ' peças…');
    state.products = made.concat(state.products);
    var keep = lote.items; lote.items = rest; saveLoteDraft();
    try { await commit(made.length + (made.length === 1 ? ' peça publicada.' : ' peças publicadas.') + (rest.length ? ' ' + rest.length + ' ficaram no lote para completar.' : '')); }
    catch (e) { state.products = state.products.filter(function (p) { return made.indexOf(p) < 0; }); lote.items = keep; saveLoteDraft(); renderLoteRev(); setLote(errMsg(e), true); }
  }
  async function photoFromUrl(u) {
    try { var r = await fetch(u, { mode: 'cors', referrerPolicy: 'no-referrer' }); if (!r.ok) return null; var b = await r.blob(); return /^image\//.test(b.type) ? new File([b], 'foto', { type: b.type }) : null; } catch (e) { return null; }
  }
  async function dataFromLink(link) {
    var m = ui.apis.mcp; if (!m) return null; var B = 'host:claude_browser';
    try {
      await m.callTool(B, 'navigate', { url: link }, { cache: false });
      var text = '';
      for (var i = 0; i < 4; i++) { await wait(i ? 2200 : 3200); text = pageText(await m.callTool(B, 'get_page_text', { max_chars: 20000 }, { cache: false })); if (/R\$\s?\d/.test(text)) break; }
      if (!text) return null;
      if (ui.apis.sample) { try { return await ui.apis.sample.json(extractPrompt('Fonte (link):\n' + text.slice(0, 9000)), { modelTier: 'quick' }); } catch (e) { /* regex */ } }
      return regexParse(text);
    } catch (e) { return null; }
  }
  async function cutFile(file) {
    var im = await loadImage(file), cv = null;
    try { cv = await mlCutout(im, function () { }); } catch (e) { cv = null; }
    if (!cv) cv = autoCutout(im);
    if (!cv) return null;
    return await toBlobP(cv, 'image/webp', .86);
  }
  function openAdmin(editId) { if (!ui.adminBuilt) return; var pn = $('panel'); showLayer(pn, closeAdmin); $('fab').hidden = true; app.inert = true; if (editId) setTimeout(function () { startEdit(editId); }, 60); else setTimeout(function () { $('pn-title').focus({ preventScroll: true }); }, 60); }
  function closeAdmin(fromPop) { var pn = $('panel'); if (!pn || !layerOpen(pn)) return; hideLayer(pn, fromPop === true); $('fab').hidden = false; app.inert = false; $('fab').focus({ preventScroll: true }); }

  /* ================================================================
     INÍCIO
     ================================================================ */
  /* veio por um link de produto (/p/id/): a página inicial fica por baixo e a ficha abre por cima */
  var linkPeca = PUB && location.pathname.match(/^\/p\/([^/]+)/);
  if (linkPeca) { try { history.replaceState(null, '', '/'); } catch (e) { /* */ } }
  renderShell(); bind(); renderHero(); renderKicks(); renderHot(); renderFit(); updateShop(); syncCart();
  if (linkPeca && byId(decodeURIComponent(linkPeca[1]))) openSheet(decodeURIComponent(linkPeca[1]));
  /* vendedor: vê o catálogo inteiro (roupas e tênis), abre a ficha, manda pro provador e sabe qual peça está aberta */
  var provT = 0;
  if (window.GSAtende) atende = GSAtende.montar({
    zap: state.store.whatsapp || '', pecas: function () { return shopList(); }, fmt: money, faqEl: $('duvidas'), ico: ico,
    abrirPeca: function (id) { openSheet(id); },
    info: function (p) { return { thumb: thumbOf(p) || photoOf(p, 0), link: p.link && !isSample(p) ? affLink(p) : '', provar: canWear(p) }; },
    numeros: numeracoesBR,
    publico: PUB,
    atual: function () { return ui.sheet; },
    provar: function (id, varios) {
      var p = byId(id); if (!p || !canWear(p)) return;
      if (!varios) { tryOn(id); return; }
      /* look inteiro: veste todas as peças e desce até o provador uma vez só */
      var slot = KINDS[kindOf(p)].slot; vestir(slot, id); ui.filled = ui.filled || {}; ui.filled[slot] = 1;
      clearTimeout(provT); provT = setTimeout(function () { closeSheet(); go('provador', function () { renderFit(); }); }, 40);
    }
  });
  runIntro(function () { heroEntrance(); montarAnatomia(); initMotion(); revealCards(); });
  pausaFora();
  carregaCliques();
  try { var msg = sessionStorage.getItem('gs-toast'); if (msg) { sessionStorage.removeItem('gs-toast'); toast(msg); } } catch (e) { /* */ }
  (async function () {
    try {
      var c = window.claude; if (!c || !c.use) return;
      var user = await c.use('user'); var can = user ? await user.canEdit() : false; if (!can) return;
      ui.apis.artifact = await c.use('artifact'); ui.apis.assets = await c.use('assets');
      ui.canEdit = true; renderHero(); renderKicks(); renderHot(); updateShop(); buildAdmin(); renderFitBar(); if (window.ScrollTrigger) setTimeout(function () { ScrollTrigger.refresh(); }, 60);
      Promise.resolve(c.use('sample')).then(function (s) { ui.apis.sample = s || null; var b = $('b-print'); if (b) b.hidden = !ui.apis.sample; }, function () { /* */ });
      Promise.resolve(c.use('mcp')).then(function (m) { ui.apis.mcp = m || null; }, function () { /* */ });
      var reopen = false; try { reopen = sessionStorage.getItem('gs-admin') === '1'; sessionStorage.removeItem('gs-admin'); } catch (e) { /* */ }
      if (reopen) openAdmin();
    } catch (e) { /* visitante */ }
  })();
})(typeof window !== 'undefined' ? window : this);
