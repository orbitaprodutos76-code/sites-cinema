/* ================================================================
   FUNDO — grade técnica em perspectiva (chão de HUD) em canvas
   Linhas douradas finas que correm devagar em direção à tela.
   Na apresentação a grade aparece forte e inclina conforme a rolagem;
   no resto do site fica mais baixa e apagada, sem disputar com as peças.
   Com "reduzir movimento" a grade é desenhada uma vez, parada.

   GSFundo.iniciar(canvas, { movimento, topo: elementoDaApresentacao })
   ================================================================ */
(function (root) {
  'use strict';

  function iniciar(cv, o) {
    if (!cv || !cv.getContext) return null;
    o = o || {};
    var ctx = cv.getContext('2d'), movimento = !!o.movimento;
    var W = 0, H = 0, dpr = 1, z0 = 0, t0 = 0, raf = 0, altTopo = 0, noTopo = true;
    var mouse = { x: .5, alvo: .5 }, rolagem = { y: 0, ultimo: 0, vel: 0 };

    function medir() {
      dpr = Math.min(root.devicePixelRatio || 1, leve ? 1 : 1.5);
      W = root.innerWidth; H = root.innerHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      altTopo = o.topo ? o.topo.offsetHeight : 0;
    }

    /* quanto da apresentação já passou: 0 no topo, 1 quando ela saiu da tela.
       a altura fica guardada (medida no resize): ler offsetHeight a cada quadro forçava o navegador a recalcular a página */
    function progressoTopo() {
      if (!o.topo) return 1;
      return Math.max(0, Math.min(1, rolagem.y / (altTopo || H)));
    }

    function desenhar(dt) {
      var p = progressoTopo();
      /* horizonte: começa no meio e sobe enquanto a apresentação sai (a grade "deita") */
      var hz = H * (.56 - p * .2);
      var forca = 1 - p * .5;
      var cx = W * (.5 + (mouse.x - .5) * .08);
      var f = H * .9, alturaCam = 1, perto = .35, longe = 26, passo = 1;
      z0 = (z0 + dt * (.32 + Math.min(rolagem.vel, 4) * .5)) % passo;

      ctx.clearRect(0, 0, W, H);
      ctx.lineWidth = 1;

      /* linhas que atravessam (paralelas ao horizonte), andando em direção à tela */
      for (var z = longe - z0; z > perto; z -= passo) {
        var y = hz + alturaCam * f / z;
        if (y > H + 2) continue;
        var a = Math.pow(1 - z / longe, 1.4) * .4 * forca;
        ctx.strokeStyle = 'rgba(217,180,90,' + a.toFixed(3) + ')';
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
      /* linhas que fogem para o ponto de fuga */
      var yPerto = hz + alturaCam * f / perto;
      for (var x = -24; x <= 24; x++) {
        var xs = cx + x * f / perto * .18, a2 = (1 - Math.abs(x) / 25) * .26 * forca;
        var g = ctx.createLinearGradient(0, hz, 0, Math.min(H, yPerto));
        g.addColorStop(0, 'rgba(217,180,90,0)');
        g.addColorStop(1, 'rgba(217,180,90,' + a2.toFixed(3) + ')');
        ctx.strokeStyle = g;
        ctx.beginPath(); ctx.moveTo(cx, hz); ctx.lineTo(xs, yPerto); ctx.stroke();
      }
      /* o horizonte: uma linha só, bem fina */
      ctx.strokeStyle = 'rgba(217,180,90,' + (.45 * forca).toFixed(3) + ')';
      ctx.beginPath(); ctx.moveTo(0, hz); ctx.lineTo(W, hz); ctx.stroke();
    }

    /* no celular a grade desenha a ~30 quadros por segundo: o movimento é lento e assim poupa bateria */
    var leve = root.matchMedia && root.matchMedia('(pointer: coarse), (max-width: 760px)').matches;
    function quadro(t) {
      raf = root.requestAnimationFrame(quadro);
      if (leve && t0 && t - t0 < 32) return;
      var dt = t0 ? Math.min(.05, (t - t0) / 1000) : 0; t0 = t;
      mouse.x += (mouse.alvo - mouse.x) * .04;
      rolagem.vel *= .92;
      desenhar(dt);
    }

    /* a grade só anda com a apresentação na tela; no resto do site ela fica parada (um desenho só) */
    function ligar() {
      var on = movimento && noTopo && !document.hidden;
      if (on && !raf) { t0 = 0; raf = root.requestAnimationFrame(quadro); }
      else if (!on && raf) { root.cancelAnimationFrame(raf); raf = 0; rolagem.y = root.scrollY || 0; desenhar(0); }
    }
    var onScroll = function () {
      var y = root.scrollY || 0;
      rolagem.vel = Math.min(6, rolagem.vel + Math.abs(y - rolagem.ultimo) / 120);
      rolagem.ultimo = rolagem.y = y;
      /* parada: só redesenha enquanto a apresentação ainda está saindo (depois a imagem não muda mais) */
      if (!raf && y <= (altTopo || H) + 40) desenhar(0);
    };
    var onMove = function (e) { if (e.pointerType === 'mouse') mouse.alvo = e.clientX / W; };
    var onResize = function () { medir(); desenhar(0); };
    var onVis = ligar;

    medir();
    rolagem.y = rolagem.ultimo = root.scrollY || 0;
    root.addEventListener('resize', onResize);
    root.addEventListener('scroll', onScroll, { passive: true });
    desenhar(0);
    if (movimento) {
      root.addEventListener('pointermove', onMove, { passive: true });
      document.addEventListener('visibilitychange', onVis);
      if (o.topo && 'IntersectionObserver' in root) new IntersectionObserver(function (en) { noTopo = en[en.length - 1].isIntersecting; ligar(); }).observe(o.topo);
      ligar();
    }

    return {
      destruir: function () {
        root.cancelAnimationFrame(raf);
        root.removeEventListener('resize', onResize);
        root.removeEventListener('scroll', onScroll);
        root.removeEventListener('pointermove', onMove);
        document.removeEventListener('visibilitychange', onVis);
      }
    };
  }

  root.GSFundo = { iniciar: iniciar };
})(window);
