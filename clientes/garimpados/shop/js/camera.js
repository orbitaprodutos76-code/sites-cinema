/* ================================================================
   CÂMERA — linguagem de cinema do Garimpados Shop
   Dolly, rack focus, light sweep, zoom punch, whip pan, velocity skew,
   odômetro e botões magnéticos. Tudo respeita o movimento reduzido:
   sem movimento, cada função devolve null e a cena fica parada e completa.
   ================================================================ */
(function (root) {
  'use strict';
  var gsap = root.gsap, ST = root.ScrollTrigger;
  var mq = function (q) { return !!(root.matchMedia && root.matchMedia(q).matches); };
  var cam = {};

  cam.ok = function () { return !!gsap && !mq('(prefers-reduced-motion: reduce)'); };
  cam.wide = function () { return mq('(min-width: 900px)'); };
  cam.fine = function () { return mq('(hover: hover) and (pointer: fine)'); };
  if (gsap && ST) gsap.registerPlugin(ST);

  /* curvas padrão do roteiro (Seção 4.4) */
  cam.E = { entra: 'expo.out', sai: 'power2.in', troca: 'power2.inOut', cortina: 'expo.inOut', mola: 'back.out(2)', gaveta: 'cubic-bezier(.32,.72,0,1)' };

  /* os 3 planos de um set: [data-z=back] anda devagar, [data-z=front] um pouco mais rápido */
  cam.parallax = function (set, f) {
    if (!cam.ok() || !ST || !set) return null;
    f = f || {}; var range = f.range || 120;
    var tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: set, start: 'top bottom', end: 'bottom top', scrub: .7 } });
    [['back', f.back == null ? .35 : f.back], ['front', f.front == null ? 1.15 : f.front]].forEach(function (z) {
      var els = set.querySelectorAll('[data-z="' + z[0] + '"]'); if (!els.length) return;
      var d = (1 - z[1]) * range; tl.fromTo(els, { y: -d }, { y: d }, 0);
    });
    return tl;
  };

  /* dolly: aproxima (from < 1) ou afasta (from > 1) ligado à rolagem */
  cam.dolly = function (el, o) {
    if (!cam.ok() || !ST || !el) return null;
    o = o || {};
    return gsap.fromTo(el, { scale: o.from == null ? .85 : o.from, transformPerspective: 1200 }, { scale: o.to == null ? 1 : o.to, ease: 'none',
      scrollTrigger: { trigger: o.trigger || el, start: o.start || 'top bottom', end: o.end || 'top 30%', scrub: o.scrub || .7 } });
  };

  /* rack focus: o fundo desfoca e o produto fica nítido. Blur só a partir de 900 px; no celular vira opacidade. */
  cam.focusVars = function (amount) {
    return cam.wide() ? { filter: 'blur(' + (amount == null ? 5 : amount) + 'px)' } : { autoAlpha: .45 };
  };
  cam.unfocusVars = function () { return cam.wide() ? { filter: 'blur(0px)' } : { autoAlpha: 1 }; };
  cam.rackFocus = function (o) {
    if (!cam.ok() || !ST || !o || !o.back) return null;
    var tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: o.trigger, start: o.start || 'top 60%', end: o.end || 'bottom 40%', scrub: .7 } });
    tl.fromTo(o.back, cam.unfocusVars(), cam.focusVars(o.amount), 0);
    if (o.subject && cam.wide()) tl.fromTo(o.subject, { filter: 'blur(4px)' }, { filter: 'blur(0px)' }, 0);
    return tl;
  };

  /* light sweep: uma faixa de luz cruza o elemento uma vez (o elemento precisa de position e overflow hidden) */
  cam.sweep = function (el, o) {
    if (!cam.ok() || !el) return null;
    o = o || {};
    var s = el.querySelector(':scope > .cam-sweep');
    if (!s) { s = document.createElement('i'); s.className = 'cam-sweep'; s.setAttribute('aria-hidden', 'true'); el.appendChild(s); }
    return gsap.fromTo(s, { xPercent: -100, autoAlpha: 1 }, { xPercent: 200, duration: o.duration || .9, delay: o.delay || 0, ease: 'power2.inOut', onComplete: function () { gsap.set(s, { autoAlpha: 0 }); } });
  };

  /* zoom punch: soco rápido de aproximação */
  cam.punch = function (el, amt) {
    if (!cam.ok() || !el) return null;
    return gsap.fromTo(el, { scale: 1 }, { scale: amt || 1.06, duration: .14, ease: 'power3.out', yoyo: true, repeat: 1, overwrite: 'auto', clearProps: 'scale' });
  };

  /* whip pan: a câmera chicoteia para o lado com rastro de movimento */
  cam.whip = function (fromEl, toEl, onMiddle, dir) {
    dir = dir || 1;
    if (!cam.ok()) { if (onMiddle) onMiddle(); return null; }
    var tl = gsap.timeline();
    if (fromEl) tl.to(fromEl, { xPercent: -100 * dir, skewX: 8 * dir, autoAlpha: 0, duration: .3, ease: 'power2.in' });
    tl.add(function () { if (onMiddle) onMiddle(); });
    if (toEl) tl.fromTo(toEl, { xPercent: 100 * dir, skewX: 8 * dir, autoAlpha: 0 }, { xPercent: 0, skewX: 0, autoAlpha: 1, duration: .45, ease: 'expo.out', clearProps: 'transform' });
    return tl;
  };

  /* velocity skew: rolar rápido entorta títulos e letreiro (até 4°) e volta em 0,5 s */
  cam.velocitySkew = function (targets) {
    if (!cam.ok() || !ST) return null;
    var els = gsap.utils.toArray(targets); if (!els.length) return null;
    var clamp = gsap.utils.clamp(-4, 4), proxy = { s: 0 }, setS = gsap.quickSetter(els, 'skewY', 'deg');
    gsap.set(els, { transformOrigin: 'left center', force3D: true });
    var listeners = [];
    var st = ST.create({
      onUpdate: function (self) {
        var s = clamp(self.getVelocity() * -.0012);
        listeners.forEach(function (fn) { fn(self.getVelocity(), self.direction); });
        if (Math.abs(s) > Math.abs(proxy.s)) {
          proxy.s = s;
          gsap.to(proxy, { s: 0, duration: .5, ease: 'power3', overwrite: true, onUpdate: function () { setS(proxy.s); } });
        }
      }
    });
    st.listen = function (fn) { listeners.push(fn); };
    return st;
  };

  /* odômetro: o número rola do valor antigo ao novo */
  cam.count = function (el, to, o) {
    if (!el) return null;
    o = o || {};
    var fmt = o.fmt || function (v) { return String(Math.round(v)); };
    if (!cam.ok()) { el.textContent = fmt(to); return null; }
    var st = { v: o.from == null ? (parseFloat(String(el.textContent).replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.')) || 0) : o.from };
    return gsap.to(st, { v: to, duration: o.duration || .6, ease: o.ease || 'power2.out', onUpdate: function () { el.textContent = fmt(st.v); }, onComplete: function () { el.textContent = fmt(to); } });
  };

  /* rolagem de texto: o texto antigo sobe e o novo entra por baixo (rótulos, índices) */
  cam.roll = function (el, text) {
    if (!el) return;
    text = String(text);
    if (el.getAttribute('data-roll') === text) return;
    el.setAttribute('data-roll', text);
    if (!cam.ok()) { el.textContent = text; return; }
    var old = el.textContent;
    el.innerHTML = '<span class="cam-roll"><span>' + esc(old) + '</span><span>' + esc(text) + '</span></span>';
    var w = el.firstChild;
    gsap.fromTo(w, { yPercent: 0 }, { yPercent: -50, duration: .4, ease: 'power3.inOut', onComplete: function () { if (el.getAttribute('data-roll') === text) el.textContent = text; } });
  };
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  /* botões magnéticos (só com mouse): seguem até 8 px quando o mouse chega a 60 px */
  cam.magnetic = function (els) {
    if (!cam.ok() || !cam.fine()) return;
    gsap.utils.toArray(els).forEach(function (b) {
      if (b._mag) return; b._mag = 1;
      var xTo = gsap.quickTo(b, 'x', { duration: .5, ease: 'power3' }), yTo = gsap.quickTo(b, 'y', { duration: .5, ease: 'power3' });
      var near = false;
      document.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect(); if (!r.width) return;
        var cx = r.left + r.width / 2, cy = r.top + r.height / 2, dx = e.clientX - cx, dy = e.clientY - cy;
        var inside = Math.abs(dx) < r.width / 2 + 60 && Math.abs(dy) < r.height / 2 + 60;
        if (inside) { near = true; xTo(gsap.utils.clamp(-8, 8, dx * .18)); yTo(gsap.utils.clamp(-8, 8, dy * .25)); }
        else if (near) { near = false; gsap.to(b, { x: 0, y: 0, duration: .7, ease: 'elastic.out(1, .45)', overwrite: true }); }
      }, { passive: true });
    });
  };

  /* granulado de rua: camada fixa, sem cliques, só no computador e com movimento liberado */
  cam.grain = function () {
    if (!cam.ok() || !cam.wide() || document.querySelector('.cam-grain')) return;
    var g = document.createElement('div'); g.className = 'cam-grain'; g.setAttribute('aria-hidden', 'true');
    document.body.appendChild(g);
  };

  /* barra de progresso da página inteira */
  cam.progress = function (el) {
    if (!el || !gsap || !ST) return null;
    if (!cam.ok()) return null;
    return gsap.fromTo(el, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: .3 } });
  };

  /* topo que some ao descer e volta ao subir; keep() devolve true quando deve ficar sempre visível */
  cam.autoHide = function (el, keep) {
    if (!cam.ok() || !ST || !el) return null;
    var shown = true;
    var show = function (on) { if (on === shown) return; shown = on; gsap.to(el, { yPercent: on ? 0 : -100, duration: .25, ease: on ? 'power2.out' : 'power2.in', overwrite: true }); el.classList.toggle('is-hidden', !on); };
    return ST.create({ start: 0, end: 'max', onUpdate: function (self) {
      if ((keep && keep()) || self.scroll() < 120) { show(true); return; }
      if (Math.abs(self.getVelocity()) < 40) return;
      show(self.direction < 0);
    } });
  };

  root.cam = cam;
})(typeof window !== 'undefined' ? window : this);
