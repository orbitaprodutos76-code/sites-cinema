# Barbearia Fernanda Melo — PLANEJAMENTO (nada executado ainda)

> Regra deste projeto (lição da Lord): **planejar e aprovar antes de codar.** Material e integração resolvidos ANTES do design. Abertura aprovada antes do resto.

## O que sabemos (25/11/2026)
- Sistema de agendamento atual: https://barber-pro-1f2a60f6.base44.app/agendamentocliente (app feito na plataforma Base44).
- Equipe: **3 barbeiras** — Kassia, Rayssa Camargo, Fernanda Melo. Barbearia comandada por mulheres (confirmar se é o posicionamento que elas querem).
- 16 serviços (do sistema): Hidratação masculina R$50 · Corte infantil R$60 · Corte/barba R$115 · Corte masculino R$60 · Corte/sobrancelha R$85 · Raspagem lateral R$30 · Corte/barba/sobrancelhas R$140 · Corte feminino adulto R$150 · Massagem relaxante R$110 (aparece 2x) · Massagem liberação miofascial express R$120 · Limpeza superficial de pele R$45 · Pigmentação de barba R$45 · Selagem masculina (progressiva) R$70 · Sobrancelhas R$25 · Barba R$55.
- Horários vistos no sistema: 09:00–11:00 e 13:30–18:30 (intervalos de 30 min).
- Fotos do salão (referencias/): paredes brancas, **painel de mármore roxo esfumaçado**, **espelhos redondos dourados com luz**, cadeiras pretas, painel preto texturizado, **moto esportiva roxa e preta dentro do salão**. Muito mais bonito que o sistema.
- Busca na internet: **não aparece** em Google/Instagram/guias. Cidade não confirmada.
- Paleta pedida pelo senhor: **branco dominante · roxo secundário · dourado e preto nos destaques.**

## Diagnóstico do sistema atual
Bom: 4 passos (Serviço → Barbeira → Data/Hora → Confirmar), **sem login**, só telefone + nome, horários reais. Fricção baixa.
Ruim: visual genérico escuro com laranja (nada a ver com o salão); mesmo ícone de tesoura em tudo; nomes inconsistentes ("Corte\barba", "HIDRATAÇÃO" em caixa alta, "miofascil"); serviço duplicado; preço "R$ 50.00" (formato americano); aspas soltas em "Barbeira "; card de profissional em branco no meio; nenhuma foto do espaço, endereço, Instagram ou mapa — é só uma ferramenta, não um site.

## Oportunidade de agendamento (melhor que na Lord)
O sistema é um app Base44, não um gigante como o AppBarber. Se quem controla o app nos der acesso, dá para:
1. a pessoa escolher serviço + barbeira no NOSSO site e cair no sistema já no passo da data (link com a escolha), ou
2. o próprio site fazer os 4 passos com o visual novo, gravando na mesma agenda.
Depende de: quem fez/controla esse app.

## Decisões do senhor (25/11/2026)
- **Agendamento/integração: só depois da venda.** Não sabemos quem controla o app Base44; resolver no pós-venda. Até lá o site leva ao sistema atual.
- **NÃO destacar "comandada por mulheres".** Foco: um site bonito e bom. A equipe aparece normalmente.
- Fotos: o senhor vai mandar. **Esperar as fotos antes da direção visual.**

## O que as fotos novas mostram (prints do Google Maps — ela TEM perfil lá, a busca é que não achou)
- **Fachada à noite:** prédio branco, vitrine contornada por **neon roxo/rosa**, letreiro "BARBEARIA FERNANDA MELO" em **neon azul-roxo**, logo de um cavalheiro de cartola e bigode (roxo), poste de barbeiro.
- **Painel de mármore roxo com veios DOURADOS** (estilo kintsugi) atrás das cadeiras.
- **Espelhos redondos com aro de luz dourada.** Bancadas pretas, parede 3D preta geométrica, piso branco.
- **Moto Kawasaki Z preta e roxa** (escrito "MALÉVOLA" no para-lama) + capacete roxo com dentes de tubarão.
- **Corte da casa:** freestyle com **desenhos/riscos** na lateral (linhas raspadas), mullet.
- Ideia-chave: tudo é **LINHA**: veio de ouro do mármore = risco do corte = contorno de neon da vitrine.
- Paleta (senhor): roxo, branco, dourado, preto. Pedidos: fumaça roxa se espalhando, preto em contraste, branco-leite no fundo, cores fortes, muitos efeitos.

