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

## Protótipo da abertura (25/11/2026, feito na nuvem)
- Pasta `abertura/` (HTML único). Link privado: https://claude.ai/artifact/GYrvrYwMEkKRo7gCz8s2wh
- Já tem: painel de LED; luz que entra pelo topo de cada letra e escorre pelo traço; LEDs que falham e estalam com faísca; gotas de luz pingando; fumaça quente; granulado de filme; faixas de cinema; reflexo no chão; brilho horizontal quando acende a última letra; letreiro que sobe e encolhe até a posição do letreiro da parede; site aparece por baixo. Som opcional (zumbido elétrico e estalos, gerados no navegador). Botões Pular e Repetir. Com "reduzir movimento", aparece tudo aceso e parado.
- **Ainda é provisório:** as letras usam a fonte Cinzel, e não a logo real (falta o vetor). O fundo final é um placeholder até chegar a foto da parede (tomada nº 01).
- Duração: ~4,5 s até acender tudo, ~7,5 s até o site.

## Material pendente
- [ ] OK do senhor para baixar as 9 imagens públicas da Lord (o v9 parou esperando isso).
- [ ] 10 tomadas de vídeo na visita (lista em `POSTAR/TOMADAS-LORD.txt` no PC). A mais importante: **nº 01, letreiro LORD da parede, de frente**. Só filmar com autorização do dono.
- [ ] Logo original em vetor, se o dono tiver.

## Como trazer o código
Opção A: compartilhar a pasta `ediçao` com o Claude (app desktop → Configurações → Claude Code → Remote Control) e pedir "traz a Lord pro repositório".
Opção B: no PC, copiar `amostra-lord` para dentro de `sites-cinema/clientes/lord-lumberjack/` e dar push.
