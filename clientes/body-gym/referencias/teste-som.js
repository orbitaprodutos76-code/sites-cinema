// Mede quando cada som começa em relação à timeline (Web Audio real, sem ouvir).
const { chromium } = require('playwright'); const fs=require('fs'), path=require('path');
(async () => {
  const RAIZ='/home/user/sites-cinema/clientes/body-gym', TIPOS={'.html':'text/html','.webp':'image/webp','.png':'image/png','.mp3':'audio/mpeg'};
  const b = await chromium.launch({ args:['--use-gl=swiftshader','--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage({ viewport:{width:1440,height:900} });
  await p.route('http://bodygym.teste/**', r => { const f=path.join(RAIZ, decodeURIComponent(new URL(r.request().url()).pathname)); r.fulfill({status:200, body:fs.readFileSync(f), contentType:TIPOS[path.extname(f)]||'application/octet-stream'}); });
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(() => { window.__log=[]; const o=AudioBufferSourceNode.prototype.start;
    AudioBufferSourceNode.prototype.start=function(w,off){ const tl=window.abertura&&window.abertura.tl; window.__log.push({tl:tl?+tl.time().toFixed(3):null, off:+(off||0).toFixed(3), dur:+this.buffer.duration.toFixed(2)}); return o.apply(this,arguments); }; });
  await p.goto('http://bodygym.teste/abertura.html'); await p.waitForTimeout(7000);
  await p.click("#painel button[data-som]"); await p.waitForFunction(()=>window.abertura.tl.progress()>=1,null,{timeout:60000});
  console.log(JSON.stringify(await p.evaluate(()=>window.__log)), errs, await p.evaluate(()=>({dur:window.abertura.tl.duration(), t:window.abertura.tl.time(), labels:window.abertura.tl.getChildren(false,false,true).filter(c=>c.data!==undefined||true).length})));
  await b.close();
})();
