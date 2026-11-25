---
name: prospectar
description: Encontra empresas que precisam de site, pontua, audita e prepara a abordagem. Use quando o senhor pedir "achar empresas", "prospectar", "leads de <nicho> em <cidade>", "quem não tem site" ou similar.
---

# Prospectar

## Entrada
Nicho e cidade. Se faltar, pergunte (é a única pergunta necessária).

## 1. Buscar
- Com `GOOGLE_PLACES_API_KEY` disponível:
  `node prospeccao/scripts/buscar-empresas.mjs "<nicho>" "<cidade UF>" 60`
- Sem a chave: tente uma vez; se falhar com 401/403, peça a credencial do host `places.googleapis.com` pelo formulário seguro (header `X-Goog-Api-Key`, sem prefixo). Nunca peça a chave no chat.
- Se o senhor preferir sem chave: use WebSearch (Google Maps, Instagram, guias locais) e monte o CSV manualmente no mesmo formato, avisando que é amostra menor.

## 2. Filtrar e auditar
- Pegue os 10 de maior `pontuacao`.
- Para quem tem site: `node prospeccao/scripts/auditar-site.mjs <url>` e, para os 5 melhores, screenshot mobile com Playwright.
- Anote os problemas na coluna `observacoes`.

## 3. Entregar ao senhor
Tabela curta: empresa, por que é boa oportunidade, argumento principal, contato.
Sugira os 3 melhores para receber **prévia** (skill `novo-site` em modo prévia).

## 4. Abordagem
Gere a mensagem personalizada de cada um a partir de `prospeccao/abordagem.md`. **Não envie nada**: o senhor envia.

## Cuidados
- Só dados públicos de empresas. Nada de raspar dados pessoais nem disparo em massa.
- Faça commit do CSV em `prospeccao/leads/`.
