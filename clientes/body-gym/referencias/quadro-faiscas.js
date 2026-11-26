// Quadros com faíscas: node seek2.js prefixo "t|seletor|quadros" ...
const { chromium } = require('playwright'); const fs=require('fs'), path=require('path');
(async () => {
  const [prefix, ...casos] = process.argv.slice(2);
  const RAIZ='/home/user/sites-cinema/clientes/body-gym', TIPOS={'.html':'text/html','.webp':'image/webp','.png':'image/png','.mp3':'audio/mpeg'};
  const b = await chromium.launch({ args:['--use-gl=swiftshader','--ignore-gpu-blocklist'] });
  for (const [n,w,h] of [['pc',1440,900],['cel',390,844]]) {
    const p = await b.newPage({ viewport:{width:w,height:h} });
    await p.route('http://bodygym.teste/**', r => { const f=path.join(RAIZ, decodeURIComponent(new URL(r.request().url()).pathname)); r.fulfill({status:200, body:fs.readFileSync(f), contentType:TIPOS[path.extname(f)]||'application/octet-stream'}); });
    const errs=[]; p.on('pageerror',e=>errs.push(e.message));
    for (const c of casos) { const [t,sel,f]=c.split('|'); let u='http://bodygym.teste/abertura.html?t='+t; if(sel) u+='&faisca='+encodeURIComponent(sel)+'&f='+(f||8);
      await p.goto(u); await p.waitForTimeout(900); await p.screenshot({ path:`${prefix}${n}-${t}.png` }); }
    console.log(n, errs.length?errs:'sem erros'); await p.close();
  }
  await b.close();
})();
