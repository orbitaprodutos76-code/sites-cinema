# Passagem JARVIS 9 (nuvem) → JARVIS 10 — 25/11/2026

Leia antes de tudo: `CLAUDE.md` (regras da casa, tom JARVIS, "senhor", perguntas sempre com opção "Outro", tudo mora no repositório).
Branch de trabalho: `feat/importar-sites` (PR em rascunho: orbitaprodutos76-code/sites-cinema#1).

## Regra de ouro aprendida com a Lord
**Planejar e perguntar antes de executar.** Material e direção aprovados antes de codar. A abertura é aprovada sozinha, antes do resto do site. Nada de frase genérica para tapar buraco. Testar no computador E no celular antes de mostrar.

## Projeto ATUAL: Barbearia Fernanda Melo → `clientes/fernanda-melo/`
Tudo detalhado em `clientes/fernanda-melo/BRIEFING.md`. Resumo:
- Fundação FECHADA: direção **neon → atravessa o vidro → fumaça** (abertura 2+1); paleta **Deep Purple #6B21A8 × Gold #FBBF24 sobre branco #FFFFFF** (berinjela #3B0A57 só como sombra; nada de lavanda/pastel; texto pequeno nunca em Gold sobre branco); fonte **DM Serif Display + Space Grotesk**; 7 seções (Topo com espelho dourado, Salão, Cortes com risco redesenhado em ouro, Serviços em cápsulas, Momento Malévola, Equipe, Agendar 4 passos).
- Esboço aprovado como planta: `esboco.html` → https://claude.ai/artifact/BifDc1g3yVS2F9WDW7aw1B · Fontes: `fontes.html` → https://claude.ai/artifact/K3qP67eKYwHQKuPzVff76d
- **PRÓXIMO PASSO: construir a ABERTURA de verdade, sozinha, para aprovação** (noite preta → neon roxo corre em volta da vitrine → letreiro acende → câmera atravessa o vidro → branco com fumaça Deep Purple e veios Gold desenhando "Fernanda Melo"). Perguntar ao senhor se ele conseguiu foto da fachada à noite em boa resolução (hoje só há print pequeno em `img/fachada-noite.jpg`).
- Agendamento: sistema Base44 delas (https://barber-pro-1f2a60f6.base44.app/agendamentocliente). Integração só depois da venda. NÃO destacar "comandada por mulheres".

## Projeto anterior: Lord Lumberjack → `clientes/lord-lumberjack/` (pronto para vender)
- Site: `index-v6.html` → https://claude.ai/artifact/5n89DQHieagr6b2KLe1PPV (abertura na pedra aprovada, entrada com letreiro real, 7 capítulos, cápsulas com líquido verde, fonte Anton + Playfair + Inter).
- Pendências no BRIEFING da Lord: lista de estilos de corte/barba, confirmar WhatsApp (64) 99931-9087, vídeo da abertura para celular, link público (Vercel) antes de mostrar ao dono.

## Ambiente
- Nuvem, Playwright disponível; AppBarber bloqueia robôs (não contornar). Visualizador do claude.ai bloqueia iframes e navegação para fora (links abrem em aba nova).
- Commits: `git add` só da pasta do cliente em que estiver trabalhando; push com `git -c push.negotiate=true push`.
