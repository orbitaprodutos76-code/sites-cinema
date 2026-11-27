/* ================================================================
   VITRINE DE TÊNIS — anel 3D (preto e dourado)
   Os tênis ficam num círculo que vai para trás: o da frente é grande e
   aceso; os outros diminuem, escurecem e desfocam conforme se afastam.
   Trocar de tênis gira o anel, a palavra gigante desliza, o nome abre
   como cortina, o preço rola e o letreiro acelera.

   GSVitrine.montar(el, { itens, movimento, fmt, onTroca }) → { proximo, anterior, entrar, destruir }
   item: { id, src, alt, rotulo, nome, palavra, frase, selos[], preco, precoAntigo, link, cor, acoes }
   ================================================================ */
(function (root) {
  'use strict';
  var gsap = root.gsap;

  var SELOS = {
    'ultimas-unidades': { texto: 'Tá acabando: últimas unidades nesse preço', urgente: true },
    oferta: { texto: 'Bom desconto agora' },
    'frete-gratis': { texto: 'Frete grátis' },
    novo: { texto: 'Chegou agora' },
    exemplo: { texto: 'Par de exemplo: preço e link em breve' }
  };
  var LETREIRO = ['Achou, garantiu', 'Só o que vale o preço', 'Link direto da loja oficial', 'Você paga o mesmo preço'];

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function seta(d) { return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + (d === 'esq' ? 'M19 12H5m6-6-6 6 6 6' : 'M5 12h14m-6-6 6 6-6 6') + '"/></svg>'; }
  function faixa() { return LETREIRO.map(function (t) { return '<span>' + t + '</span><i>✦</i>'; }).join(''); }
  function desconto(p, a) { return a && p != null && a > p ? Math.round((1 - p / a) * 100) : 0; }
  function urgenciaHTML(chaves) {
    var s = (chaves || []).map(function (k) { return SELOS[k]; }).filter(Boolean);
    s.sort(function (a, b) { return (b.urgente ? 1 : 0) - (a.urgente ? 1 : 0); });
    return s.slice(0, 2).map(function (x, i) { return x.urgente && i === 0 ? '<strong><span class="vt-pulso" aria-hidden="true"></span>' + x.texto + '</strong>' : '<span>' + x.texto + '</span>'; }).join('<span aria-hidden="true"> · </span>');
  }

  /* fundo sempre preto: a cor do tênis vira só um tom bem escuro na palavra gigante */
  function corDaPalavra(rgb) {
    if (!rgb) return '#171717';
    var r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, l = (mx + mn) / 2;
    if (!d) return '#171717';
    var s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn);
    if (s < .12) return '#171717';
    var h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return 'hsl(' + Math.round(h * 60) + ' ' + Math.round(Math.min(.55, s * .7) * 100) + '% 13%)';
  }

  /* titulo: HTML de um cabeçalho curto no lugar da abertura grande (quando a vitrine não é a primeira tela) */
  function template(titulo) {
    return '<div class="vt-palavra-fundo" aria-hidden="true"><span></span></div>' +
      (titulo ? '<div class="vt-cab">' + titulo + '</div>' :
      '<div class="vt-abertura">' +
        '<h1 id="vt-titulo"><span class="vt-linha"><span>O par certo</span></span><span class="vt-linha"><span>pelo preço</span></span><span class="vt-linha vt-ouro"><span>que ninguém acha.</span></span></h1>' +
        '<p>A gente garimpa as melhores ofertas de tênis da internet todo dia. Achou o seu? Garante antes que acabe.</p>' +
      '</div>') +
      '<div class="vt-fila"></div>' +
      '<aside class="vt-achado" aria-label="Tênis em destaque">' +
        '<p class="vt-rotulo"></p><h2 class="vt-nome"></h2><p class="vt-frase"></p><p class="vt-urgencia"></p>' +
        '<div class="vt-precos"><p class="vt-preco"></p><p class="vt-de"><s></s><span class="vt-off"></span></p></div>' +
        '<div class="vt-cta"><a class="vt-comprar" target="_blank" rel="noopener sponsored"><span class="vt-comprar-txt">Compre agora</span><span class="vt-comprar-seta">' + seta('dir') + '</span></a><span class="vt-acoes"></span></div>' +
        '<p class="vt-garantia">Você fecha a compra na loja oficial, com toda a segurança dela. A gente só acha o preço.</p>' +
      '</aside>' +
      '<div class="vt-controles">' +
        '<button type="button" class="vt-seta vt-ant" aria-label="Tênis anterior">' + seta('esq') + '</button>' +
        '<button type="button" class="vt-seta vt-prox" aria-label="Próximo tênis">' + seta('dir') + '</button>' +
        '<span class="vt-dica">Arrasta pro lado e garimpa</span>' +
      '</div>' +
      '<div class="vt-letreiro" aria-hidden="true"><div class="vt-letreiro-trilho">' + faixa() + faixa() + '</div></div>' +
      '<p class="vt-sr" aria-live="polite"></p>';
  }

  /* um tênis do anel: sombra no chão, camada que flutua e camada que inclina com o mouse */
  function criarTenis(item, i, movimento) {
    var el = document.createElement('div');
    el.className = 'vt-tenis';
    el.setAttribute('data-i', i);
    el.style.setProperty('--ratio', '1.4');
    /* as fotos só carregam quando o anel chega perto da tela (carregar() abaixo): o anel fica longe do topo e
       as 8 fotos grandes pesavam ~1 MB logo na abertura, inclusive pela máscara do brilho */
    /* crossorigin: a máscara do brilho baixa a foto em modo CORS; com a <img> no mesmo modo, o navegador usa um download só */
    el.innerHTML = '<div class="vt-sombra"></div><img class="vt-reflexo" alt="" aria-hidden="true" draggable="false" decoding="async" crossorigin="anonymous">' +
      '<div class="vt-flutua"><div class="vt-inclina"><img class="vt-foto" alt="' + esc(item.alt) + '" draggable="false" decoding="async" crossorigin="anonymous">' +
      '<span class="vt-brilho" aria-hidden="true"></span></div></div>';
    var img = el.querySelector('.vt-foto');
    var medir = function () { if (img.naturalWidth) el.style.setProperty('--ratio', String(img.naturalWidth / img.naturalHeight)); };
    img.addEventListener('load', medir);
    var t = { el: el, img: img, flutua: el.querySelector('.vt-flutua'), inclina: el.querySelector('.vt-inclina'), sombra: el.querySelector('.vt-sombra'), brilho: el.querySelector('.vt-brilho') };
    t.carregar = function () {
      if (t.ok) return; t.ok = true;
      img.src = item.src; el.querySelector('.vt-reflexo').src = item.src;
      var m = 'url("' + String(item.src).replace(/"/g, '%22') + '")'; t.brilho.style.webkitMaskImage = m; t.brilho.style.maskImage = m;
    };
    /* só o tênis da frente flutua (e só com o anel na tela): animar os 8 o tempo todo travava a página */
    if (movimento) {
      var d = 2.6 + (i % 3) * .35;
      t.flutuar = gsap.timeline({ paused: true, repeat: -1, yoyo: true, defaults: { duration: d, ease: 'sine.inOut' } })
        .to(t.flutua, { y: -12 }, 0).to(t.sombra, { scaleX: .86, opacity: .6 }, 0);
    }
    return t;
  }

  /* o tênis da frente inclina em perspectiva seguindo o mouse (ou o giroscópio no celular) */
  function criarEfeitos(raiz, naTela) {
    var alvo = { x: 0, y: 0 }, atual = { x: 0, y: 0 }, tenis = null, temSensor = false;
    var toque = root.matchMedia('(pointer: coarse)').matches;
    var onMove = function (e) { var r = raiz.getBoundingClientRect(); alvo.x = (e.clientX - r.left) / r.width * 2 - 1; alvo.y = (e.clientY - r.top) / r.height * 2 - 1; };
    var onLeave = function () { alvo.x = 0; alvo.y = 0; };
    var onOrient = function (e) { if (e.gamma == null) return; temSensor = true; alvo.x = Math.max(-1, Math.min(1, e.gamma / 25)); alvo.y = Math.max(-1, Math.min(1, (e.beta - 45) / 25)); };
    raiz.addEventListener('pointermove', onMove);
    raiz.addEventListener('pointerleave', onLeave);
    if (toque) root.addEventListener('deviceorientation', onOrient);
    var tick = function (time) {
      if (!naTela()) return;
      if (toque && !temSensor) { alvo.x = Math.sin(time * .6) * .45; alvo.y = Math.cos(time * .45) * .25; }
      atual.x += (alvo.x - atual.x) * .08; atual.y += (alvo.y - atual.y) * .08;
      if (tenis) { gsap.set(tenis.inclina, { rotationY: atual.x * 14, rotationX: -atual.y * 10 }); gsap.set(tenis.sombra, { x: -atual.x * 16 }); }
    };
    gsap.ticker.add(tick);
    return {
      setTenis: function (t) {
        if (tenis && tenis !== t) { gsap.to(tenis.inclina, { rotationX: 0, rotationY: 0, duration: .6 }); gsap.to(tenis.sombra, { x: 0, duration: .6 }); }
        tenis = t;
      },
      destruir: function () { gsap.ticker.remove(tick); raiz.removeEventListener('pointermove', onMove); raiz.removeEventListener('pointerleave', onLeave); root.removeEventListener('deviceorientation', onOrient); }
    };
  }

  /* arrastar/swipe: ignora botões e gestos verticais (a página continua rolando) */
  function criarArraste(area, cb) {
    var x0 = 0, y0 = 0, id = null, decidido = false, horizontal = false, ultimos = [];
    area.addEventListener('pointerdown', function (e) {
      if (e.button !== 0 || e.target.closest('a, button')) return;
      id = e.pointerId; x0 = e.clientX; y0 = e.clientY; decidido = false; horizontal = false; ultimos = [{ x: x0, t: e.timeStamp }];
    });
    area.addEventListener('pointermove', function (e) {
      if (e.pointerId !== id) return;
      var dx = e.clientX - x0, dy = e.clientY - y0;
      if (!decidido && Math.hypot(dx, dy) > 8) {
        decidido = true; horizontal = Math.abs(dx) > Math.abs(dy);
        if (!horizontal) { id = null; return; }
        area.setPointerCapture(e.pointerId); area.classList.add('arrastando'); cb.onInicio();
      }
      if (!horizontal) return;
      ultimos.push({ x: e.clientX, t: e.timeStamp }); if (ultimos.length > 5) ultimos.shift();
      cb.onMove(dx);
    });
    var fim = function (e) {
      if (e.pointerId !== id) return;
      id = null; area.classList.remove('arrastando');
      if (!horizontal) return;
      var a = ultimos[0], b = ultimos[ultimos.length - 1];
      cb.onFim(e.clientX - x0, b.t > a.t ? (b.x - a.x) / (b.t - a.t) : 0);
    };
    area.addEventListener('pointerup', fim);
    area.addEventListener('pointercancel', fim);
  }

  function montar(raiz, o) {
    var itens = o.itens || [], n = itens.length;
    if (!gsap || !n) { raiz.innerHTML = ''; return null; }
    var movimento = !!o.movimento, fmt = o.fmt || String;
    raiz.innerHTML = template(o.titulo);
    var $ = function (s) { return raiz.querySelector(s); };
    var idx = function (k) { return ((k % n) + n) % n; };
    /* distância circular de um item até a posição atual, entre -n/2 e n/2 */
    var distancia = function (i, pos) { return ((((i - pos) % n) + n + n / 2) % n) - n / 2; };

    var fila = $('.vt-fila');
    var pares = itens.map(function (it, i) { var t = criarTenis(it, i, movimento); fila.appendChild(t.el); return t; });
    /* carrega as fotos quando o anel estiver a ~1 tela de distância (sem IntersectionObserver, carrega já) */
    var carregaTudo = function () { pares.forEach(function (t) { t.carregar(); }); };
    if ('IntersectionObserver' in root) {
      var perto = new IntersectionObserver(function (en) { if (en.some(function (e) { return e.isIntersecting; })) { carregaTudo(); perto.disconnect(); } }, { rootMargin: '900px 0px' });
      perto.observe(raiz);
    } else carregaTudo();
    var visivel = false, perto2 = false;
    var efeitos = movimento ? criarEfeitos(raiz, function () { return perto2; }) : null;
    var palavra = $('.vt-palavra-fundo span');
    var estado = { pos: 0 }, preco = { v: itens[0].preco || 0 };
    var alvo = 0, atual = -1, vivo = true, trocas = 0;

    function geometria() {
      var W = raiz.clientWidth, cel = W < 760;
      var R = cel ? W * .6 : W < 1100 ? W * .36 : W * .27;
      /* com poucos tênis o anel fica mais fechado, para os de trás aparecerem dos lados */
      if (n < 5) R *= .8;
      return { R: R, foco: R * 1.3, sobe: cel ? .08 : .15, passo: cel ? W * .55 : W * .24 };
    }
    var geo = geometria();

    function posicionar() {
      for (var i = 0; i < n; i++) {
        var d = distancia(i, estado.pos), ang = d * 2 * Math.PI / n;
        var z = -geo.R * (1 - Math.cos(ang)), prof = -z / (2 * geo.R);
        /* profundidade só com transform e opacidade (o fundo é preto, então apagar = escurecer):
           filter brightness/blur por quadro em 8 tênis derrubava a página para menos de 5 FPS */
        gsap.set(pares[i].el, {
          xPercent: -50, yPercent: -50, x: geo.R * Math.sin(ang), y: z * geo.sobe, scale: geo.foco / (geo.foco - z),
          rotation: -Math.sin(ang) * 6, zIndex: Math.round(100 - prof * 50),
          opacity: +(1 - Math.pow(prof, .6) * .8).toFixed(3)
        });
      }
      var c = idx(Math.round(estado.pos));
      if (c !== atual) mostrar(c);
    }

    var setPreco = function () { $('.vt-preco').textContent = fmt(preco.v); };

    function mostrar(c) {
      var anterior = atual, primeira = anterior === -1;
      var dir = primeira ? 1 : (Math.sign(distancia(c, anterior)) || 1);
      atual = c;
      var p = itens[c];
      pares.forEach(function (t, i) {
        var frente = i === c;
        t.el.classList.toggle('na-frente', frente);
        /* clicar no tênis da frente abre as fotos (handler do site via data-open) */
        if (frente) { t.el.setAttribute('data-open', p.id); t.el.setAttribute('role', 'button'); t.el.setAttribute('aria-label', 'Ver fotos de ' + p.alt); }
        else { t.el.removeAttribute('data-open'); t.el.removeAttribute('role'); t.el.removeAttribute('aria-label'); }
      });
      if (efeitos) efeitos.setTenis(pares[c]);
      syncFlutua();
      raiz.style.setProperty('--palavra', corDaPalavra(p.cor));

      $('.vt-rotulo').textContent = p.rotulo || '';
      $('.vt-nome').innerHTML = '<span class="vt-nome-txt"></span>';
      $('.vt-nome-txt').textContent = p.nome;
      $('.vt-frase').textContent = p.frase || '';
      $('.vt-urgencia').innerHTML = urgenciaHTML(p.selos);

      var temPreco = p.preco != null, pct = temPreco ? desconto(p.preco, p.precoAntigo) : 0, de = $('.vt-de');
      $('.vt-precos').classList.toggle('sem-preco', !temPreco);
      de.hidden = !pct;
      if (pct) { de.querySelector('s').textContent = fmt(p.precoAntigo); de.querySelector('.vt-off').textContent = '-' + pct + '%'; }

      var btn = $('.vt-comprar');
      if (p.link) {
        btn.href = p.link; btn.removeAttribute('aria-disabled'); btn.removeAttribute('tabindex');
        btn.querySelector('.vt-comprar-txt').textContent = 'Compre agora';
        btn.setAttribute('aria-label', 'Compre agora: ' + p.nome + (temPreco ? ' por ' + fmt(p.preco) : '') + (p.loja ? ' na ' + p.loja : '') + ' (abre a loja em nova aba)');
      } else {
        btn.removeAttribute('href'); btn.setAttribute('aria-disabled', 'true'); btn.setAttribute('tabindex', '-1');
        btn.querySelector('.vt-comprar-txt').textContent = 'Link em breve';
        btn.removeAttribute('aria-label');
      }
      $('.vt-acoes').innerHTML = p.acoes || '';
      $('.vt-sr').textContent = 'Tênis ' + (c + 1) + ' de ' + n + ': ' + p.nome + (temPreco ? ', ' + fmt(p.preco) : '');
      if (o.onTroca) o.onTroca(p);

      if (primeira || !movimento) {
        palavra.textContent = p.palavra;
        preco.v = p.preco || 0;
        if (temPreco) setPreco(); else $('.vt-preco').textContent = 'Preço em breve';
        return;
      }
      gsap.timeline()
        .to(palavra, { xPercent: -dir * 7, autoAlpha: 0, duration: .22, ease: 'power2.in', overwrite: true })
        .call(function () { palavra.textContent = p.palavra; })
        .fromTo(palavra, { xPercent: dir * 7, autoAlpha: 0 }, { xPercent: 0, autoAlpha: 1, duration: .9, ease: 'expo.out' });
      gsap.fromTo($('.vt-nome-txt'), { clipPath: 'inset(0 100% 0 0)', x: -dir * 14 }, { clipPath: 'inset(0 0% 0 0)', x: 0, duration: .9, ease: 'expo.out', delay: .08 });
      gsap.fromTo([$('.vt-rotulo'), $('.vt-frase'), $('.vt-urgencia'), $('.vt-precos')], { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .55, stagger: .05, ease: 'power3.out', overwrite: true });
      if (temPreco) gsap.to(preco, { v: p.preco, duration: .8, ease: 'power3.out', onUpdate: setPreco, overwrite: true });
      else { gsap.killTweensOf(preco); $('.vt-preco').textContent = 'Preço em breve'; }

      /* cada troca usa um efeito diferente, em rodízio: luz cruzando, rastro de movimento, zoom */
      var t = pares[c], efeito = trocas++ % 3;
      if (efeito === 0) {
        gsap.fromTo(t.img, { scale: .93 }, { scale: 1, duration: .9, ease: 'back.out(2.4)', delay: .15, overwrite: 'auto' });
        gsap.fromTo(t.brilho, { backgroundPosition: '160% 0', autoAlpha: 1 }, { backgroundPosition: '-60% 0', duration: 1, ease: 'power2.inOut', delay: .3, onComplete: function () { gsap.set(t.brilho, { autoAlpha: 0 }); } });
      } else if (efeito === 1) {
        gsap.fromTo(t.img, { scale: .93, x: dir * 18 }, { scale: 1, x: 0, duration: 1, ease: 'expo.out', delay: .1, overwrite: 'auto' });
      } else {
        gsap.fromTo(t.img, { scale: 1.22 }, { scale: 1, duration: 1.1, ease: 'expo.out', delay: .1, overwrite: 'auto' });
        gsap.fromTo(palavra, { scale: 1.12 }, { scale: 1, duration: 1.2, ease: 'expo.out' });
      }
    }

    /* letreiro: corre com o anel na tela e acelera a cada troca */
    var letreiro = movimento ? gsap.to($('.vt-letreiro-trilho'), { xPercent: -50, duration: 26, ease: 'none', repeat: -1, paused: true }) : null;
    /* flutuar, inclinar e letreiro só rodam com o anel na tela */
    function syncFlutua() {
      pares.forEach(function (t, i) { if (!t.flutuar) return; if (perto2 && i === atual) t.flutuar.play(); else t.flutuar.pause(); });
      if (letreiro) { if (perto2) letreiro.play(); else letreiro.pause(); }
    }
    function aceleraLetreiro(dir) { if (letreiro) gsap.fromTo(letreiro, { timeScale: 6 * dir }, { timeScale: 1, duration: 1.4, ease: 'power2.out', overwrite: true }); }

    /* mola: depois de arrastar, o anel desacelera e encaixa com um balanço leve */
    function irPara(k, mola) {
      var dir = Math.sign(k - alvo) || 1;
      alvo = k;
      aceleraLetreiro(dir);
      gsap.to(estado, { pos: alvo, duration: !movimento ? 0 : mola ? 1.5 : 1.1, ease: mola ? 'elastic.out(1, .72)' : 'expo.out', onUpdate: posicionar, overwrite: true });
    }

    /* troca automática a cada 5 s; para quando a pessoa mexe (volta 9 s depois), com o mouse em cima,
       fora da tela, com a aba escondida ou com alguma janela aberta */
    var auto = null, pausaAte = 0, sobre = false;
    var mexeu = function () { pausaAte = Date.now() + 9000; };
    function agendar() {
      if (!movimento || !vivo) return;
      auto = gsap.delayedCall(5, function () {
        if (visivel && !sobre && !document.hidden && Date.now() >= pausaAte && !document.querySelector('[role="dialog"]:not([hidden])')) irPara(alvo + 1);
        agendar();
      });
    }
    var io = 'IntersectionObserver' in root ? new IntersectionObserver(function (en) {
      var e = en[en.length - 1], antes = perto2;
      visivel = e.isIntersecting && e.intersectionRatio > .45; perto2 = e.isIntersecting;
      if (perto2 !== antes) syncFlutua();
    }, { threshold: [0, .45, .7] }) : null;
    if (io) io.observe(raiz); else { visivel = true; perto2 = true; }
    raiz.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') sobre = true; });
    raiz.addEventListener('pointerleave', function () { sobre = false; });
    raiz.addEventListener('focusin', mexeu);
    agendar();

    var proximo = function () { mexeu(); irPara(alvo + 1); }, anterior = function () { mexeu(); irPara(alvo - 1); };
    $('.vt-prox').addEventListener('click', proximo);
    $('.vt-ant').addEventListener('click', anterior);

    /* setas do teclado: só com a vitrine na tela e sem nenhuma janela aberta por cima */
    var onKey = function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      if (e.target.closest && e.target.closest('input, textarea, select, [role="dialog"], [role="tablist"], [role="listbox"]')) return;
      if (document.querySelector('[role="dialog"]:not([hidden])')) return;
      var r = raiz.getBoundingClientRect();
      if (r.bottom < innerHeight * .5 || r.top > innerHeight * .5) return;
      mexeu();
      if (e.key === 'ArrowRight') proximo(); else anterior();
    };
    document.addEventListener('keydown', onKey);

    /* clicar num tênis de trás traz ele para a frente; depois de arrastar, o clique é ignorado */
    var arrastou = false;
    fila.addEventListener('click', function (e) {
      var el = e.target.closest('.vt-tenis'); if (!el) return;
      if (arrastou) { e.stopPropagation(); e.preventDefault(); return; }
      mexeu();
      var d = Math.round(distancia(Number(el.getAttribute('data-i')), estado.pos));
      if (d) { e.stopPropagation(); irPara(Math.round(estado.pos) + d); }
    }, true);

    /* arrastar com inércia: a velocidade do gesto empurra o anel além do ponto e a mola encaixa */
    var inicio = 0;
    criarArraste(raiz, {
      onInicio: function () { gsap.killTweensOf(estado); inicio = estado.pos; arrastou = true; mexeu(); },
      onMove: function (dx) { estado.pos = inicio - dx / geo.passo; posicionar(); },
      onFim: function (dx, vel) {
        alvo = Math.round(estado.pos);
        irPara(Math.round(estado.pos - vel * 380 / geo.passo), true);
        setTimeout(function () { arrastou = false; }, 0);
      }
    });

    var onResize = function () { geo = geometria(); posicionar(); };
    root.addEventListener('resize', onResize);
    $('.vt-comprar').addEventListener('click', function (e) { if (e.currentTarget.getAttribute('aria-disabled') === 'true') e.preventDefault(); });

    posicionar();

    /* entrada: chamada pelo site. pausado = true devolve a linha do tempo parada, para tocar quando o anel chegar na tela */
    function entrar(pausado) {
      if (!movimento || !vivo) return null;
      var ordem = pares.slice().sort(function (a, b) { return Math.abs(distancia(+a.el.getAttribute('data-i'), 0)) - Math.abs(distancia(+b.el.getAttribute('data-i'), 0)); });
      var cab = o.titulo ? raiz.querySelectorAll('.vt-cab > *') : raiz.querySelectorAll('.vt-linha > span, .vt-abertura p');
      var tl = gsap.timeline({ delay: .05, paused: !!pausado })
        .from(cab, { yPercent: 60, autoAlpha: 0, duration: 1, stagger: .09, ease: 'expo.out' }, 0)
        .from(palavra, { yPercent: 25, autoAlpha: 0, duration: 1.4, ease: 'expo.out' }, .1)
        .from(ordem.map(function (t) { return t.img; }), { y: 100, autoAlpha: 0, duration: 1.2, stagger: .08, ease: 'expo.out' }, .2)
        .from($('.vt-nome-txt'), { clipPath: 'inset(0 100% 0 0)', duration: 1, ease: 'expo.out' }, .6)
        .from([$('.vt-rotulo'), $('.vt-frase'), $('.vt-urgencia'), $('.vt-precos'), $('.vt-cta'), $('.vt-garantia')], { y: 18, autoAlpha: 0, duration: .7, stagger: .06, ease: 'power3.out' }, .65)
        .from($('.vt-controles').children, { scale: .6, autoAlpha: 0, duration: .6, stagger: .06, ease: 'back.out(2)' }, .85)
        .from($('.vt-letreiro'), { yPercent: 100, duration: .8, ease: 'expo.out' }, .8);
      if (itens[atual] && itens[atual].preco != null) tl.fromTo(preco, { v: 0 }, { v: itens[atual].preco, duration: 1.2, ease: 'power3.out', onUpdate: setPreco, immediateRender: false }, .75);
      return tl;
    }

    return {
      proximo: proximo, anterior: anterior, entrar: entrar,
      /* a cor de um tênis chegou depois (lida da foto): atualiza o tom da palavra se ele estiver na frente */
      cor: function (id, rgb) {
        itens.forEach(function (it, i) { if (it.id !== id) return; it.cor = rgb; if (i === atual) raiz.style.setProperty('--palavra', corDaPalavra(rgb)); });
      },
      destruir: function () {
        vivo = false;
        if (auto) auto.kill();
        if (io) io.disconnect();
        document.removeEventListener('keydown', onKey);
        root.removeEventListener('resize', onResize);
        if (efeitos) efeitos.destruir();
        if (letreiro) letreiro.kill();
        pares.forEach(function (t) { gsap.killTweensOf([t.el, t.flutua, t.sombra, t.inclina, t.img]); });
        raiz.innerHTML = '';
      }
    };
  }

  root.GSVitrine = { montar: montar };
})(window);
