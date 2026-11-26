// Palavras da abertura em 3D real (Three.js r160): metal com reflexo de estúdio, chão escuro, brilho de lente e faíscas 3D.
// A coreografia é montada dentro da timeline GSAP da abertura (window.P3D.monta), então ?t= (quadro a quadro) funciona.
import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const desk = matchMedia('(min-width: 761px)').matches;
const cv = document.getElementById('p3d');
let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, powerPreference: 'high-performance' }); }
catch (e) { window.dispatchEvent(new Event('p3d-falhou')); throw e; }
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, desk ? 2 : 1.5));
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .95;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const cena = new THREE.Scene(); cena.background = new THREE.Color(0x000000); cena.fog = new THREE.Fog(0x000000, 4, 11);  // perto/longe ajustados à câmera a cada quadro
const pmrem = new THREE.PMREMGenerator(renderer);
// ambiente de estúdio ESCURO com faixas de luz (softbox): é isso que faz o cromo parecer cromo (preto e prata, não plástico)
const estudio = new THREE.Scene(); estudio.background = new THREE.Color(0x020202);
function painel(w, h, x, y, z, r, g, b) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(r, g, b), side: THREE.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); estudio.add(m); }
painel(9, .55, 0, 5, .5, 6, 6, 6);          // faixa de cima
painel(.5, 5, -5, 1.2, 2, 3.2, 3.2, 3.4);   // faixa da esquerda
painel(.5, 5, 5, 1.6, -1, 2.4, 2.4, 2.6);   // faixa da direita
painel(12, .35, 0, .6, -6, .5, .42, .34);  // horizonte atrás (fraco: não manchar o chão)
painel(3, 3, 0, -4, 3, .25, .25, .28);      // rebatedor fraco embaixo
// faixas atrás da câmera: é o que a FACE da letra reflete (cromo clássico: claro em cima, faixa escura, horizonte embaixo)
painel(14, 1.6, 0, 3.6, 7, 1.5, 1.5, 1.6);
painel(14, 1.2, 0, 2.2, 7, .5, .5, .55);
painel(14, .9, 0, .9, 7, .02, .02, .025);
painel(14, .7, 0, -.1, 7, .85, .75, .65);
painel(14, 1.5, 0, -1.4, 7, .22, .22, .24);
cena.environment = pmrem.fromScene(estudio, 0).texture;
const cam = new THREE.PerspectiveCamera(32, 1, 0.05, 50);

// luzes: chave de cima, recorte quente atrás, vermelha para o TREINO
const chave = new THREE.SpotLight(0xffffff, 9, 20, Math.PI / 9, .7, 1.4); chave.position.set(0.6, 4.5, 3.5); chave.target.position.set(0, .5, 0); cena.add(chave, chave.target);
const recorte = new THREE.DirectionalLight(0xffc98a, 2.2); recorte.position.set(-2, 1.8, -3); cena.add(recorte);
const verm = new THREE.PointLight(0xff1020, 0, 6, 2); verm.position.set(0, 1.6, 2.6); cena.add(verm);

// chão escuro que reflete de leve
const chao = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({ color: 0x020202, roughness: .3, metalness: .85, envMapIntensity: .1 }));
chao.rotation.x = -Math.PI / 2; chao.position.y = 0; cena.add(chao);

// aço escovado: riscos finos na horizontal (rugosidade e relevo), quebram a face lisa
function escovado() { const c = document.createElement('canvas'); c.width = 512; c.height = 512; const x = c.getContext('2d');
  x.fillStyle = '#7a7a7a'; x.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 2600; i++) { const y = Math.random() * 512, v = 90 + Math.random() * 90 | 0; x.strokeStyle = `rgba(${v},${v},${v},${.12 + Math.random() * .25})`; x.lineWidth = .5 + Math.random(); x.beginPath(); x.moveTo(Math.random() * -200, y); x.lineTo(512 + Math.random() * 200, y + (Math.random() - .5) * 2); x.stroke(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2.6, 2.6); return t; }
