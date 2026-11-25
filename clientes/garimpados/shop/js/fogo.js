/* ================================================================
   FOGO — brasas e calor atrás das Ofertas quentes, em canvas
   Fagulhas sobem do pé da seção, balançam, brilham e apagam.
   Uma faixa de chama baixa respira no rodapé da seção.
   Só roda com a seção na tela e a aba visível.
   Com "reduzir movimento" desenha só o brilho parado.

   GSFogo.iniciar(canvas, { movimento, secao })
   ================================================================ */
(function (root) {
  'use strict';

  function iniciar(cv, o) {
    if (!cv || !cv.getContext) return null;
    o = o || {};
    var ctx = cv.getContext('2d'), movimento = !!o.movimento, sec = o.secao || cv.parentNode;
    var W = 0, H = 0, dpr = 1, raf = 0, t0 = 0, vivo = false, brasas = [], tempo = 0;

    function medir() {
      /* brasas são borradas de propósito: resolução 1x basta e alivia o celular */
      dpr = 1;
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var alvo = Math.round(Math.min(leve ? 45 : 90, W * H / (leve ? 16000 : 11000)));
      while (brasas.length < alvo) brasas.push(nova(true));
      brasas.length = alvo;
    }
    function nova(espalha) {
      return {
        x: Math.random() * W,
        /* a seção é alta: metade nasce no pé, o resto espalhado pela altura toda */
        y: espalha || Math.random() < .5 ? H * (.08 + Math.random() * .92) : H + 6,
        r: 1 + Math.random() * 2.4,
        v: 26 + Math.random() * 60,
        fase: Math.random() * 6.28,
        bal: 8 + Math.random() * 22,
        vida: 0,
        dura: 2.6 + Math.random() * 3.4
      };
    }

    /* chama baixa: manchas quentes que sobem e descem no rodapé da seção */
    function chama() {
      var g = ctx.createLinearGradient(0, H, 0, H * .55);
      g.addColorStop(0, 'rgba(255,92,24,.20)');
      g.addColorStop(.45, 'rgba(217,120,40,.07)');
      g.addColorStop(1, 'rgba(217,180,90,0)');
      ctx.fillStyle = g; ctx.fillRect(0, H * .55, W, H * .45);
      ctx.globalCompositeOperation = 'lighter';
      for (var i = 0; i < 7; i++) {
        var x = W * (i + .5) / 7 + Math.sin(tempo * .7 + i * 1.7) * W * .03;
        var alt = H * (.16 + .07 * Math.sin(tempo * 1.3 + i * 2.1));
        var rg = ctx.createRadialGradient(x, H, 0, x, H, alt);
        rg.addColorStop(0, 'rgba(255,120,30,.16)');
        rg.addColorStop(.6, 'rgba(255,70,20,.05)');
        rg.addColorStop(1, 'rgba(255,60,20,0)');
        ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(x, H, alt, 0, 6.29); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    }

    /* cada brasa é uma imagem pronta (brilho + miolo claro), desenhada uma vez só: criar gradientes
       para cada fagulha em todo quadro pesava demais. Duas cores: laranja (nasce) e dourado (esfria). */
    function sprite(cor) {
      var c = document.createElement('canvas'), s = 64, x = c.getContext('2d'); c.width = c.height = s;
      var g = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      g.addColorStop(0, 'rgba(255,236,190,1)'); g.addColorStop(.14, 'rgba(255,236,190,.9)');
      g.addColorStop(.16, 'rgba(' + cor + ',1)'); g.addColorStop(.3, 'rgba(' + cor + ',.45)'); g.addColorStop(1, 'rgba(' + cor + ',0)');
      x.fillStyle = g; x.fillRect(0, 0, s, s); return c;
    }
    var spQuente = sprite('255,150,40'), spOuro = sprite('230,170,90');
    function desenhar(dt) {
      tempo += dt;
      ctx.clearRect(0, 0, W, H);
      chama();
      if (!movimento) return;
      ctx.globalCompositeOperation = 'lighter';
      for (var i = 0; i < brasas.length; i++) {
        var b = brasas[i];
        b.vida += dt; b.y -= b.v * dt;
        var k = b.vida / b.dura;
        if (k >= 1 || b.y < -10) { brasas[i] = nova(false); continue; }
        var x = b.x + Math.sin(tempo * 1.6 + b.fase) * b.bal * k;
        /* nasce laranja forte, esfria para dourado e some */
        var a = Math.sin(Math.PI * Math.min(1, k * 1.15)) * (.55 + .45 * Math.sin(tempo * 9 + b.fase));
        var rr = b.r * (1.6 - k * .7) * 4;
        ctx.globalAlpha = a > 0 ? a : 0;
        ctx.drawImage(k < .5 ? spQuente : spOuro, x - rr, b.y - rr, rr * 2, rr * 2);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }

    /* no celular as brasas andam a ~30 quadros por segundo */
    var leve = root.matchMedia && root.matchMedia('(pointer: coarse), (max-width: 760px)').matches;
    function quadro(t) {
      raf = root.requestAnimationFrame(quadro);
      if (leve && t0 && t - t0 < 32) return;
      var dt = t0 ? Math.min(.05, (t - t0) / 1000) : 0; t0 = t;
      desenhar(dt);
    }
    function ligar(on) {
      if (on && movimento && !document.hidden) { if (!raf) { t0 = 0; raf = root.requestAnimationFrame(quadro); } }
      else if (raf) { root.cancelAnimationFrame(raf); raf = 0; }
    }

    var onResize = function () { medir(); desenhar(0); };
    var onVis = function () { ligar(vivo); };
    medir(); desenhar(0);
    root.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVis);
    var io = null;
    if ('IntersectionObserver' in root) {
      io = new IntersectionObserver(function (en) { vivo = en[0].isIntersecting; if (vivo) medir(); ligar(vivo); });
      io.observe(sec);
    } else { vivo = true; ligar(true); }

    return {
      medir: onResize,
      destruir: function () {
        ligar(false); if (io) io.disconnect();
        root.removeEventListener('resize', onResize);
        document.removeEventListener('visibilitychange', onVis);
      }
    };
  }

  root.GSFogo = { iniciar: iniciar };
})(window);
