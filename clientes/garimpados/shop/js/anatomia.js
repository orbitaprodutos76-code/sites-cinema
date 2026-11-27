/* ================================================================
   ANATOMIA — o tênis da frente do anel se abre em 3 camadas ao rolar
   O recorte lateral é cortado em cabedal, entressola e solado (linhas
   curvas suaves). A seção fica presa enquanto a câmera chega perto e
   orbita, o tênis dá um tranco e se solta, a luz varre cada camada,
   o foco passa de uma para outra com parte, material e benefício,
   e no fim tudo se junta de novo e aparece o Compre agora.
   No celular o foco é por escurecimento (sem desfoque pesado).
   Com "reduzir movimento" fica parado, já aberto, com tudo à mostra.

   GSAnatomia.montar(secao, { movimento, fmt }) → { set(item), destruir }
   item = { id, nome, src, preco, antigo, link, loja, exemplo,
            cortes: [c1, c2], camadas: [{ parte, mat, ben } x3] }
   ================================================================ */
(function (root) {
  'use strict';

  var NP = 18; /* partículas */

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  /* corte curvo: a linha sobe um pouco no meio do tênis, como a borda da entressola */
  function onda(c, curva, desce) {
    var pts = [];
    for (var i = 0; i <= 12; i++) { var x = i / 12, y = c - curva * Math.sin(Math.PI * x) * (desce ? -1 : 1); pts.push((x * 100).toFixed(2) + '% ' + (y * 100).toFixed(2) + '%'); }
    return pts;
  }
  function clips(c1, c2) {
    var a = onda(c1, .025), b = onda(c2, .012);
    return [
      'polygon(0% 0%, 100% 0%, ' + a.slice().reverse().join(', ') + ')',
      'polygon(' + a.join(', ') + ', ' + b.slice().reverse().join(', ') + ')',
      'polygon(' + b.join(', ') + ', 100% 100%, 0% 100%)'
    ];
  }

  function montar(sec, o) {
    if (!sec) return null;
    o = o || {};
    var gsap = root.gsap, ST = root.ScrollTrigger;
    var mov = !!(o.movimento && gsap && ST), fmt = o.fmt || function (v) { return 'R$ ' + v; };
    var item = null, tl = null, mm = null, raz = 1.6;

    sec.innerHTML = '';
    var pin = el('div', 'ana__pin');
    var fundo = el('div', 'ana__fundo', '<span class="ana__mega" aria-hidden="true">ANATOMIA</span>' +
      '<svg class="ana__cotas" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true">' +
        '<g class="ana__regua">' + Array.apply(null, Array(41)).map(function (_, i) { var x = 60 + i * 22; return '<line x1="' + x + '" y1="560" x2="' + x + '" y2="' + (i % 5 ? 568 : 576) + '"/>'; }).join('') + '</g>' +
        '<g class="ana__regua">' + Array.apply(null, Array(21)).map(function (_, i) { var y = 80 + i * 22; return '<line x1="40" y1="' + y + '" x2="' + (i % 5 ? 48 : 56) + '" y2="' + y + '"/>'; }).join('') + '</g>' +
        '<path class="ana__mira" d="M500 70 v40 M500 490 v40 M150 300 h40 M810 300 h40"/>' +
        '<circle class="ana__mira" cx="500" cy="300" r="230"/>' +
      '</svg>');
    var head = el('div', 'ana__head', '<p class="eyebrow eyebrow--gold">Anatomia</p><h2 class="ana__h" id="ana-h">Abre o <span>jogo.</span></h2><p class="ana__nome mono"></p>');
    var cena = el('div', 'ana__cena'), tenis = el('div', 'ana__tenis');
    var cams = [0, 1, 2].map(function (i) { var c = el('div', 'ana__cam ana__cam--' + i, '<img alt="" draggable="false" crossorigin="anonymous"><span class="ana__luz"></span>'); tenis.appendChild(c); return c; });
    var part = el('div', 'ana__part'), ps = [];
    for (var i = 0; i < NP; i++) { var s = el('i'); part.appendChild(s); ps.push(s); }
    tenis.appendChild(part); cena.appendChild(tenis);
    var rots = [0, 1, 2].map(function (i) { var r = el('div', 'ana__rot ana__rot--' + (i === 1 ? 'dir' : 'esq'), '<i class="ana__fio"></i><p><b></b><span></span><small></small></p>'); return r; });
    var fim = el('div', 'ana__fim', '<p class="ana__preco mono"></p><a class="btn btn--gold ana__cta" target="_blank" rel="noopener sponsored">Compre agora</a>');
    var prog = el('p', 'ana__prog mono', '<b>00</b> / 03');
    sec.setAttribute('aria-labelledby', 'ana-h');
    pin.appendChild(fundo); pin.appendChild(head); pin.appendChild(cena);
    rots.forEach(function (r) { pin.appendChild(r); });
    pin.appendChild(fim); pin.appendChild(prog);
    sec.appendChild(pin);
    if (!mov) sec.classList.add('ana--parado');

    /* --------- posição dos nomes: ao lado de cada camada já aberta --------- */
    var SEP = [-.22, 0, .2];
    function largura() { var w = pin.clientWidth, h = pin.clientHeight; return Math.min(w * (w < 760 ? .84 : .44), h * .36 * raz, 680); }
    function medir() {
      var w = largura(); tenis.style.width = w + 'px'; tenis.style.aspectRatio = String(raz);
      /* posição sem as transformações da câmera (offset ignora scale e órbita) */
      var th = w / raz, cy = cena.offsetTop + tenis.offsetTop + th / 2, cx = cena.offsetLeft + tenis.offsetLeft + w / 2;
      var c = item ? item.cortes : [.7, .88], meio = [c[0] / 2, (c[0] + c[1]) / 2, (c[1] + 1) / 2];
      var estreito = pin.clientWidth < 760;
      rots.forEach(function (r, k) {
        var y = cy + (meio[k] - .5) * th + SEP[k] * th;
        if (estreito) { r.style.left = '50%'; r.style.top = ''; r.style.right = ''; return; }
        r.style.top = y + 'px';
        if (k === 1) { r.style.left = (cx + w / 2 + 18) + 'px'; r.style.right = ''; }
        else { r.style.left = ''; r.style.right = (pin.clientWidth - (cx - w / 2) + 18) + 'px'; }
      });
    }

    /* a foto só carrega quando a seção chega perto da tela (não pesa na abertura do site) */
    var perto = !('IntersectionObserver' in root);
    function fotos() {
      if (!perto || !item) return;
      cams.forEach(function (c) {
        var im = c.querySelector('img'); if (im.getAttribute('src') !== item.src) im.src = item.src;
        var luz = c.querySelector('.ana__luz'); luz.style.webkitMaskImage = luz.style.maskImage = 'url("' + item.src + '")';
      });
    }
    if (!perto) { var ioP = new IntersectionObserver(function (en) { if (en.some(function (e) { return e.isIntersecting; })) { perto = true; ioP.disconnect(); fotos(); } }, { rootMargin: '1200px 0px' }); ioP.observe(sec); }
    function set(it) {
      if (!it) return;
      item = it;
      var cl = clips(it.cortes[0], it.cortes[1]);
      cams.forEach(function (c, k) { c.style.clipPath = cl[k]; c.style.webkitClipPath = cl[k]; });
      fotos();
      var im0 = cams[0].querySelector('img');
      var ok = function () { if (im0.naturalWidth) { raz = im0.naturalWidth / im0.naturalHeight; medir(); if (ST) ST.refresh(); } };
      im0.onload = ok; if (im0.complete) ok();
      rots.forEach(function (r, k) {
        var d = it.camadas[k];
        r.querySelector('b').textContent = d.parte; r.querySelector('span').textContent = d.mat; r.querySelector('small').textContent = d.ben;
      });
      head.querySelector('.ana__nome').textContent = it.nome;
      fim.querySelector('.ana__preco').innerHTML = it.preco != null ? (it.antigo ? '<s>' + esc(fmt(it.antigo)) + '</s> ' : '') + '<b>' + esc(fmt(it.preco)) + '</b>' + (it.loja ? ' · ' + esc(it.loja) : '') : (it.exemplo ? 'Tênis de exemplo · link em breve' : 'Ver preço na loja');
      var cta = fim.querySelector('.ana__cta');
      if (it.link) { cta.href = it.link; cta.removeAttribute('aria-disabled'); cta.classList.remove('is-off'); cta.setAttribute('aria-label', 'Compre agora: ' + it.nome + (it.loja ? ' na ' + it.loja : '') + ' (abre a loja)'); }
      else { cta.removeAttribute('href'); cta.setAttribute('aria-disabled', 'true'); cta.classList.add('is-off'); cta.textContent = 'Link em breve'; }
      if (it.link) cta.textContent = 'Compre agora';
      medir();
    }

    /* --------- a cena ao rolar --------- */
    function cenaRolando(leve) {
      var H = function () { return tenis.offsetHeight || 300; };
      var foco = function (k) {
        return cams.map(function (c, j) {
          var on = j === k;
          return leve ? { autoAlpha: on || k < 0 ? 1 : .32 } : { filter: on || k < 0 ? 'blur(0px) brightness(1)' : 'blur(5px) brightness(.5)' };
        });
      };
      gsap.set(cams, leve ? { autoAlpha: 1 } : { filter: 'blur(0px) brightness(1)' });
      gsap.set(rots, { autoAlpha: 0, x: function (k) { return k === 1 ? -16 : 16; } });
      gsap.set(fim, { autoAlpha: 0, y: 24 });
      gsap.set(ps, { x: 0, y: 0, scale: 0, autoAlpha: 0 });
      var t = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: sec, start: 'top top', end: function () { return '+=' + Math.round(pin.clientHeight * (leve ? 2.6 : 3.2)); }, pin: pin, scrub: .8, invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: function (s) { var n = Math.min(3, Math.max(0, Math.floor((s.progress - .28) / .16) + 1)); prog.querySelector('b').textContent = '0' + (s.progress < .3 ? 0 : n); } }
      });
      /* câmera: chega de longe e orbita a cena inteira */
      t.fromTo(tenis, { scale: .72, rotationY: -22, rotationX: 14 }, { scale: 1, rotationY: 12, rotationX: 4, duration: 10 }, 0)
        .fromTo(fundo, { scale: 1.12 }, { scale: 1, duration: 10 }, 0)
        .fromTo('.ana__mega', { xPercent: 8 }, { xPercent: -8, duration: 10 }, 0)
        /* tranco e partículas: o tênis se solta */
        .to(tenis, { keyframes: { x: [0, -9, 8, -5, 3, 0], y: [0, 5, -4, 2, -1, 0] }, duration: .5, ease: 'power1.inOut' }, 1)
        .to(ps, { x: function () { return gsap.utils.random(-260, 260); }, y: function () { return gsap.utils.random(-200, 200); }, scale: function () { return gsap.utils.random(.4, 1.3); }, autoAlpha: 1, duration: .7, ease: 'power2.out' }, 1)
        .to(ps, { autoAlpha: 0, duration: .8 }, 1.7)
        /* as camadas se afastam com profundidade */
        .to(cams[0], { y: function () { return SEP[0] * H(); }, z: 110, rotation: -2.5, duration: 1.4, ease: 'power2.out' }, 1.1)
        .to(cams[2], { y: function () { return SEP[2] * H(); }, z: -110, rotation: 1.8, duration: 1.4, ease: 'power2.out' }, 1.1)
        .to(cams[1], { z: 0, scale: 1.02, duration: 1.4, ease: 'power2.out' }, 1.1);
      /* luz que varre cada camada */
      cams.forEach(function (c, k) {
        t.fromTo(c.querySelector('.ana__luz'), { backgroundPosition: '160% 0', autoAlpha: 1 }, { backgroundPosition: '-60% 0', duration: .9, ease: 'power1.inOut' }, 1.6 + k * .35)
          .to(c.querySelector('.ana__luz'), { autoAlpha: 0, duration: .2 }, 2.5 + k * .35);
      });
      /* foco: uma camada por vez, com parte, material e benefício */
      [0, 1, 2].forEach(function (k) {
        var at = 3.2 + k * 1.5, f = foco(k);
        cams.forEach(function (c, j) { t.to(c, Object.assign({ duration: .5 }, f[j]), at); });
        t.to(rots[k], { autoAlpha: 1, x: 0, duration: .5, ease: 'power2.out' }, at + .1);
        if (k > 0) t.to(rots[k - 1], { autoAlpha: leve ? 0 : .45, duration: .4 }, at);
      });
      /* fecha: tira o foco, junta tudo com outro tranco e mostra o Compre agora */
      var f0 = foco(-1);
      cams.forEach(function (c, j) { t.to(c, Object.assign({ duration: .4 }, f0[j]), 7.6); });
      t.to(rots, { autoAlpha: 0, duration: .4 }, 7.6)
        .to(cams, { y: 0, z: 0, rotation: 0, scale: 1, duration: 1, ease: 'power3.in' }, 7.8)
        .to(tenis, { keyframes: { x: [0, 7, -6, 4, 0], y: [0, -4, 3, 0, 0] }, duration: .4 }, 8.8)
        .fromTo(ps, { x: 0, y: 0, autoAlpha: 0 }, { x: function () { return gsap.utils.random(-180, 180); }, y: function () { return gsap.utils.random(40, 160); }, autoAlpha: .8, scale: .7, duration: .5, ease: 'power2.out', immediateRender: false }, 8.8)
        .to(ps, { autoAlpha: 0, duration: .5 }, 9.3)
        .to(fim, { autoAlpha: 1, y: 0, duration: .8, ease: 'power2.out' }, 9.1)
        .to({}, { duration: .9 }, 9.9);
      return t;
    }

    var onResize = function () { medir(); };
    root.addEventListener('resize', onResize);
    if (mov) {
      mm = gsap.matchMedia();
      mm.add({ leve: '(max-width: 759px)', cheio: '(min-width: 760px)' }, function (ctx) {
        medir();
        tl = cenaRolando(ctx.conditions.leve);
        return function () { tl = null; };
      });
    }
    medir();

    return {
      set: set,
      medir: medir,
      destruir: function () { if (mm) mm.revert(); root.removeEventListener('resize', onResize); sec.innerHTML = ''; }
    };
  }

  root.GSAnatomia = { montar: montar };
})(window);
