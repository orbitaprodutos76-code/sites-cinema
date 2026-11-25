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

## Paleta oficial (25/11/2026) — medida nas fotos e levada ao máximo
Pedido do senhor: cores bem nítidas, "o branco muito branco, o roxo muito roxo".
- Branco `#FFFFFF` (fundo; nada de bege) · superfície clara `#F3EFFB`
- Roxo `#5B1FD1` (mármore/moto) · Roxo neon `#8B2CFF` (vitrine, medido #4001A1) · Lavanda `#B79CF2` (luz no mármore)
- Azul letreiro `#2A0BFF` (medido #1F00DF) — só em neon, com moderação
- Dourado luz `#FFE48A` (aro aceso, medido #FFED91) · Dourado metal `#D4A72C` (veios) · Dourado sombra `#9A7417`
- Preto `#0A0A12` (bancadas, medido #0A0B12) · texto secundário `#55516A`
- Fotos no site com saturação +35% e contraste +8% (as fotos reais são mais vivas que os prints).

## Plano em etapas (cada uma aprovada pelo senhor antes da próxima)
0. **Material e acessos** (antes de qualquer design): fotos em alta (salão, moto, espelhos, equipe), logo, cidade/endereço, Instagram, horário oficial, lista de serviços revisada, quem controla o Base44.
1. **Direção visual** (moodboard + 2–3 conceitos de abertura em imagem/rascunho) → senhor escolhe.
2. **Abertura** → aprovar sozinha (como na Lord).
3. **Estrutura dos capítulos** + tipografia (mostruário de fontes já no padrão roxo/branco/dourado).
4. **Agendamento** integrado conforme o acesso.
5. **Site completo** → testes celular/computador → link público → proposta.
