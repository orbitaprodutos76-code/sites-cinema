# Prompt para o ChatGPT: abertura + primeira parte do site da Body Gym

Copie tudo entre as linhas `=====`. Ajuste os itens do bloco **AJUSTES** antes de enviar (ou depois, conversando).
Anexe junto: `midia/logo.webp` e as fotos reais que quiser usar (`midia/real-*.webp`, `midia/insta-*-hd.webp`) e, se tiver, o vídeo do story.

=====

Você é diretor de arte e desenvolvedor front-end de sites premiados (nível Awwwards). Vamos criar juntos a **abertura animada** e a **primeira dobra (hero)** do site de uma academia. Trabalhe em etapas e **não escreva código antes de eu aprovar uma imagem de referência**.

## O negócio
- **Body Gym Academia**, Mineiros (GO), desde 2019. Lema: "Você além de um simples treino".
- Público: todas as idades e tamanhos, gente comum, não só atleta. Clima de turma e acolhimento, mas com cara de força.
- Diferencial real: janelões com vista para os morros e um pôr do sol bonito visto das esteiras.
- Logo (anexo): espartano cromado de braços cruzados, vermelho e preto, letras "BODY GYM".
- WhatsApp: (64) 9 9231-9285. Horário: seg a sex 5h às 23h, sáb 8h às 16h, dom 8h às 12h.

## AJUSTES (mude à vontade)
- **Estilo da abertura:** [A) anilha caindo em câmera lenta com explosão de giz e o nome carimbando · B) logo espartano em metal surgindo de uma faixa de luz · C) "BODY GYM" gigante com o vídeo da academia dentro das letras, e o zoom atravessa o "O" até o site · D) outra ideia sua]
- **Duração da abertura:** [3 s / 5 s / 7 s]
- **Mídia da abertura:** [vídeo do story anexo / fotos reais anexas / imagem gerada por IA]
- **Intensidade:** [sutil e elegante / forte, com tremor de tela e impacto]
- **Toca:** [toda vez / uma vez por visita] · botão "Pular": [sim/não]
- **Cores:** preto e vermelho (#D7192A); dourado (#F6B445) [só em detalhes pequenos / um pouco mais presente]
- **Fontes:** [Anton + Barlow / sugira outra dupla, no máximo 2 famílias]
- **Título do hero:** ["Além do treino" / "Você além de um simples treino" / sugira 3 opções]
- **Imagem do hero:** [foto real anexa / atleta gerado por IA / vídeo em loop]
- **Composição do hero:** [título à esquerda e imagem à direita / título centralizado e gigante / título atrás da pessoa, em camadas]
- **Botões:** principal "[Agendar aula experimental]" (WhatsApp) + secundário "[Ver planos]"
- **Extras no hero:** [selo "Aberto agora" com horário real · partículas de giz que seguem o mouse · número de seguidores · nenhum]
- **O que NÃO quero (da versão anterior):** [escreva aqui o que ficou ruim]

## Etapas
1. Leia tudo e me faça até 3 perguntas, só se faltar algo importante.
2. Me mostre **3 direções diferentes** para a abertura e o hero: para cada uma, um nome, 3 linhas de descrição e o roteiro quadro a quadro com o tempo de cada parte.
3. Para a direção que eu escolher, gere **imagens de referência**: 4 ou 5 quadros-chave da abertura + o hero final no computador (1440 px) e no celular (390 px).
4. Só depois que eu aprovar, escreva o código.

## Regras do código
- **Um único arquivo HTML** com CSS e JS dentro, abrindo direto no navegador. Bibliotecas só por CDN: GSAP 3.12.5 + ScrollTrigger (cdnjs) e, se precisar, Lenis 1.1.13 (jsdelivr). Sem frameworks.
- A abertura ocupa **a tela inteira** (100svh) e termina **entrando no hero** como um corte de cinema. Não pode virar uma tela de carregamento solta.
- **Celular primeiro**: perfeito em 390 px de largura, sem rolagem lateral; botões grandes; título legível.
- Anime só `transform` e `opacity`. Easing com personalidade (`expo.out`, `power4.inOut`), nunca `linear`.
- `prefers-reduced-motion`: sem abertura, hero estático.
- Desempenho: imagem do hero com `width`/`height` e pré-carregada; abertura leve (nada de vídeo de 20 MB); alvo LCP < 2,5 s.
- Acessibilidade: um único `h1`, `alt` nas imagens, foco visível, contraste AA, `lang="pt-BR"`.
- Imagens com caminho relativo `midia/nome.webp`. Use nomes fáceis de trocar e me diga a lista de arquivos.
- Comente o código em português e deixe no topo do JS um bloco `CONFIG` com os valores ajustáveis (duração, intensidade do tremor, quantidade de partículas, cores, textos).

## Entregue no fim
- O HTML completo.
- A lista de imagens e vídeos usados e o tamanho ideal de cada um.
- O que eu preciso trocar quando tiver as fotos e o vídeo reais.

=====
