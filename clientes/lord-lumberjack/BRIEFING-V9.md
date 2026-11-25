# BRIEFING · Site Lord Lumberjack v6 ("site caro")
De: JARVIS v8 · Para: JARVIS v9 · 24/11/2026
Pasta: `ediçao/negocios-locais/amostra-lord/` · Arquivo: `index.html` (o v8 NÃO mexe mais nele enquanto você trabalha)
Servidor de teste: `.claude/launch.json` → "amostra-lord" (porta 5197). Versões antigas: `index-v1..v4.html`.

---

## 0. Contexto (leia antes de tudo)
- A Lord Lumberjack é uma barbearia **de nome forte** em Mineiros-GO, com nota 5,0 e 125 avaliações no Google. O usuário disse: *"não posso entregar qualquer coisa"*. O site precisa parecer de **estúdio caro** (Awwwards / site de grife), nada que pareça modelo pronto.
- A identidade deles é **verde e preto**: parede verde vazada (verde-folha), concreto grafite e luz branca de LED. Paleta atual no `:root`: `--green2:#6dbb3a`, `--led:#f4fbef`, fundo `#040504` / `#0d0e0d`.
- As fontes já aprovadas são **Bodoni Moda** (títulos) + **Manrope** (rótulos). Manter.
- Tudo o que é dado real já está no site e **não pode ser inventado**: serviços e preços, os 4 barbeiros (Carlos, Felipe Silva, Joaquim, Júlio César), o Club VIP (R$ 119,90) e o Premium (R$ 159,90) com os benefícios, 28 produtos, horário, endereço, Instagram @lord_lumberjack, telefone (64) 99931-9087 (o WhatsApp não foi confirmado) e a agenda em `https://sites.appbarber.com.br/lordlumberjackb-nxpr`.
- **O usuário rejeitou como AMADOR:** o anel de espelho piscando (na abertura, na seção "Olhe pelo espelho" e na transição de agendar) e a luz-anel que segue o dedo no topo. **Remover todos os motivos de "anel/espelho".** A nova linguagem visual é **LED em linha / letreiro de neon**.
- Regras do usuário: perguntas sempre em múltipla escolha com `multiSelect: true`, tratamento de "senhor" e honestidade total. Pedir OK antes de baixar arquivos. Nunca mexer fora das nossas pastas, porque o PC tem dados do pai.

## 1. Skills a carregar ANTES de codar
`motion-design`, `gsap`, `emil-design-eng`, `design-taste-frontend`, `impeccable`. Se precisar de WebGL: `threejs-postprocessing` e `threejs-performance`. Depois de pronto, usar `site-qualidade-seo-acessibilidade` pra conferir.

## 2. Permissão necessária (perguntar ao usuário 1 vez, multiSelect:true)
Baixar as 9 imagens públicas do AppBarber pra `amostra-lord/img/` (cerca de 50 KB cada). Sem elas não dá pra vetorizar a logo, medir o letreiro pro corte, nem deixar o site independente:
- logo: `https://img-appbarber-appbeleza.s3.amazonaws.com/lordlumberjackb-nxpr%2F1730924686597` (623×399)
- fotos: `.../lordlumberjackb-nxpr%2Festablishment-images%2F{1757354822864, 1757354835947, 1757354859850, 1757354873478, 1757354895359, 1757354912336, 1757354927547, 1757354946575}` (600×600 cada)
- Depois de baixar, trocar todos os links do S3 no HTML pelos arquivos locais.

---

## 3. ABERTURA "Letreiro de LED" (5 s, botão Pular, som opcional)
**Pedido do usuário, palavra por palavra:** *"animação cinematográfica em luz e sombras, os LEDs vão acendendo aos poucos como se as luzes fossem escorrendo até formar 'LORD LUMBERJACK'. Use como base a logo, porém sem 'barbearia Mineiros GO'. O mais cinema possível."*

### 3.1 Vetorizar a logo
- Com `img/logo.png` (local), rodar Python + OpenCV (já instalado: `cv2`, `numpy`, `PIL`): limiar → `findContours` (RETR_CCOMP) → `approxPolyDP` leve → exportar `img/logo-led.svg` com os **contornos** das letras.
- **Manter só** o monograma "L" ornamental, **LORD** e **LUMBERJACK**. **Remover** a palavra pequena de baixo ("BARBEARIA" com os ornamentos), como o usuário pediu.
- Se o traçado ficar serrilhado (a imagem tem só 623 px), suavizar com Chaikin/Catmull-Rom ou redesenhar os trechos ruins à mão. Fidelidade de estilo > perfeição. **Conferir lado a lado com o original** antes de seguir.