const texEsc = escovado();
// materiais: face polida + lateral escovada; TREINO em brasa
const aco = [new THREE.MeshPhysicalMaterial({ color: 0xd8dbe0, metalness: 1, roughness: .3, roughnessMap: texEsc, bumpMap: texEsc, bumpScale: .6, clearcoat: .35, clearcoatRoughness: .2 }),
             new THREE.MeshPhysicalMaterial({ color: 0x8e939b, metalness: 1, roughness: .38, roughnessMap: texEsc })];
const brasa = [new THREE.MeshPhysicalMaterial({ color: 0xff0d1e, metalness: .85, roughness: .22, roughnessMap: texEsc, bumpMap: texEsc, bumpScale: .4, emissive: 0xff0012, emissiveIntensity: .32, clearcoat: .8, clearcoatRoughness: .1 }),
               new THREE.MeshPhysicalMaterial({ color: 0x9a0010, metalness: .9, roughness: .3, emissive: 0x6a0008, emissiveIntensity: .35 })];

// pós: brilho de lente
const comp = new EffectComposer(renderer);
comp.addPass(new RenderPass(cena, cam));
const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), .3, .45, .96); comp.addPass(bloom);
comp.addPass(new OutputPass());

// faíscas 3D: segmentos (cabeça, cauda) com cor de temperatura
const MAX = 1400, pos = new Float32Array(MAX * 6), cor = new Float32Array(MAX * 6), fx = [];
const gFa = new THREE.BufferGeometry();
gFa.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
gFa.setAttribute('color', new THREE.BufferAttribute(cor, 3).setUsage(THREE.DynamicDrawUsage));
const linhas = new THREE.LineSegments(gFa, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
linhas.frustumCulled = false; cena.add(linhas);
function solta(mesh, qtd, forca) {
  const bb = new THREE.Box3().setFromObject(mesh), n = Math.round(qtd * (desk ? 1 : .6));
  for (let i = 0; i < n && fx.length < MAX; i++) {
    const x = bb.min.x + (bb.max.x - bb.min.x) * (.04 + Math.random() * .92);
    const lado = (x - (bb.min.x + bb.max.x) / 2) / ((bb.max.x - bb.min.x) / 2 || 1);
    const v = (1.6 + Math.random() * 4.2) * forca, a = Math.random() * Math.PI * 2;
    fx.push({ p: new THREE.Vector3(x, 0.01, bb.max.z - Math.random() * .1), v: new THREE.Vector3(lado * v * .55 + Math.cos(a) * v * .35, v * (.45 + Math.random() * .75), Math.sin(a) * v * .5 + v * .25), t: 1, vida: .35 + Math.random() * .9, peso: .7 + Math.random() * .6 });
  }
}
function calor(t, out) { // branco-amarelo -> laranja -> vermelho
  if (t > .7) out.setRGB(1, .97, .82); else if (t > .45) out.setRGB(1, .68, .3); else if (t > .22) out.setRGB(1, .4, .12); else out.setRGB(.8, .14, .05);
  return out;
}
const tmp = new THREE.Color();
function passoFaiscas(dt) {
  let n = 0;
  for (let i = fx.length - 1; i >= 0; i--) {
    const f = fx[i]; f.vida -= dt; if (f.vida <= 0) { fx.splice(i, 1); continue; }
    f.t = Math.max(0, f.t - dt * (1.1 + .9 / f.peso));
    f.v.multiplyScalar(Math.pow(.5, dt)); f.v.y -= 9 * f.peso * dt; f.p.addScaledVector(f.v, dt);
    if (f.p.y < 0) { f.p.y = 0; f.v.y *= -.35; f.v.x *= .7; f.v.z *= .7; }        // quica no chão
    const k = Math.min(1, f.vida * 3) * (.35 + .65 * f.t) * 1.6, r = .02 + .02 * f.t, o = n * 6;
    pos[o] = f.p.x; pos[o + 1] = f.p.y; pos[o + 2] = f.p.z;
    pos[o + 3] = f.p.x - f.v.x * r; pos[o + 4] = f.p.y - f.v.y * r; pos[o + 5] = f.p.z - f.v.z * r;
    calor(f.t + .15, tmp); cor[o] = tmp.r * k; cor[o + 1] = tmp.g * k; cor[o + 2] = tmp.b * k;
    calor(f.t, tmp); cor[o + 3] = tmp.r * k * .25; cor[o + 4] = tmp.g * k * .25; cor[o + 5] = tmp.b * k * .25;
    n++;
  }
  gFa.setDrawRange(0, n * 2); gFa.attributes.position.needsUpdate = true; gFa.attributes.color.needsUpdate = true;
}

// palavras
const palavras = {};
function criaPalavra(fonte, texto, materiais, tamanho) {
  const g = new TextGeometry(texto, { font: fonte, size: tamanho, height: tamanho * .3, depth: tamanho * .3, curveSegments: desk ? 10 : 6,
    bevelEnabled: true, bevelThickness: tamanho * .035, bevelSize: tamanho * .022, bevelSegments: desk ? 5 : 3 });
  g.computeBoundingBox(); const b = g.boundingBox;
  g.translate(-(b.min.x + b.max.x) / 2, -b.min.y, -(b.min.z + b.max.z) / 2);   // base no chão, centro no meio
  g.computeBoundingBox();
  const m = new THREE.Mesh(g, materiais); m.visible = false; cena.add(m);
  m.userData.larg = g.boundingBox.max.x - g.boundingBox.min.x; m.userData.alt = g.boundingBox.max.y;
  return m;
}
const CAM = { x: 0, y: .5, z: 4, lx: 0, ly: .45, lz: 0, rol: 0, trem: 0 };
let W = innerWidth, H = innerHeight;
function ajusta() { W = innerWidth; H = innerHeight; renderer.setSize(W, H, false); comp.setSize(W, H); cam.aspect = W / H; cam.updateProjectionMatrix(); bloom.resolution.set(W / 2, H / 2); }
// distância para a palavra ocupar 'ocupa' da largura da tela
function distPara(m, ocupa) { const vf = THREE.MathUtils.degToRad(cam.fov) / 2, hf = Math.atan(Math.tan(vf) * cam.aspect); return (m.userData.larg / 2) / Math.tan(hf) / ocupa; }

let tempo = 0;
function quadro(dt) {
  passoFaiscas(dt); tempo += dt;
  const s = CAM.trem; const tx = s ? (Math.sin(tempo * 61) * .5 + Math.sin(tempo * 37) * .5) * s : 0, ty = s ? Math.cos(tempo * 53) * s : 0;
  cena.fog.near = CAM.z * 1.05; cena.fog.far = CAM.z * 3.2;
  cam.position.set(CAM.x + tx, CAM.y + ty, CAM.z); cam.lookAt(CAM.lx, CAM.ly, CAM.lz); cam.rotateZ(CAM.rol);
  comp.render();
}

new FontLoader().load('midia/anton-3d.json', fonte => {
  ajusta(); addEventListener('resize', ajusta);
  const t = desk ? 1 : 1;
  palavras.alem = criaPalavra(fonte, 'ALÉM', aco, t);
  palavras.deum = criaPalavra(fonte, 'DE UM', aco, t * .62);
  palavras.simples = criaPalavra(fonte, 'SIMPLES', aco, t);
  palavras.treino = criaPalavra(fonte, 'TREINO', brasa, t);
  renderer.compile(cena, cam);

  window.P3D = {
    quadro, solta: (n, q, f) => solta(palavras[n], q, f), cam: CAM, desk,
    // monta a coreografia 3D dentro da timeline da abertura; t = instante do impacto de cada palavra
    monta(tl, T) {
      const gs = window.gsap, P = palavras, ocupa = desk ? .72 : .86;
      const mostra = (n, t0) => Object.keys(P).forEach(k => tl.set(P[k], { visible: k === n }, t0));
      const treme = (t0, forca) => { tl.fromTo(CAM, { trem: forca }, { trem: 0, duration: .45, ease: 'power3.out', immediateRender: false }, t0); };
      tl.set('#p3d', { opacity: 1 }, 0);
      // ALÉM · câmera rasante, quase no chão; a palavra despenca na frente dela
      let m = P.alem, d = distPara(m, ocupa);
      mostra('alem', T.alem - .26); tl
        .fromTo(m.position, { y: m.userData.alt * 1.6 }, { y: 0, duration: .26, ease: 'power3.in' }, T.alem - .26)
        .fromTo(CAM, { x: -.25, y: .12, z: d * .92, lx: 0, ly: m.userData.alt * .55, lz: 0, rol: .03 }, { x: .2, z: d * .84, rol: -.01, duration: .7, ease: 'none' }, T.alem - .26)
        .add(() => solta(P.alem, 260, 1), T.alem);
      treme(T.alem, .03);
      // DE UM · a câmera recua rápido enquanto a palavra chega
      m = P.deum; d = distPara(m, desk ? .42 : .6);
      mostra('deum', T.deum - .22); tl
        .fromTo(m.position, { z: -2.5 }, { z: 0, duration: .22, ease: 'power4.in' }, T.deum - .22)
        .fromTo(CAM, { x: .1, y: m.userData.alt * .9, z: d * .55, lx: 0, ly: m.userData.alt * .5, rol: -.04 }, { z: d * 1.05, rol: 0, duration: .5, ease: 'expo.out' }, T.deum - .22)
        .add(() => solta(P.deum, 130, .7), T.deum);
      treme(T.deum, .02);
      // SIMPLES · a palavra está deitada, levanta e bate; a câmera gira em volta
      m = P.simples; d = distPara(m, ocupa);
      mostra('simples', T.simples - .24); tl
        .fromTo(m.rotation, { x: -Math.PI / 2 }, { x: 0, duration: .24, ease: 'power4.in' }, T.simples - .24)
        .fromTo(CAM, { x: -d * .45, y: m.userData.alt * 1.1, z: d * .9, lx: 0, ly: m.userData.alt * .45, rol: 0 }, { x: -d * .12, y: m.userData.alt * .6, z: d * 1.0, duration: .78, ease: 'power2.out' }, T.simples - .24)
        .add(() => solta(P.simples, 300, 1.05), T.simples);
      treme(T.simples, .035);
      // TREINO · metal em brasa; a câmera avança com força no impacto
      m = P.treino; d = distPara(m, ocupa);
      mostra('treino', T.treino - .02); tl
        .fromTo(CAM, { x: 0, y: m.userData.alt * .5, z: d * 1.55, lx: 0, ly: m.userData.alt * .5, rol: .05 }, { z: d * .98, rol: 0, duration: .3, ease: 'expo.out' }, T.treino - .02)
        .to(CAM, { z: d * .9, duration: .7, ease: 'none' }, T.treino + .28)
        .fromTo(verm, { intensity: 10 }, { intensity: 3, duration: .6, ease: 'power2.out', immediateRender: false }, T.treino)
        .fromTo(brasa[0], { emissiveIntensity: 1.1 }, { emissiveIntensity: .32, duration: .6, ease: 'power2.out', immediateRender: false }, T.treino)
        .add(() => solta(P.treino, 420, 1.3), T.treino);
      treme(T.treino, .05);
      // fim das palavras: some e libera a tela para o BODY GYM
      mostra(null, T.fim); tl.set(verm, { intensity: 0 }, T.fim).set('#p3d', { opacity: 0 }, T.fim + .02);
    }
  };
  window.dispatchEvent(new Event('p3d-pronto'));
}, undefined, () => window.dispatchEvent(new Event('p3d-falhou')));
