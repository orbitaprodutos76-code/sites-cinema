// Quadro a quadro exato: abre a abertura pausada em cada segundo (?t=) e fotografa. uso: node seek.js <prefixo> t1,t2,... [pc|cel|ambos]
const { chromium } = require('playwright');
(async () => {
  const [prefix, ts, quem = 'ambos'] = process.argv.slice(2);
  const base = 'http://bodygym.teste/abertura.html'; const fs = require('fs'), path = require('path'); const RAIZ = '/home/user/sites-cinema/clientes/body-gym';
  const TIPOS = { '.html': 'text/html', '.webp': 'image/webp', '.png': 'image/png', '.js': 'text/javascript' };
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const alvos = [['pc', 1440, 900], ['cel', 390, 844]].filter(a => quem === 'ambos' || a[0] === quem);
  for (const [n, w, h] of alvos) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    await p.route('http://bodygym.teste/**', r => { const u = new URL(r.request().url()); const f = path.join(RAIZ, decodeURIComponent(u.pathname)); r.fulfill({ status: 200, body: fs.readFileSync(f), contentType: TIPOS[path.extname(f)] || 'application/octet-stream' }); });
    const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() !== 'log') errs.push(m.text()); });
    for (const t of ts.split(',')) {
      await p.goto(base + '?t=' + t); await p.waitForTimeout(900);
      await p.screenshot({ path: `${prefix}${n}-${t}.png` });
    }
    console.log(n, errs.length ? errs.slice(0, 5) : 'sem erros');
    await p.close();
  }
  await b.close();
})();
