// Abre o site com a abertura, espera ela acabar e fotografa o topo (PC e celular).
const { chromium } = require('playwright'); const fs=require('fs'), path=require('path');
(async () => {
  const RAIZ='/home/user/sites-cinema/clientes/body-gym', TIPOS={'.html':'text/html','.json':'application/json','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.mp3':'audio/mpeg'};
  const b = await chromium.launch({ args:['--use-gl=swiftshader','--ignore-gpu-blocklist'] });
  for (const [n,w,h] of [['pc',1440,900],['cel',390,844]]) {
    const p = await b.newPage({ viewport:{width:w,height:h} }); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{ if(m.type()==='error') errs.push(m.text().slice(0,160)); });
    await p.route('http://bodygym.teste/**', r => { const f=path.join(RAIZ, decodeURIComponent(new URL(r.request().url()).pathname)); if(!fs.existsSync(f)) return r.fulfill({status:404,body:''}); r.fulfill({status:200, body:fs.readFileSync(f), contentType:TIPOS[path.extname(f)]||'application/octet-stream'}); });
    await p.goto('http://bodygym.teste/site.html',{timeout:120000}); await p.waitForTimeout(1000);
    const t0=Date.now(); await p.waitForFunction(()=>!document.documentElement.classList.contains('com-abertura'),null,{timeout:120000}).catch(()=>{});
    const durou=((Date.now()-t0)/1000).toFixed(1); await p.waitForTimeout(12000); await p.screenshot({ path:`s-${n}-topo.png`, timeout:120000 });
    const sx = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    console.log(n,'abertura saiu após +',durou,'s; scroll-x',sx, errs.slice(0,6)); await p.close(); }
  await b.close();
})();
