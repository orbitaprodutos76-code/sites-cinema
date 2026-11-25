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
