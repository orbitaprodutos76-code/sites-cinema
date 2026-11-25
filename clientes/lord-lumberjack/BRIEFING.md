# Lord Lumberjack — Barbearia · Mineiros-GO

> Reconstruído em 25/11/2026 a partir das conversas JARVIS v7/v8. **O código do site ainda está só no PC**, em
> `OneDrive\Área de Trabalho\ediçao\negocios-locais\amostra-lord\` (com `BRIEFING-V9.md` dentro).
> Próximo passo: trazer essa pasta para cá (ver "Como trazer o código").

## Por que importa
Barbearia de nome forte na cidade. Entregar algo amador queima o senhor com o melhor cliente possível. Padrão: **caro, cinema**.

## O que já existe (versão do v8)
- Site rodando localmente ("Lord Lumberjack Barbearia · Mineiros-GO").
- Agendamento pelo **AppBarber**: 9 botões "Agendar" (topo, menu, barra do celular, equipe, serviços, Club). Ao tocar: corte seco para preto, aviso "Abrindo a agenda da Lord…", e a agenda abre na mesma aba depois de ~1 s. WhatsApp vai direto.
- Não testado: botão "voltar" do celular depois de abrir a agenda.

## O que o senhor reprovou
- Abertura com "espelho piscando" e animação de anel/espelho: **amadora**. Tudo de anel e espelho sai.

## Direção aprovada (briefing para o v9)
1. **Logo em vetor**: redesenhar o "L" ornamental, LORD e LUMBERJACK, **sem** "barbearia Mineiros-GO". Só existe a logo em imagem pequena (623×399, fundo cinza); o ideal é o arquivo original com quem fez o letreiro.
2. **Abertura de ~5 s em LED**: pontos de luz acendem aos poucos e **escorrem como líquido** pelas letras até formar "LORD LUMBERJACK". Estalos, gotas de luz, grão de filme, fumaça, reflexo no chão, faixas pretas de cinema, brilho horizontal quando a última letra acende. Som de zumbido elétrico opcional.
3. **Assinatura**: no fim, o letreiro voa e **encaixa no letreiro LORD real da parede** (foto), virando a barbearia de verdade.
4. Depois de aprovada a abertura: rolagem com capítulos (01 O Ambiente, 02 A Carta…), cardápio de serviços "de grife", espaços para vídeos.

## Abertura atual (v2, 25/11/2026): simples, verde forte e preto absoluto
- O senhor cansou da versão LED cheia de efeitos e pediu **algo mais simples, com verde bem forte e preto absoluto**.
- Pasta `abertura/`. Link privado: https://claude.ai/artifact/GYrvrYwMEkKRo7gCz8s2wh
- Roteiro (~3 s): uma linha verde corta a tela preta → a linha vira fresta e revela **LORD** em verde (#00ff5e) com brilho → LUMBERJACK entra em branco, fechando o espaçamento → a tela sobe e mostra o site. Botão Pular. Com "reduzir movimento", vai direto pro site.
- A versão LED anterior fica no histórico do git (commit "adiciona protótipo da abertura em LED"), caso o senhor queira algum pedaço dela.
- Ainda é provisório: fonte Cinzel no lugar da logo real, e um espaço reservado onde entra a foto.

## Decisões de 25/11/2026 (conversa na nuvem, depois de trazer o zip do PC)
- Código do PC trazido para esta pasta (index = v5; `abertura.html` = LED do v9; `abertura-pedra.html` = WebGL da pedra; `img/` com logo vetorizada e 8 fotos locais).
- **Abertura escolhida: a da PEDRA.** Ideia do senhor: *luz de LED verde escorrendo por rachaduras/frestas numa pedra preta, formando o nome LORD LUMBERJACK e o símbolo.*
- Prioridades do site nesta rodada: tirar anel/espelho; rolagem em capítulos; cardápio de grife; produtos e barbeiros.
- O que o senhor acha fraco hoje: faltam fotos e vídeos; seções vazias/longas; falta impacto; cara de modelo pronto. Ele vê grande potencial e pediu para pensar com calma antes de executar.
- Regra reforçada: **pensar e perguntar antes de executar**. Perguntas em múltipla escolha com várias respostas permitidas e opção "Outro".
- `rascunho-nuvem/abertura-verde.html`: tentativa simplificada feita na nuvem, **reprovada** (fraca). Não usar como base.

## Abertura da pedra v2 (25/11/2026, aguardando aprovação do senhor)
- Arquivo: `abertura-pedra.html` (shader do v9 + coreografia nova). Link privado: https://claude.ai/artifact/BeB98o8D6WxRdNjvrsLV7k
- Câmera (pedido do senhor): nasce rente à pedra, sobe perseguindo a ponta da luz verde e termina de frente com a logo inteira (enquadramento calculado também para celular em pé).
- Luz: a ponta é calculada do `pedra-mapa.png` (símbolo 0,2–1,2 s · LORD 0,8–2,5 s · LUMBERJACK 2,2–3,3 s). Corrigido o vazamento verde em retângulo e o tempo que estava parado.
- Final escolhido: **a rachadura se abre** e mostra o topo do site (foto da parede + textos reais da v5).
- Duração ~5,6 s · botão Pular · 1 vez por sessão (`?intro` força) · reduzir movimento = site direto · `?quadro=2.5` desenha um quadro fixo (prints e gravação do vídeo).
- **Celular: vai rodar como vídeo pré-gravado** (decisão do senhor). Gravar depois da aprovação, a partir de `?quadro=`.
- Material: o senhor NÃO consegue fotos dos barbeiros, dos produtos nem vídeos. **Proibido tapar buraco com frase genérica**; buscar informação real. Ele vai mandar prints de avaliações do Google.
- Estrutura do site em 7 capítulos aprovada (Topo · 01 Ambiente · 02 Carta · 03 Barbeiros · 04 Club · 05 Loja · 06–07 Reputação e Endereço).

## Abertura da pedra v3 (25/11/2026, aguardando aprovação)
Pedidos do senhor sobre a v2: câmera é o que vende ("posso fechar a venda só por isso"); a rachadura parecia PowerPoint; a luz parecia "renderizando" e não escorrendo. Duração desejada: **5 a 6 s, o mais rápido possível**.
- **Câmera:** 0–1,2 s rasante atrás da gota (perseguição) → 1,2–2,3 s decola rápido girando por cima da pedra até a frente → 2,3–3,75 s desce sem pausa e **mergulha no losango do "O"** → a luz toma a tela e o site surge dela (substitui a rachadura). Total ~3,9 s de cena + ~1 s de entrada do site.
- **Líquido:** ponta em língua (corre pelo meio da fenda primeiro), velocidade irregular por região, faixas de correnteza no sentido do fluxo, volume e reflexo na superfície.
- O relógio avança no máximo 0,05 s por quadro (aparelho lento não pula a cena).
- Mesmo link: https://claude.ai/artifact/BeB98o8D6WxRdNjvrsLV7k

## Abertura v4 + entrada do site (25/11/2026, em ajuste: o senhor avisou que vamos trabalhar bastante na entrada)
- O senhor achou **ruim** a câmera entrar na luz do losango. Pediu: descer mais rápido, a câmera **parar em cima** da logo, e o site entrar com uma animação forte **com qualquer toque na tela** depois da abertura.
- Abertura: perseguição rasante (0–1,2 s) → decola girando (1,2–2,3 s) → desce rápido e **pousa** em cima da logo com leve assentamento (2,3–3,15 s). Parada, o líquido continua correndo e aparece "Toque para entrar". O botão Pular some no pouso.
- Entrada (~2,6 s, disparada por toque, clique, tecla ou rolagem): câmera sobe até ficar de cima → a pedra se dissolve no vetor aceso no mesmo lugar (escala vetor→pedra: 0,002875) → cada parte (símbolo, LORD, LUMBERJACK) voa até o letreiro real da foto (caixas medidas pelo v9) enquanto a foto abre do letreiro até a barbearia inteira → letreiro fica aceso em verde (neon somado às letras pretas reais) → título, texto e Agendar entram.
- Tela deitada: texto à direita (o letreiro fica à esquerda na foto). Celular: texto embaixo.
- `?quadro=T&e=E` desenha qualquer momento da abertura (T) e da entrada (E de 0 a 1) para prints.
- Mesmo link: https://claude.ai/artifact/BeB98o8D6WxRdNjvrsLV7k

## ✅ APROVADO pelo senhor (25/11/2026): abertura v4 + entrada do site
"BOAA CLAUDE É ISSO". Esta é a referência de qualidade daqui pra frente. Não mexer sem pedido. Ajustes finos vêm por cima dela.

## Pedra nova: ardósia preta (25/11/2026)
- O senhor mandou foto de referência (pedra negra em placas com rachaduras, guardada em `referencias/pedra-negra.jpg`) e pediu **mais escura e com menos detalhe**.
- A foto não foi usada como textura (736 px, luz embutida, rachaduras próprias brigando com as fendas da logo). Virou **pedra em código inspirada nela**: poucas placas grandes com degrau e borda lascada, rachaduras raras, grão fino, superfície fosca e bem escura, quase sem cristais. Dentro das fendas o relevo é aliviado para o líquido ficar liso.

## Preto absoluto (25/11/2026)
- Pedido do senhor: "manda um preto absoluto". Fundo medido em RGB 0,0,0. A pedra quase não tem cor própria; só aparece de raspão na luz rasante e onde o verde vaza perto das fendas. Granulado de filme só onde há luz.

## Sem textura (25/11/2026)
- Pedido do senhor: "esqueça as texturas, põe só o preto". A pedra não aparece mais em nada: só existe como molde invisível das fendas, para o líquido ter forma e reflexo. O brilho em volta das letras virou halo de luz no ar (bloom), com os cantos em RGB 0,0,0.

## Site v6 — primeiro rascunho completo (25/11/2026, aguardando o senhor)
- Arquivo: `index-v6.html` = abertura aprovada + entrada + 7 capítulos. `abertura-pedra.html` fica intacta como referência aprovada. `index.html` ainda é a v5 (trocar só depois da aprovação).
- Link privado: https://claude.ai/artifact/5n89DQHieagr6b2KLe1PPV
- Depois da entrada a página libera a rolagem (Lenis) e os capítulos sobem como cortina preta sobre o topo.
- 01 Ambiente: seção fixa com as 8 fotos deslizando na horizontal (máscara + parallax); no celular, faixa que arrasta com o dedo. 3 fatos (agenda online, sinuca, cerveja).
- 02 Carta: combos em destaque no topo, demais categorias (I–V) em 2 colunas; fio que acende em verde; cada item abre a agenda.
- 03 Equipe: 4 nomes gigantes (sem foto e sem biografia inventada), "Agendar com ele".
- 04 Club: VIP e Premium com placar e barras avulso × Club.
- 05 Loja: "28" gigante + vitrine tipográfica por categoria.
- 06 Reputação: 5,0, barras 124/1, 3 avaliações reais.
- 07 Endereço: horário com o dia de hoje aceso, cartão "Abrir no mapa" (o visualizador do claude.ai bloqueia mapa embutido; no site publicado dá para voltar o iframe), telefone, Instagram.
- Agendar em qualquer botão: linha de LED cruza a tela + "Abrindo a agenda da Lord…" e abre o AppBarber.
- Todos os textos vêm da v5 (nada inventado). WhatsApp (64) 99931-9087 ainda não confirmado como WhatsApp.

## Correção (25/11/2026): tela preta com linha verde
- Era a transição do Agendar presa: o visualizador do claude.ai bloqueia sair da página. Agora, dentro de visualizador (claude.ai, Instagram, WhatsApp), a agenda abre em aba nova; fora dele, se a navegação não acontecer em 2 s, a tela preta se desfaz (e um toque nela também desfaz).
- Aparelho sem 3D (WebGL): mostra o site direto com a foto e o texto, em vez de ficar preto.

## Agendamento: não fazer o cliente repetir (25/11/2026, em aberto)
- Pergunta do senhor: como deixar claro a função do site e o cliente passar o mínimo de tempo no AppBarber.
- Princípio: nosso site ajuda a DECIDIR (lugar, carta, barbeiro, preço, Club); o AppBarber só CONFIRMA. Nunca montar o agendamento duas vezes.
- Caminhos: (1) link direto do AppBarber já com serviço/barbeiro, se ele aceitar; (2) se não aceitar, a transição mostra a escolha e o caminho no app ("Combos → Carlos → horário"); (3) botões dizendo "Agendar no app da Lord" + aviso "1. Escolha aqui · 2. Confirme no app em 30 s"; (4) plano B: WhatsApp com a escolha escrita.
- Teste daqui: o AppBarber (sites.appbarber.com.br) tem bloqueio contra navegador automático (Vercel Security Checkpoint). **Não contornar.** A documentação pública não diz se existe link por serviço/barbeiro. Próximo passo: o senhor manda prints/endereços do fluxo no celular.

## Material pendente
- [ ] OK do senhor para baixar as 9 imagens públicas da Lord (o v9 parou esperando isso).
- [ ] 10 tomadas de vídeo na visita (lista em `POSTAR/TOMADAS-LORD.txt` no PC). A mais importante: **nº 01, letreiro LORD da parede, de frente**. Só filmar com autorização do dono.
- [ ] Logo original em vetor, se o dono tiver.

## Como trazer o código
Opção A: compartilhar a pasta `ediçao` com o Claude (app desktop → Configurações → Claude Code → Remote Control) e pedir "traz a Lord pro repositório".
Opção B: no PC, copiar `amostra-lord` para dentro de `sites-cinema/clientes/lord-lumberjack/` e dar push.
