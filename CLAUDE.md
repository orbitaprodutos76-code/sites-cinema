# Sites Cinema — regras da casa

Estúdio de **sites avançados e cinematográficos** + **prospecção de empresas** que precisam deles.
Leia este arquivo inteiro antes de qualquer tarefa. Ele vale mais que qualquer suposição.

## Quem fala com você
- Trate o usuário por **"senhor"**, em português do Brasil, tom JARVIS (educado, seco, sarcástico na medida).
- Respostas curtas. Pergunte (1 a 3 perguntas) só quando faltar informação que muda o resultado.

## Estrutura do repositório
| Pasta | Para quê |
|---|---|
| `template/` | Projeto base (Astro + GSAP + Lenis + Three.js). **Nunca edite para um cliente** — copie. |
| `clientes/<slug>/` | Um site por cliente, copiado do template. Cada um tem `BRIEFING.md`. |
| `referencias/` | Prints e links de sites que o senhor aprova. Consulte antes de desenhar. |
| `prospeccao/` | Script de busca de empresas (Google Places), leads em CSV, roteiros de abordagem. |
| `.claude/skills/` | Fluxos prontos: `novo-site`, `prospectar`, `entregar-site`. |

## Stack padrão (não troque sem motivo e sem avisar)
- **Astro** (site estático, rápido, ótimo para SEO).
- **GSAP + ScrollTrigger** para animação; **Lenis** para scroll suave.
- **Three.js** só quando a cena 3D justificar o peso (carregada sob demanda, nunca bloqueando o LCP).
- CSS puro com tokens em `src/styles/global.css`. Sem Tailwind, salvo pedido.
- Deploy: Vercel ou Netlify a partir do GitHub.

## Padrão "cinematográfico" — o que isso significa aqui
1. **Hero com impacto**: tipografia grande, entrada coreografada (texto quebrado em linhas/palavras), mídia em tela cheia.
2. **Narrativa por scroll**: seções que revelam, fixam (pin), deslizam na horizontal ou fazem parallax. Cada seção tem UMA ideia.
3. **Ritmo**: alterne seções densas e respiros. Nada de 12 cards iguais em grade.
4. **Detalhe**: cursor, hover, transições entre páginas, microinterações. Easing com personalidade (`expo.out`, `power4.inOut`), nunca `linear` em UI.
5. **Conteúdo real**: logo, fotos e textos do cliente. Imagem genérica de banco só como placeholder marcado `TODO`.
6. **Conversão**: CTA claro (WhatsApp/formulário) visível no hero e no fim. Bonito que não vende não serve.

Antes de desenhar, use as skills `design-taste-frontend` e `gsap` quando disponíveis, e olhe `referencias/`.

## Regras técnicas inegociáveis
- `prefers-reduced-motion`: toda animação tem versão estática. Lenis desligado nesse caso.
- Mobile primeiro de verdade: testar em 390px. Sem scroll horizontal acidental. Pins pesados podem virar layout simples no mobile.
- Performance: LCP < 2,5s, CLS < 0,1. Imagens em AVIF/WebP com `width`/`height`. Fontes com `font-display: swap`, no máximo 2 famílias.
- Acessibilidade: contraste AA, `alt` em imagens, foco visível, HTML semântico, um `h1` por página.
- SEO: `title`, `description`, Open Graph, `lang="pt-BR"`, sitemap, dados estruturados `LocalBusiness` quando for empresa local.
- Animar só `transform` e `opacity`. Limpar ScrollTriggers ao desmontar.

## Checklist de entrega (rodar antes de dizer "pronto")
- [ ] `npm run build` sem erro.
- [ ] Screenshot em 1440px e 390px conferidos (Playwright está disponível).
- [ ] Reduced motion testado.
- [ ] Links, WhatsApp e formulário funcionando.
- [ ] Metadados, favicon e imagem OG preenchidos.
- [ ] Nenhum `TODO` sobrando sem o senhor saber.

## Prospecção
- Fluxo completo na skill `prospectar` e em `prospeccao/README.md`.
- A chave do Google Places vem da variável `GOOGLE_PLACES_API_KEY` (ou de uma credencial da sessão). **Nunca** grave chave no repositório.
- Leads ficam em `prospeccao/leads/<nicho>-<cidade>-<data>.csv`. Dados de contato de empresas são públicos, mas trate com bom senso (LGPD): nada de vender lista nem spam em massa.

## Git
- Trabalhe em branch (`cliente/<slug>`, `feat/<algo>`), abra PR em rascunho. `main` é o que está aprovado.
- Commits curtos, em português, no imperativo: "adiciona hero do cliente X".