### 3.2 Motor de LED (Canvas 2D, rápido no celular)
Amostrar pontos ao longo de cada contorno do SVG, com espaçamento de 5 a 7 px na escala final. Cada ponto é um "LED". Desenhar com `globalCompositeOperation='lighter'` e um sprite de brilho pré-renderizado. A "luz escorrendo" é a **frente de acendimento**, que percorre cada contorno com velocidade e atraso diferentes, como líquido descendo.

```js
// núcleo sugerido (adaptar)
const glow = (() => { const c=document.createElement('canvas'); c.width=c.height=64; const g=c.getContext('2d');
  const r=g.createRadialGradient(32,32,0,32,32,32);
  r.addColorStop(0,'rgba(255,255,250,1)'); r.addColorStop(.18,'rgba(235,255,225,.9)');
  r.addColorStop(.45,'rgba(140,210,100,.35)'); r.addColorStop(1,'rgba(109,187,58,0)');
  g.fillStyle=r; g.fillRect(0,0,64,64); return c; })();

// leds: [{x,y,path,t}] onde t = posição 0..1 ao longo do seu contorno
// cada contorno tem: delay (stagger de cima p/ baixo + aleatório), speed, e um "drip" (algumas gotas que escorrem além do contorno e se apagam)
function frame(time){
  ctx.globalCompositeOperation='source-over';
  ctx.fillStyle='rgba(4,5,4,0.35)';            // rastro leve = luz "persistente"
  ctx.fillRect(0,0,W,H);
  ctx.globalCompositeOperation='lighter';
  for(const L of leds){
    const front = (time - L.path.delay) * L.path.speed;   // frente de acendimento
    let k = clamp((front - L.t) * 6, 0, 1);               // 0 = apagado, 1 = aceso
    if(k<=0) continue;
    const flick = k<1 ? (Math.random()<.25 ? .3 : 1) : 1; // estalo ao acender
    const s = 10 + 14*k;                                  // halo cresce ao acender
    ctx.globalAlpha = k*flick*L.intensity;
    ctx.drawImage(glow, L.x-s/2, L.y-s/2, s, s);
  }
  requestAnimationFrame(frame);
}
```
- **Bloom de cinema:** desenhar o canvas de LEDs também num segundo canvas com `filter:blur(18px)` e `mix-blend-mode:screen` por cima (ou blur no `ctx.filter`, que é mais caro). Opcional: WebGL com UnrealBloom, **só** se o desempenho no celular ficar bom.
- **Linguagem de cinema obrigatória:**
  - **grão de filme** animado (canvas de ruído 256 px, repetido, trocado a cada 2 quadros, opacidade 0,06);
  - **vinheta** forte;
  - **névoa/fumaça** lenta (2 ou 3 camadas de ruído suave se movendo devagar, opacidade baixa, iluminadas pelo LED);
  - **reflexo no chão** (cópia espelhada, borrada, 15% de opacidade, abaixo do letreiro);
  - **câmera** fazendo push-in lento (escala de 1,00 a 1,06 em 5 s);
  - **lens flare anamórfico** (faixa horizontal fina e brilhante) no instante em que a última letra acende;
  - **barras de cinema** (letterbox) que entram no começo e saem no fim.
- **Roteiro (5 s):**
  - 0,0–0,4: preto, grão e barras.
  - 0,4–1,0: o "L" ornamental acende primeiro, de cima pra baixo, com estalos.
  - 1,0–2,6: LORD se forma, com a luz escorrendo letra a letra; algumas gotas descem e se apagam.
  - 2,6–3,4: LUMBERJACK acende rápido, da esquerda pra direita; flare.
  - 3,4–4,0: tudo pulsa uma vez (o LED "estabiliza").
  - 4,0–5,0: **CORTE NA PAREDE** (abaixo).
- **Som opcional (WebAudio, sem arquivo):** um botão discreto de alto-falante, desligado por padrão. Se a pessoa ligar: zumbido de 60 Hz + harmônico de 120 Hz em volume baixo, mais "tic" de ruído filtrado (bandpass 3 kHz, 15 ms) a cada estalo de LED. Celular bloqueia som automático; só toca depois do toque.
- **Botão Pular** sempre visível. Toca 1 vez por sessão (`sessionStorage`); `?intro` na URL força tocar. `prefers-reduced-motion` = sem abertura.