## Conceitos de abertura (em discussão)
1. **Veios de ouro:** fundo branco-leite; fumaça roxa desabrocha como tinta no leite; veios de ouro racham por dentro dela e desenham o nome; a fumaça assenta e vira o painel de mármore real.
2. **Vitrine neon:** noite preta; o neon contorna a vitrine e acende o letreiro; a câmera atravessa o vidro e entra no salão branco (preto → branco).
3. **Malévola:** escuro; farol da moto corta a fumaça roxa; o aro roxo da roda gira e vira o aro de luz do espelho dourado, que revela o salão.
- Recomendação: **2 + 1** (de fora pra dentro: neon na noite → atravessa o vidro → salão branco com fumaça roxa e veios de ouro). A moto vira um momento especial no meio do site.

## Esboço (25/11/2026)
- O senhor escolheu a abertura **2 + 1** (neon → atravessa o vidro → fumaça roxa e veios de ouro no branco-leite) e pediu um **esboço do site** antes de construir.
- `esboco.html` (link: https://claude.ai/artifact/BifDc1g3yVS2F9WDW7aw1B): abertura em 4 quadros-chave + 7 seções (Topo com espelho dourado, Salão, Cortes com o risco redesenhado em ouro, Serviços em cápsulas com fumaça roxa e preços reais do sistema, Momento Malévola, Equipe, Agendar em 4 passos). Fontes provisórias: Unbounded + Cormorant itálico + Inter.

## Paleta oficial (25/11/2026, 3ª revisão) — Deep Purple × Gold
O senhor mandou a referência "Deep Purple × Gold". Interpretado como as duas cores principais (confirmar se era só inspiração).
- Branco `#FFFFFF` (fundo dominante)
- **Deep Purple `#6B21A8`** (roxo principal) · Berinjela `#3B0A57` (sombra/fumaça densa) · `#4C1477` (meio-tom da fumaça)
- **Gold `#FBBF24`** (destaques: aro dos espelhos, nome, veios, bordas) · sombra `#B7791F` · brilho `#F59E0B`
- Neon `#8B2CFF` só em brilho · Preto `#0A0A12`
- Histórico: 1ª paleta medida nas fotos (roxo #5B1FD1, lavanda, dourado #FFE48A) → 2ª berinjela + amarelo #FFD91F (sem lavanda) → 3ª esta. **Nada de lavanda/tons pastel.**

## Fontes (25/11/2026) — ESCOLHIDA: 06 · Contraste editorial
- **DM Serif Display** (títulos e destaques em itálico, caixa normal) + **Space Grotesk** (textos, rótulos, botões). Já aplicada no esboço.
- Pedido: bastante roxo e amarelo, mas **branco como principal**. Regra de uso: Gold como marca-texto, linhas, aros e texto em cima do roxo; texto pequeno nunca em Gold sobre branco.
- Mostruário: `fontes.html` (https://claude.ai/artifact/K3qP67eKYwHQKuPzVff76d) com 10 combinações.

## Plano em etapas (cada uma aprovada pelo senhor antes da próxima)
0. **Material e acessos** (antes de qualquer design): fotos em alta (salão, moto, espelhos, equipe), logo, cidade/endereço, Instagram, horário oficial, lista de serviços revisada, quem controla o Base44.
1. **Direção visual** (moodboard + 2–3 conceitos de abertura em imagem/rascunho) → senhor escolhe.
2. **Abertura** → aprovar sozinha (como na Lord).
3. **Estrutura dos capítulos** + tipografia (mostruário de fontes já no padrão roxo/branco/dourado).
4. **Agendamento** integrado conforme o acesso.
5. **Site completo** → testes celular/computador → link público → proposta.

## Abertura — decisão de 25/11/2026 (JARVIS 10)
- Fachada: **não há foto boa à noite → recriar em código** (SVG/canvas fiel ao print `img/fachada-noite.jpg`).
- Senhor pediu uma abertura que arranque "UAU". Opções apresentadas: 1 vidro racha em ouro · 2 navalha risca a noite · 3 através do espelho · 4 Malévola acorda · 5 quem vê acende.
- **ESCOLHIDA: 1 · O vidro racha em ouro.** Noite → neon contorna a vitrine → letreiro acende → câmera avança → **o vidro racha em veios dourados (kintsugi = mármore do salão)** → estilhaça em cacos de luz → fumaça Deep Purple invade o branco → veios escrevem "Fernanda Melo".
- Ideia 2 (risco da navalha) guardada para o capítulo Cortes.
- Roteiro aprovado (~8s): noite → neon contorna a vitrine → letreiro pisca e acende → câmera avança → impacto, racha dourada → cacos de luz → fumaça Deep Purple no branco → veios de ouro e "Fernanda Melo" desenhado em ouro e preenchido em roxo → Topo com Agendar.
- Som: **desligado, com botão** (som gerado em código: zumbido do neon, cliques, whoosh, vidro). Logo: **cavalheiro redesenhado em vetor** (interpretação do print). Repetição: inteira na 1ª visita, curta (~4s) nas seguintes; botão "Ver de novo" roda inteira.

## Abertura v1 construída (25/11/2026) — AGUARDANDO APROVAÇÃO DO SENHOR
- Arquivo: `abertura.html` → https://claude.ai/artifact/RELreNcmcZVak8LNWoF1LM
- Técnica: fachada em SVG (sem foto), céu e nuvens em canvas, racha e cacos em canvas (os cacos são a própria imagem da vitrine congelada), fumaça em canvas de meia resolução, veios e título em SVG. Só GSAP.
- Testado: 1440px e 390px, Pular, Ver de novo, movimento reduzido (vai direto ao quadro final). Sem erros no console e sem rolagem lateral.
- TODO: logo é interpretação (pedir original quando vender) · textos do Topo provisórios · ainda HTML solto (vira Astro quando o site completo for aprovado).

## Virada de direção (25/11/2026) — abertura v1 REPROVADA
- Senhor: "precisamos de algo impressionante; não dá para recriar a fachada toda" (comparou com o símbolo da Lord, feito com capricho). Lição: **não recriar fachada/prédio em código; poucos elementos, detalhe máximo.**
- Nova abertura: **3 a 5 segundos**, com uma **névoa roxa 3D (nuvem volumétrica em WebGL)**, que também será a **animação principal do site** (viva no fundo, reage à rolagem e ao dedo/mouse).
- Elementos escolhidos: **1 · O corte** + **3 · Relâmpago de ouro**. Proposta de roteiro: relâmpagos dourados piscam dentro da névoa (a tempestade carrega) → o último raio cai reto como navalha → a névoa se abre em duas com as bordas queimando em ouro → branco com "Fernanda Melo".
- Pó de ouro (opção 4) não foi escolhido; fica guardado.
- Método: **laboratório da névoa primeiro** (aprovar a nuvem antes da abertura).
- `laboratorio-nevoa.html` → https://claude.ai/artifact/KuNmLxkDYiFiCsJVcv2qbx · raymarching em WebGL 2, ruído 3D gerado no carregamento, luz dourada que segue o cursor, botão Relâmpago, ajustes (fundo, cor, densidade, quantidade, formato, contorno, tamanho, velocidade, luz, qualidade) e botão "Copiar ajustes" para o senhor mandar os valores.
- `abertura.html` (v1 da fachada) fica no repositório só como histórico.
- PENDENTE: o senhor testar o laboratório no PC e no celular e mandar os ajustes de que gostou.

## Nuvem roxa realista (25/11/2026) — laboratório 2
- O senhor mandou referência: **cúmulo real à noite, com lua fina e estrelas** (foto P&B, provavelmente Pinterest: só referência, NÃO usar no site) + a paleta Deep Purple × Gold. Frase dele: "quando eu digo nuvem roxa é uma nuvem roxa, porém quero animações nela".
- Laboratório 1 (nuvem 100% em código) ficou parecendo borrão: reprovado.
- Decisão: **vídeo real colorizado** + **céu de noite com lua e estrelas**.
- Vídeo: Mixkit #51102 "White clouds moving across a clear blue sky" (Mixkit Stock Video Free License: uso comercial liberado, sem crédito obrigatório). Recortado para tirar as montanhas, 1280×648, em `midia/nuvem.webm` (1,9 MB) e `midia/nuvem.mp4` (2,6 MB).
- `nuvem-roxa.html` → https://claude.ai/artifact/PqDWJRCqXFVNhzQpTMZtLf · shader WebGL: o céu azul vira noite (estrelas piscando e lua fina desenhadas em código), a nuvem é pintada berinjela → Deep Purple → roxo neon com topos e bordas em ouro, laço sem emenda (dois vídeos em fusão), leve "respiração" e paralaxe, luz dourada que segue o dedo, relâmpago que acende a nuvem por dentro. Ajustes: ouro, brilho, contraste, velocidade, luz.
- Testado em 1440px e 390px (navegador sem placa de vídeo: 26 fps no PC e 57 no celular simulado). Print: `referencias/nuvem-roxa-v1-print.png`.
- PENDENTE: o senhor aprovar a nuvem → depois disso, abertura de 3 a 5 s (relâmpagos → raio-navalha corta a nuvem → branco com o nome).

## Roteiro da abertura APROVADO (25/11/2026) — cerca de 4,5 s
Conceito: tempestade revela, pausa, raio-navalha, a nuvem se parte, branco.
| Tempo | O que acontece |
|---|---|
| 0–0,6s | Preto, silêncio, uma estrela pisca, faixas de cinema |
| 0,6–1,6s | Relâmpago distante revela a silhueta roxa e some; câmera começa a avançar |
| 1,6–2,4s | 2º relâmpago, mais perto, com trovão; topos dourados aparecem |
| 2,4–2,8s | Pausa: tudo escurece |
| 2,8–3,0s | Raio-navalha: linha de ouro reta na diagonal |
| 3,0–4,0s | Nuvem se parte ao longo do fio, bordas queimando em ouro, luz branca vaza e engole; faixas se abrem |
| 4,0–4,5s | Branco; "Fernanda Melo" nasce, o fio vira o sublinhado dourado; Agendar |
- Faixas de cinema: **sim**. Som: **desligado, com botão** (trovão, navalha e rasgo gerados em código).
- Ordem combinada: **primeiro só o corte** (do segundo 2,4 ao 4,5), depois o começo.

## Corte v1 (25/11/2026) — AGUARDANDO APROVAÇÃO
- `corte.html` → https://claude.ai/artifact/Erx2T9rdygmqXp13x5ueZk (usa `midia/nuvem.*`). Cerca de 3,6 s: relâmpago de contexto → pausa → navalha → rasgo com bordas em ouro e luz vazando → branco → o fio gira e vira o sublinhado do nome. Botões: Som, **Câmera lenta** (0,3×) e Ver de novo.
- Quadros conferidos: `referencias/corte-v1-quadros-pc.png` e `corte-v1-quadros-celular.png`. Sem erros.
- Observações para o senhor julgar: o rasgo ainda parece mais uma "fenda de luz" do que nuvem se rasgando; aparecem raios finos de luz no céu perto da fenda (efeito do rasgo irregular); os topos ficam dourados quando o relâmpago acende.

## Fim do dia (25/11/2026)
- Corte v1: o senhor disse **"ainda não é isso que eu quero, acho que você não entendeu ainda"**. A visão dele para a abertura ainda NÃO foi captada.
- **Amanhã, antes de qualquer código:** pedir 1 a 3 VÍDEOS de referência (reels, sites, cenas de filme) com a sensação da abertura que ele imagina, ou ele descreve em áudio quadro a quadro; devolver em 5 linhas o que foi entendido; só construir depois do "é isso".
- O que já serve: nuvem real colorizada (`midia/nuvem.*`, shader em `nuvem-roxa.html`), paleta e fontes.

## Referências novas do senhor (26/11/2026) — análise
Links: vaporgenerator.framer.website · daddyyankee.com · strop-barber.framer.website · pin "Hero animation website" (Butter, fundo amarelo). Paleta Yellow/Onyx/Magenta = **só o jeito do degradê** (fluido, saturado, cores derretendo); as cores continuam Deep Purple × Gold.
Prints em `referencias/ref-*.png`.
- **Daddy Yankee ("LA POSTAL")**: fundo de cor chapada, tipografia condensada GIGANTE e uma **nuvem 3D fofa, esculpida como objeto** (algodão/inflável) na frente das letras, com rastro de movimento embaixo. Entrada com tela de carregamento (%) e botão ENTER.
- **Vapor**: nuvem macia sobre cor chapada que forma e desmancha, com a palavra aparecendo dentro dela.
- **Strop (barbearia)**: nome gigante quebrado ("STR / OP") com a foto no meio e **textura de mármore dentro das letras**; fotos encaixadas no meio do texto; tabela de preços grande, estilo placar; editorial preto e branco.
- **Butter (pin)**: hero de cor chapada forte e tipografia enorme.
- Leitura do JARVIS: "nuvem roxa 3D" provavelmente = **objeto de nuvem fofa roxa** (estilo DY), não céu realista. AGUARDANDO o senhor confirmar.

## Nuvem = OBJETO 3D compacto (26/11/2026)
- Senhor: **nuvem A** (estilo Daddy Yankee). "Algo bem estético, que não sei pôr em palavras. 3D bem compacto. **Esqueça tudo que parece névoa.** Tem que se encaixar no site, não pode ser genérico."
- Névoa, céu e vídeo de nuvem real (`nuvem-roxa.html`, `corte.html`, `laboratorio-nevoa.html`) ficam só como histórico.
- `mostruario-nuvem.html` → https://claude.ai/artifact/WZQjfk3Qp97ZRsV3TeEUjm · a mesma nuvem 3D compacta (feita em código, gira e responde ao mouse/dedo) em 4 acabamentos do salão: **A mármore roxo com veios de ouro** (fundo branco) · **B vinil inflável brilhante** (fundo Deep Purple, nome em ouro, estilo DY) · **C veludo fosco + aro de luz dourada** (o espelho do salão) · **D vidro roxo com contorno neon** (a vitrine). Print: `referencias/mostruario-nuvem-v1-print.png`.
- PENDENTE: o senhor escolher a letra (ou misturar) antes de qualquer abertura.

## As 10 perguntas da nuvem (26/11/2026) — respostas do senhor
1. "Simples" = **forma** (amontoado de bolinhas), **falta de detalhe**, **falta de vida**.
2. Silhueta: **cúmulo compacto** (rolos reais, mas como objeto sólido).
3. Tamanho: **médio, na frente do nome gigante** (estilo Daddy Yankee).
4. Material de partida: mármore — mas atenção: **o MÁRMORE BRANCO (com fumaça roxa e veios de ouro, igual à parede do salão) é o FUNDO DO SITE**.
5. **A nuvem é ROXA e sem ouro.** O ouro fica no mármore do fundo e no nome.
6. Material da nuvem: **fofa e macia** (fosco-acetinado, rolos bem desenhados).
7. Vida: **respira e pulsa** + **reage ao toque/mouse** (inclina e se deforma).
8. Abertura: **depois**. Primeiro a nuvem no site, como **animação principal**.
9. Lugar: **1ª página (topo da home)**.
10. Sensação: **luxo + ousadia**.
- Foto da parede: `img/salao-amplo.jpg` e `img/espelhos-moto.jpg` (mármore branco, nuvens roxas, veios dourados finos).

## Topo v1 (26/11/2026) — AGUARDANDO OPINIÃO
- Senhor aprovou o resumo ("blz 👍"): mármore branco do salão de fundo, nome gigante em ouro, nuvem roxa fofa na frente, respira e reage ao toque, luxo + ousadia.
- `topo.html` → https://claude.ai/artifact/A8WXtYzKBQQYHHmUQ5MW6K · mármore gerado em código (fumaça roxa + veios de ouro), "FERNANDA MELO" em DM Serif Display com degradê de ouro, nuvem 3D em código (corpo largo + cúpulas, roxo fosco-acetinado, sombra no mármore). Respira; com o mouse ela inclina e afunda onde o cursor passa; no toque ela amassa e volta com balanço.
- Print: `referencias/topo-v1-print.png`. Testado em 1440px e 390px, sem erros.
- Pontos fracos conhecidos: o mármore ainda parece "mapa de relevo" em alguns trechos e tem poucos veios de ouro; a forma da nuvem pode ganhar mais personalidade.

## Nuvem isolada (26/11/2026)
- Senhor: fundo **branco com textura sutil** (sem roxo, sem ouro) e **trabalhar a nuvem isoladamente**.
- `nuvem.html` → https://claude.ai/artifact/9t2Cvg5F6p3j4nBfe21cqP · só a nuvem, grande, sobre branco puro com textura de pedra quase invisível (SVG de ruído em CSS). Mesma nuvem do topo v1 (respira, inclina, afunda no mouse, amassa no toque). Print: `referencias/nuvem-isolada-v1-print.png`.
- PENDENTE: o senhor dizer o que muda na nuvem (forma, cor, material, movimento).
- **v2 (26/11/2026):** o senhor mandou de novo a foto do cúmulo à noite: "uma nuvem assim, porém com bem menos detalhes, ocupando 25% da página". A nuvem virou **volume macio** (raymarching de densidade com sombra interna), silhueta larga com três cabeças, roxo escuro com topo iluminado, ocupando ~1/4 da tela. Mesmo link (versão 2). Print: `referencias/nuvem-isolada-v2-print.png`.
- Ponto fraco: por dentro os rolos ficam "manchados" e pouco definidos. Plano B se o código não chegar lá: recortar um cúmulo real (foto/vídeo com licença) e pintar de roxo, como no `nuvem-roxa.html`.

## A VISÃO DO SENHOR, finalmente em vídeo (26/11/2026)
- Senhor: "estamos só gastando créditos". Mudança de método: **imagem/vídeo de referência primeiro, código só para movimento**.
- Ele mandou 2 pins ("o melhor que pude imaginar para o projeto"), quadros em `referencias/ref-pins-tinta-e-locked.jpg`:
  1. **Tinta Deep Purple caindo na água sobre fundo branco**: a gota desce e explode numa nuvem de tinta densa, com rolos (feito com IA, marca Veo). ⇒ ESTA é a "nuvem roxa".
  2. **"LOCKED / UNLOCKED"**: texto que se desfaz em fumaça densa e se refaz a partir dela. ⇒ o nome nasce/some na nuvem.
- Tintas com licença livre no Mixkit (quadros em `referencias/ref-mixkit-tintas.jpg`): #3843 (tinta rosa densa em fundo preto, rolos iguais aos da referência), #149 (amarela/verde densa), #1204/#150 (preta em fundo branco, mais rala).
- PENDENTE: escolher o caminho (vídeo real pintado de roxo / vídeo exclusivo por IA / simulação em código).
- Senhor escolheu **C · simulação em código** e esclareceu: **a tinta AVANÇA PARA A TELA, não cai**.
- `tinta.html` → https://claude.ai/artifact/61Ef7quAU5Vgxr4yHtz97C · simulação de fluido em WebGL 2 (estilo stable fluids: advecção, pressão, vorticidade). A tinta Deep Purple nasce pequena no centro, explode em ondas e cresce com a "câmera" se aproximando (zoom), sobre branco. Rolos com sombra (relevo pela densidade), tons do roxo claro ao berinjela. O dedo/mouse mexe na tinta; depois ela continua viva com redemoinhos lentos. Botão "Ver de novo". Quadros: `referencias/tinta-v1-quadros.png`.
- Fica para depois: o nome "FERNANDA MELO" nascendo da tinta (estilo vídeo LOCKED).
- **v2 (26/11/2026):** senhor pediu "**algo mais sólido, que avança devagar, menos interativo**". Agora: fonte contínua no centro empurrando por igual para fora durante ~10 s (4 s no celular), pouca vorticidade (rolos grossos, sem marmorizado fino), tinta opaca com relevo macio, zoom só de aproximação (1 → 1,35). Mouse só empurra de leve, sem pingar tinta; sem a frase "mexa o dedo". Mesmo link (versão 2). Quadros: `referencias/tinta-v2-quadros.png`.
- Ponto fraco: no começo a forma sai com 4 lóbulos (simetria das fontes); no celular a tinta passa das bordas.

## Tinta + nuvem = FUMAÇA (26/11/2026)
- Senhor: "não quero tinta literal; é a animação principal do site; tinta + nuvem puxado para fumaça". 5 confirmações: **bem densa e escultural · fundo branco · uma massa no centro · câmera lenta · fumaça NA FRENTE do nome** (o nome grande parado, a fumaça rola na frente escondendo e revelando partes).
- Método: vídeo real + código (simulação não chega no nível). Mostruário `fumacas.html` → https://claude.ai/artifact/M51yECgRVejsU3bA5AtHxf · 6 vídeos do Mixkit (licença livre), cortados em 8 s, pintados de Deep Purple por shader, máscara de "massa no centro", 0,5× de velocidade, na frente de "FERNANDA MELO" em ouro: A #99928 · B #99922 · C #99925 · D #3843 · E #100016 · F #100014. Arquivos em `midia/fumaca/`. Print: `referencias/fumacas-v1-print.png`.
- PENDENTE: o senhor escolher a letra.
- Fumaça: o senhor corrigiu — **ela NÃO entra pela borda; NASCE no centro e AVANÇA devagar para a tela; bem menos poluída** (uma massa só, sem respingos). Nenhum vídeo de banco faz isso ⇒ gerar por IA. Canva recusou (plano sem geração de vídeo). Roteiro pronto para o senhor gerar no Veo/Gemini/Kling: `ROTEIRO-VIDEO-IA.md`.
