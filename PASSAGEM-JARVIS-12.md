# Passagem JARVIS 11 → JARVIS 12 — 26/11/2026

Leia antes de tudo: `CLAUDE.md` (tom JARVIS, "senhor", perguntas **sempre múltipla escolha com "Outro"**, respostas curtas, tudo mora no repositório).
Branch: `feat/importar-sites` (PR em rascunho #1). Regra mantida: **nenhum código antes de o senhor aprovar uma imagem/vídeo de referência.**

## Por que trocamos
Conversa do JARVIS 11 ficou longa demais e o senhor sentiu o trabalho enfraquecer. Recomendação: trabalhar **pelo PC** na próxima fase (placa de vídeo real para testar WebGL, prévia no celular pela rede local, envio de vídeos grandes).

## Cliente atual: Body Gym Academia (Mineiros-GO) — `clientes/body-gym/`
- Resumo completo e decisões: `clientes/body-gym/BRIEFING.md`. Site: `clientes/body-gym/site.html` → https://claude.ai/artifact/YbigACjfUkiwTn5zf8DWVZ (versão 5).
- Dados: Av. Afonso José Carrijo, Qd. 13, Lt. 8, Res. Parque Flamboyant · WhatsApp (64) 9 9231-9285 · seg–sex 5h–23h, sáb 8h–16h, dom 8h–12h · desde 2019 · dono @douglaspretto89 · público de todas as idades e tamanhos. Logo: espartano (preto/vermelho/prata).
- Aprovado/feito: topo "ALÉM DO TREINO" (atleta IA em camadas), faixa do lema, tour 360 com bandeiras reais (4 paradas, sem zoom), pôr do sol, evoluções (vazias até ter alunos autorizados), comunidade estilo cinema, assistente "Seu primeiro treino" (`api/primeiro-treino.js`, precisa `ANTHROPIC_API_KEY` na Vercel), medição por origem no WhatsApp, selo "Aberto agora", dados estruturados, `GUIA-GOOGLE.md`.

## O PROBLEMA ATUAL (palavras do senhor)
"O problema está na **falta de abertura** e na **falta de qualidade na primeira página**."

## SUA MISSÃO, JARVIS 12
Apresentar ao senhor as 5 animações abaixo (já com referências), pedir a escolha em múltipla escolha com "Outro", gerar **referência visual (imagem/vídeo) antes de codar**, e então refazer abertura + primeira dobra no nível premiado.

### 5 animações FODA para a primeira página
1. **Anilha em câmera lenta (abertura).** Tela preta; uma anilha vermelha cai em câmera lenta no piso escuro, explode giz dourado na luz do pôr do sol; o impacto "treme" a tela e "BODY GYM" carimba em cromo. *Precisa:* vídeo curto gerado por IA (Veo/Kling/Runway) ou filmado lá com celular em câmera lenta. *Risco:* médio (qualidade do vídeo).
2. **Espartano 3D em metal (abertura).** O escudo espartano do logo vira peça de metal cromado com vermelho, gira devagar com uma faixa de luz; ao rolar, a peça se aproxima e a câmera atravessa o capacete para dentro da academia. *Precisa:* logo em boa resolução + relevo 3D (extrusão/relevo em Three.js ou modelo gerado de imagem). *Risco:* médio-alto ("cara de maquete" já foi reprovada em outro cliente — mostrar render antes).
3. **Letras-janela com zoom (transição abertura → topo).** "BODY GYM" gigante preenchido pelo vídeo da academia; a rolagem dá zoom atravessando o "O" até virar a tela cheia do topo. *Ref:* https://www.github.com/codrops/ImageExpansionTypography e https://tympanus.net/codrops/2025/10/29/building-a-layered-zoom-scroll-effect-with-gsap-scrollsmoother-and-scrolltrigger/ · *Risco:* baixo.
4. **Pôr do sol que a rolagem controla (fundo do topo).** Timelapse REAL dos janelões (o senhor grava ~20 min no celular apoiado, fim de tarde): ao rolar, o dia vira pôr do sol atrás do título. É o diferencial verdadeiro da academia. *Precisa:* o timelapse. *Risco:* baixo (e 100% real).
5. **Giz que reage (detalhe vivo no topo).** Partículas de giz/magnésio em WebGL que explodem quando o atleta bate as cordas e seguem o dedo/mouse, iluminadas pelo sol. *Precisa:* só código. *Risco:* baixo-médio (desempenho no celular; testar em aparelho real).

**Recomendação do JARVIS 11:** abertura = **1 (anilha)** levando a **3 (letras-janela)**; topo com **4 (timelapse real)** + **5 (giz)**. A 2 só se o render convencer.

### Pendências gerais da Body Gym
Escolher painel de visitas (Plausible recomendado) · chave da API no deploy · vídeo de ~2 min andando na academia (tour 3D real, Polycam/Luma) · confirmar "aula experimental" · fotos de evolução com autorização · fotos originais dos eventos · migrar para o template Astro na entrega.

## Outros clientes
- Fernanda Melo: site v1 aprovado ("ficou bom"), senhor ainda vai pensar numa abertura mais cinema → `clientes/fernanda-melo/BRIEFING.md`.
- Lord Lumberjack: v6 pronto para vender → `clientes/lord-lumberjack/`.