### 3.3 Corte na parede (a assinatura do site)
A foto `1757354912336` (topo do site) tem o **letreiro LORD real na parede**. Medir na imagem local (cv2 ou olhando) o retângulo exato do letreiro, em % da foto. No segundo 4,0, o letreiro de LED **voa (escala + posição) até cair exatamente em cima do letreiro da foto**, enquanto a foto aparece por baixo (opacidade 0 → 1) e os LEDs se apagam rapidamente pra revelar o letreiro real. Calcular o alvo a partir do `object-fit:cover` da foto no viewport atual (função de mapeamento % → px). Resultado: a animação "vira" a barbearia de verdade.

### 3.4 Desempenho
- Medir FPS nos primeiros 30 quadros. Abaixo de 40, ligar o **modo leve**: menos LEDs (espaçamento 10 px), sem névoa e sem bloom extra.
- `devicePixelRatio` limitado a 2. Pausar tudo quando a aba ficar oculta.

---

## 4. ROLAGEM DE CINEMA
- **Lenis** pra rolagem suave e pesada: `https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js` (conferir a versão; integrar com ScrollTrigger usando `lenis.on('scroll', ScrollTrigger.update)` e `gsap.ticker.add(t=>lenis.raf(t*1000))`, com `gsap.ticker.lagSmoothing(0)`).
- **Capítulos numerados**, editoriais: `01 — O Ambiente`, `02 — A Carta`, `03 — Os Barbeiros`, `04 — Club Lord`, `05 — A Loja`, `06 — Reputação`, `07 — Endereço`. Número grande em Bodoni itálico fino, linha de LED verde fina e título gigante.
- Muito espaço preto, grid assimétrico, textos curtos. As fotos entram com revelação por máscara **linear** (de baixo pra cima, `clip-path inset`) e parallax interno. **Nada de círculos.**
- **Remover** a seção `mirror-pin` ("Olhe pelo espelho") e o `spot`/`spot-ring` do topo.
- O topo continua com a foto da parede (já pós-corte), título letra a letra e os CTAs. Opcional: o letreiro real da foto ganha um leve "brilho de LED" pulsando (máscara recortada no retângulo medido).
- **Transição de agendar:** trocar o anel por uma **linha de LED** que atravessa a tela da esquerda pra direita, com "Abrindo a agenda da Lord…" em Bodoni itálico. Manter a lógica atual (cerca de 1,2 s, mesma aba, `pageshow` limpa o estado).

## 5. CARDÁPIO DE GRIFE (substitui as abas de serviços)
- Estilo **carta de bar de luxo**:
  - centralizado, com coluna estreita;
  - categorias em versalete espaçado (`I. Cabelo`, `II. Barba`, `III. Combos`, `IV. Química`, `V. Detalhes`), com uma linha de LED fininha antes e depois;
  - nome do serviço em Bodoni;
  - linha de pontos substituída por um fio de 1 px que **acende em verde** ao passar o mouse;
  - preço em Bodoni, alinhado à direita, e "Consultar" em itálico.
- Duração (30 min / 60 min) como nota pequena embaixo do nome, em Manrope.
- Os combos ficam em destaque: um bloco de 2 colunas com borda fina de LED.
- No celular, uma coluna, com toque abrindo um botão "Agendar este".
- Os preços continuam **exatamente** os atuais (ver `const SERV` no `index.html`).

## 6. Espaços pros vídeos da visita
Criar os elementos com `data-video="tomada-XX"` e uma imagem de reserva (as fotos atuais) onde os vídeos vão entrar depois:
- topo: tomada 01;
- abertura de capítulo 01: tomada 05;
- capítulo 03 (barbeiros): tomada 09;
- faixa entre capítulos: tomadas 03, 04 e 06 em loop mudo.

Formato: `<video muted playsinline loop preload="metadata" poster="...">`, com 1080p H.264 e no máximo 4 MB por vídeo.

## 7. Critério de pronto (conferir antes de mostrar ao usuário)
- [ ] A abertura parece cinema: LED escorrendo, grão, névoa, flare e o corte na parede alinhado (testar em 1280×720, 1440×900, 375×812 e 390×844).
- [ ] Zero motivos de anel/espelho sobrando.
- [ ] 50+ FPS no PC; o modo leve funciona (testar com `?lite`).
- [ ] Sem erros no console e sem rolagem pro lado no celular.
- [ ] Todos os dados reais estão intactos. Nada inventado.
- [ ] Botão Pular, som desligado por padrão, `prefers-reduced-motion` respeitado.
- [ ] Mostrar ao usuário **só a abertura primeiro** (ele aprova por etapas) e depois o resto.
- [ ] Salvar a versão anterior como `index-v5.html` antes de começar.
